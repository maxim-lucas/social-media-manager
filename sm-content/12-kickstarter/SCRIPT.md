# Voice-over v5: Kickstarter video

**Voice first, then picture** (Maxim, 2026-11-02): the voice-over track is generated and validated on its own;
only then is the video re-timed (and its empty space reworked) to fit it. No video render until Maxim approves the
track. English first; **French on hold**. The UI stays English in every cut (no French UI cut).

Calm and natural, read at its own pace: one full sentence per line, nothing stretched or sped up to fit a slot.
It says the drops are real (RULES §5b). Every amount is real (facts below). No call to action in the voice: the
"Back us on Kickstarter" ending is removed (Maxim, 2026-11-02).
`tools/voiceover.py` reads this table: one row per line, numbered.

| # | On screen | English | Français (on hold) |
| --- | --- | --- | --- |
| 1 | Home → Scan → document scanner (paper receipt, Anjou Business Centre) | Scan any Costco receipt, paper or PDF. | Scannez n'importe quel reçu Costco, papier ou PDF. |
| 2 | Scanning → Confirm: Anjou Business Centre read from the receipt, 15 items | PriceBack reads every item and finds the warehouse on the receipt, because prices can differ from one warehouse to another. | PriceBack lit chaque article et trouve l'entrepôt sur le reçu, car les prix peuvent varier d'un entrepôt à l'autre. |
| 3 | Confirm: Online / Warehouse Purchase switch | Warehouses and Business Centres, in-store or online: they're all supported. | Entrepôts et Centres d'affaires, en magasin ou en ligne : tout est pris en charge. |
| 4 | Start Tracking | Check the details, and start tracking. | Vérifiez, puis lancez le suivi. |
| 5 | Chip flips to "6 days later" → daily summary → $47 to claim | Six days later, real price drops: sixteen dollars on mayonnaise, twelve on coffee pods. Forty-seven dollars to claim. | Six jours plus tard, de vraies baisses de prix : seize dollars sur la mayonnaise, douze sur le café. Quarante-sept dollars à réclamer. |
| 6 | Oct 31: upload a PDF from Oct 14 → Laval #505 read from the receipt → Start Tracking | Bought something two weeks ago? Upload that receipt too. | Un achat d'il y a deux semaines ? Ajoutez aussi ce reçu. |
| 7 | Clock 9:41 → 9:44: TV alert → receipt detail | Minutes later: five hundred dollars off this Samsung TV, after a single day at six hundred. | Quelques minutes plus tard : cinq cents dollars de moins sur ce téléviseur Samsung, après une seule journée à six cents. |
| 8 | How to claim at a Costco warehouse | Show your receipt at the warehouse, and claim the difference. | Montrez votre reçu à l'entrepôt et réclamez la différence. |

**No spoken ending** (Maxim, 2026-11-03): the voice ends on "…claim the difference."; the end card ($547 to claim
→ PriceBack logo) closes the video in silence. A one-word "PriceBack." could not be generated cleanly (every
attempt was heard as "Briceback", "Try us back"…), and the logo says it anyway.

**No warehouse setup in the story** (Maxim, 2026-11-02): the app reads the warehouse from each receipt and tracks
every receipt at its own warehouse, because prices differ between warehouses. The favourite warehouse in the
Costco profile is only a preference, so the video does not open on it. The voice says what is supported: Costco
warehouses and Business Centres, in-store and online purchases, paper and PDF receipts (no screenshots: Maxim,
2026-11-02).

## Facts behind each line (prod, read-only, 2026-11-02)

- Grocery receipt: Costco Business Centre Anjou #1447, Oct 20, 15 grocery lines, subtotal $485.35 (sum of the
  lines, real regular prices), QC tax $11.38 on the taxable lines, total $496.73. The 10 lines without a drop
  had no Quebec (or national) saving from Oct 14 to Nov 8, so the 5 drops shown are all the receipt got.
- Its drops (source `sameday_business_centre`, QC, from Oct 26): Heinz Mayonnaise −$16, McCafé K-Cups −$12,
  Evian sparkling −$7, Quaker granola bars −$7, Turtles −$5 = **$47**. None runs on the purchase day.
- TV receipt: Samsung QN80H 5708165, $1,808.24 + QC tax $270.78 = $2,079.02, bought Oct 14 at Laval #505
  (read from the receipt), uploaded Oct 31. Its drop: −$600 for one day (Oct 26), −$500 Oct 31 → Nov 5
  (alert: "5d left"). Found minutes after the upload: only the status-bar clock moves (9:41 → 9:44).

## Voice (Maxim's decisions, 2026-11-02)

Maxim recorded **one French voice sample** (`audio/Recording.m4a`, git-ignored: personal data, never committed).
The voice-over is generated in his voice from it.

- **v3, OpenVoice V2 + MeloTTS: rejected** ("a lot of noise, the accent is very weird and some letters are cut").
  Causes: the sample is very quiet (−44 dB RMS, room noise 23 dB below the voice), so the clone copied the noise;
  OpenVoice re-colours a stock English speaker, which gave the odd accent; lines were sped up to fit old slots.
- **v4, Chatterbox (Resemble AI, MIT, local): current.** The reference is cleaned first (rumble filter, denoise
  calibrated on the sample's own silence, long pauses shortened, level normalised: `E:/tools/voice/ref-clean.wav`,
  never committed). Chatterbox clones from it directly, at natural pace. Two takes for Maxim to pick from:
  **A** (closest to his voice) and **B** (`cfg_weight 0`, Resemble's documented setting to stop the sample's
  language from carrying its accent into English). Every line is checked by a speech-recognition pass (Whisper)
  against its text, so a clipped or garbled word is caught and re-generated before Maxim hears it.
- ElevenLabs (paid) stays the fallback if neither take is clean enough.

    bash sm-content/12-kickstarter/tools/install-chatterbox.sh        # once
    E:/tools/chatterbox/.venv/Scripts/python.exe sm-content/12-kickstarter/tools/voiceover.py en

Outputs `audio/voiceover-en-A.wav`, `audio/voiceover-en-B.wav` (−16 LUFS, the level Instagram and Kickstarter
expect) and `audio/voiceover-en-*.json` (each line's start and end, used to re-time the video once approved).
