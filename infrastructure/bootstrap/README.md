# Bootstrap

One-shot Terraform stack that creates the S3 state bucket and DynamoDB lock
table that every other stack uses for its remote backend.

## Why a separate stack?

Chicken-and-egg: every env stack uses an S3 backend, but you can't store
state in a bucket that doesn't exist yet. This stack creates the backend
itself, with **local state**, run once per AWS account.

## Apply

```bash
cd infrastructure/bootstrap
terraform init
terraform apply
```

`terraform.tfstate` lives next to the .tf files — it's gitignored. If you
lose it, re-running `terraform import` against the existing bucket + table
recovers cleanly (the resource names are deterministic from `name_prefix`).

## What it creates

| Resource              | Name                    |
| --------------------- | ----------------------- |
| S3 bucket             | `seyva-stokvel-tfstate` |
| S3 bucket versioning  | enabled                 |
| S3 server-side encryption | AES256              |
| S3 public access block | full lockdown          |
| DynamoDB table        | `seyva-stokvel-tflock`  |
| DynamoDB PITR         | enabled                 |

After this applies, each env's `backend.tf` points at this bucket and
DynamoDB table — `terraform init` in `envs/dev/` (or `envs/prod/`) writes
per-env state into it.
