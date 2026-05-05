export type { Copy } from './en.js';
export { copy } from './en.js';

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
