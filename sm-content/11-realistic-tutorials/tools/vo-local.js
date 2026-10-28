// vo-local.js — synthesises every VO line in shots.json with Kokoro-82M (Apache-2.0), fully offline,
// via sherpa-onnx's WebAssembly build. Used for the animatic and as a credit-free option for the
// final English voice; the Higgsfield voice is the alternative when credits allow.
//
//   SHERPA=<dir with node_modules/sherpa-onnx> KOKORO=<kokoro-int8-en-v0_19 dir> \
//   node tools/vo-local.js <video-dir> [voiceId=1] [speed=1.0]
//
// Voice ids (kokoro-en-v0_19): 0 AF · 1 Bella · 2 Nicole · 3 Sarah · 4 Sky · 5 Adam · 6 Michael ·
// 7 Emma (UK) · 8 Isabella (UK) · 9 George (UK) · 10 Lewis (UK). Bella is the default.
//
// Prints a fit report: each line must finish ≥0.15 s before its shot hands over to the next one.

const fs = require("fs");
const path = require("path");
const { execFileSync } = require("child_process");

const dir = path.resolve(process.argv[2] || ".");
const sid = Number(process.argv[3] || 1);
const speed = Number(process.argv[4] || 1.0);
const SHERPA = process.env.SHERPA || "/home/claude/tts/sh";
const M = process.env.KOKORO || path.join(SHERPA, "node_modules/n8n-nodes-ttsbro/kokoro-int8-en-v0_19");
const sherpa = require(path.join(SHERPA, "node_modules/sherpa-onnx"));
const spec = JSON.parse(fs.readFileSync(path.join(dir, "shots.json"), "utf8"));
const voDir = path.join(dir, spec.voDir);
fs.mkdirSync(voDir, { recursive: true });

const tts = sherpa.createOfflineTts({
  offlineTtsModelConfig: {
    offlineTtsKokoroModelConfig: { model: M + "/model.int8.onnx", voices: M + "/voices.bin", tokens: M + "/tokens.txt", dataDir: M + "/espeak-ng-data", lengthScale: 1.0 },
    numThreads: 1, debug: 0, provider: "cpu",
  },
  maxNumSentences: 1,
});

let bad = 0;
const lines = [...spec.shots, ...(spec.endcard.vo ? [{ id: "END", dur: spec.endcard.dur, vo: spec.endcard.vo }] : [])];
for (const s of lines) {
  if (!s.vo) continue;
  const raw = path.join(voDir, `${s.id}.raw.wav`);
  const out = path.join(voDir, `${s.id}.wav`);
  const audio = tts.generate({ text: s.vo.text, sid, speed: s.vo.speed || speed });
  tts.save(raw, audio);
  // 48 kHz, trim leading/trailing silence, short fades so no click at the cut.
  execFileSync("ffmpeg", ["-hide_banner", "-v", "error", "-y", "-i", raw, "-af",
    "silenceremove=start_periods=1:start_threshold=-50dB:start_silence=0.02,areverse,silenceremove=start_periods=1:start_threshold=-50dB:start_silence=0.05,areverse,afade=t=in:d=0.01,aresample=48000",
    "-ar", "48000", "-ac", "1", out]);
  fs.unlinkSync(raw);
  const len = Number(execFileSync("ffprobe", ["-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", out]).toString());
  const room = s.dur + (s.id === "END" ? -0.6 : spec.xfade - 0.15) - s.vo.at;
  const ok = len <= room;
  if (!ok) bad++;
  console.log(`${ok ? "ok  " : "LONG"} ${s.id.padEnd(4)} ${len.toFixed(2)}s / room ${room.toFixed(2)}s  “${s.vo.text}”`);
}
if (bad) { console.error(`${bad} line(s) overrun their shot`); process.exit(2); }
