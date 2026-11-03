# Narration v3: Kickstarter video

Calm and natural. It says the drops are real (RULES §5b). Every amount is real (SOURCES.md). 46 s of picture.
The UI stays English in both cuts; only the voice-over changes (Maxim, 2026-11-02: no French UI cut).
`tools/narrate.py` reads this table: keep the five columns, one row per slot, times in seconds.

| From | To | On screen | English | Français |
| --- | --- | --- | --- | --- |
| 0.0 | 3.6 | Costco profile: preferred warehouse Laval #505, Executive → Save | Save your Costco warehouse once. | Enregistrez votre entrepôt Costco une seule fois. |
| 3.6 | 12.4 | Home → Scan → document scanner → scanning (Oct 20 chip) | Then scan your receipt. PriceBack reads every item, even from the Business Centre, | Puis scannez votre reçu. PriceBack lit chaque article, même au Centre d'affaires, |
| 12.4 | 18.0 | Confirm: Anjou Business Centre detected, 15 items → Start Tracking | you check the details, and start tracking. | vous vérifiez, puis vous lancez le suivi. |
| 18.0 | 26.8 | Chip flips to "6 days later" → daily summary → $47 to claim | Six days later, real price drops: sixteen dollars on mayonnaise, twelve on coffee pods. Forty-seven dollars to claim. | Six jours plus tard, de vraies baisses de prix : seize dollars sur la mayonnaise, douze sur le café. Quarante-sept dollars à réclamer. |
| 26.8 | 33.4 | Oct 31: upload a PDF from Oct 14 → saved warehouse filled in → Start Tracking | Bought something two weeks ago? Upload that receipt too. | Un achat d'il y a deux semaines ? Ajoutez aussi ce reçu. |
| 33.4 | 42.6 | Clock 9:41 → 9:44: TV alert → receipt detail → How to claim | Minutes later: five hundred dollars off this Samsung TV, after a single day at six hundred. Show your receipt at the warehouse, and claim the difference. | Quelques minutes plus tard : cinq cents dollars de moins sur ce téléviseur Samsung, après une seule journée à six cents. Montrez votre reçu à l'entrepôt et réclamez la différence. |
| 42.6 | 46.0 | $547 to claim → PriceBack | PriceBack. Back us on Kickstarter. | PriceBack. Soutenez-nous sur Kickstarter. |

## Facts behind each line (prod, read-only, 2026-11-02)

- Grocery receipt: Costco Business Centre Anjou #1447, Oct 20, 15 grocery lines, subtotal $485.35 (sum of the
  lines, real regular prices), QC tax $11.38 on the taxable lines, total $496.73. The 10 lines without a drop
  had no Quebec (or national) saving from Oct 14 to Nov 8, so the 5 drops shown are all the receipt got.
- Its drops (source `sameday_business_centre`, QC, from Oct 26): Heinz Mayonnaise −$16, McCafé K-Cups −$12,
  Evian sparkling −$7, Quaker granola bars −$7, Turtles −$5 = **$47**. None runs on the purchase day.
- TV receipt: Samsung QN80H 5708165, $1,808.24 + QC tax $270.78 = $2,079.02, bought Oct 14 at Laval #505
  (the saved warehouse), uploaded Oct 31. Its drop: −$600 for one day (Oct 26), −$500 Oct 31 → Nov 5
  (alert: "5d left"). Found minutes after the upload: only the status-bar clock moves (9:41 → 9:44).

## Voice (Maxim's decision, 2026-11-02)

Maxim recorded **one French voice sample** (`audio/Recording.m4a`, git-ignored: personal data, never committed).
Both narrations are generated in his voice with **OpenVoice V2** (MIT licence, free, local): MeloTTS speaks
the English / French lines and OpenVoice applies his voice's tone colour, so EN and FR sound like the same
person. ElevenLabs is the paid upgrade later.

    E:/tools/openvoice/.venv/Scripts/python.exe sm-content/12-kickstarter/tools/narrate.py

Outputs `audio/narration-en.wav` and `audio/narration-fr.wav` (each line fitted inside its slot);
`node scenes/render.js all` mixes each into its own MP4.
