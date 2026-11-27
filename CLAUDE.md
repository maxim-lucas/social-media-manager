# social-media-manager: read this first

PriceBack's social media: the content (`sm-content/`), the rules (`RULES-README.md`), the publishers
(`scripts/`, `.github/workflows/`) and a dashboard (`src/`). Repo map: `README.md`.

## Finding things

- **A content pack is found through `sm-content/packs.json`, by its key, never by guessing a folder name.**
  `node scripts/lib/packs.js list` prints every key and folder; `node scripts/lib/packs.js dir <key>` prints one
  (e.g. `price-drops` → `sm-content/08-costco-price-drops`, `evergreen` → `sm-content/03-evergreen`). In code:
  `require("./scripts/lib/packs").dir("<key>")`. Never write `path.join("sm-content", "<folder>")` in a script or a
  workflow.
- The weekly price-drop routine: key `price-drops`, `weekly/ROUTINE.md` inside that folder.
- The rules that govern all content: `RULES-README.md` (it wins over any pack's notes). Each pack's own notes file is
  listed in `sm-content/README.md`.

## Moving or adding a folder

`git mv` it, update its `"dir"` in `sm-content/packs.json` (or add a key for a new pack, next free number), then run
`node scripts/lib/packs.js check`. `social-check` runs the same check on every content change.

## Before you push

```bash
node scripts/lib/packs.js check
node scripts/check-copy.js
for s in sm-content/*/schedule.json; do node scripts/publish-due.js --pack="$(basename "$(dirname "$s")")" --check; done
node --test scripts/weekly/lib/*.test.js
```
