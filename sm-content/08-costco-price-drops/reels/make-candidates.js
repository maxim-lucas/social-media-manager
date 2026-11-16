/**
 * make-candidates.js: synthesise candidate reel tracks for Maxim to listen to and approve (2026-11-16).
 *
 *   node make-candidates.js 8 [seconds=7.5]
 *
 * Writes music/CANDIDATES/cand-<nn>-<bpm>bpm-<shift>st.wav plus an index.json. Nothing in CANDIDATES is ever used by a
 * reel. To approve one: move the file to music/, add {id, file, bpm, approvedAt} to music/APPROVED.json.
 * Needs python3 with numpy (the same as music_pop.py).
 */
const { spawnSync } = require("child_process");
const fs = require("fs");
const path = require("path");

const BPMS = [92, 96, 100, 104, 108, 112, 116];
const SHIFTS = [-3, -1, 0, 2, 3, 5, 7];

/** @returns {{n:number, bpm:number, shift:number, seed:number}[]} unique tempo/key pairs, calm range 92..116 BPM */
function candidateSpecs(count) {
  const out = [];
  for (let i = 0; out.length < count; i++) {
    const bpm = BPMS[i % BPMS.length];
    const shift = SHIFTS[(i * 3 + Math.floor(i / BPMS.length)) % SHIFTS.length];
    if (bpm === 104 && shift === 0) continue; // the track that has run for two weeks
    if (out.some((s) => s.bpm === bpm && s.shift === shift)) continue;
    out.push({ n: out.length + 1, bpm, shift, seed: 20 + out.length });
    if (i > 500) throw new Error("not enough unique candidates");
  }
  return out;
}

module.exports = { candidateSpecs };

if (require.main === module) {
  const count = Number(process.argv[2] || 8), seconds = process.argv[3] || "7.5";
  const dir = path.join(__dirname, "music", "CANDIDATES");
  fs.mkdirSync(dir, { recursive: true });
  const made = [];
  for (const s of candidateSpecs(count)) {
    const file = `cand-${String(s.n).padStart(2, "0")}-${s.bpm}bpm-${s.shift}st.wav`;
    const r = spawnSync("python3", [path.join(__dirname, "music_pop.py"), seconds, path.join(dir, file)], {
      env: { ...process.env, MUSIC_BPM: String(s.bpm), MUSIC_SHIFT: String(s.shift), MUSIC_SEED: String(s.seed) },
      encoding: "utf8",
    });
    if (r.status !== 0) throw new Error(`music_pop.py failed for ${file}: ${r.stderr}`);
    made.push({ file, ...s });
  }
  fs.writeFileSync(path.join(dir, "index.json"), JSON.stringify(made, null, 2) + "\n");
  console.log(`wrote ${made.length} candidates to ${dir}`);
}
