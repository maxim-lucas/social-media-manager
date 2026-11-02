# Sources (v2): what the Kickstarter video shows and where it comes from

## The story (one consistent demo, RULES §5b)

Empty account → scan a **paper receipt** (Oct 14, 2026, Laval #505, 7 items) → upload a **PDF receipt** (Oct 20,
2026, 2 items) → PriceBack watches the 9 products → real drops arrive on products from those receipts →
receipt detail and how to claim.

## Real data

| Product (item #) | Price shown | Real drop shown | Source |
| --- | --- | --- | --- |
| Samsung QN80H Series 4K UHD Neo QLED TV (5708165) | $1,808.24 | **$500 off Oct 31 – Nov 5** (alert "5d left"); narration: "after a single day at $600" (Oct 26) | prod `price_points` (price) + `savings` (drops) |
| Generac Guardian Generator (1737269) | $8,999.99 | **$1,000 off Oct 26 – Nov 8** (alert "13d left") | prod |
| Van Houtte Original House Blend Coffee K-Cup Pods (266556) | $52.99 | **$13 off**, seen Oct 27 | prod |
| Chefman Stainless Steel Kettle (2023352) | $39.99 | **$10 off**, seen Oct 27 | prod |
| Bounty P24 Paper Towels (1717599) | $32.49 | — | prod `price_points` |
| Kirkland Ultra Clean Laundry Detergent (1845613) | $19.99 | — | prod |
| Cascade Platinum Plus ActionPacs (1727590) | $29.99 | — | prod |
| Duracell Power Boost AA (1806358) | $25.99 | — | prod |
| Charmin Ultra Soft Jumbo Rolls (2633624) | $32.49 | — | prod |

Prices: latest regular price in `priceback.price_points`, read 2026-11-02. Taxes: Quebec (GST 5% + QST 9.975%),
coffee zero-rated. Paper receipt: $2,009.68 + $293.01 = **$2,302.69**. PDF receipt: $9,032.48 + $1,352.61 =
**$10,385.09**.

## App screens (real design, from the app's code)

Home (empty state, tracking list, "To claim" hero), Scan receipt (ScanTemplate), Scanning (ReceiptScanningAnimation),
**Confirm receipt** (store, Online / Warehouse Purchase, warehouse selector, Items (n) with SKU / QTY / price /
Add discount, Summary, Purchase Date, Watch Until, **Start Tracking 🚀**), receipt detail (DetailScreen: hero,
YOU PAID / NOW, Mark as Claimed / Claim instructions, purchase details, How to claim at a Costco warehouse). Push copy
from `backend/lib/pushI18n.js` (`verifiedDrop.*`, `dropSummary.*`). The document scanner and Files picker are
Android system screens.

## Receipts (visual only)

Real Costco receipts from the app's fixtures (`PXL_20260604_173014846.jpg`, `Costco Receipts PDF/G-10.pdf`), fully
blurred except the printed COSTCO WHOLESALE logo (Maxim, 2026-11-02: totals and dates hidden so the demo carries
its own products, total and date). The PDF has 2 item lines, matching its 2 products. Originals never copied here.

## Demo

The account, its purchase dates and the claim deadlines derived from them are a demo. Prices and drops are real.
The Kickstarter page says so under the video.
