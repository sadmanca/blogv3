#!/usr/bin/env bash
# Site speed audit: asset-weight matrix + Lighthouse lab metrics + dist report.
#
# Usage:
#   ./scripts/perf-audit.sh [base_url]    # default: https://sadman.ca
#
#   BASE_URL=http://localhost:8765 ./scripts/perf-audit.sh   # test a local build
#   SKIP_LIGHTHOUSE=1 ./scripts/perf-audit.sh                 # no Chrome/no network
set -euo pipefail

BASE_URL="${1:-${BASE_URL:-https://sadman.ca}}"
PAGES=(
  "/"
  "/blog"
  "/blog/what-i-read-in-2025"
  "/blog/what-i-watched-in-2025"
  "/reading"
  "/about"
  "/tags"
  "/uses"
)

ASSET_RE='\.(js|css|woff2|webp|png|jpg|jpeg|svg|ico)$'

echo "==================================================================="
echo " Asset-weight matrix — ${BASE_URL}"
echo " (bytes as served: brotli/gzip when the server sends it)"
echo "==================================================================="

for path in "${PAGES[@]}"; do
  html=$(curl -sL --max-time 30 "$BASE_URL$path") || { echo "  SKIP $path (fetch failed)"; continue; }

  # Extract same-origin static assets, fetch each, print "size path" lines
  printf '%s\n' "$html" \
    | grep -oE '(src|href)="/[^"]+"' \
    | cut -d'"' -f2 \
    | grep -E "$ASSET_RE" \
    | sort -u \
    | xargs -P 8 -I{} curl -sL -o /dev/null -H 'Accept-Encoding: br, gzip' -w '%{size_download}\t{}\n' --max-time 20 "$BASE_URL{}" \
    > /tmp/perf-assets.tmp 2>/dev/null || true

  total=$(awk '{s+=$1} END {printf "%d", s}' /tmp/perf-assets.tmp)
  count=$(wc -l < /tmp/perf-assets.tmp)
  echo "== $path — $count assets, $((total / 1024)) KB =="
  sort -rn /tmp/perf-assets.tmp | head -5 | awk '{printf "   %8.1f KB  %s\n", $1/1024, $2}'
done

echo
echo "==================================================================="
echo " Lighthouse (mobile) — median of 3 runs"
echo "==================================================================="
if [ "${SKIP_LIGHTHOUSE:-0}" = "1" ] || ! command -v npx >/dev/null 2>&1; then
  echo "  skipped (SKIP_LIGHTHOUSE=1 or npx unavailable)"
else
  for path in "/" "/blog/what-i-read-in-2025" "/reading"; do
    echo "== $path =="
    for i in 1 2 3; do
      # Note: preset "perf" = mobile emulation, performance-only (Lighthouse >= 12).
      npx --no-install lighthouse "$BASE_URL$path" \
        --preset=perf --only-categories=performance \
        --output=json --output-path=/tmp/perf-lh.json \
        --quiet --chrome-flags='--headless --no-sandbox' \
        >/dev/null 2>&1 || npx --yes lighthouse "$BASE_URL$path" \
        --preset=perf --only-categories=performance \
        --output=json --output-path=/tmp/perf-lh.json \
        --quiet --chrome-flags='--headless --no-sandbox' \
        >/dev/null 2>&1 || { echo "   run $i: lighthouse failed (Chrome missing?)"; continue; }
      python3 - <<'PY' || true
import json
try:
    d = json.load(open('/tmp/perf-lh.json'))
    a = d['audits']
    score = d['categories']['performance']['score']
    print(f"   run {i}: score={score:.2f} LCP={a['largest-contentful-paint']['displayValue']} "
          f"TBT={a['total-blocking-time']['displayValue']} CLS={a['cumulative-layout-shift']['displayValue']}")
except Exception as e:
    print(f"   run {i}: parse failed ({e})")
PY
    done
  done
fi

echo
echo "==================================================================="
echo " dist report"
echo "==================================================================="
if [ -d dist ]; then
  du -sh dist
  find dist -type f -printf '%s %p\n' | sort -rn | head -15 | awk '{printf "   %8.1f KB  %s\n", $1/1024, $2}'
  echo "--- unreferenced font files (in public/fonts but not in global.css) ---"
  for f in public/fonts/*.woff2; do
    base=$(basename "$f")
    grep -q "$base" src/styles/global.css || echo "   UNREFERENCED: $base"
  done
else
  echo "  no dist/ — run 'npm run build' first"
fi

rm -f /tmp/perf-assets.tmp /tmp/perf-lh.json
