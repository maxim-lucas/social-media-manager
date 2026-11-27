// Instagram's geometry.
//
// Everything here is a fact about Instagram, not a choice this project made,
// which is exactly why it is shared: a pack that disagrees with these numbers
// is not expressing a different style, it is wrong.

// ── Canvases ────────────────────────────────────────────────────────────────
const CANVAS = {
  post: { w: 1080, h: 1350 },     // 4:5 feed — the tallest ratio the feed allows
  story: { w: 1080, h: 1920 },    // 9:16 story
  carousel: { w: 1080, h: 1350 }, // a carousel slide is a feed frame; same canvas
  cover: { w: 1080, h: 1920 },    // Highlight cover, as uploaded
};

// Regions Instagram's own chrome sits on top of. Nothing readable may enter
// them. Asserted by each pack's verify.js against rendered pixels, not by eye.
//
// The story's right inset is wider than its left because the action rail
// (like / reply / share / more) lives there. Type set to a centred column
// would drift under it.
const SAFE = {
  story: { top: 250, bottom: 320, left: 96, right: 200 },
  post: { top: 88, bottom: 88, left: 88, right: 88 },
  carousel: { top: 88, bottom: 88, left: 88, right: 88 },
};

// ── The Highlight cover ─────────────────────────────────────────────────────
// Instagram does not have a "Highlight cover size". It has a crop chain, and
// the only honest way to size a cover is to design for the last link in it:
//
//   upload 1080x1920  ->  IG takes a CENTRED SQUARE  ->  masks it to a CIRCLE
//                                                     ->  displays it at ~161px
//
// So the cover is authored at 1080x1920 (the size the picker accepts without
// re-compressing, and the size that lets the same file double as a story), and
// every readable thing lives inside a centred circle. Two circles matter:
//
//   COVER.crop   1080 across, centred at (540,960) — what the square crop keeps
//   COVER.safe    640 across                       — what survives the circular
//                                                     mask plus IG's ring inset
//
// 640/1080 = 59%. Not a round number chosen for tidiness: the circular mask
// eats the square's corners, the selected-Highlight ring eats a few more px off
// the edge, and the whole thing is then shown at 161px on a phone.
//
// The corollary drove the whole cover design: at 161px across, a word is mush.
// The covers carry an ICON and nothing else, and the CATEGORY NAME IS TYPED IN
// INSTAGRAM as the Highlight title.
const COVER = {
  crop: { cx: 540, cy: 960, d: 1080 },
  safe: { cx: 540, cy: 960, d: 640 },

  // The icon box inside the safe circle, and the stroke it is drawn with.
  //
  // Both numbers are set by the DISPLAY size, not by the canvas. The tray shows
  // this at ~161px, so everything here is divided by 6.7 before a human sees
  // it: a 2.7px stroke authored on a 1080 canvas arrives at 0.4px and is gone.
  // The first version of these covers shipped exactly that and read as an empty
  // circle. Work backwards instead — a stroke that should read as ~2.5px in the
  // tray has to be ~17px here.
  icon: 440,
  iconStroke: 16,

  // How much of the icon box the icon's REAL ink must fill. See icons.js: the
  // first cover set declared a 440px box and then drew inside it at whatever
  // size each path happened to be, which produced icons between 56% and 91% of
  // the box — a 3.3x spread in ink, invisible at 1080px and glaring at 161px.
  iconFill: 0.86,

  // The rim sits well OUTSIDE the safe circle, near the crop edge. At r=300 it
  // landed a hair outside the icons, and the covers drawn AS circles read as
  // two concentric rings with no subject. A rim has to be a rim, not a second
  // element.
  ring: { r: 430, width: 8, op: 0.34 },
};

// The band a native Instagram sticker (poll, quiz, question, slider, link) gets
// dropped into. Stickers are only interactive when added inside the app, so the
// art leaves the room rather than drawing a fake one.
const STICKER_BAND = { y: 1210, h: 300 };

// The top third of a 4:5 frame is all that survives the feed crop before
// someone taps, and it is roughly what the grid thumbnail shows.
const HOOK_ZONE = { y: 88, h: 450 };

// ── The story progress bar ──────────────────────────────────────────────────
// Instagram draws one segment per frame across the top of a story, inside the
// header safe zone. The intro frame of a Highlight draws a REPLICA of it lower
// down, to show a reader where the French half starts — see 05-highlights.
// These are the real bar's proportions, which is what makes the replica read as
// the thing it is pointing at rather than as decoration.
const PROGRESS_BAR = { y: 96, h: 6, gap: 8, inset: 24 };

module.exports = { CANVAS, SAFE, COVER, STICKER_BAND, HOOK_ZONE, PROGRESS_BAR };
