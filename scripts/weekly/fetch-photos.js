#!/usr/bin/env node
/**
 * fetch-photos.js: the packshots for every item the week still lacks a photo for.
 *
 *   node scripts/weekly/fetch-photos.js <monday-iso>      # preflight first, then every SKU in needs.json "photo"
 *   node scripts/weekly/fetch-photos.js --preflight       # only test that the photo route is reachable
 *
 * Source: the public PriceBack product-photo route (R2 bucket priceback-product-images). It stops, printing why, when
 * the route cannot be reached: a pack is never built without photos. SKUs it cannot find are listed for the routine's
 * agent to look for on Same-Day / costco.ca by name; no photo, no slide.
 */
const fs = require("fs");
const path = require("path");
const { fetchPhoto, preflight } = require("./lib/photos");

const PACK = path.join(__dirname, "..", "..", "sm-content", "08-costco-price-drops");
const CACHE = path.join(PACK, "scenes", ".cache");

(async () => {
  const pf = await preflight();
  if (!pf.ok) {
    console.error(`PHOTO ROUTE UNREACHABLE: ${pf.detail}`);
    process.exit(4);
  }
  if (process.argv.includes("--preflight")) return console.log(pf.detail);
  const monday = process.argv[2];
  const needsPath = path.join(PACK, "weekly", String(monday), "needs.json");
  if (!fs.existsSync(needsPath)) throw new Error(`no needs.json for ${monday}: run build-week.js first`);
  const skus = JSON.parse(fs.readFileSync(needsPath, "utf8")).photo;
  const missing = [];
  for (const sku of skus) {
    const r = await fetchPhoto(sku, { cacheDir: CACHE });
    if (!r.ok) missing.push(sku);
  }
  console.log(`photos: ${skus.length - missing.length} fetched, ${missing.length} not found`);
  if (missing.length) console.log(`NOT FOUND (look up by name on Same-Day or costco.ca, else leave out): ${missing.join(", ")}`);
})().catch((e) => { console.error(e.message); process.exit(1); });
