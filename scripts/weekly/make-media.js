#!/usr/bin/env node
/**
 * make-media.js: rendered slides in, the publishable JPEGs out (one file per slide, never two formats of one slide).
 *
 *   node scripts/weekly/make-media.js <monday-iso>
 *
 * For every carousel slot with a rendered week file, converts posts/<week file>/<lang>/*.png (slide order = file name
 * order: 00-cover, 01-<sku> ..., NN-follow) to weekly/<monday>/media/<slotId>/NN.jpg and records the paths in
 * weekly/<monday>/content.json `available`. The PNG masters never reach the posting folder. A carousel containing the
 * same image twice is refused.
 */
const fs = require("fs");
const path = require("path");
const sharp = require("sharp");
const { buildSchedule, DAY_TEMPLATE } = require("./lib/slots");
const { sourceFor, duplicates } = require("./lib/media");

const monday = process.argv[2];
if (!/^\d{4}-\d{2}-\d{2}$/.test(monday || "")) {
  console.error("usage: make-media.js <monday-iso>");
  process.exit(1);
}
const PACK = path.join(__dirname, "..", "..", "sm-content", "08-costco-price-drops");
const dir = path.join(PACK, "weekly", monday);
const contentPath = path.join(dir, "content.json");
const content = fs.existsSync(contentPath) ? JSON.parse(fs.readFileSync(contentPath, "utf8")) : { available: {}, captions: {} };
const weekFiles = fs.readdirSync(path.join(PACK, "scenes", "weeks")).filter((f) => f.startsWith(monday)).map((f) => f.replace(/\.json$/, ""));

(async () => {
  let made = 0;
  for (const slot of buildSchedule({ monday, template: process.argv.includes("--day") ? DAY_TEMPLATE : undefined })) {
    const source = sourceFor(slot, monday, weekFiles);
    if (!source) continue;
    const from = path.join(PACK, "posts", source, slot.lang);
    if (!fs.existsSync(from)) continue; // not rendered yet
    const pngs = fs.readdirSync(from).filter((f) => f.endsWith(".png")).sort();
    const outDir = path.join(dir, "media", slot.id);
    fs.rmSync(outDir, { recursive: true, force: true });
    fs.mkdirSync(outDir, { recursive: true });
    const buffers = [];
    const assets = [];
    for (const [i, f] of pngs.entries()) {
      const jpg = await sharp(path.join(from, f)).flatten({ background: "#ffffff" }).jpeg({ quality: 92 }).toBuffer();
      const name = `${String(i + 1).padStart(2, "0")}.jpg`;
      fs.writeFileSync(path.join(outDir, name), jpg);
      buffers.push(jpg);
      assets.push(`media/${slot.id}/${name}`);
    }
    const dup = duplicates(buffers);
    if (dup.length) throw new Error(`${slot.id}: the same image appears twice (slides ${dup.map((d) => d.map((n) => n + 1).join(" and ")).join(", ")})`);
    content.available[slot.id] = { assets };
    made++;
    console.log(`${slot.id}: ${assets.length} slides from ${source}`);
  }
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(contentPath, JSON.stringify(content, null, 2) + "\n");
  console.log(`${made} carousel(s) ready for captions`);
})().catch((e) => { console.error(e.message); process.exit(1); });
