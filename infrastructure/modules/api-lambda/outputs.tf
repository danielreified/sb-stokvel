output "function_name" {
  description = "Lambda function name. CI's deploy script targets this with update-function-code."
  value       = aws_lambda_function.api.function_name
}

output "function_arn" {
  description = "Lambda function ARN."
  value       = aws_lambda_function.api.arn
}

output "artifacts_bucket" {
  description = "S3 bucket Lambda zips are uploaded to. CI references via terraform output."
  value       = aws_s3_bucket.artifacts.id
}

output "artifact_key" {
  description = "S3 key the Lambda reads from. Stable across deploys; the object content changes."
  value       = local.artifact_key
}

output "api_url" {
  description = "Public HTTPS URL of the API."
  value       = "https://${var.domain_fqdn}"
}

output "api_gateway_id" {
  description = "API Gateway HTTP API ID. Useful for log-querying and console deep-links."
  value       = aws_apigatewayv2_api.api.id
}

output "log_group_name" {
  description = "CloudWatch log group. Tail with: aws logs tail <name> --follow"
  value       = aws_cloudwatch_log_group.lambda.name
}
