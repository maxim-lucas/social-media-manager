// The PriceBack mark, and the one watermark spec every pack uses.
//
// GLYPH_PATHS is ported 1:1 from the app's src/components/BrandMark.js
// (0 0 48 48 grid): a receipt with a torn bottom edge whose contents are a
// falling price line resolving into a down-right arrowhead. There is no build
// step between an Expo app and an SVG renderer, so it is kept in sync BY HAND.
// If the app's glyph changes, change it here — this is now the only copy in
// this repo, which is the point.

const { C, luminance } = require("./palette");

const r2 = (n) => Math.round(n * 100) / 100;

const GLYPH_PATHS = [
  "M13 9 H35 V34 L32 37 L29 34 L26 37 L23 34 L20 37 L17 34 L14 37 L13 36 Z",
  "M17 16 L21.5 20.5 L25.5 17 L31 27",
  "M31 27 L27.4 26 M31 27 L31.7 23.2",
];

/** The mark as a stroked glyph, drawn into a `size`-wide box at (x, y). */
function glyph({ x, y, size = 48, stroke = C.emerald, width = 2.6, glowOn = false, op = 1 }) {
  const s = size / 48;
  return `<g transform="translate(${r2(x)} ${r2(y)}) scale(${r2(s)})" fill="none" stroke="${stroke}"
        stroke-width="${r2(width / s)}" stroke-linecap="round" stroke-linejoin="round"${
    op !== 1 ? ` stroke-opacity="${r2(op)}"` : ""
  }${glowOn ? ' filter="url(#glow)"' : ""}>${GLYPH_PATHS.map((d) => `<path d="${d}"/>`).join("")}</g>`;
}

// ── The watermark ───────────────────────────────────────────────────────────
//
// The defect this exists to fix, measured on the shipped PNGs before it did:
//
//   story frames   the mark at `opacity 0.09`, peaking at L=38 against a field
//                  of L=19. A delta of 19 on a 255 scale. Visible on a monitor
//                  in a dark room; gone on a phone in daylight.
//   feed frames    a completely different treatment — a 172px emeraldDeep
//                  stamp at FULL opacity on pale paper, delta ~139.
//
// Two marks, seven times apart in strength, both described in their own source
// as "the mark, faint". Neither author was careless: they were writing an
// ALPHA, and an alpha is not a strength. 0.09 over near-black and 1.0 over pale
// paper are not two settings of one dial, they are two different dials.
//
// So the spec is a CONTRAST, and the alpha is solved from it:
//
//     deltaL = alpha * |luminance(mark) - luminance(ground)|
//
// One number — WATERMARK.deltaL — now means the same thing on every ground,
// and each pack's verify.js asserts the rendered result lands in the band. A
// watermark that is invisible fails, and so does one that shouts.
const WATERMARK = {
  // Target luminance delta over the local ground, and the band a rendered
  // frame must land in. 34 is set by eye against the two failures it sits
  // between: at 19 (the old story mark) the glyph is not there on a phone, and
  // at 139 (the old paper stamp) it competes with the print it sits under.
  deltaL: 34,
  band: [26, 46],

  // A watermark must never be the loudest thing on a frame. On a story it sits
  // under a poll or question sticker the operator adds in the app, and on a
  // post it sits under the receipt's own print.
  onField: { colour: C.emeraldGlow, size: 460, width: 2.4 },
  onPaper: { colour: C.emeraldDeep, size: 172, width: 3.1, rotate: -7 },
};

/** The alpha that renders `colour` at `deltaL` over `ground`. */
function solveOpacity(colour, ground, deltaL = WATERMARK.deltaL) {
  const spread = Math.abs(luminance(colour) - luminance(ground));
  if (spread < 1) return 1; // no contrast available; nothing to solve
  return Math.min(1, deltaL / spread);
}

/**
 * The mark as a watermark, at the one strength.
 *
 * `on` picks the ground: "field" is the dark gradient, "paper" the lit strip.
 * `ground` overrides the assumed ground colour for an unusual placement.
 *
 * Returned as a <g> with a solved `opacity`, not a stroke-opacity, so the
 * whole glyph fades as one object — three overlapping strokes each at 0.22
 * would show their overlaps as brighter seams.
 */
function watermark({ x, y, on = "field", ground = null, size = null, rotate = null }) {
  const spec = on === "paper" ? WATERMARK.onPaper : WATERMARK.onField;
  const groundColour = ground || (on === "paper" ? C.paper : C.field);
  const op = solveOpacity(spec.colour, groundColour);
  const s = size || spec.size;
  const rot = rotate === null ? spec.rotate || 0 : rotate;

  const g = glyph({ x, y, size: s, stroke: spec.colour, width: spec.width });
  const body = rot ? `<g transform="rotate(${r2(rot)} ${r2(x + s / 2)} ${r2(y + s / 2)})">${g}</g>` : g;
  return `<g opacity="${r2(op)}">${body}</g>`;
}

module.exports = { GLYPH_PATHS, glyph, watermark, solveOpacity, WATERMARK, r2 };
