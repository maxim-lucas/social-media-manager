# The Highlights pack — what it is and how to change it

Built 2026-09-09. **60 assets**: 25 story frames × 2 languages, plus 10 Highlight
covers. Rendered deterministically from SVG scenes — a copy change is a
re-render, not a rebuild.

This is the fifth pack in `sm-content/`, and the first one with **no end date**.

| Pack | Job | Lifespan |
| --- | --- | --- |
| `teaser/` | Withholds. Says nothing, names nothing. | The eleven days before launch |
| `../{reels,carousels,statics,stories}` | Explains the launch. | Launch week |
| `evergreen/` | Describes the mechanic, store-agnostically. | Rotates forever |
| `04-community/` | Recruits. Asks people to join and contribute. | One run, then retire the register |
| **`05-highlights/`** | **Answers. The tray somebody opens after they follow.** | **Edited, never retired** |

A feed post is read once by people who happen to scroll past. A Highlight is
opened deliberately, by somebody who has already decided to find out more — which
makes it the only surface on the account where a full explanation is not a
mistake. Everything here is written to be true in a year.

---

## What it says

| Tray | The argument |
| --- | --- |
| **How it works** | A price you paid is not always the final one. Here is what it takes. |
| **Stores** | One store per frame. Costco is read properly; Best Buy is not ready; yours is a question. |
| **Earn** | Credits go out, and they come back — by inviting somebody, or by making the price data better. |
| **Plans** | What a credit is, what spends one, and why a flat fee changes the shape of the whole thing. |
| **The app** | What it does while you are not looking, and what you can set. |
| Tips · FAQ · Support · About · Feedback | Filled from `04-community`, with a few frames added. |

[`HIGHLIGHTS.md`](HIGHLIGHTS.md) is the operator's file: the tray order, the
titles in both languages, the cover arithmetic, and how to build it on a phone.

---

## The one structural idea: every Highlight is bilingual end to end

```
INTRO  →  ENGLISH frames  →  FR CARD  →  FRENCH frames
```

The first cover set had a **Français** Highlight — a French-only drawer. It was
the wrong shape twice over: it duplicated the back half of every other tray, and
it left all the *other* trays still opening in English with no way out. A
francophone who opens *How it works* does not want a different Highlight, they
want this one to continue.

So the language seam moved **inside** each tray, and two frames do the work.
Both are rendered once, in `../04-community/00-language-notice/`, and reused
everywhere. Two copies of one signpost is how a signpost starts pointing two
different ways.

### The intro frame stopped giving instructions

It used to say **"keep tapping."** That asks somebody to spend an unknown number
of taps on a language they do not read, on the word of an account they have just
met — and it framed French as the *end* of a queue.

It now draws **a replica of Instagram's own story progress bar**, French half
lit, FR card marked. The real bar is on screen a few hundred pixels above it, so
the replica needs no caption: it is read against the original. It shows that the
French half is a *half*, and it works for a reader who cannot read the words
under it.

Its chevrons point **right**. They used to point down, which is the one direction
that does not advance a Highlight.

---

## `facts.json` — the file that stops the next wrong claim

Every product fact this pack's copy depends on, in one place, each with the file
on the app's **`origin/main`** it came from and the date it was checked. The
store frames are **derived** from it, so a store's status is stated once.

> **Copy describes `origin/main` only.** Not a development branch, not a feature
> flagged off, not anything that has not shipped in an official APK.

That rule has a body attached to it. `04-community` shipped a frame ticking
**both** Costco and Best Buy as live, under the hook *"TWO DOWN"*, because the
facts were read out of a working tree that happened to be sitting on
`development`. On `origin/main`:

```js
const STORE_PARSERS     = { costco: parseCostcoReceipt };
const LAB_STORE_PARSERS = { bestbuy: parseBestBuyReceipt };
```

In a store build the lab lane behaves as if the parser were not there. One live
store, not two — in the one pack whose entire permission to name a retailer rests
on being accurate about it. Gate 10 now fails the build on that class of error,
and both frames have been corrected.

The same check caught a second one. `04-community` story 17 answered *"do you see
my email?"* with *"receipt data from your inbox never leaves the device."* That
is true of **Gmail**, which ships disabled — `gmailSyncEnabled: false`, Google's
restricted-scope verification not started, the app rendering a "Coming soon"
card. The provider that actually ships is **Outlook**, and `receiptSyncService.js`
says the opposite in as many words: *"Outlook receipts are Microsoft data and keep
syncing normally."* The frame has been rewritten to what Outlook actually does.

---

## What this pack may not print, and why it matters more here

`scenes/claims.js` is inherited from `04-community` unchanged, but two of its
rules are load-bearing in a way they were not before, because **this is the pack
that talks about money**:

- **No currency figure. No percentage.** Not on art, not in a caption. A printed
  price outlives the price it prints, and the evidence is in the app's own repo:
  `README.md` still advertises a subscription at a price it has not cost in
  months, and `pricing.config.js` still carries a break-even string computed
  against that stale number. Both are *text somebody has to remember to update*.
  A rendered PNG is worse, because nobody re-reads one.
- **No claim window in days.** Each retailer sets its own.

So the Unlimited argument is made on **shape** — unlimited scans, no per-drop
charge, one flat fee, twelve months for the price of ten — and the number lives
in the app, where it is current by construction.

The same discipline applies to the referral frames. The app's own invite screen
says *"their first receipt scan unlocks the reward"* and *"credits land
instantly"*, and **both strings are wrong**: `referralsRepo.js` defers the bonus
until the friend's first *purchase*. The frames say what the code does.

---

## Changing it

```bash
node sm-content/brand/verify-brand.js                       # primitives match their fixtures
node sm-content/05-highlights/scenes/build-strings.js       # copy + facts -> strings.json
node sm-content/05-highlights/scenes/build-schedule.js      # trays -> schedule.json
node sm-content/05-highlights/scenes/render.js              # 60 assets
node sm-content/05-highlights/scenes/verify.js              # eleven gates - must exit 0
node scripts/check-copy.js --pack=05-highlights             # claims: art + captions
node scripts/publish-due.js --pack=05-highlights --print    # the run as an agenda
```

`render.js --only=covers`, `--only=frames --tray=plans --lang=fr`, `--svg` narrow
the run and dump the SVG beside each PNG for debugging.

**Never edit a PNG, and never hand-edit `strings.json` or `schedule.json`** —
both are generated, and the store frames in particular are derived from
`facts.json`.

### The eleven gates

| Gate | What it actually checks |
| --- | --- |
| 1 Dimensions | Every declared asset exists at exactly its canvas size |
| 2 Safe zones | Each scene re-rendered with field, paper and torn edges suppressed, so content is exactly the non-transparent pixels — then asserted clear of IG's header, caption bar and action rail |
| 3 Sticker band | A frame declaring a sticker leaves `y 1210–1510` empty, **and** does not also carry fineprint |
| 4 Fonts | Each family rendered and compared against a deliberately nonexistent family; if they match, it did not resolve |
| 5 Copy | No figure, no percentage, no window in days, no promise; EN/FR parity of line counts |
| 6 Disclaimer | Structural: a frame naming a retailer renders fineprint, and no frame carries one it does not need |
| 7 Cover circle | Every cover's icon ink is inside the 640 px safe circle, and there is enough of it to read at 161 px |
| **8 Cover parity** | Every icon fills 86 % ± 2 of the icon box — *a floor cannot see a spread* |
| **9 Watermark** | The mark is rendered with and without, and the luminance difference must land in `WATERMARK.band` |
| **10 Facts** | No frame calls a store live that `facts.json` does not |
| **11 Tray** | Every cover has frames behind it, here or via `filledFrom` |

---

## Three defects these caught, and what they teach

**A floor cannot see a spread.** The cover set this replaces passed its only
cover gate — a minimum on total ink — while its icons ranged from 56 % to 91 % of
the icon box and from 10 248 px to 33 451 px of ink. At 1080 px nobody could see
it. At the 161 px the tray renders, one cover was a squiggle in a big disc and
another filled its circle. *A gate that checks a minimum will never tell you your
set is uneven.* The fix was to stop declaring a size and start measuring one.

**An alpha is not a strength.** The same mark was drawn at `opacity 0.09` on
story frames and at full opacity on feed frames, in two packs, by two authors who
both wrote *faint* in the comment above it. Measured: a luminance delta of 19
against the field, and about 139 against paper. One was invisible on a phone in
daylight; the other was louder than the print it sat under. `0.09` over
near-black and `1.0` over pale paper are not two settings of one dial. The spec
is now a **contrast**, and the alpha is solved from it per ground.

**A palette is a shared budget, and the fix has a rung.** `04-community` learned
that adding a colour in one place can remove one somewhere else — its brick leaf
starved the brand emerald at 128 colours and the lockup rendered grey. Its guard
fell straight from 128 to truecolour, which was correct and cost about 900 kB a
frame. Redrawing the maple leaf made five more frames crowded, and the honest fix
turned out to be a **256-colour rung in between**: the problem was never that the
art could not be palettised, only that four ramps do not fit in 128 entries.
Same correctness, a third of the bytes.
