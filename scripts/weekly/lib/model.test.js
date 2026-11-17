const test = require("node:test");
const assert = require("node:assert");
const { buildAudience, AUDIENCES } = require("./model");

const row = (sku, province, amount, extra = {}) => ({
  sku, province, amount: String(amount), valid_until: "2026-11-22", source: "sameday_costco", is_weighted: false,
  display_name: `Item ${sku}`, display_name_fr: `Article ${sku}`, full_name: null, full_name_fr: null, ...extra,
});
const EN8 = ["ON", "BC", "AB", "MB", "SK", "NB", "NS", "NL"];
const opts = { today: "2026-11-16" };

const ALL9 = ["ON", "QC", "BC", "AB", "MB", "SK", "NB", "NS", "NL"];
const all = AUDIENCES.all;

test("chicken case: 6 in the East, 2 in the West gives headline 6 and West exceptions", () => {
  const rows = [
    ...["ON", "NB", "NS", "NL", "QC"].map((p) => row("100", p, 6)),
    ...["AB", "BC", "MB", "SK"].map((p) => row("100", p, 2)),
  ];
  const [item] = buildAudience(rows, all, opts);
  assert.strictEqual(item.amount, 6);
  assert.deepStrictEqual(item.exceptions, { AB: 2, BC: 2, MB: 2, SK: 2 });
  assert.strictEqual(item.tier, 1);
  assert.ok(item.provinces.includes("QC"));
});

test("Quebec counts in availability: an item in all 9 provinces is tier 1, one without Quebec is not", () => {
  const rows = [...ALL9.map((p) => row("1", p, 5)), ...EN8.map((p) => row("2", p, 5))];
  const byTier = Object.fromEntries(buildAudience(rows, all, opts).map((i) => [i.sku, i.tier]));
  assert.deepStrictEqual(byTier, { 1: 1, 2: 2 });
});

test("the biggest saving is always first, whatever its tier or end date", () => {
  const rows = [
    ...ALL9.map((p) => row("1", p, 5, { valid_until: "2026-11-19" })),
    row("2", "AB", 400, { valid_until: "2026-11-30" }),
    ...ALL9.map((p) => row("3", p, 9, { valid_until: "2026-11-22" })),
  ];
  assert.deepStrictEqual(buildAudience(rows, all, opts).map((i) => i.sku), ["2", "3", "1"]);
});

test("equal savings go soonest end date first", () => {
  const rows = [row("1", "ON", 7, { valid_until: "2026-11-22" }), row("2", "ON", 7, { valid_until: "2026-11-19" })];
  assert.deepStrictEqual(buildAudience(rows, all, opts).map((i) => i.sku), ["2", "1"]);
});

test("a Quebec saving is in the audience with its Quebec amount", () => {
  const [item] = buildAudience([row("1", "QC", 5), row("1", "ON", 5)], all, opts);
  assert.deepStrictEqual(item.provinces, ["ON", "QC"]);
});

test("a missing French name falls back to English and is flagged", () => {
  const [item] = buildAudience([row("1", "QC", 5, { display_name_fr: null, full_name_fr: null })], all, opts);
  assert.strictEqual(item.names.fr, "Item 1");
  assert.strictEqual(item.needsFrenchReview, true);
});

test("weighted items and expired savings are dropped", () => {
  const rows = [row("1", "ON", 5, { is_weighted: true }), row("2", "ON", 5, { valid_until: "2026-11-15" })];
  assert.deepStrictEqual(buildAudience(rows, all, opts), []);
});

test("the amount tie goes to the priority province's amount", () => {
  const rows = [row("1", "ON", 6), row("1", "NB", 6), row("1", "AB", 2), row("1", "BC", 2)];
  assert.strictEqual(buildAudience(rows, all, opts)[0].amount, 6);
  const flipped = [row("1", "ON", 2), row("1", "NB", 2), row("1", "AB", 6), row("1", "BC", 6)];
  assert.strictEqual(buildAudience(flipped, all, opts)[0].amount, 2);
});
