// 10-receipt-scan: "what your receipt scan actually needs", EN + FR. HTML in headless Chromium (Playwright).
//
//   node sm-content/10-receipt-scan/scenes/render.js            every slide, EN + FR
//
// The point of the pack (Monica, 2026-10-27): a scan needs only the warehouse header, the item lines and the
// totals. The payment section is not needed. The receipt must be straight: not tilted, not upside down.
// This replaces the "fit the full receipt in the frame" advice in 07-costco-toolkit/scan-receipt.
//
// Design rules kept: a new design (each design serves at most two pieces), bright only, brand palette for the
// graphics (paper, emerald, the PriceBack ink green; no red, orange or black fields), EN and FR in different
// colourways, logo on the left and both store badges on the right of every slide, a final follow + download slide.
// The receipt is drawn, marked EXAMPLE, warehouse #000: it must never read as a real record.

const fs = require("fs");
const path = require("path");
const { chromium } = require("playwright");

const ROOT = path.join(__dirname, "..");
const OUT = path.join(ROOT, "posts");
const BADGES = path.join(ROOT, "..", "06-launch", "badges");
const MARK = "data:image/png;base64," +
  fs.readFileSync(path.join(ROOT, "..", "08-costco-price-drops", "scenes", "mark.png")).toString("base64");
const b64 = (f, t) => `data:${t};base64,` + fs.readFileSync(path.join(BADGES, f)).toString("base64");

// Two colourways, one per language (Monica: the same content in another language gets other colours).
const THEME = {
  en: { field: "#f6f0e5", field2: "#efe7d9", ink: "#0d3d28", accent: "#10b981", soft: "#d6efe3", chip: "#0d3d28" },
  fr: { field: "#e4f6ee", field2: "#d3efe2", ink: "#073b2c", accent: "#047857", soft: "#ffffff", chip: "#047857" },
};

const T = {
  en: {
    kick: "SCAN SMARTER",
    head: "Your receipt scan\nneeds only 3 parts",
    coverSub: "Header · items · totals. Swipe →",
    n: ["The warehouse header", "Every item line", "The totals"],
    b: [
      "The top of your receipt: Costco and the warehouse number. That is how PriceBack knows which warehouse, and which province, to watch.",
      "Item number, name and price, top to bottom. These are the prices PriceBack keeps watching for a drop.",
      "Subtotal, tax and total. That is where your photo can stop.",
    ],
    skipT: "Skip the payment part",
    skipB: "Card type, approval codes, everything under the total: PriceBack doesn't need it. Leave it out of the frame.",
    notNeeded: "NOT NEEDED",
    straightT: "Keep it straight",
    straightB: "Lay the receipt flat, top at the top, and hold the phone straight above it.",
    good: "Straight and flat",
    bad: ["Tilted", "Upside down", "Folded", "Header cut off", "Glare"],
    endKick: "NEXT STEP",
    endHead: "Follow\n@priceback.ca",
    endSub: "Costco tips and price drops, every week.",
    endHow: "Scan your Costco receipt. PriceBack alerts you when a price drops, then you claim the difference.",
    endPlans: "Free to download. Try it free, then buy credits that never expire, or go Unlimited for the full experience.",
    endCta: "DOWNLOAD PRICEBACK",
    fine: "Example receipt for illustration only. Adjustment terms are set by the retailer. PriceBack is an independent app, not affiliated with Costco.",
    r: { sub: "SUBTOTAL", tax: "TAX", total: "TOTAL", pay: ["VISA ******** 0000", "APPROVED · AUTH 000000", "CHANGE 0.00", "MEMBER COPY", "THANK YOU"] },
  },
  fr: {
    kick: "SCANNEZ MIEUX",
    head: "Votre reçu n'a besoin\nque de 3 parties",
    coverSub: "En-tête · articles · totaux. Glissez →",
    n: ["L'en-tête de l'entrepôt", "Chaque ligne d'article", "Les totaux"],
    b: [
      "Le haut du reçu : Costco et le numéro d'entrepôt. C'est ainsi que PriceBack sait quel entrepôt, et quelle province, surveiller.",
      "Numéro, nom et prix de chaque article, de haut en bas. Ce sont les prix que PriceBack surveille.",
      "Sous-total, taxes et total. Votre photo peut s'arrêter là.",
    ],
    skipT: "Oubliez la partie paiement",
    skipB: "Type de carte, codes d'autorisation, tout ce qui suit le total : PriceBack n'en a pas besoin. Laissez-le hors du cadre.",
    notNeeded: "PAS NÉCESSAIRE",
    straightT: "Gardez-le bien droit",
    straightB: "Posez le reçu à plat, le haut en haut, et tenez le téléphone bien au-dessus.",
    good: "Droit et à plat",
    bad: ["Incliné", "À l'envers", "Plié", "En-tête coupé", "Reflet"],
    endKick: "PROCHAINE ÉTAPE",
    endHead: "Suivez\n@priceback.ca",
    endSub: "Astuces Costco et baisses de prix, chaque semaine.",
    endHow: "Scannez votre reçu Costco. PriceBack vous avertit quand un prix baisse, puis vous réclamez la différence.",
    endPlans: "Téléchargement gratuit. Essayez-le gratuitement, puis achetez des crédits qui n'expirent jamais, ou passez à Illimité pour l'expérience complète.",
    endCta: "TÉLÉCHARGEZ PRICEBACK",
    fine: "Reçu d'exemple, à titre d'illustration. Les conditions d'ajustement sont fixées par le détaillant. PriceBack est une application indépendante, non affiliée à Costco.",
    r: { sub: "SOUS-TOTAL", tax: "TAXES", total: "TOTAL", pay: ["VISA ******** 0000", "APPROUVÉ · AUTH 000000", "MONNAIE 0,00", "COPIE DU MEMBRE", "MERCI"] },
  },
};

// The example receipt. Items are real products from this week's drops, prices drawn as an example.
const ITEMS = [
  ["1254041", "BURRATA", "17.99"],
  ["266556", "VH HOUSE BLEND", "52.99"],
  ["2061560", "SKOULAKIS STRIPS", "49.99"],
  ["1405731", "GIA BASMATI", "39.99"],
  ["2023352", "CHEFMAN KETTLE", "39.99"],
];
const fr2 = (lang, s) => (lang === "fr" ? s.replace(".", ",") : s);

function receipt(lang, { zones = false, focus = null, payment = "show", w = 440, cls = "" } = {}) {
  const r = T[lang].r;
  const z = (k, html) => `<div class="z ${k}${zones ? " on" : ""}${focus && focus !== k ? " dim" : ""}${focus === k ? " focus" : ""}">${
    zones ? `<b class="zn">${{ head: 1, items: 2, totals: 3 }[k]}</b>` : ""}${html}</div>`;
  const pay = r.pay.map((l) => `<div class="l">${l}</div>`).join("");
  return `<div class="rc ${cls}" style="width:${w}px">
    <div class="ex">EXAMPLE</div>
    ${z("head", `<div class="c big">COSTCO</div><div class="c">WHOLESALE</div><div class="c">WAREHOUSE #000</div><div class="c sm">${lang === "fr" ? "27/10/2026 · CAISSE 4" : "10/27/2026 · REG 4"}</div>`)}
    ${z("items", ITEMS.map(([n, d, p]) => `<div class="l"><span>${n} ${d}</span><span>${fr2(lang, p)}</span></div>`).join(""))}
    ${z("totals", `<div class="l"><span>${r.sub}</span><span>${fr2(lang, "200.95")}</span></div><div class="l"><span>${r.tax}</span><span>${fr2(lang, "8.12")}</span></div><div class="l t"><span>${r.total}</span><span>${fr2(lang, "209.07")}</span></div>`)}
    ${payment === "hide" ? "" : `<div class="z pay${payment === "cross" ? " x" : ""}">${pay}${payment === "cross" ? `<i class="nn">${T[lang].notNeeded}</i>` : ""}</div>`}
  </div>`;
}

function frame(lang, i, n, body, { end = false } = {}) {
  const t = T[lang];
  const dots = Array.from({ length: n }, (_, k) => `<i${k === i ? ' class="on"' : ""}></i>`).join("");
  return `<!doctype html><html lang="${lang}"><head><meta charset="utf-8"><style>${css(lang)}</style></head><body>
  <div class="post">${body}
    ${end ? "" : `<div class="fine">${t.fine}</div>`}
    <div class="foot"><div class="pb"><img src="${MARK}">PriceBack</div><div class="dots">${dots}</div>
      ${end ? "" : `<div class="bd"><img src="${BADGE[lang].apple}"><img src="${BADGE[lang].google}"></div>`}</div>
  </div></body></html>`;
}

const step = (lang, k) => {
  const t = T[lang];
  const key = ["head", "items", "totals"][k];
  return `<div class="num">${k + 1}</div><div class="h2">${t.n[k]}</div><div class="p">${t.b[k]}</div>
    <div class="stage">${receipt(lang, { zones: true, focus: key, payment: "cross", w: 520 })}</div>`;
};

function slides(lang) {
  const t = T[lang];
  const list = [
    `<div class="kick">${t.kick}</div><div class="h1">${t.head.replace("\n", "<br>")}</div>
     <div class="stage cover">${receipt(lang, { zones: true, payment: "cross", w: 520 })}</div>
     <div class="csub">${t.coverSub}</div>`,
    step(lang, 0),
    step(lang, 1),
    step(lang, 2),
    `<div class="num x">✕</div><div class="h2">${t.skipT}</div><div class="p">${t.skipB}</div>
     <div class="stage">${receipt(lang, { payment: "cross", w: 520 })}</div>`,
    `<div class="num ok">✓</div><div class="h2">${t.straightT}</div><div class="p">${t.straightB}</div>
     <div class="grid">
       <div class="cell good"><div class="mini">${receipt(lang, { payment: "hide", w: 230 })}</div><div class="cap">✓ ${t.good}</div></div>
       ${["tilt", "flip", "fold", "cut", "glare"].map((c, k) =>
         `<div class="cell bad"><div class="mini">${receipt(lang, { payment: "hide", w: 230, cls: c })}</div><div class="cap">✕ ${t.bad[k]}</div></div>`).join("")}
     </div>`,
  ];
  const end = `<div class="kick">${t.endKick}</div><div class="eh">${t.endHead.replace("\n", "<br>")}</div>
    <div class="es">${t.endSub}</div>
    <div class="ec"><div class="pb big"><img src="${MARK}">PriceBack</div><p>${t.endHow}</p><p class="pl">${t.endPlans}</p></div>
    <div class="cta">${t.endCta}</div>
    <div class="eb"><img src="${BADGE[lang].apple}"><img src="${BADGE[lang].google}"></div>`;
  const n = list.length + 1;
  return [...list.map((b, i) => frame(lang, i, n, b)), frame(lang, n - 1, n, end, { end: true })];
}

function css(lang) {
  const c = THEME[lang];
  return `*{box-sizing:border-box;margin:0;padding:0}
body{width:1080px;height:1350px;font-family:"Helvetica Neue",Arial,sans-serif;background:${c.field}}
.post{width:1080px;height:1350px;position:relative;overflow:hidden;background:linear-gradient(180deg,${c.field},${c.field2});color:${c.ink}}
.kick{position:absolute;left:70px;top:70px;background:${c.ink};color:#fff;font-weight:900;font-size:30px;letter-spacing:4px;padding:8px 18px;border-radius:8px}
.h1{position:absolute;left:70px;right:70px;top:140px;font-weight:900;font-size:${lang === "fr" ? 72 : 82}px;line-height:1.02;letter-spacing:-2px}
.stage{position:absolute;left:0;right:0;top:420px;display:flex;justify-content:center}
.stage.cover{top:360px}
.csub{position:absolute;left:70px;right:70px;top:1110px;font-size:36px;font-weight:800;text-align:center}
.num{position:absolute;left:70px;top:70px;width:110px;height:110px;border-radius:55px;background:${c.accent};color:#fff;font-weight:900;font-size:64px;display:flex;align-items:center;justify-content:center}
.num.x{background:#8a958f}.num.ok{background:${c.accent}}
.h2{position:absolute;left:210px;right:60px;top:78px;font-weight:900;font-size:${lang === "fr" ? 54 : 60}px;line-height:1.05;letter-spacing:-1px}
.p{position:absolute;left:70px;right:70px;top:215px;font-size:33px;line-height:1.35;font-weight:600}
.rc{position:relative;background:linear-gradient(180deg,#fffdf8,#f3ecdf);font-family:"Courier New",monospace;color:#2b2a27;padding:26px 26px 30px;box-shadow:0 24px 50px rgba(13,61,40,.22);border-radius:4px}
.rc .ex{position:absolute;right:-6px;top:22px;transform:rotate(12deg);border:4px solid ${c.accent};color:${c.accent};font-family:Arial;font-weight:900;font-size:20px;letter-spacing:3px;padding:2px 10px;background:rgba(255,255,255,.85);z-index:3}
.z{position:relative;padding:8px 10px;margin:4px 0;border-radius:8px;transition:none}
.z.on{outline:5px solid ${c.accent};background:rgba(16,185,129,.09)}
.z.dim{opacity:.28}
.z.focus{outline-width:8px;background:rgba(16,185,129,.16)}
.zn{position:absolute;left:-46px;top:50%;transform:translateY(-50%);width:44px;height:44px;border-radius:22px;background:${c.accent};color:#fff;font-family:Arial;font-weight:900;font-size:26px;display:flex;align-items:center;justify-content:center;font-style:normal}
.c{text-align:center;font-size:22px;font-weight:700;line-height:1.25}.c.big{font-size:34px;font-weight:900;letter-spacing:4px}.c.sm{font-size:17px;font-weight:400}
.l{display:flex;justify-content:space-between;font-size:20px;line-height:1.45;white-space:nowrap;gap:16px}
.l.t{font-weight:900;font-size:24px;border-top:2px dashed #8b8478;margin-top:4px;padding-top:4px}
.pay{color:#6b665d}
.pay.x{background:repeating-linear-gradient(-45deg,rgba(120,120,120,.10) 0 12px,rgba(120,120,120,.20) 12px 24px);border:4px dashed #8a958f}
.pay.x .l{text-decoration:line-through;opacity:.6;justify-content:center}
.pay .nn{position:absolute;left:50%;top:50%;transform:translate(-50%,-50%) rotate(-6deg);background:#59645e;color:#fff;font-family:Arial;font-style:normal;font-weight:900;font-size:28px;letter-spacing:3px;padding:6px 16px;border-radius:8px;white-space:nowrap}
.grid{position:absolute;left:60px;right:60px;top:345px;display:grid;grid-template-columns:repeat(3,1fr);grid-template-rows:repeat(2,370px);gap:18px}
.cell{position:relative;border-radius:18px;background:${c.soft};overflow:hidden;border:4px solid transparent}
.cell.good{border-color:${c.accent}}
.cell.bad{border-color:#b9c2bd}
.mini{position:absolute;left:0;right:0;top:-18px;height:310px;display:flex;justify-content:center;transform:scale(.62);transform-origin:top center}
.mini .rc{box-shadow:0 10px 20px rgba(13,61,40,.18)}
.mini .ex{display:none}
.rc.tilt{transform:rotate(-17deg)}
.rc.flip{transform:rotate(180deg)}
.rc.fold{transform:perspective(500px) rotateX(28deg) skewY(-3deg);filter:brightness(.93)}
.rc.fold::after{content:"";position:absolute;left:0;right:0;top:46%;height:6px;background:rgba(60,50,40,.35);box-shadow:0 0 18px rgba(60,50,40,.5)}
.rc.cut{margin-top:-120px}
.rc.glare::after{content:"";position:absolute;inset:0;background:radial-gradient(ellipse 70% 40% at 55% 50%,#fff 0,#fff 45%,rgba(255,255,255,.7) 62%,rgba(255,255,255,0) 80%)}
.cap{position:absolute;left:0;right:0;bottom:0;height:62px;background:#fff;display:flex;align-items:center;justify-content:center;font-weight:900;font-size:26px}
.good .cap{background:${c.accent};color:#fff}
.bad .cap{color:#59645e}
.fine{position:absolute;left:70px;right:70px;bottom:150px;font-size:16px;line-height:1.35;text-align:center;color:#5b6b63}
.foot{position:absolute;left:0;right:0;bottom:0;height:130px;background:${c.chip};display:flex;align-items:center;justify-content:space-between;padding:0 50px}
.pb{display:flex;align-items:center;gap:14px;font-weight:900;font-size:38px;color:#fff;letter-spacing:-.5px}
.pb img{width:62px;height:62px;border-radius:14px}
.dots{position:absolute;left:0;right:0;bottom:16px;display:flex;justify-content:center;gap:10px}
.dots i{width:12px;height:12px;border-radius:6px;background:rgba(255,255,255,.4)}.dots i.on{width:34px;background:#fff}
.bd{display:flex;gap:14px}.bd img{height:58px;width:auto}
.eh{position:absolute;left:70px;right:70px;top:150px;font-weight:900;font-size:${lang === "fr" ? 104 : 112}px;line-height:1;letter-spacing:-3px}
.es{position:absolute;left:70px;right:70px;top:400px;font-size:36px;font-weight:800}
.ec{position:absolute;left:70px;right:70px;top:490px;background:${c.chip};border-radius:24px;padding:34px 40px;color:#fff}
.ec .pb{margin-bottom:18px;font-size:46px}.ec .pb img{width:70px;height:70px}
.ec p{font-size:${lang === "fr" ? 28 : 31}px;line-height:1.35;font-weight:700}.ec p.pl{margin-top:16px;color:#9ff0c6}
.cta{position:absolute;left:0;right:0;top:960px;text-align:center;font-weight:900;font-size:28px;letter-spacing:4px}
.eb{position:absolute;left:0;right:0;top:1010px;display:flex;justify-content:center;gap:30px}.eb img{height:100px;width:auto}`;
}

let BADGE;
(async () => {
  BADGE = {
    en: { apple: b64("app-store-en.svg", "image/svg+xml"), google: "data:image/png;base64," + fs.readFileSync(path.join(__dirname, "google-play-en-trimmed.png")).toString("base64") },
    fr: {
      apple: b64(fs.existsSync(path.join(BADGES, "app-store-fr.svg")) ? "app-store-fr.svg" : "app-store-en.svg", "image/svg+xml"),
      google: "data:image/png;base64," + fs.readFileSync(path.join(__dirname, "google-play-fr-trimmed.png")).toString("base64"),
    },
  };
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1080, height: 1350 } });
  for (const lang of ["en", "fr"]) {
    const s = slides(lang);
    fs.mkdirSync(path.join(OUT, lang), { recursive: true });
    for (let i = 0; i < s.length; i++) {
      await page.setContent(s[i], { waitUntil: "load" });
      const f = path.join(OUT, lang, `receipt-scan-${lang}-${String(i + 1).padStart(2, "0")}.png`);
      await page.screenshot({ path: f });
      console.log(path.relative(process.cwd(), f));
    }
  }
  await browser.close();
})().catch((e) => { console.error(e); process.exit(1); });
