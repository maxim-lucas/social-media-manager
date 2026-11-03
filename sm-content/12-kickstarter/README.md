# 12 · Kickstarter video + app feature videos (2026-11-02 → 11-03)

Screen-recording-style videos of the PriceBack app, in a phone frame, voiced in Maxim's own (cloned) voice, each in
**9:16** (Instagram Reels, Kickstarter Discovery Mode) and **16:9** (Kickstarter main video, YouTube). **Not
posted; for review.**

| Film | `?film=` | Script | Length | Output |
| --- | --- | --- | --- | --- |
| Kickstarter: scan → real drops → claim | `kickstarter` | `SCRIPT.md` | 43.9 s | `out/priceback-kickstarter-{9x16,16x9}-en.mp4` |
| Scan a price tag | `tag` | `SCRIPT-tag.md` | 22.2 s | `out/priceback-tag-{9x16,16x9}-en.mp4` |
| The price translator | `translator` | `SCRIPT-translator.md` | — | `out/priceback-translator-{9x16,16x9}-en.mp4` |
| Claim a price drop | `claim` | `SCRIPT-claim.md` | — | `out/priceback-claim-{9x16,16x9}-en.mp4` |

**Rules** (`RULES-README.md` §5b, plus Maxim's decisions in each script): the app screens are rebuilt from the
app's code (layout, styles, real English labels) and must look like a real screen recording; real data (prod
prices and drops, real tags, real Costco receipts masked to the logo); one consistent story; **voice first, then
picture** (Maxim validates the voice-over before the video is redone); English first, French on hold; no call
to action in the voice; captions of every spoken line fill the space beside / above the phone.

## Files

| Path | What |
| --- | --- |
| `scenes/app-recording.html` | The app, rebuilt from its code, animated as an Android screen recording. `?film=` picks the film, `?layout=tall|wide` the format; `renderAt(t)` draws any frame. |
| `scenes/timeline-<film>.js` | Generated: the picture's time-warp onto the voice + the captions. |
| `scenes/render.js` | `FILM=<film> node scenes/render.js stills|tall|wide|all` (headless Chrome + ffmpeg); mixes `audio/voiceover-final[-<film>]-en.wav`. |
| `scenes/assets/fonts/` | The app's fonts: Inter Tight, Plus Jakarta Sans (OFL), Ionicons (MIT). |
| `sources/` | Masked receipts (`mask_receipts.py`; originals never copied here) and the real shelf-tag photo crop. |
| `tools/prepare_sample.py` | Voice sample → DeepFilterNet3 denoise → `E:/tools/voice/ref-<tag>.wav` (never committed). |
| `tools/voiceover.py` | Script lines → voice-over in Maxim's voice (Chatterbox, MIT). Take C = US accent (built-in American voice + voice conversion to Maxim's timbre). Each line is checked word by word by Whisper and re-generated until it matches; each take stores a speaker-similarity score. |
| `tools/build_timeline.py` | Chosen take → `scenes/timeline-<film>.js` + `audio/voiceover-final[-<film>]-en.wav`. |
| `tools/install-*.sh` | Local installs on E: (Chatterbox, DeepFilterNet; OpenVoice was rejected). |
| `VOICE_SAMPLE.md` | How to record a clean voice sample. |
| `SOURCES.md`, `SCRIPT*.md` | Every number and label, and where it comes from. |

## Rebuild a film

```
bash tools/install-chatterbox.sh && bash tools/install-deepfilter.sh            # once
E:/tools/deepfilter/.venv/Scripts/python.exe tools/prepare_sample.py audio/Recording.m4a s1
FILM=tag VOICE_TAG=s1 E:/tools/chatterbox/.venv/Scripts/python.exe tools/voiceover.py en C
FILM=tag E:/tools/chatterbox/.venv/Scripts/python.exe tools/build_timeline.py audio/voiceover-en-tag-C-s1.json
FILM=tag node scenes/render.js stills      # review frames first
FILM=tag node scenes/render.js all         # 9:16 + 16:9 with the voice
```
(`NODE_PATH` must point at a `node_modules` with `puppeteer-core@23` and `ffmpeg-static@5`; set `FFMPEG` for the
Python tools to that ffmpeg-static binary.)
