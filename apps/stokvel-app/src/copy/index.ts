import { useSyncExternalStore } from 'react';
import { localeStore } from './locale-store.js';
import type { Copy } from './types.js';

export { localeStore } from './locale-store.js';
export type { Copy, Locale } from './types.js';
export { LOCALES } from './types.js';

/**
 * Reactive accessor for the active locale's copy tree. Components calling
 * this re-render when the user switches language.
 */
export function useCopy(): Copy {
  return useSyncExternalStore(localeStore.subscribe, localeStore.getCopy, localeStore.getCopy);
}

/**
 * Snapshot accessor for places that aren't React function components — event
 * handlers, error formatters, hook logic outside the render path. Doesn't
 * subscribe; reads the current locale at call time.
 */
export function getCopy(): Copy {
  return localeStore.getCopy();
}

/**
 * Simple placeholder interpolation.
 * interpolate("Hello, {name}", { name: "Nomsa" }) → "Hello, Nomsa"
 */
export function interpolate(template: string, values: Record<string, string | number>): string {
  return template.replace(/\{(\w+)\}/g, (_, key: string) => String(values[key] ?? `{${key}}`));
}

/**
 * Pluralisation helper.
 * plural({ one: '1 member', other: '{count} members' }, 3) → '3 members'
 */
export function plural(forms: { one: string; other: string }, count: number): string {
  return interpolate(count === 1 ? forms.one : forms.other, { count });
}
