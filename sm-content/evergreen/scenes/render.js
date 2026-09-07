// Evergreen pack — renderer. Scenes in, PNGs out.
//
//   node sm-content/evergreen/scenes/render.js             # all 38 assets
//   node sm-content/evergreen/scenes/render.js --only=posts --lang=en
//   node sm-content/evergreen/scenes/render.js --svg       # dump the SVG too
//
// A copy change is a re-render, not a rebuild: edit strings.json and run this.
//
// Requires Roboto and Roboto Mono (both Apache-2.0) on the machine — librsvg
// resolves them through the system font list, not from this repo, and it
// substitutes a missing font SILENTLY. verify.js measures a rendered probe of
// each rather than trusting that they resolved.

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
  // dark green ramp, a warm paper ramp and one emerald — three narrow ramps,
  // which 128 entries reproduce without visible banding. The field also carries
  // a little rendered grain, because a flat near-black gradient posterises hard
  // once Instagram re-encodes it; the grain is what the dither is protecting.
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
      for (const t of pack.posts) {
        const out = path.join(ROOT, "posts", `priceback-evergreen-post-${lang}-${t.id}.png`);
        const svg = await buildPost(t, pack.handle);
        made.push([path.relative(ROOT, out), await write(svg, out, CANVAS.post, path.basename(out))]);
      }
    }

    if (only === "all" || only === "stories") {
      for (const t of pack.stories) {
        const out = path.join(ROOT, "stories", `priceback-evergreen-story-${lang}-${t.id}.png`);
        const svg = await buildStory(t, pack.handle);
        made.push([path.relative(ROOT, out), await write(svg, out, CANVAS.story, path.basename(out))]);
      }
    }
  }

  const kb = (n) => `${(n / 1024).toFixed(0)} kB`;
  made.forEach(([f, b]) => console.log(`  ${f.padEnd(52)} ${kb(b)}`));
  const total = made.reduce((a, [, b]) => a + b, 0);
  console.log(`\n${made.length} asset${made.length === 1 ? "" : "s"} rendered, ${kb(total)} total.`);
}

main().catch((e) => {
  console.error(`render failed: ${e.message}`);
  process.exit(1);
});
