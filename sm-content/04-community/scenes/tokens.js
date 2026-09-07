// Community pack — design tokens.
//
// Four packs now exist in sm-content/ and they are deliberately not one system:
//
//   teaser/     warm thermal paper, monospace, mostly empty  — WITHHOLDS
//   ../{reels,carousels,statics,stories}  dark, emerald glow — EXPLAINS the launch
//   evergreen/  a paper strip lit on a deep ink-green field  — DESCRIBES the mechanic
//   04-community/ (this one)                                 — ASKS FOR SOMETHING
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
// The duplication of tokens/surface/layout across packs is on purpose and is
// the repo's convention (see evergreen/scenes/surface.js, "Self-contained on
// purpose"): a copy tweak in one pack must never silently re-render another's
// PNGs. The cost is that a *primitive* fix has to be applied in each pack; the
// alternative cost is a diff on 38 frames nobody asked to change.

// ── Canvas ──────────────────────────────────────────────────────────────────
const CANVAS = {
  post: { w: 1080, h: 1350 },     // 4:5 feed — the tallest ratio the feed allows
  story: { w: 1080, h: 1920 },    // 9:16 story
  carousel: { w: 1080, h: 1350 }, // a carousel slide is a feed frame; same canvas
  cover: { w: 1080, h: 1920 },    // Highlight cover, as uploaded
};

// Regions Instagram's own chrome sits on top of. Nothing readable may enter
// them. Asserted by verify.js against rendered pixels, not by eye.
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
// 640/1080 = 59%. That is not a round number chosen for tidiness: the circular
// mask eats the square's corners, the selected-Highlight ring eats a few more
// px off the edge, and the whole thing is then shown at 161px on a phone. Art
// that fills the crop square loses its corners; art that fills the safe circle
// survives.
//
// The corollary drove the whole cover design: at 161px across, a word is mush.
// The covers carry an ICON and nothing else, and the CATEGORY NAME IS TYPED IN
// INSTAGRAM as the Highlight title (see HIGHLIGHTS.md). A cover with "How it
// works" set across it is a cover nobody can read, in either language — and an
// icon-only cover is also the only kind that does not have to be rendered twice
// for EN and FR.
const COVER = {
  crop: { cx: 540, cy: 960, d: 1080 },
  safe: { cx: 540, cy: 960, d: 640 },
  // The icon box inside the safe circle, and the stroke it is drawn with.
  //
  // Both numbers are set by the DISPLAY size, not by the canvas. The tray shows
  // this at ~161px, so everything here is divided by 6.7 before a human sees it:
  // a 2.7px stroke authored on a 1080 canvas arrives at 0.4px and is gone. The
  // first version of these covers shipped exactly that and read as an empty
  // circle. Work backwards instead — a stroke that should read as ~2.5px in the
  // tray has to be ~17px here.
  icon: 440, // 440/640: the icon nearly fills the safe circle, as it must
  iconStroke: 16,
  // The rim sits well OUTSIDE the safe circle, near the crop edge. At r=300 it
  // landed a hair outside the icons and the FAQ and Support covers — both of
  // which are drawn AS circles — read as two concentric rings with no subject.
  // A rim has to be a rim, not a second element.
  ring: { r: 430, width: 8, op: 0.34 },
};

// The band a native Instagram sticker (poll, quiz, question, slider, link)
// gets dropped into. Stickers are only interactive when added inside the app,
// so the art leaves the room rather than drawing a fake one.
const STICKER_BAND = { y: 1210, h: 300 };

// The top third of a 4:5 frame is all that survives the feed crop before
// someone taps, and it is roughly what the grid thumbnail shows.
const HOOK_ZONE = { y: 88, h: 450 };

// ── Palette ─────────────────────────────────────────────────────────────────
const C = {
  fieldTop: "#0a1a14",
  field: "#071410",
  fieldDeep: "#04100c",

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
  // emerald on a near-black field vibrates, and it also stops the frame reading
  // as an official mark, which it must not. See surface.js § leaf.
  leaf: "#c0392b",
  leafDeep: "#8e2a20",
};

const FADE = {
  ghost: 0.13,
  faint: 0.24,
  mid: 0.42,
  read: 0.68,
  print: 0.9,
  full: 1,
};

// ── Type ────────────────────────────────────────────────────────────────────
// See evergreen/scenes/tokens.js for the two findings behind these names:
// fontconfig will not hand you Roboto's Black face by weight (it has to be
// asked for as "Roboto Black"), and librsvg substitutes a missing family
// silently — so verify.js measures a rendered probe rather than trusting it.
const DISPLAY = "Roboto Black";
const SANS = "Roboto";
const MONO = "Roboto Mono";

const TYPE = {
  micro: { family: MONO, size: 21, weight: 400, tracking: 5.5 },
  small: { family: MONO, size: 26, weight: 400, tracking: 1.5 },
  row: { family: MONO, size: 30, weight: 400, tracking: 0 },
  rowBold: { family: MONO, size: 30, weight: 500, tracking: 0 },

  kicker: { family: MONO, size: 24, weight: 500, tracking: 7 },

  hook: { family: DISPLAY, size: 92, weight: 900, tracking: -2.5, leading: 1.03 },
  hookSm: { family: DISPLAY, size: 74, weight: 900, tracking: -2, leading: 1.05 },
  hookXl: { family: DISPLAY, size: 118, weight: 900, tracking: -3.5, leading: 1.0 },

  sub: { family: SANS, size: 34, weight: 500, tracking: 0, leading: 1.4 },

  mark: { family: SANS, size: 30, weight: 700, tracking: 0.5 },
  handle: { family: MONO, size: 24, weight: 400, tracking: 3 },

  // The non-affiliation line. Small, but it is on the ART, not only in the
  // caption — legal/MARKETING_CLAIMS.md names the failure mode precisely: a
  // claim clipped into a social card without its paired fine print. A frame in
  // this pack that names a retailer carries its disclaimer in the pixels, so
  // the two cannot be separated by a screenshot.
  fineprint: { family: SANS, size: 22, weight: 400, tracking: 0.2, leading: 1.3 },
};

const GRID = { unit: 12, margin: 96 };

module.exports = {
  CANVAS, SAFE, COVER, STICKER_BAND, HOOK_ZONE,
  C, FADE, DISPLAY, SANS, MONO, TYPE, GRID,
};
