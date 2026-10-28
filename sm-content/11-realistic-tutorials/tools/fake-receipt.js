// fake-receipt.js — the ONLY receipt that may appear in a realistic tutorial.
//
// No real member's receipt is ever filmed, scanned or used as a generation reference. This one is
// invented end to end: warehouse #000, member 000000000000, card ending 0000, auth 000000, register 0,
// and an "EXAMPLE · NOT A REAL RECEIPT" line printed in the header. Item names are ordinary product
// descriptions; prices are illustrative and the arithmetic adds up (subtotal, 13% tax, total), so a
// close-up never shows a receipt that is wrong on its face.
//
//   node tools/fake-receipt.js <out-dir>
//     receipt-example.png   1200 px wide, full length — reference image for AI keyframes
//     receipt-example.pdf   80 mm wide — print it on plain or thermal paper for the screen recording

const fs = require("fs");
const path = require("path");
const { chromium } = require(process.env.PW || "/opt/npm-tools/node_modules/playwright");

const out = path.resolve(process.argv[2] || ".");
fs.mkdirSync(out, { recursive: true });
const font = (w) => "data:font/woff2;base64," + fs.readFileSync(path.join(__dirname, "node_modules/@fontsource/roboto-mono/files", `roboto-mono-latin-${w}-normal.woff2`)).toString("base64");

// Long on purpose: the hook shot is someone trying to fit all of this into one photo.
const ITEMS = [
  ["1254041", "BURRATA 2X240G", 17.99], ["1405731", "BASMATI RICE 10KG", 39.99], ["266556", "HOUSE BLEND COFFEE", 52.99],
  ["2023352", "ELECTRIC KETTLE 1.7L", 39.99], ["680", "CHEESE SLICES 1.25KG", 9.99], ["1460350", "MARINARA 2X770ML", 15.99],
  ["4321", "BANANAS 1.36KG", 1.99], ["30669", "LARGE EGGS 24CT", 8.49], ["1688", "2% MILK 3X4L", 9.79],
  ["1637304", "BBQ SAUCE 2X1L", 29.99], ["2688395", "PROTEIN CHIPS 14CT", 36.99], ["874", "ORGANIC SPINACH 1KG", 6.99],
  ["1092", "CROISSANTS 12CT", 8.99], ["511", "CHICKEN BREAST 2.2KG", 31.47], ["2177", "PAPER TOWEL 12 ROLLS", 24.99],
  ["1700958", "EYE DROPS 3X10ML", 23.99], ["2777078", "CAT TREATS 24PK", 19.99], ["915", "SPARKLING WATER 24CT", 9.99],
  ["3388", "BLUEBERRIES 1.36KG", 9.99], ["2120", "DISH PODS 115CT", 26.99],
];
const sub = ITEMS.reduce((a, i) => a + i[2], 0);
const tax = Math.round(sub * 0.13 * 100) / 100; // illustrative HST on everything; the receipt is not a tax document
const total = Math.round((sub + tax) * 100) / 100;
const m = (n) => n.toFixed(2);


// A barcode and a QR-shaped block that encode nothing: deterministic noise with the right look.
let seed = 42; const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
const BARS = Array.from({ length: 70 }, (_, i) => `<i style="width:${1 + Math.floor(rnd() * 3)}px;margin-right:${1 + Math.floor(rnd() * 3)}px"></i>`).join("");
const QR = (() => {
  const n = 25, cells = [];
  const finder = (r, c) => [[0, 0], [0, n - 7], [n - 7, 0]].some(([fr, fc]) => {
    const y = r - fr, x = c - fc; if (y < 0 || x < 0 || y > 6 || x > 6) return null;
    return y === 0 || y === 6 || x === 0 || x === 6 || (y >= 2 && y <= 4 && x >= 2 && x <= 4);
  });
  const inFinder = (r, c) => [[0, 0], [0, n - 7], [n - 7, 0]].some(([fr, fc]) => r >= fr - 1 && r <= fr + 7 && c >= fc - 1 && c <= fc + 7);
  for (let r = 0; r < n; r++) for (let c = 0; c < n; c++) {
    const on = inFinder(r, c) ? finder(r, c) : rnd() < 0.48;
    cells.push(on ? "<i></i>" : "<b></b>");
  }
  return cells.join("");
})();
const row = (l, r, cls = "") => `<div class="l ${cls}"><span>${l}</span><span>${r}</span></div>`;
const html = (widthCss) => `<!doctype html><html><head><meta charset="utf-8"><style>
@font-face{font-family:M;font-weight:400;src:url(${font(400)})}
@font-face{font-family:M;font-weight:700;src:url(${font(700)})}
*{margin:0;padding:0;box-sizing:border-box}
body{background:#fff;font-family:M,monospace;color:#1b1b1b}
.rc{width:${widthCss};padding:6% 5% 9%;font-size:${widthCss === "80mm" ? "8.6pt" : "30px"};line-height:1.32}
.c{text-align:center}.b{font-weight:700}.big{font-size:1.6em;letter-spacing:.12em}
.ex{margin:.6em 0;border:1px dashed #1b1b1b;padding:.25em;text-align:center;font-weight:700}
.l{display:flex;justify-content:space-between;gap:1em}.l span:first-child{white-space:nowrap;overflow:hidden}
.hr{border-top:1px dashed #1b1b1b;margin:.55em 0}.gap{height:.8em}
.bars{display:flex;justify-content:center;height:3.2em;margin:.4em 0}.bars i{display:block;height:100%;background:#1b1b1b}
.qrrow{display:flex;gap:1em;align-items:center;justify-content:center}.qr{display:grid;grid-template-columns:repeat(25,1fr);width:7.5em;height:7.5em}.qr i{background:#1b1b1b}.qr b{background:transparent}.qrt{font-size:.85em}
.ad{border:2px solid #1b1b1b;padding:.5em;text-align:center;font-weight:700;font-size:1.15em}.ad span{font-weight:400;font-size:.8em}
</style></head><body><div class="rc">
<div class="c b big">COSTCO</div><div class="c b">WHOLESALE</div>
<div class="c">WAREHOUSE #000 · EXAMPLE CITY</div><div class="c">000 EXAMPLE ROAD</div>
<div class="ex">EXAMPLE · NOT A REAL RECEIPT</div><div class="hr"></div>
${ITEMS.map(([n, d, p]) => row(`${n.padEnd(8, "\u00a0")}${d}`, m(p))).join("")}
<div class="hr"></div>
${row("SUBTOTAL", m(sub), "b")}${row("TAX", m(tax))}${row("**** TOTAL", m(total), "b")}
<div class="gap"></div>
${row("VISA ************0000", m(total))}${row("APPROVED · AUTH 000000", "")}${row("CHANGE", "0.00")}
<div class="gap"></div><div class="c">TOTAL NUMBER OF ITEMS SOLD = ${ITEMS.length}</div>
<div class="c" id="dateline">10/20/2026 14:32 000 0 0000 000</div>
<div id="cut"></div>
<div class="gap"></div><div class="hr"></div>
<div class="c">OP# 000 &nbsp; MEMBER 000000000000</div>
<div class="bars">${BARS}</div>
<div class="c b">THANK YOU! PLEASE COME AGAIN</div><div class="gap"></div>
<div class="qrrow"><div class="qr">${QR}</div><div class="qrt">TELL US HOW WE DID.<br>SCAN TO TAKE A SHORT SURVEY.</div></div>
<div class="gap"></div><div class="ad">SAVE MORE THIS WEEK<br><span>SEE IN-WAREHOUSE SAVINGS</span></div>
<div class="gap"></div><div class="c">EXAMPLE · NOT A REAL RECEIPT</div>
</div></body></html>`;

(async () => {
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 1200, height: 1000 } });
  await p.setContent(html("1200px"));
  await p.evaluate(() => Promise.all(["400", "700"].map((w) => document.fonts.load(w + " 30px M"))));
  if (!(await p.evaluate(() => document.fonts.check("700 30px M")))) throw new Error("Roboto Mono did not load");
  // No line may overflow: a clipped item name would read as a misprint in close-up.
  const clipped = await p.$$eval(".l span:first-child", (els) => els.filter((e) => e.scrollWidth > e.clientWidth).map((e) => e.innerText));
  if (clipped.length) throw new Error("clipped lines: " + clipped.join(" | "));
  await (await p.$(".rc")).screenshot({ path: path.join(out, "receipt-example.png") });
  const cutY = await p.evaluate(() => { const rc = document.querySelector(".rc").getBoundingClientRect(); return Math.round(document.getElementById("cut").getBoundingClientRect().top - rc.top); });
  const fullH = await p.$eval(".rc", (e) => Math.round(e.getBoundingClientRect().height));
  fs.writeFileSync(path.join(out, "receipt-example.json"), JSON.stringify({ width: 1200, height: fullH, keepTo: cutY, note: "Everything above keepTo is what the scan should capture (header to the date line). Below it: membership, QR code, ad: left out." }, null, 2));
  await p.setContent(html("80mm"));
  await p.evaluate(() => Promise.all(["400", "700"].map((w) => document.fonts.load(w + " 30px M"))));
  const hMm = Math.ceil((await p.$eval(".rc", (e) => e.getBoundingClientRect().height)) / 3.7795) + 2;
  await p.pdf({ path: path.join(out, "receipt-example.pdf"), width: "80mm", height: `${hMm}mm`, printBackground: true, pageRanges: "1" });
  await b.close();
  console.log(`fake receipt: ${ITEMS.length} items, subtotal ${m(sub)}, tax ${m(tax)}, total ${m(total)}; PDF 80 x ${hMm} mm`);
})().catch((e) => { console.error(e.message); process.exit(1); });
