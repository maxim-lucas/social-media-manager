# The community pack — what it is and how to change it

Built 2026-09-07, corrected 2026-09-09. **77 assets**: 14 feed posts × 2
languages, 16 story frames × 2 languages, 6 unscheduled reserve posts × 2
languages, 3 bilingual furniture frames, 2 carousel dividers. Plus six Reel
scripts.

The eight Highlight covers moved to [`../05-highlights/`](../05-highlights/),
which owns the tray end to end — see [`HIGHLIGHTS.md`](HIGHLIGHTS.md).
Rendered deterministically from SVG scenes — a copy change is a re-render, not a
rebuild.

This is the fourth pack in `sm-content/`, and the first one that **asks for
something**.

| Pack | Job | Lifespan |
| --- | --- | --- |
| `teaser/` | Withholds. Says nothing, names nothing. | The eleven days before launch |
| `../{reels,carousels,statics,stories}` | Explains the launch. | Launch week |
| `evergreen/` | Describes the mechanic, store-agnostically. | Rotates forever |
| **`04-community/`** | **Recruits. Asks people to join, contribute and stay.** | **One run, then retire the register** |

---

## What it says

Six waves, numbered in the order they go out, each in its own folder:

| Folder | The argument |
| --- | --- |
| `00-language-notice/` | French is not an afterthought here. |
| `01-together/` | Nobody beats inflation alone — but the part we *can* fix, we fix by being several. |
| `02-made-in-canada/` | Built here, run from here, answered from here. Choosing it costs nothing extra. |
| `03-stores-growing/` | Costco was the start, not the point. The list only grows, and it grows here first. |
| `04-crowd-power/` | One receipt is a story; a thousand is data. More of us means fewer people find out too late. |
| `05-earn-credits/` | Helping the list pays — and it pays on *confirmation*, not on submission. |
| `07-highlight-frames/` | The eleven frames that live **inside** the Highlights: Tips, Feedback, Support, FAQ. |
| `08-reserve/` | Six more posts, rendered and **unscheduled** — swap-in stock from [`HOOKS.md`](HOOKS.md). |

The covers are no longer here. A tray is furniture and this pack is a dated run,
so they moved to `../05-highlights/`. Read [`HIGHLIGHTS.md`](HIGHLIGHTS.md).

`08-reserve/` is filed by **id** (`r1`…`r6`), never by `seq`, and gate 9 does not
see it. A post that is not in the running order must not claim a place in it —
the numbering is only worth checking if it only ever describes things that are
actually going out. Every other gate applies to reserve posts unchanged: they are
unscheduled, not unfinished, and the day one is swapped into the run is the worst
possible day to find out it clips a margin.

`07-highlight-frames/` **is** posted — a Highlight can only hold a story that
went out — but it is not part of the argument. It is furniture: the eleven
frames that make four of the eight trays worth opening. Without it the covers
are labels on empty drawers, which is the most common way a Highlight tray dies.
They go out in a four-day burst after the run ends, grouped by tray, so each one
can be added to its Highlight the same day it is live.

---

## The publish order is in the filename

```
03-stores-growing/priceback-community-09-post-en.png
^^ wave, in publish order    ^^ global running order   ^^ what it is
```

Both numbers answer *what goes out next* without opening a schedule. The wave
folder answers it at the level you plan a week at; the `seq` answers it at the
level you post an evening at.

`schedule.json` still owns the **dates**. `strings.json` owns the **order**, and
the order survives the dates being moved — which they will be.

`verify.js` gate 9 enforces that this is true: `seq` must be a gap-free 01…15
across the notice and the posts, no duplicates, and the wave index must never go
backwards as `seq` advances. A folder numbering nobody checks is a decoration,
and the first time it lies is the first time the wrong thing goes out.

---

## The one structural idea: the bilingual carousel

**Every feed post here is three slides — English, a divider, French.**

The evergreen pack alternates instead: five English posts and four French across
a fortnight. That is right for a rotation nobody reads end to end. It is wrong
for a launch, because a French speaker who arrives on an English day sees an
English account and is gone two days before the French day.

A carousel puts the translation **one swipe away instead of two days away**, and
the divider slide is what tells them it is there. `00-language-notice/` holds the
divider (`LA SUITE EN FRANÇAIS →`) and its mirror for a French-first carousel.

Three consequences, all deliberate:

1. **The notice frames are bilingual on the face and lead in French.** The frame
   whose whole job is to announce that French is coming cannot itself be in one
   language. The French line is set full weight; the English sits under it,
   dimmed to 0.48 — same size, because dimming is a reading-order signal and
   shrinking would be a status one.
2. **The publisher appends BOTH disclaimers to a `bi` slot.** A French reader who
   swiped to the French half and found only an English disclaimer has, for the
   purposes of LPC s.219, not been given one.
3. **Carousels are not automated.** The Graph API can do them — N child
   containers, then a `CAROUSEL` parent — but `scripts/publish-due.js` does not
   implement that flow, and a slot marked `automate: true` that silently never
   posts is worse than one the operator knows is theirs. `--print` lists them as
   the day's work.

---

## What this pack is allowed to say that evergreen is not

**It names stores.** That is the entire content of wave 03 and it is the pack's
follow ask. The evergreen pack bans retailer names outright, because its design
constraint is to survive the store list growing; this pack is *about* the store
list growing.

The price of that permission is one rule, and it is structural rather than
textual:

> A frame or caption naming a retailer **must** carry the non-affiliation line,
> **on the art**, in the same language.

`claims.js` `checkDisclaimerPairing()` fails the build otherwise, and it fails in
both directions — a frame carrying fineprint that names nobody is also an error,
because that is how a disclaimer becomes wallpaper.

**It is on the art and not only in the caption because a screenshot separates a
caption from its frame.** `legal/MARKETING_CLAIMS.md` in the app repo names that
exact exposure: *"the slogan gets clipped into a banner / social-media-card /
marketing-email without the fine print — that's the moment the Bureau cares
about."*

A frame with fineprint therefore gets a **shorter paper strip**, so the
disclaimer has clear dark field to sit on. The paper yields; the disclaimer does
not move. See the defect log below for what the first draft looked like.

### Still banned, and why it is worth re-reading

- **No claim window, in days, anywhere.** Each retailer sets its own. One number
  printed on a frame is wrong the day a store with different terms goes live —
  and the frame goes on being posted, because nobody re-reads a PNG. A pack whose
  subject is *more stores are coming* is the last pack that may print one store's
  terms.
- **No dollar figure, no percentage.** Every amount is an ink bar. The redaction
  is doing compliance work, not styling.
- **No "100% Canadian."** The Competition Bureau ties a percentage origin claim to
  a costs test. *Made in Canada* is what this product can stand behind without an
  accounting exercise. The percentage ban catches it automatically.
- **No implied partnership.** New in this pack, because naming a retailer makes
  the adjacent misrepresentation newly reachable. "Supported store" is a
  statement about our parser. "Partner" is a statement about them, and it is not
  ours to make.

---

## The look

Identical to the evergreen pack — same deep ink-green field, same lit strip of
thermal paper, same Roboto Black hooks, same mark. This is the same voice on a
different subject, and a fourth look would read as a fourth product.

Three things are new:

- **The leaf.** The one non-emerald element in the whole system, and it appears
  only on the two made-in-Canada frames. It is a *stylised* maple leaf, not the
  flag's: the eleven-point flag leaf loses its lobes below about 80 px, and an
  emblem that reads as the official flag on a commercial frame invites the
  "official endorsement" reading — exactly the impression a made-in-Canada claim
  must not create. Its colour is a muted brick, never `#FF0000`, which vibrates
  next to emerald on an OLED phone.
- **The seam chevrons.** Two, never one or three: one reads as a scroll hint the
  eye skips, three reads as a loading spinner. Direction is authored per frame,
  because a carousel is swiped sideways and a story is read downward — a divider
  pointing down tells the reader to do the one thing that will not reach the
  French.
- **The Highlight cover canvas.** A disc, a rim and an icon, sized backwards from
  161 px. [`HIGHLIGHTS.md`](HIGHLIGHTS.md) has the arithmetic.

---

## Changing it

```bash
node sm-content/04-community/scenes/render.js            # all 84 assets (~2 min)
node sm-content/04-community/scenes/verify.js            # nine gates - must exit 0
node scripts/check-copy.js --pack=04-community           # claims: art, captions, Reels
node scripts/publish-due.js --pack=04-community --check  # the schedule
node scripts/publish-due.js --pack=04-community --print  # the run as an agenda
```

`render.js --only=covers`, `--only=posts --lang=fr`, `--svg` narrow the run and
dump the SVG beside each PNG for debugging.

**Never edit a PNG.** Every asset is byte-identical across runs (seeded
mulberry32, no `Math.random`), so a copy change produces a diff of exactly the
frames that changed.

### The nine gates

| Gate | What it actually checks |
| --- | --- |
| 1 Dimensions | Every declared asset exists at exactly its canvas size |
| 2 Safe zones | Each scene re-rendered with field, paper and torn edges suppressed, so content is exactly the non-transparent pixels — then asserted clear of IG's header, caption bar and action rail |
| 3 Sticker band | A frame declaring a sticker leaves `y 1210–1510` empty — **and does not also carry fineprint**, because a poll would cover the disclaimer |
| 4 Hook zone | Every feed frame has real ink in the top third. A hook below the crop is a hook nobody read |
| 5 Fonts | Each family rendered and compared against a deliberately nonexistent family; if they match, it did not resolve |
| 6 Copy | No window in days, no figure, no percentage, no promise, no implied partnership; EN/FR parity of ids, waves, layouts, accents, sticker plans and row counts |
| 7 Disclaimer | Structural: a frame naming a retailer renders fineprint, the fineprint actually disclaims affiliation, and no frame carries one it does not need |
| 8 Cover circle | Every cover's icon ink is inside the 640 px safe circle, and there is enough of it to read at 161 px |
| 9 Publish order | `seq` is a gap-free permutation, no duplicates, and the wave index never goes backwards |

---

## Five defects these caught, and what they teach

**A palette is a shared budget.** This pack added a fourth colour ramp — the
brick leaf washed over warm paper — and at 128 colours the quantiser spent the
palette on the leaf's pale pinks and starved the brand emerald. The lockup mark
rendered **grey**, on exactly the four frames whose subject is the brand. Nothing
threw. Nothing looked broken. *Adding a colour in one place can remove one
somewhere else, and nothing in the toolchain tells you which line item lost.*

`render.js` now measures the greenest pixel in the unquantised raster and again
in the encoded PNG; if the palette kept less than 45% of it, the frame is
re-encoded truecolour. That threshold is measured, not chosen: across this pack
the numbers are bimodal — healthy frames keep 67–100%, the broken ones kept
9–10%, and nothing sits in between. Set at 0.75 it also converted six healthy
frames and added 7 MB for no visible difference.

**A gate that fires on its own disclaimer.** The pattern banning *"endorsed by"*
fired on the sentence *"Not affiliated with, endorsed by, or connected to any
retailer named here"* — the rule that exists to catch a claim of endorsement
caught the line that disclaims one. The evergreen pack's law is *copy moves, not
the gate*, and it is right in general; this is the exception it implies. The
fineprint is not free-text marketing, it is one fixed legal line already gated
**positively** by `checkDisclaimerPairing`, so it is exempted from those four
patterns and nothing else. The alternative — rewording a legal notice so a lint
rule would pass — is the wrong fix in the most literal form available.

**The frame that most needed its fine print readable was the frame that hid
it.** With a full-height strip, the disclaimer rendered straight across the
receipt's torn edge: white type on pale paper, illegible, on the one frame whose
entire compliance argument is that the disclaimer is in the pixels. Frames with
fineprint now get a shorter strip. The paper yields, not the disclaimer.

**A threshold nobody measured.** Gate 8's "enough ink to read" floor was set at
20000 px by guess and failed the arrow and the bulb — both of which read
perfectly at 161 px when actually looked at. Measured, the eight covers run
10248 px to about 60000 px. The floor is now below the lightest icon that has
been *inspected at tray size*, which is the only evidence that means anything for
a gate about legibility.

**A disclaimer typed by hand into a caption.** The store post's caption carried
its own non-affiliation sentence, written out of caution. `check-copy.js` failed
it — and the right fix was not to exempt the caption, it was to delete the
sentence. The publisher already appends the disclaimer to every caption from one
string, which is the whole reason that rule exists: *a disclaimer someone has to
remember is a disclaimer that eventually is not there.* Typing one by hand looks
like extra care and is actually the first step toward the version that gets
forgotten. The gate caught a discipline drift, not a false positive.

**Step text drawn at a size nobody computed.** The steps were set at a flat
29 px while every other block in the system is fitted to its column — and the
French *"Lumière égale, aucune ombre dessus"*, three words longer than its
English original, ran 52 px under the story's right action rail. Nothing in the
copy was wrong; the layout simply had no idea how wide the words were. Step text
is monospaced, so its width is arithmetic rather than a measurement, which makes
assuming one especially hard to defend. Now computed, in both the post and story
scenes.

**Operator instructions on the art, twice.** Frame 11's sub-line read *"Replace
this frame every time something somebody asked for lands in a release"* — a note
to whoever runs the account, rendered at 34 px onto a public story. It was caught
by the copy gate, but only incidentally: it tripped the `every time` rule, not an
"is this addressed to a reader" rule, because no such rule can exist. The same
draft also put `TRAY: TIPS` in eleven kickers. The lesson is a filing one — a
field that exists for the operator (`note`, `tray`, `stickerCopy`) has to be
*used*, because the moment production metadata is convenient to type into a copy
field, it will be.

**A maple leaf built from straight lines is a star.** Two polygonal versions were
drawn and thrown away. What makes the silhouette read as a leaf is the *curve
between* the points — the lobes bulge out, the notches cut back in, and the eye
reads three big lobes with serrations instead of eleven equal spikes. Every
Bézier in `LEAF_PATH` is load-bearing. Related: at 150 px an *outlined* maple
leaf is not a leaf either, because an outline gives every point the same weight
as the empty space between them. It is filled, large and faint.

---

## Three more, found later and worth the same space

**A marketing claim read from the wrong git branch.** Post 09 and story 04
shipped ticking **both** Costco and Best Buy as live, under the hook *"TWO
DOWN"*. On the app's `origin/main` — the branch that becomes an APK — Best Buy
is in `LAB_STORE_PARSERS`, which in a store build behaves as if the parser were
not there. The facts had been read out of a working tree sitting on
`development`, which was a store ahead. *Nothing about the frame looked wrong,
and nothing in this repo could have known.* What is live is now stated once, in
`../05-highlights/facts.json`, with the branch and the date it was checked, and
that pack's gate 10 fails the build on a frame that disagrees with it.

**A privacy answer about a feature that does not ship.** Story 17 answered *"do
you see my email?"* with *"receipt data from your inbox never leaves the
device."* That is true of **Gmail** — which ships disabled, with Google's
restricted-scope verification not started and the app rendering a "Coming soon"
card. The provider that actually ships is **Outlook**, and the app's own
`receiptSyncService.js` says *"Outlook receipts are Microsoft data and keep
syncing normally."* The most reassuring sentence in the pack was the false one.

**A maple leaf built from curves is still a star.** The first `LEAF_PATH` was
eleven Bézier bumps with no stem, and its comment argued that curvature was what
stopped it reading as a star. The diagnosis was wrong. What separates a leaf from
a star is **three lobes divided by two deep sinuses per side**, with *shallow*
serrations on each lobe — when the notches are as deep as the points are long,
the eye counts eleven equal rays no matter how they are drawn. And a maple leaf
without a petiole reads as an ornament. The replacement is straight segments
between eleven points and twelve notches, plus a stem, drawn and corrected four
times against renders at 420 / 161 / 64 px.

---

## Reels

[`REEL-SCRIPTS.md`](REEL-SCRIPTS.md) — six shot lists, EN and FR, shootable on a
phone using this pack's own PNGs as cuts. Shot lists, not footage.

The reason a carousel pack ships Reel scripts at all: **a carousel is served to
people who already follow the account; a Reel is served to people who do not.**
For a launch whose entire problem is that nobody has heard of this, that is the
whole difference. R1 (the inflation hook) and R2 (the store list, the only follow
ask) are the two to shoot first.

The scripts are gated, not just written. `scripts/check-copy.js` reads what a
Reel **burns on screen** and what its presenter **says out loud** through the
same `claims.js` the art and the captions use, checks that every frame a shot
cuts to still exists under the name it is cited by, and applies the pairing rule
to video: a Reel naming a retailer must cut to a frame that renders the
non-affiliation line, because a caption disclaimer does not survive the
screenshot of a Reel. R2 is the one that needs it, and shot 1 carries it.

Reels can never be automated in any pack — trending audio is picked inside
Instagram at post time, which is the same reason stories cannot be.

---

## Open for the operator

- **The run is dated.** `schedule.json` starts Mon 21 Sep 2026, the day after the
  evergreen fortnight ends. Shifting it means editing the dates there and nothing
  else — the order lives in the filenames.
- **Wave 03 names ONE live store.** What is live is stated once, in
  `../05-highlights/facts.json`, read off the app's **origin/main** — the branch
  that becomes an APK. Do not read it from a working tree. When a store ships,
  update that file, re-render, and check post 09, story 04 and reserve `r4`.
- **Highlights are phone work.** They cannot be created from desktop web or the
  Graph API. Ten minutes, once. `HIGHLIGHTS.md` step by step.
- **This register expires.** A shared-predicament hook borrows its energy from
  the predicament; an account still saying *these are hard times* in month
  fourteen sounds like it is enjoying them. When the follow count stops moving on
  it, fall back to the evergreen mechanics and keep `HOOKS.md` for the next time
  the moment calls for it.
