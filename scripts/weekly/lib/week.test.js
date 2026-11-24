const test = require("node:test");
const assert = require("node:assert");
const { planWeek, regionOf, chooseRegion } = require("./week");

const EN8 = ["ON", "BC", "AB", "MB", "SK", "NB", "NS", "NL"];
const row = (sku, province, amount, o = {}) => ({
  sku, province, amount: String(amount), valid_until: "2026-11-22", valid_from: "2026-11-16", created_at: "2026-11-16T11:30:00Z",
  source: "sameday_costco", is_weighted: false, display_name: `Item ${sku}`, display_name_fr: `Article ${sku}`,
  full_name: null, full_name_fr: null, regular: 20, ...o,
});
const everywhere = (sku, amount, o) => [...EN8, "QC"].map((p) => row(sku, p, amount, o));
const tag = (sku) => ({ en: [`Item ${sku}`], fr: [`Article ${sku}`] });
const ctx = (rows, extra = {}) => {
  const skus = [...new Set(rows.map((r) => r.sku))];
  return {
    rows, monday: "2026-11-16", today: "2026-11-16",
    categories: Object.fromEntries(skus.map((s) => [s, { cat: "grocery" }])),
    tags: Object.fromEntries(skus.map((s) => [s, tag(s)])), posted: new Set(), photos: new Set(skus), ...extra,
  };
};
const names = (plan) => plan.files.map((f) => f.name).sort();

test("the same items go out in English (outside Quebec) and in French (Quebec), Quebec included in availability", () => {
  const plan = planWeek(ctx([1, 2, 3].flatMap((n) => everywhere(String(n), 5 + n))));
  assert.deepStrictEqual(names(plan), ["2026-11-16-en-grocery", "2026-11-16-fr-grocery"]);
  const en = plan.files.find((f) => f.name.endsWith("en-grocery")).data;
  assert.deepStrictEqual(en.feeds, { en: ["c"] });
  assert.strictEqual(en.audience, "en");
  assert.deepStrictEqual(Object.keys(en.items).sort(), ["1", "2", "3"]);
  assert.ok(en.items["1"].provinces.includes("QC"));
  const fr = plan.files.find((f) => f.name.endsWith("fr-grocery")).data;
  assert.deepStrictEqual(fr.carousels[0].items, en.carousels[0].items);
  assert.deepStrictEqual(fr.feeds, { fr: ["c"] });
});

test("a saving in Quebec and other provinces stays in the national carousels", () => {
  const rows = [...[1, 2, 3].flatMap((n) => ["QC", "ON"].map((p) => row("qo" + n, p, 20)))];
  const plan = planWeek(ctx(rows));
  assert.deepStrictEqual(Object.keys(plan.files.find((f) => f.name.endsWith("fr-grocery")).data.items).sort(), ["qo1", "qo2", "qo3"]);
  assert.ok(!plan.files.some((f) => /regional-qc/.test(f.name)));
});

test("item fields match the renderer: price, off, exp, provinces, exceptions", () => {
  const rows = [...["ON", "NB", "NS", "NL"].map((p) => row("9", p, 6, { regular: 20 })), ...["AB", "BC", "MB", "SK"].map((p) => row("9", p, 2, { regular: 20 }))];
  const plan = planWeek(ctx([...rows, ...everywhere("8", 5), ...everywhere("7", 5)]));
  const it = plan.files.find((f) => f.name.endsWith("en-grocery")).data.items["9"];
  assert.deepStrictEqual([it.regular, it.off, it.price, it.exp], [20, 6, 14, "2026-11-22"]);
  assert.deepStrictEqual(it.exceptions, { AB: 2, BC: 2, MB: 2, SK: 2 });
});

test("a missing category, tag, photo or regular price goes to needs and out of the carousel", () => {
  const rows = [1, 2, 3, 4, 5, 6, 7].flatMap((n) => everywhere(String(n), 5));
  const c = ctx(rows);
  delete c.categories["1"];
  delete c.tags["2"];
  c.photos.delete("3");
  for (const r of rows) if (r.sku === "4") r.regular = null;
  const plan = planWeek(c);
  assert.deepStrictEqual([plan.needs.category, plan.needs.tags, plan.needs.photo, plan.needs.regular], [["1"], ["2"], ["3"], ["4"]]);
  assert.deepStrictEqual(Object.keys(plan.files.find((f) => f.name.endsWith("en-grocery")).data.items).sort(), ["5", "6", "7"]);
});

test("a carousel needs at least 3 items", () => {
  const plan = planWeek(ctx([...everywhere("1", 5), ...everywhere("2", 5)]));
  assert.deepStrictEqual(plan.files, []);
  assert.ok(plan.skipped.some((s) => /grocery/.test(s.key)));
});

test("only savings that started and were created this week are new", () => {
  const fresh = [1, 2, 3].flatMap((n) => everywhere(`n${n}`, 5));
  const oldStart = [1, 2, 3].flatMap((n) => everywhere(`o${n}`, 5, { valid_from: "2026-11-09" }));
  const oldCreated = [1, 2, 3].flatMap((n) => everywhere(`c${n}`, 5, { created_at: "2026-11-15T10:00:00Z" }));
  const plan = planWeek(ctx([...fresh, ...oldStart, ...oldCreated], { newSince: "2026-11-16T05:00:00Z" }));
  assert.deepStrictEqual(Object.keys(plan.files.find((f) => f.name.endsWith("en-grocery")).data.items).sort(), ["n1", "n2", "n3"]);
});

test("already posted items are left out", () => {
  const plan = planWeek(ctx([1, 2, 3, 4].flatMap((n) => everywhere(String(n), 5)), { posted: new Set(["1"]) }));
  assert.deepStrictEqual(Object.keys(plan.files.find((f) => f.name.endsWith("en-grocery")).data.items).sort(), ["2", "3", "4"]);
});

test("at most 18 items, the biggest saving first", () => {
  const rows = Array.from({ length: 20 }, (_, i) => everywhere(String(100 + i), 1 + i)).flat();
  // slide order is the carousel's items array: object keys with numeric names are always sorted ascending by JS
  const items = planWeek(ctx(rows)).files.find((f) => f.name.endsWith("en-grocery")).data.carousels[0].items;
  assert.strictEqual(items.length, 18);
  assert.strictEqual(items[0], "119");
  assert.deepStrictEqual(items, [...items].sort((a, b) => Number(b) - Number(a)));
  assert.ok(!items.includes("100") && !items.includes("101"));
});

test("Business Centre savings are their own grocery-only carousel, never mixed with the warehouse", () => {
  const bc = (sku) => [...EN8, "QC"].map((p) => row(sku, p, 8, { source: "sameday_business_centre" }));
  const rows = [...[1, 2, 3].flatMap((n) => bc("b" + n)), ...[1, 2, 3].flatMap((n) => everywhere("w" + n, 5))];
  const c = ctx(rows);
  c.categories.b1 = c.categories.b2 = c.categories.b3 = { cat: "grocery" };
  const plan = planWeek(c);
  const bcFile = plan.files.find((f) => f.name.endsWith("en-bc-grocery")).data;
  assert.strictEqual(bcFile.businessCentre, true);
  assert.deepStrictEqual(Object.keys(bcFile.items).sort(), ["b1", "b2", "b3"]);
  assert.deepStrictEqual(Object.keys(plan.files.find((f) => f.name.endsWith("en-grocery")).data.items).sort(), ["w1", "w2", "w3"]);
});

test("hidden savings: single-region items leave the main carousels and form the regional one", () => {
  const west = (sku) => ["AB", "BC", "MB", "SK"].map((p) => row(sku, p, 30));
  const rows = [...[1, 2, 3].flatMap((n) => west("x" + n)), ...[1, 2, 3].flatMap((n) => everywhere("w" + n, 5))];
  const plan = planWeek(ctx(rows, { weekIndex: 0 }));
  const regional = plan.files.find((f) => f.name.endsWith("en-regional-west")).data;
  assert.deepStrictEqual(Object.keys(regional.items).sort(), ["x1", "x2", "x3"]);
  assert.ok(!("x1" in plan.files.find((f) => f.name.endsWith("en-grocery")).data.items));
});

test("Quebec-only offers are the French regional carousel", () => {
  const qc = (sku) => [row(sku, "QC", 12)];
  const rows = [...[1, 2, 3].flatMap((n) => qc("q" + n)), ...[1, 2, 3].flatMap((n) => everywhere("w" + n, 5))];
  const plan = planWeek(ctx(rows));
  const fr = plan.files.find((f) => f.name.endsWith("fr-regional-qc")).data;
  assert.deepStrictEqual(Object.keys(fr.items).sort(), ["q1", "q2", "q3"]);
  assert.deepStrictEqual(fr.feeds, { fr: ["c"] });
});

test("region helpers", () => {
  assert.strictEqual(regionOf(["AB", "BC"]), "west");
  assert.strictEqual(regionOf(["ON"]), "ontario");
  assert.strictEqual(regionOf(["NB", "NS"]), "atlantic");
  assert.strictEqual(regionOf(["ON", "BC"]), null);
  assert.strictEqual(chooseRegion({ west: 5, ontario: 9, atlantic: 4 }, 0), "west");
  assert.strictEqual(chooseRegion({ west: 2, ontario: 9, atlantic: 4 }, 0), "ontario");
  assert.strictEqual(chooseRegion({ west: 1, ontario: 2, atlantic: 0 }, 0), null);
});

test("a weekday top-up builds the national carousels only: no Business Centre, no regional, week-start filter", () => {
  const bc = (sku) => EN8.map((p) => row(sku, p, 8, { source: "sameday_business_centre" }));
  const west = (sku) => ["AB", "BC", "MB", "SK"].map((p) => row(sku, p, 30));
  const rows = [...[1, 2, 3].flatMap((n) => everywhere("w" + n, 5, { valid_from: "2026-11-16" })), ...[1, 2, 3].flatMap((n) => bc("b" + n)), ...[1, 2, 3].flatMap((n) => west("x" + n))];
  const c = ctx(rows, { monday: "2026-11-18", daily: true, weekStart: "2026-11-16", newSince: "2026-11-18T05:00:00Z" });
  for (const r of rows) r.created_at = "2026-11-18T15:00:00Z";
  const plan = planWeek(c);
  assert.deepStrictEqual(names(plan), ["2026-11-18-en-grocery", "2026-11-18-fr-grocery"]);
});

test("a sold-by-the-pack item needs no regular price and carries the full saving only", () => {
  const rows = [...everywhere("p1", 6, { regular: null }), ...everywhere("p2", 5), ...everywhere("p3", 4), ...everywhere("p4", 3), ...everywhere("p5", 2, { regular: null })];
  const plan = planWeek(ctx(rows, { byPack: new Set(["p1"]) }));
  const items = plan.files.find((f) => f.name.endsWith("en-grocery")).data.items;
  assert.deepStrictEqual([items.p1.byPack, items.p1.price, items.p1.off], [true, null, 6]);
  assert.deepStrictEqual(plan.needs.regular, ["p5"]);
});

test("only: rebuilds just the named categories, never the published ones", () => {
  const rows = [1, 2, 3].flatMap((n) => everywhere(String(n), 5 + n));
  const categories = { 1: { cat: "tech" }, 2: { cat: "tech" }, 3: { cat: "tech" } };
  const all = names(planWeek(ctx(rows, { categories })));
  assert.ok(all.some((n) => n.endsWith("en-tech")));
  const some = names(planWeek(ctx(rows, { categories, only: new Set(["tech"]) })));
  assert.deepStrictEqual(some, ["2026-11-16-en-tech", "2026-11-16-fr-tech"]);
  assert.deepStrictEqual(names(planWeek(ctx(rows, { categories, only: new Set(["home"]) }))), []);
});

test("a verified regular price fills a missing one only for the same saving (amount and end date), the snapshot's own wins", () => {
  const noReg = (sku, amount) => everywhere(sku, amount, { regular: null });
  const rows = [...noReg("t1", 400), ...noReg("t2", 400), ...noReg("t3", 400), ...everywhere("t4", 50, { regular: 120 }), ...everywhere("t5", 50, { regular: 120 }), ...everywhere("t6", 50, { regular: 120 })];
  const good = (sku) => ({ regular: 2294.99, amount: 400, validUntil: "2026-11-22", source: "costco.ca", seen: "2026-11-16" });
  const plan = planWeek(ctx(rows, { regularOverrides: { t1: good(), t2: { ...good(), amount: 300 }, t3: { ...good(), validUntil: "2026-12-20" }, t4: { ...good(), regular: 999 } } }));
  const en = plan.files.find((f) => f.name.endsWith("en-grocery")).data;
  assert.strictEqual(en.items.t1.regular, 2294.99); // same saving: used
  assert.strictEqual(en.items.t4.regular, 120); // the snapshot's own price wins over an override
  assert.ok(!en.items.t2 && !en.items.t3); // another amount or another sale: never reused
  assert.ok(plan.needs.regular.includes("t2") && plan.needs.regular.includes("t3"));
});
