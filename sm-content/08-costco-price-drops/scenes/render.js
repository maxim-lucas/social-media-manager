// Costco price drops pack — renderer. drops.json in, one PNG per post per language out.
//
//   node sm-content/08-costco-price-drops/scenes/render.js                         drops.json: every post, EN + FR
//   node sm-content/08-costco-price-drops/scenes/render.js pet-catit               one post
//   node sm-content/08-costco-price-drops/scenes/render.js weeks/2026-10-16.json   a week's carousels
//   node sm-content/08-costco-price-drops/scenes/render.js weeks/2026-10-16.json drinks   one carousel
//
// A week file holds `carousels`: one per category, one item per slide (always), written to
// posts/<week>/<lang>/<carousel>/<nn>-<item>.png in slide order.
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
const OUT = path.join(ROOT, process.argv.includes("--draft") ? "drafts" : "posts");
const CACHE = path.join(__dirname, ".cache");
const args = process.argv.slice(2).filter((a) => a !== "--draft");
// --draft: render without packshots (a marked placeholder instead) into drafts/, for reviewing copy, numbers
// and layout on a machine that cannot reach Same-Day. Never post a draft: no clean photo, no post.
const DRAFT = process.argv.includes("--draft");
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
    endKick: "DON'T MISS THE NEXT ONE",
    endHead: "Follow\n@priceback.ca",
    endSub: "New Costco price drops, every week.",
    endHow: "Scan your Costco receipt. PriceBack alerts you when a price drops, then you claim the difference.",
    endPlans: "Free to download. Try it free, then buy credits that never expire, or go Unlimited for the full experience.",
    endCta: "DOWNLOAD PRICEBACK",
    kick: "HIDDEN SAVINGS",
    head: (n) => `${n} secret Costco\nprice drops`,
    sub: (d) => `Valid until ${d}. Swipe to see them all.`,
    swipe: "SWIPE",
    until: "THIS WEEK",
    coverFine: (a, b) =>
      `Prices seen at Costco between ${dateShortCase("en", a)} and ${dateLong("en", b)}. Each slide names its provinces. ` +
      "Adjustment terms are set by the retailer. PriceBack is an independent app, not affiliated with Costco.",
    fine: (d, where) =>
      `Price seen at Costco ${where || "Canada"}, ${dateLong("en", d)}. Adjustment terms are set by the retailer. ` +
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
    endKick: "NE MANQUEZ PAS LES PROCHAINES",
    endHead: "Suivez\n@priceback.ca",
    endSub: "De nouvelles baisses de prix Costco chaque semaine.",
    endHow: "Scannez votre reçu Costco. PriceBack vous avertit quand un prix baisse, puis vous réclamez la différence.",
    endPlans: "Téléchargement gratuit. Essayez-le gratuitement, puis achetez des crédits qui n'expirent jamais, ou passez à Illimité pour l'expérience complète.",
    endCta: "TÉLÉCHARGEZ PRICEBACK",
    kick: "AUBAINES CACHÉES",
    head: (n) => `${n} baisses de prix\nsecrètes chez Costco`,
    sub: (d) => `Jusqu'au ${d}. Glissez pour les voir.`,
    swipe: "GLISSEZ",
    until: "CETTE SEMAINE",
    coverFine: (a, b) =>
      `Prix relevés chez Costco entre le ${dateShortCase("fr", a)} et le ${dateLong("fr", b)}. Chaque image indique ses provinces. ` +
      "Les conditions d'ajustement sont fixées par le détaillant. PriceBack est une application indépendante, non affiliée à Costco.",
    fine: (d, where) =>
      `Prix relevé chez Costco ${where || "Canada"} le ${dateLong("fr", d)}. Les conditions d'ajustement sont fixées par le détaillant. ` +
      "PriceBack est une application indépendante, non affiliée à Costco.",
  },
};

// A week file may override the cover's hook (`copy.<lang>.kick/head/sub`, `{n}` = item count, `{d}` = end date)
// and append a line to every fine print (`fineNote.<lang>`), e.g. when a week is not a hidden-savings week.
for (const lang of ["en", "fr"]) {
  const c = (DATA.copy || {})[lang] || {};
  if (c.kick) L[lang].kick = c.kick;
  if (c.head) L[lang].head = (n) => c.head.replace("{n}", n);
  if (c.sub) L[lang].sub = (d) => c.sub.replace("{d}", d);
  if (c.until) L[lang].until = c.until;
  const note = (DATA.fineNote || {})[lang];
  if (note) {
    const f = L[lang].fine, cf = L[lang].coverFine;
    L[lang].fine = (...a) => `${f(...a)} ${note}`;
    L[lang].coverFine = (...a) => `${cf(...a)} ${note}`;
  }
}

// `$6` / `$19.99` in English, `6 $` / `19,99 $` in French (playbook §5).
function money(lang, n, round = false) {
  let s = round && Number.isInteger(n) ? String(n) : n.toFixed(2);
  // 1,100 / 1 100 past four digits (French uses a narrow no-break space, as Costco Québec does).
  const [i, d] = s.split(".");
  const g = i.length > 3 ? i.replace(/\B(?=(\d{3})+$)/g, lang === "fr" ? "\u202f" : ",") : i;
  s = d ? `${g}.${d}` : g;
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
// "Oct 8" / "8 octobre", for running text.
const dateShortCase = (lang, iso) =>
  new Date(iso + "T12:00:00Z").toLocaleDateString(lang === "fr" ? "fr-CA" : "en-CA", {
    day: "numeric", month: lang === "fr" ? "long" : "short", timeZone: "UTC",
  }).replace(".", "");
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
  // 1st choice: the product-images R2 bucket, through the PriceBack API (Maxim, 2026-10-26: the savings harvest copies
  // every Same-Day packshot there as costco/<item #>). No Same-Day id needed. PRICEBACK_API overrides the host.
  try {
    const api = (process.env.PRICEBACK_API || "https://priceback-production.up.railway.app").replace(/\/+$/, "");
    const img = await get(`${api}/api/product-images/costco/${sku}`);
    if (img.length > 1000 && (img[0] === 0xff || img[0] === 0x89 || img.slice(8, 12).toString() === "WEBP")) {
      fs.writeFileSync(file, img);
      return file;
    }
  } catch (e) {
    if (!item.sameday) throw new Error(`sku ${sku}: no photo in R2 (${e.message}) and no sameday id. Save it to scenes/.cache/${sku}.jpg by hand.`);
  }
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

// A draft-only stand-in for the packshot, impossible to mistake for a finished post.
function placeholder(sku, item) {
  const name = esc(item.tag.en.slice(0, 2).join(" · "));
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="900" height="420" viewBox="0 0 900 420">
    <rect x="4" y="4" width="892" height="412" rx="24" fill="#f3f4f6" stroke="#9ca3af" stroke-width="6" stroke-dasharray="22 14"/>
    <text x="450" y="170" font-family="Arial" font-weight="900" font-size="46" fill="#6b7280" text-anchor="middle">DRAFT · PHOTO TO ADD</text>
    <text x="450" y="236" font-family="Arial" font-size="32" fill="#6b7280" text-anchor="middle">${name}</text>
    <text x="450" y="290" font-family="Arial" font-size="28" fill="#9ca3af" text-anchor="middle">Same-Day packshot for item ${sku}</text></svg>`;
  return "data:image/svg+xml;base64," + Buffer.from(svg).toString("base64");
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
      ${tag(lang, sku, item)}${DATA.provinceStrip ? strip(lang, item.provinces) : ""}`;
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
  <div class="post ${lang} ${single ? "s" : "g"}${single && DATA.provinceStrip ? " prov" : ""}${DATA.fineNote ? " note" : ""}">
    <div class="band"><div class="t">COSTCO <span>${single ? t.drop : t.drops}</span></div><div class="c">${right}</div></div>
    <div class="stripe"></div>
    ${body}
    ${promo}
    <div class="disc">${esc(t.fine(seen, regionName(lang, items[0][1].provinces)))}</div>
    <div class="claim"><div class="a">${claim}</div>${stores}${dots(p.dots)}</div>
  </div></body></html>`;
}

// The province strip (Monica, 2026-10-27): every province with a Costco warehouse, under the product,
// the ones where this saving was seen filled in, the rest greyed, so a missing province shows at a glance.
const STRIP = ["BC", "AB", "SK", "MB", "ON", "QC", "NB", "NS", "PE", "NL"];
function strip(lang, prov) {
  const on = national(prov) ? STRIP : prov;
  const label = lang === "fr" ? "RELEVÉ EN" : "SEEN IN";
  return `<div class="strip"><span class="lab">${label}</span>${STRIP.map((c) =>
    `<i class="${on.includes(c) ? "on" : "off"}">${c}</i>`).join("")}</div>`;
}

// Carousel dots in the red band, so the post reads as "there is more, swipe" in the feed.
function dots(d) {
  if (!d) return "";
  return `<div class="dots">${Array.from({ length: d.n }, (_, i) => `<i${i === d.i ? ' class="on"' : ""}></i>`).join("")}</div>`;
}

// The last slide of a feed carousel (Monica): follow, download, the plans, both store badges, big.
function endSlide(lang, f, badges) {
  const t = L[lang];
  return `<!doctype html><html lang="${lang}"><head><meta charset="utf-8"><style>${CSS}</style></head><body>
  <div class="post ${lang} s end">
    <div class="band"><div class="t">COSTCO <span>${t.drops}</span></div><div class="c">PRICEBACK</div></div>
    <div class="stripe"></div>
    <div class="kick">${esc(t.endKick)}</div>
    <div class="ehead">${esc(t.endHead).replace("\n", "<br>")}</div>
    <div class="esub">${esc(t.endSub)}</div>
    <div class="ecard"><div class="pb"><img src="${MARK}">PriceBack</div>
      <p>${esc(t.endHow)}</p><p class="pl">${esc(t.endPlans)}</p></div>
    <div class="ecta">${esc(t.endCta)}</div>
    <div class="ebadges"><img src="${badges.apple}"><img src="${badges.google}"></div>
    <div class="claim"><div class="a">${t.paidMany}<br><b>${t.claimMany}</b></div>${dots(f.dots)}</div>
  </div></body></html>`;
}

// The first slide of a feed carousel: the hook, a grid of the biggest savings, and the swipe cue.
function cover(lang, f, photos, badges) {
  const t = L[lang];
  const items = f.items.map((sku) => [sku, DATA.items[sku]]);
  // The six biggest savings, one per brand so the grid shows six different products.
  const brands = new Set();
  const top = [...items].sort((a, b) => b[1].off - a[1].off)
    .filter(([, i]) => !brands.has(i.tag.en[0]) && brands.add(i.tag.en[0])).slice(0, 6);
  const exp = items.map(([, i]) => i.exp).sort()[0];
  const seen = items.map(([, i]) => i.seen).sort();
  const grid = top
    .map(([sku, item]) => `<div class="cell"><div class="photo" style="background-image:url('${photos[sku]}')"></div>
      <div class="mini${money(lang, item.off, true).length > 4 ? " long" : ""}">-${money(lang, item.off, true)}</div></div>`)
    .join("");
  const stores = `<div class="stores"><img src="${badges.apple}"><img src="${badges.google}"></div>`;
  return `<!doctype html><html lang="${lang}"><head><meta charset="utf-8"><style>${CSS}</style></head><body>
  <div class="post ${lang} s cover${DATA.fineNote ? " note" : ""}">
    <div class="band"><div class="t">COSTCO <span>${t.drops}</span></div><div class="c">${t.until}<br>${t.exp} ${dateShort(lang, exp)}</div></div>
    <div class="stripe"></div>
    <div class="kick">${t.kick}</div>
    <div class="head">${esc(t.head(items.length)).replace("\n", "<br>")}</div>
    <div class="grid">${grid}</div>
    <div class="sub">${esc(t.sub(dateShortCase(lang, exp)))}<span class="sw">${t.swipe} &rarr;</span></div>
    <div class="promo"><div class="pb"><img src="${MARK}">PriceBack</div>
      <div class="pitch">${esc(t.pitch)}<br><span>${esc(t.free)}</span></div></div>
    <div class="disc">${esc(t.coverFine(seen[0], seen[seen.length - 1]))}</div>
    <div class="claim"><div class="a">${t.paidMany}<br><b>${t.claimMany}</b></div>${stores}${dots(f.dots)}</div>
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
.prov .photo.hero{height:330px}
.strip{position:absolute;left:60px;right:60px;top:528px;height:58px;display:flex;align-items:center;gap:8px}
.fr .strip .lab{font-size:15px}
.strip .lab{font-weight:900;font-size:17px;letter-spacing:1.5px;color:#111;width:86px;line-height:1.1;flex:none}
.strip i{flex:1;height:52px;border-radius:8px;display:flex;align-items:center;justify-content:center;font-style:normal;font-weight:900;font-size:24px;letter-spacing:1px}
.strip i.on{background:var(--blue);color:#fff;box-shadow:inset 0 -5px 0 var(--red)}
.strip i.off{background:#fff;color:#c3c7cd;border:2px dashed #d4d7dc;text-decoration:line-through}
.note .promo{top:1016px}.note .disc{font-size:14px;line-height:1.25;left:40px;right:40px;bottom:178px}
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
.promo{position:absolute;left:40px;right:40px;top:1024px;height:98px;display:flex;align-items:center;gap:22px;background:#0d3d28;border-radius:18px;padding:0 24px;box-shadow:0 10px 24px rgba(13,61,40,.28)}
.promo .pb{background:transparent;color:#fff;flex:none;padding:0;font-size:40px;gap:14px;letter-spacing:-.5px}
.promo .pb img{width:62px;height:62px;border-radius:14px;box-shadow:0 0 0 3px rgba(255,255,255,.18)}
.promo .pitch{font-size:22px;font-weight:700;color:#fff;line-height:1.35;white-space:nowrap;border-left:2px solid rgba(255,255,255,.25);padding-left:22px}
.promo .pitch span{color:#7fe0a8;font-weight:800}
.fr .promo .pitch{font-size:20px}
.stores{display:flex;flex-direction:column;gap:12px;align-items:flex-end;flex:none}
.stores img{height:62px;width:200px;object-fit:contain;object-position:right;display:block}
.g .promo{top:1034px}
.dots{position:absolute;left:0;right:0;bottom:14px;display:flex;justify-content:center;align-items:center;gap:10px}
.dots i{width:12px;height:12px;border-radius:6px;background:rgba(255,255,255,.45)}
.dots i.on{width:34px;background:#fff}
.ehead{position:absolute;left:60px;right:60px;top:262px;color:var(--blue);font-weight:900;font-size:110px;line-height:1;letter-spacing:-3px}
.fr .ehead{font-size:100px}
.fr .esub{font-size:31px}
.esub{position:absolute;left:60px;right:60px;top:500px;font-size:38px;font-weight:800;color:#111}
.ecard{position:absolute;left:60px;right:60px;top:590px;background:#0d3d28;border-radius:22px;padding:30px 36px;color:#fff}
.ecard .pb{background:transparent;color:#fff;padding:0;font-size:44px;margin-bottom:16px}
.ecard .pb img{width:66px;height:66px;border-radius:14px}
.ecard p{font-size:29px;line-height:1.35;font-weight:700}
.ecard p.pl{margin-top:14px;color:#7fe0a8;font-weight:800}
.fr .ecard p{font-size:26px}
.ecta{position:absolute;left:60px;right:60px;top:965px;text-align:center;font-weight:900;font-size:26px;letter-spacing:3px;color:#111}
.ebadges{position:absolute;left:60px;right:60px;top:1010px;display:flex;justify-content:center;gap:28px}
.ebadges img{height:96px;width:auto}
.end .claim{justify-content:flex-start}
.kick{position:absolute;left:60px;top:196px;background:var(--yel);color:#111;font-weight:900;font-size:40px;letter-spacing:2px;padding:4px 16px;transform:rotate(-1.5deg)}
.head{position:absolute;left:60px;right:60px;top:262px;color:var(--blue);font-weight:900;font-size:92px;line-height:1;letter-spacing:-2px;white-space:nowrap}
.fr .head{font-size:76px}
.grid{position:absolute;left:60px;right:60px;top:470px;height:460px;display:grid;grid-template-columns:repeat(3,1fr);grid-template-rows:repeat(2,1fr);gap:16px}
.cell{position:relative;border:2px solid #e5e7eb;border-radius:10px;background:#fff}
.cell .photo{left:14px;right:14px;top:14px;bottom:14px}
.mini{position:absolute;right:-8px;top:-10px;width:92px;height:92px;border-radius:50%;background:var(--red);color:#fff;border:4px solid #fff;box-shadow:0 8px 18px rgba(0,0,0,.22);display:flex;align-items:center;justify-content:center;font-weight:900;font-size:30px;transform:rotate(-10deg);white-space:nowrap}
.mini.long{font-size:24px}
.sub{position:absolute;left:60px;right:60px;top:950px;display:flex;align-items:center;justify-content:space-between;font-size:30px;font-weight:800;color:#111}
.sw{background:var(--blue);color:#fff;font-size:26px;letter-spacing:2px;padding:10px 20px;border-radius:30px;flex:none}
`;

// Crop the white margin off a packshot so every product fills its frame the same way.
async function trimmed(page, file) {
  const buf = fs.readFileSync(file);
  const mime = buf[0] === 0x89 ? "image/png" : buf.slice(8, 12).toString() === "WEBP" ? "image/webp" : "image/jpeg";
  const src = `data:${mime};base64,` + buf.toString("base64");
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
  // French names carry their preposition: "en Ontario et au Québec".
  fr: { AB: "en Alberta", BC: "en Colombie-Britannique", MB: "au Manitoba", NB: "au Nouveau-Brunswick", NL: "à Terre-Neuve-et-Labrador",
        NS: "en Nouvelle-Écosse", ON: "en Ontario", PE: "à l'Île-du-Prince-Édouard", QC: "au Québec", SK: "en Saskatchewan",
        NT: "aux T.N.-O.", NU: "au Nunavut", YT: "au Yukon" },
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
  // Past three provinces the full names push the fine print into the download row, so use codes.
  const short = prov.length > 3;
  const names = short ? prov : prov.map((c) => PROV[lang][c] || c);
  const and = lang === "fr" ? "et" : "and";
  const list = names.length > 1 ? `${names.slice(0, -1).join(", ")} ${and} ${names[names.length - 1]}` : names[0];
  if (lang === "fr") return short ? `dans ces provinces : ${list}` : list;
  return `in ${list}`;
}

// drops.json lists posts; a week file lists carousels, expanded here into one single-item slide each.
// A week file with `feeds` instead posts one carousel per language: a hook cover, then every item of the
// listed categories that goes out in that language, with carousel dots (Monica, 2026-10-15).
function feedPosts() {
  return Object.entries(DATA.feeds).flatMap(([lang, ids]) => {
    const slides = ids.flatMap((id) => {
      const c = DATA.carousels.find((x) => x.id === id);
      return c.items.filter((sku) => itemLangs(DATA.items[sku]).includes(lang)).map((sku) => ({ id, category: c.category, sku }));
    });
    const n = slides.length + 1 + (DATA.endSlide ? 1 : 0);
    const coverPost = { id: "cover", cover: true, lang, items: slides.map((s) => s.sku), dots: { i: 0, n }, file: () => path.join(WEEK, lang, "00-cover") };
    return [coverPost, ...slides.map((s, i) => ({
      id: s.id, layout: "single", lang, category: s.category, items: [s.sku], dots: { i: i + 1, n },
      file: () => path.join(WEEK, lang, `${String(i + 1).padStart(2, "0")}-${s.sku}`),
    })), ...(DATA.endSlide ? [{ id: "end", end: true, lang, items: [], dots: { i: n - 1, n },
      file: () => path.join(WEEK, lang, `${String(n - 1).padStart(2, "0")}-follow`) }] : [])];
  });
}
function allPosts() {
  if (DATA.feeds) return feedPosts();
  if (!DATA.carousels) return DATA.posts.map((p) => ({ ...p, file: p.id }));
  return DATA.carousels.flatMap((c) =>
    c.items.map((sku, i) => ({
      id: c.id,
      layout: "single",
      category: c.category,
      items: [sku],
      file: (lang) => path.join(WEEK, lang, c.id, `${String(i + 1).padStart(2, "0")}-${sku}`),
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
    for (const sku of p.items) {
      if (photos[sku]) continue;
      if (DRAFT && !fs.existsSync(path.join(CACHE, `${sku}.jpg`))) { photos[sku] = placeholder(sku, DATA.items[sku]); continue; }
      photos[sku] = await trimmed(page, await productPhoto(sku, DATA.items[sku]));
    }
  for (const p of posts)
    for (const lang of p.lang ? [p.lang] : langsFor(p)) {
      const html = p.end ? endSlide(lang, p, badges[lang]) : p.cover ? cover(lang, p, photos, badges[lang]) : post(lang, p, photos, badges[lang]);
      await page.setContent(html, { waitUntil: "load" });
      // Week carousels: one folder per language, so EN and FR never mix (Monica, 2026-10-15).
      const file = typeof p.file === "function" ? path.join(OUT, `${p.file(lang)}.png`) : path.join(OUT, `${p.file}-${lang}.png`);
      fs.mkdirSync(path.dirname(file), { recursive: true });
      await page.screenshot({ path: file });
      console.log(path.relative(process.cwd(), file));
    }
  await browser.close();
})().catch((e) => {
  console.error(e.message);
  process.exit(1);
});
