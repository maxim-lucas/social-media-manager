// Community pack — the claim rules.
//
// Imported by BOTH scenes/verify.js (which gates the art) and the pack's caption
// check in scripts/check-copy.js (which gates schedule.json and runs in CI with
// no sharp and no fonts). One list, two callers: a rule that lived in only one
// of them would be a rule the other quietly does not enforce, and the captions
// are the half that actually gets read.
//
// ── How this differs from evergreen/scenes/claims.js ───────────────────────
//
// The evergreen pack bans retailer names outright, because its whole design
// constraint is to survive the store list growing. THIS pack is about the store
// list growing, so it has to be able to say which stores are live — that is the
// entire content of wave 03, and it is the pack's follow ask.
//
// So the rule is not "never name a retailer". It is:
//
//   A frame or caption that names a retailer MUST carry the non-affiliation
//   line, on the art, in the same language.
//
// That is enforced structurally in verify.js (checkDisclaimerPairing), not by a
// regex, because it is a pairing rule and a regex cannot see a pair.
// legal/MARKETING_CLAIMS.md names the failure mode it defends against by name:
// "the slogan gets clipped into a banner / social-media-card / marketing-email
// without the fine print — that's the moment the Bureau cares about." A caption
// disclaimer survives until the first screenshot. A rendered one does not have
// that failure mode.
//
// Everything else is inherited unchanged, and for the same reasons: Competition
// Act s.74.01 and Quebec's LPC s.219 both test the GENERAL IMPRESSION a
// representation conveys, not its literal wording, so hedged fine print does not
// rescue a headline that promises.
//
// If new copy trips one of these, SOFTEN THE COPY. Loosening the gate is the
// wrong fix, and it is the fix that will look tempting at 11pm.

// Names this pack is allowed to print — but only on a frame that also prints the
// disclaimer. The list is broader than what is live on purpose: it is a
// detector, not a roadmap, and it has to fire on a retailer that turns up in a
// caption six months from now written by someone who never read this file.
const RETAILERS = [
  "costco", "best buy", "bestbuy", "home depot", "rona", "walmart", "canadian tire",
  "sport chek", "sportchek", "the source", "la source", "staples", "bureau en gros",
  "ikea", "loblaws", "sobeys", "shoppers drug", "jean coutu", "amazon",
  "london drugs", "reno-depot", "reno-depot", "lowes", "lowe's", "princess auto",
  "toys r us", "bass pro", "winners", "dollarama", "atmosphere", "decathlon",
  "structube", "hudson's bay", "indigo", "petsmart", "no frills", "provigo",
  "abercrombie", "maxi", "giant tiger", "marshalls",
];

// A pattern tagged with this is not applied to a `fineprint` value. Exactly four
// rules carry it; the block above them says why.
const NOT_IN_FINEPRINT = "not-in-fineprint";

const BANNED_PATTERNS = [
  // A stated claim window, in any language. Kept from the evergreen pack and
  // kept for the same reason, restated here because it is the rule most likely
  // to be argued with: the window is set PER RETAILER. One retailer's number
  // printed on a frame becomes wrong the day a store with different terms goes
  // live, and the frame goes on being posted anyway, because nobody re-reads a
  // PNG. A pack whose entire subject is "more stores are coming" is the last
  // pack that may print one store's terms.
  [/\b\d+\s*[-‑—]?\s*(day|days|jour|jours)\b/i, "states a claim window in days"],
  [/\bwithin\s+\d+\b/i, "states a claim window"],
  [/\bdans\s+les\s+\d+\b/i, "states a claim window"],

  // A figure we would have to stand behind. Every amount in this pack is an ink
  // bar instead — the redaction is doing compliance work, not styling.
  [/[$€£]\s?\d/, "prints a currency figure"],
  [/\d[\d\s.,]*\s?\$/, "prints a currency figure"],
  // Also catches "100% Canadian", which is why the pack says MADE IN CANADA and
  // never a number: the Competition Bureau ties a percentage origin claim to a
  // costs test ("Product of Canada" ~= 98% of total direct costs incurred in
  // Canada). "Made in Canada" is the claim this product can stand behind
  // without an accounting exercise; "100% Canadian" is one it would have to
  // defend with one.
  [/\d+\s?%/, "prints a percentage"],

  // A promise. The product cannot guarantee a retailer's decision, so nothing
  // in the copy may imply that it does.
  [/\bguarantee[ds]?\b|\bgaranti/i, "promises a guarantee"],
  [/\byou (will|'ll) get\b/i, "promises an outcome"],
  [/\bvous (serez|allez être) rembours/i, "promises an outcome"],
  [/\bwe refund\b|\bon vous rembourse\b/i, "promises an outcome we do not control"],
  [/\balways\s+(get|works|work)\b/i, "promises an outcome"],
  [/\bevery time\b|\bà chaque fois\b/i, "promises an outcome"],

  // New in this pack. Naming a retailer is now allowed, which makes the
  // adjacent misrepresentation newly reachable: implying a relationship with
  // one. "Supported store" is a statement about our parser. "Partner" is a
  // statement about them, and it is not ours to make.
  //
  // These four are tagged NOT_IN_FINEPRINT, and the tag is the interesting part.
  // The disclaimer's own wording is "Not affiliated with, ENDORSED BY, or
  // connected to any retailer named here" — so the pattern that exists to catch
  // a claim of endorsement fires on the sentence that DISCLAIMS one. The gate
  // caught its own disclaimer on the first run it did.
  //
  // The evergreen pack's rule is "copy moves, not the gate", and in general it
  // is right. This is the exception that rule implies: the fineprint is not
  // free-text marketing, it is one fixed legal line, and it is already gated
  // POSITIVELY by checkDisclaimerPairing, which fails the build unless it
  // contains an actual disclaimer of affiliation. So the field is exempted from
  // these four patterns and from nothing else. The alternative — rewording the
  // legal notice so a lint rule would pass — is the wrong fix in the most
  // literal form available: weakening a disclaimer to please a regex.
  [/\b(official|officiel(le)?s?)\s+(partner|app|application|partenaire)/i, "implies an official relationship with a retailer", NOT_IN_FINEPRINT],
  [/\bin partnership with\b|\ben partenariat avec\b/i, "implies a partnership", NOT_IN_FINEPRINT],
  [/\bendorsed by\b|\bapprouvé par\b/i, "implies an endorsement", NOT_IN_FINEPRINT],
  [/\bworks? (with|for) (costco|best ?buy)\b/i, "implies a relationship with a named retailer", NOT_IN_FINEPRINT],
];

/** Does this string name a retailer? Returns the name it matched, or null. */
function namesRetailer(s) {
  const low = String(s).toLowerCase();
  return RETAILERS.find((r) => low.includes(r)) || null;
}

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
 * `note`. Those are allowed to name a store or say "30 days" while explaining
 * something; only what gets rendered or published is gated.
 *
 * Retailer names are NOT reported here. They are legal in this pack, and the
 * condition attached to them is a pairing, which lives in checkDisclaimerPairing.
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

    const inFineprint = /\.fineprint(\[\d+\])?$/.test(at);
    for (const [re, why, scope] of BANNED_PATTERNS) {
      if (scope === NOT_IN_FINEPRINT && inFineprint) continue;
      if (re.test(s)) problems.push(`${at} ${why}: ${JSON.stringify(s)}`);
    }
  });
  return problems;
}

/**
 * The pairing rule: any frame naming a retailer must also render the
 * non-affiliation line.
 *
 * `frames` is a list of `{ label, fields, fineprint }` — `fields` being every
 * string the frame RENDERS (not its operator notes), and `fineprint` the array
 * of disclaimer lines it draws, if any.
 */
function checkDisclaimerPairing(frames) {
  const problems = [];
  for (const f of frames) {
    const hit = f.fields.map(namesRetailer).find(Boolean);
    const hasFine = Array.isArray(f.fineprint) && f.fineprint.length > 0;

    if (hit && !hasFine) {
      problems.push(
        `${f.label} names a retailer ("${hit}") but renders no fineprint — the non-affiliation line has to be on the ` +
          `ART, not only in the caption, because a screenshot separates a caption from its frame`
      );
    }
    if (hasFine && !hit) {
      // Not a compliance failure, but it is how a disclaimer becomes wallpaper:
      // carried by frames that do not need it until nobody reads it on the one
      // that does.
      problems.push(`${f.label} renders fineprint but names no retailer — drop it, or the disclaimer becomes decoration`);
    }
    if (hasFine) {
      const joined = f.fineprint.join(" ").toLowerCase();
      if (!/(not affiliated|non affili|aucun lien)/.test(joined)) {
        problems.push(`${f.label}: fineprint does not actually disclaim affiliation — ${JSON.stringify(f.fineprint)}`);
      }
    }
  }
  return problems;
}

module.exports = {
  RETAILERS,
  BANNED_PATTERNS,
  NOT_IN_FINEPRINT,
  namesRetailer,
  walkStrings,
  scanCopy,
  checkDisclaimerPairing,
};
