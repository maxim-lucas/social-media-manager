"""realcut.py — one Kickstarter video from Maxim's two real screen recordings.

  python tools/realcut.py            -> E:/tools/video/realcut/clean-9x16.mp4 + timeline.json

What it does, per segment of the EDL below:
  * decodes the source at a CONSTANT 30 fps (the phone recorder writes variable
    frame rate, 1 fps on still screens -> stutter in most players), sped up by the
    segment's factor (a "sped up" label is added later for factor > 1);
  * blurs the shopper's private details, found per frame by template matching:
    the Costco member number on the paper receipts, the Admin console row, the
    "Admins only" badge, and a personal to-do widget on the home screen;
  * writes one silent 1080x2424 master and timeline.json (segment and label times
    in OUTPUT seconds) for compose/voice timing.

Sources (not committed, E:/To Be Transfered, override with SRC_DIR):
  r1 = screen-20261110-130939-1794334085945.mp4   scan -> track -> profile -> stores
  r2 = screen-20261110-145440-1794340415970~2.mp4 drop alerts -> claims -> $34.60

Run with E:/tools/cvtools/.venv (opencv-python-headless + numpy).
"""
import json
import os
import subprocess
import sys

import cv2
import numpy as np

FFMPEG = os.environ.get("FFMPEG", "E:/tools/video/node_modules/ffmpeg-static/ffmpeg.exe")
SRC_DIR = os.environ.get("SRC_DIR", "E:/To Be Transfered")   # never C: (Maxim, 2026-11-10)
SRC = {
    "r1": f"{SRC_DIR}/screen-20261110-130939-1794334085945.mp4",
    "r2": f"{SRC_DIR}/screen-20261110-145440-1794340415970~2.mp4",
}
OUT_DIR = os.environ.get("OUT_DIR", "E:/tools/video/realcut")
W, H, FPS = 1080, 2424, 30

# (id, source, start, end, speed). Speed > 1 = fast-forward with a label.
EDL = [
    ("splash",       "r1",  0.0,  3.0, 1.0),
    ("home-scan",    "r1",  3.0,  6.0, 1.0),
    ("camera1",      "r1",  6.0, 12.0, 2.0),
    ("preview1",     "r1", 12.0, 13.9, 1.0),
    ("reading1",     "r1", 13.9, 16.0, 3.0),
    ("confirm1",     "r1", 16.0, 21.0, 1.0),
    ("expired",      "r1", 21.0, 26.0, 2.0),
    ("back",         "r1", 26.0, 29.0, 1.5),
    ("camera2",      "r1", 29.0, 35.4, 2.0),
    ("preview2",     "r1", 35.4, 37.2, 1.0),
    ("reading2",     "r1", 37.2, 40.0, 3.0),
    ("confirm2",     "r1", 40.0, 52.0, 1.0),
    ("tracking",     "r1", 52.0, 58.2, 1.0),
    ("profile",      "r1", 58.2, 72.6, 1.5),
    ("plans",        "r1", 72.6, 75.6, 1.0),
    ("stores",       "r1", 75.6, 82.6, 1.5),
    ("products",     "r1", 82.6, 92.3, 1.5),
    ("CARD",         None,  0.0,  1.6, 1.0),   # "A few days later" card
    ("alerts",       "r2",  0.0,  4.4, 1.0),
    ("shade",        "r2",  4.4, 12.0, 1.0),
    ("drop-detail",  "r2", 12.0, 20.0, 1.0),
    ("to-claim",     "r2", 20.0, 29.0, 1.0),
    ("feta",         "r2", 29.0, 38.5, 1.0),
    ("claim-feta",   "r2", 38.5, 43.5, 1.0),
    ("claims",       "r2", 43.5, 58.5, 2.0),
    ("saved",        "r2", 58.5, 62.3, 1.0),
]

T = "E:/tools/video/frames/"
# name: (reference frame, x, y, w, h) in full-resolution pixels.
TEMPLATES = {
    "mem_a": (T + "a.png", 218, 745, 334, 33),
    "mem_b": (T + "b.png", 170, 670, 445, 38),
    "mem_c": (T + "c.png", 128, 852, 344, 56),
    "mem_d": (T + "d.png", 135, 710, 485, 42),
    "mem_e": (T + "e.png", 213, 1050, 390, 35),
    "admin": (T + "h.png", 80, 1505, 420, 70),
    "badge": (T + "g.png", 400, 780, 250, 50),
}
# (source, from, to, templates, scales, pad(l,t,r,b), min score, fallback box or None)
# fallback: blurred when the line cannot be found and no box was seen in the last
# 0.6 s, so a missed match never shows the member number.
TRACKS = [
    ("r1",  6.0, 12.0, ["mem_a"], np.arange(0.80, 1.25, 0.03), (40, 18, 60, 18), 0.45, (60, 600, 760, 260)),
    ("r1", 12.0, 14.0, ["mem_b"], np.arange(0.90, 1.12, 0.03), (40, 14, 60, 14), 0.45, (60, 600, 760, 200)),
    ("r1", 29.0, 35.4, ["mem_c", "mem_a"], np.arange(0.75, 1.30, 0.03), (40, 18, 60, 18), 0.40, (0, 660, 760, 420)),
    ("r1", 35.4, 37.2, ["mem_d"], np.arange(0.90, 1.12, 0.03), (40, 14, 60, 14), 0.45, (60, 660, 700, 140)),
    ("r2", 33.0, 37.0, ["mem_e"], np.arange(0.45, 1.25, 0.03), (40, 14, 60, 14), 0.45, None),
    ("r1", 58.2, 77.0, ["admin"], [1.0], None, 0.60, None),
    ("r1", 75.6, 83.0, ["badge"], [1.0], (14, 10, 14, 10), 0.55, None),
]
# Static boxes: (source, from, to, x, y, w, h) — the home-screen to-do widget.
STATIC = [("r2", 4.4, 6.4, 0, 420, 650, 1200)]
# Supported Stores page: every store but Costco is blurred (Maxim, 2026-11-10: Best Buy reads "30 days" and is
# not marked coming soon), and so is the "2 available now" count. Found per frame: the page by its title, the
# Costco card by its logo + name, so the card stays sharp while the list scrolls.
STORES_PAGE = ("r1", 75.6, 83.0)
STORES_TPL = {"title": (T + "stores.png", 36, 225, 520, 75), "costco": (T + "stores.png", 80, 1185, 480, 110)}
STORES_LIST = (715, 2145)          # list viewport, below the filter chips, above the tab bar
STORES_COUNT = (30, 305, 640, 70)  # "2 available now · 4 more coming soon"
COSTCO_CARD = (-50, 335)           # card top/bottom relative to the logo match
LABEL_MIN_SPEED = 1.01
LABEL_MIN_DUR = 1.0      # a sped-up label shorter than this would only flash

# EDL=<file.json> replaces the EDL above: [[id, src|null, start, end, speed(, hold seconds)], ...]
if os.environ.get("EDL"):
    EDL = [tuple(e) for e in json.load(open(os.environ["EDL"], encoding="utf-8"))]
CARD_TEXT = "A few days later"


def load_templates():
    out = {}
    for k, (path, x, y, w, h) in TEMPLATES.items():
        img = cv2.imread(path, cv2.IMREAD_GRAYSCALE)
        if img is None:
            sys.exit(f"missing template frame {path}")
        out[k] = img[y:y + h, x:x + w]
    for k, (path, x, y, w, h) in STORES_TPL.items():
        out[k] = cv2.imread(path, cv2.IMREAD_GRAYSCALE)[y:y + h, x:x + w]
    return out


def find(gray, tpl, scales):
    """Best (score, x, y, w, h) of tpl in gray at half resolution, in full-res pixels."""
    g = cv2.resize(gray, None, fx=0.5, fy=0.5, interpolation=cv2.INTER_AREA)
    best = (-1, 0, 0, 0, 0)
    for s in scales:
        t = cv2.resize(tpl, None, fx=0.5 * s, fy=0.5 * s, interpolation=cv2.INTER_AREA)
        if t.shape[0] < 6 or t.shape[1] < 20 or t.shape[0] >= g.shape[0] or t.shape[1] >= g.shape[1]:
            continue
        r = cv2.matchTemplate(g, t, cv2.TM_CCOEFF_NORMED)
        _, mx, _, loc = cv2.minMaxLoc(r)
        if mx > best[0]:
            best = (mx, loc[0] * 2, loc[1] * 2, t.shape[1] * 2, t.shape[0] * 2)
    return best


def blur(frame, x, y, w, h):
    x0, y0 = max(0, int(x)), max(0, int(y))
    x1, y1 = min(W, int(x + w)), min(H, int(y + h))
    if x1 - x0 < 4 or y1 - y0 < 4:
        return
    roi = frame[y0:y1, x0:x1]
    small = cv2.resize(roi, (max(1, (x1 - x0) // 18), max(1, (y1 - y0) // 18)), interpolation=cv2.INTER_AREA)
    frame[y0:y1, x0:x1] = cv2.GaussianBlur(cv2.resize(small, (x1 - x0, y1 - y0), interpolation=cv2.INTER_LINEAR), (31, 31), 0)


def blur_stores(frame, gray, tpls):
    """Blur the Supported Stores list except the Costco card. Returns True when the page was found."""
    if find(gray, tpls["title"], [1.0])[0] < 0.6:
        return False
    blur(frame, *STORES_COUNT)
    top, bot = STORES_LIST
    score, _, y, _, _ = find(gray, tpls["costco"], [1.0])
    if score >= 0.85:   # other store cards (logo + name) match at ~0.71
        ct, cb = y + COSTCO_CARD[0], y + COSTCO_CARD[1]
        if ct > top:
            blur(frame, 0, top, W, min(ct, bot) - top)
        if cb < bot:
            blur(frame, 0, max(cb, top), W, bot - max(cb, top))
    else:
        blur(frame, 0, top, W, bot - top)
    return True


def admin_box(m):
    # The match is the shield + "Admin console"; hide the whole card and the ADMIN label above it.
    _, x, y, w, h = m
    return (30, y - 130, W - 60, h + 240)


def make_card(n):
    img = np.zeros((H, W, 3), np.uint8)
    img[:] = (0x2e, 0x4a, 0x0c)  # BGR of #0c4a2e, PriceBack dark green
    font = cv2.FONT_HERSHEY_DUPLEX
    (tw, th), _ = cv2.getTextSize(CARD_TEXT, font, 2.6, 4)
    cv2.putText(img, CARD_TEXT, ((W - tw) // 2, (H + th) // 2), font, 2.6, (255, 255, 255), 4, cv2.LINE_AA)
    return [img] * n


def segment_frames(src, start, end, speed):
    dur = end - start
    vf = f"setpts=(PTS-STARTPTS)/{speed},fps={FPS},scale={W}:{H}"
    p = subprocess.Popen(
        [FFMPEG, "-v", "error", "-ss", f"{start:.3f}", "-t", f"{dur:.3f}", "-i", SRC[src],
         "-vf", vf, "-an", "-f", "rawvideo", "-pix_fmt", "bgr24", "-"],
        stdout=subprocess.PIPE)
    size = W * H * 3
    i = 0
    want = int(round(dur / speed * FPS))   # exact: the decoder pads a VFR tail
    while i < want:
        buf = p.stdout.read(size)
        if len(buf) < size:
            break
        yield start + i * speed / FPS, np.frombuffer(buf, np.uint8).reshape(H, W, 3).copy()
        i += 1
    p.stdout.close()
    p.kill()
    p.wait()


def main():
    os.makedirs(OUT_DIR, exist_ok=True)
    tpls = load_templates()
    out_path = os.path.join(OUT_DIR, "clean-9x16.mp4")
    enc = subprocess.Popen(
        [FFMPEG, "-v", "error", "-y", "-f", "rawvideo", "-pix_fmt", "bgr24", "-s", f"{W}x{H}", "-r", str(FPS),
         "-i", "-", "-c:v", "libx264", "-preset", "medium", "-crf", "16", "-pix_fmt", "yuv420p", out_path],
        stdin=subprocess.PIPE)
    timeline, labels, misses = [], [], []
    t_out = 0
    last = {}
    for seg_id, src, a, b, speed, *rest in EDL:
        hold = rest[0] if rest else 0.0   # seconds the segment's last frame is held (tools/realtime.py: voice room)
        n0 = t_out
        frame = None
        if src is None:
            for f in make_card(int(round((b - a) * FPS))):
                enc.stdin.write(f.tobytes())
                t_out += 1
                frame = f
        else:
            for t_src, frame in segment_frames(src, a, b, speed):
                gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
                for (s, fa, fb, names, scales, pad, thr, fallback) in TRACKS:
                    if s != src or not (fa <= t_src < fb):
                        continue
                    key = (s, fa)
                    best = max((find(gray, tpls[nm], scales) for nm in names), key=lambda m: m[0])
                    if best[0] >= thr:
                        last[key] = (t_src, best)
                    elif key in last and t_src - last[key][0] <= 0.6 and pad is not None:
                        best = last[key][1]      # brief miss (blur, motion): keep the last box
                    else:
                        misses.append((seg_id, names[0], round(t_src, 2), round(best[0], 2), "fallback" if fallback else "none"))
                        if fallback:
                            blur(frame, *fallback)
                        continue
                    if names == ["admin"]:
                        blur(frame, *admin_box(best))
                    else:
                        _, x, y, w, h = best
                        l, tp, r, bt = pad
                        blur(frame, x - l, y - tp, w + l + r, h + tp + bt)
                if src == STORES_PAGE[0] and STORES_PAGE[1] <= t_src < STORES_PAGE[2]:
                    blur_stores(frame, gray, tpls)
                for (s, fa, fb, x, y, w, h) in STATIC:
                    if s == src and fa <= t_src < fb:
                        blur(frame, x, y, w, h)
                enc.stdin.write(frame.tobytes())
                t_out += 1
        for _ in range(int(round(hold * FPS)) if frame is not None else 0):
            enc.stdin.write(frame.tobytes())
            t_out += 1
        seg = {"id": seg_id, "src": src, "from": a, "to": b, "speed": speed, "hold": hold,
               "out_from": round(n0 / FPS, 3), "out_to": round(t_out / FPS, 3)}
        timeline.append(seg)
        if speed >= LABEL_MIN_SPEED and seg["out_to"] - seg["out_from"] >= LABEL_MIN_DUR:
            labels.append({"from": seg["out_from"], "to": seg["out_to"], "text": f"{speed:g}x sped up"})
        print(f"{seg_id:12s} {seg['out_from']:7.2f} -> {seg['out_to']:7.2f}", flush=True)
    enc.stdin.close()
    enc.wait()
    with open(os.path.join(OUT_DIR, "timeline.json"), "w") as fh:
        json.dump({"fps": FPS, "duration": round(t_out / FPS, 3), "segments": timeline, "labels": labels,
                   "card": CARD_TEXT}, fh, indent=1)
    print(f"done: {t_out / FPS:.1f}s, member-number misses (no box drawn): {len(misses)}")
    for m in misses:
        print("  miss", m)


if __name__ == "__main__":
    main()
