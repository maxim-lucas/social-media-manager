// gen-plan.js — the exact Higgsfield calls for a video's AI footage, in order, with the credit cost of each.
//
//   node tools/gen-plan.js <video-dir>      prints the plan and writes build/gen-plan.json
//
// Order matters: (1) the character reference, (2) one keyframe per AI shot, each referencing the
// character and/or the uploaded fake receipt, (3) Kling 3.0 image-to-video from each approved keyframe.
// Keyframes are reviewed before any video is spent on them: a keyframe costs 2, a clip 7.5–10.5.
// Generated clips are saved as footage/<shot>.mp4; assemble.js picks them up automatically.

const fs = require("fs");
const path = require("path");
const dir = path.resolve(process.argv[2] || ".");
const j = JSON.parse(fs.readFileSync(path.join(dir, "shots.json"), "utf8"));
const COST = { image: 2, klingPerSec: 1.5 }; // priced with get_cost on 2026-10-28

const steps = [];
steps.push({ step: "upload", what: "fake receipt reference", file: j.receipt.png, credits: 0 });
steps.push({ step: "image", id: "CHAR", model: j.character.refModel, aspect_ratio: "9:16", resolution: j.character.refRes, prompt: j.character.refPrompt, credits: COST.image });
for (const s of j.shots.filter((x) => x.type === "footage")) {
  const refs = (s.refs || []).map((r) => (r === "character" ? "job:CHAR" : "media:receipt"));
  steps.push({ step: "image", id: `KF-${s.id}`, model: "nano_banana_pro", aspect_ratio: "9:16", resolution: "2k", refs,
    prompt: `${s.keyframe} ${j.style}${(s.refs || []).includes("receipt") ? " The receipt is exactly the supplied example receipt image." : ""}`, credits: COST.image });
}
for (const s of j.shots.filter((x) => x.type === "footage")) {
  steps.push({ step: "video", id: s.id, model: s.model, mode: "std", sound: "off", aspect_ratio: "9:16", duration: s.genDur,
    start_image: `job:KF-${s.id}`, prompt: `${s.motion} Photorealistic, natural, no text, no logos.`, save_as: `footage/${s.id}.mp4`, credits: s.genDur * COST.klingPerSec });
}
const total = steps.reduce((n, s) => n + s.credits, 0);
fs.mkdirSync(path.join(dir, "build"), { recursive: true });
fs.writeFileSync(path.join(dir, "build/gen-plan.json"), JSON.stringify({ total, steps }, null, 2));
for (const s of steps) console.log(`${String(s.credits).padStart(5)}  ${s.step.padEnd(6)} ${(s.id || "").padEnd(7)} ${s.model || s.what}${s.duration ? " " + s.duration + "s" : ""}${s.refs?.length ? " refs " + s.refs.join("+") : ""}`);
console.log(`${String(total).padStart(5)}  credits, first pass (add ~50% reserve for retakes)`);
