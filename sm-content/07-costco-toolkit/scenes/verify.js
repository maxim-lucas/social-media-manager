// Costco toolkit pack — the gates. Run after every render; nothing ships red.
//
//   node sm-content/07-costco-toolkit/scenes/verify.js
//
//  1  files       every slide has a PNG master + a JPEG, 1080x1350 (4:5), JPEG under 8 MB
//  2  parity      EN and FR carry the same scenes in the same order, every slide has alt text
//  3  face        the headline face actually resolved (not librsvg's silent fallback)
//  4  fit         kickers, hooks, subs, rows, checks, tag labels and fine print fit their column
//  5  claims      banned promises; a named retailer or a price code carries its disclaimer on the SAME frame
//  6  facts       credit figures stated on art/captions are the one true figure (a scan or a tag = 1 credit)
//  7  french      Quebec spacing (no space before ? ! :), same slide count as English
//  8  captions    IG and FB captions: bans, length, hashtags, links, disclaimers, one language each
//  9  colourway   EN and FR grounds are visibly different (the two posts sit side by side on the grid)
//  10 holds       posts waiting on an app release are named (a warning, not a failure)

const fs = require("fs");
const sharp = require("sharp");
const R = require("./render");
const { captions, CODE_FINE, FINE } = require("./copy");

const { POSTS } = R;
const fails = [];
const ok = (gate, msg) => console.log(`  ✓ ${gate}  ${msg}`);
const bad = (gate, msg) => fails.push(`${gate}  ${msg}`);
const LANGS = ["en", "fr"];

const BANNED = [
  [/\$\s?\d|\d\s?\$/, "a currency figure"],
  [/limited[- ]time|for a limited|durée limitée|temps limité|offre limitée/i, "false urgency"],
  [/free (month|trial)|mois gratuit|essai gratuit/i, "a free-period claim (App Store 3.1.2(c))"],
  [/gmail/i, "Gmail sync is not live"],
  [/guarantee|garanti/i, "a guarantee"],
  [/successful claims only|réclamations réussies/i, "wrong: the drop share is charged at detection"],
  [/\bpartner|\bpartenaire/i, "implies a retailer partnership"],
  [/\bget (your|the) (money|refund|difference) back\b|récupérez (votre argent|le remboursement)/i, "promises the refund (say claim/ask, never get)"],
  [/\bofficial(ly)?\b|\bofficiel/i, "implies Costco endorses the price codes"],
  [/\b75\b/, "a welcome-credit figure (not part of this pack)"],
];
const NON_AFFIL = /(not affiliated|n’est affiliée|n'est affiliée|non affiliée)/i;
const CODE_RE = /\.97|\.00|\.88|\.X9|,97|,00|,88|,X9|\bstar\b|étoile/i;

const slides = [];
for (const post of POSTS) for (const lang of LANGS) post[lang].forEach((s, i) => slides.push({ post, lang, s, n: i + 1 }));

const fineOf = (lang, s) => s.fine || FINE[lang];
const allText = (s) =>
  [s.kicker, s.swipe, s.alt, s.tagLabel, s.price, s.means, s.label, ...(s.hook || []), ...(s.sub || []), ...(s.paper || []), ...(s.fine || []), ...(s.rows || []).flat(), ...(s.checks || []).flat()]
    .filter(Boolean)
    .join(" | ");

async function main() {
  // 1 files
  for (const { post, lang, n } of slides) {
    for (const ext of ["png", "jpg"]) {
      const f = R.file(post.id, lang, n, ext);
      if (!fs.existsSync(f)) { bad("1 files", `${f} missing`); continue; }
      const m = await sharp(f).metadata();
      if (m.width !== 1080 || m.height !== 1350) bad("1 files", `${post.id} ${lang} ${n} is ${m.width}x${m.height}`);
      if (ext === "jpg" && (m.format !== "jpeg" || fs.statSync(f).size > 8 * 1024 * 1024)) bad("1 files", `${post.id} ${lang} ${n} not a JPEG under 8 MB`);
    }
  }
  ok("1 files", `${slides.length} slides x PNG + JPEG checked`);

  // 2 parity
  for (const post of POSTS) {
    const sig = (lang) => post[lang].map((s) => s.scene).join(",");
    if (sig("en") !== sig("fr")) bad("2 parity", `${post.id}: EN ${sig("en")} ≠ FR ${sig("fr")}`);
    if (post.en.length > 10) bad("2 parity", `${post.id}: the Graph API takes at most 10 carousel items`);
    if (post.en.length < 2) bad("2 parity", `${post.id}: a carousel needs 2+ slides`);
  }
  for (const { post, lang, s, n } of slides) if (!s.alt || s.alt.length < 40) bad("2 parity", `${post.id} ${lang} ${n} has no alt text`);
  ok("2 parity", `${POSTS.length} posts, same scenes in both languages, alt text everywhere`);

  // 3 face
  const real = await R.inkWidth("READ THE PRICE ENDING", 100, R.HEAD);
  const fake = await R.inkWidth("READ THE PRICE ENDING", 100, { family: "NoSuchFontXYZ", weight: R.HEAD.weight });
  if (real === fake) bad("3 face", "headline face renders identically to a nonexistent family");
  else ok("3 face", `Roboto ${R.HEAD.weight} resolved (${real}px vs fallback ${fake}px)`);

  // 4 fit
  const MONO = "Roboto Mono";
  for (const { post, lang, s, n } of slides) {
    const id = `${post.id} ${lang} ${n}`;
    if ((await R.inkWidth(s.kicker, 24, { family: MONO, weight: 500, tracking: 7 })) > R.COL) bad("4 fit", `${id} kicker too wide: "${s.kicker}"`);
    const hookMax = s.scene === "cover" ? 150 : s.scene === "cta" ? 124 : 132;
    const hs = await R.fitSize(s.hook, hookMax, R.COL);
    if (hs < 70) bad("4 fit", `${id} hook shrank to ${hs}px: ${s.hook.join(" ")}`);
    if (s.sub) {
      const ss = await R.fitSize(s.sub, 33, R.COL, R.SUB);
      if (ss < 28) bad("4 fit", `${id} sub shrank to ${ss}px (rewrite shorter)`);
    }
    for (const l of fineOf(lang, s)) if ((await R.inkWidth(l, 22, R.SUB)) > R.COL) bad("4 fit", `${id} fine print overflows: "${l}"`);
    for (const [label, value] of s.rows || []) {
      if ((label.length + value.length) * 0.6 * 30 + 60 > 824) bad("4 fit", `${id} row too long: "${label}" / "${value}"`);
    }
    for (const [main, note] of s.checks || []) {
      if (main.length * 0.6 * 31 > 762) bad("4 fit", `${id} check too long: "${main}"`);
      if (note.length * 0.6 * 23 > 762) bad("4 fit", `${id} check note too long: "${note}"`);
    }
    for (const l of s.paper || []) {
      const ps = await R.fitSize(s.paper, 46, 800, { family: MONO, weight: 500 });
      if (ps < 34) bad("4 fit", `${id} paper line shrank to ${ps}px: "${l}"`);
    }
    if (s.scene === "tag") {
      if (s.label.length * 0.6 * 40 > 780) bad("4 fit", `${id} tag label too wide: "${s.label}"`);
      if (s.tagLabel.length * (0.6 * 26 + 3) > 780) bad("4 fit", `${id} tag caption too wide`);
      if (s.ring > s.price.length) bad("4 fit", `${id} ring longer than the price`);
    }
  }
  ok("4 fit", "every typed line inside its column at the size it is drawn");

  // 5 claims
  for (const { post, lang, s, n } of slides) {
    const id = `${post.id} ${lang} ${n}`;
    const t = allText(s);
    for (const [re, why] of BANNED) if (re.test(t)) bad("5 claims", `${id}: ${why} — "${t.match(re)[0]}"`);
    const fine = fineOf(lang, s).join(" ");
    if (/costco/i.test(t) && !NON_AFFIL.test(fine)) bad("5 claims", `${id} names Costco without the non-affiliation line`);
    if (CODE_RE.test(t.replace(s.alt || "", "")) && !fine.includes(CODE_FINE[lang]) && s.scene !== "rows") bad("5 claims", `${id} shows a price code without the "rule of thumb" line`);
    if (s.scene === "rows" && CODE_RE.test((s.rows || []).flat().join(" ") + " " + (s.sub || []).join(" ")) && !fine.includes(CODE_FINE[lang])) bad("5 claims", `${id} shows a price code without the "rule of thumb" line`);
    if (/costco/i.test(t) && /adjust|ajustement/i.test(t) && /(warehouse|entrepôt)/i.test(t) && !/(in person|en personne)/i.test(t)) bad("5 claims", `${id} implies warehouse adjustments can be done remotely`);
  }
  ok("5 claims", `${BANNED.length} banned patterns on all art; retailer ⇒ non-affiliation, price code ⇒ rule-of-thumb line`);

  // 6 facts
  const creditRe = /\b(\d+)\s*(credits?|crédits?)\b/gi;
  for (const { post, lang, s, n } of slides) {
    for (const m of allText(s).matchAll(creditRe)) if (m[1] !== "1") bad("6 facts", `${post.id} ${lang} ${n}: states "${m[0]}" (a scan or a tag is 1 credit)`);
  }
  ok("6 facts", "no credit figure other than 1");

  // 7 french
  for (const { post, lang, s, n } of slides) {
    if (lang !== "fr") continue;
    const t = [...(s.hook || []), ...(s.sub || []), ...(s.paper || []), ...(s.rows || []).flat(), ...(s.checks || []).flat(), s.alt].filter(Boolean).join(" ");
    const m = t.match(/ [?!:;]/);
    if (m) bad("7 french", `${post.id} fr ${n}: space before "${m[0].trim()}" (Quebec typography has none): "${t.slice(Math.max(0, t.indexOf(m[0]) - 20), t.indexOf(m[0]) + 10)}"`);
    if (/\bappli\b|numéris|numeris/i.test(t)) bad("7 french", `${post.id} fr ${n}: use the app's words (application, scanner)`);
  }
  ok("7 french", "Quebec spacing, the app's own vocabulary");

  // 8 captions
  for (const post of POSTS) {
    for (const lang of LANGS) {
      const cap = captions(post, lang);
      for (const [key, c] of Object.entries(cap)) {
        const id = `${post.id} ${lang} ${key}`;
        for (const [re, why] of BANNED) if (re.test(c)) bad("8 captions", `${id}: ${why} — "${c.match(re)[0]}"`);
        if (c.length > 2200) bad("8 captions", `${id} is ${c.length} chars (limit 2200)`);
        const tags = (c.match(/#\S+/g) || []).length;
        if (tags > 5) bad("8 captions", `${id} has ${tags} hashtags (playbook: 3-5 on IG)`);
        if (!NON_AFFIL.test(c)) bad("8 captions", `${id} is missing the non-affiliation line`);
        if (key === "instagram" && /https?:\/\//.test(c)) bad("8 captions", `${id} has a link (Instagram captions are not clickable)`);
        if (key === "instagram" && !/(link in bio|lien de téléchargement dans la bio)/i.test(c)) bad("8 captions", `${id} does not say link in bio`);
        if (key === "facebook" && !(c.includes("apps.apple.com/ca/app/priceback/id6795860374") && c.includes("play.google.com/store/apps/details?id=com.priceback"))) bad("8 captions", `${id} is missing a store link`);
        const other = lang === "en" ? /\b(Téléchargez|Scannez|Suivez|reçu)\b/ : /\b(Download|Scan your|Follow us)\b/;
        if (other.test(c)) bad("8 captions", `${id} mixes languages: "${c.match(other)[0]}"`);
      }
      const { instagram } = cap;
      if (lang === "fr" && / [?!:;]/.test(instagram.replace(/\n(iPhone|Android) :/g, ""))) bad("8 captions", `${post.id} fr instagram has a space before ? ! : ;`);
    }
  }
  ok("8 captions", `${POSTS.length * 4} captions checked`);

  // 9 colourway
  for (const post of POSTS) {
    const band = async (lang) => {
      const { channels } = await sharp(R.file(post.id, lang, 1, "jpg")).extract({ left: 0, top: 0, width: 1080, height: 90 }).stats();
      return channels.slice(0, 3).map((c) => c.mean);
    };
    const [e, f] = [await band("en"), await band("fr")];
    const dist = Math.hypot(e[0] - f[0], e[1] - f[1], e[2] - f[2]);
    if (dist < 60) bad("9 colourway", `${post.id}: EN and FR grounds too close (Δ ${dist.toFixed(0)})`);
  }
  ok("9 colourway", "EN ≠ FR ground on every post");

  // 10 holds
  for (const post of POSTS) if (post.requires) console.log(`  ⚠ 10 holds  ${post.id}: DO NOT PUBLISH until the store build ships ${post.requires}`);

  if (fails.length) {
    console.error(`\n${fails.length} FAILED:\n  ${fails.join("\n  ")}`);
    process.exit(1);
  }
  console.log("\nall gates green");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
