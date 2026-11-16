const test = require("node:test");
const assert = require("node:assert");
const { stripHtml, STRIP } = require("./strip");

const money = (lang, n) => (lang === "fr" ? `${String(n).replace(".", ",")} $` : `$${n}`);

test("without exceptions the HTML is exactly what render.js produced before (regression pin)", () => {
  const html = stripHtml({ lang: "en", on: ["ON", "BC"], money });
  const expected =
    '<div class="strip"><span class="lab">SEEN IN</span>' +
    STRIP.map((c) => `<i class="${["ON", "BC"].includes(c) ? "on" : "off"}">${c}</i>`).join("") +
    "</div>";
  assert.strictEqual(html, expected);
});

test("Business Centre strip keeps its legend", () => {
  const html = stripHtml({ lang: "fr", on: [], bizOnly: ["ON"], bcOnly: true, money });
  assert.match(html, /RELEVÉ EN/);
  assert.match(html, /Centres d'affaires Costco seulement/);
  assert.match(html, /<i class="bz">ON<\/i>/);
});

test("a province with another amount shows it small in its own cell", () => {
  const html = stripHtml({ lang: "en", on: ["ON", "AB", "BC"], exceptions: { AB: 2, BC: 2 }, money });
  assert.match(html, /<i class="on exc">AB<small>\$2<\/small><\/i>/);
  assert.match(html, /<i class="on exc">BC<small>\$2<\/small><\/i>/);
  assert.match(html, /<i class="on">ON<\/i>/);
});

test("French amounts are localised", () => {
  assert.match(stripHtml({ lang: "fr", on: ["QC"], exceptions: { QC: 2.5 }, money }), /QC<small>2,5 \$<\/small>/);
});

test("an exception for a province the saving is not in is ignored", () => {
  assert.doesNotMatch(stripHtml({ lang: "en", on: ["ON"], exceptions: { AB: 2 }, money }), /exc/);
});
