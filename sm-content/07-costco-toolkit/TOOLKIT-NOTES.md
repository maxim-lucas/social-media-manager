# 07-costco-toolkit: seven how-to carousels, English + French

Built 2026-10-02. **Designs only. Nothing here has been posted.** Same rules, renderer, brand, colourways
and gates as [`06-launch`](../06-launch/LAUNCH-NOTES.md): EN on the ink-green house field, FR on the brand
emerald (the two posts of a pair sit side by side on the grid), JPEG ships, PNG is the master.

| | |
| --- | --- |
| Slides | [`posts/<post>/`](posts): `<post>-{en,fr}-NN.jpg` + `.png` masters (41 per language, 82 total) |
| Captions | [`CAPTIONS.md`](CAPTIONS.md) to read; [`post.json`](post.json) is what gets sent (14 posts, IG + FB caption each, alt text per slide) |
| Copy source | [`scenes/copy.js`](scenes/copy.js): edit, then re-render and rebuild |
| Render | `node sm-content/07-costco-toolkit/scenes/render.js [post-id]` (~4 s a slide) |
| Derived files | `node sm-content/07-costco-toolkit/scenes/build-outputs.js` (post.json, CAPTIONS.md, POSTING-ORDER/) |
| Gates | `node sm-content/07-costco-toolkit/scenes/verify.js` (10 gates, must be green) |
| Order | [`POSTING-ORDER/`](POSTING-ORDER) |

## The seven posts (each one EN + FR)

| # | Post | Slides | Job | Ask in the caption |
| --- | --- | --- | --- | --- |
| 1 | `toolkit`: your Costco toolkit | 7 | The umbrella: five tools, one swipe each | comment: which tool next? |
| 2 | `scan-receipt`: how to scan a receipt | 5 | Step-by-step (the save format) | comment + send |
| 3 | `claim-drop`: how to claim a price drop | 6 | Alert → assistant → store desk → ask | comment + send |
| 4 | `price-tag`: how to scan a price tag | 5 | The shelf-tag scanner | comment + send |
| 5 | `community`: share with the community | 5 | Snap → anonymous pool → verified → credit | comment + send |
| 6 | `price-codes`: read the price ending | 7 | .97 / .00 / .88 / .X9 / star, one code per slide | comment + send |
| 7 | `best-of-money`: get the most from your budget | 6 | Four habits | comment + send |

New scenes vs the launch pack: `tag` (a big price with its ending ringed: the one emerald element), a cover
that runs without store badges, and two-line fine print. Everything else is the launch renderer.

## ⚠ HOLD: `price-codes` waits for an app release

Its last slide names the **Price tag translator** (PR #389). That is on `main` but **not in the store
build v3.0.3** (checked 2026-10-02 with `git merge-base --is-ancestor cb2969d v3.0.3` → not an ancestor;
`priceTag.translator.*` is absent from `v3.0.3:src/services/i18n.js`). The `toolkit` post deliberately says
"scan a shelf tag and see what kind of deal it is", which v3.0.3 already does (the deal badges
`priceTag.deal.*` / `priceTag.dealDetail.*` ship), so the other six posts can go now.
`verify.js` gate 10 prints this warning on every run. Once a release containing #389 is live, delete
`requires` from the `price-codes` entry in `copy.js`.

## Facts these posts depend on (checked against v3.0.3 / `origin/main` 2c5911f, 2026-10-02)

| Claim on the art | Source in the app repo | In v3.0.3? |
| --- | --- | --- |
| One receipt scan = 1 credit | `shared/pricing.config.js` (`SCAN_COST_CREDITS`), as in `05-highlights/facts.json` | yes |
| Alerts, plus an early and a last-day reminder before the window closes | `notif.expiryEarly*` / `expiryWarn*` / `expiryFinal*` in `i18n.js` | yes |
| Claim Assistant: receipt, new price, amount, in-store checklist; a receipt shown in the app is accepted at the Costco counter | `claim.*` keys | yes |
| Costco **warehouse** adjustments are requested **in person** (email only for Costco.ca / other stores) | `claim.emailWarehouseBlockedBody` | yes |
| The store decides; terms are the retailer's | playbook §7 ("claim, never get") | n/a |
| Price endings: .97 corporate markdown, .X9 manufacturer promo, .00 manager markdown, .88 store clearance, star = discontinuing / not restocked ("Death Star"); "not a markdown by itself" | `backend/services/priceSignalService.js`, `priceTag.deal*` | yes |
| Shelf-tag scan: frame the whole tag with the SKU, avoid glare, sharp digits; add the end date of a savings tag | `priceTag.tip1-3`, `priceTag.badgeNoDate` | yes |
| Tags go **anonymously** into a crowdsourced price pool for your area | `priceTag.introSub` | yes |
| Only savings tags can earn credit, once verified, capped weekly; 1 credit per tag | `priceTag.savingsOnlyNotice`, `badgeSavings`, `creditEarnedOne`; `05-highlights/facts.json` → contribution | yes |
| Barcode scan shows the last known price in your area | `barcode.lastKnownInArea` | yes |
| Price tag translator, works without internet | `priceTag.translator.*` | **no (HOLD)** |

## Decisions that change the brief, for review

1. **"Price codes" are written as a shopper rule of thumb, never as Costco policy.** Costco does not publish
   them. Every frame that shows an ending carries *"Price endings are a common shopper rule of thumb, not a
   promise. Check the tag."* and says *usually / often*. `verify.js` gate 5 fails a code frame without it, and
   bans "official". (The app's own copy says "officially marked this down" and "limited time, so buy now";
   neither is repeated here: the first is a claim about Costco we cannot source, the second is false urgency.)
2. **No dollar amounts, no "refund guaranteed".** Claim slides say *request* / *ask*, end on *the store
   decides*, and the warehouse in-person rule is stated, so nobody drives to a counter expecting an email flow.
3. **"Share with the community" means the shelf-tag pool**, not referrals. Referral credit is paid on the
   friend's first *purchase* while the app's own invite screen says first *scan*, so it is left out until
   that is settled (`05-highlights/facts.json` → referral).
4. **French uses the app's words** (*scanner, reçu, rabais, étiquette, base communautaire, ajustement*) and
   Quebec spacing (no space before `? ! :`), checked by gate 7. The launch pack used France spacing
   (`A BAISSÉ ?`); this pack follows the app UI instead. **Have a Quebec reader check the French before any
   spend** (playbook §5): I could not run a Google Translate comparison from here, so the owner's
   "best of mine vs Google" pass (see `LAUNCH-NOTES.md`) is still owed on `copy.js`.
5. **No "75 credits" anywhere.** Welcome credits are not the point of these posts; gate 6 allows only "1 credit".
6. **Costco is named, with the non-affiliation line on the same frame** (gate 5), as in the launch.

## Known gaps

- Same as the launch: Apple's French badge is not available from the build machine, so FR slides with
  badges use Apple's English badge (Google's French badge is used). Drop `badges/app-store-fr.svg` in and re-render.
- The star slide's ring is positioned by measurement of Roboto Mono's asterisk; re-check it if the face changes.
- Captions assume the bio carries both store links (`LAUNCH-NOTES.md` checklist). Facebook captions carry them directly.

## Before and after publishing (manual, as for the launch)

- [ ] `price-codes`: wait for the release that ships the Price tag translator.
- [ ] Share each post to your **Story** with a **link sticker** (the API can't add stickers).
- [ ] Reply to every comment in the first hour. Never two big posts on one day (playbook).
