import { describe, expect, it } from 'bun:test';
import { LoginSchema } from '../auth.js';

describe('LoginSchema', () => {
  it('accepts a valid +27 phone + 4-digit PIN', () => {
    const result = LoginSchema.safeParse({ phone: '+27821000001', pin: '1234' });
    expect(result.success).toBe(true);
  });

  it('rejects phone without +27 prefix', () => {
    const result = LoginSchema.safeParse({ phone: '0821000001', pin: '1234' });
    expect(result.success).toBe(false);
  });

  it('rejects phone with wrong digit count', () => {
    expect(LoginSchema.safeParse({ phone: '+278210000', pin: '1234' }).success).toBe(false);
    expect(LoginSchema.safeParse({ phone: '+278210000010', pin: '1234' }).success).toBe(false);
  });

  it('rejects phone with non-digit characters after +27', () => {
    expect(LoginSchema.safeParse({ phone: '+27 82 100 0001', pin: '1234' }).success).toBe(false);
    expect(LoginSchema.safeParse({ phone: '+27a82000001', pin: '1234' }).success).toBe(false);
  });

  it('rejects PIN that is not exactly 4 digits', () => {
    expect(LoginSchema.safeParse({ phone: '+27821000001', pin: '123' }).success).toBe(false);
    expect(LoginSchema.safeParse({ phone: '+27821000001', pin: '12345' }).success).toBe(false);
    expect(LoginSchema.safeParse({ phone: '+27821000001', pin: 'abcd' }).success).toBe(false);
  });

  it('rejects missing fields', () => {
    expect(LoginSchema.safeParse({ phone: '+27821000001' }).success).toBe(false);
    expect(LoginSchema.safeParse({ pin: '1234' }).success).toBe(false);
    expect(LoginSchema.safeParse({}).success).toBe(false);
  });
});
