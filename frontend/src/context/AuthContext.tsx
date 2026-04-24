// ============================================================
// 📁 src/context/AuthContext.tsx
// ROLE: Global provider for authentication state
// ============================================================

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { 
  type AuthUser,
  type AuthError,
  type LoginCredentials,
  type RegisterCredentials
} from '../types/auth.types';
import { loginUser, registerUser, getCurrentUser, logout as logoutUser } from '../services/authService';
import { setAccessToken } from '../api/axios';

interface AuthContextType {
  user: AuthUser | null;
  isLoading: boolean;
  isInitializing: boolean;
  error: AuthError | null;
  login: (credentials: LoginCredentials) => Promise<{ user: AuthUser }>;
  register: (credentials: RegisterCredentials) => Promise<{ user: AuthUser }>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isInitializing, setIsInitializing] = useState<boolean>(true);
  const [error, setError] = useState<AuthError | null>(null);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const userProfile = await getCurrentUser();
        setUser(userProfile);
      } catch (err) {
        console.error("Startup Session Check Failed:", err);
      } finally {
        setIsInitializing(false);
      }
    };
    checkAuth();
  }, []);

  const login = useCallback(async (credentials: LoginCredentials) => {
    setIsLoading(true);
    setError(null);
    try {
      await loginUser(credentials);
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
      setAccessToken(null);
    }
  }, []);

  return (
    <AuthContext.Provider value={{
      user,
      isLoading,
      isInitializing,
      error,
      login,
      register,
      logout
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuthContext = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  return context;
};
