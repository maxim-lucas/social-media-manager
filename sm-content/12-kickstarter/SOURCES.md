# Sources: what the Kickstarter video shows and where it comes from

## Real

| On screen | Value | Source |
| --- | --- | --- |
| Samsung QN80H Series 4K UHD Neo QLED TV (item 5708165) | **$600 off on Oct 26, 2026** (then $500 off Oct 27–29 and Oct 31–Nov 5) | prod `priceback.savings`, harvested by PriceBack on Oct 27, 2026 |
| Generac Guardian Generator (item 1737269) | **$1,000 off, Oct 26 – Nov 8, 2026** | prod `priceback.savings`, harvested Oct 27, 2026 |
| Van Houtte coffee | **$13 off**, seen Oct 27, 2026 | `sm-content/10-receipt-scan/NOTES.md` (real drop used in that pack) |
| Chefman kettle | **$10 off**, seen Oct 27, 2026 | same |
| Paper receipt | Costco logo, SUBTOTAL 79.92, TAX 4.03, TOTAL 83.95 (Dec 5, 2025) | `Priceback/__tests__/fixtures/receipts/PXL_20260604_173014846.jpg`, masked by `sources/mask_receipts.py` |
| PDF receipt | Costco logo, SUBTOTAL 304.78, TAX 32.02, TOTAL 336.80, 06/28/2025 | `Priceback/__tests__/fixtures/receipts/Costco Receipts PDF/G-11.pdf`, masked by the same script |
| Every label, colour, font, icon and layout | the app's own code | `Priceback/src/…` (see README) |
| Push copy | "🟢 Price drop on a recent purchase" / "🔴 Last days to claim a price drop" / "You can save {savings} · {daysLeft}." | `Priceback/backend/lib/pushI18n.js` (`verifiedDrop.*`) |
| Claim steps | "How to claim at a Costco warehouse", steps 1–4 | `Priceback/src/services/i18n.js` (`claimHow.costcoWarehouse1–4`) |

## Masking (the receipts belong to nobody)

Kept readable: the printed COSTCO WHOLESALE logo, SUBTOTAL / TAX / TOTAL, and the date and time. Everything else
(warehouse, address, member number, transaction barcode, every item line, card, approval, register and tax
numbers) is mosaicked at about half the text height, then blurred. The script keeps only listed bands, so a
word the OCR missed is still blurred. That's how the member number, which the OCR did not detect, got
caught on 2026-11-02. The unmasked originals stay in the app's fixtures and are never copied here.

## Prices (real, prod `priceback.price_points`, latest regular price, read 2026-11-02)

| Product (item #) | Regular | Shown after the drop |
| --- | --- | --- |
| Samsung QN80H Series 4K UHD Neo QLED TV (5708165) | $1,808.24 | $1,208.24 (−$600, Oct 26) |
| Generac Guardian Generator (1737269) | $8,999.99 | $7,999.99 (−$1,000) |
| Van Houtte Original House Blend Coffee K-Cup Pods (266556) | $52.99 | $39.99 (−$13) |
| Chefman Stainless Steel Kettle (2023352) | $39.99 | $29.99 (−$10) |

## Demo data (not real; says nothing about any shopper)

- The account is a demo account: which products it tracks and its purchase dates are illustrative. Prices and
  savings are real (above).
- The claim deadlines are derived from those demo purchase dates and the real saving dates.
- The Kickstarter page says so under the video: *"App screens shown with a demo account; the prices and price
  drops are real Costco figures from October 2026."*
