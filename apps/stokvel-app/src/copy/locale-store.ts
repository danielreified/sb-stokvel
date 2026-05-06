import { copy as af } from './af.js';
import { copy as en } from './en.js';
import type { Copy, Locale } from './types.js';
import { copy as zu } from './zu.js';

const LOCALE_STORAGE_KEY = 'seyva-locale';
const DEFAULT_LOCALE: Locale = 'en';

const COPY_BY_LOCALE: Record<Locale, Copy> = { en, zu, af };

const isLocale = (v: unknown): v is Locale => v === 'en' || v === 'zu' || v === 'af';

const readStoredLocale = (): Locale => {
  if (typeof window === 'undefined') return DEFAULT_LOCALE;
  try {
    const v = window.localStorage.getItem(LOCALE_STORAGE_KEY);
    return isLocale(v) ? v : DEFAULT_LOCALE;
  } catch {
    return DEFAULT_LOCALE;
  }
};

let currentLocale: Locale = readStoredLocale();
const listeners = new Set<() => void>();

export const localeStore = {
  getLocale: (): Locale => currentLocale,
  getCopy: (): Copy => COPY_BY_LOCALE[currentLocale],
  subscribe: (cb: () => void): (() => void) => {
    listeners.add(cb);
    return () => listeners.delete(cb);
  },
  setLocale: (next: Locale): void => {
    if (next === currentLocale) return;
    currentLocale = next;
    try {
      window.localStorage.setItem(LOCALE_STORAGE_KEY, next);
    } catch {
      // Storage write can fail in private mode; non-fatal — locale lives in memory.
    }
    for (const cb of listeners) cb();
  },
};
