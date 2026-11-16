const test = require("node:test");
const assert = require("node:assert");
const { sourceFor, duplicates } = require("./media");

const files = ["2026-11-16-en-grocery", "2026-11-16-fr-grocery", "2026-11-16-en-regional-west", "2026-11-16-fr-regional-qc", "2026-11-16-en-bc-grocery"];
const slot = (kind, key, lang) => ({ kind, key, lang });

test("a carousel slot maps to its language's week file", () => {
  assert.strictEqual(sourceFor(slot("carousel", "grocery", "en"), "2026-11-16", files), "2026-11-16-en-grocery");
  assert.strictEqual(sourceFor(slot("carousel", "grocery", "fr"), "2026-11-16", files), "2026-11-16-fr-grocery");
  assert.strictEqual(sourceFor(slot("carousel", "bc-grocery", "en"), "2026-11-16", files), "2026-11-16-en-bc-grocery");
});
test("the regional slot picks whichever regional file this week produced", () => {
  assert.strictEqual(sourceFor(slot("carousel", "regional", "en"), "2026-11-16", files), "2026-11-16-en-regional-west");
  assert.strictEqual(sourceFor(slot("carousel", "regional", "fr"), "2026-11-16", files), "2026-11-16-fr-regional-qc");
});
test("a slot with no week file, and every reel, has no source", () => {
  assert.strictEqual(sourceFor(slot("carousel", "tech", "en"), "2026-11-16", files), null);
  assert.strictEqual(sourceFor(slot("carousel", "how-to-claim", "en"), "2026-11-16", files), null);
  assert.strictEqual(sourceFor(slot("reel", "grocery", "en"), "2026-11-16", files), null);
});
test("duplicate slides are detected by content", () => {
  const a = Buffer.from("aaa"), b = Buffer.from("bbb");
  assert.deepStrictEqual(duplicates([a, b, Buffer.from("aaa")]), [[0, 2]]);
  assert.deepStrictEqual(duplicates([a, b]), []);
});
