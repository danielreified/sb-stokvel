#!/usr/bin/env bash
###############################################################################
# Lint + validate + security-scan all Terraform code.
#
# Run manually:   bun run tf:check
# Run in CI:      same script, exits non-zero on any failure.
#
# Required tools (install once):
#   brew install terraform terragrunt tflint trivy
###############################################################################

set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "${ROOT}"

if [[ ! -d infrastructure ]]; then
  echo "no infrastructure/ directory; nothing to check"
  exit 0
fi

red()    { printf '\033[31m%s\033[0m\n' "$*"; }
green()  { printf '\033[32m%s\033[0m\n' "$*"; }
yellow() { printf '\033[33m%s\033[0m\n' "$*"; }
section() { printf '\n\033[1m== %s ==\033[0m\n' "$*"; }

# --strict: fail if any optional tool is missing. CI sets this; local dev
# skips with a warning so `bun run tf:check` works before tflint/trivy are
# installed.
STRICT=0
if [[ "${1:-}" == "--strict" ]]; then
  STRICT=1
fi

require_hard() {
  if ! command -v "$1" >/dev/null 2>&1; then
    red "missing tool: $1"
    yellow "install: $2"
    exit 127
  fi
}

require_soft() {
  if ! command -v "$1" >/dev/null 2>&1; then
    if [[ "${STRICT}" == "1" ]]; then
      red "missing tool: $1 (--strict)"
      yellow "install: $2"
      exit 127
    fi
    yellow "skipping $1 — not installed ($2)"
    return 1
  fi
  return 0
}

require_hard terraform "brew install terraform"
HAS_TFLINT=0; require_soft tflint "brew install tflint" && HAS_TFLINT=1
HAS_TRIVY=0;  require_soft trivy  "brew install trivy"  && HAS_TRIVY=1

# ---- 1. Format ------------------------------------------------------------

section "terraform fmt -check"
if ! terraform fmt -check -recursive infrastructure/; then
  red "fmt failures above. Run: terraform fmt -recursive infrastructure/"
  exit 1
fi
green "fmt ok"

# ---- 2. Validate every leaf .tf directory ---------------------------------
#
# `terraform validate` requires `terraform init` first to resolve module
# sources and providers. We use -backend=false so it doesn't try to talk
# to S3, and we run against modules + envs.

section "terraform validate"
validate_dir() {
  local dir="$1"
  printf '  %s ... ' "${dir}"
  pushd "${dir}" >/dev/null
  if terraform init -backend=false -input=false >/dev/null 2>&1 \
     && terraform validate -no-color >/dev/null; then
    green "ok"
  else
    red "FAILED"
    terraform validate
    popd >/dev/null
    return 1
  fi
  popd >/dev/null
}

# Modules first. Modules that declare `configuration_aliases` (e.g. the
# static-site module needs `aws.us_east_1` for CloudFront's ACM cert)
# can't be validated standalone — terraform errors that the aliased
# provider configuration isn't present. Their syntax is exercised
# transitively when an env stack consumes them.
for d in infrastructure/modules/*/; do
  if grep -q "configuration_aliases" "${d}terraform.tf" 2>/dev/null; then
    printf '  %s ... ' "${d}"
    yellow "skipped (aliased provider — validated via env)"
    continue
  fi
  validate_dir "${d}"
done

# Bootstrap (plain TF, no terragrunt)
validate_dir infrastructure/bootstrap

# Env stacks: validate via terragrunt to pick up the generated files
section "terragrunt validate (envs)"
if command -v terragrunt >/dev/null 2>&1; then
  for d in infrastructure/envs/*/; do
    printf '  %s ... ' "${d}"
    if (cd "${d}" && terragrunt hclvalidate >/dev/null 2>&1); then
      green "ok"
    else
      red "FAILED"
      (cd "${d}" && terragrunt hclvalidate)
      exit 1
    fi
  done
else
  yellow "terragrunt not installed — skipping env validation"
fi

# ---- 3. tflint ------------------------------------------------------------

if [[ "${HAS_TFLINT}" == "1" ]]; then
  section "tflint"
  # `--init` syncs plugins (fast after first run, cached in ~/.tflint.d).
  if ! tflint --init --recursive --chdir infrastructure 2>&1 | tail -5; then
    red "tflint plugin init failed"
    exit 1
  fi
  if ! tflint --recursive --chdir infrastructure --format compact; then
    red "tflint findings above"
    exit 1
  fi
  green "tflint ok"
fi

# ---- 4. trivy config ------------------------------------------------------
#
# IaC security scan. Fails on HIGH or CRITICAL by default; LOW/MEDIUM are
# logged for review but don't block. Tweak severity in CI as needed.

if [[ "${HAS_TRIVY}" == "1" ]]; then
  section "trivy config (HIGH+CRITICAL)"
  if ! trivy config \
      --severity HIGH,CRITICAL \
      --exit-code 1 \
      --quiet \
      infrastructure; then
    red "trivy security findings above"
    exit 1
  fi
  green "trivy ok"
fi

green "\nAll checks passed."
