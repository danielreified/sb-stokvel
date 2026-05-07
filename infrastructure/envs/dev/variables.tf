variable "environment" {
  description = "Deployment environment label."
  type        = string

  validation {
    condition     = contains(["dev", "prod"], var.environment)
    error_message = "Environment must be dev or prod."
  }
}

variable "name_prefix" {
  description = "Resource name prefix, e.g. seyva-dev."
  type        = string
}

variable "apex_domain" {
  description = "Route53 hosted zone name (apex)."
  type        = string
}

variable "viewer_subdomain" {
  description = "PWA subdomain (without apex)."
  type        = string
}

variable "api_subdomain" {
  description = "API subdomain (without apex)."
  type        = string
}

variable "database_url" {
  description = "Neon Postgres connection string. Set via TF_VAR_database_url, never committed."
  type        = string
  sensitive   = true
}
