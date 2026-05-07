import { describe, expect, it } from 'bun:test';
import { copy as af } from '../af.js';
import { copy as en } from '../en.js';
import { copy as zu } from '../zu.js';

/**
 * Locale parity guard. Catches the case where a developer adds a new key to
 * en.ts (the canonical shape) but forgets to add the matching translation
 * to zu.ts and af.ts. TypeScript catches missing top-level keys via the
 * `Copy` interface widen, but this test catches drift at runtime too — and
 * fails loudly with the missing key path.
 */

type AnyObj = Record<string, unknown>;

function flattenKeys(obj: AnyObj, prefix = ''): string[] {
  const out: string[] = [];
  for (const [k, v] of Object.entries(obj)) {
    const path = prefix ? `${prefix}.${k}` : k;
    if (v !== null && typeof v === 'object' && !Array.isArray(v)) {
      out.push(...flattenKeys(v as AnyObj, path));
    } else {
      out.push(path);
    }
  }
  return out.sort();
}

describe('copy locales — shape parity', () => {
  const enKeys = flattenKeys(en as unknown as AnyObj);

  it('isiZulu has identical key structure to English', () => {
    expect(flattenKeys(zu as unknown as AnyObj)).toEqual(enKeys);
  });

  it('Afrikaans has identical key structure to English', () => {
    expect(flattenKeys(af as unknown as AnyObj)).toEqual(enKeys);
  });
});
