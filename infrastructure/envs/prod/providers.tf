provider "aws" {
  region = "us-east-1"

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
