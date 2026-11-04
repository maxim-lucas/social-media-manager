"""Backup track for the v4 follower reels (Monica, 2026-11-04 18:10: "choose music based on trendy videos").
Real trending songs can't be embedded (no licence), so the default is to post the no-music copy and pick a trending
sound in Instagram's audio library. This is the stand-in, in the style that trends on shopping/deal reels: bouncy
122 BPM funky house, four-on-the-floor kick, off-beat open hats, sidechained bass, piano-organ chord stabs, a pitched
"vocal chop" hook, a short riser into each cut and an impact on it. About -16 dB mean, loops with the video.
Usage: python3 music_house.py <seconds> <out.wav> [cut1,cut2,...]"""
import sys, wave, numpy as np
SR = 44100
dur = float(sys.argv[1]); out = sys.argv[2]
cuts = [float(x) for x in sys.argv[3].split(",")] if len(sys.argv) > 3 and sys.argv[3] else []
n = int(SR * dur); mix = np.zeros(n); duck = np.ones(n); rng = np.random.default_rng(5)
bpm = 122; beat = 60 / bpm; s16 = beat / 4
def T(L): return np.arange(int(L * SR)) / SR
def add(sig, t, g=1.0, buf=None):
    buf = mix if buf is None else buf
    i = int(t * SR) % n; j = min(n, i + len(sig)); buf[i:j] += sig[: j - i] * g
    r = len(sig) - (j - i)
    if r > 0: buf[:r] += sig[j - i:] * g
def kick():
    t = T(0.3); return np.tanh(2.2 * np.sin(2 * np.pi * np.cumsum(50 + 110 * np.exp(-t * 30)) / SR) * np.exp(-t * 9))
def hat(open_=False):
    L = 0.18 if open_ else 0.04; s = np.diff(rng.normal(0, 1, int(L * SR)), n=2, prepend=[0, 0]); return s * np.exp(-T(L) * (18 if open_ else 90)) * 0.25
def clap():
    s = rng.normal(0, 1, int(0.22 * SR)); t = T(0.22)
    e = np.exp(-t * 22) + 0.6 * np.exp(-((t - 0.011) * 380) ** 2) + 0.6 * np.exp(-((t - 0.022) * 380) ** 2)
    return np.convolve(s * e, [1, -0.7], "same") * 0.5
def organ(fs, L):
    t = T(L); x = sum(np.sin(2 * np.pi * f * t) + 0.5 * np.sin(2 * np.pi * 2 * f * t) + 0.25 * np.sin(2 * np.pi * 3 * f * t) for f in fs)
    return x * np.minimum(t / 0.004, 1) * np.exp(-t * 10) / len(fs)
def bass(f, L):
    t = T(L); x = np.tanh(1.8 * (np.sin(2 * np.pi * f * t) + 0.3 * np.sin(2 * np.pi * 2 * f * t)))
    return x * np.minimum(t / 0.004, 1) * np.exp(-t * 5)
def chop(f, L=0.16):  # vowel-ish pitched blip
    t = T(L); ph = 2 * np.pi * f * t; x = np.sin(ph) + 0.6 * np.sin(2 * ph) + 0.4 * np.sin(3 * ph) * np.sin(2 * np.pi * 6 * t)
    return x * np.minimum(t / 0.01, 1) * np.exp(-t * 12)
def riser(L):
    t = T(L); s = rng.normal(0, 1, len(t)); s = np.convolve(s, np.ones(6) / 6, "same"); return s * (t / L) ** 2 * 0.35
def impact():
    t = T(0.6); return (np.sin(2 * np.pi * np.cumsum(40 + 80 * np.exp(-t * 20)) / SR) * np.exp(-t * 5) + rng.normal(0, 1, len(t)) * np.exp(-t * 14) * 0.4)
m = lambda k: 440 * 2 ** ((k - 69) / 12)
# Am - F - C - G, two beats each (fast, bright loop)
prog = [(57, [69, 72, 76]), (53, [65, 69, 72]), (48, [67, 72, 76]), (55, [67, 71, 74])]
hook = [76, None, 79, 76, None, 74, 72, None]  # 8 sixteenths
nb = int(dur / beat) + 1
for b in range(nb):
    t0 = b * beat
    add(kick(), t0, 0.9)
    i0, i1 = int(t0 * SR) % n, min(n, int(t0 * SR) % n + int(0.18 * SR)); duck[i0:i1] = np.minimum(duck[i0:i1], np.linspace(0.35, 1, i1 - i0))
    add(hat(True), t0 + beat / 2, 0.8); add(hat(), t0 + s16, 0.5); add(hat(), t0 + 3 * s16, 0.5)
    if b % 2 == 1: add(clap(), t0, 0.8)
    root, ch = prog[(b // 2) % 4]
    if b % 2 == 0:
        for off in (0.5, 1.5, 1.75): add(organ([m(x) for x in ch], 0.22), t0 + off * beat, 0.33)
    add(bass(m(root - 12), 0.2), t0, 0.42); add(bass(m(root), 0.15), t0 + 0.75 * beat, 0.42)
    for k, note in enumerate(hook[(b % 2) * 4:(b % 2) * 4 + 4]):
        if note and (b // 4) % 2 == 0: add(chop(m(note)), t0 + k * s16, 0.16)
musical = mix.copy(); mix[:] = 0
for c in cuts:
    add(riser(0.45), c - 0.45, 1.0); add(impact(), c, 0.55)
mix = musical * duck + mix
mix = np.convolve(mix, [0.85, 0.15], "same")
mix = np.tanh(mix * 1.1)
mix *= 0.45 / (np.abs(mix).max() + 1e-9)
pcm = (np.clip(mix, -1, 1) * 32767).astype(np.int16)
with wave.open(out, "wb") as w: w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR); w.writeframes(pcm.tobytes())
