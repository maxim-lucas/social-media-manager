// cards.js — renders every overlay a realistic tutorial needs, as transparent 1080x1920 PNGs:
// captions (one PNG per reveal state), the fine-print line, the end card, and previz placeholder
// cards for any shot whose footage / screen recording is not in yet.
//
//   node tools/cards.js <video-dir>          writes <video-dir>/build/cards/*.png + manifest.json
//
// The manifest records each overlay's text bounding box, measured in the browser, so gates.js can
// prove nothing readable sits under Instagram's header, caption bar or action rail.

const fs = require("fs");
const path = require("path");
const { chromium } = require(process.env.PW || "/opt/npm-tools/node_modules/playwright");

const dir = path.resolve(process.argv[2] || ".");
const spec = JSON.parse(fs.readFileSync(path.join(dir, "shots.json"), "utf8"));
const OUT = path.join(dir, "build", "cards");
fs.mkdirSync(OUT, { recursive: true });

const SC = path.join(__dirname, "..", "..");
const FONT = (w) => "data:font/woff2;base64," + fs.readFileSync(path.join(__dirname, "node_modules/@fontsource/roboto/files", `roboto-latin-${w}-normal.woff2`)).toString("base64");
const data = (f, type) => `data:${type};base64,` + fs.readFileSync(f).toString("base64");
const MARK = data(path.join(SC, "08-costco-price-drops/scenes/mark.png"), "image/png");
const BADGE = {
  en: [data(path.join(SC, "06-launch/badges/app-store-en.svg"), "image/svg+xml"), data(path.join(SC, "06-launch/badges/google-play-en.png"), "image/png")],
  fr: [data(path.join(SC, "06-launch/badges/app-store-en.svg"), "image/svg+xml"), data(path.join(SC, "06-launch/badges/google-play-fr.png"), "image/png")],
};

// Brand palette (brand/palette.js) — only the colours these overlays use.
const C = { ink: "#0d3d28", inkDeep: "#071410", paper: "#f6f0e5", emerald: "#10b981", emeraldDeep: "#047857", glow: "#34d399" };

const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/\n/g, "<br>");

const BASE = `
@font-face{font-family:R;font-weight:400;src:url(${FONT(400)})}
@font-face{font-family:R;font-weight:500;src:url(${FONT(500)})}
@font-face{font-family:R;font-weight:700;src:url(${FONT(700)})}
@font-face{font-family:R;font-weight:900;src:url(${FONT(900)})}
*{margin:0;padding:0;box-sizing:border-box}
html,body{width:1080px;height:1920px;background:transparent;font-family:R,sans-serif;overflow:hidden}
.t{position:absolute}
`;

// Caption styles. Positions keep text inside the story safe zone (top 250, bottom 320, left 96, right 200).
function captionHTML(cap, revealCount) {
  if (cap.style === "title") {
    return `<div class="t" data-text style="left:96px;width:784px;top:300px;color:#fff;font-weight:900;font-size:76px;line-height:1.04;letter-spacing:-1.5px;text-shadow:0 2px 18px rgba(0,0,0,.55),0 0 2px rgba(0,0,0,.6)">${esc(cap.text)}</div>`;
  }
  if (cap.style === "steps") {
    const parts = cap.text.split(/\s{2,}/);
    // "① Header" → an emerald disc with the digit, then the label. Circled-digit glyphs are not in Roboto
    // and fall back to another face, so the number is drawn rather than typed.
    const chips = parts.map((p, i) => {
      const label = p.replace(/^[\u2460-\u2473]\s*/, "");
      const on = i < revealCount;
      return `<div style="display:inline-flex;align-items:center;gap:16px;margin:0 0 14px 0;padding:12px 30px 12px 12px;border-radius:999px;font-weight:700;font-size:42px;
      background:${on ? C.paper : "transparent"};color:${on ? C.ink : "transparent"};box-shadow:${on ? "0 6px 24px rgba(0,0,0,.28)" : "none"}">
      <b style="width:58px;height:58px;border-radius:29px;display:inline-flex;align-items:center;justify-content:center;font-weight:900;font-size:34px;
      background:${on ? C.emerald : "transparent"};color:${on ? "#fff" : "transparent"}">${i + 1}</b>${esc(label)}</div>`;
    }).join("<br>");
    return `<div class="t" data-text style="left:96px;width:784px;top:1180px">${chips}</div>`;
  }
  const warn = cap.style === "warn";
  return `<div class="t" data-text style="left:96px;max-width:784px;top:${warn ? 1290 : 1380}px;padding:20px 30px;border-radius:28px;
    background:${warn ? "rgba(7,20,16,.86)" : "rgba(246,240,229,.95)"};color:${warn ? "#fff" : C.ink};font-weight:700;font-size:44px;line-height:1.18;
    box-shadow:0 8px 28px rgba(0,0,0,.3)">${warn ? `<span style="color:${C.glow}">⚠&nbsp;</span>` : ""}${esc(cap.text)}</div>`;
}

function finePrintHTML(text) {
  return `<div class="t" data-text style="left:96px;width:784px;top:1556px;color:rgba(255,255,255,.92);font-weight:500;font-size:22px;line-height:1.3;text-shadow:0 1px 6px rgba(0,0,0,.7)">${esc(text)}</div>`;
}

// The end card is a tutorial outro, not an ad: a one-line recap, what to watch next, where every
// tutorial lives in the app, and an invitation to follow on each channel. Network names are set as
// text, never as the networks' logos.
function endcardHTML(e, lang, social) {
  const chip = (n) => `<div style="width:340px;height:92px;border-radius:22px;background:#fff;border:2px solid rgba(13,61,40,.12);padding:14px 22px">
    <div style="font-weight:700;font-size:28px;color:${C.ink}">${esc(n.name)}</div>
    <div style="font-weight:500;font-size:22px;color:${C.emeraldDeep};margin-top:2px">${esc(n.handle)}</div></div>`;
  return `<div class="t" style="left:0;top:0;width:1080px;height:1920px;background:linear-gradient(180deg,rgba(7,20,16,.05) 0%,rgba(7,20,16,.3) 100%)"></div>
  <div class="t" style="left:60px;top:372px;width:960px;height:1000px;border-radius:44px;background:rgba(246,240,229,.97);box-shadow:0 20px 60px rgba(0,0,0,.35)"></div>
  <div class="t" data-text style="left:132px;top:420px;width:700px;display:flex;align-items:center;gap:20px">
    <img src="${MARK}" style="height:70px"><span style="font-weight:900;font-size:48px;color:${C.ink};letter-spacing:-1px">PriceBack</span>
    <span style="font-weight:500;font-size:24px;letter-spacing:3px;color:${C.emeraldDeep};margin-left:6px">TUTORIAL</span></div>
  <div class="t" data-text style="left:132px;top:530px;width:740px;font-weight:900;font-size:62px;line-height:1.06;letter-spacing:-1.2px;color:${C.ink}">${esc(e.head)}</div>
  <div class="t" style="left:132px;top:704px;width:740px;height:2px;background:rgba(13,61,40,.14)"></div>
  <div class="t" data-text style="left:132px;top:732px;width:740px;display:flex;align-items:center;gap:20px">
    <b style="flex:none;width:72px;height:72px;border-radius:36px;background:${C.emerald};display:flex;align-items:center;justify-content:center">
      <i style="display:block;width:0;height:0;border-left:24px solid #fff;border-top:15px solid transparent;border-bottom:15px solid transparent;margin-left:6px"></i></b>
    <div><div style="font-weight:700;font-size:22px;letter-spacing:3px;color:${C.emeraldDeep}">${esc(e.nextLabel.toUpperCase())}</div>
    <div style="font-weight:700;font-size:38px;color:${C.ink};margin-top:2px">${esc(e.next)}</div></div></div>
  <div class="t" data-text style="left:132px;top:836px;width:740px;font-weight:500;font-size:29px;line-height:1.3;color:${C.ink}">${esc(e.more)}</div>
  <div class="t" style="left:132px;top:910px;width:740px;height:2px;background:rgba(13,61,40,.14)"></div>
  <div class="t" data-text style="left:132px;top:940px;width:740px;font-weight:900;font-size:44px;letter-spacing:-.5px;color:${C.ink}">${esc(e.follow)}</div>
  <div class="t" data-text style="left:132px;top:1012px;width:740px;display:grid;grid-template-columns:340px 340px;gap:20px 24px">${social.networks.map(chip).join("")}</div>
  <div class="t" data-text style="left:132px;top:1250px;width:740px;font-weight:400;font-size:23px;line-height:1.35;color:rgba(13,61,40,.85)">${esc(e.fine)}</div>`;
}

function placeholderHTML(s, i, n) {
  const kind = s.type === "screen" ? "REAL SCREEN RECORDING (from the app)" : `AI FOOTAGE · ${s.model} · ${s.genDur}s`;
  const desc = s.type === "screen" ? s.screen : s.keyframe;
  return `<div class="t" style="left:0;top:0;width:1080px;height:1920px;background:radial-gradient(ellipse at 30% 25%,#2b4a3c 0%,#11241c 55%,#071410 100%)"></div>
  <div class="t" style="left:96px;top:640px;width:784px;color:#d6efe3;font-family:R">
    <div style="font-weight:700;font-size:26px;letter-spacing:4px;color:${C.glow}">PREVIZ · ${s.id} · ${s.dur}s · ${i + 1}/${n}</div>
    <div style="font-weight:500;font-size:22px;letter-spacing:2px;margin-top:8px;opacity:.75">${esc(kind)}</div>
    <div style="font-weight:900;font-size:40px;margin-top:22px;color:#fff">${esc(s.beat)}</div>
    <div style="font-weight:400;font-size:27px;line-height:1.36;margin-top:16px">${esc(desc)}</div>
    ${s.vo ? `<div style="font-weight:500;font-style:italic;font-size:28px;line-height:1.36;margin-top:22px;color:#fff">VO: “${esc(s.vo.text)}”</div>` : ""}
  </div>`;
}

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1080, height: 1920 } });
  const manifest = { captions: [], finePrint: null, endcard: null, placeholders: [] };

  async function render(name, body, extra = {}) {
    await page.setContent(`<!doctype html><html><head><style>${BASE}</style></head><body>${body}</body></html>`);
    await page.evaluate(() => Promise.all(["400","500","700","900"].map((w) => document.fonts.load(w + " 40px R"))));
    // Fail loudly if the font did not resolve: Roboto Black's "W" is far wider than any fallback's.
    const ok = await page.evaluate(() => document.fonts.check("900 40px R"));
    if (!ok) throw new Error("Roboto did not load");
    const boxes = await page.$$eval("[data-text]", (els) => els.map((e) => {
      const r = e.getBoundingClientRect();
      return { x: Math.round(r.left), y: Math.round(r.top), w: Math.round(r.width), h: Math.round(r.height), text: e.innerText.trim() };
    }).filter((b) => b.w && b.h));
    const file = path.join(OUT, name + ".png");
    await page.screenshot({ path: file, omitBackground: true });
    return { file: path.relative(dir, file), boxes, ...extra };
  }

  for (const [i, s] of spec.shots.entries()) {
    if (s.caption) {
      const cap = s.caption;
      if (cap.style === "steps") {
        const rev = cap.reveal || [cap.at];
        for (let k = 0; k < rev.length; k++) {
          const until = k + 1 < rev.length ? rev[k + 1] : cap.until;
          manifest.captions.push(await render(`cap-${s.id}-${k + 1}`, captionHTML(cap, k + 1), { shot: s.id, at: rev[k], until, fadeIn: k === 0, fadeOut: k === rev.length - 1 }));
        }
      } else {
        manifest.captions.push(await render(`cap-${s.id}`, captionHTML(cap), { shot: s.id, at: cap.at, until: cap.until, fadeIn: true, fadeOut: true }));
      }
    }
    const src = s.type === "screen" ? s.src : `footage/${s.id}.mp4`;
    if (!fs.existsSync(path.join(dir, src))) {
      manifest.placeholders.push(await render(`ph-${s.id}`, placeholderHTML(s, i, spec.shots.length), { shot: s.id }));
    }
  }
  if (spec.finePrint) manifest.finePrint = await render("fineprint", finePrintHTML(spec.finePrint));
  manifest.endcard = await render("endcard", endcardHTML(spec.endcard, spec.lang, spec.social));

  fs.writeFileSync(path.join(OUT, "manifest.json"), JSON.stringify(manifest, null, 2));
  await browser.close();
  console.log(`cards: ${manifest.captions.length} caption states, ${manifest.placeholders.length} placeholders, end card, fine print`);
})().catch((e) => { console.error(e); process.exit(1); });
