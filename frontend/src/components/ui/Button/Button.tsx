// ============================================================
// 📁 src/components/ui/Button/Button.tsx
// ROLE: Highly reusable button with v4 token-based styling
// ============================================================

import React from 'react';
import { type ButtonProps } from './Button.types';
import { cn } from '../../../utils/cn';

/**
 * Button Component
 * 
 * WHY cn() over ternary chains:
 * Using cn() with tailwind-merge allows for a clean, declarative way to 
 * combine base styles with variants. It prevents class conflicts by 
 * ensuring that the last class in a category (e.g., padding) wins, 
 * which is much safer than manual string concatenation or deep ternary nesting.
 */
export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  isLoading = false,
  disabled = false,
  fullWidth = false,
  children,
  onClick,
  type = 'button',
}) => {
  const baseStyles = 'inline-flex items-center justify-center font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-brand-accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--color-brand-bg)] cursor-pointer disabled:opacity-50 disabled:pointer-events-none disabled:cursor-not-allowed rounded-xl';
  
  const variants = {
    primary: 'bg-[var(--color-brand-accent)] hover:bg-[var(--color-brand-accent-light)] text-white shadow-glow-sm hover:shadow-glow active:scale-[0.98]',
    ghost: 'bg-transparent border border-white/10 hover:bg-white/[0.06] text-white/80 hover:text-white',
    danger: 'bg-[color-mix(in_srgb,var(--color-brand-error)_10%,transparent)] border border-[color-mix(in_srgb,var(--color-brand-error)_30%,transparent)] text-[var(--color-brand-error)] hover:bg-[color-mix(in_srgb,var(--color-brand-error)_20%,transparent)]',
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-5 py-2.5 text-sm',
    lg: 'px-8 py-3.5 text-base',
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || isLoading}
      className={cn(
        baseStyles,
        variants[variant],
        sizes[size],
        fullWidth ? 'w-full' : 'w-auto',
      )}
    >
      {isLoading ? (
        <div className="flex items-center justify-center">
          {/* Inline SVG Spinner - maintains width, prevents layout shift */}
          <svg className="animate-spin h-5 w-5 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        </div>
      ) : (
        children
      )}
    </button>
  );
};
