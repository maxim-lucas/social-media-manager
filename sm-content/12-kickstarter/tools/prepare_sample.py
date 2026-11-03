"""prepare_sample.py: Maxim's raw voice sample -> E:/tools/voice/ref-clean.wav, the reference the voice-over clones.

    E:/tools/deepfilter/.venv/Scripts/python.exe sm-content/12-kickstarter/tools/prepare_sample.py

1. Newest audio/voice-sample.* (else audio/Recording.*) -> 48 kHz mono.
2. DeepFilterNet3 (MIT / Apache-2.0) removes room tone, hiss and air noise from the speech.
3. Rumble filter, long pauses shortened, level normalised -> 24 kHz (what Chatterbox uses).
Also writes E:/tools/voice/sample-denoised-48k.wav to listen to. Personal data: everything stays on E:,
never in the repo. Prints the noise floor before/after, measured on the sample's opening silence.
"""
import glob
import os
import shutil
import subprocess
import sys

import numpy as np

PACK = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
AUDIO = os.path.join(PACK, "audio")
OUT = "E:/tools/voice"
for k, v in {"SSL_CERT_FILE": "E:/tools/win-ca.pem", "REQUESTS_CA_BUNDLE": "E:/tools/win-ca.pem",
             "CURL_CA_BUNDLE": "E:/tools/win-ca.pem"}.items():
    os.environ.setdefault(k, v)
FFMPEG = os.environ.get("FFMPEG") or shutil.which("ffmpeg") or "ffmpeg"
# After denoising: rumble filter, pauses over 0.3 s shortened to 0.18 s, level normalised.
FINISH = ("highpass=f=70,silenceremove=start_periods=1:start_threshold=-50dB:stop_periods=-1:stop_duration=0.3:"
          "stop_threshold=-50dB:stop_silence=0.18,loudnorm=I=-20:TP=-2:LRA=11")


def ff(*args):
    subprocess.run([FFMPEG, "-y", "-loglevel", "error", *args], check=True)


def rms_db(x):
    return 20 * np.log10(np.sqrt(np.mean(np.square(x, dtype=np.float64))) + 1e-12)


def main():
    import soundfile as sf
    from df.enhance import enhance, init_df, load_audio, save_audio

    # `prepare_sample.py [sample file] [tag]`: several samples can be prepared side by side (tag s1, s2, ...).
    args = sys.argv[1:]
    if args and os.path.exists(args[0]):
        src = args[0]
    else:
        found = sorted(glob.glob(os.path.join(AUDIO, "voice-sample.*")) or glob.glob(os.path.join(AUDIO, "Recording*")),
                       key=os.path.getmtime)
        if not found:
            sys.exit("No voice sample in audio/ (voice-sample.* or Recording*)")
        src = found[-1]
    tag = args[1] if len(args) > 1 else "clean"
    os.makedirs(OUT, exist_ok=True)
    raw48 = os.path.join(OUT, f"sample-{tag}-raw-48k.wav")
    ff("-i", src, "-ac", "1", "-ar", "48000", raw48)

    model, df_state, _ = init_df()               # DeepFilterNet3, downloaded once
    audio, _ = load_audio(raw48, sr=df_state.sr())
    clean = enhance(model, df_state, audio)
    den48 = os.path.join(OUT, f"sample-{tag}-denoised-48k.wav")
    save_audio(den48, clean, df_state.sr())

    a, sr = sf.read(raw48)
    b, _ = sf.read(den48)
    # Noise floor = the quietest 10% of 50 ms frames (the pauses), speech = the loudest 30%.
    def floor_and_speech(x):
        hop = int(sr * 0.05)
        levels = np.sort([rms_db(x[i:i + hop]) for i in range(0, len(x) - hop, hop)])
        return float(np.mean(levels[: len(levels) // 10])), float(np.mean(levels[-len(levels) * 3 // 10:]))
    (fa, sa), (fb, sb) = floor_and_speech(a), floor_and_speech(b)
    print(f"sample: {os.path.basename(src)}, {len(a) / sr:.1f}s")
    print(f"before: speech {sa:6.1f} dB, noise {fa:6.1f} dB  -> voice {sa - fa:4.1f} dB above the noise")
    print(f"after : speech {sb:6.1f} dB, noise {fb:6.1f} dB  -> voice {sb - fb:4.1f} dB above the noise")

    ref = os.path.join(OUT, f"ref-{tag}.wav")
    ff("-i", den48, "-af", FINISH, "-ar", "24000", ref)
    print("->", ref)


if __name__ == "__main__":
    main()
