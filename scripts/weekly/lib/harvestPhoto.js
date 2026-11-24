/**
 * harvestPhoto.js: picking a product's own photo out of a costco.ca / costcobusinesscentre.ca search page
 * (Maxim, 2026-11-24: "harvest a photo in costco.ca or costco sameday and save it to our products photo catalogue").
 *
 * The item number alone decides the product (PriceBack's price-sweep rule 4): a result counts only when its image file
 * name carries the item number, whatever its printed name says. Costco names a file `<item>-894__1.avif` (costco.ca) or
 * `<item>__1.avif` / `<hash>__<item>__1.avif` (Business Centre). A name match without the number is NOT enough.
 */
const SIZE = 600; // the catalogue's own size: 600x600 JPEG (scenes/.cache, priceback-product-images)

/** @param {{alt?: string, src: string}[]} images @param {string} sku @returns {{alt: string, src: string}|null} */
function pickBySku(images, sku) {
  const re = new RegExp(`(^|[^0-9])${String(sku).replace(/\D/g, "")}([^0-9]|$)`);
  for (const i of images || []) {
    const file = String(i.src || "").split("?")[0].split("/").pop() || "";
    if (/\/as\//.test(i.src || "") && re.test(file)) return { alt: i.alt || "", src: i.src };
  }
  return null;
}

/** The same image at the catalogue's size (the page serves 350 px thumbnails). */
function atCatalogueSize(src) {
  const u = new URL(src);
  u.searchParams.set("width", String(SIZE));
  u.searchParams.set("height", String(SIZE));
  u.searchParams.set("fit", "contain");
  return u.toString();
}

module.exports = { pickBySku, atCatalogueSize, SIZE };
