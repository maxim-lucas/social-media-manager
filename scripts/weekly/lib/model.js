/**
 * model.js: which savings go on a slide, in which order, at which amount (Maxim, 2026-11-16, revised the same night).
 *
 *  - One audience: all 9 provinces, Quebec included. A saving's availability is shown across all 9 (the province strip).
 *    Posted in English for the 8 provinces outside Quebec and in French for Quebec, with the same items.
 *  - Order: the biggest saving first, always. Ties go to the soonest end date.
 *  - Headline amount: the amount held by the most provinces; a tie goes to the amount a priority province holds
 *    (Ontario, Quebec), then to the larger. Provinces with another amount are `exceptions`. Never "up to".
 *  - tier 1: the saving exists in every province; tier 2: it includes a priority province; tier 3: anything else.
 *    Tier no longer orders slides; it only tells how widely a saving is available.
 *  - Only Quebec-exclusive savings are kept apart (the hidden savings of Quebec). Single-region savings of the other
 *    provinces are the Saturday regional carousel (week.js).
 */
const ALL_PROVINCES = ["ON", "QC", "BC", "AB", "MB", "SK", "NB", "NS", "NL"];
const AUDIENCES = {
  all: { id: "all", provinces: ALL_PROVINCES, priority: ["ON", "QC"] },
};

const order = (list) => [...list].sort();

function headline(byProvince, priority) {
  const counts = new Map();
  for (const a of Object.values(byProvince)) counts.set(a, (counts.get(a) || 0) + 1);
  const priorityAmounts = new Set(priority.filter((p) => p in byProvince).map((p) => byProvince[p]));
  return [...counts.entries()].sort(
    (x, y) => y[1] - x[1] || priorityAmounts.has(y[0]) - priorityAmounts.has(x[0]) || y[0] - x[0]
  )[0][0];
}

/**
 * @param {object[]} rows rows of social_ro.savings_live (sku, province, amount, valid_until, is_weighted, names...)
 * @param {{id:string, provinces:string[], priority:string[]}} audience
 * @param {{today: string}} opts today = ISO date; a saving that ended before it is dropped
 */
function buildAudience(rows, audience, { today }) {
  const bySku = new Map();
  for (const r of rows) {
    if (!audience.provinces.includes(r.province) || r.is_weighted) continue;
    if (String(r.valid_until).slice(0, 10) < today) continue;
    if (!bySku.has(r.sku)) bySku.set(r.sku, []);
    bySku.get(r.sku).push(r);
  }
  const items = [];
  for (const [sku, list] of bySku) {
    const byProvince = {};
    let validUntil = "9999-12-31";
    for (const r of list) {
      byProvince[r.province] = Math.max(byProvince[r.province] || 0, Number(r.amount));
      const v = String(r.valid_until).slice(0, 10);
      if (v < validUntil) validUntil = v;
    }
    const provinces = order(Object.keys(byProvince));
    const tier = audience.provinces.every((p) => p in byProvince) ? 1 : provinces.some((p) => audience.priority.includes(p)) ? 2 : 3;
    const amount = headline(byProvince, audience.priority);
    const exceptions = Object.fromEntries(Object.entries(byProvince).filter(([, a]) => a !== amount));
    const first = list[0];
    const frName = first.display_name_fr || first.full_name_fr;
    items.push({
      sku, tier, amount, exceptions, provinces, validUntil, source: first.source,
      names: { en: first.display_name || first.full_name, fr: frName || first.display_name || first.full_name },
      needsFrenchReview: !frName,
    });
  }
  return items.sort((a, b) => b.amount - a.amount || (a.validUntil < b.validUntil ? -1 : a.validUntil > b.validUntil ? 1 : 0) || (a.sku < b.sku ? -1 : 1));
}

module.exports = { buildAudience, AUDIENCES, ALL_PROVINCES };
