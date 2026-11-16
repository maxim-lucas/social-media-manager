#!/usr/bin/env node
/**
 * build-week.js: snapshot in, the renderer's week files out.
 *
 *   node scripts/weekly/build-week.js <monday-iso> --snapshot=<snapshot.json>
 *
 * Writes scenes/weeks/<monday>-<aud>-<carousel>.json for every carousel that can be made, and
 * weekly/<monday>/needs.json (what is missing and who must supply it) and report.json. Reads the caches the routine's
 * Claude session maintains: tools/categories.json (sku -> {cat}), tools/tags.json (sku -> {en, fr} tag lines), and the
 * photos in scenes/.cache. It never invents any of them.
 */
const fs = require("fs");
const path = require("path");
const { planWeek } = require("./lib/week");
const { torontoInstant } = require("./lib/time");

const PACK = path.join(__dirname, "..", "..", "sm-content", "08-costco-price-drops");
const WEEKS = path.join(PACK, "scenes", "weeks");
const CACHE = path.join(PACK, "scenes", ".cache");

const readJson = (p, d) => (fs.existsSync(p) ? JSON.parse(fs.readFileSync(p, "utf8")) : d);
const monday = process.argv[2];
const snap = (process.argv.find((a) => a.startsWith("--snapshot=")) || "").slice("--snapshot=".length);
if (!/^\d{4}-\d{2}-\d{2}$/.test(monday || "") || !snap) {
  console.error("usage: build-week.js <monday-iso> --snapshot=<file>");
  process.exit(1);
}

/** ISO week number, so the Saturday region rotates the same way for everyone. */
function weekIndex(iso) {
  const d = new Date(`${iso}T12:00:00Z`);
  const start = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.floor((d - start) / (7 * 86400000));
}

const snapshot = readJson(snap);
const posted = new Set();
for (const f of fs.readdirSync(WEEKS)) {
  if (f.startsWith(monday)) continue; // re-running the same week must not exclude its own items
  for (const sku of Object.keys(readJson(path.join(WEEKS, f), { items: {} }).items || {})) posted.add(sku);
}
const photos = new Set(fs.existsSync(CACHE) ? fs.readdirSync(CACHE).filter((f) => f.endsWith(".jpg")).map((f) => f.slice(0, -4)) : []);

const plan = planWeek({
  rows: snapshot.rows, monday, today: snapshot.today,
  categories: readJson(path.join(PACK, "tools", "categories.json"), {}),
  tags: readJson(path.join(PACK, "tools", "tags.json"), {}),
  posted, photos, weekIndex: weekIndex(monday),
  newSince: torontoInstant(monday, "00:00"),
});

for (const f of plan.files) fs.writeFileSync(path.join(WEEKS, `${f.name}.json`), JSON.stringify(f.data, null, 2) + "\n");
const out = path.join(PACK, "weekly", monday);
fs.mkdirSync(out, { recursive: true });
fs.writeFileSync(path.join(out, "needs.json"), JSON.stringify(plan.needs, null, 2) + "\n");
fs.writeFileSync(
  path.join(out, "report.json"),
  JSON.stringify({ monday, built: plan.files.map((f) => ({ name: f.name, items: f.data.carousels[0].items.length })), skipped: plan.skipped }, null, 2) + "\n"
);
console.log(`built ${plan.files.length} week files; skipped ${plan.skipped.length}; needs:`, JSON.stringify(plan.needs));
