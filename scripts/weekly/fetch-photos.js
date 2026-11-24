#!/usr/bin/env node
/**
 * fetch-photos.js: the packshots for every item the week still lacks a photo for.
 *
 *   node scripts/weekly/fetch-photos.js <monday-iso>      # preflight first, then every SKU in needs.json "photo"
 *   node scripts/weekly/fetch-photos.js <monday-iso> --all  # also every carousel item missing from the cache (before rendering reels)
 *   node scripts/weekly/fetch-photos.js --preflight       # only test that the photo route is reachable
 *
 * Source: the public PriceBack product-photo route (R2 bucket priceback-product-images). It stops, printing why, when
 * the route cannot be reached: a pack is never built without photos. SKUs it cannot find are listed for the routine's
 * agent to look for on Same-Day / costco.ca by name; no photo, no slide.
 */
const fs = require("fs");
const path = require("path");
const { fetchPhoto, preflight, substituteFor } = require("./lib/photos");

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
  // --all: every item of the week's carousels, not only the ones needs.json lists. A fresh sandbox (the reels-pending and
  // fill modes, 2026-11-24) has an empty photo cache, and a reel's hook grid or cover rendered without photos is blank.
  if (process.argv.includes("--all")) {
    const weeks = path.join(PACK, "scenes", "weeks");
    for (const f of fs.readdirSync(weeks).filter((n) => n.startsWith(String(monday)))) {
      for (const c of JSON.parse(fs.readFileSync(path.join(weeks, f), "utf8")).carousels) for (const sku of c.items) if (!skus.includes(sku) && !fs.existsSync(path.join(CACHE, `${sku}.jpg`))) skus.push(sku);
    }
  }
  const table = fs.existsSync(path.join(PACK, "tools", "photo-substitutes.json")) ? JSON.parse(fs.readFileSync(path.join(PACK, "tools", "photo-substitutes.json"), "utf8")) : {};
  const missing = [];
  for (const sku of skus) {
    const r = await fetchPhoto(sku, { cacheDir: CACHE });
    if (r.ok) continue;
    const use = substituteFor(sku, table);
    const src = use && path.join(CACHE, `${use}.jpg`);
    if (use && !fs.existsSync(src)) await fetchPhoto(use, { cacheDir: CACHE });
    if (use && fs.existsSync(src)) { fs.copyFileSync(src, path.join(CACHE, `${sku}.jpg`)); console.log(`photo ${sku}: using ${use} (${table[sku].kind})`); continue; }
    missing.push(sku);
  }
  console.log(`photos: ${skus.length - missing.length} fetched, ${missing.length} not found`);
  if (missing.length) console.log(`NOT FOUND (apply ROUTINE.md step 8: substitute photo rules, else leave out): ${missing.join(", ")}`);
})().catch((e) => { console.error(e.message); process.exit(1); });
