// PriceBack print posters v2: 11x17, 8.5x11 public posters and a 4x6 counter stand card, EN + FR.
// node sm-content/12-print-posters/render.js [outdir]   (gp-*-trim.png = Google badges with their transparent margin cropped, so both store badges share one height)
const fs = require("fs");
const path = require("path");
const QR = require("qrcode");
const { chromium } = require("playwright");

const OUT = process.argv[2] || path.join(__dirname, "out");
const BADGES = path.join(__dirname, "../06-launch/badges");
const HERE = __dirname;
const b64 = (f, mime) => `data:${mime};base64,${fs.readFileSync(f).toString("base64")}`;
const APPLE = b64(path.join(BADGES, "app-store-en.svg"), "image/svg+xml");
const GP = { en: b64(path.join(HERE, "gp-en-trim.png"), "image/png"), fr: b64(path.join(HERE, "gp-fr-trim.png"), "image/png") };
const BLEED = 0.125;

const MARK = (c = "#fff") => `<svg viewBox="0 0 48 48" fill="none" stroke="${c}" stroke-width="3.6" stroke-linecap="round" stroke-linejoin="round">
<path d="M13 9 H35 V34 L32 37 L29 34 L26 37 L23 34 L20 37 L17 34 L14 37 L13 36 Z"/><path d="M17 16 L21.5 20.5 L25.5 17 L31 27"/><path d="M31 27 L27.4 26 M31 27 L31.7 23.2"/></svg>`;

const T = {
  en: {
    free: "FREE DOWNLOAD", tryIt: "TRY IT FREE",
    pScan2: "Free trial. Then a small share of the drops we find you.",
    pModel: "Free trial. After the trial, PriceBack keeps a small part of the price drops it finds you, to cover its technology costs.",
    model: "Free to download, with a trial. When PriceBack finds you a price drop, a small part of it covers our fees.",
    h1: "Paid full price?", h2: "Get money back.",
    rcHead: "RECEIPT CHECK", rcItem: "65\" OLED TV", rcPaid: "PAID", rcPaidV: "$1,994.99", rcNow: "NOW", rcNowV: "$1,494.99", rcDrop: "PRICE DROP", rcDropV: "-$500.00",
    stamp1: "$600", stamp2: "BACK",
    d1: "-$600", d1l: "2 DAYS ONLY", d2: "-$500", d2l: "AFTER THAT",
    sub: "Prices drop after you buy, sometimes for only 2 days.<br><b>Nobody sees it. PriceBack does.</b>",
    now: "Works at", soon: "Soon:",
    stores: ["Best Buy", "Home Depot", "Rona", "Sport Chek"],
    src: "Real Costco drops, Oct 2026",
    urgent: "Sales end fast. Don’t miss yours.",
    cScan: "SCAN ME ↓", grocery: "Groceries too. Small drops add up every week.",
    scan: "SCAN NOW", scan2: "Free download · iPhone & Android",
    fine: "Real example: Samsung 65\" S85H OLED TV at Costco (regular $1,994.99): $600 off for 2 days, then $500 off, Oct 2026. Refunds follow each store’s price adjustment policy (Costco: within 30 days, while the lower price is in effect). PriceBack is not affiliated with any store.",
    ck: "Waiting for your order?",
    cfine: "Works at Costco; Best Buy, Home Depot, Rona and Sport Chek coming soon. Refunds follow each store’s policy. PriceBack is not affiliated with any store.",
  },
  fr: {
    free: "TÉLÉCHARGEMENT GRATUIT", tryIt: "ESSAI GRATUIT",
    pScan2: "Essai gratuit. Ensuite, une petite part des baisses qu’on vous trouve.",
    pModel: "Essai gratuit. Après l’essai, PriceBack garde une petite part des baisses de prix qu’il vous trouve, pour couvrir ses frais technologiques.",
    model: "Téléchargement gratuit, avec essai. Quand PriceBack vous trouve une baisse de prix, une petite part couvre nos frais.",
    h1: "Payé le plein prix ?", h2: "Récupérez la différence.",
    rcHead: "VÉRIF. DE REÇU", rcItem: "TÉLÉ OLED 65 PO", rcPaid: "PAYÉ", rcPaidV: "1 994,99 $", rcNow: "MAINTENANT", rcNowV: "1 494,99 $", rcDrop: "BAISSE", rcDropV: "-500,00 $",
    stamp1: "600 $", stamp2: "REMIS",
    d1: "-600 $", d1l: "2 JOURS SEULEMENT", d2: "-500 $", d2l: "ENSUITE",
    sub: "Les prix baissent après l’achat, parfois 2 jours seulement.<br><b>Personne ne le voit. PriceBack, oui.</b>",
    now: "Fonctionne chez", soon: "Bientôt :",
    stores: ["Best Buy", "Home Depot", "Rona", "Sport Chek"],
    src: "Vraies baisses chez Costco, oct. 2026",
    urgent: "Les rabais finissent vite. Ne ratez pas le vôtre.",
    cScan: "SCANNEZ-MOI ↓", grocery: "L’épicerie aussi. Les petites baisses s’additionnent chaque semaine.",
    scan: "SCANNEZ", scan2: "Téléchargement gratuit · iPhone et Android",
    fine: "Exemple réel : téléviseur OLED Samsung 65 po S85H chez Costco (prix régulier 1 994,99 $) : 600 $ de rabais pendant 2 jours, puis 500 $, oct. 2026. Les remboursements suivent la politique d’ajustement de prix de chaque magasin (Costco : dans les 30 jours, pendant que le prix réduit est en vigueur). PriceBack n’est affilié à aucun magasin.",
    ck: "Vous attendez votre commande ?",
    cfine: "Fonctionne chez Costco; Best Buy, Home Depot, Rona et Sport Chek bientôt. Les remboursements suivent la politique de chaque magasin. PriceBack n’est affilié à aucun magasin.",
  },
};

const CSS = `
@page{margin:0}
*{margin:0;padding:0;box-sizing:border-box}
:root{--bg1:#04140d;--bg2:#0b3a26;--mint:#2ee59d;--green:#10b981;--yellow:#ffd43b;--paper:#f7f2e8;--ink:#14110d;--red:#e5383b}
html,body{-webkit-print-color-adjust:exact;print-color-adjust:exact;background:var(--bg1)}
body{font-family:"Inter Display",Inter,Arial,sans-serif;color:#fff}
.page{position:relative;overflow:hidden;
  background:radial-gradient(90% 55% at 85% 30%,rgba(46,229,157,.22),transparent 70%),radial-gradient(70% 40% at 0% 100%,rgba(16,185,129,.18),transparent 70%),linear-gradient(170deg,#0d4a30 0%,#072a1b 45%,#03130c 100%)}
.inner{position:absolute;display:flex;flex-direction:column}
.brand{display:flex;align-items:center;gap:.45em;font-weight:900;letter-spacing:-.02em;color:#fff}
.tile{width:1.5em;height:1.5em;border-radius:.36em;background:linear-gradient(160deg,#10b981,#0a8f62);display:flex;align-items:center;justify-content:center;box-shadow:0 .1em .3em rgba(0,0,0,.35)}
.tile svg{width:78%;height:78%}
.pill{display:inline-flex;align-items:center;font-weight:800;letter-spacing:.08em;border-radius:99em;white-space:nowrap}
.h1{font-weight:900;line-height:.98;letter-spacing:-.035em;white-space:nowrap;color:#fff}
.h2{font-weight:900;line-height:.98;letter-spacing:-.035em;white-space:nowrap;color:var(--yellow)}
.receipt{position:relative;background:linear-gradient(180deg,#fffdf8,var(--paper) 60%,#ece4d4);color:var(--ink);font-family:"JetBrains Mono",monospace;
  box-shadow:0 1.2rem 3rem rgba(0,0,0,.55);transform:rotate(-4deg);
  --zz:1.6rem;
  clip-path:polygon(0 0,100% 0,100% calc(100% - var(--zz)),95% 100%,90% calc(100% - var(--zz)),85% 100%,80% calc(100% - var(--zz)),75% 100%,70% calc(100% - var(--zz)),65% 100%,60% calc(100% - var(--zz)),55% 100%,50% calc(100% - var(--zz)),45% 100%,40% calc(100% - var(--zz)),35% 100%,30% calc(100% - var(--zz)),25% 100%,20% calc(100% - var(--zz)),15% 100%,10% calc(100% - var(--zz)),5% 100%,0 calc(100% - var(--zz)))}
.receipt .hd{text-align:center;font-weight:800;letter-spacing:.14em;border-bottom:.3rem dashed #8a8273}
.receipt .ln{display:flex;justify-content:space-between;gap:1em;white-space:nowrap}
.receipt .strike{text-decoration:line-through;text-decoration-color:var(--red);text-decoration-thickness:.12em}
.receipt .drop{border-top:.3rem dashed #8a8273;font-weight:800}
.receipt .drop b{background:var(--yellow);padding:0 .2em}
.stamp{position:absolute;border-radius:50%;background:var(--mint);color:#03130c;display:flex;flex-direction:column;align-items:center;justify-content:center;font-weight:900;
  box-shadow:0 .8rem 2rem rgba(0,0,0,.45),inset 0 0 0 .5rem rgba(3,19,12,.15);transform:rotate(12deg);font-family:"Inter Display",Inter,sans-serif;letter-spacing:-.03em}
.stamp .a{line-height:.9}.stamp .b{letter-spacing:.06em}
.sub{color:rgba(235,250,243,.92);line-height:1.3;font-weight:500}
.sub b{color:#fff;font-weight:800}
.stores{display:flex;flex-wrap:wrap;align-items:center;justify-content:center}
.chip{display:inline-flex;align-items:center;font-weight:800;border-radius:99em;white-space:nowrap}
.chip.now{background:var(--mint);color:#03130c}
.chip.soon{border:.25rem solid rgba(255,255,255,.55);color:#fff}
.lbl{font-weight:700;color:rgba(235,250,243,.75);text-transform:uppercase;letter-spacing:.1em}
.card{background:#fff;color:var(--ink);display:flex;align-items:center;box-shadow:0 1.4rem 3.4rem rgba(0,0,0,.5)}
.qr svg{display:block;width:100%;height:100%}
.badges{display:flex;align-items:center}
.badges img{display:block}
.fine{color:rgba(225,240,233,.62);line-height:1.3;text-align:center}
`;

function poster(lang, wIn, hIn, qr) {
  const t = T[lang];
  const tall = hIn / wIn > 1.4;
  const W = wIn + 2 * BLEED, H = hIn + 2 * BLEED;
  return `<!doctype html><html lang="${lang}"><head><meta charset="utf-8"><style>${CSS}
html{font-size:${wIn / 100}in}
.page{width:${W}in;height:${H}in}
.inner{inset:calc(${BLEED}in + ${tall ? 6 : 4.6}rem) calc(${BLEED}in + 6rem) calc(${BLEED}in + ${tall ? 4.4 : 3.4}rem);justify-content:space-between}
.top{display:flex;justify-content:space-between;align-items:center}
.top .brand{font-size:5.2rem}
.top .pill{font-size:2.6rem;padding:1.1rem 2.4rem;background:var(--yellow);color:#03130c}
.h1{font-size:${tall ? 12.4 : 11}rem}.h2{font-size:${tall ? 12.4 : 11}rem;margin-top:.8rem}
.hero{display:flex;align-items:center;gap:4rem;justify-content:center}
.big{position:relative;flex:none;text-align:center;line-height:.8;color:var(--mint);font-weight:900;letter-spacing:-.05em}
.big .n{font-size:${tall ? 25 : 18}rem;text-shadow:0 1rem 3rem rgba(0,0,0,.35)}
.big .b{display:inline-block;margin-top:1.2rem;font-size:${tall ? 5.6 : 4.8}rem;letter-spacing:.14em;color:#03130c;background:var(--mint);padding:.6rem 2.4rem;border-radius:99em}
.slip{background:linear-gradient(180deg,#fffdf8,var(--paper));color:var(--ink);font-family:"JetBrains Mono",monospace;transform:rotate(3deg);box-shadow:0 1rem 2.6rem rgba(0,0,0,.5);
  padding:${tall ? 3 : 2}rem ${tall ? 3.2 : 2.6}rem ${tall ? 4.4 : 3.2}rem;font-size:${tall ? 2.9 : 2.6}rem;line-height:1.55;white-space:nowrap;
  clip-path:polygon(0 0,100% 0,100% calc(100% - 1.4rem),92% 100%,84% calc(100% - 1.4rem),76% 100%,68% calc(100% - 1.4rem),60% 100%,52% calc(100% - 1.4rem),44% 100%,36% calc(100% - 1.4rem),28% 100%,20% calc(100% - 1.4rem),12% 100%,4% calc(100% - 1.4rem),0 100%)}
.slip .it{font-weight:800}
.slip .st{text-decoration:line-through;text-decoration-color:var(--red);text-decoration-thickness:.14em;color:#6b6457}
.slip .ln2{display:flex;align-items:center;gap:.7em;margin-top:.35em}
.slip .ln2 b{background:var(--yellow);padding:0 .25em;font-size:1.15em}
.slip .ln2 span{font-size:.78em;font-weight:700;letter-spacing:.04em}
.slip .ln2.dim b{background:#e8e0cf}
.slip .ln2.dim span{color:#6b6457}
.slip .src{margin-top:1rem;font-size:.7em;color:#6b6457;font-family:Inter,sans-serif;font-weight:600;white-space:normal;max-width:12em;line-height:1.25}
.sub{text-align:center;white-space:nowrap;font-size:${tall ? 3.9 : 3.5}rem}
.groc{margin-top:${tall ? 1.6 : 1.1}rem;font-weight:800;color:var(--mint)}
.stores{gap:1.2rem;flex-wrap:nowrap}
.lbl{font-size:2.2rem;white-space:nowrap}
.chip{font-size:${tall ? 2.6 : 2.35}rem;padding:.8rem 1.9rem}
.urgent{text-align:center;font-weight:800;color:var(--yellow);font-size:${tall ? 3.6 : 3.2}rem;margin-bottom:-${tall ? 1.4 : 0.8}rem}
.card{border-radius:3.2rem;padding:${tall ? 3 : 2}rem;gap:${tall ? 4 : 3.4}rem}
.qr{width:${tall ? 31 : 22}rem;height:${tall ? 31 : 22}rem;flex:none}
.cta{flex:1;min-width:0}
.cta .s1{font-weight:900;font-size:${tall ? 9.4 : 7}rem;letter-spacing:-.03em;line-height:1;color:#03130c;white-space:nowrap}
.cta .s2{font-weight:700;font-size:${tall ? 3.3 : 2.9}rem;color:#334;margin-top:1.2rem;line-height:1.25}
.badges{gap:1.6rem;margin-top:${tall ? 3 : 1.6}rem}
.badges img{height:${tall ? 6.6 : 5.6}rem;width:auto}
.cta .url{font-weight:800;font-size:${tall ? 2.8 : 2.5}rem;color:var(--green);margin-top:${tall ? 2.4 : 1.2}rem}
.fine{font-size:${Math.max(1.3, 6 / 72 / (wIn / 100))}rem;margin-top:-${tall ? 1 : 0.6}rem}
</style></head><body><div class="page"><div class="inner">
<div class="top"><div class="brand"><span class="tile">${MARK()}</span>PriceBack</div><div class="pill">${t.tryIt}</div></div>
<div class="head"><div class="h1">${t.h1}</div><div class="h2">${t.h2}</div></div>
<div class="hero">
  <div class="big"><div class="n">${t.stamp1}</div><div class="b">${t.stamp2}</div></div>
  <div class="slip"><div class="it">${t.rcItem}</div><div class="ln2"><b>${t.d1}</b><span>${t.d1l}</span></div><div class="ln2 dim"><b>${t.d2}</b><span>${t.d2l}</span></div><div class="src">${t.src}</div></div>
</div>
<div class="sub">${t.sub}<div class="groc">${t.grocery}</div></div>
<div class="stores"><span class="chip now">✓ Costco</span><span class="lbl">${t.soon}</span>${t.stores.map((x) => `<span class="chip soon">${x}</span>`).join("")}</div>
<div class="urgent">${t.urgent}</div>
<div class="card"><div class="qr">${qr}</div>
  <div class="cta"><div class="s1">← ${t.scan}</div><div class="s2">${t.pScan2}</div>
    <div class="badges"><img src="${APPLE}"><img src="${GP[lang]}"></div>
    <div class="url">priceback.ca</div></div></div>
<div class="fine">${t.pModel} ${t.fine}</div>
</div></div></body></html>`;
}

// Counter sign: its own minimal layout for a 4x6 acrylic stand read at arm's length by people waiting.
// Three things only: the waiting hook, the money hook, one huge QR.
function counter(lang, wIn, hIn, qr) {
  const t = T[lang];
  const W = wIn + 2 * BLEED, H = hIn + 2 * BLEED;
  return `<!doctype html><html lang="${lang}"><head><meta charset="utf-8"><style>${CSS}
html{font-size:${wIn / 100}in}
.page{width:${W}in;height:${H}in}
.band{position:absolute;left:0;right:0;top:0;height:calc(${BLEED}in + 19rem);background:var(--yellow);color:#03130c;display:flex;align-items:flex-end;justify-content:center;padding-bottom:4.4rem}
.band .k{font-weight:900;font-size:${lang === "fr" ? 5.9 : 7.4}rem;letter-spacing:-.02em;white-space:nowrap}
.inner{inset:calc(${BLEED}in + 19rem + 5.5rem) calc(${BLEED}in + 7rem) calc(${BLEED}in + 4.6rem);align-items:center;justify-content:space-between;text-align:center}
.head{width:100%}
.h1,.h2{font-size:11.6rem}
.h2{margin-top:.4rem}
.qwrap{position:relative;margin-top:7rem}
.qcard{background:#fff;border-radius:4.4rem;padding:4.4rem;box-shadow:0 1.4rem 3.4rem rgba(0,0,0,.5)}
.qr{width:48rem;height:48rem}
.tab{position:absolute;left:50%;top:-4.6rem;transform:translateX(-50%);background:var(--mint);color:#03130c;font-weight:900;font-size:${lang === "fr" ? 4.2 : 4.6}rem;letter-spacing:.06em;padding:1.4rem 4rem;border-radius:99em;white-space:nowrap;box-shadow:0 .6rem 1.4rem rgba(0,0,0,.35)}
.badges{gap:2.4rem;justify-content:center}
.badges img{height:8.2rem;width:auto}
.foot{display:flex;align-items:center;justify-content:center;gap:3rem}
.foot .brand{font-size:6rem}
.foot .dl{font-weight:800;font-size:3.4rem;color:var(--yellow);white-space:nowrap}
.fine{font-size:2.15rem}
</style></head><body class="counter"><div class="page">
<div class="band"><div class="k">${t.ck}</div></div>
<div class="inner">
<div class="head"><div class="h1">${t.h1}</div><div class="h2">${t.h2}</div></div>
<div class="qwrap"><div class="tab">${t.cScan}</div><div class="qcard"><div class="qr">${qr}</div></div></div>
<div class="badges"><img src="${APPLE}"><img src="${GP[lang]}"></div>
<div class="foot"><div class="brand"><span class="tile">${MARK()}</span>PriceBack</div><div class="dl">${t.free}</div></div>
<div class="fine">${t.model} ${t.cfine}</div>
</div></div></body></html>`;
}

const qrSvg = async (url) =>
  (await QR.toString(url, { type: "svg", errorCorrectionLevel: "M", margin: 0, color: { dark: "#03130c", light: "#ffffff" } })).replace(/width="\d+" height="\d+"/, "");

(async () => {
  fs.mkdirSync(OUT, { recursive: true });
  const jobs = [];
  for (const lang of ["en", "fr"]) {
    jobs.push({ name: `PriceBack-poster-11x17-${lang}`, fn: poster, w: 11, h: 17, src: `poster17-${lang}`, lang });
    jobs.push({ name: `PriceBack-poster-8.5x11-${lang}`, fn: poster, w: 8.5, h: 11, src: `poster11-${lang}`, lang });
    jobs.push({ name: `PriceBack-counter-4x6-${lang}`, fn: counter, w: 4, h: 6, src: `counter-${lang}`, lang });
  }
  const browser = await chromium.launch();
  for (const j of jobs) {
    if (process.env.ONLY && !j.name.includes(process.env.ONLY)) continue;
    const url = `https://priceback.ca/app?s=${j.src}`;
    const html = j.fn(j.lang, j.w, j.h, await qrSvg(url));
    fs.writeFileSync(path.join(OUT, `${j.name}.html`), html);
    const W = j.w + 2 * BLEED, H = j.h + 2 * BLEED;
    const page = await browser.newPage({ viewport: { width: Math.round(W * 96), height: Math.round(H * 96) }, deviceScaleFactor: 300 / 96 });
    await page.setContent(html, { waitUntil: "load" });
    await page.evaluate(() => document.fonts.ready);
    const info = await page.evaluate(() => {
      const inner = document.querySelector(".inner");
      const avail = (el) => { const cs = getComputedStyle(el.parentElement); return el.parentElement.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight); };
      const autofit = () => { for (const el of document.querySelectorAll(".h1,.h2,.kick,.stores,.cta .s1,.sub")) {
        const max = avail(el); const w = el.scrollWidth;
        if (w > max) el.style.fontSize = parseFloat(getComputedStyle(el).fontSize) * (max / w) * 0.985 + "px";
      } };
      autofit();
      const hero = document.querySelector(".hero");
      if (hero) { const max = hero.parentElement.clientWidth; const w = hero.scrollWidth; if (w > max * 0.98) hero.style.zoom = (max * 0.98 / w).toFixed(3); }
      // keep both headline lines the same size
      const h1 = document.querySelector(".h1"), h2 = document.querySelector(".h2");
      const fs = Math.min(parseFloat(getComputedStyle(h1).fontSize), parseFloat(getComputedStyle(h2).fontSize));
      h1.style.fontSize = h2.style.fontSize = fs + "px";
      const out = {};
      const fit = document.querySelector(".fit");
      if (fit) {
        const mid = document.querySelector(".mid");
        const s = Math.min(1.25, (mid.clientHeight * 0.86) / fit.offsetHeight, (mid.clientWidth * 0.62) / fit.offsetWidth);
        fit.style.transform = `translateX(-6%) scale(${s})`; out.s = +s.toFixed(2);
      }
      const cq = document.querySelector(".counter .qr");
      if (cq && document.querySelector(".mid")) { const mid = document.querySelector(".mid"); const add = Math.max(0, mid.clientHeight - 8); const sz = Math.min(cq.clientWidth + add, document.querySelector(".card").clientWidth * 0.52); cq.style.width = cq.style.height = sz + "px"; out.qr = sz; autofit(); }
      const page = document.querySelector(".page").getBoundingClientRect();
      out.over = [...inner.querySelectorAll("*")].filter((e) => { const r = e.getBoundingClientRect(); return r.bottom > page.bottom - 2 || r.right > page.right + 1; }).map((e) => e.className).slice(0, 5);
      const m = document.querySelector(".mid"); out.spare = m ? m.clientHeight : null; out.gaps = [...inner.children].map((e, i, a) => i ? Math.round(e.getBoundingClientRect().top - a[i - 1].getBoundingClientRect().bottom) : 0).join(",");
      return out;
    });
    await page.pdf({ path: path.join(OUT, `${j.name}.pdf`), width: `${W}in`, height: `${H}in`, printBackground: true, pageRanges: "1" });
    await page.screenshot({ path: path.join(OUT, `${j.name}.png`), clip: { x: 0, y: 0, width: W * 96, height: H * 96 } });
    await page.close();
    console.log(j.name, JSON.stringify(info));
  }
  await browser.close();
})();
