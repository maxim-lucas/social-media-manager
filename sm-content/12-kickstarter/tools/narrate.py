"""narrate.py: SCRIPT.md lines -> audio/narration-{en,fr}.wav in Maxim's voice (OpenVoice V2 + MeloTTS, MIT).

    E:/tools/openvoice/.venv/Scripts/python.exe sm-content/12-kickstarter/tools/narrate.py [en|fr|all]

1. The voice sample (audio/Recording.m4a, git-ignored) -> 16-bit mono WAV -> OpenVoice tone-colour embedding.
2. Each SCRIPT.md row: MeloTTS speaks the line (EN-US / FR base speaker), OpenVoice re-colours it to Maxim's voice.
3. A line longer than its slot is re-spoken faster (max 1.3x), then time-stretched as a last resort, so the
   voice never runs into the next scene. Lines are laid on a silent track of the video's length.
Works only with files on E: (C: is nearly full): models and caches go to E:/tools.
"""
import os
import re
import shutil
import subprocess
import sys
import wave

import numpy as np

HERE = os.path.dirname(os.path.abspath(__file__))
PACK = os.path.dirname(HERE)
AUDIO = os.path.join(PACK, "audio")
OV = "E:/tools/openvoice/OpenVoice"
WORK = "E:/tools/openvoice/work"
DURATION = 46.0
LEAD = 0.15     # silence before each line inside its slot
TAIL = 0.20     # breathing room kept at the end of a slot
# ffmpeg: $FFMPEG (e.g. the ffmpeg-static binary render.js uses), else the one on PATH.
FFMPEG = os.environ.get("FFMPEG") or shutil.which("ffmpeg") or "ffmpeg"
if os.path.isabs(FFMPEG):  # whisper / pydub call a bare `ffmpeg`: put this one on PATH for them
    os.environ["PATH"] = os.path.dirname(FFMPEG) + os.pathsep + os.environ.get("PATH", "")

for k, v in {"SSL_CERT_FILE": "E:/tools/win-ca.pem", "REQUESTS_CA_BUNDLE": "E:/tools/win-ca.pem",
             "CURL_CA_BUNDLE": "E:/tools/win-ca.pem", "HF_HOME": "E:/tools/hf-cache",
             "TORCH_HOME": "E:/tools/torch-cache", "NLTK_DATA": "E:/tools/nltk-data"}.items():
    os.environ.setdefault(k, v)


def rows():
    """The narration table of SCRIPT.md: [(start, end, en, fr)]."""
    out = []
    for line in open(os.path.join(PACK, "SCRIPT.md"), encoding="utf-8"):
        cells = [c.strip() for c in line.strip().strip("|").split("|")]
        if len(cells) == 5 and re.fullmatch(r"\d+(\.\d+)?", cells[0]):
            out.append((float(cells[0]), float(cells[1]), cells[3], cells[4]))
    return out


def ff(*args):
    subprocess.run([FFMPEG, "-y", "-loglevel", "error", *args], check=True)


def read_wav(path):
    with wave.open(path) as w:
        sr, n = w.getframerate(), w.getnframes()
        x = np.frombuffer(w.readframes(n), dtype=np.int16).astype(np.float32) / 32768
        if w.getnchannels() == 2:
            x = x.reshape(-1, 2).mean(axis=1)
    return x, sr


def write_wav(path, x, sr):
    x = np.clip(x, -1, 1)
    with wave.open(path, "wb") as w:
        w.setnchannels(1); w.setsampwidth(2); w.setframerate(sr)
        w.writeframes((x * 32767).astype(np.int16).tobytes())


def main(langs):
    import torch
    sys.path.insert(0, OV)
    from openvoice import se_extractor
    from openvoice.api import ToneColorConverter
    from melo.api import TTS

    os.makedirs(WORK, exist_ok=True)
    # OpenVoice finds the speech in the sample with Silero VAD (snakers4/silero-vad, MIT) via torch.hub, which
    # asks "trust this repo?" on stdin the first time: trust that one repo up front so the run is unattended.
    os.makedirs(torch.hub.get_dir(), exist_ok=True)
    trusted = os.path.join(torch.hub.get_dir(), "trusted_list")
    if "snakers4_silero-vad" not in (open(trusted).read() if os.path.exists(trusted) else ""):
        with open(trusted, "a") as fh:
            fh.write("snakers4_silero-vad\n")
    device = "cuda:0" if torch.cuda.is_available() else "cpu"
    sample = next((os.path.join(AUDIO, f) for f in sorted(os.listdir(AUDIO))
                   if f.lower().startswith(("recording", "voice-sample"))), None)
    if not sample:
        sys.exit("No voice sample in audio/ (Recording.* or voice-sample.*)")
    ref = os.path.join(WORK, "voice-sample.wav")
    ff("-i", sample, "-ac", "1", "-ar", "22050", "-sample_fmt", "s16", ref)

    conv = ToneColorConverter(f"{OV}/checkpoints_v2/converter/config.json", device=device)
    conv.load_ckpt(f"{OV}/checkpoints_v2/converter/checkpoint.pth")
    target_se, _ = se_extractor.get_se(ref, conv, target_dir=os.path.join(WORK, "processed"), vad=True)

    script = rows()
    for lang in langs:
        tts = TTS(language="EN" if lang == "en" else "FR", device=device)
        spk_name = "EN-US" if lang == "en" else "FR"
        spk = tts.hps.data.spk2id[spk_name]
        src_se = torch.load(f"{OV}/checkpoints_v2/base_speakers/ses/{spk_name.lower().replace('_', '-')}.pth",
                            map_location=device)
        sr = conv.hps.data.sampling_rate
        track = np.zeros(int(DURATION * sr), dtype=np.float32)
        for i, (a, b, en, fr) in enumerate(script):
            text = en if lang == "en" else fr
            room = (b - a) - LEAD - TAIL
            raw, out = os.path.join(WORK, f"{lang}-{i}-base.wav"), os.path.join(WORK, f"{lang}-{i}.wav")
            speed = 1.0
            for _ in range(3):
                tts.tts_to_file(text, spk, raw, speed=speed, quiet=True)
                conv.convert(audio_src_path=raw, src_se=src_se, tgt_se=target_se, output_path=out, message="@MyShell")
                x, xsr = read_wav(out)
                dur = len(x) / xsr
                if dur <= room or speed >= 1.3:
                    break
                speed = min(1.3, speed * dur / room * 1.03)
            if dur > room:  # last resort: stretch, never overlap the next scene
                fit = os.path.join(WORK, f"{lang}-{i}-fit.wav")
                ff("-i", out, "-filter:a", f"atempo={dur / room:.4f}", fit)
                x, xsr = read_wav(fit)
            assert xsr == sr, (xsr, sr)
            s0 = int((a + LEAD) * sr)
            track[s0:s0 + len(x)] += x[: len(track) - s0]
            print(f"{lang} {a:5.1f}-{b:5.1f}s  {len(x) / sr:4.1f}s of {room:4.1f}s  speed {speed:.2f}  {text[:48]}")
        peak = float(np.max(np.abs(track))) or 1.0
        dest = os.path.join(AUDIO, f"narration-{lang}.wav")
        write_wav(dest, track * (0.89 / peak), sr)   # -1 dBFS peak
        print("->", dest)


if __name__ == "__main__":
    arg = (sys.argv[1:] or ["all"])[0]
    main(["en", "fr"] if arg == "all" else [arg])
