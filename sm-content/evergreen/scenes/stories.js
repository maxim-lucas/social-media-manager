// Evergreen pack — the 9:16 story scene.
//
// Stories are the daily presence between feed posts, so they are built to be
// read in under two seconds and, on most frames, to be tapped.
//
// The geometry is dictated by two constraints that fight each other:
//
//   SAFE.story     IG's own chrome — header, caption bar, right action rail.
//   STICKER_BAND   y 1210-1510, left empty for a native poll/quiz/question/
//                  slider/link sticker. Stickers are only interactive when
//                  added inside Instagram, so the art leaves the room rather
//                  than drawing a fake one.
//
// That leaves y 250-1210 for content on a frame that declares a sticker, and
// y 250-1600 on one that doesn't — which is why the only two content-heavy
// scenes here (`steps` and `receipt`) are also the only two that take no
// sticker. A frame where every element asks for a tap stops feeling like a
// sequence and starts feeling like a survey.

const { CANVAS, SAFE, STICKER_BAND, C, FADE, TYPE, GRID, MONO, SANS } = require("./tokens");
const { defs, field, vignette, strip, text, rule, ghostRows, ghostHeader, glyph, lockup, r2 } = require("./surface");
const { hookBlock, subBlock, fitSize, rowsBlock, circleMark } = require("./layout");

const { w: W, h: H } = CANVAS.story;
const M = GRID.margin;
// The right action rail is wider than the left margin, so the column is not
// centred. Type set to a centred column would drift under the rail.
const COL = W - SAFE.story.left - SAFE.story.right;
const X = SAFE.story.left;
// See posts.js: side bearing + the bleed filter both push ink past a width
// derived from a measurement, so type fits a slightly narrower column.
const TEXT_COL = COL - 20;

// Lockup sits in the gap between the sticker band and the bottom safe zone.
// Narrow on purpose: 1510 -> 1600 is the only strip of frame that is neither
// reserved for a sticker nor covered by IG's reply bar.
const LOCKUP_Y = 1560;

const STRIP = { x: X - 34, w: COL + 84, y: 900, h: 560, angle: -1.7, seed: 41 };

function stripContent(t, s) {
  // Clamped to the story's safe column, not to the strip width — same reason as
  // posts.js: the paper may bleed past the margins, the print may not.
  const x = Math.max(s.x + 66, X);
  const w = Math.min(s.x + s.w - 66, X + COL) - x;
  const out = [ghostHeader({ x: x + w * 0.22, y: s.y + 40, w: w * 0.56, seed: s.seed })];
  const bodyTop = s.y + 150;

  if (t.scene === "steps") {
    t.steps.forEach((label, i) => {
      const y = bodyTop + i * 104;
      out.push(
        `<circle cx="${r2(x + 28)}" cy="${r2(y - 10)}" r="28" fill="none" stroke="${
          C.emeraldDeep
        }" stroke-opacity="0.85" stroke-width="3"/>`,
        text(String(i + 1), {
          x: x + 28,
          y: y + 2,
          size: 32,
          weight: 500,
          op: 0.95,
          fill: C.emeraldDeep,
          anchor: "middle",
        }),
        text(label, { x: x + 78, y, size: 29, op: FADE.print })
      );
      if (i < t.steps.length - 1) out.push(rule({ x: x + 78, y: y + 44, w: w - 78, op: FADE.faint }));
    });
    return out.join("\n");
  }

  const rows = rowsBlock(t.rows, { x, y: bodyTop, colW: w, leading: 66, seed: s.seed + 9 });
  out.push(rows.svg);
  out.push(ghostRows({ x, y: rows.bottom + 50, w, count: 3, leading: 28, seed: s.seed + 3 }));
  out.push(
    circleMark({
      cx: x + w * 0.5,
      cy: rows.rowCenterY(t.circleRow ?? 0),
      rx: w * 0.54,
      maxRx: Math.min(x + w * 0.5 - X, X + COL - (x + w * 0.5)),
      ry: 46,
      seed: s.seed + 5,
      width: 5.5,
    })
  );
  return out.join("\n");
}

async function buildStory(t, handle) {
  const heavy = t.scene === "steps" || t.scene === "receipt";
  const s = STRIP;
  const st = heavy ? strip(s) : { svg: "", transform: "" };

  const kickSize = await fitSize([t.kicker], {
    family: MONO,
    weight: TYPE.kicker.weight,
    colW: TEXT_COL,
    max: TYPE.kicker.size,
    min: 15,
    tracking: TYPE.kicker.tracking,
  });
  const kickerY = t.scene === "mark" ? 620 : 420;
  const kicker = text(t.kicker, {
    x: X,
    y: kickerY,
    size: kickSize,
    weight: TYPE.kicker.weight,
    tracking: TYPE.kicker.tracking,
    family: MONO,
    fill: C.emerald,
    op: 0.95,
  });

  // A frame with no sticker and no strip has the whole middle to fill, so its
  // hook is allowed to run larger. One with a sticker below it must not.
  const hook = await hookBlock(t.hook, {
    x: X,
    y: kickerY + 108,
    colW: TEXT_COL,
    token: heavy ? "hook" : "hookXl",
    min: 52,
  });

  const parts = [field(W, H)];
  if (heavy) {
    parts.push(st.svg, `<g transform="${st.transform}">${stripContent(t, s)}</g>`);
  }
  parts.push(vignette(W, H), kicker, hook.svg);

  if (t.sub && t.sub.length) {
    const subSize = await fitSize(t.sub, {
      family: SANS,
      weight: TYPE.sub.weight,
      colW: TEXT_COL,
      max: TYPE.sub.size,
      min: 24,
    });
    parts.push(subBlock(t.sub, { x: X, y: hook.bottom + 88, colW: TEXT_COL, size: subSize }).svg);
  }

  if (t.scene === "mark") {
    parts.push(glyph({ x: X, y: 330, size: 168, stroke: C.emerald, width: 2.9, glowOn: true }));
  } else if (!heavy) {
    // A frame with no strip has ~570px of dead field between its hook and the
    // sticker band. Left empty it reads as an unfinished slide; the sticker does
    // not fill it, because the sticker sits *below* it. So the mark is blown up
    // as a watermark — brand at a glance, and deliberately faint enough that a
    // poll or question dropped on top of it stays the loudest thing on screen.
    // Sized and positioned to stop short of STICKER_BAND.y.
    const gs = 460;
    parts.push(
      `<g opacity="0.09">${glyph({
        x: W / 2 - gs / 2,
        y: STICKER_BAND.y - gs - 70,
        size: gs,
        stroke: C.emeraldGlow,
        width: 2.4,
      })}</g>`
    );
  }

  parts.push(lockup({ x: X, y: LOCKUP_Y, handle }));

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
${defs(s.seed)}
${parts.join("\n")}
</svg>`;
}

module.exports = { buildStory, W, H, X, COL, LOCKUP_Y, STICKER_BAND };
