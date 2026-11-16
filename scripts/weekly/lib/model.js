/**
 * model.js: which savings go on a slide, in which order, at which amount (Maxim, 2026-11-16).
 *
 *  - Audience en = the 8 provinces outside Quebec, fr = Quebec only.
 *  - tier 1: the saving exists in every province of the audience; tier 2: it includes a priority province
 *    (Ontario for English); tier 3: anything else.
 *  - Headline amount: the amount held by the most provinces; a tie goes to the amount a priority province holds,
 *    then to the larger. Provinces with another amount are `exceptions`. Never "up to".
 *  - Order: tier, soonest end date, biggest saving.
 */
const AUDIENCES = {
  en: { id: "en", provinces: ["ON", "BC", "AB", "MB", "SK", "NB", "NS", "NL"], priority: ["ON"] },
  fr: { id: "fr", provinces: ["QC"], priority: ["QC"] },
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
  return items.sort((a, b) => a.tier - b.tier || (a.validUntil < b.validUntil ? -1 : a.validUntil > b.validUntil ? 1 : 0) || b.amount - a.amount);
}

module.exports = { buildAudience, AUDIENCES };
