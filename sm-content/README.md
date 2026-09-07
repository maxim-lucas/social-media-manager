# sm-content — PriceBack social media assets

Output assets from Cowork session `cse_01QJzpqDCPqZ4HAHmNa7UfXK`
("Instagram and Reddit launch materials"), plus the launch playbook they were built alongside.

## Folders

| Folder | Count | What |
| --- | --- | --- |
| `reels/` | 2 | 1080×1920 hook Reels, 17.5s — EN + FR (`priceback-reel-hook-{en,fr}.mp4`) |
| `carousels/` | 20 | 1080×1350 feed carousel, 10 slides each — EN + FR (`priceback-carousel-{en,fr}-01..10.png`) |
| `statics/` | 6 | 1080×1350 feed singles, 3 colourways — EN + FR (`priceback-static-{en,fr}-01..03.png`) |
| `stories/` | 10 | 1080×1920 story sequence, 5 frames each — EN + FR (`priceback-stories-{en,fr}-01..05.png`) |
| `teaser/` | 20 | The **pre-launch** pack — see below. Its own folder, its own renderer |
| `evergreen/` | 38 | The **permanent** pack — 9 feed posts + 10 story frames, EN + FR, store-agnostic. Its own folder, its own renderer, its own 14-day schedule |

Total: 38 launch assets + 20 teaser assets + 38 evergreen assets.

## Three packs, in order

`teaser/` runs **first**, before any of the above: four numbered feed posts and
six story frames on thermal-receipt paper that never name the product, the
category or a retailer. It is built to look like it came from somewhere else,
so the launch pack lands as the answer to it. Read `teaser/TEASER-NOTES.md`.

`evergreen/` runs **last, and then keeps running.** The launch pack was built
around one retailer and one claim window; both are now moving targets, and an
asset that prints either becomes wrong the day a store with different terms goes
live. The evergreen pack describes the mechanic instead — no retailer named, no
window in days, no figure printed, in either language — so it survives the store
list growing, which is also the thing it is built to make people follow for.
Read `evergreen/EVERGREEN-NOTES.md`, and `evergreen/HOOK-BANK.md` for the part
worth keeping after the nine frames are spent.

Unlike the launch assets, the teaser and evergreen packs ship their own source —
edit `scenes/strings.json` and re-render rather than editing a PNG.

## Read first

- `ASSET-PACK-NOTES.md` — what each asset is, the three pre-post fixes (store badges,
  in-app audio, claim screen), story sticker placement, and the compliance rules baked
  into the copy.
- `evergreen/CALENDAR.md` — the 14-day run, and `evergreen/AUTOMATION.md` for the
  scheduled publisher (`scripts/publish-due.js`).
- `../docs/instagram-playbook.md` — the working playbook. It supersedes the August
  2026 launch playbook, which is archived at
  `../docs/archive/instagram-launch-playbook-2026-08.html` (claude.ai artifact
  `e9375fa1-99a1-4f30-9165-d9d0d93ae90f`).

## Highlights

Per the playbook, the four Story Highlights use the 9:16 story frames as covers, in order:
**How it works · Real claims · Stores · FAQ**. Highlights must be created from the
Instagram mobile app — desktop web does not expose Highlight creation.
