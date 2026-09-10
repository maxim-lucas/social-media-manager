# The Highlight tray — what goes in it, and how to build it

Ten Highlights, sixty rendered assets, and one structural rule that applies to
every tray. This file is what you need to put them on the account, plus the
reasoning, so the next person does not re-litigate it.

```bash
node sm-content/05-highlights/scenes/build-strings.js   # after editing copy or facts.json
node sm-content/05-highlights/scenes/render.js          # 60 assets
node sm-content/05-highlights/scenes/verify.js          # eleven gates, must exit 0
```

---

## The rule: every Highlight is bilingual, end to end

```
┌─────────┬──────────────────────┬──────────┬──────────────────────┐
│  INTRO  │   ENGLISH  frames    │  FR CARD │   FRENCH  frames     │
└─────────┴──────────────────────┴──────────┴──────────────────────┘
     ▲                                 ▲
     │                                 └─ "LE FRANÇAIS COMMENCE ICI."
     └─ bilingual, and shows where the French half starts
```

There is **no Français Highlight**. There was one in the first cover set and it
was the wrong shape: a French-only drawer is a duplicate of the back half of all
ten, and it leaves every *other* tray still opening in English with no way out.
Making each tray bilingual solves the problem where the reader actually is.

**The intro and the FR card are not rendered in this pack.** They live once, in
`../04-community/00-language-notice/`, and are reused at the front and the middle
of all ten trays:

| Frame | File |
| --- | --- |
| Intro | `04-community/00-language-notice/priceback-community-01-story.png` |
| FR card | `04-community/00-language-notice/priceback-community-fr-story.png` |

Two copies of the same signpost in two packs is how a signpost starts pointing
two different ways.

### How the intro tells a francophone where to go

The old version of this frame said **"keep tapping."** That is an instruction,
not information — it asks somebody to spend an unknown number of taps on a
language they do not read, on the word of an account they have just met.

The new one **draws Instagram's own story progress bar**, with the French half
lit and the FR card marked:

```
 ▬▬  ▬▬  ▬▬  ▬▬  ▬▬  ▬▬  ▬▬  ▬▬
 you          ▲ FR
```

Instagram's real progress bar is on screen a few hundred pixels above it, so the
replica needs no caption: the reader is already looking at the original. It shows
that the French half is a **half**, not a footnote, and it survives being read by
somebody who cannot read the words under it.

The chevrons point **right**, never down. A story is tapped *forward*. The first
version pointed down, which is the one direction that does not advance a
Highlight — it told the reader to do the single thing that would not reach the
French.

---

## The ten trays

Newest-added sits leftmost in Instagram, so **add them in reverse** if you want
this left-to-right order.

| # | Cover | English title | Titre français | What is in it |
| --- | --- | --- | --- | --- |
| 1 | falling price arrow | **How it works** | **Ça marche** | The mechanic: a price you paid is not always final · what it takes · the three steps |
| 2 | storefront, awning | **Stores** | **Magasins** | **One store per frame** — Costco (live) · Best Buy (not yet) · yours? |
| 3 | coin with a plus | **Earn** | **Gagner** | Credits come back two ways: invite somebody, or scan a shelf tag. Includes what stops people gaming it |
| 4 | infinity | **Plans** | **Forfaits** | What a credit is · what spends one · what Unlimited changes · what it opens · paid yearly |
| 5 | sliders | **The app** | **L'app** | Price watching · two reminders · the claim assistant · Outlook sync · offline · what you can set |
| 6 | bulb | **Tips** | **Astuces** | 04-community **07 · 08 · 09**, plus "scan it in the parking lot" |
| 7 | ? in a circle | **FAQ** | **FAQ** | 04-community **15 · 16 · 17**, plus "what if I threw out the receipt?" |
| 8 | life ring | **Support** | **Aide** | 04-community **12 · 13 · 14** |
| 9 | the PriceBack mark | **About** | **À propos** | 04-community **03** (made here), plus what it will not do |
| 10 | speech bubble | **Feedback** | **Vos idées** | 04-community **10 · 11** |

Trays 6–10 are filled from `04-community`. That is declared in `strings.json` as
`filledFrom`, and **gate 11 fails the build on a cover with neither its own
frames nor a `filledFrom`** — because a cover with nothing behind it is a label
on an empty drawer, and that is the most common way a Highlight tray dies.

Frame **11** in Feedback ("You asked. It shipped.") is meant to be **replaced**,
not archived. Each time something somebody requested lands in a release,
re-render it naming the change. It is the receipt for frame 10's ask, and an ask
with no visible answer is worse than never asking.

---

## The cover size, worked out properly

**Instagram has no "Highlight cover size."** It has a crop chain, and every
number below is derived from the last link in it:

```
you upload 1080 x 1920
        │
        ▼
IG keeps a CENTRED SQUARE          ← the corners of your art are gone here
        │
        ▼
IG masks that square to a CIRCLE   ← the corners of the square are gone here
        │
        ▼
displayed at about 161 x 161 px    ← everything is divided by 6.7
```

| Number | Value | What it is |
| --- | --- | --- |
| Canvas | 1080 × 1920 | what you upload |
| Crop circle | 1080 across, centred at (540, 960) | what the square crop keeps |
| **Safe circle** | **640 across** | what survives the circular mask plus the selected-Highlight ring |
| Icon box | 440 across | the box the icon is normalised into |
| **Icon fill** | **86 % of that box** | see below — this is the number the first set got wrong |
| Icon stroke | 16 px | ~2.5 px once the tray divides it by 6.7 |
| Rim | radius 430 | the thin emerald ring, near the crop edge |

All of it lives in `brand/ig.js` under `COVER`.

### The two numbers that get got wrong

**Stroke weight.** Everything here is divided by 6.7 before a human sees it. A
2.7 px stroke authored on a 1080 canvas arrives in the tray at 0.4 px and is
gone. The very first cover set shipped exactly that and read as eight empty
circles. Work backwards: a stroke that should read as ~2.5 px in the tray has to
be ~17 px here.

**Icon size — and this one passed every gate.** The set this replaces declared a
440 px icon box and then drew inside it at whatever size each path happened to
be. Measured:

| | ink bbox, as a fraction of the box | ink area |
| --- | --- | --- |
| `about` | 62 % | 21 007 px |
| `how-it-works` | 70 % | **10 248 px** |
| `stores` | **91 %** | **33 451 px** |

A 3.3× spread in ink. Invisible at 1080 px; at 161 px `how-it-works` was a
squiggle in a big disc while `stores` filled its circle. The only cover gate was
a *floor* on total ink, and all eight cleared it — **a floor cannot see a
spread.** `brand/icons.js` now renders each icon, measures its real bounding box,
backs the stroke out of the measurement and solves for the scale; gate 8 asserts
the result lands at 86 % ± 2.

If you add an eleventh cover, **look at it at 161 px before you commit it.**

### Checking the tray at true size

```bash
node -e "
const sharp=require('sharp'),fs=require('fs'),path=require('path');
const dir='sm-content/05-highlights/covers';
(async()=>{
  const files=fs.readdirSync(dir).filter(f=>f.endsWith('.png')).sort();
  const S=161,PAD=18,W=(S+PAD)*files.length+PAD,H=S+PAD*2;
  const mask=Buffer.from('<svg width=\"'+S+'\" height=\"'+S+'\"><circle cx=\"'+S/2+'\" cy=\"'+S/2+'\" r=\"'+S/2+'\" fill=\"#fff\"/></svg>');
  const comps=[];
  for(let i=0;i<files.length;i++){
    const buf=await sharp(path.join(dir,files[i]))
      .extract({left:0,top:420,width:1080,height:1080}).resize(S,S)
      .composite([{input:mask,blend:'dest-in'}]).png().toBuffer();
    comps.push({input:buf,left:PAD+i*(S+PAD),top:PAD});
  }
  await sharp({create:{width:W,height:H,channels:4,background:'#111111'}})
    .composite(comps).png().toFile('tray.png');
  console.log('tray.png');
})();
"
```

That is the view that matters. Judging a cover at 1080 px is how the first
version shipped with strokes nobody could see.

---

## Putting them on the account

Highlights **cannot be created from desktop web or the Graph API** — Instagram
does not expose it. This is phone work, and it is about twenty minutes.

1. AirDrop / email the ten cover PNGs to the phone.
2. **Day one: post the intro and the FR card, once.** An archived story can
   belong to **any number of Highlights**, so these two are posted a single time
   and then pulled from the archive into all ten trays. Posting them per-tray
   would put the same signpost on the account twenty times.
3. **Then one tray a day.** A Highlight can only hold a story that went out, so
   post a tray's frames and build the tray the same day, while they are still at
   the top of the archive. `schedule.json` is laid out exactly that way — run
   `publish-due.js --pack=05-highlights --print` and work down it.
4. Profile → **+ New** under Highlights → select, in this order: **intro
   (archive) → the English frames → the FR card (archive) → the French frames** →
   **Next**.
5. **Edit cover** → the gallery icon → pick the matching cover PNG. The picker
   opens on a circular crop and the art is already centred, so do not pinch —
   just confirm.
6. Type the title from the table above. Instagram shows roughly 10–15 characters
   under the circle before it truncates, which is why the French titles are short
   ones rather than literal translations (*Ça marche*, not *Comment ça marche*).
7. Repeat, in reverse order, so the tray reads left to right as the table does.

### Keeping it current

- **Stores is the one to re-shoot.** The day a store ships to the app's
  `origin/main`, update `facts.json`, re-run `build-strings.js`, re-render, and
  swap the frame. Nothing else needs touching — the store's status is stated in
  exactly one place, and gate 10 fails the build if a frame disagrees with it.
- **Never edit a PNG.** Every asset is byte-identical across runs (seeded
  `mulberry32`, no `Math.random`), so a copy change produces a diff of exactly
  the frames that changed.
