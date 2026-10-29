#!/usr/bin/env bash
# Oct 29 deal carousels, tiered by SAVING. Photos must be in scenes/.cache/<item #>.jpg or in R2 (via the API).
set -euo pipefail
cd "$(dirname "$0")"
for w in off-400-1100 off-300-400 off-150-300 off-under-150; do node render.js "weeks/2026-10-29-$w.json"; done
