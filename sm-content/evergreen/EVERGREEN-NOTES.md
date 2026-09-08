# The evergreen pack — what it is and how to change it

Built 2026-09-07. 9 feed posts + 10 story frames, English and Quebec French,
**38 assets**. Rendered deterministically from SVG scenes: a copy change is a
re-render, not a rebuild.

This is the third pack in `sm-content/`, and the first one built to run
indefinitely rather than for a moment.

| Pack | Job | Lifespan |
| --- | --- | --- |
| `teaser/` | Withholds. Says nothing, names nothing. | The eleven days before launch |
| `../{reels,carousels,statics,stories}` | Explains the launch. | Launch week |
| **`evergreen/`** | **Describes the mechanic, store-agnostically.** | **Rotates forever** |

---

## The idea

The launch pack was built around one retailer and one claim window. Both of
those are now moving targets: the store list grows, and every retailer sets its
own terms. An asset that prints a specific number of days is an asset that
becomes *wrong* the day a store with different terms goes live — and it will go
on being posted anyway, because nobody re-reads a PNG.

So this pack says neither. It talks about the **mechanic**:

> A price you already paid is not necessarily final. If it drops afterwards,
> many Canadian retailers will adjust it — but only if you ask, only if you can
> prove what you paid, and only if you find out in time.

Nothing in that sentence expires when store number three lands. That is the
whole design constraint, and `scenes/claims.js` enforces it mechanically: no
retailer name, no window in days, no figure, in either language, in the art or
in the captions.

The store list still appears — as **categories**, on post 07: warehouse club,
electronics chain, home improvement, sports retail, pharmacy, grocery, two of
them ticked. That frame is the pack's growth engine and its follow ask in one:
*your store is on the list, and new ones get announced here first.*

---

## The look, and why it is not the other two packs'

|  | Launch pack | Teaser | **Evergreen** |
| --- | --- | --- | --- |
| Ground | Near-black, emerald glow | Warm thermal paper | Deep ink-green field |
| The receipt | An illustration | The whole frame | **A lit strip laid on the field** |
| Type | Huge grotesque | Roboto Mono throughout | Roboto Black + Roboto Mono |
| Green | Everywhere | One element per frame, at most | One element per frame, at most |
| Signs its work | Yes | Never | **Yes — mark, wordmark, handle on every frame** |

It borrows the receipt from the teaser and the depth from the launch pack, and
resolves them into a physical object: **a torn strip of thermal paper,
photographed on a dark surface.**

That is not a style choice. At grid size — one ninth of a phone screen — a
bright vertical band on a dark field is the only thing in this product's
vocabulary that stays legible. A full-bleed receipt reads as a grey rectangle.
A strip reads as a receipt.

The mark is the app's real one, ported 1:1 from `src/components/BrandMark.js`
(`GLYPH_PATHS`, on a 0 0 48 48 grid) — a receipt with a torn bottom whose
contents are a falling price line resolving into an arrowhead. It is kept in
sync **by hand**; there is no build step between an Expo app and an SVG
renderer, so if the app's glyph changes, change `surface.js` too.

---

## The hooks

Every post declares a `hookType` in `strings.json` and an `ask` in
`schedule.json`, and the six mechanisms behind them are documented in
[`HOOK-BANK.md`](HOOK-BANK.md) — which is the part of this pack worth keeping
after the nine frames have been spent.

The one-line version: **"follow us" is not a hook.** What converts a viewer into
a follower is a stated recurrence with a payoff they have to be present for, and
this pack has exactly one — *new stores get announced here first.*

---

## Contents

| Asset | Files | Size |
| --- | --- | --- |
| Feed posts | `posts/priceback-evergreen-post-{en,fr}-01..09.png` | 1080×1350 (4:5) |
| Story frames | `stories/priceback-evergreen-story-{en,fr}-01..10.png` | 1080×1920 (9:16) |
| Reel scripts | `reels/REEL-SCRIPTS.md` | shot lists, not footage |

Source in `scenes/`. `strings.json` holds every word in both languages;
`schedule.json` holds every caption and the run.

4:5 is used for the feed because it is the tallest ratio the feed allows, so it
occupies the most screen.

---

## Changing it

```bash
node sm-content/evergreen/scenes/render.js     # all 38 assets (~40s)
node sm-content/evergreen/scenes/verify.js     # the six gates — must exit 0
node scripts/check-copy.js                     # the claim gate: art + captions + Reels
node scripts/publish-due.js --check            # the schedule
```

`render.js --only=posts --lang=fr --svg` narrows the run and dumps the SVG
beside each PNG for debugging.

**Never edit a PNG.** All 38 assets are byte-identical across runs (seeded
mulberry32, no `Math.random`), so a copy change produces a diff of exactly the
frames that changed.

### The gates

| Gate | What it actually checks |
| --- | --- |
| Dimensions | Every asset declared in `strings.json` exists at exactly its canvas size |
| Safe zones | Each scene is re-rendered with the field, paper and torn edges suppressed, so content is exactly the non-transparent pixels — then asserted clear of IG's header, caption bar and right action rail |
| Sticker band | A frame declaring a sticker really does leave `y 1210–1510` empty |
| Hook zone | Every post has real ink in the top third — a hook below the feed crop is a hook nobody read |
| Fonts | Each family is rendered and **compared against a deliberately nonexistent family**; if they match, it did not resolve |
| Copy | `claims.js`: no retailer, no window in days, no figure, no promise; EN/FR parity of ids, grid cells, layouts, accents, sticker plans and row counts; grid cells a permutation of 1–9 |

### Four defects these caught, and what they teach

**A filter that paints its bounding box.** `feTurbulence` generates its own
graphic across the whole filter *region* — for a rotated strip, its bbox, not
its outline. The paper tooth was drawing a visible rectangle around every strip.
The fix is a trailing `feComposite ... in2="SourceAlpha" operator="in"`, which
in turn requires the path to have a fill. It also cut the pack from 25 MB to
8 MB, because the stray noise was defeating palette compression.

**`letter-spacing` is absolute, not an em.** The auto-fit solved for font size
while treating tracking as if it scaled with size. Because the display token's
tracking is *negative*, that mis-solved *upward* and the hook overran the story
frames' action rail by a few pixels. Text fitting is now done against a column
20px narrower than the layout column as well — the fit measures ink, but
`<text>` positions by origin, and the first glyph's side bearing plus the bleed
filter both live in that gap.

**Fontconfig will not give you a face by weight.** On the build machine
`font-family="Roboto"` resolves to a bold face at *every* weight from 400 to
900 — measured, all identical. Every hook was shipping Bold and every sub-line
was shipping bold too, silently, with the tokens declaring 900 and 400. The
faces have to be asked for **by name** (`Roboto Black`), and gate 5 now detects
fallback by rendering a family that cannot exist and comparing.

**A gate can be wrong in the same direction as the bug.** The first version of
gate 5 compared *ink extent* and reported "the Black face is missing" at 552px
vs 555px — on a machine where Black was plainly rendering. Roboto's Black and
Bold have near-identical advance widths; weight lives in the stems, so the
measurement had to be ink **area**. A gate that fails for the wrong reason
teaches you to ignore it.

---

## Compliance — read before changing a word

`Marketing-Plan/01-strategy-overview.md` and the app repo's
`legal/MARKETING_CLAIMS.md` prohibit promising a dollar amount or a guaranteed
refund. Competition Act s.74.01 and Quebec's LPC s.219 both test the **general
impression**, not the literal wording — so hedged fine print does not rescue a
headline that promises.

`MARKETING_CLAIMS.md` names the exact failure mode: *a claim clipped into a
social card without its paired fine print.* This pack answers it three ways:

1. **Every amount on every frame is a black bar.** The redactions are doing
   compliance work, not styling — the pack never prints a figure it would have
   to stand behind. That the bar is also the strongest curiosity device
   available in a static frame is a happy coincidence, not the reason.
2. **No retailer is named anywhere,** so no non-affiliation disclaimer is needed
   on the art and none has to fit.
3. **The captions' fine print is appended by the publisher,** from one string,
   never typed per-post. A disclaimer someone has to remember is a disclaimer
   that eventually is not there.

Every claim in the copy is conditional — *many*, *can*, *if*, *may*. Captions
say **claim**, never **get**. `claims.js` fails the build on `guarantee` /
`garanti`, on "you'll get", on "every time", and on any currency figure or
percentage.

> This is not theoretical. The gate caught `on n'imprime pas un chiffre qu'on ne
> peut pas **garantir**` in a French caption during the build — a *negated* use,
> genuinely harmless, and softened anyway. The rule is that copy moves, not the
> gate. The one time you loosen it to let a harmless case through is the time
> the next case is not harmless.

---

## Open for the operator

- **The run is dated.** `schedule.json` starts Mon 7 Sep 2026. Shifting the
  fortnight means editing the dates there and nothing else.
- **Stickers must be added inside Instagram** to be interactive, which is why
  the art leaves the band empty and why stories are not automated.
- **Both languages of all nine posts are rendered.** This run publishes 5 EN and
  4 FR; the other half is the next cycle, inverted so French gets the follow
  post.
- **Post 07's ticked categories claim two live stores.** That matches the
  bundled store registry as of 2026-09-02. If a third goes live, tick it in
  `strings.json` (both languages) and re-render — the copy gate will stop you
  naming it.
