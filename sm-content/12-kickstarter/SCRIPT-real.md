# Kickstarter video v8: two real screen recordings, tightened (9:16 only, DRAFT, awaiting approval)

One video, **50.2 s** (v7 was 2 min 05 s). Built by `tools/realcut.py` with `EDL=tools/edl-v8.json`,
composed with `FORMATS=9x16 tools/realcompose.py` → `E:/tools/video/realcut-v8/priceback-kickstarter-real-9x16-silent.mp4`.

Order: video first; Maxim records the narration in his own voice (take 3) against this cut; then the
holds are stretched where a line needs more room, and the voice is mixed.

## What v8 removed from v7

| v7 (output time) | Why it went |
| --- | --- |
| 0:06–0:21 first receipt (April, "This receipt has expired") | a second full scan of the same flow; the window check is not the story |
| 0:37–0:45 Home at $0.00, receipt detail with 0 drops / +$0.00, how-to-claim | the drop and the claim steps are shown later with real numbers |
| 0:52 warehouse picker | the app reads the warehouse from each receipt; the favourite is only a preference |
| 1:06–1:08 empty "Claimed" / "Missed" tabs | empty screens |
| 1:23–1:24 splash, 1:27–1:30 Pecan Pie scroll | loading and repeated detail |
| every frozen screen (freezedetect, up to 3.6 s) | cut to 0.5–1.5 s unless a line needs it |
| 1:54–2:01 the other claims at 2× | now 4× (same taps, 3.7 s) |

Products list now follows the Tracking list directly (same screen, one tap).

## Narration (≈125 words, ~2.5 words/s; English only, French on hold)

No "I tap…", no justifying the video. A working prototype in a test phase with Costco.

| # | Video | Screen | Line |
|---|---|---|---|
| 1 | 0:00–0:02.5 | splash → home → Scan | This is PriceBack: a working prototype, in testing with Costco receipts. |
| 2 | 0:02.5–0:05 | camera → photo | Take a photo of your Costco receipt. |
| 3 | 0:05–0:10 | reading → confirm, items scroll | It reads the warehouse, every item and every instant saving. |
| 4 | 0:10–0:13.4 | faded date → calendar → Start Tracking | Date faded? Pick it from the calendar. |
| 5 | 0:13.4–0:16 | Tracking → Products | One tap, and every item is watched for thirty days. |
| 6 | 0:16–0:21 | Costco membership → profile → plans | It knows Executive-only deals. Pay as you go with credits, or Unlimited for four ninety-nine a month. |
| 7 | 0:21–0:23.5 | Supported stores (2×) | Costco today, more stores on the way. |
| 8 | 0:23.5–0:24.8 | card "A few days later" | *(silence)* |
| 9 | 0:24.8–0:29 | lock-screen alert → shade | When a price drops, you get an alert: how much to claim, and how many days are left. |
| 10 | 0:29–0:31 | Pecan Pie drop | Paid eight seventy-nine, now five ninety-nine. |
| 11 | 0:31–0:36 | Home "to claim" $34.60 → list | Thirty-four dollars sixty to claim, on four receipts. Twenty on a fragrance alone. |
| 12 | 0:36–0:41 | Feta drop → how to claim → receipt | Show the receipt from the app at the Returns counter. |
| 13 | 0:41–0:44 | Mark as claimed → refund claimed | Costco refunds the difference, and it's marked as claimed. |
| 14 | 0:44–0:50 | other claims (4×) → Total saved $34.60 | On a TV, a single drop can be five hundred dollars. Money that would otherwise stay with the store. |

Recording tips for take 3: read each line as its own clip with a short breath between. A line that runs
long is fine: the screen under it is held longer, and the video is never sped up to fit the voice.

## Length

Kickstarter guides put the main campaign video at 2–3 min, with success dropping past 4–5 min. This is a
vertical product demo watched on a phone, so ~50–70 s (once the voice sets the holds) is the target. The
first 8 s decide whether people keep watching: the scan is already running by 0:03.

Notes for Maxim:
- The drops in the second recording were simulated in production for this demo, then rolled back. Lines 9–13
  describe the flow without saying they were real Costco sales; the TV line (14) is the real one.
- During the 4× claims (0:44–0:47) the Mens Frag receipt shows "Scanned on Oct 11" with "Purchase date Oct 18".
  At 4× it goes by in a few frames.
