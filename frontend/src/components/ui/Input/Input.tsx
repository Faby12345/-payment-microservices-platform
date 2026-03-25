// ============================================================
// 📁 src/components/ui/Input/Input.tsx
// ROLE: Reusable controlled input — floating label, icon, char count, error state
// ============================================================

import React, { useState, useRef, useId } from 'react';
import { cn } from '../../../utils/cn';
import { type InputProps } from './Input.types';

/**
 * @component Input
 * @description Floating-label input with optional left icon, password toggle,
 *              live character counter, and animated error state.
 *
 * @param {InputProps} props
 * @returns {JSX.Element}
 *
 * @hooks
 *  - useState(showPassword)  — toggles password visibility
 *  - useId                   — stable a11y id linking label ↔ input
 *  - useRef(inputRef)        — focuses input after password toggle (no re-render)
 */
export const Input: React.FC<InputProps> = ({
                                              label,
                                              name,
                                              type = 'text',
                                              value,
                                              onChange,
                                              onBlur,
                                              error,
                                              autoComplete,
                                              disabled,
                                              id,
                                              icon,
                                              maxLength,
                                            }) => {
  /**
   * @hook useState — showPassword
   * STORES: whether the password field shows plain text
   * WHY LOCAL: purely visual toggle — no parent cares about this
   */
  const [showPassword, setShowPassword] = useState(false);

  /**
   * @hook useId
   * WHAT: generates a stable unique ID per instance
   * WHY: links <label htmlFor> → <input id> for screen readers.
   *      Random IDs break SSR hydration; index-based IDs collide.
   */
  const generatedId = useId();
  const inputId = id ?? generatedId;

  /**
   * @hook useRef — inputRef
   * STORES: direct DOM reference to the <input>
   * WHY: after toggling password visibility we imperatively re-focus
   *      the input so the user doesn't lose their cursor position.
   *      Doing this via state would cause an unnecessary re-render.
   */
  const inputRef = useRef<HTMLInputElement>(null);

  const resolvedType = type === 'password' ? (showPassword ? 'text' : 'password') : type;
  const hasValue = value.length > 0;
  const charsLeft = maxLength !== undefined ? maxLength - value.length : null;

  const handleTogglePassword = () => {
    setShowPassword(prev => !prev);
    // Imperatively focus after React re-renders the input type change
    setTimeout(() => inputRef.current?.focus(), 0);
  };

  return (
      <div className="w-full">
        {/* Wrapper — shake animation triggers when error appears */}
        <div className={cn('relative', error && 'animate-shake')}>

          {/* Left icon */}
          {icon && (
              <div className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none
                          text-[var(--color-brand-muted)] transition-colors duration-200
                          peer-focus:text-[var(--color-brand-accent)]"
                   aria-hidden="true">
                {icon}
              </div>
          )}

          <input
              ref={inputRef}
              id={inputId}
              name={name}
              type={resolvedType}
              value={value}
              onChange={onChange}
              onBlur={onBlur}
              autoComplete={autoComplete}
              disabled={disabled}
              maxLength={maxLength}
              placeholder=" " /* ← single space required for peer-placeholder-shown */
              className={cn(
                  'peer input-base',
                  /* Push text right when icon is present */
                  icon ? 'pl-10' : 'pl-4',
                  /* Push text right when password toggle is present */
                  type === 'password' ? 'pr-11' : 'pr-4',
                  error && 'border-[var(--color-brand-error)] focus:border-[var(--color-brand-error)]',
                  disabled && 'opacity-50 cursor-not-allowed',
              )}
          />

          {/* Floating label */}
          <label
              htmlFor={inputId}
              className={cn(
                  'absolute left-4 pointer-events-none select-none',
                  'text-[var(--color-brand-secondary)] transition-all duration-200',
                  icon && 'left-10',
                  /* Default (unfocused + empty): vertically centred */
                  'top-1/2 -translate-y-1/2 text-sm',
                  /* Focused OR filled: float up */
                  'peer-focus:top-1 peer-focus:translate-y-0 peer-focus:text-[10px]',
                  'peer-focus:text-[var(--color-brand-accent)]',
                  /* Filled but not focused */
                  (hasValue) && '!top-1 !translate-y-0 !text-[10px]',
                  error && 'peer-focus:text-[var(--color-brand-error)]',
              )}
          >
            {label}
          </label>

          {/* Password show/hide toggle */}
          {type === 'password' && (
              <button
                  type="button"
                  onClick={handleTogglePassword}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2
                       text-[var(--color-brand-muted)] hover:text-white
                       transition-colors duration-200 p-1 rounded"
              >
                {showPassword ? (
                    /* Eye-off icon */
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                            d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7
                     a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243
                     M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29
                     M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943
                     9.543 7a10.025 10.025 0 01-4.132 4.411m0 0L21 21" />
                    </svg>
                ) : (
                    /* Eye icon */
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                            d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943
                     9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                )}
              </button>
          )}
        </div>

        {/* Bottom row — error message OR char counter */}
        <div className="flex justify-between items-center min-h-[1.25rem] mt-1 px-1">
          {error ? (
              <p className="text-[var(--color-brand-error)] text-xs animate-fade-in" role="alert">
                {error}
              </p>
          ) : (
              <span /> /* spacer to keep char counter right-aligned */
          )}

          {/* Live character counter */}
          {maxLength !== undefined && (
              <span className={cn(
                  'text-xs tabular-nums transition-colors duration-200',
                  charsLeft !== null && charsLeft <= 10
                      ? 'text-[var(--color-brand-warning)]'
                      : 'text-[var(--color-brand-muted)]',
              )}>
            {value.length} / {maxLength}
          </span>
          )}
        </div>
      </div>
  );
};