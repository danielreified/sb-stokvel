import { describe, expect, it } from 'bun:test';
import { ContributionCreateSchema } from '../src/contribution.js';

const VALID_UUID = '10000000-0000-0000-0000-000000000001';

describe('ContributionCreateSchema', () => {
  it('accepts a valid contribution', () => {
    const result = ContributionCreateSchema.safeParse({
      memberId: VALID_UUID,
      amount: 50000,
      month: '2025-04',
    });
    expect(result.success).toBe(true);
  });

  describe('memberId', () => {
    it('rejects a non-UUID memberId', () => {
      const result = ContributionCreateSchema.safeParse({
        memberId: 'not-a-uuid',
        amount: 50000,
        month: '2025-04',
      });
      expect(result.success).toBe(false);
    });

    it('rejects a missing memberId', () => {
      const result = ContributionCreateSchema.safeParse({ amount: 50000, month: '2025-04' });
      expect(result.success).toBe(false);
    });
  });

  describe('amount', () => {
    it('rejects zero', () => {
      const result = ContributionCreateSchema.safeParse({
        memberId: VALID_UUID,
        amount: 0,
        month: '2025-04',
      });
      expect(result.success).toBe(false);
    });

    it('rejects a negative amount', () => {
      const result = ContributionCreateSchema.safeParse({
        memberId: VALID_UUID,
        amount: -100,
        month: '2025-04',
      });
      expect(result.success).toBe(false);
    });

    it('rejects a fractional amount', () => {
      const result = ContributionCreateSchema.safeParse({
        memberId: VALID_UUID,
        amount: 100.5,
        month: '2025-04',
      });
      expect(result.success).toBe(false);
    });

    it('rejects a string amount', () => {
      const result = ContributionCreateSchema.safeParse({
        memberId: VALID_UUID,
        amount: '50000',
        month: '2025-04',
      });
      expect(result.success).toBe(false);
    });
  });

  describe('month', () => {
    it('accepts all valid months 01-12', () => {
      for (const mm of ['01', '02', '06', '09', '12']) {
        const result = ContributionCreateSchema.safeParse({
          memberId: VALID_UUID,
          amount: 50000,
          month: `2025-${mm}`,
        });
        expect(result.success).toBe(true);
      }
    });

    it('rejects month 00', () => {
      const result = ContributionCreateSchema.safeParse({
        memberId: VALID_UUID,
        amount: 50000,
        month: '2025-00',
      });
      expect(result.success).toBe(false);
    });

    it('rejects month 13', () => {
      const result = ContributionCreateSchema.safeParse({
        memberId: VALID_UUID,
        amount: 50000,
        month: '2025-13',
      });
      expect(result.success).toBe(false);
    });

    it('rejects a date string instead of YYYY-MM', () => {
      const result = ContributionCreateSchema.safeParse({
        memberId: VALID_UUID,
        amount: 50000,
        month: '2025-04-01',
      });
      expect(result.success).toBe(false);
    });

    it('rejects a missing month', () => {
      const result = ContributionCreateSchema.safeParse({
        memberId: VALID_UUID,
        amount: 50000,
      });
      expect(result.success).toBe(false);
    });
  });
});
