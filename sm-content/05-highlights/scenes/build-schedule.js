// Generates schedule.json for the Highlights pack.
//
//   node sm-content/05-highlights/scenes/build-schedule.js
//   node scripts/publish-due.js --pack=05-highlights --check
//   node scripts/publish-due.js --pack=05-highlights --print
//
// ── Why this is a build step and not a hand-written file ────────────────────
//
// The frames are already in tray order in strings.json, and a Highlight can only
// hold a story that went out, so the schedule is a mechanical consequence of the
// tray list: one tray per day, its frames in order, the day you build that tray.
// Typing that out by hand is fifty slots of opportunity to put a frame in the
// wrong tray.
//
// ── The Instagram detail that shapes it ────────────────────────────────────
//
// A story that has been posted lives in the archive, and ONE archived story can
// be added to ANY NUMBER of Highlights. So the intro frame and the FR card are
// posted ONCE, on day one, and then added to all ten trays from the archive.
// Posting them ten times each would be twenty redundant stories on the account
// and twenty chances for a follower to see the same signpost twice in a day.

const fs = require("fs");
const path = require("path");

const STRINGS = JSON.parse(fs.readFileSync(path.join(__dirname, "strings.json"), "utf8"));
const { storyFile, rel } = require("./paths");

// Frames that belong to every tray, rendered once in the community pack. Paths
// are relative to THIS pack, which is how publish-due.js resolves an asset.
const INTRO = "../04-community/00-language-notice/priceback-community-01-story.png";
const FR_CARD = "../04-community/00-language-notice/priceback-community-fr-story.png";

// Frames already posted with the community run. They are listed in HIGHLIGHTS.md
// as each tray's `filledFrom`, and they are NOT re-scheduled here: they went out
// in that pack's run and are in the archive.
const START = "2026-10-26"; // the Monday after the community run ends
const TIME = { furniture: "12:00", frame: "18:30" };

const day = (n) => {
  const d = new Date(`${START}T12:00:00Z`);
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
};

const trays = STRINGS.trays.filter((t) => (STRINGS.frames[t.id] || []).length > 0);
const slots = [];

// ── Day 0 — the furniture, once ────────────────────────────────────────────
slots.push(
  {
    id: "hl-d00-intro",
    date: day(0),
    time: TIME.furniture,
    kind: "story",
    lang: "bi",
    automate: false,
    sticker: "none",
    asset: INTRO,
    note:
      "Post ONCE. Then add it from the archive as the FIRST frame of all ten Highlights — " +
      "an archived story can belong to any number of them. It is the frame that makes the tray " +
      "honest: a francophone who opens a Highlight and sees English needs to know, in frame one, " +
      "where the French is.",
  },
  {
    id: "hl-d00-fr-card",
    date: day(0),
    time: "12:30",
    kind: "story",
    lang: "bi",
    automate: false,
    sticker: "none",
    asset: FR_CARD,
    note:
      "Post ONCE. Then add it from the archive to the MIDDLE of every Highlight, between the " +
      "English frames and the French ones. It is the card the intro's progress bar points at.",
  }
);

// ── One tray per day ───────────────────────────────────────────────────────
trays.forEach((tray, i) => {
  const d = day(i + 1);
  const frames = STRINGS.frames[tray.id];

  // English half, then French half — the order the tray is read in.
  for (const lang of ["en", "fr"]) {
    frames.forEach((f, j) => {
      const asset = rel(storyFile(tray, f, lang));
      const slot = {
        id: `hl-${tray.id}-${f.n}-${lang}`,
        date: d,
        time: TIME.frame,
        kind: "story",
        lang,
        automate: false,
        sticker: f.sticker || "none",
        asset,
        tray: tray.en,
      };
      if (f.sticker && f.sticker !== "none" && f[lang].stickerCopy) slot.stickerCopy = f[lang].stickerCopy;
      // The one follow ask in the pack. The store list is the only recurrence
      // this account has that a viewer has to be present for, so it is the only
      // thing worth asking a follow for — and asking once is what keeps it
      // meaning something.
      if (tray.id === "stores" && f.n === "03" && lang === "en") {
        slot.ask = "follow";
        slot.note =
          "The follow ask. New stores are announced here first, which is a payoff that exists in " +
          "exactly one place — that is what makes it convert, not the word 'follow'.";
      }
      if (j === 0 && lang === "en") {
        slot.note =
          (slot.note ? `${slot.note}\n` : "") +
          `Build the "${tray.en}" Highlight today, once all of this tray's frames are up: ` +
          `intro (archive) -> English -> FR card (archive) -> French. Cover: covers/priceback-hl-cover-${tray.order}-${tray.id}.png. ` +
          `Title: "${tray.en}" / "${tray.fr}".`;
      }
      slots.push(slot);
    });
  }
});

const schedule = {
  _readme: [
    "GENERATED by scenes/build-schedule.js. Edit that, not this.",
    "",
    "  node scripts/publish-due.js --pack=05-highlights --print   read it as an agenda",
    "  node scripts/publish-due.js --pack=05-highlights --check   validate every slot",
    "",
    "This pack is STORIES ONLY. There are no feed posts here — the feed belongs to",
    "04-community's run and to the evergreen rotation after it. Nothing in this",
    "pack can be automated either: Highlights cannot be created from the Graph API",
    "at all, and stories carry stickers that are only interactive when added",
    "inside the app. --print lists each day as the work it actually is.",
    "",
    "ONE TRAY PER DAY. A Highlight can only hold a story that went out, so a tray",
    "is posted and then built the same day, while its frames are fresh in the",
    "archive and easy to find.",
    "",
    "The intro and the FR card are posted ONCE, on day one, and then added to all",
    "ten trays from the archive — an archived story can belong to any number of",
    "Highlights. They are rendered in 04-community, which owns the bilingual",
    "furniture; two copies of one signpost is how a signpost starts pointing two",
    "different ways.",
    "",
    "TWO TRAYS ARE NOT IN HERE. Support and Feedback are built entirely from",
    "04-community frames that already went out (12-13-14 and 10-11), so there is",
    "nothing left to post for them - build those two trays on day one, alongside",
    "the furniture, straight from the archive. HIGHLIGHTS.md has the frame lists.",
  ],
  timezone: "America/Toronto",
  account: "@priceback.ca",
  platform: "instagram",
  pack: "05-highlights",
  // ── The disclaimer, and the thing wrong with it ──────────────────────────
  //
  // Byte-identical to evergreen's and 04-community's, on purpose: one sentence
  // across three packs is one sentence a grep can find and legal can change in
  // one pass. check-copy.js requires the "successful claims only" pairing by
  // name, from legal/MARKETING_CLAIMS.md.
  //
  // WORTH ESCALATING, and recorded in ../facts.json under credits.dropChargeNote:
  // the app does not appear to behave the way this sentence says. shared/
  // pricing.js: "The charge is debited at detection (not at claim) - there's no
  // way to verify the user actually filed the claim", and lockedDrops.js says it
  // again. So a user can be charged for a drop they never claimed, while this
  // line and the app's own splash tagline both say "successful claims only".
  //
  // Not a copy fix. Rewording a legal notice so it matches the code is a
  // decision for whoever owns the claim, and quietly rewriting it here would
  // make this pack disagree with the other two and with the shipped app. Left
  // as-is, flagged, and the gate keeps it consistent meanwhile.
  disclaimer: {
    en:
      "Free to download. Scan credits cover processing; our share of your savings is charged on " +
      "successful claims only. Price-adjustment terms are set by each retailer and conditions apply. " +
      "PriceBack is not affiliated with any retailer.",
    fr:
      "Téléchargement gratuit. Les crédits de numérisation couvrent le traitement; notre part de vos " +
      "économies n'est facturée que sur les réclamations réussies. Les conditions d'ajustement de prix " +
      "sont fixées par chaque détaillant. PriceBack n'est affilié à aucun détaillant.",
  },
  hashtags: {
    always: {
      en: ["#priceback", "#canada"],
      fr: ["#priceback", "#canada"],
    },
  },
  slots,
};

fs.writeFileSync(path.join(__dirname, "..", "schedule.json"), `${JSON.stringify(schedule, null, 2)}\n`);
console.log(
  `schedule.json written — ${slots.length} slots across ${trays.length + 1} days, ` +
    `${day(0)} to ${day(trays.length)}.`
);
