# PriceBack content rules

Every standing rule for PriceBack social content (@priceback.ca on Instagram, plus YouTube and TikTok for videos),
as set by Monica. **Read this before making anything.** When a rule here and a pack's notes disagree, this file
wins; when Monica gives a new rule, add it here in the same change.

---

## 1. Deal posts (the most important content)

Deal posts are real Costco price drops with product photos. They matter more than how-to content.

- **The goal of every deal post is to attract the most clients and potential users.**
- **Categorize deals by three things, in this order** (2026-10-29):
  1. **Saving range**, never the item's price: $400 to $1,100 off, $300 to $400 off, $150 to $300 off, under $150
     off. A $1,000 saving on an $8,999 item goes in the top range.
  2. **Product category** (electronics, home & kitchen, health & beauty, appliances…). A category gets its own
     carousel when it has 3 items or more in its range; smaller ones stay together in their range's carousel, and
     every slide names the product's category in the top band.
  3. **Location: Costco warehouses or Costco Business Centre.** Never mix the two in the same slides unless every
     product post says where to buy. On the province strip, blue = seen at Costco warehouses, yellow = seen only
     at Costco Business Centres (with a legend line), grey = not seen. An item sold only at Business Centres goes
     in a Business Centre carousel, never in a warehouse one.
- **Groceries are the exception** (rules from Monica, 2026-11-04; they replace the Oct 27 "by type" grouping):
  - **Four categories only: Grocery, Home, Health & Beauty, Frozen.** Pet food goes in Grocery. Anything else
    (electronics, toys, appliances, apparel…) is not a grocery post.
  - **Group by saving end date as much as possible, and order the slides by end date** (then biggest saving first).
    One end date for the whole carousel is preferred. **More than 8 offers in a category = 2 carousels, split by
    end-date range.** A carousel is never a single item.
  - **Only savings that started this week**: query `savings` for `valid_from` on or after the Monday of the posting
    week **and** `created_at` on that Monday or later (Monica, 2026-11-04). A saving that started earlier and is
    still running is not "new".
  - **Which items first** (Monica, 2026-11-04): daily, common groceries (the most-bought staples: milk, cheese,
    yogurt, eggs, bread, meat, canned basics, snacks families buy every week) with the highest savings. Not enough?
    Loosen to other grocery items. Still not enough? Take smaller savings. **Prefer any item over $2 off to a $2
    item** (Monica, 2026-11-04: BUILT Puff −$6 replaced Villaggio bread −$2); go down to $2 only when nothing
    bigger with a clean photo is left in the category and end date.
  - **Saving size beats "everyday staple"** (Monica, 2026-11-04, after the bread was picked over BUILT Puff −$6):
    "daily and common" only breaks ties between similar savings. Never put a smaller saving in a carousel while a
    bigger one in the same category and end date, with a clean photo and not yet posted, is left out.
  - **End card** (Monica, 2026-11-04): unchanged except one yellow line under "New Costco price drops, every
    week.": "+ hundreds more hidden savings, only in the PriceBack app" (FR "+ des centaines de rabais cachés,
    exclusivement dans l'app PriceBack").
  - **Business Centre carousel strip** (2026-11-04): every province cell yellow, one legend key "Costco Business
    Centres only", fine print "Price seen at Costco Business Centres in …" (`"businessCentre": true`).
  - **Weighted, sold-by-the-case meat** (price changes per case) is left out: the database can't give one true
    "PAID $X". Tell Monica which big savings were skipped for this.
  - **Savings ending within 2 days** of building are skipped: they would be over before Monica validates.
  - Same-Day search by **item number** mostly misses (Montreal store); search by **product name** finds far more.
  - **Price-drop reels** (Monica, 2026-11-04: "use some animation … to hook the users … get more followers"): made
    only after Monica validates the carousel, EN and FR, 1080×1920, about 19 s:
    `sm-content/08-costco-price-drops/reels/make-reel.js <week json> <en|fr> <out.mp4>`. Hook first (product photos
    pop in, "8 PRICES JUST DROPPED", the claim total counts up, the end date), then the cover, each item with a push
    transition, a "CLAIM $X BACK" stamp, a "DROP n OF 8" progress bar and a running total, and the end card with a
    pulsing "FOLLOW @priceback.ca" button. Music is an original track made by `reels/music.py` (no licence issues),
    with a whoosh on every cut; Monica can swap in trending Instagram audio when posting. These reels are the
    exception to §5's "no music" rule, which covers the story videos.
  - **Reel feedback (Monica, 2026-11-04 17:29), these override the reel described above:**
    - **The follower reel is 7 seconds and loops** (Instagram rewards 7–10 s loops; an 18 s reel with 8 products
      gets saves, not follows). `reels/short-reel.js`:
      0–1 s "Shopped at Costco lately?"; 1–2.5 s the yellow "N PRICES JUST DROPPED" banner + "Claim up to $X
      back"; 2.5–6 s only the **3 biggest drops**, each with the "CLAIM $X BACK" sticker; 6–7 s "FOLLOW
      @priceback.ca for next week's drops", ending on the hook's look so it loops.
    - **The 3 products:** the 3 biggest savings across **all the week's grocery carousels**, Costco warehouse
      offers only (**no Business Centre**), **no raw meat photos**, one product per brand.
    - **No cover slide in reels:** the animated hook already does its job.
    - **No red footer on slides in reels:** crop it off; the big "CLAIM $X BACK" sticker replaces it (reels only,
      the carousel keeps its footer).
    - **Music:** Monica disliked the first track (too loud, tempo too quick). Calm, slower (about 90 BPM), quiet
      under the visuals; always also deliver a no-music copy so she can add Instagram audio.
    - Edit **EN only** until Monica approves; FR follows.
  - **Business Centre and warehouse savings are never in the same carousel** (Monica, 2026-11-04): separate
    carousels, and a Business Centre cover says "Only in Costco Business Centres" (FR "Seulement dans les
    Centres d'entreprises Costco"); `"businessCentre": true` in the week file. **Never an item already posted** in an earlier carousel:
    check every `posts/` folder and `/mnt/project-files/marketing/costco-posts/` first.
  - **Every item slide shows province availability** (the province strip).
  - **Cover ("guard") card, exactly these 4 things in this order**, and nothing else (no swipe cue, no photo grid):
    1. "Costco Canada Drops 🇨🇦" (FR "Baisses Costco Canada 🇨🇦"): top, small.
    2. "New drops · Claim until Sunday, Nov 15": middle, HUGE. The weekday + date when every item ends the same
       day (preferred); otherwise every end date listed ("Nov 15 & 29"), never a from–to range.
    3. The number of drops ("8 price drops"): bottom. **The count is clearly bigger than the date** (Monica,
       2026-11-04, said twice): they must not compete; the number of drops sells the save more than the date.
       Today: date 100px, count 124px (FR 92 / 104).
    4. The red footer, bigger: "Bought in the last 30 days?" in yellow, then "CLAIM UP TO $27.70 BACK" in a
       white box (FR "Acheté ces 30 derniers jours ?" / "RÉCLAMEZ JUSQU'À 27,70 $").
  - **The end card stays as is and is the last slide of every carousel.**
  - **Always English AND French.**
  - **Source: the `priceback.savings` table** (live, not superseded rows; source `sameday_costco` = warehouses,
    `sameday_business_centre` = Business Centres, `saving_warehouses` for the stores), with regular prices from
    `price_points`. `price_points` alone misses most of the week's savings (Monica, 2026-11-04).
  - **Flyer items are allowed** in grocery carousels (2026-11-04); the "hidden savings only" filter does not apply.
  - **No photo is not a reason to drop an item** until both Same-Day and costco.ca have been tried.
  - **Ending soon = included and posted first.** Carousels go out in end-date order, the soonest first.
  - **Items outside the 4 categories** (apparel, electronics, toys, seasonal…) go in a separate mixed carousel.
  - **Fewer than 5 items in a carousel** → complete it with offers from the same category that started before this
    week, end on the same date, with the highest savings.
  - **Cover total line** under the drop count, big and bold (no "all"): "Total possible back: $27.70 / if you
    bought them" (FR "Total à récupérer : 27,70 $ / si vous les avez achetés"), on two clean lines.
  - **The red footer is the hero** on item slides, huge: "PAID $29.99 in the last 30 days?" then "CLAIM $6 BACK"
    in a white box (FR "PAYÉ 29,99 $ ces 30 derniers jours ?" / "RÉCLAMEZ 6 $"); `"bigClaim": true` in the
    week file. The PriceBack green banner stays.
  - **The category in the top band is clearly visible** on every slide (white, bold, a bit bigger), not oversized.
  - **French uses "vous"** and the `25,70 $` price format.
  - **Every remark or edit Monica makes becomes a rule here** (and in STYLE.md), in the same session, without
    being asked (Monica, 2026-11-04).
  - **Make one carousel first**, have Monica validate it, then do the rest.
  - **Images first, reel second.** Render the slides, send them to Monica, and **only after she validates the
    photos** turn each carousel into an Instagram reel (a few seconds per slide, standard transitions, music).
- **Business Centre vs warehouse is read from the data, never assumed** (Monica, 2026-11-04, item 2068876). A
  price point is a Business Centre one when `flags.storefront = 'business_centre'` **or** its warehouse name
  contains "Business Centre", including province-wide rows with no warehouse. A province is blue (warehouse) only
  when a warehouse (`storefront = 'costco'`) row exists there; a province with Business Centre rows only is
  yellow. An item seen only at Business Centres everywhere is never in a warehouse carousel. (Oct 27 mistake:
  Business-Centre-only ON/QC rows had no warehouse id and were shown as warehouses.)
- **English and French always carry the exact same offers** (2026-10-29). Never choose a language by province,
  even for a saving seen only in Alberta or only in Quebec.
- **One post per product, never one per province.** Under the product photo, a **province strip** lists every
  province with a Costco; the provinces where the saving is available are highlighted, the others greyed out, so a
  missing province shows at a glance.
- **One item per image. A category is a carousel**, slides from the biggest saving to the smallest.
- **Real numbers only**, from the PriceBack production database (`priceback.price_points`), never from a flyer or a
  website price. Never post a drop whose end date has passed or is too close to posting.
- **A drop that was bigger for a short time is a killer selling point** (e.g. $600 off for one day, then $500): show
  both steps, because catching it on time means claiming more. That is the app's whole point.
- **Never redo a product that is already published.** Published: Samsung QN80H TV (item 5708165).
- **Costco never adjusts jewellery or mobile devices** (wireless kiosk): never post them as claimable drops. Check the
  price adjustment policy's exceptions before any new content so nothing false is said.
- **Claim, never get.** "Claim the difference": the store decides.
- **Product photos**: from the Cloudflare R2 bucket `priceback-product-images` (`costco/<item #>`, served at
  `/api/product-images/costco/<item #>`), or from costco.ca or Costco Same-Day. Clean packshot only, banners
  cropped off. **No clean photo, no post.**
- House style, renderer and step-by-step: `sm-content/08-costco-price-drops/STYLE.md`.

## 2. Design and layout

- **One design is used for at most 2 pieces of content.**
- **The same content in another language gets different colours**, for a more professional look.
- **Bright and clear visuals only**: no dark sets or dark styles (in dark images the Black characters aren't
  clearly visible).
- **Colours**: brand palette only (no orange, red, black…) for graphics such as end screens and hero cards. Video
  content keeps realistic colours: the Costco banner, Costco shelves, clothes, the store. The Costco price-drop
  house style deliberately uses Costco's red, blue and white (see its STYLE.md).
- **Reserve the space Instagram's own buttons cover** (mainly the bottom margins); the rest of the frame is free.
  Going past the repo's 200 px right inset on stories is fine.
- **Every carousel ends on a follow + download slide** with the App Store and Google Play badges.
- **Every single post and story without that final slide carries both store badges as a small signature**, on the
  right, the way the logo sits on the left.
- **Costco is named, never its logo.** Wherever Costco appears as a brand mark, it is white text on red in another
  font (as in the app), and it must always render cleanly (no tilt, no misaligned text).

## 3. Wording and selling points

- Say **"scan your receipt"**, never "snap your receipt".
- **Price drops are credited to PriceBack**: PriceBack sends an alert when a price drops, then you claim the
  difference.
- **Selling points**: price drops (the main feature); more stores coming, Costco is just the start; try it free;
  invite friends and family to earn more free credits; the price tag scan spots good deals and helps the community.
- **Always**: the app is free to download; try it free, then buy credits (they never expire) or go Unlimited.
  Never say "use the free plan"; say try it, then recommend credits or Unlimited.
- **Push toward paying**: downloading is the first step, then subscribe or buy credits. Never lines like "I'll start
  free" or "everyone does".
- When a character started on the free plan, add that a subscription is worth it for the full experience and bigger
  savings.
- Don't say the app is free and then that you start with 75 free credits (it doesn't make sense). Never say it's
  cheaper than the hot dog.
- **Never mention**: fees, inbox scanning, receipt scans without signal, store launch dates or notifications, PDF
  export, conditions for getting free credits, or any other app condition; that there are no ads; that receipts stay
  on the phone.
- **Never say to show the app at Costco's Membership Counter**: say to show the receipt, or the PriceBack copy of it.
- **A selling point keeps its meaning but is worded differently each time**; never repeat the exact same sentence
  piece after piece, and vary the overall style.
- **Price codes**: whenever content explains a Costco price code (markdown endings, the star…), the person learned
  it from PriceBack's price tag scanner or offline price translator. Never build content around users learning the
  codes: the person wonders what a code means, scans the tag with PriceBack, and the app tells them.

## 4. Receipt scans

- A good scan needs only **the warehouse header, every item line and the totals**. The payment part isn't needed.
- **A missed item is a missed price drop**: every item from the header to the total must be in the photo.
- The receipt goes **flat and straight**: not tilted, not upside down, not folded, header not cut off, no glare.
- How-to content: `sm-content/10-receipt-scan/`.

## 5. Videos (Reels, YouTube, TikTok)

- **35 seconds maximum.** No music.
- **Real hooks and narration**, natural characters who look like real people: real-life look, no AI style, no
  cartoon or TV-style animated characters.
- **Narration is natural and low-key**, never dramatic and never a lesson (no lecturing mom or grandmother tone).
- **Lines are clean, expressive full sentences** tied to the story, never strings of fragments.
- **Few characters**, plus a recurring brand persona usable across all content. Easy-to-pronounce Canadian names
  (no Arabic names).
- **Costco is named** in the narrative and on a background banner (white on red, never the real logo).
- **Show receipt scans with real prices and real drops**: one to a few items per receipt. Drops can be as small as
  $4–5 and should include groceries (cheese, yogurt, chicken, spring rolls…).
- **No annotations or on-screen text during the video**; the disclaimer ("PriceBack is an independent app…") and
  any other text only at the end.
- **End screen**: the EP26 ("Never again") style: big headline and app info straight on a light band over the scene,
  with the app icon tile, no boxed hero card (or a new style that is even better).
- **French subtitles**: V1 style, a moving word-highlight with no background box, synced to the English narration.
  If a separate French cut costs significantly more, make one video with the subtitles.
- **One video per scenario**: no redundant videos or edits repeating the same narration.
- **Always review a video's narrative before it is rendered.** Never redo or re-render a generated video without
  approval; new style rules apply to future videos.
- **Never again**: the door-receipt-check joke ("the door didn't catch that"); the "Every Saturday" concept
  (Unlimited pitched around routine weekly shopping, "no credits to manage").
- Favourite ideas so far: the gift, the lost receipt, the office chairs, the spreadsheet, "the smart one". More
  ideas like these. Direction: "secret" Costco tips (decoding price tags: clearance prices, manager markdowns,
  asterisks) with real before/after prices, and price-tag cheat-sheet posts.
- Save every video's scenes and sources in this repo so later edits cost less, including what was used to create
  the content (data sources, scripts, masks).
- **The app on screen must look like a real screen recording of the app, never a render** (2026-11-02). When a
  recording isn't possible, rebuild the screens from the app's own code (theme, components, strings) with the
  phone's status bar, touch indicators and real transitions. See `sm-content/12-kickstarter/`.
- **Exception: the Kickstarter campaign video** (`sm-content/12-kickstarter/`, 2026-11-02). The rules above don't
  apply to it: it shows real receipts with the printed Costco logo (masked so they belong to nobody) and may run
  45 s.

## 5b. App demos: screens, receipts and drops (every video and image, 2026-11-02)

The app shown in content is the real app, telling a story that could really have happened. **Never invent or
simplify; read the app's code for every screen you show.**

- **Real design only.** Every screen is the app's real screen with all its parts, never a summary of it. The
  receipt confirmation shows the warehouse detection, the purchase date, the item list, the totals and the
  **Start tracking** button, exactly as the app does.
- **Shown inside a real phone**: a realistic device body and frame around the screen, so it reads as a phone
  recording.
- **One story, consistent end to end.** Every product that gets a price-drop alert comes from a receipt scanned
  in the same piece. Nothing appears on the Home screen before it was scanned.
- **The number of products detected always equals the number of item lines on the receipt shown.** The item
  names are that receipt's real items.
- **Receipt dates fit the story**: the purchase is recent enough that the drops shown are inside the store's
  price-adjustment window. No old receipts.
- **Real prices**: product prices from production (`priceback.price_points`), or else from costco.ca. Real
  drops only, with their real dates.
- **Price-drop alerts show realistic time left.** Never a first alert that says "Last day": it suggests the app
  notifies late.
- **Narration says the price drops shown are real.**
- **Everything is committed to GitHub through a pull request**, never straight to `main`.

## 6. App facts content may use

Source of truth for plans, pricing and the guarantee: https://priceback.ca/.

- Free plan: pay as you go; earn credits by submitting savings price tags or inviting friends.
- Credits: bought credits never expire, start at $3, used whenever.
- Subscription: access to all features and options. Annual plan = the price of 10 months ($49.99), 2 months free.
- **PriceBack Guarantee**: no price drops in your first year, for any reason, and the app gives you an annual
  subscription free.
- The app has a price tag scanner and an offline price translator that explain Costco price codes.

## 7. Where things go

- Approved content: `sm-content/` in this repo, one numbered folder per pack.
- Posting playbook: `docs/instagram-playbook.md`.
