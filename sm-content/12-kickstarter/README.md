# 12 · Kickstarter campaign video (2026-11-02)

The video for PriceBack's Kickstarter project page: a **45-second screen recording of the app**, with a 9:16
cut for Kickstarter's Discovery Mode and a 16:9 cut for the main project video. **Not posted; for review.**

> **Status 2026-11-02: first draft, being redesigned to follow `RULES-README.md` §5b** (real confirm screen
> with warehouse/date/items/Start tracking, drops only on products from the scanned receipts, recent receipts,
> phone frame, realistic days left, narration says the drops are real). The draft renders were removed; nothing
> here is final.

**Exception to `RULES-README.md` (Monica, 2026-11-02): "the rules don't apply to this video."** It shows a real
Costco receipt with the printed Costco logo, real receipts from the app's test fixtures (masked so they belong to
nobody), on-screen app UI only, up to 45 s. Its own rule: **it must look like a real screen recording of the
app, not a render.**

## Files

| Path | What |
| --- | --- |
| `scenes/app-recording.html` | The app, rebuilt from the app's code (theme, HomeScreen, ScanTemplate, ReceiptScanningAnimation, DetailScreen, App.js tab bar, BrandMark, EN strings) and animated as an Android screen recording. `renderAt(t)` draws any frame. |
| `scenes/render.js` | Renders the stills, the 9:16 MP4 and the 16:9 MP4 (headless Chrome + ffmpeg). |
| `scenes/assets/fonts/` | The app's own fonts: Inter Tight, Plus Jakarta Sans (OFL) and Ionicons (MIT), copied from the app's `node_modules`. |
| `sources/mask_receipts.py` | Builds the two masked receipts from the app's fixtures. Only the logo, SUBTOTAL/TAX/TOTAL and the date stay readable; everything else is mosaicked and blurred. |
| `sources/receipt-paper-masked.png`, `sources/receipt-pdf-masked.png` | The masked receipts the video shows. The **originals are never copied here.** |
| `SOURCES.md` | Every number, where it comes from, and what is demo data. |
| `SCRIPT.md` | The narration, timed to the recording. |
| `out/` | Renders: `priceback-kickstarter-9x16.mp4`, `priceback-kickstarter-16x9.mp4`, `stills/`, `contact-sheet.png`. |

## Rebuild

```
python sources/mask_receipts.py                     # masked receipts (needs Pillow + PyMuPDF)
npm i puppeteer-core@23 ffmpeg-static@5             # once, in any folder; set NODE_PATH to its node_modules
node scenes/render.js stills                        # review frames first
node scenes/render.js all                           # 9:16 + 16:9; mixes audio/narration.wav when present
```

## Timeline (seconds)

| From | To | Screen |
| --- | --- | --- |
| 0.0 | 4.0 | Home, 4 products tracked, nothing to claim yet; tap the Scan button |
| 4.0 | 12.4 | Scan receipt → document scanner on the **paper receipt** → capture → "Scanning receipt…" |
| 12.4 | 15.3 | Confirm receipt: Costco, Dec 5, 2025, $79.92 / $4.03 / **$83.95** → Save |
| 15.3 | 22.9 | Home → Scan → **Upload file** → Files: "Costco receipt.pdf" → scanning → Confirm: Jun 28, 2025, **$336.80** → Save |
| 22.9 | 27.3 | Home; notification "🟢 Price drop on a recent purchase · You can save $13.00 · 25d left." |
| 27.3 | 32.4 | To claim **$23.00**: Van Houtte coffee +$13, Chefman kettle +$10; notification "🔴 Last days to claim a price drop · You can save $600.00 · Last day." |
| 32.4 | 36.2 | To claim **$1623.00**: Generac generator +$1,000, Samsung QN80H TV +$600 (last day), coffee, kettle |
| 36.2 | 41.6 | Tap the TV → Price drop: +$600.00 to claim, then "How to claim at a Costco warehouse" (the app's 4 steps) |
| 41.6 | 45.0 | Home → the PriceBack app icon and name |
