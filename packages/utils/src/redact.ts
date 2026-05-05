/**
 * Denylist of field names whose values must always be redacted from logs.
 * Extend here if new sensitive fields are introduced.
 */
const SENSITIVE_FIELD_NAMES = new Set([
  'pin',
  'password',
  'token',
  'key',
  'encryptionKey',
  'sessionKey',
  'aesKey',
  'dek',
  'Authorization',
  'authorization',
  'Cookie',
  'cookie',
  'set-cookie',
]);

/** Matches base64ish strings ≥32 bytes (potential keys/tokens regardless of field name). */
const BASE64_PATTERN = /^[A-Za-z0-9+/=_-]{43,}$/;

/** Matches SA account numbers: 10–11 digits with optional spaces. */
const SA_ACCOUNT_PATTERN = /^\d{4,6}\s?\d{3,6}\s?\d{0,4}$/;

function isSensitiveValue(value: unknown): boolean {
  if (typeof value !== 'string') return false;
  return BASE64_PATTERN.test(value) || SA_ACCOUNT_PATTERN.test(value);
}

const REDACTED = '[REDACTED]';

/** Deep-clone an object with sensitive fields replaced by "[REDACTED]". */
export function redact<T>(input: T): T {
  if (input === null || typeof input !== 'object') return input;

  if (Array.isArray(input)) {
    return input.map(redact) as unknown as T;
  }

  const result: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(input as Record<string, unknown>)) {
    if (SENSITIVE_FIELD_NAMES.has(key)) {
      result[key] = REDACTED;
    } else if (isSensitiveValue(value)) {
      result[key] = REDACTED;
    } else if (value !== null && typeof value === 'object') {
      result[key] = redact(value);
    } else {
      result[key] = value;
    }
  }
  return result as T;
}
