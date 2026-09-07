# Two Reels — shot lists

Scripts, not footage. Both are shootable on a phone in about twenty minutes and
deliberately so: a Reel that looks handmade outperforms one that looks like an
ad, and the whole product is a person holding a receipt.

Everything below obeys the same rules as the still pack — no retailer named, no
window in days, no amount shown, nothing promised. **Every figure is covered by
a thumb, cropped out, or blurred.** That is the same compliance mechanism the
black bars are in the stills, done physically.

- **1080×1920, under 90 seconds**, and these run ~20.
- **Add Instagram's own audio at post time.** In-app audio helps reach more than
  an uploaded voice-over does, and every message here is on screen so both cuts
  work muted.
- **Post to Feed as well as Reels** (the toggle in the sharing screen). Two
  surfaces, one upload.
- **Never upload an export carrying another platform's watermark.** Originality
  is a ranking input; export clean from the source and upload to each platform
  separately.
- Turn on auto-generated captions.

---

## Reel A — "The bin" · EN · ~20s

The impossible instruction, filmed. Nothing is explained until 0:14.

| Time | Shot | On screen |
| --- | --- | --- |
| 0:00 | Close on a hand crumpling a long receipt. Real hands, real receipt, kitchen counter light. | `DON'T.` |
| 0:03 | The hand stops. Holds. Slowly uncrumples it, flattening it with a palm. | — |
| 0:06 | Overhead: the receipt flat on the counter, a finger tracking down the lines. Amounts out of frame or under the finger. | `The price you paid isn't always final.` |
| 0:10 | Phone enters frame, camera over the receipt, the scan happening. Screen tilted so no figures read. | `Scan it once.` |
| 0:14 | Cut to the phone showing an alert. Thumb covers the amount — **deliberately**, and it reads as a real person's hand, not as a redaction. | `One line just got cheaper.` |
| 0:17 | Hand picks the receipt up, pockets it. | `Keep the receipt.` |
| 0:19 | End card: mark, wordmark, `@priceback.ca`. | `New stores land here first.` |

**Caption:** reuse day 1's from `schedule.json` (`d01-post-01`), swapping the
last line to *"Send this to whoever binned theirs on the way out."*

### The only variable worth testing

The first three seconds. If this underperforms twice, re-cut **only** the
opening before changing anything else. Three hooks to try against the identical
body:

1. `DON'T.` — the current cut. Instruction with no reason.
2. Cold open on the crumple with no text at all until 0:02, then `You just threw
   away money.` — loss frame.
3. Open on the flattened receipt, one line circled in green marker, no motion
   for a full second, then `This line changed price after you paid.`

Publish variants as **Trial Reels** — shown to non-followers only for 72 hours
before you decide whether to publish to followers. It is the best testing tool
Instagram has, and it needs a public professional account with **1,000+
followers**. Until then, run them a week apart and compare sends per view
against your own median.

---

## Reel B — "Three steps" · FR · ~18s

The effort-collapse hook. The point being made is that there is no step four.

| Temps | Plan | À l'écran |
| --- | --- | --- |
| 0:00 | Un reçu tombe sur la table. Son sec. | `1.` |
| 0:02 | Le téléphone scanne le reçu, en un seul geste. | `Scannez le reçu.` |
| 0:06 | Le téléphone est posé, écran éteint. La main s'éloigne. Plan fixe, deux secondes — le vide est le propos. | `2. On suit les prix.` |
| 0:10 | L'écran s'allume seul : une alerte. Le pouce couvre le montant. | `3. Une ligne a baissé.` |
| 0:14 | La main prend le téléphone et se lève de table. | `Vous réclamez l'écart.` |
| 0:16 | Carton final : la marque, `@priceback.ca`. | `Il n'y a pas de 4.` |

**Légende :** reprendre celle du jour 7 (`d07-post-04`) dans `schedule.json`.

The two-second static shot at 0:06 is the joke and the argument at once — it is
the only part of the process that takes you no time, and holding on nothing is
how you say that without a voice-over. Do not cut it shorter to "keep pace".

---

## After shooting

Add the file to `sm-content/evergreen/reels/`, then set the matching slot's
`asset` in `schedule.json`. Leave `automate: false` — Reels stay manual so the
in-app audio gets picked at post time.

The cover frame matters more than any single frame in the film: it is what the
grid shows. Use the flattened-receipt shot, not the end card.
