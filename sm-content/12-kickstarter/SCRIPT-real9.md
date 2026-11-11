# Kickstarter video v9: real recordings + narration in Maxim's voice (9:16)

Cut: `tools/edl-v9.json` (no speed above 2×; the scan at 1.5×). Voice: take C (Maxim's timbre, US accent),
sample s1: `FILM=real9 VOICE_TAG=s1 voiceover.py en C`. Re-timing: `tools/realtime.py` places each line at
its anchor scene and holds that line's still screens until the line has room; the video is never sped up for the voice.

Columns: line | anchor scene; scenes held if the line needs room | English | French (on hold).

| # | anchor ; holds | English | French |
|---|---|---|---|
| 1 | splash ; splash home scan-screen | Costco lowers prices after you buy. Within thirty days, you can claim the difference. | — |
| 2 | camera ; preview | PriceBack makes sure you never miss it. Just take a photo of your receipt. | — |
| 3 | reading ; confirm-head | It reads the warehouse, every item, and every instant saving. | — |
| 4 | summary ; date-set | Date faded? Pick it on the calendar. | — |
| 5 | start-track ; tracking products | One tap, and every item is watched for thirty days. | — |
| 6 | membership ; membership | It's tailored to you. To your membership: Executive members also get the Executive-only deals. And to your warehouse, because prices differ from one warehouse to another. | — |
| 7 | warehouse ; warehouse | Each receipt is tracked at its own warehouse, read automatically from the receipt. If the header is missing, PriceBack uses your home warehouse. | — |
| 8 | paywall ; paywall | Pricing is simple: credits as you go, from three dollars, or Unlimited at four ninety-nine a month, and you keep every dollar of every drop. | — |
| 9 | stores ; stores | Costco is our launch store, our dry run. With your backing, more stores and more countries will follow. | — |
| 10 | alert ; shade-open | A few days later, prices drop, and the alerts arrive: how much to claim, and how many days are left. | — |
| 11 | drop-detail ; drop-detail | Paid eight seventy-nine. Now five ninety-nine. | — |
| 12 | to-claim ; to-claim claim-list | Thirty-four dollars and sixty cents to claim, on four receipts. Twenty dollars on a fragrance alone. | — |
| 13 | feta ; how-to-claim receipt | At the Returns counter, show the receipt right from the app. | — |
| 14 | mark-claimed ; refund-claimed | Costco refunds the difference, and it's marked as claimed. | — |
| 15 | claims-left4 ; claims-left2 | On groceries, it's a few dollars at a time. On a TV, one drop can be five hundred dollars. | — |
| 16 | saved ; saved | Our goal is to make PriceBack the go-to price-drop tracker, for every store, everywhere. Back us on Kickstarter, and help us get there. | — |

Notes:
- Line 1: Costco Canada's price adjustment is 30 days from purchase (a fact, not a promise of savings).
- Line 15: the TV drop is the real one (Samsung QN80H, −$500); the drops in the second recording were simulated
  for the demo and rolled back, so lines 10–14 describe the flow, not a real Costco sale.
- Line 16 states an ambition ("our goal"), not a claim of leadership, and carries the call to back. The
  "Back us on Kickstarter" ending was cut from v3; it is back here because this cut is for the campaign page.
