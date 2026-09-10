// Teaser pack — SVG primitives for "printed on thermal paper".
//
// Every scene is one SVG string rendered to PNG by sharp/librsvg. Anything
// librsvg does not support (CSS layout, webfonts, blend modes beyond the basic
// filter set) is deliberately absent: the renderer has no browser.
//
// All randomness is seeded so a re-render is byte-comparable. Nothing here
// samples Math.random().

const { C, FADE, MONO, TYPE } = require("./tokens");

// ── Determinism ─────────────────────────────────────────────────────────────
// mulberry32. Same seed in, same paper out — a copy change must not reshuffle
// the torn edges and produce a spurious diff on every asset.
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
  String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

const r2 = (n) => Math.round(n * 100) / 100;

// ── Shared defs ─────────────────────────────────────────────────────────────
// Paper tooth + thermal scan-lines. Two separate filters composited as two
// full-bleed rects: librsvg will not chain them through one filter reliably.
function defs(seed = 1) {
  return `
  <defs>
    <linearGradient id="paperGrad" x1="0" y1="0" x2="0.15" y2="1">
      <stop offset="0" stop-color="${C.paperTop}"/>
      <stop offset="1" stop-color="${C.paperBottom}"/>
    </linearGradient>

    <linearGradient id="groundGrad" x1="0" y1="0" x2="0.3" y2="1">
      <stop offset="0" stop-color="${C.ground}"/>
      <stop offset="1" stop-color="${C.groundDeep}"/>
    </linearGradient>

    <!-- Soft falloff under a torn edge, so the paper reads as lifting off the
         surface rather than being printed onto it. -->
    <filter id="tearShade" x="-10%" y="-30%" width="120%" height="180%">
      <feGaussianBlur stdDeviation="9"/>
    </filter>

    <!-- Fine paper tooth. -->
    <filter id="tooth" x="0" y="0" width="100%" height="100%">
      <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="4" seed="${seed}"/>
      <feColorMatrix type="matrix"
        values="0 0 0 0 0.35  0 0 0 0 0.33  0 0 0 0 0.30  0 0 0 0.26 0"/>
    </filter>

    <!-- Horizontal streaking: how a thermal head actually prints. -->
    <filter id="thermal" x="0" y="0" width="100%" height="100%">
      <feTurbulence type="turbulence" baseFrequency="0.03 0.85" numOctaves="3" seed="${seed + 4}"/>
      <feColorMatrix type="matrix"
        values="0 0 0 0 0.22  0 0 0 0 0.21  0 0 0 0 0.19  0 0 0 0.10 0"/>
    </filter>

    <!-- Ink bleed: softens type just enough to read as printed, not set. -->
    <filter id="bleed" x="-6%" y="-6%" width="112%" height="112%">
      <feGaussianBlur stdDeviation="0.55"/>
    </filter>

    <!-- Marker ink: a light wobble so the hand-drawn circle is not a clean path. -->
    <filter id="markerInk" x="-10%" y="-30%" width="120%" height="160%">
      <feTurbulence type="fractalNoise" baseFrequency="0.02 0.06" numOctaves="2" seed="${seed + 6}" result="mn"/>
      <feDisplacementMap in="SourceGraphic" in2="mn" scale="7" xChannelSelector="R" yChannelSelector="G"/>
    </filter>

    <!-- Rubber stamp: uneven ink coverage, so the emerald never looks vector. -->
    <filter id="stampInk" x="-15%" y="-15%" width="130%" height="130%">
      <feTurbulence type="fractalNoise" baseFrequency="0.35" numOctaves="3" seed="${seed + 9}" result="n"/>
      <feDisplacementMap in="SourceGraphic" in2="n" scale="4" xChannelSelector="R" yChannelSelector="G"/>
    </filter>
  </defs>`;
}

// ── Render mode ─────────────────────────────────────────────────────────────
// "full" draws the finished frame. "content" suppresses the paper and the torn
// edges, leaving a transparent canvas carrying only what a reader is meant to
// read.
//
// This is the seam verify.js needs. Checking safe zones by luminance does not
// work here: the surface revealed by a tear is darker than the paper but
// lighter than ink, and a faded kicker lands on the same luminance as that
// surface — so no threshold separates "print" from "decoration". With the
// decoration gone, content is exactly the set of non-transparent pixels, and
// the safe-zone gate becomes an alpha test with no judgement in it.
let MODE = "full";
const setMode = (m) => {
  MODE = m;
};
const isContentMode = () => MODE === 'content';

// Full-bleed paper. Call once per scene, first.
function paper(w, h) {
  if (MODE === "content") return "";
  return `
  <rect width="${w}" height="${h}" fill="url(#paperGrad)"/>
  <rect width="${w}" height="${h}" filter="url(#thermal)"/>
  <rect width="${w}" height="${h}" filter="url(#tooth)"/>`;
}

// ── Torn edge ───────────────────────────────────────────────────────────────
// A receipt is torn off a roll, never cut. `side` is "top" or "bottom"; the
// zig-zag eats into the frame so the paper reads as a fragment, not a page.
function tornEdge({ w, h, side = "bottom", depth = 34, step = 46, seed = 7 }) {
  if (MODE === "content") return ""; // decoration, not content — see setMode
  const rand = rng(seed);
  const pts = [];
  for (let x = 0; x <= w + step; x += step) {
    const jitterX = (rand() - 0.5) * step * 0.35;
    const jitterY = rand() * depth;
    pts.push([Math.min(w, Math.max(0, x + jitterX)), jitterY]);
  }
  const base = side === "bottom" ? h : 0;
  const dir = side === "bottom" ? -1 : 1;
  const line = pts
    .map(([x, y], i) => `${i === 0 ? "M" : "L"} ${r2(x)} ${r2(base + dir * (depth - y))}`)
    .join(" ");
  // Fill outward from the zig-zag to the frame edge: cut the paper away and
  // show the surface underneath. The shadow is drawn twice — a soft wide one
  // for the lift, a tight dark one for the cut itself.
  const close = side === "bottom" ? `L ${w} ${h} L 0 ${h} Z` : `L ${w} 0 L 0 0 Z`;
  return `
  <path d="${line} ${close}" fill="url(#groundGrad)"/>
  <path d="${line}" fill="none" stroke="${C.tearShadow}" stroke-width="16"
        stroke-opacity="0.45" filter="url(#tearShade)"/>
  <path d="${line}" fill="none" stroke="${C.tearShadow}" stroke-width="2.5" stroke-opacity="0.55"/>`;
}

// ── Text ────────────────────────────────────────────────────────────────────
// One entry point so tracking, weight and the ink-bleed filter stay consistent.
// `op` is opacity: how faded this line of print is.
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
    anchor = "start",
    bleed = true,
  } = {}
) {
  return `<text x="${r2(x)}" y="${r2(y)}" font-family="${MONO}" font-size="${size}" font-weight="${weight}"${
    tracking ? ` letter-spacing="${tracking}"` : ""
  } fill="${fill}" fill-opacity="${op}" text-anchor="${anchor}"${
    bleed ? ` filter="url(#bleed)"` : ""
  }>${esc(s)}</text>`;
}

// Several lines sharing a left edge and a leading.
function lines(arr, { x, y, leading, ...rest }) {
  return arr.map((s, i) => text(s, { x, y: y + i * leading, ...rest })).join("\n");
}

// ── Receipt anatomy ─────────────────────────────────────────────────────────

// "ITEM NAME .............. 12.99" — label left, value right, dotted leader
// bridging them. The leader is a real dotted stroke, not typed periods, so it
// stays aligned at any width. 0.6em is Roboto Mono's advance width.
function row({
  x,
  y,
  w,
  label,
  value,
  op = FADE.read,
  size = TYPE.row.size,
  weight = 400,
  leader = true,
}) {
  const adv = size * 0.6;
  const gapStart = x + label.length * adv + 14;
  const gapEnd = x + w - String(value).length * adv - 14;
  const dots =
    leader && gapEnd > gapStart
      ? `<line x1="${r2(gapStart)}" y1="${r2(y - size * 0.28)}" x2="${r2(gapEnd)}" y2="${r2(
          y - size * 0.28
        )}" stroke="${C.ink}" stroke-opacity="${op * 0.55}" stroke-width="2.4" stroke-dasharray="2 9" stroke-linecap="round"/>`
      : "";
  return `${text(label, { x, y, size, weight, op })}
  ${dots}
  ${text(value, { x: x + w, y, size, weight, op, anchor: "end" })}`;
}

// Dashed separator, the way a receipt breaks sections.
function rule({ x, y, w, op = FADE.faint }) {
  return `<line x1="${r2(x)}" y1="${r2(y)}" x2="${r2(x + w)}" y2="${r2(
    y
  )}" stroke="${C.ink}" stroke-opacity="${op}" stroke-width="2.6" stroke-dasharray="10 10"/>`;
}

// A blacked-out value. Used instead of writing a number we are not allowed to
// promise — the redaction IS the message.
function redact({ x, y, w, h = 34, op = 0.86, seed = 3 }) {
  const rand = rng(seed);
  const skew = (rand() - 0.5) * 0.7; // degrees — a marker stroke, not a rectangle
  return `<rect x="${r2(x)}" y="${r2(y - h + 6)}" width="${r2(w)}" height="${r2(
    h
  )}" fill="${C.ink}" fill-opacity="${op}" transform="rotate(${r2(skew)} ${r2(
    x + w / 2
  )} ${r2(y)})"/>`;
}

// The illegible header every receipt starts with. Deliberately unreadable:
// naming a retailer in a teaser would drag the whole non-affiliation and
// price-claim regime into a frame that is trying to say nothing.
function ghostHeader({ x, y, w, seed = 12 }) {
  // Texture, not content: bars carrying no information. Excluded from the
  // safe-zone gate for the same reason the paper itself is.
  if (MODE === 'content') return '';
  const rand = rng(seed);
  return [0.55, 0.78, 0.42, 0.66]
    .map((f, i) => {
      const lw = w * f * (0.85 + rand() * 0.3);
      return `<rect x="${r2(x)}" y="${r2(y + i * 30)}" width="${r2(
        lw
      )}" height="9" fill="${C.ink}" fill-opacity="${r2(FADE.ghost + rand() * 0.05)}" rx="2"/>`;
    })
    .join("\n");
}

// ── Marks ───────────────────────────────────────────────────────────────────

// Hand-drawn circle around a line of text.
//
// Traced as a stadium — straight runs top and bottom, semicircular caps — not
// as an ellipse. Circling a wide line of text with an ellipse gives pointed
// lens-shaped ends that read as a vector shape; a hand keeps the sides parallel
// and turns only at the ends. Two passes, the second overshooting past the
// start, because a marker always doubles back.
function circleMark({ cx, cy, rx, ry, rotate = -4, op = 0.9, width = 7, seed = 21 }) {
  const rand = rng(seed);

  // Point at parameter t (0..1) along a stadium of half-width rx, half-height ry.
  const at = (t, RX, RY) => {
    const straight = Math.max(0, RX - RY);
    const capLen = Math.PI * RY;
    const per = 4 * straight + 2 * capLen;
    let d = (t % 1) * per;
    if (d < 2 * straight) return [-straight + d, -RY]; // top, L to R
    d -= 2 * straight;
    if (d < capLen) {
      const a = -Math.PI / 2 + (d / capLen) * Math.PI; // right cap
      return [straight + Math.cos(a) * RY, Math.sin(a) * RY];
    }
    d -= capLen;
    if (d < 2 * straight) return [straight - d, RY]; // bottom, R to L
    d -= 2 * straight;
    const a = Math.PI / 2 + (d / capLen) * Math.PI; // left cap
    return [-straight + Math.cos(a) * RY, Math.sin(a) * RY];
  };

  const stroke = (grow, start, turns) => {
    const RX = rx * grow;
    const RY = ry * grow;
    const steps = 64;
    const pts = [];
    for (let i = 0; i <= steps * turns; i++) {
      const t = start + i / steps;
      const [px, py] = at(t, RX, RY);
      const wob = 1 + (rand() - 0.5) * 0.045;
      pts.push([cx + px * wob, cy + py * wob]);
    }
    return pts.map(([px, py], i) => `${i === 0 ? "M" : "L"} ${r2(px)} ${r2(py)}`).join(" ");
  };

  return `<g transform="rotate(${rotate} ${r2(cx)} ${r2(
    cy
  )})" fill="none" stroke="${C.emerald}" stroke-opacity="${op}" stroke-width="${width}"
     stroke-linecap="round" stroke-linejoin="round" filter="url(#markerInk)">
    <path d="${stroke(1, 0.02, 1.08)}"/>
    <path d="${stroke(1.03, 0.12, 0.42)}" stroke-opacity="${r2(op * 0.5)}" stroke-width="${r2(width * 0.75)}"/>
  </g>`;
}

// ── Brand glyph ─────────────────────────────────────────────────────────────
// The geometry now lives once, in ../../brand/mark.js, ported from the app's
// PriceBack/src/components/BrandMark.js (viewBox 0 0 48 48) and gated by
// brand/verify-brand.js. Only the PATHS are shared: this pack draws the mark as
// a rubber stamp with a rounded frame and displaced ink, which is its own
// treatment and stays here. The shape is a fact; the stamp is a choice.
const { GLYPH_PATHS } = require("../../brand/mark");

// The mark as an emerald rubber stamp: rounded frame, mark inside, rotated
// off-register, ink unevenly displaced. Glyph only — never the wordmark. The
// name is the thing the teaser is withholding.
function stamp({ x, y, size = 210, rotate = -7, op = 0.82 }) {
  const s = size / 48;
  const pad = size * 0.16;
  const box = size + pad * 2;
  return `<g transform="translate(${r2(x)} ${r2(
    y
  )}) rotate(${rotate})" filter="url(#stampInk)" opacity="${op}">
    <rect x="0" y="0" width="${r2(box)}" height="${r2(box)}" rx="${r2(box * 0.2)}"
          fill="none" stroke="${C.emeraldDeep}" stroke-width="${r2(size * 0.045)}"/>
    <g transform="translate(${r2(pad)} ${r2(pad)}) scale(${r2(s)})" fill="none"
       stroke="${C.emeraldDeep}" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round">
      ${GLYPH_PATHS.map((d) => `<path d="${d}"/>`).join("\n      ")}
    </g>
  </g>`;
}

// Sequence tick, bottom-left of every feed post: tells the audience this is a
// series with an end, which is what makes them wait for the next one.
function seqTick({ x, y, n, total }) {
  return text(`${String(n).padStart(2, "0")} / ${String(total).padStart(2, "0")}`, {
    x,
    y,
    size: TYPE.micro.size,
    tracking: TYPE.micro.tracking,
    op: FADE.mid,
  });
}

// ── Frame ───────────────────────────────────────────────────────────────────
function svg(w, h, body, seed = 1) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">
${defs(seed)}
${paper(w, h)}
${body}
</svg>`;
}

module.exports = {
  setMode,
  isContentMode,
  rng,
  esc,
  r2,
  defs,
  paper,
  tornEdge,
  text,
  lines,
  row,
  rule,
  redact,
  ghostHeader,
  circleMark,
  stamp,
  seqTick,
  svg,
  GLYPH_PATHS,
};
