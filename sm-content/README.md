# sm-content — PriceBack social media assets

Every piece of PriceBack social content, one numbered folder per pack, in the order the packs were made and run.

## The map

Every pack in the order it was made and runs. **Start here, then open the pack's own notes file.** The rules that
govern all of them are in [`../RULES-README.md`](../RULES-README.md) (it wins over any pack's notes).

| # | Folder | What it is | Status | Read |
|---|---|---|---|---|
| 00 | [`00-brand/`](00-brand/) | Not a pack: the mark, the leaf, the palette, the type ramp, Instagram's geometry, the icons every pack imports | Permanent | `README.md` |
| 01 | [`01-teaser/`](01-teaser/) | Pre-launch: posts and stories on thermal-receipt paper that name nothing | Past run (pre-launch) | `TEASER-NOTES.md` |
| 02 | [`02-launch-week/`](02-launch-week/) | Launch week: hook Reel, 10-slide carousel, 3 statics, story sequence (EN + FR) | Past run (launch week) | `ASSET-PACK-NOTES.md` |
| 03 | [`03-evergreen/`](03-evergreen/) | The permanent pack: 9 feed posts + 10 story frames, store-agnostic, with its 14-day schedule | Automated (`social-publish`, dry run until `PUBLISH_ENABLED`) | `EVERGREEN-NOTES.md`, `AUTOMATION.md` |
| 04 | [`04-community/`](04-community/) | Recruiting: bilingual carousels, story pairs, Highlight covers, Reel scripts | Past run (planned 21 Sep → 23 Oct 2026) | `COMMUNITY-NOTES.md` |
| 05 | [`05-highlights/`](05-highlights/) | The ten-Highlight tray | Edited, never retired | `HIGHLIGHTS.md`, `SEQUENCE.md` |
| 06 | [`06-launch/`](06-launch/) | "We're live": the first post, pinned. **Holds the official store badges** every pack uses | Posted 2026-10-02 | `LAUNCH-NOTES.md` |
| 07 | [`07-costco-toolkit/`](07-costco-toolkit/) | 7 how-to carousels (scan, claim, price tag, price codes…) | Designs, not posted | `TOOLKIT-NOTES.md` |
| 08 | [`08-costco-price-drops/`](08-costco-price-drops/) | **The house style**: real Costco price drops, weekly carousels and reels | Automated weekly (`weekly-*`, dry run until `PUBLISH_ENABLED`) | `STYLE.md`, `weekly/ROUTINE.md` |
| 09 | [`09-video-styles/`](09-video-styles/) | Index of every video style, made or planned | Reference | `VIDEO-STYLES.md` |
| 10 | [`10-receipt-scan/`](10-receipt-scan/) | What a receipt scan needs: 8-slide carousel + reel script | Designs, not posted | `NOTES.md` |
| 11 | [`11-realistic-tutorials/`](11-realistic-tutorials/) | Real-life tutorial films, one per feature | Animatic | `SERIES.md` |
| 12 | [`12-kickstarter/`](12-kickstarter/) | Kickstarter video + app feature videos (9:16 and 16:9) | For review | `README.md` |
| 13 | [`13-print-posters/`](13-print-posters/) | Print posters (EN + FR) | Done | `README.md` |
| 14 | [`14-new-version-ads/`](14-new-version-ads/) | **Meta Ads for the new version**: free-tools campaign + receipt-scan/BLACK campaign, every placement, named for upload | Ready, not posted | `README.md` |

Also here: [`POSTING-ORDER-CONVENTION.md`](POSTING-ORDER-CONVENTION.md), what each pack's `POSTING-ORDER/` copy is.

### How the automation finds a pack: `packs.json`

**[`packs.json`](packs.json) is the one place that says where each pack lives.** Every script and workflow looks a
pack up there by its stable **key** (`evergreen`, `price-drops`, `community`…) through
[`../scripts/lib/packs.js`](../scripts/lib/packs.js), never by a folder name typed in the code:

| Reads | Pack key | How |
|---|---|---|
| `scripts/publish-due.js`, `.github/workflows/social-publish.yml` | `evergreen` (or `--pack=<key>`) | `packs.dir("evergreen")`; the workflow runs `node scripts/lib/packs.js dir evergreen` |
| `scripts/weekly/*`, `weekly-snapshot.yml`, `weekly-publish.yml` | `price-drops` | `packs.dir("price-drops")`; the workflows run `node scripts/lib/packs.js dir price-drops` |
| `scripts/weekly/publish-week.js` (the disclaimer) | `evergreen` | `packs.dir("evergreen")` |
| `social-check.yml`, `scripts/check-copy.js` | every pack with a `schedule.json` / `scenes/claims.js` | discovered, then resolved through the registry |

**To move or rename a pack:** `git mv` the folder, change its `"dir"` in `packs.json`, run
`node scripts/lib/packs.js check`. Nothing else changes; keys never change. `social-check` runs the same check on
every content change, so a folder moved without updating `packs.json`, or added without registering it, fails the
build instead of failing at posting time.

```bash
node scripts/lib/packs.js list            # every pack: key, folder, what reads it
node scripts/lib/packs.js dir evergreen   # sm-content/03-evergreen
node scripts/lib/packs.js check           # every folder exists and is registered
```

Inside a pack, paths stay relative to the pack (a `schedule.json` lists `posts/…`, `stories/…`), and renderers import
the shared graphics as `../../00-brand/…`, so a pack moves as one piece.

### Making a new pack

1. Take the next free number: `15-<what-it-is>/`. Never reuse a number.
2. Inside: a notes file (`README.md`) that says what the pack is, its status, how to render it and its rules;
   `scenes/` for the source and renderer; the rendered output (`posts/<lang>/`, or `ready-to-upload/<LANG>/` for
   ads); `POSTING-ORDER/` when it has a posting order.
3. **Register it in [`packs.json`](packs.json)** (a key and its `dir`; `"automated"` if a script reads it) and run
   `node scripts/lib/packs.js check`.
4. Add a row to the map above and, if it brings a new standing rule, a section to `../RULES-README.md`.

(History, 2026-11-27: the launch-week folders were loose at the top of `sm-content/` and now live in
`02-launch-week/`; the print posters were a second `12-` and are now `13-print-posters/`; `teaser/`, `evergreen/` and
`brand/` took their numbers (`01-`, `03-`, `00-`) once `packs.json` made moving a read-by-path pack safe. The old
names still resolve as `--pack=` arguments.)

Inside `04-community/` the same idea goes one level deeper: its wave folders are
numbered `00`…`06` in publish order, and each asset's filename carries a global
`seq`, so `03-stores-growing/priceback-community-09-post-en.png` is the ninth
thing that goes out and it is about stores. `verify.js` gate 9 fails the build if
that stops being true.

## Three packs, in order

`01-teaser/` runs **first**, before any of the above: four numbered feed posts and
six story frames on thermal-receipt paper that never name the product, the
category or a retailer. It is built to look like it came from somewhere else,
so the launch pack lands as the answer to it. Read `01-teaser/TEASER-NOTES.md`.

`04-community/` runs **after evergreen's first fortnight, once.** It is the only
pack that asks for something — a follow, a comment, a contribution — and the only
one allowed to name a retailer, which it pays for by rendering the
non-affiliation line into the art of every frame that does. Every feed post is a
bilingual carousel: English, a divider that says *la suite en français*, French.
Read `04-community/COMMUNITY-NOTES.md`, `HOOKS.md` for the forty unrendered hooks
in its register, and `HIGHLIGHTS.md` for the Highlight covers and their sizes.

`03-evergreen/` runs **last, and then keeps running.** The launch pack was built
around one retailer and one claim window; both are now moving targets, and an
asset that prints either becomes wrong the day a store with different terms goes
live. The evergreen pack describes the mechanic instead — no retailer named, no
window in days, no figure printed, in either language — so it survives the store
list growing, which is also the thing it is built to make people follow for.
Read `03-evergreen/EVERGREEN-NOTES.md`, and `03-evergreen/HOOK-BANK.md` for the part
worth keeping after the nine frames are spent.

Unlike the launch assets, the teaser and evergreen packs ship their own source —
edit `scenes/strings.json` and re-render rather than editing a PNG.

## Read first

- `02-launch-week/ASSET-PACK-NOTES.md` — what each asset is, the three pre-post fixes (store badges,
  in-app audio, claim screen), story sticker placement, and the compliance rules baked
  into the copy.
- `03-evergreen/CALENDAR.md` — the 14-day run, and `03-evergreen/AUTOMATION.md` for the
  scheduled publisher (`scripts/publish-due.js`).
- `../docs/instagram-playbook.md` — the working playbook. It supersedes the August
  2026 launch playbook, which is archived at
  `../docs/archive/instagram-launch-playbook-2026-08.html` (claude.ai artifact
  `e9375fa1-99a1-4f30-9165-d9d0d93ae90f`).

## Highlights

**Superseded by `04-community/06-highlight-covers/`.** The playbook's original
plan was four Highlights using story frames as covers (*How it works · Real
claims · Stores · FAQ*). There are now **eight purpose-drawn covers** — How it
works · Stores · FAQ · Tips · Feedback · About · Support · Français — authored at
1080 × 1920 with everything inside a centred 640 px safe circle, because
Instagram crops a cover to a square, masks it to a circle and shows it at about
161 px.

The covers carry **no words**: at 161 px a phrase is a smudge, so the category
name is typed into Instagram as the Highlight title. That also means one icon set
serves both languages, which is the only way a bilingual account gets a
consistent tray.

Highlights still must be created from the Instagram **mobile app** — desktop web
and the Graph API do not expose Highlight creation. Step by step in
`04-community/HIGHLIGHTS.md`.
