# Voice-over: scan a price tag (feature video)

Same rules as the Kickstarter video (SCRIPT.md, RULES-README §5b): real app design from the code, real data, the
voice first and the picture timed to it, English first (French on hold), no call to action in the voice.
`FILM=tag tools/voiceover.py` reads this table.

| # | On screen | English | Français (on hold) |
| --- | --- | --- | --- |
| 1 | Scan → Price tag mode → live camera on the shelf tag → shutter | Spotted a savings tag at Costco? Scan it with PriceBack. | Une étiquette en solde chez Costco ? Scannez-la avec PriceBack. |
| 2 | Reading the tag… → Confirm the price | It reads the SKU, the prices, and when the savings ends. | Il lit le numéro d'article, les prix et la fin du rabais. |
| 3 | Tag details: Scan looks clean · Savings tag · Good deal | And it tells you right away if it's a good deal. | Et il vous dit tout de suite si c'est une bonne affaire. |
| 4 | Fields → Submit observation → Confirm your warehouse → Yes | Submit it, and the savings is shared with shoppers at your warehouse. | Envoyez-la, et le rabais est partagé avec les membres de votre entrepôt. |
| 5 | Thanks for contributing! · pending crowd verification | Once enough shoppers confirm it, you earn a scan credit. | Quand assez de membres le confirment, vous gagnez un crédit de scan. |

## Facts behind each line

- The tag is a real Costco shelf tag photographed in a warehouse (Priceback
  `__tests__/fixtures/price-tags/PXL_20260527_193305863.jpg`, photo May 27, 2026): SKU 1455423, JAMIESON GENTLE
  IRON 28 MG 250 CAPSULES, $19.99, instant savings −$4.00 until 2026-06-07, $15.99 at the register. Every value on
  the review card is printed on that tag; the film carries no date, so the savings is live on screen.
- Screens and labels: `PriceTagScanScreen.js` (intro with the default warehouse for logging tags, live camera,
  savings-only and scan-limit notices; Reading the tag…; review; done), `components/TagCard.js`,
  `components/DealBadge.js` (Good deal · Instant savings), the one-time native "Confirm your warehouse" alert.
- Line 4: the observation goes to the crowdsourced pool of the selected warehouse (`thanksBody`, scope = warehouse).
- Line 5: a first savings-tag scan earns **no credit up front**: credit lands once enough shoppers confirm the
  savings (`priceTag.statusPending`; backend rule 3, `crowdsourceDb.test.js` "no credit up front"). So the done
  screen shows the pending note, not "+1 scan credit".
