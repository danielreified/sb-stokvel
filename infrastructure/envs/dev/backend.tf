# Remote state. Bucket + lock table created once by infrastructure/bootstrap.
# Per-env state-key isolation keeps dev and prod separate even though they
# share one bucket.

terraform {
  backend "s3" {
    bucket         = "seyva-stokvel-tfstate"
    key            = "envs/dev/terraform.tfstate"
    region         = "us-east-1"
    dynamodb_table = "seyva-stokvel-tflock"
    encrypt        = true
  }
}
