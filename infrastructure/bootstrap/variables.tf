variable "region" {
  description = "AWS region for the state bucket and lock table."
  type        = string
  default     = "us-east-1"
}

variable "name_prefix" {
  description = "Resource name prefix. State bucket = <prefix>-tfstate, lock table = <prefix>-tflock."
  type        = string
  default     = "seyva-stokvel"

  validation {
    condition     = can(regex("^[a-z][a-z0-9-]{2,32}$", var.name_prefix))
    error_message = "name_prefix must be lowercase, start with a letter, and be 3-33 characters."
  }
}
