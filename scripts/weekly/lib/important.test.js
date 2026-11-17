const test = require("node:test");
const assert = require("node:assert");
const { isImportant } = require("./important");

test("15 new products is important, 14 is not", () => {
  assert.strictEqual(isImportant({ newProducts: 15, maxNewAmount: 5 }), true);
  assert.strictEqual(isImportant({ newProducts: 14, maxNewAmount: 5 }), false);
});
test("one saving of $50 or more is important on its own", () => {
  assert.strictEqual(isImportant({ newProducts: 2, maxNewAmount: 50 }), true);
  assert.strictEqual(isImportant({ newProducts: 2, maxNewAmount: 49.99 }), false);
});
test("an empty day is not important", () => {
  assert.strictEqual(isImportant({}), false);
});
