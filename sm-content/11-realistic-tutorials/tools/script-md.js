// script-md.js — writes SCRIPT.md from shots.json, so the reviewable script can never drift from
// what the pipeline renders.   node tools/script-md.js <video-dir>
const fs = require("fs");
const path = require("path");
const dir = path.resolve(process.argv[2] || ".");
const j = JSON.parse(fs.readFileSync(path.join(dir, "shots.json"), "utf8"));
let t = 0;
const rows = j.shots.map((s) => {
  const a = t; t += s.dur;
  const pic = s.type === "screen" ? `**Real screen recording.** ${s.screen}` : `${s.keyframe}<br>*Motion:* ${s.motion}`;
  return `| ${s.id} | ${a.toFixed(2)}–${t.toFixed(2)} | ${s.beat} | ${pic} | ${s.vo ? "“" + s.vo.text + "”" : ""} | ${s.caption ? s.caption.text.replace(/\n/g, " ") : ""} |`;
});
const e = j.endcard;
const gen = j.shots.filter((s) => s.type === "footage");
const genSec = gen.reduce((n, s) => n + s.genDur, 0);
const md = `# ${j.title} (${j.lang.toUpperCase()}) — script

Generated from \`shots.json\` by \`tools/script-md.js\`. Edit the JSON, not this file.
Length **${(t + e.dur).toFixed(2)} s** · 1080×1920 · ${j.fps} fps · in-app tutorial id \`${j.appTutorialId}\` · facts checked ${j.factsCheckedOn}.

**Look:** ${j.style}

**Receipt rule:** ${j.receipt.rule}

**Framing rule:** ${j.framingRule}

**Character:** ${j.character.name}. ${j.character.refPrompt}

| # | Time (s) | Beat | Picture | Voice-over | On screen |
| --- | --- | --- | --- | --- | --- |
${rows.join("\n")}
| END | ${t.toFixed(2)}–${(t + e.dur).toFixed(2)} | Tutorial outro | Last shot continues, blurred, under the outro card | ${e.vo ? "“" + e.vo.text + "”" : ""} | ${e.head.replace(/\n/g, " ")} · ${e.nextLabel}: ${e.next} · ${e.more} · ${e.follow}: ${j.social.networks.map((n) => `${n.name} ${n.handle}`).join(", ")} · ${e.fine} |

## What gets generated

${gen.length} AI shots, ${genSec} s of Kling 3.0 (std, silent) from ${gen.length} photoreal keyframes plus one character reference.
Screen inserts (${j.shots.filter((s) => s.type === "screen").map((s) => s.id).join(", ")}) are real recordings from the app, made by scanning a **printout** of \`${j.receipt.pdf}\`.
Voice: ${j.voice ? `${j.voice.name}, ${j.voice.engine}, speed ${j.voice.speed}` : "TBD"}. Music: original synthesised bed (\`tools/music.js\`), ducked under the voice.
`;
fs.writeFileSync(path.join(dir, "SCRIPT.md"), md);
console.log("wrote", path.join(path.basename(dir), "SCRIPT.md"));
