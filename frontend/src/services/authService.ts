// ============================================================
// 📁 src/services/authService.ts
// ROLE: Mock API service for authentication requests
// ============================================================

import {
  type LoginCredentials,
  type RegisterCredentials,
  type AuthResponse,
  type AuthUser
} from '../types/auth.types';

const MOCK_USER: AuthUser = {
  id: 'usr_12345',
  email: 'test@example.com',
  fullName: 'John Doe'
};

/**
 * loginUser
 * Simulates an async login request with mock latency.
 * Throws error if email is 'wrong@test.com'.
 */
export async function loginUser(credentials: LoginCredentials): Promise<AuthResponse> {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (credentials.email === 'wrong@test.com') {
        reject({ message: 'Invalid email or password' });
      } else {
        resolve({
          user: { ...MOCK_USER, email: credentials.email },
          token: 'mock_jwt_token_xxxxxx'
        });
      }
    }, 1200);
  });
}

/**
 * registerUser
 * Simulates an async registration request.
 * Throws error if email contains 'taken'.
 */
export async function registerUser(credentials: RegisterCredentials): Promise<AuthResponse> {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (credentials.email.includes('taken')) {
        reject({ message: 'This email is already registered', field: 'email' });
      } else {
        resolve({
          user: {
            id: 'usr_new_' + Math.random().toString(36).substr(2, 5),
            email: credentials.email,
            fullName: credentials.fullName
          },
          token: 'mock_jwt_token_yyyyyy'
        });
      }
    }, 1200);
  });
}
