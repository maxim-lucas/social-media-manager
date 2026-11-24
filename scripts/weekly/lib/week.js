/**
 * week.js: turn a snapshot of the live savings into the renderer's week files (Maxim, 2026-11-16).
 *
 * Pure: no network, no disk. Judgement (a product's category, its tag lines) comes in as caches the routine's Claude
 * session writes; anything missing is returned in `needs` and left out, never guessed.
 */
const { buildAudience, AUDIENCES } = require("./model");

const BC_SOURCES = new Set(["sameday_business_centre", "costco_business_centre_web"]);
const REGIONS = { west: ["AB", "BC", "MB", "SK"], ontario: ["ON"], atlantic: ["NB", "NS", "NL"] };
const REGION_ORDER = ["west", "ontario", "atlantic"];
const MAX_ITEMS = 18; // Instagram caps a carousel at 20 slides: cover + 18 items + end card
const MIN_ITEMS = 3;

const LABELS = {
  grocery: { en: "Grocery", fr: "Épicerie" },
  home: { en: "Home & more", fr: "Maison et plus" },
  tech: { en: "TVs & tech", fr: "Télés et techno" },
  "regional-west": { en: "Hidden in the West", fr: "Cachés dans l'Ouest" },
  "regional-ontario": { en: "Hidden in Ontario", fr: "Cachés en Ontario" },
  "regional-atlantic": { en: "Hidden in Atlantic Canada", fr: "Cachés dans les Maritimes" },
  "regional-qc": { en: "Only in Quebec", fr: "Seulement au Québec" },
};

/** The region whose provinces contain every province of the item, or null when it spans regions. */
function regionOf(provinces) {
  for (const name of REGION_ORDER) if (provinces.every((p) => REGIONS[name].includes(p))) return name;
  return null;
}

/** The week's Saturday region: rotate, skipping a region with too few hidden items. */
function chooseRegion(poolSizes, weekIndex, min = MIN_ITEMS) {
  for (let i = 0; i < REGION_ORDER.length; i++) {
    const r = REGION_ORDER[(weekIndex + i) % REGION_ORDER.length];
    if ((poolSizes[r] || 0) >= min) return r;
  }
  return null;
}

function regularFor(chRows, item, audience) {
  const matches = chRows.filter((r) => r.sku === item.sku && item.provinces.includes(r.province) && Number(r.amount) === item.amount && r.regular != null);
  const best = matches.find((r) => audience.priority.includes(r.province)) || matches[0];
  return best ? Number(best.regular) : null;
}

/**
 * @param {{rows: object[], monday: string, today: string, categories: Record<string, {cat: string}>,
 *          tags: Record<string, {en: string[], fr: string[]}>, posted: Set<string>, photos: Set<string>, weekIndex?: number}} input
 * rows: social_ro.savings_live rows, each with `regular` (the product's regular price in that province, or null)
 */
function planWeek({ rows: allRows, monday, today, categories, tags, posted, photos, weekIndex = 0, newSince = null, daily = false, weekStart = null, byPack = new Set(), only = null }) {
  // Monica, 2026-11-04: only savings that started this week and were created this week are "new".
  const rows = newSince
    ? allRows.filter((r) => String(r.valid_from).slice(0, 10) >= (weekStart || monday) && new Date(r.created_at) >= new Date(newSince))
    : allRows;
  const needs = { category: new Set(), tags: new Set(), photo: new Set(), regular: new Set(), frenchReview: new Set() };
  const files = [];
  const skipped = [];

  // `only`: category keys (tech, home, bc-grocery, regional-west...) to rebuild; a published category is never rewritten.
  const emit = (aud, key, items, { bc = false } = {}) => {
    if (only && !only.has(key)) return;
    const picked = items.slice(0, MAX_ITEMS);
    const name = `${monday}-${aud.id}-${key}`;
    if (picked.length < MIN_ITEMS) return skipped.push({ key: `${aud.id}-${key}`, reason: `only ${picked.length} usable items (minimum ${MIN_ITEMS})` });
    const catKey = key.replace(/^bc-/, "");
    const data = {
      _note: `${LABELS[catKey].en}, ${aud.id === "fr" ? "French, for Quebec" : "English, for the provinces outside Quebec"}, built ${today} from priceback.savings (read-only views).`,
      source: "priceback.savings via social_ro views",
      provinceStrip: true, endSlide: true, coverStyle: "claim", bigClaim: true, audience: aud.id,
      ...(bc ? { businessCentre: true } : {}),
      carousels: [{ id: "c", category: LABELS[catKey], items: picked.map((i) => i.sku) }],
      items: {}, feeds: { [aud.id]: ["c"] },
    };
    for (const i of picked) {
      data.items[i.sku] = {
        sameday: null, tag: tags[i.sku], regular: i.regular, off: i.amount, price: i.byPack ? null : Math.round((i.regular - i.amount) * 100) / 100,
        ...(i.byPack ? { byPack: true } : {}),
        exp: i.validUntil, seen: today, provinces: i.provinces, bizOnly: [], exceptions: i.exceptions,
      };
    }
    files.push({ name, data });
  };

  for (const channel of daily ? ["warehouse"] : ["warehouse", "bc"]) {
    const bc = channel === "bc";
    const chRows = rows.filter((r) => BC_SOURCES.has(r.source) === bc);
    const aud = AUDIENCES.all;
    const usable = [];
    for (const it of buildAudience(chRows, aud, { today })) {
      if (posted.has(it.sku)) continue;
      const cat = categories[it.sku];
      if (!cat) { needs.category.add(it.sku); continue; }
      if (!tags[it.sku]) { needs.tags.add(it.sku); continue; }
      if (!photos.has(it.sku)) { needs.photo.add(it.sku); continue; }
      // Sold by the pack (meat, fish, anything packed to weight): the shelf price is per kg, the drop is the FULL saving on
      // the pack. Never a computed new price from another pack's price: the slide shows the saving only.
      const packed = byPack.has(it.sku);
      const regular = packed ? null : regularFor(chRows, it, aud);
      if (regular == null && !packed) { needs.regular.add(it.sku); continue; }
      if (it.needsFrenchReview) needs.frenchReview.add(it.sku);
      usable.push({ ...it, cat: cat.cat, regular, byPack: packed });
    }

    // Kept apart: Quebec-exclusive savings (hidden in Quebec) and, outside Quebec, single-region savings.
    const qcOnly = (it) => it.provinces.length === 1 && it.provinces[0] === "QC";
    const regional = (it) => !qcOnly(it) && regionOf(it.provinces) !== null;
    const main = bc ? usable : usable.filter((it) => !qcOnly(it) && !regional(it));

    // The same items in both languages: English for the 8 provinces outside Quebec, French for Quebec.
    for (const lang of ["en", "fr"]) {
      const L = { id: lang, priority: aud.priority };
      for (const cat of bc ? ["grocery"] : ["tech", "grocery", "home"]) {
        emit(L, bc ? `bc-${cat}` : cat, main.filter((i) => i.cat === cat), { bc });
      }
    }

    if (!bc && !daily) {
      emit({ id: "fr", priority: aud.priority }, "regional-qc", usable.filter(qcOnly));
      const pools = {};
      for (const it of usable.filter(regional)) (pools[regionOf(it.provinces)] ||= []).push(it);
      const sizes = Object.fromEntries(Object.entries(pools).map(([k, v]) => [k, v.length]));
      const region = chooseRegion(sizes, weekIndex);
      if (region) emit({ id: "en", priority: aud.priority }, `regional-${region}`, pools[region]);
      else skipped.push({ key: "en-regional", reason: `no region has ${MIN_ITEMS} hidden items (${JSON.stringify(sizes)})` });
    }
  }

  return { files, skipped, needs: Object.fromEntries(Object.entries(needs).map(([k, v]) => [k, [...v].sort()])) };
}

module.exports = { planWeek, regionOf, chooseRegion, LABELS };
