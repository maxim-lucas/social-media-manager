// render.js — renders app-recording.html frame by frame into real MP4 video.
//
//   npm i puppeteer-core@23 ffmpeg-static@5      (once, anywhere; point NODE_PATH at it)
//   CHROME="C:/Program Files (x86)/Google/Chrome/Application/chrome.exe" node scenes/render.js [stills|vertical|wide|all]
//
// stills   → out/stills/t-<sec>.png at the key moments (review before a full render)
// vertical → out/priceback-kickstarter-9x16.mp4   1080×1920, 30 fps (Kickstarter "Discovery Mode" / Reels)
// wide     → out/priceback-kickstarter-16x9.mp4   1920×1080: the same recording centred on the brand mint
//            (Kickstarter's main project video). Narration is mixed in when audio/narration.wav exists.
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

async function page() {
  const browser = await puppeteer.launch({ executablePath: CHROME, headless: true, args: ["--allow-file-access-from-files", "--disable-web-security", "--font-render-hinting=none"] });
  const p = await browser.newPage();
  await p.setViewport({ width: 360, height: 640, deviceScaleFactor: 3 });
  await p.goto("file:///" + path.join(__dirname, "app-recording.html").replace(/\\/g, "/"), { waitUntil: "networkidle0" });
  await p.evaluate(() => document.fonts.ready);
  return { browser, p };
}

async function stills() {
  const { browser, p } = await page();
  fs.mkdirSync(path.join(OUT, "stills"), { recursive: true });
  for (const t of [1, 5.5, 8.6, 11, 13.5, 18.6, 21.5, 25.6, 28.5, 30.6, 34, 37, 40, 44]) {
    await p.evaluate((x) => window.renderAt(x), t);
    await new Promise((r) => setTimeout(r, 60));
    await p.screenshot({ path: path.join(OUT, "stills", `t-${String(t).replace(".", "_")}.png`) });
  }
  await browser.close();
}

function encoder(file, args) {
  const ff = spawn(ffmpeg, ["-y", "-f", "image2pipe", "-framerate", String(FPS), "-i", "-", ...args, file], { stdio: ["pipe", "ignore", "inherit"] });
  return ff;
}

async function vertical() {
  const { browser, p } = await page();
  const dur = await p.evaluate(() => window.DURATION);
  const silent = path.join(OUT, "priceback-kickstarter-9x16.silent.mp4");
  const ff = encoder(silent, ["-c:v", "libx264", "-preset", "slow", "-crf", "16", "-pix_fmt", "yuv420p", "-r", String(FPS)]);
  const frames = Math.round(dur * FPS);
  for (let f = 0; f < frames; f++) {
    await p.evaluate((x) => window.renderAt(x), f / FPS);
    const buf = await p.screenshot({ type: "jpeg", quality: 95 });
    if (!ff.stdin.write(buf)) await new Promise((r) => ff.stdin.once("drain", r));
    if (f % 150 === 0) process.stdout.write(`frame ${f}/${frames}\n`);
  }
  ff.stdin.end();
  await new Promise((r) => ff.on("close", r));
  await browser.close();
  return silent;
}

function run(args) {
  return new Promise((res, rej) => spawn(ffmpeg, args, { stdio: "inherit" }).on("close", (c) => (c ? rej(new Error("ffmpeg " + c)) : res())));
}

async function finish(silent) {
  const vo = path.join(ROOT, "audio", "narration.wav");
  const hasVo = fs.existsSync(vo);
  const v916 = path.join(OUT, "priceback-kickstarter-9x16.mp4");
  const v169 = path.join(OUT, "priceback-kickstarter-16x9.mp4");
  const audioIn = hasVo ? ["-i", vo] : [];
  const audioMap = hasVo ? ["-map", "0:v", "-map", "1:a", "-c:a", "aac", "-b:a", "192k", "-shortest"] : [];
  await run(["-y", "-i", silent, ...audioIn, ...audioMap, "-c:v", "copy", v916]);
  // 16:9: the 9:16 recording scaled to 1080 high, centred on the app's own mint, soft shadow.
  await run(["-y", "-i", silent, ...audioIn, "-filter_complex",
    "color=c=0xeef5f1:s=1920x1080:r=30[bg];[0:v]scale=-2:1000,format=yuva420p[ph];[bg][ph]overlay=(W-w)/2:(H-h)/2:shortest=1[v]",
    "-map", "[v]", ...(hasVo ? ["-map", "1:a", "-c:a", "aac", "-b:a", "192k", "-shortest"] : []),
    "-c:v", "libx264", "-preset", "slow", "-crf", "16", "-pix_fmt", "yuv420p", v169]);
  return { v916, v169, narration: hasVo };
}

(async () => {
  fs.mkdirSync(OUT, { recursive: true });
  if (mode === "stills") return stills();
  const silent = await vertical();
  if (mode === "vertical" || mode === "wide" || mode === "all") console.log(await finish(silent));
})().catch((e) => { console.error(e); process.exit(1); });
