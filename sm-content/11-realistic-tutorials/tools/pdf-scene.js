// pdf-scene.js — the "get your Costco receipt as a PDF" tutorial, one scene per OS.
// A scene page sets window.PDF_OS = "android" | "ios", loads scene-kit.js, costco-screens.js and this file.
//
// Structure (Maxim, 2026-10-28): an intro card (presenter voice, no phone) that also tells the other OS what to use
// and points to its version, up front, because viewers on the other OS leave in the first seconds → chime →
// 5 steps on one full-size phone → the end band.
//   1 Open your receipts       Account → Orders & Purchases
//   2 Online or warehouse?     both tabs highlighted: costco.ca orders / in-store purchases — PriceBack reads both
//   3 Save it as a PDF         Android: View Receipt → Print Receipt → Save as PDF → Save
//                              iPhone:  View Receipt → Print Receipt → Share → Save to Files → Save
//   4 Upload it to PriceBack   Upload file → Downloads (Android) / Recents (iPhone) → tap the PDF
//   5 Start tracking           the review screen (store, items, totals, dates) → Start Tracking
// No "Saved to Downloads" toast step: it was the same screen again and read as a glitch (Maxim).
// Android uses costco.ca in the browser (the Android Costco app blocks PDF export); iPhone uses the Costco app.
(function () {
  const OS = window.PDF_OS, IOS = OS === "ios";
  window.IOS = IOS;
  const { $, lin, eo, win } = KIT;

  // ── screens ──────────────────────────────────────────────────────────────
  const webMenu = webTop() + webSite(335) + `<div class="a" style="left:0;top:265px;width:891px;height:1735px;background:rgba(0,0,0,.5)"></div>` +
    `<div class="a" style="left:198px;top:265px;width:693px;height:1735px;background:#fff"></div>` + T(233, 318, "Hello, Sam!", "font-weight:900;font-size:40px") + A(808, 310, icon("x", 52, "#333")) +
    ph(233, 384, 108, 68, "#2b2b2b", 6) + T(368, 382, "Executive Member", "font-weight:900;font-size:32px") + T(368, 428, "Member Since 2023", "font-size:32px") +
    [["person", "Account Home"], ["box", "Orders &amp; Purchases"], ["list", "Account Details"], ["renew", "Renew Membership"], ["pin", "Address Book"], ["wallet", "Costco Wallet"], ["list", "Lists"], ["gear", "Preferences"], ["out", "Sign Out"]]
      .map(([k, l], i) => `<div class="a" style="left:198px;top:${508 + i * 101}px;width:693px;height:101px;border-top:2px solid #e5e5e5"></div>` + A(234, 532 + i * 101, `<div style="display:flex;gap:26px;align-items:center;font-size:32px">${icon(k, 44, RED)}${l}</div>`)).join("");
  // The app's Account tab: same entries as the site's account menu, as a full screen.
  const appAccount = appTop("Account") + appLoc(282) + T(40, 410, "Hello, Sam!", "font-weight:900;font-size:44px") +
    ph(40, 480, 108, 68, "#2b2b2b", 6) + T(175, 478, "Executive Member", "font-weight:900;font-size:32px") + T(175, 522, "Member Since 2023", "font-size:32px") +
    [["box", "Orders &amp; Purchases"], ["list", "Account Details"], ["renew", "Renew Membership"], ["pin", "Address Book"], ["wallet", "Costco Wallet"], ["list", "Lists"], ["gear", "Preferences"]]
      .map(([k, l], i) => `<div class="a" style="left:0;top:${610 + i * 112}px;width:891px;height:112px;background:#fff;border-top:2px solid #e5e5e5"></div>` + A(40, 640 + i * 112, `<div style="display:flex;gap:26px;align-items:center;font-size:34px">${icon(k, 46, RED)}${l}</div>`)).join("") +
    appNav("Account");
  const appHome = appTop() + appLoc(395) + A(35, 576, `<div style="display:flex;gap:18px">${["IN THE WAREHOUSE", "GIFT CARDS", "SAME-DAY"].map((l) => `<div style="width:302px;height:104px;border-radius:22px;background:#ececec;display:flex;align-items:center;padding:0 24px;font-weight:900;font-size:26px;color:#333">${l}</div>`).join("")}</div>`) +
    ph(35, 786, 821, 330, "#dfe5e3") + ph(35, 1240, 821, 350, "#e6e6e6") + appNav("Explore");

  const OY = IOS ? 430 : 820; // where "Account Home / Orders and Purchases" starts on each surface
  const shell = (body) => (IOS ? appTop("Orders &amp; Purchases") + appLoc(282) + body + appNav("Account") : webTop() + webSite(265) + body);
  const SC = IOS ? {
    home: appHome, account: appAccount,
    orders: shell(ordersBody(OY, "Online")), warehouse: shell(ordersBody(OY, "warehouse")), receipt: shell(ordersBody(OY, "warehouse")) + receiptModal(),
    print: iosPrint(), share: iosShare(), save: iosSave(),
    pb: pbScan(false), pick: iosPicker(), busy: pbScan(true), review: pbReview(),
  } : {
    home: webTop() + webSite(335) + ph(53, 860, 380, 130, "#ececec") + ph(473, 860, 380, 130, "#ececec") + ph(35, 1178, 821, 350, "#f3dcdf") + ph(35, 1668, 821, 260, "#dfe5e3"),
    account: webMenu,
    orders: shell(ordersBody(OY, "Online")), warehouse: shell(ordersBody(OY, "warehouse")), receipt: shell(ordersBody(OY, "warehouse")) + receiptModal(),
    print: printScreen(), save: downloadsScreen("save"),
    pb: pbScan(false), pick: downloadsScreen("pick"), busy: pbScan(true), review: pbReview(),
  };

  // ── timeline ─────────────────────────────────────────────────────────────
  // Every time below is relative to its step, so a step can grow or shrink without touching the others.
  const L3 = IOS ? 5.5 : 5.3;
  const P = { intro: [0, 7.2], h1: [7.2, 10.1], h2: [10.1, 13.6] };
  P.h3 = [13.6, 13.6 + L3]; P.h4 = [P.h3[1], P.h3[1] + 4.6]; P.h5 = [P.h4[1], P.h4[1] + 3.5]; P.outro = P.h5[1];
  window.PDF_P = P;
  const [h1, h2, h3, h4, h5] = [P.h1[0], P.h2[0], P.h3[0], P.h4[0], P.h5[0]];
  const VIEW = [445, OY + 620 + 335], WTAB = [351, OY + 208];
  const SEQ = [["home", 0], ["account", h1 + 1.2], ["orders", h1 + 2.6], ["warehouse", h2 + 2.85], ["receipt", h3 + 0.75], ["print", h3 + 2.05],
    ...(IOS ? [["share", h3 + 3.25], ["save", h3 + 4.45]] : [["save", h3 + 3.55]]),
    ["pb", h4 + 0.15], ["pick", h4 + 1.7], ["busy", h4 + 3.15], ["review", h5]];
  const TAPS = [[h1 + 0.8, ...(IOS ? [445, 1862] : [660, 400])], [h1 + 2.2, ...(IOS ? [445, 666] : [430, 660])], [h2 + 2.4, ...WTAB],
    [h3 + 0.3, ...VIEW], [h3 + 1.6, 690, 412],
    ...(IOS ? [[h3 + 2.8, 676, 176], [h3 + 4.0, 445, 1185], [h3 + 5.0, 800, 206]] : [[h3 + 3.1, 720, 1851], [h3 + 4.7, 765, 1870]]),
    [h4 + 1.25, 662, 1292], [h4 + 2.7, ...(IOS ? [180, 535] : [243, 870])], [h5 + 2.55, 445, 1752]];
  const STEPS = [["s1", h1 + 0.45, h1 + 1.95], ["s2", h1 + 1.95, P.h1[1]],
    ...(IOS ? [["s3", h3 + 0.05, h3 + 1.35], ["s4", h3 + 1.35, h3 + 2.55], ["s5", h3 + 2.55, h3 + 3.75], ["s6", h3 + 3.75, P.h3[1]]]
            : [["s3", h3 + 0.05, h3 + 1.35], ["s4", h3 + 1.35, h3 + 2.85], ["s5", h3 + 2.85, h3 + 4.45], ["s6", h3 + 4.45, P.h3[1]]]),
    ["s7", h4 + 0.9, h4 + 2.2], ["s8", h4 + 2.2, h4 + 3.2], ["s9", h4 + 3.2, P.h4[1]], ["s10", h5 + 0.2, h5 + 2.1], ["s11", h5 + 2.1, P.outro]];
  const S = 0.5, X = (1080 - (891 * S + 24)) / 2, Y = 486;
  const scr = (x, y) => [X + 12 + x * S, Y + 12 + y * S];

  window.frame = (t) => {
    KIT.camera(t);
    const ob = eo(lin(t, P.outro, P.outro + 0.5)), ib = 1 - eo(lin(t, P.intro[1] - 0.2, P.intro[1] + 0.3));
    $("cam").style.filter = `blur(${Math.max(12 * ob, 10 * ib)}px) brightness(${1 - 0.2 * Math.max(ob, ib)})`;
    // intro card: its own moment, then out of the way; the other-OS card lands under it as the presenter says it
    const ic = eo(lin(t, 0.1, 0.5)) * (1 - eo(lin(t, P.intro[1] - 0.25, P.intro[1] + 0.1)));
    Object.assign($("intro").style, { opacity: ic, transform: `translateY(${(1 - ic) * -30}px) scale(${0.97 + 0.03 * ic})` });
    const oc = eo(lin(t, 2.95, 3.35)) * (1 - eo(lin(t, P.intro[1] - 0.25, P.intro[1] + 0.1)));
    const pop = 1 + 0.05 * Math.sin(Math.PI * lin(t, 3.2, 3.6));
    Object.assign($("other").style, { opacity: oc, transform: `translateY(${(1 - oc) * 40}px) scale(${pop})` });
    // phone
    const inP = eo(lin(t, P.intro[1], P.intro[1] + 0.45)) * (1 - lin(t, P.outro - 0.1, P.outro + 0.3));
    const phn = $("ph"); Object.assign(phn.style, { left: X + "px", top: Y + (1 - inP) * 60 + "px", opacity: inP });
    Object.assign(phn.querySelector(".view").style, { width: 891 * S + "px", height: 2000 * S + "px" });
    phn.querySelector(".scr").style.transform = `scale(${S})`;
    SEQ.forEach(([k, a], i) => {
      const b = i + 1 < SEQ.length ? SEQ[i + 1][1] : 1e9, e = $("sc_" + k);
      e.style.opacity = i === 0 ? 1 - lin(t, b, b + 0.25) : Math.min(lin(t, a, a + 0.25), 1 - lin(t, b, b + 0.25));
      e.style.transform = `translateX(${(1 - lin(t, a, a + 0.25)) * (i ? 40 : 0)}px)`;
    });
    const tp = $("tap"); tp.style.opacity = 0;
    for (const [a, x, y] of TAPS) if (t >= a - 0.05 && t <= a + 0.5) {
      const k = lin(t, a - 0.05, a + 0.45);
      Object.assign(tp.style, { left: x * S + "px", top: y * S + "px", opacity: Math.sin(k * Math.PI), transform: `scale(${0.6 + 0.6 * k})` });
    }
    const sp = document.querySelector("#sc_busy #spin"); if (sp) sp.style.transform = `rotate(${t * 400}deg)`;
    for (const [id, a, b] of STEPS) $(id).classList.toggle("on", t >= a && t < b);

    // step 2: both receipt types highlighted on the phone, explained beside it
    const ch = eo(lin(t, P.h2[0] + 0.2, P.h2[0] + 0.5)) * (1 - lin(t, h2 + 2.1, h2 + 2.35));
    const [ox, oy] = scr(35, OY + 160), [wx] = scr(229, OY + 160);
    Object.assign($("bOn").style, { left: ox - 4 + "px", top: oy - 4 + "px", width: 194 * S + 8 + "px", height: 96 * S + 8 + "px", opacity: ch });
    Object.assign($("bWh").style, { left: wx - 4 + "px", top: oy - 4 + "px", width: 244 * S + 8 + "px", height: 96 * S + 8 + "px", opacity: ch });
    [["kOn", 0.35], ["kWh", 0.75], ["kBoth", 1.25]].forEach(([id, d]) => {
      const v = eo(lin(t, P.h2[0] + d, P.h2[0] + d + 0.3)) * (1 - lin(t, P.h2[1] - 0.3, P.h2[1]));
      Object.assign($(id).style, { opacity: v, transform: `translateY(${(1 - v) * 16}px)` });
    });

    KIT.heads(t, [["h1", ...P.h1], ["h2", ...P.h2], ["h3", ...P.h3], ["h4", ...P.h4], ["h5", ...P.h5]]);
    KIT.outro(t, P.outro);
    KIT.grain(Math.round(t * 30));
  };

  window.ready = (async () => {
    await KIT.fontsReady(["500 40px R", "700 40px R", "900 40px R"]);
    KIT.drawSurface($("surface"));
    $("s").innerHTML = Object.entries(SC).map(([k, h]) => `<div class="sc" id="sc_${k}">${h}</div>`).join("");
    await Promise.all([...document.images].map((i) => (i.complete ? 1 : new Promise((r) => (i.onload = i.onerror = r)))));
    window.frame(0);
  })();
})();
