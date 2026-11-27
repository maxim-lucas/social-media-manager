// Evergreen pack — layout helpers shared by the post and story scenes.
//
// The hard problem this file solves: the hook lines are set in Roboto Black,
// which is proportional, and there is no browser here to measure it. The teaser
// pack could compute widths arithmetically because it was monospace throughout
// (every glyph advances exactly 0.6em). Display type has no such shortcut, and
// guessing is not an option — French runs 15-30% longer than English in this
// copy ("NOBODY CHECKS." vs "PERSONNE NE VÉRIFIE.") and a fixed size would
// either overflow the French frame or leave the English one small.
//
// So the type is measured for real: each line is rendered once on a scratch
// canvas and its ink extent read off the alpha channel. Linear in font-size, so
// one probe per unique string is enough for every size we might try.

const sharp = require("sharp");
const { C, FADE, TYPE, MONO } = require("./tokens");
const { text, redact, rng, r2, esc, isContentMode, ADV, monoWidth } = require("./surface");

// ── Measurement ─────────────────────────────────────────────────────────────
const PROBE_SIZE = 100; // reference size; widths scale linearly from here
const PROBE_W = 6000;
const PROBE_H = 260;

const inkCache = new Map();

/**
 * Ink width of `s` set in `family`/`weight` at PROBE_SIZE, in px.
 *
 * Rendered and measured rather than estimated. Tracking is excluded — it is
 * added arithmetically by widthOf() because letter-spacing is a per-gap
 * constant and measuring it per size would double the probe count.
 */
async function probeInk(s, family, weight) {
  const key = `${family}|${weight}|${s}`;
  const hit = inkCache.get(key);
  if (hit !== undefined) return hit;

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${PROBE_W}" height="${PROBE_H}">
    <text x="60" y="${PROBE_H * 0.72}" font-family="${family}" font-size="${PROBE_SIZE}"
          font-weight="${weight}" fill="#000">${esc(s)}</text></svg>`;

  const { data, info } = await sharp(Buffer.from(svg), { density: 72 })
    .extractChannel("alpha")
    .raw()
    .toBuffer({ resolveWithObject: true });

  let min = -1;
  let max = -1;
  for (let x = 0; x < info.width; x++) {
    let inked = false;
    for (let y = 0; y < info.height; y++) {
      if (data[y * info.width + x] > 8) {
        inked = true;
        break;
      }
    }
    if (inked) {
      if (min < 0) min = x;
      max = x;
    }
  }
  // An all-space string has no ink. Fall back to a nominal advance so a blank
  // line does not report width 0 and blow the fit calculation wide open.
  const width = min < 0 ? s.length * PROBE_SIZE * 0.26 : max - min + 1;
  inkCache.set(key, width);
  return width;
}

/** Width of `s` at `size`, including tracking. */
async function widthOf(s, { family, weight, size, tracking = 0 }) {
  const ref = await probeInk(s, family, weight);
  return (ref * size) / PROBE_SIZE + tracking * Math.max(0, s.length - 1);
}

/**
 * Largest size (stepping down by 1px) at which every line still fits `colW`.
 *
 * EN and FR frames get the same layout, each at its own optimal size — which is
 * why the two languages look like one pack instead of like a translation.
 */
async function fitSize(lines, { family, weight, colW, max, min = 34, tracking = 0 }) {
  const real = lines.filter((l) => l && l.trim());
  if (!real.length) return max;
  const refs = await Promise.all(real.map((l) => probeInk(l, family, weight)));

  // width(S) = ref*S/PROBE_SIZE + tracking*(n-1)
  //
  // SVG letter-spacing is an ABSOLUTE length in user units — it does not scale
  // with font-size. Treating it as an em fraction (dividing it by PROBE_SIZE
  // along with the ink measurement) mis-solves the equation, and because the
  // display token's tracking is negative it mis-solves it *upward*: the hook
  // came out a few px wider than the column and clipped the story frames'
  // right action rail. Solved for S properly, tracking stays a constant.
  const sizes = refs.map((ref, i) => {
    const gaps = Math.max(0, real[i].length - 1);
    return ((colW - tracking * gaps) * PROBE_SIZE) / ref;
  });
  return Math.max(min, Math.min(max, Math.floor(Math.min(...sizes))));
}

// ── Blocks ──────────────────────────────────────────────────────────────────

/**
 * The hook: a stack of display lines, auto-fitted to the column.
 *
 * Returns the height it consumed so the caller can flow the sub-line under it
 * without hard-coding a gap that only works in one language.
 */
async function hookBlock(lines, { x, y, colW, token = "hook", min = 44, maxH = Infinity, op = FADE.full, fill = C.inkOnField, align = "start" }) {
  const t = TYPE[token];
  const byWidth = await fitSize(lines, {
    family: t.family,
    weight: t.weight,
    colW,
    max: t.size,
    min,
    tracking: t.tracking,
  });
  // Fitting by width alone is not enough. A three-line hook set at the width-
  // optimal size is half again as tall as a two-line one, and the frame below
  // it — the sub-line, then the paper strip — is at a fixed y. Unbounded, the
  // French three-liners run their sub-line under the paper. So the block is
  // also capped by the vertical budget it was given.
  const nGaps = Math.max(0, lines.length - 1);
  const byHeight = Math.floor(maxH / (t.leading * nGaps + 1));
  const size = Math.max(min, Math.min(byWidth, byHeight));
  const leading = size * t.leading;
  const anchorX = align === "end" ? x + colW : x;
  const svg = lines
    .map((s, i) =>
      text(s, {
        x: anchorX,
        y: y + i * leading,
        size,
        weight: t.weight,
        tracking: t.tracking,
        family: t.family,
        op,
        fill,
        anchor: align,
      })
    )
    .join("\n");
  return { svg, size, leading, bottom: y + leading * (lines.length - 1), height: leading * (lines.length - 1) + size };
}

/** The qualifying line under a hook. Never larger than TYPE.sub — a condition
 *  set as big as the claim reads as part of the claim. */
function subBlock(lines, { x, y, colW, op = 0.68, fill = C.inkOnField, size = TYPE.sub.size }) {
  const leading = size * TYPE.sub.leading;
  const svg = lines
    .map((s, i) =>
      text(s, { x, y: y + i * leading, size, weight: TYPE.sub.weight, family: TYPE.sub.family, op, fill })
    )
    .join("\n");
  return { svg, leading, bottom: y + leading * (lines.length - 1), height: leading * (lines.length - 1) + size };
}

// ── Receipt rows ────────────────────────────────────────────────────────────
// A value (or label) of "__REDACTED__" becomes a solid ink bar instead of text.
// The pack never prints an amount it would have to stand behind, so the bar is
// doing compliance work, not styling. See EVERGREEN-NOTES.md § Compliance.
const REDACTED = "__REDACTED__";

function rowsBlock(rowDefs, { x, y, colW, leading = 56, size = TYPE.row.size, op = FADE.read, seed = 40 }) {
  const out = [];
  rowDefs.forEach(([label, value], i) => {
    const ry = y + i * leading;
    const labelRedacted = label === REDACTED;
    const valueRedacted = value === REDACTED;

    if (labelRedacted && valueRedacted) {
      out.push(redact({ x, y: ry, w: colW * 0.44, h: size * 1.05, seed: seed + i }));
      out.push(redact({ x: x + colW * 0.8, y: ry, w: colW * 0.2, h: size * 1.05, seed: seed + i + 1 }));
    } else if (valueRedacted) {
      // Width varies per row: three identical stacked bars read as a graphic
      // element rather than as three amounts that happen to be hidden.
      const barW = colW * (0.16 + rng(seed + i * 7)() * 0.07);
      out.push(text(label, { x, y: ry, size, op }));
      const gapL = x + monoWidth(label, size) + 14;
      const gapR = x + colW - barW - 14;
      if (gapR > gapL) {
        out.push(
          `<line x1="${r2(gapL)}" y1="${r2(ry - size * 0.28)}" x2="${r2(gapR)}" y2="${r2(
            ry - size * 0.28
          )}" stroke="${C.ink}" stroke-opacity="${r2(op * 0.5)}" stroke-width="2.4" stroke-dasharray="2 9" stroke-linecap="round"/>`
        );
      }
      out.push(redact({ x: x + colW - barW, y: ry, w: barW, h: size * 1.05, seed: seed + i }));
    } else {
      const lw = monoWidth(label, size);
      const vw = monoWidth(value, size);
      out.push(text(label, { x, y: ry, size, op }));
      const gapL = x + lw + 14;
      const gapR = x + colW - vw - 14;
      if (gapR > gapL) {
        out.push(
          `<line x1="${r2(gapL)}" y1="${r2(ry - size * 0.28)}" x2="${r2(gapR)}" y2="${r2(
            ry - size * 0.28
          )}" stroke="${C.ink}" stroke-opacity="${r2(op * 0.5)}" stroke-width="2.4" stroke-dasharray="2 9" stroke-linecap="round"/>`
        );
      }
      out.push(text(value, { x: x + colW, y: ry, size, op, anchor: "end" }));
    }
  });
  return {
    svg: out.join("\n"),
    bottom: y + (rowDefs.length - 1) * leading,
    rowCenterY: (i) => y + i * leading - size * 0.3,
  };
}

// ── Marks ───────────────────────────────────────────────────────────────────

/** A hand-drawn circle around something. Seeded, so it does not wobble between
 *  runs; two overlapping arcs because one ellipse reads as a shape tool. */
function circleMark({ cx, cy, rx, ry, seed = 21, stroke = C.emerald, width = 6, op = 0.9, maxRx = Infinity }) {
  // The mark is hand-drawn, so it jitters (up to 6px) and its stroke has width
  // — both push it past whatever radius the caller asked for. maxRx is the hard
  // outer limit measured from cx, so callers pass the distance to the NEARER
  // safe edge: cx is rarely the exact centre of the safe column, and clamping
  // to half the column width let the mark run under the story action rail.
  rx = Math.min(rx, maxRx - 8 - width / 2);
  const rand = rng(seed);
  const arc = (k) => {
    const jx = (rand() - 0.5) * 12;
    const jy = (rand() - 0.5) * 8;
    const rxk = rx * (1 + k * 0.02);
    const ryk = ry * (1 + k * 0.03);
    return `M ${r2(cx - rxk + jx)} ${r2(cy + jy)}
            a ${r2(rxk)} ${r2(ryk)} 0 1 1 ${r2(rxk * 2)} 0
            a ${r2(rxk)} ${r2(ryk)} 0 1 1 ${r2(-rxk * 2)} 0`;
  };
  return `<g fill="none" stroke="${stroke}" stroke-opacity="${op}" stroke-width="${width}" stroke-linecap="round">
    <path d="${arc(0)}"/><path d="${arc(1)}" stroke-opacity="${r2(op * 0.55)}"/></g>`;
}

/** A down-and-right arrow — the price falling. The pack's recurring gesture. */
function fallArrow({ x, y, w, h, stroke = C.emerald, width = 9, glowOn = true }) {
  const head = 26;
  return `<g fill="none" stroke="${stroke}" stroke-width="${width}" stroke-linecap="round" stroke-linejoin="round"${
    glowOn ? ' filter="url(#glow)"' : ""
  }>
    <path d="M ${r2(x)} ${r2(y)} L ${r2(x + w * 0.34)} ${r2(y + h * 0.42)} L ${r2(x + w * 0.6)} ${r2(
    y + h * 0.2
  )} L ${r2(x + w)} ${r2(y + h)}"/>
    <path d="M ${r2(x + w)} ${r2(y + h)} L ${r2(x + w - head)} ${r2(y + h - head * 0.28)}"/>
    <path d="M ${r2(x + w)} ${r2(y + h)} L ${r2(x + w - head * 0.2)} ${r2(y + h - head)}"/>
  </g>`;
}

/** A tick/empty checkbox row — the store list, and the ballot. */
function checkRow({ x, y, w, label, state, size = TYPE.row.size, op = FADE.read }) {
  const box = size * 1.05;
  const bx = x;
  const by = y - box + 6;
  const out = [];
  const on = state === "live";
  out.push(
    `<rect x="${r2(bx)}" y="${r2(by)}" width="${r2(box)}" height="${r2(box)}" rx="4" fill="${
      on ? C.emeraldDeep : "none"
    }" fill-opacity="${on ? 0.92 : 0}" stroke="${on ? C.emeraldDeep : C.ink}" stroke-opacity="${
      on ? 0.95 : 0.35
    }" stroke-width="2.6"/>`
  );
  if (on) {
    out.push(
      `<path d="M ${r2(bx + box * 0.24)} ${r2(by + box * 0.52)} L ${r2(bx + box * 0.44)} ${r2(
        by + box * 0.72
      )} L ${r2(bx + box * 0.78)} ${r2(by + box * 0.28)}" fill="none" stroke="#ffffff" stroke-width="3.4" stroke-linecap="round" stroke-linejoin="round"/>`
    );
  }
  out.push(text(label, { x: bx + box + 20, y, size, op: on ? FADE.print : op }));
  return out.join("\n");
}

module.exports = {
  probeInk,
  widthOf,
  fitSize,
  hookBlock,
  subBlock,
  rowsBlock,
  circleMark,
  fallArrow,
  checkRow,
  REDACTED,
  PROBE_SIZE,
};
