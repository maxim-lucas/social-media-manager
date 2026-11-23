# Score rubric: 9.0 / 10 or it does not go out (Maxim, 2026-11-16)

Every carousel and every reel is scored by a **separate reviewer pass** (a fresh agent that did not build the piece
and sees only the rendered slides or video stills, the caption, and this file). It returns seven sub-scores from 0 to 1
and one concrete fix per sub-score below 1, plus `rejectPhotos`: the SKUs whose photo is a lifestyle scene, collage or
banner (the builder adds them to `tools/photo-rejects.json` and the item leaves the carousel). `scripts/weekly/lib/score.js` turns them into the total and applies the gate
(target 9.0, at most 3 rounds). Under 9.0 after round 3 the piece is not published and is listed in the PR for Maxim.

| Sub-score | Weight | 1.0 means |
|---|---|---|
| `hook` | 2 | The first slide (carousel) or the first 1.5 s (reel) would stop a Costco shopper scrolling: a concrete number, a product they recognise, the end date. No generic opener. |
| `clarity` | 2 | In 3 seconds: what dropped, by how much, where (province strip), until when, and what to do (claim the difference). The big figure is the common amount; any province with another amount shows it small in its own cell. |
| `photos` | 1.5 | Every product has its clean packshot, the right product, trimmed and centred, nothing written over it. No placeholder, no banner crop. A **lifestyle scene** (house, snow, room, people), a collage or a wide banner is not a packshot: name its SKU in `rejectPhotos` (see below). |
| `legibility` | 1.5 | Readable on a phone and muted; clear of Instagram's header, caption bar and right-hand buttons; contrast holds; no text collides. |
| `language` | 1 | English posts read as natural Canadian English; French posts are Quebec French, localised not translated (`19,99 $`, `PRIX À LA CAISSE`), no English left over. |
| `compliance` | 1 | "Claim, never get"; real numbers with their date; not-affiliated line; no Costco logo; no jewellery or mobile devices; **the province strip and the footer match the data**. The national carousels (English and French alike) cover all 9 provinces, **Quebec included, on purpose** (Maxim, 2026-11-16): a lit QC cell on an English slide is correct, never a defect. A regional carousel names only its own provinces. **The cover is plain (Maxim, 2026-11-16, never to be changed): hook, claim-until date, number of drops, total, legal line. A product, a product photo, "biggest drop" or a province summary on a cover is a compliance score of 0 and the carousel does not go out.** |
| `cta` | 1 | **The house design is fixed and correct**: item slides carry the PriceBack bar and both store badges, the cover carries the badges, and the end card asks for one thing (follow). That is one coherent ask; judge only that the caption makes the same ask and that no slide asks for something else. Never ask to remove the badges or the app bar. |

## Rules for the reviewer

- **Substitute photos are allowed** when the SKU is listed in `tools/photo-substitutes.json` (the same product under another SKU, or a TV of the same brand): a TV photo showing another model of the brand is not a defect.

- **Known house design, never a defect:** Costco-coloured style, the two store badges, the PriceBack app bar, the claim band,
  Quebec in the national strip, the follow-only end card. A fix that changes one of these is not accepted.
- Fix only what the data and the renderer get wrong (a wrong stat, text overlapping, a lifestyle photo, a wrong language).

- Score what is on the screen, not what the builder meant. A defect you can point at costs points; a vague feeling does not.
- A score of 1.0 needs no fix; never ask for a change you cannot name ("make it pop" is not a fix).
- Do not lower a score because the style is Costco-coloured: that exception is deliberate (`STYLE.md`).
- **Reels follow the approved reel design** (`reels/README.md`, approved by Monica 2026-11-04): the hook is the question
  "Shopped at Costco lately?" over the 2x4 photo grid, then the yellow "N PRICES JUST DROPPED" banner; the basket build
  with the climbing "Claim up to $X back" counter; the end card with the follow button and the two store badges. There is
  no province strip in a reel. **Never ask to change that structure** (a fix that asks for a different hook, a province strip,
  an app bar or another call to action is NOT accepted and costs nothing).
  **How to score a reel (2026-11-23: three reels scored 4 to 6 because reviewers marked the approved design down for
  not being a carousel, so no reel ever shipped):** a reel starts at 1.0 on `hook`, `clarity`, `compliance` and `cta`
  because the approved structure satisfies them; the reel hook is the question, the grid and the banner together (the 0.5 s
  still showing only the question is by design). Deduct ONLY for an execution defect you can point at in a still: a
  wrong figure or date, a lifestyle photo, text colliding or cut off, English in a French reel, a missing end card or
  badges, music other than the approved track. Each deduction names the still and the defect.
- Reels: judge from stills at 0.5 s, 2 s, 4 s, 6 s and 7 s, plus the cut list. The music is judged only on "approved
  track, correct level"; taste is Maxim's, through `reels/music/APPROVED.json`.

## Honest limit

This score is the model's own rubric. It is a quality gate, not a measurement of conversion. Conversion is read weekly
from Instagram Insights (reach, saves, shares, follows, profile visits) and written to
`weekly/<monday>/insights.json`; when a high-scoring post underperforms, the weights above are changed here, in the same
PR as the evidence.
