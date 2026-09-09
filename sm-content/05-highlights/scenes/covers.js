// Highlights pack — the Instagram Highlight covers.
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
// centred 640px circle. brand/ig.js COVER holds both numbers and the reasoning.
//
// ── Why the covers carry no words ───────────────────────────────────────────
//
// At 161px across, a word is mush and a phrase is a smudge. "How it works" is
// three words; there is no type size at which it survives that circle. So the
// category name is TYPED INTO INSTAGRAM as the Highlight title, where it renders
// as real system text under the circle, at a size the OS picked to be legible.
//
// The icon-only decision pays a second time: AN ICON HAS NO LANGUAGE. One set of
// covers serves the English and French titles both, which is the only reason a
// bilingual account can have a consistent Highlight tray at all — the
// alternative is two trays, or a tray that is half English.
//
// ── What changed from the first set ─────────────────────────────────────────
//
// The eight covers this replaces declared a 440px icon box and then drew inside
// it at whatever size each path happened to be. Measured, the ink ran from 56%
// to 91% of the box and from 10248px to 33451px — a 3.3x spread. Invisible at
// 1080px; at 161px `how-it-works` was a squiggle in a big disc while `stores`
// filled its circle. brand/icons.js now MEASURES each icon and normalises it,
// and gate 11 asserts the result.
//
// The ninth cover, "FR", is gone. There is no Français tray any more: every
// Highlight is bilingual end to end — intro, English, the FR card, French — so a
// French-only drawer would be a duplicate of the back half of all ten. The FR
// letterform moved to the card that marks the seam inside each tray.

const { CANVAS, COVER, C } = require("./tokens");
const { defs, field, text, coverDisc, r2, isContentMode } = require("./surface");
const { drawIcon } = require("../../brand/icons");

const { w: W, h: H } = CANVAS.cover;

async function buildCover(t) {
  const { cx, cy } = COVER.crop;

  // Outside the crop circle the frame is dimmed almost to black. Nothing out
  // there is ever seen in the Highlight tray — but the PNG is, by whoever is
  // choosing covers in the picker, and a preview that shows exactly what the
  // circle will show is a preview that cannot mislead. The hole is an evenodd
  // path rather than a mask because librsvg's mask support is the part of the
  // spec it is least reliable about.
  //
  // Suppressed in "content" mode along with the field and the disc, so gate 11
  // sees exactly the icon. A dim overlay left in would be two million inked
  // pixels the gate would have to reason about, and a gate that has to reason
  // is a gate that can be wrong.
  const r = COVER.crop.d / 2;
  const outside = isContentMode()
    ? ""
    : `<path fill-rule="evenodd" fill="#000000" fill-opacity="0.62" d="M0 0 H${W} V${H} H0 Z ` +
      `M${cx} ${cy - r} A${r} ${r} 0 1 0 ${cx} ${cy + r} A${r} ${r} 0 1 0 ${cx} ${cy - r} Z"/>`;

  const icon = await drawIcon(t.icon, {
    cx,
    cy,
    stroke: C.emeraldGlow,
    // The pack's own text primitive, so the FAQ question mark is escaped and
    // filtered the same way every other glyph on every other frame is.
    textFn: text,
  });

  const body = [field(W, H), coverDisc(), outside, icon].join("\n");

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
${defs(61)}
${body}
</svg>`;
}

module.exports = { buildCover, W, H };
