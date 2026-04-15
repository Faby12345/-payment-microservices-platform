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
import { loginUser, registerUser, getCurrentUser, logout as logoutUser } from '../services/authService';
import { setAccessToken } from '../api/axios';

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
        console.log("Startup Check: Profile fetched successfully:", userProfile);
        setUser(userProfile);
      } catch (err) {
        console.error("Startup Session Check Failed (No active session):", err);
        // We stay in null state (Login page) which is correct if no token exists
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

  const logout = useCallback(async () => {
    try {
      await logoutUser();
    } finally {
      setUser(null);
      setError(null);
      setAccessToken(null); // Clear local token
    }
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
