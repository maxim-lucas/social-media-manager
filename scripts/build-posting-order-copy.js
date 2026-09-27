#!/usr/bin/env node
// Additive, read-only convenience copy: walks a pack's schedule.json in exact
// posting order and drops a numbered duplicate of every slot's asset into
// <pack>/POSTING-ORDER/, so the whole run can be read top-to-bottom on GitHub
// without cross-referencing schedule.json + CALENDAR.md. Never touches the
// originals scripts/publish-due.js reads. Re-run after any schedule edit.
//
//   node scripts/build-posting-order-copy.js <pack-dir>
//   node scripts/build-posting-order-copy.js sm-content/evergreen
//   node scripts/build-posting-order-copy.js sm-content/04-community

const fs = require("fs");
const path = require("path");

const packDir = process.argv[2];
if (!packDir) {
  console.error("usage: node scripts/build-posting-order-copy.js <pack-dir>");
  process.exit(1);
}

const schedulePath = path.join(packDir, "schedule.json");
const schedule = JSON.parse(fs.readFileSync(schedulePath, "utf8"));
const outDir = path.join(packDir, "POSTING-ORDER");
fs.rmSync(outDir, { recursive: true, force: true });
fs.mkdirSync(outDir, { recursive: true });

schedule.slots.forEach((slot, i) => {
  const n = String(i + 1).padStart(2, "0");
  const lang = slot.lang === "bi" ? "bi" : slot.lang || "xx";
  const idAlreadyHasLang = new RegExp(`-${lang}$`).test(slot.id);
  const base = idAlreadyHasLang ? `${n}-${slot.id}` : `${n}-${slot.id}-${lang}`;

  if (Array.isArray(slot.assets)) {
    // carousel: several slides, in posting order
    slot.assets.forEach((rel, j) => {
      const src = path.join(packDir, rel);
      const ext = path.extname(rel);
      const dest = path.join(outDir, `${base}-slide${j + 1}${ext}`);
      fs.copyFileSync(src, dest);
    });
    return;
  }

  if (slot.asset) {
    const src = path.join(packDir, slot.asset);
    const ext = path.extname(slot.asset);
    const dest = path.join(outDir, `${base}${ext}`);
    fs.copyFileSync(src, dest);
    return;
  }

  // No pre-rendered asset: content made live on the day (a poll-result
  // screenshot, a Reel shot on a phone, ...). Leave a stub so the folder
  // still reads as the full sequence instead of a silent gap.
  const stub = path.join(outDir, `${base}-MADE-ON-THE-DAY.txt`);
  fs.writeFileSync(
    stub,
    `${slot.kind} · ${slot.date} ${slot.time}\n\n${slot.note || "(see schedule.json / CALENDAR.md for what goes here)"}\n`
  );
});

console.log(`${schedule.slots.length} slots -> ${outDir}`);
