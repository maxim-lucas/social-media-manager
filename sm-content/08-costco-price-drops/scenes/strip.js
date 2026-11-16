/**
 * strip.js: the province strip under a product (which provinces the saving was seen in).
 *
 * Split out of render.js so it can be unit-tested. Weekly automation (Maxim, 2026-11-16): a province whose saving
 * differs from the headline amount shows its own small amount in its cell (`exceptions`: { AB: 2 }), never "up to".
 */
const STRIP = ["BC", "AB", "SK", "MB", "ON", "QC", "NB", "NS", "PE", "NL"];

/**
 * @param {{lang: string, on: string[], bizOnly?: string[], bcOnly?: boolean, exceptions?: Record<string, number>,
 *          money: (lang: string, n: number, round?: boolean) => string}} o
 */
function stripHtml({ lang, on, bizOnly = [], bcOnly = false, exceptions = {}, money }) {
  const label = lang === "fr" ? "RELEVÉ EN" : "SEEN IN";
  const cells = STRIP.map((c) => {
    if (on.includes(c) && exceptions[c] != null) return `<i class="on exc">${c}<small>${money(lang, exceptions[c], true)}</small></i>`;
    return `<i class="${on.includes(c) ? "on" : bizOnly.includes(c) ? "bz" : "off"}">${c}</i>`;
  }).join("");
  const legend = bcOnly
    ? `<div class="legend"><b class="k bz"></b>${lang === "fr" ? "Centres d'affaires Costco seulement" : "Costco Business Centres only"}</div>`
    : bizOnly.length
    ? `<div class="legend"><b class="k on"></b>${lang === "fr" ? "Entrepôts Costco" : "Costco warehouses"}<b class="k bz"></b>${
        lang === "fr" ? "Centres d'affaires Costco seulement" : "Costco Business Centres only"}</div>`
    : "";
  return `<div class="strip"><span class="lab">${label}</span>${cells}</div>${legend}`;
}

module.exports = { stripHtml, STRIP };
