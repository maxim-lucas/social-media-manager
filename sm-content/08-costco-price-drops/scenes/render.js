// Costco price drops pack — renderer. drops.json in, one PNG per post per language out.
//
//   node sm-content/08-costco-price-drops/scenes/render.js                         drops.json: every post, EN + FR
//   node sm-content/08-costco-price-drops/scenes/render.js pet-catit               one post
//   node sm-content/08-costco-price-drops/scenes/render.js weeks/2026-10-16.json   a week's carousels
//   node sm-content/08-costco-price-drops/scenes/render.js weeks/2026-10-16.json drinks   one carousel
//
// A week file holds `carousels`: one per category, one item per slide (always), written to
// posts/<week>/<carousel>/<nn>-<item>-<lang>.png in slide order.
//
// Unlike the other packs this one renders HTML in headless Chromium (Playwright), not SVG through
// sharp: the posts are built around a product photograph and a shelf tag, which is layout work
// HTML does well. The look itself is specified in ../STYLE.md; this file only implements it.
//
// Product photos are pulled from the item's sameday.costco.ca page at render time and cached in
// scenes/.cache/ (gitignored). They belong to the brands, so the repo stores the finished posts,
// never the raw packshots.

const fs = require("fs");
const path = require("path");
const https = require("https");

let chromium;
try {
  ({ chromium } = require("playwright"));
} catch {
  console.error("render.js needs Playwright: npm i -D playwright (or run with NODE_PATH pointing at one).");
  process.exit(1);
}

const ROOT = path.join(__dirname, "..");
const OUT = path.join(ROOT, "posts");
const CACHE = path.join(__dirname, ".cache");
const args = process.argv.slice(2);
const dataFile = args[0] && args[0].endsWith(".json") ? args.shift() : "drops.json";
const DATA = JSON.parse(fs.readFileSync(path.resolve(__dirname, dataFile), "utf8"));
const WEEK = DATA.carousels ? path.basename(dataFile, ".json") : null;
const MARK = "data:image/png;base64," + fs.readFileSync(path.join(__dirname, "mark.png")).toString("base64");
// The official App Store and Google Play badges, shared with the launch pack. Unaltered artwork.
const BADGES = path.join(ROOT, "..", "06-launch", "badges");
const only = args[0];

// ── Copy, both languages. Every visible word lives here. ───────────────────
const L = {
  en: {
    drop: "PRICE DROP",
    drops: "PRICE DROPS",
    exp: "EXP.",
    off: "OFF",
    instant: "Instant Savings",
    register: "PRICE AT REGISTER",
    save: (n) => `SAVE ${money("en", n, true)}`,
    totalOff: (n) => `${money("en", n, true)} OFF`,
    paid: (p) => `Paid ${money("en", p)} in the last 30 days?`,
    claim: (n) => `Claim the ${money("en", n, true)} difference.`,
    paidMany: "Bought these at full price?",
    claimMany: "Claim the difference.",
    pitch: "Scan your Costco receipt. We tell you when the price drops.",
    free: "Free on iPhone and Android",
    fine: (d, where) =>
      `Price seen at Costco ${where ? `in ${where}` : "Canada"}, ${dateLong("en", d)}. Adjustment terms are set by the retailer. ` +
      "PriceBack is an independent app, not affiliated with Costco.",
  },
  fr: {
    drop: "BAISSE DE PRIX",
    drops: "BAISSES DE PRIX",
    exp: "EXP.",
    off: "DE RABAIS",
    instant: "Économies instantanées",
    register: "PRIX À LA CAISSE",
    save: (n) => `ÉCONOMISEZ ${money("fr", n, true)}`,
    totalOff: (n) => `${money("fr", n, true)} DE RABAIS`,
    paid: (p) => `Payé ${money("fr", p)} ces 30 derniers jours ?`,
    claim: (n) => `Réclamez la différence de ${money("fr", n, true)}.`,
    paidMany: "Payé le plein prix ?",
    claimMany: "Réclamez la différence.",
    pitch: "Scannez votre reçu Costco. On vous avertit si le prix baisse.",
    free: "Gratuit sur iPhone et Android",
    fine: (d, where) =>
      `Prix relevé chez Costco ${where ? `au ${where}` : "Canada"} le ${dateLong("fr", d)}. Les conditions d'ajustement sont fixées par le détaillant. ` +
      "PriceBack est une application indépendante, non affiliée à Costco.",
  },
};

// `$6` / `$19.99` in English, `6 $` / `19,99 $` in French (playbook §5).
function money(lang, n, round = false) {
  const s = round && Number.isInteger(n) ? String(n) : n.toFixed(2);
  return lang === "fr" ? `${s.replace(".", ",")} $` : `$${s}`;
}
// The tag itself prints bare numbers, the way Costco's do: 19.99 / 19,99.
const num = (lang, n) => (lang === "fr" ? n.toFixed(2).replace(".", ",") : n.toFixed(2));
function dateLong(lang, iso) {
  return new Date(iso + "T12:00:00Z").toLocaleDateString(lang === "fr" ? "fr-CA" : "en-CA", {
    day: "numeric", month: lang === "fr" ? "long" : "short", year: "numeric", timeZone: "UTC",
  });
}
function dateShort(lang, iso) {
  return new Date(iso + "T12:00:00Z")
    .toLocaleDateString(lang === "fr" ? "fr-CA" : "en-CA", { day: "numeric", month: lang === "fr" ? "long" : "short", timeZone: "UTC" })
    .replace(".", "")
    .toUpperCase();
}
const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

// ── Product photos ──────────────────────────────────────────────────────────
function get(url) {
  return new Promise((resolve, reject) => {
    https
      .get(url, { headers: { "User-Agent": "Mozilla/5.0" } }, (res) => {
        if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
          res.resume();
          return resolve(get(new URL(res.headers.location, url).toString()));
        }
        if (res.statusCode !== 200) return reject(new Error(`${res.statusCode} ${url}`));
        const chunks = [];
        res.on("data", (c) => chunks.push(c));
        res.on("end", () => resolve(Buffer.concat(chunks)));
      })
      .on("error", reject);
  });
}

async function productPhoto(sku, item) {
  fs.mkdirSync(CACHE, { recursive: true });
  const file = path.join(CACHE, `${sku}.jpg`);
  if (fs.existsSync(file)) return file;
  const page = (await get(`https://sameday.costco.ca/store/costco-canada/products/${item.sameday}`)).toString("utf8");
  if (/\/login\?next=/.test(page) && page.length < 2000) {
    throw new Error(`sku ${sku}: sameday page ${item.sameday} needs a login. Save the photo to scenes/.cache/${sku}.jpg by hand.`);
  }
  const urls = [
    ...new Set(
      (page.replace(/\\u002F/g, "/").replace(/\\\//g, "/").match(/https:\/\/[^"' ]*product-image\/file\/large_[a-f0-9-]+\.(?:jpg|png)/g) || [])
    ),
  ];
  if (!urls.length) throw new Error(`sku ${sku}: no product photo on sameday page ${item.sameday}`);
  fs.writeFileSync(file, await get(urls[item.image || 0]));
  return file;
}

// ── Markup ──────────────────────────────────────────────────────────────────
function tag(lang, sku, item, { compact = false } = {}) {
  const t = L[lang];
  return `<div class="ptag${compact ? " compact" : ""}">
    <div class="num">${sku}</div>
    <div class="row"><div class="name">${item.tag[lang].map(esc).join("<br>")}</div>
      <div><div class="reg">${num(lang, item.regular)}</div><div class="off">-${num(lang, item.off)}</div></div></div>
    ${compact ? "" : `<div class="row hlrow"><span class="hl">${t.instant}</span><span class="hl">${t.exp} ${item.exp}</span></div>`}
    <div class="par">${t.register}</div>
    <div class="big">${num(lang, item.price)}</div>
  </div>`;
}

function post(lang, p, photos, badges) {
  const t = L[lang];
  const items = p.items.map((sku) => [sku, DATA.items[sku]]);
  const single = p.layout === "single";
  const total = items.reduce((s, [, i]) => s + i.off, 0);
  const firstExp = items.map(([, i]) => i.exp).sort()[0];
  const right = single
    ? `${esc(p.category[lang]).toUpperCase()}<br>${t.exp} ${dateShort(lang, firstExp)}`
    : `${esc(p.category[lang]).toUpperCase()}<br>${t.totalOff(total)}`;
  let body;
  if (single) {
    const [sku, item] = items[0];
    body = `<div class="photo hero" style="background-image:url('${photos[sku]}')"></div>
      <div class="burst"><div class="x${money(lang, item.off, true).length > 4 ? " long" : ""}">-${money(lang, item.off, true)}</div><div class="y">${t.off}</div></div>
      ${tag(lang, sku, item)}`;
  } else {
    const w = items.length === 2 ? 465 : 300;
    const gap = (1080 - 90 - w * items.length) / (items.length - 1);
    body = items
      .map(([sku, item], i) => `<div class="card" style="left:${45 + i * (w + gap)}px;width:${w}px">
        <div class="photo" style="background-image:url('${photos[sku]}')"></div>
        ${tag(lang, sku, item, { compact: true })}
        <div class="save">${t.save(item.off)}</div></div>`)
      .join("");
  }
  const claim = single
    ? `${t.paid(items[0][1].regular)}<br><b>${t.claim(items[0][1].off)}</b>`
    : `${t.paidMany}<br><b>${t.claimMany}</b>`;
  const seen = items.map(([, i]) => i.seen || DATA.seenOn).sort().pop();
  // Download row: the app's pitch, then Apple's and Google's own badges in the red band.
  const promo = `<div class="promo"><div class="pb"><img src="${MARK}">PriceBack</div>
      <div class="pitch">${esc(t.pitch)}<br><span>${esc(t.free)}</span></div></div>`;
  const stores = `<div class="stores"><img src="${badges.apple}"><img src="${badges.google}"></div>`;
  return `<!doctype html><html lang="${lang}"><head><meta charset="utf-8"><style>${CSS}
    .card .ptag .name{min-height:${items.length > 2 ? 76 : 60}px}</style></head><body>
  <div class="post ${lang} ${single ? "s" : "g"}">
    <div class="band"><div class="t">COSTCO <span>${single ? t.drop : t.drops}</span></div><div class="c">${right}</div></div>
    <div class="stripe"></div>
    ${body}
    ${promo}
    <div class="disc">${esc(t.fine(seen, regionName(lang, items[0][1].provinces)))}</div>
    <div class="claim"><div class="a">${claim}</div>${stores}</div>
  </div></body></html>`;
}

const CSS = `
*{box-sizing:border-box;margin:0;padding:0}
body{width:1080px;height:1350px;font-family:"Helvetica Neue",Arial,sans-serif}
:root{--red:#E31837;--blue:#005DAA;--yel:#fff200}
.post{width:1080px;height:1350px;position:relative;overflow:hidden;background:#fff}
.band{position:absolute;top:0;left:0;right:0;height:150px;background:var(--blue);display:flex;align-items:center;padding:0 60px;justify-content:space-between}
.band .t{color:#fff;font-weight:900;font-size:58px;letter-spacing:-1px;white-space:nowrap}
.band .t span{background:var(--red);padding:2px 18px;margin-left:8px}
.fr .band .t{font-size:48px}
.band .c{color:#cfe3f5;font-size:22px;font-weight:700;letter-spacing:3px;text-align:right;white-space:nowrap}
.stripe{position:absolute;top:150px;left:0;right:0;height:16px;background:var(--red)}
.photo{position:absolute;background-size:contain;background-repeat:no-repeat;background-position:center}
.photo.hero{left:60px;right:60px;top:186px;height:430px}
.ptag{background:#fff;border:2px solid #d4d4d4;box-shadow:0 18px 40px rgba(0,0,0,.18);font-family:"Times New Roman",Georgia,serif;color:#111;position:absolute}
.s .ptag{left:250px;right:60px;top:600px;padding:18px 30px 14px;transform:rotate(-1.5deg)}
.ptag .num{font-size:44px}
.ptag .name{font-size:34px;text-transform:uppercase;line-height:1.1;letter-spacing:.5px}
.ptag .row{display:flex;justify-content:space-between;align-items:flex-end;margin-top:6px}
.hl{background:var(--yel);font-family:Arial,sans-serif;font-weight:700;font-size:22px;padding:0 6px}
.reg{text-align:right;font-size:38px;line-height:1}
.off{background:var(--yel);font-size:42px;line-height:1.05;padding:0 4px}
.par{text-align:right;font-family:Arial,sans-serif;font-size:18px;letter-spacing:1px;margin-top:6px;border-top:2px solid #111;padding-top:4px}
.big{text-align:right;font-size:132px;font-weight:700;letter-spacing:-3px;line-height:.9}
.burst{position:absolute;left:52px;top:640px;width:200px;height:200px;border-radius:50%;background:var(--red);color:#fff;display:flex;flex-direction:column;align-items:center;justify-content:center;font-weight:900;transform:rotate(-10deg);box-shadow:0 12px 30px rgba(0,0,0,.25);border:6px solid #fff;text-align:center}
.burst .x{font-size:60px;line-height:1;white-space:nowrap}.burst .x.long{font-size:42px}.burst .y{font-size:20px;letter-spacing:2px}
.card{position:absolute;top:220px;height:800px;background:#fff;border:2px solid #e5e7eb;border-radius:10px;overflow:hidden}
.card .photo{left:20px;right:20px;top:20px;height:380px}
.card .ptag{left:18px;right:18px;top:420px;padding:16px 20px 12px;box-shadow:none}
.card .ptag .num{font-size:32px}.card .ptag .name{font-size:26px}
.card .reg{font-size:30px}.card .off{font-size:32px}.card .par{font-size:14px}
.card .big{font-size:112px;letter-spacing:-2px}
.save{position:absolute;left:18px;right:18px;bottom:18px;background:var(--red);color:#fff;text-align:center;font-weight:900;font-size:28px;padding:14px 0;border-radius:6px}
.disc{position:absolute;left:60px;right:60px;bottom:182px;font-size:16px;line-height:1.35;color:#6b7280;text-align:center}
.claim{position:absolute;left:0;right:0;bottom:0;height:170px;background:var(--red);color:#fff;display:flex;align-items:center;justify-content:space-between;padding:0 60px}
.claim .a{font-size:30px;font-weight:800;line-height:1.3}
.fr .claim .a{font-size:27px}
.claim .a b{background:#fff;color:var(--red);padding:0 10px;font-weight:900}
.pb{display:flex;align-items:center;gap:12px;font-weight:900;font-size:28px;background:#fff;color:#0d3d28;padding:12px 18px;border-radius:14px;white-space:nowrap}
.pb img{width:40px;height:40px;border-radius:10px}
.promo{position:absolute;left:60px;right:60px;top:1030px;height:86px;display:flex;align-items:center;gap:22px;border-top:2px solid #e5e7eb;padding-top:14px}
.promo .pb{background:#0d3d28;color:#fff;flex:none}
.promo .pitch{font-size:24px;font-weight:700;color:#111;line-height:1.3;white-space:nowrap}
.promo .pitch span{color:#0d3d28;font-weight:800}
.stores{display:flex;flex-direction:column;gap:12px;align-items:flex-end;flex:none}
.stores img{height:62px;width:200px;object-fit:contain;object-position:right;display:block}
.g .promo{top:1040px}
`;

// Crop the white margin off a packshot so every product fills its frame the same way.
async function trimmed(page, file) {
  const src = "data:image/jpeg;base64," + fs.readFileSync(file).toString("base64");
  return page.evaluate(async (src) => {
    const img = new Image();
    img.src = src;
    await img.decode();
    const c = document.createElement("canvas");
    c.width = img.naturalWidth;
    c.height = img.naturalHeight;
    const g = c.getContext("2d");
    g.drawImage(img, 0, 0);
    const { data, width, height } = g.getImageData(0, 0, c.width, c.height);
    let x0 = width, y0 = height, x1 = -1, y1 = -1;
    for (let y = 0; y < height; y++)
      for (let x = 0; x < width; x++) {
        const i = (y * width + x) * 4;
        if (data[i] < 243 || data[i + 1] < 243 || data[i + 2] < 243) {
          if (x < x0) x0 = x;
          if (x > x1) x1 = x;
          if (y < y0) y0 = y;
          if (y > y1) y1 = y;
        }
      }
    if (x1 < 0) return src;
    const o = document.createElement("canvas");
    o.width = x1 - x0 + 1;
    o.height = y1 - y0 + 1;
    o.getContext("2d").drawImage(c, x0, y0, o.width, o.height, 0, 0, o.width, o.height);
    return o.toDataURL("image/png");
  }, src);
}

// Store badges: Apple's SVG as is; Google's PNG ships with a transparent margin, trimmed off so both
// badges stand at the same visible height. Apple has no French-Canadian badge in badges/ yet; drop
// app-store-fr.svg there and it is used automatically (same rule as the launch pack).
async function storeBadges(page, lang) {
  const appleFile = fs.existsSync(path.join(BADGES, `app-store-${lang}.svg`)) ? `app-store-${lang}.svg` : "app-store-en.svg";
  const apple = "data:image/svg+xml;base64," + fs.readFileSync(path.join(BADGES, appleFile)).toString("base64");
  const src = "data:image/png;base64," + fs.readFileSync(path.join(BADGES, `google-play-${lang}.png`)).toString("base64");
  const google = await page.evaluate(async (src) => {
    const img = new Image();
    img.src = src;
    await img.decode();
    const c = document.createElement("canvas");
    c.width = img.naturalWidth;
    c.height = img.naturalHeight;
    const g = c.getContext("2d");
    g.drawImage(img, 0, 0);
    const { data, width, height } = g.getImageData(0, 0, c.width, c.height);
    let x0 = width, y0 = height, x1 = -1, y1 = -1;
    for (let y = 0; y < height; y++)
      for (let x = 0; x < width; x++)
        if (data[(y * width + x) * 4 + 3] > 8) {
          if (x < x0) x0 = x;
          if (x > x1) x1 = x;
          if (y < y0) y0 = y;
          if (y > y1) y1 = y;
        }
    const o = document.createElement("canvas");
    o.width = x1 - x0 + 1;
    o.height = y1 - y0 + 1;
    o.getContext("2d").drawImage(c, x0, y0, o.width, o.height, 0, 0, o.width, o.height);
    return o.toDataURL("image/png");
  }, src);
  return { apple, google };
}

// Who a saving is for decides its languages (Monica, 2026-10-15): national savings go out in EN and FR,
// Quebec-only savings in French, savings only in other provinces in English. An item without
// `provinces` (drops.json) is treated as national. Province lists come from the price points.
const PROV = {
  en: { AB: "Alberta", BC: "B.C.", MB: "Manitoba", NB: "New Brunswick", NL: "Newfoundland and Labrador", NS: "Nova Scotia",
        ON: "Ontario", PE: "P.E.I.", QC: "Quebec", SK: "Saskatchewan", NT: "the N.W.T.", NU: "Nunavut", YT: "Yukon" },
};
const national = (prov) => !prov || prov === "all";
function itemLangs(item) {
  if (national(item.provinces)) return ["en", "fr"];
  if (item.provinces.length === 1 && item.provinces[0] === "QC") return ["fr"];
  return item.provinces.includes("QC") ? ["en", "fr"] : ["en"];
}
const langsFor = (p) => ["en", "fr"].filter((l) => p.items.every((sku) => itemLangs(DATA.items[sku]).includes(l)));
function regionName(lang, prov) {
  if (national(prov)) return null;
  if (lang === "fr") return prov.length === 1 && prov[0] === "QC" ? "Québec" : prov.join(", ");
  const names = prov.map((c) => PROV.en[c] || c);
  return names.length > 1 ? `${names.slice(0, -1).join(", ")} and ${names[names.length - 1]}` : names[0];
}

// drops.json lists posts; a week file lists carousels, expanded here into one single-item slide each.
function allPosts() {
  if (!DATA.carousels) return DATA.posts.map((p) => ({ ...p, file: p.id }));
  return DATA.carousels.flatMap((c) =>
    c.items.map((sku, i) => ({
      id: c.id,
      layout: "single",
      category: c.category,
      items: [sku],
      file: path.join(WEEK, c.id, `${String(i + 1).padStart(2, "0")}-${sku}`),
    }))
  );
}

(async () => {
  const posts = allPosts().filter((p) => !only || p.id === only);
  if (!posts.length) throw new Error(`no post or carousel "${only}" in ${dataFile}`);
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1080, height: 1350 } });
  await page.setContent("<html><body></body></html>");
  const badges = { en: await storeBadges(page, "en"), fr: await storeBadges(page, "fr") };
  const photos = {};
  for (const p of posts)
    for (const sku of p.items) if (!photos[sku]) photos[sku] = await trimmed(page, await productPhoto(sku, DATA.items[sku]));
  for (const p of posts)
    for (const lang of langsFor(p)) {
      await page.setContent(post(lang, p, photos, badges[lang]), { waitUntil: "load" });
      const file = path.join(OUT, `${p.file}-${lang}.png`);
      fs.mkdirSync(path.dirname(file), { recursive: true });
      await page.screenshot({ path: file });
      console.log(path.relative(process.cwd(), file));
    }
  await browser.close();
})().catch((e) => {
  console.error(e.message);
  process.exit(1);
});
