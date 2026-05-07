# Module: ssm-secret

Thin wrapper for an SSM SecureString parameter. One module call per secret.

The two-output shape (`name` + `arn`) is what the `api-lambda` module
consumes via its `ssm_secrets` map: the **arn** goes into the Lambda's IAM
policy, the **name** is injected as an environment variable so the Lambda
can fetch the value at cold-start with the AWS SDK.

## Inputs

| Name        | Type   | Required | Description                                      |
| ----------- | ------ | -------- | ------------------------------------------------ |
| name        | string | yes      | Parameter path, e.g. `/seyva-dev/database-url`   |
| description | string | yes      | What this secret is                              |
| value       | string | yes      | Secret value (sensitive)                         |
| tags        | map    | no       | Extra tags merged with provider default_tags     |

## Outputs

| Name | Description                                          |
| ---- | ---------------------------------------------------- |
| name | Parameter name — pass to api-lambda as the env value |
| arn  | Parameter ARN — pass to api-lambda for IAM grant     |

## Usage

```hcl
module "database_url" {
  source = "../../modules/ssm-secret"

  name        = "/${local.name_prefix}/database-url"
  description = "Neon Postgres connection string for the BFF Lambda"
  value       = var.database_url
}
```
