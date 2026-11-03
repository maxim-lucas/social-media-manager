# Voice-over: the price translator (feature video)

Same rules as the Kickstarter video (SCRIPT.md, RULES-README §5b): real app design from the code, the voice first
and the picture timed to it, English first (French on hold), no call to action in the voice.
`FILM=translator tools/voiceover.py` reads this table.

| # | On screen | English | Français (on hold) |
| --- | --- | --- | --- |
| 1 | Scan → Price translator mode | Is it really a good deal? The price on a Costco tag tells you, if you know how to read it. | Est-ce vraiment une bonne affaire ? Le prix sur l'étiquette Costco vous le dit, si vous savez le lire. |
| 2 | Type 14.97 → Good deal · Corporate markdown | Type the price you see. Ending in ninety-seven: Costco's head office marked it down. | Tapez le prix affiché. Qui finit par quatre-vingt-dix-sept : le siège de Costco l'a démarqué. |
| 3 | Type 9.00 → Best price · Manager markdown | Ending in zero zero: the store manager wants it gone. | Qui finit par zéro zéro : le gérant veut s'en débarrasser. |
| 4 | Star (*) toggle → Death Star note | A star in the corner? It won't be restocked. | Une étoile dans le coin ? Il ne reviendra pas. |
| 5 | Keyboard away → Works without internet | And it all works with no internet, right at the shelf. | Et tout fonctionne sans internet, directement en rayon. |

## Facts behind each line

- Screens and labels: `PriceTranslatorScreen.js` + `components/DealBadge.js` (`QuickPriceCheck`, `DealBadge`,
  `DeathStarToggle`); decoding is `shared/priceSignal.js` `decodePriceEnding`, run on the phone with no network:
  .97 = corporate markdown (good deal), .00 = manager markdown (best price), .88 = clearance, .X9 = brand promo,
  star = discontinued.
- Line 2: `priceTag.dealDetail.markdown_97` ("Costco head office officially marked this down").
- Line 3: `priceTag.dealDetail.manager_markdown_00` ("the store manager wants this gone").
- Line 4: `priceTag.translator.starHint` ("won't be restocked once it's gone").
- Line 5: `priceTag.translator.offline` ("Works without internet").
- The typed prices are examples of each ending (the translator decodes the number alone, it names no product).
