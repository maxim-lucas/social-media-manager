// Community pack — renderer. Scenes in, PNGs out.
//
//   node sm-content/04-community/scenes/render.js              # everything
//   node sm-content/04-community/scenes/render.js --only=covers
//   node sm-content/04-community/scenes/render.js --only=posts --lang=en --svg
//
// A copy change is a re-render, not a rebuild: edit strings.json and run this.
//
// Requires Roboto, Roboto Black and Roboto Mono (all Apache-2.0) on the machine
// — librsvg resolves them through the system font list, not from this repo, and
// it substitutes a missing font SILENTLY. verify.js measures a rendered probe of
// each rather than trusting that they resolved.

const fs = require("fs");
const path = require("path");
const sharp = require("sharp");

const { CANVAS } = require("./tokens");
const { buildPost, buildDivider } = require("./posts");
const { buildStory } = require("./stories");
const { buildCover } = require("./covers");
const { postFile, storyFile, dividerFile, noticeFile, coverFile, rel } = require("./paths");

const STRINGS = JSON.parse(fs.readFileSync(path.join(__dirname, "strings.json"), "utf8"));

const args = process.argv.slice(2);
const argVal = (name, dflt) => {
  const hit = args.find((a) => a.startsWith(`--${name}=`));
  return hit ? hit.split("=")[1] : dflt;
};
const only = argVal("only", "all"); // all | posts | stories | notices | dividers | covers
const langFilter = argVal("lang", "all"); // all | en | fr
const dumpSvg = args.includes("--svg");

const LANGS = ["en", "fr"].filter((l) => langFilter === "all" || langFilter === l);
const want = (kind) => only === "all" || only === kind;

// ── The palette guard ───────────────────────────────────────────────────────
//
// A quantiser spends its palette where the PIXELS are, not where the MEANING
// is. This pack added a fourth ramp - the brick maple leaf washed over warm
// paper - and on the made-in-Canada frames those pale pinks took the entries
// the brand emerald needed. The lockup's mark came out GREY. Nothing threw,
// nothing looked broken, and the logo was the wrong colour on exactly the four
// frames whose subject is the brand.
//
// The check has to compare LIKE WITH LIKE. The first version looked for a pixel
// close to literal #10b981 and failed six innocent frames: the mark is a 2.9px
// antialiased stroke and the cover ring is drawn at 34% opacity, so neither ever
// reaches the pure value even when the render is perfect. What matters is not
// "is the exact green present" but "did quantising REMOVE the green that was
// there" - so the guard measures the greenest pixel in the unquantised raster
// and again in the encoded PNG, and compares the two.
//
// Worth stating plainly, because it generalises past this pack: ADDING A COLOUR
// IN ONE PLACE CAN REMOVE ONE SOMEWHERE ELSE. A palette is a shared budget and
// nothing in the toolchain tells you which line item lost.

/** How green the greenest pixel in `buf` is: g - (r+b)/2, 0 for a grey frame. */
async function peakGreen(buf) {
  const { data, info } = await sharp(buf).raw().toBuffer({ resolveWithObject: true });
  let peak = 0;
  for (let i = 0; i < data.length; i += info.channels) {
    const g = data[i + 1] - (data[i] + data[i + 2]) / 2;
    if (g > peak) peak = g;
  }
  return peak;
}

// Below this fraction of the reference, the brand colour has been EATEN rather
// than merely dithered, and the frame is re-encoded without a palette.
//
// 0.45 is set from measurements, not from caution. Across this pack the numbers
// come out bimodal: ordinary frames keep 67-100% of their peak green (a dither
// tax on a 2.9px antialiased stroke, invisible at any size), and the four
// made-in-Canada frames keep 9-10% (the mark rendered grey). There is nothing
// in between, so the threshold sits in the empty middle. Set at 0.75 it also
// converted six healthy frames to truecolour and added 7 MB to the repo for no
// visible difference.
const GREEN_FLOOR = 0.45;

async function write(svgStr, outPath, { w, h }, label) {
  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  if (dumpSvg) fs.writeFileSync(outPath.replace(/\.png$/, ".svg"), svgStr);

  // density 72 keeps 1 SVG user unit === 1 px, so the canvas is exact.
  //
  // Quantised to a 128-colour palette with full dithering, same as the evergreen
  // pack: a dark green ramp, a warm paper ramp and one emerald reproduce in 128
  // entries without visible banding, and the field's rendered grain is what the
  // dither is protecting (a flat near-black gradient posterises hard once
  // Instagram re-encodes it).
  const pipeline = () => sharp(Buffer.from(svgStr), { density: 72 });

  const reference = await pipeline().raw().toBuffer({ resolveWithObject: true });
  const referenceGreen = await peakGreen(
    await sharp(reference.data, {
      raw: { width: reference.info.width, height: reference.info.height, channels: reference.info.channels },
    })
      .png()
      .toBuffer()
  );

  let buf = await pipeline()
    .png({ palette: true, colours: 128, dither: 1.0, compressionLevel: 9, effort: 10 })
    .toBuffer();
  let mode = "128";

  const got = await peakGreen(buf);
  if (referenceGreen > 20 && got < referenceGreen * GREEN_FLOOR) {
    buf = await pipeline().png({ palette: false, compressionLevel: 9, effort: 10 }).toBuffer();
    mode = `truecolour (128 kept only ${Math.round((got / referenceGreen) * 100)}% of the green)`;
  }

  const meta = await sharp(buf).metadata();
  if (meta.width !== w || meta.height !== h) {
    throw new Error(`${label}: rendered ${meta.width}x${meta.height}, expected ${w}x${h}`);
  }
  fs.writeFileSync(outPath, buf);
  return { bytes: buf.length, mode };
}

async function main() {
  const made = [];

  for (const lang of LANGS) {
    const pack = STRINGS[lang];
    if (!pack) throw new Error(`strings.json has no "${lang}" block`);

    if (want("posts")) {
      for (const t of pack.posts) {
        const out = postFile(t, lang);
        made.push([rel(out), await write(await buildPost(t, pack.handle), out, CANVAS.post, path.basename(out))]);
      }
    }

    if (want("stories")) {
      for (const t of pack.stories) {
        const out = storyFile(t, lang);
        made.push([rel(out), await write(await buildStory(t, pack.handle), out, CANVAS.story, path.basename(out))]);
      }
    }
  }

  // Dividers and covers carry no language: a divider names the language it
  // points AT, and a cover is an icon. Rendering either per-language would
  // produce two identical files under two names, which is how a pack starts
  // drifting out of sync with itself.
  if (want("notices")) {
    for (const n of STRINGS.notices) {
      const out = noticeFile(n);
      const canvas = n.kind === "story" ? CANVAS.story : CANVAS.post;
      const svg = n.kind === "story" ? await buildStory(n, STRINGS.en.handle) : await buildPost(n, STRINGS.en.handle);
      made.push([rel(out), await write(svg, out, canvas, path.basename(out))]);
    }
  }

  if (want("dividers")) {
    for (const d of STRINGS.dividers) {
      const out = dividerFile(d);
      made.push([
        rel(out),
        await write(await buildDivider(d, STRINGS.en.handle), out, CANVAS.carousel, path.basename(out)),
      ]);
    }
  }

  if (want("covers")) {
    for (const c of STRINGS.covers) {
      const out = coverFile(c, STRINGS.coversDir);
      made.push([rel(out), await write(await buildCover(c), out, CANVAS.cover, path.basename(out))]);
    }
  }

  const kb = (n) => `${(n / 1024).toFixed(0)} kB`;
  made.forEach(([f, r]) => console.log(`  ${f.padEnd(58)} ${kb(r.bytes).padStart(8)}  ${r.mode}`));
  const total = made.reduce((a, [, r]) => a + r.bytes, 0);
  console.log(`\n${made.length} asset${made.length === 1 ? "" : "s"} rendered, ${kb(total)} total.`);
}

main().catch((e) => {
  console.error(`render failed: ${e.message}`);
  process.exit(1);
});
