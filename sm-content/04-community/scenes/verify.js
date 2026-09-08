// Community pack — the gates. Must exit 0 before anything ships.
//
//   node sm-content/04-community/scenes/verify.js
//
// Re-run after ANY copy change. Nine gates, ordered by how cheap the defect is
// to catch:
//
//   1 Dimensions     every declared asset exists at exactly its canvas size
//   2 Safe zones     nothing readable under IG's header, caption bar or rail
//   3 Sticker band   a frame declaring a sticker really does leave the band empty
//   4 Hook zone      every feed frame's hook is in the top third
//   5 Fonts          Roboto, Roboto Black and Roboto Mono resolved — measured
//   6 Copy           compliance + EN/FR parity, read off strings.json
//   7 Disclaimer     a frame naming a retailer renders the non-affiliation line
//   8 Cover circle   every cover's ink survives Instagram's circular crop
//   9 Publish order  seq is a gap-free 01..N and the waves run in order
//
// Gates 2 and 8 cannot be done by luminance. A hook is near-white on a
// near-black field — but the paper strip is ALSO near-white and is decoration,
// so no threshold separates them. Instead every scene is re-rendered in
// "content" mode, which suppresses the field, the paper, the torn edges, the
// ghost rows and the cover's disc; content is then exactly the non-transparent
// pixels and both checks become alpha tests with no judgement in them.
//
// Gates 7 and 9 are STRUCTURAL, not textual, and that is the point of having
// them. A regex can see the word "Costco"; only a structural check can see that
// the frame carrying it forgot its disclaimer, or that wave 03 was scheduled
// before wave 02.

const fs = require("fs");
const path = require("path");
const sharp = require("sharp");

const { CANVAS, SAFE, COVER, STICKER_BAND, HOOK_ZONE, DISPLAY, SANS, MONO } = require("./tokens");
const { setMode } = require("./surface");
const { buildPost, buildDivider } = require("./posts");
const { buildStory } = require("./stories");
const { buildCover } = require("./covers");
const { PROBE_SIZE } = require("./layout");
const { scanCopy, checkDisclaimerPairing } = require("./claims");
const { postFile, storyFile, dividerFile, noticeFile, reserveFile, coverFile, rel } = require("./paths");

const STRINGS = JSON.parse(fs.readFileSync(path.join(__dirname, "strings.json"), "utf8"));
const LANGS = ["en", "fr"];

const failures = [];
const warnings = [];
const fail = (gate, msg) => failures.push(`[${gate}] ${msg}`);
const warn = (gate, msg) => warnings.push(`[${gate}] ${msg}`);

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

async function existsAtSize(file, canvas, label, gateName = "dimensions") {
  if (!fs.existsSync(file)) {
    fail(gateName, `${label}: ${rel(file)} is missing — run render.js`);
    return false;
  }
  const meta = await sharp(file).metadata();
  if (meta.width !== canvas.w || meta.height !== canvas.h) {
    fail(gateName, `${label}: ${meta.width}x${meta.height}, expected ${canvas.w}x${canvas.h}`);
    return false;
  }
  return true;
}

function checkMargins(map, label, S, { w, h }, names) {
  const zones = [
    [names[0], { x0: 0, y0: 0, x1: w, y1: S.top }],
    [names[1], { x0: 0, y0: h - S.bottom, x1: w, y1: h }],
    [names[2], { x0: 0, y0: 0, x1: S.left, y1: h }],
    [names[3], { x0: w - S.right, y0: 0, x1: w, y1: h }],
  ];
  for (const [name, r] of zones) {
    const { count, at } = inkIn(map, r);
    if (count > STRAY) fail("safe-zones", `${label}: ${count}px of content in the ${name} (e.g. ${at})`);
  }
}

const FEED_MARGINS = ["top margin", "bottom margin", "left margin", "right margin"];
const STORY_MARGINS = ["IG header", "caption/reply bar", "left margin", "right action rail"];

// ── Gates 1-4 ───────────────────────────────────────────────────────────────
async function checkFeedFrame(t, file, label, handle) {
  const canvas = CANVAS.post;
  if (!(await existsAtSize(file, canvas, label))) return;
  const map = await contentMap(() => buildPost(t, handle), canvas);
  checkMargins(map, label, SAFE.post, canvas, FEED_MARGINS);

  const { count: hookInk } = inkIn(map, { x0: 0, y0: HOOK_ZONE.y, x1: canvas.w, y1: HOOK_ZONE.y + HOOK_ZONE.h });
  if (hookInk < 4000) {
    fail("hook-zone", `${label}: only ${hookInk}px of content in the hook zone — the hook is below the feed crop`);
  }
}

async function checkStoryFrame(t, file, label, handle) {
  const canvas = CANVAS.story;
  if (!(await existsAtSize(file, canvas, label))) return;
  const map = await contentMap(() => buildStory(t, handle), canvas);
  checkMargins(map, label, SAFE.story, canvas, STORY_MARGINS);

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

async function checkFrames() {
  for (const lang of LANGS) {
    const pack = STRINGS[lang];
    for (const t of pack.posts) {
      await checkFeedFrame(t, postFile(t, lang), `post ${lang}-${t.seq}`, pack.handle);
    }
    // Reserve posts get every frame gate a scheduled post gets. They are
    // unscheduled, not unfinished, and the day one is swapped into the run is
    // the worst possible day to discover it clips a margin.
    for (const t of pack.reserve || []) {
      await checkFeedFrame(t, reserveFile(t, lang), `reserve ${lang}-${t.id}`, pack.handle);
    }
    for (const t of pack.stories) {
      await checkStoryFrame(t, storyFile(t, lang), `story ${lang}-${t.seq}`, pack.handle);
    }
  }

  for (const n of STRINGS.notices) {
    const label = `notice ${n.seq}-${n.kind}`;
    if (n.kind === "story") await checkStoryFrame(n, noticeFile(n), label, STRINGS.en.handle);
    else await checkFeedFrame(n, noticeFile(n), label, STRINGS.en.handle);
  }

  for (const d of STRINGS.dividers) {
    const canvas = CANVAS.carousel;
    const label = `divider ${d.id}`;
    if (!(await existsAtSize(dividerFile(d), canvas, label))) continue;
    const map = await contentMap(() => buildDivider(d, STRINGS.en.handle), canvas);
    checkMargins(map, label, SAFE.carousel, canvas, FEED_MARGINS);
    // No hook-zone gate: a divider is a signpost, not a post. Its word is
    // deliberately at the optical centre, which is where a reader mid-swipe is
    // already looking.
  }
}

// ── Gate 8 — the cover survives the circle ──────────────────────────────────
// Instagram crops a cover to a centred square and masks it to a circle. Ink
// outside the safe circle is ink the tray will not show — and because the crop
// happens on the phone, silently, there is no other moment this can be caught.
async function checkCovers() {
  const canvas = CANVAS.cover;
  const { cx, cy } = COVER.safe;
  const rSafe = COVER.safe.d / 2;

  for (const c of STRINGS.covers) {
    const label = `cover ${c.id}-${c.slug}`;
    if (!(await existsAtSize(coverFile(c, STRINGS.coversDir), canvas, label))) continue;

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
    // this: the tray shows roughly 1/45th of these pixels, so a small icon is an
    // empty circle.
    //
    // 8000 is measured. The first attempt at it was 20000, guessed, and it
    // failed the arrow and the bulb — both of which read perfectly at 161px when
    // actually looked at. Across the eight covers the ink runs from 10248px (the
    // arrow: three strokes, the lightest thing in the set by construction) to
    // about 60000px (the filled "FR"). The floor sits below the lightest icon
    // that has been inspected at tray size, which is the only kind of evidence
    // that means anything for a gate about legibility.
    if (inside < 8000) {
      fail("cover-circle", `${label}: only ${inside}px of icon — too little ink to read at 161px in the Highlight tray`);
    }
  }
}

// ── Gate 5 — fonts ──────────────────────────────────────────────────────────
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

// A family name that cannot exist, so whatever librsvg renders for it IS the
// fallback face. Any real family rendering pixel-identically to this did not
// resolve — the failure this gate exists to catch, and the only way to catch it,
// because librsvg reports no error when it substitutes.
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
    fail(
      "fonts",
      `${MONO} is not advancing monospaced (I-run ${narrow.width}px vs M-run ${wide.width}px) — a proportional face was substituted`
    );
  }

  // Measured by INK AREA, not width: Roboto's Black and Bold faces have
  // near-identical advance widths, so an extent comparison reports them equal.
  // Weight lives in the stems. (The evergreen pack shipped a gate that failed
  // for this exact wrong reason — see EVERGREEN-NOTES.md.)
  const disp = await measure("HHHHHHHH", DISPLAY, 900);
  const body = await measure("HHHHHHHH", SANS, 500);
  if (disp.area && body.area && disp.area < body.area * 1.15) {
    fail(
      "fonts",
      `"${DISPLAY}" lays down only ${(disp.area / body.area).toFixed(2)}x the ink of "${SANS}" — the display face is not heavier and every hook ships at body weight`
    );
  }
}

// ── Gate 6 — copy, and gate 7 — the disclaimer pairing ──────────────────────
const SKIP_PATHS = /(^_readme|\._readme|\.stickerCopy$|storesLiveNote|^waves|^meta|^covers)/;

/** Every string a frame RENDERS — not its operator notes. */
function renderedFields(t) {
  const out = [t.kicker, ...(t.hook || []), ...(t.word || []), t.over, ...(t.sub || []), t.statusLabel];
  for (const r of t.rows || []) out.push(...r);
  for (const c of t.checks || []) out.push(c[0]);
  out.push(...(t.steps || []), ...(t.ballot || []));
  return out.filter(Boolean);
}

function checkCopy() {
  for (const lang of LANGS) {
    scanCopy(STRINGS[lang], lang, { skip: SKIP_PATHS }).forEach((p) => fail("copy", p));
  }
  scanCopy(STRINGS.notices, "notices", { skip: SKIP_PATHS }).forEach((p) => fail("copy", p));
  scanCopy(STRINGS.dividers, "dividers", { skip: SKIP_PATHS }).forEach((p) => fail("copy", p));

  // Gate 7. The rule the whole pack turns on: naming a store is allowed here
  // (unlike the evergreen pack), and the price of that is the disclaimer.
  const frames = [];
  for (const lang of LANGS) {
    for (const t of STRINGS[lang].posts) {
      frames.push({ label: `post ${lang}-${t.seq}`, fields: renderedFields(t), fineprint: t.fineprint });
    }
    for (const t of STRINGS[lang].stories) {
      frames.push({ label: `story ${lang}-${t.seq}`, fields: renderedFields(t), fineprint: t.fineprint });
    }
    for (const t of STRINGS[lang].reserve || []) {
      frames.push({ label: `reserve ${lang}-${t.id}`, fields: renderedFields(t), fineprint: t.fineprint });
    }
  }
  for (const n of STRINGS.notices) {
    frames.push({ label: `notice ${n.seq}-${n.kind}`, fields: renderedFields(n), fineprint: n.fineprint });
  }
  for (const d of STRINGS.dividers) {
    frames.push({ label: `divider ${d.id}`, fields: renderedFields(d), fineprint: d.fineprint });
  }
  checkDisclaimerPairing(frames).forEach((p) => fail("disclaimer", p));

  // Parity. EN and FR must be the same pack in two languages, not two packs.
  const en = STRINGS.en;
  const fr = STRINGS.fr;
  if (en.handle !== fr.handle) fail("parity", `handle differs: ${en.handle} vs ${fr.handle}`);
  if (en.posts.length !== fr.posts.length) fail("parity", `post counts differ: en=${en.posts.length} fr=${fr.posts.length}`);
  if (en.stories.length !== fr.stories.length) fail("parity", `story counts differ: en=${en.stories.length} fr=${fr.stories.length}`);

  if ((en.reserve || []).length !== (fr.reserve || []).length) {
    fail("parity", `reserve counts differ: en=${(en.reserve || []).length} fr=${(fr.reserve || []).length}`);
  }

  const pairs = [
    ["post", en.posts, fr.posts, ["seq", "wave", "layout", "accent", "hookType", "seamDir"]],
    ["reserve", en.reserve || [], fr.reserve || [], ["id", "wave", "layout", "accent", "hookType"]],
    ["story", en.stories, fr.stories, ["seq", "wave", "scene", "sticker", "seamDir"]],
  ];
  for (const [kind, a, b, keys] of pairs) {
    for (let i = 0; i < Math.min(a.length, b.length); i++) {
      for (const k of keys) {
        if (a[i][k] !== b[i][k]) fail("parity", `${kind} ${a[i].seq}: ${k} differs (en=${a[i][k]} fr=${b[i][k]})`);
      }
      for (const k of ["rows", "checks", "steps", "ballot", "sub", "hook", "fineprint"]) {
        const la = a[i][k] ? a[i][k].length : 0;
        const lb = b[i][k] ? b[i][k].length : 0;
        if (la !== lb) fail("parity", `${kind} ${a[i].seq}: ${k} has ${la} entries in en, ${lb} in fr`);
      }
      if ((a[i].statusLabel === undefined) !== (b[i].statusLabel === undefined)) {
        fail("parity", `${kind} ${a[i].seq}: statusLabel present in one language only`);
      }
    }
  }

  for (const t of en.stories) {
    if (t.sticker !== "none" && !t.stickerCopy) {
      warn("copy", `story ${t.seq}: declares a "${t.sticker}" sticker with no stickerCopy note for the operator`);
    }
  }
}

// ── Gate 9 — the publish order is real ──────────────────────────────────────
// The pack's whole filing premise is that the number in the filename IS the
// running order. That premise is only true if it is checked: a duplicated seq or
// a wave that goes backwards turns the folder listing from an instruction into a
// decoration, and nobody would notice until the wrong thing went out.
function checkOrder() {
  const waveOrder = STRINGS.waves.map((w) => w.dir);
  const seen = new Map();

  const record = (kind, seq, wave, label) => {
    if (!waveOrder.includes(wave)) fail("order", `${label}: wave "${wave}" is not declared in strings.json waves[]`);
    const key = `${kind}:${seq}`;
    if (seen.has(key)) fail("order", `${label}: seq ${seq} is already used by ${seen.get(key)}`);
    else seen.set(key, label);
  };

  for (const n of STRINGS.notices) record(n.kind, n.seq, n.wave, `notice ${n.seq}-${n.kind}`);
  for (const d of STRINGS.dividers) {
    if (!waveOrder.includes(d.wave)) fail("order", `divider ${d.id}: wave "${d.wave}" is not declared`);
  }
  // Reserve posts are deliberately absent from this gate. They have no seq,
  // because a post that is not in the running order must not claim a place in
  // it - the numbering is only worth checking if it only ever describes things
  // that are actually going out.
  for (const t of STRINGS.en.posts) record("post", t.seq, t.wave, `post ${t.seq}`);
  for (const t of STRINGS.en.stories) record("story", t.seq, t.wave, `story ${t.seq}`);

  // Every feed frame, in seq order: its wave index must never go backwards, and
  // the sequence must have no holes. Notices and posts share one numbering.
  const feed = [
    ...STRINGS.notices.filter((n) => n.kind === "post").map((n) => ({ seq: n.seq, wave: n.wave, label: `notice ${n.seq}` })),
    ...STRINGS.en.posts.map((t) => ({ seq: t.seq, wave: t.wave, label: `post ${t.seq}` })),
  ].sort((a, b) => Number(a.seq) - Number(b.seq));

  feed.forEach((f, i) => {
    const want = String(i + 1).padStart(2, "0");
    if (f.seq !== want) fail("order", `${f.label}: expected seq ${want} at position ${i + 1} — the running order has a hole or a duplicate`);
  });

  let high = -1;
  for (const f of feed) {
    const idx = waveOrder.indexOf(f.wave);
    if (idx < high) {
      fail("order", `${f.label} is in wave ${f.wave}, which runs BEFORE a wave an earlier seq already reached — the folder numbering no longer tells you what posts next`);
    }
    high = Math.max(high, idx);
  }
}

// ── Run ─────────────────────────────────────────────────────────────────────
async function main() {
  await checkFonts();
  checkCopy();
  checkOrder();
  await checkFrames();
  await checkCovers();

  const nAssets =
    LANGS.length * (STRINGS.en.posts.length + STRINGS.en.stories.length + (STRINGS.en.reserve || []).length) +
    STRINGS.notices.length +
    STRINGS.dividers.length +
    STRINGS.covers.length;

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
  console.log(`verify OK — ${nAssets} assets, 9 gates, 0 failures, ${warnings.length} warnings.`);
}

main().catch((e) => {
  console.error(`verify crashed: ${e.stack || e.message}`);
  process.exit(1);
});
