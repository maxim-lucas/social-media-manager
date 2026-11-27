# social-media-manager — PriceBack social media

Everything PriceBack publishes on social media (@priceback.ca on Instagram and Facebook, plus YouTube and TikTok
videos and the paid Meta ads): the content, the rules, the automation that posts it, and a small dashboard.

> **Read [`RULES-README.md`](RULES-README.md) before making anything.** It holds every standing rule and wins over
> any pack's own notes.

## Where things are

| Path | What |
|---|---|
| [`RULES-README.md`](RULES-README.md) | **The rules.** Deal posts, design, wording, videos, app facts, weekly automation, paid ads |
| [`sm-content/`](sm-content/) | **The content**, one numbered folder per pack. The map of every pack, in order: [`sm-content/README.md`](sm-content/README.md) |
| [`sm-content/08-costco-price-drops/`](sm-content/08-costco-price-drops/) | The house style and the weekly automated price-drop posts (`STYLE.md`, `weekly/ROUTINE.md`) |
| [`sm-content/14-new-version-ads/`](sm-content/14-new-version-ads/) | The Meta Ads for the new version, named for upload (`ready-to-upload/EN`, `ready-to-upload/FR`) |
| [`docs/`](docs/) | Strategy and playbooks: the Instagram playbook, the weekly automation design, the material backlog |
| [`scripts/`](scripts/) | Automation: `publish-due.js` (evergreen publisher), `check-copy.js` (copy gate), `weekly/` (weekly price-drop builder and publisher) |
| [`.github/workflows/`](.github/workflows/) | The scheduled jobs: `social-publish`, `weekly-snapshot`, `weekly-publish`, and `social-check` on every content change |
| [`src/`](src/) | The publish dashboard (Next.js): `src/components/PublishDashboard.tsx`, Meta publishing in `src/lib/metaPublish.ts` |

## Don't move these

The publishing jobs read files by path: `sm-content/evergreen/`, `sm-content/teaser/` and
`sm-content/08-costco-price-drops/` (and their `schedule.json` / `published.json`). Moving or renaming them breaks live
posting. Why, and how new packs are added instead: [`sm-content/README.md`](sm-content/README.md).

## Checks

```bash
node scripts/check-copy.js                                   # every pack's copy gate
node scripts/publish-due.js --pack=evergreen --check         # a pack's schedule (also 04-community, 05-highlights)
node --test scripts/weekly/lib/*.test.js                     # the weekly automation's unit tests
```

## The dashboard

```bash
npm install
npm run dev        # http://localhost:3000
```

The app needs the environment in `.env.example`.

## Related

Product strategy and the marketing plan live in `Priceback-Documentations` (`Marketing-Plan/`); social media guidance
lives here, next to the content it governs (see [`docs/README.md`](docs/README.md)).
