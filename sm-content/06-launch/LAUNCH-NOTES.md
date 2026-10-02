# 06-launch: the first post on the account

Built 2026-10-02. **Two separate carousels, English and French, five slides each,
published at the same time** on Instagram and Facebook. This is the first post
`@priceback.ca` has ever published (`media_count: 0` on the morning of 2026-10-02).

| | |
| --- | --- |
| Slides | [`posts/`](posts): `priceback-launch-{en,fr}-01..05.jpg` (what ships) + `.png` masters |
| Captions | [`CAPTIONS.md`](CAPTIONS.md) to read; [`post.json`](post.json) is what gets sent |
| Copy source | [`scenes/strings.json`](scenes/strings.json): edit, then re-render |
| Render | `node sm-content/06-launch/scenes/render.js` |
| Gates | `node sm-content/06-launch/scenes/verify.js` (7 gates, must be green) |
| Order | [`POSTING-ORDER/`](POSTING-ORDER) |

## The story, slide by slide

| # | English | French | Job |
| --- | --- | --- | --- |
| 1 | THE WAIT IS OVER. + both store badges | L'ATTENTE EST TERMINÉE. | Launch news + the hook: *this receipt might still owe you money → swipe* |
| 2 | FREE TO DOWNLOAD. 75 welcome credits | TÉLÉCHARGEMENT GRATUIT. | Removes the cost objection |
| 3 | SCAN YOUR FIRST RECEIPT. | SCANNEZ VOTRE PREMIER REÇU. | The one action we want |
| 4 | PRICE DROPPED? CLAIM THE DIFFERENCE. | LE PRIX A BAISSÉ ? | The payoff |
| 5 | DOWNLOAD. SCAN. FOLLOW. + badges + disclaimer | TÉLÉCHARGEZ. SCANNEZ. SUIVEZ. | The three asks, with a reason to follow |

The follow ask uses the playbook's rule (a recurring payoff only available here):
*new stores are announced here first*.

## Facts this post depends on (checked 2026-10-02)

| Claim | Source | Value |
| --- | --- | --- |
| Live on the App Store | `itunes.apple.com/lookup?id=6795860374&country=ca` | resultCount 1 |
| Live on Google Play | `play.google.com/store/apps/details?id=com.priceback` | HTTP 200, Install button |
| Welcome credits | prod `priceback.app_config.FREE_TRIAL_CREDITS` (Supabase `xjfrlzwonyaorwktnkpj`) | **75** |
| Once per account | `backend/repos/usersRepo.js` (granted once per verified email) | yes |
| 1 credit = 1 scan | prod `SCAN_COST_CREDITS` / `shared/pricing.config.js` | 1 |
| Drop share charged at **detection** | `05-highlights/facts.json` → credits | 15 credits per $1, charged when a verified drop is detected |
| Stores with a dedicated parser | `05-highlights/facts.json` → stores.live | Costco only |

## Decisions that change the brief, for review

1. **"$5 worth of credit, limited time" → "75 free credits".** Neither part of the
   original idea is true. The grant is **75 credits**, and it is permanent, not a
   limited-time offer. 75 credits buys 75 scans, or covers our share of about $5 of
   savings. At pack prices it is worth roughly $0.70–$0.90, so "$5 of credit" would
   overstate it about sixfold, and "limited time" on an offer that never ends is
   false urgency (Competition Act). If you *do* want a real limited-time boost
   (e.g. temporarily raise `FREE_TRIAL_CREDITS` in `app_config` until a date), that
   is a product change. Make it first, then the copy can say it.
2. **Costco is named, in the fine print only.** Someone who downloads expecting
   Walmart support and gets nothing is a 1-star review. Naming the retailer
   brings in the non-affiliation line, which is on the art of slide 5 and in every
   caption. `verify.js` gate 5 fails a frame that names a retailer without it.
3. **One colourway per language.** EN uses the house ink-green field and FR uses
   the brand emerald, so the two tiles side by side on the grid read as a pair,
   not a double upload. Gate 7 measures the difference.
4. **5 hashtags, not 30.** The playbook (citing Mosseri): hashtags classify a post
   but barely move reach. Sends, saves and comments do, so each caption asks for
   one of each: *send this to the friend who keeps every receipt*, the
   step-by-step format (saves), and *which store next?* (comments).
5. **Headline face is Roboto Bold, not Roboto Black.** This machine's fontconfig
   cannot resolve Roboto Black by any name and silently falls back. Gate 3 proves
   the face used is real. Re-rendering on the machine that built the other packs
   with `HEAD.weight` swapped would match them exactly.

## Known gaps

- **Apple's French badge.** `tools.applemarketingtools.com` does not resolve from
  the build machine, so the French slides use Apple's **English** "Download on the
  App Store" badge (Google's French badge is used). To fix: drop Apple's FR-CA SVG
  in as `badges/app-store-fr.svg` and re-render; the renderer picks it up automatically.
- Instagram captions can't hold clickable links, so they say *link in bio*. The
  **bio must carry both store links** before this goes out (checklist below).
  Facebook captions carry the links directly.

## French: my translation vs Google Translate, best wins

Rule (owner, 2026-10-02): every French line is checked against Google Translate
of the English, and the better rendering wins. Tie-breaker: **the app's own
French UI**. It says *scanner/scannez* (31×) and *application* (13×), not
*numériser* or *appli*, so the post matches what people see after downloading.

| Line | Mine | Google | Chosen |
| --- | --- | --- | --- |
| kicker: NOW LIVE IN CANADA | MAINTENANT DISPONIBLE AU CANADA | Je vis maintenant au Canada ✗ | **Mine** |
| hook: THE WAIT IS OVER | L'ATTENTE EST TERMINÉE | L'attente est terminée | Same |
| sub: …is live on the App Store… | …est disponible sur l'App Store… | …est en ligne sur l'App Store… | **Mine** (store-listing usage) |
| paper: THIS RECEIPT MIGHT STILL OWE YOU MONEY | CE REÇU POURRAIT ENCORE VOUS DEVOIR DE L'ARGENT | Ce reçu pourrait encore vous devoir de l'argent | Same |
| swipe: SWIPE TO SEE HOW | GLISSEZ POUR VOIR | Swipe pour voir comment ✗ anglicism | **Mine** |
| sub: …we add 75 free credits | …on vous offre 75 crédits | …nous ajoutons 75 crédits gratuits | **Google** (mine dropped "free") |
| sub: One credit scans one receipt | Un crédit = un reçu numérisé | Un crédit scanne un reçu | **Hybrid**: *Un crédit = un reçu scanné* |
| row: PRICEBACK APP | APPLI PRICEBACK | Application de remise de prix ✗ | **APPLICATION PRICEBACK** (app's term) |
| row: YOU PAY TO START / NOTHING | POUR COMMENCER / RIEN À PAYER | Vous payez pour commencer / Rien | **Google** (closer to the English) |
| fine: Welcome credits are given once per account | Crédits de bienvenue offerts une seule fois… | Les crédits de bienvenue sont accordés une fois… | **Hybrid**: *Les crédits de bienvenue sont offerts une seule fois par compte* (app's wording) |
| kicker / hook: SCAN | NUMÉRISEZ | Scannez | **Google** (app's verb) |
| sub: …keeps watching those prices | …surveille ces prix | …continue de surveiller ces prix | **Google** (keeps "keeps") |
| row value: WATCHING | SURVEILLÉ | Regarder ✗ | **Mine** |
| kicker: GET IT BACK | RÉCUPÉREZ | récupérez-le (dangling pronoun) | **Mine** |
| sub: We alert you when something you bought gets cheaper… | On vous avertit quand un article acheté baisse… | Nous vous alertons lorsque quelque chose que vous avez acheté devient moins cher… (too long) | **Hybrid**: *…baisse de prix, puis on vous aide à réclamer la différence au magasin* |
| row value: YOURS TO CLAIM | À RÉCLAMER | À vous de réclamer | **Mine** (Google's reads "it's up to you") |
| kicker: YOUR MOVE | À VOUS DE JOUER | Votre déménagement ✗ | **Mine** |
| hook: DOWNLOAD. SCAN. FOLLOW. | TÉLÉCHARGEZ. NUMÉRISEZ. SUIVEZ. | Télécharger. balayage. suivre. ✗ | **Mine** with the app's verb: *SCANNEZ* |
| check: Download PriceBack | Téléchargez PriceBack | Télécharger le prix ✗ | **Mine** |
| note: new stores are announced here first | …annoncés ici | …annoncés ici en premier | **Google** (mine dropped "first") |
| fine: Supported today: Costco receipts… | Offert aujourd'hui : reçus Costco… | Pris en charge aujourd'hui : les reçus Costco… | **Google** ("offert" means "offered/free") |
| fine: …not affiliated with any retailer | …non affiliée à un détaillant | …non affiliée à aucun détaillant | **Hybrid**: *…qui n'est affiliée à aucun détaillant* |

Captions went through the same pass; see [`CAPTIONS.md`](CAPTIONS.md).

## Before and after publishing (manual, mobile app)

Before:
- [ ] Bio links: **Download for iPhone** → `https://apps.apple.com/ca/app/priceback/id6795860374`,
      **Download for Android** → `https://play.google.com/store/apps/details?id=com.priceback`
- [ ] Name field: `PriceBack · Price Drop Refunds` (searched far more than the bio; playbook §2)
- [ ] Facebook Page connected in Composio (not connected as of 2026-10-02)

After:
- [ ] Share each post to your **Story** with a **link sticker** to the store pages. The
      API can't add stickers, and a link sticker is the only clickable link on Instagram besides the bio.
- [ ] Stay in the comments for the first hour and reply to every one.
- [ ] Pin the posts to the top of the profile grid (Instagram allows 3 pins).
