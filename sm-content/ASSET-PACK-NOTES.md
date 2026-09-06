# PriceBack launch asset pack — what's here and how to post it

Built 2026-09-02. 2 videos + 36 stills, English and Quebec French. Everything is
rendered deterministically from HTML scenes, so a copy change is a re-render, not a rebuild.

Source: Cowork session `cse_01QJzpqDCPqZ4HAHmNa7UfXK` ("Instagram and Reddit launch materials").
Companion playbook: claude.ai artifact `e9375fa1-99a1-4f30-9165-d9d0d93ae90f` ("PriceBack Launch Playbook").

## Contents

| Asset | Files | Size | Where it goes |
| --- | --- | --- | --- |
| A1 hook Reel | `reels/priceback-reel-hook-{en,fr}.mp4` | 1080×1920, 17.5s, 30fps | Reels, Stories, FB Reels, TikTok, Shorts, Google vertical |
| A3 carousel | `carousels/priceback-carousel-{en,fr}-01..10.png` | 1080×1350 | Instagram feed carousel |
| A4 statics | `statics/priceback-static-{en,fr}-01..03.png` | 1080×1350 | Feed singles, and the forward-me screenshot |
| A7 stories | `stories/priceback-stories-{en,fr}-01..05.png` | 1080×1920 | Story sequence |

## Before you post — three things

1. **Store badges are placeholders.** The App Store / Google Play chips in the end card
   and carousel slide 10 are generic. Swap in Apple's and Google's official badge artwork
   (and the French versions — Apple provides *Télécharger dans l'App Store*) before this
   runs anywhere paid. Their guidelines require the real artwork.
2. **Add audio in the app.** Both MP4s carry a silent AAC track on purpose. Add trending
   audio inside Instagram when you post organically so the sound gets attributed to the
   trend; add a licensed bed at the edit stage for paid. All messaging is on screen, so
   the reel works muted either way.
3. **The claim screen is designed, not captured.** Same caveat as the launch film — verify
   it matches the shipped app before this goes behind paid media.

## Story stickers

Frames 01 and 05 leave an empty band at roughly y 1400–1650 on purpose. That's where the
native sticker goes — it has to be added in the Instagram app to be interactive:

- Frame 01 → poll sticker, Yes / No idea
- Frame 05 → link sticker to the landing page

Frame 01's poll result is content: screenshot it and post "X% of you didn't know" the next day.

## Hook testing

The reel's first 3 seconds are the only variable worth testing. To cut variants, edit
`hook1` / `hook2` in `scenes/strings.json` and re-render — the rest of the film is untouched.
Publish three as Trial Reels on the same day and let send rate pick the winner.

## The gates these passed

Every asset cleared all five before delivery. Re-run them after any copy change.

| Gate | Script | Result |
| --- | --- | --- |
| Safe zones — IG header, caption bar, right action rail | `bounds.py` | 9:16 clear in both languages |
| 4:5 margins and clipping | `bounds45.py` | 0 issues, both languages |
| Element-level overflow | `probe.js` | no content element outside the safe band |
| Motion — no frozen frames | `motion.py` | 0 identical frames in 525, both languages |
| Strings — NaN, locale, EN leftovers in FR | `straudit.js` | 94 strings each, 0 failures |
| Dimensions, codec, audio track, claim safety, EN/FR parity | `verify.py` | 0 failures, 0 warnings |

Two real bugs the gates caught and that are now fixed: English currency and item names
leaking into the French tracking screen (the runtime-string class of bug the launch-film
doc warns about), and the story frames rendering at 1350px tall instead of 1920.

## Claim safety

Everything in `Marketing-Plan/06-compliance.md` is enforced in the copy: Costco-only with
"5 more coming", "free to download · pay per scan", the in-stock condition stated on
carousel slide 5 and the claim screen, no Costco logo, no brand name on the television,
and the not-affiliated disclaimer on every end card and static.
