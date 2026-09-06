// Teaser pack — the gates. Run after any change, before anything is posted:
//
//   node sm-content/teaser/scenes/verify.js
//
// Exit code is the result: 0 clean, 1 if any gate failed. Every check is
// mechanical. None of them asks a human to look at something and decide.

const fs = require("fs");
const path = require("path");
const sharp = require("sharp");

const { CANVAS, SAFE, STICKER_BAND, MONO } = require("./tokens");
const paper = require("./paper");
const { buildPost } = require("./posts");
const { buildStory } = require("./stories");

const ROOT = path.join(__dirname, "..");
const STRINGS = JSON.parse(fs.readFileSync(path.join(__dirname, "strings.json"), "utf8"));
const LANGS = Object.keys(STRINGS).filter((k) => !k.startsWith("_") && typeof STRINGS[k] === "object");

const failures = [];
const notes = [];
const fail = (gate, msg) => failures.push(`${gate}: ${msg}`);

// ── Gate 1 · every declared asset exists at exactly its canvas size ──────────
async function gateDimensions() {
  for (const lang of LANGS) {
    for (const [kind, singular, dir, canvas] of [
      ["posts", "post", "posts", CANVAS.post],
      ["stories", "story", "stories", CANVAS.story],
    ]) {
      for (const t of STRINGS[lang][kind]) {
        const name = `priceback-teaser-${singular}-${lang}-${t.id}.png`;
        const p = path.join(ROOT, dir, name);
        if (!fs.existsSync(p)) {
          fail("dimensions", `${name} is missing — re-run render.js`);
          continue;
        }
        const m = await sharp(p).metadata();
        if (m.width !== canvas.w || m.height !== canvas.h) {
          fail("dimensions", `${name} is ${m.width}x${m.height}, expected ${canvas.w}x${canvas.h}`);
        }
      }
    }
  }
}

// ── Gate 2 · nothing readable under Instagram's chrome ───────────────────────
// Renders each scene in content-only mode (no paper, no torn edges) and treats
// any non-transparent pixel as content. A story's header, caption bar and
// action rail sit on top of the image; anything under them is lost.
async function gateSafeZones() {
  for (const lang of LANGS) {
    const jobs = [
      ...STRINGS[lang].posts.map((t, i) => ["post", t, i, CANVAS.post, SAFE.post]),
      ...STRINGS[lang].stories.map((t, i) => ["story", t, i, CANVAS.story, SAFE.story]),
    ];

    for (const [kind, t, i, canvas, safe] of jobs) {
      paper.setMode("content");
      const svg = kind === "post" ? buildPost(i, t, STRINGS.date) : buildStory(i, t, STRINGS.date);
      paper.setMode("full");

      const { data, info } = await sharp(Buffer.from(svg), { density: 72 })
        .ensureAlpha()
        .raw()
        .toBuffer({ resolveWithObject: true });

      const label = `${kind}-${lang}-${t.id}`;
      const bands = {
        top: { x0: 0, y0: 0, x1: info.width, y1: safe.top },
        bottom: { x0: 0, y0: canvas.h - safe.bottom, x1: info.width, y1: info.height },
        left: { x0: 0, y0: 0, x1: safe.left, y1: info.height },
        right: { x0: canvas.w - safe.right, y0: 0, x1: info.width, y1: info.height },
      };

      for (const [side, b] of Object.entries(bands)) {
        let hits = 0;
        let firstY = -1;
        for (let y = b.y0; y < b.y1; y++) {
          for (let x = b.x0; x < b.x1; x++) {
            // Ignore all-but-invisible antialiasing spill from the ink-bleed
            // blur; only real marks count.
            if (data[(y * info.width + x) * info.channels + 3] > 24) {
              hits++;
              if (firstY < 0) firstY = y;
            }
          }
        }
        if (hits > 200) {
          fail("safe-zones", `${label}: ${hits} content px in the ${side} band (from y=${firstY})`);
        }
      }

      // Stories that call for a sticker must actually leave room for one.
      if (kind === "story" && t.sticker && t.sticker !== "none") {
        let hits = 0;
        for (let y = STICKER_BAND.y; y < STICKER_BAND.y + STICKER_BAND.h; y++) {
          for (let x = 0; x < info.width; x++) {
            if (data[(y * info.width + x) * info.channels + 3] > 24) hits++;
          }
        }
        if (hits > 200) {
          fail(
            "sticker-band",
            `${label} declares a ${t.sticker} sticker but ${hits} content px sit in the band (y ${STICKER_BAND.y}-${
              STICKER_BAND.y + STICKER_BAND.h
            })`
          );
        }
      }
    }
  }
}

// ── Gate 3 · the font actually resolved ─────────────────────────────────────
// librsvg silently substitutes a font it cannot find, so a machine without
// Roboto Mono renders a whole pack in something else and nothing errors. This
// measures a probe string: in a monospace face 10 characters occupy exactly
// 10 * 0.6em. A proportional substitute misses that by a wide margin.
async function gateFont() {
  const size = 100;
  const probe = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="200">
    <text x="0" y="150" font-family="${MONO}" font-size="${size}" fill="#000">0000000000</text></svg>`;
  const { data, info } = await sharp(Buffer.from(probe), { density: 72 })
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  let minX = info.width;
  let maxX = -1;
  for (let y = 0; y < info.height; y++) {
    for (let x = 0; x < info.width; x++) {
      if (data[(y * info.width + x) * info.channels + 3] > 40) {
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
      }
    }
  }
  if (maxX < 0) {
    fail("font", `nothing rendered for the "${MONO}" probe — no usable font at all`);
    return;
  }
  const measured = maxX - minX + 1;
  const expected = 10 * 0.6 * size; // 600px
  const drift = Math.abs(measured - expected) / expected;
  // A monospace 0 does not fill its cell, so the inked span is a little under
  // the advance; 12% covers that without admitting a proportional face.
  if (drift > 0.12) {
    fail(
      "font",
      `"${MONO}" did not resolve — probe inked ${measured}px where ${expected}px was expected ` +
        `(${(drift * 100).toFixed(0)}% off). Install Roboto Mono and re-render.`
    );
  } else {
    notes.push(`font "${MONO}" resolved (probe ${measured}px vs ${expected}px expected)`);
  }
}

// ── Gate 4 · EN/FR parity ───────────────────────────────────────────────────
// The house rule is that a feature is not deliverable until every supported
// language has every string it needs. Same rule, applied to a content pack.
function gateParity() {
  if (LANGS.length < 2) {
    fail("parity", `only ${LANGS.length} language block(s) in strings.json`);
    return;
  }
  const [base, ...rest] = LANGS;
  for (const lang of rest) {
    for (const kind of ["posts", "stories"]) {
      const a = STRINGS[base][kind] || [];
      const b = STRINGS[lang][kind] || [];
      if (a.length !== b.length) {
        fail("parity", `${kind}: ${base} has ${a.length}, ${lang} has ${b.length}`);
        continue;
      }
      a.forEach((ta, i) => {
        const tb = b[i];
        if (ta.id !== tb.id) fail("parity", `${kind}[${i}]: id ${base}=${ta.id} ${lang}=${tb.id}`);
        for (const key of Object.keys(ta)) {
          if (!(key in tb)) fail("parity", `${kind} ${ta.id}: "${key}" present in ${base}, missing in ${lang}`);
        }
        // A sticker that exists in one language and not the other means one
        // pack leaves a hole in the art and the other fills it.
        if (ta.sticker !== tb.sticker) {
          fail("parity", `${kind} ${ta.id}: sticker ${base}=${ta.sticker} ${lang}=${tb.sticker}`);
        }
        if (Array.isArray(ta.rows) && ta.rows.length !== (tb.rows || []).length) {
          fail("parity", `${kind} ${ta.id}: ${ta.rows.length} rows in ${base}, ${(tb.rows || []).length} in ${lang}`);
        }
      });
    }
  }
}

// ── Gate 5 · strings are real, and make no claim ────────────────────────────
// Marketing-Plan/01-strategy-overview.md and the app repo's
// legal/MARKETING_CLAIMS.md forbid a promised amount or a guaranteed refund in
// marketing copy. A teaser cannot carry the paired fine print, so it must make
// no claim at all. Retailer names are barred too: naming one drags in the
// non-affiliation disclaimer this pack has no room for.
const BANNED = [
  [/\$\s?\d/, "a dollar figure"],
  [/\b\d+\s?%/, "a percentage"],
  [/\bguarantee|\bgaranti/i, "a guarantee"],
  [/\bcostco|\bwalmart|\bbest\s?buy|\bamazon|\bcanadian tire/i, "a retailer name"],
  [/\brefund\b|\bremboursement\b/i, "the word refund"],
  [/\bfree\b|\bgratuit\b/i, "a price claim"],
];

function walkStrings(node, at, visit) {
  if (typeof node === "string") return visit(node, at);
  if (Array.isArray(node)) return node.forEach((v, i) => walkStrings(v, `${at}[${i}]`, visit));
  if (node && typeof node === "object") {
    for (const [k, v] of Object.entries(node)) walkStrings(v, at ? `${at}.${k}` : k, visit);
  }
}

function gateCopy() {
  let checked = 0;
  for (const lang of LANGS) {
    walkStrings(STRINGS[lang], lang, (s, at) => {
      checked++;
      if (!s.trim()) fail("copy", `${at} is empty`);
      if (/undefined|null|NaN/.test(s)) fail("copy", `${at} contains a placeholder value: "${s}"`);
      // stickerNote and alt are operator/accessibility text, not published copy.
      if (/\.(stickerNote|alt)$/.test(at)) return;
      for (const [re, what] of BANNED) {
        if (re.test(s)) fail("copy", `${at} carries ${what}: "${s}"`);
      }
    });
  }
  notes.push(`${checked} strings audited across ${LANGS.join(" + ")}`);
}

// ── Gate 6 · the wordmark stays withheld ────────────────────────────────────
// The whole series works only if the name is not on it. One accidental
// "PriceBack" in a caption line would spend the reveal early.
function gateNoWordmark() {
  for (const lang of LANGS) {
    walkStrings(STRINGS[lang], lang, (s, at) => {
      if (/\.alt$/.test(at)) return; // alt text describes the art for screen readers
      if (/priceback/i.test(s)) fail("no-wordmark", `${at} names the brand: "${s}"`);
    });
  }
}

async function main() {
  await gateDimensions();
  await gateSafeZones();
  await gateFont();
  gateParity();
  gateCopy();
  gateNoWordmark();

  notes.forEach((n) => console.log(`  · ${n}`));
  if (failures.length) {
    console.error(`\n${failures.length} failure(s):\n`);
    failures.forEach((f) => console.error(`  ✗ ${f}`));
    process.exit(1);
  }
  console.log("\nAll gates pass.");
}

main().catch((e) => {
  console.error(`verify crashed: ${e.stack}`);
  process.exit(1);
});
