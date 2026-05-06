import type { copy } from './en.js';

/** Widen literal string types to `string` so other locale files satisfy the shape. */
type Widen<T> = T extends string
  ? string
  : T extends readonly (infer U)[]
    ? readonly Widen<U>[]
    : T extends Record<string, unknown>
      ? { [K in keyof T]: Widen<T[K]> }
      : T;

export type Copy = Widen<typeof copy>;

export type Locale = 'en' | 'zu' | 'af';

export const LOCALES: { code: Locale; label: string; nativeLabel: string }[] = [
  { code: 'en', label: 'English', nativeLabel: 'English' },
  { code: 'zu', label: 'isiZulu', nativeLabel: 'isiZulu' },
  { code: 'af', label: 'Afrikaans', nativeLabel: 'Afrikaans' },
];
