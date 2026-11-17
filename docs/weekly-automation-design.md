# Weekly social automation: design (DRAFT for Maxim's approval, 2026-11-16)

Maxim's brief (2026-11-16): a cloud schedule that, every week after the savings harvest, reads the harvest, builds the
price-drop posts and reels (product photos always), scores and improves them until they reach 9.5/10, and posts them
through the Meta Graph API. Everything automated; anything social media cannot do, Maxim handles by hand.

## 1. Decisions already taken (Maxim, 2026-11-16)

| # | Decision |
|---|---|
| D1 | **Keep today's post format**, but **English = the 8 provinces outside Quebec**, **French = Quebec only**. No more EN + FR copies of the same post. Same split for Business Centre. |
| D2 | **Priority of what goes on a slide:** (1) savings common to every province of the audience, (2) then Quebec and Ontario (the biggest user bases), (3) then the rest. Biggest saving first inside each tier. |
| D3 | **No "up to $6".** The main figure stays the common amount; a province with a different amount carries its own small amount in the province strip ("$2 only" on the West's cells). |
| D4 | **Posting through the Graph API token.** Metricool is out. |
| D5 | **The schedule runs in the cloud.** R2 photo paths are fixed for cloud use (section 5). |
| D6 | **Reel music is pre-approved before it is used** and never repeats week after week (section 6). |
| D7 | **Every post and reel is scored and re-worked until it reaches 9.5/10** (section 7). |
| D8 | **All these rules live in this repo** (`RULES-README.md` §1, a new "Weekly automation" section). |

## 2. The weekly rhythm

Posting slots start from the Meta AI proposal Maxim pasted, with these changes. Times are hypotheses for 4 weeks, then
replaced by Instagram Insights data (best hours of this account's own followers).

| Day | Content | Carousel | Reel | Change from the proposal and why |
|---|---|---|---|---|
| Mon | Grocery | **as soon as built, 08:00 earliest, 14:30 latest** (Maxim, 2026-11-16: "be the first app to publish") | 19:00 | The new list is complete early: on Nov 16 all 9 provinces had it by 06:36 (538 new savings; later runs added 9). The carousel is built right after, not at a fixed hour. |
| Tue | TVs & tech | 12:00 | 20:00 | Only if the savings still run on Tuesday; soonest-ending posts first. |
| Wed | Home & more | 08:00 | 19:30 | As proposed. |
| Thu | Business Centre grocery (warehouse and Business Centre never mixed) | 06:00 | 12:00 | As proposed. |
| Fri | Week recap (no carousel) | none | 19:00 | "Early Black Friday" only from Fri Nov 20; plain recap otherwise. |
| Sat | **Hidden in your region** (West, Ontario or Atlantic, rotating) | 09:00 | **18:00** | Reel moved: 9:00 + 9:30 would compete with each other. |
| Sun | How to claim / scan your receipts | 18:00 | 20:00 | Most savings end Sunday, so the carousel is a how-to, never a list of drops that are over. |

Every EN slot has a **French twin for Quebec, 60 to 90 minutes later**, on the same account.

## 3. When the jobs run (cloud routines, Toronto time)

| Job | When | What it does |
|---|---|---|
| **Weekly build** | **Event-driven (Maxim, 2026-11-16).** From Mon 06:45, checks every 15 minutes; starts the build the first time **all 9 provinces have at least 30 savings created today and no new saving was created in the last 30 minutes**. Hard deadline: if it has not started by 12:30 it starts anyway with what exists, so the Monday carousel can still go out by 14:30. | Pulls the week's savings, builds every carousel and reel, scores them, opens one PR with the week's pack and `schedule.json`. |
| **Top-up check** | Daily 13:45 | One cheap SQL count. Builds a top-up only when 15 or more new products, or any new saving of $50 or more, appeared since the last build (the harvest brings ~360 products on Mondays and 7 to 120 on other days). Feeds the Friday recap and the Saturday regional slot. |
| **Publisher** | At each slot time (GitHub Actions cron in this public repo, free minutes) | Publishes what is due. Never twice, never late, dry run until Maxim switches it on (`PUBLISH_ENABLED`). |

Cloud cron is UTC, Toronto changes clock on 2027-03-14: the routine reads the Toronto time itself and does nothing if
it is not yet 14:30 there.

## 4. The content model (what goes on a slide)

The unit is a **product**. For an audience (EN: ON, BC, AB, MB, SK, NB, NS, NL; FR: QC) each product gets:

- `tier 1`: a saving exists in **every province of the audience**; `tier 2`: it exists in the audience's priority
  provinces (EN: Ontario; FR: always Quebec, so tier 1 and 2 coincide); `tier 3`: anything else.
- `headline amount`: the amount in the most provinces of its highest tier (ties: the larger).
- `exceptions`: provinces whose amount differs. They show a small amount inside their province cell
  (`AB $2`), and the claim total never counts more than the shopper's own province would pay.
- Order: tier, then end date (soonest first), then biggest saving.
- Reality check from the data: only **8 of 515** products today have different amounts by province. The common
  difference is **availability** (247 of 541 offers are in all 9 provinces, 216 in regional blocks, 78 in one
  province), which the province strip already shows.
- **Hidden savings** (single-region offers) go to the Saturday regional carousel and to the end card line
  "+ N more hidden savings in <region>, only in the PriceBack app".
- Existing rules kept: one category = one carousel, max 18 items plus cover and end card, never an item already
  posted, no weighted meat, no jewellery or mobile devices, "claim, never get", not-affiliated line.

## 5. Photos: R2 paths and cloud access

- **Correct public path:** `https://priceback-production.up.railway.app/api/product-images/costco/<sku>` (no
  authentication, JPEG). Verified 2026-11-16: 59 of 63 Business Centre SKUs and 60 of 60 Same-Day SKUs sampled returned
  200. Missing at the time: 1028727, 1111803, 4894964, 5372099 (coupon-source Business Centre items).
- The bucket is `priceback-product-images`, key `costco/<sku>.jpg`. The earlier "not reachable from cloud sessions" was
  the bucket being addressed directly. The route above is served by the backend, so the cloud session needs no R2 key.
- **Fallback order:** that route, then Same-Day (name search), then costco.ca. **No photo, no slide**, and the item is
  listed in the PR as skipped.
- **Preflight:** the routine fetches a known SKU first. If the route is unreachable from the cloud, it stops and opens an
  issue; it never builds a photo-less pack.
- **Published assets** (finished JPEG slides, reel MP4) must be reachable by Meta. Slides: `raw.githubusercontent.com`
  (public repo, as the runbook does today). Reels: too large for git, so they need a public bucket. **Needs Maxim:** a
  public R2 bucket (or `r2.dev` access) for `priceback-social`, with its write key given to the routine.

## 6. Reel music

- A track may only be used if it is listed in `reels/music/APPROVED.json`, which Maxim (or an approved earlier task)
  fills **before** the week it is used.
- A track is never used two weeks in a row, and each language/format rotates through the library.
- A separate **music-prep task** generates candidates (`music_*.py` with different tempo, key and seed) and puts them
  in `reels/music/CANDIDATES/` for Maxim to approve. Nothing from there is used until approved.
- If the library has no unused approved track, the reel ships with the no-music copy and the PR says so.
- Reels carry their music inside the file (the Graph API cannot add Instagram's own audio).

## 7. Quality loop (target 9.5 / 10)

Every carousel and reel is rendered, then scored by a separate reviewer pass on a fixed rubric (10 points total):

| Criterion | Points |
|---|---|
| Hook: first slide / first 1.5 s makes a Costco shopper stop | 2 |
| Clarity: saving, province availability and end date understood in 3 seconds | 2 |
| Photos: clean packshot, correct product, nothing overlapped | 1.5 |
| Legibility and safe zones (Instagram UI, muted viewing) | 1.5 |
| Language quality (Quebec French is localised, not translated) | 1 |
| Brand and compliance gates (disclaimer, no logo, claim never get, real numbers) | 1 |
| Call to action: one ask, follow or download | 1 |

- Below 9.5 the reviewer lists concrete fixes, the builder applies them, and it re-scores. **Maximum 3 rounds.**
- A piece still under 9.5 after 3 rounds is **not published**; it is flagged in the PR for Maxim.
- **Honest limit:** this score is the model's own rubric, not measured conversion. Real results come from Insights
  (reach, saves, shares, follows, profile visits) read weekly through the Graph API; the weekly report compares them to
  the scores, and the rubric weights are adjusted when they disagree.

## 8. Safety and rollout

1. **Weeks 1 to 4: dry run.** The routine builds and opens the PR, the publisher prints what it would post.
2. Maxim reviews, then sets `PUBLISH_ENABLED=true`. This follows his rule that an automation is switched on only at
   maximum optimization, and as data, by him.
3. Credentials (read-only database role, Meta token, R2 key) are set by Maxim in the routine's environment, never in
   chat or in the repo.
4. A failure (preflight, harvest not settled by 17:30, score under 9.5, publish error) opens a GitHub issue and
   publishes nothing for that slot.

## 9. Open items needing Maxim

1. ~~Approve this design.~~ Approved 2026-11-16 ("all the rest is fine"), with the Monday change above.
2. ~~A read-only database role.~~ **Done 2026-11-16**: role `social_ro` in production, login through the session
   pooler, can read only four views in schema `social_ro` (`savings_live`, `regular_prices`, `harvest_runs`,
   `provinces`), no base table, no write, 3 connections max, 30 s statement timeout. The connection string is in
   `%USERPROFILE%\.priceback-secrets\social-readonly-db.env` for Maxim to set as `DATABASE_URL_SOCIAL_RO` in the routine.
3. The **Meta token and Instagram / Page ids** as secrets (the runbook lists the current ones). Promised later today.
4. A **public R2 bucket** for finished reels.
5. The first batch of **approved music tracks**.

## 10. Out of scope for now

TikTok and YouTube Shorts (voice-over version), Stories and Highlights stickers, paid ads, any change to the app.

## 11. Status, 2026-11-16 (what was built, what is still open)

**Built and tested (71 unit tests):** settled-harvest detector, audience/tier model, week planner with the hidden-savings
rotation, snapshot and poll through the read-only role (certificate verified against Supabase's CA), photo fetch with
preflight, renderer strip exceptions, approved-music picker and candidate generator, score gate, media conversion with the
duplicate-slide check, schedule builder, Graph API client and publisher (dry run by default), 15-minute workflow.
Verified live: the read-only role, the photo route, the poll against production (all 9 provinces seen), a rendered slide
with the small-amount province cells, the publisher's due / missed / unreachable-asset behaviour.

**Changed from this design while building:**
- Cloud routines cannot run more often than hourly, so the Monday poll is hourly from 07:10 Toronto (the harvest had
  settled at 06:36 on Nov 16), with the 12:00 deadline.
- Monday's carousel is no longer pinned to 19:00: it posts as soon as built, 08:00 earliest, 14:30 latest.
- The top-up routine is **not registered**: it needs a slot-level rebuild mode first (`weekly/ROUTINE.md`, last section).
- Reels skip an item whose amount differs by province (the claim total would overstate); the carousel keeps it.

**Open, in the order they block posting:**
1. `DATABASE_URL_SOCIAL_RO` set in the cloud environment (file in `%USERPROFILE%\.priceback-secrets\`).
2. Meta token, Instagram and Page ids as GitHub secrets; confirm `META_GRAPH_VERSION` (default `v24.0`) and the API's
   carousel limit (`IG_CAROUSEL_MAX`, default 20) with the real token on the first dry run.
3. ~~`REEL_BASE_URL`~~ Done 2026-11-16: reels are committed to the weekly branch and served from the repo's raw GitHub URL (the
   publisher's default). To move them later, set the repository variable `REEL_BASE_URL`. First dry run must confirm Meta accepts
   raw.githubusercontent's content type for mp4.
4. ~~Approved music~~ Done 2026-11-16: candidates 1 to 6 and 8 approved (7 refused), files in `music/approved/`.
5. First cloud run: the routine's setup (Playwright, fonts, ffmpeg) is untested in the cloud; a failure opens an issue.
6. Sunday how-to and Friday recap content have no generator yet; those slots stay `needs_content`.
