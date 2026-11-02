// render.js — renders app-recording.html (the app inside a phone body) frame by frame into MP4.
//
//   npm i puppeteer-core@23 ffmpeg-static@5      (once, anywhere; point NODE_PATH at its node_modules)
//   CHROME="C:/Program Files (x86)/Google/Chrome/Application/chrome.exe" node scenes/render.js <mode>
//
//   stills → out/stills/*.png + out/contact-sheet-source/ (review BEFORE any full render)
//   tall   → out/priceback-kickstarter-9x16.mp4   1080×1920 (Instagram Reels, Kickstarter Discovery Mode)
//   wide   → out/priceback-kickstarter-16x9.mp4   1920×1080 (Kickstarter main project video)
// Narration: audio/narration-en.wav / audio/narration-fr.wav are mixed in when present (…-en / …-fr outputs).
const path = require("path");
const fs = require("fs");
const { spawn } = require("child_process");
const puppeteer = require("puppeteer-core");
const ffmpeg = require("ffmpeg-static");

const ROOT = path.resolve(__dirname, "..");
const OUT = path.join(ROOT, "out");
const FPS = 30;
const CHROME = process.env.CHROME || "C:/Program Files (x86)/Google/Chrome/Application/chrome.exe";
const mode = process.argv[2] || "stills";
const SIZE = { tall: [1080, 1920], wide: [1920, 1080] };

async function open(layout) {
  const browser = await puppeteer.launch({ executablePath: CHROME, headless: true, args: ["--allow-file-access-from-files", "--font-render-hinting=none"] });
  const p = await browser.newPage();
  const [w, h] = SIZE[layout];
  await p.setViewport({ width: w, height: h, deviceScaleFactor: 1 });
  await p.goto("file:///" + path.join(__dirname, "app-recording.html").replace(/\\/g, "/") + `?layout=${layout}`, { waitUntil: "networkidle0" });
  await p.evaluate(() => document.fonts.ready);
  return { browser, p };
}

const run = (args) => new Promise((res, rej) => spawn(ffmpeg, args, { stdio: ["ignore", "ignore", "inherit"] }).on("close", (c) => (c ? rej(new Error("ffmpeg " + c)) : res())));

async function stills() {
  const { browser, p } = await open("tall");
  const dir = path.join(OUT, "stills");
  fs.mkdirSync(dir, { recursive: true });
  const times = [1.5, 4.5, 7.4, 9.5, 11.0, 13.0, 15.6, 17.0, 20.0, 22.0, 23.4, 25.5, 27.3, 30.0, 31.8, 34.0, 36.0, 38.5, 41.5, 43.8, 45.5];
  for (const t of times) {
    await p.evaluate((x) => window.renderAt(x), t);
    await p.screenshot({ path: path.join(dir, `t-${t.toFixed(1).replace(".", "_")}.png`) });
  }
  await browser.close();
  return times.length;
}

async function video(layout) {
  const { browser, p } = await open(layout);
  const dur = await p.evaluate(() => window.DURATION);
  const silent = path.join(OUT, `priceback-kickstarter-${layout === "tall" ? "9x16" : "16x9"}.silent.mp4`);
  const ff = spawn(ffmpeg, ["-y", "-f", "image2pipe", "-framerate", String(FPS), "-i", "-", "-c:v", "libx264", "-preset", "slow", "-crf", "17", "-pix_fmt", "yuv420p", "-r", String(FPS), silent], { stdio: ["pipe", "ignore", "inherit"] });
  const frames = Math.round(dur * FPS);
  for (let f = 0; f < frames; f++) {
    await p.evaluate((x) => window.renderAt(x), f / FPS);
    const buf = await p.screenshot({ type: "jpeg", quality: 94 });
    if (!ff.stdin.write(buf)) await new Promise((r) => ff.stdin.once("drain", r));
  }
  ff.stdin.end();
  await new Promise((r) => ff.on("close", r));
  await browser.close();
  for (const lang of ["en", "fr"]) {
    const vo = path.join(ROOT, "audio", `narration-${lang}.wav`);
    if (fs.existsSync(vo)) await run(["-y", "-i", silent, "-i", vo, "-map", "0:v", "-map", "1:a", "-c:v", "copy", "-c:a", "aac", "-b:a", "192k", silent.replace(".silent.mp4", `-${lang}.mp4`)]);
  }
  return silent;
}

(async () => {
  fs.mkdirSync(OUT, { recursive: true });
  if (mode === "stills") console.log("stills:", await stills());
  if (mode === "tall" || mode === "all") console.log(await video("tall"));
  if (mode === "wide" || mode === "all") console.log(await video("wide"));
})().catch((e) => { console.error(e); process.exit(1); });
