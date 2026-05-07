output "state_bucket" {
  description = "S3 bucket holding terraform state for all envs."
  value       = aws_s3_bucket.tfstate.id
}

output "lock_table" {
  description = "DynamoDB table used for state locking."
  value       = aws_dynamodb_table.tflock.id
}
