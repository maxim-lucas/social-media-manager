// costco.ca search in headless Chromium: prints product image URLs found for each query
const { chromium } = require("playwright");
(async () => {
  const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1280, height: 1400 } });
  for (const q of process.argv.slice(2)) {
    try {
      await p.goto(`https://www.costco.ca/s?keyword=${encodeURIComponent(q)}&langId=-24`, { waitUntil: "domcontentloaded", timeout: 45000 });
      await p.waitForTimeout(8000);
      const html = await p.content();
      const imgs = [...new Set(html.match(/https:\/\/[^"' ]*gdx-assets[^"' ]*?\/as\/[0-9]+-894__1[^"' ]*/g) || [])].slice(0, 4);
      const title = await p.title();
      console.log(JSON.stringify({ q, url: p.url(), title, imgs }));
    } catch (e) { console.log(JSON.stringify({ q, err: e.message.slice(0, 100) })); }
  }
  await b.close();
})();
