/**
 * pick-track.js: which approved track a week's reels use (Maxim, 2026-11-16).
 *
 * Only tracks listed in music/APPROVED.json may be used, so a track he has not heard is never posted. A track is never
 * used two weeks in a row, and the least recently used one goes first. No usable track = null: the reel ships with
 * its no-music copy and the PR says so.
 *
 *   node pick-track.js <week-monday-iso>     prints the chosen track as JSON (or "null"); with --record it also
 *                                            appends the choice to music/HISTORY.json
 */
const fs = require("fs");
const path = require("path");

/** @param {{id:string,file:string}[]} approved @param {{week:string,trackId:string}[]} history @param {string} week */
function pickTrack(approved, history, week) {
  const past = history.filter((h) => h.week < week).sort((a, b) => (a.week < b.week ? -1 : 1));
  const lastWeekTrack = past.length ? past[past.length - 1].trackId : null;
  const lastUsed = new Map(past.map((h) => [h.trackId, h.week]));
  const usable = approved.filter((t) => t.id !== lastWeekTrack);
  usable.sort((a, b) => {
    const wa = lastUsed.get(a.id) || "", wb = lastUsed.get(b.id) || "";
    return wa < wb ? -1 : wa > wb ? 1 : a.id < b.id ? -1 : 1;
  });
  return usable[0] || null;
}

module.exports = { pickTrack };

if (require.main === module) {
  const dir = path.join(__dirname, "music");
  const read = (f) => JSON.parse(fs.readFileSync(path.join(dir, f), "utf8"));
  const week = process.argv[2];
  if (!/^\d{4}-\d{2}-\d{2}$/.test(week || "")) {
    console.error("usage: node pick-track.js <week-monday-iso> [--record]");
    process.exit(1);
  }
  const history = read("HISTORY.json");
  const track = pickTrack(read("APPROVED.json"), history, week);
  if (track && process.argv.includes("--record") && !history.some((h) => h.week === week)) {
    fs.writeFileSync(path.join(dir, "HISTORY.json"), JSON.stringify([...history, { week, trackId: track.id }], null, 2) + "\n");
  }
  console.log(JSON.stringify(track));
}
