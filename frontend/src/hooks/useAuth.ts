// ============================================================
// 📁 src/hooks/useAuth.ts
// ROLE: Manages authentication state and actions
// ============================================================

import { useState, useCallback, useEffect } from 'react';
import { 
  type AuthUser,
  type AuthError,
  type LoginCredentials,
  type RegisterCredentials
} from '../types/auth.types';
import { loginUser, registerUser, getCurrentUser } from '../services/authService';

export function useAuth() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isInitializing, setIsInitializing] = useState<boolean>(true); // NEW: Startup check state
  const [error, setError] = useState<AuthError | null>(null);

  /**
   * @hook useEffect — checkAuthOnStartup
   * DOES: Silent refresh / session check when the app loads
   */
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const userProfile = await getCurrentUser();
        setUser(userProfile);
      } catch (err) {
        // Silently fail if no session is active - user stays null
        console.debug("No active session on startup");
      } finally {
        setIsInitializing(false);
      }
    };
    checkAuth();
  }, []);

  /**
   * @hook useCallback — login
   * DOES: 1. Get Token (via loginUser) 2. Get Profile (via getCurrentUser)
   */
  const login = useCallback(async (credentials: LoginCredentials) => {
    setIsLoading(true);
    setError(null);
    try {
      // Step 1: Login to get token (Interceptors handle storage)
      await loginUser(credentials);
      
      // Step 2: Fetch full profile using the new token
      const userProfile = await getCurrentUser();
      
      setUser(userProfile);
      return { user: userProfile };
    } catch (err) {
      const authError = err as AuthError;
      setError(authError);
      throw authError;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const register = useCallback(async (credentials: RegisterCredentials) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await registerUser(credentials);
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

  const logout = useCallback(() => {
    setUser(null);
    setError(null);
    // TODO: Add call to authService.logout() to clear cookies on backend
  }, []);

  return {
    user,
    isLoading,
    isInitializing, // NEW: Expose initializing state for splash screens
    error,
    login,
    register,
    logout,
  };
}
