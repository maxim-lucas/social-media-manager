# Price-drop reels: approved default design

Approved by Monica on 2026-11-04 ("this is perfect, save this design for all reels"). Every future reel of this
format is generated with `follower-reel.js` and this spec, automatically. Change the design only when Monica asks,
and record her remark in `RULES-README.md` §1.

## What to make each week (EN first; FR only after Monica approves the EN)
1. **Category basket reel** (`"mode":"basket"`) for each category reel asked for (grocery first). Config like
   `2026-11-08-grocery-basket.json`: the category's week files, `category` label (EN "GROCERY", FR "D'ÉPICERIE"),
   `rawMeat` SKUs to skip.
2. **Whole-week reel** (`"mode":"top3"`). Config like `2026-11-08-week-top3.json`: every week file of the week.

Business Centre carousels are always skipped (warehouse only). Products: biggest saving first, one per brand, no raw
meat, must have a cached photo in `scenes/.cache/`.

## Timeline (7.5 s, loops)
- **Hook:** "Shopped at Costco lately?", 8 product photos in a 2×4 grid, then the yellow banner
  "N <CATEGORY> PRICES JUST DROPPED" (week: "N COSTCO PRICES JUST DROPPED").
- **Basket (category reel):** the 8 biggest drops pop in big (540 px card, never below half size), each with a red
  "-$X" chip above it, and fall into the cart one by one. The counter "Claim up to $X back / if you bought them"
  climbs, then "+ N more drops" takes it to the category total.
- **Top 3 (week reel):** the slides cropped above their red footer, rank tag, big "CLAIM $X BACK" sticker.
- **End card (1.5 s):** "🔔 DON'T MISS" / "NEXT WEEK'S COSTCO DROPS" / pulsing "FOLLOW @priceback.ca" button with a
  tapping hand / "+ hundreds more HIDDEN savings" (HIDDEN in bold capitals on yellow, revealed from a black bar) /
  white pill "ONLY in [logo] PriceBack" (the app name appears once) / App Store + Google Play badges.

## Layout rules
- Text and product photos have separate zones. **Nothing is ever written over a product.**
- The end date is a big "ENDS | SUN NOV 8" ticket (red/white, 72/96 px) in its own zone at the bottom.
- The claim total always carries "if you bought them" in small yellow text.

## Versions per platform
- **Instagram + Facebook:** music only → `<name>-IG-FB.mp4` (`music_house.py`, about -16.5 dB). Also keep a
  no-music copy so a trending Instagram sound can be added at posting.
- **YouTube Shorts + TikTok:** voiceover + music, voiced with Monica's own cloned voice from her local pipeline
  (the one used for the Kickstarter video). Lines are generated on her machine into `vo/<week>/`.

## Commands
```
node follower-reel.js <config.json> en <out.mp4>                 # with music
node follower-reel.js <config.json> en <out.mp4> --stills 1.5,3  # PNG previews
ffmpeg -i <out.mp4> -an -c copy <out>-no-music.mp4               # no-music copy
```
Deliver to `/mnt/project-files/marketing/costco-posts/<week>-grocery/reels/` (category) and
`<week>-rest/reels/` (week), EN and FR never mixed.
