// Priceback print posters: public poster (11x17, 8.5x11) + counter stand card (4x6), EN + FR.
// node posters.js <outdir>
const fs = require("fs");
const path = require("path");
const QR = require("qrcode");
const { chromium } = require("playwright");

const OUT = process.argv[2] || path.join(__dirname, "out");
const BADGES = path.join(__dirname, "../06-launch/badges");
const b64 = (f, mime) => `data:${mime};base64,${fs.readFileSync(path.join(BADGES, f)).toString("base64")}`;
const APPLE = b64("app-store-en.svg", "image/svg+xml");
const GP = { en: b64("google-play-en.png", "image/png"), fr: b64("google-play-fr.png", "image/png") };
const BLEED = 0.125; // in

const MARK = `<svg viewBox="0 0 48 48" fill="none" stroke="#fff" stroke-width="3.4" stroke-linecap="round" stroke-linejoin="round">
<path d="M13 9 H35 V34 L32 37 L29 34 L26 37 L23 34 L20 37 L17 34 L14 37 L13 36 Z"/><path d="M17 16 L21.5 20.5 L25.5 17 L31 27"/><path d="M31 27 L27.4 26 M31 27 L31.7 23.2"/></svg>`;

const T = {
  en: {
    kicker: "Shopped at Costco lately?",
    h1: "Costco may owe you", h2: "MONEY.",
    tagTop: "SAME ITEM · 2 WEEKS LATER", paid: "YOU PAID", regp: "19.99", off: "-6.00", reg: "PRICE AT REGISTER", now: "13.99",
    burst1: "$6", burst2: "BACK",
    sub: "Prices drop after you buy.<br>PriceBack tells you when to <b>claim the difference.</b>",
    steps: ["Scan your receipt", "We watch every price", "Claim the difference"],
    scan: "SCAN ME", cScan: "SCAN ME · FREE APP", cta1: "Download it free", cta2: "iPhone & Android",
    fine: "Example for illustration. Price adjustments are Costco’s policy: claim while the lower price is in effect, within 30 days of purchase. PriceBack is not affiliated with Costco.",
    cKicker: "Waiting for your order?", cSub: "Snap your Costco receipt. PriceBack tells you when a price drops, so you can claim the difference.",
    cCta: "Scan to get PriceBack · free",
    cFine: "Price adjustments are Costco’s policy, within 30 days of purchase. PriceBack is not affiliated with Costco.",
  },
  fr: {
    kicker: "Vous magasinez chez Costco ?",
    h1: "Costco vous doit peut-être", h2: "DE L’ARGENT.",
    tagTop: "MÊME ARTICLE · 2 SEMAINES PLUS TARD", paid: "PAYÉ", regp: "19,99", off: "-6,00", reg: "PRIX À LA CAISSE", now: "13,99",
    burst1: "6 $", burst2: "REMIS",
    sub: "Les prix baissent après l’achat.<br>PriceBack vous dit quand <b>réclamer la différence.</b>",
    steps: ["Scannez votre reçu", "On surveille chaque prix", "Réclamez la différence"],
    scan: "SCANNEZ-MOI", cScan: "SCANNEZ · APPLI GRATUITE", cta1: "Téléchargez-la gratuitement", cta2: "iPhone et Android",
    fine: "Exemple à titre indicatif. Les ajustements de prix relèvent de la politique de Costco : à réclamer pendant que le prix réduit est en vigueur, dans les 30 jours suivant l’achat. PriceBack n’est pas affilié à Costco.",
    cKicker: "Vous attendez votre commande ?", cSub: "Photographiez votre reçu Costco. PriceBack vous avertit quand un prix baisse pour réclamer la différence.",
    cCta: "Scannez pour obtenir PriceBack · gratuit",
    cFine: "Les ajustements de prix relèvent de la politique de Costco, dans les 30 jours suivant l’achat. PriceBack n’est pas affilié à Costco.",
  },
};

const BASE_CSS = `
@page{margin:0}
*{margin:0;padding:0;box-sizing:border-box}
:root{--blue:#005DAA;--red:#E31837;--yellow:#FFF200;--ink:#111;--green:#10b981;--greenD:#047857}
html,body{background:#fff;-webkit-print-color-adjust:exact;print-color-adjust:exact}
body{font-family:Inter,"Inter Display",Arial,sans-serif;color:var(--ink)}
.page{position:relative;overflow:hidden;background:#fff;display:flex;flex-direction:column}
.serif{font-family:"Liberation Serif","Times New Roman",serif}
.brand{display:flex;align-items:center;gap:.5em;font-weight:900;letter-spacing:-.02em}
.tile{width:1.6em;height:1.6em;border-radius:.4em;background:linear-gradient(160deg,#10b981,#0e9f70);display:flex;align-items:center;justify-content:center}
.tile svg{width:78%;height:78%}
.qrbox{background:#fff;border-radius:.6rem;display:flex;align-items:center;justify-content:center}
.qrbox svg{display:block;width:100%;height:100%}
.tag{background:#fff;box-shadow:0 .5rem 1.4rem rgba(0,0,0,.22);border:1px solid #ddd}
.hl{background:var(--yellow);padding:0 .12em}
.burst{position:absolute;border-radius:50%;background:var(--red);color:#fff;display:flex;flex-direction:column;align-items:center;justify-content:center;font-weight:900;box-shadow:0 .4rem 1rem rgba(0,0,0,.25);border:.25rem solid #fff}
.badges{display:flex;align-items:center;gap:.6rem}
.badges img{display:block}
`;

// Poster: 1rem = 1% of trim width. Bleed added around trim; safe zone 0.35in inside trim.
function poster(lang, wIn, hIn, qrSvg, url) {
  const t = T[lang];
  const W = wIn + 2 * BLEED, H = hIn + 2 * BLEED;
  const tall = hIn / wIn > 1.4; // 11x17
  return `<!doctype html><html lang="${lang}"><head><meta charset="utf-8"><style>${BASE_CSS}
html{font-size:${wIn / 100}in}
.page{width:${W}in;height:${H}in}
.inner{position:absolute;inset:${BLEED}in;display:flex;flex-direction:column}
.top{background:var(--blue);margin:-${BLEED}in -${BLEED}in 0;padding:calc(${BLEED}in + ${tall ? 4.4 : 3.2}rem) calc(${BLEED}in + 5.5rem) ${tall ? 3.8 : 2.8}rem;border-bottom:1.4rem solid var(--red);color:#fff}
.kick{font-weight:800;font-size:${lang === "fr" ? 5.2 : 5.6}rem;letter-spacing:.01em;text-transform:uppercase;line-height:1;white-space:nowrap}
.head{padding:${tall ? 6.5 : 3.4}rem 5.5rem 0}
.h1{font-weight:900;color:var(--blue);font-size:${lang === "fr" ? 6.5 : 8}rem;line-height:1;letter-spacing:-.03em;white-space:nowrap}
.h2{display:inline-block;white-space:nowrap;margin-top:3.2rem;font-weight:900;color:#fff;background:var(--red);font-size:${lang === "fr" ? (tall ? 14.6 : 13) : (tall ? 20 : 17)}rem;line-height:.92;letter-spacing:-.04em;padding:.06em .16em .1em;transform:rotate(-2deg);transform-origin:left center}
.mid{flex:1;min-height:0;display:flex;align-items:center;justify-content:center;position:relative;padding:0 5.5rem}
.fit{position:relative;transform-origin:center center}
.tag{width:60rem;padding:2.6rem 3.6rem 1.6rem;transform:rotate(-3deg);margin-left:8rem}
.tag .t0{font-family:Inter;font-weight:800;white-space:nowrap;font-size:${lang === "fr" ? 2 : 2.4}rem;letter-spacing:.08em;color:#666}
.tag .row{display:flex;justify-content:space-between;align-items:center;margin-top:1.6rem;font-size:5.4rem}
.tag .off{display:flex;justify-content:flex-end;font-size:5.4rem;margin-top:.4rem}
.tag .rule{border-top:.35rem solid #111;margin-top:1.4rem}
.tag .reg{text-align:right;font-family:Inter;font-weight:700;font-size:2.2rem;letter-spacing:.06em;margin-top:.8rem}
.tag .now{text-align:right;font-weight:700;font-size:18rem;line-height:.95;letter-spacing:-.03em}
.strike{position:relative}
.strike:after{content:"";position:absolute;left:-.05em;right:-.05em;top:52%;border-top:.09em solid var(--red);transform:rotate(-8deg)}
.burst{width:24rem;height:24rem;left:0;bottom:-2rem;transform:rotate(-10deg)}
.burst .a{font-size:${lang === "fr" ? 8.6 : 10}rem;line-height:.9;letter-spacing:-.03em}
.burst .b{font-size:3.6rem;letter-spacing:.06em}
.sub{padding:${tall ? 1 : 0}rem 4rem ${tall ? 2.4 : 1.4}rem;text-align:center;white-space:nowrap;font-size:${lang === "fr" ? 3.2 : 3.5}rem;line-height:1.3;font-weight:500;color:#222}
.sub b{font-weight:800;color:var(--blue)}
.steps{display:flex;justify-content:center;gap:2.6rem;padding:${tall ? 5 : 2.6}rem 5.5rem ${tall ? 4 : 2.2}rem}
.step{display:flex;align-items:center;gap:1.2rem;font-weight:800;font-size:${lang === "fr" ? 2.55 : 2.8}rem;color:var(--blue)}
.step i{font-style:normal;flex:none;width:4.6rem;height:4.6rem;border-radius:50%;background:var(--blue);color:#fff;display:flex;align-items:center;justify-content:center;font-size:2.8rem}
.bottom{background:var(--red);margin:0 -${BLEED}in -${BLEED}in;padding:${tall ? 5 : 4}rem calc(${BLEED}in + 5.5rem) calc(${BLEED}in + ${tall ? 3.6 : 2.6}rem);color:#fff;display:flex;gap:5rem;align-items:center}
.qrwrap{position:relative;flex:none}
.qrbox{width:${tall ? 31 : 26}rem;height:${tall ? 31 : 26}rem;padding:2.4rem;border-radius:2rem}
.scan{position:absolute;left:50%;top:-3.4rem;transform:translateX(-50%);background:var(--yellow);color:#111;font-weight:900;font-size:3rem;letter-spacing:.06em;padding:.9rem 2.2rem;border-radius:5rem;white-space:nowrap;box-shadow:0 .3rem .8rem rgba(0,0,0,.2)}
.cta{flex:1;min-width:0}
.cta .brand{font-size:5.6rem;color:#fff}
.cta .c1{font-weight:900;font-size:${lang === "fr" ? 6 : 6.8}rem;line-height:1;letter-spacing:-.02em;margin-top:${tall ? 2.4 : 1.6}rem}
.cta .c2{font-weight:600;font-size:3.3rem;margin-top:1rem;opacity:.95}
.cta .badges{margin-top:${tall ? 3 : 2.2}rem}
.cta .badges img.a{height:6.4rem}
.cta .badges img.g{height:9.4rem;margin:-1.5rem 0}
.cta .url{margin-top:${tall ? 2.4 : 1.6}rem;font-weight:700;font-size:2.8rem;opacity:.9}
.fine{position:absolute;left:5.5rem;right:5.5rem;bottom:0;text-align:center;font-size:${Math.max(1.35, 6.5 / 72 / (wIn / 100))}rem;color:#555;line-height:1.3}
.finewrap{position:relative;height:${tall ? 5 : 4.4}rem}
</style></head><body><div class="page"><div class="inner">
<div class="top"><div class="kick">${t.kicker}</div></div>
<div class="head"><div class="h1">${t.h1}</div><div class="h2">${t.h2}</div></div>
<div class="mid"><div class="fit">
  <div class="tag serif"><div class="t0">${t.tagTop}</div>
    <div class="row"><span style="font-family:Inter;font-weight:700;font-size:.6em;letter-spacing:.04em">${t.paid}</span><span style="flex:1"></span><span class="strike">${t.regp}</span><span class="hl" style="margin-left:.5em">${t.off}</span></div>
    <div class="rule"></div><div class="reg">${t.reg}</div><div class="now">${t.now}</div></div>
  <div class="burst"><div class="a">${t.burst1}</div><div class="b">${t.burst2}</div></div>
</div></div>
<div class="sub">${t.sub}</div>
<div class="finewrap"><div class="fine">${t.fine}</div></div>
<div class="bottom">
  <div class="qrwrap"><div class="scan">${t.scan} ↓</div><div class="qrbox">${qrSvg}</div></div>
  <div class="cta"><div class="brand"><span class="tile">${MARK}</span>PriceBack</div>
    <div class="c1">${t.cta1}</div><div class="c2">${t.cta2}</div>
    <div class="badges"><img class="a" src="${APPLE}"><img class="g" src="${GP[lang]}"></div>
    <div class="url">priceback.ca</div></div>
</div>
</div></div></body></html>`;
}

// Counter card for a 4x6 acrylic L/T stand. 1rem = 1% of trim width (4in).
function counter(lang, wIn, hIn, qrSvg, url) {
  const t = T[lang];
  const W = wIn + 2 * BLEED, H = hIn + 2 * BLEED;
  return `<!doctype html><html lang="${lang}"><head><meta charset="utf-8"><style>${BASE_CSS}
html{font-size:${wIn / 100}in}
.page{width:${W}in;height:${H}in}
.inner{position:absolute;inset:${BLEED}in;display:flex;flex-direction:column}
.top{background:var(--blue);margin:-${BLEED}in -${BLEED}in 0;padding:calc(${BLEED}in + 4.6rem) calc(${BLEED}in + 7rem) 3.8rem;border-bottom:2rem solid var(--red);color:#fff}
.kick{font-weight:800;font-size:6.4rem;line-height:1.08;text-transform:uppercase;white-space:nowrap}
.head{padding:4.4rem 7rem 0;position:relative}
.h1{font-weight:900;color:var(--blue);font-size:${lang === "fr" ? 6.6 : 8.3}rem;line-height:1;letter-spacing:-.03em;white-space:nowrap}
.h2{display:inline-block;white-space:nowrap;margin-top:3.6rem;font-weight:900;color:#fff;background:var(--red);font-size:${lang === "fr" ? 13.4 : 17.5}rem;line-height:.92;letter-spacing:-.04em;padding:.06em .16em .1em;transform:rotate(-2deg);transform-origin:left center}
.burst{width:25rem;height:25rem;right:6rem;top:${lang === "fr" ? 25 : 23}rem;transform:rotate(10deg)}
.burst .a{font-size:${lang === "fr" ? 8.4 : 9.6}rem;line-height:.9;letter-spacing:-.03em}
.burst .b{font-size:3.6rem;letter-spacing:.05em}
.sub{padding:3.6rem 7rem 0;font-size:${lang === "fr" ? 3.9 : 4.2}rem;line-height:1.28;font-weight:600;color:#222}
.mid{flex:1;min-height:0;display:flex;align-items:center;justify-content:center;padding:8rem 0 2rem}
.qrwrap{position:relative}
.qrbox{width:50rem;height:50rem;padding:3.6rem;border:.9rem solid var(--red);border-radius:3.5rem}
.scan{position:absolute;left:50%;top:-5rem;transform:translateX(-50%);background:var(--yellow);color:#111;font-weight:900;font-size:${lang === "fr" ? 3.9 : 4.4}rem;letter-spacing:.05em;padding:1.2rem 3.6rem;border-radius:6rem;white-space:nowrap;box-shadow:0 .3rem .8rem rgba(0,0,0,.2)}
.bottom{background:var(--red);margin:2rem -${BLEED}in -${BLEED}in;padding:3.6rem calc(${BLEED}in + 7rem) calc(${BLEED}in + 4rem);color:#fff}
.row1{display:flex;align-items:center;justify-content:space-between}
.bottom .brand{font-size:6.8rem}
.badges img.a{height:7.6rem}
.badges img.g{height:11.2rem;margin:-1.8rem -.9rem -1.8rem 0}
.badges{flex-direction:column;align-items:flex-end;gap:.6rem}
.cta{font-weight:800;font-size:${lang === "fr" ? 3.9 : 4.3}rem;margin-top:2.4rem}
.url{font-weight:600;font-size:3.2rem;opacity:.9;margin-top:.4rem}
.fine{margin-top:2rem;font-size:2.1rem;line-height:1.3;opacity:.92}
</style></head><body class="counter"><div class="page"><div class="inner">
<div class="top"><div class="kick">${t.cKicker}</div></div>
<div class="head"><div class="h1">${t.h1}</div><div class="h2">${t.h2}</div></div>
<div class="mid"><div class="qrwrap"><div class="scan">${t.cScan} ↓</div><div class="qrbox">${qrSvg}</div></div></div>
<div class="bottom">
  <div class="row1"><div class="brand"><span class="tile">${MARK}</span>PriceBack</div>
  <div class="badges"><img class="a" src="${APPLE}"><img class="g" src="${GP[lang]}"></div></div>
  <div class="fine">${t.cFine}</div>
</div>
</div></div></body></html>`;
}

const qrSvg = async (url) =>
  (await QR.toString(url, { type: "svg", errorCorrectionLevel: "M", margin: 0, color: { dark: "#000000", light: "#ffffff" } }))
    .replace(/width="\d+" height="\d+"/, "");

(async () => {
  fs.mkdirSync(OUT, { recursive: true });
  const jobs = [];
  for (const lang of ["en", "fr"]) {
    jobs.push({ name: `PriceBack-poster-11x17-${lang}`, fn: poster, w: 11, h: 17, src: `poster17-${lang}`, lang });
    jobs.push({ name: `PriceBack-poster-8.5x11-${lang}`, fn: poster, w: 8.5, h: 11, src: `poster11-${lang}`, lang });
    jobs.push({ name: `PriceBack-counter-4x6-${lang}`, fn: counter, w: 4, h: 6, src: `counter-${lang}`, lang });
  }
  const browser = await chromium.launch();
  const only = process.env.ONLY;
  for (const j of jobs) {
    if (only && !j.name.includes(only)) continue;
    const url = `https://priceback.ca/app?s=${j.src}`;
    const html = j.fn(j.lang, j.w, j.h, await qrSvg(url), url);
    fs.writeFileSync(path.join(OUT, `${j.name}.html`), html);
    const W = j.w + 2 * BLEED, H = j.h + 2 * BLEED;
    const page = await browser.newPage({ viewport: { width: Math.round(W * 96), height: Math.round(H * 96) }, deviceScaleFactor: 300 / 96 });
    await page.setContent(html, { waitUntil: "load" });
    await page.evaluate(() => document.fonts.ready);
    const info = await page.evaluate(() => {
      const fit = document.querySelector(".fit"), mid = document.querySelector(".mid");
      for (const el of document.querySelectorAll(".kick,.h1,.h2")) {
        const max = el.parentElement.clientWidth - parseFloat(getComputedStyle(el.parentElement).paddingLeft) - parseFloat(getComputedStyle(el.parentElement).paddingRight);
        const w = el.scrollWidth;
        if (w > max) el.style.fontSize = parseFloat(getComputedStyle(el).fontSize) * (max / w) * 0.985 + "px";
      }
      const cq = document.querySelector(".counter .qrbox");
      if (cq) { const m = document.querySelector(".mid"); const avail = m.clientHeight - parseFloat(getComputedStyle(m).paddingTop) - parseFloat(getComputedStyle(m).paddingBottom); const sz = Math.min(avail, m.clientWidth * 0.66); cq.style.width = cq.style.height = sz + "px"; }
      let s = null;
      if (fit) { s = Math.min(1.3, (mid.clientHeight * 0.9) / fit.offsetHeight, (mid.clientWidth * 0.98) / fit.offsetWidth); fit.style.transform = `scale(${s})`; }
      const inner = document.querySelector(".inner");
      const over = [...inner.querySelectorAll("*")].filter((e) => { const r = e.getBoundingClientRect(), p = document.querySelector(".page").getBoundingClientRect(); return r.right > p.right + 1 || r.bottom > p.bottom + 1; }).map((e) => e.className).slice(0, 5);
      return { s, over, midH: mid.clientHeight };
    });
    console.log(j.name, JSON.stringify(info));
    await page.pdf({ path: path.join(OUT, `${j.name}.pdf`), width: `${W}in`, height: `${H}in`, printBackground: true, pageRanges: "1" });
    await page.screenshot({ path: path.join(OUT, `${j.name}.png`), clip: { x: 0, y: 0, width: W * 96, height: H * 96 } });
    await page.close();
    console.log(j.name, url);
  }
  await browser.close();
})();
