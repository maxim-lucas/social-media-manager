// Teaser pack — the four feed posts (1080x1350).
//
// Read as a sequence, they escalate: an instruction with no context, then
// something being hidden, then a number with no unit, then the closest thing to
// a hint the pack allows. Nothing names the product, the category or a
// retailer. The "01 / 04" tick in the corner is what turns four odd images into
// a countdown people wait out.

const { CANVAS, SAFE, C, FADE, TYPE } = require("./tokens");
const { svg, text, rule, tornEdge, circleMark, stamp, seqTick, ghostHeader } = require("./paper");
const { messageBlock, rowsBlock, ghostRows, maskedText } = require("./layout");

const W = CANVAS.post.w;
const H = CANVAS.post.h;

// The receipt column. Narrower than the safe area on purpose — a receipt is a
// 3-inch strip, and keeping the type inside that width is most of why this
// pack reads as paper rather than as a poster.
const COL_X = 150;
const COL_W = 780;
const TICK_Y = 1246; // baseline of the sequence tick, clear of the 96px margin
const TOTAL = 4;

const kicker = (s, y) =>
  text(s, { x: COL_X, y, size: TYPE.micro.size, tracking: TYPE.micro.tracking, op: FADE.mid });

// ── 01 · "DON'T THROW THIS OUT." ────────────────────────────────────────────
// The whole frame is a receipt too faded to read, and one line printed over it
// in fresh ink. No emerald anywhere: post 01 must not look like a brand at all.
function post01(t, date) {
  const msg = messageBlock(t.message, { x: COL_X, y: 900, colW: COL_W, max: 100 });
  return svg(
    W,
    H,
    [
      ghostHeader({ x: COL_X, y: 200, w: COL_W, seed: 12 }),
      ghostRows({ x: COL_X, y: 390, w: COL_W, count: 5, leading: 58, seed: 31 }),
      rule({ x: COL_X, y: 690, w: COL_W }),
      kicker(t.kicker, 760),
      msg.svg,
      seqTick({ x: COL_X, y: TICK_Y, n: 1, total: TOTAL }),
      tornEdge({ w: W, h: H, side: "bottom", depth: 40, seed: 7 }),
    ].join("\n"),
    3
  );
}

// ── 02 · "THE LINE NOBODY READS." ───────────────────────────────────────────
// Torn on both edges: a crop from the middle of a receipt. Everything is
// legible except the one line that matters, which is blacked out and circled by
// hand. First appearance of emerald, and it is a marker scrawl, not a logo.
function post02(t) {
  const REDACTED_ROW = 3;
  const rowsY = 360;
  const leading = 68;
  const rows = rowsBlock(t.rows, { x: COL_X, y: rowsY, colW: COL_W, leading, seed: 41 });
  const msg = messageBlock(t.message, { x: COL_X, y: 900, colW: COL_W, max: 92 });
  return svg(
    W,
    H,
    [
      kicker(t.kicker, 250),
      rows.svg,
      circleMark({
        cx: COL_X + COL_W / 2,
        cy: rows.rowCenterY(REDACTED_ROW),
        rx: COL_W / 2 + 18,
        ry: 42,
        rotate: -1.6,
        seed: 22,
      }),
      rule({ x: COL_X, y: 790, w: COL_W }),
      msg.svg,
      seqTick({ x: COL_X, y: TICK_Y, n: 2, total: TOTAL }),
      tornEdge({ w: W, h: H, side: "top", depth: 34, seed: 15 }),
      tornEdge({ w: W, h: H, side: "bottom", depth: 40, seed: 7 }),
    ].join("\n"),
    5
  );
}

// ── 03 · "WHAT HAPPENS ON DAY 31?" ──────────────────────────────────────────
// A number with no unit and no subject. It is the product's actual mechanic
// (the price-adjustment window), which is what makes the whole series pay off
// in hindsight — but on its own it says nothing at all.
function post03(t) {
  const msg = messageBlock(t.message, { x: COL_X, y: 1010, colW: COL_W, max: 78 });
  return svg(
    W,
    H,
    [
      kicker(t.kicker, 280),
      text(t.big, {
        x: W / 2,
        y: 800,
        size: TYPE.huge.size,
        weight: TYPE.huge.weight,
        tracking: TYPE.huge.tracking,
        anchor: "middle",
        op: FADE.print,
      }),
      rule({ x: COL_X, y: 890, w: COL_W }),
      msg.svg,
      seqTick({ x: COL_X, y: TICK_Y, n: 3, total: TOTAL }),
      tornEdge({ w: W, h: H, side: "bottom", depth: 40, seed: 7 }),
    ].join("\n"),
    9
  );
}

// ── 04 · "SOME RECEIPTS ARE WORTH MORE THAN YOU THINK." ─────────────────────
// The closest the pack gets to the pitch, and still no promise: "some" and
// "than you think" are doing deliberate compliance work. Every amount is a bar,
// because printing a figure here is exactly what MARKETING_CLAIMS.md forbids.
// The mark is stamped without the wordmark — recognisable later, anonymous now.
function post04(t, date) {
  const rows = rowsBlock(t.rows, { x: COL_X, y: 370, colW: COL_W, leading: 72, seed: 44 });
  const msg = messageBlock(t.message, { x: COL_X, y: 710, colW: COL_W, max: 78 });
  return svg(
    W,
    H,
    [
      kicker(t.kicker, 250),
      rows.svg,
      rule({ x: COL_X, y: 600, w: COL_W }),
      msg.svg,
      stamp({ x: 700, y: 975, size: 168, rotate: -7 }),
      maskedText(date, { x: COL_X, y: 1120, size: 44, weight: 500, op: FADE.read }),
      text(t.footer, { x: COL_X, y: 1185, size: TYPE.small.size, tracking: 2, op: FADE.mid }),
      seqTick({ x: COL_X, y: TICK_Y, n: 4, total: TOTAL }),
      tornEdge({ w: W, h: H, side: "top", depth: 34, seed: 21 }),
    ].join("\n"),
    13
  );
}

const BUILDERS = [post01, post02, post03, post04];

function buildPost(index, t, date) {
  return BUILDERS[index](t, date);
}

module.exports = { buildPost, TOTAL, COL_X, COL_W, W, H };
