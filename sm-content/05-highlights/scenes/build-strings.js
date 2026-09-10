// Generates strings.json for the Highlights pack.
//
// Written as JS rather than hand-edited JSON for one reason: the store frames
// are DERIVED from ../facts.json, so a store's status is stated once and cannot
// be true on one frame and false on another. That is the defect this pack exists
// partly to prevent — 04-community shipped "TWO DOWN" with both stores ticked
// while production had one.
//
//   node sm-content/05-highlights/scenes/build-strings.js
//
// Re-run after editing facts.json, then re-render.

const fs = require("fs");
const path = require("path");

const FACTS = JSON.parse(fs.readFileSync(path.join(__dirname, "..", "facts.json"), "utf8"));

const DISCLAIMER = {
  en: [
    "PriceBack is an independent app. Not affiliated with, endorsed by,",
    "or connected to any retailer named here.",
  ],
  fr: [
    "PriceBack est une application indépendante. Aucun lien avec les",
    "détaillants nommés ici, ni approbation de leur part.",
  ],
};

const TRAYS = [
  { id: "how", order: "01", dir: "01-how-it-works", icon: "how", en: "How it works", fr: "Ça marche" },
  { id: "stores", order: "02", dir: "02-stores", icon: "stores", en: "Stores", fr: "Magasins" },
  { id: "earn", order: "03", dir: "03-earn", icon: "earn", en: "Earn", fr: "Gagner" },
  { id: "plans", order: "04", dir: "04-plans", icon: "plans", en: "Plans", fr: "Forfaits" },
  { id: "features", order: "05", dir: "05-features", icon: "features", en: "The app", fr: "L'app" },
  { id: "tips", order: "06", dir: "06-tips", icon: "tips", en: "Tips", fr: "Astuces", filledFrom: "04-community stories 07, 08, 09" },
  { id: "faq", order: "07", dir: "07-faq", icon: "faq", en: "FAQ", fr: "FAQ", filledFrom: "04-community stories 15, 16, 17" },
  { id: "support", order: "08", dir: "08-support", icon: "support", en: "Support", fr: "Aide", filledFrom: "04-community stories 12, 13, 14" },
  { id: "about", order: "09", dir: "09-about", icon: "about", en: "About", fr: "À propos", filledFrom: "04-community story 03" },
  { id: "feedback", order: "10", dir: "10-feedback", icon: "feedback", en: "Feedback", fr: "Vos idées", filledFrom: "04-community stories 10, 11" },
];

// ── The frames ──────────────────────────────────────────────────────────────
// Each entry is { n, scene, sticker, en:{...}, fr:{...} }. `n` is the position
// inside its tray and goes into the filename.
const FRAMES = {
  how: [
    {
      n: "01",
      scene: "statement",
      sticker: "none",
      en: {
        kicker: "THE WHOLE IDEA",
        hook: ["A PRICE YOU PAID", "IS NOT ALWAYS", "THE FINAL ONE."],
        sub: [
          "Many Canadian stores adjust a price that drops after you buy.",
          "Most people never find out in time. Nobody is watching.",
        ],
      },
      fr: {
        kicker: "L'IDÉE AU COMPLET",
        hook: ["LE PRIX PAYÉ", "N'EST PAS TOUJOURS", "LE PRIX FINAL."],
        sub: [
          "Bien des détaillants ajustent un prix qui baisse après l'achat.",
          "Presque personne ne l'apprend à temps. Personne ne surveille.",
        ],
      },
    },
    {
      n: "02",
      scene: "checks",
      sticker: "none",
      en: {
        kicker: "WHAT IT TAKES",
        hook: ["THREE THINGS,", "AND YOU HAVE", "TWO ALREADY."],
        checks: [["The receipt", "live"], ["The item, unopened", "live"], ["Noticing in time", "soon"]],
      },
      fr: {
        kicker: "CE QUE ÇA PREND",
        hook: ["TROIS CHOSES,", "ET VOUS EN AVEZ", "DÉJÀ DEUX."],
        checks: [["Le reçu", "live"], ["L'article, non ouvert", "live"], ["Le remarquer à temps", "soon"]],
      },
    },
    {
      n: "03",
      scene: "steps",
      sticker: "none",
      en: {
        kicker: "HOW IT RUNS",
        hook: ["YOU SCAN ONCE.", "THE WATCHING", "IS OURS."],
        steps: ["Scan the receipt", "We watch the price", "You claim the difference"],
      },
      fr: {
        kicker: "COMMENT ÇA ROULE",
        hook: ["VOUS SCANNEZ.", "LA SURVEILLANCE,", "C'EST NOUS."],
        steps: ["Numérisez le reçu", "On surveille le prix", "Vous réclamez l'écart"],
      },
    },
  ],

  stores: [
    {
      n: "01",
      scene: "statement",
      sticker: "none",
      fineprint: true,
      en: {
        kicker: "SUPPORTED TODAY",
        hook: ["COSTCO."],
        sub: [
          "A reader built line by line for how Costco prints a receipt.",
          "It took forty-two real receipts to get right.",
        ],
      },
      fr: {
        kicker: "PRIS EN CHARGE",
        hook: ["COSTCO."],
        sub: [
          "Un lecteur bâti ligne par ligne pour les reçus Costco.",
          "Ça a pris quarante-deux vrais reçus.",
        ],
      },
    },
    {
      n: "02",
      scene: "statement",
      sticker: "none",
      fineprint: true,
      en: {
        kicker: "NEXT IN LINE",
        hook: ["BEST BUY.", "NOT YET."],
        sub: [
          "Written, and held back until it reads a receipt properly.",
          "Half working is worse than saying it is not ready.",
        ],
      },
      fr: {
        kicker: "LE PROCHAIN",
        hook: ["BEST BUY.", "PAS ENCORE."],
        sub: [
          "Écrit, et retenu tant qu'il ne lit pas un reçu comme il faut.",
          "À moitié fonctionnel, c'est pire que dire non.",
        ],
      },
    },
    {
      n: "03",
      scene: "statement",
      sticker: "question",
      en: {
        kicker: "AFTER THAT",
        hook: ["YOURS?"],
        sub: [
          "Which store gets read next depends on where people shop.",
          "New ones are announced here first, the day they go live.",
        ],
        stickerCopy: "Question sticker: Which store should we read next?",
      },
      fr: {
        kicker: "ENSUITE",
        hook: ["LE VÔTRE?"],
        sub: [
          "Le prochain magasin lu dépend d'où le monde magasine.",
          "Les nouveaux s'annoncent ici en premier, le jour même.",
        ],
        stickerCopy: "Sticker question : Quel magasin on devrait lire ensuite?",
      },
    },
  ],

  earn: [
    {
      n: "01",
      scene: "statement",
      sticker: "none",
      en: {
        kicker: "BOTH DIRECTIONS",
        hook: ["CREDITS GO OUT.", "THEY ALSO", "COME BACK."],
        sub: [
          "Bring somebody in, or make the price data better.",
          "Both put credits in your balance. Neither costs you a thing.",
        ],
      },
      fr: {
        kicker: "DANS LES DEUX SENS",
        hook: ["LES CRÉDITS SORTENT.", "ILS REVIENNENT", "AUSSI."],
        sub: [
          "Amenez quelqu'un, ou améliorez les données de prix.",
          "Les deux vous donnent des crédits. Aucune ne coûte rien.",
        ],
      },
    },
    {
      n: "02",
      scene: "steps",
      sticker: "none",
      en: {
        kicker: "INVITE SOMEBODY",
        hook: ["YOUR CODE IS", "IN THE APP."],
        steps: ["Profile, then Invite a friend", "They type it when they sign up", "It only works at sign-up"],
      },
      fr: {
        kicker: "INVITEZ QUELQU'UN",
        hook: ["VOTRE CODE EST", "DANS L'APP."],
        steps: ["Profil, puis Inviter un ami", "Ils l'entrent à l'inscription", "Ça marche à l'inscription seulement"],
      },
    },
    {
      n: "03",
      scene: "statement",
      sticker: "none",
      en: {
        kicker: "WHEN IT PAYS",
        hook: ["ON THEIR FIRST", "PURCHASE.", "NOT BEFORE."],
        sub: [
          "Fifteen credits each, to you and to them, once they buy.",
          "Not at sign-up, and not at their first scan.",
        ],
      },
      fr: {
        kicker: "QUAND ÇA PAIE",
        hook: ["À LEUR PREMIER", "ACHAT.", "PAS AVANT."],
        sub: [
          "Quinze crédits chacun, à vous et à eux, une fois l'achat fait.",
          "Pas à l'inscription, pas au premier scan.",
        ],
      },
    },
    {
      n: "04",
      scene: "steps",
      sticker: "none",
      en: {
        kicker: "OR HELP THE DATA",
        hook: ["POINT YOUR CAMERA", "AT A SHELF TAG."],
        steps: ["Scan a tag in store", "Three shoppers confirm it", "The credit lands"],
      },
      fr: {
        kicker: "OU AIDEZ LES DONNÉES",
        hook: ["POINTEZ LA CAMÉRA", "SUR UNE ÉTIQUETTE."],
        steps: ["Numérisez une étiquette", "Trois clients la confirment", "Le crédit arrive"],
      },
    },
    {
      n: "05",
      scene: "statement",
      sticker: "none",
      en: {
        kicker: "BEFORE YOU ASK",
        hook: ["NO, YOU CANNOT", "FARM IT.", "THAT IS THE POINT."],
        sub: [
          "A price one person saw is a rumour, so credit waits.",
          "Weekly and monthly caps: it pays readers, not the fastest.",
        ],
      },
      fr: {
        kicker: "AVANT DE DEMANDER",
        hook: ["NON, ON NE PEUT", "PAS EN ABUSER.", "C'EST VOULU."],
        sub: [
          "Un prix vu par une seule personne, c'est une rumeur.",
          "Des plafonds existent : ça paie les lecteurs, pas les rapides.",
        ],
      },
    },
  ],

  plans: [
    {
      n: "01",
      scene: "statement",
      sticker: "none",
      en: {
        kicker: "START HERE",
        hook: ["YOU START WITH", "SEVENTY-FIVE", "CREDITS."],
        sub: [
          "Free, once, when you install. One scan is one credit.",
          "They never expire. Nothing is charged until we find something.",
        ],
      },
      fr: {
        kicker: "AU DÉPART",
        hook: ["VOUS COMMENCEZ", "AVEC SOIXANTE-", "QUINZE CRÉDITS."],
        sub: [
          "Gratuits, une fois, à l'installation. Un scan, un crédit.",
          "Ils n'expirent pas. Rien n'est facturé avant qu'on trouve.",
        ],
      },
    },
    {
      n: "02",
      scene: "receipt",
      sticker: "none",
      en: {
        kicker: "WHAT SPENDS ONE",
        hook: ["CREDITS GO OUT", "IN TWO PLACES."],
        rows: [["SCAN A RECEIPT", "1 CREDIT"], ["A DROP WE FIND", "__REDACTED__"], ["ASKING THE STORE", "FREE"]],
        circleRow: 1,
      },
      fr: {
        kicker: "CE QUI EN DÉPENSE",
        hook: ["LES CRÉDITS SORTENT", "À DEUX ENDROITS."],
        rows: [["NUMÉRISER UN REÇU", "1 CRÉDIT"], ["UNE BAISSE TROUVÉE", "__REDACTED__"], ["DEMANDER AU MAGASIN", "GRATUIT"]],
        circleRow: 1,
      },
    },
    {
      n: "03",
      scene: "statement",
      sticker: "none",
      en: {
        kicker: "THE OTHER WAY",
        hook: ["UNLIMITED CHANGES", "THE SHAPE OF IT."],
        sub: [
          "One flat fee. Scans stop counting, and the charge on a",
          "drop we find goes away. The more you claim, the further ahead.",
        ],
      },
      fr: {
        kicker: "L'AUTRE FAÇON",
        hook: ["ILLIMITÉ CHANGE", "LA FORME DE TOUT ÇA."],
        sub: [
          "Un montant fixe. Les scans arrêtent de compter, et la",
          "charge sur une baisse disparaît. Réclamez plus, gagnez plus.",
        ],
      },
    },
    {
      n: "04",
      scene: "checks",
      sticker: "none",
      en: {
        kicker: "WHAT IT OPENS",
        hook: ["FLAT FEE.", "NOTHING METERED."],
        checks: [
          ["Scans, unlimited", "live"],
          ["No charge on a drop", "live"],
          ["Email sync", "live"],
          ["Priority price checks", "live"],
          ["Claims exported as PDF", "live"],
        ],
      },
      fr: {
        kicker: "CE QUE ÇA OUVRE",
        hook: ["MONTANT FIXE.", "RIEN AU COMPTEUR."],
        checks: [
          ["Scans illimités", "live"],
          ["Aucune charge sur une baisse", "live"],
          ["Synchro courriel", "live"],
          ["Vérifications prioritaires", "live"],
          ["Réclamations en PDF", "live"],
        ],
      },
    },
    {
      n: "05",
      scene: "statement",
      sticker: "none",
      en: {
        kicker: "PAID YEARLY",
        hook: ["TWELVE MONTHS", "FOR THE PRICE", "OF TEN."],
        sub: [
          "The yearly rate is ten times the monthly one.",
          "Two months come free. Current pricing is always in the app.",
        ],
      },
      fr: {
        kicker: "PAYÉ À L'ANNÉE",
        hook: ["DOUZE MOIS", "POUR LE PRIX", "DE DIX."],
        sub: [
          "Le tarif annuel vaut dix fois le mensuel.",
          "Deux mois gratuits. Le prix courant est toujours dans l'app.",
        ],
      },
    },
  ],

  features: [
    {
      n: "01",
      scene: "statement",
      sticker: "none",
      en: {
        kicker: "THE MAIN ONE",
        hook: ["WE WATCH THE PRICE", "SO YOU DO NOT", "HAVE TO."],
        sub: [
          "Every line the app can read gets watched on its own.",
          "You build no list. There is nothing to remember.",
        ],
      },
      fr: {
        kicker: "LA PRINCIPALE",
        hook: ["ON SURVEILLE LE PRIX", "POUR QUE VOUS", "N'AYEZ PAS À LE FAIRE."],
        sub: [
          "Chaque ligne lisible sur le reçu est suivie séparément.",
          "Vous ne bâtissez aucune liste. Rien à retenir.",
        ],
      },
    },
    {
      n: "02",
      scene: "statement",
      sticker: "none",
      en: {
        kicker: "BEFORE IT CLOSES",
        hook: ["TWO REMINDERS", "BEFORE THE", "WINDOW SHUTS."],
        sub: [
          "One with room to act, one just before it is too late.",
          "Each store sets its own window, so the app tracks yours.",
        ],
      },
      fr: {
        kicker: "AVANT QUE ÇA FERME",
        hook: ["DEUX RAPPELS", "AVANT QUE LA", "FENÊTRE SE FERME."],
        sub: [
          "Un avec le temps d'agir, un juste avant la fin.",
          "Chaque magasin fixe sa fenêtre : l'app suit la vôtre.",
        ],
      },
    },
    {
      n: "03",
      scene: "statement",
      sticker: "none",
      en: {
        kicker: "THE AWKWARD PART",
        hook: ["A SCRIPT FOR THE DESK.", "A DRAFT FOR", "THE INBOX."],
        sub: [
          "Asking is the part people put off, so the app writes it:",
          "an email to send, or a few lines to read at the counter.",
        ],
      },
      fr: {
        kicker: "LA PARTIE GÊNANTE",
        hook: ["UN SCRIPT AU COMPTOIR.", "UN BROUILLON", "POUR LE COURRIEL."],
        sub: [
          "Demander, c'est ce qu'on remet, alors l'app l'écrit :",
          "un courriel à envoyer, ou des lignes à lire au comptoir.",
        ],
      },
    },
    {
      n: "04",
      scene: "statement",
      sticker: "none",
      en: {
        kicker: "RECEIPTS YOU FORGOT",
        hook: ["YOUR INBOX", "ALREADY HAS", "SOME OF THESE."],
        sub: [
          "Connect Outlook and the app finds order confirmations",
          "you kept without meaning to. It reads; it never sends.",
        ],
      },
      fr: {
        kicker: "DES REÇUS OUBLIÉS",
        hook: ["VOTRE BOÎTE", "EN CONTIENT", "DÉJÀ."],
        sub: [
          "Connectez Outlook et l'app retrouve des confirmations",
          "gardées sans y penser. Elle lit; elle n'envoie jamais.",
        ],
      },
    },
    {
      n: "05",
      scene: "statement",
      sticker: "none",
      en: {
        kicker: "IN THE AISLE",
        hook: ["NO SIGNAL", "IS NOT", "A PROBLEM."],
        sub: [
          "Scanning works with no bars at all. What you scan waits",
          "on the phone and goes up when the signal comes back.",
        ],
      },
      fr: {
        kicker: "DANS L'ALLÉE",
        hook: ["PAS DE SIGNAL,", "PAS DE", "PROBLÈME."],
        sub: [
          "Le scan marche sans une seule barre. Ça attend sur le",
          "téléphone et monte tout seul quand le signal revient.",
        ],
      },
    },
    {
      n: "06",
      scene: "statement",
      sticker: "none",
      en: {
        kicker: "MAKE IT YOURS",
        hook: ["TELL IT THE DAY", "YOUR STORE", "GOES LIVE."],
        sub: [
          "Follow a store we cannot read yet. It tells you when we can.",
          "Language, warehouse and which alerts reach you are yours.",
        ],
      },
      fr: {
        kicker: "À VOTRE GOÛT",
        hook: ["QU'ELLE VOUS DISE", "QUAND VOTRE MAGASIN", "EMBARQUE."],
        sub: [
          "Suivez un magasin pas encore lu. On vous avertit le jour venu.",
          "La langue, l'entrepôt, les alertes : tout se règle.",
        ],
      },
    },
  ],

  tips: [
    {
      n: "04",
      scene: "statement",
      sticker: "none",
      en: {
        kicker: "CHEAPEST HABIT",
        hook: ["SCAN IT IN", "THE PARKING LOT."],
        sub: [
          "The receipt is never easier to find than right after you buy.",
          "Do it there and the watching starts before you get home.",
        ],
      },
      fr: {
        kicker: "LA MEILLEURE HABITUDE",
        hook: ["SCANNEZ-LE DANS", "LE STATIONNEMENT."],
        sub: [
          "Le reçu n'est jamais aussi facile à trouver qu'à ce moment-là.",
          "Faites-le là et la surveillance commence avant votre retour.",
        ],
      },
    },
  ],

  faq: [
    {
      n: "04",
      scene: "statement",
      sticker: "none",
      en: {
        kicker: "THE HONEST LIMIT",
        hook: ["WHAT IF I", "THREW OUT", "THE RECEIPT?"],
        sub: [
          "Then there is usually nothing to ask with — the proof of",
          "what you paid is the whole basis. Check your email first.",
        ],
      },
      fr: {
        kicker: "LA VRAIE LIMITE",
        hook: ["ET SI J'AI", "JETÉ LE", "REÇU?"],
        sub: [
          "Là, il n'y a en général rien pour demander : la preuve",
          "de ce que vous avez payé est la base. Voyez vos courriels.",
        ],
      },
    },
  ],

  about: [
    {
      n: "02",
      scene: "mark",
      sticker: "none",
      en: {
        kicker: "WHAT IT WILL NOT DO",
        hook: ["IT WILL NOT", "SELL WHAT", "YOU BOUGHT."],
        sub: [
          "No advertising ID, no precise location, and receipt photos",
          "are not kept after they are read. What is checkable is tested.",
        ],
      },
      fr: {
        kicker: "CE QU'ELLE NE FERA PAS",
        hook: ["ELLE NE VENDRA", "PAS CE QUE", "VOUS ACHETEZ."],
        sub: [
          "Aucun identifiant publicitaire, aucune position précise.",
          "Les photos de reçus ne sont pas gardées après lecture.",
        ],
      },
    },
  ],
};

// ── Assemble ────────────────────────────────────────────────────────────────
const out = {
  _readme: [
    "GENERATED by scenes/build-strings.js. Edit that file, or ../facts.json, and",
    "re-run it — do not hand-edit this one, because the store frames are derived",
    "from facts.json and a hand edit would put them out of step with it.",
    "",
    "  node sm-content/05-highlights/scenes/build-strings.js",
    "  node sm-content/05-highlights/scenes/render.js",
    "  node sm-content/05-highlights/scenes/verify.js",
  ],
  meta: {
    pack: "05-highlights",
    built: FACTS.checkedOn,
    factsFrom: FACTS.branch,
    handle: "@priceback.ca",
    structure: [
      "Every Highlight runs: intro -> English -> the FR card -> French.",
      "The intro and the FR card are NOT rendered here. They live once, in",
      "04-community/00-language-notice/, and are reused at the front and middle of",
      "every tray. See HIGHLIGHTS.md.",
    ],
  },
  trays: TRAYS,
  covers: TRAYS.map((t) => ({ order: t.order, id: t.id, icon: t.icon, titleEn: t.en, titleFr: t.fr })),
  frames: {},
};

for (const [trayId, list] of Object.entries(FRAMES)) {
  out.frames[trayId] = list.map((f) => {
    const row = { n: f.n, scene: f.scene, sticker: f.sticker };
    for (const lang of ["en", "fr"]) {
      const body = { ...f[lang] };
      if (f.fineprint) body.fineprint = DISCLAIMER[lang];
      row[lang] = body;
    }
    return row;
  });
}

fs.writeFileSync(path.join(__dirname, "strings.json"), `${JSON.stringify(out, null, 2)}\n`);

const n = Object.values(out.frames).reduce((a, l) => a + l.length, 0);
console.log(`strings.json written — ${TRAYS.length} trays, ${n} frames x 2 languages, ${out.covers.length} covers.`);
