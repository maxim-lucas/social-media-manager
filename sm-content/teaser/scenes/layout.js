// Teaser pack — layout helpers shared by the post and story scenes.

const { C, FADE, TYPE } = require("./tokens");
const { text, row, redact, rng, r2, isContentMode } = require("./paper");

// Roboto Mono is monospaced: every glyph advances exactly 0.6em. That makes
// text width exactly predictable without measuring, which is the only reason
// this pack can auto-fit type in a renderer that has no browser.
const ADV = 0.6;

const widthAt = (str, size) => str.length * ADV * size;

// Largest size at which the longest line still fits the column.
//
// This exists so EN and FR frames are visually identical. French runs 15-25%
// longer than English here ("PERSONNE NE LIT." vs "NOBODY READS."), and a fixed
// size would either overflow the French or leave the English small. Both
// languages get the same layout, each at its own optimal size.
function fitSize(lines, colW, max, min = 28) {
  const longest = lines.reduce((a, b) => (a.length > b.length ? a : b), "");
  if (!longest) return max;
  const ideal = colW / (longest.length * ADV);
  return Math.max(min, Math.min(max, Math.floor(ideal)));
}

// A stack of message lines, auto-fitted, returned with the height it consumed
// so the caller can flow whatever comes next.
function messageBlock(lines, { x, y, colW, max = 96, min = 34, weight = 700, op = FADE.print, leadingRatio = 1.16 }) {
  const size = fitSize(lines, colW, max, min);
  const leading = size * leadingRatio;
  const svg = lines
    .map((s, i) => text(s, { x, y: y + i * leading, size, weight, op }))
    .join("\n");
  return { svg, size, leading, height: leading * (lines.length - 1) + size, bottom: y + leading * (lines.length - 1) };
}

// Receipt line items. A value (or label) of "__REDACTED__" becomes a solid ink
// bar instead of text — the pack never prints an amount it would have to stand
// behind, so the bar is doing real compliance work, not just styling.
const REDACTED = "__REDACTED__";

function rowsBlock(rowDefs, { x, y, colW, leading = 62, size = TYPE.row.size, op = FADE.read, seed = 40 }) {
  const out = [];
  rowDefs.forEach(([label, value], i) => {
    const ry = y + i * leading;
    const labelRedacted = label === REDACTED;
    const valueRedacted = value === REDACTED;

    if (labelRedacted && valueRedacted) {
      // Whole line gone: one long bar plus a short one where the amount sits.
      out.push(redact({ x, y: ry, w: colW * 0.46, h: size * 1.05, seed: seed + i }));
      out.push(redact({ x: x + colW - colW * 0.2, y: ry, w: colW * 0.2, h: size * 1.05, seed: seed + i + 1 }));
    } else if (valueRedacted) {
      // Vary the width per row: three identical stacked bars read as a graphic
      // element rather than as three amounts that happen to be hidden.
      const barW = colW * (0.17 + rng(seed + i * 7)() * 0.07);
      out.push(text(label, { x, y: ry, size, op }));
      out.push(
        `<line x1="${r2(x + widthAt(label, size) + 14)}" y1="${r2(ry - size * 0.28)}" x2="${r2(
          x + colW - barW - 14
        )}" y2="${r2(ry - size * 0.28)}" stroke="${C.ink}" stroke-opacity="${r2(
          op * 0.55
        )}" stroke-width="2.4" stroke-dasharray="2 9" stroke-linecap="round"/>`
      );
      out.push(redact({ x: x + colW - barW, y: ry, w: barW, h: size * 1.05, seed: seed + i }));
    } else {
      out.push(row({ x, y: ry, w: colW, label, value, op, size }));
    }
  });
  return {
    svg: out.join("\n"),
    bottom: y + (rowDefs.length - 1) * leading,
    // Centre of row i, for hanging a circle mark on it.
    rowCenterY: (i) => y + i * leading - size * 0.3,
  };
}

// Rows of a receipt too faded to read: bars and leaders, never words.
//
// Language-free on purpose. An "illegible" row made of real English words would
// silently ship an English frame inside the French pack — the exact bug class
// the app's i18n rule exists to prevent. Bars carry no language.
function ghostRows({ x, y, w, count, leading, seed = 30 }) {
  // Texture, not content — see paper.js setMode. Story 02 deliberately runs
  // these off the bottom edge, which is fine precisely because there is
  // nothing to read in them.
  if (isContentMode()) return "";
  const rand = rng(seed);
  const out = [];
  for (let i = 0; i < count; i++) {
    const ry = y + i * leading;
    const labelW = w * (0.3 + rand() * 0.28);
    const valueW = w * (0.1 + rand() * 0.05);
    const op = FADE.ghost + rand() * 0.08;
    out.push(
      `<rect x="${r2(x)}" y="${r2(ry)}" width="${r2(labelW)}" height="11" rx="2" fill="${C.ink}" fill-opacity="${r2(op)}"/>`,
      `<line x1="${r2(x + labelW + 16)}" y1="${r2(ry + 6)}" x2="${r2(x + w - valueW - 16)}" y2="${r2(
        ry + 6
      )}" stroke="${C.ink}" stroke-opacity="${r2(
        op * 0.7
      )}" stroke-width="2.4" stroke-dasharray="2 9" stroke-linecap="round"/>`,
      `<rect x="${r2(x + w - valueW)}" y="${r2(ry)}" width="${r2(valueW)}" height="11" rx="2" fill="${C.ink}" fill-opacity="${r2(op)}"/>`
    );
  }
  return out.join("\n");
}

// Text with runs of "#" replaced by an ink bar — "09 . ## . 26".
//
// Drawn as a bar rather than typed as a block character (U+2588) because the
// pack cannot assume every renderer's Roboto Mono carries that codepoint, and a
// missing glyph would silently ship as tofu. Monospace makes the position of
// each masked run exactly computable, so the bar lands on the character cell.
function maskedText(str, { x, y, size, weight = 400, op = FADE.print, mask = "#" }) {
  // No letter-spacing here on purpose. librsvg's advance for a tracked run does
  // not match size*ADV*n exactly, and the bar then lands off its character cell
  // — which is how an earlier pass shipped "09 . #26". With tracking at zero the
  // cell width is exactly size*ADV and the arithmetic is sound.
  const cell = size * ADV;
  const out = [];

  // Walked character by character rather than matched with a regex, so the mask
  // needs no escaping and can be any character.
  const emit = (from, to) => {
    if (to <= from) return;
    const run = str.slice(from, to);
    if (run[0] === mask) {
      out.push(
        redact({
          x: x + from * cell,
          y,
          w: run.length * cell,
          h: size * 0.92,
          op: op * 0.95,
          seed: 60 + from,
        })
      );
    } else {
      out.push(text(run, { x: x + from * cell, y, size, weight, op }));
    }
  };

  let start = 0;
  for (let i = 1; i <= str.length; i++) {
    if (i === str.length || (str[i] === mask) !== (str[start] === mask)) {
      emit(start, i);
      start = i;
    }
  }
  return out.join("\n");
}

module.exports = {
  ADV,
  widthAt,
  fitSize,
  messageBlock,
  rowsBlock,
  ghostRows,
  maskedText,
  REDACTED,
};
