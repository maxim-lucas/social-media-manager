// Evergreen pack — the 4:5 feed post scene.
//
// Nine posts, one composition. The variation is deliberate and narrow:
//
//   kicker      y  ~150   mono, tracked, emerald         — the small promise
//   hook        y  ~250   Roboto Black, auto-fit, white  — inside HOOK_ZONE
//   sub         y  ~520   Roboto, muted, two lines       — where the hedging lives
//   strip       y  ~640   thermal paper, rotated         — carries the evidence
//   lockup      y ~1270   mark + wordmark + handle
//
// Everything above the strip is type on the dark field; everything on the strip
// is print on paper. Keeping that boundary absolute is what makes nine frames
// read as one system rather than as nine layouts.
//
// The hook is pinned inside HOOK_ZONE on every frame because the top third is
// all the feed shows before someone taps, and it is roughly what the profile
// grid thumbnail shows. A hook below the fold is a hook nobody read.

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
  r2,
  monoWidth,
  isContentMode,
} = require("./surface");
const { hookBlock, subBlock, fitSize, rowsBlock, circleMark, fallArrow, checkRow, REDACTED } = require("./layout");

const { w: W, h: H } = CANVAS.post;
const M = GRID.margin;
const COL = W - M * 2;

// Type is fitted to a column slightly narrower than the layout column. Two
// things push rendered ink past a width that was computed from a measurement:
// the first glyph's left side bearing (the fit measures ink, <text> positions
// by origin), and the `bleed` filter, which spreads every edge by a fraction of
// a pixel. 20px absorbs both. Without it the widest lines clip the margin gate.
const TEXT_COL = COL - 20;

// Strip geometry per layout variant. Same composition, three different pieces
// of paper — enough that the grid has rhythm, not so much that it fragments.
// STRIP_TOP is the floor everything above it is budgeted against; the three
// variants only differ in width, x-offset and angle, so the strip lands in the
// same place on all nine frames and the grid reads as one pack.
const STRIP_TOP = 700;

const STRIPS = {
  top: { x: M - 40, w: COL + 80, y: STRIP_TOP, h: 470, angle: -1.6, seed: 11 },
  bottom: { x: M + 52, w: COL - 52, y: STRIP_TOP + 12, h: 458, angle: 1.3, seed: 23 },
  band: { x: -48, w: W + 96, y: STRIP_TOP + 20, h: 440, angle: -2.3, seed: 37 },
};

/** Content laid on the paper, per accent. Returns SVG already positioned in
 *  strip-local coordinates (the caller wraps it in the strip's rotation). */
function stripContent(t, s) {
  // The content column is clamped to the PAGE margins, not to the strip's own
  // width. The `band` strip is deliberately wider than the canvas so its torn
  // edges run off both sides — laying print out relative to that strip pushed
  // the redaction bars and the circle mark off-frame. The paper may bleed; what
  // is printed on it may not.
  const x = Math.max(s.x + 74, M);
  const w = Math.min(s.x + s.w - 74, W - M) - x;
  const out = [];

  // Every strip opens with the illegible header a real receipt starts with.
  // Never a retailer name — this pack is store-agnostic by design, and naming
  // one would drag the non-affiliation regime into a frame about a mechanic.
  out.push(ghostHeader({ x: x + w * 0.22, y: s.y + 44, w: w * 0.56, seed: s.seed }));

  const bodyTop = s.y + 152;

  if (t.accent === "checks") {
    t.checks.forEach(([label, state], i) => {
      out.push(checkRow({ x, y: bodyTop + i * 54, w, label, state, size: 28 }));
    });
    return out.join("\n");
  }

  if (t.accent === "steps") {
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
        text(label, { x: x + 72, y, size: 28, op: FADE.print })
      );
      if (i < t.steps.length - 1) out.push(rule({ x: x + 72, y: y + 40, w: w - 72, op: FADE.faint }));
    });
    return out.join("\n");
  }

  if (t.accent === "ballot") {
    // Ruled lines drawn as strokes, not typed underscores. Roboto Mono's "_"
    // leaves a gap at every character boundary, so a row of them renders as a
    // dashed stub two-thirds the width of the column — which read as an empty
    // frame rather than as a form waiting to be filled in.
    t.ballot.forEach((prefix, i) => {
      const y = bodyTop + 44 + i * 92;
      out.push(text(prefix, { x, y, size: TYPE.row.size, op: FADE.mid }));
      out.push(
        `<line x1="${r2(x + 62)}" y1="${r2(y + 12)}" x2="${r2(x + w)}" y2="${r2(
          y + 12
        )}" stroke="${C.ink}" stroke-opacity="${FADE.mid}" stroke-width="2.6"/>`
      );
    });
    // A green caret on the first blank: the frame is asking for input.
    out.push(
      `<rect x="${r2(x + 74)}" y="${r2(bodyTop + 44 - 34)}" width="5" height="44" rx="2" fill="${
        C.emerald
      }" fill-opacity="0.95"/>`
    );
    return out.join("\n");
  }

  // The remaining accents all sit on receipt rows.
  const rows = rowsBlock(t.rows, { x, y: bodyTop, colW: w, leading: 62, seed: s.seed + 9 });
  out.push(rows.svg);
  // The glyph frame skips the faded filler: it is the profile's top-left tile,
  // so the mark is the subject and nothing else on the paper competes with it.
  if (t.accent !== "glyph") {
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
    // Stamped, not placed: rotated off-axis and hung under a short rule, the
    // way a "PAID" stamp lands on a real receipt.
    const gs = 172;
    const gx = x + w / 2 - gs / 2;
    const gy = s.y + s.h - gs - 78;
    out.push(
      `<g transform="rotate(-7 ${r2(gx + gs / 2)} ${r2(gy + gs / 2)})">${glyph({
        x: gx,
        y: gy,
        size: gs,
        stroke: C.emeraldDeep,
        width: 3.1,
      })}</g>`
    );
  }

  return out.join("\n");
}

async function buildPost(t, handle) {
  const s = STRIPS[t.layout];
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
  // 132, not lower: the hook's baseline sits at HOOK_TOP and its caps rise
  // ~0.72em above that, so at the largest permitted hook size the two lines are
  // 33px apart. Any lower and a two-word English hook overprints its own kicker.
  const kickerY = 132;
  const kicker = text(t.kicker, {
    x: M,
    y: kickerY,
    size: kickSize,
    weight: TYPE.kicker.weight,
    tracking: TYPE.kicker.tracking,
    family: MONO,
    fill: C.emerald,
    op: 0.95,
  });

  // ── hook ──────────────────────────────────────────────────────────────────
  // Anchored to the TOP of the hook zone and allowed to grow downward, so a
  // three-line French hook and a two-line English one start at the same y.
  // Vertical budget, worked backwards from the strip: the sub-line needs
  // ~2 lines plus its gap, and 28px of air has to remain above the paper.
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
  });

  // ── sub ───────────────────────────────────────────────────────────────────
  const subSize = await fitSize(t.sub, {
    family: SANS,
    weight: TYPE.sub.weight,
    colW: TEXT_COL,
    max: TYPE.sub.size,
    min: 25,
  });
  const sub = subBlock(t.sub, { x: M, y: Math.max(hook.bottom + SUB_GAP, 540), colW: TEXT_COL, size: subSize });

  // ── the one green gesture that lives on the field, not the paper ──────────
  const arrow =
    t.accent === "arrow"
      ? fallArrow({ x: W - M - 210, y: 112, w: 180, h: 116, width: 8 })
      : "";

  const body = [
    field(W, H),
    st.svg,
    `<g transform="${st.transform}">${stripContent(t, s)}</g>`,
    vignette(W, H),
    kicker,
    arrow,
    hook.svg,
    sub.svg,
    // H-132, not H-92: lockup() hangs a second line 32px BELOW its baseline,
    // and at H-92 that handle line landed inside the bottom margin.
    lockup({ x: M, y: H - 132, handle }),
  ].join("\n");

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
${defs(s.seed)}
${body}
</svg>`;
}

module.exports = { buildPost, STRIPS, W, H, M, COL };
