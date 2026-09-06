// Teaser pack — renderer. Scenes in, PNGs out.
//
//   node sm-content/teaser/scenes/render.js            # everything
//   node sm-content/teaser/scenes/render.js --only=posts --lang=en
//   node sm-content/teaser/scenes/render.js --svg       # also dump the SVG
//
// A copy change is a re-render, not a rebuild: edit strings.json and run this.
// Requires Roboto Mono (Apache-2.0) to be installed on the machine — it is what
// every frame is set in, and librsvg resolves it through the system font list,
// not from this repo. verify.js fails loudly if it went missing and something
// else got substituted.

const fs = require("fs");
const path = require("path");
const sharp = require("sharp");

const { CANVAS } = require("./tokens");
const { buildPost } = require("./posts");
const { buildStory } = require("./stories");

const ROOT = path.join(__dirname, "..");
const STRINGS = JSON.parse(fs.readFileSync(path.join(__dirname, "strings.json"), "utf8"));

const args = process.argv.slice(2);
const argVal = (name, dflt) => {
  const hit = args.find((a) => a.startsWith(`--${name}=`));
  return hit ? hit.split("=")[1] : dflt;
};
const only = argVal("only", "all"); // all | posts | stories
const langFilter = argVal("lang", "all"); // all | en | fr
const dumpSvg = args.includes("--svg");

const LANGS = ["en", "fr"].filter((l) => langFilter === "all" || langFilter === l);

async function write(svgStr, outPath, { w, h }, label) {
  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  if (dumpSvg) fs.writeFileSync(outPath.replace(/\.png$/, ".svg"), svgStr);
  // density 72 keeps 1 SVG user unit === 1 px, so the canvas is exact.
  //
  // Quantised to a 128-colour palette with full dithering. These frames are a
  // near-monochrome warm ramp plus one green, so 128 entries reproduce them
  // with no visible banding while cutting each file from ~1.9 MB to ~330 kB —
  // 20 assets is the difference between a 38 MB commit and a 7 MB one, and
  // Instagram re-encodes on upload regardless.
  const buf = await sharp(Buffer.from(svgStr), { density: 72 })
    .png({ palette: true, colours: 128, dither: 1.0, compressionLevel: 9, effort: 10 })
    .toBuffer();
  const meta = await sharp(buf).metadata();
  if (meta.width !== w || meta.height !== h) {
    throw new Error(`${label}: rendered ${meta.width}x${meta.height}, expected ${w}x${h}`);
  }
  fs.writeFileSync(outPath, buf);
  return buf.length;
}

async function main() {
  const made = [];

  for (const lang of LANGS) {
    const pack = STRINGS[lang];
    if (!pack) throw new Error(`strings.json has no "${lang}" block`);

    if (only === "all" || only === "posts") {
      for (let i = 0; i < pack.posts.length; i++) {
        const t = pack.posts[i];
        const out = path.join(ROOT, "posts", `priceback-teaser-post-${lang}-${t.id}.png`);
        const bytes = await write(buildPost(i, t, STRINGS.date), out, CANVAS.post, path.basename(out));
        made.push([path.relative(ROOT, out), bytes]);
      }
    }

    if (only === "all" || only === "stories") {
      for (let i = 0; i < pack.stories.length; i++) {
        const t = pack.stories[i];
        const out = path.join(ROOT, "stories", `priceback-teaser-story-${lang}-${t.id}.png`);
        const bytes = await write(buildStory(i, t, STRINGS.date), out, CANVAS.story, path.basename(out));
        made.push([path.relative(ROOT, out), bytes]);
      }
    }
  }

  const kb = (n) => `${(n / 1024).toFixed(0)} kB`;
  made.forEach(([f, b]) => console.log(`  ${f.padEnd(46)} ${kb(b)}`));
  console.log(`\n${made.length} asset${made.length === 1 ? "" : "s"} rendered.`);
}

main().catch((e) => {
  console.error(`render failed: ${e.message}`);
  process.exit(1);
});
