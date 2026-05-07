terraform {
  backend "s3" {
    bucket         = "seyva-stokvel-tfstate"
    key            = "envs/prod/terraform.tfstate"
    region         = "us-east-1"
    dynamodb_table = "seyva-stokvel-tflock"
    encrypt        = true
  }
}
