# Re-exported so CI / scripts can read everything via `terragrunt output`
# from this single stack root.

output "site_url" {
  description = "Public PWA URL."
  value       = module.site.site_url
}

output "site_bucket" {
  description = "S3 bucket for `aws s3 sync apps/stokvel-app/dist/ s3://...`"
  value       = module.site.bucket_name
}

output "site_distribution_id" {
  description = "CloudFront distribution. Invalidate index.html + sw.js after each deploy."
  value       = module.site.distribution_id
}

output "api_url" {
  description = "Public API URL."
  value       = module.api.api_url
}

output "api_function_name" {
  description = "Lambda function name. Target of `aws lambda update-function-code`."
  value       = module.api.function_name
}

output "api_artifacts_bucket" {
  description = "S3 bucket where the Lambda zip lands."
  value       = module.api.artifacts_bucket
}

output "api_artifact_key" {
  description = "S3 key for the Lambda zip."
  value       = module.api.artifact_key
}

output "api_log_group" {
  description = "CloudWatch log group for the Lambda."
  value       = module.api.log_group_name
}
