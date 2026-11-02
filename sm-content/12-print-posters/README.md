# PriceBack print posters (2026-11-02, v2)

**Design (v2, after Monica's review):** PriceBack green, not the Costco look. Hook "Paid full price? / Get money back." (FR "Payé le plein prix ? / Récupérez la différence."), hero **$600 BACK** from a real Costco drop (Samsung 65" S85H OLED TV, regular $1,994.99: $600 off for only 2 days, then $500 off when the saving was extended, Oct 2026, per Monica). Story line: "Prices drop after you buy, sometimes for only 2 days. Nobody sees it. PriceBack does.", a store strip (Costco now; Best Buy, Home Depot, Rona, Sport Chek coming soon, matching `src/constants/stores.js`), an urgency line and one big QR card. The App Store and Google Play badges are cropped to their artwork and set to one height. The counter card adds "Waiting for your order?".

**Pricing wording (Monica, 2026-11-02):** the app is not free. Say "free download" only, never "free app" or "free". Every piece carries the fine print "Free to download, with a trial. When PriceBack finds you a price drop, a small part of it covers our fees." (FR "Téléchargement gratuit, avec essai. Quand PriceBack vous trouve une baisse de prix, une petite part couvre nos frais.").

EN and FR are in separate folders. Every file includes a 0.125" bleed on every side; text stays at least 0.3" inside the trim.

| File | Trim size | Where it goes | QR source tag |
| --- | --- | --- | --- |
| `PriceBack-poster-11x17-<lang>` | 11 × 17 in (tabloid) | **Recommended** for community boards, gym and café walls, grocery entrances. About twice the area of letter, readable from 3 to 4 m | `poster17-<lang>` |
| `PriceBack-poster-8.5x11-<lang>` | 8.5 × 11 in (letter) | Small boards, doors, windows, places that only accept letter size | `poster11-<lang>` |
| `PriceBack-counter-4x6-<lang>` | 4 × 6 in, portrait | Pharmacy counter, in a clear acrylic sign holder (L or T stand) | `counter-<lang>` |

## Printing
- Print shop: send the PDF and ask for "full bleed, trim to size". Matte or satin cardstock (80–100 lb cover) for posters; 14–16 pt card for the counter insert.
- Home printer: print the PDF at "Fit" / "Shrink to printable area". Edges lose a few millimetres, nothing important is near them.
- Counter stand: any 4 × 6 in portrait acrylic sign holder (about $5–10 at Staples, Amazon, Uline). It takes about 4 × 2 in of counter space and keeps the card upright and out of reach.
- PNGs are 300 dpi, for previews, social posts or shops that want an image.

## The QR code
All QR codes open `https://priceback.ca/app?s=<source tag>`: iPhone and iPad go to the App Store, Android to Google Play, computers to priceback.ca. **This link goes live only once website PR maxim-lucas/Priceback-Website#19 is merged and deployed. Do not print before that.** Each code was decoded in testing.

The `s=` tag shows which poster was scanned (Cloudflare Workers logs, and Play Console install referrer). For per-location tracking (e.g. one café vs one gym), re-render with a new tag.

## Source
Renderer: `node sm-content/12-print-posters/render.js` (needs Playwright; run `npm i --no-save qrcode` first). Output goes to `out/` (gitignored); finished files are copied to `/mnt/project-files/marketing/posters/<lang>/`.
