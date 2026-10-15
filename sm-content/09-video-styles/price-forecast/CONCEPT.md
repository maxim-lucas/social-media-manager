# The Price Forecast: Priceback's weekly viral format

2026-10-15

## Verdict

Yes, it can work, and it fits Priceback better than most apps could, with one condition: the show has to be about money Canadians are owed, not about deals.

- **It fits the concept.** Priceback's whole job is catching price drops after you bought something. Costco flyers reset weekly, so a weekly show is the app's own rhythm, not a marketing gimmick.
- **The data is real.** The backend already stores verified prices per province, weekly flyer prices (regular vs sale), price-tag scans with instant savings, and every price-drop alert sent with its dollar amount.
- **The honest limit.** Today it's Costco only, and crowd prices are thin outside the big provinces. The show must say "based on what Priceback users scanned" and never invent a number for a province with no data. A thin province is itself content ("Manitoba, we can't see you yet, scan a receipt").
- **Deal accounts are saturated.** Costco deal creators already post several times a week with millions of followers. Another "hot deals this week" account would drown. The new angle is the refund nobody claimed.

## The idea: "The Price Forecast" (La Météo des prix)

A 45-second weekly weather report for Canadian prices, delivered by a deadpan forecaster standing in front of a map of Canada.

Price drops are weather. A big flyer markdown in Ontario is a "cold front of savings sweeping the GTA". A province where prices rose is a "heat warning". Items still inside their price-adjustment window are a "refund storm: claim before Sunday". Every episode ends on one number: **the money Canadians could claim back this week**, a running national counter that grows week after week.

It's bilingual by design. The French version (Météo des prix) is its own episode, not subtitles, because Quebec watches its own météo.

## Why it's different

| What's out there | What it does | Where The Price Forecast differs |
| --- | --- | --- |
| Costco deal accounts | "Hot finds this week" shelf walks, several posts a week | Not deals: refunds you're owed on things you already bought |
| Price-shock videos | A creator reacts to one store's prices (the Arctic grocery walk-through hit 17M views in 48 hours, Aug 2026) | Compares provinces every week with real numbers, so the shock repeats on schedule |
| Your cartoon videos | Explain the app | A recurring character and a number people come back for |

Three things make it shareable: people tag friends in their province ("Quebec got the cold front again"), the national counter gives a weekly reason to return, and the weather framing is instantly readable with the sound off.

## Weekly format

One main episode every Monday, the day after the weekly flyer data lands, plus two short follow-ups.

| Day | Piece | Length | What it shows |
| --- | --- | --- | --- |
| Monday | The Forecast (EN + FR) | 45 s | Map of Canada, 3 weather systems, the national claim counter |
| Wednesday | Storm Watch | 15 s | One item whose price dropped, with the adjustment deadline: "claim before Sunday" |
| Friday | Viewer Radar | 20 s | One real (anonymised, consented) shopper's refund, or a province asking for more scans |
| Every 4th week | Monthly Climate Report | 60 s | Which province saved most this month, ranking of provinces |

The fixed segments, in this order, every Monday:

1. **Cold open (0-3 s):** forecaster, map, one line: "A $40 cold front is hitting Ontario."
2. **The fronts (3-25 s):** the three biggest drops of the week, each a weather icon over its province with the before and after price.
3. **Refund storm warning (25-35 s):** items still inside their adjustment window, with the deadline.
4. **The counter (35-45 s):** "This week Canadians could claim back $X. Total since we started: $Y." Then the app logo.

## Sample episode: Episode 1 (English)

The prices below are real Costco Ontario flyer prices from the May 11 to June 7, 2026 flyer already in the app. The Quebec line and the counter are placeholders until the weekly export runs on live data.

**Set:** green-screen weather studio, forecaster in a blazer, clicker in hand. Map of Canada with provinces lit by savings. Burned-in captions throughout.

| Time | On screen | Forecaster says |
| --- | --- | --- |
| 0-3 s | Giant snowflake over Ontario, "-$200" | "Major cold front over Ontario. Bundle up, your TV just got cheaper." |
| 3-10 s | LG 55-in. OLED: $1,196.99 crossed out, $996.99 | "The LG 55-inch OLED dropped two hundred dollars overnight." |
| 10-16 s | Dyson V12: $849.99 to $649.99 | "Dyson V12, also down two hundred. Visibility: excellent." |
| 16-22 s | Thomasville swivel chair: $449.99 to $299.99 | "And a hundred-and-fifty-dollar gust hitting the furniture aisle." |
| 22-30 s | Red warning banner: "REFUND STORM" | "If you bought any of these in the last 30 days at full price, Costco owes you the difference. That's not a deal, that's your money." |
| 30-37 s | Quebec in grey, "[Quebec's top drop this week]" | "Quebec, mostly cloudy, with [item] down [$X]." |
| 37-45 s | Counter rolls up: "This week: $[X] claimable across Canada" | "Total refunds waiting this week: [X] dollars. Scan your receipt, we'll tell you if part of it is yours. I'm the Price Forecast. See you Monday." |

**Caption for the post:** "Did you buy a TV at Costco this month? Check the forecast. #PriceForecast #CostcoCanada"

The French episode uses the same fronts but its own script and Quebec first on the map.

## Where the real numbers come from

Every figure on screen comes from data the backend already stores; what's missing is one weekly export that turns it into an episode sheet.

| Segment | Source in the app | Rule before it airs |
| --- | --- | --- |
| The fronts (biggest drops per province) | Weekly flyer imports per region (regular price, sale price, dates) | Only flyer prices or prices verified by the crowd rule |
| Crowd prices outside the flyer | Verified price points per product and province | At least 3 different users saw the same price within 14 days, the same rule the app uses for alerts |
| Refund storm items | Flyer drops still inside the 30-day Costco adjustment window | Show the deadline date, not "soon" |
| The weekly counter | Price-drop alerts sent that week, with their dollar savings | Aggregate only, rounded, never one shopper's purchase |
| Province ranking | Same alerts grouped by province | A province with too few users shows "not enough data yet" |

The export would be a read-only weekly report (a script or an admin screen) that writes one sheet: top 3 drops per province, items in window, the counter. That's a small build I can do as a separate task when you want it.

## Platforms and rollout

TikTok and Instagram Reels carry the Monday episode; YouTube Shorts and Facebook get the same file; a French account (or French posts) runs in parallel.

1. **Weeks 1-2: build the kit.** Pick the forecaster (you, a hired local actor, or a consistent voice over an animated map if no one wants to be on camera). Make the map template once; each week only the numbers change.
2. **Weeks 3-6: run 4 episodes** without paid boost. Watch completion rate and province tags in comments.
3. **Week 7: add the province ranking** and invite viewers to "report the weather": scan a receipt to light up their province.
4. **After 8 episodes:** keep what works, boost the best episode in the weakest province.

Production cost per week is about one hour once the template exists: pull the sheet, record 45 seconds twice (EN and FR), drop numbers into the template.

**Open question:** real person on camera, or an animated forecaster that matches your cartoon style?

## Risks and rules

- **Never fake a number.** One wrong price kills trust in a savings app. Every figure must trace back to the weekly sheet.
- **Costco's name and logo.** Saying prices at Costco is fine; using their logo or implying a partnership is not. Show products and prices, not their branding.
- **Privacy.** Only aggregated, rounded numbers. A shopper's own refund appears only with their explicit consent.
- **Thin data.** Until enough users scan in a province, the show says so instead of guessing.
- **Fatigue.** The weather joke can wear out; the counter and province rivalry are what keep people coming back, so protect those.

## Sources

- [Daily Hive, viral Northern Canada grocery video](https://dailyhive.com/toronto/grocery-prices-northern-canada)
- [Motley Fool, Costco TikTok accounts](https://fool.com/the-ascent/personal-finance/articles/we-found-the-best-8-tiktok-accounts-for-costco-shoppers/)
- [CreatorDB, Costcohotfinds stats](https://creatordb.app/creatorstats/costcohotfinds/)
