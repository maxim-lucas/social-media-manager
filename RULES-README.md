# PriceBack content rules

Every standing rule for PriceBack social content (@priceback.ca on Instagram, plus YouTube and TikTok for videos),
as set by Monica. **Read this before making anything.** When a rule here and a pack's notes disagree, this file
wins; when Monica gives a new rule, add it here in the same change.

---

## 1. Deal posts (the most important content)

Deal posts are real Costco price drops with product photos. They matter more than how-to content.

- **Group deals by the SAVING amount, never by the item's price** (2026-10-29). The intervals: $400 to $1,100 off,
  $300 to $400 off, $150 to $300 off, under $150 off. A $1,000 saving on an $8,999 item goes in the top tier.
- **Groceries are the exception**: grouped by type (coffee & drinks, frozen & meat, dairy & cheese, pantry &
  snacks…), not by saving.
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
- Save every video's scenes and sources in this repo so later edits cost less.

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
