# Weekly social automation: implementation plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans (Native) to implement this plan task-by-task.
> Steps use checkbox syntax for tracking.

**Goal:** every week the cloud routine turns the savings harvest into the week's carousels and reels (EN for the 8
provinces outside Quebec, FR for Quebec), scored to 9.5/10, with product photos, and a publisher posts them on schedule.

**Architecture:** deterministic scripts do everything that has one right answer (query, tiering, ordering, photo fetch,
music choice, schedule, publishing); the routine's Claude session does only judgment (category, tag lines, rubric
scoring, fixes) and writes it into JSON caches the scripts read. The publisher is dry-run by default.

**Tech stack:** Node 20 (built-in `node:test`, `pg`), the existing Playwright renderer
(`sm-content/08-costco-price-drops/scenes/render.js`), Meta Graph API, GitHub Actions, Claude cloud routines.

**Spec:** `docs/weekly-automation-design.md`

## Global Constraints

- English = ON, BC, AB, MB, SK, NB, NS, NL; French = QC only; Business Centre follows the same split (D1).
- Tier order: tier 1 common to every province of the audience, tier 2 includes the priority province (EN: ON), tier 3
  the rest; inside a tier soonest end date first, then biggest saving (D2). FR audience is QC only, so its tier 1 and 2
  coincide: every saving valid in QC.
- Main figure = the amount in the most provinces of the item's highest tier; a province with another amount shows it
  small in its own strip cell; never "up to" (D3).
- One category = one carousel; max 18 items + cover + end card; never an item already posted; no weighted meat; no
  jewellery or mobile devices; no photo = no slide; Business Centre carousels grocery only, never mixed with warehouse.
- Photos: `https://priceback-production.up.railway.app/api/product-images/costco/<sku>` first, then Same-Day, then costco.ca.
- DB access only through role `social_ro` (`DATABASE_URL_SOCIAL_RO`), views in schema `social_ro`.
- Publishing: Graph API, dry run until repo variable `PUBLISH_ENABLED` is `true`; never twice, never late.
- Reel music only from `reels/music/APPROVED.json`; never the same track two weeks in a row.
- A piece scoring under 9.5 after 3 rounds is not published.
- Every user-visible string exists in EN and FR (Quebec French is localised, not translated).

## Review Focus

- A province with zero new savings (harvest partly failed): the build must not start, and at the 12:30 deadline must
  say which province is missing instead of silently posting a short list.
- A product whose savings differ by province (chicken $6 vs West $2): headline amount and strip exception both correct.
- A product with no French name: falls back to the English name and is listed as `needsReview`, never blank.
- Photo route unreachable from the cloud: stop and report; never build photo-less slides.
- The same slot run twice (cron overlap, retry): publishes once.
- A slot due more than its window ago (runner down): reported MISSED, not posted late.
- Quebec items appearing in the EN pack, or non-Quebec items in the FR pack.

---

### Task 1: Rules into the repo

**Files:** Modify `RULES-README.md` (new section "Weekly automation (Maxim, 2026-11-16)"); Create `sm-content/08-costco-price-drops/tools/README.md` index line.

- [ ] Add the section with D1 to D8 and the schedule table, exactly as in the design doc, and a pointer to the design and plan.
- [ ] `node scripts/check-copy.js` still passes. Commit.

### Task 2: Settled detector

**Files:** Create `scripts/weekly/lib/settled.js`, `scripts/weekly/lib/settled.test.js`.

**Produces:** `evaluateSettled({ perProvince: {AB: n, ...}, lastCreatedAt: Date|null, now: Date, minPerProvince = 30, quietMinutes = 30, deadline: Date }) -> { ready: boolean, reason: string, missing: string[] }`.

- [ ] Test: all 9 provinces >= 30 and last creation 31 min ago -> ready. One province at 5 -> not ready, `missing` names it. Last creation 10 min ago -> not ready (`quiet`). `now >= deadline` with a missing province -> ready with `reason: "deadline"` and `missing` still listing it.
- [ ] Implement; run `node --test scripts/weekly/lib/settled.test.js`.
- [ ] Commit.

### Task 3: Selection model

**Files:** Create `scripts/weekly/lib/model.js`, `scripts/weekly/lib/model.test.js`.

**Produces:** `buildAudience(rows, audience, opts) -> Item[]` where `audience` is `{ id: "en"|"fr", provinces: string[], priority: string[] }` and an `Item` is `{ sku, tier, amount, exceptions: {[prov]: number}, provinces: string[], validUntil, source, names:{en,fr}, needsFrenchReview }`; `AUDIENCES = { en: ..., fr: ... }`.

- [ ] Tests (rows are `social_ro.savings_live` rows plus `regular`): chicken case (6 in ON/QC/NB/NS/NL, 2 in AB/BC/MB/SK) gives EN amount 6 with exceptions `{AB:2,BC:2,MB:2,SK:2}`; an item in all 8 EN provinces is tier 1 and sorts before a bigger tier-3 saving; FR audience never contains a non-QC row; an item only in AB is dropped from FR and is tier 3 in EN; no `display_name_fr` -> falls back to English and `needsFrenchReview` true.
- [ ] Implement with the Global Constraints rules; run tests; commit.

### Task 4: Candidate query and week files

**Files:** Create `scripts/weekly/query.js` (reads `DATABASE_URL_SOCIAL_RO`, prints rows JSON), `scripts/weekly/build-week.js`.

**Consumes:** Task 3 `buildAudience`. **Produces:** `build-week.js <monday-iso> --rows=<file>` writing `scenes/weeks/<monday>-<audience>-<category>.json` in the existing renderer format plus `exceptions` per item and `feeds` per language, and `weekly/<monday>/needs.json` listing SKUs missing a category, tag lines or photo.

- [ ] Test with a fixture rows file: output files validate against the renderer's keys; a SKU absent from `categories.json` appears in `needs.json` and not in any carousel; already-posted SKUs (found in `scenes/weeks/*.json`) are excluded.
- [ ] Implement `categories.json` and `tags.json` (SKU -> `{cat:"grocery|home|tech", rawMeat, weighted}` / `{en:[..],fr:[..]}`), both read-only for the script and written by the routine's agent.
- [ ] Commit.

### Task 5: Photos

**Files:** Create `scripts/weekly/photos.js`, `scripts/weekly/photos.test.js`.

**Produces:** `preflight(fetchImpl) -> Promise<{ok:boolean, detail:string}>` (fetches SKU `2034361` from the public route); `fetchPhoto(sku, {fetchImpl, cacheDir}) -> Promise<{ok, source:"r2"|"sameday"|"costco.ca"|null, path}>` saving `scenes/.cache/<sku>.jpg`.

- [ ] Tests with a fake fetch: 200 image/jpeg saves and reports `r2`; 404 then Same-Day success reports `sameday`; all 404 returns `ok:false`; HTML body with 200 is rejected; preflight failure returns `ok:false` with the status.
- [ ] Implement; commit.

### Task 6: Renderer, audience split and strip exceptions

**Files:** Modify `sm-content/08-costco-price-drops/scenes/render.js` (`strip`, `post`), add CSS for `.exc`.

- [ ] Add optional `item.exceptions`; `strip()` renders `<i class="on exc">AB<small>$2</small></i>` for those provinces (FR `2 $`).
- [ ] Add optional week-file `audience: "en"|"fr"`; when set, render only that language (no EN+FR copies) and name the audience provinces in the fine print.
- [ ] Re-render `weeks/2026-11-15-grocery.json` and compare byte-for-byte to the committed PNGs to prove no regression for files without the new keys; render one fixture with exceptions and look at it.
- [ ] Commit.

### Task 7: Music library

**Files:** Create `sm-content/08-costco-price-drops/reels/music/APPROVED.json` (`[]`), `reels/music/CANDIDATES/.gitkeep`, `reels/pick-track.js`, `reels/pick-track.test.js`, `reels/make-candidates.js`.

**Produces:** `pickTrack(approved: Track[], history: {week, trackId}[], week: string) -> Track|null` (`Track = {id, file, bpm, approvedAt}`).

- [ ] Tests: never the previous week's track; least-recently-used first; empty library -> `null`.
- [ ] `make-candidates.js <n>` renders `n` synthetic candidates (varied bpm/key/seed) into `CANDIDATES/` for Maxim to listen to; nothing there is ever picked.
- [ ] Commit.

### Task 8: Score gate

**Files:** Create `scripts/weekly/lib/score.js`, `score.test.js`, `weekly/RUBRIC.md`.

**Produces:** `rubricTotal(scores: {hook, clarity, photos, legibility, language, compliance, cta}) -> number` (weights 2, 2, 1.5, 1.5, 1, 1, 1, rounded to 0.1); `gate(history: number[], max=3, target=9.5) -> {publish:boolean, rounds:number, reason:string}`.

- [ ] Tests: perfect scores = 10; a first score 9.6 publishes at round 1; 9.0, 9.2, 9.4 -> `publish:false` after 3 rounds with reason `below_target`; out-of-range sub-score throws.
- [ ] Commit.

### Task 9: Schedule and publisher

**Files:** Create `scripts/weekly/make-schedule.js`, `scripts/weekly/publish-week.js`, `scripts/weekly/lib/graph.js`, tests for each; Create `.github/workflows/weekly-publish.yml`.

**Produces:** `make-schedule.js <monday>` -> `weekly/<monday>/schedule.json` slots (`id`, `date`, `time` Toronto, `lang`, `kind: "carousel"|"reel"`, `assets[]`, `caption`, `networks:["instagram","facebook"]`) from the design's table, FR twin 60 to 90 minutes after each EN slot, Monday carousel `earliest 08:00 / latest 14:30`.
`publish-week.js` reuses the safety properties of `publish-due.js` (dry run default, ledger `published.json`, due window 2 h, disclaimer appended from the schedule): Instagram carousel (container per image, then parent), Instagram reel (`media_type=REELS`, `video_url`), Facebook multi-photo and video.

- [ ] Tests (fake `fetch`): a due slot publishes once and a second run is a no-op; a slot 3 h late is `MISSED`; dry run makes no POST; carousel with 21 assets is refused; caption over 2,200 chars is refused.
- [ ] Workflow runs every 15 minutes, `PUBLISH_ENABLED` gates `--write`, concurrency group `social-publish`.
- [ ] Commit.

### Task 10: The cloud routine

**Files:** Create `weekly/ROUTINE.md` (the routine's prompt: steps in order, with the checks), register the routines with `RemoteTrigger`.

- [ ] Routine A "Weekly build": Mondays every 15 min from 06:45 Toronto: run `query.js`, `evaluateSettled`; when ready, preflight photos, build week files, fill `categories.json`/`tags.json` for `needs.json`, render, score each piece (rubric), fix up to 3 rounds, render reels with `pickTrack`, `make-schedule.js`, open a PR with the report.
- [ ] Routine B "Top-up check": daily 13:45 Toronto, builds a top-up only when >= 15 new products or any new saving >= $50 since the last build.
- [ ] Both open a GitHub issue on any failure and stop. Secrets are set by Maxim in the routine environment.
- [ ] Commit.

### Task 11: Check and wrap-up

- [ ] `node --test scripts/weekly` and `node scripts/check-copy.js` pass.
- [ ] Update `docs/weekly-automation-design.md` open items; add the doc pointer to `Priceback-Documentations/Marketing-Plan/README.md`; append `Operations/Task_Log.md` entry (database role, repo changes).
- [ ] PR to `master`, squash-merge when green.

## Self-review

Spec coverage: D1/D2/D3 -> Tasks 3, 6; D4 -> Task 9; D5 + R2 paths -> Tasks 5, 10; D6 -> Task 7; D7 -> Task 8 + routine; D8 -> Task 1; Monday event-driven trigger -> Tasks 2, 10; read-only role -> done 2026-11-16.
