# teaser — PriceBack pre-launch teaser pack

Runs **before** the launch pack in `sm-content/`. Four numbered feed posts and
six story frames that put a receipt in front of people and refuse to say why.
Warm thermal paper, monospace print, mostly empty space, one green element per
frame at most — deliberately nothing like the dark, emerald-glow launch pack.

The series is spined on the number **30**, which reads as a countdown and is
actually the product's price-adjustment window. Nobody can decode that from the
teaser; it re-reads on launch day.

## Folders

| Folder | Count | What |
| --- | --- | --- |
| `posts/` | 8 | 1080×1350 feed posts, `01/04`…`04/04` — EN + FR |
| `stories/` | 12 | 1080×1920 story frames, 4 of them leaving a sticker band — EN + FR |
| `scenes/` | — | The renderer. Edit here, never edit a PNG |

Total: 20 assets.

## Read first

**`TEASER-NOTES.md`** — the concept and the escalation, the 11-day calendar,
captions in both languages, sticker placement and copy, the hashtag decision
and why it differs from the launch set, and the compliance rules the copy is
built around.

## Re-rendering

```bash
node sm-content/teaser/scenes/render.js     # all 20 assets
node sm-content/teaser/scenes/verify.js     # six gates, must exit 0
```

Copy lives in `scenes/strings.json`, both languages side by side. Change a word
there and re-render.

Requires **Roboto Mono** (Apache-2.0) on the machine — librsvg resolves it from
the system font list, and substitutes silently if it is missing, which is why
`verify.js` measures a probe rather than trusting it.

## Rules the assets encode

- **No wordmark, no retailer, no amount.** Every figure is a black bar. That is
  compliance, not styling — see the notes.
- **Nothing under Instagram's chrome.** Enforced by rendering each scene with
  the paper stripped and testing the alpha channel, not by eye.
- **EN and FR always ship together.** Enforced.
