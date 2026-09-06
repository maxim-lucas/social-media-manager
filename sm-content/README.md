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

Total: 38 launch assets + 20 teaser assets.

## Two packs, in order

`teaser/` runs **first**, before any of the above: four numbered feed posts and
six story frames on thermal-receipt paper that never name the product, the
category or a retailer. It is built to look like it came from somewhere else,
so the launch pack lands as the answer to it. Read `teaser/TEASER-NOTES.md`.

Unlike the launch assets, the teaser ships its own source — edit
`teaser/scenes/strings.json` and re-render rather than editing a PNG.

## Read first

- `ASSET-PACK-NOTES.md` — what each asset is, the three pre-post fixes (store badges,
  in-app audio, claim screen), story sticker placement, and the compliance rules baked
  into the copy.
- Launch playbook (ranking signals, profile setup, captions EN/FR, hashtags, 4-week
  calendar): claude.ai artifact `e9375fa1-99a1-4f30-9165-d9d0d93ae90f`.

## Highlights

Per the playbook, the four Story Highlights use the 9:16 story frames as covers, in order:
**How it works · Real claims · Stores · FAQ**. Highlights must be created from the
Instagram mobile app — desktop web does not expose Highlight creation.
