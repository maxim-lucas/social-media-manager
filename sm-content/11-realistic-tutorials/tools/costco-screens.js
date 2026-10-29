// costco-screens.js — the Costco (website / app) and PriceBack screens used by the receipt-PDF tutorials,
// drawn at the size of Maxim's phone screenshots (891 × 2000) so layouts can be checked against them.
// Simplified, no Costco logo. Privacy: fake account (Sam, Example City, A1A 1A1), fake receipt (warehouse #000,
// member / card / barcode zeros, EXAMPLE mark), real products (Van Houtte 266556, Gia basmati 1405731).
// Loaded with a plain <script> after scene-kit.js; everything here is a global the scene can use.
const BLUE = "#0a5fae", LINK = "#1f6fbf", RED = "#d4213d";

// ── tiny line icons (stroke = currentColor) ──────────────────────────────────
const ic = (d, s = 56, sw = 4) => `<svg width="${s}" height="${s}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="${sw * 24 / s * 0.6}" stroke-linecap="round" stroke-linejoin="round">${d}</svg>`;
const I = {
  search: '<circle cx="11" cy="11" r="7"/><path d="M20 20l-4-4"/>', mic: '<rect x="9" y="3" width="6" height="11" rx="3"/><path d="M5 11a7 7 0 0014 0M12 18v3"/>',
  mail: '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 7l9 6 9-6"/>', store: '<path d="M3 9l2-5h14l2 5M4 9v11h16V9M4 9h16M9 20v-6h6v6"/>',
  chev: '<path d="M6 9l6 6 6-6"/>', back: '<path d="M15 5l-7 7 7 7"/>', person: '<circle cx="12" cy="8" r="4"/><path d="M4 21c1-4 4-6 8-6s7 2 8 6"/>',
  cart: '<path d="M3 4h2l2 11h11l2-8H6"/><circle cx="9" cy="19" r="1.5"/><circle cx="17" cy="19" r="1.5"/>', pin: '<path d="M12 21s-7-6-7-12a7 7 0 0114 0c0 6-7 12-7 12z"/><circle cx="12" cy="9" r="2.5"/>',
  grid: '<circle cx="7" cy="7" r="3"/><circle cx="17" cy="7" r="3"/><circle cx="7" cy="17" r="3"/><circle cx="17" cy="17" r="3"/>', compass: '<circle cx="12" cy="12" r="9"/><path d="M15 9l-2 5-4 1 2-5z"/>',
  receipt: '<path d="M6 3h12v18l-3-2-3 2-3-2-3 2z"/><path d="M9 8h6M9 12h6M9 16h4"/>', print: '<path d="M7 9V3h10v6"/><rect x="4" y="9" width="16" height="8" rx="2"/><path d="M7 14h10v7H7z"/>',
  filter: '<path d="M4 7h16M4 12h16M4 17h16"/><circle cx="9" cy="7" r="1.6"/><circle cx="15" cy="12" r="1.6"/><circle cx="9" cy="17" r="1.6"/>', x: '<path d="M6 6l12 12M18 6L6 18"/>',
  home: '<path d="M4 11l8-7 8 7v9h-5v-6H9v6H4z"/>', plus: '<path d="M12 5v14M5 12h14"/>', dots: '<circle cx="12" cy="5" r="1.2"/><circle cx="12" cy="12" r="1.2"/><circle cx="12" cy="19" r="1.2"/>',
  menu: '<path d="M4 7h16M4 12h16M4 17h16"/>', folder: '<path d="M3 7h6l2 2h10v10H3z"/>', box: '<path d="M4 8l8-4 8 4v8l-8 4-8-4z"/><path d="M4 8l8 4 8-4M12 12v8"/>',
  list: '<path d="M8 6h12M8 12h12M8 18h12"/><circle cx="4" cy="6" r="1"/><circle cx="4" cy="12" r="1"/><circle cx="4" cy="18" r="1"/>', wallet: '<rect x="3" y="6" width="18" height="13" rx="2"/><path d="M3 10h18"/>',
  gear: '<circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3M5 5l2 2M17 17l2 2M5 19l2-2M17 7l2-2"/>', out: '<path d="M10 4H5v16h5M15 8l4 4-4 4M19 12H9"/>', renew: '<path d="M4 12a8 8 0 0114-5l2 2M20 12a8 8 0 01-14 5l-2-2M20 5v4h-4M4 19v-4h4"/>',
};
const icon = (k, s = 56, col = "currentColor", sw = 4) => `<span style="color:${col};display:inline-flex">${ic(I[k], s, sw)}</span>`;
const A = (x, y, html, st = "") => `<div class="a" style="left:${x}px;top:${y}px;${st}">${html}</div>`;
const T = (x, y, txt, st = "") => A(x, y, txt, `white-space:nowrap;${st}`);

// ── status bars ────────────────────────────────────────────────────────────
// Status bar: Android style by default; set window.IOS = true before building for the iPhone look.
const status = (dark) => (window.IOS ? iosStatus(dark) : androidStatus(dark));
const iosStatus = (dark) => {
  const c = dark ? "#fff" : "#111";
  return T(84, 44, "4:05", `font-weight:700;font-size:40px;color:${c}`) +
    A(330, 30, `<div style="width:232px;height:68px;border-radius:34px;background:#000"></div>`) +
    A(668, 52, `<div style="display:flex;gap:6px;align-items:flex-end">${[10, 15, 20, 26].map((h) => `<i style="display:inline-block;width:8px;height:${h}px;background:${c};border-radius:2px"></i>`).join("")}
      <i style="display:inline-block;width:58px;height:28px;border:3px solid ${c};border-radius:9px;position:relative;margin-left:22px;opacity:.9"><i style="position:absolute;left:3px;top:3px;bottom:3px;width:38px;background:${c};border-radius:4px"></i></i></div>`);
};
const androidStatus = (dark) => {
  const c = dark ? "#fff" : "#111";
  return T(76, 48, "4:05", `font-weight:700;font-size:40px;color:${c}`) +
    A(660, 56, `<div style="display:flex;gap:16px;align-items:center">${[10, 16, 22, 28].map((h) => `<i style="display:inline-block;width:7px;height:${h}px;background:${c};border-radius:2px;align-self:flex-end"></i>`).join("")}
      <i style="display:inline-block;width:56px;height:30px;border:3px solid ${c};border-radius:8px;position:relative;margin-left:14px"><i style="position:absolute;left:3px;top:3px;bottom:3px;width:34px;background:${c};border-radius:3px"></i></i></div>`);
};
const appTop = (title) => `<div class="a" style="left:0;top:0;width:891px;height:280px;background:${BLUE}"></div>` + status(true) +
  (title ? A(40, 180, icon("back", 56, "#fff")) + T(0, 182, title, `width:891px;text-align:center;color:#fff;font-weight:900;font-size:42px`) + A(800, 180, icon("search", 52, "#fff"))
         : A(35, 160, `<div style="width:743px;height:96px;border-radius:28px;background:#fff;display:flex;align-items:center;gap:18px;padding:0 26px;color:#666;font-size:36px">${icon("search", 44, "#444")}Explore Costco</div>`) + A(808, 182, icon("mail", 52, "#fff")) +
           T(35, 320, "Savings &nbsp;&nbsp; Email Sign Up &nbsp;&nbsp; Gift Cards &nbsp;&nbsp; Same-Day", "color:#fff;font-size:34px;font-weight:500"));
const appLoc = (y) => `<div class="a" style="left:0;top:${y}px;width:891px;height:86px;background:#eef4fa"></div>` +
  A(34, y + 18, `<div style="display:flex;gap:16px;align-items:center;font-size:34px;color:${BLUE}">${icon("store", 44, BLUE)}at <b>Example City</b> | Delivering to <b>A1A 1A1</b></div>`);
const appNav = (active) => `<div class="a" style="left:0;top:1800px;width:891px;height:200px;background:#fff;border-top:2px solid #e5e5e5"></div>` +
  [["compass", "Explore"], ["grid", "Shop"], ["person", "Account"], ["store", "Warehouse"], ["cart", "Cart"]].map(([k, l], i) =>
    A(18 + i * 178, 1822, `<div style="width:142px;text-align:center;color:${l === active ? RED : "#666"};font-size:26px;letter-spacing:.5px">${icon(k, 52, l === active ? RED : "#777")}<div style="margin-top:6px">${l}</div></div>`)).join("");
const ph = (x, y, w, h, c = "#e9e9e9", r = 22) => `<div class="a" style="left:${x}px;top:${y}px;width:${w}px;height:${h}px;background:${c};border-radius:${r}px"></div>`;

const webTop = () => `<div class="a" style="left:0;top:0;width:891px;height:265px;background:#f1f1f1"></div>` + status(false) +
  A(30, 172, icon("home", 52, "#333")) + A(104, 160, `<div style="width:466px;height:86px;border-radius:43px;background:#e3e3e3;display:flex;align-items:center;padding:0 22px;gap:14px;font-size:36px;color:#333">${icon("filter", 36, "#333")}costco.ca</div>`) +
  A(604, 176, icon("plus", 48, "#333")) + A(712, 176, `<div style="width:46px;height:46px;border:4px solid #333;border-radius:10px;font-size:20px;font-weight:700;display:flex;align-items:center;justify-content:center">3</div>`) + A(812, 176, icon("dots", 48, "#333"));
const webSite = (y) => `<div class="a" style="left:0;top:${y}px;width:891px;height:340px;background:#f3f3f3;border-bottom:2px solid #e2e2e2"></div>` +
  [["pin", "Warehouses", 420], ["person", "Account", 640], ["cart", "Cart", 790]].map(([k, l, x]) => A(x - 70, y + 30, `<div style="width:150px;text-align:center;color:${BLUE};font-size:26px">${icon(k, 54, BLUE)}<div style="margin-top:2px${l === "Account" ? ";text-decoration:underline" : ""}">${l}</div></div>`)).join("") +
  A(34, y + 140, `<div style="width:198px;height:86px;background:${BLUE};color:#fff;display:flex;align-items:center;gap:14px;padding-left:24px;font-size:40px">${icon("menu", 42, "#fff")}Shop</div>`) +
  A(250, y + 140, `<div style="width:606px;height:86px;border:3px solid ${BLUE};background:#fff;display:flex;align-items:center;justify-content:space-between;padding:0 18px;color:#777;font-size:36px">Search Costco${icon("search", 48, BLUE)}</div>`) +
  T(34, y + 262, "My Warehouse <b style='color:#222'>Example City</b> &nbsp;&nbsp; Delivery Location <b style='color:#222'>A1A 1A1</b>", "font-size:28px;color:#555");

// ── the shared "Orders and Purchases" content (app and site lay it out the same) ──
const ordersBody = (y, tab) => {
  const tabs = [["Online", 35, 194], ["warehouse", 229, 244], ["Installation Services", 480, 380]].map(([l, x, w]) =>
    A(x, y + 160, `<div style="width:${w}px;height:96px;display:flex;align-items:center;justify-content:center;font-size:36px;${l === tab ? `font-weight:900;background:#eef4fa;border:2px solid ${LINK};border-bottom:8px solid #2c6aa8` : "color:#333"}">${l}</div>`)).join("");
  let h = A(40, y, `<div style="display:flex;gap:18px;align-items:center;font-size:32px;color:#333">${icon("back", 34, LINK)}Account Home</div>`) +
    T(35, y + 62, "Orders and Purchases", "font-size:56px;color:#222") + tabs + `<div class="a" style="left:35px;top:${y + 262}px;width:821px;height:2px;background:#ddd"></div>`;
  if (tab === "Online") {
    h += T(35, y + 330, "Your new orders will appear shortly after confirmation.", "font-size:30px;color:#333") +
      A(37, y + 410, `<div style="width:821px;height:86px;border:2px solid #333;border-radius:8px;display:flex;align-items:center;justify-content:space-between;padding:0 30px;font-size:34px">Last 3 Months${icon("chev", 46, LINK)}</div>`) +
      A(35, y + 560, `<div style="width:821px;height:560px;border:2px solid #bbb;background:#fff"></div>`) + T(72, y + 610, "Online", "font-weight:900;font-size:40px") +
      ph(72, y + 690, 260, 30, "#e2e8f0", 8) + ph(72, y + 750, 200, 30, "#eee", 8) + ph(72, y + 810, 300, 30, "#eee", 8) +
      A(72, y + 900, `<div style="width:747px;height:84px;border:3px solid ${LINK};border-radius:6px;color:${LINK};font-size:34px;display:flex;align-items:center;justify-content:center">View Order Details</div>`);
  } else {
    h += T(616, y + 330, "Showing 1 - 2 of 2", "font-size:30px;color:#333") + T(35, y + 400, "Your receipts will appear within 24 hours of the transaction.", "font-size:28px;color:#333") +
      A(37, y + 470, `<div style="width:457px;height:86px;border:2px solid #333;border-radius:8px;display:flex;align-items:center;justify-content:space-between;padding:0 26px;font-size:32px">Last 3 Months${icon("chev", 44, LINK)}</div>`) +
      A(511, y + 470, `<div style="width:195px;height:86px;border:2px solid #333;border-radius:4px;display:flex;align-items:center;justify-content:center;gap:12px;font-size:30px">${icon("filter", 40, "#555")}Filter</div>`);
    [[y + 620, "10/20/2026 - 02:32pm", "$92.98"], [y + 1090, "10/12/2026 - 11:05am", "$64.21"]].forEach(([cy, d, tot]) => {
      h += A(35, cy, `<div style="width:821px;height:415px;border:2px solid #bbb;background:#fff"></div>`) +
        A(72, cy + 44, `<div style="display:flex;gap:16px;align-items:center;font-weight:900;font-size:36px">${icon("receipt", 44, "#666")}In-Warehouse</div>`) +
        T(72, cy + 104, d, "font-size:36px") + T(72, cy + 166, "EXAMPLE CITY", "font-weight:900;font-size:34px") + T(72, cy + 224, "<b>Total</b> " + tot, "font-size:36px") +
        A(72, cy + 292, `<div style="width:747px;height:86px;border-radius:6px;background:#2f6ea9;color:#fff;font-size:36px;display:flex;align-items:center;justify-content:center;box-shadow:0 3px 6px rgba(0,0,0,.25)">View Receipt</div>`);
    });
  }
  return h;
};

// ── the fake receipt in Costco's web layout (real products, fake everything else) ──
const RC = { wh: "EXAMPLE CITY #000", addr: ["000 EXAMPLE ROAD", "EXAMPLE CITY, ON A1A 1A1"],
  items: [["266556", "VH HOUSE BLEND", "52.99"], ["1405731", "GIA BASMATI", "39.99"]], sub: "92.98", tax: "0.00", total: "92.98" };
const bars = (w, h, seed) => { const r = KIT.rng(seed); let x = 0, s = ""; while (x < w) { const bw = 2 + Math.floor(r() * 7), gap = 2 + Math.floor(r() * 6); if (x + bw > w) break; s += `<i style="position:absolute;left:${x}px;top:0;width:${bw}px;height:${h}px;background:#111"></i>`; x += bw + gap; } return `<div style="position:relative;width:${w}px;height:${h}px">${s}</div>`; };
const receiptModal = () => {
  let h = `<div class="a" style="left:0;top:265px;width:891px;height:1735px;background:rgba(0,0,0,.45)"></div>` +
    `<div class="a" style="left:70px;top:285px;width:751px;height:1715px;background:#fff;border-radius:10px 10px 0 0"></div>` +
    T(96, 302, "In-Warehouse Receipt", "font-size:44px;color:#333") + A(752, 300, icon("x", 54, "#333")) +
    A(582, 392, `<div style="display:flex;gap:10px;align-items:center;color:${LINK};font-size:32px">${icon("print", 38, LINK)}Print Receipt</div>`) +
    A(70, 520, `<div style="width:751px;text-align:center;font-weight:900;font-size:38px;letter-spacing:6px;color:#111">COSTCO WHOLESALE</div>`) +
    A(70, 600, `<div style="width:751px;text-align:center;font-size:30px;line-height:1.35"><b style="font-size:36px">${RC.wh}</b><br>${RC.addr.join("<br>")}<br><b style="font-size:26px;letter-spacing:2px;color:#b45309">EXAMPLE · NOT A REAL RECEIPT</b></div>`) +
    A(104, 830, bars(682, 100, 9)) + T(70, 940, "00000000000000000000", "width:751px;text-align:center;font-size:32px;letter-spacing:1px");
  let y = 1020;
  RC.items.forEach(([n, d, p]) => { h += T(150, y, n, "width:200px;text-align:right;font-size:32px") + T(378, y, d, "font-size:32px") + T(690, y, p + " N", "width:100px;text-align:right;font-size:32px"); y += 74; });
  h += T(378, y, "SUBTOTAL", "font-size:32px") + T(690, y, RC.sub, "width:100px;text-align:right;font-size:32px") + T(378, y + 52, "TAX", "font-size:32px") + T(690, y + 52, RC.tax, "width:100px;text-align:right;font-size:32px") +
    T(240, y + 104, "****", "font-size:32px") + T(378, y + 104, "TOTAL", "font-size:32px") + T(690, y + 104, RC.total, "width:100px;text-align:right;font-size:32px");
  return h;
};
const receiptPage = (w) => {
  // page 1 of the print preview, drawn at 751 px wide then scaled by the caller
  const L = (txt, st = "") => `<div style="font-size:15px;line-height:1.5;${st}">${txt}</div>`;
  return `<div style="width:751px;padding:40px 180px 30px;background:#fff;font-family:R,sans-serif;color:#111">
    <div style="text-align:center;font-weight:900;font-size:22px;letter-spacing:4px">COSTCO WHOLESALE</div>
    <div style="text-align:center;margin-top:10px;font-size:14px;line-height:1.35"><b style="font-size:15px">${RC.wh}</b><br>${RC.addr.join("<br>")}<br><b style="color:#b45309">EXAMPLE · NOT A REAL RECEIPT</b></div>
    <div style="display:flex;justify-content:center;margin-top:10px">${bars(240, 44, 9)}</div><div style="text-align:center;font-size:14px">00000000000000000000</div>
    <div style="margin-top:14px">${L("Member<br>000000000000")}</div>
    <div style="margin-left:140px;margin-top:6px">${RC.items.map(([n, d, p]) => L(`${n} &nbsp;${d} ${p} N`)).join("")}${L("&nbsp;".repeat(16) + "SUBTOTAL " + RC.sub)}${L("&nbsp;".repeat(16) + "TAX " + RC.tax)}${L("**** &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; TOTAL " + RC.total)}</div>
    <div style="border-top:2px dashed #999;margin:14px 0"></div>
    ${L("XXXXXXXXXXXX0000 &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; CHIP read")}${L("APPROVED -PURCHASE")}${L("AMOUNT: $" + RC.total)}${L("10/20/2026 14:32 000 0 000 000")}${L("VISA " + "&nbsp;".repeat(30) + RC.total)}${L("CHANGE " + "&nbsp;".repeat(36) + "0")}
    <div style="border-top:2px dashed #999;margin:14px 0"></div>
    ${L("&nbsp;".repeat(20) + "TOTAL TAX " + RC.tax)}${L("TOTAL NUMBER OF ITEMS SOLD = 2")}${L("10/20/2026 14:32 000 0 000 000")}
  </div>`;
};
const printScreen = () => `<div class="a" style="left:0;top:0;width:891px;height:2000px;background:#ececec"></div>` + status(false) +
  A(40, 172, `<div style="display:flex;gap:22px;align-items:center;font-size:44px">${`<div style="width:58px;height:62px;background:#1565c0;color:#fff;font-weight:900;font-size:22px;display:flex;align-items:center;justify-content:center;border-radius:4px">PDF</div>`}Save as PDF<span style="margin-left:140px">${icon("chev", 40, "#555")}</span></div>`) +
  T(62, 268, "Copies: &nbsp; <span style='color:#222;font-size:40px'>1</span> &nbsp;&nbsp;&nbsp;&nbsp; Paper size: &nbsp;<span style='color:#222;font-size:40px'>Letter</span>", "font-size:34px;color:#777") +
  `<div class="a" style="left:0;top:395px;width:891px;height:2px;background:#d6d6d6"></div>` +
  A(70, 463, `<div style="width:751px;height:1040px;overflow:hidden;background:#fff;box-shadow:0 4px 14px rgba(0,0,0,.2)">${receiptPage()}</div>`) +
  A(70, 1437, `<div style="width:751px;height:68px;background:#a6a6a6;color:#fff;font-size:34px;display:flex;align-items:center;justify-content:center">1/2</div>`) +
  `<div class="a" style="left:0;top:1780px;width:891px;height:220px;background:#ececec"></div>` +
  A(356, 1800, `<div style="width:200px;height:102px;border:4px solid #0b5aa5;border-radius:51px;color:#0b5aa5;font-size:36px;display:flex;align-items:center;justify-content:center">Cancel</div>`) +
  A(584, 1800, `<div style="width:272px;height:102px;background:#0b5aa5;border-radius:51px;color:#fff;font-size:36px;display:flex;align-items:center;justify-content:center">Save to PDF</div>`);
// mode "save": the Save-as-PDF folder picker (filename + SAVE bar). mode "pick": the same Downloads view opened
// from PriceBack's Upload file, with the saved PDF as the first tile.
const downloadsScreen = (mode = "save") => {
  let h = `<div class="a" style="left:0;top:0;width:891px;height:2000px;background:#efefef"></div>` + status(false) +
    A(40, 170, icon("menu", 50, "#444")) + T(130, 166, "Downloads", "font-size:48px") + A(710, 170, icon("folder", 52, "#444")) + A(812, 170, icon("dots", 50, "#444")) +
    T(52, 282, "Downloads", `font-size:32px;color:${LINK}`) + T(52, 400, "Files in Downloads", "font-size:28px");
  [[52, 620], [455, 620], [52, 1142], [455, 1142]].forEach(([x, y], i) => {
    h += A(x, y, `<div style="width:382px;height:500px;border:2px solid #ddd;border-radius:16px;background:#fff;overflow:hidden">
      <div style="height:380px;display:flex;align-items:center;justify-content:center">${i === 0 ? `<div style="width:64px;height:64px;background:#e53935;color:#fff;font-weight:900;font-size:20px;display:flex;align-items:center;justify-content:center;border-radius:8px">PDF</div>` : `<div style="width:64px;height:64px;background:#e0e0e0;border-radius:10px"></div>`}</div>
      <div style="height:120px;background:#eee;padding:${mode === "pick" && i === 0 ? "18px 22px" : "24px"}">${mode === "pick" && i === 0
        ? `<div style="font-size:30px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">Orders &amp; Purchases | Co…</div><div style="font-size:26px;color:#666;margin-top:6px">88 kB · Just now</div>`
        : `<div style="height:24px;width:${200 - i * 20}px;background:#d0d0d0;border-radius:6px"></div><div style="height:20px;width:120px;background:#e0e0e0;border-radius:6px;margin-top:14px"></div>`}</div></div>`);
  });
  if (mode === "pick") return h;
  return h + `<div class="a" style="left:0;top:1820px;width:891px;height:180px;background:#fff"></div>` +
    A(40, 1846, `<div style="width:42px;height:42px;background:#e53935;color:#fff;font-weight:900;font-size:13px;display:flex;align-items:center;justify-content:center;border-radius:5px">PDF</div>`) +
    T(164, 1838, "Orders &amp; Purchases | Costco", "font-size:36px;border-bottom:2px solid #333;width:488px;overflow:hidden") +
    A(670, 1830, `<div style="width:190px;height:80px;background:#0b5aa5;border-radius:40px;color:#fff;font-weight:700;font-size:32px;letter-spacing:3px;display:flex;align-items:center;justify-content:center">SAVE</div>`);
};

// ── PriceBack (our own app) ────────────────────────────────────────────────
const PBG = "#10b981";
const pbScan = (overlay) => {
  let h = `<div class="a" style="left:0;top:0;width:891px;height:2000px;background:#fff"></div>` + status(false) +
    A(26, 165, `<div style="width:72px;height:72px;border:2px solid #ddd;border-radius:20px;display:flex;align-items:center;justify-content:center">${icon("back", 40, "#333")}</div>`) +
    T(0, 182, "Scan receipt", "width:891px;text-align:center;font-weight:700;font-size:40px") + T(760, 186, "Cancel", "font-size:32px;color:#555") +
    A(26, 300, `<div style="width:839px;height:96px;border-radius:24px;background:#f1f3f2;display:flex;align-items:center;padding:8px;gap:8px;font-size:30px">
      <div style="flex:1;height:80px;background:#fff;border-radius:18px;display:flex;align-items:center;justify-content:center;gap:10px;font-weight:700;box-shadow:0 1px 4px rgba(0,0,0,.12)">${icon("receipt", 34, "#333")}Receipt</div>
      <div style="flex:1;display:flex;align-items:center;justify-content:center;gap:10px;color:#555">Price tag</div><div style="flex:1;display:flex;align-items:center;justify-content:center;color:#555">Barcode</div></div>`) +
    A(26, 430, `<div style="width:839px;height:130px;border:2px solid #e5e7eb;border-radius:24px;display:flex;align-items:center;gap:24px;padding:0 30px">
      <div style="width:64px;height:64px;border-radius:32px;background:#dcfce7"></div><div style="flex:1"><div style="font-size:34px"><b>75</b> credits left</div><div style="height:10px;border-radius:5px;background:${PBG};margin-top:12px"></div></div></div>`) +
    A(40, 590, `<div style="width:800px;font-size:27px;line-height:1.4;color:#444">💡 Scan from the top of your receipt, with every item and the totals in the frame.</div>`) +
    A(26, 700, `<div style="width:839px;height:500px;border:3px dashed #d1d5db;border-radius:30px;background:#fafafa;display:flex;flex-direction:column;align-items:center;justify-content:center">
      <div style="width:150px;height:150px;border-radius:30px;background:#dcfce7"></div><div style="font-weight:700;font-size:40px;margin-top:30px">Scan a receipt</div><div style="font-size:28px;color:#666;margin-top:10px">Opens the document scanner</div></div>`) +
    A(26, 1240, `<div style="width:405px;height:104px;border:2px solid #e5e7eb;border-radius:22px;display:flex;align-items:center;justify-content:center;gap:12px;font-weight:700;font-size:32px">Photo library</div>`) +
    A(460, 1240, `<div style="width:405px;height:104px;border:2px solid #e5e7eb;border-radius:22px;display:flex;align-items:center;justify-content:center;gap:12px;font-weight:700;font-size:32px">Upload file</div>`);
  if (overlay) h += `<div class="a" style="left:0;top:0;width:891px;height:2000px;background:rgba(0,0,0,.45)"></div>` +
    A(170, 820, `<div style="width:551px;padding:50px 40px;border-radius:30px;background:#fff;text-align:center"><div id="spin" style="width:96px;height:96px;margin:0 auto;border-radius:48px;border:10px solid #d1fae5;border-top-color:${PBG}"></div><div style="font-weight:700;font-size:38px;margin-top:30px">Processing receipt…</div></div>`);
  return h;
};
// PriceBack's review step after a PDF is read (ScanScreen step 1, simplified): scan.reviewNew, scan.heroEyebrow,
// scan.heroTitle, the store row, Online / Warehouse Purchase, Items (n), Summary, Purchase Date / Watch Until,
// scan.startTracking. Fake receipt: Oct 20, 2026, two items, $92.98; watch until purchase + 30 days.
const pbReview = () => {
  const card = (y, h, inner) => A(26, y, `<div style="width:839px;height:${h}px;background:#fff;border-radius:30px;border:2px solid #e8ece9;padding:28px 34px;box-sizing:border-box">${inner}</div>`);
  const lab = (t) => `<div style="font-size:23px;font-weight:700;letter-spacing:2px;color:#6b7280">${t}</div>`;
  const row = (l, r, st = "") => `<div style="display:flex;justify-content:space-between;align-items:center;margin-top:16px;font-size:32px;${st}"><span>${l}</span><span>${r}</span></div>`;
  return `<div class="a" style="left:0;top:0;width:891px;height:2000px;background:#f4f6f5"></div>` + status(false) +
    A(26, 165, `<div style="width:72px;height:72px;border:2px solid #ddd;border-radius:20px;background:#fff;display:flex;align-items:center;justify-content:center">${icon("back", 40, "#333")}</div>`) +
    T(0, 182, "Confirm receipt", "width:891px;text-align:center;font-weight:700;font-size:40px") +
    A(26, 280, `<div style="width:839px;height:470px;border-radius:44px;background:linear-gradient(135deg,#0d3d28,#062618);padding:36px 36px;box-sizing:border-box;color:#fff">
      <div style="font-size:21px;font-weight:700;letter-spacing:2px;color:rgba(255,255,255,.55)">STEP 2 OF 2 · CONFIRM DETAILS</div>
      <div style="font-weight:900;font-size:46px;line-height:1.12;margin-top:10px;letter-spacing:-1px">Make sure this matches your receipt</div>
      <div style="margin-top:24px;display:flex;align-items:center;gap:20px;background:rgba(255,255,255,.1);border-radius:26px;padding:18px 20px">
        <div style="width:70px;height:70px;border-radius:18px;background:#fff;display:flex;align-items:center;justify-content:center">${icon("store", 42, "#0d3d28")}</div>
        <div style="flex:1"><div style="font-weight:900;font-size:34px">Costco</div><div style="font-size:26px;color:rgba(255,255,255,.7)">Oct 20, 2026 · 30-day window</div></div>
        <div style="padding:10px 18px;border-radius:999px;background:rgba(255,255,255,.16);font-weight:700;font-size:26px">Change ›</div></div>
      <div style="margin-top:20px;display:flex;gap:10px;background:rgba(255,255,255,.08);border-radius:22px;padding:8px;font-size:28px;font-weight:700">
        <div style="flex:1;text-align:center;padding:14px 0;color:rgba(255,255,255,.75)">Online</div>
        <div style="flex:1;text-align:center;padding:14px 0;border-radius:16px;background:${PBG}">Warehouse Purchase</div></div></div>`) +
    card(780, 370, lab("ITEMS (2)") + RC.items.map(([n, d, p]) => `<div style="display:flex;justify-content:space-between;align-items:center;margin-top:22px;padding-bottom:20px;border-bottom:2px solid #f0f2f1">
      <div><div style="font-weight:700;font-size:34px">${d}</div><div style="font-size:24px;color:#6b7280;margin-top:4px">#${n} · QTY 1</div></div><div style="font-weight:700;font-size:36px">$${p}</div></div>`).join("")) +
    card(1180, 290, lab("SUMMARY") + row("Subtotal", "$" + RC.sub, "color:#555") + row("Tax (HST/GST)", "$" + RC.tax, "color:#555") +
      row("<b>Total</b>", "<b>$" + RC.total + "</b>", "border-top:2px solid #eee;padding-top:14px;font-size:36px")) +
    card(1500, 150, `<div style="display:flex;gap:30px"><div style="flex:1">${lab("PURCHASE DATE")}<div style="font-weight:700;font-size:34px;margin-top:10px">Oct 20, 2026</div></div>
      <div style="flex:1">${lab("WATCH UNTIL")}<div style="font-weight:700;font-size:34px;margin-top:10px">Nov 19, 2026</div></div></div>`) +
    A(26, 1690, `<div id="startBtn" style="width:839px;height:124px;border-radius:32px;background:${PBG};color:#fff;display:flex;align-items:center;justify-content:center;font-weight:900;font-size:42px;box-shadow:0 8px 20px rgba(16,185,129,.35)">Start Tracking 🚀</div>`) +
    T(0, 1850, "Re-scan", "width:891px;text-align:center;font-size:32px;color:#555;font-weight:700");
};
const pickerScreen = () => `<div class="a" style="left:0;top:0;width:891px;height:2000px;background:#f8f8f8"></div>` + status(false) +
  A(40, 170, icon("menu", 50, "#444")) + T(130, 166, "Recent", "font-size:48px") +
  T(52, 300, "Files", "font-size:30px;color:#555") +
  A(30, 370, `<div style="width:831px;height:150px;background:#fff;border-radius:22px;display:flex;align-items:center;gap:28px;padding:0 30px;box-shadow:0 1px 4px rgba(0,0,0,.08)">
    <div style="width:70px;height:70px;background:#e53935;color:#fff;font-weight:900;font-size:22px;display:flex;align-items:center;justify-content:center;border-radius:8px">PDF</div>
    <div><div style="font-size:36px">Orders &amp; Purchases | Costco.pdf</div><div style="font-size:28px;color:#777;margin-top:6px">Just now</div></div></div>`) +
  [560, 730, 900].map((y) => A(30, y, `<div style="width:831px;height:150px;background:#fff;border-radius:22px;opacity:.6;display:flex;align-items:center;gap:28px;padding:0 30px"><div style="width:70px;height:70px;background:#e5e5e5;border-radius:8px"></div><div style="width:360px;height:26px;background:#e5e5e5;border-radius:6px"></div></div>`)).join("");


// ── iPhone: print screen, share sheet, Save to Files, and the Files picker (system UI, simplified) ──
const IOSB = "#0a7aff", IOSBG = "#f2f2f7";
const iosRow = (y, left, right = "", st = "") => A(30, y, `<div style="width:831px;height:104px;background:#fff;display:flex;align-items:center;justify-content:space-between;padding:0 34px;font-size:36px;${st}">${left}<span style="color:#8e8e93">${right}</span></div>`);
const pdfThumb = (w, h) => `<div style="width:${w}px;height:${h}px;background:#fff;border:1px solid #d1d1d6;box-shadow:0 2px 6px rgba(0,0,0,.12);overflow:hidden"><div style="transform:scale(${w / 751});transform-origin:0 0">${receiptPage()}</div></div>`;
const iosShareIcon = (col = IOSB, s = 52) => `<svg width="${s}" height="${s}" viewBox="0 0 24 24" fill="none" stroke="${col}" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3v12M8 7l4-4 4 4"/><path d="M6 11H5v10h14V11h-1"/></svg>`;
const iosPrint = () => `<div class="a" style="left:0;top:0;width:891px;height:2000px;background:${IOSBG}"></div>` + status(false) +
  T(40, 160, "Cancel", `font-size:38px;color:${IOSB}`) + T(0, 158, "Options", "width:891px;text-align:center;font-weight:700;font-size:38px") +
  A(650, 150, iosShareIcon()) + T(740, 160, "Print", `font-weight:700;font-size:38px;color:${IOSB}`) +
  `<div class="a" style="left:30px;top:270px;width:831px;height:210px;border-radius:24px;overflow:hidden">` + `</div>` +
  A(30, 270, `<div style="width:831px;border-radius:24px;overflow:hidden">
    <div style="height:104px;background:#fff;display:flex;align-items:center;justify-content:space-between;padding:0 34px;font-size:36px;border-bottom:1px solid #e5e5ea">Printer<span style="color:#8e8e93">No Printer Selected ›</span></div>
    <div style="height:104px;background:#fff;display:flex;align-items:center;justify-content:space-between;padding:0 34px;font-size:36px">1 Copy<span style="display:inline-flex;border-radius:16px;background:#eeeef0;padding:8px 26px;gap:44px;font-size:40px">−<i style="font-style:normal">+</i></span></div></div>`) +
  A(110, 600, pdfThumb(330, 480)) + A(470, 600, `<div style="width:310px;height:480px;background:#fff;border:1px solid #d1d1d6;box-shadow:0 2px 6px rgba(0,0,0,.12);display:flex;align-items:flex-start;justify-content:center;padding-top:40px;font-size:13px;color:#555">Thank You!<br>Please Come Again</div>`) +
  T(250, 1100, "Page 1", "font-size:28px;color:#8e8e93") + T(580, 1100, "Page 2", "font-size:28px;color:#8e8e93");
const iosShare = () => iosPrint() + `<div class="a" style="left:0;top:0;width:891px;height:2000px;background:rgba(0,0,0,.35)"></div>` +
  A(0, 560, `<div style="width:891px;height:1440px;background:${IOSBG};border-radius:40px 40px 0 0"></div>`) +
  A(40, 600, `<div style="display:flex;gap:26px;align-items:center"><div style="width:96px;height:120px;background:#fff;border:1px solid #d1d1d6;display:flex;align-items:center;justify-content:center;color:#e53935;font-weight:900;font-size:22px">PDF</div>
    <div><div style="font-size:34px;font-weight:600">Orders &amp; Purchases | Costco</div><div style="font-size:28px;color:#8e8e93;margin-top:6px">PDF Document · 88 KB</div></div></div>`) +
  A(808, 610, `<div style="width:56px;height:56px;border-radius:28px;background:#e3e3e8;display:flex;align-items:center;justify-content:center;font-size:30px;color:#8e8e93">✕</div>`) +
  A(40, 780, `<div style="display:flex;gap:44px">${["AirDrop", "Messages", "Mail", "Notes"].map((l) => `<div style="width:150px;text-align:center"><div style="width:132px;height:132px;margin:0 auto;border-radius:32px;background:#d9d9de"></div><div style="font-size:26px;margin-top:12px">${l}</div></div>`).join("")}</div>`) +
  A(30, 1020, `<div style="width:831px;border-radius:24px;overflow:hidden;background:#fff">${[["Copy", "⧉"], ["Save to Files", "folder"], ["Print", "print"], ["Add to Reading List", "◎"]].map(([l, k]) =>
    `<div style="height:110px;display:flex;align-items:center;justify-content:space-between;padding:0 34px;font-size:36px;border-bottom:1px solid #e5e5ea">${l}<span style="color:#111">${I[k] ? icon(k, 46, "#111") : `<span style="font-size:36px">${k}</span>`}</span></div>`).join("")}</div>`);
const iosSave = () => `<div class="a" style="left:0;top:0;width:891px;height:2000px;background:rgba(0,0,0,.35)"></div>` +
  A(0, 130, `<div style="width:891px;height:1870px;background:#fff;border-radius:40px 40px 0 0"></div>`) +
  T(40, 182, "Cancel", `font-size:38px;color:${IOSB}`) + T(0, 180, "On My iPhone", "width:891px;text-align:center;font-weight:700;font-size:38px") + T(770, 182, "Save", `font-weight:700;font-size:38px;color:${IOSB}`) +
  A(40, 270, `<div style="width:811px;height:80px;border-radius:20px;background:#eeeef0;display:flex;align-items:center;gap:16px;padding:0 22px;font-size:34px;color:#8e8e93">${icon("search", 38, "#8e8e93")}Search</div>`) +
  [[400, "Downloads"], [700, "Documents"]].map(([x, l], i) => A(i === 0 ? 120 : 470, 420, `<div style="width:300px;text-align:center"><div style="width:220px;height:170px;margin:0 auto;border-radius:22px;background:${i === 0 ? "#8fc3ff" : "#cfe4ff"};position:relative"><div style="position:absolute;left:0;top:-18px;width:100px;height:40px;border-radius:14px 14px 0 0;background:${i === 0 ? "#8fc3ff" : "#cfe4ff"}"></div></div><div style="font-size:30px;margin-top:16px">${l}</div><div style="font-size:24px;color:#8e8e93">${i === 0 ? "3 items" : "12 items"}</div></div>`)).join("") +
  `<div class="a" style="left:0;top:1640px;width:891px;height:360px;background:#f9f9fb;border-top:1px solid #e5e5ea"></div>` +
  A(40, 1680, `<div style="display:flex;gap:26px;align-items:center"><div style="width:90px;height:112px;background:#fff;border:1px solid #d1d1d6;display:flex;align-items:center;justify-content:center;color:#e53935;font-weight:900;font-size:20px">PDF</div>
    <div><div style="font-size:34px;font-weight:600">Orders &amp; Purchases | Costco</div><div style="font-size:28px;color:#8e8e93;margin-top:8px">Tags</div></div></div>`);
const iosPicker = () => `<div class="a" style="left:0;top:0;width:891px;height:2000px;background:rgba(0,0,0,.35)"></div>` +
  A(0, 130, `<div style="width:891px;height:1870px;background:#fff;border-radius:40px 40px 0 0"></div>`) +
  T(40, 182, "Cancel", `font-size:38px;color:${IOSB}`) + T(0, 180, "Recents", "width:891px;text-align:center;font-weight:700;font-size:38px") +
  A(40, 270, `<div style="width:811px;height:80px;border-radius:20px;background:#eeeef0;display:flex;align-items:center;gap:16px;padding:0 22px;font-size:34px;color:#8e8e93">${icon("search", 38, "#8e8e93")}Search</div>`) +
  A(70, 420, `<div style="display:flex;gap:50px">${[0, 1, 2].map((i) => `<div style="width:220px;text-align:center"><div style="width:180px;height:230px;margin:0 auto;border:1px solid #d1d1d6;background:#fff;box-shadow:0 2px 6px rgba(0,0,0,.1);${i ? "opacity:.45" : ""};display:flex;align-items:center;justify-content:center;color:#e53935;font-weight:900;font-size:24px">${i ? "" : "PDF"}</div>
    <div style="font-size:26px;margin-top:14px;${i ? "opacity:0" : ""}">Orders &amp; Purchases | Costco</div><div style="font-size:22px;color:#8e8e93;margin-top:4px;${i ? "opacity:0" : ""}">Today · 88 KB</div></div>`).join("")}</div>`) +
  `<div class="a" style="left:0;top:1800px;width:891px;height:200px;background:#f9f9fb;border-top:1px solid #e5e5ea"></div>` +
  [["Recents", 0], ["Shared", 1], ["Browse", 2]].map(([l, i]) => A(60 + i * 280, 1826, `<div style="width:220px;text-align:center;font-size:26px;color:${i === 0 ? IOSB : "#8e8e93"}">${icon(i === 0 ? "receipt" : i === 1 ? "person" : "folder", 48, i === 0 ? IOSB : "#8e8e93")}<div>${l}</div></div>`)).join("");
