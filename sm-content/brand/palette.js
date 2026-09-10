// The brand palette. One copy, imported by every pack.
//
// These are not a pack's styling choices — they are what the product looks
// like, and a frame that gets one wrong is wrong regardless of which pack it
// came from. Composition choices (which strip, which angle, which scene) stay
// in the pack; the colours do not.
//
// The two live packs held byte-identical copies of this before it moved here.
// Only `leaf` and `leafDeep` were community-only, and only because no evergreen
// frame had a reason to draw a leaf yet.

const C = {
  // The field. A near-black green, gradient top to bottom, grained so it does
  // not posterise once Instagram re-encodes it.
  fieldTop: "#0a1a14",
  field: "#071410",
  fieldDeep: "#04100c",

  // Thermal paper, lit from the upper left.
  paperTop: "#f6f0e5",
  paper: "#efe7d9",
  paperBottom: "#e3d9c6",
  paperEdge: "#cdc0a8",
  paperShadow: "#020907",

  ink: "#171512",
  inkOnField: "#eef4f0",

  emerald: "#10b981",
  emeraldDeep: "#047857",
  emeraldGlow: "#34d399",

  bar: "#171512",

  // The leaf. A muted brick red, NOT the flag's #FF0000 — pure red next to
  // emerald on a near-black field vibrates on an OLED phone, and it also stops
  // the frame reading as an official mark, which it must not. See leaf.js.
  leaf: "#c0392b",
  leafDeep: "#8e2a20",
};

// How faded a given line of print is. Named rather than numbered so a frame
// says what it means: `FADE.ghost` is texture, `FADE.print` is something to
// read.
const FADE = {
  ghost: 0.13,
  faint: 0.24,
  mid: 0.42,
  read: 0.68,
  print: 0.9,
  full: 1,
};

// ── Luminance, for the watermark contrast spec ──────────────────────────────
// Rec. 709. mark.js solves a watermark's opacity against a measured ground
// luminance rather than hard-coding an alpha, because the same alpha means two
// different things on a near-black field and on pale paper. See mark.js § the
// watermark.
function luminance(hex) {
  const h = hex.replace("#", "");
  const n = parseInt(h.length === 3 ? h.split("").map((c) => c + c).join("") : h, 16);
  return 0.2126 * ((n >> 16) & 255) + 0.7152 * ((n >> 8) & 255) + 0.0722 * (n & 255);
}

module.exports = { C, FADE, luminance };
