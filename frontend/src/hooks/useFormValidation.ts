// ============================================================
// 📁 src/hooks/useFormValidation.ts
// ROLE: Manages form state, validation, and user interaction
// ============================================================

import { useState, useCallback, type ChangeEvent, type FocusEvent } from 'react';
import { type FormErrors, type  ValidationFn } from '../types/form.types';

export function useFormValidation<T extends object>(
  initialValues: T,
  validate: ValidationFn<T>
) {
  /**
   * @hook useState — values
   * STORES: current values of all form fields
   * WHY LOCAL: form state is transient and only needed during the input process
   */
  const [values, setValues] = useState<T>(initialValues);

  /**
   * @hook useState — errors
   * STORES: validation error messages per field
   * WHY LOCAL: dynamic feedback based on current values and touched state
   */
  const [errors, setErrors] = useState<FormErrors<T>>({});

  /**
   * @hook useState — touchedFields
   * STORES: map of fields the user has interacted with
   * WHY LOCAL: ensures we only show errors for fields the user has visited
   */
  const [touchedFields, setTouchedFields] = useState<Partial<Record<keyof T, boolean>>>({});

  /**
   * @hook useState — isDirty
   * STORES: boolean indicating if any field has been modified
   * WHY LOCAL: useful for UI states like disabling reset buttons
   */
  const [isDirty, setIsDirty] = useState(false);

  /**
   * @hook useCallback — handleChange
   * DOES: updates field value and marks form as dirty
   * MEMOISED BECAUSE: passed to multiple inputs, avoids re-creating the handler
   * DEPS: [] — setValues and setIsDirty are stable
   */
  const handleChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    const val = type === 'checkbox' ? checked : value;

    setValues((prev) => ({
      ...prev,
      [name]: val,
    }));
    setIsDirty(true);
  }, []);

  /**
   * @hook useCallback — handleBlur
   * DOES: marks field as touched and triggers validation
   * MEMOISED BECAUSE: standard interaction handler for all inputs
   * DEPS: [values, validate] — needs latest values to run validation
   */
  const handleBlur = useCallback((e: FocusEvent<HTMLInputElement>) => {
    const { name } = e.target;
    setTouchedFields((prev) => ({ ...prev, [name]: true }));
    
    const validationErrors = validate(values);
    setErrors(validationErrors);
  }, [values, validate]);

  /**
   * @hook useCallback — validateAll
   * DOES: runs validation on all fields and marks all as touched
   * MEMOISED BECAUSE: used by form submission handlers
   * DEPS: [values, validate] — ensures check is performed against current state
   */
  const validateAll = useCallback(() => {
    const validationErrors = validate(values);
    setErrors(validationErrors);
    
    const allTouched = Object.keys(values).reduce((acc, key) => {
      acc[key as keyof T] = true;
      return acc;
    }, {} as Record<keyof T, boolean>);
    
    setTouchedFields(allTouched);
    
    return Object.keys(validationErrors).length === 0;
  }, [values, validate]);

  /**
   * @hook useCallback — reset
   * DOES: restores form to initial state
   * MEMOISED BECAUSE: cleanup action that shouldn't trigger effects
   * DEPS: [initialValues] — required to restore correct starting point
   */
  const reset = useCallback(() => {
    setValues(initialValues);
    setErrors({});
    setTouchedFields({});
    setIsDirty(false);
  }, [initialValues]);

  return {
    values,
    errors,
    handleChange,
    handleBlur,
    validateAll,
    reset,
    isDirty,
    touchedFields,
  };
}
