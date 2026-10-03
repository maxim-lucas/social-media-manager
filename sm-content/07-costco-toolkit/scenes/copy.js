// Costco toolkit pack — ALL the copy: seven carousels, each in English AND French.
// Source of truth for render.js, verify.js and CAPTIONS.md. Edit here, then re-run
// scenes/render.js, scenes/verify.js and scripts (see ../TOOLKIT-NOTES.md).
//
// Every claim is checked against the shipped app (tag v3.0.3, 2026-09-30) — the
// table is in ../TOOLKIT-NOTES.md. French uses the app's own vocabulary
// (scanner, reçu, rabais, étiquette, base communautaire) and Quebec spacing
// (no space before ?: !).
//
// Slide shapes (scene):
//   cover  kicker, hook[], sub[], paper[], swipe, [badges]
//   rows   kicker, hook[], sub[], rows[[label,value]], [frame] [highlight]
//          a row whose value is "" is drawn as a redacted price (row 0 struck through)
//   tag    kicker, hook[], sub[], tagLabel, price, ring (trailing chars ringed), means, label, [star]
//   cta    kicker, hook[], checks[[main,note]], fine[]

const FINE = {
  en: ["PriceBack is an independent app, not affiliated with Costco."],
  fr: ["PriceBack est une application indépendante, non affiliée à Costco."],
};
const FOLLOW = {
  en: ["Follow @priceback.ca", "new stores are announced here first"],
  fr: ["Suivez @priceback.ca", "les nouveaux magasins sont annoncés ici en premier"],
};
const DL = { en: ["Download PriceBack", "link in bio"], fr: ["Téléchargez PriceBack", "lien dans la bio"] };
const CODE_FINE = {
  en: "Price endings are a common shopper rule of thumb, not a promise. Check the tag.",
  fr: "Les fins de prix sont un repère courant des clients, pas une promesse. Vérifiez l’étiquette.",
};
const CAP_FINE = {
  en: "Only savings tags can earn credit, up to a weekly cap.",
  fr: "Seul un rabais peut rapporter un crédit, plafond hebdomadaire.",
};
const CLAIM_FINE = {
  en: "Price-adjustment terms are set by each store. The store decides.",
  fr: "Les conditions d’ajustement sont fixées par chaque magasin, qui décide.",
};

const fine = (lang, ...extra) => [...extra, ...FINE[lang]];

const POSTS = [
  // ───────────────────────────────────────────── 1 · the toolkit ──────────
  {
    id: "toolkit",
    en: [
      { scene: "cover", kicker: "FOR COSTCO SHOPPERS", hook: ["YOUR COSTCO", "TOOLKIT."], sub: ["Price drops, deal codes, price tags.", "Free to download."], paper: ["5 TOOLS. ONE", "WAREHOUSE RUN."], swipe: "SWIPE FOR THE TOOLS →", badges: true,
        alt: "Your Costco toolkit. PriceBack: price drops, deal codes and price tags, free to download. Swipe for the five tools." },
      { scene: "rows", kicker: "TOOL 01 · SCAN", hook: ["SCAN YOUR", "RECEIPTS."], sub: ["Snap a photo of your Costco receipt.", "Every item gets watched."], rows: [["RECEIPT", "SCANNED"], ["EACH ITEM", "WATCHED"], ["COST TO YOU", "1 CREDIT"]], frame: true,
        alt: "Tool 1: scan your receipts. Snap a photo of your Costco receipt and every item gets watched. One scan costs one credit." },
      { scene: "rows", kicker: "TOOL 02 · ALERTS", hook: ["PRICE DROP", "ALERTS."], sub: ["Something you bought gets cheaper?", "You get an alert."], rows: [["YOU PAID", ""], ["PRICE TODAY", ""], ["DIFFERENCE", "ALERT SENT"]], highlight: 2,
        alt: "Tool 2: price drop alerts. When something you bought gets cheaper, you get an alert." },
      { scene: "rows", kicker: "TOOL 03 · CLAIM", hook: ["CLAIM THE", "DIFFERENCE."], sub: ["The Claim Assistant preps your receipt,", "proof and checklist."], rows: [["RECEIPT", "IN YOUR APP"], ["NEW PRICE", "PROOF READY"], ["CHECKLIST", "FOR THE DESK"]], highlight: 1,
        alt: "Tool 3: claim the difference. The Claim Assistant prepares your receipt, proof of the new price and an in-store checklist." },
      { scene: "tag", kicker: "TOOL 04 · DECODE", hook: ["DECODE THE", "PRICE TAG."], sub: ["Scan a shelf tag and see what kind", "of deal it is."], tagLabel: "PRICE ON THE TAG", price: "14.97", ring: 3, means: "USUALLY MEANS", label: "CORPORATE MARKDOWN", fine: [CODE_FINE.en, ...FINE.en],
        alt: "Tool 4: decode the price tag. Scan a shelf tag and see what kind of deal it is. Example: a price ending in .97 usually means a corporate markdown." },
      { scene: "rows", kicker: "TOOL 05 · SHARE", hook: ["SHARE WHAT", "YOU SEE."], sub: ["Scan a shelf tag and help shoppers", "near you spot real savings."], rows: [["SHELF TAG", "SCANNED"], ["NEARBY SHOPPERS", "HELPED"], ["VERIFIED SAVINGS", "EARN CREDIT"]], frame: true, fine: [CAP_FINE.en],
        alt: "Tool 5: share what you see. Scan a shelf tag and help shoppers near you spot real savings. Only savings tags can earn credit, up to a weekly cap." },
      { scene: "cta", kicker: "YOUR MOVE", hook: ["DOWNLOAD.", "SCAN. CLAIM."], checks: [DL.en, ["Scan your Costco receipts", "we watch the prices"], FOLLOW.en],
        alt: "Your move: download PriceBack (link in bio), scan your Costco receipts, and follow @priceback.ca, where new stores are announced first." },
    ],
    fr: [
      { scene: "cover", kicker: "POUR LES CLIENTS COSTCO", hook: ["VOTRE BOÎTE À", "OUTILS COSTCO."], sub: ["Baisses de prix, codes de prix, étiquettes.", "Téléchargement gratuit."], paper: ["5 OUTILS POUR", "VOTRE VISITE."], swipe: "GLISSEZ POUR LES VOIR →", badges: true,
        alt: "Votre boîte à outils Costco. PriceBack: baisses de prix, codes de prix et étiquettes, téléchargement gratuit. Glissez pour voir les cinq outils." },
      { scene: "rows", kicker: "OUTIL 01 · SCANNEZ", hook: ["SCANNEZ VOS", "REÇUS."], sub: ["Prenez votre reçu Costco en photo.", "Chaque article est surveillé."], rows: [["REÇU", "SCANNÉ"], ["CHAQUE ARTICLE", "SURVEILLÉ"], ["COÛT POUR VOUS", "1 CRÉDIT"]], frame: true,
        alt: "Outil 1: scannez vos reçus. Prenez votre reçu Costco en photo et chaque article est surveillé. Un scan coûte un crédit." },
      { scene: "rows", kicker: "OUTIL 02 · ALERTES", hook: ["ALERTES DE", "BAISSE DE PRIX."], sub: ["Un article acheté baisse de prix?", "Vous recevez une alerte."], rows: [["VOUS AVEZ PAYÉ", ""], ["PRIX AUJOURD’HUI", ""], ["DIFFÉRENCE", "ALERTE ENVOYÉE"]], highlight: 2,
        alt: "Outil 2: alertes de baisse de prix. Quand un article que vous avez acheté baisse de prix, vous recevez une alerte." },
      { scene: "rows", kicker: "OUTIL 03 · RÉCLAMEZ", hook: ["RÉCLAMEZ LA", "DIFFÉRENCE."], sub: ["L’assistant de réclamation prépare votre reçu,", "la preuve et la liste de vérification."], rows: [["REÇU", "DANS L’APPLICATION"], ["NOUVEAU PRIX", "PREUVE PRÊTE"], ["LISTE", "POUR LE COMPTOIR"]], highlight: 1,
        alt: "Outil 3: réclamez la différence. L’assistant de réclamation prépare votre reçu, la preuve du nouveau prix et une liste de vérification en magasin." },
      { scene: "tag", kicker: "OUTIL 04 · DÉCODEZ", hook: ["DÉCODEZ", "L’ÉTIQUETTE."], sub: ["Scannez une étiquette en rayon et voyez", "de quel type d’aubaine il s’agit."], tagLabel: "PRIX SUR L’ÉTIQUETTE", price: "14,97", ring: 3, means: "SIGNIFIE SOUVENT", label: "RABAIS CORPORATIF", fine: [CODE_FINE.fr, ...FINE.fr],
        alt: "Outil 4: décodez l’étiquette. Scannez une étiquette en rayon et voyez de quel type d’aubaine il s’agit. Exemple: un prix qui se termine par ,97 signifie souvent un rabais corporatif." },
      { scene: "rows", kicker: "OUTIL 05 · PARTAGEZ", hook: ["PARTAGEZ CE", "QUE VOUS VOYEZ."], sub: ["Scannez une étiquette et aidez les clients", "près de vous à repérer les rabais."], rows: [["ÉTIQUETTE", "SCANNÉE"], ["CLIENTS À PROXIMITÉ", "AIDÉS"], ["RABAIS VÉRIFIÉ", "GAGNE UN CRÉDIT"]], frame: true, fine: [CAP_FINE.fr],
        alt: "Outil 5: partagez ce que vous voyez. Scannez une étiquette et aidez les clients près de vous à repérer les rabais. Seul un rabais peut rapporter un crédit, avec un plafond hebdomadaire." },
      { scene: "cta", kicker: "À VOUS DE JOUER", hook: ["TÉLÉCHARGEZ.", "SCANNEZ. RÉCLAMEZ."], checks: [DL.fr, ["Scannez vos reçus Costco", "on surveille les prix"], FOLLOW.fr],
        alt: "À vous de jouer: téléchargez PriceBack (lien dans la bio), scannez vos reçus Costco et suivez @priceback.ca, où les nouveaux magasins sont annoncés en premier." },
    ],
    caption: {
      en: { hook: "Everything you need for your next Costco run, in one free app 🛒", lead: "Five tools, swipe to see them 👇", bullets: ["🧾 Scan your receipts, and every item gets watched", "🔔 Get an alert when a price drops", "💸 Claim the difference with the Claim Assistant", "🏷️ Decode the price tag: what kind of deal is it?", "🤝 Share what you see and help shoppers near you"], engage: "💬 Which tool do you want a deep dive on? Tell us in the comments.", send: "Send this to your Costco shopping buddy.", tags: "#PriceBack #Costco #CostcoCanada #SaveMoney #CanadianDeals" },
      fr: { hook: "Tout ce qu’il vous faut pour votre prochaine visite chez Costco, dans une seule application gratuite 🛒", lead: "Cinq outils, glissez pour les voir 👇", bullets: ["🧾 Scannez vos reçus, et chaque article est surveillé", "🔔 Recevez une alerte quand un prix baisse", "💸 Réclamez la différence avec l’assistant de réclamation", "🏷️ Décodez l’étiquette: quel type d’aubaine est-ce?", "🤝 Partagez ce que vous voyez et aidez les clients près de vous"], engage: "💬 Sur quel outil voulez-vous un guide complet? Dites-le-nous en commentaire.", send: "Envoyez cette publication à votre complice des courses chez Costco.", tags: "#PriceBack #Costco #CostcoQuébec #Économies #BonsPlans" },
    },
    extraFine: { en: "", fr: "" },
  },

  // ───────────────────────────────────────────── 2 · scan a receipt ──────
  {
    id: "scan-receipt",
    en: [
      { scene: "cover", kicker: "HOW TO · SCAN A RECEIPT", hook: ["SCAN A RECEIPT", "IN 3 STEPS."], sub: ["No typing. No spreadsheets.", "Just a photo."], paper: ["YOUR COSTCO RECEIPT", "IS WORTH WATCHING."], swipe: "SWIPE FOR THE STEPS →",
        alt: "How to scan a receipt in three steps. No typing, no spreadsheets, just a photo. Your Costco receipt is worth watching." },
      { scene: "rows", kicker: "STEP 01 · OPEN", hook: ["TAP SCAN", "RECEIPT."], sub: ["Open PriceBack and choose Scan Receipt.", "Allow the camera when asked."], rows: [["PRICEBACK", "OPEN"], ["SCAN RECEIPT", "TAP"], ["CAMERA", "ALLOW"]], highlight: 1,
        alt: "Step 1: open PriceBack, tap Scan Receipt and allow the camera when asked." },
      { scene: "rows", kicker: "STEP 02 · FRAME", hook: ["FIT THE FULL", "RECEIPT."], sub: ["Lay it flat, avoid glare,", "and keep every line in the frame."], rows: [["TOP OF RECEIPT", "IN FRAME"], ["EVERY ITEM", "IN FRAME"], ["TOTAL", "IN FRAME"]], frame: true,
        alt: "Step 2: fit the full receipt in the frame. Lay it flat, avoid glare and keep every line in view." },
      { scene: "rows", kicker: "STEP 03 · DONE", hook: ["WE READ", "EVERY LINE."], sub: ["Items and prices are saved to your receipts.", "PriceBack keeps watching them."], rows: [["ITEMS", "SAVED"], ["PRICES", "WATCHED"], ["COST", "1 CREDIT"]], highlight: 1,
        alt: "Step 3: done. PriceBack reads every line, saves the items and prices to your receipts and keeps watching them. A scan costs one credit." },
      { scene: "cta", kicker: "YOUR MOVE", hook: ["SCAN ONE", "TODAY."], checks: [DL.en, ["Scan a receipt", "welcome credits cover your first scans"], FOLLOW.en],
        alt: "Your move: download PriceBack (link in bio), scan a receipt (welcome credits cover your first scans), and follow @priceback.ca, where new stores are announced first." },
    ],
    fr: [
      { scene: "cover", kicker: "COMMENT · SCANNER UN REÇU", hook: ["SCANNEZ UN REÇU", "EN 3 ÉTAPES."], sub: ["Rien à taper. Aucun tableur.", "Juste une photo."], paper: ["VOTRE REÇU COSTCO", "MÉRITE D’ÊTRE SURVEILLÉ."], swipe: "GLISSEZ POUR LES ÉTAPES →",
        alt: "Comment scanner un reçu en trois étapes. Rien à taper, aucun tableur, juste une photo. Votre reçu Costco mérite d’être surveillé." },
      { scene: "rows", kicker: "ÉTAPE 01 · OUVREZ", hook: ["TOUCHEZ SCANNER", "UN REÇU."], sub: ["Ouvrez PriceBack et choisissez Scanner un reçu.", "Autorisez la caméra à la demande."], rows: [["PRICEBACK", "OUVERT"], ["SCANNER UN REÇU", "TOUCHER"], ["CAMÉRA", "AUTORISER"]], highlight: 1,
        alt: "Étape 1: ouvrez PriceBack, touchez Scanner un reçu et autorisez la caméra à la demande." },
      { scene: "rows", kicker: "ÉTAPE 02 · CADREZ", hook: ["CADREZ LE REÇU", "EN ENTIER."], sub: ["À plat, sans reflet,", "chaque ligne dans le cadre."], rows: [["HAUT DU REÇU", "DANS LE CADRE"], ["CHAQUE ARTICLE", "DANS LE CADRE"], ["TOTAL", "DANS LE CADRE"]], frame: true,
        alt: "Étape 2: cadrez le reçu en entier. À plat, sans reflet, avec chaque ligne dans le cadre." },
      { scene: "rows", kicker: "ÉTAPE 03 · TERMINÉ", hook: ["ON LIT CHAQUE", "LIGNE."], sub: ["Articles et prix sont enregistrés dans vos reçus.", "PriceBack continue de les surveiller."], rows: [["ARTICLES", "ENREGISTRÉS"], ["PRIX", "SURVEILLÉS"], ["COÛT", "1 CRÉDIT"]], highlight: 1,
        alt: "Étape 3: terminé. PriceBack lit chaque ligne, enregistre les articles et les prix dans vos reçus et continue de les surveiller. Un scan coûte un crédit." },
      { scene: "cta", kicker: "À VOUS DE JOUER", hook: ["SCANNEZ-EN UN", "AUJOURD’HUI."], checks: [DL.fr, ["Scannez un reçu", "les crédits de bienvenue couvrent vos premiers scans"], FOLLOW.fr],
        alt: "À vous de jouer: téléchargez PriceBack (lien dans la bio), scannez un reçu (les crédits de bienvenue couvrent vos premiers scans) et suivez @priceback.ca, où les nouveaux magasins sont annoncés en premier." },
    ],
    caption: {
      en: { hook: "Your Costco receipt is worth more than you think 🧾", lead: "How to scan one in 3 steps 👇", bullets: ["1️⃣ Open PriceBack and tap Scan Receipt", "2️⃣ Fit the full receipt in the frame, flat and glare-free", "3️⃣ We read every line, save it, and keep watching the prices"], engage: "💬 How many receipts are sitting in your drawer right now? Be honest.", send: "Send this to the friend who keeps every receipt.", tags: "#PriceBack #Costco #SaveMoney #HowTo #CanadianDeals" },
      fr: { hook: "Votre reçu Costco vaut plus que vous le pensez 🧾", lead: "Comment en scanner un en 3 étapes 👇", bullets: ["1️⃣ Ouvrez PriceBack et touchez Scanner un reçu", "2️⃣ Cadrez le reçu en entier, à plat et sans reflet", "3️⃣ On lit chaque ligne, on l’enregistre et on continue de surveiller les prix"], engage: "💬 Combien de reçus dorment dans votre tiroir en ce moment? Soyez honnête.", send: "Envoyez cette publication à l’ami qui garde tous ses reçus.", tags: "#PriceBack #Costco #Économies #Truc #BonsPlans" },
    },
    extraFine: { en: "", fr: "" },
  },

  // ───────────────────────────────────────────── 3 · claim a price drop ──
  {
    id: "claim-drop",
    en: [
      { scene: "cover", kicker: "HOW TO · CLAIM", hook: ["CLAIM A", "PRICE DROP."], sub: ["From alert to refund request", "in four steps."], paper: ["THE PRICE FELL", "AFTER YOU PAID."], swipe: "SWIPE FOR THE STEPS →", fine: [CLAIM_FINE.en, ...FINE.en],
        alt: "How to claim a price drop, from alert to refund request in four steps. The price fell after you paid. The store decides on each adjustment." },
      { scene: "rows", kicker: "STEP 01 · ALERT", hook: ["GET THE", "ALERT."], sub: ["PriceBack spots a lower price on something", "you bought, and tells you."], rows: [["YOU PAID", ""], ["PRICE TODAY", ""], ["DIFFERENCE", "ALERT SENT"]], highlight: 2,
        alt: "Step 1: get the alert. PriceBack spots a lower price on something you bought and tells you." },
      { scene: "rows", kicker: "STEP 02 · OPEN", hook: ["OPEN THE CLAIM", "ASSISTANT."], sub: ["Tap the alert. Your receipt, the new price", "and the savings amount are ready."], rows: [["WAS", ""], ["NOW", ""], ["YOU’RE OWED", "SHOWN"]], highlight: 2,
        alt: "Step 2: open the Claim Assistant. Tap the alert and your receipt, the new price and the amount you're owed are ready." },
      { scene: "rows", kicker: "STEP 03 · GO", hook: ["VISIT THE", "STORE DESK."], sub: ["Costco warehouse adjustments are asked", "for in person. Show your receipt in the app."], rows: [["RECEIPT", "SHOW IN APP"], ["NEW PRICE", "SHOW PROOF"], ["WHERE", "CUSTOMER SERVICE"]], highlight: 2,
        alt: "Step 3: visit the store desk. Costco warehouse adjustments are asked for in person. Show your receipt in the app and proof of the new price at Customer Service." },
      { scene: "rows", kicker: "STEP 04 · ASK", hook: ["ASK FOR THE", "DIFFERENCE."], sub: ["Request the adjustment on your original", "payment method. The store decides."], rows: [["REQUEST", "ADJUSTMENT"], ["REFUND TO", "ORIGINAL PAYMENT"], ["DECISION", "THE STORE’S"]], highlight: 0, fine: [CLAIM_FINE.en, ...FINE.en],
        alt: "Step 4: ask for the difference. Request the adjustment on your original payment method. The store decides." },
      { scene: "cta", kicker: "BEFORE THE WINDOW CLOSES", hook: ["CLAIM BEFORE", "IT CLOSES."], checks: [["Scan your receipts", "no receipt, nothing to watch"], ["Keep alerts on", "we remind you before the window closes"], FOLLOW.en],
        alt: "Claim before the window closes: scan your receipts, keep alerts on (we remind you before the window closes) and follow @priceback.ca, where new stores are announced first." },
    ],
    fr: [
      { scene: "cover", kicker: "COMMENT · RÉCLAMER", hook: ["RÉCLAMEZ UNE", "BAISSE DE PRIX."], sub: ["De l’alerte à la demande de remboursement", "en quatre étapes."], paper: ["LE PRIX A BAISSÉ", "APRÈS VOTRE ACHAT."], swipe: "GLISSEZ POUR LES ÉTAPES →", fine: [CLAIM_FINE.fr, ...FINE.fr],
        alt: "Comment réclamer une baisse de prix, de l’alerte à la demande de remboursement en quatre étapes. Le prix a baissé après votre achat. Le magasin décide de chaque ajustement." },
      { scene: "rows", kicker: "ÉTAPE 01 · ALERTE", hook: ["RECEVEZ", "L’ALERTE."], sub: ["PriceBack repère un prix plus bas sur un article", "que vous avez acheté, et vous prévient."], rows: [["VOUS AVEZ PAYÉ", ""], ["PRIX AUJOURD’HUI", ""], ["DIFFÉRENCE", "ALERTE ENVOYÉE"]], highlight: 2,
        alt: "Étape 1: recevez l’alerte. PriceBack repère un prix plus bas sur un article que vous avez acheté et vous prévient." },
      { scene: "rows", kicker: "ÉTAPE 02 · OUVREZ", hook: ["OUVREZ", "L’ASSISTANT."], sub: ["Touchez l’alerte. Votre reçu, le nouveau prix", "et l’économie sont prêts."], rows: [["AVANT", ""], ["MAINTENANT", ""], ["ON VOUS DOIT", "AFFICHÉ"]], highlight: 2,
        alt: "Étape 2: ouvrez l’assistant de réclamation. Touchez l’alerte et votre reçu, le nouveau prix et le montant qu’on vous doit sont prêts." },
      { scene: "rows", kicker: "ÉTAPE 03 · ALLEZ-Y", hook: ["PASSEZ AU", "COMPTOIR."], sub: ["À l’entrepôt Costco, l’ajustement se demande", "en personne. Montrez votre reçu dans l’application."], rows: [["REÇU", "DANS L’APPLICATION"], ["NOUVEAU PRIX", "PREUVE"], ["OÙ", "SERVICE À LA CLIENTÈLE"]], highlight: 2,
        alt: "Étape 3: passez au comptoir. À l’entrepôt Costco, l’ajustement se demande en personne. Montrez votre reçu dans l’application et la preuve du nouveau prix au service à la clientèle." },
      { scene: "rows", kicker: "ÉTAPE 04 · DEMANDEZ", hook: ["DEMANDEZ LA", "DIFFÉRENCE."], sub: ["Demandez l’ajustement sur votre mode de", "paiement original. Le magasin décide."], rows: [["DEMANDE", "AJUSTEMENT"], ["REMBOURSEMENT", "MODE DE PAIEMENT"], ["DÉCISION", "LE MAGASIN"]], highlight: 0, fine: [CLAIM_FINE.fr, ...FINE.fr],
        alt: "Étape 4: demandez la différence. Demandez l’ajustement sur votre mode de paiement original. Le magasin décide." },
      { scene: "cta", kicker: "AVANT LA FIN DU DÉLAI", hook: ["RÉCLAMEZ AVANT", "LA FIN DU DÉLAI."], checks: [["Scannez vos reçus", "pas de reçu, rien à surveiller"], ["Gardez les alertes", "on vous rappelle avant la fin du délai"], FOLLOW.fr],
        alt: "Réclamez avant la fin du délai: scannez vos reçus, gardez les alertes (on vous rappelle avant la fin du délai) et suivez @priceback.ca, où les nouveaux magasins sont annoncés en premier." },
    ],
    caption: {
      en: { hook: "The price dropped after you paid. Here's how to ask for the difference 💸", lead: "From alert to refund request 👇", bullets: ["🔔 Get the alert when something you bought gets cheaper", "📲 Open the Claim Assistant: receipt, new price and amount, ready", "🏬 Costco warehouse adjustments are asked for in person. Show your receipt in the app at Customer Service", "🙋 Ask for the difference on your original payment method. The store decides"], engage: "💬 Ever claimed a price adjustment? Tell us how it went.", send: "Send this to someone who just made a big purchase.", tags: "#PriceBack #Costco #PriceAdjustment #SaveMoney #HowTo" },
      fr: { hook: "Le prix a baissé après votre achat. Voici comment demander la différence 💸", lead: "De l’alerte à la demande de remboursement 👇", bullets: ["🔔 Recevez l’alerte quand un article acheté baisse de prix", "📲 Ouvrez l’assistant de réclamation: reçu, nouveau prix et montant, prêts", "🏬 À l’entrepôt Costco, l’ajustement se demande en personne. Montrez votre reçu dans l’application au service à la clientèle", "🙋 Demandez la différence sur votre mode de paiement original. Le magasin décide"], engage: "💬 Déjà réclamé un ajustement de prix? Racontez-nous comment ça s’est passé.", send: "Envoyez cette publication à quelqu’un qui vient de faire un gros achat.", tags: "#PriceBack #Costco #AjustementDePrix #Économies #Truc" },
    },
    extraFine: {
      en: "Costco warehouse price adjustments are requested in person, and the store decides on each one.",
      fr: "À l’entrepôt Costco, les ajustements de prix se demandent en personne, et le magasin décide de chacun.",
    },
  },

  // ───────────────────────────────────────────── 4 · the price tag scanner
  {
    id: "price-tag",
    en: [
      { scene: "cover", kicker: "HOW TO · SCAN A PRICE TAG", hook: ["SCAN A", "PRICE TAG."], sub: ["Snap the shelf tag. PriceBack reads the", "SKU, price and savings for you."], paper: ["THE SHELF TAG", "KNOWS A LOT."], swipe: "SWIPE FOR THE STEPS →",
        alt: "How to scan a price tag. Snap the shelf tag and PriceBack reads the SKU, price and savings for you." },
      { scene: "rows", kicker: "STEP 01 · FIND", hook: ["FIND A TAG", "ON THE SHELF."], sub: ["Any Costco shelf tag works.", "Savings tags can earn credit."], rows: [["SHELF TAG", "FOUND"], ["SKU", "VISIBLE"], ["PRICE", "VISIBLE"]], highlight: 0,
        alt: "Step 1: find a tag on the shelf. Any Costco shelf tag works, and savings tags can earn credit." },
      { scene: "rows", kicker: "STEP 02 · FRAME", hook: ["FRAME THE", "WHOLE TAG."], sub: ["Include the SKU, avoid glare, and keep", "the digits sharp."], rows: [["SKU", "IN FRAME"], ["PRICE", "IN FRAME"], ["SAVINGS", "IN FRAME"]], frame: true,
        alt: "Step 2: frame the whole tag. Include the SKU, avoid glare and keep the digits sharp." },
      { scene: "rows", kicker: "STEP 03 · REVIEW", hook: ["CHECK AND", "SUBMIT."], sub: ["Review what was read, add the end date", "of a savings tag, then submit."], rows: [["PRODUCT", "READ"], ["PRICE", "READ"], ["END DATE", "ADD IT"]], highlight: 2,
        alt: "Step 3: check and submit. Review what was read, add the end date of a savings tag, then submit." },
      { scene: "cta", kicker: "YOUR MOVE", hook: ["SCAN A TAG", "TODAY."], checks: [DL.en, ["Snap a shelf tag", "savings tags can earn credit once verified"], FOLLOW.en], fine: [CAP_FINE.en, ...FINE.en],
        alt: "Your move: download PriceBack (link in bio), snap a shelf tag (savings tags can earn credit once verified, up to a weekly cap) and follow @priceback.ca, where new stores are announced first." },
    ],
    fr: [
      { scene: "cover", kicker: "COMMENT · SCANNER UNE ÉTIQUETTE", hook: ["SCANNEZ UNE", "ÉTIQUETTE."], sub: ["Photographiez l’étiquette. PriceBack lit le", "SKU, le prix et le rabais pour vous."], paper: ["L’ÉTIQUETTE EN", "DIT LONG."], swipe: "GLISSEZ POUR LES ÉTAPES →",
        alt: "Comment scanner une étiquette. Photographiez l’étiquette en rayon et PriceBack lit le SKU, le prix et le rabais pour vous." },
      { scene: "rows", kicker: "ÉTAPE 01 · TROUVEZ", hook: ["TROUVEZ UNE", "ÉTIQUETTE."], sub: ["Toute étiquette Costco convient.", "Un rabais peut rapporter un crédit."], rows: [["ÉTIQUETTE", "TROUVÉE"], ["SKU", "VISIBLE"], ["PRIX", "VISIBLE"]], highlight: 0,
        alt: "Étape 1: trouvez une étiquette en rayon. Toute étiquette Costco convient, et un rabais peut rapporter un crédit." },
      { scene: "rows", kicker: "ÉTAPE 02 · CADREZ", hook: ["CADREZ TOUTE", "L’ÉTIQUETTE."], sub: ["Incluez le SKU, évitez les reflets", "et gardez les chiffres nets."], rows: [["SKU", "DANS LE CADRE"], ["PRIX", "DANS LE CADRE"], ["RABAIS", "DANS LE CADRE"]], frame: true,
        alt: "Étape 2: cadrez toute l’étiquette. Incluez le SKU, évitez les reflets et gardez les chiffres nets." },
      { scene: "rows", kicker: "ÉTAPE 03 · VÉRIFIEZ", hook: ["VÉRIFIEZ ET", "ENVOYEZ."], sub: ["Vérifiez la lecture, ajoutez la date de fin", "d’un rabais, puis envoyez."], rows: [["PRODUIT", "LU"], ["PRIX", "LU"], ["DATE DE FIN", "À AJOUTER"]], highlight: 2,
        alt: "Étape 3: vérifiez et envoyez. Vérifiez la lecture, ajoutez la date de fin d’un rabais, puis envoyez." },
      { scene: "cta", kicker: "À VOUS DE JOUER", hook: ["SCANNEZ-EN UNE", "AUJOURD’HUI."], checks: [DL.fr, ["Photographiez une étiquette", "un rabais vérifié peut rapporter un crédit"], FOLLOW.fr], fine: [CAP_FINE.fr, ...FINE.fr],
        alt: "À vous de jouer: téléchargez PriceBack (lien dans la bio), photographiez une étiquette (un rabais vérifié peut rapporter un crédit, avec un plafond hebdomadaire) et suivez @priceback.ca, où les nouveaux magasins sont annoncés en premier." },
    ],
    caption: {
      en: { hook: "A Costco shelf tag is full of clues. Let PriceBack read it for you 🏷️", lead: "How to scan a price tag 👇", bullets: ["1️⃣ Find a tag on the shelf", "2️⃣ Frame the whole tag: SKU, price, no glare", "3️⃣ Check what was read, add the end date of a savings tag, submit"], engage: "💬 What's the best deal you've spotted on a shelf lately?", send: "Send this to your Costco shopping buddy.", tags: "#PriceBack #Costco #CostcoCanada #SaveMoney #HowTo" },
      fr: { hook: "Une étiquette Costco est pleine d’indices. Laissez PriceBack la lire pour vous 🏷️", lead: "Comment scanner une étiquette 👇", bullets: ["1️⃣ Trouvez une étiquette en rayon", "2️⃣ Cadrez toute l’étiquette: SKU, prix, sans reflet", "3️⃣ Vérifiez la lecture, ajoutez la date de fin d’un rabais, envoyez"], engage: "💬 Quelle est la meilleure aubaine que vous avez repérée en rayon dernièrement?", send: "Envoyez cette publication à votre complice des courses chez Costco.", tags: "#PriceBack #Costco #CostcoQuébec #Économies #Truc" },
    },
    extraFine: { en: CAP_FINE.en, fr: CAP_FINE.fr },
  },

  // ───────────────────────────────────────────── 5 · share with the community
  {
    id: "community",
    en: [
      { scene: "cover", kicker: "SHOPPERS HELPING SHOPPERS", hook: ["SHARE WITH", "THE COMMUNITY."], sub: ["One photo of a shelf tag helps every", "PriceBack shopper near you."], paper: ["YOUR PHOTO IS", "SOMEONE’S DEAL."], swipe: "SWIPE TO SEE HOW →",
        alt: "Share with the community. One photo of a shelf tag helps every PriceBack shopper near you. Your photo is someone's deal." },
      { scene: "rows", kicker: "STEP 01 · SNAP", hook: ["SNAP A", "SHELF TAG."], sub: ["Use the price tag scanner in the warehouse.", "Frame the SKU and price."], rows: [["SHELF TAG", "SNAPPED"], ["SKU + PRICE", "READ"], ["YOUR WAREHOUSE", "LOGGED"]], frame: true,
        alt: "Step 1: snap a shelf tag with the price tag scanner. Frame the SKU and price." },
      { scene: "rows", kicker: "STEP 02 · SHARE", hook: ["IT JOINS THE", "PRICE POOL."], sub: ["Your tag is added anonymously to the shared", "price pool for your area."], rows: [["YOUR IDENTITY", "ANONYMOUS"], ["PRICE POOL", "YOUR AREA"], ["NEARBY SHOPPERS", "HELPED"]], highlight: 0,
        alt: "Step 2: it joins the price pool. Your tag is added anonymously to the shared price pool for your area, which helps nearby shoppers." },
      { scene: "rows", kicker: "STEP 03 · VERIFIED", hook: ["SHOPPERS", "CONFIRM IT."], sub: ["When enough shoppers confirm the same", "savings, it counts as verified."], rows: [["TAG SEEN BY", "ENOUGH SHOPPERS"], ["STATUS", "VERIFIED"], ["SAVINGS TAG", "1 CREDIT"]], highlight: 2, fine: [CAP_FINE.en, ...FINE.en],
        alt: "Step 3: shoppers confirm it. When enough shoppers confirm the same savings it counts as verified, and a savings tag earns one credit, up to a weekly cap." },
      { scene: "cta", kicker: "YOUR MOVE", hook: ["SHARE ONE", "TODAY."], checks: [DL.en, ["Snap a shelf tag", "help your neighbours"], FOLLOW.en], fine: [CAP_FINE.en, ...FINE.en],
        alt: "Your move: download PriceBack (link in bio), snap a shelf tag to help your neighbours, and follow @priceback.ca, where new stores are announced first. Only savings tags can earn credit, up to a weekly cap." },
    ],
    fr: [
      { scene: "cover", kicker: "ENTRAIDE ENTRE CLIENTS", hook: ["PARTAGEZ AVEC", "LA COMMUNAUTÉ."], sub: ["Une photo d’étiquette aide tous les clients", "PriceBack près de chez vous."], paper: ["VOTRE PHOTO EST", "L’AUBAINE DE QUELQU’UN."], swipe: "GLISSEZ POUR VOIR COMMENT →",
        alt: "Partagez avec la communauté. Une photo d’étiquette aide tous les clients PriceBack près de chez vous. Votre photo est l’aubaine de quelqu’un." },
      { scene: "rows", kicker: "ÉTAPE 01 · PHOTOGRAPHIEZ", hook: ["PHOTOGRAPHIEZ", "UNE ÉTIQUETTE."], sub: ["Utilisez Scanner une étiquette à l’entrepôt.", "Cadrez le SKU et le prix."], rows: [["ÉTIQUETTE", "PHOTOGRAPHIÉE"], ["SKU + PRIX", "LUS"], ["VOTRE ENTREPÔT", "ENREGISTRÉ"]], frame: true,
        alt: "Étape 1: photographiez une étiquette avec Scanner une étiquette. Cadrez le SKU et le prix." },
      { scene: "rows", kicker: "ÉTAPE 02 · PARTAGEZ", hook: ["ELLE REJOINT LA", "BASE DE PRIX."], sub: ["Votre étiquette s’ajoute anonymement à la base", "communautaire de votre région."], rows: [["VOTRE IDENTITÉ", "ANONYME"], ["BASE DE PRIX", "VOTRE RÉGION"], ["CLIENTS À PROXIMITÉ", "AIDÉS"]], highlight: 0,
        alt: "Étape 2: elle rejoint la base de prix. Votre étiquette s’ajoute anonymement à la base communautaire de votre région, ce qui aide les clients à proximité." },
      { scene: "rows", kicker: "ÉTAPE 03 · VÉRIFICATION", hook: ["D’AUTRES LA", "CONFIRMENT."], sub: ["Quand assez de clients confirment le même rabais,", "il est considéré comme vérifié."], rows: [["ÉTIQUETTE VUE PAR", "ASSEZ DE CLIENTS"], ["STATUT", "VÉRIFIÉ"], ["ÉTIQUETTE DE RABAIS", "1 CRÉDIT"]], highlight: 2, fine: [CAP_FINE.fr, ...FINE.fr],
        alt: "Étape 3: d’autres la confirment. Quand assez de clients confirment le même rabais, il est considéré comme vérifié, et une étiquette de rabais rapporte un crédit, avec un plafond hebdomadaire." },
      { scene: "cta", kicker: "À VOUS DE JOUER", hook: ["PARTAGEZ-EN UNE", "AUJOURD’HUI."], checks: [DL.fr, ["Photographiez une étiquette", "aidez vos voisins"], FOLLOW.fr], fine: [CAP_FINE.fr, ...FINE.fr],
        alt: "À vous de jouer: téléchargez PriceBack (lien dans la bio), photographiez une étiquette pour aider vos voisins et suivez @priceback.ca, où les nouveaux magasins sont annoncés en premier. Seul un rabais peut rapporter un crédit, avec un plafond hebdomadaire." },
    ],
    caption: {
      en: { hook: "Your photo of a shelf tag could be someone else's best deal this week 🤝", lead: "How sharing with the community works 👇", bullets: ["📸 Snap a shelf tag with the price tag scanner", "🔒 It's added anonymously to the price pool for your area", "✅ When enough shoppers confirm the same savings, it's verified, and a savings tag earns 1 credit"], engage: "💬 What would you like to see priced in your warehouse? Tell us in the comments.", send: "Send this to a neighbour who shops at Costco.", tags: "#PriceBack #Costco #CostcoCanada #Community #SaveMoney" },
      fr: { hook: "Votre photo d’une étiquette pourrait être la meilleure aubaine d’un autre client cette semaine 🤝", lead: "Comment fonctionne le partage avec la communauté 👇", bullets: ["📸 Photographiez une étiquette avec Scanner une étiquette", "🔒 Elle s’ajoute anonymement à la base de prix de votre région", "✅ Quand assez de clients confirment le même rabais, il est vérifié, et une étiquette de rabais rapporte 1 crédit"], engage: "💬 Quel produit aimeriez-vous voir au prix dans votre entrepôt? Dites-le-nous en commentaire.", send: "Envoyez cette publication à un voisin qui magasine chez Costco.", tags: "#PriceBack #Costco #CostcoQuébec #Communauté #Économies" },
    },
    extraFine: { en: CAP_FINE.en, fr: CAP_FINE.fr },
  },

  // ───────────────────────────────────────────── 6 · the price codes ─────
  // HOLD: slide 7 names the Price tag translator (PR #389), which is on main but
  // NOT in the shipped v3.0.3 build. Publish after the release that carries it.
  {
    id: "price-codes",
    requires: "price-tag-translator (PR #389 — on main, NOT in store build v3.0.3)",
    en: [
      { scene: "cover", kicker: "COSTCO PRICE CODES", hook: ["READ THE", "PRICE ENDING."], sub: ["The last digits on a Costco tag often", "hint at what kind of deal it is."], paper: ["14.97 · 8.00 · 6.49", "WHAT DO THEY MEAN?"], swipe: "SWIPE TO DECODE →", fine: [CODE_FINE.en, ...FINE.en],
        alt: "Costco price codes. Read the price ending: the last digits on a Costco tag often hint at what kind of deal it is. What do 14.97, 8.00 and 6.49 mean? Swipe to decode." },
      { scene: "tag", kicker: "CODE 01 · .97", hook: ["PRICE ENDS", "IN .97"], sub: ["Usually a markdown set by head office.", "A sign the price has been cut."], tagLabel: "PRICE ON THE TAG", price: "14.97", ring: 3, means: "USUALLY MEANS", label: "CORPORATE MARKDOWN", fine: [CODE_FINE.en, ...FINE.en],
        alt: "Code 1: a price ending in .97 usually means a corporate markdown, a price cut set by head office." },
      { scene: "tag", kicker: "CODE 02 · .00", hook: ["PRICE ENDS", "IN .00"], sub: ["Often the store manager clearing stock:", "returns, floor models, last units."], tagLabel: "PRICE ON THE TAG", price: "8.00", ring: 3, means: "USUALLY MEANS", label: "MANAGER MARKDOWN", fine: [CODE_FINE.en, ...FINE.en],
        alt: "Code 2: a price ending in .00 usually means a manager markdown: returns, floor models or last units the store wants gone." },
      { scene: "tag", kicker: "CODE 03 · .88", hook: ["PRICE ENDS", "IN .88"], sub: ["Often a store-level clearance,", "a deeper cut than usual."], tagLabel: "PRICE ON THE TAG", price: "12.88", ring: 3, means: "USUALLY MEANS", label: "STORE CLEARANCE", fine: [CODE_FINE.en, ...FINE.en],
        alt: "Code 3: a price ending in .88 usually means a store clearance, a deeper cut than usual." },
      { scene: "tag", kicker: "CODE 04 · .X9", hook: ["PRICE ENDS", "IN .X9"], sub: ["From the brand, not Costco: .49, .79, .19…", "Compare it with the regular price."], tagLabel: "PRICE ON THE TAG", price: "6.49", ring: 3, means: "USUALLY MEANS", label: "BRAND PROMO", fine: [CODE_FINE.en, ...FINE.en],
        alt: "Code 4: a price ending in .X9, like .49, .79 or .19, usually means a brand promotion rather than a Costco discount. Compare it with the regular price." },
      { scene: "tag", kicker: "CODE 05 · THE STAR", hook: ["A STAR (*)", "ON THE TAG."], sub: ["Usually means the item won’t be restocked.", "Shoppers call it the Death Star."], tagLabel: "PRICE ON THE TAG", price: "24.97", ring: 0, star: true, means: "USUALLY MEANS", label: "NOT RESTOCKED", fine: [CODE_FINE.en, ...FINE.en],
        alt: "Code 5: a star on the tag usually means the item won't be restocked once it's gone. Shoppers call it the Death Star. It is not a discount by itself." },
      { scene: "cta", kicker: "TRY IT YOURSELF", hook: ["DECODE ANY", "PRICE TAG."], checks: [["Open the Price tag translator", "works without internet"], ["Type the price you see", "tick the star if there is one"], FOLLOW.en], fine: [CODE_FINE.en, ...FINE.en],
        alt: "Try it yourself: open the Price tag translator in PriceBack (it works without internet), type the price you see, tick the star if there is one, and follow @priceback.ca, where new stores are announced first." },
    ],
    fr: [
      { scene: "cover", kicker: "CODES DE PRIX COSTCO", hook: ["LISEZ LA FIN", "DU PRIX."], sub: ["Les derniers chiffres d’une étiquette Costco", "indiquent souvent le type d’aubaine."], paper: ["14,97 · 8,00 · 6,49", "QUE SIGNIFIENT-ILS?"], swipe: "GLISSEZ POUR DÉCODER →", fine: [CODE_FINE.fr, ...FINE.fr],
        alt: "Codes de prix Costco. Lisez la fin du prix: les derniers chiffres d’une étiquette Costco indiquent souvent le type d’aubaine. Que signifient 14,97, 8,00 et 6,49? Glissez pour décoder." },
      { scene: "tag", kicker: "CODE 01 · ,97", hook: ["PRIX FINISSANT", "PAR ,97"], sub: ["Souvent un rabais fixé par le siège social.", "Signe que le prix a été réduit."], tagLabel: "PRIX SUR L’ÉTIQUETTE", price: "14,97", ring: 3, means: "SIGNIFIE SOUVENT", label: "RABAIS CORPORATIF", fine: [CODE_FINE.fr, ...FINE.fr],
        alt: "Code 1: un prix qui se termine par ,97 signifie souvent un rabais corporatif, une réduction fixée par le siège social." },
      { scene: "tag", kicker: "CODE 02 · ,00", hook: ["PRIX FINISSANT", "PAR ,00"], sub: ["Souvent le gérant qui écoule son stock:","retours, modèles d’exposition, dernières unités."], tagLabel: "PRIX SUR L’ÉTIQUETTE", price: "8,00", ring: 3, means: "SIGNIFIE SOUVENT", label: "RABAIS GÉRANT", fine: [CODE_FINE.fr, ...FINE.fr],
        alt: "Code 2: un prix qui se termine par ,00 signifie souvent un rabais du gérant: retours, modèles d’exposition ou dernières unités que le magasin veut écouler." },
      { scene: "tag", kicker: "CODE 03 · ,88", hook: ["PRIX FINISSANT", "PAR ,88"], sub: ["Souvent une liquidation en magasin,", "un rabais plus profond que d’habitude."], tagLabel: "PRIX SUR L’ÉTIQUETTE", price: "12,88", ring: 3, means: "SIGNIFIE SOUVENT", label: "LIQUIDATION", fine: [CODE_FINE.fr, ...FINE.fr],
        alt: "Code 3: un prix qui se termine par ,88 signifie souvent une liquidation en magasin, un rabais plus profond que d’habitude." },
      { scene: "tag", kicker: "CODE 04 · ,X9", hook: ["PRIX FINISSANT", "PAR ,X9"], sub: ["Offre de la marque, pas de Costco: ,49 ,79 ,19…", "Comparez-la au prix régulier."], tagLabel: "PRIX SUR L’ÉTIQUETTE", price: "6,49", ring: 3, means: "SIGNIFIE SOUVENT", label: "PROMO FABRICANT", fine: [CODE_FINE.fr, ...FINE.fr],
        alt: "Code 4: un prix qui se termine par ,X9, comme ,49, ,79 ou ,19, signifie souvent une promotion de la marque plutôt qu’un rabais Costco. Comparez-la au prix régulier." },
      { scene: "tag", kicker: "CODE 05 · L’ÉTOILE", hook: ["UNE ÉTOILE (*)", "SUR L’ÉTIQUETTE."], sub: ["Souvent un article qui ne sera plus réapprovisionné.", "Les habitués parlent de l’étoile de la mort."], tagLabel: "PRIX SUR L’ÉTIQUETTE", price: "24,97", ring: 0, star: true, means: "SIGNIFIE SOUVENT", label: "FIN DE VIE", fine: [CODE_FINE.fr, ...FINE.fr],
        alt: "Code 5: une étoile sur l’étiquette signifie souvent que l’article ne sera plus réapprovisionné une fois épuisé. Les habitués parlent de l’étoile de la mort. Ce n’est pas un rabais en soi." },
      { scene: "cta", kicker: "ESSAYEZ-LE", hook: ["DÉCODEZ TOUTE", "ÉTIQUETTE."], checks: [["Ouvrez le Traducteur d’étiquettes", "fonctionne sans internet"], ["Entrez le prix affiché", "cochez l’étoile s’il y en a une"], FOLLOW.fr], fine: [CODE_FINE.fr, ...FINE.fr],
        alt: "Essayez-le: ouvrez le Traducteur d’étiquettes dans PriceBack (il fonctionne sans internet), entrez le prix affiché, cochez l’étoile s’il y en a une et suivez @priceback.ca, où les nouveaux magasins sont annoncés en premier." },
    ],
    caption: {
      en: { hook: "The last digits on a Costco price tag are a code 🔍", lead: "What shoppers say each ending usually means 👇", bullets: ["💰 .97 → corporate markdown", "🧑‍💼 .00 → manager markdown", "🏷️ .88 → store clearance", "📣 .X9 (.49, .79, .19…) → a brand's promo, not Costco's", "⭐ A star (*) → the item won't be restocked"], engage: "💬 Which code have you spotted most? Tell us in the comments.", send: "Send this to the friend who always finds the deals.", tags: "#PriceBack #Costco #CostcoCanada #CostcoFinds #SaveMoney" },
      fr: { hook: "Les derniers chiffres d’une étiquette Costco sont un code 🔍", lead: "Ce que chaque fin de prix signifie souvent, selon les clients 👇", bullets: ["💰 ,97 → rabais corporatif", "🧑‍💼 ,00 → rabais gérant", "🏷️ ,88 → liquidation en magasin", "📣 ,X9 (,49 ,79 ,19…) → une promo de la marque, pas de Costco", "⭐ Une étoile (*) → l’article ne sera plus réapprovisionné"], engage: "💬 Quel code avez-vous le plus souvent repéré? Dites-le-nous en commentaire.", send: "Envoyez cette publication à l’ami qui trouve toujours les aubaines.", tags: "#PriceBack #Costco #CostcoQuébec #Aubaines #Économies" },
    },
    extraFine: { en: CODE_FINE.en, fr: CODE_FINE.fr },
  },

  // ───────────────────────────────────────────── 7 · the best of your money
  {
    id: "best-of-money",
    en: [
      { scene: "cover", kicker: "MAKE IT COUNT", hook: ["GET THE MOST", "FROM YOUR BUDGET."], sub: ["Four easy habits for a smarter", "warehouse run."], paper: ["SMALL HABITS.", "FEWER MISSED DROPS."], swipe: "SWIPE FOR THE HABITS →",
        alt: "Get the most from your budget. Four easy habits for a smarter warehouse run: small habits, fewer missed price drops." },
      { scene: "rows", kicker: "HABIT 01 · SCAN", hook: ["SCAN EVERY", "RECEIPT."], sub: ["A receipt you scan is a receipt we can watch.", "A receipt in a drawer is not."], rows: [["IN A DRAWER", "NOT WATCHED"], ["SCANNED", "WATCHED"], ["COST", "1 CREDIT"]], highlight: 1,
        alt: "Habit 1: scan every receipt. A receipt you scan is a receipt PriceBack can watch; a receipt in a drawer is not. A scan costs one credit." },
      { scene: "rows", kicker: "HABIT 02 · ALERTS", hook: ["KEEP ALERTS", "ON."], sub: ["Price drops have a deadline.", "We remind you before it closes."], rows: [["PRICE DROP", "DETECTED"], ["REMINDER", "BEFORE IT CLOSES"], ["YOUR MOVE", "CLAIM"]], highlight: 2,
        alt: "Habit 2: keep alerts on. Price drops have a deadline, and PriceBack reminds you before it closes." },
      { scene: "rows", kicker: "HABIT 03 · DECODE", hook: ["READ THE", "PRICE ENDING."], sub: ["Check the last digits before you buy.", "A .97 or .00 can mean a markdown."], rows: [["ENDS IN .97", "MARKDOWN"], ["ENDS IN .00", "MANAGER"], ["HAS A STAR *", "NOT RESTOCKED"]], highlight: 0, fine: [CODE_FINE.en, ...FINE.en],
        alt: "Habit 3: read the price ending. Check the last digits before you buy: .97 or .00 can mean a markdown, and a star means the item won't be restocked." },
      { scene: "rows", kicker: "HABIT 04 · CHECK", hook: ["CHECK BEFORE", "YOU BUY."], sub: ["Scan a product barcode to see the last", "known price in your area."], rows: [["BARCODE", "SCANNED"], ["LAST KNOWN PRICE", "YOUR AREA"], ["PRICE ON THE TAG", "COMPARE"]], frame: true,
        alt: "Habit 4: check before you buy. Scan a product barcode to see the last known price in your area and compare it with the tag." },
      { scene: "cta", kicker: "SMALL HABITS", hook: ["START WITH", "ONE RECEIPT."], checks: [DL.en, ["Scan your next receipt", "we watch the prices"], FOLLOW.en],
        alt: "Small habits: download PriceBack (link in bio), start with one receipt, and follow @priceback.ca, where new stores are announced first." },
    ],
    fr: [
      { scene: "cover", kicker: "FAITES-LE COMPTER", hook: ["TIREZ LE MAXIMUM", "DE VOTRE BUDGET."], sub: ["Quatre habitudes simples pour une visite", "à l’entrepôt plus futée."], paper: ["PETITES HABITUDES.", "MOINS DE BAISSES RATÉES."], swipe: "GLISSEZ POUR LES HABITUDES →",
        alt: "Tirez le maximum de votre budget. Quatre habitudes simples pour une visite à l’entrepôt plus futée: petites habitudes, moins de baisses de prix ratées." },
      { scene: "rows", kicker: "HABITUDE 01 · SCANNEZ", hook: ["SCANNEZ CHAQUE", "REÇU."], sub: ["Un reçu scanné est un reçu qu’on peut surveiller.", "Un reçu au fond d’un tiroir, non."], rows: [["AU FOND D’UN TIROIR", "NON SURVEILLÉ"], ["SCANNÉ", "SURVEILLÉ"], ["COÛT", "1 CRÉDIT"]], highlight: 1,
        alt: "Habitude 1: scannez chaque reçu. Un reçu scanné est un reçu que PriceBack peut surveiller; un reçu au fond d’un tiroir, non. Un scan coûte un crédit." },
      { scene: "rows", kicker: "HABITUDE 02 · ALERTES", hook: ["GARDEZ LES", "ALERTES."], sub: ["Une baisse de prix a une date limite.", "On vous rappelle avant sa fin."], rows: [["BAISSE DE PRIX", "DÉTECTÉE"], ["RAPPEL", "AVANT LA FIN"], ["À VOUS DE JOUER", "RÉCLAMER"]], highlight: 2,
        alt: "Habitude 2: gardez les alertes. Une baisse de prix a une date limite, et PriceBack vous rappelle avant sa fin." },
      { scene: "rows", kicker: "HABITUDE 03 · DÉCODEZ", hook: ["LISEZ LA FIN", "DU PRIX."], sub: ["Vérifiez les derniers chiffres avant d’acheter.", "Un ,97 ou ,00 peut signaler un rabais."], rows: [["FINIT PAR ,97", "RABAIS"], ["FINIT PAR ,00", "GÉRANT"], ["A UNE ÉTOILE *", "FIN DE VIE"]], highlight: 0, fine: [CODE_FINE.fr, ...FINE.fr],
        alt: "Habitude 3: lisez la fin du prix. Vérifiez les derniers chiffres avant d’acheter: un ,97 ou un ,00 peut signaler un rabais, et une étoile signale un article qui ne sera plus réapprovisionné." },
      { scene: "rows", kicker: "HABITUDE 04 · VÉRIFIEZ", hook: ["VÉRIFIEZ AVANT", "D’ACHETER."], sub: ["Scannez le code-barres d’un produit pour voir", "le dernier prix connu dans votre région."], rows: [["CODE-BARRES", "SCANNÉ"], ["DERNIER PRIX CONNU", "VOTRE RÉGION"], ["PRIX SUR L’ÉTIQUETTE", "COMPAREZ"]], frame: true,
        alt: "Habitude 4: vérifiez avant d’acheter. Scannez le code-barres d’un produit pour voir le dernier prix connu dans votre région et comparez-le à l’étiquette." },
      { scene: "cta", kicker: "PETITES HABITUDES", hook: ["COMMENCEZ AVEC", "UN REÇU."], checks: [DL.fr, ["Scannez votre prochain reçu", "on surveille les prix"], FOLLOW.fr],
        alt: "Petites habitudes: téléchargez PriceBack (lien dans la bio), commencez avec un reçu et suivez @priceback.ca, où les nouveaux magasins sont annoncés en premier." },
    ],
    caption: {
      en: { hook: "Four small habits that put your money to work at Costco 💪", lead: "Swipe for the habits 👇", bullets: ["🧾 Scan every receipt, so it can be watched", "🔔 Keep alerts on: price drops have a deadline", "🔍 Read the price ending before you buy", "📲 Check the last known price with a barcode scan"], engage: "💬 Which habit are you adding first? Tell us in the comments.", send: "Send this to the friend who loves a good deal.", tags: "#PriceBack #Costco #CostcoCanada #SaveMoney #MoneySavingTips" },
      fr: { hook: "Quatre petites habitudes pour faire travailler votre argent chez Costco 💪", lead: "Glissez pour voir les habitudes 👇", bullets: ["🧾 Scannez chaque reçu, pour qu’il soit surveillé", "🔔 Gardez les alertes: une baisse de prix a une date limite", "🔍 Lisez la fin du prix avant d’acheter", "📲 Vérifiez le dernier prix connu avec un scan de code-barres"], engage: "💬 Quelle habitude allez-vous adopter en premier? Dites-le-nous en commentaire.", send: "Envoyez cette publication à l’ami qui adore une bonne aubaine.", tags: "#PriceBack #Costco #CostcoQuébec #Économies #Astuces" },
    },
    extraFine: { en: CODE_FINE.en, fr: CODE_FINE.fr },
  },
];

const DISCLAIMER = {
  en: "Free to download. Each receipt scan uses 1 credit. Price-adjustment terms are set by each retailer. PriceBack is an independent app, not affiliated with Costco or any retailer.",
  fr: "Téléchargement gratuit. Chaque reçu scanné utilise 1 crédit. Les conditions d'ajustement de prix sont fixées par chaque détaillant. PriceBack est une application indépendante, non affiliée à Costco ni à aucun détaillant.",
};
const STORE_LINKS = {
  en: ["📲 Download free:", "iPhone: https://apps.apple.com/ca/app/priceback/id6795860374", "Android: https://play.google.com/store/apps/details?id=com.priceback"],
  fr: ["📲 Téléchargement gratuit :", "iPhone : https://apps.apple.com/ca/app/priceback/id6795860374", "Android : https://play.google.com/store/apps/details?id=com.priceback"],
};
const IG_BIO = { en: "📲 Download link in bio.", fr: "📲 Lien de téléchargement dans la bio." };

/** The two captions (Instagram, Facebook) for one post in one language. */
function captions(post, lang) {
  const c = post.caption[lang];
  const extra = post.extraFine[lang] ? `${post.extraFine[lang]} `: "";
  const body = (links) =>
    [c.hook, "", c.lead, ...c.bullets, "", ...links, "", c.engage, `📤 ${c.send}`, "", `${extra}${DISCLAIMER[lang]}`].join("\n");
  return {
    instagram: `${body([IG_BIO[lang]])}\n\n${c.tags}`,
    facebook: `${body(STORE_LINKS[lang])}\n\n${c.tags.split(" ").slice(0, 2).join(" ")}`,
  };
}

module.exports = { POSTS, captions, FINE, CODE_FINE, CAP_FINE, CLAIM_FINE, DISCLAIMER };
