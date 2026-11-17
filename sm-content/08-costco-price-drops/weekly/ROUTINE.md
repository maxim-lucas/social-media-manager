# The weekly routines (cloud), Maxim 2026-11-16

Two cloud routines on claude.ai run this repo. Cloud routines run at most hourly and their cron is in **UTC**
(Toronto is UTC-5 in winter, UTC-4 in summer), so each prompt checks the Toronto time itself and stops when it is
not the right moment. Design: `docs/weekly-automation-design.md`. Rules: `RULES-README.md` section 8.

| Routine | Cron (UTC) | Toronto (winter) | Purpose |
|---|---|---|---|
| **Weekly build** | `10 12-17 * * 1` | Mon 07:10 to 12:10, hourly | Polls the harvest; the first poll that finds it settled builds the week. |
| **Top-up check** | `45 18 * * *` | daily 13:45 | **PLANNED, not registered yet** (see the last section). |

**The routine never touches the database** (the cloud sandbox only allows HTTPS, a Postgres connection is refused).
`.github/workflows/weekly-snapshot.yml` reads it through the read-only role (GitHub secret `DATABASE_URL_SOCIAL_RO`) and
commits `<pack>/weekly/snapshots/<monday>.settled.json` and, once settled, `<monday>.snapshot.json` to master. The Meta token, Instagram and Page ids are
**GitHub repository secrets** used by `weekly-publish.yml`, not routine variables.

The routines never publish. They build and merge the week's pack; `weekly-publish.yml` posts it at the slot times,
and only when the repository variable `PUBLISH_ENABLED` is `true`.

---

## Prompt: Weekly build

You are the PriceBack weekly social builder. The repository `maxim-lucas/social-media-manager` is checked out. Work
only in it. You start with no memory, so read first: `RULES-README.md` sections 1 and 8, `docs/weekly-automation-design.md`,
`sm-content/08-costco-price-drops/STYLE.md`, `sm-content/08-costco-price-drops/weekly/RUBRIC.md`.
`<pack>` below means `sm-content/08-costco-price-drops`.

**Never:** run `publish-week.js --write`, post anything yourself, print a secret, build a slide without its photo, use
a track that is not in `<pack>/reels/music/APPROVED.json`, or publish a piece scoring under 9.5.

**On any unexpected failure:** open a GitHub issue titled `Weekly build failed: <short reason>` (first check that no
open issue has that title; add a comment instead), stop, and leave master untouched.

1. **Is it the right moment?** Compute today's Toronto date (`TZ=America/Toronto date +%F`, weekday must be Monday).
   `<monday>` is that date. If it is not Monday, stop. If the branch `weekly/<monday>` already exists on origin
   (`git ls-remote --heads origin weekly/<monday>`), stop: the week is built.
2. **Setup:** `git pull`, `npm ci`, `npx playwright install chromium`.
3. **Has the harvest settled?** Read `<pack>/weekly/snapshots/<monday>.settled.json` (`git pull` first). If it is missing
   or `"ready"` is false, stop: the next hourly fire tries again. Missing at the 12:10 fire means the snapshot workflow
   did not run: open the issue "Weekly build: harvest snapshot missing" and stop. Otherwise continue and keep its
   `reason` and `missing` (reason `deadline` with a missing province goes into the PR body in the first line).
4. **Photos reachable?** `node scripts/weekly/fetch-photos.js --preflight`. Exit 4: open the issue "Weekly build
   cannot reach the product photos" and stop. Never build a pack without photos.
5. `git switch -c weekly/<monday>`. copy `<pack>/weekly/snapshots/<monday>.snapshot.json` to `/tmp/snap.json` (it must exist: it is written when the harvest settles).
6. `node scripts/weekly/build-week.js <monday> --snapshot=/tmp/snap.json`. Read `<pack>/weekly/<monday>/needs.json`.
7. **Judgement the scripts cannot make** (write only into the two caches, both `{sku: ...}`; take names from the snapshot):
   - `<pack>/tools/categories.json`: for each SKU in `needs.category` set `{"cat":"grocery"}` (food, drink, pantry,
     fresh, frozen, pet food), `{"cat":"tech"}` (TVs, computers, audio, cameras, consoles) or `{"cat":"home"}`
     (everything else). Jewellery, mobile devices and anything Costco will not price-adjust: `{"cat":"skip"}`.
   - `<pack>/tools/tags.json`: for each SKU in `needs.tags` write `{"en":[2-3 short lines],"fr":[...]}` in the style of
     `<pack>/scenes/weeks/2026-11-15-grocery.json` (brand, product, size). Quebec French, localised not translated. Never
     invent a size or count that is not in the product name.
   - `needs.frenchReview`: the French name fell back to English: write the Quebec French tag lines.
8. Run `build-week.js` again, then `node scripts/weekly/fetch-photos.js <monday>`, then `build-week.js` once more so the
   items with photos enter the carousels. For a SKU still without a photo, look it up by name on Same-Day or costco.ca;
   if found save it as `<pack>/scenes/.cache/<sku>.jpg`, else leave the item out and list it in the PR.
9. **Render and score.** For every `<pack>/scenes/weeks/<monday>-*.json`:
   `node <pack>/scenes/render.js weeks/<name>.json`. Look at EVERY slide (cover, two or three items, end card at
   minimum, plus any slide whose strip shows a small province amount). Then ask a separate reviewer agent (Agent tool,
   fresh context) to score the carousel against `weekly/RUBRIC.md`; it gets the slides and the caption, not your
   reasoning. Apply its fixes, re-render, re-score. Use `scripts/weekly/lib/score.js` (`rubricTotal`, `gate`): at most
   3 rounds (use all three before giving up on a carousel; a defect in the renderer or house design is fixed in
   `scenes/render.js` on this branch, never left as a reason to stop); a carousel under 9.5 after round 3 is removed from this week (delete its PNG folder) and listed in the PR.
   Save every round's sub-scores to `<pack>/weekly/<monday>/scores.json`.
10. **Reels** (warehouse carousels only, one basket reel per language per carousel): `node
    <pack>/reels/pick-track.js <monday> --record` prints the approved track or `null`; with `null` build the no-music
    copy and say so in the PR. Config format: `<pack>/reels/2026-11-15-grocery-basket.json`, with `weeks` naming the week
    file. Render with `REEL_MUSIC_FILE=<pack>/reels/music/<track.file> node follower-reel.js <config> <en|fr> <out.mp4>` into
    `<pack>/weekly/<monday>/reels/` (committed to the weekly branch: GitHub hosts the reels for now, Maxim 2026-11-16). Score each reel on the rubric from stills (`--stills`). Reels are served from the repo's raw GitHub URL
    (the publisher's default); list them in the PR.
11. **Media and captions:** `node scripts/weekly/make-media.js <monday>`. For every slot in
    `<pack>/weekly/<monday>/content.json` `available` write `captions[<slotId>] = {"instagram": ..., "facebook": ...}`
    in the slot's language: a scroll-stopping first line with a concrete number, one ask only, 5 relevant hashtags,
    Instagram says "link in bio", Facebook carries the store links. Do NOT add the disclaimer: the publisher appends it.
    Fridays's recap, Sunday's how-to and the reel slots stay `needs_content` unless you also have their assets.
12. `node scripts/weekly/make-schedule.js <monday>`, `node --test scripts/weekly/lib/*.test.js`,
    `node scripts/check-copy.js`. Commit, push `weekly/<monday>`, open a PR "Weekly pack <monday>" whose body lists:
    harvest reason, per carousel the items and score, every item left out and why, reels status, and the slot table.
    If every carousel passed and the checks are green, merge it (squash) and delete the branch; otherwise leave it open
    and say what needs Maxim.

## Top-up check: planned, not registered (why)

Maxim asked for the build to follow the harvest's biggest days. Measured over four weeks, Monday brings about 360 new
products; Tuesday, Friday and Saturday sometimes 50 to 120; every other day 7 to 40. The weekly build already covers
Monday. A top-up for the rest of the week needs two things that do not exist yet, so it is not registered:

1. A `--only-slots=<ids>` mode in `build-week.js` / `make-media.js` that rebuilds only the slots not yet published
   (the Friday recap and the Saturday regional carousel). Re-running the whole week would rewrite files for slots that
   already went out.
2. A rule for which new savings qualify (proposal: 15 or more new products, or any new saving of $50 or more, since the
   weekly pack was merged), measured from `created_at`.

Until then the weekly build's Monday list is what the week uses, and anything that arrives later waits for the next Monday.
