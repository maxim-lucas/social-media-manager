# The hook bank

The reusable part of this pack. The nine frames in `posts/` will be spent inside
a fortnight; the six mechanisms below are what makes the tenth, and the fiftieth.

---

## First, the thing that is actually being optimised

Instagram's own ranking (Mosseri has been unusually direct about this) weights
**sends** above everything else for a Reel, then watch time, then saves, then
likes and comments. A send is one person interrupting a friend. Nothing else on
the list costs the viewer as much, which is why nothing else is worth as much.

So there are really two different jobs, and conflating them is the most common
way this goes wrong:

| Job | What it needs | What it is measured by |
| --- | --- | --- |
| **Stop the scroll** | A visual or verbal hook in the first 3 seconds / top third | views, watch time |
| **Earn the follow** | A reason to expect *more*, on a schedule | follows per profile visit |

A post can be brilliant at the first and produce zero of the second. "Follow us"
is not a hook — it is a request with nothing on the other side of it. What
converts is a **stated recurrence with a payoff the viewer has to be present
for**: *we add a store at a time, and they get announced here first.*

That single line is why post 07 exists, and it is the only post in the fortnight
that spends its whole caption on the ask.

---

## The six mechanisms

Ranked by what each is *for*, not by how clever it is.

### 1. The impossible instruction — `impossible-instruction`

An order with no reason attached. *Don't throw that out.*

The brain cannot leave an unexplained imperative alone; it either supplies a
reason or goes looking for one. Both outcomes are engagement. The rule is that
the reason must be **withheld in the art and supplied in the caption** — if the
frame explains itself, there is nothing left to open.

Best for: the follow, and the comment. Used by post 01, and by the whole teaser
pack that preceded this one.

**Fails when** the instruction is generic ("save money!"). It has to be an odd,
specific, physical action the viewer recognises themselves doing.

### 2. The loss frame — `loss-frame`

Not "save money" — *you already spent this and it is still yours to ask for.*

People will work considerably harder to recover something they feel they already
own than to gain the identical amount. This is the single most important framing
decision in the whole account, and it is what separates PriceBack from every
coupon app: a coupon is a discount you might get; a price adjustment is **your
own money, sitting with someone else**.

Best for: the send. Used by posts 02 and 05.

**Fails when** it tips into accusation of the retailer. The store is not the
villain — the villain is that nobody checks.

### 3. The personal indictment — `personal-indictment`

Second person, present tense, gently accusatory. *Nobody checks. You didn't
either.*

The trick is to **absolve in the next line**. "That isn't laziness — it's a job
nobody has time for." Accusation alone produces defensiveness; accusation
followed by absolution produces recognition, and recognition is what people
comment on.

Best for: comments. Used by post 03.

### 4. The curiosity gap — `curiosity-gap`

Information visibly withheld. In this pack that is literal: **a black bar where
an amount should be.**

The redaction is doing double duty — it is the strongest static-frame curiosity
device available, *and* it is the compliance mechanism (see
`EVERGREEN-NOTES.md § Compliance`). A frame that shows a receipt with every
figure blacked out cannot over-promise and cannot be scrolled past.

Best for: stopping the scroll. Used by post 06 and every receipt frame.

**Fails when** overused. A feed where every post hides something reads as a feed
with nothing to say.

### 5. The reversal — `reversal`

Set up the expected sentence, then break it. *Nothing comes back on its own.*

Anti-advertising. Saying the unhelpful-sounding true thing first buys the right
to say the helpful thing second, and it reads as honesty rather than as a pitch.

Best for: trust, and sends among people who distrust ads. Used by post 05.

### 6. The open loop with a date — `open-loop` / `participation` / `recurrence`

A promise whose payoff arrives *later*, on this account.

- **Open loop**: "Two stores are live. The rest are queued." → post 07
- **Participation**: "Name one in the comments — we'll post the count." → post 08
- **Recurrence**: "New stores land here first." → post 09

This is the follow mechanism. Not one of the other five will convert a follower
on its own, because none of them implies there will be more. The rules:

1. **The payoff must be real and must actually arrive.** If you promise the
   comment count, post the comment count. One unkept loop costs more than the
   follows it bought.
2. **The payoff must be unavailable elsewhere.** "Follow for tips" fails because
   tips are everywhere. "Follow to know the day your store goes live" works
   because that fact exists in exactly one place.
3. **Ask rarely.** Twice in fourteen days, here. An ask on every post is not an
   ask; it is background noise.

---

## The visual hooks

Words are half of it. At thumbnail size the frame has to work with none.

**The bright strip on a dark field.** The pack's whole visual identity is one
device: a torn piece of thermal paper, lit, on a near-black green ground. It was
chosen for exactly one reason — it is the only thing in this product's
vocabulary still legible at 1/9th of a phone screen. A full-bleed receipt reads
as a grey rectangle in the grid. A strip reads as a receipt.

**The hook lives in the top third, always.** `HOOK_ZONE` in `scenes/tokens.js`,
and `verify.js` gate 4 fails any frame whose hook is below it. The top third is
all the feed shows before a tap, and it is roughly what the grid thumbnail
shows. A hook below the fold is a hook nobody read.

**One green element per frame, maximum.** Emerald is the only saturated colour
in the system, so it is the only thing that can direct the eye — and it can only
do that while it is rare. The frame's green *is* the hook: the circle around the
line that dropped, the falling-price arrow, the `CLAIMABLE` pill, the mark.

**The grid is a hook.** A profile is a landing page, and the nine frames are
composed as a set. Note that Instagram fills the grid newest-first, so the pack
is **authored in reverse**: post 09 is published last and therefore lands
top-left, which is the first thing a visitor reads. `strings.json` carries a
`grid` cell per post and `verify.js` asserts the nine are a permutation of 1–9.

> A grid *jigsaw* — one image sliced across three cells — is the more
> spectacular version of this, and it was deliberately not built. It breaks the
> moment a post is skipped, deleted or reordered, and over fourteen days
> something always slips. Rhythm survives that; a jigsaw does not.

---

## Choosing one

In order:

1. **What is the ask?** send → loss frame or reversal. save → effort-collapse or
   curiosity gap. comment → personal indictment or participation. follow → open
   loop, and only that.
2. **Does the frame explain itself?** If yes, it has no hook. Move the
   explanation into the caption.
3. **Is the hook in the top third and legible at thumbnail size?** Squint at it
   from arm's length. If you cannot read the first line, nothing else matters.
4. **Would you send this to someone?** Not "is it good" — would you personally
   interrupt a friend with it. That is the metric the algorithm is proxying for,
   and it is the only honest self-test.

---

## What this account never does

- Asks for a follow without offering a reason and a date.
- Names a retailer. (`scenes/claims.js` fails the build on it — see
  `EVERGREEN-NOTES.md § Compliance` for why that is more than a style rule.)
- Prints an amount. Every figure is a bar.
- Promises the refund. The policy has conditions and they are the retailer's,
  not ours. Captions say *claim*, never *get*.
- Posts a file carrying another platform's watermark. Originality is a ranking
  input; upload the source file to each platform separately.
