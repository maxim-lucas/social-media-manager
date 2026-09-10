// The Highlight-cover icon set, and the normalisation that keeps it even.
//
// ── The defect this file exists to prevent ─────────────────────────────────
//
// The first cover set declared a 440px icon box and then drew inside it at
// whatever size each path happened to be. Measured across the eight covers, the
// ink bounding boxes ran from 56% to 91% of that box and the ink area from
// 10248px to 33451px — a 3.3x spread. At 1080px, invisible. At the 161px the
// tray actually renders, `how-it-works` was a small squiggle in a big disc while
// `stores` filled its circle. Nothing caught it: the only cover gate was a floor
// on total ink, and every icon cleared it.
//
// A "440px box" is not a size unless something measures what lands in it. So
// every icon is now MEASURED — rendered once and read off the alpha channel,
// the same technique layout.js uses for display type, and for the same reason:
// there is no browser here, and guessing is how the first set shipped.
//
// ── The arithmetic ─────────────────────────────────────────────────────────
//
// Stroke width is constant ON CANVAS (`stroke-width = width / s` inside a
// `scale(s)` group), so a rendered bbox is geometry plus one stroke:
//
//     measured = geometry * s + stroke
//
// which is why the geometry is backed out of a reference render before the real
// scale is solved. Scaling the MEASURED box directly overshoots by a stroke
// width — 16px here, and 2.4px in the tray, which is most of a stroke.
//
// ── Why every icon is drawn near-square ────────────────────────────────────
//
// Normalisation is by the LONGER side, so a wide flat icon and a square one at
// the same "fill" do not carry the same weight inside a circular mask. The rule
// is therefore a design rule as much as an arithmetic one: keep an icon's aspect
// near 1:1 and the two agree. `how` was redrawn for exactly this reason.

const sharp = require("sharp");
const { C } = require("./palette");
const { GLYPH_PATHS } = require("./mark");
const { COVER } = require("./ig");

const r2 = (n) => Math.round(n * 100) / 100;
const GRID = 48;

// ── The set ─────────────────────────────────────────────────────────────────
// Each entry is { paths, circles, label }. `circles` carries shapes SVG cannot
// express as a stroke path (a dot has no length); `label` a glyph that is
// genuinely a letterform.
const ICONS = {
  // How it works — the pack's recurring gesture: a price falling and resolving
  // into an arrowhead. The same movement as the brand mark's interior, which is
  // why this cover and About read as siblings.
  //
  // Redrawn taller than the original. The first version spanned 32x17 grid units
  // — an aspect of 1.9 — so normalising it by its longer side left it visually
  // the lightest cover in a set of eight. Same gesture, more fall.
  how: {
    paths: ["M7 10 L19 26 L27 17 L39 34", "M39 34 L27.6 32.5", "M39 34 L37.3 22.4"],
  },

  // Stores — a storefront. Chosen over a bag or a cart because both of those
  // mean "buying"; this Highlight is about WHICH SHOPS ARE SUPPORTED, and an
  // awning is the only silhouette that says "a shop" rather than "shopping".
  //
  // The awning is WIDE and its lower edge is SCALLOPED, and the shop under it is
  // narrower than the awning. Both matter: the first version was a trapezoid the
  // same width as the body and read, unmistakably, as a house. A roof sits on
  // the walls; an awning overhangs them, and that overhang is the whole
  // difference between "shop" and "home" at 161px.
  stores: {
    paths: [
      "M3 22 L11 11 H37 L45 22",
      "M3 22 q3.5 6 7 0 q3.5 6 7 0 q3.5 6 7 0 q3.5 6 7 0 q3.5 6 7 0 q3.5 6 7 0",
      "M8 25 V42 H40 V25",
      "M19 42 V31 H29 V42",
      "M3 42 H45",
    ],
  },

  // Earn — a credit arriving. A coin with a plus through it: the one shape that
  // says "you gained one of these" without naming a currency, which matters,
  // because a credit is not money and the copy is careful never to imply it is.
  earn: {
    circles: [[24, 24, 19, false]],
    paths: ["M24 15 V33", "M15 24 H33"],
  },

  // Plans — the infinity loop, because the tier this Highlight argues for is
  // called Unlimited and that is the only word on it that never changes. A price
  // would have been the obvious icon and is the one thing that must not be
  // drawn: a printed figure outlives the price it prints.
  plans: {
    paths: [
      "M24 24 C20 14 12 11 7 16 C2 21 2 27 7 32 C12 37 20 34 24 24 " +
        "C28 14 36 11 41 16 C46 21 46 27 41 32 C36 37 28 34 24 24 Z",
    ],
  },

  // Features — sliders. This Highlight covers what the app does AND what you can
  // set, and a row of controls is the only icon that says "this is yours to
  // adjust". An eye was drawn first, for "we watch the price for you", and
  // thrown away: on an app whose adjacent Highlight frame is about mailbox
  // privacy, an eye says surveillance.
  features: {
    paths: ["M8 13 H40", "M8 21 H40", "M8 29 H40", "M8 37 H40"],
    circles: [
      [16, 13, 3.6, true],
      [30, 21, 3.6, true],
      [21, 29, 3.6, true],
      [34, 37, 3.6, true],
    ],
  },

  // FAQ — a question mark, SET in the display face rather than drawn, so it
  // matches the type on every other frame instead of being a second "?" shape.
  faq: {
    circles: [[24, 24, 18, false]],
    label: { s: "?", size: 26, dy: 9, weight: 900, display: true },
  },

  // Tips — a bulb. The one icon here that is a cliché, kept because a cliché is
  // exactly what an icon at 161px needs to be.
  tips: {
    paths: [
      "M24 6 C15 6 10 13 10 20 C10 25 13 28 15 32 L15 35 H33 V32 C35 28 38 25 38 20 C38 13 33 6 24 6 Z",
      "M17 39 H31",
      "M20 43 H28",
    ],
  },

  // Feedback — a speech bubble with its tail on the LEFT, because the reader is
  // the one talking. A right-tailed bubble is the brand talking, which is the
  // opposite of what this Highlight collects.
  feedback: {
    paths: ["M9 10 H39 A4 4 0 0 1 43 14 V30 A4 4 0 0 1 39 34 H22 L13 42 V34 H9 A4 4 0 0 1 5 30 V14 A4 4 0 0 1 9 10 Z"],
    circles: [
      [16, 22, 2.2, true],
      [24, 22, 2.2, true],
      [32, 22, 2.2, true],
    ],
  },

  // About — the app's own mark. The only cover that is the product rather than a
  // symbol for a subject, and the reason it needed no redrawing: it was never
  // the wrong shape, only the wrong size (62% of its box). Normalisation is the
  // whole fix.
  about: { paths: GLYPH_PATHS },

  // Support — a life ring. A headset would say "call centre", which this is not,
  // and an envelope would collide with Feedback.
  //
  // The spokes now REACH both circles. In the first version they were four
  // floating diagonal dashes between an inner and an outer ring, and with the
  // cover's own rim behind them the whole thing read as concentric circles with
  // no subject — the exact failure the rim's radius was moved to avoid, walked
  // back in by the icon.
  support: {
    circles: [
      [24, 24, 20, false],
      [24, 24, 8, false],
    ],
    paths: [
      "M29.66 18.34 L38.14 9.86",
      "M18.34 18.34 L9.86 9.86",
      "M18.34 29.66 L9.86 38.14",
      "M29.66 29.66 L38.14 38.14",
    ],
  },
};

// ── Measurement ─────────────────────────────────────────────────────────────
const PROBE = 480; // canvas the reference render lands on
const bboxCache = new Map();

function shapesOf(spec, stroke) {
  const out = [];
  for (const d of spec.paths || []) out.push(`<path d="${d}"/>`);
  for (const [cx, cy, r, filled] of spec.circles || []) {
    out.push(
      filled
        ? `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${stroke}" stroke="none"/>`
        : `<circle cx="${cx}" cy="${cy}" r="${r}"/>`
    );
  }
  return out;
}

function labelSvg(spec, s, ox, oy) {
  const L = spec.label;
  const family = L.display ? "Roboto Black" : "Roboto";
  return `<text x="${r2(ox + 24 * s)}" y="${r2(oy + (24 + L.dy) * s)}" font-family="${family}" font-size="${r2(
    L.size * s
  )}" font-weight="${L.weight}" fill="#000" text-anchor="middle">${L.s}</text>`;
}

/** True geometry bbox in GRID units, with the stroke's contribution removed. */
async function geometryBox(name, { width = COVER.iconStroke } = {}) {
  const key = `${name}|${width}`;
  const hit = bboxCache.get(key);
  if (hit) return hit;

  const spec = ICONS[name];
  if (!spec) throw new Error(`no icon named "${name}"`);
  const s = PROBE / GRID;

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${PROBE}" height="${PROBE}">
    <g fill="none" stroke="#000" stroke-width="${r2(width / s)}" stroke-linecap="round" stroke-linejoin="round"
       transform="scale(${r2(s)})">${shapesOf(spec, "#000").join("")}</g>${
    spec.label ? labelSvg(spec, s, 0, 0) : ""
  }</svg>`;

  const { data, info } = await sharp(Buffer.from(svg), { density: 72 })
    .extractChannel("alpha")
    .raw()
    .toBuffer({ resolveWithObject: true });

  let x0 = Infinity;
  let y0 = Infinity;
  let x1 = -1;
  let y1 = -1;
  for (let y = 0; y < info.height; y++) {
    for (let x = 0; x < info.width; x++) {
      if (data[y * info.width + x] > 8) {
        if (x < x0) x0 = x;
        if (x > x1) x1 = x;
        if (y < y0) y0 = y;
        if (y > y1) y1 = y;
      }
    }
  }
  if (x1 < 0) throw new Error(`icon "${name}" rendered no ink`);

  // measured = geometry * s + stroke, so back the stroke out before the real
  // scale is solved. A label carries no stroke; a shape does.
  const inked = (spec.paths || []).length + (spec.circles || []).length > 0;
  const pad = inked ? width : 0;
  const box = {
    w: Math.max(1, (x1 - x0 + 1 - pad) / s),
    h: Math.max(1, (y1 - y0 + 1 - pad) / s),
    cx: (x0 + x1 + 1) / 2 / s,
    cy: (y0 + y1 + 1) / 2 / s,
  };
  bboxCache.set(key, box);
  return box;
}

/**
 * One icon, normalised to fill `box` and centred on (cx, cy).
 *
 * `textFn` lets the caller draw the label with its own text primitive, so a
 * pack's escaping and filters apply. Falls back to a plain <text>.
 */
async function drawIcon(
  name,
  { cx, cy, box = COVER.icon, fill = COVER.iconFill, stroke = C.emeraldGlow, width = COVER.iconStroke, textFn = null }
) {
  const spec = ICONS[name];
  if (!spec) throw new Error(`no icon named "${name}"`);
  const geom = await geometryBox(name, { width });

  // Solve for the scale that lands the FINISHED icon — geometry plus one stroke
  // — at `fill` of the box.
  const s = Math.max(0.01, (box * fill - width) / Math.max(geom.w, geom.h));

  // Centre the measured INK, not the 48-unit grid. Several of these shapes are
  // not centred on their own grid (the mark sits high and left), and centring
  // the grid puts the ink off-centre inside a circular mask that has no
  // tolerance for it.
  const ox = cx - geom.cx * s;
  const oy = cy - geom.cy * s;

  const out = [];
  const shapes = shapesOf(spec, stroke);
  if (shapes.length) {
    out.push(
      `<g transform="translate(${r2(ox)} ${r2(oy)}) scale(${r2(s)})" fill="none" stroke="${stroke}" ` +
        `stroke-width="${r2(width / s)}" stroke-linecap="round" stroke-linejoin="round">${shapes.join("")}</g>`
    );
  }

  if (spec.label) {
    const L = spec.label;
    const family = L.display ? "Roboto Black" : "Roboto";
    const lx = ox + 24 * s;
    const ly = oy + (24 + L.dy) * s;
    out.push(
      textFn
        ? textFn(L.s, { x: lx, y: ly, size: L.size * s, weight: L.weight, family, fill: stroke, op: 1, anchor: "middle", bleed: false })
        : `<text x="${r2(lx)}" y="${r2(ly)}" font-family="${family}" font-size="${r2(L.size * s)}" font-weight="${
            L.weight
          }" fill="${stroke}" text-anchor="middle">${L.s}</text>`
    );
  }

  return out.join("\n");
}

module.exports = { ICONS, drawIcon, geometryBox, GRID };
