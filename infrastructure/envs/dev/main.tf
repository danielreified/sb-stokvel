###############################################################################
# Dev stack — wires modules together for the seyva-dev environment.
#
# Apply order is implicit through references:
#   secrets → api → site
#
# Site doesn't depend on api, but lives in the same stack so that a single
# `terraform apply` brings up the whole thing.
###############################################################################

# ---- Secrets (SSM SecureString, one module call per secret) ---------------

module "secret_database_url" {
  source = "../../modules/ssm-secret"

  name        = "/${var.name_prefix}/database-url"
  description = "Neon Postgres connection string for the BFF Lambda"
  value       = var.database_url
  tags        = local.common_tags
}

# ---- API (Lambda + API Gateway + custom domain) ---------------------------

module "api" {
  source = "../../modules/api-lambda"

  name_prefix      = var.name_prefix
  domain_fqdn      = local.api_fqdn
  hosted_zone_name = var.apex_domain
  viewer_origin    = local.viewer_origin

  environment_variables = {
    NODE_ENV = "production"
  }

  ssm_secrets = {
    DATABASE_URL = {
      name = module.secret_database_url.name
      arn  = module.secret_database_url.arn
    }
  }

  tags = local.common_tags
}

# ---- Static site (S3 + CloudFront + ACM us-east-1) ------------------------

module "site" {
  source = "../../modules/static-site"

  providers = {
    aws.us_east_1 = aws.us_east_1
  }

  name_prefix      = var.name_prefix
  domain_fqdn      = local.viewer_fqdn
  hosted_zone_name = var.apex_domain

  # PWA fetches the BFF cross-subdomain — connect-src must whitelist it.
  csp_connect_src = ["https://${local.api_fqdn}"]

  # CSP report-uri lives on the BFF; cross-origin reports are fine.
  csp_report_uri = "https://${local.api_fqdn}/api/csp-report"

  tags = local.common_tags
}
