# Pre-launch teaser pack — what it is and how to run it

Built 2026-09-06. 4 feed posts + 6 story frames, English and Quebec French,
20 assets. Rendered deterministically from SVG scenes: a copy change is a
re-render, not a rebuild.

This pack runs **before** the launch pack in `sm-content/{reels,carousels,statics,stories}`.
The two are meant to look like they come from different worlds, and then to
click together on launch day.

---

## The idea

The launch pack explains the product. This one refuses to.

Four feed posts, numbered `01 / 04` … `04 / 04`, and six story frames. They
never name the product, never name a retailer, never say what category it's in.
What they do is put a **receipt** in front of people and imply that they have
been throwing away something that mattered.

The spine of the series is the number **30**. It reads, in the moment, as a
countdown — days until *something*. It is actually the product's core mechanic:
the price-adjustment window. Nobody can decode that from the teaser, which is
the point; on launch day it re-reads, and the people who guessed feel clever.

The four posts escalate deliberately:

| # | Frame | What it gives away |
| --- | --- | --- |
| 01 | An unreadable receipt, one line printed over it: *don't throw this out* | Nothing. An instruction with no reason. No green anywhere — post 01 must not look like a brand. |
| 02 | Six item lines, one blacked out and circled by hand | That something is being withheld. First appearance of the emerald, as a marker scrawl. |
| 03 | A huge `30`, then *what happens on day 31?* | A number with no unit and no subject. The comment section argues. |
| 04 | A redacted total, *some receipts are worth more than you think*, and the mark stamped in green | The hook, and the mark — never the wordmark. |

### What is actually being withheld

Not the name. The handle is `@priceback.ca`, so anyone reading the profile
already has it. **What's withheld is what the thing does.** That is the mystery
worth protecting, and it survives the handle being right there on screen.

The wordmark still stays off the art, and `verify.js` fails the build if it
creeps into the copy — a frame carrying "PriceBack" in type stops reading as a
mystery and starts reading as an ad that forgot its offer.

---

## The look, and why it is not the launch pack's look

| | Launch pack | This pack |
| --- | --- | --- |
| Ground | Near-black, emerald glow | Warm thermal-receipt paper, torn edges |
| Type | Huge grotesque, tight | Roboto Mono, machine-printed |
| Density | Full-bleed, every pixel working | Mostly empty paper |
| Green | Everywhere — glow, headline, badges | One element per frame, at most |
| Voice | Explains, proves, converts | Withholds |

Two systems that share only a colour and a receipt. That distance is what makes
the teaser feel like it came from somewhere else — and what makes the launch
pack land as an answer rather than as more of the same.

---

## Contents

| Asset | Files | Size |
| --- | --- | --- |
| Feed posts | `posts/priceback-teaser-post-{en,fr}-01..04.png` | 1080×1350 (4:5) |
| Story frames | `stories/priceback-teaser-story-{en,fr}-01..06.png` | 1080×1920 (9:16) |

Source in `scenes/`. `strings.json` holds every word in both languages.

---

## Running it — suggested calendar

Eleven days, tapering toward launch. Days are indicative; the order is not.

| Day | Feed | Story | Sticker |
| --- | --- | --- | --- |
| 1 | Post 01 | Story 01 | **Poll** — "A few" / "All of them" |
| 2 | — | Story 02 | none |
| 3 | — | *poll result screenshot* | — |
| 4 | Post 02 | Story 04 | **Question** — "Guess what's under the bar" |
| 6 | — | Story 03 | **Question** — "Take a guess" |
| 8 | Post 03 | — | — |
| 9 | — | Story 05 | none |
| 11 | Post 04 | Story 06 | **Reminder** (or **Link**, once the landing page is live) |
| 12 | Launch pack begins | | |

**Day 3 is content you don't have yet.** Screenshot the day-1 poll result and
post it as a story: "*X% of you throw them all out.*" The split is also the
single most useful thing this pack produces — it tells you, before launch day,
what share of your audience already knows price adjustments exist, which is
exactly what the launch pack's first week should be aimed at.

Four posts in a three-wide grid leaves post 04 alone on its own row. That is
fine and looks deliberate; the launch pack fills the row in.

### Highlights

Optionally collect the six story frames into one Highlight so latecomers can
read the sequence in order. Give it the mark as a cover and no text label.
Highlights can only be created in the Instagram mobile app — not from desktop
web, and not through the Graph API.

---

## Captions

Keep them short. The art is doing the withholding; a caption that explains it
undoes the whole thing.

### Post 01 — EN
> Most people bin this within an hour of leaving the store.
>
> Four posts from now, we'll tell you why that's a mistake.
>
> Guesses below. ⬇️

### Post 01 — FR
> La plupart des gens jettent ça dans l'heure qui suit leur sortie du magasin.
>
> Dans quatre publications, on vous dira pourquoi c'est une erreur.
>
> Vos hypothèses en commentaire. ⬇️

### Post 02 — EN
> Six lines on a receipt. Five of them you already understand.
>
> The sixth is the one we can't show you yet.
>
> 02 / 04

### Post 02 — FR
> Six lignes sur un reçu. Vous en comprenez déjà cinq.
>
> La sixième, on ne peut pas encore vous la montrer.
>
> 02 / 04

### Post 03 — EN
> Thirty.
>
> Not a discount. Not a countdown to a sale. A window — and almost nobody uses
> it before it closes.
>
> What do you think happens on day 31?
>
> 03 / 04

### Post 03 — FR
> Trente.
>
> Pas un rabais. Pas un compte à rebours vers un solde. Un délai — et presque
> personne ne l'utilise avant qu'il se termine.
>
> Selon vous, qu'est-ce qui arrive le 31e jour ?
>
> 03 / 04

### Post 04 — EN
> That's all four.
>
> We're still not saying what it is. We're saying: stop throwing out your
> receipts, and turn notifications on.
>
> The rest lands on this page shortly.
>
> 04 / 04

### Post 04 — FR
> Voilà les quatre.
>
> On ne dit toujours pas ce que c'est. On dit : arrêtez de jeter vos reçus, et
> activez les notifications.
>
> La suite arrive sur cette page sous peu.
>
> 04 / 04

### Hashtags

**Three, in the first comment, not in the caption.** `#comingsoon #quebec #canada`

Deliberately not the launch set. Tags like `#pricematch`, `#deals` or
`#savings` would answer the question the posts are asking — the algorithm would
put the series in front of exactly the audience that can decode it in one look.
The launch playbook's full hashtag set takes over on launch day, when being
findable by intent is the goal.

---

## Story stickers

Four frames leave an empty band at **y 1210–1510** for a native sticker. The
band is enforced: `verify.js` fails if art creeps into it on a frame that
declares a sticker. Stickers are only interactive when added inside Instagram,
so they are not drawn into the art.

| Frame | Sticker | Copy |
| --- | --- | --- |
| Story 01 | Poll | "A few" / "All of them" — FR: « Quelques-uns » / « Tous » |
| Story 03 | Question | "Take a guess" — FR: « Devinez » |
| Story 04 | Question | "Guess what's under the bar" — FR: « Devinez ce qu'il y a sous la barre » |
| Story 06 | Reminder, or Link once the landing page is live | — |

Stories 02 and 05 take no sticker on purpose. A sequence where every frame asks
for a tap stops feeling like a mood and starts feeling like a survey.

---

## Compliance — read before changing a word

`Marketing-Plan/01-strategy-overview.md` and the app repo's
`legal/MARKETING_CLAIMS.md` prohibit promising a dollar amount or a guaranteed
refund in marketing copy. Competition Act s.74.01 and Quebec's LPC s.219 both
test the **general impression**, not the literal wording.

MARKETING_CLAIMS.md names the exact failure mode this pack has to avoid: a
claim clipped into a social card **without its paired fine print**. A teaser has
no room for fine print. So it makes no claim at all:

- Every line is a question, an instruction, or hedged — "some", "might", "than
  you think". Nothing is promised.
- **Every amount is a black bar.** The redactions are doing compliance work, not
  just styling: the pack never prints a figure it would have to stand behind.
- No retailer is named or shown, so no non-affiliation disclaimer is needed —
  and none would fit.
- No "free", no percentage, no "refund".

`verify.js` enforces all of that mechanically (gate 5). If you add copy that
trips it, the fix is to soften the copy, not to loosen the gate.

---

## Changing the pack

```bash
node sm-content/teaser/scenes/render.js     # all 20 assets
node sm-content/teaser/scenes/verify.js     # the six gates — must exit 0
```

`render.js --only=posts --lang=fr --svg` narrows the run and dumps the SVG
beside each PNG for debugging.

**The date is a string.** `strings.json` → `date: "09 . ## . 26"`. `##` is a
placeholder the renderer draws as an ink bar; the month is shown, the day is
hidden. If the calendar moves, change it there and re-render — never edit a PNG.

### The gates

| Gate | What it actually checks |
| --- | --- |
| Dimensions | Every asset declared in `strings.json` exists at exactly its canvas size |
| Safe zones | Re-renders each scene with the paper stripped, so content is exactly the non-transparent pixels, then asserts none of it sits under Instagram's header, caption bar or action rail |
| Sticker band | A frame that declares a sticker actually leaves the band empty |
| Font | Renders a probe and *measures* it. librsvg substitutes a missing font silently, so a machine without Roboto Mono would otherwise ship a pack set in something else with no error |
| Parity | EN and FR carry the same assets, ids, keys, sticker plan and row counts |
| Copy | No dollar figure, percentage, guarantee, retailer name, "refund" or "free"; no empty or placeholder strings; no wordmark |

Fonts: **Roboto Mono** (Apache-2.0) throughout. Installed on the build machine
and available on Linux CI as `fonts-roboto`.
