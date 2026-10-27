# 10-receipt-scan: what a receipt scan actually needs

Built 2026-10-27. **Designs for review, not posted.** A 7-slide carousel, EN on cream, FR on mint:

1. Cover: "Your receipt scan needs only 3 parts", the example receipt with the three zones numbered
2. The warehouse header (Costco + warehouse number: which warehouse and province to watch)
3. Every item line (the prices PriceBack watches)
4. The totals (where the photo can stop)
5. Skip the payment part (card, approval codes, everything under the total)
6. Keep it straight: straight and flat ✓, tilted ✗, upside down ✗, folded ✗, header cut off ✗, glare ✗
7. Follow @priceback.ca + download, the plans line and both store badges

Render: `node sm-content/10-receipt-scan/scenes/render.js` → `posts/<lang>/receipt-scan-<lang>-NN.png`.

**Supersedes** the "fit the full receipt in the frame" advice in `07-costco-toolkit/posts/scan-receipt` (never
posted). That carousel should not go out as it stands.

The receipt is drawn, stamped EXAMPLE, warehouse #000, card `0000`, so it can never pass for a real record. Its
items are real products from this week's drops. Video: [`REEL-SCRIPT.md`](REEL-SCRIPT.md), narrative for review.

## Captions

**EN:** Your Costco receipt scan only needs 3 parts 🧾 The warehouse header, your items and the totals. The payment
part can stay out of the frame. Lay it flat, keep it straight, scan. Save this for your next Costco run. PriceBack is
free to download: try it free, then buy credits that never expire or go Unlimited. Link in bio.
#Costco #CostcoCanada #CostcoTips #PriceBack

**FR :** Votre reçu Costco n'a besoin que de 3 parties 🧾 L'en-tête de l'entrepôt, vos articles et les totaux. La
partie paiement peut rester hors du cadre. À plat, bien droit, et on scanne. Enregistrez ce post pour votre
prochaine visite chez Costco. PriceBack se télécharge gratuitement : essayez-le, puis achetez des crédits qui
n'expirent jamais ou passez à Illimité. Lien dans la bio. #Costco #CostcoQuébec #AstucesCostco #PriceBack
