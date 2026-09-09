// Community pack — the 9:16 story scene.
//
// Copied from evergreen/scenes/stories.js and extended. The geometry is
// dictated by two constraints that fight each other, and both are inherited:
//
//   SAFE.story     IG's own chrome — header, caption bar, right action rail.
//   STICKER_BAND   y 1210-1510, left empty for a native poll/quiz/question/
//                  slider/link sticker. Stickers are only interactive when
//                  added inside Instagram, so the art leaves the room rather
//                  than drawing a fake one.
//
// That leaves y 250-1210 for content on a frame that declares a sticker, and
// y 250-1600 on one that does not — which is why the content-heavy scenes
// (`steps`, `receipt`, `checks`) are also the ones that take no sticker. A
// frame where every element asks for a tap stops feeling like a sequence and
// starts feeling like a survey.
//
// Scenes added by this pack:
//
//   checks   the store list on paper. The only story that names retailers, so
//            the only one that renders the non-affiliation line.
//   leaf     the made-in-Canada frame.
//   seam     the bilingual signpost, pinned as the FIRST frame of every
//            Highlight. See HIGHLIGHTS.md.

const { CANVAS, SAFE, STICKER_BAND, C, FADE, TYPE, GRID, MONO, SANS, DISPLAY } = require("./tokens");
const {
  defs,
  field,
  vignette,
  strip,
  text,
  rule,
  ghostRows,
  ghostHeader,
  glyph,
  lockup,
  leaf,
  finePrint,
  seamChevrons,
  progressReplica,
  watermark,
  r2,
  ADV,
} = require("./surface");
const { hookBlock, subBlock, fitSize, rowsBlock, circleMark, checkRow } = require("./layout");
const { WATERMARK } = require("../../brand/mark");

const { w: W, h: H } = CANVAS.story;
const M = GRID.margin;
// The right action rail is wider than the left margin, so the column is not
// centred. Type set to a centred column would drift under the rail.
const COL = W - SAFE.story.left - SAFE.story.right;
const X = SAFE.story.left;
const TEXT_COL = COL - 20;

// Lockup sits in the gap between the sticker band and the bottom safe zone.
// Narrow on purpose: 1510 -> 1600 is the only strip of frame that is neither
// reserved for a sticker nor covered by IG's reply bar.
const LOCKUP_Y = 1560;
// The disclaimer hangs just above the lockup, which puts it inside the sticker
// band — so a frame carrying one must declare no sticker. verify.js enforces
// that pairing rather than trusting the author to remember it.
//
// It also lands on the paper unless the paper gets out of the way: a full
// 560-tall strip bottoms out at 1460 before rotation. Same fix as posts.js, and
// same precedence — the strip is trimmed, the disclaimer is not moved. See the
// note there for what the first draft actually looked like.
const FINEPRINT_Y = 1440;
const FINEPRINT_STRIP_TRIM = 80;

const STRIP = { x: X - 34, w: COL + 84, y: 900, h: 560, angle: -1.7, seed: 41 };

// Scenes that put paper on the frame. Everything else is type on the field.
const HEAVY = new Set(["steps", "receipt", "checks"]);

function stripContent(t, s) {
  // Clamped to the story's safe column, not to the strip width — same rule as
  // posts.js: the paper may bleed past the margins, the print may not.
  const x = Math.max(s.x + 66, X);
  const w = Math.min(s.x + s.w - 66, X + COL) - x;
  const out = [ghostHeader({ x: x + w * 0.22, y: s.y + 40, w: w * 0.56, seed: s.seed })];
  const bodyTop = s.y + 150;

  if (t.scene === "steps") {
    // Step text is monospaced, so its width is arithmetic rather than a
    // measurement - and it has to be computed, not assumed. The first version
    // set 29px flat and a three-word-longer French step ran 52px under the
    // story's right action rail. Nothing in the copy was wrong; the layout
    // simply had no idea how wide the words were.
    const avail = w - 78 - 12;
    const longest = Math.max(...t.steps.map((s) => s.length));
    const stepSize = Math.max(20, Math.min(29, Math.floor(avail / (longest * ADV))));
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
        text(label, { x: x + 78, y, size: stepSize, op: FADE.print })
      );
      if (i < t.steps.length - 1) out.push(rule({ x: x + 78, y: y + 44, w: w - 78, op: FADE.faint }));
    });
    return out.join("\n");
  }

  if (t.scene === "checks") {
    t.checks.forEach(([label, state], i) => {
      out.push(checkRow({ x, y: bodyTop + 12 + i * 62, w, label, state, size: 30 }));
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
  const heavy = HEAVY.has(t.scene);
  const hasFine = !!(t.fineprint && t.fineprint.length);
  const s = hasFine ? { ...STRIP, h: STRIP.h - FINEPRINT_STRIP_TRIM } : STRIP;
  const st = heavy ? strip(s) : { svg: "", transform: "" };

  const kickSize = await fitSize([t.kicker], {
    family: MONO,
    weight: TYPE.kicker.weight,
    colW: TEXT_COL,
    max: TYPE.kicker.size,
    min: 15,
    tracking: TYPE.kicker.tracking,
  });
  // The mark and leaf scenes hang a large emblem above the type, so their copy
  // starts lower. Every other scene opens at 420.
  const kickerY = t.scene === "mark" || t.scene === "leaf" || t.scene === "frmark" ? 620 : 420;
  const kicker = text(t.kicker, {
    x: X,
    y: kickerY,
    size: kickSize,
    weight: TYPE.kicker.weight,
    tracking: TYPE.kicker.tracking,
    family: MONO,
    fill: t.scene === "leaf" ? C.leaf : C.emerald,
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
    // Bilingual frames set the French line full weight and the English under it
    // dimmed, at the same size. A frame whose whole subject is that this account
    // is in two languages cannot itself be in one.
    ops: t.hookOps,
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
    parts.push(subBlock(t.sub, { x: X, y: hook.bottom + 88, colW: TEXT_COL, size: subSize, ops: t.subOps }).svg);
  }

  if (t.scene === "mark") {
    parts.push(glyph({ x: X, y: 330, size: 168, stroke: C.emerald, width: 2.9, glowOn: true }));
  } else if (t.scene === "leaf") {
    // 260, not the 196 this used to be. The leaf grew a stem, so at a given box
    // width the BODY is now about three quarters of what the old stemless blob
    // filled. Same box, smaller leaf — the number had to follow the shape.
    parts.push(leaf({ x: X, y: 300, size: 260, fill: C.leaf, op: 0.9 }));
  } else if (t.scene === "seam") {
    // The intro frame, pinned first in every Highlight.
    //
    // It used to carry chevrons and the instruction "keep tapping". That is an
    // instruction rather than information: it asks a francophone to spend an
    // unknown number of taps on a language they do not read, on the word of an
    // account they have just met. The replica of Instagram's own progress bar
    // SHOWS them where the French half starts instead, and the real bar is on
    // screen a few hundred pixels above it, so nothing has to explain it.
    parts.push(
      progressReplica({ x: X, y: 980, w: COL, segments: t.segments || 8, frAt: t.frAt || 4, label: t.frLabel || "FR" }),
      // Right, never down. A story is TAPPED FORWARD; a chevron pointing down
      // tells the reader to do the one thing that will not reach the French.
      seamChevrons({ cx: X + COL / 2, cy: 1300, w: 170, gap: 84, dir: t.seamDir || "right", width: 15 })
    );
  } else if (t.scene === "frmark") {
    // The card the intro points at: the start of the French half, inside the
    // same Highlight. Two letters at full size, which is the most that reads
    // from a tray and the one piece of type that needs no translation.
    parts.push(
      text("FR", {
        x: X,
        y: 560,
        size: 300,
        weight: 900,
        family: DISPLAY,
        tracking: -14,
        fill: C.emeraldGlow,
        op: 0.96,
        bleed: false,
      }),
      seamChevrons({ cx: X + COL / 2, cy: 1300, w: 170, gap: 84, dir: t.seamDir || "right", width: 15 })
    );
  } else if (!heavy) {
    // A frame with no strip has ~570px of dead field between its hook and the
    // sticker band. Left empty it reads as an unfinished slide, and the sticker
    // does not fill it because the sticker sits BELOW it. So the mark is blown
    // up as a watermark — brand at a glance, and still quiet enough that a poll
    // or question dropped on top of it stays the loudest thing on screen.
    //
    // This used to be `<g opacity="0.09">` written by hand here. Measured on the
    // shipped PNGs that was a luminance delta of 19 over the field: findable on
    // a monitor in a dark room, gone on a phone in daylight. It now comes from
    // brand/mark.js, where the strength is specified as a CONTRAST and the alpha
    // is solved from it — and gate 10 asserts the rendered result.
    const gs = WATERMARK.onField.size;
    parts.push(watermark({ x: W / 2 - gs / 2, y: STICKER_BAND.y - gs - 70, on: "field" }));
  }

  if (hasFine) {
    parts.push(finePrint(t.fineprint, { x: X, y: FINEPRINT_Y, colW: TEXT_COL }));
  }

  parts.push(lockup({ x: X, y: LOCKUP_Y, handle }));

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
${defs(s.seed)}
${parts.join("\n")}
</svg>`;
}

module.exports = { buildStory, W, H, X, COL, LOCKUP_Y, FINEPRINT_Y, FINEPRINT_STRIP_TRIM, STICKER_BAND, HEAVY };
