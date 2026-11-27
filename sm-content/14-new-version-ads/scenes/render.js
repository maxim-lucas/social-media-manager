// Renders the new-version ads (14-new-version-ads) to ready-to-upload/<LANG>/ under their upload names.
//   node sm-content/14-new-version-ads/scenes/render.js            # every ad, EN + FR
//   node sm-content/14-new-version-ads/scenes/render.js --only=C1-H6   # one hook
// Needs Playwright (Chromium). The page is creatives.html: ?c=free|scan&v=<hook>&f=<placement>&lang=en|fr.
// Rules and the naming scheme: ../README.md.
const { chromium } = require("playwright");
const fs = require("fs");
const path = require("path");

const SRC = path.join(__dirname, "creatives.html");
const OUT = path.join(__dirname, "..", "ready-to-upload");

// The ads that ship (Maxim, 2026-11-27: keep hooks 1, 2, 3 and 6). Hooks 4 and 5 stay renderable (v=4, v=5), unshipped.
const ADS = [
  { id: "C1-H1", name: "StopAskingTheGroup", c: "free", v: 1 },
  { id: "C1-H2", name: "RealWarehousePrice", c: "free", v: 2 },
  { id: "C1-H3", name: "SoldOut", c: "free", v: 3 },
  { id: "C1-H6", name: "SavingsInRealTime", c: "free", v: 6 },
  { id: "C2", name: "ReceiptScan-BLACK", c: "scan", v: 1 },
];
// Meta placements. One file per placement; the Feed file is also the organic IG / FB post, the Stories file the
// organic IG / FB story.
const PLACEMENTS = [
  { f: "poster", tag: "MetaAds-Feed_FB-IG", ratio: "4x5", w: 1080, h: 1350 },
  { f: "story", tag: "MetaAds-Stories_FB-IG", ratio: "9x16", w: 1080, h: 1920 },
  { f: "reels", tag: "MetaAds-Reels_FB-IG", ratio: "9x16", w: 1080, h: 1920 },
  { f: "square", tag: "MetaAds-Square_FB-RightColumn-Marketplace", ratio: "1x1", w: 1080, h: 1080 },
];

const only = (process.argv.find((a) => a.startsWith("--only=")) || "").slice(7);
(async () => {
  const browser = await chromium.launch();
  let n = 0;
  for (const lang of ["en", "fr"]) {
    const dir = path.join(OUT, lang.toUpperCase());
    fs.mkdirSync(dir, { recursive: true });
    for (const ad of ADS) {
      if (only && ad.id !== only) continue;
      for (const p of PLACEMENTS) {
        const page = await browser.newPage({ viewport: { width: p.w, height: p.h }, deviceScaleFactor: 1 });
        await page.goto(`file://${SRC}?c=${ad.c}&v=${ad.v}&f=${p.f}&lang=${lang}`);
        await page.waitForFunction(() => document.body.dataset.ready === "1");
        await page.waitForTimeout(150);
        const file = `PriceBack_${ad.id}_${ad.name}_${lang.toUpperCase()}_${p.tag}_${p.ratio}_${p.w}x${p.h}.png`;
        await page.screenshot({ path: path.join(dir, file), clip: { x: 0, y: 0, width: p.w, height: p.h } });
        await page.close();
        n++;
      }
    }
  }
  await browser.close();
  console.log(`${n} ads written to ${path.relative(process.cwd(), OUT)}/`);
})();
