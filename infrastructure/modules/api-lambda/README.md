# Module: api-lambda

Hono BFF on AWS Lambda behind API Gateway HTTP API, with a custom domain
and ACM cert. Sized for the demo (512MB, 30s, arm64, node22) but the
defaults are tunable per env.

## What it sets up

- **Artifacts S3 bucket** with versioning + lifecycle (old zips expire 30d).
- **Placeholder zip** that returns 503 — keeps `terraform apply` working
  on a clean repo before any Lambda code has been built.
- **IAM role** with basic CloudWatch logs + (conditional) `ssm:GetParameter`
  on supplied secret ARNs.
- **CloudWatch log group** with explicit retention (defaults to 30d).
- **Lambda function** (node22, arm64) with `lifecycle.ignore_changes = [s3_key]`
  so CI's `update-function-code` isn't fought by the next `terraform apply`.
- **API Gateway HTTP API v2** with `$default` route — Hono's router handles
  dispatch inside the Lambda. CORS configured against `viewer_origin`.
- **Regional ACM cert** + DNS validation + Route53 alias.

## Cold-start secret pattern

The `ssm_secrets` input is the seam between Terraform and the Lambda's
runtime secret-loading. For each entry like:

```hcl
ssm_secrets = {
  DATABASE_URL = { name = "/seyva-dev/database-url", arn = "..." }
}
```

The module:
1. Adds an `ssm:GetParameter` IAM statement on the ARN.
2. Sets `DATABASE_URL_PARAM = "/seyva-dev/database-url"` as a Lambda env var.

The Lambda's bootstrap (`apps/stokvel-api/src/lib/secrets.ts`) reads every
`*_PARAM` env var, fetches the corresponding SSM SecureString, and writes
the value to `process.env[<unsuffixed name>]` before importing the Hono app.

This pattern is intentional:
- Real secret values **never** appear in Lambda console env vars (only the
  parameter names do).
- Rotating a secret = `aws ssm put-parameter` + force a Lambda cold-start;
  no redeploy.
- Unit tests run against a real DB locally without any of this AWS code path.

## Why HTTP API v2 over REST API v1

- ~70% cheaper at our volumes
- Lower invocation latency
- We don't need REST's request-validation or API-key features — Hono +
  Zod handles validation inside the Lambda.

## Inputs

| Name                  | Type   | Default | Description                                      |
| --------------------- | ------ | ------- | ------------------------------------------------ |
| name_prefix           | string | (req)   | `<project>-<env>` resource prefix                |
| domain_fqdn           | string | (req)   | e.g. `api.seyva.daniellourie.me`                 |
| hosted_zone_name      | string | (req)   | Route53 zone, e.g. `daniellourie.me`             |
| viewer_origin         | string | (req)   | PWA origin for CORS, e.g. `https://seyva.daniellourie.me` |
| memory_size_mb        | number | 512     | Lambda memory (CPU scales with this)             |
| timeout_seconds       | number | 30      | Capped at 30 by HTTP API anyway                  |
| log_retention_days    | number | 30      | CloudWatch log retention                         |
| environment_variables | map    | `{}`    | Non-secret env vars                              |
| ssm_secrets           | map    | `{}`    | Map of `ENV_VAR` → `{ name, arn }` SSM pointers  |
| tags                  | map    | `{}`    | Merged onto every resource                       |

## Outputs

| Name             | Description                                               |
| ---------------- | --------------------------------------------------------- |
| function_name    | Target for `aws lambda update-function-code`              |
| function_arn     | Lambda ARN                                                |
| artifacts_bucket | Upload target for the built zip                           |
| artifact_key     | S3 key the Lambda reads (stable across deploys)           |
| api_url          | Public `https://...` URL                                  |
| api_gateway_id   | HTTP API ID for console deep-links                        |
| log_group_name   | For `aws logs tail`                                       |
