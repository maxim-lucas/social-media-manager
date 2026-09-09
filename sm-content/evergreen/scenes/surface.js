// Evergreen pack — SVG primitives: a strip of thermal paper on a dark field.
//
// Every scene is one SVG string rendered to PNG by sharp/librsvg. Anything
// librsvg does not support (CSS layout, webfonts, blend modes beyond the basic
// filter set) is deliberately absent: the renderer has no browser.
//
// All randomness is seeded. A copy change must not reshuffle every torn edge
// and produce a spurious diff on all 38 assets.
//
// Self-contained on purpose. It would be a two-line change to import the
// teaser pack's paper.js instead, and then a copy tweak in the teaser would
// silently re-render this pack. Each pack owns its own surface.

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
// mark at one strength, specified as a contrast rather than as an alpha.
const { GLYPH_PATHS, glyph, watermark } = require("../../brand/mark");

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
  lockup,
  ADV,
  monoWidth,
  GLYPH_PATHS,
};
