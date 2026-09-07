# Automating the posting

What runs by itself, what cannot, and how to switch it on.

---

## The short version

```bash
node scripts/publish-due.js --print          # the fortnight as an agenda
node scripts/publish-due.js --check          # validate every slot, no network
node scripts/publish-due.js                  # DRY RUN — what would post now
node scripts/publish-due.js --write          # actually publish what is due
node scripts/publish-due.js --only=d12-post-07 --write   # one slot, by hand
```

`.github/workflows/social-publish.yml` runs the same script on a cron. **It is
switched off.** Until the repository variable `PUBLISH_ENABLED` is set to
`true`, every scheduled run does a dry run and prints what it would have posted.

---

## Turning it on

1. **Instagram account must be Professional → Business**, public, and linked to
   a Facebook Page. Creator accounts cannot use content publishing.
2. **Get a long-lived token** with `instagram_content_publish` (and
   `instagram_basic`, `pages_show_list`) from
   <https://developers.facebook.com/apps>.
3. **Repository → Settings → Secrets and variables → Actions:**
   - Secret `META_INSTAGRAM_BUSINESS_ACCOUNT_ID`
   - Secret `META_INSTAGRAM_ACCESS_TOKEN`
   - Variable `PUBLISH_ENABLED` = `true`
4. **Dry-run it first** from the Actions tab: *Social publish → Run workflow →
   dry run ✓*. Read the caption it prints. Then run one real slot with
   `only: d01-post-01` and `dry run ✗`, and look at the account.
5. Only then leave the cron to it.

Long-lived tokens expire after about 60 days. When one does, the script prints
`the access token is invalid or expired; regenerate it` — that is Meta error
code 190 and no amount of retrying fixes it.

---

## How the images reach Meta

Instagram's publishing flow does not accept an upload. It takes a **public
URL** and fetches the image itself, so the assets have to be reachable from
Meta's servers.

The default is `raw.githubusercontent.com`, pointed at this repo and the branch
the workflow is running on (`ASSET_REF`). That works as long as the repo is
public. If it goes private, set `ASSET_BASE_URL` to a bucket or CDN instead —
the script only ever joins it with the slot's `asset` path.

A container that Meta cannot fetch reports `ERROR`, and the script surfaces that
rather than retrying: a bad URL does not become good by polling longer.

---

## The four properties worth knowing about

**1 · Dry run by default.** Posting to a live public account is irreversible, so
it takes an explicit `--write`. There is no config that makes writing the
default, and the workflow additionally requires `PUBLISH_ENABLED`.

**2 · Never twice.** Every publish is recorded by slot id in
`published.json`, and a recorded slot is skipped forever. Cron overlap, a
workflow retry, a re-run after a network blip — none can double-post. The
workflow also holds a `concurrency` group so two runs cannot read the ledger
before either writes it.

**3 · Never late.** A slot is publishable only inside a window after its
scheduled time (6 hours; `PUBLISH_WINDOW_HOURS`). A runner that was down for two
days must not wake up and dump four posts into the feed at once. Those slots are
reported `MISSED` and left for a person:

```
MISSED  d05-post-03 — scheduled 2026-09-11 18:30, 41.2h ago, past the 6h window.
        Post it by hand with --only=d05-post-03 if it is still worth posting.
```

`--only` bypasses the window in both directions, because a human naming a slot
id has already made the decision the window exists to protect.

**4 · The disclaimer cannot be forgotten.** It is appended here, to every
caption, from one string in `schedule.json`. See
[`CALENDAR.md § The disclaimer`](CALENDAR.md).

---

## What is deliberately not automated

| | Why |
| --- | --- |
| **Stories** | The sticker *is* the content — the art leaves an empty band for a poll, quiz, question, slider or link, and the Graph API cannot attach one. An automated story would publish the frame with a hole in it. |
| **Reels** | Want Instagram's own audio picked at post time. In-app audio helps reach more than an uploaded voice-over does. |
| **Highlights** | Cannot be created from desktop web or the Graph API at all — mobile app only. |
| **Comment replies** | The cheapest ranking input there is, and the one thing that has to sound like a person. |

`--check` enforces this: a slot with `automate: true` and a kind other than
`feed` fails validation.

---

## Two scripts, two jobs

| Script | Needs | Runs |
| --- | --- | --- |
| `scripts/publish-due.js --check` | Node only | CI, on every PR touching the pack |
| `scripts/check-copy.js` | Node only | CI — the claim gate, over art copy *and* captions |
| `sm-content/evergreen/scenes/verify.js` | sharp + Roboto fonts | locally, after any copy change |

The visual gates are not run in CI on purpose. `render.js` resolves fonts
through the *system* font list, and a runner's font versions will not match the
build machine's — a CI render would either fail spuriously or quietly redefine
what correct means. What CI checks are facts about the files; what a human
checks are facts about the pixels.

---

## Relationship to `/api/publish`

`scripts/publish-due.js` talks to the Graph API directly, mirroring
`src/lib/metaPublish.ts` (the Next.js route's implementation) rather than
calling it. The reason is that the cron runs in GitHub Actions where no server
exists, and requiring a deployment in order to post a scheduled image is a worse
dependency than a second copy of a documented two-call flow.

**They are the same flow and must change together.** Both create a media
container, poll it until Meta reports `FINISHED`, then publish the container id.
