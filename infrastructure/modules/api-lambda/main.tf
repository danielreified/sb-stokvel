data "aws_route53_zone" "apex" {
  name         = var.hosted_zone_name
  private_zone = false
}

# ---------------------------------------------------------------------------
# Artifacts bucket — Lambda zip lives here. Old versions expire after 30 days.
# ---------------------------------------------------------------------------

resource "aws_s3_bucket" "artifacts" {
  bucket        = local.artifacts_bucket
  force_destroy = true
  tags          = var.tags
}

resource "aws_s3_bucket_versioning" "artifacts" {
  bucket = aws_s3_bucket.artifacts.id
  versioning_configuration {
    status = "Enabled"
  }
}

resource "aws_s3_bucket_server_side_encryption_configuration" "artifacts" {
  bucket = aws_s3_bucket.artifacts.id
  rule {
    apply_server_side_encryption_by_default {
      sse_algorithm = "AES256"
    }
  }
}

resource "aws_s3_bucket_public_access_block" "artifacts" {
  bucket                  = aws_s3_bucket.artifacts.id
  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

resource "aws_s3_bucket_lifecycle_configuration" "artifacts" {
  bucket = aws_s3_bucket.artifacts.id

  rule {
    id     = "expire-old-versions"
    status = "Enabled"
    filter {}

    noncurrent_version_expiration {
      noncurrent_days = 30
    }
  }
}

# ---------------------------------------------------------------------------
# Placeholder zip — Lambda rejects creation without a valid archive. Real
# code is uploaded by scripts/deploy-api.sh; lifecycle.ignore_changes on
# s3_key prevents Terraform from clobbering it on subsequent applies.
# ---------------------------------------------------------------------------

data "archive_file" "placeholder" {
  type        = "zip"
  output_path = "${path.module}/.terraform-tmp/api-placeholder.zip"

  source {
    filename = "lambda.js"
    content  = <<-EOT
      exports.handler = async () => ({
        statusCode: 503,
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          error: "not_deployed",
          message: "Lambda code not deployed yet — run scripts/deploy-api.sh"
        }),
      });
    EOT
  }
}

resource "aws_s3_object" "placeholder" {
  bucket = aws_s3_bucket.artifacts.id
  key    = local.artifact_key
  source = data.archive_file.placeholder.output_path
  etag   = data.archive_file.placeholder.output_md5

  lifecycle {
    ignore_changes = [source, etag]
  }
}

# ---------------------------------------------------------------------------
# IAM role for the Lambda
# ---------------------------------------------------------------------------

data "aws_iam_policy_document" "assume" {
  statement {
    actions = ["sts:AssumeRole"]
    principals {
      type        = "Service"
      identifiers = ["lambda.amazonaws.com"]
    }
  }
}

resource "aws_iam_role" "lambda" {
  name               = "${local.function_name}-role"
  assume_role_policy = data.aws_iam_policy_document.assume.json
  tags               = var.tags
}

resource "aws_iam_role_policy_attachment" "basic_logs" {
  role       = aws_iam_role.lambda.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole"
}

# Inline policy for SSM SecureString reads. Only created if there are
# actually any secrets — otherwise an empty statement would fail validate.
data "aws_iam_policy_document" "ssm_read" {
  count = length(var.ssm_secrets) > 0 ? 1 : 0

  statement {
    sid       = "ReadSecrets"
    effect    = "Allow"
    actions   = ["ssm:GetParameter", "ssm:GetParameters"]
    resources = [for s in var.ssm_secrets : s.arn]
  }
}

resource "aws_iam_role_policy" "ssm_read" {
  count  = length(var.ssm_secrets) > 0 ? 1 : 0
  role   = aws_iam_role.lambda.id
  policy = data.aws_iam_policy_document.ssm_read[0].json
}

# ---------------------------------------------------------------------------
# CloudWatch log group — must exist before the Lambda creates one with
# default (never-expire) retention.
# ---------------------------------------------------------------------------

resource "aws_cloudwatch_log_group" "lambda" {
  name              = local.log_group_name
  retention_in_days = var.log_retention_days
  tags              = var.tags
}

# ---------------------------------------------------------------------------
# Lambda function
# ---------------------------------------------------------------------------

resource "aws_lambda_function" "api" {
  function_name = local.function_name
  role          = aws_iam_role.lambda.arn

  s3_bucket = aws_s3_bucket.artifacts.id
  s3_key    = local.artifact_key

  runtime       = "nodejs22.x"
  handler       = "lambda.handler"
  architectures = ["arm64"]
  memory_size   = var.memory_size_mb
  timeout       = var.timeout_seconds

  environment {
    variables = local.effective_env_vars
  }

  depends_on = [
    aws_s3_object.placeholder,
    aws_cloudwatch_log_group.lambda,
    aws_iam_role_policy_attachment.basic_logs,
  ]

  # CI's deploy script overwrites the artifact in S3 then calls
  # update-function-code. Without ignore_changes here, every Terraform apply
  # would revert the Lambda back to the placeholder zip's hash.
  lifecycle {
    ignore_changes = [s3_key]
  }

  tags = var.tags
}
