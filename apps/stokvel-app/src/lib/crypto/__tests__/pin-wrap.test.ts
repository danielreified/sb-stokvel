import { describe, expect, it } from 'bun:test';
import { decodeSessionKey, unwrapSessionKey, wrapSessionKey } from '../pin-wrap.js';

// 32 random bytes, deterministic for the test
const KEY_BYTES = new Uint8Array(32).map((_, i) => (i * 7 + 13) & 0xff);

describe('pin-wrap', () => {
  describe('decodeSessionKey', () => {
    it('decodes a base64 string into bytes', () => {
      // 32 bytes → 44 base64 chars (padded)
      const b64 = btoa(String.fromCharCode(...KEY_BYTES));
      const decoded = decodeSessionKey(b64);
      expect(decoded.length).toBe(32);
      expect(Array.from(decoded)).toEqual(Array.from(KEY_BYTES));
    });
  });

  describe('wrapSessionKey + unwrapSessionKey roundtrip', () => {
    it('unwraps with the same PIN to recover the original bytes', async () => {
      const blob = await wrapSessionKey('1234', KEY_BYTES);
      const recovered = await unwrapSessionKey('1234', blob);
      expect(recovered).not.toBeNull();
      expect(Array.from(recovered as Uint8Array)).toEqual(Array.from(KEY_BYTES));
    });

    it('returns null when the wrong PIN is used', async () => {
      const blob = await wrapSessionKey('1234', KEY_BYTES);
      const recovered = await unwrapSessionKey('0000', blob);
      expect(recovered).toBeNull();
    });

    it('returns null when the wrapped blob is tampered', async () => {
      const blob = await wrapSessionKey('1234', KEY_BYTES);
      // Flip a byte in the wrapped ciphertext
      const bytes = Uint8Array.from(atob(blob.wrapped), (c) => c.charCodeAt(0));
      bytes[20] = bytes[20] ^ 0xff;
      const tampered = { ...blob, wrapped: btoa(String.fromCharCode(...bytes)) };
      const recovered = await unwrapSessionKey('1234', tampered);
      expect(recovered).toBeNull();
    });

    it('produces a different blob on each wrap (random salt + IV)', async () => {
      const a = await wrapSessionKey('1234', KEY_BYTES);
      const b = await wrapSessionKey('1234', KEY_BYTES);
      expect(a.wrapped).not.toBe(b.wrapped);
      expect(a.salt).not.toBe(b.salt);
    });

    it('returns null when the salt has been swapped', async () => {
      const a = await wrapSessionKey('1234', KEY_BYTES);
      const b = await wrapSessionKey('1234', KEY_BYTES);
      // Use a's wrapped ciphertext with b's salt — wrapping key won't match
      const recovered = await unwrapSessionKey('1234', { wrapped: a.wrapped, salt: b.salt });
      expect(recovered).toBeNull();
    });
  });
});
