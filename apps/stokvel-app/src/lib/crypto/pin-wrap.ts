/**
 * PIN-wrapped session key.
 *
 * The server-issued AES-256 session key (used to encrypt persisted React Query
 * cache entries) is itself wrapped with a key derived from the user's PIN
 * via PBKDF2. Only the wrapped blob lives on disk — the raw key is never
 * written to IndexedDB. On idle-lock the in-memory key is zeroed; the user
 * re-enters their PIN to unwrap the blob and restore the key, all without
 * a server roundtrip (works offline).
 *
 * Tradeoff: a 4-digit PIN is only ~10k combinations. PBKDF2 with 600k
 * iterations slows offline brute-force but doesn't defeat dedicated
 * attackers if the encrypted blob leaks. Production hardening would bind
 * the wrapping key to a device-secure-enclave secret (WebAuthn / passkey).
 *
 * reason: the `as BufferSource` casts below are required because Web Crypto's
 * lib.dom.d.ts typings don't narrowly accept `Uint8Array<ArrayBufferLike>`
 * (the new generic form) in BufferSource positions, even though it's
 * compatible at runtime. Bandaid until TS lib catches up.
 */

const PBKDF2_ITERATIONS = 600_000;
const SALT_LENGTH = 16;
const IV_LENGTH = 12;

const bytesToBase64 = (bytes: Uint8Array): string => btoa(String.fromCharCode(...bytes));

const base64ToBytes = (b64: string): Uint8Array =>
  Uint8Array.from(atob(b64), (c) => c.charCodeAt(0));

async function deriveWrappingKey(pin: string, salt: Uint8Array): Promise<CryptoKey> {
  const pinBuf = new TextEncoder().encode(pin);
  const baseKey = await crypto.subtle.importKey('raw', pinBuf as BufferSource, 'PBKDF2', false, [
    'deriveKey',
  ]);
  return crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: salt as BufferSource,
      iterations: PBKDF2_ITERATIONS,
      hash: 'SHA-256',
    },
    baseKey,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt'],
  );
}

export interface WrappedKeyBlob {
  wrapped: string;
  salt: string;
}

/** Wrap raw session-key bytes with a PIN-derived key. */
export async function wrapSessionKey(
  pin: string,
  sessionKeyBytes: Uint8Array,
): Promise<WrappedKeyBlob> {
  const salt = crypto.getRandomValues(new Uint8Array(SALT_LENGTH));
  const wrappingKey = await deriveWrappingKey(pin, salt);
  const iv = crypto.getRandomValues(new Uint8Array(IV_LENGTH));
  const ciphertext = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv: iv as BufferSource },
    wrappingKey,
    sessionKeyBytes as BufferSource,
  );
  const combined = new Uint8Array(iv.byteLength + ciphertext.byteLength);
  combined.set(iv);
  combined.set(new Uint8Array(ciphertext), iv.byteLength);
  return { wrapped: bytesToBase64(combined), salt: bytesToBase64(salt) };
}

/**
 * Unwrap with the same PIN that wrapped it. Returns the raw session-key
 * bytes, or `null` if the PIN is wrong / blob is tampered (auth tag fails).
 * Caller imports the bytes as a CryptoKey before using.
 */
export async function unwrapSessionKey(
  pin: string,
  blob: WrappedKeyBlob,
): Promise<Uint8Array | null> {
  try {
    const saltBytes = base64ToBytes(blob.salt);
    const combined = base64ToBytes(blob.wrapped);
    const iv = combined.slice(0, IV_LENGTH);
    const ciphertext = combined.slice(IV_LENGTH);
    const wrappingKey = await deriveWrappingKey(pin, saltBytes);
    const plaintext = await crypto.subtle.decrypt(
      { name: 'AES-GCM', iv: iv as BufferSource },
      wrappingKey,
      ciphertext as BufferSource,
    );
    return new Uint8Array(plaintext);
  } catch {
    return null;
  }
}

/** Decode a base64 session-key string (from the BFF) into raw bytes. */
export const decodeSessionKey = (base64Key: string): Uint8Array => base64ToBytes(base64Key);
