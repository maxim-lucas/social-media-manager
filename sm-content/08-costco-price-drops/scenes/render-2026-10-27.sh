#!/usr/bin/env bash
# Renders every Oct 27 carousel with real photos (R2 via the PriceBack API, Same-Day fallback) into posts/,
# plus the receipt-scan carousel. Run from the repo root: bash sm-content/08-costco-price-drops/scenes/render-2026-10-27.sh
set -euo pipefail
cd "$(dirname "$0")"
for w in 400-1100 300-400 150-300 under-150 grocery-coffee-drinks grocery-frozen-meat grocery-dairy-cheese grocery-pantry-snacks; do
  echo "== $w"; node render.js "weeks/2026-10-27-$w.json"
done
node ../../10-receipt-scan/scenes/render.js
echo "Done. Finals in sm-content/08-costco-price-drops/posts/2026-10-27-*/ and sm-content/10-receipt-scan/posts/"
