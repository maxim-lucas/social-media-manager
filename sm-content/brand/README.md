# `brand/` — the reusable graphics, in one place

Everything here is imported by the packs rather than copied into them. Nothing
here renders a frame; these are the parts a frame is assembled from.

```bash
node sm-content/brand/verify-brand.js            # must pass before any pack renders
node sm-content/brand/verify-brand.js --update   # re-bless after a deliberate change
```

| File | What |
| --- | --- |
| [`mark.js`](mark.js) | the PriceBack mark — `GLYPH_PATHS`, `glyph()`, **`watermark()`**, the contrast spec |
| [`leaf.js`](leaf.js) | the stylised maple leaf |
| [`palette.js`](palette.js) | `C`, `FADE`, and `luminance()` |
| [`type.js`](type.js) | the three families and the `TYPE` ramp |
| [`ig.js`](ig.js) | Instagram's geometry — canvases, safe zones, the cover crop chain, the sticker band |
| [`icons.js`](icons.js) | the Highlight-cover icon set, and the measurement that keeps it even |
| [`fixtures/`](fixtures) | one rendered PNG per primitive, plus `manifest.json` |
| [`verify-brand.js`](verify-brand.js) | renders every primitive and diffs it against its fixture |

---

## The rule for what belongs here

> **A fact, not a choice.**

The mark is what the product looks like. The leaf is one drawing, and a second
one would be a second product. Instagram's crop chain is a fact about Instagram.
The palette and the type ramp are the brand. A frame that gets any of these
wrong is wrong, no matter which pack it came from — so they live once.

**Composition stays in the pack.** Which strip, at what angle, with what torn
edge; where the hook sits; how a scene is laid out. The four packs deliberately
do not look alike — the teaser withholds on warm thermal paper, evergreen
describes on a deep ink-green field, community recruits, `05-highlights`
explains — and that difference is the whole reason there are four of them.
Sharing a palette does not flatten it. Sharing a layout would.

If you are about to add something here, the test is: *would a pack that
disagreed with this be expressing a different style, or would it just be wrong?*
Only the second belongs.

---

## Why there is a gate on it

Every pack's `surface.js` used to say this, and it was right:

> Self-contained on purpose. It would be a two-line change to import the teaser
> pack's `paper.js` instead, and then a copy tweak in the teaser would silently
> re-render this pack. Each pack owns its own surface.

Sharing takes that property away. One edit to `mark.js` now reaches every pack
that imports it. `verify-brand.js` gives it back: a changed primitive fails
**before** any pack renders, and the only way past is `--update`, which rewrites
the fixture PNGs as a diff somebody has to look at.

The re-render is no longer prevented. It is made **deliberate and visible**,
which is what the duplication was buying and the only part of it worth keeping.

So the loop for changing a shared primitive is:

1. Edit it.
2. `verify-brand.js` fails. Good — that is the gate working.
3. `--update`, then look at the PNG diff. That is the review.
4. Re-render every pack that imports it, and run each pack's `verify.js`.
5. Commit the primitive, the fixtures and the re-rendered assets **together**.
   Splitting them across commits is how a fixture ends up describing art that
   is not in the tree.

---

## The watermark, which is the reason this directory exists

The mark appeared on frames in two forms, and measuring them is what started
all of this:

| Where | How it was written | What it measured |
| --- | --- | --- |
| story frames | `opacity="0.09"`, emerald glow | **ΔL ≈ 19** over the field — invisible on a phone in daylight |
| feed frames | full opacity, deep emerald on paper | **ΔL ≈ 139** — louder than the print it sits under |

Neither author was careless. Both wrote an **alpha**, and an alpha is not a
strength: `0.09` over near-black and `1.0` over pale paper are not two settings
of one dial, they are two different dials.

So the spec is a contrast, and the alpha is solved from it:

```
deltaL = alpha × |luminance(mark) − luminance(ground)|
```

`WATERMARK.deltaL = 34` now means the same thing on every ground — it solves to
**0.218** on the field and **0.245** on paper — and each pack's `verify.js`
asserts the *rendered* result lands in `WATERMARK.band`. A watermark that
disappears fails the gate, and so does one that shouts.

---

## Keeping the mark in sync with the app

`GLYPH_PATHS` is ported 1:1 from the app's `src/components/BrandMark.js`
(viewBox `0 0 48 48`). There is no build step between an Expo app and an SVG
renderer, so **it is kept in sync by hand.** If the app's glyph changes, change
it here — this is now the only copy in this repo, which was the point.

---

## What is deliberately *not* here

- **Fonts.** Roboto, Roboto Black and Roboto Mono are resolved through the
  system font list, not from this repo. That is also why CI does not re-render:
  a runner's font versions will not match the build machine's byte for byte.
- **Scene layout, strip geometry, hook fitting.** Pack-owned, see above.
- **Copy.** Lives in each pack's `strings.json`, gated by its `claims.js`.
- **Anything not used to render a frame.** A file here that no renderer imports
  is a file that will drift out of date without anything noticing.
