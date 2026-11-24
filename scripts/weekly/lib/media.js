/** media.js: which rendered week file feeds which carousel slot, and the "never the same image twice" check. */
const crypto = require("crypto");

/**
 * @param {{kind: string, key: string, lang: string}} slot
 * @param {string} monday
 * @param {string[]} weekFiles names (no .json) of the week files that exist
 * @returns {string|null} the week file the slot's slides come from, or null (the routine supplies the slides itself,
 *          as for the Sunday how-to carousel, or the content does not exist this week)
 */
function sourceFor(slot, monday, weekFiles) {
  if (slot.kind !== "carousel") return null;
  const base = `${monday}-${slot.lang}-`;
  if (slot.key === "regional") return weekFiles.find((n) => n.startsWith(`${base}regional-`)) || null;
  return weekFiles.includes(base + slot.key) ? base + slot.key : null;
}

/**
 * The rendered reel for a reel slot, as a path relative to weekly/<monday>/ (2026-11-23: six reels were rendered and
 * committed but never registered, so every reel slot stayed `needs_content`). A reel is weekly/<monday>/reels/<key>-<lang>.mp4.
 * @param {{kind: string, key: string, lang: string}} slot
 * @param {string[]} reelFiles file names in weekly/<monday>/reels
 */
function reelAssetFor(slot, reelFiles) {
  if (slot.kind !== "reel") return null;
  const name = `${slot.key}-${slot.lang}.mp4`;
  return reelFiles.includes(name) ? `reels/${name}` : null;
}

/** The reel's cover image: weekly/<monday>/reels/<key>-<lang>-cover.jpg, or null. Instagram needs one (never its own pick). */
function reelCoverFor(slot, reelFiles) {
  if (slot.kind !== "reel") return null;
  const name = `${slot.key}-${slot.lang}-cover.jpg`;
  return reelFiles.includes(name) ? `reels/${name}` : null;
}

const md5 = (buf) => crypto.createHash("md5").update(buf).digest("hex");

/** Runbook rule 2 (10-composio-posting-runbook): a carousel must never contain the same image twice. */
function duplicates(buffers) {
  const seen = new Map();
  const dup = [];
  buffers.forEach((b, i) => {
    const h = md5(b);
    if (seen.has(h)) dup.push([seen.get(h), i]);
    else seen.set(h, i);
  });
  return dup;
}

module.exports = { reelAssetFor, reelCoverFor, sourceFor, duplicates, md5 };
