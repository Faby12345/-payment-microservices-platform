import React, { useState, useCallback } from 'react';
import { Input } from '../Input';
import { Button } from '../Button';
import { PasswordStrength } from '../PasswordStrength';
import { useAuth } from '../../../hooks/useAuth';
import { useFormValidation } from '../../../hooks/useFormValidation';
import { isValidEmail, doPasswordsMatch } from '../../../utils/validators';
import { type RegisterCredentials } from '../../../types/auth.types';
import { type FormErrors } from '../../../types/form.types';
import { type RegisterProps } from './Register.types';
import { IconLock, IconUser, IconEmail } from '../Icons';
import { SocialDivider } from '../AuthSocial';

// ── Main component ────────────────────────────────────────────

export const Register: React.FC<RegisterProps> = ({ onToggleMode }) => {
  const [isSuccess, setIsSuccess] = useState(false);
  const { register, isLoading, error: authError } = useAuth();

  const validateRegister = useCallback((values: RegisterCredentials) => {
    const errors: FormErrors<RegisterCredentials> = {};
    if (!values.fullName) {
      errors.fullName = { message: 'Full name is required' };
    } else if (!values.fullName.trim().includes(' ')) {
      errors.fullName = { message: 'Please enter first and last name' };
    }
    if (!values.email) errors.email = { message: 'Email is required' };
    else if (!isValidEmail(values.email)) errors.email = { message: 'Invalid email format' };
    if (!values.password) errors.password = { message: 'Password is required' };
    else if (values.password.length < 8) errors.password = { message: 'Min. 8 characters' };
    if (!values.confirmPassword) errors.confirmPassword = { message: 'Please confirm password' };
    else if (!doPasswordsMatch(values.password, values.confirmPassword)) {
      errors.confirmPassword = { message: 'Passwords do not match' };
    }
    if (!values.acceptTerms) errors.acceptTerms = { message: 'Required' };
    return errors;
  }, []);

  const registerForm = useFormValidation<RegisterCredentials>(
    { fullName: '', email: '', password: '', confirmPassword: '', acceptTerms: false },
    validateRegister,
  );

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (registerForm.validateAll()) {
      try {
        await register(registerForm.values);
        setIsSuccess(true);
      } catch {
        throw e;
      }
    }
  };

  const handleToggle = () => {
    setIsSuccess(false);
    registerForm.reset();
    onToggleMode();
  };

  if (isSuccess) {
    return (
      <div className="text-center animate-fade-in py-8">
        <div className="w-16 h-16 bg-[var(--color-brand-success)]/10 rounded-full
                    flex items-center justify-center mx-auto mb-6
                    border border-[var(--color-brand-success)]/20">
          <svg className="w-8 h-8 text-[var(--color-brand-success)]"
               fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round"
                  strokeWidth={3} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h2 className="text-xl font-semibold mb-2">Registration Complete</h2>
        <p className="text-[var(--color-brand-secondary)] mb-8 text-sm">
          We've sent a verification link to{' '}
          <span className="text-white">{registerForm.values.email}</span>
        </p>
        <Button fullWidth onClick={handleToggle}>
          Return to Login
        </Button>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      {/* Header Specific for Register */}
      <header className="mb-8 text-center">
        <div className="w-12 h-12 mx-auto mb-4 rounded-2xl flex items-center justify-center
                      bg-[var(--color-brand-accent)]/10 border border-[var(--color-brand-accent)]/20">
          <svg className="w-6 h-6 text-[var(--color-brand-accent)]" fill="none"
               stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                  d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        </div>
        <h1 className="gradient-text text-3xl font-bold tracking-tight mb-1">
          SecurePay
        </h1>
        <p className="text-[var(--color-brand-secondary)] text-sm">
          Create your professional account
        </p>
      </header>

      {/* Auth error banner */}
      {authError && (
        <div className="mb-5 p-4 rounded-xl animate-fade-in flex items-start gap-3
                  bg-[var(--color-brand-error)]/10
                  border border-[var(--color-brand-error)]/20
                  text-[var(--color-brand-error)] text-sm">
          <svg className="w-4 h-4 shrink-0 mt-0.5" fill="none"
               stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667
           1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464
           0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          {authError.message}
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleRegisterSubmit} className="space-y-4">
        <Input
          label="Full Name"
          name="fullName"
          icon={<IconUser />}
          maxLength={60}
          value={registerForm.values.fullName}
          onChange={registerForm.handleChange}
          onBlur={registerForm.handleBlur}
          error={registerForm.touchedFields.fullName
            ? registerForm.errors.fullName?.message
            : undefined}
        />

        <Input
          label="Email Address"
          name="email"
          type="email"
          autoComplete="email"
          icon={<IconEmail />}
          value={registerForm.values.email}
          onChange={registerForm.handleChange}
          onBlur={registerForm.handleBlur}
          error={registerForm.touchedFields.email ? registerForm.errors.email?.message : undefined}
        />

        <div className="space-y-1">
          <Input
            label="Password"
            name="password"
            type="password"
            icon={<IconLock />}
            value={registerForm.values.password}
            onChange={registerForm.handleChange}
            onBlur={registerForm.handleBlur}
            error={registerForm.touchedFields.password ? registerForm.errors.password?.message : undefined}
          />
          <PasswordStrength password={registerForm.values.password} />
        </div>

        <Input
          label="Confirm Password"
          name="confirmPassword"
          type="password"
          icon={<IconLock />}
          value={registerForm.values.confirmPassword}
          onChange={registerForm.handleChange}
          onBlur={registerForm.handleBlur}
          error={registerForm.touchedFields.confirmPassword
            ? registerForm.errors.confirmPassword?.message
            : undefined}
        />

        <div className="flex items-center justify-between px-1 pt-1">
          <label className="flex items-center gap-3 cursor-pointer group">
            <div className="relative shrink-0">
              <input
                type="checkbox"
                name="acceptTerms"
                checked={registerForm.values.acceptTerms}
                onChange={registerForm.handleChange}
                className="peer sr-only"
              />
              <div className="w-5 h-5 bg-white/5 border border-white/10 rounded-md
                          peer-checked:bg-[var(--color-brand-accent)]
                          peer-checked:border-[var(--color-brand-accent)]
                          transition-all duration-200" />
              <svg className="absolute inset-0 w-5 h-5 text-white p-1
                          scale-0 peer-checked:scale-100 transition-transform duration-200"
                   fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round"
                      strokeWidth={4} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <span className="text-sm text-[var(--color-brand-secondary)]
                         group-hover:text-white transition-colors duration-200">
              I accept the Terms & Conditions
            </span>
          </label>
        </div>

        <div className="pt-2">
          <Button
            type="submit"
            fullWidth
            isLoading={isLoading}
            disabled={!registerForm.values.acceptTerms}
          >
            Create Account
          </Button>
        </div>
      </form>

      <SocialDivider />

      <footer className="mt-6 text-center border-t border-white/5 pt-5">
        <p className="text-[var(--color-brand-secondary)] text-sm">
          Already have an account?{' '}
          <button
            onClick={handleToggle}
            className="text-white font-semibold
                  hover:text-[var(--color-brand-accent)] transition-colors duration-200"
          >
            Sign in here
          </button>
        </p>
      </footer>
    </div>
  );
};
