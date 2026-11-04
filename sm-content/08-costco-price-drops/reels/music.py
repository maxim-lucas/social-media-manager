"""Original upbeat track for the price-drop reels (made here, no licence needed).
120 BPM, A minor pop/house groove: kick, clap, hats, bass, chord stabs, plus a whoosh on every slide change
and a riser into the hook. Usage: python3 music.py <seconds> <out.wav> [cut1,cut2,...] (cut times in seconds)."""
import sys, wave, numpy as np
SR = 44100
dur = float(sys.argv[1]); out = sys.argv[2]
cuts = [float(x) for x in sys.argv[3].split(",")] if len(sys.argv) > 3 and sys.argv[3] else []
n = int(SR * dur); mix = np.zeros(n); rng = np.random.default_rng(7)
bpm = 120; beat = 60 / bpm
def add(sig, t, gain=1.0):
    i = int(t * SR)
    if i >= n: return
    j = min(n, i + len(sig)); mix[i:j] += sig[: j - i] * gain
def env(length, a=0.002, d=0.2):
    t = np.arange(int(length * SR)) / SR
    return np.minimum(t / a, 1) * np.exp(-t / d)
def kick():
    t = np.arange(int(0.35 * SR)) / SR
    f = 50 + 110 * np.exp(-t * 30)
    return np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 9)
def clap():
    s = rng.normal(0, 1, int(0.25 * SR)); e = env(0.25, 0.001, 0.06)
    return np.convolve(s * e, np.ones(8) / 8, "same")
def hat(open_=False):
    s = rng.normal(0, 1, int(0.12 * SR)); s = np.diff(s, prepend=0)
    return s * env(0.12, 0.0005, 0.05 if open_ else 0.015)
def tone(freqs, length, d=0.25, shape="saw"):
    t = np.arange(int(length * SR)) / SR; s = np.zeros_like(t)
    for f in freqs:
        for det in (-0.004, 0.004):
            ph = (t * f * (1 + det)) % 1
            s += (2 * ph - 1) if shape == "saw" else np.sin(2 * np.pi * f * t)
    s /= max(1, len(freqs) * 2)
    return s * env(length, 0.005, d)
def lowpass(s, k=6):
    return np.convolve(s, np.ones(k) / k, "same")
# A minor - F - C - G
chords = [[220.0, 261.63, 329.63], [174.61, 220.0, 261.63], [261.63, 329.63, 392.0], [196.0, 246.94, 293.66]]
roots = [55.0, 43.65, 65.41, 49.0]
intro = 1.0  # hook: riser only, the beat lands at 1.0 s
t = intro; bar = 0
while t < dur:
    ch = chords[bar % 4]; root = roots[bar % 4]
    for b in range(4):
        tb = t + b * beat
        add(kick(), tb, 0.9)
        if b in (1, 3): add(clap(), tb, 0.35)
        add(hat(), tb + beat / 2, 0.18); add(hat(), tb + beat / 4 * 3, 0.08)
        add(lowpass(tone([root], beat * 0.45, 0.18, "sin") + 0.4 * tone([root * 2], beat * 0.45, 0.08)), tb + beat / 2, 0.55)
        if b in (0, 2): add(lowpass(tone(ch, beat * 0.5, 0.12), 4), tb + beat * 0.75, 0.22)
    t += 4 * beat; bar += 1
# riser into the beat
L = int(intro * SR); tt = np.arange(L) / SR
riser = rng.normal(0, 1, L) * (tt / intro) ** 2 * 0.25 + np.sin(2 * np.pi * np.cumsum(300 + 900 * tt / intro) / SR) * (tt / intro) ** 2 * 0.15
mix[:L] += riser
# whoosh on each cut
for c in cuts:
    w = int(0.35 * SR); s = rng.normal(0, 1, w); e = np.sin(np.pi * np.arange(w) / w) ** 2
    add(lowpass(s * e, 3), max(0, c - 0.17), 0.18)
# fade out last 1.2 s
f = int(1.2 * SR); mix[-f:] *= np.linspace(1, 0, f)
mix = np.tanh(mix * 0.9); mix /= np.max(np.abs(mix)) / 0.89
st = np.stack([mix, mix], 1)
with wave.open(out, "wb") as w:
    w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR)
    w.writeframes((st * 32767).astype(np.int16).tobytes())
print("ok", out, dur)
