import { describe, expect, it } from 'bun:test';
import { deriveUpdateLevel } from '../routes/version.js';

describe('deriveUpdateLevel', () => {
  const MIN = '0.5.0';
  const LATEST = '1.0.0';

  it('returns "forced" when client is below minVersion', () => {
    expect(deriveUpdateLevel('0.4.9', MIN, LATEST, 'none')).toBe('forced');
  });

  it('returns "forced" when client is well below minVersion', () => {
    expect(deriveUpdateLevel('0.0.1', MIN, LATEST, 'none')).toBe('forced');
  });

  it('returns "optional" when client is at minVersion but below latestVersion', () => {
    expect(deriveUpdateLevel('0.5.0', MIN, LATEST, 'none')).toBe('optional');
  });

  it('returns "optional" when client is between minVersion and latestVersion', () => {
    expect(deriveUpdateLevel('0.8.0', MIN, LATEST, 'none')).toBe('optional');
  });

  it('returns "none" when client is at latestVersion', () => {
    expect(deriveUpdateLevel('1.0.0', MIN, LATEST, 'none')).toBe('none');
  });

  it('returns "none" when client is ahead of latestVersion', () => {
    expect(deriveUpdateLevel('2.0.0', MIN, LATEST, 'none')).toBe('none');
  });

  it('returns globalOverride when set to "forced", regardless of version', () => {
    expect(deriveUpdateLevel('99.0.0', MIN, LATEST, 'forced')).toBe('forced');
  });

  it('returns globalOverride when set to "recommended", regardless of version', () => {
    expect(deriveUpdateLevel('99.0.0', MIN, LATEST, 'recommended')).toBe('recommended');
  });

  it('returns globalOverride when set to "optional", regardless of version', () => {
    expect(deriveUpdateLevel('99.0.0', MIN, LATEST, 'optional')).toBe('optional');
  });

  it('ignores globalOverride when it is "none" and falls back to semver logic', () => {
    expect(deriveUpdateLevel('0.3.0', MIN, LATEST, 'none')).toBe('forced');
  });
});
