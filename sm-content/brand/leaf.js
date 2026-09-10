// The maple leaf. One copy, imported by any pack that needs it.
//
// ── Why the first one was wrong ────────────────────────────────────────────
//
// The version this replaces was a smooth Bézier blob with eleven bumps and no
// stem. Its own comment argued that curves were what stopped it reading as a
// star — "a maple leaf built from straight segments between evenly-spaced
// points is a STAR" — and the diagnosis was right while the fix was not. What
// makes a shape read as a maple leaf is not curvature. It is:
//
//   1. THREE LOBES, not eleven rays. A top lobe and two arms.
//   2. TWO DEEP SINUSES per side, cutting almost back to the axis, which is
//      what separates the three lobes.
//   3. SHALLOW serrations on each lobe. When the notches between points are as
//      deep as the points are long, the eye counts eleven equal rays and reads
//      a star. That is the actual failure, and it happens with curves too.
//   4. A STEM. The old one had none, and a maple leaf without a petiole reads
//      as an ornament.
//
// So this is built the way the flag's leaf is built: straight segments between
// eleven points and twelve notches, mirrored about x = 50, with a stem. It was
// drawn, rendered at 420 / 161 / 64 px, and corrected four times — the small
// sizes are the ones that decide it, because this has to survive a Highlight
// cover and a grid thumbnail.
//
// ── What is deliberately NOT the flag ──────────────────────────────────────
//
// The COLOUR. C.leaf is a muted brick, never the flag's #FF0000. Two reasons
// and they agree: pure red beside emerald on a near-black field vibrates on an
// OLED phone, and an emblem that reads as the official flag on a commercial
// frame invites the "official endorsement" reading — exactly the impression a
// made-in-Canada claim must not create. This is recognisably a maple leaf and
// recognisably a drawing, which is the correct place to land.

const { C } = require("./palette");

const r2 = (n) => Math.round(n * 100) / 100;

// The right half, clockwise from the top tip down to the stem shoulder.
// x = 50 is the axis of symmetry, y runs downward, the grid is 0 0 100 100.
// Eleven points: the tip, five per side. Twelve notches. Two of the notches per
// side are the deep sinuses, and they are the whole shape.
const HALF = [
  [50.0, 1.0],   // 1  top tip
  [56.2, 17.5],  //    notch
  [61.5, 12.5],  // 2  top-lobe flanking point
  [58.0, 33.0],  //    DEEP sinus — the innermost point on this side
  [70.0, 27.0],  // 3  arm, upper point
  [74.5, 34.0],  //    shallow notch
  [98.0, 40.0],  // 4  arm tip, the widest point of the leaf
  [80.5, 47.0],  //    shallow notch
  [86.0, 53.0],  // 5  arm, lower point
  [63.5, 57.5],  //    DEEP sinus
  [70.0, 67.5],  // 6  basal point
  [54.0, 69.5],  //    stem shoulder
];

// Short and stubby, as the flag's is. An earlier draft ran it to y=98 at half
// the width and the leaf read as a lollipop.
const STEM = { halfW: 4.0, bottom: 96.0 };

function buildPath(half = HALF, stem = STEM) {
  const mirror = ([x, y]) => [100 - x, y];
  const pts = [
    ...half,
    [50 + stem.halfW, stem.bottom],
    [50 - stem.halfW, stem.bottom],
    ...[...half].reverse().map(mirror),
  ];
  return `${pts.map(([x, y], i) => `${i === 0 ? "M" : "L"} ${x} ${y}`).join(" ")} Z`;
}

const LEAF_PATH = buildPath();

/**
 * The leaf, scaled into a `size`-wide box at (x, y).
 *
 * Filled by default. An OUTLINED maple leaf below about 150px is not a leaf, it
 * is a red splat: an outline gives every serration the same weight as the empty
 * space between them, and the silhouette is the whole identity of this shape.
 */
function leaf({ x, y, size = 120, fill = C.leaf, op = 0.95, stroke = null, width = 3 }) {
  const s = size / 100;
  return `<g transform="translate(${r2(x)} ${r2(y)}) scale(${r2(s)})">
    <path d="${LEAF_PATH}" fill="${stroke ? "none" : fill}" fill-opacity="${stroke ? 0 : op}"${
    stroke ? ` stroke="${stroke}" stroke-opacity="${op}" stroke-width="${r2(width / s)}" stroke-linejoin="round"` : ""
  }/></g>`;
}

module.exports = { LEAF_PATH, leaf, HALF, STEM, buildPath };
