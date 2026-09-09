// Evergreen pack — design tokens.
//
// Three packs now exist and they are deliberately not the same system:
//
//   launch/   dark, emerald glow, big grotesque — EXPLAINS the product
//   teaser/   warm thermal paper, monospace, mostly empty — WITHHOLDS
//   evergreen/ (this one) — a paper strip lit on a deep ink-green field
//
// This is the one meant to run forever, so it is the one that has to look
// like the brand rather than like a campaign. It borrows the receipt from the
// teaser and the depth from the launch pack, and resolves them: a physical
// strip of thermal paper, photographed on a dark surface, with exactly one
// green element per frame.
//
// The reason it is a *strip* and not a full-bleed page: at grid size a bright
// vertical band on a dark field is the only thing in this product's visual
// vocabulary that is still legible at 1/9th of a phone screen. A full receipt
// reads as a grey rectangle. The strip reads as a receipt.

// ── What this file still owns ────────────────────────────────────────────
//
// The palette, the type ramp, Instagram's geometry, the mark and the leaf used
// to be written out here and copied into every other pack. They now come from
// ../../brand — they are facts about the product and the platform, not choices
// about this pack, and four copies of them is how the mark ended up drawn at two
// different strengths with nothing to notice. See brand/README.md.
//
// The look above is unchanged and stays this pack's own: the strip, the tear,
// the grain, the one green element per frame all live in surface.js.

const { C, FADE } = require("../../brand/palette");
const { DISPLAY, SANS, MONO, TYPE, GRID } = require("../../brand/type");
const { CANVAS, SAFE, STICKER_BAND, HOOK_ZONE } = require("../../brand/ig");

module.exports = { CANVAS, SAFE, STICKER_BAND, HOOK_ZONE, C, FADE, DISPLAY, SANS, MONO, TYPE, GRID };
