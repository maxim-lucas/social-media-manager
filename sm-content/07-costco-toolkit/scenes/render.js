// Costco toolkit pack — renderer. copy.js in, seven carousels x two languages out
// (PNG masters + the JPEG that actually ships: Instagram's carousel API takes JPEG only).
//
//   node sm-content/07-costco-toolkit/scenes/render.js            all posts
//   node sm-content/07-costco-toolkit/scenes/render.js toolkit    one post
//   node sm-content/07-costco-toolkit/scenes/render.js --svg      also dump each SVG
//
// Same surface, brand, colourways and headline face as 06-launch (see its
// render.js for why the headline is Roboto 700, and why EN is the dark house
// field while FR is the brand emerald: the two posts sit side by side on the grid).
// New here: the `tag` scene (a big price with its ending ringed), a cover that
// can run without store badges, and two-line fine print.

const fs = require("fs");
const path = require("path");
const sharp = require("sharp");

const { C, FADE, SANS, MONO } = require("./tokens");
const S = require("./surface");
const { POSTS, FINE } = require("./copy");

const W = 1080;
const H = 1350;
const M = 96;
const COL = W - 2 * M;

const HEAD = { family: SANS, weight: 700 };
const SUB = { family: SANS, weight: 400 };
const FINE_LEADING = 22 * 1.3;

const ROOT = path.join(__dirname, "..");
const OUT = path.join(ROOT, "posts");
const dumpSvg = process.argv.includes("--svg");

// ── Measurement (identical to 06-launch) ────────────────────────────────────
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

async function fitSize(lines, max, maxW, opts) {
  let size = max;
  for (;;) {
    const widths = await Promise.all(lines.map((l) => inkWidth(l, size, opts)));
    if (Math.max(...widths) <= maxW || size <= 40) return size;
    size -= 2;
  }
}

// ── Official store badges (06-launch's, unaltered) ──────────────────────────
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

// ── Colourways: one per language, exactly as 06-launch ──────────────────────
const THEMES = {
  en: { fieldTop: C.fieldTop, field: C.field, fieldDeep: C.fieldDeep, kicker: C.emerald, accent: C.emeraldGlow, mark: C.emerald, vignette: 1, subOp: 0.72, fineOp: 0.55 },
  fr: { fieldTop: "#12a374", field: C.emeraldDeep, fieldDeep: "#065f46", kicker: "#d1fae5", accent: "#a7f3d0", mark: C.inkOnField, vignette: 0.55, subOp: 0.92, fineOp: 0.82 },
};
let T = THEMES.en;

// ── Shared pieces ───────────────────────────────────────────────────────────
const kicker = (s, y = 150) => S.typed(s, "kicker", { x: M, y, fill: T.kicker, op: 1, bleed: false });

function hookLines(lines, size, y, { fill = C.inkOnField } = {}) {
  const lead = size * 1.02;
  return {
    svg: lines.map((l, i) => S.text(l, { x: M, y: y + i * lead, size, weight: HEAD.weight, family: HEAD.family, fill, op: 1, bleed: false, tracking: -1.5 })).join("\n"),
    bottom: y + (lines.length - 1) * lead,
  };
}

function subLines(lines, y, { size = 33, op = T.subOp } = {}) {
  return lines.map((l, i) => S.text(l, { x: M, y: y + i * size * 1.42, size, weight: 400, family: SANS, fill: C.inkOnField, op, bleed: false })).join("\n");
}

const lockup = () => S.lockup({ x: M, y: 1228, handle: "@priceback.ca" }).replace(`stroke="${C.emerald}"`, `stroke="${T.mark}"`);

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

/** Fine print is one or two lines; two lines lift the block so it clears the lockup. */
function fineGeometry(lines) {
  const y = 1178 - (lines.length - 1) * FINE_LEADING;
  return { y, stripBottom: y - 48 };
}
const finePrint = (lines, y) => S.finePrint(lines, { x: M, y, colW: COL, op: T.fineOp });

// ── Rows (shared by `rows` and `tag`) ───────────────────────────────────────
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
      if (i === 0) out.push(`<line x1="${x + w - bw - 12}" y1="${ry - 12}" x2="${x + w + 12}" y2="${ry - 12}" stroke="${C.emerald}" stroke-width="5"/>`);
    } else {
      out.push(S.row({ x, y: ry, w, label, value, size, op: FADE.print }));
    }
    if (i === highlight) {
      out.push(`<rect x="${x - 26}" y="${ry - 46}" width="${w + 52}" height="66" rx="33" fill="none" stroke="${C.emerald}" stroke-width="4.5" transform="rotate(-0.8 ${x + w / 2} ${ry - 13})"/>`);
    }
  });
  out.push(S.ghostRows({ x, y: top + 40 + s.rows.length * lead + 10, w, count: 2, leading: 30, seed: seed + 9 }));
  return out.join("\n");
}

function viewfinder({ x, y, w, h }) {
  const pad = 30;
  const bx = x - pad - 10;
  const by = y + 34;
  const bw = w + 2 * pad + 20;
  const bh = h - 70;
  const L = 64;
  const corner = (cx, cy, dx, dy) =>
    `<path d="M ${cx} ${cy + dy * L} L ${cx} ${cy} L ${cx + dx * L} ${cy}" fill="none" stroke="${C.emerald}" stroke-width="7" stroke-linecap="round" stroke-linejoin="round"/>`;
  const sy = y + h * 0.72;
  return [
    corner(bx, by, 1, 1), corner(bx + bw, by, -1, 1), corner(bx, by + bh, 1, -1), corner(bx + bw, by + bh, -1, -1),
    `<line x1="${bx + 24}" y1="${sy}" x2="${bx + bw - 24}" y2="${sy}" stroke="${C.emerald}" stroke-width="3" stroke-opacity="0.8"/>`,
  ].join("\n");
}

/** hook + sub + a paper strip whose contents the caller draws. */
async function stripScene(s, lang, seed, drawInside) {
  const fl = s.fine || FINE[lang];
  const g = fineGeometry(fl);
  const size = await fitSize(s.hook, 132, COL);
  const hook = hookLines(s.hook, size, 290);
  const subY = hook.bottom + 84;
  const stripY = subY + 120;
  const stripH = g.stripBottom - stripY;
  const st = S.strip({ x: 52, y: stripY, w: 976, h: stripH, angle: -1.3, seed: seed + 17 });
  const inner = await drawInside({ x: 128, y: stripY, w: 824, h: stripH });
  return {
    under: `${kicker(s.kicker)}\n${hook.svg}\n${subLines(s.sub, subY, { size: await fitSize(s.sub, 33, COL, SUB) })}\n${st.svg}\n<g transform="${st.transform}">${inner}</g>`,
    over: `${finePrint(fl, g.y)}\n${lockup()}`,
  };
}

// ── Scenes ──────────────────────────────────────────────────────────────────
async function cover(s, lang, seed) {
  const fl = s.fine || FINE[lang];
  const g = fineGeometry(fl);
  const size = await fitSize(s.hook, 150, COL);
  const hook = hookLines(s.hook, size, 300);
  const subY = hook.bottom + 92;
  const y0 = subY + 80;
  const h0 = s.badges ? 330 : g.stripBottom - y0;
  const st = S.strip({ x: 52, y: y0, w: 976, h: h0, angle: -1.6, seed: seed + 11 });
  const paperSize = await fitSize(s.paper, 46, 800, { family: MONO, weight: 500 });
  const lead = paperSize * 1.25;
  const base = y0 + h0 / 2 - 20; // centre the lines in the strip, whatever its height
  const paper = `<g transform="${st.transform}">
    ${S.ghostHeader({ x: 330, y: y0 + 44, w: 420, seed: seed + 2 })}
    ${s.badges ? "" : S.ghostRows({ x: 128, y: y0 + h0 - 120, w: 824, count: 2, leading: 30, seed: seed + 5 })}
    ${s.paper.map((l, i) => S.text(l, { x: 128, y: base + i * lead, size: paperSize, weight: 500, family: MONO })).join("\n")}
    ${S.text(s.swipe, { x: 128, y: base + s.paper.length * lead + 14, size: 27, weight: 500, family: MONO, tracking: 2, fill: C.emeraldDeep, op: 1 })}
  </g>`;
  const badges = s.badges ? await badgeRow(lang, { x: M, y: 1062 }) : { svg: "" };
  return {
    under: `${kicker(s.kicker)}\n${hook.svg}\n${subLines(s.sub, subY, { size: await fitSize(s.sub, 33, COL, SUB) })}\n${st.svg}\n${paper}`,
    over: `${badges.svg}\n${finePrint(fl, g.y)}\n${lockup()}`,
  };
}

async function rows(s, lang, seed) {
  return stripScene(s, lang, seed, async (box) => {
    const out = [await rowsBlock(s, seed, box, s.frame ? -1 : s.highlight ?? -1)];
    if (s.frame) out.push(viewfinder(box));
    return out.join("\n");
  });
}

// A big price with its ending ringed: the one emerald element.
async function tag(s, lang, seed) {
  return stripScene(s, lang, seed, async ({ x, y, w }) => {
    const out = [S.ghostHeader({ x: x + 200, y: y + 48, w: 420, seed: seed + 3 })];
    const size = 160;
    const adv = 0.6 * size;
    const len = s.price.length;
    const start = x + w / 2 - (len * adv) / 2;
    const base = y + 282;
    out.push(S.text(s.tagLabel, { x: x + w / 2, y: y + 140, size: 26, weight: 500, family: MONO, tracking: 3, anchor: "middle" }));
    out.push(S.text(s.price, { x: start, y: base, size, weight: 700, family: MONO, op: 0.92 }));
    if (s.ring > 0) {
      const rx = start + (len - s.ring) * adv - 6;
      out.push(`<rect x="${S.r2(rx)}" y="${S.r2(base - size * 0.8)}" width="${S.r2(s.ring * adv + 14)}" height="${S.r2(size * 1.02)}" rx="44" fill="none" stroke="${C.emerald}" stroke-width="7" transform="rotate(-1.2 ${S.r2(rx + (s.ring * adv) / 2)} ${S.r2(base - size * 0.3)})"/>`);
    }
    if (s.star) {
      const sx = start + len * adv + 4;
      out.push(S.text("*", { x: sx, y: base - size * 0.2, size: size * 0.9, weight: 700, family: MONO, op: 0.92 }));
      out.push(`<circle cx="${S.r2(sx + adv * 0.45)}" cy="${S.r2(base - size * 0.6)}" r="${S.r2(size * 0.38)}" fill="none" stroke="${C.emerald}" stroke-width="7"/>`);
    }
    out.push(S.text(s.means, { x: x + w / 2, y: y + 358, size: 26, weight: 500, family: MONO, tracking: 3, anchor: "middle" }));
    out.push(S.text(s.label, { x: x + w / 2, y: y + 412, size: 40, weight: 700, family: MONO, fill: C.emeraldDeep, op: 1, anchor: "middle" }));
    return out.join("\n");
  });
}

async function cta(s, lang, seed) {
  const fl = s.fine || FINE[lang];
  const size = await fitSize(s.hook, 124, COL);
  const hook = hookLines(s.hook, size, 280);
  const stripY = hook.bottom + 70;
  const stripH = 420;
  const st = S.strip({ x: 52, y: stripY, w: 976, h: stripH, angle: -1.2, seed: seed + 23 });
  const rws = [];
  const lead = 112;
  for (let i = 0; i < s.checks.length; i++) {
    const [main, note] = s.checks[i];
    const ry = stripY + 112 + i * lead;
    const bx = 128;
    rws.push(
      `<rect x="${bx}" y="${ry - 32}" width="38" height="38" rx="6" fill="none" stroke="${C.emeraldDeep}" stroke-width="3.5"/>`,
      S.text(main, { x: bx + 62, y: ry - 2, size: 31, weight: 500, family: MONO }),
      S.text(note, { x: bx + 62, y: ry + 34, size: 23, weight: 400, family: MONO, op: FADE.mid })
    );
  }
  const badges = await badgeRow(lang, { x: M, y: stripY + stripH + 44, h: 80 });
  const fine = S.finePrint(fl, { x: M, y: stripY + stripH + 44 + 80 + 52, colW: COL, op: T.fineOp });
  return {
    under: `${kicker(s.kicker)}\n${hook.svg}\n${st.svg}\n<g transform="${st.transform}">${rws.join("\n")}</g>`,
    over: `${badges.svg}\n${fine}\n${lockup()}`,
  };
}

const SCENES = { cover, rows, tag, cta };

async function build(s, lang, postIndex, n) {
  T = THEMES[lang];
  const seed = (lang === "en" ? 800 : 900) + postIndex * 100 + n * 7;
  return compose(await SCENES[s.scene](s, lang, seed), seed);
}

const dir = (id) => path.join(OUT, id);
const file = (id, lang, n, ext) => path.join(dir(id), `${id}-${lang}-${String(n).padStart(2, "0")}.${ext}`);

async function main() {
  const only = process.argv.slice(2).filter((a) => !a.startsWith("--"));
  for (const [pi, post] of POSTS.entries()) {
    if (only.length && !only.includes(post.id)) continue;
    fs.mkdirSync(dir(post.id), { recursive: true });
    for (const lang of ["en", "fr"]) {
      for (const [i, s] of post[lang].entries()) {
        const n = i + 1;
        const svg = await build(s, lang, pi, n);
        if (dumpSvg) fs.writeFileSync(file(post.id, lang, n, "svg"), svg);
        const img = sharp(Buffer.from(svg), { density: 72 });
        await img.clone().png({ compressionLevel: 9 }).toFile(file(post.id, lang, n, "png"));
        await img.clone().flatten({ background: C.field }).jpeg({ quality: 92, chromaSubsampling: "4:4:4", mozjpeg: true }).toFile(file(post.id, lang, n, "jpg"));
      }
      console.log(`  ${post.id} ${lang}: ${post[lang].length} slides`);
    }
  }
}

if (require.main === module) {
  main().catch((e) => {
    console.error(e);
    process.exit(1);
  });
}

module.exports = { build, POSTS, W, H, M, COL, inkWidth, fitSize, THEMES, HEAD, SUB, file, OUT };
