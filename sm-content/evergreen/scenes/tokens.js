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

// ── Canvas ──────────────────────────────────────────────────────────────────
const CANVAS = {
  post: { w: 1080, h: 1350 }, // 4:5 feed — the tallest ratio the feed allows
  story: { w: 1080, h: 1920 }, // 9:16 story
};

// Regions Instagram's own chrome sits on top of. Nothing readable may enter
// them. Asserted by verify.js against rendered pixels, not by eye.
const SAFE = {
  // Story: IG header (avatar + name + time), caption/reply bar, right action rail.
  story: { top: 250, bottom: 320, left: 96, right: 200 },
  // Feed: no chrome overlays the image, so this is pure margin.
  post: { top: 88, bottom: 88, left: 88, right: 88 },
};

// The band a native Instagram sticker (poll, quiz, question, slider, link)
// gets dropped into. Stickers are only interactive when added inside the app,
// so the art leaves the room rather than drawing a fake one.
const STICKER_BAND = { y: 1210, h: 300 };

// The top third of a 4:5 frame is all that survives the feed crop before
// someone taps, and it is roughly what the grid thumbnail shows. Every post's
// hook line must start inside it. verify.js checks this.
const HOOK_ZONE = { y: 88, h: 450 };

// ── Palette ─────────────────────────────────────────────────────────────────
const C = {
  // The field. Deep, desaturated, green-black — reads as near-black in the
  // feed but keeps the brand hue when it sits next to a competitor's pure black.
  fieldTop: "#0a1a14",
  field: "#071410",
  fieldDeep: "#04100c",

  // Thermal paper, warm and slightly uneven. Never pure white: a white strip
  // on a dark field blooms on OLED and loses its edges.
  paperTop: "#f6f0e5",
  paper: "#efe7d9",
  paperBottom: "#e3d9c6",
  paperEdge: "#cdc0a8", // the cut edge catching light
  paperShadow: "#020907",

  ink: "#171512", // "printed" text on paper
  inkOnField: "#eef4f0", // type set directly on the dark field

  emerald: "#10b981", // the single brand tie — one element per frame, max
  emeraldDeep: "#047857",
  emeraldGlow: "#34d399",

  bar: "#171512", // redaction bar — the same ink the receipt is printed in
};

// Opacity steps. A real receipt is never uniform and neither is type on a
// dark field; flat 100% white on #071410 is the single fastest way to make a
// frame look like a slide deck.
const FADE = {
  ghost: 0.13, // the illegible header block
  faint: 0.24,
  mid: 0.42,
  read: 0.68, // legible but clearly old print
  print: 0.9, // the freshly-printed line the frame is about
  full: 1,
};

// ── Type ────────────────────────────────────────────────────────────────────
// Three families, all Apache-2.0 Roboto faces, all verified present on the
// build machine. librsvg substitutes a missing font SILENTLY, so verify.js
// renders a probe of each and compares it against a deliberately nonexistent
// family — if they match, the font did not resolve.
//
// DISPLAY is named "Roboto Black", not "Roboto" at weight 900, because
// fontconfig does not select the Black face by weight here: `Roboto` resolves
// to a bold face at EVERY weight from 400 to 900 (measured — 400, 700 and 900
// all render identically). Asking for the face by name is the only way to get
// it. The corollary is that SANS is a bold face whatever weight it is asked
// for, which is why TYPE.sub declares 500: the token now states what actually
// renders instead of a 400 that silently ships bold.
const DISPLAY = "Roboto Black"; // hook lines only
const SANS = "Roboto"; // sub-lines, wordmark
const MONO = "Roboto Mono"; // everything meant to read as machine output

const TYPE = {
  // Receipt chrome: store header, addresses, terms — small, wide, faded.
  micro: { family: MONO, size: 21, weight: 400, tracking: 5.5 },
  small: { family: MONO, size: 26, weight: 400, tracking: 1.5 },
  row: { family: MONO, size: 30, weight: 400, tracking: 0 }, // line items
  rowBold: { family: MONO, size: 30, weight: 500, tracking: 0 },

  // The label above a hook — always mono, always tracked out, always small.
  kicker: { family: MONO, size: 24, weight: 500, tracking: 7 },

  // The hook itself. Black weight, tight, set on the dark field.
  hook: { family: DISPLAY, size: 92, weight: 900, tracking: -2.5, leading: 1.03 },
  hookSm: { family: DISPLAY, size: 74, weight: 900, tracking: -2, leading: 1.05 },
  hookXl: { family: DISPLAY, size: 118, weight: 900, tracking: -3.5, leading: 1.0 },

  // The line under the hook that does the qualifying. Never bigger than this:
  // a conditional set as large as the claim reads as part of the claim.
  sub: { family: SANS, size: 34, weight: 500, tracking: 0, leading: 1.4 },

  // Footer mark + handle.
  mark: { family: SANS, size: 30, weight: 700, tracking: 0.5 },
  handle: { family: MONO, size: 24, weight: 400, tracking: 3 },
};

// Vertical rhythm. Everything lands on this so nine frames feel like one pack.
const GRID = { unit: 12, margin: 96 };

module.exports = { CANVAS, SAFE, STICKER_BAND, HOOK_ZONE, C, FADE, DISPLAY, SANS, MONO, TYPE, GRID };
