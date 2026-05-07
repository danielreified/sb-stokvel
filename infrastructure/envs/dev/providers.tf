provider "aws" {
  region = "us-east-1"

  default_tags {
    tags = {
      Project   = "seyva-stokvel"
      ManagedBy = "terraform"
    }
  }
}

# Aliased provider for resources that *must* live in us-east-1, even when
# the rest of the stack might move to another region one day. The
# static-site module's ACM cert is the only consumer right now (CloudFront
# requires its cert to be in us-east-1). Today both providers point at the
# same region, but the alias keeps the seam intact.
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
