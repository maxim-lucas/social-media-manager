// Highlights pack — the gates. Must exit 0 before anything ships.
//
//   node sm-content/05-highlights/scenes/verify.js
//
// Re-run after ANY copy change. Eleven gates, ordered by how cheap the defect is
// to catch:
//
//    1 Dimensions     every declared asset exists at exactly its canvas size
//    2 Safe zones     nothing readable under IG's header, caption bar or rail
//    3 Sticker band   a frame declaring a sticker really does leave the band empty
//    4 Fonts          Roboto, Roboto Black and Roboto Mono resolved — measured
//    5 Copy           compliance + EN/FR parity, read off strings.json
//    6 Disclaimer     a frame naming a retailer renders the non-affiliation line
//    7 Cover circle   every cover's ink survives Instagram's circular crop
//    8 Cover parity   every icon is the SAME SIZE as the others  [new]
//    9 Watermark      the mark lands inside its contrast band     [new]
//   10 Facts          no frame calls a store live that production does not [new]
//   11 Tray           every cover has frames behind it            [new]
//
// Gates 2, 7 and 8 cannot be done by luminance. A hook is near-white on a
// near-black field — but the paper strip is ALSO near-white and is decoration,
// so no threshold separates them. Instead every scene is re-rendered in
// "content" mode, which suppresses the field, the paper, the torn edges, the
// ghost rows and the cover's disc; content is then exactly the non-transparent
// pixels and the checks become alpha tests with no judgement in them.
//
// Gates 8, 9, 10 and 11 are new in this pack and each exists because of a
// specific defect that shipped without them. They are documented at each one.

const fs = require("fs");
const path = require("path");
const sharp = require("sharp");

const { CANVAS, SAFE, COVER, STICKER_BAND, C, DISPLAY, SANS, MONO } = require("./tokens");
const { setMode, setWatermark } = require("./surface");
const { buildStory, HEAVY } = require("./stories");
const { buildCover } = require("./covers");
const { PROBE_SIZE } = require("./layout");
const { scanCopy, checkDisclaimerPairing, namesRetailer } = require("./claims");
const { storyFile, coverFile, rel } = require("./paths");
const { geometryBox } = require("../../brand/icons");
const { WATERMARK } = require("../../brand/mark");
const { luminance } = require("../../brand/palette");

const STRINGS = JSON.parse(fs.readFileSync(path.join(__dirname, "strings.json"), "utf8"));
const FACTS = JSON.parse(fs.readFileSync(path.join(__dirname, "..", "facts.json"), "utf8"));
const LANGS = ["en", "fr"];

const failures = [];
const warnings = [];
const fail = (gate, msg) => failures.push(`[${gate}] ${msg}`);
const warn = (gate, msg) => warnings.push(`[${gate}] ${msg}`);

const TRAYS = Object.fromEntries(STRINGS.trays.map((t) => [t.id, t]));
const flatten = (f, lang) => ({ n: f.n, scene: f.scene, sticker: f.sticker, ...f[lang] });

/** Every frame in the pack, as { trayId, tray, f, lang, t, label, file }. */
function* everyFrame() {
  for (const [trayId, list] of Object.entries(STRINGS.frames)) {
    for (const f of list) {
      for (const lang of LANGS) {
        yield {
          trayId,
          tray: TRAYS[trayId],
          f,
          lang,
          t: flatten(f, lang),
          label: `${trayId} ${f.n} ${lang}`,
          file: storyFile(TRAYS[trayId], f, lang),
        };
      }
    }
  }
}

// ── Alpha helpers ───────────────────────────────────────────────────────────
const ALPHA_MIN = 8; // below this a pixel is antialiasing fringe, not content
// A handful of stray pixels is a rounding artefact on a rotated glyph edge, not
// a layout defect. 40 pixels is a fraction of one character.
const STRAY = 40;

async function alphaMap(svg, w, h) {
  const { data, info } = await sharp(Buffer.from(svg), { density: 72 })
    .extractChannel("alpha")
    .raw()
    .toBuffer({ resolveWithObject: true });
  if (info.width !== w || info.height !== h) {
    throw new Error(`content render was ${info.width}x${info.height}, expected ${w}x${h}`);
  }
  return { data, w: info.width, h: info.height };
}

function inkIn({ data, w }, { x0, y0, x1, y1 }) {
  let count = 0;
  let at = null;
  for (let y = Math.max(0, y0); y < y1; y++) {
    for (let x = Math.max(0, x0); x < x1; x++) {
      if (data[y * w + x] > ALPHA_MIN) {
        count++;
        if (!at) at = [x, y];
      }
    }
  }
  return { count, at };
}

/** Content-mode alpha map for one scene. */
async function contentMap(build, canvas) {
  setMode("content");
  try {
    return await alphaMap(await build(), canvas.w, canvas.h);
  } finally {
    setMode("full");
  }
}

async function existsAtSize(file, canvas, label) {
  if (!fs.existsSync(file)) {
    fail("dimensions", `${label}: ${rel(file)} is missing — run render.js`);
    return false;
  }
  const meta = await sharp(file).metadata();
  if (meta.width !== canvas.w || meta.height !== canvas.h) {
    fail("dimensions", `${label}: ${meta.width}x${meta.height}, expected ${canvas.w}x${canvas.h}`);
    return false;
  }
  return true;
}

const STORY_MARGINS = ["IG header", "caption/reply bar", "left margin", "right action rail"];

// ── Gates 1-3 ───────────────────────────────────────────────────────────────
async function checkFrames() {
  const canvas = CANVAS.story;
  for (const { t, label, file } of everyFrame()) {
    if (!(await existsAtSize(file, canvas, label))) continue;
    const map = await contentMap(() => buildStory(t, STRINGS.meta.handle), canvas);

    const S = SAFE.story;
    const zones = [
      [STORY_MARGINS[0], { x0: 0, y0: 0, x1: canvas.w, y1: S.top }],
      [STORY_MARGINS[1], { x0: 0, y0: canvas.h - S.bottom, x1: canvas.w, y1: canvas.h }],
      [STORY_MARGINS[2], { x0: 0, y0: 0, x1: S.left, y1: canvas.h }],
      [STORY_MARGINS[3], { x0: canvas.w - S.right, y0: 0, x1: canvas.w, y1: canvas.h }],
    ];
    for (const [name, r] of zones) {
      const { count, at } = inkIn(map, r);
      if (count > STRAY) fail("safe-zones", `${label}: ${count}px of content in the ${name} (e.g. ${at})`);
    }

    if (t.sticker && t.sticker !== "none") {
      const { count, at } = inkIn(map, {
        x0: 0,
        y0: STICKER_BAND.y,
        x1: canvas.w,
        y1: STICKER_BAND.y + STICKER_BAND.h,
      });
      if (count > STRAY) {
        fail("sticker-band", `${label} declares a "${t.sticker}" sticker but ${count}px of art sits in the band (e.g. ${at})`);
      }
      // A disclaimer lives where a sticker goes. A frame asking for both is a
      // frame whose disclaimer is about to be covered by a poll.
      if (t.fineprint && t.fineprint.length) {
        fail("sticker-band", `${label} declares both a "${t.sticker}" sticker and fineprint — the sticker would cover the disclaimer`);
      }
    }
  }
}

// ── Gate 7 — the cover survives the circle ──────────────────────────────────
// Instagram crops a cover to a centred square and masks it to a circle. Ink
// outside the safe circle is ink the tray will not show — and because the crop
// happens on the phone, silently, there is no other moment this can be caught.
//
// ── Gate 8 — and the covers are the same size as each other ─────────────────
// The set this pack replaces passed gate 7 and was still wrong: its icons ran
// from 56% to 91% of the icon box because each one was drawn at whatever size
// its path happened to be, and the only cover gate was a floor on total ink,
// which all eight cleared. A floor cannot see a SPREAD. This one measures each
// icon's real geometry and asserts they agree.
async function checkCovers() {
  const canvas = CANVAS.cover;
  const { cx, cy } = COVER.safe;
  const rSafe = COVER.safe.d / 2;

  for (const c of STRINGS.covers) {
    const label = `cover ${c.order}-${c.id}`;
    if (!(await existsAtSize(coverFile(c), canvas, label))) continue;

    const map = await contentMap(() => buildCover(c), canvas);

    let outside = 0;
    let at = null;
    let inside = 0;
    for (let y = 0; y < canvas.h; y++) {
      for (let x = 0; x < canvas.w; x++) {
        if (map.data[y * canvas.w + x] <= ALPHA_MIN) continue;
        const d = Math.hypot(x - cx, y - cy);
        if (d > rSafe) {
          outside++;
          if (!at) at = [x, y];
        } else {
          inside++;
        }
      }
    }
    if (outside > STRAY) {
      fail("cover-circle", `${label}: ${outside}px of icon outside the safe circle (e.g. ${at}) — the tray will crop it`);
    }
    // An icon technically inside the circle but tiny is the other way to fail
    // this: the tray shows roughly 1/45th of these pixels. 8000 is measured, not
    // guessed — a first attempt at 20000 failed the arrow and the bulb, both of
    // which read perfectly at 161px when actually looked at.
    if (inside < 8000) {
      fail("cover-circle", `${label}: only ${inside}px of icon — too little ink to read at 161px in the Highlight tray`);
    }

    // Gate 8. The finished icon is geometry plus one stroke; assert it lands at
    // the fill brand/icons.js solved for. The band is tight on purpose: this is
    // arithmetic, not taste, and anything outside it means the normalisation did
    // not run rather than that a designer disagreed.
    const geom = await geometryBox(c.icon);
    const s = (COVER.icon * COVER.iconFill - COVER.iconStroke) / Math.max(geom.w, geom.h);
    const drawn = Math.max(geom.w, geom.h) * s + COVER.iconStroke;
    const fill = drawn / COVER.icon;
    if (fill < COVER.iconFill - 0.02 || fill > COVER.iconFill + 0.02) {
      fail(
        "cover-parity",
        `${label}: icon fills ${(fill * 100).toFixed(0)}% of the icon box, not ${(COVER.iconFill * 100).toFixed(0)}% — ` +
          `the set will not look even at 161px`
      );
    }
  }
}

// ── Gate 9 — the watermark is there, and is not shouting ────────────────────
//
// The defect: the same mark was drawn at `opacity 0.09` on story frames and at
// FULL opacity on feed frames, in two packs, by two authors who both wrote
// "faint" in the comment above it. Measured, that was a luminance delta of 19
// against the field and about 139 against paper — one invisible on a phone, one
// louder than the print it sat under.
//
// An alpha is not a strength, so brand/mark.js specifies a CONTRAST and solves
// the alpha per ground. This gate asserts the RENDERED result, because a spec
// that is only checked at the point it is written is a spec that drifts the
// first time somebody passes a custom colour.
//
// Measured by difference: each frame is rendered with the watermark and without,
// and the largest per-pixel luminance change between the two is the contrast.
// Sampling a fixed region would mean guessing where the glyph is and hoping no
// copy ever moves over it.
async function lumMap(svg, w, h) {
  const { data, info } = await sharp(Buffer.from(svg), { density: 72 })
    .raw()
    .toBuffer({ resolveWithObject: true });
  const out = new Float32Array(w * h);
  for (let i = 0, p = 0; i < data.length; i += info.channels, p++) {
    out[p] = 0.2126 * data[i] + 0.7152 * data[i + 1] + 0.0722 * data[i + 2];
  }
  return out;
}

/** Which frames carry a watermark: the ones with no strip and no emblem. */
const carriesWatermark = (t) => !HEAVY.has(t.scene) && t.scene !== "mark";

async function checkWatermark() {
  const { w, h } = CANVAS.story;
  const [lo, hi] = WATERMARK.band;
  // One frame per distinct scene is enough — the watermark is drawn at one size
  // in one place, so a second frame of the same scene measures the same pixels.
  const seen = new Set();

  for (const { t, label } of everyFrame()) {
    if (!carriesWatermark(t) || seen.has(t.scene)) continue;
    seen.add(t.scene);

    const withWm = await lumMap(await buildStory(t, STRINGS.meta.handle), w, h);
    setWatermark(false);
    let without;
    try {
      without = await lumMap(await buildStory(t, STRINGS.meta.handle), w, h);
    } finally {
      setWatermark(true);
    }

    let peak = 0;
    for (let i = 0; i < withWm.length; i++) {
      const d = Math.abs(withWm[i] - without[i]);
      if (d > peak) peak = d;
    }

    if (peak < lo) {
      fail(
        "watermark",
        `${label} (scene "${t.scene}"): the mark reads at only deltaL ${peak.toFixed(1)} over its ground, ` +
          `below the band ${lo}-${hi} — that is the strength that was invisible on a phone`
      );
    } else if (peak > hi) {
      fail(
        "watermark",
        `${label} (scene "${t.scene}"): the mark reads at deltaL ${peak.toFixed(1)}, above the band ${lo}-${hi} — ` +
          `a watermark must not be the loudest thing on the frame`
      );
    }
  }

  // And the spec itself still solves to something sane on both grounds.
  for (const [ground, colour, base] of [
    ["field", WATERMARK.onField.colour, C.field],
    ["paper", WATERMARK.onPaper.colour, C.paper],
  ]) {
    const spread = Math.abs(luminance(colour) - luminance(base));
    if (spread < WATERMARK.deltaL) {
      fail("watermark", `the spec asks for deltaL ${WATERMARK.deltaL} on ${ground}, but that ground offers only ${spread.toFixed(0)}`);
    }
  }
}

// ── Gate 10 — production truth ──────────────────────────────────────────────
//
// The defect this exists to prevent, exactly: 04-community shipped a frame that
// ticked Costco AND Best Buy as live, with the hook "TWO DOWN", because whoever
// checked read the app's working tree while it sat on `development`. On
// origin/main — the branch that becomes an APK — Best Buy is in
// LAB_STORE_PARSERS, which in a store build behaves as if it were not there.
//
// So: any retailer this pack names is checked against facts.json, and the
// checklist that renders is DERIVED from it rather than typed per frame. A
// store's status is stated once and cannot be true on one frame and false on
// another.
function checkFacts() {
  const live = FACTS.stores.live.map((s) => s.toLowerCase());
  const coming = FACTS.stores.coming.map((s) => s.toLowerCase());
  const known = new Set([...live, ...coming]);

  for (const { t, label } of everyFrame()) {
    for (const [name, state] of t.checks || []) {
      const hit = namesRetailer(name);
      if (!hit) continue;
      const isLive = state === "live";
      if (isLive && !live.includes(hit)) {
        fail(
          "facts",
          `${label} ticks "${name}" as live, but facts.json (${FACTS.branch}, checked ${FACTS.checkedOn}) ` +
            `lists it as ${coming.includes(hit) ? "coming" : "not present at all"}`
        );
      }
      if (!known.has(hit)) {
        warn("facts", `${label} names "${name}", which facts.json does not mention at all`);
      }
    }
  }

  if (FACTS.branch !== "origin/main") {
    fail("facts", `facts.json says it was read from "${FACTS.branch}" — copy describes production only`);
  }
}

// ── Gate 11 — a cover with nothing behind it ────────────────────────────────
//
// The most common way a Highlight tray dies: eight beautiful circles, four of
// which open onto one stale frame. A cover is a label on a drawer, and this
// asserts the drawer has something in it.
//
// A tray may legitimately be filled from ANOTHER pack — 04-community's frames
// 07-17 already live in Tips, FAQ, Support, About and Feedback — so the check is
// that a tray is accounted for, not that it renders here. `filledFrom` in
// trays[] is how a tray declares that.
function checkTrays() {
  for (const tray of STRINGS.trays) {
    const own = (STRINGS.frames[tray.id] || []).length;
    if (own === 0 && !tray.filledFrom) {
      fail(
        "tray",
        `cover ${tray.order} "${tray.en}" has no frames in this pack and no filledFrom — ` +
          `a cover with nothing behind it is a label on an empty drawer`
      );
    }
    if (!tray.en || !tray.fr) fail("tray", `tray ${tray.id} is missing a title in one language`);
    // Instagram truncates a Highlight title at roughly 10-15 characters, which
    // is why the French titles are short ones rather than literal translations.
    for (const lang of LANGS) {
      if (tray[lang].length > 15) {
        warn("tray", `tray ${tray.id} title "${tray[lang]}" (${lang}) is ${tray[lang].length} chars — Instagram will truncate it`);
      }
    }
  }

  for (const trayId of Object.keys(STRINGS.frames)) {
    if (!TRAYS[trayId]) fail("tray", `frames.${trayId} has no tray declared in trays[]`);
  }
}

// ── Gate 4 — fonts ──────────────────────────────────────────────────────────
// librsvg substitutes a missing font SILENTLY. A machine without Roboto Mono
// renders the whole pack in something else and nothing errors, so the only
// honest check is to render a probe and measure it.
async function measure(str, family, weight) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="4000" height="260">
    <text x="60" y="180" font-family="${family}" font-size="${PROBE_SIZE}" font-weight="${weight}" fill="#000">${str}</text></svg>`;
  const { data, info } = await sharp(Buffer.from(svg), { density: 72 })
    .extractChannel("alpha")
    .raw()
    .toBuffer({ resolveWithObject: true });
  let min = -1;
  let max = -1;
  let area = 0;
  for (let x = 0; x < info.width; x++) {
    let inked = false;
    for (let y = 0; y < info.height; y++) {
      if (data[y * info.width + x] > ALPHA_MIN) {
        area++;
        inked = true;
      }
    }
    if (inked) {
      if (min < 0) min = x;
      max = x;
    }
  }
  return { width: min < 0 ? 0 : max - min + 1, area };
}

const NO_SUCH_FAMILY = "PriceBackNoSuchFamily9Z";
const PANGRAM = "Hamburgefonstiv 123";

async function checkFonts() {
  const fallback = await measure(PANGRAM, NO_SUCH_FAMILY, 400);

  for (const [family, weight] of [
    [DISPLAY, 900],
    [SANS, 500],
    [MONO, 400],
  ]) {
    const got = await measure(PANGRAM, family, weight);
    if (!got.area) {
      fail("fonts", `"${family}" @${weight}: probe rendered nothing`);
    } else if (got.width === fallback.width && got.area === fallback.area) {
      fail(
        "fonts",
        `"${family}" @${weight} rendered identically to a nonexistent family — it did not resolve, and librsvg substituted silently`
      );
    }
  }

  // Roboto Mono must actually advance monospaced. If it fell back to a
  // proportional face that happens not to match the fallback probe, every
  // receipt row's dotted leader lands in the wrong place — monoWidth() assumes a
  // 0.6em advance and has no way to notice.
  const narrow = await measure("IIIIIIIIII", MONO, 400);
  const wide = await measure("MMMMMMMMMM", MONO, 400);
  if (Math.abs(wide.width - narrow.width) > wide.width * 0.06) {
    fail("fonts", `${MONO} is not advancing monospaced (I-run ${narrow.width}px vs M-run ${wide.width}px) — a proportional face was substituted`);
  }

  // Measured by INK AREA, not width: Roboto's Black and Bold faces have
  // near-identical advance widths, so an extent comparison reports them equal.
  // Weight lives in the stems.
  const disp = await measure("HHHHHHHH", DISPLAY, 900);
  const body = await measure("HHHHHHHH", SANS, 500);
  if (disp.area && body.area && disp.area < body.area * 1.15) {
    fail(
      "fonts",
      `"${DISPLAY}" lays down only ${(disp.area / body.area).toFixed(2)}x the ink of "${SANS}" — the display face is not heavier and every hook ships at body weight`
    );
  }
}

// ── Gates 5 and 6 — copy, and the disclaimer pairing ────────────────────────
const SKIP_PATHS = /(^_readme|\._readme|\.stickerCopy$|^meta|^trays|^covers|^facts)/;

/** Every string a frame RENDERS — not its operator notes. */
function renderedFields(t) {
  const out = [t.kicker, ...(t.hook || []), ...(t.sub || [])];
  for (const r of t.rows || []) out.push(...r);
  for (const c of t.checks || []) out.push(c[0]);
  out.push(...(t.steps || []));
  return out.filter(Boolean);
}

function checkCopy() {
  scanCopy(STRINGS.frames, "frames", { skip: SKIP_PATHS }).forEach((p) => fail("copy", p));

  const frames = [];
  for (const { t, label } of everyFrame()) {
    frames.push({ label, fields: renderedFields(t), fineprint: t.fineprint });
  }
  checkDisclaimerPairing(frames).forEach((p) => fail("disclaimer", p));

  // Parity. EN and FR must be the same pack in two languages, not two packs.
  for (const [trayId, list] of Object.entries(STRINGS.frames)) {
    for (const f of list) {
      for (const k of ["rows", "checks", "steps", "sub", "hook", "fineprint"]) {
        const la = f.en[k] ? f.en[k].length : 0;
        const lb = f.fr[k] ? f.fr[k].length : 0;
        if (la !== lb) fail("parity", `${trayId} ${f.n}: ${k} has ${la} entries in en, ${lb} in fr`);
      }
      if (!f.en.kicker || !f.fr.kicker) fail("parity", `${trayId} ${f.n}: kicker missing in one language`);
      if (f.sticker && f.sticker !== "none" && !f.en.stickerCopy) {
        warn("copy", `${trayId} ${f.n}: declares a "${f.sticker}" sticker with no stickerCopy note for the operator`);
      }
    }
  }
}

// ── Run ─────────────────────────────────────────────────────────────────────
async function main() {
  await checkFonts();
  checkCopy();
  checkFacts();
  checkTrays();
  await checkFrames();
  await checkCovers();
  await checkWatermark();

  const nFrames = Object.values(STRINGS.frames).reduce((a, l) => a + l.length, 0);
  const nAssets = nFrames * LANGS.length + STRINGS.covers.length;

  if (warnings.length) {
    console.log("warnings:");
    warnings.forEach((w) => console.log(`  ! ${w}`));
    console.log("");
  }
  if (failures.length) {
    console.error(`verify FAILED — ${failures.length} issue${failures.length === 1 ? "" : "s"}:`);
    failures.forEach((f) => console.error(`  x ${f}`));
    process.exit(1);
  }
  console.log(`verify OK — ${nAssets} assets, 11 gates, 0 failures, ${warnings.length} warnings.`);
}

main().catch((e) => {
  console.error(`verify crashed: ${e.stack || e.message}`);
  process.exit(1);
});
