locals {
  function_name    = "${var.name_prefix}-api"
  artifacts_bucket = "${var.name_prefix}-artifacts"
  artifact_key     = "api/api.zip"
  log_group_name   = "/aws/lambda/${local.function_name}"

  # Build the env-var map handed to the Lambda. Each ssm_secrets entry adds
  # an <ENV_VAR>_PARAM env var pointing at the SSM parameter name; the
  # cold-start hook fetches values and rewrites process.env.
  ssm_param_env_vars = {
    for env_var_name, secret in var.ssm_secrets :
    "${env_var_name}_PARAM" => secret.name
  }

  effective_env_vars = merge(
    {
      AWS_NODEJS_CONNECTION_REUSE_ENABLED = "1"
      VIEWER_ORIGIN                       = var.viewer_origin
    },
    var.environment_variables,
    local.ssm_param_env_vars,
  )
}
