// music.js — a calm, original instrumental bed for the tutorials, synthesised from scratch so it is
// ours outright (no licence, no attribution, safe for paid placements). It is a BED: it sits ~19 dB
// under the voice and is ducked further while the voice speaks. For organic posts, trending audio
// can still be added in-app at post time; this file is for YouTube, the in-app tutorials and paid.
//
//   node tools/music.js <seconds> <out.wav>
//
// 84 BPM, soft electric-piano chords (Fmaj7 · Am7 · Dm7 · Cmaj7/E · Bbmaj7 · C6), round sub bass,
// a felt kick on 1 and 3 and a quiet shaker. Ends on a held tonic so the end card can ring out.

const fs = require("fs");
const SR = 48000;
const secs = Number(process.argv[2] || 45);
const out = process.argv[3] || "bed.wav";
const N = Math.ceil(secs * SR);
const L = new Float32Array(N), R = new Float32Array(N);

const BPM = 84, BEAT = 60 / BPM, BAR = 4 * BEAT;
const mtof = (m) => 440 * Math.pow(2, (m - 69) / 12);
// Voicings (MIDI). Bass root is separate.
const PROG = [
  { root: 41, notes: [57, 60, 64, 69] },  // Fmaj7
  { root: 45, notes: [55, 60, 64, 67] },  // Am7
  { root: 38, notes: [57, 60, 62, 65] },  // Dm7
  { root: 40, notes: [55, 59, 64, 67] },  // Cmaj7/E
  { root: 46, notes: [57, 58, 62, 65] },  // Bbmaj7
  { root: 36, notes: [57, 60, 64, 67] },  // C6
];
let seed = 7;
const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);

function addNote(t0, dur, freq, amp, pan, kind) {
  const s0 = Math.floor(t0 * SR), n = Math.floor((dur + 1.6) * SR);
  const gl = Math.cos((pan + 1) * Math.PI / 4), gr = Math.sin((pan + 1) * Math.PI / 4);
  for (let i = 0; i < n && s0 + i < N; i++) {
    const t = i / SR;
    let env;
    if (kind === "ep") {
      const a = Math.min(1, t / 0.012);
      const rel = t > dur ? Math.exp(-(t - dur) * 3.2) : 1;
      env = a * Math.exp(-t * 0.9) * rel;
      const ph = 2 * Math.PI * freq * t;
      const trem = 1 + 0.06 * Math.sin(2 * Math.PI * 4.6 * t);
      const v = (Math.sin(ph) + 0.32 * Math.sin(2 * ph) * Math.exp(-t * 3) + 0.12 * Math.sin(3 * ph) * Math.exp(-t * 6)
        + 0.05 * Math.sin(ph * 4.2) * Math.exp(-t * 18)) * env * trem * amp;
      L[s0 + i] += v * gl; R[s0 + i] += v * gr;
    } else if (kind === "bass") {
      const a = Math.min(1, t / 0.02);
      const rel = t > dur ? Math.exp(-(t - dur) * 8) : 1;
      env = a * Math.exp(-t * 0.6) * rel;
      const ph = 2 * Math.PI * freq * t;
      const v = (Math.sin(ph) + 0.18 * Math.sin(2 * ph)) * env * amp;
      L[s0 + i] += v; R[s0 + i] += v;
    }
  }
}
function kick(t0, amp) {
  const s0 = Math.floor(t0 * SR);
  for (let i = 0; i < 0.35 * SR && s0 + i < N; i++) {
    const t = i / SR, f = 48 + 70 * Math.exp(-t * 28);
    const v = Math.sin(2 * Math.PI * f * t) * Math.exp(-t * 11) * amp;
    L[s0 + i] += v; R[s0 + i] += v;
  }
}
function shaker(t0, amp, pan) {
  const s0 = Math.floor(t0 * SR); let y = 0, x1 = 0;
  for (let i = 0; i < 0.09 * SR && s0 + i < N; i++) {
    const t = i / SR, w = rnd() * 2 - 1; y = w - x1; x1 = w; // crude high-pass
    const env = Math.min(1, t / 0.008) * Math.exp(-t * 45);
    const v = y * env * amp;
    L[s0 + i] += v * (1 - pan) ; R[s0 + i] += v * (1 + pan);
  }
}

const bars = Math.ceil(secs / BAR);
const endHold = secs - 4.0; // last ~4 s: one held tonic chord for the end card
for (let b = 0; b < bars; b++) {
  const t = b * BAR;
  if (t >= endHold) break;
  const ch = PROG[b % PROG.length];
  const intro = b === 0;
  // Chord: lightly strummed, re-struck on beat 3 at lower velocity.
  ch.notes.forEach((m, k) => addNote(t + k * 0.018, BAR * 0.5, mtof(m), 0.085, -0.35 + k * 0.23, "ep"));
  ch.notes.forEach((m, k) => addNote(t + 2 * BEAT + k * 0.014, BAR * 0.45, mtof(m), 0.05, -0.35 + k * 0.23, "ep"));
  // A small melodic answer on the "and" of 4, every other bar.
  if (b % 2 === 1) addNote(t + 3.5 * BEAT, BEAT * 0.9, mtof(ch.notes[3] + 12), 0.035, 0.4, "ep");
  addNote(t, BAR * 0.95, mtof(ch.root), 0.16, 0, "bass");
  if (!intro) {
    kick(t, 0.32); kick(t + 2 * BEAT, 0.26);
    for (let e = 0; e < 8; e++) shaker(t + e * BEAT / 2 + (e % 2 ? 0.012 : 0), e % 2 ? 0.018 : 0.011, 0.3);
  }
}
// Final tonic.
const tEnd = Math.max(0, endHold);
[48, 55, 60, 64, 67, 72].forEach((m, k) => addNote(tEnd + k * 0.03, 3.2, mtof(m), 0.07, -0.4 + k * 0.16, "ep"));
addNote(tEnd, 3.2, mtof(36), 0.15, 0, "bass");

// Fade in/out and write 16-bit stereo WAV.
let peak = 0;
for (let i = 0; i < N; i++) {
  const t = i / SR, g = Math.min(1, t / 0.8) * Math.min(1, (secs - t) / 1.2);
  L[i] *= g; R[i] *= g; peak = Math.max(peak, Math.abs(L[i]), Math.abs(R[i]));
}
const norm = 0.7 / (peak || 1);
const buf = Buffer.alloc(44 + N * 4);
buf.write("RIFF", 0); buf.writeUInt32LE(36 + N * 4, 4); buf.write("WAVE", 8); buf.write("fmt ", 12);
buf.writeUInt32LE(16, 16); buf.writeUInt16LE(1, 20); buf.writeUInt16LE(2, 22); buf.writeUInt32LE(SR, 24);
buf.writeUInt32LE(SR * 4, 28); buf.writeUInt16LE(4, 32); buf.writeUInt16LE(16, 34); buf.write("data", 36); buf.writeUInt32LE(N * 4, 40);
for (let i = 0; i < N; i++) {
  buf.writeInt16LE(Math.round(Math.max(-1, Math.min(1, L[i] * norm)) * 32767), 44 + i * 4);
  buf.writeInt16LE(Math.round(Math.max(-1, Math.min(1, R[i] * norm)) * 32767), 46 + i * 4);
}
fs.writeFileSync(out, buf);
console.log(`music: ${secs}s bed → ${out}`);
