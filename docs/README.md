# docs — social media documentation

Everything social-media related for PriceBack lives in **this repo**, not in
`Priceback-Documentations`. That is the standing exception to the app repo's
`CLAUDE.md` rule that all documentation goes to the docs hub: the assets, the
schedule, the publisher and the guidance are one system, and splitting the
guidance from the thing it governs is how the two drift.

`Priceback-Documentations/Marketing-Plan/` keeps a pointer here.

## Contents

| File | What |
| --- | --- |
| [`instagram-playbook.md`](instagram-playbook.md) | **Read this one.** The working playbook — ranking signals, profile setup, cadence, the follow mechanism, bilingual strategy, what to measure, and the claim rules. |
| [`archive/instagram-launch-playbook-2026-08.html`](archive/instagram-launch-playbook-2026-08.html) | The August 2026 launch playbook, archived verbatim from claude.ai artifact `e9375fa1-99a1-4f30-9165-d9d0d93ae90f`. Superseded, but kept: its ranking-signal and profile detail is still accurate and is where the current playbook came from. |

## Where the rest is

| | |
| --- | --- |
| The reusable graphics every pack imports | [`../sm-content/brand/`](../sm-content/brand/) |
| The Highlight tray — ten trays, their covers and how to build them | [`../sm-content/05-highlights/HIGHLIGHTS.md`](../sm-content/05-highlights/HIGHLIGHTS.md) |
| The product facts marketing copy is allowed to rely on | [`../sm-content/05-highlights/facts.json`](../sm-content/05-highlights/facts.json) |
| The current content pack, its gates and its 14-day run | [`../sm-content/evergreen/`](../sm-content/evergreen/) |
| The hook system — the reusable part | [`../sm-content/evergreen/HOOK-BANK.md`](../sm-content/evergreen/HOOK-BANK.md) |
| The schedule (single source of truth for captions) | [`../sm-content/evergreen/schedule.json`](../sm-content/evergreen/schedule.json) |
| Turning on automated posting | [`../sm-content/evergreen/AUTOMATION.md`](../sm-content/evergreen/AUTOMATION.md) |
| The launch and pre-launch packs | [`../sm-content/`](../sm-content/) |

## Why the launch playbook was superseded

It was written around one retailer and one claim window. Both were correct in
August 2026 and both are now moving targets — a second store is live and more
are queued, and every retailer sets its own terms. Collateral that names a store
or prints a number of days becomes *wrong* the day a store with different terms
goes live, and goes on being posted anyway.

The current playbook and the evergreen pack talk about the mechanic instead, and
that constraint is enforced mechanically rather than remembered:
`sm-content/evergreen/scenes/claims.js` fails the build on a retailer name, a
window in days, a currency figure, a percentage or a promise — in either
language, in the art and in the captions.
