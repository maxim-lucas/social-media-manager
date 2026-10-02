// Launch pack — renderer. strings.json in, two 5-slide carousels out (EN, FR) (PNG + the JPEG that
// actually ships: Instagram's carousel API takes JPEG only).
//
//   node sm-content/06-launch/scenes/render.js
//   node sm-content/06-launch/scenes/render.js --svg     also dump each SVG
//
// Same voice as evergreen/ and 04-community/: a paper strip on the deep green
// field, mono kicker, heavy headline, one emerald element per frame.
//
// ── The one deviation from the other packs: the headline face ───────────────
// The other packs set headlines in "Roboto Black". On the machine this was built
// on, fontconfig does not resolve that family by ANY name — it renders exactly
// the pixels of a family that does not exist (measured 2026-10-02: same ink
// count as "NoSuchFontXYZ"). So headlines here are Roboto at weight 700, which
// does resolve, rather than a silent fallback face. verify.js gate 3 measures it.

const fs = require("fs");
const path = require("path");
const sharp = require("sharp");

const { C, FADE, SANS, MONO, TYPE } = require("./tokens");
const S = require("./surface");

const W = 1080;
const H = 1350;
const M = 96; // GRID.margin
const COL = W - 2 * M;

const HEAD = { family: SANS, weight: 700 };
const SUB = { family: SANS, weight: 400 };

const ROOT = path.join(__dirname, "..");
const OUT = path.join(ROOT, "posts");
const STRINGS = JSON.parse(fs.readFileSync(path.join(__dirname, "strings.json"), "utf8"));
const dumpSvg = process.argv.includes("--svg");

// ── Measurement ─────────────────────────────────────────────────────────────
// librsvg has no text metrics we can query, so we render the line alone and
// measure its ink. Used to fit each headline to the column instead of guessing
// an advance width per language.
const measureCache = new Map();
async function inkWidth(s, size, { family = HEAD.family, weight = HEAD.weight, tracking = 0 } = {}) {
  const key = `${s}|${size}|${family}|${weight}|${tracking}`;
  if (measureCache.has(key)) return measureCache.get(key);
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="3000" height="${Math.ceil(size * 1.6)}">
    <text x="10" y="${size * 1.2}" font-family="${family}" font-weight="${weight}" font-size="${size}"${
    tracking ? ` letter-spacing="${tracking}"` : ""
  }>${S.esc(s)}</text></svg>`;
  const { data, info } = await sharp(Buffer.from(svg), { density: 72 }).raw().toBuffer({ resolveWithObject: true });
  let min = info.width;
  let max = -1;
  for (let y = 0; y < info.height; y++) {
    for (let x = 0; x < info.width; x++) {
      if (data[(y * info.width + x) * info.channels + 3] > 40) {
        if (x < min) min = x;
        if (x > max) max = x;
      }
    }
  }
  const w = max < 0 ? 0 : max - min + 1;
  measureCache.set(key, w);
  return w;
}

/** Largest size <= max at which every line fits `maxW`. */
async function fitSize(lines, max, maxW, opts) {
  let size = max;
  for (;;) {
    const widths = await Promise.all(lines.map((l) => inkWidth(l, size, opts)));
    if (Math.max(...widths) <= maxW || size <= 40) return size;
    size -= 2;
  }
}

// ── Official store badges ───────────────────────────────────────────────────
// Apple's and Google's own artwork, unaltered, embedded as data URIs. Google's
// PNG ships with a transparent safety margin; it is trimmed so both badges can
// be set to the same visible height.
const badgeCache = {};
async function badge(file) {
  if (badgeCache[file]) return badgeCache[file];
  const p = path.join(ROOT, "badges", file);
  let out;
  if (file.endsWith(".svg")) {
    const svg = fs.readFileSync(p, "utf8");
    const vb = svg.match(/viewBox="([\d.\s-]+)"/)[1].split(/\s+/).map(Number);
    out = { uri: `data:image/svg+xml;base64,${Buffer.from(svg).toString("base64")}`, ratio: vb[2] / vb[3] };
  } else {
    const { data, info } = await sharp(p).trim({ threshold: 1 }).png().toBuffer({ resolveWithObject: true });
    out = { uri: `data:image/png;base64,${data.toString("base64")}`, ratio: info.width / info.height };
  }
  badgeCache[file] = out;
  return out;
}

// Apple does not publish a French-Canadian badge we could reach from the build
// machine (tools.applemarketingtools.com does not resolve there). Drop
// app-store-fr.svg into badges/ and re-render: it is picked up automatically.
async function badgeRow(lang, { x, y, h = 84, gap = 26 }) {
  const appleFile = lang === "fr" && fs.existsSync(path.join(ROOT, "badges", "app-store-fr.svg")) ? "app-store-fr.svg" : "app-store-en.svg";
  const apple = await badge(appleFile);
  const google = await badge(`google-play-${lang}.png`);
  const aw = h * apple.ratio;
  const gw = h * google.ratio;
  return {
    svg: `<image x="${S.r2(x)}" y="${S.r2(y)}" width="${S.r2(aw)}" height="${h}" href="${apple.uri}"/>
  <image x="${S.r2(x + aw + gap)}" y="${S.r2(y)}" width="${S.r2(gw)}" height="${h}" href="${google.uri}"/>`,
    width: aw + gap + gw,
  };
}

// ── One colourway per language ──────────────────────────────────────────────
// English and French go out as two SEPARATE posts at the same time, so they sit
// side by side on the profile grid. Two near-identical dark tiles there read as
// a duplicate upload; giving each language its own ground makes them read as a
// pair. Both grounds are brand colours (palette.js) — only the FIELD changes;
// the paper strip, the badges and the type ramp are identical.
//
//   en  the house field: near-black ink green, emerald accents
//   fr  the brand emerald itself as the field, mint accents, a white mark
const THEMES = {
  en: { fieldTop: C.fieldTop, field: C.field, fieldDeep: C.fieldDeep, kicker: C.emerald, accent: C.emeraldGlow, mark: C.emerald, vignette: 1, subOp: 0.72, fineOp: 0.55 },
  fr: { fieldTop: "#12a374", field: C.emeraldDeep, fieldDeep: "#065f46", kicker: "#d1fae5", accent: "#a7f3d0", mark: C.inkOnField, vignette: 0.55, subOp: 0.92, fineOp: 0.82 },
};
let T = THEMES.en;

// ── Pieces every slide shares ───────────────────────────────────────────────
const kicker = (s, y = 150) => S.typed(s, "kicker", { x: M, y, fill: T.kicker, op: 1, bleed: false });

function hookLines(lines, size, y, { fill = C.inkOnField } = {}) {
  const lead = size * 1.02;
  return {
    svg: lines
      .map((l, i) => S.text(l, { x: M, y: y + i * lead, size, weight: HEAD.weight, family: HEAD.family, fill, op: 1, bleed: false, tracking: -1.5 }))
      .join("\n"),
    bottom: y + (lines.length - 1) * lead,
  };
}

function subLines(lines, y, { size = 33, op = T.subOp } = {}) {
  return lines
    .map((l, i) => S.text(l, { x: M, y: y + i * size * 1.42, size, weight: 400, family: SANS, fill: C.inkOnField, op, bleed: false }))
    .join("\n");
}

const lockup = () =>
  S.lockup({ x: M, y: 1228, handle: "@priceback.ca" }).replace(`stroke="${C.emerald}"`, `stroke="${T.mark}"`);

// The vignette darkens the corners; anything that must stay legible (badges,
// fine print, the lockup) is drawn AFTER it, so scenes return { under, over }.
function compose({ under, over }, seed) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
${S.defs(seed)
  .replace(`stop-color="${C.fieldTop}"`, `stop-color="${T.fieldTop}"`)
  .replace(`stop-color="${C.field}"`, `stop-color="${T.field}"`)
  .replace(`stop-color="${C.fieldDeep}"`, `stop-color="${T.fieldDeep}"`)}
${S.field(W, H)}
${under}
${S.vignette(W, H).replace("/>", ` opacity="${T.vignette}"/>`)}
${over}
</svg>`;
}

// ── Scenes ──────────────────────────────────────────────────────────────────
async function cover(s, lang, seed) {
  const size = await fitSize(s.hook, 150, COL);
  const hook = hookLines(s.hook, size, 300);
  const subY = hook.bottom + 92;

  const st = S.strip({ x: 52, y: subY + 80, w: 976, h: 330, angle: -1.6, seed: seed + 11 });
  const paperSize = await fitSize(s.paper, 46, 800, { family: MONO, weight: 500 });
  const paper = `<g transform="${st.transform}">
    ${S.ghostHeader({ x: 330, y: subY + 124, w: 420, seed: seed + 2 })}
    ${s.paper.map((l, i) => S.text(l, { x: 128, y: subY + 228 + i * paperSize * 1.25, size: paperSize, weight: 500, family: MONO })).join("\n")}
    ${S.text(s.swipe, { x: 128, y: subY + 228 + s.paper.length * paperSize * 1.25 + 14, size: 27, weight: 500, family: MONO, tracking: 2, fill: C.emeraldDeep, op: 1 })}
  </g>`;

  const badges = await badgeRow(lang, { x: M, y: 1062 });
  return {
    under: `${kicker(s.kicker)}\n${hook.svg}\n${subLines(s.sub, subY, { size: await fitSize(s.sub, 33, COL, SUB) })}\n${st.svg}\n${paper}`,
    over: `${badges.svg}\n${lockup()}`,
  };
}

async function receiptScene(s, lang, seed, drawRows) {
  const size = await fitSize(s.hook, 132, COL);
  const hook = hookLines(s.hook, size, 290);
  let y = hook.bottom;
  let accent = "";
  if (s.accent) {
    const aSize = await fitSize([s.accent], 64, COL);
    y += aSize * 1.25 + 8;
    accent = S.text(s.accent, { x: M, y, size: aSize, weight: HEAD.weight, family: HEAD.family, fill: T.accent, op: 1, bleed: false, tracking: -1 });
  }
  const subY = y + 84;
  const stripY = subY + 120;
  const stripH = 1130 - stripY;
  const st = S.strip({ x: 52, y: stripY, w: 976, h: stripH, angle: -1.3, seed: seed + 17 });
  const inner = await drawRows({ x: 128, y: stripY, w: 824, h: stripH });
  const fine = s.fine ? S.finePrint(s.fine, { x: M, y: 1178, colW: COL, op: T.fineOp }) : "";
  return {
    under: `${kicker(s.kicker)}\n${hook.svg}\n${accent}\n${subLines(s.sub, subY, { size: await fitSize(s.sub, 33, COL, SUB) })}\n${st.svg}\n<g transform="${st.transform}">${inner}</g>`,
    over: `${fine}\n${lockup()}`,
  };
}

async function rowsBlock(s, seed, { x, y, w, h }, highlight) {
  const size = 30;
  const top = y + 92;
  const lead = Math.min(78, (h - 150) / s.rows.length);
  const out = [S.ghostHeader({ x: x + 200, y: y + 48, w: 420, seed: seed + 3 })];
  s.rows.forEach(([label, value], i) => {
    const ry = top + 40 + i * lead;
    if (value === "") {
      out.push(S.text(label, { x, y: ry, size, family: MONO }));
      const bw = i === 0 ? 150 : 104;
      out.push(S.redact({ x: x + w - bw, y: ry, w: bw, seed: seed + i }));
      if (i === 0) {
        // The price you paid, struck through.
        out.push(`<line x1="${x + w - bw - 12}" y1="${ry - 12}" x2="${x + w + 12}" y2="${ry - 12}" stroke="${C.emerald}" stroke-width="5"/>`);
      }
    } else {
      out.push(S.row({ x, y: ry, w, label, value, size, op: FADE.print }));
    }
    if (i === highlight) {
      // A marker ring round the row that matters: the one emerald element.
      out.push(
        `<rect x="${x - 26}" y="${ry - 46}" width="${w + 52}" height="66" rx="33" fill="none" stroke="${C.emerald}" stroke-width="4.5" transform="rotate(-0.8 ${x + w / 2} ${ry - 13})"/>`
      );
    }
  });
  out.push(S.ghostRows({ x, y: top + 40 + s.rows.length * lead + 10, w, count: 2, leading: 30, seed: seed + 9 }));
  return out.join("\n");
}

async function free(s, lang, seed) {
  return receiptScene(s, lang, seed, (box) => rowsBlock(s, seed, box, 1));
}

async function claim(s, lang, seed) {
  return receiptScene(s, lang, seed, (box) => rowsBlock(s, seed, box, 2));
}

async function scan(s, lang, seed) {
  return receiptScene(s, lang, seed, async ({ x, y, w, h }) => {
    const out = [await rowsBlock(s, seed, { x, y, w, h }, -1)];
    // Viewfinder corners: the one emerald element.
    const pad = 30;
    const bx = x - pad - 10;
    const by = y + 34;
    const bw = w + 2 * pad + 20;
    const bh = h - 70;
    const L = 64;
    const corner = (cx, cy, dx, dy) =>
      `<path d="M ${cx} ${cy + dy * L} L ${cx} ${cy} L ${cx + dx * L} ${cy}" fill="none" stroke="${C.emerald}" stroke-width="7" stroke-linecap="round" stroke-linejoin="round"/>`;
    out.push(corner(bx, by, 1, 1), corner(bx + bw, by, -1, 1), corner(bx, by + bh, 1, -1), corner(bx + bw, by + bh, -1, -1));
    const sy = y + h * 0.72;
    out.push(`<line x1="${bx + 24}" y1="${sy}" x2="${bx + bw - 24}" y2="${sy}" stroke="${C.emerald}" stroke-width="3" stroke-opacity="0.8"/>`);
    return out.join("\n");
  });
}

async function cta(s, lang, seed) {
  const size = await fitSize(s.hook, 124, COL);
  const hook = hookLines(s.hook, size, 280);
  const stripY = hook.bottom + 70;
  const stripH = 420;
  const st = S.strip({ x: 52, y: stripY, w: 976, h: stripH, angle: -1.2, seed: seed + 23 });
  const rows = [];
  const lead = 112;
  for (let i = 0; i < s.checks.length; i++) {
    const [main, note] = s.checks[i];
    const ry = stripY + 112 + i * lead;
    const bx = 128;
    rows.push(
      `<rect x="${bx}" y="${ry - 32}" width="38" height="38" rx="6" fill="none" stroke="${C.emeraldDeep}" stroke-width="3.5"/>`,
      S.text(main, { x: bx + 62, y: ry - 2, size: 31, weight: 500, family: MONO }),
      S.text(note, { x: bx + 62, y: ry + 34, size: 23, weight: 400, family: MONO, op: FADE.mid })
    );
  }
  const badges = await badgeRow(lang, { x: M, y: stripY + stripH + 44, h: 80 });
  const fine = S.finePrint(s.fine, { x: M, y: stripY + stripH + 44 + 80 + 52, colW: COL, op: T.fineOp });
  return {
    under: `${kicker(s.kicker)}\n${hook.svg}\n${st.svg}\n<g transform="${st.transform}">${rows.join("\n")}</g>`,
    over: `${badges.svg}\n${fine}\n${lockup()}`,
  };
}

const SCENES = { cover, free, scan, claim, cta };

async function build(s, lang) {
  T = THEMES[lang];
  const seed = (lang === "en" ? 600 : 700) + s.n * 7;
  const parts = await SCENES[s.scene](s, lang, seed);
  return compose(parts, seed);
}

const file = (lang, n, ext) => path.join(OUT, `priceback-launch-${lang}-${String(n).padStart(2, "0")}.${ext}`);

async function main() {
  fs.mkdirSync(OUT, { recursive: true });
  for (const lang of ["en", "fr"]) {
    for (const s of STRINGS[lang]) {
      const svg = await build(s, lang);
      if (dumpSvg) fs.writeFileSync(file(lang, s.n, "svg"), svg);
      const img = sharp(Buffer.from(svg), { density: 72 });
      await img.clone().png({ compressionLevel: 9 }).toFile(file(lang, s.n, "png"));
      await img
        .clone()
        .flatten({ background: C.field })
        .jpeg({ quality: 92, chromaSubsampling: "4:4:4", mozjpeg: true })
        .toFile(file(lang, s.n, "jpg"));
      console.log(`  ${path.relative(ROOT, file(lang, s.n, "png"))}  (${lang}, ${s.scene})`);
    }
  }
}

if (require.main === module) {
  main().catch((e) => {
    console.error(e);
    process.exit(1);
  });
}

module.exports = { build, STRINGS, W, H, M, COL, inkWidth, fitSize, THEMES, HEAD, SUB };
