# Getting PriceBack seen on Instagram

**The working playbook · Canada · EN + FR**

Supersedes the August 2026 launch playbook, archived verbatim at
[`archive/instagram-launch-playbook-2026-08.html`](archive/instagram-launch-playbook-2026-08.html)
(originally claude.ai artifact `e9375fa1-99a1-4f30-9165-d9d0d93ae90f`). That
document is still worth reading for its ranking-signal and profile-setup
detail — this one carries the same guidance forward and fixes the thing that
dated it.

---

## What changed, and why

The launch playbook was written around **one retailer and one claim window**.
Both were correct in August 2026 and both are now moving targets: a second store
is live, more are queued, and every retailer sets its own terms.

An asset or a caption that names a store or prints a number of days is an asset
that becomes *wrong* the day a store with different terms goes live — and it
goes on being posted anyway, because nobody re-reads a PNG. That is not a
hypothetical failure; it is the normal way marketing collateral rots.

So everything published from here talks about the **mechanic**, not the store:

> A price you already paid is not necessarily final. If it drops afterwards,
> many Canadian retailers will adjust it — but only if you ask, only if you can
> prove what you paid, and only if you find out in time.

Nothing in that sentence expires when store number three lands.

**The store list is not hidden — it is the recurring content.** Post 07 of the
evergreen pack shows the list as *categories* with two ticked, and that frame is
simultaneously the growth story and the follow ask: *your store is on the list,
and new ones get announced here first.* A growing store list is the single best
reason this account has to exist as a thing people follow rather than a thing
people see once.

This is enforced, not remembered: `sm-content/evergreen/scenes/claims.js` fails
the build on a retailer name, a window in days, a currency figure, a percentage,
or a promise — in either language, in the art and in the captions.

---

## 1 · What reach is actually made of

In rough order of weight for a Reel:

1. **Sends.** One person forwarding your post in a DM. Instagram reads it as
   "this was worth interrupting a friend for." Design posts around this.
2. **Watch time and completion.** A 59-second Reel holding 30 seconds beats a
   15-second one holding 6.
3. **Saves.** Strong on carousels specifically — a how-to people intend to come
   back to.
4. **Likes and comments.** Still counted, weakest of the four. A comment you
   reply to is worth more than one you don't.
5. **Originality.** Content that looks recycled from another platform gets
   down-ranked. Never upload an export carrying another platform's watermark.

**Hashtags are not on that list.** Mosseri's own line is that they "work, but
they've never been a good way to actually increase your reach" — they help "ever
so slightly on the margins." Use three to five because they classify the post
and feed search. Do not build a strategy on them.

---

## 2 · The profile, before anything is posted

The profile is the conversion step. Someone watches a Reel, taps your name, and
decides in about three seconds. That page has to answer one question: *what does
this do for me, and is it free?*

- **Professional → Business**, not Creator. Business gives the contact button,
  Meta Business Suite scheduling, eligibility to promote the same posts later,
  and — the part that matters here — **content publishing through the Graph
  API**, which is what `scripts/publish-due.js` needs.
- **Public.** A private account is invisible to recommendations.
- Settings → **"Similar account suggestions" ON.** Free distribution, off by
  default for some accounts.
- Sharing → allow **Remixes** and **sharing to Stories**. Every barrier left up
  is a send you don't get.
- **Auto-generated captions** on for Reels.

**The Name field is what gets searched.** In-app search indexes the username and
the Name field far more strongly than the bio. 30 characters, and most brands
waste it repeating the handle.

```
PriceBack · Price Drop Refunds
```
```
PriceBack · Remboursement prix
```

**Bio** — 150 characters. Lead with the problem in the customer's words. Note
these no longer name a retailer or a window:

```
Bought something, then the price dropped? Claim the difference.
Scan the receipt → we watch the price → you claim it back.
Free · Canada
```
```
Le prix baisse après votre achat ? Réclamez la différence.
Scannez le reçu → on suit le prix → vous réclamez l'écart.
Gratuit · Canada
```

**Links** — Instagram allows five. Use three, labelled plainly: *Download for
iPhone*, *Download for Android*, *How it works*. This beats a link-in-bio
service, which adds a tap and loses people. Category: **Shopping & Retail**.

**Ten Story highlights**, built and documented in
[`sm-content/05-highlights/HIGHLIGHTS.md`](../sm-content/05-highlights/HIGHLIGHTS.md):

`How it works` · `Stores` · `Earn` · `Plans` · `The app` · `Tips` · `FAQ` ·
`Support` · `About` · `Feedback`

The `Stores` highlight is the one to keep current — it is where someone checks
whether their store is supported, and it is the only place the store list may be
named, because a highlight can be edited the day the list changes. It runs **one
store per frame**, and what is live is stated once, in
[`facts.json`](../sm-content/05-highlights/facts.json), read off the app's
`origin/main`.

**Every highlight is bilingual end to end** — intro, English, an FR card, French
— rather than there being a separate French one. A French-only drawer duplicates
the back half of every other tray and leaves all of them still opening in
English. The intro frame draws a replica of Instagram's own progress bar with the
French half lit, so a francophone can see where the French starts instead of
being told to keep tapping.

> Highlights **cannot** be created from desktop web or through the Graph API.
> Instagram mobile app only: post the frame as a Story, then highlight it. An
> archived story can be added to any number of Highlights, which is why the two
> bilingual signpost frames are posted once and reused across all ten.

---

## 3 · What to post

The current pack is [`sm-content/evergreen/`](../sm-content/evergreen/) — 9 feed
posts and 10 story frames, EN + FR, plus two Reel scripts.

- [`CALENDAR.md`](../sm-content/evergreen/CALENDAR.md) — the 14-day run, day by
  day, and the reasoning
- [`HOOK-BANK.md`](../sm-content/evergreen/HOOK-BANK.md) — the six hook
  mechanisms, and the doctrine on converting a viewer into a follower
- [`EVERGREEN-NOTES.md`](../sm-content/evergreen/EVERGREEN-NOTES.md) — the pack,
  its gates, and the compliance rules baked into it
- [`AUTOMATION.md`](../sm-content/evergreen/AUTOMATION.md) — the scheduled
  publisher

**Cadence that is actually keepable:** feed post every other day in week one,
tightening to near-daily in week two; stories most days; never two big posts on
consecutive days early on, because you want to be present in the comments for
the full day after each one. Weekday early evening Eastern (18:00–19:00) until
Insights has enough followers to tell you otherwise — **consistency of time
matters more than the specific hour.**

**Ratios:** 4:5 (1080×1350) for the feed — the tallest ratio it allows, so it
occupies the most screen. 9:16 for stories and Reels.

---

## 4 · The follow, specifically

Reach and followers are different problems and the second is the harder one. A
post can be brilliant at stopping the scroll and convert nobody.

"Follow us" is not a hook. What converts is a **stated recurrence with a payoff
the viewer has to be present for**:

> New stores get announced here first. Follow, and you'll find out the day yours
> goes live.

Three rules, from [`HOOK-BANK.md`](../sm-content/evergreen/HOOK-BANK.md):

1. **The payoff must arrive.** Promise the comment count, post the comment
   count. One unkept loop costs more than the follows it bought.
2. **The payoff must be unavailable elsewhere.** "Follow for tips" fails; tips
   are everywhere. "Follow to know the day your store goes live" works because
   that fact exists in exactly one place.
3. **Ask rarely.** Twice in fourteen days. An ask on every post is background
   noise.

---

## 5 · Bilingual, and Quebec specifically

**One account, not two.** Splitting a new account halves the follower count, the
engagement rate and the cadence on both — and engagement rate is what the
recommendation system reads. Post English and French as separate posts on the
same account, each with a single-language caption. Never stack both languages in
one caption; it doubles the length and halves the read rate.

Quebec engagement with French content runs dramatically higher than with
English, and the Charter of the French Language sets expectations for commercial
communication in the province. Genuinely localised French — down to `2 799,99 $`
rather than `$2,799.99` — is doing real work. Worth having a Quebec-based reader
check the copy before any spend.

Split into two accounts once one language reliably outperforms the other and
there is volume enough to feed both. A good problem, not a launch problem.

---

## 6 · Reading the numbers

Four metrics; ignore the rest.

- **Sends per view** — the one to optimise. Compare each post to *your own*
  median, not to a published benchmark.
- **Views from non-followers** — the recommendation system deciding whether to
  push you. 80% followers means it didn't pick the post up.
- **Average watch time** — where people leave. If there's a cliff it is almost
  always in the first five seconds.
- **Profile visits → link taps** — the actual funnel. Views without taps is a
  profile problem, not a video problem.

Ignore follower count for the first month. It is the slowest-moving number on
the page and it will make you change things that were working.

**Trial Reels** — shown to non-followers only for 72 hours before you decide
whether to publish to followers — are the best testing tool Instagram has, and
need a public professional account with **1,000+ followers**. Put it on the list
for when you cross that line, then use it to test hooks against an identical
body.

---

## 7 · Two things to get right before spending money

**Naming a retailer.** Describing what the app does by naming a store is
ordinary descriptive use, but it drags in the whole non-affiliation question and
it dates the asset. The evergreen pack therefore names none, anywhere. Where a
store must be named — the `Stores` highlight, a launch announcement, a support
reply — no logo, no styling that reads as official, no language suggesting a
partnership, and the not-affiliated line stays. **Paid Meta ads are reviewed
against a stricter bar than organic posts;** have someone qualified look at ad
creative before you spend.

**Don't promise the refund.** Every policy has conditions, and they are the
retailer's, not ours. Captions say **claim**, never **get**.
`legal/MARKETING_CLAIMS.md` in the app repo names the failure mode precisely: a
claim clipped into a social card without its paired fine print. That is why the
disclaimer is appended by the publisher from one string rather than typed per
post, and why `scripts/check-copy.js` fails CI if it loses the non-affiliation
line or the success-fee pairing.

One screenshot of an over-promise is worse than a hundred posts of accurate ones.

---

*Ranking-signal guidance current as of September 2026. Instagram changes this
often enough that it is worth re-checking each quarter.*
