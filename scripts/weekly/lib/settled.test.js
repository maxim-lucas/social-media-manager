const test = require("node:test");
const assert = require("node:assert");
const { evaluateSettled, PROVINCES } = require("./settled");

const all = (n) => Object.fromEntries(PROVINCES.map((p) => [p, n]));
const at = (h, m) => new Date(Date.UTC(2026, 10, 16, h, m));
const base = { minPerProvince: 30, quietMinutes: 30, deadline: at(17, 30) };

test("all 9 provinces loaded and quiet for 31 minutes is ready", () => {
  const r = evaluateSettled({ ...base, perProvince: all(60), lastCreatedAt: at(11, 36), now: at(12, 7) });
  assert.deepStrictEqual([r.ready, r.reason, r.missing], [true, "settled", []]);
});

test("a province below the minimum is not ready and is named", () => {
  const r = evaluateSettled({ ...base, perProvince: { ...all(60), NL: 5 }, lastCreatedAt: at(11, 0), now: at(12, 0) });
  assert.strictEqual(r.ready, false);
  assert.strictEqual(r.reason, "missing_provinces");
  assert.deepStrictEqual(r.missing, ["NL"]);
});

test("a province absent from the counts counts as zero", () => {
  const counts = all(60);
  delete counts.QC;
  assert.deepStrictEqual(evaluateSettled({ ...base, perProvince: counts, lastCreatedAt: null, now: at(12, 0) }).missing, ["QC"]);
});

test("a saving created 10 minutes ago is not quiet yet", () => {
  const r = evaluateSettled({ ...base, perProvince: all(60), lastCreatedAt: at(11, 50), now: at(12, 0) });
  assert.deepStrictEqual([r.ready, r.reason], [false, "not_quiet"]);
});

test("at the deadline it starts anyway and still lists what is missing", () => {
  const r = evaluateSettled({ ...base, perProvince: { ...all(60), NL: 0 }, lastCreatedAt: at(17, 29), now: at(17, 30) });
  assert.deepStrictEqual([r.ready, r.reason, r.missing], [true, "deadline", ["NL"]]);
});
