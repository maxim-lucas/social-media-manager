/**
 * settled.js: has the savings harvest finished loading the week's list?
 *
 * Maxim, 2026-11-16: the Monday build starts as soon as EVERY province has its savings, not on a clock, so the
 * Monday carousel can be the first one out. On Nov 16 all 9 provinces had 52 to 73 new savings by 06:36.
 */
const PROVINCES = ["ON", "QC", "BC", "AB", "MB", "SK", "NB", "NS", "NL"];

/**
 * @param {{perProvince: Record<string, number>, lastCreatedAt: Date|null, now: Date, deadline: Date,
 *          minPerProvince?: number, quietMinutes?: number}} input
 * @returns {{ready: boolean, reason: "settled"|"deadline"|"missing_provinces"|"not_quiet", missing: string[]}}
 */
function evaluateSettled({ perProvince, lastCreatedAt, now, deadline, minPerProvince = 30, quietMinutes = 30 }) {
  const missing = PROVINCES.filter((p) => (perProvince[p] || 0) < minPerProvince);
  if (now >= deadline) return { ready: true, reason: "deadline", missing };
  if (missing.length) return { ready: false, reason: "missing_provinces", missing };
  if (lastCreatedAt && now - lastCreatedAt < quietMinutes * 60_000) return { ready: false, reason: "not_quiet", missing };
  return { ready: true, reason: "settled", missing };
}

module.exports = { evaluateSettled, PROVINCES };
