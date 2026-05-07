variable "name" {
  description = "SSM parameter path. Conventionally /<name_prefix>/<secret-name>, e.g. /seyva-dev/database-url."
  type        = string

  validation {
    condition     = var.name == null || (length(var.name) > 1 && startswith(var.name, "/"))
    error_message = "Parameter name must start with / and be longer than 1 char. AWS rejects further violations at apply time."
  }
}

variable "description" {
  description = "Human-readable description of what this secret is."
  type        = string
}

variable "value" {
  description = "Secret value. Marked sensitive — do not log."
  type        = string
  sensitive   = true
}

variable "tags" {
  description = "Tags applied to the parameter. Merged with provider default_tags."
  type        = map(string)
  default     = {}
}
