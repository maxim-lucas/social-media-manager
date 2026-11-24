const test = require("node:test");
const assert = require("node:assert");
const { pickBySku, atCatalogueSize } = require("./harvestPhoto");

const A = "https://gdx-assets.costco.com/adobe/assets/urn:aaid:aem:x/as/";

test("an image is picked only when its file name carries the item number", () => {
  const imgs = [
    { alt: "LG 77\" Class - OLEDC6", src: `${A}9502177-894__1.avif?width=350` },
    { alt: "LG 77\" Class - OLEDB6E", src: `${A}9508277-894__1.avif?width=350` },
  ];
  assert.strictEqual(pickBySku(imgs, "9508277").alt, "LG 77\" Class - OLEDB6E");
  assert.strictEqual(pickBySku(imgs, "9508265"), null); // a name match without the number is not enough
});

test("Business Centre file names (<item>__1 and <hash>__<item>__1) match, a longer number does not", () => {
  assert.ok(pickBySku([{ src: `${A}3026010__1.avif` }], "3026010"));
  assert.ok(pickBySku([{ src: `${A}btb5m64kp6kz2hgrxxx8rr5__3048000__1.avif?x=1` }], "3048000"));
  assert.strictEqual(pickBySku([{ src: `${A}13026010-894__1.avif` }], "3026010"), null);
  assert.strictEqual(pickBySku([{ src: `${A}30260100-894__1.avif` }], "3026010"), null);
});

test("a page image that is not a product asset (logo, social icon) is never picked", () => {
  assert.strictEqual(pickBySku([{ src: "https://www.costco.ca/_social-3026010.avif" }], "3026010"), null);
});

test("the catalogue size replaces the page's thumbnail size", () => {
  const u = new URL(atCatalogueSize(`${A}9508277-894__1.avif?width=350&height=350&fit=contain`));
  assert.deepStrictEqual([u.searchParams.get("width"), u.searchParams.get("height")], ["600", "600"]);
});
