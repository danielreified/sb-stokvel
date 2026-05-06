import { describe, expect, it } from 'bun:test';
import { decrypt, encrypt, importSessionKey } from '../aes-gcm.js';

// 32-byte AES-256 key, base64-encoded
const TEST_KEY_BASE64 = 'rZK4Z5GvL+Q5tHNXEsiP9D2k7QvP0u3DyxgWNJ1mP7Y=';

async function getKey(): Promise<CryptoKey> {
  return importSessionKey(TEST_KEY_BASE64);
}

describe('aes-gcm', () => {
  describe('importSessionKey', () => {
    it('imports a base64 key as a non-extractable AES-GCM CryptoKey', async () => {
      const key = await getKey();
      expect(key).toBeDefined();
      expect(key.algorithm.name).toBe('AES-GCM');
      expect(key.usages).toContain('encrypt');
      expect(key.usages).toContain('decrypt');
      expect(key.extractable).toBe(false);
    });
  });

  describe('encrypt + decrypt roundtrip', () => {
    it('roundtrips a simple string', async () => {
      const key = await getKey();
      const plaintext = 'Hello, world.';
      const blob = await encrypt(key, plaintext);
      expect(await decrypt(key, blob)).toBe(plaintext);
    });

    it('roundtrips a JSON-serialised object', async () => {
      const key = await getKey();
      const plaintext = JSON.stringify({ amount: 50000, member: 'Nomsa', month: '2026-05' });
      const blob = await encrypt(key, plaintext);
      expect(await decrypt(key, blob)).toBe(plaintext);
    });

    it('roundtrips an empty string', async () => {
      const key = await getKey();
      const blob = await encrypt(key, '');
      expect(await decrypt(key, blob)).toBe('');
    });

    it('roundtrips multibyte UTF-8 (e.g. isiZulu copy)', async () => {
      const key = await getKey();
      const plaintext = 'Imali eyakhelwe phezu kwethemba — ngu Nomsa.';
      const blob = await encrypt(key, plaintext);
      expect(await decrypt(key, blob)).toBe(plaintext);
    });

    it('produces a different ciphertext on each call (random IV)', async () => {
      const key = await getKey();
      const a = await encrypt(key, 'same plaintext');
      const b = await encrypt(key, 'same plaintext');
      expect(a).not.toBe(b);
    });
  });

  describe('decrypt error paths', () => {
    it('throws when ciphertext is tampered', async () => {
      const key = await getKey();
      const blob = await encrypt(key, 'sensitive');
      // Flip a byte in the middle of the ciphertext (after the 12-byte IV)
      const bytes = Uint8Array.from(atob(blob), (c) => c.charCodeAt(0));
      bytes[20] = bytes[20] ^ 0xff;
      const tampered = btoa(String.fromCharCode(...bytes));
      await expect(decrypt(key, tampered)).rejects.toThrow();
    });

    it('throws when decrypted with a different key', async () => {
      const key = await getKey();
      const otherKey = await importSessionKey('AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA=');
      const blob = await encrypt(key, 'sensitive');
      await expect(decrypt(otherKey, blob)).rejects.toThrow();
    });
  });
});
