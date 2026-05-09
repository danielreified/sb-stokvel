# Mirror of envs/dev/variables.tf so the stack can accept the same inputs
# without erroring on undeclared variables. Add the same `database_url`
# variable (sensitive) when you copy main.tf from dev.

variable "environment" {
  description = "Deployment environment label."
  type        = string
}

variable "name_prefix" {
  description = "Resource name prefix."
  type        = string
}

variable "apex_domain" {
  description = "Route53 hosted zone name (apex)."
  type        = string
}

variable "viewer_subdomain" {
  description = "PWA subdomain."
  type        = string
}

variable "api_subdomain" {
  description = "API subdomain."
  type        = string
}
