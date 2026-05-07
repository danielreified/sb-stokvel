variable "name_prefix" {
  description = "Prefix for resource names. Conventionally <project>-<env>, e.g. seyva-dev."
  type        = string

  validation {
    condition     = var.name_prefix == null || can(regex("^[a-z][a-z0-9-]{2,32}$", var.name_prefix))
    error_message = "name_prefix must be lowercase, start with a letter, 3-33 chars."
  }
}

variable "domain_fqdn" {
  description = "Fully-qualified domain name for the API, e.g. api.seyva.daniellourie.me."
  type        = string
}

variable "hosted_zone_name" {
  description = "Route53 hosted zone the FQDN belongs to, e.g. daniellourie.me."
  type        = string
}

variable "viewer_origin" {
  description = "Origin URL of the PWA (https://<fqdn>). Used for the API's CORS allow-list."
  type        = string
}

variable "memory_size_mb" {
  description = "Lambda memory. CPU scales with memory — 512MB is fine for an in-memory cold path."
  type        = number
  default     = 512

  validation {
    condition     = var.memory_size_mb >= 128 && var.memory_size_mb <= 10240
    error_message = "Lambda memory must be between 128 and 10240 MB."
  }
}

variable "timeout_seconds" {
  description = "Lambda execution timeout. API Gateway HTTP API caps at 30s anyway."
  type        = number
  default     = 30
}

variable "log_retention_days" {
  description = "CloudWatch log retention. 30 days = banking compliance comfortable, cheap."
  type        = number
  default     = 30

  validation {
    condition     = contains([1, 3, 5, 7, 14, 30, 60, 90, 120, 150, 180, 365, 400, 545, 731, 1827, 3653], var.log_retention_days)
    error_message = "Must be a CloudWatch-allowed retention value."
  }
}

variable "environment_variables" {
  description = "Non-secret env vars merged into the Lambda's environment block."
  type        = map(string)
  default     = {}
}

variable "ssm_secrets" {
  description = <<-EOT
    Map of secret env-var names to the SSM SecureString parameter that holds
    the value. The Lambda's IAM role gets ssm:GetParameter on each ARN. The
    Lambda receives an env var <ENV_VAR_NAME>_PARAM = <ssm path> at deploy
    time, and the cold-start hook in lib/secrets.ts resolves these to actual
    process.env[ENV_VAR_NAME] values before the Hono app starts.

    Example:
      ssm_secrets = {
        DATABASE_URL = {
          name = module.database_url_secret.name
          arn  = module.database_url_secret.arn
        }
      }
  EOT
  type = map(object({
    name = string
    arn  = string
  }))
  default = {}
}

variable "tags" {
  description = "Tags merged onto every resource."
  type        = map(string)
  default     = {}
}
