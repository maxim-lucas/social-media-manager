#!/usr/bin/env node
/**
 * harvest-photo.js: a product's own photo, found by name on Costco's sites, saved to the photo cache and, when the
 * admin token is set, to the PriceBack product photo catalogue (priceback-product-images, costco/<sku>.jpg).
 *
 *   node scripts/weekly/harvest-photo.js <sku> "<product name>" [--upload]
 *
 * Looks the name up on costco.ca, then costcobusinesscentre.ca (the Same-Day listing is the third place, by hand), takes the
 * result whose image file name carries the item number (lib/harvestPhoto.pickBySku), converts it to the catalogue's 600x600 JPEG
 * and writes scenes/.cache/<sku>.jpg. With --upload and ADMIN_TOKEN in the environment it also PUTs it to the catalogue
 * (PRICEBACK_API_BASE overrides the production URL), so every later build, desk and reel finds it. The token is never printed.
 *
 * Exit 0 found (and saved), 5 not found on any site, 6 a site blocked this machine (cloud sandboxes block Costco hosts: then
 * the routine falls back to a substitute, ROUTINE.md step 8).
 */
const fs = require("fs");
const path = require("path");
const sharp = require("sharp");
const { pickBySku, atCatalogueSize } = require("./lib/harvestPhoto");

const [sku, name] = process.argv.slice(2);
if (!/^\d{3,10}$/.test(sku || "") || !name) {
  console.error('usage: harvest-photo.js <sku> "<product name>" [--upload]');
  process.exit(1);
}
const CACHE = path.join(__dirname, "..", "..", "sm-content", "08-costco-price-drops", "scenes", ".cache");
const SITES = ["https://www.costco.ca/s?keyword=", "https://www.costcobusinesscentre.ca/s?keyword="];
const API = (process.env.PRICEBACK_API_BASE || "https://priceback-production.up.railway.app").replace(/\/+$/, "");

(async () => {
  const { chromium } = require("playwright");
  const browser = await chromium.launch({ headless: true });
  const page = await (await browser.newContext({ locale: "en-CA", viewport: { width: 1400, height: 900 } })).newPage();
  let blocked = 0;
  let found = null;
  // Try the full name, then its first four words: Costco's own title often differs from the harvest's.
  const queries = [name, name.split(/\s+/).slice(0, 4).join(" ")].filter((q, i, a) => q && a.indexOf(q) === i);
  outer: for (const q of queries) {
    for (const site of SITES) {
      try {
        await page.goto(site + encodeURIComponent(q), { waitUntil: "load", timeout: 60_000 });
        await page.waitForTimeout(6000);
        for (let y = 600; y < 4000; y += 700) { await page.evaluate((v) => window.scrollTo(0, v), y); await page.waitForTimeout(400); }
        const imgs = await page.evaluate(() => [...document.querySelectorAll("img")].map((i) => ({ alt: i.alt, src: i.currentSrc || i.src })));
        found = pickBySku(imgs, sku);
        if (found) { console.log(`found on ${new URL(site).host}: ${found.alt}`); break outer; }
      } catch (e) {
        blocked++;
        console.error(`${new URL(site).host}: ${e.message.slice(0, 100)}`);
      }
    }
  }
  await browser.close();
  if (!found) {
    console.error(`no photo for ${sku} (${blocked ? "a site was unreachable or blocked" : "no result carries that item number"})`);
    process.exit(blocked >= queries.length * SITES.length ? 6 : 5);
  }
  const res = await fetch(atCatalogueSize(found.src), { signal: AbortSignal.timeout(30_000) });
  if (!res.ok) { console.error(`image download HTTP ${res.status}`); process.exit(6); }
  const jpg = await sharp(Buffer.from(await res.arrayBuffer())).flatten({ background: "#ffffff" }).resize(600, 600, { fit: "contain", background: "#ffffff" }).jpeg({ quality: 90 }).toBuffer();
  fs.mkdirSync(CACHE, { recursive: true });
  fs.writeFileSync(path.join(CACHE, `${sku}.jpg`), jpg);
  console.log(`saved ${sku}.jpg (${jpg.length} bytes) to the photo cache`);
  if (process.argv.includes("--upload")) {
    if (!process.env.ADMIN_TOKEN) { console.error("--upload: ADMIN_TOKEN is not set, the catalogue was NOT updated"); process.exit(0); }
    const up = await fetch(`${API}/api/admin/product-images/costco/${sku}`, { method: "PUT", headers: { "content-type": "image/jpeg", "x-admin-token": process.env.ADMIN_TOKEN }, body: jpg, signal: AbortSignal.timeout(30_000) });
    console.log(up.ok ? `catalogue updated: costco/${sku}.jpg` : `catalogue upload failed: HTTP ${up.status}`);
    if (!up.ok) process.exit(7);
  }
})().catch((e) => { console.error(e.message); process.exit(1); });
