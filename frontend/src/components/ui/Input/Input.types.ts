// ============================================================
// 📁 src/components/ui/Input/Input.types.ts
// ROLE: TypeScript interface for the Input component props
// ============================================================

export interface InputProps {
  label: string;
  name: string;
  type?: 'text' | 'email' | 'password';
  value: string;
  onChange: React.ChangeEventHandler<HTMLInputElement>;
  onBlur?: React.FocusEventHandler<HTMLInputElement>;
  error?: string;
  autoComplete?: string;
  disabled?: boolean;
  id?: string;
  /** Left-side icon rendered inside the input field */
  icon?: React.ReactNode;
  /**
   * When set, shows a live character counter below the input.
   * e.g. maxLength={40} → "12 / 40"
   */
  maxLength?: number;
}