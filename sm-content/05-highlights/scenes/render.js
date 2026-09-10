// Highlights pack — renderer. Scenes in, PNGs out.
//
//   node sm-content/05-highlights/scenes/render.js
//   node sm-content/05-highlights/scenes/render.js --only=covers
//   node sm-content/05-highlights/scenes/render.js --only=frames --tray=plans --lang=fr --svg
//
// A copy change is a re-render, not a rebuild: edit scenes/build-strings.js (or
// facts.json), re-run it, and run this.
//
// Requires Roboto, Roboto Black and Roboto Mono (all Apache-2.0) on the machine
// — librsvg resolves them through the system font list, not from this repo, and
// it substitutes a missing font SILENTLY. verify.js measures a rendered probe of
// each rather than trusting that they resolved.

const fs = require("fs");
const path = require("path");
const sharp = require("sharp");

const { CANVAS } = require("./tokens");
const { buildStory } = require("./stories");
const { buildCover } = require("./covers");
const { storyFile, coverFile, rel } = require("./paths");

const STRINGS = JSON.parse(fs.readFileSync(path.join(__dirname, "strings.json"), "utf8"));

const args = process.argv.slice(2);
const argVal = (name, dflt) => {
  const hit = args.find((a) => a.startsWith(`--${name}=`));
  return hit ? hit.split("=")[1] : dflt;
};
const only = argVal("only", "all"); // all | frames | covers
const trayFilter = argVal("tray", "all");
const langFilter = argVal("lang", "all");
const dumpSvg = args.includes("--svg");

const LANGS = ["en", "fr"].filter((l) => langFilter === "all" || langFilter === l);
const want = (kind) => only === "all" || only === kind;

/** A frame's language-neutral fields merged with one language's copy. */
const flatten = (f, lang) => ({ n: f.n, scene: f.scene, sticker: f.sticker, ...f[lang] });

// ── The palette guard ───────────────────────────────────────────────────────
//
// A quantiser spends its palette where the PIXELS are, not where the MEANING
// is. Inherited from 04-community, where a fourth colour ramp took the entries
// the brand emerald needed and the lockup's mark came out GREY on exactly the
// four frames whose subject was the brand. Nothing threw. Nothing looked broken.
//
// Worth stating plainly, because it generalises past this pack: ADDING A COLOUR
// IN ONE PLACE CAN REMOVE ONE SOMEWHERE ELSE. A palette is a shared budget and
// nothing in the toolchain tells you which line item lost.
//
// The check compares LIKE WITH LIKE. Looking for a pixel close to literal
// #10b981 fails innocent frames: the mark is a 2.9px antialiased stroke and the
// cover ring is drawn at 34% opacity, so neither ever reaches the pure value
// even when the render is perfect. What matters is not "is the exact green
// present" but "did quantising REMOVE the green that was there".

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

const GREEN_FLOOR = 0.45;

async function write(svgStr, outPath, { w, h }, label) {
  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  if (dumpSvg) fs.writeFileSync(outPath.replace(/\.png$/, ".svg"), svgStr);

  // density 72 keeps 1 SVG user unit === 1 px, so the canvas is exact.
  const pipeline = () => sharp(Buffer.from(svgStr), { density: 72 });

  const reference = await pipeline().raw().toBuffer({ resolveWithObject: true });
  const referenceGreen = await peakGreen(
    await sharp(reference.data, {
      raw: { width: reference.info.width, height: reference.info.height, channels: reference.info.channels },
    })
      .png()
      .toBuffer()
  );

  // A LADDER, not a switch. Falling straight from 128 colours to truecolour is
  // correct but expensive — it took the made-in-Canada frames from about 240 kB
  // to 1.1 MB each to rescue one emerald stroke. 256 is the rung between, and it
  // fixes the frames that are merely crowded rather than genuinely unpalettable.
  const encode = (opts) => pipeline().png({ compressionLevel: 9, effort: 10, ...opts }).toBuffer();
  const kept = (got) => Math.round((got / referenceGreen) * 100);

  let buf = await encode({ palette: true, colours: 128, dither: 1.0 });
  let mode = "128";

  if (referenceGreen > 20) {
    let got = await peakGreen(buf);
    if (got < referenceGreen * GREEN_FLOOR) {
      const at128 = kept(got);
      buf = await encode({ palette: true, colours: 256, dither: 1.0 });
      got = await peakGreen(buf);
      mode = `256 (128 kept only ${at128}% of the green)`;
      if (got < referenceGreen * GREEN_FLOOR) {
        buf = await encode({ palette: false });
        mode = `truecolour (256 still kept only ${kept(got)}% of the green)`;
      }
    }
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
  const trays = Object.fromEntries(STRINGS.trays.map((t) => [t.id, t]));

  if (want("frames")) {
    for (const [trayId, list] of Object.entries(STRINGS.frames)) {
      if (trayFilter !== "all" && trayFilter !== trayId) continue;
      const tray = trays[trayId];
      if (!tray) throw new Error(`frames.${trayId} has no tray declared in trays[]`);
      for (const f of list) {
        for (const lang of LANGS) {
          const out = storyFile(tray, f, lang);
          const svg = await buildStory(flatten(f, lang), STRINGS.meta.handle);
          made.push([rel(out), await write(svg, out, CANVAS.story, path.basename(out))]);
        }
      }
    }
  }

  // Covers carry no language: an icon has none, and the category name is typed
  // into Instagram as the Highlight title. Rendering them per-language would
  // produce two identical files under two names, which is how a pack starts
  // drifting out of sync with itself.
  if (want("covers")) {
    for (const c of STRINGS.covers) {
      const out = coverFile(c);
      made.push([rel(out), await write(await buildCover(c), out, CANVAS.cover, path.basename(out))]);
    }
  }

  const kb = (n) => `${(n / 1024).toFixed(0)} kB`;
  made.forEach(([f, r]) => console.log(`  ${f.padEnd(52)} ${kb(r.bytes).padStart(8)}  ${r.mode}`));
  const total = made.reduce((a, [, r]) => a + r.bytes, 0);
  console.log(`\n${made.length} asset${made.length === 1 ? "" : "s"} rendered, ${kb(total)} total.`);
}

main().catch((e) => {
  console.error(`render failed: ${e.message}`);
  process.exit(1);
});
