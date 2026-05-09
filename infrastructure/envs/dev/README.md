# envs/dev

Dev environment for `seyva-stokvel`. Resources land at `seyva-dev-*`,
the PWA at `https://dev.seyva.daniellourie.me`, the API at
`https://api.dev.seyva.daniellourie.me`.

## Apply

```bash
# Required: bootstrap state backend has been applied (see ../../bootstrap)
# Required: AWS creds in env (e.g. via aws-vault, AWS_PROFILE, or OIDC role)

# Set the Neon URL (never commit). Get it from the Neon dashboard.
export TF_VAR_database_url='postgres://...'

cd infrastructure/envs/dev
terraform init
terraform plan
terraform apply
```

## What gets created

| Type             | Where                                       |
| ---------------- | ------------------------------------------- |
| SSM SecureString | `/seyva-dev/database-url`                   |
| Lambda           | `seyva-dev-api`                             |
| API Gateway      | HTTP API, custom domain `api.dev.seyva.…`   |
| ACM cert (regional) | `api.dev.seyva.daniellourie.me`          |
| ACM cert (us-east-1) | `dev.seyva.daniellourie.me`             |
| S3 bucket (artifacts) | `seyva-dev-artifacts`                  |
| S3 bucket (PWA)  | `seyva-dev-pwa`                             |
| CloudFront dist  | aliased at `dev.seyva.daniellourie.me`      |
| Route53 records  | A/AAAA for both FQDNs                       |
| CloudWatch logs  | `/aws/lambda/seyva-dev-api`, 30d retention  |

After first apply, the Lambda runs the placeholder zip (returns 503).
Run `scripts/deploy-api.sh dev` to push the real Hono build.
