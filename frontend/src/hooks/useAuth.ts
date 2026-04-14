// ============================================================
// 📁 src/hooks/useAuth.ts
// ROLE: Manages authentication state and actions
// ============================================================

import { useState, useCallback } from 'react';
import { 
  type AuthUser,
  type AuthError,
  type LoginCredentials,
  type RegisterCredentials
} from '../types/auth.types';
import { loginUser, registerUser } from '../services/authService';

export function useAuth() {
  /**
   * @hook useState — user
   * STORES: authenticated user object or null
   * WHY LOCAL: single-page app, no cross-route persistence needed here
   */
  const [user, setUser] = useState<AuthUser | null>(null);

  /**
   * @hook useState — isLoading
   * STORES: loading state for auth operations
   * WHY LOCAL: provides UI feedback during API calls
   */
  const [isLoading, setIsLoading] = useState<boolean>(false);

  /**
   * @hook useState — error
   * STORES: authentication-specific error messages
   * WHY LOCAL: allows showing global error banners above forms
   */
  const [error, setError] = useState<AuthError | null>(null);


  const [accessToken, setAccessToken] = useState<string | null>(null);

  /**
   * @hook useCallback — login
   * DOES: calls loginUser service, sets user or error state
   * MEMOISED BECAUSE: passed as prop to AuthPage — stable ref avoids unnecessary child re-renders
   * DEPS: [] — no external deps, service is a stable import
   */
  const login = useCallback(async (credentials: LoginCredentials) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await loginUser(credentials);
      setUser(response.user);
      return response;
    } catch (err) {
      const authError = err as AuthError;
      setError(authError);
      throw authError;
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * @hook useCallback — register
   * DOES: calls registerUser service, sets user or error state
   * MEMOISED BECAUSE: stable reference for form submission
   * DEPS: [] — all logic is self-contained or uses stable service
   */
  const register = useCallback(async (credentials: RegisterCredentials) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await registerUser(credentials);
      console.log("set")
      setUser(response.user);
      return response;
    } catch (err) {
      const authError = err as AuthError;
      setError(authError);
      throw authError;
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * @hook useCallback — logout
   * DOES: clears user state and errors
   * MEMOISED BECAUSE: potentially used in navigation cleanup
   * DEPS: [] — simple state reset
   */
  const logout = useCallback(() => {
    setUser(null);
    setError(null);
  }, []);

  return {
    user,
    isLoading,
    error,
    login,
    register,
    logout,
  };
}
