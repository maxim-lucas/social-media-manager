"""Feel-good original track for the 7 s follower reel, third try (Monica, 2026-11-04: track 1 too loud and too
fast, track 2 "so boring"). 104 BPM major-key pop: a catchy marimba/pluck hook melody, bouncy bass, four-on-the-
floor kick, claps on 2 and 4, soft shaker, a sparkle on each cut. Mid volume (about -17 dB mean). Wraps around so it
loops with the video. Usage: python3 music_pop.py <seconds> <out.wav> [cut1,cut2,...]"""
import sys, wave, numpy as np
SR = 44100
dur = float(sys.argv[1]); out = sys.argv[2]
cuts = [float(x) for x in sys.argv[3].split(",")] if len(sys.argv) > 3 and sys.argv[3] else []
n = int(SR * dur); mix = np.zeros(n); rng = np.random.default_rng(11)
beat = 60 / 104; s16 = beat / 4
def add(sig, t, g=1.0):
    i = int(t * SR) % n; j = min(n, i + len(sig)); mix[i:j] += sig[: j - i] * g
    r = len(sig) - (j - i)
    if r > 0: mix[:r] += sig[j - i:] * g
def T(L): return np.arange(int(L * SR)) / SR
def kick():
    t = T(0.28); return np.sin(2 * np.pi * np.cumsum(48 + 90 * np.exp(-t * 35)) / SR) * np.exp(-t * 11)
def clap():
    s = rng.normal(0, 1, int(0.2 * SR)); t = T(0.2)
    e = np.exp(-t * 28) + 0.5 * np.exp(-((t - 0.012) * 400) ** 2) + 0.5 * np.exp(-((t - 0.024) * 400) ** 2)
    return np.convolve(s * e, [1, -0.6], "same")
def shaker():
    s = np.diff(rng.normal(0, 1, int(0.06 * SR)), prepend=0); return s * np.exp(-T(0.06) * 60)
def marimba(f, L=0.35):
    t = T(L); return (np.sin(2 * np.pi * f * t) + 0.35 * np.sin(2 * np.pi * 4 * f * t) * np.exp(-t * 40)) * np.exp(-t * 9)
def pluck(f, L=0.25):
    t = T(L); ph = (t * f) % 1; return ((2 * ph - 1) * 0.5 + np.sin(2 * np.pi * f * t)) * np.exp(-t * 14)
def bass(f, L):
    t = T(L); return (np.sin(2 * np.pi * f * t) + 0.25 * np.sin(2 * np.pi * 2 * f * t)) * np.minimum(t / 0.005, 1) * np.exp(-t * 4)
def pad(fs, L):
    t = T(L); s = sum(np.sin(2 * np.pi * f * t) for f in fs) / len(fs)
    return s * np.clip(np.minimum(t / 0.05, (L - t) / 0.1), 0, 1)
N = {"C4": 261.63, "D4": 293.66, "E4": 329.63, "G4": 392.0, "A4": 440.0, "B4": 493.88, "C5": 523.25, "D5": 587.33, "E5": 659.25, "G5": 783.99}
prog = [([261.63, 329.63, 392.0], 65.41), ([246.94, 293.66, 392.0], 49.0), ([220.0, 261.63, 329.63], 55.0), ([220.0, 261.63, 349.23], 43.65)]
# one-bar hook motif per chord (16th steps, note or None)
motif = [["E5", None, "G5", None, "E5", "D5", None, "C5", None, None, "D5", None, "E5", None, None, None],
         ["D5", None, "G4", None, "B4", "D5", None, "G5", None, None, "E5", None, "D5", None, None, None],
         ["C5", None, "E5", None, "A4", "C5", None, "E5", None, None, "G5", None, "E5", None, None, None],
         ["C5", None, "A4", None, "C5", "D5", None, "E5", None, "D5", None, "C5", None, "A4", None, None]]
bar = 0; t = 0.0
while t < dur:
    ch, root = prog[bar % 4]
    add(pad(ch, 4 * beat), t, 0.12)
    for st in range(16):
        ts = t + st * s16
        if st % 4 == 0: add(kick(), ts, 0.75)
        if st in (4, 12): add(clap(), ts, 0.22)
        add(shaker(), ts, 0.06 if st % 2 else 0.035)
        if st in (0, 3, 6, 8, 11, 14): add(bass(root * (2 if st in (6, 14) else 1), s16 * 2.5), ts, 0.45)
        m = motif[bar % 4][st]
        if m: add(marimba(N[m]), ts, 0.32); add(pluck(N[m] / 2), ts, 0.08)
    t += 4 * beat; bar += 1
for c in cuts:  # sparkle on each cut
    for k, f in enumerate([1567.98, 2093.0, 2637.0]): add(marimba(f, 0.25), c + k * 0.035, 0.08)
mix = np.tanh(mix * 1.2); mix /= np.max(np.abs(mix)); mix *= 0.42
with wave.open(out, "wb") as w:
    w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR)
    w.writeframes((np.stack([mix, mix], 1) * 32767).astype(np.int16).tobytes())
print("ok", out)
