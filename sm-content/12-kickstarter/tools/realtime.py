"""realtime.py: fit the real-recording cut to the voice-over, never the voice to the cut.

  python tools/realtime.py <edl.json> <SCRIPT-x.md> <voiceover.json> <voiceover.wav> <out-edl.json> <out-voice.wav>

Each script row names an anchor scene and the still scenes that may be held for it:
    | 7 | membership ; membership | It's tailored to ... | — |
A line starts LEAD after its anchor scene starts. When the previous line is still speaking, the previous
line's hold scenes freeze their last frame (split evenly) until it has finished, plus GAP. The last line gets
TAIL seconds before the end. Writes the EDL with a hold column (tools/realcut.py) and the voice track laid
on the video's clock, as long as the video.

One take, not a cut-up (Maxim, 2026-11-10: "as if I am doing the narration while on video"): the lines are
laid from the voice-over's RAW track (voiceover.py's work/<version>-<tag>-<lang>-<take>-raw.wav, before any
processing), each with a short fade so no edit clicks, and voiceover.py's polish (EQ, compression,
loudness) runs ONCE over the whole voice, so level and tone never jump between lines; a quiet room-tone bed is
mixed in after it (at a fixed level, so loudness never pumps it up) so a pause is never dead digital silence.
"""
import json
import os
import subprocess
import sys
import wave

import numpy as np

FPS = 30
LEAD = 0.25   # the scene shows first, then the voice
GAP = 0.35    # breath between two lines
TAIL = 1.6    # the last frame stays after the last word
FADE = 0.012  # seconds faded in/out at each line's edges
ROOM = "anoisesrc=color=pink:amplitude=0.0035:sample_rate={sr},lowpass=f=5000,highpass=f=120"  # room tone
FFMPEG = os.environ.get("FFMPEG", "E:/tools/video/node_modules/ffmpeg-static/ffmpeg.exe")


def script_rows(path):
    out = []
    for line in open(path, encoding="utf-8"):
        cells = [c.strip() for c in line.strip().strip("|").split("|")]
        if len(cells) == 4 and cells[0].isdigit():
            anchor, holds = (p.strip() for p in cells[1].split(";"))
            out.append({"line": int(cells[0]), "anchor": anchor, "holds": holds.split(), "text": cells[2]})
    return out


def frames(seg):
    _, src, a, b, speed = seg[:5]
    return int(round((b - a) * FPS)) if src is None else int(round((b - a) / speed * FPS))


def starts(edl, holds):
    t, out = 0.0, {}
    for seg in edl:
        out[seg[0]] = t
        t += frames(seg) / FPS + holds[seg[0]]
    return out, t


def main(edl_path, script_path, vo_json, vo_wav, out_edl, out_wav):
    edl = [list(e[:5]) for e in json.load(open(edl_path, encoding="utf-8"))]
    order = [e[0] for e in edl]
    rows = script_rows(script_path)
    voice = {l["line"]: l for l in json.load(open(vo_json, encoding="utf-8"))["lines"]}
    holds = {k: 0.0 for k in order}
    placed = []
    for i, r in enumerate(rows):
        assert r["anchor"] in holds and all(h in holds for h in r["holds"]), r
        if i:
            prev = rows[i - 1]
            span = order[order.index(prev["anchor"]):order.index(r["anchor"])]
            assert all(h in span for h in prev["holds"]), (prev["line"], prev["holds"], "outside its scenes")
            need = placed[-1]["end"] + GAP - (starts(edl, holds)[0][r["anchor"]] + LEAD)
            if need > 0:
                for h in prev["holds"]:
                    holds[h] += need / len(prev["holds"])
        st = starts(edl, holds)[0][r["anchor"]] + LEAD
        v = voice[r["line"]]
        placed.append({"line": r["line"], "start": st, "end": st + v["end"] - v["start"],
                       "src": (v["start"], v["end"])})
    total = starts(edl, holds)[1]
    tail = placed[-1]["end"] + TAIL - total
    if tail > 0:
        for h in rows[-1]["holds"]:
            holds[h] += tail / len(rows[-1]["holds"])
    # holds rounded to whole frames, the way realcut.py writes them
    holds = {k: round(v * FPS) / FPS for k, v in holds.items()}
    pos, total = starts(edl, holds)
    end = -GAP
    for p, r in zip(placed, rows):   # re-placed on the rounded clock (anchors move by < 1 frame)
        p["start"] = max(pos[r["anchor"]] + LEAD, end + GAP)
        p["end"] = end = p["start"] + p["src"][1] - p["src"][0]

    with wave.open(vo_wav) as w:   # the RAW take: polish comes after, over the whole track
        sr = w.getframerate()
        x = np.frombuffer(w.readframes(w.getnframes()), dtype=np.int16).astype(np.float32)
    track = np.zeros(int(total * sr) + sr, np.float32)
    nf = int(FADE * sr)
    ramp = np.linspace(0, 1, nf, dtype=np.float32)
    for p in placed:
        a, b = int(p["src"][0] * sr), int(p["src"][1] * sr)
        clip = x[a:b].copy()
        clip[:nf] *= ramp
        clip[-nf:] *= ramp[::-1]
        o = int(p["start"] * sr)
        track[o:o + len(clip)] += clip
    track = track[:int(total * sr)]
    laid = out_wav.replace(".wav", "-laid.wav")
    with wave.open(laid, "wb") as w:
        w.setnchannels(1); w.setsampwidth(2); w.setframerate(sr)
        w.writeframes(np.clip(track, -32768, 32767).astype(np.int16).tobytes())
    from voiceover import POLISH
    subprocess.run([FFMPEG, "-v", "error", "-y", "-i", laid, "-f", "lavfi", "-t", f"{total:.3f}",
                    "-i", ROOM.format(sr=sr), "-filter_complex",
                    f"[0:a]{POLISH},aresample={sr}[v];[v][1:a]amix=inputs=2:duration=first:normalize=0[a]",
                    "-map", "[a]",
                    "-ar", "48000", out_wav], check=True)

    json.dump([e + [holds[e[0]]] for e in edl], open(out_edl, "w", encoding="utf-8"), indent=0)
    for p in placed:
        print(f"line {p['line']:2d}  {p['start']:6.2f} -> {p['end']:6.2f}")
    print("holds:", {k: v for k, v in holds.items() if v})
    print(f"video {total:.1f}s")


if __name__ == "__main__":
    main(*sys.argv[1:7])
