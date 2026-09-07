# The 14-day evergreen run

**Mon 7 Sep 2026 → Sun 20 Sep 2026 · `@priceback.ca` · America/Toronto**

9 feed posts · 11 stories · 2 Reels · EN + FR

The exact copy for every slot lives in [`schedule.json`](schedule.json), which
is the single source of truth and the file the publisher reads. **This document
is the reasoning, not a second copy of the captions** — if the two ever
disagree, `schedule.json` is right.

```bash
node scripts/publish-due.js --print    # the fortnight as an agenda
node scripts/publish-due.js --check    # validate every slot
```

---

## The shape

| | Week 1 (7–13 Sep) | Week 2 (14–20 Sep) |
| --- | --- | --- |
| Feed posts | 4, every other day | 5, tightening to near-daily |
| Stories | 6 | 5 |
| Reels | 1 (Sun) | 1 (Sun) |
| Doing the work | Problem → mechanic | Proof → expansion → the ask |

Week 1 is spaced on purpose. Replies inside the first 24 hours are the cheapest
engagement anyone ever buys, and an every-other-day cadence leaves a whole day
to be present in the comments of the post before. Week 2 tightens, because by
then there is a body of work and **consistency is itself a ranking input**.

The run is built so that the last post published is the one that lands top-left
of the grid. See [`HOOK-BANK.md § The grid is a hook`](HOOK-BANK.md).

---

## Day by day

| Day | Date | Feed | Story | Hook | Ask |
| --- | --- | --- | --- | --- | --- |
| 1 | Mon 7 | **01** Don't throw that out | 01 · **poll** | impossible instruction | send |
| 2 | Tue 8 | — | 02 | — | — |
| 3 | Wed 9 | **02** The price moved 🇫🇷 | 03 · **quiz** | loss frame | save |
| 4 | Thu 10 | — | *poll result — you make this one* | — | — |
| 5 | Fri 11 | **03** Nobody checks | 04 | personal indictment | comment |
| 6 | Sat 12 | — | 05 · **question** | — | — |
| 7 | Sun 13 | **04** Scan it once 🇫🇷 | — · **Reel A** | effort collapse | save |
| 8 | Mon 14 | — | 06 | — | — |
| 9 | Tue 15 | **05** Nothing comes back on its own | — | reversal | send |
| 10 | Wed 16 | — | 07 · **slider** | — | — |
| 11 | Thu 17 | **06** One line just got cheaper 🇫🇷 | 08 | curiosity gap | save |
| 12 | Fri 18 | **07** Your store is on the list | 09 · **link** | open loop | **follow** |
| 13 | Sat 19 | **08** Which one next? 🇫🇷 | — | participation | comment |
| 14 | Sun 20 | **09** Keep the receipt | 10 · **reminder** · **Reel B** | recurrence | follow |

Feed posts at **18:30**, stories at **12:00**. Weekday early evening Eastern is
the reasonable default for a Canadian consumer app; **consistency of time
matters more than the specific hour**, and once Insights has a few hundred
followers to work with, move to whatever it says.

### Four days that are load-bearing

**Day 4 — the poll result.** No asset ships for this, deliberately. Screenshot
day 1's poll and post the real split: *"X% of you bin them."* That number is the
single most useful thing this fortnight produces — it tells you what share of
the audience already knows price adjustments exist, which is what everything
after should be aimed at.

**Day 12 — the follow post.** The only post that spends a whole caption earning
a follow, and it earns it honestly: the payoff (a store going live) is real,
dated, and available nowhere else. Do not dilute it by asking for follows on
days 1–11.

**Day 13 — the ballot.** Saturday on purpose; comment rate is highest at
weekends and this post is worth nothing without comments. It promises a count.
**Post the count.** An open loop you don't close costs more than the follows it
bought.

**Day 14 — the hero.** Published last so it sits top-left. It is the only frame
that states the entire proposition in one line, because it is the one a stranger
reads first.

---

## Language

The feed **alternates EN and FR**, single-language caption per post — never both
stacked in one caption, which doubles the length and halves the read rate.
Quebec engagement with French content runs dramatically higher than with
English, and the Charter of the French Language sets expectations for commercial
communication in the province; genuinely localised French is doing real work
here and is worth having a Quebec-based reader check before any spend.

This run: EN gets posts 01, 03, 05, 07, 09 — FR gets 02, 04, 06, 08.

**Both languages of all nine posts are rendered and committed.** The unused half
is not waste — it is the next cycle. Invert the assignment on the next fortnight
so French gets the follow post, and the pack pays for itself twice.

One account, not two. Splitting a new account halves the follower count, the
engagement rate and the cadence on both, and engagement rate is what the
recommendation system reads. Split when one language reliably outperforms the
other and there is volume enough to feed both — a good problem, not a launch
problem.

---

## Hashtags

Two constants plus two rotated, in the caption rather than the first comment.
The reach difference is nil and in the caption they feed search. Sets are in
`schedule.json → hashtags`; the publisher assembles them.

Hashtags are **not** a reach strategy — Mosseri's own line is that they help
"ever so slightly on the margins." They classify the post. Apply them in ten
seconds and stop thinking about them. Before committing a rotating tag, search
it in-app once: mid-size and local tags beat the biggest ones for a small
account.

---

## The disclaimer is not optional and is not yours to remember

Every published caption gets the fine print appended **by the publisher**, from
one string in `schedule.json`. It is never typed per-post.

`legal/MARKETING_CLAIMS.md` in the app repo names the exact failure this
prevents: a claim clipped into a social card without its paired fine print. The
Competition Act and Quebec's LPC both test the *general impression*, so a
disclaimer that depends on someone remembering it is a disclaimer that
eventually is not there.

`scripts/check-copy.js` fails CI if the disclaimer loses either the
non-affiliation line or the success-fee pairing.

---

## Running it

**Automated:** the 9 feed posts. `scripts/publish-due.js` publishes what is due
via the Graph API, appends the disclaimer, and records each publish so nothing
can go out twice. See [`AUTOMATION.md`](AUTOMATION.md).

**By hand, and this is deliberate:** every story and both Reels.

- A story's **sticker is the content** — the art leaves an empty band for it —
  and the Graph API cannot attach a poll, quiz, question, slider or link. An
  automated story would publish the frame with a hole in it.
- Reels want Instagram's own audio picked at post time; in-app audio helps reach
  more than a voice-over does, and every message in the pack is on screen so the
  film works muted either way.

Daily, five minutes: reply to every comment on yesterday's post. That is the
cheapest ranking input available and no script can do it.

---

## What to read after two weeks

Four numbers, and ignore the rest:

- **Sends per view** — the one to optimise. Compare each post to *your own*
  median, not to a published benchmark.
- **Views from non-followers** — the recommendation system deciding whether to
  push you. 80% followers means it didn't pick the post up; 80% non-followers
  means it did.
- **Follows per profile visit** — the only number that says whether the ask on
  day 12 worked.
- **Profile visits → link taps** — the actual funnel. Reels getting views but
  nobody tapping through is a profile problem, not a video problem.

Ignore follower count for the first month. It is the slowest-moving number on
the page and it will make you change things that were working.

Then: invert the languages, rotate the nine frames, and write the next nine
against whichever hooks in [`HOOK-BANK.md`](HOOK-BANK.md) actually earned sends.
