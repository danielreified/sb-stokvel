output "name" {
  description = "Parameter name (path). The Lambda receives this as an env var and resolves at cold-start."
  value       = aws_ssm_parameter.this.name
}

output "arn" {
  description = "Parameter ARN. Used by the consuming role's IAM policy for ssm:GetParameter."
  value       = aws_ssm_parameter.this.arn
}
