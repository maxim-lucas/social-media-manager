// Community pack — the 4:5 feed scenes.
//
// Two builders live here because they share a canvas and nothing else:
//
//   buildPost     the wave frames (00-05). Same composition as the evergreen
//                 post — kicker / hook / sub / paper strip / lockup — because
//                 this is the same voice on a new subject, and a second
//                 composition would read as a second product.
//
//   buildDivider  the bilingual seam slide. Centred, no strip, no hook zone
//                 rule. It is not a post: it is slide N of a carousel whose
//                 only job is to say "the French half starts here". A frame
//                 that exists to point somewhere else must not look like a
//                 frame that wants to be read.
//
// What this pack adds to the evergreen post composition:
//
//   accent "leaf"   the made-in-Canada gesture — the one non-emerald element
//                   in the whole system, and the reason it is allowed is that
//                   it is the only frame whose subject is not the mechanic.
//   accent "seam"   chevrons on the field, for the language-notice post.
//   fineprint       the non-affiliation line, rendered ABOVE the lockup on any
//                   frame that names a retailer. See claims.js for why it is on
//                   the art and not only in the caption.

const { CANVAS, SAFE, HOOK_ZONE, C, FADE, TYPE, GRID, MONO, SANS } = require("./tokens");
const {
  defs,
  field,
  vignette,
  strip,
  text,
  typed,
  rule,
  ghostRows,
  ghostHeader,
  glyph,
  lockup,
  leaf,
  finePrint,
  seamChevrons,
  watermark,
  r2,
  monoWidth,
  ADV,
} = require("./surface");
const { hookBlock, subBlock, fitSize, rowsBlock, circleMark, fallArrow, checkRow } = require("./layout");
const { WATERMARK } = require("../../brand/mark");

const { w: W, h: H } = CANVAS.post;
const M = GRID.margin;
const COL = W - M * 2;

// Type is fitted to a column slightly narrower than the layout column: the
// first glyph's left side bearing (the fit measures ink, <text> positions by
// origin) plus the bleed filter's spread both live in that gap. Inherited from
// the evergreen pack, where it was a shipped defect before it was a constant.
const TEXT_COL = COL - 20;

const STRIP_TOP = 700;

const STRIPS = {
  top: { x: M - 40, w: COL + 80, y: STRIP_TOP, h: 470, angle: -1.6, seed: 11 },
  bottom: { x: M + 52, w: COL - 52, y: STRIP_TOP + 12, h: 458, angle: 1.3, seed: 23 },
  band: { x: -48, w: W + 96, y: STRIP_TOP + 20, h: 440, angle: -2.3, seed: 37 },
};

// The fineprint sits between the strip and the lockup, at a fixed y — a
// disclaimer that moves frame to frame is one the eye learns to skip.
//
// It does not fit there by default. A full-height strip bottoms out at 1170
// and the lockup's cap line starts around 1196, so the first draft rendered the
// disclaimer straight across the receipt's torn edge: white type on pale paper,
// completely illegible, on the ONE frame whose whole compliance argument is
// that the disclaimer is in the pixels. The frame that most needs its fine
// print readable was the frame that hid it.
//
// So a frame carrying fineprint gets a SHORTER strip. The paper yields, not the
// disclaimer — which is the correct precedence, and cheap: the strip content on
// these frames is a store checklist, which was never using the extra height.
const FINEPRINT_Y = H - 220;
const FINEPRINT_STRIP_TRIM = 86;

/** Content laid on the paper, per accent. Strip-local coordinates; the caller
 *  wraps it in the strip's rotation. */
function stripContent(t, s) {
  // Clamped to the PAGE margins, not to the strip's own width: the `band` strip
  // is wider than the canvas so its torn edges run off both sides. The paper may
  // bleed past the margin. What is printed on it may not.
  const x = Math.max(s.x + 74, M);
  const w = Math.min(s.x + s.w - 74, W - M) - x;
  const out = [];

  // The leaf goes down FIRST, under the print, as a watermark.
  //
  // It was a stamp for one draft — outlined, 150px, hung bottom-right the way a
  // "PAID" stamp lands on a receipt. Two things went wrong and both are worth
  // writing down. It collided with the last row, because the rows are
  // right-aligned and so was the stamp; and at 150px an OUTLINED maple leaf is
  // not a leaf, it is a red splat — the points ARE the shape's identity, and an
  // outline gives every point the same weight as the empty space between them.
  // Filled, large and faint fixes both at once: nothing can collide with a
  // watermark, and a silhouette is the one drawing of a maple leaf that
  // survives being small.
  if (t.accent === "leaf") {
    // Rotated, because a watermark set dead square to the frame reads as a
    // background pattern; a few degrees off axis reads as something that was
    // applied to this particular piece of paper.
    const ls = Math.min(w * 0.52, s.h * 0.74);
    const lx = x + w / 2 - ls / 2;
    const ly = s.y + s.h / 2 - ls / 2 + 10;
    out.push(
      `<g transform="rotate(-7 ${r2(lx + ls / 2)} ${r2(ly + ls / 2)})">${leaf({
        x: lx,
        y: ly,
        size: ls,
        fill: C.leaf,
        op: 0.19,
      })}</g>`
    );
  }

  out.push(ghostHeader({ x: x + w * 0.22, y: s.y + 44, w: w * 0.56, seed: s.seed }));

  const bodyTop = s.y + 152;

  if (t.accent === "checks") {
    t.checks.forEach(([label, state], i) => {
      out.push(checkRow({ x, y: bodyTop + i * 54, w, label, state, size: 28 }));
    });
    return out.join("\n");
  }

  if (t.accent === "steps") {
    // Same arithmetic as the story scene, same reason: monospaced step text has
    // a computable width, and assuming one is how a longer translation ends up
    // past the margin. See stories.js for the frame that caught it.
    const avail = w - 72 - 12;
    const longest = Math.max(...t.steps.map((s) => s.length));
    const stepSize = Math.max(20, Math.min(28, Math.floor(avail / (longest * ADV))));
    t.steps.forEach((label, i) => {
      const y = bodyTop + i * 96;
      out.push(
        `<circle cx="${r2(x + 26)}" cy="${r2(y - 10)}" r="26" fill="none" stroke="${
          C.emeraldDeep
        }" stroke-opacity="0.85" stroke-width="3"/>`,
        text(String(i + 1), {
          x: x + 26,
          y: y + 1,
          size: 30,
          weight: 500,
          op: 0.95,
          fill: C.emeraldDeep,
          anchor: "middle",
        }),
        text(label, { x: x + 72, y, size: stepSize, op: FADE.print })
      );
      if (i < t.steps.length - 1) out.push(rule({ x: x + 72, y: y + 40, w: w - 72, op: FADE.faint }));
    });
    return out.join("\n");
  }

  if (t.accent === "ballot") {
    // Ruled lines drawn as strokes, not typed underscores: Roboto Mono's "_"
    // leaves a gap at every character boundary, so a row of them renders as a
    // dashed stub two-thirds the column width — which reads as an empty frame
    // rather than as a form waiting to be filled in.
    t.ballot.forEach((prefix, i) => {
      const y = bodyTop + 44 + i * 92;
      out.push(text(prefix, { x, y, size: TYPE.row.size, op: FADE.mid }));
      out.push(
        `<line x1="${r2(x + 62)}" y1="${r2(y + 12)}" x2="${r2(x + w)}" y2="${r2(
          y + 12
        )}" stroke="${C.ink}" stroke-opacity="${FADE.mid}" stroke-width="2.6"/>`
      );
    });
    out.push(
      `<rect x="${r2(x + 74)}" y="${r2(bodyTop + 44 - 34)}" width="5" height="44" rx="2" fill="${
        C.emerald
      }" fill-opacity="0.95"/>`
    );
    return out.join("\n");
  }

  const rows = rowsBlock(t.rows, { x, y: bodyTop, colW: w, leading: 62, seed: s.seed + 9 });
  out.push(rows.svg);
  if (t.accent !== "glyph" && t.accent !== "leaf") {
    out.push(ghostRows({ x, y: rows.bottom + 46, w, count: 3, leading: 26, seed: s.seed + 3 }));
  }

  if (t.accent === "circle" || t.accent === "status") {
    const i = t.circleRow ?? 0;
    out.push(
      circleMark({
        cx: x + w * 0.5,
        cy: rows.rowCenterY(i),
        rx: w * 0.54,
        maxRx: Math.min(x + w * 0.5 - M, W - M - (x + w * 0.5)),
        ry: 44,
        seed: s.seed + 5,
        width: 5.5,
      })
    );
  }

  if (t.accent === "status") {
    const label = t.statusLabel;
    const padH = 22;
    const tw = monoWidth(label, 26) + padH * 2;
    const bx = x + w - tw;
    const by = rows.bottom + 96;
    out.push(
      `<rect x="${r2(bx)}" y="${r2(by - 34)}" width="${r2(tw)}" height="46" rx="23" fill="${
        C.emeraldDeep
      }" fill-opacity="0.94"/>`,
      text(label, { x: bx + tw / 2, y: by - 3, size: 26, weight: 500, tracking: 2, fill: "#ffffff", op: 1, anchor: "middle" })
    );
  }

  if (t.accent === "glyph") {
    // Stamped, not placed: rotated off-axis and hung low, the way a "PAID" stamp
    // lands on a real receipt.
    //
    // This was drawn at FULL opacity — a luminance delta of about 139 against
    // the paper, louder than the print it sits under, while the same mark on a
    // story frame was drawn at 0.09 and could not be seen at all. Two authors,
    // both writing an alpha, both meaning "faint". brand/mark.js states the
    // strength as a contrast instead, so the two are now recognisably one mark.
    const gs = WATERMARK.onPaper.size;
    out.push(
      watermark({ x: x + w / 2 - gs / 2, y: s.y + s.h - gs - 78, on: "paper" })
    );
  }

  return out.join("\n");
}

async function buildPost(t, handle) {
  const hasFine = !!(t.fineprint && t.fineprint.length);
  const s = hasFine ? { ...STRIPS[t.layout], h: STRIPS[t.layout].h - FINEPRINT_STRIP_TRIM } : STRIPS[t.layout];
  const st = strip(s);

  // ── kicker ────────────────────────────────────────────────────────────────
  const kickSize = await fitSize([t.kicker], {
    family: MONO,
    weight: TYPE.kicker.weight,
    colW: TEXT_COL,
    max: TYPE.kicker.size,
    min: 16,
    tracking: TYPE.kicker.tracking,
  });
  // 132 and not lower: the hook's baseline sits at HOOK_TOP and its caps rise
  // ~0.72em above it, so at the largest permitted hook size the two lines are
  // 33px apart. Any lower and a two-word English hook overprints its own kicker.
  const kickerY = 132;
  const kicker = text(t.kicker, {
    x: M,
    y: kickerY,
    size: kickSize,
    weight: TYPE.kicker.weight,
    tracking: TYPE.kicker.tracking,
    family: MONO,
    // The made-in-Canada frames take a leaf-coloured kicker so the one frame
    // whose subject is not the mechanic signals that before it is read.
    fill: t.accent === "leaf" ? C.leaf : C.emerald,
    op: 0.95,
  });

  // ── hook ──────────────────────────────────────────────────────────────────
  // Anchored to the TOP of the hook zone and grown downward, so a three-line
  // French hook and a two-line English one start at the same y. The vertical
  // budget is worked backwards from the strip: the sub-line needs ~2 lines plus
  // its gap, and 28px of air has to remain above the paper.
  const HOOK_TOP = HOOK_ZONE.y + 162;
  const SUB_GAP = 78;
  const SUB_BUDGET = TYPE.sub.size * TYPE.sub.leading * 2 + 28;
  const hook = await hookBlock(t.hook, {
    x: M,
    y: HOOK_TOP,
    colW: TEXT_COL,
    token: "hookXl",
    min: 52,
    maxH: STRIP_TOP - HOOK_TOP - SUB_GAP - SUB_BUDGET,
    // Bilingual frames set the French line full weight and the English under it
    // dimmed, same size. See layout.js hookBlock.
    ops: t.hookOps,
  });

  // ── sub ───────────────────────────────────────────────────────────────────
  const subSize = await fitSize(t.sub, {
    family: SANS,
    weight: TYPE.sub.weight,
    colW: TEXT_COL,
    max: TYPE.sub.size,
    min: 25,
  });
  const sub = subBlock(t.sub, {
    x: M,
    y: Math.max(hook.bottom + SUB_GAP, 540),
    colW: TEXT_COL,
    size: subSize,
    ops: t.subOps,
  });

  // ── the one gesture that lives on the field, not the paper ────────────────
  let gesture = "";
  if (t.accent === "arrow") gesture = fallArrow({ x: W - M - 210, y: 112, w: 180, h: 116, width: 8 });
  else if (t.accent === "seam") {
    // A chevron pair is not the same SHAPE in both directions, and the frame
    // that turned these from "down" to "right" found that out from the gate.
    //
    //   down    spans cx +/- arm horizontally, cy .. cy + gap + 0.62*arm down
    //   right   spans cx .. cx + gap + 0.62*arm across, cy +/- arm vertically
    //
    // So the position that cleared the margins pointing down put 337px in the
    // top margin and 548px in the right one pointing right. Anchored to the
    // safe box instead of to the canvas: the pair's own extent is subtracted
    // from the margin rather than guessed at.
    const arm = 52;
    const gap = 50;
    gesture = seamChevrons({
      cx: W - SAFE.post.right - (gap + arm * 0.62) - 8,
      cy: SAFE.post.top + arm + 12,
      w: arm * 2,
      gap,
      dir: t.seamDir || "right",
    });
  }

  // ── the non-affiliation line ──────────────────────────────────────────────
  const fine = hasFine ? finePrint(t.fineprint, { x: M, y: FINEPRINT_Y, colW: TEXT_COL }) : "";

  const body = [
    field(W, H),
    st.svg,
    `<g transform="${st.transform}">${stripContent(t, s)}</g>`,
    vignette(W, H),
    kicker,
    gesture,
    hook.svg,
    sub.svg,
    fine,
    // H-132 and not H-92: lockup() hangs a second line 32px BELOW its baseline,
    // and at H-92 that handle line landed inside the bottom margin.
    lockup({ x: M, y: H - 132, handle }),
  ].join("\n");

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
${defs(s.seed)}
${body}
</svg>`;
}

// ── The bilingual seam slide ────────────────────────────────────────────────
//
// Dropped between the English half and the French half of a carousel, and
// usable as a standalone feed post. It is centred, and centring is otherwise
// forbidden in this system — which is the point. Every other frame in every
// pack is left-aligned, so a centred frame reads as an interruption before a
// single word of it has been parsed, which is the whole job.
//
// It carries NO hook and NO strip. There is nothing to sell on a signpost.
async function buildDivider(t, handle) {
  const cx = W / 2;
  const seed = 53;

  const overSize = await fitSize([t.over], {
    family: MONO,
    weight: TYPE.kicker.weight,
    colW: TEXT_COL,
    max: TYPE.kicker.size,
    min: 15,
    tracking: TYPE.kicker.tracking,
  });

  const word = await hookBlock(t.word, {
    x: M,
    y: 596,
    colW: TEXT_COL,
    token: "hookXl",
    min: 60,
    align: "middle",
  });

  const subSize = await fitSize(t.sub, {
    family: SANS,
    weight: TYPE.sub.weight,
    colW: TEXT_COL,
    max: TYPE.sub.size,
    min: 24,
  });
  const subLeading = subSize * TYPE.sub.leading;
  const subY = word.bottom + 96;
  const sub = t.sub
    .map((line, i) =>
      text(line, {
        x: cx,
        y: subY + i * subLeading,
        size: subSize,
        weight: TYPE.sub.weight,
        family: SANS,
        fill: C.inkOnField,
        // French line bright, English line under it dimmed. See subBlock().
        op: t.subOps && t.subOps[i] != null ? t.subOps[i] : 0.66,
        anchor: "middle",
      })
    )
    .join("\n");

  const body = [
    field(W, H),
    vignette(W, H),
    // The rule above the word is what makes this a divider rather than a title
    // card: a horizontal line across a frame is the one graphic every reader
    // already knows means "the thing before this has ended".
    rule({ x: M, y: 470, w: COL, op: 0.3 }),
    text(t.over, {
      x: cx,
      y: 420,
      size: overSize,
      weight: TYPE.kicker.weight,
      tracking: TYPE.kicker.tracking,
      family: MONO,
      fill: C.emerald,
      op: 0.9,
      anchor: "middle",
    }),
    word.svg,
    sub,
    seamChevrons({ cx, cy: subY + subLeading * t.sub.length + 96, w: 118, gap: 56, dir: t.seamDir || "right", width: 12 }),
    lockup({ x: M, y: H - 132, handle }),
  ].join("\n");

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
${defs(seed)}
${body}
</svg>`;
}

module.exports = { buildPost, buildDivider, STRIPS, W, H, M, COL, FINEPRINT_Y };
