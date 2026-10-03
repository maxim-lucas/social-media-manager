// Costco toolkit pack — builds everything that is DERIVED from copy.js:
//   post.json        what a publisher sends (captions are final text, not templates)
//   CAPTIONS.md      the same, to read
//   POSTING-ORDER/   numbered, self-contained copy of every JPEG in posting order
//                    (additive duplicates, per ../../POSTING-ORDER-CONVENTION.md)
//
//   node sm-content/07-costco-toolkit/scenes/build-outputs.js

const fs = require("fs");
const path = require("path");
const { POSTS, captions } = require("./copy");

const ROOT = path.join(__dirname, "..");

// The proposed run: one carousel pair per sitting (EN, then FR one minute later),
// the held post last. Not a schedule: nothing here is posted by this script.
const ORDER = ["toolkit", "scan-receipt", "claim-drop", "price-tag", "community", "best-of-money", "price-codes"];
const ordered = ORDER.map((id) => POSTS.find((p) => p.id === id));
if (ordered.some((p) => !p) || ordered.length !== POSTS.length) throw new Error("ORDER must list every post exactly once");

const pad = (n) => String(n).padStart(2, "0");
const slide = (id, lang, n) => `${id}-${lang}-${pad(n)}.jpg`;

// ── post.json ───────────────────────────────────────────────────────────────
const json = {
  _readme: [
    "The Costco-toolkit run: seven carousels, each published as an English post and a",
    "French post one minute apart (EN first, FR second), Instagram + Facebook.",
    "Captions are final text. Instagram's carousel API takes JPEG only, so the .jpg",
    "files ship; the .png files are masters. NOTHING HERE HAS BEEN POSTED.",
    "Posts with a `holdUntil` must wait for that app release.",
  ],
  account: "@priceback.ca",
  assetBase: "https://raw.githubusercontent.com/maxim-lucas/social-media-manager/master/sm-content/07-costco-toolkit/posts/",
  posts: ordered.flatMap((p, i) =>
    ["en", "fr"].map((lang) => ({
      id: `${p.id}-${lang}`,
      order: i + 1,
      lang,
      ...(p.requires ? { holdUntil: p.requires } : {}),
      slides: p[lang].map((_, k) => `${p.id}/${slide(p.id, lang, k + 1)}`),
      altText: p[lang].map((s) => s.alt),
      instagramCaption: captions(p, lang).instagram,
      facebookCaption: captions(p, lang).facebook,
    }))
  ),
};
fs.writeFileSync(path.join(ROOT, "post.json"), JSON.stringify(json, null, 2) + "\n");

// ── CAPTIONS.md ─────────────────────────────────────────────────────────────
const md = [
  "# Costco toolkit captions: exactly what gets published",
  "",
  "Generated from [`scenes/copy.js`](scenes/copy.js) by `scenes/build-outputs.js`. Edit there, not here.",
  "Instagram captions can't hold clickable links, so they say *link in bio*; the Facebook captions carry both store links.",
  "",
];
ordered.forEach((p, i) => {
  md.push(`## ${i + 1}. ${p.id}${p.requires ? `  ⚠ HOLD: waits for ${p.requires}` : ""}`, "");
  for (const lang of ["en", "fr"]) {
    const c = captions(p, lang);
    md.push(`### ${lang === "en" ? "English" : "Français"} (${p.en.length} slides)`, "");
    md.push("Slides: " + p[lang].map((_, k) => `[${pad(k + 1)}](posts/${p.id}/${slide(p.id, lang, k + 1)})`).join(" · "), "");
    md.push(`#### Instagram (${c.instagram.length} chars)`, "", "```text", c.instagram, "```", "");
    md.push(`#### Facebook (${c.facebook.length} chars)`, "", "```text", c.facebook, "```", "");
  }
});
fs.writeFileSync(path.join(ROOT, "CAPTIONS.md"), md.join("\n"));

// ── POSTING-ORDER/ ──────────────────────────────────────────────────────────
const po = path.join(ROOT, "POSTING-ORDER");
fs.rmSync(po, { recursive: true, force: true });
fs.mkdirSync(po, { recursive: true });
const table = ["| Order | Post | Slides | Note |", "| --- | --- | --- | --- |"];
let copied = 0;
ordered.forEach((p, i) => {
  ["en", "fr"].forEach((lang, li) => {
    p[lang].forEach((_, k) => {
      const dest = `${pad(i + 1)}-${li + 1}-${p.id}-${lang}-slide-${pad(k + 1)}.jpg`;
      fs.copyFileSync(path.join(ROOT, "posts", p.id, slide(p.id, lang, k + 1)), path.join(po, dest));
      copied++;
    });
    table.push(`| ${pad(i + 1)}-${li + 1} | \`${p.id}-${lang}\` | ${p[lang].length} | ${p.requires ? "⚠ HOLD" : ""} |`);
  });
});
fs.writeFileSync(
  path.join(po, "README.md"),
  [
    "# 07-costco-toolkit: posting order",
    "",
    "Seven carousel pairs, one pair per sitting. Within a pair: English first, French one minute later",
    "(Instagram shows the newest post top-left, so French ends up first in the grid, English beside it).",
    "Same order on Facebook. Cadence is the owner's call (the playbook says never two big posts on one day).",
    "",
    ...table,
    "",
    "Additive copies of `../posts/<post>/*.jpg`, per `../../POSTING-ORDER-CONVENTION.md`.",
    "Captions: `../CAPTIONS.md`. **Nothing here has been posted.**",
    "",
  ].join("\n")
);
console.log(`post.json (${json.posts.length} posts), CAPTIONS.md, POSTING-ORDER/ (${copied} files)`);
