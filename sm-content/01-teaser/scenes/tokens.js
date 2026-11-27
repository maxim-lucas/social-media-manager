// Teaser pack — design tokens.
//
// The launch pack (sm-content/{reels,carousels,statics,stories}) is a dark,
// emerald-glow, big-grotesque system whose whole job is to EXPLAIN the product.
// This pack is its deliberate opposite: warm thermal-receipt paper, monospace
// print, mostly empty space, and at most one emerald element per frame. It
// withholds instead of explaining. Keeping the two systems visually unrelated
// is the point — the teaser should not look like a PriceBack ad until the
// launch pack lands and the audience recognises the paper in hindsight.

// ── Canvas ──────────────────────────────────────────────────────────────────
const CANVAS = {
  post: { w: 1080, h: 1350 }, // 4:5 feed
  story: { w: 1080, h: 1920 }, // 9:16 story
};

// Regions Instagram's own chrome sits on top of. Nothing readable may enter
// them. Verified by verify.js, not by eye.
const SAFE = {
  // Story: IG header (avatar + name + time), caption/reply bar, right action rail.
  story: { top: 250, bottom: 320, left: 96, right: 200 },
  // Feed: no chrome overlays the image itself, so this is pure margin.
  post: { top: 96, bottom: 96, left: 96, right: 96 },
};

// Band left empty on purpose for a native Instagram sticker (poll, question,
// reminder, link). Interactive stickers only exist if added in the app, so the
// art has to leave room rather than draw a fake one.
const STICKER_BAND = { y: 1210, h: 300 };

// ── Palette ─────────────────────────────────────────────────────────────────
// Warm, low-contrast, physical. Never pure black on pure white — thermal paper
// yellows and thermal ink is a soft charcoal.
const C = {
  paperTop: "#f5efe4",
  paperBottom: "#e6ddcd",
  // The surface the receipt lies on, revealed where the paper is torn away.
  // Has to be clearly darker than paperBottom or the tear stops reading as a
  // tear and just looks like a slightly grubby edge.
  ground: "#b4a790",
  groundDeep: "#9d8f77",
  tearShadow: "#8d7f68",
  ink: "#141210", // "printed" text
  inkSoft: "#141210", // same hue, used at low opacity for aged print
  emerald: "#10b981", // the single brand tie — one element per frame, max
  emeraldDeep: "#047857",
};

// Opacity steps for print that has faded. A real receipt is never uniform.
const FADE = {
  ghost: 0.14, // barely there — the illegible header block
  faint: 0.26,
  mid: 0.42,
  read: 0.7, // legible but clearly old
  print: 0.88, // the freshly-printed line the frame is about
};

// ── Type ────────────────────────────────────────────────────────────────────
// Roboto Mono only (Apache-2.0, installed on this machine and on any Linux CI
// via fonts-roboto). One family across the whole pack keeps it reading as
// machine output rather than as designed marketing.
const MONO = "Roboto Mono";

const TYPE = {
  // Receipt chrome: store header, addresses, terms — small, wide, faded.
  micro: { size: 22, weight: 400, tracking: 6 },
  small: { size: 28, weight: 400, tracking: 2 },
  row: { size: 32, weight: 400, tracking: 0 }, // line items
  rowBold: { size: 32, weight: 500, tracking: 0 },
  // The message stamped over the print.
  message: { size: 58, weight: 700, tracking: 0 },
  messageSm: { size: 46, weight: 700, tracking: 0 },
  // The number.
  huge: { size: 460, weight: 700, tracking: -14 },
  hugeStory: { size: 520, weight: 700, tracking: -16 },
};

module.exports = { CANVAS, SAFE, STICKER_BAND, C, FADE, MONO, TYPE };
