###############################################################################
# Prod placeholder.
#
# Intentionally minimal — a "real" prod stack would copy envs/dev/*.tf in
# wholesale and apply against this env. Until prod is actually wanted, this
# folder exists only to reserve the state-key namespace and prove the
# multi-env shape works.
#
# Promotion checklist when activating prod:
#   1. Copy envs/dev/{terraform.tf,variables.tf,locals.tf,main.tf,outputs.tf}
#      into envs/prod/.
#   2. Re-export TF_VAR_database_url with the prod Neon connection string.
#   3. terragrunt init && terragrunt plan && terragrunt apply.
###############################################################################

include "root" {
  path = find_in_parent_folders("terragrunt.hcl")
}

locals {
  env = read_terragrunt_config("env.hcl").locals
}

inputs = {
  environment      = local.env.environment
  name_prefix      = local.env.name_prefix
  apex_domain      = local.env.apex_domain
  viewer_subdomain = local.env.viewer_subdomain
  api_subdomain    = local.env.api_subdomain
}
