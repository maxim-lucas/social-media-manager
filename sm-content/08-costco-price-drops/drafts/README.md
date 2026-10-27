# Drafts for Oct 27, 2026: price tiers and groceries by province

**Review drafts, not posts.** Every slide has a grey `DRAFT · PHOTO TO ADD` box where the Same-Day packshot goes:
this batch was built in a cloud workspace that cannot reach sameday.costco.ca or Flipp. Copy, numbers, layout,
province strips and slide order are final for review.

## To finish on your computer

1. For each item, find its Same-Day id (search `sameday.costco.ca/store/costco-canada/search/<item #>`, STYLE.md
   step 4) and put it in `"sameday"` in the week file, or save the photo as `scenes/.cache/<item #>.jpg`.
2. Check the Flipp flyer (STYLE.md step 1). These were **not** checked, which is why the covers say "price drops",
   not "hidden savings". If you want the hidden-savings angle, drop any item found in the flyer.
3. Render without `--draft`: `node sm-content/08-costco-price-drops/scenes/render.js weeks/<file>.json`. The finals
   land in `posts/`.

## The carousels, in posting order

| # | Week file | EN slides | FR slides | Items |
| --- | --- | --- | --- | --- |
| 1 | `2026-10-27-400-1100.json` | cover + 14 + follow | cover + 9 + follow | HP OmniBook −$300, TCL 65" −$250, Serta Five Star −$180, Dyson HP10, LG dishwasher, Serta queen −$150, MSI ×2, LG 65"/55", Hisense 58", Shark CryoGlow, JBL, Eurodib −$100 |
| 2 | `2026-10-27-300-400.json` | single post | single post | Shark Clean Sense vacuum −$100 (the only $300–$400 item with an end date) |
| 3 | `2026-10-27-150-300.json` | cover + 6 + follow | cover + 5 + follow | Kala red light −$60, Ninja kitchen system −$50, Panasonic microwave, Jolie showerhead, Weiser lock −$40, Sonicare −$35 |
| 4 | `2026-10-27-under-150.json` | cover + 15 + follow | cover + 15 + follow | De'Longhi Nespresso −$30, DeWalt, StriVectin, Urbanista, Lasko, Lightica, Dreame −$20, sheets, steamer, Crest −$15, … (non-food; groceries are below) |
| 5 | `2026-10-27-grocery-coffee-drinks.json` | cover + 6 + follow | same | Van Houtte −$13, McCafé −$12, Starbucks −$10, Evian −$7, Budweiser Zero, Cove −$6 |
| 6 | `2026-10-27-grocery-frozen-meat.json` | cover + 6 + follow | cover + 5 + follow | Skoulakis, Fennec peas −$10, DOM basa −$9, chicken burgers −$8, Don Miguel −$5, Bibigo −$3.50 |
| 7 | `2026-10-27-grocery-dairy-cheese.json` | cover + 6 + follow | cover + 3 + follow | Burrata, ricotta, poutine cheese −$4, Bothwell curds, Saputo −$3.50, Verka dahi −$3 |
| 8 | `2026-10-27-grocery-pantry-snacks.json` | cover + 6 + follow | cover + 5 + follow | Gia basmati −$10, Quest −$8, Forty Creek, Golden Island −$7, Turtles −$5, Quaker −$4 |

**Province strip** (groceries): every province with a Costco, west to east. Blue = the saving was seen there;
grey, dashed and struck through = not seen there, so the gap is visible.

## Decisions to review

- **Tiers are by regular price**, not by saving.
- **Base shelf price shown** where some provinces add an environmental fee or a deposit. The saving is identical in
  every province, so the fine print says so instead of dropping the item.
- **Left out:** the 14KT gold pendant (Costco never adjusts jewellery), anything with no end date (price points,
  not drops), the Mysa thermostat (two conflicting prices), Ninja Crispi (end date 2027, likely wrong), a receipt-OCR
  lamb leg, and second SKUs of the same product (second JBL, Starbucks, Urbanista).
- **New in the renderer:** `--draft`, a cover hook per week (`copy`), `fineNote`, the province strip
  (`provinceStrip`) and the follow + download end slide (`endSlide`). Old week files render as before.
- **Design reuse:** your rule caps a design at two pieces, but STYLE.md makes this the house style for every new
  drop post, and EN/FR share Costco's colours. I kept the house style; say if these should get a variant.

## Captions

**EN, 1 · $400–$1,100:** Big-ticket Costco price drops this week 📺💻 TVs, laptops, mattresses and a Dyson, up to
$300 off. Bought one at full price in the last 30 days? Scan your Costco receipt with PriceBack and claim the
difference. Free to download: try it free, then buy credits that never expire or go Unlimited. Link in bio.
#Costco #CostcoCanada #PriceDrop #PriceBack

**FR, 1 · 400 $ à 1 100 $ :** Grosses baisses de prix chez Costco cette semaine 📺💻 Téléviseurs, portables et un
Dyson, jusqu'à 300 $ de rabais. Payé le plein prix ces 30 derniers jours ? Scannez votre reçu Costco avec PriceBack
et réclamez la différence. Téléchargement gratuit : essayez-le, puis achetez des crédits qui n'expirent jamais ou
passez à Illimité. Lien dans la bio. #Costco #CostcoQuébec #BaisseDePrix #PriceBack

**EN, 3 and 4 · $150–$300 / under $150:** same caption shape with "kitchen, home and care drops under $300 / under
$150"; **FR:** « articles maison et soins à moins de 300 $ / 150 $ ».

**EN, groceries:** Costco grocery drops, province by province 🛒 Swipe and find yours: blue means the saving was seen
in your province. Paid full price? Scan your receipt and claim the difference with PriceBack. Free to download.
#Costco #CostcoCanada #Groceries #PriceBack

**FR, épicerie :** Baisses de prix épicerie chez Costco, province par province 🛒 Glissez et trouvez la vôtre : en
bleu, l'économie a été relevée dans votre province. Payé le plein prix ? Scannez votre reçu et réclamez la
différence avec PriceBack. Téléchargement gratuit. #Costco #CostcoQuébec #Épicerie #PriceBack

Every caption ends with the disclaimer the publisher appends (playbook §7).
