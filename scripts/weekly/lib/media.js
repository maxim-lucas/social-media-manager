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

module.exports = { sourceFor, duplicates, md5 };
