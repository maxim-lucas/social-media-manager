# Highlight covers — the sizes, and the two decisions behind them

Eight covers in `06-highlight-covers/`. This file is what you need to put them
on the account, plus the reasoning, so the next person does not re-litigate it.

---

## The size, worked out properly

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

So the covers are authored at **1080 × 1920** — the size the picker accepts
without recompressing, and the size that lets the same file double as a story —
with every readable thing inside a **centred 640 px circle**.

| Number | Value | What it is |
| --- | --- | --- |
| Canvas | 1080 × 1920 | what you upload |
| Crop circle | 1080 across, centred at (540, 960) | what the square crop keeps |
| **Safe circle** | **640 across** | what survives the circular mask plus the selected-Highlight ring |
| Icon box | 440 across | the icon nearly fills the safe circle, as it must |
| Icon stroke | 16 px | see below — this is the number that gets got wrong |
| Rim | radius 430 | the thin emerald ring, near the crop edge |

All of it lives in `scenes/tokens.js` under `COVER`, and `verify.js` gate 8
re-renders every cover with the disc suppressed and asserts that no icon pixel
falls outside the safe circle.

### The number that gets got wrong: stroke weight

**Everything here is divided by 6.7 before a human sees it.** A 2.7 px stroke
authored on a 1080 canvas arrives in the tray at 0.4 px and is gone. The first
version of these covers shipped exactly that, and read as eight empty circles
with a faint ring.

Work backwards instead: a stroke that should read as ~2.5 px in the tray has to
be ~17 px here. Same arithmetic for icon size — 300 px looked generous on the
1080 canvas and arrived as a 45 px mark inside a 161 px circle.

If you add a ninth cover, **look at it at 161 px before you commit it.** The
contact-sheet snippet at the bottom of this file renders the whole tray at true
size in one command.

---

## Decision 1 — the covers carry no words

At 161 px across, a word is mush and a phrase is a smudge. "How it works" is
three words; there is no type size at which it survives that circle.

So the category name is **typed into Instagram as the Highlight title**, where it
renders as real system text under the circle at a size the OS chose to be
legible. The cover carries an icon and nothing else.

The decision pays twice. **An icon has no language.** One set of covers serves
the English and the French titles both — which is the only way a bilingual
account gets a consistent Highlight tray at all. The alternative is two trays, or
a tray that is half English.

The single exception is cover 8, **FR**: two capital letters do survive 161 px,
and a bilingual account whose tray never says the word *français* is an account a
French speaker scrolls past.

## Decision 2 — every Highlight opens in English and ends in French

Pin `00-language-notice/priceback-community-01-story.png` as the **first frame of
every Highlight**. It is the frame that makes the tray honest: a francophone who
opens *How it works* and sees English needs to know, in frame one, that French is
coming — and that frame says so in French, with the English dimmed underneath.

Then order the frames inside each Highlight **English, then French.** Same order
as the feed carousels, so the account has one rule and the reader learns it once.

---

## The eight covers

| # | File | Icon | English title | Titre français | What goes in it |
| --- | --- | --- | --- | --- | --- |
| 1 | `…-cover-1-how-it-works.png` | falling price arrow | **How it works** | **Ça marche** | Story 06 (the three steps), evergreen story 04, any explainer |
| 2 | `…-cover-2-stores.png` | storefront with an awning | **Stores** | **Magasins** | Story 04 (the ticked list). Re-shoot it the day store three ships |
| 3 | `…-cover-3-faq.png` | ? in a circle | **FAQ** | **FAQ** | Screenshots of answered question stickers, one per frame |
| 4 | `…-cover-4-tips.png` | bulb | **Tips** | **Astuces** | Keep the receipt, check before you rebuy, what a shelf tag scan is |
| 5 | `…-cover-5-feedback.png` | speech bubble, tail on the left | **Feedback** | **Vos idées** | What people asked for, and what shipped because of it |
| 6 | `…-cover-6-about.png` | the PriceBack mark | **About** | **À propos** | Story 03 (made here), who builds it, what it will not do |
| 7 | `…-cover-7-support.png` | life ring | **Support** | **Aide** | How to reach a person, what to send, the reference-code frames |
| 8 | `…-cover-8-francais.png` | **FR** | **Français** | **Français** | The French half of everything, for someone who wants only that |

Two notes on icons that were harder than they look:

- **Stores** was a triangle-roofed building for one draft and read, unmistakably,
  as a *house*. The fix is the awning: it is a trapezoid, it is **wider than the
  shop under it**, and its lower edge is scalloped. A roof sits on the walls; an
  awning overhangs them, and that overhang is the whole difference between "shop"
  and "home" at 161 px.
- **Feedback**'s bubble has its tail on the **left**, because the reader is the
  one talking. A right-tailed bubble is the brand talking, which is the opposite
  of what that Highlight collects.

---

## Putting them on the account

Highlights **cannot be created from desktop web or the Graph API** — Instagram
does not expose it. This is phone work, and it is about ten minutes.

1. AirDrop / email the eight PNGs to the phone.
2. Post the notice story, then the frames for a category, so the Highlight has
   something to hold.
3. Profile → **+ New** under Highlights → select the frames → **Next**.
4. **Edit cover** → the gallery icon → pick the matching cover PNG.
   The picker opens on a circular crop; the art is already centred, so do not
   pinch — just confirm.
5. Type the title from the table above. Instagram shows roughly 10–15 characters
   under the circle before it truncates, which is why the French titles are short
   ones rather than literal translations (*Ça marche*, not *Comment ça marche*).
6. Repeat. Keep the tray in the table's order: **How it works · Stores · FAQ ·
   Tips · Feedback · About · Support · Français.** Newest-added sits leftmost, so
   add them in reverse if you want that exact left-to-right order.

### Checking a cover at true size

```bash
node -e "
const sharp=require('sharp'),fs=require('fs'),path=require('path');
const dir='sm-content/04-community/06-highlight-covers';
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
version of this set shipped with strokes nobody could see.
