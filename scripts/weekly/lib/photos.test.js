const test = require("node:test");
const assert = require("node:assert");
const fs = require("fs");
const os = require("os");
const path = require("path");
const { fetchPhoto, preflight, PHOTO_ROUTE } = require("./photos");

const JPEG = Buffer.concat([Buffer.from([0xff, 0xd8, 0xff, 0xe0]), Buffer.alloc(2000, 1)]);
const res = (status, type, body = JPEG) => ({ ok: status < 400, status, headers: { get: () => type }, arrayBuffer: async () => body });
const tmp = () => fs.mkdtempSync(path.join(os.tmpdir(), "photos-"));
const json404 = () => res(404, "application/json", Buffer.from("{}"));

test("the public route is the verified one", () => {
  assert.strictEqual(PHOTO_ROUTE, "https://priceback-production.up.railway.app/api/product-images/costco/");
});

test("200 image/jpeg is saved and reported as r2", async () => {
  const dir = tmp();
  const r = await fetchPhoto("2034361", { cacheDir: dir, fetchImpl: async () => res(200, "image/jpeg") });
  assert.deepStrictEqual([r.ok, r.source], [true, "r2"]);
  assert.ok(fs.existsSync(path.join(dir, "2034361.jpg")));
});

test("404 then a working fallback reports the fallback", async () => {
  const r = await fetchPhoto("1", {
    cacheDir: tmp(), fetchImpl: async () => json404(),
    fallbacks: [{ name: "sameday", get: async () => JPEG }],
  });
  assert.deepStrictEqual([r.ok, r.source], [true, "sameday"]);
});

test("everything missing is ok:false and writes nothing", async () => {
  const dir = tmp();
  const r = await fetchPhoto("1", { cacheDir: dir, fetchImpl: async () => json404() });
  assert.strictEqual(r.ok, false);
  assert.deepStrictEqual(fs.readdirSync(dir), []);
});

test("an HTML page with status 200 is rejected", async () => {
  const r = await fetchPhoto("1", { cacheDir: tmp(), fetchImpl: async () => res(200, "text/html", Buffer.from("<html>")) });
  assert.strictEqual(r.ok, false);
});

test("a body that is not an image is rejected even with an image content type", async () => {
  const r = await fetchPhoto("1", { cacheDir: tmp(), fetchImpl: async () => res(200, "image/jpeg", Buffer.from("not an image at all")) });
  assert.strictEqual(r.ok, false);
});

test("preflight reports the status when the route is down", async () => {
  const bad = await preflight(async () => res(503, "text/html", Buffer.from("x")));
  assert.deepStrictEqual([bad.ok, /503/.test(bad.detail)], [false, true]);
  assert.strictEqual((await preflight(async () => res(200, "image/jpeg"))).ok, true);
});

test("a thrown network error is a failed preflight, not a crash", async () => {
  const r = await preflight(async () => {
    throw new Error("ENOTFOUND");
  });
  assert.deepStrictEqual([r.ok, /ENOTFOUND/.test(r.detail)], [false, true]);
});
