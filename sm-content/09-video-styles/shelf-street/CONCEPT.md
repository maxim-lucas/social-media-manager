# Shelf Street (La Bourse du panier)

Costco shelf prices covered like the stock market. Faceless short videos: a trading-terminal screen, a finance-anchor voice, real shelf tags.

## Why it's more viral than the forecast

- **It borrows a language people already share.** "Stonks", "buy the dip", "bag holder" and red crash candles are meme vocabulary, and applying them to cat treats and marinara is funny on its own.
- **The twist only Priceback can tell.** In finance a crash means you lost money. Here, if you paid full price in the last 30 days, the crash means **you're owed money**. "You didn't lose, you're owed. Cash out." That line ties every episode to the app.
- **The audience feeds it.** "Send us your shelf tag and we'll list it on the exchange." The app's price-tag scan already reads these tags, so viewers become the data source.
- **It's cheap to make daily.** No actor, no set. Each episode is a screen template plus voice, so the daily cadence is realistic.
- **The Basket Index brings free coverage.** A weekly cost of the same 10 staples by province is a number Canadian news sites can quote, the way they quote the Big Mac Index.

## Format

| Piece | When | Length | Content |
| --- | --- | --- | --- |
| Opening bell | Daily (Mon-Fri) | 15-20 s | Ticker of the biggest drops from new tags: SKU, before → after, % down |
| Biggest crash | Daily or 3x a week | 20-30 s | One tag photo zooms in and becomes a chart: regular price, sale price, the date it bounces back |
| Bag holder alert | 2x a week | 20 s | "Bought X at full price in the last 30 days? +$4 back per pack. Cash out before July 5." |
| Basket Index | Weekly (Monday) | 30-40 s | Cost of the same basket per province, week-over-week change, which province "won" |

## The data

- **Shelf tags (available now).** Every Costco tag carries everything an episode needs: SKU, name, regular price, instant saving, price at register, and the savings end date (`EXP`). Your 7 photos produced 6 real ticker rows: Catit −30%, Rao's −25%, Pull-Ups −21.3%, Renu −21.1%, Systane −20.8%, Kraft −20%.
- **Price history (from the database).** `price_points` stores, per product, province and warehouse, the regular price, the current price, on-sale, verified, and observed date. That's a real price history per SKU and province, which is what the charts and the Basket Index need. A small read-only weekly export would build the episode sheet.
- **Weekly flyers per region** fill the gaps where there are no tags yet.

## Rules

- Every number traces back to a tag photo or a verified database price. A chart is drawn only from real data points.
- No Costco logo or partnership implied. Products, tags and prices only. Check that filming tags in store is fine with the warehouse.
- Aggregated numbers only. A shopper's own refund is shown only with their consent.
- Basket Index only for provinces with enough data. Others show "not enough data yet".
- Running joke and disclaimer in one: "Not financial advice. It's groceries."

## The Price Forecast

Parked, not dropped. Its national refund counter could become the Basket Index's closing line later.
