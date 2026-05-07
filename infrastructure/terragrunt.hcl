###############################################################################
# Root Terragrunt config
#
# This file is included by every env's terragrunt.hcl. It does two jobs:
#   1. Configures the shared S3 + DynamoDB remote state backend.
#   2. Generates a provider block (with default_tags) into each env's
#      working directory at apply time.
#
# Per-env config lives in envs/<env>/env.hcl (locals like name_prefix and
# subdomain) and envs/<env>/terragrunt.hcl (which inputs the module wants).
###############################################################################

locals {
  region       = "us-east-1"
  state_bucket = "seyva-stokvel-tfstate"
  lock_table   = "seyva-stokvel-tflock"
}

remote_state {
  backend = "s3"

  generate = {
    path      = "backend.tf"
    if_exists = "overwrite_terragrunt"
  }

  config = {
    bucket         = local.state_bucket
    key            = "${path_relative_to_include()}/terraform.tfstate"
    region         = local.region
    dynamodb_table = local.lock_table
    encrypt        = true
  }
}

# Generate providers.tf into the working dir for each env. We intentionally
# expose two AWS provider configurations:
#
#   - default (alias = none): regional, used for everything
#   - aws.us_east_1:           used by the static-site module for ACM certs,
#                              since CloudFront *requires* its cert to live
#                              in us-east-1 even when the rest of the stack
#                              is elsewhere. For us, deploy region == us-east-1
#                              already, but having the alias makes future
#                              regional moves trivial.
generate "providers" {
  path      = "providers_generated.tf"
  if_exists = "overwrite_terragrunt"
  contents  = <<-EOF
    provider "aws" {
      region = "${local.region}"

      default_tags {
        tags = {
          Project   = "seyva-stokvel"
          ManagedBy = "terraform"
        }
      }
    }

    provider "aws" {
      alias  = "us_east_1"
      region = "us-east-1"

      default_tags {
        tags = {
          Project   = "seyva-stokvel"
          ManagedBy = "terraform"
        }
      }
    }
  EOF
}
