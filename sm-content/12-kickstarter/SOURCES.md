# Sources (v3): what the Kickstarter video shows and where it comes from

## The story (one consistent demo, RULES §5b)

1. **Costco profile**: the shopper saves a preferred warehouse (Laval, QC · #505) and membership (Executive).
2. **Scenario A: scanned on the purchase day.** Oct 20: a grocery run at the **Anjou Business Centre (#1447)**,
   15 lines, scanned the same day. A date chip above the phone flips to "6 days later · Oct 26": the daily
   summary arrives, $47 to claim on 5 items. No drop runs on the purchase day.
3. **Scenario B: an older receipt uploaded today.** Oct 31: the shopper uploads the PDF of a Samsung TV bought
   Oct 14 (inside the 30-day window); the saved warehouse fills in by itself. The drop is already running, so the
   alert lands minutes later: only the status-bar clock moves (9:41 → 9:44). Receipt detail → how to claim.
4. $547 to claim → PriceBack.

## Real data (prod, read-only, 2026-11-02)

| Product (item #) | Price shown | Real drop shown | Source |
| --- | --- | --- | --- |
| Heinz Mayonnaise (1345567) | $79.99 | **−$16**, QC, Oct 26 → Nov 8 | `price_points` + `savings` (`sameday_business_centre`) |
| McCafé Autumn Blend K-Cup Coffee Pods (1477487) | $54.99 | **−$12**, QC, Oct 26 → Nov 1 | same |
| Evian Carbonated Natural Spring Water, 12 × 750 mL (1752222) | $31.99 | **−$7**, QC, Oct 26 → Nov 8 | same |
| Quaker Yogourt Granola Bars (1788908) | $18.99 | **−$7**, QC, Oct 26 → Nov 8 | same |
| Turtles Classic Recipe Chocolates (1331706) | $24.99 | **−$5**, QC, Oct 26 → Nov 1 | same |
| Kirkland Signature Atlantic Salmon (46340) | $39.99 | — | `price_points`; no QC / national `savings` Oct 14 → Nov 8 |
| Kirkland Signature Frozen Lean Beef Patties (50846) | $35.99 | — | same |
| Saputo Mascarpone Cheese (1924842) | $29.99 | — (its only saving ran in BC) | same |
| Kirkland Signature Frozen Chicken Breast Fillets (378381) | $29.99 | — | same |
| Kirkland Signature Breaded Chicken Chunks (1736931) | $26.99 | — | same |
| Kirkland Signature Sliced Bacon (104847) | $23.99 | — | same |
| Kirkland Signature Thai Hom Mali Jasmine Rice (382153) | $23.49 | — | same |
| Kirkland Signature Shredded Parmigiano Reggiano (1349687) | $21.99 | — | same |
| Kirkland Signature Whole Almonds (284601) | $21.99 | — | same |
| Kirkland Signature 100% Pure Liquid Honey (1149163) | $19.99 | — | same |
| Samsung QN80H Series 4K UHD Neo QLED TV (5708165) | $1,808.24 | **−$500, Oct 31 → Nov 5** (alert "5d left"); narration: "after a single day at $600" (Oct 26) | `price_points` + `savings` |

Every drop shown is a Quebec drop, so it applies to the Quebec receipts it lands on, and the lines without a drop
were checked to have no Quebec or national saving in the window (a first pick had 7 lines whose real QC drops the
video would have hidden: replaced 2026-11-02). Taxes are Quebec (GST 5% + QST 9.975%). Grocery receipt: subtotal
$485.35 (the sum of its 15 lines); tax only on the taxable lines (sparkling water, chocolates, granola bars:
$75.97 → $11.38); total **$496.73**.
TV receipt: $1,808.24 + $270.78 = **$2,079.02**. Claim deadlines are each saving's end date, or the receipt's
30-day window, counted from the day the alert arrives.

## App screens (real design, from the app's code)

Costco profile (`CostcoProfileScreen`: Preferred warehouse, Costco membership Gold Star / Executive, Save, Not now),
Home (empty state, tracking list with `receiptPlaceLabel` "Anjou Business Centre #1447", "To claim" hero), Scan
receipt (`ScanTemplate`), Scanning (`ReceiptScanningAnimation`), **Confirm receipt** (store, Online / Warehouse
Purchase, warehouse selector with `formatWarehouseLabel` "Anjou Business Centre, QC · #1447", Items (n) with SKU /
QTY / price / Add discount, Summary, Purchase Date, Watch Until, **Start Tracking 🚀**), receipt detail
(`DetailScreen`). Push copy from `backend/lib/pushI18n.js` (`verifiedDrop.*`, `dropSummary.*`). The document
scanner and Files picker are Android system screens. The date chip above the phone is the video's only
non-app element: it tells the viewer which day it is.

## Receipts (visual only)

Real Costco receipts from the app's fixtures (`PXL_20260604_173014846.jpg`, a Business Centre receipt, and
`Costco Receipts PDF/G-10.pdf`), fully blurred except the printed COSTCO WHOLESALE logo (Maxim, 2026-11-02: no
one can read the blurred lines, so the demo carries its own products, total and date). Originals never copied here.

## Demo

The account, its purchase dates and the claim deadlines derived from them are a demo. Prices and drops are real.
The Kickstarter page says so under the video.
