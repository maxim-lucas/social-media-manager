// The carousel cover is plain (Maxim, 2026-11-16): hook, claim-until date, number of drops, total, legal line.
// It never carries a product (photo, name, "biggest drop") or a summary of the provinces. 2026-11-23: a cover with a
// product preview shipped because the rule lived only in a working copy; this test pins it in the repository.
const test = require("node:test");
const assert = require("node:assert");
const fs = require("node:fs");
const path = require("node:path");

const src = fs.readFileSync(path.join(require("../../lib/packs").dir("price-drops"), "scenes", "render.js"), "utf8");

function claimCoverBody() {
  const start = src.indexOf("function claimCover(");
  assert.ok(start >= 0, "claimCover not found");
  const next = src.indexOf("\nfunction ", start + 10);
  return src.slice(start, next === -1 ? undefined : next);
}

test("the cover carries no product photo, product name or biggest-drop line", () => {
  const body = claimCoverBody();
  for (const banned of ["class=\"cc-pic\"", "class=\"cc-prod\"", "class=\"cc-row\"", "c.top1(", "items[0][0]", "photos["]) {
    assert.ok(!body.includes(banned), `claimCover must not contain ${banned}`);
  }
});

test("the cover carries no province summary line", () => {
  const body = claimCoverBody();
  assert.ok(!body.includes("class=\"cc-prov\"") && !body.includes("${esc(provLine)}"), "claimCover must not print a province summary");
});
