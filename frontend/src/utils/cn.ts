// ============================================================
// 📁 src/utils/cn.ts
// ROLE: Merges Tailwind classes safely using clsx + tailwind-merge
// ============================================================

import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * @utility cn
 * Merges Tailwind classes safely using clsx + tailwind-merge.
 *
 * WHY tailwind-merge:
 * Without it, conflicting Tailwind classes like "bg-red-500 bg-blue-500"
 * both stay in the string — browser applies whichever comes last in the
 * stylesheet (unpredictable). tailwind-merge deduplicates by category,
 * keeping only the LAST class per utility group.
 *
 * WHY clsx:
 * Handles conditional class logic cleanly — arrays, objects, falsy values.
 *
 * @example
 * cn('px-4 py-2', isActive && 'bg-brand-accent', 'px-6')
 * // → 'py-2 bg-brand-accent px-6'  (px-4 deduped by tailwind-merge)
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}
