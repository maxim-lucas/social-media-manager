# Narration v2: Kickstarter video (FOR REVIEW: nothing is voiced until approved)

Calm and natural. It says the drops are real (RULES §5b). Every amount is real (SOURCES.md). 46 s of picture.

| From | To | On screen | English | Français |
| --- | --- | --- | --- | --- |
| 0.0 | 3.0 | Empty Home → Scan Your First Receipt | Prices at Costco keep changing after you pay. | Chez Costco, les prix continuent de changer après votre achat. |
| 3.0 | 10.4 | Scan → document scanner → scanning | Scan your receipt with PriceBack. It reads every item and the warehouse, | Scannez votre reçu avec PriceBack. Il lit chaque article et l'entrepôt, |
| 10.4 | 16.6 | Confirm receipt (7 items) → Start Tracking | you check the details, and tap Start Tracking. | vous vérifiez, puis vous touchez Commencer le suivi. |
| 16.6 | 24.6 | Upload file → PDF → Confirm (2 items) | Got the PDF from your Costco account? Upload it the same way. | Vous avez le PDF de votre compte Costco ? Téléversez-le de la même façon. |
| 24.6 | 33.0 | Watching 9 products → alert: $1,000 | Then PriceBack watches every item, every day. These price drops are real: a thousand dollars off a Generac generator, | Ensuite, PriceBack surveille chaque article, chaque jour. Ces baisses de prix sont réelles : mille dollars de moins sur une génératrice Generac, |
| 33.0 | 37.2 | Daily summary → $1,023 to claim | thirteen dollars on coffee and ten on a kettle, | treize dollars sur du café et dix sur une bouilloire, |
| 37.2 | 43.4 | TV alert → receipt detail → How to claim | and five hundred off a Samsung TV, after a single day at six hundred. Show your receipt at the warehouse and claim the difference. | et cinq cents dollars de moins sur un téléviseur Samsung, après une seule journée à six cents. Montrez votre reçu à l'entrepôt et réclamez la différence. |
| 43.4 | 46.0 | $1,523 to claim → PriceBack | PriceBack. Back us on Kickstarter. | PriceBack. Soutenez-nous sur Kickstarter. |

## Voice (Maxim's decision, 2026-11-02)

Maxim records **one voice sample** (30–60 s, natural French, quiet room, `audio/voice-sample.wav`). Both
narrations are generated in his voice with **OpenVoice V2** (MIT licence, free, local): MeloTTS speaks the
English / French lines and OpenVoice applies his voice's tone colour, so EN and FR sound like the same person.
ElevenLabs is the paid upgrade later. Outputs: `audio/narration-en.wav`, `audio/narration-fr.wav`;
`node scenes/render.js all` mixes each into its own MP4.
