###############################################################################
# tflint config — applies to every directory walked by `tflint --recursive`.
###############################################################################

config {
  format = "compact"
}

plugin "terraform" {
  enabled = true
  preset  = "recommended"
}

plugin "aws" {
  enabled = true
  version = "0.36.0"
  source  = "github.com/terraform-linters/tflint-ruleset-aws"
}

# Stylistic rule we deliberately turn off:
#   `terraform_required_providers` would fire on the env stacks because they
#   declare providers via Terragrunt's `generate` block, not directly. The
#   modules themselves still declare required_providers properly.
rule "terraform_required_providers" {
  enabled = false
}
