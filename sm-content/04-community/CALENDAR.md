# The run — 20 days, 15 feed posts, 11 story frames

`schedule.json` is the source of truth for **what and when**. This file is the
reasoning, so the schedule does not have to carry it in comments.

```bash
node scripts/publish-due.js --pack=04-community --print   # the run as an agenda
node scripts/publish-due.js --pack=04-community --check   # validate every slot
```

**Mon 21 Sep → Mon 19 Oct 2026.** Starts the day after the evergreen fortnight
ends, so the two packs never compete for the same evening.

---

## The shape

| Day | Wave | Goes out |
| --- | --- | --- |
| Mon 21 Sep | 00 | Language notice — story at noon, feed post at 18:30 |
| Wed 23 Sep | 01 | **Nobody beats inflation alone** — the launch hook |
| Thu 24 Sep | 01 | Poll story, EN then FR |
| Fri 25 Sep | 01 | We can't fix the prices. We can share them. |
| Sun 27 Sep | 01 | If one of us finds it, all of us save. |
| Tue 29 Sep | 01 | What went up the most in your cart? *(comments)* |
| Thu 1 Oct | 02 | Made here. For prices paid here. |
| Fri 2 Oct | 02 | Made-here story, EN then FR → **About** Highlight |
| Sat 3 Oct | 02 | Supporting this costs you nothing extra. |
| Mon 5 Oct | 02 | No call centre. You are writing to the builder. |
| Wed 7 Oct | 03 | **Costco was the start. Not the point.** *(follow)* |
| Thu 8 Oct | 03 | Store-list story, EN then FR → **Stores** Highlight |
| Fri 9 Oct | 03 | Which store should we read next? *(comments)* |
| Sun 11 Oct | 03 | A store is not a checkbox. It is a language. |
| Tue 13 Oct | 04 | One receipt is a story. A thousand is data. |
| Wed 14 Oct | 04 | Question story, EN then FR → **FAQ** Highlight |
| Thu 15 Oct | 04 | Point your camera at a shelf tag. |
| Sat 17 Oct | 05 | Helping the list puts credits in your account. |
| Sun 18 Oct | 05 | Three-step story, EN then FR → **How it works** Highlight |
| Mon 19 Oct | 05 | Credits come when the price is confirmed. *(follow)* |

Feed at **18:30** America/Toronto, stories at **noon**. One feed post a day,
never two — `--check` fails a day with two, because a second post on the same day
does not double the reach, it halves the first one's.

---

## Why the order is this order

**The notice goes first, before there is anything to be bilingual about.** It is
a promise made before it can be tested, which is the only time a promise like
that is worth anything.

**Wave 01 is four posts, and it is the longest wave.** It carries the hook that
has to work — *nobody beats inflation alone* — and a hook that lands needs
somewhere to go next. Waves 02 through 05 are the somewhere.

**Made-in-Canada comes second, not first.** Reversed, the account opens by asking
for support from people who have not been given a reason yet. Wave 01 gives the
reason; wave 02 asks.

**Stores is the follow ask, and it is the only honest one in the pack.** *"Follow
us"* is not a hook. What converts a viewer into a follower is a stated
recurrence with a payoff they have to be present for, and this account has
exactly one: **new stores get announced here first.** That is why the follow ask
lands on post 09 and not on post 02.

**Credits go last** because the answer to *why should I contribute* is only
interesting to someone who already believes the thing works. Asked in week one it
reads as a chore; asked in week four it reads as a discount.

Three follow asks across twenty days. `--check` fails at more — past two or three
the ask stops meaning anything.

---

## Carousels: what the operator actually does

**Every feed slot is manual.** `publish-due.js` will not automate a carousel: the
Graph API can do them (N child containers, then a `CAROUSEL` parent) but this
script does not implement that flow, and a slot marked `automate: true` that
silently never posts is worse than one you know is yours.

For each carousel slot, `--print` names the slides. In the Instagram app:

1. New post → **select multiple** → pick the three files **in the order
   `assets` lists them**: English frame, divider, French frame.
2. Do not let Instagram re-crop. All three are 1080 × 1350; choose the 4:5 frame,
   not the square.
3. Paste the caption from `schedule.json`, then append the **two disclaimers**
   and the hashtags. `buildCaption()` assembles exactly that string — run
   `--print` and copy, rather than retyping, because a disclaimer someone has to
   remember is a disclaimer that eventually is not there.
4. Post.

If carousel publishing is ever automated, the change belongs in
`scripts/publish-due.js` beside the existing two-call flow, and
`src/lib/metaPublish.ts` has to change with it — the file says so at the top, and
it means it.

---

## Stories

Stories are **never** automated, in any pack. The Graph API can publish story
media but cannot attach a poll, quiz, question, slider or link sticker — and on
these frames the sticker *is* the content; the art deliberately leaves an empty
band at `y 1210–1510` for it. An automated story would post a frame with a hole
in it.

Each story runs **English at 12:00, French at 12:05**, back to back, so the
sequence reads in the same order as the carousels and the account has one rule
instead of two.

Five of the eleven story frames are also **Highlight material** — the schedule
notes say which tray each belongs in. Add them the same day, while the story is
still live; a Highlight assembled from expired stories is an archaeology
exercise.

---

## When this run ends

Do not extend it. The shared-predicament register borrows its energy from the
predicament, and an account still saying *these are hard times* three months
later sounds like it is enjoying them.

Hand back to `evergreen/`, which is built to rotate indefinitely, and keep
[`HOOKS.md`](HOOKS.md) — it has forty more hooks in this register, four of them
marked as the next ones to render, for the next time the moment calls for it.
