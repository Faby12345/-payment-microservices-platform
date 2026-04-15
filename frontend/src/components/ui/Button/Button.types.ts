// ============================================================
// 📁 src/components/ui/Button/Button.types.ts
// ROLE: Props definition for the polymorphic Button component
// ============================================================

import { type ReactNode } from 'react';

export interface ButtonProps {
  variant?:   'primary' | 'secondary' | 'ghost' | 'danger';
  size?:      'sm' | 'md' | 'lg';
  isLoading?: boolean;
  disabled?:  boolean;
  fullWidth?: boolean;
  children:   ReactNode;
  onClick?:   () => void;
  type?:      'button' | 'submit' | 'reset';
}
