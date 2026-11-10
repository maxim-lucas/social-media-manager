// Searches Costco Same-Day through its search box for each query; prints product tiles (alt + image URL)
// and saves a screenshot of each results page for eyeballing.
const { chromium } = require("playwright");
(async () => {
  const out = process.env.OUT || ".";
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 1280, height: 1400 } });
  await p.goto("https://sameday.costco.ca/store/costco-canada/storefront", { waitUntil: "domcontentloaded", timeout: 60000 });
  await p.waitForTimeout(5000);
  for (const q of process.argv.slice(2)) {
    try {
      await p.goto(`https://sameday.costco.ca/store/costco-canada/s?k=${encodeURIComponent(q)}`, { waitUntil: "domcontentloaded", timeout: 60000 });
      await p.waitForTimeout(7000);
      const tiles = await p.evaluate(() =>
        [...document.querySelectorAll("img")]
          .map((i) => ({ alt: i.alt, src: i.currentSrc || i.src }))
          .filter((x) => x.alt && /image-server|cloudfront/.test(x.src) && !/logo|Instacart|membership/i.test(x.alt))
          .slice(0, 6)
      );
      await p.screenshot({ path: `${out}/q-${q.replace(/\W+/g, "_")}.png` });
      console.log(JSON.stringify({ q, url: p.url(), tiles }));
    } catch (e) {
      console.log(JSON.stringify({ q, err: e.message }));
    }
  }
  await b.close();
})();
