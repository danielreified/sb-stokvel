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
