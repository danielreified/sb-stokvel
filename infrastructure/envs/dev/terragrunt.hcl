include "root" {
  path = find_in_parent_folders("terragrunt.hcl")
}

locals {
  env = read_terragrunt_config("env.hcl").locals
}

# Inputs handed to this stack's variables. Sensitive values come from the
# environment so they never land in the repo.
#
#   export TF_VAR_database_url='postgres://...'
#
# The TF_VAR_ prefix is Terraform's standard env-var binding, not a
# Terragrunt feature.
inputs = {
  environment      = local.env.environment
  name_prefix      = local.env.name_prefix
  apex_domain      = local.env.apex_domain
  viewer_subdomain = local.env.viewer_subdomain
  api_subdomain    = local.env.api_subdomain
}
