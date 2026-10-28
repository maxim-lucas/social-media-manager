// short.mjs — renders a finished ≤15 s tutorial from one scene, end to end, with no outside input.
//
//   node tools/short.mjs <video-dir> [--frames-only] [--still t1,t2,…]
//
// <video-dir>/short.json describes the video; <video-dir>/scene.html is the scene. The scene exposes
//   window.ready  — a promise that resolves once its images, fonts and textures are in
//   window.frame(t) — puts the scene at time t (seconds); pure, so any frame renders on its own
// Every readable overlay in the scene carries [data-text]; that is what the safe-zone and copy gates read.
//
// Steps: voice (Kokoro v1.0, local) → music bed → frames (headless Chromium, one screenshot per frame,
// piped to x264) → mix (voice compressed, bed ducked under it, two-pass loudness, limiter) → mux → gates.
// --still renders PNG stills at the given times into build/stills/ for a quick look before a full render.

import fs from "node:fs";
import path from "node:path";
import { spawn, execFileSync } from "node:child_process";
import { fileURLToPath, pathToFileURL } from "node:url";
import { createRequire } from "node:module";
import { speak } from "./voice.mjs";

const require = createRequire(import.meta.url);
const { chromium } = require(process.env.PW || "/opt/npm-tools/node_modules/playwright");
const HERE = path.dirname(fileURLToPath(import.meta.url));
const dir = path.resolve(process.argv[2] || ".");
const spec = JSON.parse(fs.readFileSync(path.join(dir, "short.json"), "utf8"));
const argStill = process.argv.indexOf("--still");
const STILLS = argStill > 0 ? process.argv[argStill + 1].split(",").map(Number) : null;
const { w: W = 1080, h: H = 1920, fps: FPS = 30, dur: DUR } = spec;
const B = path.join(dir, "build");
fs.mkdirSync(path.join(dir, "audio/vo"), { recursive: true });
fs.mkdirSync(B, { recursive: true });
const ff = (args) => execFileSync("ffmpeg", ["-hide_banner", "-v", "error", "-y", ...args], { stdio: ["ignore", "inherit", "inherit"] });
const sh = (c) => execFileSync("sh", ["-c", c], { maxBuffer: 64 << 20 }).toString();
const log = (...a) => console.log(...a);

// ── frames ────────────────────────────────────────────────────────────────
async function frames() {
  const browser = await chromium.launch({ args: ["--force-color-profile=srgb", "--disable-lcd-text"] });
  const page = await browser.newPage({ viewport: { width: W, height: H }, deviceScaleFactor: 1 });
  page.on("pageerror", (e) => { throw e; });
  await page.goto(pathToFileURL(path.join(dir, spec.scene || "scene.html")).href);
  await page.evaluate(() => window.ready);
  const probe = () => page.evaluate(() => {
    const vis = (el) => { let o = 1; for (let e = el; e && e.nodeType === 1; e = e.parentElement) { const cs = getComputedStyle(e); if (cs.display === "none" || cs.visibility === "hidden") return 0; o *= +cs.opacity; } return o; };
    return [...document.querySelectorAll("[data-text]")].map((e) => ({ e, o: vis(e), r: e.getBoundingClientRect() }))
      .filter((x) => x.o > 0.05 && x.r.width > 0 && x.r.height > 0)
      .map((x) => ({ x: Math.round(x.r.left), y: Math.round(x.r.top), w: Math.round(x.r.width), h: Math.round(x.r.height), text: x.e.innerText.trim().replace(/\s+/g, " ") }));
  });

  if (STILLS) {
    fs.mkdirSync(path.join(B, "stills"), { recursive: true });
    for (const t of STILLS) {
      await page.evaluate((t) => window.frame(t), t);
      await page.screenshot({ path: path.join(B, "stills", `t${t.toFixed(2)}.png`) });
    }
    await browser.close();
    log(`stills: ${STILLS.join(", ")} → build/stills/`);
    return null;
  }

  const N = Math.round(DUR * FPS);
  const video = path.join(B, "video.mp4");
  const enc = spawn("ffmpeg", ["-hide_banner", "-v", "error", "-y", "-f", "image2pipe", "-c:v", "mjpeg", "-r", String(FPS), "-i", "-",
    "-c:v", "libx264", "-preset", "medium", "-crf", "15", "-pix_fmt", "yuv420p", "-r", String(FPS), video], { stdio: ["pipe", "inherit", "inherit"] });
  const done = new Promise((res, rej) => enc.on("close", (c) => (c ? rej(new Error("x264 exit " + c)) : res())));
  const textLog = [];
  const t0 = Date.now();
  for (let i = 0; i < N; i++) {
    const t = i / FPS;
    await page.evaluate((t) => window.frame(t), t);
    if (i % 5 === 0) textLog.push({ t: +t.toFixed(2), boxes: await probe() });
    const buf = await page.screenshot({ type: "jpeg", quality: 94 });
    if (!enc.stdin.write(buf)) await new Promise((r) => enc.stdin.once("drain", r));
  }
  enc.stdin.end();
  await done;
  await browser.close();
  fs.writeFileSync(path.join(B, "text-log.json"), JSON.stringify(textLog));
  log(`frames: ${N} in ${((Date.now() - t0) / 1000).toFixed(0)} s`);
  return { video, textLog };
}

// ── voice ─────────────────────────────────────────────────────────────────
async function voice() {
  const out = [];
  for (const [i, v] of spec.vo.entries()) {
    const f = path.join(dir, "audio/vo", `vo-${i}.wav`);
    const len = await speak(v.text, f, { voice: v.voice || spec.voice.name, speed: v.speed || spec.voice.speed });
    const until = (spec.vo[i + 1]?.at ?? DUR) - 0.12;
    out.push({ i, at: v.at, len: +len.toFixed(3), until: +until.toFixed(3), file: f, text: v.text, ok: v.at + len <= until });
    log(`${v.at + len <= until ? "ok  " : "LONG"} vo-${i} @${v.at}s ${len.toFixed(2)}s (room ${(until - v.at).toFixed(2)}s) “${v.text}”`);
  }
  return out;
}

// ── audio mix ─────────────────────────────────────────────────────────────
function mix(vo) {
  const bed = path.join(dir, "audio/bed.wav");
  execFileSync("node", [path.join(HERE, "music.js"), String(DUR + 0.2), bed, String(spec.music.hold ?? 2.2), String(spec.music.bpm ?? 92)], { stdio: "ignore" });
  const mixWav = path.join(B, "mix.wav");
  const inputs = ["-i", bed, ...vo.flatMap((v) => ["-i", v.file])];
  let fc = `[0:a]aformat=sample_rates=48000:channel_layouts=stereo,atrim=0:${DUR},volume=${spec.music.gainDb}dB[mus];`;
  vo.forEach((v, k) => {
    const ms = Math.round(v.at * 1000);
    fc += `[${k + 1}:a]aformat=sample_rates=48000:channel_layouts=stereo,highpass=f=70,acompressor=threshold=-20dB:ratio=2.5:attack=5:release=120,adelay=${ms}|${ms}[v${k}];`;
  });
  fc += `${vo.map((_, k) => `[v${k}]`).join("")}amix=inputs=${vo.length}:normalize=0,apad=whole_dur=${DUR}[vo];`;
  fc += `[vo]asplit[vo1][key];[mus][key]sidechaincompress=threshold=0.02:ratio=${(spec.music.duckDb / 1.5).toFixed(1)}:attack=40:release=400[duck];`;
  fc += `[duck][vo1]amix=inputs=2:normalize=0,afade=t=out:st=${(DUR - 0.5).toFixed(2)}:d=0.5,atrim=0:${DUR}[out]`;
  ff([...inputs, "-filter_complex", fc, "-map", "[out]", "-ar", "48000", "-ac", "2", mixWav]);
  const target = `I=${spec.targetLufs}:TP=${spec.truePeak}:LRA=11`;
  const meas = sh(`ffmpeg -hide_banner -i "${mixWav}" -af loudnorm=${target}:print_format=json -f null - 2>&1`);
  const m = JSON.parse(meas.slice(meas.lastIndexOf("{"), meas.lastIndexOf("}") + 1));
  const lim = Math.pow(10, (spec.truePeak - 1) / 20).toFixed(4);
  const audio = path.join(B, "audio.wav");
  ff(["-i", mixWav, "-af", `loudnorm=${target}:measured_I=${m.input_i}:measured_TP=${m.input_tp}:measured_LRA=${m.input_lra}:measured_thresh=${m.input_thresh}:offset=${m.target_offset}:linear=true,aresample=192000,alimiter=limit=${lim}:attack=1:release=60:level=false,aresample=48000`, "-ar", "48000", audio]);
  return audio;
}

// ── gates ─────────────────────────────────────────────────────────────────
function gates(file, vo, textLog) {
  const res = [];
  const gate = (n, ok, msg) => res.push({ n, ok, msg });
  const p = JSON.parse(sh(`ffprobe -v error -show_streams -show_format -of json "${file}"`));
  const v = p.streams.find((s) => s.codec_type === "video"), a = p.streams.find((s) => s.codec_type === "audio");
  const fps = v && eval(v.r_frame_rate);
  const head = fs.readFileSync(file).subarray(0, 64 * 1024).toString("latin1");
  const faststart = head.indexOf("moov") > -1 && (head.indexOf("mdat") === -1 || head.indexOf("moov") < head.indexOf("mdat"));
  gate("format", v && v.width === W && v.height === H && Math.abs(fps - FPS) < 0.01 && v.codec_name === "h264" && v.profile === "High" && v.pix_fmt === "yuv420p" && a && +a.sample_rate === 48000 && a.channels === 2 && faststart,
    `${v?.width}x${v?.height} ${fps}fps ${v?.codec_name} ${v?.profile} ${v?.pix_fmt} · ${a?.codec_name} ${a?.sample_rate} ${a?.channels}ch · faststart ${faststart}`);
  const dur = +p.format.duration;
  gate("length", dur <= (spec.maxDur ?? 15) + 0.02 && Math.abs(dur - DUR) < 0.08, `${dur.toFixed(2)} s (cap ${spec.maxDur ?? 15} s)`);
  const lo = sh(`ffmpeg -hide_banner -nostats -i "${file}" -af ebur128=peak=true -f null - 2>&1`);
  const I = +lo.match(/I:\s+(-?[\d.]+) LUFS/g).pop().match(/-?[\d.]+/)[0];
  const TP = +lo.match(/Peak:\s+(-?[\d.]+) dBFS/g).pop().match(/-?[\d.]+/)[0];
  gate("loudness", Math.abs(I - spec.targetLufs) <= 1 && TP <= spec.truePeak + 0.3, `${I} LUFS, true peak ${TP} dBFS`);
  const bd = sh(`ffmpeg -hide_banner -nostats -i "${file}" -vf blackdetect=d=0.2:pix_th=0.08 -an -f null - 2>&1 | grep black_start || true`).trim();
  gate("no black", !bd, bd ? bd.slice(0, 160) : "none");
  const fz = sh(`ffmpeg -hide_banner -nostats -i "${file}" -vf freezedetect=n=0.0008:d=0.6 -an -f null - 2>&1 | grep freeze_start || true`).trim();
  gate("no freeze", !fz, fz ? fz.replace(/\n/g, " ").slice(0, 200) : "none");
  gate("voice fits", vo.every((x) => x.ok), vo.map((x) => `${x.at}+${x.len}`).join(" · "));
  const SAFE = { top: 250, bottom: H - 320, left: 96, right: W - 200 };
  const out = [];
  for (const f of textLog) for (const b of f.boxes) if (b.y < SAFE.top || b.y + b.h > SAFE.bottom || b.x < SAFE.left || b.x + b.w > SAFE.right) out.push(`@${f.t} "${b.text.slice(0, 26)}" [${b.x},${b.y},${b.w}x${b.h}]`);
  gate("safe zone", !out.length, out.length ? [...new Set(out)].slice(0, 6).join(" | ") : "all on-screen text inside");
  const screen = [...new Set(textLog.flatMap((f) => f.boxes.map((b) => b.text)))];
  const copy = [...screen, ...spec.vo.map((x) => x.text)].join(" \n ").toLowerCase();
  const probs = [];
  for (const [re, why] of [[/\bsnap/, "scan, not snap"], [/guarantee/, "no guarantees"], [/money back|get your money/, "claim, never get"],
    [/items sold|item count|number of items|purchase date|the date/, "item count / date must not be named"], [/\/mo\b|per month/, "no subscription price"],
    ...(spec.copyBans || []).map((b) => [new RegExp(b.re, "i"), b.why])]) if (re.test(copy)) probs.push(why);
  if (/costco/.test(copy) && !/not affiliated with costco/.test(copy)) probs.push("Costco named without the not-affiliated line");
  gate("copy", !probs.length, probs.length ? probs.join("; ") : "clean");
  let fail = 0;
  for (const r of res) { if (!r.ok) fail++; log(`${r.ok ? "PASS" : "FAIL"}  ${r.n.padEnd(10)} ${r.msg}`); }
  log(fail ? `\n${fail} gate(s) failed — ${path.basename(file)}` : `\nall ${res.length} gates pass — ${path.basename(file)}`);
  return fail;
}

// ── main ──────────────────────────────────────────────────────────────────
if (STILLS) { await frames(); process.exit(0); }
const vo = await voice();
const fr = await frames();
const audio = mix(vo);
const outDir = path.join(dir, "out");
fs.mkdirSync(outDir, { recursive: true });
const final = path.join(outDir, `priceback-${spec.id}-${spec.lang}.mp4`);
ff(["-i", fr.video, "-i", audio, "-map", "0:v", "-map", "1:a", "-c:v", "copy", "-c:a", "aac", "-b:a", "192k", "-ar", "48000", "-t", String(DUR), "-movflags", "+faststart", final]);
const failed = gates(final, vo, fr.textLog);
process.exit(failed ? 1 : 0);
