# Same-Day vs PriceBack database: items to check

Checked 2026-10-15. Same-Day side: the weekly savings collection (sameday.costco.ca, Montreal store, 296 items), read item by item from each product page (item #, saving, "Ends" date). Database side: Costco `price_points` on sale and not expired. Same-Day prices are Instacart prices, so only the **saving** and the **end date** are compared, never the price.

## 1. End date differs (11)

Fix `valid_until` if Same-Day is right.

| Item # | Product | DB source and provinces | DB end | Same-Day end | Saving | In flyer |
|---|---|---|---|---|---|---|
| 3663109 | Corona Cero Non Alc Beer (28 x 330 ml) | price_tag_scan AB,BC,MB,ON,SK | 2026-10-18 | **2026-10-20** | $8.00 | no |
| 2118631 | Frito-Lay Variety Pack (Lay's, Doritos, Ruffles, Cheeto (54 x 28 g) | price_tag_scan AB,BC,MB,SK | 2026-10-25 | **2026-10-18** | $5.00 | no |
| 1800150 | Ardent Mills Gluten Free Flour (2 kg) | price_tag_scan ON | 2026-10-23 | **2026-10-25** | $4.00 | no |
| 3449587 | Winix C610 4-Stage Air Purifier With WiFi & Plasmawave  (1 each) | price_tag_scan AB,BC,MB,ON,QC,SK | 2026-10-18 | **2026-10-25** | $40.00 | no |
| 2047881 | Liquid I.V. Creamsicle Electrolyte Drink Mix (30 x 16 g) | price_tag_scan ON | 2026-10-31 | **2026-10-25** | $10.00 | no |
| 2964545 | Finish Jet Dry Quantum Rinse Aid (1.12 L) | price_tag_scan ON | 2026-10-21 | **2026-10-25** | $4.00 | yes |
| 2047885 | Liquid I.V. Mango Pineapple & Raspberry Lemonade Sugar- (30 ct) | price_tag_scan ON | 2026-10-23 | **2026-10-25** | $10.00 | yes |
| 2062406 | Delici Cookie Butter Mousse (454 g) | flyer AB,BC,MB,NB,NL,NS,NT,NU,ON,PE,QC,SK,YT | 2026-10-25 | **2026-11-01** | $3.00 | yes |
| 2062406 | Delici Cookie Butter Mousse (454 g) | price_tag_scan AB,BC,MB,ON,SK | 2026-10-25 | **2026-11-01** | $3.00 | yes |
| 2027032 | Contigo West Loop 16 oz Stainless Steel Travel Mug (2 ct) | price_tag_scan ON | 2026-10-29 | **2026-10-25** | $6.00 | yes |
| 1477487 | McCafé Autumn Blend K-Cup Coffee Pods (80 ct) | price_tag_scan ON | 2026-10-23 | **2026-10-25** | $12.00 | yes |

## 2. Saving amount differs (2)

| Item # | Product | Database | Same-Day |
|---|---|---|---|
| 2091237 | Samsung Galaxy Book 6 Laptop, Intel Core 5 315, 8 GB RA | flyer AB,BC,MB,NB,NL,NS,NT,NU,ON,PE,QC,SK,YT: $150.00 off | $250.00 off |
| 2091237 | Samsung Galaxy Book 6 Laptop, Intel Core 5 315, 8 GB RA | scrape QC: $150.00 off | $250.00 off |

## 3. On sale in the database, no saving on Same-Day (8)

The database has an active sale but the Same-Day product page shows no saving and no end date. Same-Day is a Montreal store, so a sale only outside Quebec (the price_tag_scan rows) may simply not show there; a Quebec receipt-scan sale with no Same-Day saving is more likely over.

| Item # | Product | DB source and provinces | DB regular → sale | DB end |
|---|---|---|---|---|
| 453777 | General Mills Cinnamon Toast Crunch Whole grain | receipt_ocr QC | 10.99 → 7.99 | none |
| 1413727 | Fleecy Plus Fabric Softener | receipt_ocr QC | 11.99 → 9.49 | none |
| 3862780 | Palmolive Advanced Dish Liquid | receipt_ocr ON | 9.99 → 7.99 | none |
| 1912639 | Cheerios Jumbo Gluten Free Multi Grain Cereal Multigrai | receipt_ocr QC | 8.99 → 6.99 | none |
| 3337754 | Royal Asia Vegetable Spring Rolls | price_tag_scan MB | 14.99 → 11.99 | 2026-10-25 |
| 1788908 | Quaker Yogourt Granola Bars Whole grain | price_tag_scan AB,BC,MB,SK | 18.99 → 14.99 | 2026-10-26 |
| 5302575 | RXBAR Protein Bar Variety Pack | price_tag_scan AB,BC,MB,SK | 23.99 → 18.99 | 2026-10-25 |
| 1891948 | ACE Bakery All Butter Mini Cheese Croissant | price_tag_scan AB,BC,SK | 9.99 → 7.99 | 2026-10-25 |

## 4. Prices with no end date (47 rows)

Mostly receipt scans, which carry no end date (not an error); one is a price-tag scan (2037930 Govee, QC). Same-Day gives one, so `valid_until` could be filled in. Full list in `same-day-vs-db.csv` (type `receipt_no_end_date`).

## 5. On Same-Day weekly savings, not on sale in the database (67 items)

Savings the database does not have yet. Full list with saving and end date in `same-day-not-in-db.csv`.
