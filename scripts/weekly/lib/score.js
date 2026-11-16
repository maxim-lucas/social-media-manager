/** score.js: the 9.5 / 10 gate (Maxim, 2026-11-16). Sub-scores are 0..1; see weekly/RUBRIC.md. */
const WEIGHTS = { hook: 2, clarity: 2, photos: 1.5, legibility: 1.5, language: 1, compliance: 1, cta: 1 };

function rubricTotal(scores) {
  let total = 0;
  for (const [k, w] of Object.entries(WEIGHTS)) {
    const v = scores[k];
    if (typeof v !== "number" || !(v >= 0 && v <= 1)) throw new Error(`sub-score "${k}" must be a number from 0 to 1`);
    total += v * w;
  }
  return Math.round(total * 10) / 10;
}

/** @param {number[]} history totals, one per round, newest last */
function gate(history, max = 3, target = 9.5) {
  const rounds = history.length;
  if (history[rounds - 1] >= target) return { publish: true, rounds, reason: "target_reached" };
  return { publish: false, rounds, reason: rounds >= max ? "below_target" : "rework" };
}

module.exports = { rubricTotal, gate, WEIGHTS };
