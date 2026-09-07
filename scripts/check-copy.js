#!/usr/bin/env node
/**
 * check-copy.js — the claim gate, over everything a reader actually sees, in
 * every pack that has one.
 *
 *   node scripts/check-copy.js                    # all packs with a rule set
 *   node scripts/check-copy.js --pack=evergreen   # one of them
 *
 * A pack's `scenes/verify.js` gates the ART: it needs sharp, it needs the Roboto
 * faces installed, and it re-renders every frame. That makes it the wrong tool
 * for CI and, more importantly, it only reads strings.json — so the CAPTIONS,
 * which are the half of a post people actually read, were ungated.
 *
 * This checks both, uses each pack's OWN rule set (its `scenes/claims.js`, the
 * same module its verify.js imports), and has no dependencies beyond Node, so it
 * runs on any PR.
 *
 * ── Why per-pack rules and not one shared list ──────────────────────────────
 *
 * The packs disagree about retailers on purpose. `evergreen` bans naming one
 * outright — its whole design constraint is to survive the store list growing.
 * `04-community` is ABOUT the store list growing, so it names them, and pays for
 * that with a structural rule its own claims.js enforces: a frame naming a
 * retailer must render the non-affiliation line on the art.
 *
 * A single shared rule list could only encode one of those, and whichever it
 * encoded would quietly stop protecting the other pack. So each pack owns its
 * rules and this script discovers and runs them all — which also means a fifth
 * pack is gated the moment it exists, with no change here.
 */

const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");
const CONTENT = path.join(ROOT, "sm-content");

const args = process.argv.slice(2);
const argVal = (name, dflt) => {
  const hit = args.find((a) => a.startsWith(`--${name}=`));
  return hit ? hit.slice(name.length + 3) : dflt;
};
const only = argVal("pack", null);

/** Every directory under sm-content/ that ships its own rule set. */
function discoverPacks() {
  return fs
    .readdirSync(CONTENT, { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .map((d) => d.name)
    .filter((name) => fs.existsSync(path.join(CONTENT, name, "scenes", "claims.js")))
    .filter((name) => !only || name === only)
    .sort();
}

const packs = discoverPacks();
if (!packs.length) {
  console.error(only ? `no pack "${only}" with a scenes/claims.js` : "no packs with a scenes/claims.js");
  process.exit(1);
}

const problems = [];
let artStrings = 0;
let captions = 0;

for (const pack of packs) {
  const dir = path.join(CONTENT, pack);
  const at = (s) => `${pack}: ${s}`;
  const { scanCopy, namesRetailer } = require(path.join(dir, "scenes", "claims.js"));

  const read = (f) => JSON.parse(fs.readFileSync(path.join(dir, f), "utf8"));
  const strings = read("scenes/strings.json");
  const schedule = fs.existsSync(path.join(dir, "schedule.json")) ? read("schedule.json") : null;

  // ── The art's copy ────────────────────────────────────────────────────────
  // `stickerCopy` is what the operator types into Instagram's own sticker UI,
  // and `_readme` / `meta` / `waves` are notes to a maintainer. None is rendered.
  const skip = /(^_readme|\._readme|\.stickerCopy$|storesLiveNote|^waves|^meta|^covers)/;
  for (const lang of ["en", "fr"]) {
    if (!strings[lang]) continue;
    problems.push(...scanCopy(strings[lang], `strings.${lang}`, { skip }).map(at));
  }
  // A pack may carry language-neutral groups — the community pack's bilingual
  // notice frames and its carousel dividers. They render, so they are gated.
  for (const group of ["notices", "dividers"]) {
    if (Array.isArray(strings[group])) {
      problems.push(...scanCopy(strings[group], `strings.${group}`, { skip }).map(at));
    }
  }

  const walk = (v) => {
    if (typeof v === "string") artStrings++;
    else if (Array.isArray(v)) v.forEach(walk);
    else if (v && typeof v === "object") Object.values(v).forEach(walk);
  };
  for (const lang of ["en", "fr"]) if (strings[lang]) walk(strings[lang]);
  for (const group of ["notices", "dividers"]) if (Array.isArray(strings[group])) walk(strings[group]);

  if (!schedule) continue;

  // ── The captions ──────────────────────────────────────────────────────────
  // A slot's `note` is an instruction to whoever runs the account — it may say
  // "screenshot the poll result", or name a store while explaining something.
  // Everything else in a slot reaches Instagram.
  const publishes = (s) => s.kind === "feed" || s.kind === "carousel";
  schedule.slots.forEach((slot, i) => {
    if (slot.caption) captions++;
    problems.push(
      ...scanCopy(
        { caption: slot.caption ?? "", tags: slot.tags ?? [] },
        `schedule.slots[${i}] (${slot.id})`,
        { skip: /$^/ }
      )
        .filter((p) => !/ is empty —/.test(p) || publishes(slot))
        .map(at)
    );
  });

  // ── The caption's disclaimer pairing ──────────────────────────────────────
  // The same rule the art obeys, applied to the words: a caption naming a
  // retailer must reach the reader with a non-affiliation line attached. It
  // always does, because the publisher appends the disclaimer to every caption —
  // so this asserts the thing that MAKES that true rather than assuming it. A
  // bilingual slot is checked in both languages, because a French reader who
  // swiped to the French half and found only an English disclaimer has not been
  // given one.
  if (namesRetailer) {
    for (const slot of schedule.slots.filter((s) => s.caption && namesRetailer(s.caption))) {
      const langs = slot.lang === "bi" ? ["en", "fr"] : [slot.lang === "fr" ? "fr" : "en"];
      for (const lang of langs) {
        const d = schedule.disclaimer?.[lang] || "";
        if (!/not affiliated|n'est affilié|non affili|aucun lien/i.test(d)) {
          problems.push(
            at(`slot ${slot.id} names a retailer in its caption but disclaimer.${lang} carries no non-affiliation line`)
          );
        }
      }
    }
  }

  // The disclaimer is the one string allowed to describe the commercial terms,
  // so it is scanned for figures but not for "promise" language — it exists
  // precisely to state the conditions.
  for (const lang of ["en", "fr"]) {
    const d = schedule.disclaimer?.[lang];
    if (!d || !d.trim()) {
      problems.push(at(`schedule.disclaimer.${lang} is missing — captions would publish with no fine print`));
      continue;
    }
    const low = d.toLowerCase();
    if (!/not affiliated|n'est affilié/.test(low)) {
      problems.push(at(`schedule.disclaimer.${lang} omits the non-affiliation line`));
    }
    if (!/claims only|réclamations réussies/.test(low)) {
      problems.push(at(`schedule.disclaimer.${lang} omits the success-fee pairing required by legal/MARKETING_CLAIMS.md`));
    }
  }
}

if (problems.length) {
  console.error(`copy check FAILED — ${problems.length} problem${problems.length === 1 ? "" : "s"}:`);
  problems.forEach((p) => console.error(`  x ${p}`));
  console.error(`\nThe fix is to soften the copy, not to loosen the gate. See each pack's scenes/claims.js.`);
  process.exit(1);
}

console.log(
  `copy check OK — ${packs.length} pack${packs.length === 1 ? "" : "s"} (${packs.join(", ")}), ` +
    `${artStrings} art strings + ${captions} captions, 0 problems.`
);
