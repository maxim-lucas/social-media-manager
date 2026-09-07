// Community pack — Instagram Highlight covers.
//
// ── The size question, answered properly ────────────────────────────────────
//
// Instagram has no "Highlight cover size". It has a crop chain, and the only
// honest way to size a cover is to design for the last link:
//
//   you upload 1080x1920  ->  IG keeps a CENTRED SQUARE  ->  masks it to a
//   CIRCLE  ->  displays it at about 161x161 px on a phone
//
// So: authored at 1080x1920 (what the picker takes without recompressing, and
// what lets the same file double as a story), with everything readable inside a
// centred 640px circle. tokens.js COVER holds both numbers and the reasoning.
//
// ── Why the covers carry no words ───────────────────────────────────────────
//
// At 161px across, a word is mush and a phrase is a smudge. "How it works" is
// three words; there is no type size at which it survives that circle. So the
// category name is TYPED INTO INSTAGRAM as the Highlight title, where it renders
// as real system text under the circle, at a size the OS picked to be legible.
//
// The icon-only decision pays a second time: an icon has no language. One set of
// eight covers serves the English and French titles both, which is the only
// reason a bilingual account can have a consistent Highlight tray at all — the
// alternative is two trays, or a tray that is half English.
//
// ── The eighth cover ────────────────────────────────────────────────────────
//
// Seven categories were asked for. The eighth is "FR", and it is the exception
// that proves the no-words rule: two capital letters DO survive 161px, and a
// bilingual account whose Highlight tray never says the word "français" is an
// account a French speaker scrolls past. It is optional — HIGHLIGHTS.md says so
// — but it is the one Highlight that answers a question before it is asked.

const { CANVAS, COVER, C, TYPE, DISPLAY, MONO } = require("./tokens");
const { defs, field, text, coverDisc, leaf, r2, GLYPH_PATHS, isContentMode } = require("./surface");

const { w: W, h: H } = CANVAS.cover;

// ── The icon set ────────────────────────────────────────────────────────────
// All drawn on a 0 0 48 48 grid, the same grid the app's BrandMark uses, so the
// mark can sit in the set without being redrawn. Stroke-only, round caps: a
// filled icon at 300px on a dark disc reads as a blob, an outlined one keeps its
// silhouette all the way down to the tray.
//
// Each entry is { paths, circles, label } — `circles` for the shapes SVG cannot
// express as a stroke path (a dot has no length), `label` for a glyph that is
// genuinely a letterform.
const ICONS = {
  // How it works — the pack's recurring gesture: a price falling, resolving
  // into an arrowhead. Same movement as the brand mark's interior, which is why
  // this cover and the About cover read as siblings.
  how: {
    paths: ["M8 16 L18 27 L26 19 L40 33", "M40 33 L30 31", "M40 33 L38 23"],
  },

  // Stores — a storefront. Chosen over a shopping bag or a cart because both of
  // those mean "buying"; this Highlight is about WHICH SHOPS ARE SUPPORTED, and
  // an awning is the only silhouette that says "a shop" rather than "shopping".
  //
  // The awning is a TRAPEZOID, wider at the bottom than the top. The first
  // version used a triangle and read, unmistakably, as a house — which is the
  // failure mode of every storefront icon and the reason most of them give up
  // and draw a shopping bag instead.
  // The awning is WIDE and its lower edge is SCALLOPED, and the shop under it is
  // narrower than the awning. Both matter: the first version was a trapezoid the
  // same width as the body and read, unmistakably, as a house. A roof sits on
  // the walls; an awning overhangs them. That overhang is the entire difference
  // between "shop" and "home" at 161px.
  stores: {
    paths: [
      "M3 22 L11 11 H37 L45 22",
      "M3 22 q3.5 6 7 0 q3.5 6 7 0 q3.5 6 7 0 q3.5 6 7 0 q3.5 6 7 0 q3.5 6 7 0",
      "M8 25 V42 H40 V25",
      "M19 42 V31 H29 V42",
      "M3 42 H45",
    ],
  },

  // FAQ — a question mark, set in the display face rather than drawn, so it
  // matches the type on every other frame instead of being a second "?" shape.
  faq: {
    circles: [[24, 24, 18, false]],
    label: { s: "?", size: 26, dy: 9, family: DISPLAY, weight: 900 },
  },

  // Tips — a bulb. The one icon here that is a cliché, kept because a cliché is
  // exactly what an icon at 161px needs to be.
  tips: {
    paths: [
      "M24 7 C16 7 11 13 11 20 C11 25 14 27 16 31 L16 34 H32 V31 C34 27 37 25 37 20 C37 13 32 7 24 7 Z",
      "M18 38 H30",
      "M21 42 H27",
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

  // About — the app's own mark, ported 1:1 from src/components/BrandMark.js.
  // The only cover that is the product rather than a symbol for a subject.
  about: { paths: GLYPH_PATHS },

  // Support — a life ring. A headset would say "call centre", which this is not,
  // and an envelope would collide with Feedback. A ring says "something to hold
  // on to", and it is the only one of the three whose silhouette is unmistakable
  // at tray size.
  support: {
    circles: [
      [24, 24, 18, false],
      [24, 24, 7.5, false],
    ],
    paths: ["M11.3 11.3 L18.7 18.7", "M36.7 11.3 L29.3 18.7", "M11.3 36.7 L18.7 29.3", "M36.7 36.7 L29.3 29.3"],
  },

  // Français — two letters, which is the most that survives 161px, set in the
  // display face so it matches every hook in the pack.
  //
  // It had a leaf behind it for one draft. At tray size the leaf's points ran
  // out past the letterforms and the cover read as a red starburst with
  // something written on it — the leaf is a 300px shape and this is a 45px slot.
  // Two letters at full size say "French" better than any emblem can here.
  french: {
    label: { s: "FR", size: 25, dy: 9, family: DISPLAY, weight: 900, tracking: -1.6 },
  },
};

/** One icon, drawn into a `size`-wide box centred on (cx, cy). */
function drawIcon(spec, { cx, cy, size, stroke = C.emerald, width = 2.6 }) {
  const s = size / 48;
  const ox = cx - size / 2;
  const oy = cy - size / 2;
  const out = [];

  if (spec.leafBehind) {
    // Behind the letterform, and faint: the leaf is context here, not the
    // subject. At full strength it turns a language cover into a flag.
    const ls = size * 1.02;
    out.push(leaf({ x: cx - ls / 2, y: cy - ls / 2, size: ls, fill: C.leaf, op: 0.3 }));
  }

  const shapes = [];
  for (const d of spec.paths || []) shapes.push(`<path d="${d}"/>`);
  for (const [ccx, ccy, r, filled] of spec.circles || []) {
    shapes.push(
      filled
        ? `<circle cx="${ccx}" cy="${ccy}" r="${r}" fill="${stroke}" stroke="none"/>`
        : `<circle cx="${ccx}" cy="${ccy}" r="${r}"/>`
    );
  }

  if (shapes.length) {
    out.push(
      `<g transform="translate(${r2(ox)} ${r2(oy)}) scale(${r2(s)})" fill="none" stroke="${stroke}" ` +
        `stroke-width="${r2(width / s)}" stroke-linecap="round" stroke-linejoin="round">${shapes.join("")}</g>`
    );
  }

  if (spec.label) {
    const L = spec.label;
    // The label is positioned in ICON-GRID units and scaled with everything
    // else, so a cover redrawn at another size keeps the same optical centring.
    out.push(
      text(L.s, {
        x: cx,
        y: cy + L.dy * s,
        size: L.size * s,
        weight: L.weight,
        family: L.family,
        tracking: (L.tracking || 0) * s,
        fill: stroke,
        op: 1,
        anchor: "middle",
        bleed: false,
      })
    );
  }

  return out.join("\n");
}

async function buildCover(t) {
  const { cx, cy } = COVER.crop;

  // Outside the crop circle the frame is dimmed almost to black. Nothing out
  // there is ever seen in the Highlight tray — but the PNG is, by whoever is
  // choosing covers in the picker, and a preview that shows exactly what the
  // circle will show is a preview that cannot mislead. The hole is an evenodd
  // path rather than a mask because librsvg's mask support is the part of the
  // spec it is least reliable about.
  const r = COVER.crop.d / 2;
  // Suppressed in "content" mode along with the field and the disc, so that
  // gate 7 sees exactly the icon and can assert it fits the safe circle. A dim
  // overlay left in would be 2 million inked pixels the gate would have to
  // reason about, and a gate that has to reason is a gate that can be wrong.
  const outside = isContentMode()
    ? ""
    :
    `<path fill-rule="evenodd" fill="#000000" fill-opacity="0.62" d="M0 0 H${W} V${H} H0 Z ` +
    `M${cx} ${cy - r} A${r} ${r} 0 1 0 ${cx} ${cy + r} A${r} ${r} 0 1 0 ${cx} ${cy - r} Z"/>`;

  const spec = ICONS[t.icon];
  if (!spec) throw new Error(`cover ${t.id}: no icon named "${t.icon}"`);

  const body = [
    field(W, H),
    coverDisc(),
    outside,
    drawIcon(spec, { cx, cy, size: COVER.icon, stroke: C.emeraldGlow, width: COVER.iconStroke }),
  ].join("\n");

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
${defs(61)}
${body}
</svg>`;
}

module.exports = { buildCover, ICONS, W, H };
