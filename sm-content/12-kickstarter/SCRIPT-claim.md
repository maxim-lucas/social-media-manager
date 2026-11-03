# Voice-over: claim a price drop (feature video)

Same rules as the Kickstarter video (SCRIPT.md, RULES-README §5b): real app design from the code, real data, the
voice first and the picture timed to it, English first (French on hold), no call to action in the voice.
`FILM=claim tools/voiceover.py` reads this table.

| # | On screen | English | Français (on hold) |
| --- | --- | --- | --- |
| 1 | Home: $547 to claim → the TV's Claim button | A price drop on something you bought? Here's how to get your money back. | Une baisse de prix sur un de vos achats ? Voici comment récupérer votre argent. |
| 2 | Price drop: +$500.00 → Claim instructions | Open it, and tap Claim instructions. | Ouvrez-la, puis touchez Instructions de réclamation. |
| 3 | How to claim at a Costco warehouse → Show my receipt | At any Costco warehouse, go to the Returns counter and show your receipt, right from the app. | Dans n'importe quel entrepôt Costco, allez au comptoir des retours et montrez votre reçu, directement dans l'app. |
| 4 | Step 3: Costco refunds the difference | Costco refunds the difference to your original payment method. | Costco rembourse la différence sur votre moyen de paiement d'origine. |
| 5 | Mark as Claimed → alert → Refund claimed — $500.00 saved | Then mark it as claimed, and PriceBack records your savings. | Puis marquez-la comme réclamée, et PriceBack enregistre vos économies. |

## Facts behind each line

- The drop is the Kickstarter story's TV: Samsung QN80H (5708165) bought Oct 14 at Laval #505 for $1,808.24; real
  −$500 saving Oct 31 → Nov 5 (prod `savings`). The receipt shown is the masked PDF receipt of the Kickstarter
  video (logo only, everything else blurred).
- Screens and labels: `DetailScreen.js` (Mark as Claimed / Claim instructions, How to claim at a Costco warehouse
  steps `claimHow.costcoWarehouse1-4`, Show my receipt → the receipt opens under step 2, View Official Policy),
  the native alert `alert.markAsClaimed` / `markAsClaimedBody` / `markAsClaimedYes`, and the claimed banner
  `detail.refundClaimedX` ("Refund claimed — $500.00 saved").
- Line 4: step 3 ("Costco refunds the difference to your original payment method. The money comes from Costco,
  not from PriceBack.").
- Line 5: the alert says "This will record $500.00 in savings and remove the price alert."
