const test = require("node:test");
const assert = require("node:assert");
const { rubricTotal, gate, WEIGHTS } = require("./score");

const full = { hook: 1, clarity: 1, photos: 1, legibility: 1, language: 1, compliance: 1, cta: 1 };

test("weights add up to 10", () => {
  assert.strictEqual(Object.values(WEIGHTS).reduce((a, b) => a + b, 0), 10);
});
test("all sub-scores at 1 is 10; all at 0.9 is 9", () => {
  assert.strictEqual(rubricTotal(full), 10);
  assert.strictEqual(rubricTotal(Object.fromEntries(Object.keys(full).map((k) => [k, 0.9]))), 9);
});
test("a sub-score outside 0..1 or a missing one throws", () => {
  assert.throws(() => rubricTotal({ ...full, hook: 1.2 }));
  const { cta, ...rest } = full;
  assert.throws(() => rubricTotal(rest));
});
test("9.6 on the first round publishes", () => {
  assert.deepStrictEqual(gate([9.6]), { publish: true, rounds: 1, reason: "target_reached" });
});
test("below target after 3 rounds is not published", () => {
  assert.deepStrictEqual(gate([9.0, 9.2, 9.4]), { publish: false, rounds: 3, reason: "below_target" });
});
test("below target with rounds left asks for another round", () => {
  assert.deepStrictEqual(gate([9.0]), { publish: false, rounds: 1, reason: "rework" });
});
test("it publishes on a later round once the target is met", () => {
  assert.deepStrictEqual(gate([9.0, 9.5]), { publish: true, rounds: 2, reason: "target_reached" });
});
