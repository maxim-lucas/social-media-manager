# 14 · New-version ads (Meta Ads, Facebook + Instagram)

The paid launch of the new PriceBack version (Costco + Best Buy, Deals, Warehouse prices, receipt scan), built with
Maxim on 2026-11-27. **Read this before making or changing an ad.** `RULES-README.md` §9 holds the short form of these
rules and wins if the two ever disagree.

**Status:** ready, not posted. Upload and spend only once the version is live to 100 % in **both** stores (the ads send
people to download it). The strategy behind it (the brainstorm, the scored angles, the Google Ads copy, the App
Store / Google Play screenshots): `Priceback-Documentations/Marketing-Plan/14-launch-campaign-stop-asking-the-group.md`.

---

## 1. Upload guide: which file goes where

Everything is in [`ready-to-upload/EN/`](ready-to-upload/EN) and [`ready-to-upload/FR/`](ready-to-upload/FR): 20 files
each, already at the exact pixel size Meta asks for.

**File name:** `PriceBack_<ad>_<hook name>_<LANG>_<placement>_<platforms>_<ratio>_<width>x<height>.png`, e.g.
`PriceBack_C1-H2_RealWarehousePrice_FR_MetaAds-Reels_FB-IG_9x16_1080x1920.png`. Sorted by name, a folder lists each
ad's four placements together.

| Placement in the file name | Size | Where it goes in Ads Manager | Also usable as |
|---|---|---|---|
| `MetaAds-Feed_FB-IG_4x5` | 1080 × 1350 | **Feeds**: Facebook Feed, Instagram Feed, Instagram Explore, Facebook Marketplace (in-feed) | The organic Instagram / Facebook post |
| `MetaAds-Stories_FB-IG_9x16` | 1080 × 1920 | **Stories**: Instagram Stories, Facebook Stories, Messenger Stories | The organic Instagram / Facebook story |
| `MetaAds-Reels_FB-IG_9x16` | 1080 × 1920 | **Reels**: Instagram Reels, Facebook Reels (image ads in Reels) | — |
| `MetaAds-Square_FB-RightColumn-Marketplace_1x1` | 1080 × 1080 | **Right column**, Search results, and any placement that crops to 1:1 | Google Display / Demand Gen square |

In Ads Manager, create one ad per hook with **Placement asset customization** and give each placement group its own
file above. The primary text, the headline and the **Install** button are typed in the ad (copy in §5), never in the
image.

### Ads

| Ad | Campaign | What it says |
|---|---|---|
| `C1-H1_StopAskingTheGroup` | 1 · Free tools | Stop asking the group. Ask PriceBack. |
| `C1-H2_RealWarehousePrice` | 1 · Free tools | Need the real warehouse price? Every Costco. Every price. |
| `C1-H3_SoldOut` | 1 · Free tools | Drove to Costco. Sold out. Check the stock before you go. |
| `C1-H6_SavingsInRealTime` | 1 · Free tools | Savings in real time. Not tonight. Not tomorrow. |
| `C2_ReceiptScan-BLACK` | 2 · Receipt scan + code BLACK | Prices drop after you buy? Get the difference back. |

Hooks 4 ("Missed the saving by a day?") and 5 ("Not the flyer. Your warehouse.") were dropped by Maxim (2026-11-27).
They still render (`v=4`, `v=5`) but are not in `ready-to-upload/`.

---

## 2. The concept

**The insight.** Canadian Costco groups are a public queue of the same questions — *has anyone seen it on sale at their
warehouse? what's the price at Laval? is it back in stock?* — and under every one sits a wall of people commenting
**"following"**. That wall is the ad. Every question has a screen in the app that answers it, and the answers are
free.

**Two campaigns, one message each** (Maxim, 2026-11-27: *"it makes the audience think it is paid only or it is free"*).

| | Campaign 1 · Free tools | Campaign 2 · Receipt scan + BLACK |
|---|---|---|
| Says | The answer is in PriceBack, **100 % free, no credit card** | Scan the receipt, get the price drop back, **start free**, code BLACK |
| Shows | Deals, Warehouse prices, last known stock (Costco) | A lock screen of price-drop alerts over a Costco receipt (Costco + Best Buy) |
| Never mentions | The scanner, credits, the trial, the code | — |
| Stage colour | Emerald | Ink (dark green) |
| Sticker | Round lime **100 % FREE · No credit card** | Lime receipt stub **BLACK · +20 % bonus credits · until Dec 31** |
| Audience | Cold: Costco shoppers in Canada | Retarget campaign-1 installs with no receipt; cold electronics / Best Buy buyers |

**Why it works:** it shows people their own post; it leads with what is free (74 % of sign-ups never scan a receipt,
so the receipt is the second step, not the first); and it is true without promising a dollar figure.

---

## 3. Anatomy of an ad (every placement)

1. **Logo**: the app tile + "PriceBack", top left, white.
2. **Hook**: two lines, Inter Tight 800 — the problem in white, the answer in lime (`#bef264`). One short line under it
   in Plus Jakarta Sans. Long hooks shrink (`hl` in `ad()`), they never wrap to three lines on Feed.
3. **The app on a phone**, big and cropped by the frame: the real screens (Deals, Warehouse prices, lock-screen pushes),
   with example data.
4. **Bubbles** (campaign 1): the group question in a big white bubble, one or two "following" replies under it.
   **Receipt** (campaign 2): the Costco receipt with the bought line in lime.
5. **One sticker**: FREE (campaign 1) or BLACK (campaign 2). Never both.
6. **Legal line**, small, bottom left: "Example prices. Independent app, not affiliated with Costco." (campaign 2 adds
   Best Buy and "the store decides each adjustment").
7. **Footer panel**: dark green, thin lime border. Left: Apple's and Google's **official** badges. Right:
   **priceback.ca** and **Follow @priceback.ca** with the Instagram and Facebook icons in lime circles.

**Design tokens** (the app's own, `src/components/spaces/tokens.js` in the app repo): ink `#0d3d28`, deep ink
`#062a1a`, emerald `#10b981`, accent ink `#15803d`, lime `#bef264`, mint background `#eef5f1`. Fonts: Inter Tight
(titles), Plus Jakarta Sans (body), IBM Plex Mono (receipts, the code BLACK), loaded from `scenes/fonts/`.

---

## 4. Rules

### Sizes and safe zones (Meta)

- **Feed 4:5, 1080 × 1350.** Everything may carry text.
- **Stories 9:16, 1080 × 1920.** Meta covers ~14 % (≈ 270 px) at the top (profile row) and at the bottom (the CTA).
  No text a viewer needs there: the logo starts at y 290 and the footer ends above y 1650.
- **Reels 9:16, 1080 × 1920.** The caption, the CTA and the action buttons cover the bottom ~35 % (from y ≈ 1248) and
  the right edge. All text, the sticker and the footer end above y 1248.
- **The covered zones are never left empty** (Maxim, 2026-11-27: *"a very large empty space before the logo and
  footer"*): they show **the wall**, the endless faded "following" thread (campaign 1) or faded price-drop amounts
  (campaign 2), cut by the edges, plus the phone running off the frame. Decoration only, nothing to read.
- **Square 1:1, 1080 × 1080** for the right column and Marketplace.
- Export PNG, sRGB, 1×. Every file name states its size; `render.js` writes exactly that size.

### Truth (every word must be true of the shipped build)

- **Free:** Deals, Warehouse prices, Purchases, the personalised home. **Paid:** receipt scan (price-drop alerts),
  Product Scan (the barcode price checker, renamed by Maxim 2026-11-27), Email sync.
- Campaign 1 says "free" only of the free tools. Campaign 2 says **"start free"**, never "free" alone.
- **Sign-up:** 1 week of Unlimited free (then $4.99/month) **or** 75 free credits, no card for the credits. Only for
  accounts created on the new build.
- **BLACK:** +20 % bonus credits on any pack, or 20 % off the first Unlimited payment; until 2026-12-31; on iPhone, new
  subscribers in Canada only. BLACK appears in campaign 2 only, never in campaign 1 and never on store screenshots.
- **Stock** is the *last known* stock ("In stock · updated today"), never "live stock" or "in stock now".
- **Real time** = within the hour: the savings harvest checks Costco every hour (06:00–20:00 Toronto) and publishes a
  new saving as soon as it reads it. Say "real time" / "as soon as it's out" with "every hour" beside it; never "the
  minute" or "instantly" unless the harvest interval changes.
- **Every price and amount is an example** and the legal line says so. Never a dollar figure as a promise, never
  "guaranteed refund", never a promise that a Black Friday price is adjusted (stores exclude those periods).
- **No retailer logo, colours or typeface.** "Costco" and "Best Buy" appear as words only, with the not-affiliated
  line.

### Store badges

- Only the **official** artwork: `scenes/badges/` holds copies of the weekly carousels' badges
  (`sm-content/06-launch/badges/`), unaltered except Google's transparent margin, trimmed (the carousels do the same at
  render time) so both badges stand at one height.
- French ads use Google's French badge ("Disponible sur Google Play"). Apple's badge stays English until an
  `app-store-fr.svg` is added to `06-launch/badges/` (the carousels' rule); then copy it to `scenes/badges/` and point
  `footer()` at it.

### Language

- English first; French once the English hooks are chosen. Every shipped ad exists in both.
- Maxim's French for hook 1: **"Arrêtez de demander au groupe. Demandez à PriceBack."** French bubbles use the group
  register: "Suivi 👀", "je suis", "pareil 😭".

---

## 5. Ads Manager copy (primary text · headline · description)

| Ad | Primary text EN | Primary text FR |
|---|---|---|
| C1-H1 | "Has anyone seen it on sale at their warehouse?" … "following 👀" … Skip the 64 comments. PriceBack shows every Costco saving and shelf price, in every Canadian warehouse (Business Centres too), with the last known stock. 100% free. No credit card. | « Quelqu'un l'a vu en rabais à son entrepôt? » … « Suivi 👀 » … Passez les 64 commentaires. PriceBack montre tous les rabais et prix Costco, dans chaque entrepôt au Canada (Centres d'affaires inclus), avec le dernier stock connu. 100 % gratuit. Aucune carte de crédit. |
| C1-H2 | The flyer shows one price. Your warehouse might show another. PriceBack shows the shelf price at any Costco in Canada, by name or item number. Free, no credit card. | La circulaire montre un prix. Votre entrepôt en affiche peut-être un autre. PriceBack montre le prix en tablette de n'importe quel Costco au Canada, par nom ou par numéro d'article. Gratuit, aucune carte de crédit. |
| C1-H3 | Driving 40 minutes for something that's sold out? Check the last known stock at any Canadian warehouse first. Free in PriceBack, no credit card. | Faire 40 minutes de route pour un article en rupture? Vérifiez le dernier stock connu à n'importe quel entrepôt au Canada. Gratuit dans PriceBack, aucune carte de crédit. |
| C1-H6 | Costco posts a new saving, PriceBack has it within the hour. We check every hour and publish each new saving as soon as it's out. Not tonight, not tomorrow. Free. | Costco publie un nouveau rabais, PriceBack l'affiche dans l'heure. On vérifie chaque heure et on publie chaque nouveau rabais dès qu'il sort. Pas ce soir, pas demain. Gratuit. |
| C2 | Bought it last week and now it's on sale? Scan your Costco or Best Buy receipt: PriceBack watches every item and tells you what to claim, how much, and by when. Start free with 1 week of Unlimited or 75 free credits. 🎟 Code BLACK: +20% bonus credits, until Dec 31. | Acheté la semaine passée et maintenant en rabais? Numérisez votre reçu Costco ou Best Buy : PriceBack surveille chaque article et vous dit quoi réclamer, combien et avant quelle date. Commencez gratuitement avec 1 semaine d'Unlimited ou 75 crédits gratuits. 🎟 Code BLACK : +20 % de crédits bonis, jusqu'au 31 déc. |

**Headline** = the image's two lines (e.g. *Stop asking the group. Ask PriceBack.*). **Description:** campaign 1
*Free on iPhone and Android* / *Gratuit sur iPhone et Android*; campaign 2 *Start free. Code BLACK until Dec 31.* /
*Commencez gratuitement. Code BLACK jusqu'au 31 déc.* **Button:** Install now / Installer.

**Test plan:** campaign 1's four hooks in one ad set (Meta rotates and keeps the winner), measured by cost per account
with a home warehouse set, not by CPI; campaign 2 on retargeting, measured by cost per first receipt and BLACK
redemptions. Start at 70 % / 30 % of the budget.

---

## 6. Making or changing an ad

1. **Copy:** add the hook to `ADVAR` in `scenes/creatives.html` (`en` and `fr`: `h1`, `h2`, `sub`, `screen` = `deals`
   or `wh`, `b` = the bubbles). Check it against §4 Truth.
2. **List it:** add it to `ADS` in `scenes/render.js` (`id`, `name`, `c`, `v`).
3. **Render:** `node sm-content/14-new-version-ads/scenes/render.js` (Playwright/Chromium), or `--only=C1-H6` for one.
4. **Look at every file**, both languages, all four placements: no line wraps to three lines on Feed, nothing sits under
   the sticker, no text in a 9:16 covered zone, the footer fits. Fix the layout in `ADL` (one row per placement), never
   by shortening a rule.
5. **Commit** the source and `ready-to-upload/` together, and update §1 and §5 here.

Preview any single frame in a browser:
`scenes/creatives.html?c=free&v=2&f=reels&lang=fr` (`f` = `poster` Feed, `story`, `reels`, `square`; `info4x5` /
`info9x16` / `info1x1` are the first, info-sheet drafts kept for organic posts; `store1` / `store2` are the App Store
screenshots kept in the docs repo).

## Files

| Path | What |
|---|---|
| `ready-to-upload/EN/`, `ready-to-upload/FR/` | The 40 ads, named for upload |
| `scenes/creatives.html` | The one source: copy, layouts per placement, components |
| `scenes/render.js` | Renders every shipped ad to `ready-to-upload/` |
| `scenes/badges/` | Official App Store / Google Play badges (see §4) |
| `scenes/fonts/` | Inter Tight, Plus Jakarta Sans, IBM Plex Mono (Latin subsets, SIL OFL) |
| `scenes/icon.png` | The app icon |
