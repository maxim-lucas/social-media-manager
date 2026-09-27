// The maple leaf. One copy, imported by any pack that needs it.
//
// ── What it is now ─────────────────────────────────────────────────────────
//
// The real Canadian maple leaf: the silhouette the owner supplied as the
// reference (a "Made in Canada" roundel, businessnow.ca, 2026-09-26), traced
// and rebuilt as clean vector. The two drawings before it were stylised — an
// eleven-bump Bézier blob, then an eleven-point straight-segment leaf with a
// stubby stem — and both were deliberately NOT the real leaf. The owner asked
// for the real one, so that reasoning is retired rather than argued with.
//
// How it was built, so it can be rebuilt:
//
//   1. The reference's red was thresholded, the white text inside it filled,
//      and the field averaged with its own mirror image about x = 449 px. The
//      source is a few pixels off-symmetric, and tracing it raw gave doubled
//      points at every tip.
//   2. potrace, on a 6x upscale, gave a dense outline.
//   3. That outline was refitted: straight lines between the corners (the
//      corner = the intersection of the two fitted edges), and one cubic per
//      curved notch, least-squares against the traced points.
//
// Laid back over the reference it covers 98% of the same pixels; the rest is
// the reference's own asymmetry, which a mirrored leaf cannot follow.
//
// The anatomy that makes it read as THE leaf rather than a leaf: straight
// edges running into curved notches, two deep rounded sinuses cutting almost to
// the axis, the widest point low on the arms, and a long thin stem that
// narrows toward the blade.

const { C } = require("./palette");

const r2 = (n) => Math.round(n * 100) / 100;

// The right half, clockwise from the top tip to the foot of the stem, in a
// 0 0 100 100 box with x = 50 the axis. A segment with c1/c2 is a cubic; one
// without is a straight line. The leaf spans x 4.92-95.08, y -0.24-99.99.
const START = [50, -0.24];
const HALF = [
  { to: [57.96, 16.92] }, //                                              top lobe, outer edge
  { c1: [64.09, 16.82], c2: [67.75, 12.14], to: [69.18, 12.7] }, //       notch up to the side point
  { to: [62.88, 37.96] }, //                                              down into the sinus
  { c1: [63.18, 39.94], c2: [65.26, 41.1], to: [66.87, 39.77] }, //       the sinus, rounded
  { to: [78.34, 27.63] }, //                                              up to the arm's top point
  { to: [81.89, 35.19] }, //
  { c1: [84.63, 35.54], c2: [89.5, 34.05], to: [94.0, 33.08] }, //        notch out to the arm point
  { to: [90.83, 42.74] }, //
  { c1: [88.86, 46.64], c2: [91.74, 50.37], to: [95.08, 50.96] }, //      notch to the widest point
  { to: [72.8, 70.1] }, //                                                the long lower edge
  { c1: [72.04, 73.65], c2: [74.91, 76.42], to: [75.61, 79.52] }, //      down to the basal point
  { c1: [67.57, 79.52], c2: [59.95, 75.76], to: [52.62, 75.8] }, //       the base, curving in
  { to: [51.13, 79.26] }, //                                              the stem's shoulder
  { to: [52.4, 99.99] }, //                                               the stem, widening down
  { to: [50, 99.99] },
];

function buildPath(start = START, half = HALF) {
  const m = ([x, y]) => [r2(100 - x), y];
  const pts = [start, ...half.map((s) => s.to)];
  let d = `M ${start.join(" ")}`;
  for (const s of half) d += s.c1 ? ` C ${s.c1.join(" ")} ${s.c2.join(" ")} ${s.to.join(" ")}` : ` L ${s.to.join(" ")}`;
  // The left half is the right half walked backwards and mirrored, so the two
  // can never drift apart.
  for (let i = half.length - 1; i >= 0; i--) {
    const s = half[i];
    const from = m(pts[i]);
    d += s.c1 ? ` C ${m(s.c2).join(" ")} ${m(s.c1).join(" ")} ${from.join(" ")}` : ` L ${from.join(" ")}`;
  }
  return `${d} Z`;
}

const LEAF_PATH = buildPath();

// Filter ids come from the arguments, not a counter: the same leaf in the same
// place renders byte-identical SVG no matter how many frames were built before
// it in the same process, which is what keeps a re-render a no-op.
function idFor(parts) {
  let h = 2166136261;
  for (const ch of parts.join("|")) h = Math.imul(h ^ ch.charCodeAt(0), 16777619) >>> 0;
  return `leaf${h.toString(36)}`;
}

/**
 * The leaf, scaled into a `size`-wide box at (x, y), blended into its ground.
 *
 *   ground "field"  the dark story field. Lit from the upper left like the
 *                   paper strips, deepening to leafDeep toward the stem, with
 *                   a faint grain matching the field's own and a low red bloom
 *                   so the edge sits IN the frame instead of on it.
 *   ground "paper"  printed into a receipt. Multiplied, so it takes the paper's
 *                   own light and shadow; the ink is broken by a fine grain and
 *                   the edge nudged a fraction off-true, the way a stamp leaves
 *                   it. Displacement stays at 1.2 units: at 4 the stem visibly
 *                   bent, and the form is the one thing that must not move.
 *   ground "flat"   a plain fill, for anywhere a treatment would be noise.
 *
 * `stroke` draws an outline instead. Below about 150px an outlined maple leaf
 * is a red splat — the silhouette is the whole identity of this shape.
 */
function leaf({ x, y, size = 120, fill = C.leaf, deep = C.leafDeep, op = 0.95, ground = "field", stroke = null, width = 3 }) {
  const s = size / 100;
  const shape = `<g transform="translate(${r2(x)} ${r2(y)}) scale(${r2(s)})"><path d="${LEAF_PATH}"/></g>`;

  if (stroke) {
    return `<g fill="none" stroke="${stroke}" stroke-opacity="${op}" stroke-width="${r2(width / s)}" stroke-linejoin="round">${shape}</g>`;
  }
  if (ground === "flat") {
    return `<g fill="${fill}" fill-opacity="${op}">${shape}</g>`;
  }

  const id = idFor([ground, r2(x), r2(y), r2(size), fill, deep, op]);

  if (ground === "paper") {
    return `<defs>
    <filter id="${id}" x="-5%" y="-5%" width="110%" height="110%" color-interpolation-filters="sRGB">
      <feTurbulence type="fractalNoise" baseFrequency="0.55" numOctaves="3" seed="11" result="n"/>
      <feColorMatrix in="n" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 -1.5 1.55" result="grain"/>
      <feComposite in="SourceGraphic" in2="grain" operator="in" result="inked"/>
      <feTurbulence type="fractalNoise" baseFrequency="0.02" numOctaves="1" seed="4" result="warp"/>
      <feDisplacementMap in="inked" in2="warp" scale="1.2" xChannelSelector="R" yChannelSelector="G"/>
    </filter></defs>
    <g style="mix-blend-mode:multiply" opacity="${op}"><g filter="url(#${id})" fill="${fill}">${shape}</g></g>`;
  }

  return `<defs>
    <linearGradient id="${id}g" x1="0" y1="0" x2="0.55" y2="1">
      <stop offset="0" stop-color="${fill}"/><stop offset="1" stop-color="${deep}"/></linearGradient>
    <filter id="${id}b" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="${r2(size * 0.07)}"/></filter>
    <filter id="${id}t" x="0" y="0" width="100%" height="100%" color-interpolation-filters="sRGB">
      <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed="2" result="n"/>
      <feColorMatrix in="n" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 0.5 -0.15" result="g"/>
      <feComposite in="g" in2="SourceAlpha" operator="in" result="gi"/>
      <feFlood flood-color="#000"/><feComposite in2="gi" operator="in" result="dark"/>
      <feMerge><feMergeNode in="SourceGraphic"/><feMergeNode in="dark"/></feMerge>
    </filter></defs>
    <g opacity="${r2(op * 0.28)}" fill="${fill}" filter="url(#${id}b)">${shape}</g>
    <g opacity="${op}" fill="url(#${id}g)" filter="url(#${id}t)">${shape}</g>`;
}

module.exports = { LEAF_PATH, leaf, HALF, START, buildPath };
