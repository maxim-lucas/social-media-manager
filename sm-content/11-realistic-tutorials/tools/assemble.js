// assemble.js — turns a video's shots.json into the finished 1080x1920 MP4.
//
//   node tools/assemble.js <video-dir> [--out name.mp4]
//
// Works at every stage of production: a shot whose footage (footage/<id>.mp4) or screen recording is
// not in yet is replaced by its previz card from build/cards, so the same command renders the
// animatic today and the final film once the clips land. Run tools/cards.js first.
//
// Pipeline: one silent segment per shot (exact length incl. crossfade overlap) → xfade chain →
// caption / fine-print overlays at absolute times → VO placed per shot, music bed ducked under it,
// two-pass loudness to the spec target → mux (H.264 High, yuv420p, AAC 48 kHz, faststart).

const fs = require("fs");
const path = require("path");
const { execFileSync } = require("child_process");

const dir = path.resolve(process.argv[2] || ".");
const spec = JSON.parse(fs.readFileSync(path.join(dir, "shots.json"), "utf8"));
const outArg = process.argv.indexOf("--out");
const B = path.join(dir, "build");
const CARDS = path.join(B, "cards");
const manifest = JSON.parse(fs.readFileSync(path.join(CARDS, "manifest.json"), "utf8"));
const { w: W, h: H, fps: FPS, xfade: X } = spec;
const ff = (args) => execFileSync("ffmpeg", ["-hide_banner", "-v", "error", "-y", ...args], { stdio: ["ignore", "inherit", "inherit"] });
const probeDur = (f) => Number(execFileSync("ffprobe", ["-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", f]).toString().trim());
const rel = (f) => path.join(dir, f);
const exists = (f) => f && fs.existsSync(rel(f));

const ENC_MID = ["-c:v", "libx264", "-preset", "medium", "-crf", "12", "-pix_fmt", "yuv420p", "-r", String(FPS)];
const COVER = `scale=${W}:${H}:force_original_aspect_ratio=increase:flags=lanczos,crop=${W}:${H},setsar=1,fps=${FPS},format=yuv420p`;

const shots = spec.shots;
const segs = [];
const starts = [];
let t = 0;
const missing = [];

// ── 1. one segment per shot ────────────────────────────────────────────────
shots.forEach((s, i) => {
  starts.push(t);
  const L = +(s.dur + X).toFixed(3); // every shot is followed by another shot or the end card
  const seg = path.join(B, `seg-${String(i).padStart(2, "0")}-${s.id}.mp4`);
  const src = s.type === "screen" ? s.src : `footage/${s.id}.mp4`;
  const frames = Math.round(L * FPS);
  if (exists(src)) {
    const avail = probeDur(rel(src)) - (s.trimIn || 0);
    if (avail + 1e-3 < L) throw new Error(`${s.id}: source has ${avail.toFixed(2)}s after trim, needs ${L}s`);
    let vf = COVER;
    if (s.type === "screen") {
      // Real screen recording, inset over a blurred fill of itself, with a soft paper border.
      vf = `split[a][b];[a]${COVER},gblur=sigma=40,eq=brightness=-0.06[bg];` +
        `[b]scale=-2:1500:flags=lanczos,pad=iw+16:ih+16:8:8:color=0xf6f0e5[fg];[bg][fg]overlay=(W-w)/2:(H-h)/2-40,format=yuv420p`;
    }
    ff(["-ss", String(s.trimIn || 0), "-i", rel(src), "-an", "-filter_complex", vf, "-frames:v", String(frames), ...ENC_MID, seg]);
  } else {
    missing.push(s.id);
    const ph = path.join(CARDS, `ph-${s.id}.png`);
    ff(["-loop", "1", "-framerate", String(FPS), "-i", ph, "-an", "-vf",
      `scale=${Math.round(W * 1.06)}:${Math.round(H * 1.06)},crop=${W}:${H}:x='${Math.round(W * 0.06)}*t/${L}':y='${Math.round(H * 0.03)}*t/${L}',format=yuv420p`,
      "-frames:v", String(frames), ...ENC_MID, seg]);
  }
  segs.push(seg);
  t += s.dur;
});

// ── end card: last frame of the last shot, blurred, slow push, card on top ─
const ecStart = t;
const lastFrame = path.join(B, "last-frame.png");
ff(["-sseof", "-0.05", "-i", segs[segs.length - 1], "-frames:v", "1", "-update", "1", lastFrame]);
const ecSeg = path.join(B, "seg-99-endcard.mp4");
const ecFrames = Math.round(spec.endcard.dur * FPS);
ff(["-loop", "1", "-framerate", String(FPS), "-i", lastFrame, "-loop", "1", "-framerate", String(FPS), "-i", path.join(CARDS, "endcard.png"),
  "-filter_complex",
  `[0]scale=${Math.round(W * 1.12)}:${Math.round(H * 1.12)},crop=${W}:${H}:x='${Math.round(W * 0.12)}*t/${spec.endcard.dur}':y='${Math.round(H * 0.06)}*(1-t/${spec.endcard.dur})',gblur=sigma=22[bg];` +
  // The card breathes (≈2.5 % over the hold) so the end card never reads as a frozen frame.
  `[1]format=rgba,fade=t=in:st=0.15:d=0.45:alpha=1,scale=w='trunc(${W}*(1+0.0065*t)/2)*2':h=-2:eval=frame[ec];` +
  `[bg][ec]overlay=x='(W-w)/2':y='(H-h)/2':shortest=1,format=yuv420p`,
  "-frames:v", String(ecFrames), ...ENC_MID, ecSeg]);
segs.push(ecSeg);
const total = +(t + spec.endcard.dur).toFixed(3);

// ── 2. crossfade chain ─────────────────────────────────────────────────────
const joined = path.join(B, "joined.mp4");
{
  const inputs = segs.flatMap((s) => ["-i", s]);
  let fc = "", last = "[0:v]", acc = 0;
  for (let i = 1; i < segs.length; i++) {
    acc += shots[i - 1].dur;
    const o = i === segs.length - 1 ? "[v]" : `[x${i}]`;
    fc += `${last}[${i}:v]xfade=transition=fade:duration=${X}:offset=${acc.toFixed(3)}${o};`;
    last = o;
  }
  ff([...inputs, "-filter_complex", fc.slice(0, -1), "-map", "[v]", ...ENC_MID, joined]);
}

// ── 3. overlays ────────────────────────────────────────────────────────────
const overlays = [];
for (const c of manifest.captions) {
  const i = shots.findIndex((s) => s.id === c.shot);
  overlays.push({ file: path.join(dir, c.file), a: starts[i] + c.at, b: starts[i] + c.until, fi: c.fadeIn, fo: c.fadeOut });
}
shots.forEach((s, i) => {
  if (s.finePrint && manifest.finePrint) overlays.push({ file: path.join(dir, manifest.finePrint.file), a: starts[i] + 0.2, b: starts[i] + s.dur, fi: true, fo: true });
});
const captioned = path.join(B, "captioned.mp4");
{
  const inputs = ["-i", joined];
  let fc = "", last = "[0:v]";
  overlays.forEach((o, k) => {
    inputs.push("-loop", "1", "-framerate", String(FPS), "-t", String(total), "-i", o.file);
    const fades = [o.fi ? `fade=t=in:st=${o.a.toFixed(3)}:d=0.22:alpha=1` : "", o.fo ? `fade=t=out:st=${(o.b - 0.22).toFixed(3)}:d=0.22:alpha=1` : ""].filter(Boolean).join(",");
    fc += `[${k + 1}:v]format=rgba${fades ? "," + fades : ""}[o${k}];`;
    const out = k === overlays.length - 1 ? "[v]" : `[c${k}]`;
    fc += `${last}[o${k}]overlay=0:0:enable='between(t,${o.a.toFixed(3)},${o.b.toFixed(3)})':eof_action=pass${out};`;
    last = out;
  });
  ff([...inputs, "-filter_complex", fc.slice(0, -1), "-map", "[v]", "-t", String(total), ...ENC_MID, captioned]);
}

// ── 4. audio ───────────────────────────────────────────────────────────────
const voPlaced = [];
shots.forEach((s, i) => {
  const f = path.join(dir, spec.voDir, `${s.id}.wav`);
  if (s.vo && fs.existsSync(f)) voPlaced.push({ id: s.id, file: f, at: starts[i] + s.vo.at, len: probeDur(f), shotEnd: starts[i] + s.dur + X });
});
if (spec.endcard.vo) {
  const f = path.join(dir, spec.voDir, "END.wav");
  if (fs.existsSync(f)) voPlaced.push({ id: "END", file: f, at: ecStart + spec.endcard.vo.at, len: probeDur(f), shotEnd: total - 0.5 });
}
const mix = path.join(B, "mix.wav");
{
  const music = path.join(dir, spec.music.file);
  const inputs = ["-i", music, ...voPlaced.flatMap((v) => ["-i", v.file])];
  let fc = `[0:a]aformat=sample_rates=48000:channel_layouts=stereo,atrim=0:${total},aecho=0.8:0.6:60|90:0.18|0.12,volume=${spec.music.gainDb}dB[mus];`;
  if (voPlaced.length) {
    voPlaced.forEach((v, k) => {
      const ms = Math.round(v.at * 1000);
      fc += `[${k + 1}:a]aformat=sample_rates=48000:channel_layouts=stereo,highpass=f=80,acompressor=threshold=-20dB:ratio=3:attack=5:release=120,adelay=${ms}|${ms}[v${k}];`;
    });
    fc += `${voPlaced.map((_, k) => `[v${k}]`).join("")}amix=inputs=${voPlaced.length}:normalize=0,apad=whole_dur=${total}[vo];`;
    fc += `[vo]asplit[vo1][key];[mus][key]sidechaincompress=threshold=0.02:ratio=${Math.max(2, spec.music.duckDb / 1.5).toFixed(1)}:attack=40:release=450[duck];`;
    fc += `[duck][vo1]amix=inputs=2:normalize=0,atrim=0:${total}[out]`;
  } else {
    fc += `[mus]atrim=0:${total}[out]`;
  }
  ff([...inputs, "-filter_complex", fc, "-map", "[out]", "-ar", "48000", "-ac", "2", mix]);
}
// two-pass loudness
const target = `I=${spec.targetLufs}:TP=${spec.truePeak}:LRA=11`;
const meas = execFileSync("sh", ["-c", `ffmpeg -hide_banner -i "${mix}" -af loudnorm=${target}:print_format=json -f null - 2>&1`]).toString();
const m = JSON.parse(meas.slice(meas.lastIndexOf("{"), meas.lastIndexOf("}") + 1));
const audio = path.join(B, "audio.wav");
// Linear gain to target, then a brick-wall limiter 1 dB under the ceiling: AAC encoding adds ~0.5 dB of
// inter-sample overshoot, so limiting at the ceiling itself would fail gate 3 after encode.
const lim = Math.pow(10, (spec.truePeak - 1) / 20).toFixed(4);
ff(["-i", mix, "-af", `loudnorm=${target}:measured_I=${m.input_i}:measured_TP=${m.input_tp}:measured_LRA=${m.input_lra}:measured_thresh=${m.input_thresh}:offset=${m.target_offset}:linear=true,aresample=192000,alimiter=limit=${lim}:attack=1:release=60:level=false,aresample=48000`, "-ar", "48000", audio]);

// ── 5. mux ─────────────────────────────────────────────────────────────────
const outDir = path.join(dir, missing.length ? "previz" : "out");
fs.mkdirSync(outDir, { recursive: true });
const name = outArg > 0 ? process.argv[outArg + 1] : `priceback-tutorial-${spec.id}-${missing.length ? "animatic-" : ""}${spec.lang}.mp4`;
const final = path.join(outDir, name);
ff(["-i", captioned, "-i", audio, "-map", "0:v", "-map", "1:a", "-c:v", "libx264", "-profile:v", "high", "-preset", "slow", "-crf", "18",
  "-pix_fmt", "yuv420p", "-r", String(FPS), "-c:a", "aac", "-b:a", "192k", "-ar", "48000", "-t", String(total), "-movflags", "+faststart", final]);

fs.writeFileSync(path.join(B, "timeline.json"), JSON.stringify({
  total, starts: Object.fromEntries(shots.map((s, i) => [s.id, +starts[i].toFixed(3)])), endcardStart: ecStart,
  vo: voPlaced.map((v) => ({ id: v.id, at: +v.at.toFixed(3), len: +v.len.toFixed(3), shotEnd: +v.shotEnd.toFixed(3) })),
  missing, final: path.relative(dir, final),
}, null, 2));
console.log(`assembled ${path.relative(dir, final)} · ${total}s · placeholders: ${missing.join(", ") || "none"} · VO lines: ${voPlaced.length}/${shots.filter((s) => s.vo).length + (spec.endcard.vo ? 1 : 0)}`);
