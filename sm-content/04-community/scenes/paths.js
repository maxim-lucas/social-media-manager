// Community pack — where every asset lands, and why the name looks like that.
//
// One module, imported by render.js AND verify.js. The evergreen pack built its
// paths inline in both files and got away with it because it had two shapes;
// this pack has four (post, story, divider, cover) across seven folders, and two
// copies of that arithmetic is two chances to render into a folder the gate does
// not check.
//
// ── The naming rule ────────────────────────────────────────────────────────
//
//   03-stores-growing/priceback-community-09-post-en.png
//   ^^ wave, in publish order   ^^ global running order   ^^ what it is
//
// Both numbers answer "what goes out next" without opening a schedule. The wave
// folder answers it at the level someone plans a week at; the seq answers it at
// the level someone posts an evening at. schedule.json still owns the DATES —
// this owns the ORDER, and the order is what survives the dates being moved.
//
// Covers are not in the sequence and their folder number sorts them last on
// purpose: they are never posted. They are uploaded once, from a phone, into
// the Highlight tray.

const path = require("path");

const ROOT = path.join(__dirname, "..");
const PREFIX = "priceback-community";

const postFile = (t, lang) => path.join(ROOT, t.wave, `${PREFIX}-${t.seq}-post-${lang}.png`);
const storyFile = (t, lang) => path.join(ROOT, t.wave, `${PREFIX}-${t.seq}-story-${lang}.png`);
const dividerFile = (d) => path.join(ROOT, d.wave, `${PREFIX}-divider-${d.id}.png`);
// The bilingual notice carries no language suffix, because it carries both
// languages. A `-en` and a `-fr` copy of a frame whose subject IS the pairing
// would be two files saying the same thing in the same two languages.
const noticeFile = (n) => path.join(ROOT, n.wave, `${PREFIX}-${n.seq}-${n.kind}.png`);
const coverFile = (c, coversDir) => path.join(ROOT, coversDir, `${PREFIX}-cover-${c.id}-${c.slug}.png`);

/** Repo-relative, forward-slashed — for logs, notes and schedule.json `asset`. */
const rel = (p) => path.relative(ROOT, p).split(path.sep).join("/");

module.exports = { ROOT, PREFIX, postFile, storyFile, dividerFile, noticeFile, coverFile, rel };
