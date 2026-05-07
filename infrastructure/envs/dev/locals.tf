locals {
  viewer_fqdn   = "${var.viewer_subdomain}.${var.apex_domain}"
  api_fqdn      = "${var.api_subdomain}.${var.apex_domain}"
  viewer_origin = "https://${local.viewer_fqdn}"

  common_tags = {
    Environment = var.environment
  }
}
