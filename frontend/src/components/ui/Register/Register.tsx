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

// ── Icons ─────────────────────────────────────────────────────

const IconEmail = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7
       a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
  </svg>
);

const IconLock = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2
       2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
  </svg>
);

const IconUser = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
  </svg>
);

const IconGoogle = () => (
  <svg className="w-4 h-4" viewBox="0 0 24 24">
    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92
    c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77
    c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84
    C3.99 20.53 7.7 23 12 23z"/>
    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43
    .35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15
    C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84
    c.87-2.6 3.3-4.53 6.16-4.53z"/>
  </svg>
);

const IconApple = () => (
  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
    <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79
    -1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39
    c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91
    .65.03 2.47.26 3.64 1.98l-.09.06c-.22.15-2.18 1.27-2.16 3.8.03 3.02 2.65
    4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.84M13 3.5c.73-.83 1.94-1.46 2.94-1.5
    .13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35
    1.05-3.11z"/>
  </svg>
);

// ── Divider + social buttons ─────────────────────────────────

const SocialDivider: React.FC = () => (
  <div className="mt-6">
    <div className="flex items-center gap-3 mb-4">
      <div className="flex-1 h-px bg-white/[0.06]" />
      <span className="text-[var(--color-brand-muted)] text-xs shrink-0 tracking-wide uppercase">
      or continue with
    </span>
      <div className="flex-1 h-px bg-white/[0.06]" />
    </div>

    <div className="grid grid-cols-2 gap-3">
      <button type="button" className="social-btn" aria-label="Continue with Google">
        <IconGoogle />
        <span>Google</span>
      </button>
      <button type="button" className="social-btn" aria-label="Continue with Apple">
        <IconApple />
        <span>Apple</span>
      </button>
    </div>
  </div>
);

// ── Main component ────────────────────────────────────────────

export const Register: React.FC<RegisterProps> = ({ onToggleMode }) => {
  const [isSuccess, setIsSuccess] = useState(false);
  const { register, isLoading, error: authError } = useAuth();

  const validateRegister = useCallback((values: RegisterCredentials) => {
    const errors: FormErrors<RegisterCredentials> = {};
    if (!values.fullName) errors.fullName = { message: 'Full name is required' };
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
      } catch { /* error surfaced via authError */ }
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
