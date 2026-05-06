import { describe, expect, it } from 'bun:test';
import { initialsOf } from '../initials.js';

describe('initialsOf', () => {
  it('takes the first letter of each word', () => {
    expect(initialsOf('Nomsa Dlamini')).toBe('ND');
  });

  it('uppercases the result', () => {
    expect(initialsOf('nomsa dlamini')).toBe('ND');
  });

  it('caps at two letters', () => {
    expect(initialsOf('Mary Anne van der Merwe')).toBe('MA');
  });

  it('returns one letter for single-word names', () => {
    expect(initialsOf('Madonna')).toBe('M');
  });

  it('returns empty for an empty string', () => {
    expect(initialsOf('')).toBe('');
  });

  it('handles extra whitespace gracefully', () => {
    // Splits on single spaces; double-space yields an empty entry the filter drops.
    expect(initialsOf('Nomsa  Dlamini')).toBe('ND');
  });
});
