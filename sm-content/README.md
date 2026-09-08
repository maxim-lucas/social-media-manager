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
| `04-community/` | 84 | The **recruiting** pack — 14 bilingual carousel posts, 16 story pairs (5 in the run, 11 living inside the Highlights), 6 unscheduled reserve pairs, the bilingual language notice, 2 carousel dividers, 8 Highlight covers and 6 Reel scripts. Its own folder, renderer and 24-day run |

Total: 38 launch + 20 teaser + 38 evergreen + 84 community = 180 assets.

## Running order

Four packs now exist and they run in this sequence. **Only the newest carries its
number in the folder name.** Renaming the other three would break every `asset`
path in `evergreen/schedule.json`, the teaser notes and this file's own links,
for a cosmetic gain — so the order lives here instead, and new packs are numbered
from now on.

| # | Folder | Job | When |
| --- | --- | --- | --- |
| 01 | `teaser/` | Withholds. Names nothing. | The eleven days before launch |
| 02 | `reels/ carousels/ statics/ stories/` | Explains the launch. | Launch week |
| 03 | `evergreen/` | Describes the mechanic, store-agnostically. | Rotates forever |
| 04 | `04-community/` | Recruits: solidarity, made-in-Canada, the growing store list, earning credits. | Mon 21 Sep → Mon 19 Oct 2026, then hand back to `evergreen/` |

Inside `04-community/` the same idea goes one level deeper: its wave folders are
numbered `00`…`06` in publish order, and each asset's filename carries a global
`seq`, so `03-stores-growing/priceback-community-09-post-en.png` is the ninth
thing that goes out and it is about stores. `verify.js` gate 9 fails the build if
that stops being true.

## Three packs, in order

`teaser/` runs **first**, before any of the above: four numbered feed posts and
six story frames on thermal-receipt paper that never name the product, the
category or a retailer. It is built to look like it came from somewhere else,
so the launch pack lands as the answer to it. Read `teaser/TEASER-NOTES.md`.

`04-community/` runs **after evergreen's first fortnight, once.** It is the only
pack that asks for something — a follow, a comment, a contribution — and the only
one allowed to name a retailer, which it pays for by rendering the
non-affiliation line into the art of every frame that does. Every feed post is a
bilingual carousel: English, a divider that says *la suite en français*, French.
Read `04-community/COMMUNITY-NOTES.md`, `HOOKS.md` for the forty unrendered hooks
in its register, and `HIGHLIGHTS.md` for the Highlight covers and their sizes.

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
