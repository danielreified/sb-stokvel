#!/usr/bin/env bash
###############################################################################
# Build the Hono BFF, zip it, upload to the artifacts bucket, and update the
# Lambda function code.
#
# Reads infrastructure outputs from `infrastructure/envs/<env>` so it
# always targets the right resources for the requested env.
#
# Usage:
#   ./scripts/deploy-api.sh dev
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

ARTIFACTS_BUCKET="$(require_output api_artifacts_bucket)"
LAMBDA_NAME="$(require_output api_function_name)"
CODE_KEY="$(require_output api_artifact_key)"

echo "→ building apps/stokvel-api"
cd "${ROOT}/apps/stokvel-api"
bun run build

# Lambda's Node runtime defaults to CJS; bun emits ESM so the artifact
# needs a sibling package.json declaring the bundle as a module.
echo '{"type":"module"}' > dist/package.json

TMPDIR="$(mktemp -d)"
trap 'rm -rf "${TMPDIR}"' EXIT
ZIP="${TMPDIR}/api.zip"

echo "→ zipping → ${ZIP}"
(cd dist && zip -qr "${ZIP}" .)

echo "→ uploading → s3://${ARTIFACTS_BUCKET}/${CODE_KEY}"
aws s3 cp "${ZIP}" "s3://${ARTIFACTS_BUCKET}/${CODE_KEY}"

echo "→ updating lambda → ${LAMBDA_NAME}"
aws lambda update-function-code \
  --function-name "${LAMBDA_NAME}" \
  --s3-bucket "${ARTIFACTS_BUCKET}" \
  --s3-key "${CODE_KEY}" \
  --output text \
  --query '[FunctionName, LastModified, CodeSize]'

echo "✓ deployed"
