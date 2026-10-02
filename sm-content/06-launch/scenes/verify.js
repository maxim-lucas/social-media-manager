// Launch pack — the gates. Run after every render; nothing ships red.
//
//   node sm-content/06-launch/scenes/verify.js
//
//  1  files       10 JPEGs + 10 PNGs exist, 1080×1350 (4:5), JPEG under 8 MB
//  2  parity      EN and FR carry the same scenes in the same order, every slide has alt text
//  3  face        the headline face actually resolved (not librsvg's silent fallback)
//  4  fit         every typed line fits its column at the size it is drawn
//  5  claims      no promise the app cannot honour, in either language
//  6  facts       the welcome-credit figure on the art matches facts below
//  7  colourway   EN and FR grounds are visibly different (the grid must not repeat)

const fs = require("fs");
const path = require("path");
const sharp = require("sharp");
const R = require("./render");

const ROOT = path.join(__dirname, "..");
const POSTS = path.join(ROOT, "posts");
const { STRINGS } = R;

// Checked against production on 2026-10-02: priceback.app_config FREE_TRIAL_CREDITS
// on Supabase prod (xjfrlzwonyaorwktnkpj) = 75; shared/pricing.config.js on origin/main = 75.
const FACTS = { welcomeCredits: 75 };

const fails = [];
const ok = (gate, msg) => console.log(`  ✓ ${gate}  ${msg}`);
const bad = (gate, msg) => fails.push(`${gate}  ${msg}`);

const BANNED = [
  // The owner's brief said "$5 of credit, limited time". Neither is true: the
  // grant is 75 CREDITS, permanent, once per account. A dollar value or an
  // urgency claim on a grant that never expires is a false-urgency claim.
  [/\$\s?\d|\d\s?\$/, "a currency figure"],
  [/limited[- ]time|for a limited|durée limitée|temps limité|offre limitée/i, "false urgency — the welcome grant is permanent"],
  [/free (month|trial)|mois gratuit|essai gratuit/i, "a free-period claim (App Store 3.1.2(c) rejected 2.8.20 for this)"],
  [/gmail/i, "Gmail sync is not live"],
  [/guarantee|garanti/i, "a guarantee"],
  [/successful claims only|réclamations réussies/i, "wrong — the drop share is charged at detection, not on a successful claim"],
  [/\bpartner|\bpartenaire/i, "implies a retailer partnership"],
];

const allText = (s) =>
  [s.kicker, s.accent, s.swipe, s.alt, ...(s.hook || []), ...(s.sub || []), ...(s.paper || []), ...(s.fine || []), ...(s.rows || []).flat(), ...(s.checks || []).flat()]
    .filter(Boolean)
    .join(" | ");

async function main() {
  // 1 files
  for (const lang of ["en", "fr"]) {
    for (const s of STRINGS[lang]) {
      const base = path.join(POSTS, `priceback-launch-${lang}-${String(s.n).padStart(2, "0")}`);
      for (const ext of ["png", "jpg"]) {
        const f = `${base}.${ext}`;
        if (!fs.existsSync(f)) { bad("1 files", `${path.basename(f)} missing`); continue; }
        const m = await sharp(f).metadata();
        if (m.width !== 1080 || m.height !== 1350) bad("1 files", `${path.basename(f)} is ${m.width}×${m.height}`);
        if (ext === "jpg" && (m.format !== "jpeg" || fs.statSync(f).size > 8 * 1024 * 1024)) bad("1 files", `${path.basename(f)} not a JPEG under 8 MB`);
      }
    }
  }
  ok("1 files", "20 files checked");

  // 2 parity
  const sig = (lang) => STRINGS[lang].map((s) => `${s.n}:${s.scene}`).join(",");
  if (sig("en") !== sig("fr")) bad("2 parity", `EN ${sig("en")} ≠ FR ${sig("fr")}`);
  for (const lang of ["en", "fr"]) for (const s of STRINGS[lang]) if (!s.alt || s.alt.length < 40) bad("2 parity", `${lang} ${s.n} has no alt text`);
  if (STRINGS.en.length > 10) bad("2 parity", "the Graph API takes at most 10 carousel items");
  ok("2 parity", `${STRINGS.en.length} slides per language, same scenes`);

  // 3 face
  const real = await R.inkWidth("THE WAIT IS OVER", 100, R.HEAD);
  const fake = await R.inkWidth("THE WAIT IS OVER", 100, { family: "NoSuchFontXYZ", weight: R.HEAD.weight });
  if (real === fake) bad("3 face", "headline face renders identically to a nonexistent family — font did not resolve");
  else ok("3 face", `Roboto ${R.HEAD.weight} resolved (${real}px vs fallback ${fake}px)`);

  // 4 fit — subs and fine print are the lines that grow in French
  for (const lang of ["en", "fr"]) {
    for (const s of STRINGS[lang]) {
      for (const l of s.hook || []) {
        const size = await R.fitSize(s.hook, s.scene === "cover" ? 150 : 132, R.COL);
        if ((await R.inkWidth(l, size)) > R.COL) bad("4 fit", `${lang} ${s.n} hook "${l}"`);
      }
      const subSize = await R.fitSize(s.sub || ["x"], 33, R.COL, R.SUB);
      if (subSize < 28) bad("4 fit", `${lang} ${s.n} sub had to shrink to ${subSize}px — rewrite it shorter`);
      for (const l of s.fine || []) {
        if ((await R.inkWidth(l, 22, R.SUB)) > R.COL) bad("4 fit", `${lang} ${s.n} fine print overflows: "${l}"`);
      }
    }
  }
  ok("4 fit", "headlines, sub-lines and fine print inside the column");

  // 5 claims
  for (const lang of ["en", "fr"]) {
    for (const s of STRINGS[lang]) {
      const t = allText(s);
      for (const [re, why] of BANNED) if (re.test(t)) bad("5 claims", `${lang} ${s.n}: ${why} — "${t.match(re)[0]}"`);
    }
  }
  // Naming a retailer obliges the non-affiliation line on the SAME frame.
  for (const lang of ["en", "fr"]) {
    for (const s of STRINGS[lang]) {
      const t = allText(s);
      if (/costco/i.test(t) && !/(not affiliated|n’est affiliée|non affiliée)/i.test((s.fine || []).join(" "))) bad("5 claims", `${lang} ${s.n} names a retailer without the non-affiliation line`);
    }
  }
  // The captions ship too: same bans, Instagram's limits, and the disclaimer.
  const POST = JSON.parse(fs.readFileSync(path.join(ROOT, "post.json"), "utf8"));
  for (const p of POST.posts) {
    for (const key of ["instagramCaption", "facebookCaption"]) {
      const c = p[key];
      for (const [re, why] of BANNED) if (re.test(c)) bad("5 claims", `${p.id} ${key}: ${why} — "${c.match(re)[0]}"`);
      if (c.length > 2200) bad("5 claims", `${p.id} ${key} is ${c.length} chars (limit 2200)`);
      if ((c.match(/#\w/g) || []).length > 5) bad("5 claims", `${p.id} ${key} has more than 5 hashtags (playbook: 3–5)`);
      if (!/(not affiliated|n'est affiliée)/.test(c)) bad("5 claims", `${p.id} ${key} is missing the non-affiliation line`);
      if (!c.includes(String(FACTS.welcomeCredits))) bad("5 claims", `${p.id} ${key} does not state ${FACTS.welcomeCredits} credits`);
    }
    if (p.slides.length < 2 || p.slides.length > 10) bad("5 claims", `${p.id} has ${p.slides.length} slides`);
    for (const s of p.slides) if (!fs.existsSync(path.join(POSTS, s))) bad("5 claims", `${p.id} lists missing ${s}`);
  }
  ok("5 claims", `${BANNED.length} banned patterns on art + 4 captions, retailer ⇒ disclaimer`);

  // 6 facts
  for (const lang of ["en", "fr"]) {
    const nums = allText(STRINGS[lang].find((s) => s.scene === "free")).match(/\d+/g) || [];
    if (!nums.includes(String(FACTS.welcomeCredits))) bad("6 facts", `${lang} free slide does not state ${FACTS.welcomeCredits} credits`);
    if (nums.some((n) => n !== String(FACTS.welcomeCredits) && !["01", "1"].includes(n))) bad("6 facts", `${lang} free slide prints an unexpected number: ${nums}`);
  }
  ok("6 facts", `${FACTS.welcomeCredits} welcome credits, as in prod`);

  // 7 colourway — mean colour of the top band, where only the field shows
  const band = async (lang) => {
    const { channels } = await sharp(path.join(POSTS, `priceback-launch-${lang}-01.jpg`)).extract({ left: 0, top: 0, width: 1080, height: 90 }).stats();
    return channels.slice(0, 3).map((c) => c.mean);
  };
  const [e, f] = [await band("en"), await band("fr")];
  const dist = Math.hypot(e[0] - f[0], e[1] - f[1], e[2] - f[2]);
  if (dist < 60) bad("7 colourway", `EN and FR grounds too close (Δ ${dist.toFixed(0)})`);
  else ok("7 colourway", `EN ≠ FR ground (Δ ${dist.toFixed(0)})`);

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
