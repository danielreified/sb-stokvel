output "bucket_name" {
  description = "S3 bucket holding the built static assets. CI's deploy step uploads dist/ here."
  value       = aws_s3_bucket.site.id
}

output "bucket_arn" {
  description = "S3 bucket ARN."
  value       = aws_s3_bucket.site.arn
}

output "distribution_id" {
  description = "CloudFront distribution ID. CI invalidates index.html + sw.js after each deploy."
  value       = aws_cloudfront_distribution.site.id
}

output "distribution_domain_name" {
  description = "CloudFront distribution default domain (xxxx.cloudfront.net). Useful for debugging DNS issues."
  value       = aws_cloudfront_distribution.site.domain_name
}

output "site_url" {
  description = "Public HTTPS URL for the site."
  value       = "https://${var.domain_fqdn}"
}
