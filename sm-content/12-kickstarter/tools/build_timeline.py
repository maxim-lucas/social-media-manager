"""build_timeline.py: the picture follows the voice. Chosen voice-over take -> scenes/timeline.js + the final track.

    [FILM=tag|translator] E:/tools/chatterbox/.venv/Scripts/python.exe sm-content/12-kickstarter/tools/build_timeline.py audio/voiceover-en-v5-C-s2.json

The scenes (scenes/app-recording.html) were laid out on a fixed 46 s clock ("picture time"). Each voice line is
anchored to the picture moment it describes (ANCHORS); between anchors the picture plays faster (down to a floor,
so taps stay readable) or holds, so that every line fits before the next scene and no dead air is left.
Writes:
- scenes/timeline.js       window.TIMELINE = {duration, warp: [[video t, picture t]...], captions: [[a, b, text]...]}
- audio/voiceover-final-<lang>.wav   each line of the take placed at its video time (48 kHz, already polished)
"""
import json
import os
import re
import sys
import wave

import numpy as np

PACK = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
LEAD = 0.15   # the line starts this long after its scene
TAIL = 0.40   # breathing room after the line before the next scene
# Per film: (picture time, voice line or None, slowest compression allowed for the actions of this segment)
FILMS = {}
FILMS["kickstarter"] = [
    (3.6, 1, 0.62),    # Home (empty) -> Scan -> document scanner: "Scan any Costco receipt, paper or PDF."
    (10.8, 2, 0.75),   # scanning -> Confirm: "PriceBack reads every item and finds the warehouse on the receipt…"
    (13.0, 3, 0.75),   # Confirm top (warehouse, Online / Warehouse Purchase): "Warehouses and Business Centres…"
    (14.0, 4, 0.75),   # items scroll -> Start Tracking: "Check the details, and start tracking."
    (18.8, 5, 0.75),   # date chip "6 days later" -> daily summary -> $47: "Six days later, real price drops…"
    (23.0, None, 0.6),  # $47 to claim, held
    (26.0, 6, 0.62),   # Oct 31 -> Upload file -> PDF -> Confirm -> Start Tracking: "Bought something two weeks ago?…"
    (34.0, 7, 0.75),   # clock 9:44 -> TV alert -> receipt detail: "Minutes later: five hundred dollars off…"
    (38.8, 8, 0.75),   # Claim instructions: "Show your receipt at the warehouse, and claim the difference."
    (42.6, None, 1.0),  # $547 to claim -> PriceBack end card (silent)
    (46.0, None, None),
]
FILMS["tag"] = [
    (0.0, 1, 0.75),    # Scan -> Price tag -> live camera on the tag -> shutter
    (6.4, 2, 0.8),     # Reading the tag… -> Confirm the price
    (8.8, 3, 0.8),     # Tag details: clean scan, savings tag, Good deal
    (11.6, 4, 0.75),   # fields scroll -> Submit -> Confirm your warehouse -> Yes
    (17.4, 5, 0.8),    # Thanks for contributing! (pending crowd verification)
    (22.0, None, 1.0),  # PriceBack end card (silent)
    (24.0, None, None),
]
FILMS["translator"] = [
    (0.0, 1, 0.8),     # Scan -> Price translator (idle)
    (4.4, 2, 0.8),     # tap the field, type 14.97 -> Good deal · Corporate markdown
    (10.4, 3, 0.8),    # erase, type 9.00 -> Best price · Manager markdown
    (15.2, 4, 0.8),    # star toggle -> Death Star note
    (19.4, 5, 0.8),    # keyboard away -> Works without internet
    (22.7, None, 1.0),  # PriceBack end card (silent)
    (24.7, None, None),
]
# Captions show amounts and price endings as figures (easier to read muted, e.g. on Instagram).
FIGURES = [("Forty-seven dollars", "$47"), ("sixteen dollars", "$16"), ("twelve on", "$12 on"),
           ("five hundred dollars", "$500"), ("six hundred", "$600"), ("ninety-seven", ".97"), ("zero zero", ".00")]


def read_wav(path):
    with wave.open(path) as w:
        sr = w.getframerate()
        x = np.frombuffer(w.readframes(w.getnframes()), dtype=np.int16).astype(np.float32) / 32768
        if w.getnchannels() == 2:
            x = x.reshape(-1, 2).mean(axis=1)
    return x, sr


def write_wav(path, x, sr):
    with wave.open(path, "wb") as w:
        w.setnchannels(1); w.setsampwidth(2); w.setframerate(sr)
        w.writeframes((np.clip(x, -1, 1) * 32767).astype(np.int16).tobytes())


def caption(text):
    for a, b in FIGURES:
        text = re.sub(a, b, text, flags=re.I)
    return text


def main(take_json, film="kickstarter"):
    ANCHORS = FILMS[film]
    take = json.load(open(take_json, encoding="utf-8"))
    lines = {l["line"]: l for l in take["lines"]}
    voice, sr = read_wav(take_json.replace(".json", ".wav"))
    lang = "fr" if "-fr-" in os.path.basename(take_json) else "en"

    warp, captions, placed, t = [], [], [], 0.0
    for (old, n, floor), (old_next, _, _) in zip(ANCHORS, ANCHORS[1:]):
        warp.append([round(t, 3), old])
        span = (old_next - old) * floor
        if n is not None:
            l = lines[n]
            need = LEAD + (l["end"] - l["start"]) + TAIL
            span = max(span, need)
            start = t + LEAD
            placed.append((start, l))
            captions.append([round(start, 3), round(start + l["end"] - l["start"], 3), caption(l["text"])])
        t += span
    warp.append([round(t, 3), ANCHORS[-1][0]])
    duration = round(t, 3)

    track = np.zeros(int(duration * sr) + sr, np.float32)
    for start, l in placed:
        a, b = int(max(0, l["start"] - 0.05) * sr), int((l["end"] + 0.05) * sr)
        seg = voice[a:b]
        s0 = int((start - 0.05) * sr)
        track[s0:s0 + len(seg)] += seg
    track = track[: int(duration * sr)]
    out_wav = os.path.join(PACK, "audio", f"voiceover-final-{lang}.wav" if film == "kickstarter"
                           else f"voiceover-final-{film}-{lang}.wav")
    write_wav(out_wav, track, sr)

    tl = {"duration": duration, "voice": os.path.basename(take_json), "warp": warp, "captions": captions}
    with open(os.path.join(PACK, "scenes", f"timeline-{film}.js"), "w", encoding="utf-8") as fh:
        fh.write("// Generated by tools/build_timeline.py from " + os.path.basename(take_json)
                 + ": the picture follows the voice. Do not edit by hand.\n")
        fh.write("window.TIMELINE = " + json.dumps(tl, ensure_ascii=False, indent=1) + ";\n")
    print(f"video {duration:.1f}s, {len(placed)} lines -> scenes/timeline-{film}.js, {out_wav}")
    for a, b, c in captions:
        print(f"  {a:5.1f}-{b:5.1f}  {c}")


if __name__ == "__main__":
    main(os.path.abspath(sys.argv[1]), os.environ.get("FILM", "kickstarter"))
