// ============================================================
// 📁 src/utils/validators.ts
// ROLE: Pure validation functions for form inputs
// ============================================================

/**
 * isValidEmail
 * Uses RFC-safe regex to validate email structure.
 *
 * Regex explanation:
 * - ^[\w-\.]+  : Starts with alphanumeric, dots, or dashes
 * - @          : Followed by an @ symbol
 * - ([\w-]+\.)+: Followed by one or more groups of domain names
 * - [\w-]{2,4}$ : Ends with a 2 to 4 character top-level domain
 */
export function isValidEmail(email: string): boolean {
  // Simplified, readable pattern that passes lint while remaining practical
  const emailRegex = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;
  return emailRegex.test(email);
}

/**
 * isStrongPassword
 * Calculates a strength score and returns metadata for UI.
 */
export function isStrongPassword(password: string): {
  score: 0 | 1 | 2 | 3 | 4;
  label: 'Too weak' | 'Weak' | 'Fair' | 'Strong' | 'Very strong';
  colorClass: string;
} {
  let score: 0 | 1 | 2 | 3 | 4 = 0;
  
  if (password.length >= 8) (score as number)++;
  if (/[A-Z]/.test(password)) (score as number)++;
  if (/[0-9]/.test(password)) (score as number)++;
  if (/[^A-Za-z0-9]/.test(password)) (score as number)++;

  const labels = {
    0: 'Too weak',
    1: 'Weak',
    2: 'Fair',
    3: 'Strong',
    4: 'Very strong',
  } as const;

  const colors = {
    0: 'bg-[var(--color-brand-muted)]',
    1: 'bg-[var(--color-brand-error)]',
    2: 'bg-[var(--color-brand-warning)]',
    3: 'bg-[var(--color-brand-accent)]',
    4: 'bg-[var(--color-brand-success)]',
  } as const;

  return {
    score,
    label: labels[score],
    colorClass: colors[score],
  };
}

/**
 * doPasswordsMatch
 * Simple equality check for confirm password fields.
 */
export function doPasswordsMatch(p1: string, p2: string): boolean {
  return p1 === p2;
}

/**
 * sanitizeInput
 * Trims whitespace and strips basic HTML tags to prevent XSS.
 */
export function sanitizeInput(value: string): string {
  return value.trim().replace(/<[^>]*>?/gm, '');
}
