# Video styles: every PriceBack video, made or not

One index of every video format PriceBack has produced or planned, with where its files live. Video work is
spread across packs because each pack owns its scripts; this file is the single place to find them all.
New video concepts get their own folder here.

## Index

| # | Style | Status | Files | Length · format |
| --- | --- | --- | --- | --- |
| 1 | **Hook Reel**: rendered motion graphics, launch pack | Produced, posted at launch | [`../reels/priceback-reel-hook-{en,fr}.mp4`](../reels), notes in [`../ASSET-PACK-NOTES.md`](../ASSET-PACK-NOTES.md) | 17.5 s · 1080×1920 · silent AAC (add audio in-app) |
| 2 | **Cartoon-style videos** | Produced | **Not in this repo yet**, see *Missing* below | — |
| 3 | **Evergreen phone Reels**: "The bin" (EN), "Three steps" (FR) | Scripted, not shot | [`../evergreen/reels/REEL-SCRIPTS.md`](../evergreen/reels/REEL-SCRIPTS.md) | ~20 s · phone-shot, figures hidden |
| 4 | **Community Reels R1–R6**: "Nobody beats inflation alone", "Costco was the start", "Point your camera at a shelf tag", "Made here", "What went up the most in your cart?", "Le français suit toujours" | Scripted, not shot | [`../04-community/REEL-SCRIPTS.md`](../04-community/REEL-SCRIPTS.md) | 8–18 s · phone + the pack's frames |
| 5 | **"Either way"**: Price-Drop Guarantee launch Reel, split screen | Briefed, not made | [`../../docs/material-ideas-to-be-created.md`](../../docs/material-ideas-to-be-created.md) §2 | 15–20 s · EN + FR |
| 6 | **The Price Forecast / La Météo des prix**: a weekly price weather report, map of Canada, national claim counter | Concept + storyboard, parked | [`price-forecast/`](price-forecast) | 45 s weekly · EN + FR episodes |
| 7 | **Shelf Street / La Bourse du panier**: Costco shelf prices covered like the stock market, faceless | Concept + storyboard, not chosen | [`shelf-street/`](shelf-street) | 15–40 s · daily ticker + weekly Basket Index |

The **feed/post house style** is separate: [`../08-costco-price-drops/STYLE.md`](../08-costco-price-drops/STYLE.md).
A video made from it (for example a Reel that reveals the tag, then the "claim the difference" band) should keep its
colours, tag and wording rules.

## Rules every video keeps

These come from the packs and the playbook, and apply to every style above:

- **EN and FR are separate cuts**, never auto-translated; French is localised (`19,99 $`). (playbook §5)
- **Claim, never get.** The store decides. (playbook §7)
- **A named retailer brings the not-affiliated line on screen**, plus no logo and no official styling. The Costco
  price-drop house style is the one deliberate exception on styling (see its STYLE.md).
- **Real numbers only**, with the date they were seen, or hidden (thumb, crop, blur) in the evergreen register.
- **Messaging on screen**, so every cut works muted. Add trending audio in-app at post time; licensed audio for paid.
- **1080×1920**, safe zones clear of Instagram's header, caption bar and action rail.

## Missing: what still needs to be brought in

- **The cartoon-style videos' source.** None of the project's repos, branches or shared files contain it. Their
  HTML scenes, covers, character and background assets, scripts and notes go in `cartoon/` here, so the style can be
  re-made. The rendered videos themselves stay out of the repo.
- **The hook Reel's source.** `ASSET-PACK-NOTES.md` says it renders from HTML scenes (`scenes/strings.json`, `hook1`
  and `hook2`) with gates `bounds.py`, `motion.py` and `verify.py`. Those were built in Cowork session
  `cse_01QJzpqDCPqZ4HAHmNa7UfXK` and never committed. Only the two MP4s are here, so the hook can't be re-cut
  until that source is added.
