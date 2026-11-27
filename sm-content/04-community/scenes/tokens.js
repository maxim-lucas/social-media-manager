// Community pack — design tokens.
//
// Five packs now exist in sm-content/ and they are deliberately not one system:
//
//   01-teaser/     warm thermal paper, monospace, mostly empty  — WITHHOLDS
//   ../{reels,carousels,statics,stories}  dark, emerald glow — EXPLAINS the launch
//   03-evergreen/  a paper strip lit on a deep ink-green field  — DESCRIBES the mechanic
//   04-community/ (this one)                                 — ASKS FOR SOMETHING
//   05-highlights/                                           — EXPLAINS, permanently
//
// This pack inherits the evergreen surface wholesale — same field, same paper
// strip, same mark, same type ramp — because it is the same voice talking about
// a different subject, and a fourth look would read as a fourth product. What
// it adds is what the evergreen system had no vocabulary for:
//
//   • a leaf accent, for the made-in-Canada frames
//   • a bilingual seam element, for the "French follows" notice
//   • two canvases the other packs never render: the Highlight cover, and the
//     carousel divider slide
//
// ── What changed when 00-brand/ landed ────────────────────────────────────────
//
// The palette, the type ramp, Instagram's geometry, the mark and the leaf used
// to be COPIED into this file and into every other pack's. That duplication was
// on purpose — a copy tweak in one pack must never silently re-render another's
// PNGs — and it was also how the mark ended up drawn at two different strengths
// and the cover icons at eight different sizes, with nothing to notice.
//
// They now come from ../../00-brand, and the property the duplication was buying
// is bought instead by ../../00-brand/verify-brand.js, which fails on a changed
// primitive before any pack renders. See 00-brand/README.md.
//
// What stays here is what is genuinely this pack's: which canvases it draws,
// and the scene geometry that goes with them.

const { C, FADE } = require("../../00-brand/palette");
const { DISPLAY, SANS, MONO, TYPE, GRID } = require("../../00-brand/type");
const { CANVAS, SAFE, COVER, STICKER_BAND, HOOK_ZONE } = require("../../00-brand/ig");

module.exports = {
  CANVAS, SAFE, COVER, STICKER_BAND, HOOK_ZONE,
  C, FADE, DISPLAY, SANS, MONO, TYPE, GRID,
};
