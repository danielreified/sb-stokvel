import type { ClassValue } from 'clsx';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/** Merge Tailwind classes without conflicts. Standard shadcn/ui helper. */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}
