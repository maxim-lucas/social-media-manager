/**
 * graph.js: Instagram and Facebook publishing through the Meta Graph API (Maxim, 2026-11-16: "use Graph API token").
 *
 * Every function takes an injected `fetchImpl` (and `sleep`) so the flow is tested without a network. Nothing here
 * decides WHEN to post; publish-week.js does, and it is a dry run unless told otherwise.
 */
// Meta retires a Graph version about two years after release; keep it configurable and confirm it with the token.
const VERSION = process.env.META_GRAPH_VERSION || "v24.0";
const BASE = `https://graph.facebook.com/${VERSION}`;

const IG_CAPTION_MAX = 2200;
// Instagram's own cap is 20 slides (cover + 18 items + end card). Confirm the API accepts as many with the real token.
const IG_CAROUSEL_MAX = Number(process.env.IG_CAROUSEL_MAX) || 20;
const IG_CAROUSEL_MIN = 2;

class GraphError extends Error {}

/** Refuse before touching Meta, so a bad slot costs nothing and leaves nothing half-created. */
function validateSlot({ kind, assets, instagramCaption }) {
  if (instagramCaption.length > IG_CAPTION_MAX) throw new GraphError(`caption is ${instagramCaption.length} characters (max ${IG_CAPTION_MAX})`);
  if (kind === "carousel" && (assets.length < IG_CAROUSEL_MIN || assets.length > IG_CAROUSEL_MAX)) {
    throw new GraphError(`a carousel needs ${IG_CAROUSEL_MIN} to ${IG_CAROUSEL_MAX} slides, got ${assets.length}`);
  }
  if (kind === "reel" && assets.length !== 1) throw new GraphError(`a reel is exactly one video, got ${assets.length} assets`);
}

async function call(fetchImpl, method, path, params) {
  const url = new URL(`${BASE}/${path}`);
  const init = { method };
  if (method === "GET") for (const [k, v] of Object.entries(params)) url.searchParams.set(k, v);
  else {
    init.headers = { "content-type": "application/x-www-form-urlencoded" };
    init.body = new URLSearchParams(Object.entries(params).map(([k, v]) => [k, typeof v === "string" ? v : JSON.stringify(v)])).toString();
  }
  const res = await fetchImpl(url.toString(), init);
  const json = await res.json().catch(() => ({}));
  if (!res.ok || json.error) {
    const e = json.error || {};
    throw new GraphError(`Graph ${method} ${path.split("?")[0]} failed: ${e.message || `HTTP ${res.status}`}${e.code ? ` (code ${e.code})` : ""}`);
  }
  return json;
}

const realSleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function waitFinished(fetchImpl, id, token, { tries = 30, delayMs = 5000, sleep = realSleep } = {}) {
  for (let i = 0; i < tries; i++) {
    const s = await call(fetchImpl, "GET", id, { fields: "status_code,status", access_token: token });
    if (s.status_code === "FINISHED") return;
    if (s.status_code === "ERROR" || s.status_code === "EXPIRED") throw new GraphError(`container ${id} ${s.status_code}: ${s.status || "no detail"}`);
    await sleep(delayMs);
  }
  throw new GraphError(`container ${id} was not ready after ${tries} checks`);
}

/** Instagram carousel: one child container per slide, then the parent, then publish. Returns the media id. */
async function postIgCarousel({ fetchImpl, igId, token, imageUrls, caption, sleep }) {
  const children = [];
  for (const image_url of imageUrls) {
    const c = await call(fetchImpl, "POST", `${igId}/media`, { image_url, is_carousel_item: "true", access_token: token });
    children.push(c.id);
  }
  const parent = await call(fetchImpl, "POST", `${igId}/media`, { media_type: "CAROUSEL", children: children.join(","), caption, access_token: token });
  await waitFinished(fetchImpl, parent.id, token, { sleep });
  return (await call(fetchImpl, "POST", `${igId}/media_publish`, { creation_id: parent.id, access_token: token })).id;
}

/** Instagram reel from a public video URL (the music is already inside the file). Returns the media id. */
async function postIgReel({ fetchImpl, igId, token, videoUrl, caption, sleep }) {
  const c = await call(fetchImpl, "POST", `${igId}/media`, { media_type: "REELS", video_url: videoUrl, caption, share_to_feed: "true", access_token: token });
  await waitFinished(fetchImpl, c.id, token, { sleep, tries: 60 });
  return (await call(fetchImpl, "POST", `${igId}/media_publish`, { creation_id: c.id, access_token: token })).id;
}

/** Facebook Page post with several photos: upload unpublished, then one feed post that attaches them all. */
async function postFbPhotos({ fetchImpl, pageId, token, imageUrls, message }) {
  const ids = [];
  for (const url of imageUrls) ids.push((await call(fetchImpl, "POST", `${pageId}/photos`, { url, published: "false", access_token: token })).id);
  const post = await call(fetchImpl, "POST", `${pageId}/feed`, {
    message, attached_media: ids.map((media_fbid) => ({ media_fbid })), access_token: token,
  });
  return post.id;
}

/** Facebook Page video (a reel's file shared to the Page). */
async function postFbVideo({ fetchImpl, pageId, token, videoUrl, message }) {
  return (await call(fetchImpl, "POST", `${pageId}/videos`, { file_url: videoUrl, description: message, access_token: token })).id;
}

module.exports = { validateSlot, postIgCarousel, postIgReel, postFbPhotos, postFbVideo, GraphError, IG_CAPTION_MAX, IG_CAROUSEL_MAX, BASE };
