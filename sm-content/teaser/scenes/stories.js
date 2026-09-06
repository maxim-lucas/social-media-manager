// Teaser pack — the six story frames (1080x1920).
//
// Stories carry the interaction the feed can't: a poll, two question stickers,
// a reminder. Those stickers only exist if they are added inside Instagram, so
// four of these frames leave a deliberate empty band for one — drawing a fake
// sticker would produce a frame that looks interactive and isn't.
//
// The frames also answer a question the feed posts can't: the poll and question
// replies tell you, before launch day, which half of the audience already knows
// price adjustments exist. That is the segmentation the launch pack is aimed at.

const { CANVAS, SAFE, STICKER_BAND, C, FADE, TYPE } = require("./tokens");
const { svg, text, rule, tornEdge, circleMark, stamp, redact, r2 } = require("./paper");
const { messageBlock, rowsBlock, ghostRows, maskedText } = require("./layout");

const W = CANVAS.story.w;
const H = CANVAS.story.h;

// Column stops short of the right action rail (like/share/more), which sits
// over roughly the right 200px of every story.
const COL_X = 130;
const COL_W = W - COL_X - SAFE.story.right; // 750

const kicker = (s, y) =>
  text(s, { x: COL_X, y, size: TYPE.micro.size, tracking: TYPE.micro.tracking, op: FADE.mid });

// ── 01 · the poll ───────────────────────────────────────────────────────────
// Opens the series with a question about the viewer's own behaviour, not about
// us. The answer split is the point; see the note above.
function story01(t) {
  const msg = messageBlock(t.message, { x: COL_X, y: 900, colW: COL_W, max: 76 });
  return svg(
    W,
    H,
    [
      ghostRows({ x: COL_X, y: 470, w: COL_W, count: 4, leading: 54, seed: 33 }),
      rule({ x: COL_X, y: 730, w: COL_W }),
      kicker(t.kicker, 800),
      msg.svg,
      tornEdge({ w: W, h: H, side: "bottom", depth: 40, seed: 7 }),
    ].join("\n"),
    3
  );
}

// ── 02 · the quiet one ──────────────────────────────────────────────────────
// No sticker, no mark. The ghost rows run off the bottom edge with no torn
// edge to stop them, so the receipt reads as continuing past the frame.
function story02(t) {
  const msg = messageBlock(t.message, { x: COL_X, y: 560, colW: COL_W, max: 84 });
  return svg(
    W,
    H,
    [
      msg.svg,
      rule({ x: COL_X, y: 940, w: COL_W }),
      ghostRows({ x: COL_X, y: 1030, w: COL_W, count: 14, leading: 66, seed: 37 }),
      tornEdge({ w: W, h: H, side: "top", depth: 34, seed: 15 }),
    ].join("\n"),
    5
  );
}

// ── 03 · the number ─────────────────────────────────────────────────────────
function story03(t) {
  const msg = messageBlock(t.message, { x: COL_X, y: 1040, colW: COL_W, max: 74 });
  return svg(
    W,
    H,
    [
      kicker(t.kicker, 440),
      text(t.big, {
        // Centred on the text column, not the canvas: the column stops short of
        // the action rail, so canvas-centre reads as pushed right against
        // everything else in the frame.
        x: COL_X + COL_W / 2,
        y: 860,
        size: TYPE.hugeStory.size,
        weight: TYPE.hugeStory.weight,
        tracking: TYPE.hugeStory.tracking,
        anchor: "middle",
        op: FADE.print,
      }),
      rule({ x: COL_X, y: 950, w: COL_W }),
      msg.svg,
      tornEdge({ w: W, h: H, side: "bottom", depth: 40, seed: 7 }),
    ].join("\n"),
    9
  );
}

// ── 04 · the redaction ──────────────────────────────────────────────────────
// Ghost rows with one line blacked out and circled. Says only that something is
// being withheld — which is more interesting than most things we could show.
function story04(t) {
  const rowsY = 560;
  const leading = 74;
  const barRow = 2;
  const barY = rowsY + barRow * leading;
  const MARK_W = COL_W - 60;
  const msg = messageBlock(t.message, { x: COL_X, y: 940, colW: COL_W, max: 80 });
  return svg(
    W,
    H,
    [
      ghostRows({ x: COL_X, y: rowsY, w: COL_W, count: 2, leading, seed: 35 }),
      ghostRows({ x: COL_X, y: rowsY + (barRow + 1) * leading, w: COL_W, count: 2, leading, seed: 39 }),
      // The circle has to close outside the bars it encloses, and the marker
      // filter displaces it a further few px, so the redacted row is inset from
      // the column: at full width the circle reached into the action rail.
      redact({ x: COL_X, y: barY + 30, w: MARK_W * 0.52, h: 40, seed: 51 }),
      redact({ x: COL_X + MARK_W - MARK_W * 0.22, y: barY + 30, w: MARK_W * 0.22, h: 40, seed: 52 }),
      circleMark({
        cx: COL_X + MARK_W / 2,
        cy: barY + 14,
        rx: MARK_W / 2 + 16,
        ry: 44,
        rotate: -1.8,
        seed: 24,
      }),
      msg.svg,
      tornEdge({ w: W, h: H, side: "top", depth: 34, seed: 15 }),
      tornEdge({ w: W, h: H, side: "bottom", depth: 40, seed: 7 }),
    ].join("\n"),
    11
  );
}

// ── 05 · "IT WAS ALWAYS THIRTY." ────────────────────────────────────────────
// Every value blacked out except one, which reads 30. The frame teaches the
// motif without explaining it: by now 30 has appeared three times.
function story05(t) {
  const rows = rowsBlock(t.rows, { x: COL_X, y: 620, colW: COL_W, leading: 82, seed: 46 });
  const msg = messageBlock(t.message, { x: COL_X, y: 1080, colW: COL_W, max: 84 });
  return svg(
    W,
    H,
    [
      rows.svg,
      rule({ x: COL_X, y: 980, w: COL_W }),
      msg.svg,
      tornEdge({ w: W, h: H, side: "bottom", depth: 40, seed: 7 }),
    ].join("\n"),
    15
  );
}

// ── 06 · the stamp ──────────────────────────────────────────────────────────
// The only frame that shows the mark, and it shows it alone: no wordmark, no
// store badge, no link. It asks for a notification, which is the one conversion
// a teaser is entitled to ask for.
function story06(t, date) {
  const msg = messageBlock(t.message, { x: COL_X, y: 970, colW: COL_W, max: 84 });
  return svg(
    W,
    H,
    [
      stamp({ x: COL_X + 40, y: 470, size: 196, rotate: -7 }),
      maskedText(date, { x: COL_X, y: 870, size: 50, weight: 500, op: FADE.read }),
      msg.svg,
      text(t.footer, { x: COL_X, y: 1170, size: TYPE.small.size, tracking: 2, op: FADE.mid }),
      tornEdge({ w: W, h: H, side: "top", depth: 34, seed: 21 }),
    ].join("\n"),
    17
  );
}

const BUILDERS = [story01, story02, story03, story04, story05, story06];

function buildStory(index, t, date) {
  return BUILDERS[index](t, date);
}

module.exports = { buildStory, COL_X, COL_W, W, H, STICKER_BAND };
