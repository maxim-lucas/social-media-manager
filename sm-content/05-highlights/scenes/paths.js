// Highlights pack — where every asset lands.
//
// This pack renders two things and nothing else: STORY FRAMES that live inside a
// Highlight, and the COVERS on the tray. There are no feed posts here — the feed
// is 04-community's job and the evergreen rotation's after it.
//
// ── The naming rule ────────────────────────────────────────────────────────
//
//   03-stores/priceback-hl-stores-02-en.png
//   ^^ tray, in tray order  ^^ position inside the tray  ^^ language
//
// Unlike 04-community there is no global running order, because a Highlight is
// not a sequence that goes out — it is a drawer that gets filled once and then
// edited. What matters is which tray a frame belongs to and where it sits in it,
// and both are in the filename.
//
// Covers sort into their own folder and are never posted. They are uploaded once
// from a phone into the Highlight tray. See HIGHLIGHTS.md.

const path = require("path");

const ROOT = path.join(__dirname, "..");
const PREFIX = "priceback-hl";

const storyFile = (tray, t, lang) =>
  path.join(ROOT, tray.dir, `${PREFIX}-${tray.id}-${t.n}-${lang}.png`);

const coverFile = (c) => path.join(ROOT, "covers", `${PREFIX}-cover-${c.order}-${c.id}.png`);

/** Repo-relative, forward-slashed — for logs, notes and schedule.json `asset`. */
const rel = (p) => path.relative(ROOT, p).split(path.sep).join("/");

module.exports = { ROOT, PREFIX, storyFile, coverFile, rel };
