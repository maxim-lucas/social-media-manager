# 11 · Realistic tutorials: one short film per main feature

Started 2026-10-28. **Video 01 is at animatic stage; nothing here is posted.** The style is real life, not the
cartoon videos and not the motion-graphics Reels: a real-looking person in a real-looking kitchen and warehouse,
a natural voice, a quiet music bed, and the app shown as **real screen recordings**. These are tutorials for
people who already have the app or are about to; they live in the app (Profile → Tutorials, `src/constants/tutorials.js`),
on YouTube @priceback, and as Reels/TikToks. Each ends on a tutorial outro (recap, next tutorial, follow on
Instagram, Facebook, TikTok and YouTube), not an ad.

## How a video is made

| Layer | Source | Why |
| --- | --- | --- |
| People, kitchen, warehouse, hands, paper | AI footage: a photoreal keyframe (Nano Banana Pro, with the character and fake-receipt references), animated with Kling 3.0 | Realistic scenes without a shoot |
| Anything on the phone screen | **A real screen recording** from the shipped app | AI cannot draw an app UI truthfully; a recording can't misstate the product |
| Receipts | **The fake receipt only** (`tools/fake-receipt.js`): warehouse #000, member/card/auth all zeros, "EXAMPLE · NOT A REAL RECEIPT" in the header | No real member data, ever |
| Shelf tags, barcodes, products | **Real products and real tags** from PriceBack's verified price points, with the date they were seen | Price-tag and Price Checker videos must show reality |
| Voice | Kokoro-82M, voice Bella, rendered locally (free); Higgsfield voice or a recorded voice are drop-in alternatives | Same file layout: `audio/vo/<shot>.wav` |
| Music | Original bed synthesised by `tools/music.js` | Owned outright, safe for paid and YouTube |
| Captions, outro | `tools/cards.js` (HTML → PNG) | Works muted; brand type and palette |

`shots.json` is the single source for each video. One command renders whatever exists: shots that are not
generated or recorded yet appear as labelled previz cards, so the same build gives the animatic today and
the final film later.

```
node tools/fake-receipt.js 01-scan-receipt/receipt   # the only receipt allowed on screen (PNG + printable PDF)
node tools/vo-local.js     01-scan-receipt 1 0.95    # voice, with a fit report per shot
node tools/music.js 48.5   01-scan-receipt/audio/bed.wav
node tools/cards.js        01-scan-receipt           # captions, fine print, outro, previz cards
node tools/assemble.js     01-scan-receipt           # → previz/…-animatic-en.mp4, or out/…-en.mp4 when complete
node tools/gates.js        01-scan-receipt           # 9 gates, exit 1 on any failure
node tools/script-md.js    01-scan-receipt           # SCRIPT.md for review
```

**Gates:** format (1080×1920, 30 fps, H.264 High, yuv420p, AAC 48 kHz, faststart) · duration · loudness
(−14 LUFS, true peak ≤ −1.5 dBFS) · no black · no frozen frames · every voice line fits its shot · every
text box inside the Instagram story safe zone · copy rules (scan not snap, claim not get, no dollar figures,
no subscription price, Costco ⇒ not-affiliated line, item count and date never named) · receipt rule.

French: after English sign-off. Footage is language-free, so French re-uses every generated clip; only the
voice, the captions and the outro are redone.

## The series

| # | Tutorial | App tutorial id | Status |
| --- | --- | --- | --- |
| 01 | How to scan your Costco receipt | `firstReceipt` | **Animatic for review** |
| 02 | How to scan a shelf price tag | `priceTag` | Outline below |
| 03 | Price Checker: scan a barcode before you buy | (new id) | Outline below |
| 04 | You got a price-drop alert: how to claim | `priceDrop` | Outline below |
| 05 | Price translator: what the price ending means | (new id) | Outline below; check it's in the live store build |
| 06 | Upload a receipt from your photos or a file | (new id) | Outline below |

### 01 · How to scan your Costco receipt (built: see `01-scan-receipt/SCRIPT.md`)

Hook (standing on a chair to fit the whole receipt) → focus on the header, every item and the totals → QR codes,
membership offers and ads at the bottom stay out → flat, good light, phone straight above → real
scan → **what gets declined**: blurry or dark photos, and a photo of the total alone ("there are no items to
watch") → real decline screen → the payoff: PriceBack watches every item and alerts on a verified drop → outro.
Every receipt frame runs from the header (with the member line, which sits at the top on a real Costco receipt)
down to the date line under the item count, so both are always captured; neither is ever named.

### 02 · How to scan a shelf price tag

Real products only, from `priceback.price_points` (verified tag scans), shown with the date seen. Candidates
from the Oct 27, 2026 pull (`08-costco-price-drops/scenes/weeks/2026-10-27-grocery-pantry-snacks.json`):
Gia Indian basmati rice, item 1405731, $39.99, $10.00 instant savings, $29.99 until Nov 8, 2026; Quest
protein chips nacho 14 × 32 g, item 2688395, $36.99 → $28.99 until Nov 1, 2026. Pick whichever tag is still
on the shelf on shoot day; the on-screen tag must be the real tag.

Beats: shopper in the aisle spots a savings tag → frame the whole tag including the item number, no glare,
sharp digits (`priceTag.tip1–3`) → real recording of the scan → add the end date if the tag has one →
only **savings** tags are kept and can earn credit; the credit arrives once 3 shoppers have confirmed the same
price, and it is capped weekly (`facts.json` → contribution; `priceTag.savingsOnlyNotice`) → each tag goes
anonymously into the price pool for your area (`priceTag.introSub`) → outro.
Needs: an in-store screen recording of a real tag scan (AI can't render a correct tag).

### 03 · Price Checker: scan a barcode before you buy

Beats: shopper holding a product, unsure → Scan → Price Checker → point at the barcode (UPC, EAN, Code 128) or
type the number → the last known price in your area or province, with the date it was seen
(`barcode.lastKnownInArea`, `barcode.observedOn`) → your own purchase history for it (`barcode.yourHistory`) →
choose a warehouse to see its prices (`barcode.selectWarehouse`) → "No price on record yet" is normal for a new
item → outro. Needs: a real product whose barcode returns a price in production on recording day.

### 04 · You got a price-drop alert: how to claim

Beats: the alert arrives (drops are verified by 3 shoppers and reviewed before anyone is alerted:
`PRICE_VERIFY_MIN_USERS`, review queue) → open the Claim Assistant → Costco warehouse adjustments are asked for
**in person** (`claim.emailWarehouseBlockedBody`) → show the receipt straight from the app at the counter
(`claim.receiptPreferred`) → the in-store checklist → two reminders before the window closes, one early and
one last-day → the store decides (claim, never get) → outro. Needs: a recording of a real claim screen on a test
account with the fake receipt.

### 05 · Price translator

Type the price on the tag; the ending tells you what kind of deal it usually is; the star means the item won't be
restocked; works without internet (`priceTag.translator.*`). Always framed as a shopper rule of thumb, not
Costco policy (07-costco-toolkit decision 1). **Check before scripting:** it is in tag v3.2.0; confirm 3.2.0 is the
build live in both stores.

### 06 · Upload a receipt from your photos or a file

Photo library, PDF or email file (`scan.gallery`, `scan.uploadFile`), with the same rule as 01: header, every
item, totals; QR codes, membership offers and ads left out of the image; total-only images are declined.

## Credits (Higgsfield, priced 2026-10-28 with `get_cost`)

| Item | Unit | Video 01 |
| --- | --- | --- |
| Character reference (Nano Banana Pro 2k) | 2 | 2 |
| Keyframes, one per AI shot (7) | 2 | 14 |
| Kling 3.0 std, silent, 40 s total | 1.5 / s | 60 |
| Voice | 0 local · 1 per line on Higgsfield | 0 (or 10) |
| **First pass** | | **76** |
| Retake reserve (about half the shots once) | | ~38 |
| **Budget for video 01** | | **~115** |

Videos 02–06 have more screen recording and fewer AI shots (about 4–5 each): roughly 60–90 credits each with
reserve, so about **450–550 credits** for all six in English. French adds no footage, only voice.
The account holds **1.1 credits** today, so no AI footage has been generated yet.

## Open decisions for Maxim

1. **Approve the 01 animatic** (pacing, wording, decline beats, outro) before any credits are spent.
2. **Voice:** keep the free local voice, use a Higgsfield voice, or record your own (you're bilingual; it would also
   carry the French cut).
3. **Totals-only photos:** today they're refused as *unreadable* (no credit) or stopped at review with *No items
   detected*, depending on how they read. If you want one clear message for this case, that's an app change; the
   video's S6c recording shows whichever message the build gives.
4. **In-app wording:** aligned in priceback PR #501 (EN + FR, app and push copy): scan, not snap; top of the
   receipt with every item and the totals; QR codes, membership offers and ads at the bottom not needed. The
   wording never says "stop at the total", because Costco prints the purchase date below the totals.
