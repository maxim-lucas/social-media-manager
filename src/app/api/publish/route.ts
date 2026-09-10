import { NextRequest, NextResponse } from "next/server";
import { MetaPublishError, publishToFacebook, publishToInstagram } from "@/lib/metaPublish";

type PublishBody = {
  message?: unknown;
  imageUrl?: unknown;
  platform?: unknown;
};

/**
 * POST /api/publish — publish a message + image to a Facebook Page or an
 * Instagram professional account via the Meta Graph API.
 *
 * Body: { message: string, imageUrl: string, platform: "facebook" | "instagram" }
 * Response: { ok: true, platform, postId } | { ok: false, error, message, tokenExpired? }
 *
 * tokenExpired is set when Meta's Graph API rejected the request with
 * OAuthException (code 190) — the page/IG access token is invalid or expired
 * and must be regenerated; retrying the same request will not help.
 */
export async function POST(req: NextRequest) {
  let body: PublishBody;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "invalid_json", message: "Request body must be JSON." }, { status: 400 });
  }

  const { message, imageUrl, platform } = body;
  if (typeof message !== "string" || !message.trim()) {
    return NextResponse.json({ ok: false, error: "validation_failed", message: "message is required." }, { status: 400 });
  }
  if (typeof imageUrl !== "string" || !imageUrl.trim()) {
    return NextResponse.json({ ok: false, error: "validation_failed", message: "imageUrl is required." }, { status: 400 });
  }
  if (platform !== "facebook" && platform !== "instagram") {
    return NextResponse.json({ ok: false, error: "validation_failed", message: "platform must be 'facebook' or 'instagram'." }, { status: 400 });
  }

  try {
    let postId: string;
    if (platform === "facebook") {
      const pageId = process.env.META_PAGE_ID || "";
      const pageAccessToken = process.env.META_PAGE_ACCESS_TOKEN || "";
      if (!pageId || !pageAccessToken) {
        return NextResponse.json(
          { ok: false, error: "service_unconfigured", message: "Facebook publishing is not configured on this deployment." },
          { status: 503 },
        );
      }
      postId = await publishToFacebook({ pageId, pageAccessToken, message, imageUrl });
    } else {
      const igUserId = process.env.META_INSTAGRAM_BUSINESS_ACCOUNT_ID || "";
      const accessToken = process.env.META_INSTAGRAM_ACCESS_TOKEN || process.env.META_PAGE_ACCESS_TOKEN || "";
      if (!igUserId || !accessToken) {
        return NextResponse.json(
          { ok: false, error: "service_unconfigured", message: "Instagram publishing is not configured on this deployment." },
          { status: 503 },
        );
      }
      postId = await publishToInstagram({ igUserId, accessToken, message, imageUrl });
    }
    return NextResponse.json({ ok: true, platform, postId });
  } catch (e) {
    if (e instanceof MetaPublishError) {
      console.warn(`[publish] ${platform} publish failed:`, e.message);
      const tokenExpired = e.graphCode === 190;
      return NextResponse.json(
        {
          ok: false,
          error: "upstream_failed",
          message: `Meta ${platform} publish failed: ${e.message}`,
          tokenExpired,
        },
        { status: e.status === 503 ? 503 : 502 },
      );
    }
    const msg = e instanceof Error ? e.message : String(e);
    console.warn(`[publish] ${platform} publish threw:`, msg);
    return NextResponse.json({ ok: false, error: "internal_error", message: "Publish failed." }, { status: 500 });
  }
}
