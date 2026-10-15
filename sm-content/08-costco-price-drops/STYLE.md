# 08-costco-price-drops: the house style for content

**This is the main style for new PriceBack posts** (chosen by Monica, 2026-10-15). Unless a brief says
otherwise, a new post is a Costco price drop in this format: a clean product photo, a recreated Costco
shelf tag with the real numbers, Costco's red, blue and white, and a red band that tells shoppers who
already paid full price to claim the difference.

![overview](overview.png)

| | |
| --- | --- |
| Posts | [`posts/`](posts): `<post-id>-{en,fr}.png`, 1080×1350 |
| Data | [`scenes/drops.json`](scenes/drops.json): every number on the art, one entry per shelf tag |
| Render | `NODE_USE_ENV_PROXY=1 node sm-content/08-costco-price-drops/scenes/render.js [post-id]` (needs Playwright) |
| Product photos | Pulled from the item's `sameday.costco.ca` page at render time, cached in `scenes/.cache/` (gitignored) |

## The look

| Element | Rule |
| --- | --- |
| Palette | Costco blue `#005DAA` top band, red `#E31837` stripe, box and bottom band, white field, shelf-tag yellow `#FFF200` highlight. PriceBack green appears only on the PriceBack chip. |
| Top band | `COSTCO` + red box `PRICE DROP` / `PRICE DROPS` (FR `BAISSE DE PRIX` / `BAISSES DE PRIX`). Right side: category and the savings end date (single) or total savings (category). |
| Product photo | The official packshot, white background, trimmed and centred. **Never** a shelf photo, a blurry crop or a brand-name placeholder: no clean photo, no post. |
| Shelf tag | A recreation of the Costco tag: item number, uppercase name, regular price, yellow `-x.xx`, `Instant Savings` + `EXP.` date, `PRICE AT REGISTER`, the big price. Serif numbers, like the real tag. |
| Badge | Single posts only: a red circle with `-$6 OFF` (FR `-6 $ DE RABAIS`) on the tag's left. |
| Bottom band | Red. `Paid $19.99 in the last 30 days?` / `Claim the $6 difference.` and the PriceBack chip. Category posts: `Bought these at full price?` / `Claim the difference.` |
| Fine print | Above the band, on every post: where and when the price was seen, that adjustment terms are the retailer's, and the not-affiliated line. |

## Layouts

- **Single** (`"layout": "single"`): one product, big photo, big tilted tag, badge.
- **Category** (`"layout": "category"`): 2 or 3 products from the same category side by side (e.g. chips: Lay's and
  Ruffles), each with its own photo, compact tag and `SAVE $x` button. The band shows the category's total savings.

## Making a post

1. Add each item to `drops.json` from the shelf tag or the app's verified price points: item number, `sameday`
   product id (from the `sameday.costco.ca/store/costco-canada/products/<id>-…` URL), tag lines in EN and FR,
   `regular`, `off`, `price`, `exp`. Set `seenOn`.
2. Add a post to `posts` with its layout, category (EN + FR) and item numbers.
3. Render. Some Same-Day pages need a login or bounce automated requests; when the renderer says so, save the
   packshot from the product page to `scenes/.cache/<item number>.jpg` and render again.
4. Look at both languages before posting. EN and FR go out as separate posts (playbook §5).

## Rules this style keeps

- **Claim, never get** (playbook §7). The band says *claim the difference*; the store decides.
- **Real numbers only.** Every price comes from a shelf tag or a verified price point, with the date it was seen.
  Don't post a drop whose `EXP.` date has passed.
- **French is localised**, not translated: `19,99 $`, `PRIX À LA CAISSE`, `Économies instantanées`.
- **No Costco logo, ever.** `COSTCO` is set in plain type, never their wordmark.

## The deliberate exception

The playbook (§7) says that where a store is named there should be "no styling that reads as official". This style
uses Costco's colours on purpose so the posts read as Costco at a glance, which was the brief. What keeps it on the
right side: no Costco logo or wordmark, PriceBack's chip on every post, and the not-affiliated line rendered into
the art. **Before any of these run as paid Meta ads, have someone qualified review the creative** (playbook §7).

## Product photos and copyright

The packshots belong to the brands and are served by Costco's Same-Day site. The renderer fetches them at render
time and the repo keeps only the finished posts, never the raw images.
