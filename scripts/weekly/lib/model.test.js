const test = require("node:test");
const assert = require("node:assert");
const { buildAudience, AUDIENCES } = require("./model");

const row = (sku, province, amount, extra = {}) => ({
  sku, province, amount: String(amount), valid_until: "2026-11-22", source: "sameday_costco", is_weighted: false,
  display_name: `Item ${sku}`, display_name_fr: `Article ${sku}`, full_name: null, full_name_fr: null, ...extra,
});
const EN8 = ["ON", "BC", "AB", "MB", "SK", "NB", "NS", "NL"];
const opts = { today: "2026-11-16" };

test("chicken case: 6 in the East, 2 in the West gives headline 6 and West exceptions", () => {
  const rows = [
    ...["ON", "NB", "NS", "NL"].map((p) => row("100", p, 6)),
    ...["AB", "BC", "MB", "SK"].map((p) => row("100", p, 2)),
    row("100", "QC", 6),
  ];
  const [item] = buildAudience(rows, AUDIENCES.en, opts);
  assert.strictEqual(item.amount, 6);
  assert.deepStrictEqual(item.exceptions, { AB: 2, BC: 2, MB: 2, SK: 2 });
  assert.strictEqual(item.tier, 1);
  assert.ok(!item.provinces.includes("QC"));
});

test("a tier 1 item sorts before a bigger tier 3 saving", () => {
  const rows = [...EN8.map((p) => row("1", p, 5)), row("2", "AB", 400)];
  assert.deepStrictEqual(buildAudience(rows, AUDIENCES.en, opts).map((i) => [i.sku, i.tier]), [["1", 1], ["2", 3]]);
});

test("an item that includes Ontario is tier 2, ahead of a bigger item that does not", () => {
  const rows = [row("1", "ON", 3), row("1", "BC", 3), row("2", "AB", 50), row("2", "BC", 50)];
  assert.deepStrictEqual(buildAudience(rows, AUDIENCES.en, opts).map((i) => [i.sku, i.tier]), [["1", 2], ["2", 3]]);
});

test("inside a tier the soonest end date goes first, then the biggest saving", () => {
  const rows = [
    ...EN8.map((p) => row("1", p, 9, { valid_until: "2026-11-22" })),
    ...EN8.map((p) => row("2", p, 4, { valid_until: "2026-11-19" })),
    ...EN8.map((p) => row("3", p, 7, { valid_until: "2026-11-19" })),
  ];
  assert.deepStrictEqual(buildAudience(rows, AUDIENCES.en, opts).map((i) => i.sku), ["3", "2", "1"]);
});

test("the French audience is Quebec only", () => {
  const rows = [row("1", "QC", 5), row("1", "ON", 5), row("2", "ON", 90)];
  const items = buildAudience(rows, AUDIENCES.fr, opts);
  assert.deepStrictEqual(items.map((i) => i.sku), ["1"]);
  assert.deepStrictEqual(items[0].provinces, ["QC"]);
  assert.strictEqual(items[0].tier, 1);
});

test("the English audience never contains Quebec", () => {
  const items = buildAudience([row("1", "QC", 5)], AUDIENCES.en, opts);
  assert.deepStrictEqual(items, []);
});

test("a missing French name falls back to English and is flagged", () => {
  const [item] = buildAudience([row("1", "QC", 5, { display_name_fr: null, full_name_fr: null })], AUDIENCES.fr, opts);
  assert.strictEqual(item.names.fr, "Item 1");
  assert.strictEqual(item.needsFrenchReview, true);
});

test("weighted items and expired savings are dropped", () => {
  const rows = [row("1", "ON", 5, { is_weighted: true }), row("2", "ON", 5, { valid_until: "2026-11-15" })];
  assert.deepStrictEqual(buildAudience(rows, AUDIENCES.en, opts), []);
});

test("the amount tie goes to the priority province's amount", () => {
  const rows = [row("1", "ON", 6), row("1", "NB", 6), row("1", "AB", 2), row("1", "BC", 2)];
  assert.strictEqual(buildAudience(rows, AUDIENCES.en, opts)[0].amount, 6);
  const flipped = [row("1", "ON", 2), row("1", "NB", 2), row("1", "AB", 6), row("1", "BC", 6)];
  assert.strictEqual(buildAudience(flipped, AUDIENCES.en, opts)[0].amount, 2);
});
