# Material ideas to be created — the Price-Drop Guarantee campaign

> **The campaign:** *Subscribe to PriceBack Unlimited Annual. If PriceBack finds no
> price drop on your receipts during your first year, your next year of Unlimited is
> on us.* Maxim, 2026-09-25: "this will be our strongest marketing campaign (money is
> guaranteed)" — to be mentioned everywhere: website, app on launch, social, stores.
>
> This file is the **backlog of marketing materials to create** for it — what each
> one is, where it runs, what it must say, and what it must never say. Nothing here
> is made yet unless its row says **Done**.

---

## 0 · Gates — nothing is published before all three are true

The rule in [`sm-content/05-highlights/facts.json`](../sm-content/05-highlights/facts.json)
applies: **copy describes the app's `origin/main` only** — shipped, not planned.

| # | Gate | How to check |
| --- | --- | --- |
| 1 | The backend with the guarantee is **deployed to production** (migration `0012_price_drop_guarantee` applied, daily job running) | Admin → job runs shows `priceDropGuarantee`; `GET /api/me` returns a `guarantee` object |
| 2 | An **app release containing the guarantee screens is live in both stores** (launch sheet, onboarding slide, Home card, Guarantee screen) | The store version number ≥ the release that shipped it — see the GitHub release notes |
| 3 | **priceback.ca/guarantee is live** (EN + FR) with the official terms | Open both pages; the terms section is `#terms` |

When all three hold, add the guarantee facts to `facts.json` (§ 6) **first**, then publish.

---

## 1 · The offer, in the only words we use

| | English | Français |
| --- | --- | --- |
| **Name** | Price-Drop Guarantee | Garantie baisse de prix |
| **One line** | Find a price drop in your first year — or your next year is on us. | Une baisse de prix durant votre première année — ou l’année suivante est à nos frais. |
| **Plain version** | Subscribe to Unlimited Annual. If PriceBack finds no price drop on your receipts in your first year, we add another year of Unlimited to your account. | Abonnez-vous à l’Illimité annuel. Si PriceBack ne trouve aucune baisse de prix sur vos reçus durant votre première année, nous ajoutons une autre année d’Illimité à votre compte. |
| **Conditions line (mandatory)** | Annual plan only · at least 15 receipts scanned in the year · no refund · auto-renew on until we confirm · one guarantee year per account. Terms: priceback.ca/guarantee | Forfait annuel seulement · au moins 15 reçus numérisés dans l’année · aucun remboursement · renouvellement automatique activé jusqu’à notre confirmation · une année garantie par compte. Modalités : priceback.ca/guarantee-fr |

**Where "free" may and may not appear.** On social, the website and ads, "free" /
"on us" / "à nos frais" is accurate — the added year costs the customer nothing.
**Never** in App Store / Google Play screenshots or store text: App Review rejected
2.8.20 under Guideline 3.1.2(c) for a free-period word on a subscription, and the app
itself says *"we add another year of Unlimited to your account"* for that reason. Store
assets use the plain version.

---

## 2 · Claim rules for this pack

The evergreen gate ([`sm-content/evergreen/scenes/claims.js`](../sm-content/evergreen/scenes/claims.js))
**bans the word "guarantee"** — correctly: the product cannot guarantee a *retailer’s*
refund. This campaign’s guarantee is different in kind: it is **our own promise**, a year
of Unlimited that **we** grant, which we can always honour. So the guarantee pack needs
its **own** gate (a copy of the evergreen one, not an edit to it):

1. **Allow** "guarantee"/"garantie" **only** inside the program name — *Price-Drop
   Guarantee* / *Garantie baisse de prix*. "Savings guaranteed", "guaranteed refund",
   "money back guaranteed" stay **banned**: we guarantee a year of Unlimited, never a
   saving and never a retailer's refund.
2. **Require the conditions line** (§ 1) in every caption and, for single-frame art, in
   the art itself — the failure mode `legal/MARKETING_CLAIMS.md` names is "a claim
   clipped into a social card without its paired fine print". A carousel may carry it
   on its last slide **and** in the caption.
3. **Keep every evergreen ban** that is not about the guarantee: no retailer name (except
   in the community pack's non-affiliation frame), no claim window in days, no dollar
   figure, no percentage, no "you’ll get your money back".
4. **Say "money back" only about the store's price adjustment, and only as "claim".**
   Captions say **claim**, never **get** (playbook § 7).
5. **The auto-renew step is material.** Any asset longer than a single frame says, in
   some form: *"We tell you before your renewal — turn auto-renew off and the year is
   yours."* (Competition Act s. 74.01 / Quebec LPC s. 219 test the general impression;
   an offer that silently leads to a store charge would fail it.)
6. **No invented numbers.** "X drops found this month" posts use real figures from the
   admin segments, dated, or they don't run.

---

## 3 · Hooks bank (EN / FR)

Short, stealable lines. Each must still travel with the conditions line.

| # | English | Français |
| --- | --- | --- |
| H1 | Find a price drop in your first year — or your next year is on us. | Une baisse de prix durant votre première année — ou l’année suivante est à nos frais. |
| H2 | We're betting a year of Unlimited that we'll find you a price drop. | On parie une année d’Illimité qu’on vous trouvera une baisse de prix. |
| H3 | Either you claim a price drop, or you get a year of Unlimited. | Soit vous réclamez une baisse de prix, soit vous obtenez une année d’Illimité. |
| H4 | Your money works either way. | Votre argent travaille dans tous les cas. |
| H5 | No price drop all year? That's on us. | Aucune baisse de prix de l’année ? C’est à nos frais. |
| H6 | Scan 15 receipts. We'll handle the rest — or the next year. | Numérisez 15 reçus. On s’occupe du reste — ou de l’année suivante. |
| H7 | The only subscription that pays you back one way or another. | Le seul abonnement qui vous revient d’une façon ou d’une autre. |

H7 is the riskiest (it edges toward "pays you back"); run it only with the conditions
line in the art and after review.

---

## 4 · The materials

Status: **To create** unless marked. Bilingual = English and French in the same asset
(community-pack convention: EN, a *la suite en français* divider, FR).

| # | Material | Channel | Format | Status |
| --- | --- | --- | --- | --- |
| 1 | Launch carousel — "The bet" | Instagram + Facebook feed | 1080×1350, 7 slides, bilingual | To create |
| 2 | Launch Reel — "Either way" | Instagram Reels / FB / TikTok | 1080×1920, 15–20 s, EN + FR versions | To create |
| 3 | Story sequence + link sticker | Instagram Stories | 1080×1920, 5 frames, EN + FR | To create |
| 4 | "Plans" Highlight frame update | Instagram Highlights (`05-highlights/04-plans`) | 1080×1920, 2 frames (EN + FR) | To create |
| 5 | FAQ Highlight frames — "No drop all year?" | Instagram Highlights (`05-highlights/07-faq`) | 1080×1920, 2 frames | To create |
| 6 | Pinned post + bio line + link-in-bio | Instagram profile | text + link to priceback.ca/guarantee | To create |
| 7 | App Store screenshot frame | App Store (EN + FR) | 1290×2796 (6.7") + 2048×2732 (iPad if used) | To create |
| 8 | Google Play feature graphic + screenshot frame | Google Play (EN + FR) | 1024×500 + phone screenshot | To create |
| 9 | Store listing paragraph | App Store + Play descriptions (EN + FR) | text — drafted in the docs hub | Drafted (see § 5) |
| 10 | Website hero perk, #guarantee section, /guarantee page, terms | priceback.ca (EN + FR) | HTML | **Done** (Priceback-Website) |
| 11 | In-app launch announcement, onboarding slide, Home card, Guarantee screen | The app | — | **Done** (app repo) |
| 12 | Reddit launch post | r/PersonalFinanceCanada (and r/Quebec in FR) | text post, founder voice | To create |
| 13 | Paid Meta ad set | Meta Ads (IG + FB), Canada | 3 creatives (1:1, 4:5, 9:16) × EN/FR + primary text + headline | To create — **legal review before spend** |
| 14 | Referral tie-in graphic | IG story + in-app invite share image | 1080×1920 | To create |
| 15 | Press pitch / release | Local tech & consumer press (QC + ON) | 1 page EN + FR | To create |
| 16 | Monthly "drops found" proof post | IG feed | 1080×1350, real admin numbers only | To create (recurring, after launch) |
| 17 | First-winners story | IG + website | testimonial frame | **Later** — the first guarantee years are earned ~1 year after launch |

### Briefs

**1 · Launch carousel — "The bet".**
Slide 1: H2 over a receipt with a ribbon seal. 2: *"Scan your receipts."* 3: *"We watch
every item for a price drop — every day."* 4: *"Found one? Claim the difference at the
store."* 5: *"Found none all year? We add a year of Unlimited to your account."* 6: *"We
tell you before your renewal — turn auto-renew off and the year is yours."* 7: the
conditions line + priceback.ca/guarantee. Caption: H1 + conditions line. CTA: link in bio.

**2 · Reel — "Either way".** Split screen: left *"A price drop → claim it"*, right *"No
drop all year → next year on us"*; both land on *"Your money works either way"* (H4).
On-screen text carries the conditions line for the last 3 s. French cut with native VO or
French captions — never auto-translated.

**3 · Stories.** Poll frame ("Did you check your last receipt for a price drop?") → the
mechanic in 3 frames → link sticker to priceback.ca/guarantee.

**4–5 · Highlights.** Follow `05-highlights/HIGHLIGHTS.md`: bilingual end to end, one idea
per frame. The Plans tray gets the guarantee as its own frame after Unlimited. The FAQ
tray answers *"What if PriceBack finds nothing all year?"* and *"Will the store charge me
for the free year?"* (answer: not if you turn auto-renew off once we confirm; if it does,
your year starts after that paid year).

**7–8 · Store screenshots.** One frame: the Guarantee screen with the hero line *"Price-Drop
Guarantee"* and the plain version (§ 1). **No "free"** (3.1.2(c)). Must match what the
shipped binary shows — screenshot the real screen, don't mock one.

**12 · Reddit.** Founder voice, no marketing gloss: why we made the bet, the four
conditions verbatim, and the auto-renew caveat stated up front. Never name a retailer in
the title; follow each subreddit's self-promotion rules.

**13 · Meta ads.** Three angles — H1 (the promise), H3 (either/or), H6 (effort). Paid ads
are reviewed against a stricter bar than organic (playbook § 7): someone qualified reviews
the creative before spend. Landing page: priceback.ca/guarantee (EN) / guarantee-fr (FR).

**16 · Proof posts.** "PriceBack found N price drops in September" — N comes from the admin
segments on the day of posting, the date is printed, and the post says "found", not
"saved". No number, no post.

---

## 5 · Store listing paragraph (drafts — apply at the release that ships the guarantee)

**EN.** *Price-Drop Guarantee: subscribe to Unlimited Annual — if PriceBack finds no price
drop on your receipts in your first year, we add another year of Unlimited to your
account. Conditions: annual plan, at least 15 receipts scanned in the year, no refund,
auto-renew on until we confirm. One guarantee year per account. Full terms at
priceback.ca/guarantee.*

**FR.** *Garantie baisse de prix : abonnez-vous à l’Illimité annuel — si PriceBack ne
trouve aucune baisse de prix sur vos reçus durant votre première année, nous ajoutons une
autre année d’Illimité à votre compte. Conditions : forfait annuel, au moins 15 reçus
numérisés dans l’année, aucun remboursement, renouvellement automatique activé jusqu’à
notre confirmation. Une année garantie par compte. Modalités complètes :
priceback.ca/guarantee-fr.*

The same drafts live in the docs hub
(`Priceback-Documentations/Publishing-Compliance/REVIEWER_NOTES.md`).

---

## 6 · facts.json additions (make them when § 0 holds)

```json
"guarantee": {
  "_source": "backend/lib/priceDropGuarantee.js + config/defaults.js on origin/main",
  "name": { "en": "Price-Drop Guarantee", "fr": "Garantie baisse de prix" },
  "plan": "Unlimited, annual billing only",
  "minReceipts": 15,
  "checkDaysBeforeRenewal": 14,
  "oncePerAccount": true,
  "coversYearsStartingOnOrAfter": "2026-09-25",
  "reward": "one year of Unlimited, added by PriceBack (not a store purchase)",
  "termsUrl": { "en": "https://priceback.ca/guarantee", "fr": "https://priceback.ca/guarantee-fr" }
}
```

`minReceipts`, the check window and the start date are live settings in the app's
`app_config` table (`GUARANTEE_MIN_RECEIPTS`, `GUARANTEE_NOTICE_DAYS`,
`GUARANTEE_START_DATE`). Re-read them before each pack is rendered — a caption that says
15 when the app says 12 is a false claim in the customer's favour, and still a false claim.

---

## 7 · What to measure

| Metric | Why | Source |
| --- | --- | --- |
| Share of new subscriptions that are Annual | the campaign's job is to move people to Annual | Admin segments → By subscription |
| /guarantee visits → store clicks | whether the page converts | site analytics |
| Covered years enrolled | how many annual years are under the guarantee | `price_drop_guarantees` (status `enrolled`) |
| Years ending **with** a price drop | the product doing its job — the number to celebrate | status `lost_price_drop` |
| Guarantee years granted | the campaign's cost | status `granted` / `completed` |

---

## 8 · Launch-week running order (suggested)

| Day | Asset |
| --- | --- |
| D0 | Pinned carousel (1) + bio link (6) + stories (3) |
| D1 | Reel (2) |
| D2 | Highlights updated (4, 5) |
| D3 | Reddit post (12) |
| D4 | Referral tie-in (14) |
| D5+ | Paid set (13) once reviewed; press pitch (15) |

Then hand back to the evergreen rotation, with the guarantee carousel re-surfaced monthly.
