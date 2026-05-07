#!/usr/bin/env bash
###############################################################################
# Build the PWA against the env's API URL, sync to S3, and invalidate the
# CloudFront paths that should never be cached (index.html, sw.js, manifest).
#
# Reads infrastructure outputs from `infrastructure/envs/<env>` so the
# right bucket + distribution + API URL flow through automatically.
#
# Usage:
#   ./scripts/deploy-pwa.sh dev
###############################################################################

set -euo pipefail

ENV="${1:-dev}"
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
STACK="${ROOT}/infrastructure/envs/${ENV}"

if [[ ! -d "${STACK}" ]]; then
  echo "no such env stack: ${STACK}" >&2
  exit 1
fi

require_output() {
  local key="$1"
  local value
  value="$(cd "${STACK}" && terraform output -raw "${key}" 2>/dev/null || true)"
  if [[ -z "${value}" ]]; then
    echo "missing terraform output '${key}' (run terraform apply in ${STACK})" >&2
    exit 1
  fi
  printf '%s' "${value}"
}

SITE_BUCKET="$(require_output site_bucket)"
DIST_ID="$(require_output site_distribution_id)"
API_URL="$(require_output api_url)"

echo "→ building apps/stokvel-app against API ${API_URL}"
cd "${ROOT}/apps/stokvel-app"
VITE_API_BASE_URL="${API_URL}" bun run build

# `--delete` removes objects in S3 that aren't in the local build — keeps
# old hashed assets from accumulating. Hashed-asset filenames are stable
# until their content changes, so this is safe for content-addressed files.
echo "→ syncing dist/ → s3://${SITE_BUCKET}"
aws s3 sync dist/ "s3://${SITE_BUCKET}/" --delete --only-show-errors

# Invalidate the no-cache files so CloudFront serves the new ones immediately.
# Hashed assets don't need invalidating — they have new filenames.
echo "→ invalidating CloudFront ${DIST_ID}"
aws cloudfront create-invalidation \
  --distribution-id "${DIST_ID}" \
  --paths "/index.html" "/sw.js" "/manifest.webmanifest" \
  --output text --query 'Invalidation.{Id:Id,Status:Status}'

echo "✓ deployed → $(cd "${STACK}" && terraform output -raw site_url)"
