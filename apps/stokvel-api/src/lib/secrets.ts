import { GetParametersCommand, SSMClient } from '@aws-sdk/client-ssm';

/**
 * Cold-start helper that lifts SSM SecureString values into `process.env`.
 *
 * Called from `lambda.ts` at module load (top-level await). After this
 * runs, code that reads `process.env.DATABASE_URL` just works — same
 * shape as the Bun dev path where the value comes from `.env`.
 *
 * Each entry in PARAM_TO_ENV is a (env-var-name-holding-the-SSM-path,
 * env-var-name-the-app-actually-wants) pair. The Terraform `api-lambda`
 * module sets the *_PARAM env vars at deploy time from the `ssm_secrets`
 * input map; this loader resolves them.
 *
 * Skip-if-already-set: if a target env var is already populated (e.g.
 * during `bun test` runs that shouldn't talk to AWS), we don't fetch.
 */

const PARAM_TO_ENV: Record<string, string> = {
  DATABASE_URL_PARAM: 'DATABASE_URL',
};

export async function loadSecretsFromSsm(): Promise<void> {
  const namesToFetch: string[] = [];
  const targetByName: Record<string, string> = {};

  for (const [paramKey, envKey] of Object.entries(PARAM_TO_ENV)) {
    const ssmName = process.env[paramKey];
    if (!ssmName) continue;
    if (process.env[envKey]) continue;
    namesToFetch.push(ssmName);
    targetByName[ssmName] = envKey;
  }

  if (namesToFetch.length === 0) return;

  const ssm = new SSMClient({});
  const res = await ssm.send(
    new GetParametersCommand({ Names: namesToFetch, WithDecryption: true }),
  );

  for (const param of res.Parameters ?? []) {
    if (!param.Name || !param.Value) continue;
    const envKey = targetByName[param.Name];
    if (envKey) process.env[envKey] = param.Value;
  }
}
