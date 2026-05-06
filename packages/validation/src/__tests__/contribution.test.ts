import { describe, expect, it } from 'bun:test';
import { ContributionCreateSchema } from '../contribution.js';

const VALID = {
  memberId: '10000000-0000-0000-0000-000000000001',
  amount: 50000,
  month: '2026-05',
};

describe('ContributionCreateSchema', () => {
  it('accepts a valid contribution', () => {
    expect(ContributionCreateSchema.safeParse(VALID).success).toBe(true);
  });

  describe('memberId', () => {
    it('rejects non-UUID memberId', () => {
      expect(ContributionCreateSchema.safeParse({ ...VALID, memberId: 'not-a-uuid' }).success).toBe(
        false,
      );
    });

    it('rejects empty memberId', () => {
      expect(ContributionCreateSchema.safeParse({ ...VALID, memberId: '' }).success).toBe(false);
    });
  });

  describe('amount', () => {
    it('rejects zero', () => {
      expect(ContributionCreateSchema.safeParse({ ...VALID, amount: 0 }).success).toBe(false);
    });

    it('rejects negative amounts', () => {
      expect(ContributionCreateSchema.safeParse({ ...VALID, amount: -100 }).success).toBe(false);
    });

    it('rejects fractional cents', () => {
      expect(ContributionCreateSchema.safeParse({ ...VALID, amount: 100.5 }).success).toBe(false);
    });

    it('accepts very small positive amount (1 cent)', () => {
      expect(ContributionCreateSchema.safeParse({ ...VALID, amount: 1 }).success).toBe(true);
    });

    it('accepts large amounts', () => {
      expect(ContributionCreateSchema.safeParse({ ...VALID, amount: 10_000_000 }).success).toBe(
        true,
      );
    });
  });

  describe('month', () => {
    it('rejects invalid month values', () => {
      expect(ContributionCreateSchema.safeParse({ ...VALID, month: '2026-13' }).success).toBe(
        false,
      );
      expect(ContributionCreateSchema.safeParse({ ...VALID, month: '2026-00' }).success).toBe(
        false,
      );
    });

    it('rejects malformed month strings', () => {
      expect(ContributionCreateSchema.safeParse({ ...VALID, month: '2026/05' }).success).toBe(
        false,
      );
      expect(ContributionCreateSchema.safeParse({ ...VALID, month: '2026-5' }).success).toBe(false);
      expect(ContributionCreateSchema.safeParse({ ...VALID, month: 'May 2026' }).success).toBe(
        false,
      );
    });

    it('accepts boundary months', () => {
      expect(ContributionCreateSchema.safeParse({ ...VALID, month: '2026-01' }).success).toBe(true);
      expect(ContributionCreateSchema.safeParse({ ...VALID, month: '2026-12' }).success).toBe(true);
    });
  });
});
