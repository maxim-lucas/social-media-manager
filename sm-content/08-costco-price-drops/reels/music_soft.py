"""Calm, slower original track for the 7 s follower reel (Monica, 2026-11-04: the first track was too loud and
too quick). 88 BPM lo-fi: soft kick, rim click, warm sine pads (Fmaj7 - Am7 - Dm7 - Cmaj7), gentle sub bass,
no hats, quiet (about -22 dB mean). Starts on the beat and has no fade, so it loops with the video.
Usage: python3 music_soft.py <seconds> <out.wav> [cut1,cut2,...]"""
import sys, wave, numpy as np
SR = 44100
dur = float(sys.argv[1]); out = sys.argv[2]
cuts = [float(x) for x in sys.argv[3].split(",")] if len(sys.argv) > 3 and sys.argv[3] else []
n = int(SR * dur); mix = np.zeros(n); rng = np.random.default_rng(3)
beat = 60 / 88
def add(sig, t, g=1.0):
    i = int(t * SR) % n
    j = min(n, i + len(sig)); mix[i:j] += sig[: j - i] * g
    rest = len(sig) - (j - i)
    if rest > 0: mix[:rest] += sig[j - i:] * g  # wrap so the loop point stays seamless
def kick():
    t = np.arange(int(0.3 * SR)) / SR
    return np.sin(2 * np.pi * np.cumsum(45 + 60 * np.exp(-t * 25)) / SR) * np.exp(-t * 12)
def rim():
    t = np.arange(int(0.08 * SR)) / SR
    return (np.sin(2 * np.pi * 1700 * t) * 0.6 + rng.normal(0, 0.3, len(t))) * np.exp(-t * 70)
def pad(freqs, length):
    t = np.arange(int(length * SR)) / SR
    s = sum(np.sin(2 * np.pi * f * t) + 0.3 * np.sin(2 * np.pi * 2 * f * t) for f in freqs) / len(freqs)
    a = np.minimum(t / 0.25, 1) * np.minimum((length - t) / 0.3, 1)
    return s * np.clip(a, 0, 1) * (1 + 0.15 * np.sin(2 * np.pi * 4.5 * t))
chords = [[174.61, 220.0, 261.63, 329.63], [220.0, 261.63, 329.63, 392.0], [146.83, 174.61, 220.0, 261.63], [130.81, 164.81, 196.0, 246.94]]
roots = [43.65, 55.0, 36.71, 32.70]
bar = 0; t = 0.0
while t < dur:
    add(pad(chords[bar % 4], 4 * beat + 0.2), t, 0.35)
    add(pad([roots[bar % 4] * 2], 4 * beat), t, 0.5)
    for b in range(4):
        tb = t + b * beat
        if b in (0, 2): add(kick(), tb, 0.6)
        if b in (1, 3): add(rim(), tb, 0.25)
    t += 4 * beat; bar += 1
for c in cuts:  # very soft air swell on each cut
    w = int(0.3 * SR); s = np.convolve(rng.normal(0, 1, w), np.ones(12) / 12, "same") * np.sin(np.pi * np.arange(w) / w) ** 2
    add(s, max(0, c - 0.15), 0.08)
mix /= np.max(np.abs(mix)); mix *= 0.35  # quiet: sits under the visuals
st = np.stack([mix, mix], 1)
with wave.open(out, "wb") as w:
    w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes((st * 32767).astype(np.int16).tobytes())
print("ok", out)
