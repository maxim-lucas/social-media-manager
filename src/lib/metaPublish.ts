/**
 * metaPublish.ts — publishes a message + image to a Facebook Page or an
 * Instagram professional account via the Meta Graph API (v20.0).
 *
 * Facebook is a single call: POST /{page-id}/feed with message + link/picture.
 * Instagram is Meta's two-step container flow: create a media container, poll
 * it until Meta finishes fetching the image (status_code FINISHED), then
 * POST /media_publish with the container id. A container that reports ERROR
 * (bad image URL, disallowed format, …) is surfaced as a MetaPublishError
 * rather than retried — it will not become valid by polling longer.
 */

const GRAPH_API_VERSION = "v20.0";
const GRAPH_BASE = `https://graph.facebook.com/${GRAPH_API_VERSION}`;

const UPSTREAM_TIMEOUT_MS = 30_000;
// Overridable so tests/dev can poll on a tight loop instead of waiting real seconds.
const IG_CONTAINER_POLL_INTERVAL_MS = Number(process.env.META_IG_POLL_INTERVAL_MS) || 1_500;
const IG_CONTAINER_POLL_MAX_ATTEMPTS = Number(process.env.META_IG_POLL_MAX_ATTEMPTS) || 10;

export class MetaPublishError extends Error {
  status: number; // upstream HTTP status, when there was one
  graphCode?: number; // Meta's error.code, when the upstream returned one
  graphSubcode?: number;

  constructor(message: string, opts: { status?: number; graphCode?: number; graphSubcode?: number } = {}) {
    super(message);
    this.name = "MetaPublishError";
    this.status = opts.status ?? 502;
    this.graphCode = opts.graphCode;
    this.graphSubcode = opts.graphSubcode;
  }
}

type GraphErrorBody = { error?: { message?: string; code?: number; error_subcode?: number } };

async function graphFetch<T = Record<string, unknown>>(
  path: string,
  opts: { method?: "GET" | "POST"; params?: Record<string, string | undefined>; body?: Record<string, unknown> } = {},
): Promise<T> {
  const { method = "GET", params, body } = opts;
  const url = new URL(`${GRAPH_BASE}${path}`);
  for (const [k, v] of Object.entries(params || {})) {
    if (v !== undefined && v !== null) url.searchParams.set(k, v);
  }

  let res: Response;
  try {
    res = await fetch(url, {
      method,
      headers: body ? { "Content-Type": "application/json" } : undefined,
      body: body ? JSON.stringify(body) : undefined,
      signal: AbortSignal.timeout(UPSTREAM_TIMEOUT_MS),
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    throw new MetaPublishError(`Meta Graph API request failed: ${msg}`, { status: 502 });
  }

  let json: (GraphErrorBody & Record<string, unknown>) | null = null;
  try {
    json = await res.json();
  } catch {
    // Non-JSON body on a failure — fall through with json=null.
  }

  if (!res.ok) {
    const graphError = json?.error;
    throw new MetaPublishError(graphError?.message || `Meta Graph API HTTP ${res.status}`, {
      status: res.status,
      graphCode: graphError?.code,
      graphSubcode: graphError?.error_subcode,
    });
  }
  return (json || {}) as T;
}

/**
 * POST /{page-id}/feed — publishes a text+image post to a Facebook Page.
 * Returns the Meta post id (e.g. "{page-id}_{post-id}").
 */
export async function publishToFacebook(opts: {
  pageId: string;
  pageAccessToken: string;
  message: string;
  imageUrl: string;
}): Promise<string> {
  const { pageId, pageAccessToken, message, imageUrl } = opts;
  if (!pageId || !pageAccessToken) {
    throw new MetaPublishError("Facebook publishing is not configured (missing page id or access token).", { status: 503 });
  }
  const result = await graphFetch<{ id?: string }>(`/${pageId}/feed`, {
    method: "POST",
    body: { message, link: imageUrl, access_token: pageAccessToken },
  });
  if (!result.id) {
    throw new MetaPublishError("Facebook accepted the request but returned no post id.");
  }
  return result.id;
}

async function waitForContainerReady(containerId: string, accessToken: string): Promise<void> {
  for (let attempt = 0; attempt < IG_CONTAINER_POLL_MAX_ATTEMPTS; attempt++) {
    const status = await graphFetch<{ status_code?: string }>(`/${containerId}`, {
      params: { fields: "status_code", access_token: accessToken },
    });
    if (status.status_code === "FINISHED") return;
    if (status.status_code === "ERROR") {
      throw new MetaPublishError("Instagram media container failed while processing the image.");
    }
    // IN_PROGRESS / EXPIRED-not-yet / unknown — keep polling until the attempt budget runs out.
    if (attempt < IG_CONTAINER_POLL_MAX_ATTEMPTS - 1) {
      await new Promise((resolve) => setTimeout(resolve, IG_CONTAINER_POLL_INTERVAL_MS));
    }
  }
  throw new MetaPublishError("Instagram media container did not finish processing in time.", { status: 504 });
}

/**
 * Two-step Instagram publish: create an image container under
 * /{ig-user-id}/media, wait for Meta to finish fetching the image, then
 * publish it via /{ig-user-id}/media_publish. Returns the Meta media id.
 */
export async function publishToInstagram(opts: {
  igUserId: string;
  accessToken: string;
  message: string;
  imageUrl: string;
}): Promise<string> {
  const { igUserId, accessToken, message, imageUrl } = opts;
  if (!igUserId || !accessToken) {
    throw new MetaPublishError("Instagram publishing is not configured (missing IG business account id or access token).", { status: 503 });
  }

  const container = await graphFetch<{ id?: string }>(`/${igUserId}/media`, {
    method: "POST",
    body: { image_url: imageUrl, caption: message, access_token: accessToken },
  });
  if (!container.id) {
    throw new MetaPublishError("Instagram accepted the container request but returned no container id.");
  }

  await waitForContainerReady(container.id, accessToken);

  const published = await graphFetch<{ id?: string }>(`/${igUserId}/media_publish`, {
    method: "POST",
    body: { creation_id: container.id, access_token: accessToken },
  });
  if (!published.id) {
    throw new MetaPublishError("Instagram accepted the publish request but returned no media id.");
  }
  return published.id;
}

export { GRAPH_API_VERSION };
