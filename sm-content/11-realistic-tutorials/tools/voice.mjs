// voice.mjs — natural voice-over, free and fully local: Kokoro-82M v1.0 (Apache-2.0), 8-bit model.
//
//   node tools/voice.mjs <out.wav> <voice> <speed> <text…>
//   import { speak } from "./voice.mjs"   →  await speak(text, outWav, { voice, speed })
//
// The model, its tokenizer and the voices come from npm (expo-kokoro ships the official v1.0 q8 ONNX,
// sha256 fbae9257…, and the v1.0 tokenizer.json; kokoro-js ships the voices and the phonemizer), so
// nothing is downloaded from a model hub and nothing is paid for. First call builds a local model
// folder (.kokoro-v1/) the loader understands.
//
// Voices worth using: af_heart (EN, warmest; default) · af_bella · am_michael · bf_emma (UK) ·
// ff_siwis (FR, France accent: check with a Quebec ear before a French cut).

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { execFileSync } from "node:child_process";
import { env } from "@huggingface/transformers";
import { KokoroTTS } from "kokoro-js";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const MODEL_ROOT = path.join(HERE, ".kokoro-v1");
const MODEL = path.join(MODEL_ROOT, "kokoro-v1");

function ensureModelDir() {
  const src = path.join(HERE, "node_modules/expo-kokoro/build");
  fs.mkdirSync(path.join(MODEL, "onnx"), { recursive: true });
  const onnx = path.join(MODEL, "onnx/model_quantized.onnx");
  if (!fs.existsSync(onnx)) fs.copyFileSync(path.join(src, "kokoro-quantized.onnx"), onnx);
  fs.copyFileSync(path.join(src, "tokenizer.json"), path.join(MODEL, "tokenizer.json"));
  fs.writeFileSync(path.join(MODEL, "config.json"), JSON.stringify({ model_type: "style_text_to_speech_2", architectures: ["StyleTextToSpeech2Model"] }));
  fs.writeFileSync(path.join(MODEL, "tokenizer_config.json"), JSON.stringify({ model_max_length: 512, pad_token: "$", unk_token: "$", tokenizer_class: "PreTrainedTokenizer" }));
}

let ttsP = null;
async function tts() {
  if (!ttsP) {
    ensureModelDir();
    env.allowRemoteModels = false;
    env.localModelPath = MODEL_ROOT + "/";
    ttsP = KokoroTTS.from_pretrained("kokoro-v1", { dtype: "q8", device: "cpu" });
  }
  return ttsP;
}

/** Speak `text` into `out` (48 kHz mono WAV, silence trimmed). Returns the duration in seconds. */
export async function speak(text, out, { voice = "af_heart", speed = 1 } = {}) {
  const model = await tts();
  const audio = await model.generate(text, { voice, speed });
  const raw = out.replace(/\.wav$/, ".raw.wav");
  await audio.save(raw);
  execFileSync("ffmpeg", ["-hide_banner", "-v", "error", "-y", "-i", raw, "-af",
    "silenceremove=start_periods=1:start_threshold=-50dB:start_silence=0.02,areverse,silenceremove=start_periods=1:start_threshold=-50dB:start_silence=0.06,areverse,afade=t=in:d=0.01,aresample=48000",
    "-ar", "48000", "-ac", "1", out]);
  fs.unlinkSync(raw);
  return Number(execFileSync("ffprobe", ["-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", out]).toString());
}

if (process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1])) {
  const [out, voice = "af_heart", speed = "1", ...words] = process.argv.slice(2);
  const d = await speak(words.join(" "), path.resolve(out), { voice, speed: Number(speed) });
  console.log(`${out} ${d.toFixed(2)}s`);
}
