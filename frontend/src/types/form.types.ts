// ============================================================
// 📁 src/types/form.types.ts
// ROLE: Generic form validation types
// ============================================================

export interface FieldError {
  message: string;
}

export type FormErrors<T> = Partial<Record<keyof T, FieldError>>;

export type ValidationFn<T> = (values: T) => FormErrors<T>;
