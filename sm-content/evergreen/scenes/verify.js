// Evergreen pack — the gates. Must exit 0 before anything ships.
//
//   node sm-content/evergreen/scenes/verify.js
//
// Re-run these after ANY copy change. Six gates, in the order a defect is
// cheapest to catch:
//
//   1 Dimensions   every declared asset exists at exactly its canvas size
//   2 Safe zones   nothing readable under IG's header, caption bar or rail
//   3 Sticker band a frame declaring a sticker actually leaves the band empty
//   4 Hook zone    every post's hook really is in the top third
//   5 Fonts        Roboto and Roboto Mono resolved, measured not assumed
//   6 Copy         compliance + EN/FR parity, read off strings.json
//
// Gate 2 cannot be done by luminance. The hook is near-white on a near-black
// field — but the paper strip is *also* near-white and is decoration, so no
// threshold separates the two. Instead every scene is re-rendered in "content"
// mode, which suppresses the field, the paper, the torn edges and the ghost
// rows; content is then exactly the non-transparent pixels and the check is an
// alpha test with no judgement in it.

const fs = require("fs");
const path = require("path");
const sharp = require("sharp");

const { CANVAS, SAFE, STICKER_BAND, HOOK_ZONE, DISPLAY, SANS, MONO } = require("./tokens");
const { setMode } = require("./surface");
const { buildPost } = require("./posts");
const { buildStory } = require("./stories");
const { PROBE_SIZE } = require("./layout");
const { scanCopy } = require("./claims");

const ROOT = path.join(__dirname, "..");
const STRINGS = JSON.parse(fs.readFileSync(path.join(__dirname, "strings.json"), "utf8"));
const LANGS = ["en", "fr"];

const failures = [];
const warnings = [];
const fail = (gate, msg) => failures.push(`[${gate}] ${msg}`);
const warn = (gate, msg) => warnings.push(`[${gate}] ${msg}`);

// ── Alpha helpers ───────────────────────────────────────────────────────────
const ALPHA_MIN = 8; // below this a pixel is antialiasing fringe, not content

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

/** Count inked pixels inside a rect, and return one example coordinate. */
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

// A handful of stray pixels is a rounding artefact on a rotated glyph edge, not
// a layout defect. The threshold is deliberately small: 40 pixels is a fraction
// of one character.
const STRAY = 40;

// ── Gate 1 + 2 + 3 + 4 ──────────────────────────────────────────────────────
async function checkFrames() {
  for (const lang of LANGS) {
    const pack = STRINGS[lang];

    for (const t of pack.posts) {
      const file = path.join(ROOT, "posts", `priceback-evergreen-post-${lang}-${t.id}.png`);
      const label = `post ${lang}-${t.id}`;
      const { w, h } = CANVAS.post;

      // 1 — dimensions
      if (!fs.existsSync(file)) {
        fail("dimensions", `${label}: ${path.relative(ROOT, file)} is missing — run render.js`);
        continue;
      }
      const meta = await sharp(file).metadata();
      if (meta.width !== w || meta.height !== h) {
        fail("dimensions", `${label}: ${meta.width}x${meta.height}, expected ${w}x${h}`);
      }

      setMode("content");
      const map = await alphaMap(await buildPost(t, pack.handle), w, h);
      setMode("full");

      // 2 — safe zones (feed has no chrome overlay, so these are pure margins)
      const S = SAFE.post;
      const zones = [
        ["top margin", { x0: 0, y0: 0, x1: w, y1: S.top }],
        ["bottom margin", { x0: 0, y0: h - S.bottom, x1: w, y1: h }],
        ["left margin", { x0: 0, y0: 0, x1: S.left, y1: h }],
        ["right margin", { x0: w - S.right, y0: 0, x1: w, y1: h }],
      ];
      for (const [name, r] of zones) {
        const { count, at } = inkIn(map, r);
        if (count > STRAY) fail("safe-zones", `${label}: ${count}px of content in the ${name} (e.g. ${at})`);
      }

      // 4 — the hook really is in the top third
      const { count: hookInk } = inkIn(map, { x0: 0, y0: HOOK_ZONE.y, x1: w, y1: HOOK_ZONE.y + HOOK_ZONE.h });
      if (hookInk < 4000) {
        fail("hook-zone", `${label}: only ${hookInk}px of content in the hook zone — the hook is below the feed crop`);
      }
    }

    for (const t of pack.stories) {
      const file = path.join(ROOT, "stories", `priceback-evergreen-story-${lang}-${t.id}.png`);
      const label = `story ${lang}-${t.id}`;
      const { w, h } = CANVAS.story;

      if (!fs.existsSync(file)) {
        fail("dimensions", `${label}: ${path.relative(ROOT, file)} is missing — run render.js`);
        continue;
      }
      const meta = await sharp(file).metadata();
      if (meta.width !== w || meta.height !== h) {
        fail("dimensions", `${label}: ${meta.width}x${meta.height}, expected ${w}x${h}`);
      }

      setMode("content");
      const map = await alphaMap(await buildStory(t, pack.handle), w, h);
      setMode("full");

      // 2 — IG's own chrome: header, caption/reply bar, right action rail
      const S = SAFE.story;
      const zones = [
        ["IG header", { x0: 0, y0: 0, x1: w, y1: S.top }],
        ["caption/reply bar", { x0: 0, y0: h - S.bottom, x1: w, y1: h }],
        ["left margin", { x0: 0, y0: 0, x1: S.left, y1: h }],
        ["right action rail", { x0: w - S.right, y0: 0, x1: w, y1: h }],
      ];
      for (const [name, r] of zones) {
        const { count, at } = inkIn(map, r);
        if (count > STRAY) fail("safe-zones", `${label}: ${count}px of content under the ${name} (e.g. ${at})`);
      }

      // 3 — sticker band, only on frames that declare a sticker
      if (t.sticker && t.sticker !== "none") {
        const { count, at } = inkIn(map, {
          x0: 0,
          y0: STICKER_BAND.y,
          x1: w,
          y1: STICKER_BAND.y + STICKER_BAND.h,
        });
        if (count > STRAY) {
          fail(
            "sticker-band",
            `${label} declares a "${t.sticker}" sticker but ${count}px of art sits in the band (e.g. ${at})`
          );
        }
      }
    }
  }
}

// ── Gate 5 — fonts ──────────────────────────────────────────────────────────
// librsvg substitutes a missing font SILENTLY. A machine without Roboto Mono
// renders the whole pack in something else and nothing errors, so the only
// honest check is to render a probe and measure it.
//
// The test: a monospace family advances every glyph identically, a proportional
// one does not. If Roboto Mono went missing and fell back to a proportional
// face, "IIIIIIIIII" and "MMMMMMMMMM" stop measuring the same.
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

// A family name that cannot exist, so whatever librsvg renders for it IS the
// fallback face. Any real family that renders pixel-identically to this did not
// resolve — which is the failure this gate exists to catch, and the only way to
// catch it, because librsvg reports no error when it substitutes.
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
  // receipt row's dotted leader lands in the wrong place — monoWidth() in
  // surface.js assumes a 0.6em advance and has no way to notice.
  const narrow = await measure("IIIIIIIIII", MONO, 400);
  const wide = await measure("MMMMMMMMMM", MONO, 400);
  if (Math.abs(wide.width - narrow.width) > wide.width * 0.06) {
    fail(
      "fonts",
      `${MONO} is not advancing monospaced (I-run ${narrow.width}px vs M-run ${wide.width}px) — a proportional face was substituted`
    );
  }

  // The display face must be visibly heavier than the body face, or the hook
  // stops being a hook.
  //
  // Measured by INK AREA, not by width: Roboto's Black and Bold faces have
  // near-identical advance widths, so an extent comparison reports them equal.
  // Weight lives in the stems.
  const disp = await measure("HHHHHHHH", DISPLAY, 900);
  const body = await measure("HHHHHHHH", SANS, 500);
  if (disp.area && body.area && disp.area < body.area * 1.15) {
    fail(
      "fonts",
      `"${DISPLAY}" lays down only ${(disp.area / body.area).toFixed(
        2
      )}x the ink of "${SANS}" — the display face is not heavier and every hook ships at body weight`
    );
  }
}

// ── Gate 6 — copy ───────────────────────────────────────────────────────────
// Everything here is enforced because Marketing-Plan/01-strategy-overview.md and
// the app repo's legal/MARKETING_CLAIMS.md prohibit promising a dollar amount or
// a guaranteed refund in marketing copy. Competition Act s.74.01 and Quebec's
// LPC s.219 both test the GENERAL IMPRESSION, not the literal wording, and
// MARKETING_CLAIMS.md names the exact failure mode: a claim clipped into a
// social card without its paired fine print.
//
// If new copy trips one of these, soften the copy. Do not loosen the gate.

function checkCopy() {
  // The rules themselves live in claims.js, shared with scripts/check-copy.js
  // so the captions are held to the same bar as the art. See that file for why
  // each pattern is there — every one of them traces to
  // legal/MARKETING_CLAIMS.md or to the non-affiliation requirement.
  for (const lang of LANGS) {
    // stickerCopy is what the operator types into Instagram's sticker UI, not
    // something this renderer draws.
    scanCopy(STRINGS[lang], lang, { skip: /\.stickerCopy$/ }).forEach((p) => fail("copy", p));
  }

  // Parity. EN and FR must be the same pack in two languages, not two packs.
  const en = STRINGS.en;
  const fr = STRINGS.fr;
  if (en.posts.length !== fr.posts.length) fail("parity", `post counts differ: en=${en.posts.length} fr=${fr.posts.length}`);
  if (en.stories.length !== fr.stories.length)
    fail("parity", `story counts differ: en=${en.stories.length} fr=${fr.stories.length}`);
  if (en.handle !== fr.handle) fail("parity", `handle differs: ${en.handle} vs ${fr.handle}`);

  const n = Math.min(en.posts.length, fr.posts.length);
  for (let i = 0; i < n; i++) {
    const a = en.posts[i];
    const b = fr.posts[i];
    for (const k of ["id", "grid", "layout", "accent", "hookType"]) {
      if (a[k] !== b[k]) fail("parity", `post ${a.id}: ${k} differs (en=${a[k]} fr=${b[k]})`);
    }
    for (const k of ["rows", "checks", "steps", "ballot", "sub", "hook"]) {
      const la = a[k] ? a[k].length : 0;
      const lb = b[k] ? b[k].length : 0;
      if (la !== lb) fail("parity", `post ${a.id}: ${k} has ${la} entries in en, ${lb} in fr`);
    }
    if ((a.statusLabel === undefined) !== (b.statusLabel === undefined)) {
      fail("parity", `post ${a.id}: statusLabel present in one language only`);
    }
  }

  const m = Math.min(en.stories.length, fr.stories.length);
  for (let i = 0; i < m; i++) {
    const a = en.stories[i];
    const b = fr.stories[i];
    for (const k of ["id", "scene", "sticker"]) {
      if (a[k] !== b[k]) fail("parity", `story ${a.id}: ${k} differs (en=${a[k]} fr=${b[k]})`);
    }
    if (a.sticker !== "none" && !a.stickerCopy) {
      warn("copy", `story ${a.id}: declares a "${a.sticker}" sticker with no stickerCopy note for the operator`);
    }
  }

  // The 3x3 grid: cells must be a permutation of 1..9, because the pack is
  // authored to be READ top-left-first while being PUBLISHED 01-first.
  const cells = en.posts.map((p) => p.grid).sort((x, y) => x - y);
  const want = en.posts.map((_, i) => i + 1);
  if (JSON.stringify(cells) !== JSON.stringify(want)) {
    fail("parity", `grid cells are not a permutation of 1..${en.posts.length}: got ${cells.join(",")}`);
  }
}

// ── Run ─────────────────────────────────────────────────────────────────────
async function main() {
  await checkFonts();
  checkCopy();
  await checkFrames();

  const nAssets = LANGS.length * (STRINGS.en.posts.length + STRINGS.en.stories.length);
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
  console.log(`verify OK — ${nAssets} assets, 6 gates, 0 failures, ${warnings.length} warnings.`);
}

main().catch((e) => {
  console.error(`verify crashed: ${e.stack || e.message}`);
  process.exit(1);
});
