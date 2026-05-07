variable "name_prefix" {
  description = "Prefix for resource names. Conventionally <project>-<env>, e.g. seyva-dev."
  type        = string

  validation {
    condition     = var.name_prefix == null || can(regex("^[a-z][a-z0-9-]{2,32}$", var.name_prefix))
    error_message = "name_prefix must be lowercase, start with a letter, 3-33 chars."
  }
}

variable "domain_fqdn" {
  description = "Fully-qualified domain name for the site, e.g. seyva.daniellourie.me."
  type        = string
}

variable "hosted_zone_name" {
  description = "Route53 hosted zone the FQDN belongs to, e.g. daniellourie.me."
  type        = string
}

variable "price_class" {
  description = "CloudFront price class. PriceClass_100 = NA+EU only (cheapest)."
  type        = string
  default     = "PriceClass_100"

  validation {
    condition     = contains(["PriceClass_100", "PriceClass_200", "PriceClass_All"], var.price_class)
    error_message = "Must be PriceClass_100 / PriceClass_200 / PriceClass_All."
  }
}

variable "tags" {
  description = "Tags merged onto every resource."
  type        = map(string)
  default     = {}
}
