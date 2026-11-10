"""realcompose.py — 16:9 and 9:16 deliverables from realcut.py's clean master.

  python tools/realcompose.py [voice.wav]

* 16:9 (Kickstarter's player): the phone recording centred on PriceBack green,
  the "2x sped up" label beside the phone while a segment runs fast.
* 9:16 (social): the recording full frame, the label as a pill under the status bar.
* With a voice track, it is mixed in (the video is the timing master; the voice
  is placed by tools/realvoice.py).
"""
import json
import os
import subprocess
import sys

FFMPEG = os.environ.get("FFMPEG", "E:/tools/video/node_modules/ffmpeg-static/ffmpeg.exe")
DIR = os.environ.get("OUT_DIR", "E:/tools/video/realcut")
FONT = "C\\:/Windows/Fonts/segoeuib.ttf"
GREEN = "0x0c4a2e"


def enable(labels):
    return "+".join(f"between(t,{l['from']:.3f},{l['to'] - 0.001:.3f})" for l in labels) or "0"


def drawtexts(labels, x, y, size, box):
    """One drawtext per distinct label text (2x, 3x, 1.5x)."""
    out = []
    for text in sorted({l["text"] for l in labels}):
        ls = [l for l in labels if l["text"] == text]
        shown = "\u00bb  " + text.replace("x sped up", "\u00d7 sped up")
        out.append(
            f"drawtext=fontfile='{FONT}':text='{shown}':fontsize={size}:fontcolor=white:"
            f"x={x}:y={y}:{box}enable='{enable(ls)}'")
    return out


def main():
    tl = json.load(open(os.path.join(DIR, "timeline.json")))
    labels = tl["labels"]
    voice = sys.argv[1] if len(sys.argv) > 1 else None
    clean = os.path.join(DIR, "clean-9x16.mp4")
    audio_in = ["-i", voice] if voice else []
    audio_map = ["-map", "1:a", "-c:a", "aac", "-b:a", "192k", "-shortest"] if voice else ["-an"]
    suffix = "-voice" if voice else "-silent"

    # 16:9
    phone_h = 1010
    phone_w = round(1080 * phone_h / 2424 / 2) * 2
    px = (1920 - phone_w) // 2
    side_x = px + phone_w + 60
    f169 = [f"color=c={GREEN}:s=1920x1080:r=30:d={tl['duration']}[bg]",
            f"[0:v]scale={phone_w}:{phone_h}:flags=lanczos[ph]",
            f"[bg][ph]overlay={px}:{(1080 - phone_h) // 2}:shortest=1[v0]"]
    chain = drawtexts(labels, side_x, 500, 46, "box=1:boxcolor=0x000000@0.35:boxborderw=22:")
    f169.append("[v0]" + (",".join(chain) if chain else "null") + "[v]")
    subprocess.run([FFMPEG, "-v", "error", "-y", "-i", clean, *audio_in, "-filter_complex", ";".join(f169),
                    "-map", "[v]", *audio_map, "-c:v", "libx264", "-preset", "medium", "-crf", "18",
                    "-pix_fmt", "yuv420p", "-movflags", "+faststart",
                    os.path.join(DIR, f"priceback-kickstarter-real-16x9{suffix}.mp4")], check=True)

    # 9:16
    chain = drawtexts(labels, "(w-text_w)/2", 175, 54, "box=1:boxcolor=0x0c4a2e@0.85:boxborderw=24:")
    f916 = "[0:v]" + (",".join(chain) if chain else "null") + "[v]"
    subprocess.run([FFMPEG, "-v", "error", "-y", "-i", clean, *audio_in, "-filter_complex", f916,
                    "-map", "[v]", *audio_map, "-c:v", "libx264", "-preset", "medium", "-crf", "18",
                    "-pix_fmt", "yuv420p", "-movflags", "+faststart",
                    os.path.join(DIR, f"priceback-kickstarter-real-9x16{suffix}.mp4")], check=True)
    print("composed", suffix)


if __name__ == "__main__":
    main()
