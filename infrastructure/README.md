# Infrastructure

AWS infrastructure for the Seyva Stokvel demo. Plain Terraform,
single-account, two envs (one active).

## Layout

```
infrastructure/
├── bootstrap/                # one-shot. Creates the S3 + DynamoDB state backend.
├── envs/
│   ├── dev/                  # active env. Resources at seyva-dev-*
│   └── prod/                 # placeholder. Activates by copying dev's .tf files.
└── modules/
    ├── ssm-secret/           # SSM SecureString wrapper.
    ├── static-site/          # S3 + CloudFront + ACM(us-east-1) + R53 + cache.
    └── api-lambda/           # Lambda + APIGW HTTP + ACM(regional) + R53.
```

Each env owns its own `backend.tf` and `providers.tf` — there's no shared
root config. State namespacing comes from the `key` set in each env's
`backend.tf` (e.g. `envs/dev/terraform.tfstate`).

## Apply order — first time

```bash
# 0. Tools
brew install terraform tflint trivy
# (and AWS creds available — aws-vault, AWS_PROFILE, or OIDC role)

# 1. Bootstrap the state backend (one-shot, local state, gitignored)
cd infrastructure/bootstrap
terraform init && terraform apply

# 2. Apply the dev env (uses the S3 backend created above)
cd ../envs/dev
export TF_VAR_database_url='postgres://...'   # Neon URL — never commit
terraform init
terraform plan
terraform apply

# 3. Deploy the API code (placeholder zip → real Hono build)
cd ../../..
./scripts/deploy-api.sh dev
```

## Day-2 ops

```bash
# Re-apply infra after .tf changes
cd infrastructure/envs/dev && terraform apply

# Lint + validate + security-scan everything
bun run tf:check

# Format-only
bun run tf:fmt

# Tail Lambda logs
aws logs tail "$(cd infrastructure/envs/dev && terraform output -raw api_log_group)" --follow

# Deploy code only (no infra change)
./scripts/deploy-api.sh dev
```

## Quality bar

- **Versions**: Terraform `>= 1.6`, AWS provider `~> 5.80`. Pinned in every
  module's `terraform.tf`.
- **Style**: HashiCorp file convention — `terraform.tf` / `main.tf` /
  `variables.tf` / `outputs.tf` / `locals.tf` per module. Variables in
  alphabetical-ish order (grouped by purpose). Every `variable` carries
  `description` + `type`; sensitive ones marked.
- **Validation**: variables that have a stable shape (`name_prefix`,
  `log_retention_days`, `memory_size_mb`, etc.) include a `validation`
  block. tflint catches anything not encoded that way.
- **Security scanning**: `trivy config` runs `infrastructure/` on every
  `tf:check`. Fails on HIGH+CRITICAL.
- **Secrets**:
  - SSM SecureString for runtime secrets (DB URLs etc.). Never plain
    Lambda env vars.
  - `terraform.tfvars` is gitignored; `.tfvars.example` would be
    committed if we used tfvars at all (we use `TF_VAR_*` env vars
    instead — fewer files to fat-finger).
- **Module testing**: each module has a clear input/output contract and
  a README. `terraform test` blocks for module unit tests are a deferred
  next step — listed under future-work in this file.

## Cost estimate (dev, idle)

| Service       | Estimate    | Notes                                          |
| ------------- | ----------- | ---------------------------------------------- |
| CloudFront    | ~$0         | First 1TB egress / 10M requests free per month |
| Lambda        | ~$0         | First 1M invocations + 400k GB-sec free        |
| API Gateway   | ~$0–$1      | $1.00 per million requests                     |
| S3            | ~$0–$1      | Tiny PWA bundle, lifecycle expires old zips    |
| Route53       | $0.50/zone  | Per existing hosted zone, not per record       |
| ACM           | $0          | Public certs are free                          |
| SSM Param     | $0          | Standard parameters, no advanced tier          |
| **Total**     | **< $5/mo** | While idle. Real usage stays well inside FT.   |

## Known limitations / future work

- **Neon is out of IaC.** Project + branch + database are managed in the
  Neon dashboard. Connection string flows in via `TF_VAR_database_url` →
  SSM SecureString → Lambda cold-start. If we move to Terraform-managed
  Neon, swap in the `kislerdm/neon` provider and the SSM parameter
  becomes a Neon-output reference instead of a TF input.
- **No GitHub OIDC role yet.** Apply with local AWS creds. CI/CD step is
  Phase 4 (see project notes) — adds an OIDC trust + role for GH Actions.
- **No `terraform test` blocks.** Modules pass plan/apply but lack unit
  tests. Worth adding before prod activation.
- **CSP report endpoint** lives in the API; CloudFront's response-headers
  policy doesn't enforce CSP yet (the API does it for `/api/*`, the static
  shell will need it added at the CloudFront layer when CSP is finalised).
