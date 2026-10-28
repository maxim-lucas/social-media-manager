// gates.js — every check a tutorial must pass before it is delivered. Exit code 1 on any failure.
//
//   node tools/gates.js <video-dir> [file.mp4]     (default: the file named in build/timeline.json)
//
//  1 format      1080x1920, 30 fps, H.264 High, yuv420p, AAC 48 kHz stereo, faststart
//  2 duration    matches the timeline to within one frame
//  3 loudness    integrated within ±1 LU of target, true peak at or under the ceiling
//  4 black       no black stretch ≥ 0.2 s
//  5 freeze      no frozen stretch ≥ 0.6 s (placeholders and the end card are kept moving on purpose)
//  6 VO fit      every placed line ends ≥ 0.1 s before its shot hands over
//  7 safe zone   every overlay's text box inside the story safe zone (top 250, bottom 320, left 96, right 200)
//  8 copy        banned words absent (snap, guarantee(d), refund/money back promises, "get your money"),
//                Costco named ⇒ not-affiliated line present, "Free to download" ⇒ credit line present,
//                no price for the subscription, item count / date never named
//  9 receipt     only the fake receipt is referenced; framing rule present

const fs = require("fs");
const path = require("path");
const { execFileSync } = require("child_process");

const dir = path.resolve(process.argv[2] || ".");
const spec = JSON.parse(fs.readFileSync(path.join(dir, "shots.json"), "utf8"));
const tl = JSON.parse(fs.readFileSync(path.join(dir, "build/timeline.json"), "utf8"));
const man = JSON.parse(fs.readFileSync(path.join(dir, "build/cards/manifest.json"), "utf8"));
const file = path.resolve(dir, process.argv[3] || tl.final);
const sh = (c) => execFileSync("sh", ["-c", c], { maxBuffer: 64 << 20 }).toString();
const res = [];
const gate = (n, ok, msg) => res.push({ n, ok, msg });

// 1 format
const p = JSON.parse(sh(`ffprobe -v error -show_streams -show_format -of json "${file}"`));
const v = p.streams.find((s) => s.codec_type === "video"), a = p.streams.find((s) => s.codec_type === "audio");
const fps = v && eval(v.r_frame_rate);
const head = fs.readFileSync(file).subarray(0, 64 * 1024).toString("latin1");
const faststart = head.indexOf("moov") > -1 && (head.indexOf("mdat") === -1 || head.indexOf("moov") < head.indexOf("mdat"));
gate(1, v && v.width === spec.w && v.height === spec.h && Math.abs(fps - spec.fps) < 0.01 && v.codec_name === "h264" && v.profile === "High" && v.pix_fmt === "yuv420p"
  && a && a.codec_name === "aac" && +a.sample_rate === 48000 && a.channels === 2 && faststart,
  `${v?.width}x${v?.height} ${fps}fps ${v?.codec_name} ${v?.profile} ${v?.pix_fmt} · ${a?.codec_name} ${a?.sample_rate} ${a?.channels}ch · faststart ${faststart}`);

// 2 duration
const dur = +p.format.duration;
gate(2, Math.abs(dur - tl.total) <= 1 / spec.fps + 0.03, `${dur.toFixed(3)}s vs timeline ${tl.total}s`);

// 3 loudness
const lo = sh(`ffmpeg -hide_banner -nostats -i "${file}" -af ebur128=peak=true -f null - 2>&1`);
const I = +lo.match(/I:\s+(-?[\d.]+) LUFS/g).pop().match(/-?[\d.]+/)[0];
const TP = +lo.match(/Peak:\s+(-?[\d.]+) dBFS/g).pop().match(/-?[\d.]+/)[0];
gate(3, Math.abs(I - spec.targetLufs) <= 1 && TP <= spec.truePeak + 0.3, `I ${I} LUFS (target ${spec.targetLufs}), true peak ${TP} dBFS (ceiling ${spec.truePeak})`);

// 4 black / 5 freeze
const bd = sh(`ffmpeg -hide_banner -nostats -i "${file}" -vf blackdetect=d=0.2:pix_th=0.08 -an -f null - 2>&1 | grep black_start || true`).trim();
gate(4, !bd, bd ? bd.split("\n").length + " black stretch(es): " + bd.slice(0, 160) : "none");
const fz = sh(`ffmpeg -hide_banner -nostats -i "${file}" -vf freezedetect=n=0.0008:d=0.6 -an -f null - 2>&1 | grep freeze_start || true`).trim();
gate(5, !fz, fz ? fz.split("\n").map((l) => l.replace(/.*freeze_start: /, "@")).join(" ") : "none");

// 6 VO fit
const placed = tl.vo || [];
const over = placed.filter((x) => x.at + x.len > x.shotEnd - 0.1);
const expected = spec.shots.filter((s) => s.vo).length + (spec.endcard.vo ? 1 : 0);
gate(6, !over.length && (placed.length === expected || tl.missing.length > 0),
  `${placed.length}/${expected} lines placed` + (over.length ? ` · overrun: ${over.map((x) => x.id).join(", ")}` : " · all fit"));

// 7 safe zone
const SAFE = { top: 250, bottom: spec.h - 320, left: 96, right: spec.w - 200 };
const all = [...man.captions, man.finePrint, man.endcard].filter(Boolean);
const outside = [];
for (const o of all) for (const b of o.boxes) {
  if (b.y < SAFE.top || b.y + b.h > SAFE.bottom || b.x < SAFE.left || b.x + b.w > SAFE.right) outside.push(`${path.basename(o.file)} "${b.text.slice(0, 30)}" [${b.x},${b.y},${b.w}x${b.h}]`);
}
gate(7, !outside.length, outside.length ? outside.join(" | ") : `${all.reduce((n, o) => n + o.boxes.length, 0)} text boxes inside`);

// 8 copy
const copy = [...spec.shots.flatMap((s) => [s.vo?.text, s.caption?.text]), ...Object.values(spec.endcard).map((x) => (x && x.text) || x).filter((x) => typeof x === "string"), spec.finePrint].filter(Boolean).join(" \n ");
const lc = copy.toLowerCase();
const problems = [];
for (const [re, why] of [[/\bsnap/, "say scan, not snap"], [/guarantee/, "no guarantees"], [/money back|refund guaranteed|get your money/, "claim, never get"],
  [/\$\s?\d|\d\s?\$/, "no dollar figures in an evergreen tutorial"], [/items sold|item count|number of items|purchase date|the date/, "item count / date must not be named"],
  [/unlimited.*\$|\/mo/, "never print a subscription price"]]) if (re.test(lc)) problems.push(why);
if (/costco/.test(lc) && !/not affiliated with costco/.test(lc)) problems.push("Costco named without the not-affiliated line");
if (/free to download/.test(lc) && !/1 credit/.test(lc)) problems.push('"Free to download" without the credit line');
const s1 = spec.shots[0];
if (/costco/i.test(s1.vo?.text || "") && !s1.finePrint) problems.push("first shot names Costco without fine print");
gate(8, !problems.length, problems.length ? problems.join("; ") : "clean");

// 9 receipt
const recRefs = spec.shots.filter((s) => (s.refs || []).includes("receipt"));
const badRef = !spec.receipt || !/receipt-example/.test(spec.receipt.png) || !fs.existsSync(path.join(dir, spec.receipt.png));
gate(9, !badRef && !!spec.framingRule && spec.shots.filter((s) => s.type === "screen").every((s) => /receipt-example|example receipt/i.test(s.screen)),
  `${recRefs.length} shots use the fake receipt; screens scan the printout; framing rule ${spec.framingRule ? "set" : "MISSING"}`);

const unverified = (spec.social?.networks || []).filter((n) => !n.verified).map((n) => `${n.name} ${n.handle}`);
if (unverified.length) console.log(`WARN     social handle not verified in the app repo: ${unverified.join(", ")}`);
let fail = 0;
for (const r of res) { if (!r.ok) fail++; console.log(`${r.ok ? "PASS" : "FAIL"}  ${r.n}  ${r.msg}`); }
console.log(fail ? `\n${fail} gate(s) failed — ${path.basename(file)}` : `\nall ${res.length} gates pass — ${path.basename(file)}`);
process.exit(fail ? 1 : 0);
