#!/usr/bin/env node
/**
 * check-copy.js — the claim gate, over everything a reader actually sees.
 *
 *   node scripts/check-copy.js
 *
 * scenes/verify.js gates the ART: it needs sharp, it needs Roboto and Roboto
 * Mono installed, and it re-renders all 38 frames. That makes it the wrong tool
 * for CI and, more importantly, it only ever read strings.json — so the
 * CAPTIONS, which are the half of a post people actually read, were ungated.
 *
 * This checks both, shares one rule set with verify.js (scenes/claims.js), and
 * has no dependencies beyond Node, so it can run on any PR.
 */

const fs = require("fs");
const path = require("path");
const { scanCopy } = require("../sm-content/evergreen/scenes/claims");

const PACK = path.join(__dirname, "..", "sm-content", "evergreen");

const read = (f) => JSON.parse(fs.readFileSync(path.join(PACK, f), "utf8"));

const strings = read("scenes/strings.json");
const schedule = read("schedule.json");

const problems = [];

// ── The art's copy ──────────────────────────────────────────────────────────
// `stickerCopy` is what the operator types into Instagram's own sticker UI, and
// `_readme` / `meta` are notes to a maintainer. Neither is rendered.
for (const lang of ["en", "fr"]) {
  problems.push(
    ...scanCopy(strings[lang], `strings.${lang}`, { skip: /\.stickerCopy$/ })
  );
}

// ── The captions ────────────────────────────────────────────────────────────
// A slot's `note` is an instruction to whoever runs the account — it is allowed
// to say "screenshot the poll result" or explain why a day is empty. Everything
// else in a slot reaches Instagram.
schedule.slots.forEach((slot, i) => {
  problems.push(
    ...scanCopy(
      { caption: slot.caption ?? "", tags: slot.tags ?? [] },
      `schedule.slots[${i}] (${slot.id})`,
      { skip: /$^/ }
    ).filter((p) => !/ is empty —/.test(p) || slot.kind === "feed")
  );
});

// The disclaimer is the one string allowed to describe the commercial terms, so
// it is scanned for retailer names and figures but not for "promise" language —
// it exists precisely to state the conditions.
for (const lang of ["en", "fr"]) {
  const d = schedule.disclaimer?.[lang];
  if (!d || !d.trim()) {
    problems.push(`schedule.disclaimer.${lang} is missing — captions would publish with no fine print`);
    continue;
  }
  const low = d.toLowerCase();
  if (!/not affiliated|n'est affilié/.test(low)) {
    problems.push(`schedule.disclaimer.${lang} omits the non-affiliation line`);
  }
  if (!/claims only|réclamations réussies/.test(low)) {
    problems.push(
      `schedule.disclaimer.${lang} omits the success-fee pairing required by legal/MARKETING_CLAIMS.md`
    );
  }
}

if (problems.length) {
  console.error(`copy check FAILED — ${problems.length} problem${problems.length === 1 ? "" : "s"}:`);
  problems.forEach((p) => console.error(`  x ${p}`));
  console.error(`\nThe fix is to soften the copy, not to loosen the gate. See scenes/claims.js.`);
  process.exit(1);
}

const captions = schedule.slots.filter((s) => s.caption).length;
const artStrings = ["en", "fr"].reduce((n, l) => {
  let c = 0;
  const walk = (v) => {
    if (typeof v === "string") c++;
    else if (Array.isArray(v)) v.forEach(walk);
    else if (v && typeof v === "object") Object.values(v).forEach(walk);
  };
  walk(strings[l]);
  return n + c;
}, 0);

console.log(`copy check OK — ${artStrings} art strings + ${captions} captions, 0 problems.`);
