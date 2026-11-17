/**
 * important.js: is a day's batch of new savings worth its own post? (Maxim, 2026-11-16: "schedule the job also for all
 * week days having important new savings drops".) The Monday build covers the big load (about 360 new products); the
 * other days bring 7 to 120. Rule: 15 or more new products, or any new saving of $50 or more.
 */
const MIN_PRODUCTS = 15;
const MIN_AMOUNT = 50;

/** @param {{newProducts: number, maxNewAmount: number}} o */
function isImportant({ newProducts = 0, maxNewAmount = 0 }, { minProducts = MIN_PRODUCTS, minAmount = MIN_AMOUNT } = {}) {
  return newProducts >= minProducts || maxNewAmount >= minAmount;
}

module.exports = { isImportant, MIN_PRODUCTS, MIN_AMOUNT };
