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
 * The same argument runs one surface further out. A REEL-SCRIPTS.md is copy as
 * much as a caption is: its `On screen` column is burned into the video and its
 * `Voice` column is said out loud to camera. A Reel is also the format served to
 * people who do NOT follow the account, so an unhedged line there reaches the
 * widest audience the pack has, in someone's actual voice, with no fine print to
 * attach it to and no edit after posting.
 *
 * So three surfaces reach a person, and this checks all three — art copy,
 * captions, Reel scripts — against each pack's OWN rule set (its
 * `scenes/claims.js`, the same module its verify.js imports). It has no
 * dependencies beyond Node, so it runs on any PR.
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

// ── The Reel scripts ────────────────────────────────────────────────────────
//
// A REEL-SCRIPTS.md is copy, not notes. Its "On screen" column is burned into
// the video and its "Voice" column is said out loud to camera, so both reach a
// viewer exactly the way a caption does — and until now neither was read by any
// gate. The community pack's own rules table said so in as many words:
//
//     Same claim rules as the art | ... `claims.js` does not scan a shot list —
//     you have to hold the line yourself here.
//
// That is the same hole this script was written to close for captions, one
// surface further along, and it is a worse one: a Reel is the format served to
// people who do not follow the account, so an unhedged promise reaches the
// widest audience the pack has and does it in someone's actual voice, where
// there is no fine print to attach and no edit after posting.
//
// ── Why the parse is header-driven ─────────────────────────────────────────
//
// The two packs do not agree on table shape and should not have to. Community
// runs `# | Time | Shot | On screen | Voice`; evergreen runs `Time | Shot | On
// screen`, and its French Reel runs `Temps | Plan | À l'écran`. Reading by
// column INDEX would silently scan the wrong column the first time a table
// gained a field — the failure would be a gate that still passes, which is the
// only kind worth engineering against. So columns are classified by NAME.
//
// An unrecognised column in a shot list is a hard failure rather than a skip,
// and that direction is deliberate: skipping means a new column — "Audio",
// "Subtitle", "Text overlay" — is ungated from the moment someone adds it and
// nothing ever says so. Failing means they classify it once, in writing, here.

/** Columns whose cells reach a viewer: burned into the frame, or spoken aloud. */
const VIEWER_COLUMN = /^(on[ -]?screen|à l'écran|a l'ecran|voice|voix)$/i;

/** Columns that direct whoever holds the camera. The `note` of a shot list. */
const DIRECTION_COLUMN = /^(#|no\.?|time|temps|shot|plan)$/i;

/**
 * Prose lines carrying copy rather than direction. `FR take` is the French
 * voiceover written out as prose instead of a second table; `Caption` is a
 * published caption. `Ask` is deliberately absent — "follow", "save", "comment"
 * is an instruction to the operator, not a line anyone reads or says.
 */
const SPOKEN_LINE = /^\*\*(FR take|Caption|VO|Voice-?over|Voix off)\b[^*]*\*\*/i;

/** `01-together/…-02-post-en.png` → the frame a shot cuts to. */
const CITATION = /(\d{2}-[a-z0-9-]+)\/[^\s`)|]*?-(\d{2})-(post|story)(?:-(en|fr))?\.png/g;

/** Every REEL-SCRIPTS.md a pack ships — at its root, or one folder down. */
function reelScripts(dir) {
  const found = [];
  const at = (...p) => path.join(dir, ...p);
  if (fs.existsSync(at("REEL-SCRIPTS.md"))) found.push("REEL-SCRIPTS.md");
  for (const d of fs.readdirSync(dir, { withFileTypes: true })) {
    if (d.isDirectory() && fs.existsSync(at(d.name, "REEL-SCRIPTS.md"))) {
      found.push(`${d.name}/REEL-SCRIPTS.md`);
    }
  }
  return found;
}

/** Split markdown into `## ` sections: [{ title, lines }]. */
function sections(md) {
  const out = [{ title: "(preamble)", lines: [] }];
  for (const line of md.split(/\r?\n/)) {
    if (/^##\s+/.test(line)) out.push({ title: line.replace(/^#+\s*/, "").trim(), lines: [] });
    else out[out.length - 1].lines.push(line);
  }
  return out;
}

/**
 * The pipe tables in a block of lines, as [{ header: [], rows: [[]] }].
 *
 * A row's cells are split on unescaped `|`; the leading and trailing empties
 * that a `| a | b |` row produces are dropped.
 */
function pipeTables(lines) {
  const cells = (l) => l.trim().replace(/^\||\|$/g, "").split("|").map((c) => c.trim());
  const tables = [];
  for (let i = 0; i < lines.length; i++) {
    const sep = lines[i + 1];
    if (!/^\s*\|/.test(lines[i] || "") || !/^\s*\|[\s:|-]+\|\s*$/.test(sep || "")) continue;
    const header = cells(lines[i]);
    const rows = [];
    let j = i + 2;
    for (; j < lines.length && /^\s*\|/.test(lines[j]); j++) rows.push(cells(lines[j]));
    tables.push({ header, rows, at: i + 1 });
    i = j - 1;
  }
  return tables;
}

/**
 * The viewer-facing strings in one cell.
 *
 * A cell may stack several on-screen elements separated by `·`, and marks them
 * up with `**bold**` (community) or `` `code` `` (evergreen) — both are the
 * document's typography, not the copy. An em dash alone means NOTHING is on
 * screen for that shot, which is a legitimate answer and not an empty string.
 */
function cellCopy(cell) {
  return cell
    .split("·")
    .map((s) => s.replace(/[*`]/g, "").trim())
    .filter((s) => s && !/^[—–-]+$/.test(s));
}

/** The quoted spans in a prose line — the lines actually said or published. */
function quotedSpans(line) {
  return [...line.matchAll(/"([^"]+)"|“([^”]+)”/g)].map((m) => m[1] ?? m[2]).filter((s) => s.trim());
}

/**
 * Does a cited frame exist on disk? Resolved by listing the wave folder rather
 * than rebuilding the name, so this stays prefix-agnostic across packs.
 */
function citedFrame(dir, wave, seq, kind, lang) {
  const folder = path.join(dir, wave);
  if (!fs.existsSync(folder)) return null;
  const suffix = lang ? `-${seq}-${kind}-${lang}.png` : `-${seq}-${kind}.png`;
  return fs.readdirSync(folder).find((f) => f.endsWith(suffix)) || null;
}

/** Does the frame a shot cuts to render the non-affiliation line? */
function frameHasFineprint(strings, wave, seq, kind, lang) {
  const has = (f) => f && Array.isArray(f.fineprint) && f.fineprint.length > 0;
  const group = kind === "post" ? "posts" : "stories";
  for (const l of lang ? [lang] : ["en", "fr"]) {
    const hit = (strings[l]?.[group] || []).find((f) => f.seq === seq && f.wave === wave);
    if (has(hit)) return true;
  }
  // The bilingual notice frames carry no language suffix and live in their own
  // language-neutral group, so a citation to one lands here rather than above.
  return (strings.notices || []).some((n) => n.seq === seq && n.wave === wave && has(n));
}

const problems = [];
let artStrings = 0;
let captions = 0;
let reelLines = 0;

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

  // ── The Reel scripts ──────────────────────────────────────────────────────
  // What a Reel burns on screen and what its presenter says out loud, gated by
  // the same rules as the art and the captions — see the `── The Reel scripts`
  // block above for what is read, what is not, and why the parse is by column NAME.
  for (const file of reelScripts(dir)) {
    const md = fs.readFileSync(path.join(dir, file), "utf8");

    for (const section of sections(md)) {
      const where = `${file} › ${section.title}`;
      const copy = {}; // label → the string a viewer gets
      const keep = (label, s) => {
        let k = label;
        for (let n = 2; k in copy; n++) k = `${label} #${n}`;
        copy[k] = s;
      };

      // The tables. A section may hold a documentation table as well as a shot
      // list — the community pack opens with `| Rule | Why |` — so a table is
      // only treated as a shot list once a column NAME says it is one. Without
      // that test the unknown-column failure below would fire on prose.
      for (const { header, rows } of pipeTables(section.lines)) {
        const known = header.map((h) => (VIEWER_COLUMN.test(h) ? "viewer" : DIRECTION_COLUMN.test(h) ? "direction" : null));
        if (!known.some(Boolean)) continue;

        header.forEach((h, c) => {
          if (!known[c]) {
            problems.push(
              at(
                `${where}: unrecognised shot-list column ${JSON.stringify(h)} — classify it as viewer-facing or ` +
                  `direction in scripts/check-copy.js, or its cells ship ungated`
              )
            );
          }
        });

        rows.forEach((cells, r) => {
          header.forEach((h, c) => {
            if (known[c] !== "viewer") return;
            cellCopy(cells[c] ?? "").forEach((s) => keep(`${where} › row ${r + 1} › ${h}`, s));
          });
        });
      }

      // The prose that is copy. A `**FR take:**` runs to the end of its
      // paragraph and its quotes wrap across lines, so the paragraph is joined
      // before the quoted spans are pulled out of it.
      for (let i = 0; i < section.lines.length; i++) {
        if (!SPOKEN_LINE.test(section.lines[i])) continue;
        const para = [];
        for (let j = i; j < section.lines.length && section.lines[j].trim(); j++) para.push(section.lines[j].trim());
        i += para.length - 1;
        const label = para[0].match(SPOKEN_LINE)[1];
        quotedSpans(para.join(" ")).forEach((s) => keep(`${where} › ${label}`, s));
      }

      const lines = Object.values(copy);
      reelLines += lines.length;
      // The readable path is already built into each key, so the root is empty:
      // walkStrings joins a root and a key with a dot, and a root here would print
      // the section title a second time in front of every problem it reports.
      problems.push(...scanCopy(copy, "", { skip: /$^/ }).map(at));

      // ── The frames a shot cuts to ───────────────────────────────────────
      // A shot list cites rendered frames by name, and those names carry the
      // publish seq — so renumbering a post silently points a shot at a file
      // that is not there any more. Nothing else in the pack would notice: the
      // art still renders, the schedule still checks, and the defect surfaces
      // on a shoot day when someone goes looking for the frame.
      const cited = [];
      for (const [, wave, seq, kind, lang] of section.lines.join("\n").matchAll(CITATION)) {
        cited.push({ wave, seq, kind, lang });
        if (!citedFrame(dir, wave, seq, kind, lang)) {
          problems.push(at(`${where} cites ${wave}/…-${seq}-${kind}${lang ? `-${lang}` : ""}.png, which does not exist`));
        }
      }

      // ── The pairing rule, applied to video ──────────────────────────────
      // Same rule the art obeys and for the same reason, one surface further
      // out: a Reel naming a retailer has to show the non-affiliation line, not
      // merely carry it in the caption. A Reel is screenshotted and re-shared
      // more than a post is, and the caption does not travel with the frame.
      // A Reel has no fineprint of its own — it is video — so what is checked
      // is that it cuts to a frame that renders one.
      if (namesRetailer) {
        const hit = lines.map(namesRetailer).find(Boolean);
        const covered = cited.some((c) => frameHasFineprint(strings, c.wave, c.seq, c.kind, c.lang));
        if (hit && !covered) {
          problems.push(
            at(
              `${where} names a retailer ("${hit}") in what the viewer sees or hears, but cuts to no frame that ` +
                `renders the non-affiliation line — a caption disclaimer does not survive a screenshot of a Reel`
            )
          );
        }
      }
    }
  }

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
    `${artStrings} art strings + ${captions} captions + ${reelLines} Reel lines, 0 problems.`
);
