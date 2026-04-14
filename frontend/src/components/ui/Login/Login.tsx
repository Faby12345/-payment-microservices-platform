import React, { useCallback } from 'react';
import { Input } from '../Input';
import { Button } from '../Button';
import { useAuth } from '../../../hooks/useAuth';
import { useFormValidation } from '../../../hooks/useFormValidation';
import { isValidEmail } from '../../../utils/validators';
import { type LoginCredentials } from '../../../types/auth.types';
import { type FormErrors } from '../../../types/form.types';
import { type LoginProps } from './Login.types';
import { IconLock, IconEmail} from '../Icons';
import { SocialDivider } from '../AuthSocial';



// ── Main component ────────────────────────────────────────────

export const Login: React.FC<LoginProps> = ({ onToggleMode }) => {
  const { login, isLoading, error: authError } = useAuth();

  const validateLogin = useCallback((values: LoginCredentials) => {
    const errors: FormErrors<LoginCredentials> = {};
    if (!values.email) errors.email = { message: 'Email is required' };
    else if (!isValidEmail(values.email)) errors.email = { message: 'Invalid email format' };
    if (!values.password) errors.password = { message: 'Password is required' };
    return errors;
  }, []);

  const loginForm = useFormValidation<LoginCredentials>(
    { email: '', password: '', rememberMe: false },
    validateLogin,
  );

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loginForm.validateAll()) {
      try {
        await login(loginForm.values);
        alert('Logged in successfully!');
      } catch { /* error surfaced via authError */ }
    }
  };

  const handleToggle = () => {
    loginForm.reset();
    onToggleMode();
  };

  return (
    <div className="animate-fade-in">
      {/* Brand header */}
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
          Secure access to your dashboard
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

      <form onSubmit={handleLoginSubmit} className="space-y-4">
        <Input
          label="Email Address"
          name="email"
          type="email"
          autoComplete="email"
          icon={<IconEmail />}
          value={loginForm.values.email}
          onChange={loginForm.handleChange}
          onBlur={loginForm.handleBlur}
          error={loginForm.touchedFields.email ? loginForm.errors.email?.message : undefined}
        />

        <Input
          label="Password"
          name="password"
          type="password"
          icon={<IconLock />}
          value={loginForm.values.password}
          onChange={loginForm.handleChange}
          onBlur={loginForm.handleBlur}
          error={loginForm.touchedFields.password ? loginForm.errors.password?.message : undefined}
        />

        <div className="flex items-center justify-between px-1 pt-1">
          <label className="flex items-center gap-3 cursor-pointer group">
            <div className="relative shrink-0">
              <input
                type="checkbox"
                name="rememberMe"
                checked={loginForm.values.rememberMe}
                onChange={loginForm.handleChange}
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
              Remember me
            </span>
          </label>

          <button
            type="button"
            className="text-sm text-[var(--color-brand-accent)]
                   hover:text-[var(--color-brand-accent-light)]
                   transition-colors duration-200 shrink-0"
          >
            Forgot?
          </button>
        </div>

        <div className="pt-2">
          <Button
            type="submit"
            fullWidth
            isLoading={isLoading}
          >
            Sign In
          </Button>
        </div>
      </form>

      <SocialDivider />

      <footer className="mt-6 text-center border-t border-white/5 pt-5">
        <p className="text-[var(--color-brand-secondary)] text-sm">
          Don't have an account?{' '}
          <button
            onClick={handleToggle}
            className="text-white font-semibold
                  hover:text-[var(--color-brand-accent)] transition-colors duration-200"
          >
            Sign up for free
          </button>
        </p>
      </footer>
    </div>
  );
};
