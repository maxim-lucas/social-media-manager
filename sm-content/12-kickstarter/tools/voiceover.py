"""voiceover.py: SCRIPT.md lines -> audio/voiceover-<lang>-<take>.wav in Maxim's voice (Chatterbox, MIT, local).

    E:/tools/chatterbox/.venv/Scripts/python.exe sm-content/12-kickstarter/tools/voiceover.py [en] [A] [B]

- The voice comes from Maxim's sample, cleaned first (E:/tools/voice/ref-clean.wav, see SCRIPT.md; never committed).
  Chatterbox listens to the first few seconds of that sample to learn the voice. That is the SAMPLE length only:
  the voice-over is every line of the script, at its natural length, and the video is re-timed to it.
- Each line is spoken at natural pace (never sped up or stretched), trimmed with a safety margin so no consonant
  is clipped, then checked by Whisper against its text; a mismatch is re-generated (up to 3 seeds, best kept).
- Two takes: A (closest to the sample) and B (cfg_weight ~0: Resemble's setting that stops the sample's language,
  French, from carrying its accent into English). Maxim picks one.
- Outputs audio/voiceover-<lang>-<take>.wav (-16 LUFS, 48 kHz) and .json (each line's start/end, for re-timing).
"""
import copy
import difflib
import json
import os
import re
import shutil
import subprocess
import sys
import wave

import numpy as np

HERE = os.path.dirname(os.path.abspath(__file__))
PACK = os.path.dirname(HERE)
AUDIO = os.environ.get("AUDIO_DIR", "E:/tools/voice/out")   # outputs never on C: (Maxim, 2026-11-10)
os.makedirs(AUDIO, exist_ok=True)
# Which prepared sample to clone (tools/prepare_sample.py <file> <tag>): VOICE_TAG=s1 (first recording), s2, ...
TAG = os.environ.get("VOICE_TAG", "clean")
REF = f"E:/tools/voice/ref-{TAG}.wav"            # the cleaned sample (see SCRIPT.md)
REF_BEST = f"E:/tools/voice/ref-{TAG}-best.wav"  # its densest 10 s of speech: all Chatterbox listens to
WORK = "E:/tools/voice/work"
# A: cloned straight from Maxim's sample (closest to his voice; carries the sample's accent, heard as British).
# B: same, cfg_weight ~0: Resemble's setting against accent carry-over (the English model crashes at exactly 0,
#    its guidance always expects a doubled batch: 0.05 is the same in practice).
# C: US accent in Maxim's voice: Chatterbox's built-in American voice reads the line, then Chatterbox's voice
#    converter swaps the timbre for Maxim's while keeping the American pronunciation (Maxim, 2026-11-03).
TAKES = {
    "A": {"voice": "clone", "exaggeration": 0.5, "cfg_weight": 0.5},
    "B": {"voice": "clone", "exaggeration": 0.5, "cfg_weight": 0.05},
    "C": {"voice": "us", "exaggeration": 0.5, "cfg_weight": 0.5},
}
TEMPERATURE = 0.7  # Chatterbox default 0.8; a little lower = steadier narration
GAP = 0.6      # pause between lines (the video re-timing places each line on its own scene)
EDGE = 0.4     # silence at the start and end of the track
PAD = 0.08     # kept around each line's speech so no consonant is clipped
SEEDS = (11, 23, 37, 41, 53)  # a line is re-generated until Whisper hears every word (best of 5 kept otherwise)
# MATCH_OK=0.9: accept a line once Whisper hears this share of its words (Whisper writes "$4.99" for "four
# ninety-nine", which never scores 1.0 and would burn all five seeds on a correct line).
MATCH_OK = float(os.environ.get("MATCH_OK", "1.0"))
# FILM=kickstarter (SCRIPT.md) | tag (SCRIPT-tag.md) | translator (SCRIPT-translator.md): which script to voice.
FILM = os.environ.get("FILM", "kickstarter")
SCRIPT_FILE = "SCRIPT.md" if FILM == "kickstarter" else f"SCRIPT-{FILM}.md"
VERSION = "v6" if FILM == "kickstarter" else FILM  # the SCRIPT.md version: each version gets its own files (a file open in a player can't be
                # overwritten on Windows, and old takes stay comparable)
# Pronunciation hints, for the speech model only (SCRIPT.md keeps the real spelling): "PriceBack" as one word
# lost its P ("Riceback", "prize back"); two words are read cleanly.
SAY = {"PriceBack": "Price Back"}
# Voice polish before loudness (Maxim wants it clearer): cut rumble and boom (80 Hz, 250 Hz), lift presence
# (3.5 kHz) and air (8 kHz+), even out quiet words for phone speakers, then -16 LUFS / -1.5 dBTP.
POLISH = ("highpass=f=80,equalizer=f=250:t=q:w=1:g=-2,equalizer=f=3500:t=q:w=1.2:g=2.5,highshelf=f=8000:g=1.5,"
          "acompressor=threshold=-21dB:ratio=2.5:attack=5:release=90:makeup=1.5,"
          "loudnorm=I=-16:TP=-1.5:LRA=11")

for k, v in {"SSL_CERT_FILE": "E:/tools/win-ca.pem", "REQUESTS_CA_BUNDLE": "E:/tools/win-ca.pem",
             "CURL_CA_BUNDLE": "E:/tools/win-ca.pem", "HF_HOME": "E:/tools/hf-cache",
             "TORCH_HOME": "E:/tools/torch-cache"}.items():
    os.environ.setdefault(k, v)
FFMPEG = os.environ.get("FFMPEG") or shutil.which("ffmpeg") or "ffmpeg"
if os.path.isabs(FFMPEG):
    os.environ["PATH"] = os.path.dirname(FFMPEG) + os.pathsep + os.environ.get("PATH", "")

NUM = {"0": "zero", "00": "zero zero", "97": "ninety seven", "30": "thirty", "5": "five", "2": "two", "6": "six", "12": "twelve", "16": "sixteen", "47": "forty seven", "500": "five hundred",
       "600": "six hundred"}


def rows():
    """The numbered voice-over table of SCRIPT.md: [(n, en, fr)]."""
    out = []
    for line in open(os.path.join(PACK, SCRIPT_FILE), encoding="utf-8"):
        cells = [c.strip() for c in line.strip().strip("|").split("|")]
        if len(cells) == 4 and cells[0].isdigit():
            out.append((int(cells[0]), cells[2], cells[3]))
    return out


ONES = ("zero one two three four five six seven eight nine ten eleven twelve thirteen fourteen fifteen sixteen "
        "seventeen eighteen nineteen").split()
TENS = "_ _ twenty thirty forty fifty sixty seventy eighty ninety".split()


def spell(n):
    """0-999 in words (Whisper writes digits; the script spells them)."""
    if n < 20:
        return ONES[n]
    if n < 100:
        return TENS[n // 10] + ("" if n % 10 == 0 else " " + ONES[n % 10])
    return ONES[n // 100] + " hundred" + ("" if n % 100 == 0 else " " + spell(n % 100))


def words(text):
    """Comparable words: numbers as words ("$16" == "sixteen dollars"), no punctuation, "price back" == "PriceBack"."""
    # "$4.99" == "four ninety-nine" (how a price is said), "$34.60" == "thirty-four dollars and sixty cents"
    text = re.sub(r"\$(\d+)\.(\d\d)\b", lambda m: spell(int(m.group(1))) + " " + spell(int(m.group(2))), text.lower())
    text = re.sub(r"\$(\d+)", lambda m: m.group(1) + " dollars", text)
    text = re.sub(r"\b(\d{1,3})\b", lambda m: NUM.get(m.group(1)) or spell(int(m.group(1))), text)
    text = re.sub(r"\d+", lambda m: NUM.get(m.group(0), m.group(0)), text)
    text = text.replace(" dollars and ", " ").replace(" cents", "")
    text = re.sub(r"\b(\w+)'re\b", r"\1 are", text)   # "they're" == "they are"
    text = re.sub(r"centre", "center", text)               # Whisper writes US spelling: "Centres" == "centers"
    text = re.sub(r"[^a-z' ]", " ", text.replace("-", " ")).replace("'", "")
    return re.sub(r"\bprice back\b", "priceback", " ".join(text.split())).split()


def match(expected, heard):
    """Share of the expected words heard, in order. 1.0 only when every word came back exactly: a clipped first
    letter ("Riceback") or a misread word ("Fix these later") fails the line."""
    a, b = words(expected), words(heard)
    hit = sum(m.size for m in difflib.SequenceMatcher(None, a, b).get_matching_blocks())
    return hit / max(len(a), len(b), 1)


def trim(x, sr, floor_db=-45.0):
    """Cut leading/trailing silence, keeping PAD around the speech."""
    hop = int(sr * 0.01)
    frames = np.array([np.sqrt(np.mean(x[i:i + hop] ** 2) + 1e-12) for i in range(0, len(x) - hop, hop)])
    loud = np.where(20 * np.log10(frames) > floor_db)[0]
    if not len(loud):
        return x
    a = max(0, loud[0] * hop - int(PAD * sr))
    b = min(len(x), (loud[-1] + 1) * hop + int(PAD * sr))
    return x[a:b]


def read_wav(path):
    with wave.open(path) as w:
        sr = w.getframerate()
        x = np.frombuffer(w.readframes(w.getnframes()), dtype=np.int16).astype(np.float32) / 32768
    return x, sr


def best_reference(seconds=10.0):
    """Chatterbox conditions on the first ~10 s (6 s for the text model) of the reference: give it the window of
    the cleaned sample with the most speech in it, starting on a word."""
    x, sr = read_wav(REF)
    hop = int(sr * 0.02)
    db = np.array([20 * np.log10(np.sqrt(np.mean(x[i:i + hop] ** 2) + 1e-12)) for i in range(0, len(x) - hop, hop)])
    voiced = (db > db.max() - 30).astype(np.int32)
    win = int(seconds * sr / hop)
    if len(voiced) <= win:
        write_wav(REF_BEST, x, sr)
        return
    sums = np.convolve(voiced, np.ones(win, np.int32), mode="valid")
    start = int(np.argmax(sums))
    while start > 0 and voiced[start - 1]:   # back up to the start of the word
        start -= 1
    write_wav(REF_BEST, x[start * hop:start * hop + int(seconds * sr)], sr)
    print(f"reference: {start * hop / sr:.1f}s → {start * hop / sr + seconds:.1f}s of the cleaned sample, "
          f"{sums.max() / win:.0%} speech", flush=True)


def similarity(model, path):
    """How close a take sounds to Maxim: cosine of Chatterbox's speaker embeddings (take vs each prepared, denoised
    sample of his real voice). 1.0 = same speaker; the higher, the more it sounds like him."""
    import glob
    import librosa
    def emb(f):
        x, _ = librosa.load(f, sr=16000)
        e = model.ve.embeds_from_wavs([x], sample_rate=16000, as_spk=True)
        e = np.asarray(e).reshape(-1)
        return e / (np.linalg.norm(e) + 1e-9)
    take = emb(path)
    out = {}
    for ref in sorted(glob.glob("E:/tools/voice/ref-s*.wav")):
        if ref.endswith("-best.wav"):
            continue
        out[os.path.basename(ref)[4:-4]] = round(float(np.dot(take, emb(ref))), 3)
    return out


def write_wav(path, x, sr):
    x = np.clip(x, -1, 1)
    with wave.open(path, "wb") as w:
        w.setnchannels(1); w.setsampwidth(2); w.setframerate(sr)
        w.writeframes((x * 32767).astype(np.int16).tobytes())


def main(lang, takes=None):
    import torch
    from chatterbox.tts import ChatterboxTTS
    try:
        from faster_whisper import WhisperModel
        asr = WhisperModel("small.en", device="cpu", compute_type="int8")
    except ImportError:
        asr = None
        print("faster-whisper missing: lines are NOT checked")
    if not os.path.exists(REF):
        sys.exit(f"Missing cleaned voice reference {REF} (see SCRIPT.md)")
    os.makedirs(WORK, exist_ok=True)
    best_reference()
    model = ChatterboxTTS.from_pretrained(device="cpu")
    default_conds = copy.deepcopy(model.conds)  # the built-in (American) voice, before any cloning replaces it
    vc = None
    sr = model.sr
    script = rows()
    assert script, "no voice-over rows in SCRIPT.md"
    # REUSE_JSON=<previous take .json> REUSE_RAW=<its raw track>: unchanged lines are reused as they were
    # (same voice, already checked), only new or edited lines are generated.
    reuse = {}
    if os.environ.get("REUSE_JSON") and os.environ.get("REUSE_RAW"):
        prev = json.load(open(os.environ["REUSE_JSON"], encoding="utf-8"))
        prev_raw, prev_sr = read_wav(os.environ["REUSE_RAW"])
        assert prev_sr == sr, (prev_sr, sr)
        for l in prev["lines"]:
            reuse[l["text"]] = (prev_raw[int(l["start"] * sr):int(l["end"] * sr)], l)

    for take, params in TAKES.items():
        if takes and take not in takes:
            continue
        voice = params["voice"]
        gen = {k: v for k, v in params.items() if k != "voice"}
        parts, timeline, t = [np.zeros(int(EDGE * sr), np.float32)], [], EDGE
        for n, en, fr in script:
            text = en if lang == "en" else fr
            best = None
            if text in reuse:
                x, old = reuse[text]
                best = (old.get("match", 1.0), x, old.get("heard", ""), old.get("seed"))
                print(f"{take} line {n}: reused from the previous take ({len(x) / sr:.1f}s)", flush=True)
            for seed in ([] if best else SEEDS):
                path = os.path.join(WORK, f"{VERSION}-{TAG}-{lang}-{take}-{n}-s{seed}.wav")
                if os.environ.get("RESUME") and os.path.exists(path):
                    # RESUME=1: a run that was stopped (low memory) picks up where it was: a line already
                    # generated is re-checked, not re-generated
                    x, _ = read_wav(path)
                    heard, score = "", 1.0
                    if asr:
                        segs, _ = asr.transcribe(path, language=lang, beam_size=5)
                        heard = " ".join(s.text.strip() for s in segs)
                        score = match(text, heard)
                    print(f"{take} line {n} seed {seed}: {len(x) / sr:4.1f}s match {score:.2f}  (resumed)  heard: {heard}",
                          flush=True)
                    if best is None or score > best[0]:
                        best = (score, x, heard, seed)
                    if score >= MATCH_OK:
                        break
                    continue
                torch.manual_seed(seed)
                say = text
                for k, v in SAY.items():
                    say = say.replace(k, v)
                if voice == "clone":
                    wav = model.generate(say, audio_prompt_path=REF_BEST, temperature=TEMPERATURE, **gen)
                else:  # "us": the built-in American voice reads it, the converter gives it Maxim's timbre
                    model.conds = copy.deepcopy(default_conds)
                    src = model.generate(say, temperature=TEMPERATURE, **gen)
                    src_path = os.path.join(WORK, f"{VERSION}-{TAG}-{lang}-{take}-{n}-s{seed}-us.wav")
                    write_wav(src_path, src.squeeze(0).cpu().numpy(), sr)
                    if vc is None:  # reuses the TTS model's vocoder: no second copy in memory
                        from chatterbox.vc import ChatterboxVC
                        vc = ChatterboxVC(model.s3gen, "cpu")
                        vc.set_target_voice(REF_BEST)
                    wav = vc.generate(src_path)
                x = trim(wav.squeeze(0).cpu().numpy().astype(np.float32), sr)
                path = os.path.join(WORK, f"{VERSION}-{TAG}-{lang}-{take}-{n}-s{seed}.wav")
                write_wav(path, x, sr)
                heard, score = "", 1.0
                if asr:
                    segs, _ = asr.transcribe(path, language=lang, beam_size=5)
                    heard = " ".join(s.text.strip() for s in segs)
                    score = match(text, heard)
                print(f"{take} line {n} seed {seed}: {len(x) / sr:4.1f}s match {score:.2f}  heard: {heard}", flush=True)
                if best is None or score > best[0]:
                    best = (score, x, heard, seed)
                if score >= MATCH_OK:
                    break
            score, x, heard, seed = best
            timeline.append({"line": n, "text": text, "start": round(t, 3), "end": round(t + len(x) / sr, 3),
                             "seed": seed, "heard": heard, "match": round(score, 3)})
            parts += [x, np.zeros(int(GAP * sr), np.float32)]
            t += len(x) / sr + GAP
        parts[-1] = np.zeros(int(EDGE * sr), np.float32)
        raw = os.path.join(WORK, f"{VERSION}-{TAG}-{lang}-{take}-raw.wav")
        write_wav(raw, np.concatenate(parts), sr)
        dest = os.path.join(AUDIO, f"voiceover-{lang}-{VERSION}-{take}-{TAG}.wav")
        subprocess.run([FFMPEG, "-y", "-loglevel", "error", "-i", raw, "-af", POLISH, "-ar", "48000", dest],
                       check=True)
        sim = similarity(model, raw)
        print(f"{take}: sounds like Maxim (voice-encoder cosine) {sim}", flush=True)
        with open(dest.replace(".wav", ".json"), "w", encoding="utf-8") as fh:
            json.dump({"take": take, "sample": TAG, "params": dict(params, temperature=TEMPERATURE),
                       "similarity": sim, "duration": round(t - GAP + EDGE, 3), "lines": timeline},
                      fh, ensure_ascii=False, indent=2)
        print(f"-> {dest}  ({t - GAP + EDGE:.1f}s)", flush=True)


if __name__ == "__main__":
    args = sys.argv[1:] or ["en"]
    main(args[0], set(args[1:]) or None)   # e.g. `voiceover.py en B` regenerates take B only
