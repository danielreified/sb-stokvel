# envs/prod

Placeholder. The folder exists so the multi-env shape is real from day
one (state key namespacing, providers, backend wiring all work), but no
resources are created yet — `main.tf` is empty.

## To activate

1. Copy `envs/dev/main.tf`, `outputs.tf`, `locals.tf` into `envs/prod/`.
2. Add `database_url` to `variables.tf` (with `sensitive = true`).
3. `export TF_VAR_database_url=<prod neon string>`
4. `terraform init && terraform plan && terraform apply`

State lands at `s3://seyva-stokvel-tfstate/envs/prod/terraform.tfstate`
(the key is set explicitly in `backend.tf`).
