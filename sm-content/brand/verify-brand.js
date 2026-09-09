// The brand kit's gate.
//
//   node sm-content/brand/verify-brand.js            # check
//   node sm-content/brand/verify-brand.js --update    # re-bless the fixtures
//
// ── Why this exists ────────────────────────────────────────────────────────
//
// Every pack's surface.js used to carry its own copy of the mark, the leaf and
// the palette, and said so in as many words: "Self-contained on purpose. Each
// pack owns its own surface, so a tweak in one pack can never silently
// re-render another pack's PNGs."
//
// That property is real and worth keeping. Sharing the primitives takes it
// away — one edit to mark.js now reaches four packs and a hundred and sixty
// assets — so it has to be given back by something. This is that something.
//
// Each primitive is rendered to a fixed canvas and hashed. A change to a shared
// primitive fails here FIRST, before any pack re-renders, and the only way past
// is `--update`, which rewrites the fixtures as a reviewable diff. The
// re-render stops being silent and becomes a deliberate act with a paper trail,
// which is all the old duplication was ever buying.
//
// The fixture PNGs are committed next to the manifest for the same reason: a
// hash tells you something changed, and the picture tells you what.

const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const sharp = require("sharp");

const { C } = require("./palette");
const { glyph, watermark, solveOpacity, WATERMARK } = require("./mark");
const { leaf } = require("./leaf");
const { ICONS, drawIcon } = require("./icons");
const { COVER } = require("./ig");

const DIR = path.join(__dirname, "fixtures");
const MANIFEST = path.join(DIR, "manifest.json");
const update = process.argv.includes("--update");

const S = 240; // every fixture renders on this square

/** Wrap a fragment in a fixture-sized SVG on a neutral ground. */
function frame(inner, ground = C.field) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${S}" height="${S}">
  <rect width="${S}" height="${S}" fill="${ground}"/>
  ${inner}</svg>`;
}

const PRIMITIVES = {
  "mark-glyph": async () => frame(glyph({ x: 40, y: 40, size: 160, stroke: C.emerald, width: 2.9 })),
  "mark-watermark-field": async () => frame(watermark({ x: 40, y: 40, size: 160, on: "field" })),
  "mark-watermark-paper": async () => frame(watermark({ x: 40, y: 40, size: 160, on: "paper" }), C.paper),
  "leaf": async () => frame(leaf({ x: 50, y: 50, size: 140 })),
};

for (const name of Object.keys(ICONS)) {
  PRIMITIVES[`icon-${name}`] = async () =>
    frame(await drawIcon(name, { cx: S / 2, cy: S / 2, box: S, width: COVER.iconStroke * (S / 1080) * 2.45 }));
}

async function render(svg) {
  return sharp(Buffer.from(svg), { density: 72 }).png({ compressionLevel: 9 }).toBuffer();
}

const hash = (buf) => crypto.createHash("sha256").update(buf).digest("hex").slice(0, 16);

async function main() {
  fs.mkdirSync(DIR, { recursive: true });
  const previous = fs.existsSync(MANIFEST) ? JSON.parse(fs.readFileSync(MANIFEST, "utf8")) : {};
  const now = {};
  const changed = [];
  const missing = [];

  for (const [name, build] of Object.entries(PRIMITIVES)) {
    const buf = await render(await build());
    now[name] = hash(buf);
    const file = path.join(DIR, `${name}.png`);

    if (update) {
      fs.writeFileSync(file, buf);
      continue;
    }
    if (previous[name] === undefined) missing.push(name);
    else if (previous[name] !== now[name]) changed.push(name);
  }

  // The watermark's whole point is that it is specified as a CONTRAST, so the
  // solved alpha is asserted too. A hash would catch a change to it, but not
  // tell you that the number it changed to is outside the band the spec means.
  const solved = [
    ["field", solveOpacity(WATERMARK.onField.colour, C.field)],
    ["paper", solveOpacity(WATERMARK.onPaper.colour, C.paper)],
  ];
  const bad = solved.filter(([, a]) => !(a > 0.02 && a < 0.8));

  if (update) {
    fs.writeFileSync(MANIFEST, `${JSON.stringify(now, null, 2)}\n`);
    console.log(`fixtures updated — ${Object.keys(now).length} primitives.`);
    console.log("Review the PNG diff before committing: it is the whole point of the file.");
    return;
  }

  const gone = Object.keys(previous).filter((k) => !(k in now));
  const problems = [];
  for (const n of changed) problems.push(`${n} no longer matches its fixture`);
  for (const n of missing) problems.push(`${n} has no fixture — run --update`);
  for (const n of gone) problems.push(`${n} has a fixture but is no longer a primitive`);
  for (const [g, a] of bad) problems.push(`watermark on ${g} solves to alpha ${a.toFixed(3)}, outside a sane range`);

  if (problems.length) {
    console.error(`brand verify FAILED — ${problems.length} issue${problems.length === 1 ? "" : "s"}:`);
    problems.forEach((p) => console.error(`  x ${p}`));
    console.error(
      `\nA shared primitive changed. That re-renders every pack that imports it, so it is\n` +
        `deliberate or it is a bug. If deliberate: --update, look at the PNG diff, re-render\n` +
        `the packs, and commit all of it together.`
    );
    process.exit(1);
  }

  console.log(
    `brand verify OK — ${Object.keys(now).length} primitives match their fixtures, ` +
      `watermark solves to ${solved.map(([g, a]) => `${g} ${a.toFixed(3)}`).join(", ")}.`
  );
}

main().catch((e) => {
  console.error(`brand verify crashed: ${e.stack || e.message}`);
  process.exit(1);
});
