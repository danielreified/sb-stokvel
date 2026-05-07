# Module: static-site

Static PWA hosting: S3 (private, OAC-restricted) behind CloudFront, with
ACM cert in us-east-1, Route53 alias, and PWA-aware cache behaviors.

## Why a single module

The S3 + CloudFront + ACM + R53 + cache-policies + OAC chain is one
indivisible unit: changing any of them in isolation produces a broken
deployment. Wrapping them in one module enforces consistency between dev
and prod and gives one set of inputs/outputs to reason about.

## What it sets up

- S3 bucket, versioned, encrypted, public access blocked.
- CloudFront Origin Access Control — only CloudFront can read S3.
- ACM cert in **us-east-1** (CloudFront requirement). DNS validation via
  Route53 records in the supplied hosted zone.
- CloudFront distribution with split cache behaviors:
  - `/assets/*` (Vite content-hashed) → 1-year immutable.
  - `/sw.js`, `/manifest.webmanifest`, default → no-cache.
- SPA fallback: 403/404 → `/index.html` with status 200, so deep links
  like `/dashboard` work after refresh.
- Response-headers policy: HSTS, X-Content-Type-Options, X-Frame-Options,
  Referrer-Policy. Applied to every response.
- Route53 A + AAAA aliases for the FQDN.

## Why split cache behaviors instead of relying on origin headers

Belt-and-braces. CLAUDE.md mandates `Cache-Control: no-cache` on
`index.html` + `sw.js` at the origin. CloudFront cache policies are the
second layer that catches mistakes at the origin (a misconfigured S3
metadata, a build script that forgets the header). Caching `sw.js` for
even a minute is the classic PWA-update-blackhole bug; we belt this.

## Required provider alias

This module needs `aws.us_east_1` because CloudFront ACM certs **must**
live in us-east-1, even when the rest of the stack is in another region.
The caller passes:

```hcl
module "site" {
  source = "../../modules/static-site"

  providers = {
    aws.us_east_1 = aws.us_east_1
  }

  ...
}
```

If your deploy region already is us-east-1, alias the default provider
to itself:

```hcl
provider "aws" {
  alias  = "us_east_1"
  region = "us-east-1"
}
```

## Inputs

| Name             | Type   | Default          | Description                                 |
| ---------------- | ------ | ---------------- | ------------------------------------------- |
| name_prefix      | string | (required)       | `<project>-<env>` prefix for resources      |
| domain_fqdn      | string | (required)       | e.g. `seyva.daniellourie.me`                |
| hosted_zone_name | string | (required)       | e.g. `daniellourie.me`                      |
| price_class      | string | `PriceClass_100` | NA+EU only; cheapest                        |
| tags             | map    | `{}`             | Merged onto every resource                  |

## Outputs

| Name                     | Description                                |
| ------------------------ | ------------------------------------------ |
| bucket_name              | Upload target for `aws s3 sync dist/ ...`  |
| bucket_arn               | For external IAM policies if needed        |
| distribution_id          | For `aws cloudfront create-invalidation`   |
| distribution_domain_name | Debug-only `*.cloudfront.net`              |
| site_url                 | `https://<fqdn>`                           |
