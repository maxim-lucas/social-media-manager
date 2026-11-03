# Voice-over: supported stores (feature video)

Same rules as the Kickstarter video (SCRIPT.md, RULES-README §5b): real app design from the code, real data, the
voice first and the picture timed to it, English first (French on hold), no call to action in the voice.
`FILM=stores tools/voiceover.py` reads this table.

| # | On screen | English | Français (on hold) |
| --- | --- | --- | --- |
| 1 | Home → Stores tab → Costco, Featured, 30 days | PriceBack starts with Costco: thirty days to claim a price drop. | PriceBack commence par Costco : trente jours pour réclamer une baisse de prix. |
| 2 | The list scrolls: Best Buy, Home Depot, Rona, Sport Chek, The Source — coming soon | Next, more Canadian stores with a price guarantee: Best Buy, Home Depot, Rona, Sport Chek. | Ensuite, d'autres magasins canadiens avec une garantie de prix : Best Buy, Home Depot, Rona, Sport Chek. |
| 3 | Tap Best Buy → "Best Buy — coming soon" → Notify me when it launches | Tap one, and we'll tell you the moment it launches. | Touchez-en un, et on vous prévient dès son lancement. |
| 4 | "You'll be notified when Best Buy launches" | The goal: every store that pays you back when prices drop, in Canada and beyond. | L'objectif : tous les magasins qui vous remboursent quand les prix baissent, au Canada et ailleurs. |

## Facts behind each line

- The store list is prod's `priceback.stores` as the app receives it (`storePoliciesRepo`: visible stores with a
  short name): Costco enabled (Wholesale, 30 days, last verified April 25, 2026); Best Buy (30), Home Depot (30),
  Rona (30), Sport Chek (15), The Source / Best Buy Express (30) visible as Coming soon, with their real policy notes.
- Screens and labels: `StoresAndProfileScreens.js` `StoresScreen` (Supported Stores, "1 available now · 5 more
  coming soon", search, categories, Featured, days, Coming soon + lock), the launch sheet (`stores.disabledTitle`,
  `disabledBody`, `notifyMe`, Close) and the subscribed row (`stores.notifyMeAdded`); brand chips from
  `components/Icons.js` `BRAND_MARKS`.
- Line 1: Costco's note ("if a Costco price drops within 30 days of your purchase, Costco refunds the difference").
- Line 2: each of these stores has a price guarantee (notes in prod); they are on the roadmap, not live.
- Line 3: `stores.disabledBody` ("we'll let you know the moment it goes live").
- Line 4: Maxim's stated roadmap (Costco abroad, then each country's stores with a price-adjustment policy).
