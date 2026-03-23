// ============================================================
// 📁 src/components/ui/PasswordStrength/PasswordStrength.tsx
// ROLE: Visual feedback for password complexity
// ============================================================

import React, { useMemo } from 'react';
import { isStrongPassword } from '../../../utils/validators';
import { cn } from '../../../utils/cn';

interface PasswordStrengthProps {
  password:          string;
}

export const PasswordStrength: React.FC<PasswordStrengthProps> = ({ password }) => {
  /**
   * @hook useMemo — strength
   * COMPUTES: password score object from isStrongPassword()
   * WHY MEMOISED: isStrongPassword runs regex checks on every char —
   *               memoising avoids recalculating on unrelated re-renders
   * DEPS: [password] — recalculate only when password string changes
   */
  const strength = useMemo(() => isStrongPassword(password), [password]);

  if (!password) return null;

  return (
    <div className="mt-3 animate-fade-in">
      <div className="flex gap-1.5 mb-1.5 h-1">
        {[0, 1, 2, 3].map((index) => (
          <div
            key={index}
            className={cn(
              "flex-1 rounded-full transition-all duration-500",
              index < strength.score 
                ? strength.colorClass 
                : "bg-white/10"
            )}
          />
        ))}
      </div>
      <div className="flex justify-between items-center px-0.5">
        <p className="text-[10px] uppercase tracking-wider font-semibold text-[var(--color-brand-secondary)]">
          Security Level
        </p>
        <p className={cn(
          "text-[10px] uppercase tracking-wider font-bold transition-colors duration-500",
          strength.score > 0 ? strength.colorClass.replace('bg-', 'text-') : "text-[var(--color-brand-muted)]"
        )}>
          {strength.label}
        </p>
      </div>
    </div>
  );
};
