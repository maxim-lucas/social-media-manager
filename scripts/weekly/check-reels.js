#!/usr/bin/env node
/**
 * check-reels.js: every rendered reel of a week has its music and its cover, or the build stops.
 *
 *   node scripts/weekly/check-reels.js <monday-iso>      exit 0 all fit; exit 3 something is wrong (printed)
 *
 * Needs ffmpeg (the renderer's own; set FFMPEG to its path if it is not on PATH). Run by the routine after the reels are
 * rendered and BEFORE make-media.js, so a silent or cover-less reel can never be wired into the schedule.
 */
const fs = require("fs");
const path = require("path");
const { spawnSync } = require("child_process");
const sharp = require("sharp");
const { problems } = require("./lib/reelCheck");

const monday = process.argv[2];
if (!/^\d{4}-\d{2}-\d{2}$/.test(monday || "")) {
  console.error("usage: check-reels.js <monday-iso>");
  process.exit(1);
}
const dir = path.join(__dirname, "..", "..", "sm-content", "08-costco-price-drops", "weekly", monday, "reels");
const mp4s = fs.existsSync(dir) ? fs.readdirSync(dir).filter((f) => f.endsWith(".mp4")).sort() : [];
if (!mp4s.length) {
  console.log("no reels rendered: nothing to check");
  process.exit(0);
}

(async () => {
  let bad = 0;
  for (const f of mp4s) {
    const r = spawnSync(process.env.FFMPEG || "ffmpeg", ["-hide_banner", "-nostats", "-i", path.join(dir, f), "-af", "volumedetect", "-f", "null", "-"], { encoding: "utf8" });
    if (r.error) { console.error(`cannot run ffmpeg: ${r.error.message}`); process.exit(1); }
    const coverPath = path.join(dir, f.replace(/\.mp4$/, "-cover.jpg"));
    const coverSize = fs.existsSync(coverPath) ? await sharp(coverPath).metadata().then((m) => ({ width: m.width, height: m.height })).catch(() => null) : null;
    const p = problems({ report: r.stderr, coverSize });
    console.log(`${p.length ? "FAIL" : "ok  "} ${f}${p.length ? ": " + p.join("; ") : ""}`);
    if (p.length) bad++;
  }
  process.exit(bad ? 3 : 0);
})();
