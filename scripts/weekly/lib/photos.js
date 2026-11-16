/**
 * photos.js: a product's packshot for a slide. No photo, no slide (RULES-README section 8).
 *
 * The public route is served by the PriceBack backend from the R2 bucket `priceback-product-images`
 * (key `costco/<sku>.jpg`); it needs no key, so a cloud session can use it. Verified 2026-11-16.
 */
const fs = require("fs");
const path = require("path");

const PHOTO_ROUTE = "https://priceback-production.up.railway.app/api/product-images/costco/";
const PREFLIGHT_SKU = "2034361";

const isImage = (buf) =>
  buf.length > 1000 &&
  ((buf[0] === 0xff && buf[1] === 0xd8) || (buf[0] === 0x89 && buf[1] === 0x50 && buf[2] === 0x4e && buf[3] === 0x47));

async function fromRoute(sku, fetchImpl) {
  const r = await fetchImpl(PHOTO_ROUTE + encodeURIComponent(sku), { signal: AbortSignal.timeout(20_000) });
  if (!r.ok) return { status: r.status, buf: null };
  if (!/^image\//.test(r.headers.get("content-type") || "")) return { status: r.status, buf: null };
  const buf = Buffer.from(await r.arrayBuffer());
  return { status: r.status, buf: isImage(buf) ? buf : null };
}

/** Can a cloud session reach the photos at all? Run before building anything. */
async function preflight(fetchImpl = fetch) {
  try {
    const { status, buf } = await fromRoute(PREFLIGHT_SKU, fetchImpl);
    return buf ? { ok: true, detail: "route reachable" } : { ok: false, detail: `photo route answered HTTP ${status} without an image` };
  } catch (e) {
    return { ok: false, detail: `photo route unreachable: ${e.message}` };
  }
}

/**
 * @param {string} sku
 * @param {{cacheDir: string, fetchImpl?: Function, fallbacks?: {name: string, get: (sku: string) => Promise<Buffer|null>}[]}} o
 * @returns {Promise<{ok: boolean, source: string|null, path: string|null}>}
 */
async function fetchPhoto(sku, { cacheDir, fetchImpl = fetch, fallbacks = [] }) {
  const save = (buf, source) => {
    fs.mkdirSync(cacheDir, { recursive: true });
    const p = path.join(cacheDir, `${sku}.jpg`);
    fs.writeFileSync(p, buf);
    return { ok: true, source, path: p };
  };
  try {
    const { buf } = await fromRoute(sku, fetchImpl);
    if (buf) return save(buf, "r2");
  } catch {
    /* try the fallbacks */
  }
  for (const f of fallbacks) {
    try {
      const buf = await f.get(sku);
      if (buf && isImage(buf)) return save(buf, f.name);
    } catch {
      /* next */
    }
  }
  return { ok: false, source: null, path: null };
}

module.exports = { fetchPhoto, preflight, PHOTO_ROUTE };
