# Every pack has a `POSTING-ORDER/` — read this once

Every content folder in `sm-content/` now carries a **numbered, self-contained
copy of its own content in exact posting order**, so the whole run can be read
top-to-bottom on GitHub — no cross-referencing a schedule file, a calendar doc,
or another pack's folder to know what goes out when, in what order, in which
language.

Nothing is renamed or deleted anywhere. These are **additive duplicates**.
Every render/verify/publish script keeps reading the original filenames it
always has.

| Pack | Where | Source of the order |
| --- | --- | --- |
| `05-highlights/*/` (each tray) | numbered files inside the tray's own folder | [`05-highlights/SEQUENCE.md`](05-highlights/SEQUENCE.md) — guard → EN → guard → FR, one tray per sitting |
| `05-highlights/` (whole build week) | `05-highlights/POSTING-ORDER/` | `05-highlights/schedule.json`, via `scripts/build-posting-order-copy.js` |
| `04-community/` | `04-community/POSTING-ORDER/` | `04-community/schedule.json`, via the same script |
| `evergreen/` | `evergreen/POSTING-ORDER/` | `evergreen/schedule.json`, via the same script |
| `teaser/` | `teaser/POSTING-ORDER/` | `teaser/TEASER-NOTES.md`'s calendar table (no `schedule.json` exists for this pack) |
| `carousels/` | `carousels/POSTING-ORDER/` | Numeric filename order — two carousel **posts** (EN, then FR), 10 slides each, not 10 separate posts |
| `stories/` | `stories/POSTING-ORDER/` | Numeric filename order — one **story sequence**, EN block then FR block |
| `statics/` | `statics/POSTING-ORDER/` | Numeric filename order — 3 independent single posts, EN/FR paired per colourway |
| `reels/` | `reels/POSTING-ORDER/` | The two languages, in the order `ASSET-PACK-NOTES.md` lists them |
| `04-community/08-reserve/` | *(none)* | Deliberately unordered — a swap-in pool, not a run. See `CALENDAR.md`. |

A slot with no pre-rendered asset (a poll-result screenshot, a Reel shot on the
day) gets a `*-MADE-ON-THE-DAY.txt` stub instead of a silent gap, carrying the
note from the schedule so the folder still reads as the complete run.

## Regenerating

Any pack with a `schedule.json`:

```bash
node scripts/build-posting-order-copy.js sm-content/<pack>
```

It wipes and rebuilds that pack's `POSTING-ORDER/` from the schedule, so it's
always safe to re-run after an edit. The two packs without a `schedule.json`
(`teaser/`, and the flat launch pack: `carousels/ statics/ stories/ reels/`)
were built by hand from the tables in their own docs — if their calendar
changes, redo the copy the same way and note it in this file.

## Why this exists

One highlight, one tray, one pack, one sitting — never mixed content from two
concepts posted together as one batch. A GitHub file listing is the fastest way
to confirm that before anything goes out by hand.
