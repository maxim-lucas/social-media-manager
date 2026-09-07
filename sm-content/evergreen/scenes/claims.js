// Evergreen pack — the claim rules, in one place.
//
// Imported by BOTH scenes/verify.js (which gates the art) and
// scripts/check-copy.js (which gates the captions in schedule.json, and runs in
// CI without sharp or fonts). One list, two callers: a rule that lived in only
// one of them would be a rule the other quietly does not enforce, and the
// captions are the half that actually gets read.
//
// ── Why these rules ────────────────────────────────────────────────────────
//
// Marketing-Plan/01-strategy-overview.md and the app repo's
// legal/MARKETING_CLAIMS.md prohibit promising a dollar amount or a guaranteed
// refund in marketing copy. Competition Act s.74.01 and Quebec's LPC s.219 both
// test the GENERAL IMPRESSION a representation conveys, not its literal
// wording — so hedging in the fine print does not rescue a headline that
// promises. MARKETING_CLAIMS.md names the exact failure mode: a claim clipped
// into a social card without its paired fine print.
//
// If new copy trips one of these, SOFTEN THE COPY. Loosening the gate is the
// wrong fix, and it is the fix that will look tempting at 11pm.

// Retailers are barred from this pack for two reasons that happen to agree:
// naming one drags in the whole non-affiliation regime, and the pack exists
// precisely to describe a mechanic in a way that survives the store list
// growing. The art never names a store; neither do the captions.
const RETAILERS = [
  "costco", "best buy", "bestbuy", "home depot", "rona", "walmart", "canadian tire",
  "sport chek", "sportchek", "the source", "la source", "staples", "bureau en gros",
  "ikea", "loblaws", "sobeys", "shoppers drug", "jean coutu", "amazon",
  "london drugs", "reno-depot", "réno-dépôt", "lowes", "lowe's", "princess auto",
  "toys r us", "bass pro", "winners", "dollarama", "atmosphere", "decathlon",
  "structube", "hudson's bay", "indigo", "petsmart", "no frills", "provigo",
];

const BANNED_PATTERNS = [
  // A stated claim window. The whole point of this pack is that the window is
  // set per-retailer and changes as stores are added; printing one number makes
  // the asset wrong the day a store with different terms goes live.
  [/\b\d+\s*[-‑—]?\s*(day|days|jour|jours)\b/i, "states a claim window in days"],
  [/\bwithin\s+\d+\b/i, "states a claim window"],
  [/\bdans\s+les\s+\d+\b/i, "states a claim window"],

  // A figure we would have to stand behind. Every amount in this pack is an
  // ink bar instead — the redaction is doing compliance work, not styling.
  [/[$€£]\s?\d/, "prints a currency figure"],
  [/\d[\d\s.,]*\s?\$/, "prints a currency figure"],
  [/\d+\s?%/, "prints a percentage"],

  // A promise. The product cannot guarantee a retailer's decision, so nothing
  // in the copy may imply that it does.
  [/\bguarantee[ds]?\b|\bgaranti/i, "promises a guarantee"],
  [/\byou (will|'ll) get\b/i, "promises an outcome"],
  [/\bvous (serez|allez être) rembours/i, "promises an outcome"],
  [/\bwe refund\b|\bon vous rembourse\b/i, "promises an outcome we do not control"],
  [/\balways\s+(get|works|work)\b/i, "promises an outcome"],
  [/\bevery time\b|\bà chaque fois\b/i, "promises an outcome"],
];

/** Walk every string in a JSON tree, calling visit(value, dottedPath). */
function walkStrings(node, at, visit) {
  if (typeof node === "string") return visit(node, at);
  if (Array.isArray(node)) return node.forEach((v, i) => walkStrings(v, `${at}[${i}]`, visit));
  if (node && typeof node === "object") {
    for (const [k, v] of Object.entries(node)) walkStrings(v, at ? `${at}.${k}` : k, visit);
  }
}

/**
 * Scan a JSON tree and return a list of problems.
 *
 * `skip` matches dotted paths that are production notes for the operator rather
 * than words that reach a reader — `_readme`, a story's `stickerCopy`, a slot's
 * `note`. Those are allowed to say "30 days" or name a store while explaining
 * something; only what gets rendered or published is gated.
 */
function scanCopy(tree, root, { skip = /$^/ } = {}) {
  const problems = [];
  walkStrings(tree, root, (s, at) => {
    if (skip.test(at)) return;

    if (!s.trim()) {
      problems.push(`${at} is empty — an empty string renders as a blank line`);
      return;
    }
    if (/__[A-Z]+__/.test(s) && s !== "__REDACTED__") problems.push(`${at}: unrecognised placeholder ${s}`);
    if (/\bTODO\b|\bTBD\b|\bXXX\b|Lorem/i.test(s)) problems.push(`${at}: placeholder copy — ${JSON.stringify(s)}`);

    const low = s.toLowerCase();
    for (const r of RETAILERS) {
      if (low.includes(r)) problems.push(`${at} names a retailer ("${r}") — this pack is store-agnostic`);
    }
    for (const [re, why] of BANNED_PATTERNS) {
      if (re.test(s)) problems.push(`${at} ${why}: ${JSON.stringify(s)}`);
    }
  });
  return problems;
}

module.exports = { RETAILERS, BANNED_PATTERNS, walkStrings, scanCopy };
