// Community pack — SVG primitives: a strip of thermal paper on a dark field.
//
// Copied from evergreen/scenes/surface.js and extended at the bottom. Each pack
// owns its SURFACE — the strip, the tear, the grain, the scene composition — so
// that a tweak in one pack can never silently re-render another pack's PNGs.
//
// What it no longer owns is the mark, the leaf, the palette and the type ramp.
// Those come from ../../brand, because they are facts about the product rather
// than choices about this pack, and keeping four copies of them is exactly how
// the mark ended up drawn at two different strengths. brand/verify-brand.js
// carries the safety property the duplication used to.
//
// Every scene is one SVG string rendered to PNG by sharp/librsvg. Anything
// librsvg does not support (CSS layout, webfonts, blend modes beyond the basic
// filter set) is deliberately absent: the renderer has no browser.
//
// All randomness is seeded. A copy change must not reshuffle every torn edge
// and produce a spurious diff on all 38 assets.
//
// The surface is still self-contained on purpose. It would be a two-line change
// to import the teaser pack's paper.js instead, and then a copy tweak in the
// teaser would silently re-render this pack. Shared primitives are shared
// BECAUSE a difference in them would be a defect; a shared surface would only
// mean four packs that look alike, which is the opposite of the point.

const { C, FADE, SANS, MONO, TYPE } = require("./tokens");

// ── Determinism ─────────────────────────────────────────────────────────────
// mulberry32. Same seed in, same paper out.
function rng(seed) {
  let a = seed >>> 0;
  return function () {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const esc = (s) =>
  String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

const r2 = (n) => Math.round(n * 100) / 100;

// ── Render mode ─────────────────────────────────────────────────────────────
// "full" draws the finished frame. "content" suppresses the field, the paper
// and the torn edges, leaving a transparent canvas carrying only what a reader
// is meant to read.
//
// This is the seam verify.js needs. A luminance threshold cannot separate
// content from decoration here: the hook line is near-white on a near-black
// field, but the paper strip is *also* near-white and is decoration. With the
// decoration suppressed, content is exactly the non-transparent pixels and the
// safe-zone gate becomes an alpha test with no judgement in it.
let MODE = "full";
const setMode = (m) => {
  MODE = m;
};
const isContentMode = () => MODE === "content";

// ── Shared defs ─────────────────────────────────────────────────────────────
function defs(seed = 1) {
  return `
<defs>
  <linearGradient id="fieldGrad" x1="0" y1="0" x2="0.35" y2="1">
    <stop offset="0" stop-color="${C.fieldTop}"/>
    <stop offset="0.55" stop-color="${C.field}"/>
    <stop offset="1" stop-color="${C.fieldDeep}"/>
  </linearGradient>

  <linearGradient id="paperGrad" x1="0" y1="0" x2="0.12" y2="1">
    <stop offset="0" stop-color="${C.paperTop}"/>
    <stop offset="0.5" stop-color="${C.paper}"/>
    <stop offset="1" stop-color="${C.paperBottom}"/>
  </linearGradient>

  <!-- The emerald element, always the same ramp so one frame's green matches
       the next even when the shapes differ. -->
  <linearGradient id="emeraldGrad" x1="0" y1="0" x2="0.6" y2="1">
    <stop offset="0" stop-color="${C.emeraldGlow}"/>
    <stop offset="1" stop-color="${C.emeraldDeep}"/>
  </linearGradient>

  <!-- Light falling across the strip from the upper left. Without it the paper
       is a flat rectangle and the whole conceit collapses. -->
  <linearGradient id="stripLight" x1="0" y1="0" x2="1" y2="0.25">
    <stop offset="0" stop-color="#ffffff" stop-opacity="0.30"/>
    <stop offset="0.42" stop-color="#ffffff" stop-opacity="0.04"/>
    <stop offset="1" stop-color="#000000" stop-opacity="0.13"/>
  </linearGradient>

  <!-- Vignette: pulls the eye to the middle third and stops the corners
       competing with the hook line. -->
  <radialGradient id="vignette" cx="0.5" cy="0.42" r="0.78">
    <stop offset="0.45" stop-color="#000000" stop-opacity="0"/>
    <stop offset="1" stop-color="#000000" stop-opacity="0.55"/>
  </radialGradient>

  <!-- Paper tooth. Fine grain, low alpha; at 1080px it reads as fibre.
       The trailing feComposite is load-bearing: feTurbulence generates its own
       graphic across the whole filter REGION, which for a rotated strip is its
       bounding box, not its outline. Without clipping the noise back to
       SourceAlpha the tooth paints a visible rectangle around the paper. -->
  <filter id="tooth" x="-2%" y="-2%" width="104%" height="104%">
    <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="3" seed="${seed}" result="n"/>
    <feColorMatrix in="n" type="saturate" values="0"/>
    <feComponentTransfer><feFuncA type="linear" slope="0.10"/></feComponentTransfer>
    <feComposite in2="SourceAlpha" operator="in"/>
  </filter>

  <!-- Field grain. Flat dark areas band badly once Instagram re-encodes them;
       a little noise is what stops the gradient posterising. -->
  <filter id="grain" x="0" y="0" width="100%" height="100%">
    <feTurbulence type="fractalNoise" baseFrequency="0.7" numOctaves="2" seed="${seed + 5}" result="n"/>
    <feColorMatrix in="n" type="saturate" values="0"/>
    <feComponentTransfer><feFuncA type="linear" slope="0.032"/></feComponentTransfer>
  </filter>

  <!-- Thermal print is never crisp; it bleeds a fraction of a pixel. -->
  <filter id="bleed" x="-4%" y="-12%" width="108%" height="130%">
    <feGaussianBlur stdDeviation="0.42"/>
  </filter>

  <!-- The strip's cast shadow on the field. -->
  <filter id="drop" x="-25%" y="-15%" width="150%" height="140%">
    <feGaussianBlur stdDeviation="26"/>
  </filter>

  <filter id="tearShade" x="-25%" y="-140%" width="150%" height="380%">
    <feGaussianBlur stdDeviation="9"/>
  </filter>

  <!-- Emerald glow, for the one green element per frame. -->
  <filter id="glow" x="-60%" y="-60%" width="220%" height="220%">
    <feGaussianBlur stdDeviation="18" result="b"/>
    <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
  </filter>
</defs>`;
}

// ── The field ───────────────────────────────────────────────────────────────
// Call once per scene, first.
function field(w, h) {
  if (MODE === "content") return "";
  return `
  <rect width="${w}" height="${h}" fill="url(#fieldGrad)"/>
  <rect width="${w}" height="${h}" filter="url(#grain)"/>`;
}

// The vignette goes last, over the strip, under the type.
function vignette(w, h) {
  if (MODE === "content") return "";
  return `<rect width="${w}" height="${h}" fill="url(#vignette)"/>`;
}

// ── The paper strip ─────────────────────────────────────────────────────────
// A receipt is torn off a roll, never cut, so both ends are ragged. `angle` is
// a slight rotation — a strip laid down by a hand, not placed by a layout
// engine. Everything drawn on top must share the same rotation, so the caller
// gets back a <g> transform to wrap its own content in.
function strip({ x, y, w, h, angle = -1.4, seed = 7, tear = "both" }) {
  const cx = x + w / 2;
  const cy = y + h / 2;
  const transform = `rotate(${r2(angle)} ${r2(cx)} ${r2(cy)})`;
  if (MODE === "content") return { svg: "", transform };

  const rand = rng(seed);
  const depth = 26;
  const step = 40;

  // One ragged edge, as a path across the strip's width.
  const edge = (atY, dir) => {
    const pts = [];
    for (let px = -8; px <= w + step; px += step) {
      const jx = (rand() - 0.5) * step * 0.4;
      const jy = rand() * depth;
      pts.push([Math.min(w, Math.max(0, px + jx)), atY + dir * jy]);
    }
    return pts;
  };

  const topPts = tear === "bottom" ? [[0, 0], [w, 0]] : edge(0, 1);
  const botPts = tear === "top" ? [[w, h], [0, h]] : edge(h, -1).reverse();

  const d =
    topPts.map(([px, py], i) => `${i === 0 ? "M" : "L"} ${r2(x + px)} ${r2(y + py)}`).join(" ") +
    " " +
    botPts.map(([px, py]) => `L ${r2(x + px)} ${r2(y + py)}`).join(" ") +
    " Z";

  return {
    svg: `
  <g transform="${transform}">
    <path d="${d}" fill="${C.paperShadow}" fill-opacity="0.72" filter="url(#drop)" transform="translate(0 18)"/>
    <path d="${d}" fill="url(#paperGrad)"/>
    <path d="${d}" fill="url(#stripLight)"/>
    <!-- fill is required, not decorative: the tooth filter clips its noise to
         SourceAlpha, and a path with no fill has none. -->
    <path d="${d}" fill="#000000" filter="url(#tooth)"/>
    <path d="${d}" fill="none" stroke="${C.paperEdge}" stroke-width="1.6" stroke-opacity="0.7"/>
  </g>`,
    transform,
  };
}

// ── Text ────────────────────────────────────────────────────────────────────
// One entry point so family, tracking, weight and the bleed filter stay
// consistent. `op` is opacity: how faded this line of print is.
function text(
  s,
  {
    x,
    y,
    size = 32,
    weight = 400,
    tracking = 0,
    op = FADE.print,
    fill = C.ink,
    family = MONO,
    anchor = "start",
    bleed = true,
  } = {}
) {
  return `<text x="${r2(x)}" y="${r2(y)}" font-family="${family}" font-size="${size}" font-weight="${weight}"${
    tracking ? ` letter-spacing="${tracking}"` : ""
  } fill="${fill}" fill-opacity="${op}" text-anchor="${anchor}"${
    bleed ? ` filter="url(#bleed)"` : ""
  }>${esc(s)}</text>`;
}

// Convenience: a token from TYPE plus a position.
function typed(s, tokenName, { x, y, ...rest } = {}) {
  const t = TYPE[tokenName];
  return text(s, { x, y, size: t.size, weight: t.weight, tracking: t.tracking, family: t.family, ...rest });
}

// ── Receipt anatomy ─────────────────────────────────────────────────────────
// "ITEM ............ 12.99" — label left, value right, dotted leader between.
// The leader is a real dotted stroke, not typed periods, so it stays aligned at
// any width. 0.6em is Roboto Mono's advance.
const ADV = 0.6;
const monoWidth = (s, size) => s.length * ADV * size;

function row({ x, y, w, label, value, size = TYPE.row.size, op = FADE.read }) {
  const lw = monoWidth(label, size);
  const vw = monoWidth(value, size);
  const out = [text(label, { x, y, size, op })];
  const gapL = x + lw + 14;
  const gapR = x + w - vw - 14;
  if (gapR > gapL) {
    out.push(
      `<line x1="${r2(gapL)}" y1="${r2(y - size * 0.28)}" x2="${r2(gapR)}" y2="${r2(
        y - size * 0.28
      )}" stroke="${C.ink}" stroke-opacity="${r2(op * 0.5)}" stroke-width="2.4" stroke-dasharray="2 9" stroke-linecap="round"/>`
    );
  }
  out.push(text(value, { x: x + w, y, size, op, anchor: "end" }));
  return out.join("\n");
}

// Dashed separator, the way a receipt breaks sections.
function rule({ x, y, w, op = FADE.faint }) {
  return `<line x1="${r2(x)}" y1="${r2(y)}" x2="${r2(x + w)}" y2="${r2(
    y
  )}" stroke="${C.ink}" stroke-opacity="${op}" stroke-width="2.6" stroke-dasharray="10 10"/>`;
}

// A blacked-out value. Used instead of writing a figure we are not allowed to
// promise — the redaction IS the message, and it is doing compliance work.
function redact({ x, y, w, h = 34, op = 0.88, seed = 3 }) {
  const rand = rng(seed);
  const skew = (rand() - 0.5) * 0.8; // degrees — a marker stroke, not a rectangle
  return `<rect x="${r2(x)}" y="${r2(y - h + 6)}" width="${r2(w)}" height="${r2(
    h
  )}" fill="${C.bar}" fill-opacity="${op}" transform="rotate(${r2(skew)} ${r2(x + w / 2)} ${r2(y)})"/>`;
}

// Rows too faded to read: bars and leaders, never words.
//
// Language-free on purpose. An "illegible" row made of real English words
// silently ships an English frame inside the French pack — the exact bug class
// the app's i18n rule exists to prevent. Bars carry no language.
function ghostRows({ x, y, w, count, leading, seed = 30 }) {
  if (MODE === "content") return ""; // texture, not content
  const rand = rng(seed);
  const out = [];
  for (let i = 0; i < count; i++) {
    const ry = y + i * leading;
    const labelW = w * (0.28 + rand() * 0.3);
    const valueW = w * (0.09 + rand() * 0.05);
    const op = FADE.ghost + rand() * 0.07;
    out.push(
      `<rect x="${r2(x)}" y="${r2(ry)}" width="${r2(labelW)}" height="10" rx="2" fill="${C.ink}" fill-opacity="${r2(op)}"/>`,
      `<rect x="${r2(x + w - valueW)}" y="${r2(ry)}" width="${r2(valueW)}" height="10" rx="2" fill="${C.ink}" fill-opacity="${r2(op)}"/>`
    );
  }
  return out.join("\n");
}

// The illegible header every receipt starts with. Never a retailer name: this
// pack is store-agnostic by design, and naming one would drag the whole
// non-affiliation regime into a frame that is trying to describe a mechanic.
function ghostHeader({ x, y, w, seed = 12 }) {
  if (MODE === "content") return "";
  const rand = rng(seed);
  const out = [];
  for (let i = 0; i < 3; i++) {
    const bw = w * (0.34 + rand() * 0.34);
    out.push(
      `<rect x="${r2(x + (w - bw) / 2)}" y="${r2(y + i * 22)}" width="${r2(bw)}" height="${
        i === 0 ? 15 : 9
      }" rx="2" fill="${C.ink}" fill-opacity="${r2(FADE.ghost + (i === 0 ? 0.06 : 0))}"/>`
    );
  }
  return out.join("\n");
}

// ── The mark ──────────────────────────────────────────────────────────
// Ported 1:1 from the app's src/components/BrandMark.js and now living in
// ../../brand/mark.js — one copy for every pack, kept in sync with the app by
// hand, and gated by brand/verify-brand.js. `watermark()` comes with it: the
// mark at the one strength, solved from a contrast rather than written as an
// alpha. See brand/README.md § the watermark for what that fixes.
const { GLYPH_PATHS, glyph, watermark: brandWatermark } = require("../../brand/mark");

// The watermark can be switched off for one render. verify.js's watermark gate
// measures the mark by DIFFERENCE — it renders each frame with and without, and
// the largest per-pixel luminance change between the two IS the contrast the
// spec is written in. Sampling a fixed region instead would mean guessing where
// the glyph is and hoping no copy ever moves over it.
let WATERMARK_ON = true;
const setWatermark = (on) => {
  WATERMARK_ON = on;
};
const watermark = (opts) => (WATERMARK_ON ? brandWatermark(opts) : "");

// Footer lockup: mark, wordmark, handle. Every frame carries it — this pack is
// the permanent voice, so unlike the teaser it is allowed to sign its work.
function lockup({ x, y, handle, size = 42, on = "field" }) {
  const fill = on === "paper" ? C.ink : C.inkOnField;
  return [
    glyph({ x, y: y - size * 0.78, size, stroke: C.emerald, width: 2.9 }),
    typed("PriceBack", "mark", { x: x + size + 16, y, fill, op: 0.95, family: SANS }),
    typed(handle, "handle", { x: x + size + 16, y: y + 32, fill, op: 0.45 }),
  ].join("\n");
}

module.exports = {
  rng,
  esc,
  r2,
  setMode,
  isContentMode,
  defs,
  field,
  vignette,
  strip,
  text,
  typed,
  row,
  rule,
  redact,
  ghostRows,
  ghostHeader,
  glyph,
  watermark,
  setWatermark,
  lockup,
  ADV,
  monoWidth,
  GLYPH_PATHS,
};

// ────────────────────────────────────────────────────────────────────────────
// Community-pack additions
//
// Everything above this line is the evergreen surface, copied. Everything below
// is what this pack needed and that one had no vocabulary for.
// ────────────────────────────────────────────────────────────────────────────

const { COVER } = require("./tokens");

// ── The leaf ──────────────────────────────────────────────────────────
// One copy for every pack, in ../../brand/leaf.js, with the two reasons it is
// not the flag's leaf and the reason every curve in it is load-bearing.
const { leaf, LEAF_PATH } = require("../../brand/leaf");

// ── The fine print, on the art ──────────────────────────────────────────────
// Not a styling choice. legal/MARKETING_CLAIMS.md names the exact failure mode
// this defends against — "the slogan gets clipped into a banner / social-media
// card / marketing email without the fine print" — so on any frame in this pack
// that names a retailer, the non-affiliation line is IN THE PIXELS. A caption
// can be cropped out of a screenshot; a rendered line cannot.
//
// claims.js enforces the pairing: name a retailer without setting `fineprint`
// and the build fails.
function finePrint(lines, { x, y, colW, fill = C.inkOnField, op = 0.5, align = "start" }) {
  const t = TYPE.fineprint;
  const leading = t.size * t.leading;
  return lines
    .map((s, i) =>
      text(s, {
        x,
        y: y + i * leading,
        size: t.size,
        weight: t.weight,
        tracking: t.tracking,
        family: t.family,
        fill,
        op,
        anchor: align,
      })
    )
    .join("\n");
}

// ── The bilingual seam ──────────────────────────────────────────────────────
// A pair of stacked chevrons pointing down: "keep going, it continues below".
// Used on the carousel divider slide and the language-notice frames, which are
// the only places in this pack whose whole job is to point somewhere else.
//
// Two chevrons, not one and not three: one reads as a scroll hint the eye skips,
// three reads as a loading spinner. The trailing one is faded, which is what
// makes the pair read as a direction rather than as a bracket.
//
// `dir` matters more than it looks. A carousel is swiped SIDEWAYS and a
// Highlight is tapped FORWARD, but a feed caption and a story are read DOWNWARD
// — so a divider slide pointing down is telling the reader to do the one thing
// that will not get them to the French. The direction is a property of the
// surface the frame lands on, so it is authored per frame, not per pack.
function seamChevrons({ cx, cy, w = 96, gap = 46, stroke = C.emerald, width = 11, op = 1, dir = "down" }) {
  const arm = w / 2;
  const one = (off, o) => {
    const d =
      dir === "right"
        ? `M ${r2(cx + off)} ${r2(cy - arm)} L ${r2(cx + off + arm * 0.62)} ${r2(cy)} L ${r2(cx + off)} ${r2(cy + arm)}`
        : `M ${r2(cx - arm)} ${r2(cy + off)} L ${r2(cx)} ${r2(cy + off + arm * 0.62)} L ${r2(cx + arm)} ${r2(cy + off)}`;
    return `<path d="${d}" fill="none" stroke="${stroke}" stroke-opacity="${r2(o)}" stroke-width="${width}" stroke-linecap="round" stroke-linejoin="round"/>`;
  };
  return `<g>${one(0, op)}${one(gap, op * 0.4)}</g>`;
}

// ── The story progress bar, redrawn ──────────────────────────────────────
//
// The problem this solves. Every Highlight on this account runs
//
//     intro  ->  English  ->  the FR card  ->  French
//
// and a francophone who opens one and sees English has to be told, in frame
// one, where the French is. The old frame told them to "keep tapping", which is
// an instruction, not information: it asks a reader to spend an unknown number
// of taps on a language they do not read, on the word of an account they have
// just met.
//
// So the frame SHOWS them instead. Instagram draws one segment per frame across
// the top of a story, and it is on screen about sixty pixels above this. A
// replica of that bar, with the French half lit and the FR card marked, is read
// without a caption because the reader is already looking at the real one.
//
// Proportions are IG's (see brand/ig.js PROGRESS_BAR) but the scale is not: at
// the real 6px height this reads as a hairline rule rather than as the thing it
// is pointing at. Drawn at a height that is legible mid-frame and a gap that
// keeps the segment count countable, which is the property that matters — a
// reader should be able to see that the French half is HALF, not a footnote.
function progressReplica({ x, y, w, segments = 8, frAt = 4, h = 22, gap = 13, label = "FR" }) {
  const segW = (w - gap * (segments - 1)) / segments;
  const out = [];
  for (let i = 0; i < segments; i++) {
    const sx = x + i * (segW + gap);
    // Segment 0 is where the reader is standing. Everything from the FR card
    // on is lit, because that is the half being pointed at; the English
    // segments between are dim, which is what makes the pointing legible.
    const here = i === 0;
    const french = i >= frAt;
    const fill = here || french ? C.emerald : C.inkOnField;
    const op = here ? 0.95 : french ? 0.8 : 0.28;
    out.push(
      `<rect x="${r2(sx)}" y="${r2(y)}" width="${r2(segW)}" height="${h}" rx="${h / 2}" fill="${fill}" fill-opacity="${op}"/>`
    );
  }

  // The marker. A tick under the seam plus two letters, so the bar names the
  // card rather than merely colouring it.
  const mx = x + frAt * (segW + gap) + segW / 2;
  out.push(
    `<path d="M ${r2(mx)} ${r2(y + h + 10)} L ${r2(mx - 11)} ${r2(y + h + 30)} L ${r2(mx + 11)} ${r2(
      y + h + 30
    )} Z" fill="${C.emerald}" fill-opacity="0.9"/>`,
    text(label, {
      x: mx,
      y: y + h + 68,
      size: TYPE.kicker.size + 8,
      weight: 500,
      tracking: 5,
      family: MONO,
      fill: C.emerald,
      op: 0.95,
      anchor: "middle",
    })
  );
  return out.join("\n");
}

// ── The Highlight cover ground ──────────────────────────────────────────────
// The cover is authored on the full 1080x1920 canvas because that is what the
// picker accepts cleanly, but only a centred circle survives IG's crop chain
// (square crop -> circular mask -> 161px). So the art draws its own disc: the
// frame outside it is never seen in the Highlight tray, and drawing the disc
// explicitly is what makes the cover previewable — you can look at the PNG and
// see exactly what the ring will show.
//
// The thin emerald ring sits just inside the safe circle rather than on the
// crop edge, because Instagram's own selection ring lands on the crop edge and
// two concentric rings a few pixels apart read as a rendering fault.
function coverDisc({ ring = true } = {}) {
  if (MODE === "content") return "";
  const { cx, cy, d } = COVER.crop;
  // The grain is applied to a RECT CLIPPED to the disc, never to the circle
  // itself. #grain is a feTurbulence chain that ignores SourceGraphic and paints
  // across the whole filter REGION — which for a circle is its bounding box, so
  // filtering the circle directly lays a noise SQUARE over the frame. This is
  // the same defect the tooth filter hit on rotated strips (see #tooth above);
  // there the fix was compositing against SourceAlpha, here it is a clip.
  return `
  <defs>
    <clipPath id="coverClip"><circle cx="${cx}" cy="${cy}" r="${d / 2}"/></clipPath>
    <!-- The disc has to READ as a disc in a tray of eight, sitting next to
         whatever the next account's cover is. The field gradient alone is too
         close to the dimmed surround once the whole thing is 161px across, so
         the disc gets a centred lift: more green in the middle, falling to
         nothing at the rim. -->
    <radialGradient id="coverLift" cx="0.5" cy="0.42" r="0.72">
      <stop offset="0" stop-color="#123a2b" stop-opacity="0.95"/>
      <stop offset="0.62" stop-color="#0c2a20" stop-opacity="0.55"/>
      <stop offset="1" stop-color="#071410" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <circle cx="${cx}" cy="${cy}" r="${d / 2}" fill="url(#fieldGrad)"/>
  <circle cx="${cx}" cy="${cy}" r="${d / 2}" fill="url(#coverLift)"/>
  <g clip-path="url(#coverClip)"><rect x="${cx - d / 2}" y="${cy - d / 2}" width="${d}" height="${d}" filter="url(#grain)"/></g>${
    ring
      ? `
  <circle cx="${cx}" cy="${cy}" r="${COVER.ring.r}" fill="none" stroke="${C.emerald}" stroke-opacity="${COVER.ring.op}" stroke-width="${COVER.ring.width}"/>`
      : ""
  }`;
}

Object.assign(module.exports, { leaf, LEAF_PATH, finePrint, seamChevrons, coverDisc, progressReplica });
