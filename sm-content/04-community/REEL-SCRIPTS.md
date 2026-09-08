# Reels — six scripts, shot on a phone, using the pack's own frames

Shot lists, not footage. Everything here is shootable in an afternoon with a
phone, a receipt, and the PNGs already in this folder.

**Why Reels at all, when the pack is fourteen carousels.** A carousel is served
to people who already follow the account. A Reel is served to people who do not.
For a launch whose entire problem is *nobody has heard of this*, that is the
whole difference, and it is why the two strongest hooks in the pack get a Reel
each rather than only a post.

---

## The rules these obey

| Rule | Why |
| --- | --- |
| **The hook is in the first 1.5 seconds, spoken AND on screen** | Sound-off is the default. A Reel whose hook is only in the voiceover has no hook. |
| **9:16, 1080 × 1920, no letterboxing** | The pack's story frames are already this size and drop straight in as cuts. |
| **Nothing enters the safe zones** | `SAFE.story` in `scenes/tokens.js`: 250 top, 320 bottom, 96 left, **200 right** for the action rail. Burned-in captions go in the middle third. |
| **In-app audio, picked at post time** | Never a file. Trending audio is chosen in Instagram the minute you post, which is also why no Reel here can ever be automated. |
| **Under 30 seconds unless the script says otherwise** | These are recruitment, not explanation. The explaining is what the Highlights are for. |
| **Same claim rules as the art** | No figure, no percentage, no window in days, no "guarantee", no implied partnership. `scripts/check-copy.js` reads the **On screen** and **Voice** columns and the `FR take` lines through this pack's own `claims.js`, so a Reel line is gated exactly like a caption. It cannot read the **Shot** column, which is direction — a shot that films a price tag is still yours to catch. |
| **Both languages, shot separately** | Not subtitled. A French Reel with English audio is an English Reel with an apology on it. Shoot the French take the same afternoon, same setup. |

**Burned-in captions are not optional.** Instagram's auto-captions get *reçu*,
*PriceBack* and every store name wrong, and a Reel about receipts whose captions
say "resume" is a Reel about nothing.

---

## R1 — "Nobody beats inflation alone" · 18s · the launch Reel

The one to shoot first. It is post 02 as a Reel and it carries the whole pack.

| # | Time | Shot | On screen | Voice |
| --- | --- | --- | --- | --- |
| 1 | 0.0–1.5 | Hands drop a long receipt onto a dark table. Overhead, one light. | **NOBODY BEATS INFLATION ALONE.** | "Nobody's beating inflation on their own." |
| 2 | 1.5–4.0 | Same shot, thumb runs down the receipt. | — | "Same cart. Same list. Bigger number at the bottom." |
| 3 | 4.0–7.0 | Cut to `01-together/…-02-post-en.png`, hold, slow push in. | — | "And no, you're not bad with money. It got expensive." |
| 4 | 7.0–11.0 | Phone in frame, scanning the receipt. Real app, real scan. | — | "Here's the part that's actually in reach. When a price drops after you've paid, a lot of Canadian retailers will adjust it." |
| 5 | 11.0–14.5 | Close on the phone: a price-drop notification arriving. | — | "If you ask. If you can prove what you paid. If you find out in time." |
| 6 | 14.5–18.0 | Cut to `01-together/…-04-post-en.png` (*If one of us finds it, all of us save*), hold. | **@priceback.ca** | "Most people never find out. That's the part we can fix — together." |

**FR take:** same shots. "Personne ne bat l'inflation tout seul." … "Et non, vous
n'êtes pas mauvais avec l'argent. C'est devenu cher." … "La plupart des gens ne
l'apprennent jamais. C'est ça qu'on peut changer — ensemble."

**Ask:** send it to whoever you complain about prices with.

---

## R2 — "Costco was the start" · 15s · the follow Reel

The only Reel with a follow ask, because it is the only one with a real
recurrence behind it.

| # | Time | Shot | On screen | Voice |
| --- | --- | --- | --- | --- |
| 1 | 0.0–1.5 | Hard cut onto `03-stores-growing/…-09-post-en.png`. No motion. | **COSTCO WAS THE START.** | "Costco was the start. It was never the point." |
| 2 | 1.5–5.0 | Slow pan down the frame to the ticked list. | — | "Two chains have a reader built for the way they print a receipt." |
| 3 | 5.0–9.0 | Real receipts fanned on the table, several chains, faces of the totals turned away. | — | "Every chain formats differently. Each one is real work, not a switch we flip." |
| 4 | 9.0–12.0 | Back to the frame, the two empty checkboxes filling the shot. | — | "The list only grows in one direction." |
| 5 | 12.0–15.0 | Hold on the empty boxes. | **NEW STORES GET ANNOUNCED HERE FIRST** · **@priceback.ca** | "And new stores get announced here first." |

> **This Reel names a retailer, so the non-affiliation line has to be visible in
> it**, not only in the caption. Shot 1 already carries it — the frame renders it
> — so do not crop the bottom of that frame, and hold it long enough to read.
> A caption disclaimer does not survive a screenshot, and a Reel is screenshotted
> constantly.

**FR take:** "Costco était le début. Ça n'a jamais été le but." … "Les nouveaux
magasins s'annoncent ici en premier."

**Ask:** follow.

---

## R3 — "Point your camera at a shelf tag" · 12s · the how-to

The only Reel that is a demo, and it is short on purpose: the entire selling
point is that the contribution takes five seconds, so a 40-second explanation of
it argues the opposite.

| # | Time | Shot | On screen | Voice |
| --- | --- | --- | --- | --- |
| 1 | 0.0–1.5 | POV walking down a warehouse aisle, phone half-raised. | **THIS EARNS CREDITS.** | "This earns credits." |
| 2 | 1.5–4.5 | Phone raised, camera frames a shelf tag, shutter. Real app. | — | "Point it at a shelf tag. That's the whole thing." |
| 3 | 4.5–8.0 | Cut to `07-highlight-frames/…-08-story-en.png`. | — | "Other shoppers see the same tag. When enough agree, the price is verified." |
| 4 | 8.0–12.0 | Close on a credit balance ticking up. **Do not show a dollar figure.** | **@priceback.ca** | "Then it credits. Not before — a price one person saw is a rumour." |

**Careful:** shot 4 must not put a number on screen that reads as money. A credit
balance is fine; a dollar amount is a figure this pack may not print. If the app
shows both, crop.

**FR take:** "Ça, ça rapporte des crédits." … "Pas avant — un prix vu par une
seule personne, c'est une rumeur."

**Ask:** save.

---

## R4 — "Made here" · 10s · the face Reel

The only one with a person in it, and the only one that should be.

| # | Time | Shot | On screen | Voice |
| --- | --- | --- | --- | --- |
| 1 | 0.0–2.0 | Straight to camera, handheld, no set. Daylight. | **MADE HERE.** | "This app is made in Canada." |
| 2 | 2.0–6.0 | Same, still talking. | — | "Built here, run from here, and when you write to support, I'm the one who answers." |
| 3 | 6.0–10.0 | Cut to `02-made-in-canada/…-03-story-en.png` (the leaf frame). | **@priceback.ca** | "Choosing it doesn't cost you a cent more. It just decides who gets to build the tools we all use." |

**Shoot it badly on purpose.** Handheld, no ring light, no set. A polished
made-in-Canada Reel from a one-person operation reads as an agency's idea of one;
the whole claim of this Reel is that there is a person, and a person looks like a
person.

**FR take:** "Cette application est faite au Canada." … "Ça décide seulement qui
bâtit les outils qu'on utilise tous."

**Ask:** send.

---

## R5 — "What went up the most in your cart?" · 8s · the comment bait

Deliberately the cheapest thing here to shoot, because its job is entirely in the
comments.

| # | Time | Shot | On screen | Voice |
| --- | --- | --- | --- | --- |
| 1 | 0.0–2.0 | Hold on `01-together/…-05-post-en.png`. | **WHAT WENT UP THE MOST?** | "What went up the most in your cart?" |
| 2 | 2.0–5.0 | Cutaways, one second each: coffee, olive oil, an empty shelf hook. | — | "Coffee? Olive oil? The thing you quietly stopped buying?" |
| 3 | 5.0–8.0 | Back to the post frame with its blank ruled lines. | **COMMENTS ↓** | "Put it in the comments. We're building the list." |

**Reply to every comment for the first 48 hours.** A comment-bait Reel with an
unanswered comment section is worse than no Reel: it recruited people and then
showed them nobody was home.

**FR take:** "Qu'est-ce qui a le plus monté dans votre panier?"

**Ask:** comment.

---

## R6 — "Le français suit toujours" · 8s · the bilingual Reel

Shot **in French, with English subtitles** — the inverse of every other Reel
here, and the point.

| # | Time | Shot | On screen | Voice |
| --- | --- | --- | --- | --- |
| 1 | 0.0–2.0 | Hold on `00-language-notice/…-01-story.png`. | **LE FRANÇAIS SUIT TOUJOURS.** *(English sub under it)* | "Ici, le français n'est pas une traduction ajoutée après coup." |
| 2 | 2.0–5.0 | Screen recording: swiping an actual carousel, English → divider → French. | — | "Chaque publication existe dans les deux langues. Vous glissez, et c'est là." |
| 3 | 5.0–8.0 | Hold on the divider slide. | **@priceback.ca** | "Si vous voyez de l'anglais, la suite existe. Elle est à un glissement." |

Shot 2 is the whole Reel — **film a real swipe on a real post**, not a mock-up. A
promise about a thing you can see happening is a different object from a promise
about a thing described.

**Ask:** follow.

---

## Shooting notes

- **Receipts on camera must be yours, and the totals must be unreadable.** Turn
  the face away, or let it fall out of focus. Every amount in this pack is a
  black bar for a reason; a legible total in a Reel walks straight around it.
- **Never film a store's signage, logo or shelf branding.** R2 and R3 are the
  temptations. Shelf tags with a chain's mark on them, storefronts, aisle
  signs — all of it turns a non-affiliation problem into a trademark one for no
  gain, since the frames already say the store's name in type we control.
- **Shoot the French take the same afternoon.** Different day means different
  light, different shirt, different energy, and the French Reel ends up visibly
  the B-take. It should not be possible to tell which language was shot first.
- **Export at 1080 × 1920, 30fps, no letterbox.** Instagram re-encodes anyway;
  giving it a letterboxed source just bakes the bars in.
- **The rendered frames are already safe-zone clean** — `verify.js` gate 2
  asserts it. Any cut that uses one full-frame inherits that. Any cut that scales
  or crops one does not, so check the rail by eye.

## Order to shoot them

R1 and R2 first — they carry the launch hook and the follow ask, and everything
else can wait for a second afternoon. R6 is third if the account is getting any
French traffic at all, because it is the one that tells that traffic to stay.

R3, R4, R5 are a second session. R4 needs daylight; the rest do not care.
