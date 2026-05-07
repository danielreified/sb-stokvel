# envs/prod

Placeholder. The folder exists so the multi-env Terragrunt shape is real
from day one (state key namespacing, env.hcl wiring, providers generation
all work), but no resources are created yet — `main.tf` is empty.

## To activate

1. Copy `envs/dev/main.tf`, `outputs.tf`, `locals.tf` into `envs/prod/`.
2. Add `database_url` to `variables.tf` (with `sensitive = true`).
3. `export TF_VAR_database_url=<prod neon string>`
4. `terragrunt init && terragrunt plan && terragrunt apply`

State will land at
`s3://seyva-stokvel-tfstate/envs/prod/terraform.tfstate` (the path comes
from Terragrunt's `path_relative_to_include()`).
