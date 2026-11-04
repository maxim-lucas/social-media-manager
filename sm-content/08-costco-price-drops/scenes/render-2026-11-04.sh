#!/usr/bin/env bash
# Renders the Nov 4 grocery carousels (claim cover, items by end date, end card), EN + FR.
# Photos must be in scenes/.cache/<item #>.jpg (Same-Day / costco.ca packshots, see STYLE.md).
set -euo pipefail
cd "$(dirname "$0")"
for w in grocery health-beauty frozen; do echo "== $w"; node render.js "weeks/2026-11-04-$w.json"; done
