# Env-specific locals. Read in this env's terragrunt.hcl and forwarded to
# the underlying terraform stack as inputs.

locals {
  environment      = "dev"
  name_prefix      = "seyva-dev"
  apex_domain      = "daniellourie.me"
  viewer_subdomain = "dev.seyva"
  api_subdomain    = "api.dev.seyva"
}
