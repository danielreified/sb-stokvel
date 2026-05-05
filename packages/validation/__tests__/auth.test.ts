import { describe, expect, it } from 'bun:test';
import { LoginSchema } from '../src/auth.js';

describe('LoginSchema', () => {
  describe('phone', () => {
    it('accepts a valid SA mobile number', () => {
      const result = LoginSchema.safeParse({ phone: '+27821000001', pin: '1234' });
      expect(result.success).toBe(true);
    });

    it('rejects a number without the +27 prefix', () => {
      const result = LoginSchema.safeParse({ phone: '0821000001', pin: '1234' });
      expect(result.success).toBe(false);
    });

    it('rejects a number that is too short', () => {
      const result = LoginSchema.safeParse({ phone: '+2782100000', pin: '1234' });
      expect(result.success).toBe(false);
    });

    it('rejects a number that is too long', () => {
      const result = LoginSchema.safeParse({ phone: '+278210000012', pin: '1234' });
      expect(result.success).toBe(false);
    });

    it('rejects letters in the number', () => {
      const result = LoginSchema.safeParse({ phone: '+27821abc001', pin: '1234' });
      expect(result.success).toBe(false);
    });

    it('rejects an empty string', () => {
      const result = LoginSchema.safeParse({ phone: '', pin: '1234' });
      expect(result.success).toBe(false);
    });
  });

  describe('pin', () => {
    it('accepts a valid 4-digit PIN', () => {
      const result = LoginSchema.safeParse({ phone: '+27821000001', pin: '0000' });
      expect(result.success).toBe(true);
    });

    it('rejects a PIN shorter than 4 digits', () => {
      const result = LoginSchema.safeParse({ phone: '+27821000001', pin: '123' });
      expect(result.success).toBe(false);
    });

    it('rejects a PIN longer than 4 digits', () => {
      const result = LoginSchema.safeParse({ phone: '+27821000001', pin: '12345' });
      expect(result.success).toBe(false);
    });

    it('rejects a PIN with non-digit characters', () => {
      const result = LoginSchema.safeParse({ phone: '+27821000001', pin: '12ab' });
      expect(result.success).toBe(false);
    });

    it('rejects an empty PIN', () => {
      const result = LoginSchema.safeParse({ phone: '+27821000001', pin: '' });
      expect(result.success).toBe(false);
    });
  });
});
