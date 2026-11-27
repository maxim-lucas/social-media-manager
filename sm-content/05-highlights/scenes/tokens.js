// Highlights pack — design tokens.
//
// Five packs now exist in sm-content/ and they are deliberately not one system:
//
//   01-teaser/        warm thermal paper, mostly empty      — WITHHOLDS
//   ../{reels,carousels,statics,stories}                 — EXPLAINS the launch
//   03-evergreen/     a paper strip on a deep ink-green field — DESCRIBES the mechanic
//   04-community/  the same surface, recruiting          — ASKS FOR SOMETHING
//   05-highlights/ (this one)                            — ANSWERS, permanently
//
// This pack inherits the community surface wholesale, because it is the same
// voice and a fifth look would read as a fifth product. What makes it different
// is not how it looks but how long it lives: 04-community is a dated run whose
// own notes say "do not extend it", and a Highlight tray is furniture. Nothing
// here borrows energy from a moment, and nothing here has a date on it.
//
// The palette, type ramp, Instagram geometry, mark, leaf and cover icon set all
// come from ../../00-brand. See 00-brand/README.md for what belongs there and why the
// packs still own their surfaces.

const { C, FADE } = require("../../00-brand/palette");
const { DISPLAY, SANS, MONO, TYPE, GRID } = require("../../00-brand/type");
const { CANVAS, SAFE, COVER, STICKER_BAND, HOOK_ZONE } = require("../../00-brand/ig");

module.exports = {
  CANVAS, SAFE, COVER, STICKER_BAND, HOOK_ZONE,
  C, FADE, DISPLAY, SANS, MONO, TYPE, GRID,
};
