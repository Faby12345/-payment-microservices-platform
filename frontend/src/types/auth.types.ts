// ============================================================
// 📁 src/types/auth.types.ts
// ROLE: Type definitions for authentication data and states
// ============================================================

export interface LoginCredentials {
  email:       string;
  password:    string;
  rememberMe:  boolean;
}

export interface RegisterCredentials {
  fullName:         string;
  email:            string;
  password:         string;
  confirmPassword:  string;
  acceptTerms:      boolean;
}

export interface AuthUser {
  id:        string;
  email:     string;
  firstName: string;
  lastName:  string;
  roles:     string[];  // Java Set<String> -> TypeScript string[]
}

export interface AuthResponse {
  user:   AuthUser;
}
export interface LoginResponse {
  accessToken: string;
}

export interface AuthError {
  message: string;
  field?:  string;
}

export interface AuthState {
  user:      AuthUser | null;
  isLoading: boolean;
  error:     AuthError | null;
}
