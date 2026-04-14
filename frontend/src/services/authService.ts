// ============================================================
// 📁 src/services/authService.ts
// ROLE: Mock API service for authentication requests
// ============================================================

import {
  type LoginCredentials,
  type RegisterCredentials,
  type AuthResponse,
  type LoginResponse
} from '../types/auth.types';

import {api} from "../api/axios";
import axios from "axios";

const API_BASE_URL = 'http://localhost:8080/api/v1/auth';

/**
 * loginUser
 * Simulates an async login request with mock latency.
 * Throws error if email is 'wrong@test.com'.
 */
export async function loginUser(credentials: LoginCredentials): Promise<LoginResponse> {
  const email = credentials.email;
  const password = credentials.password;

  const response = await fetch(`${API_BASE_URL}/login`, {
    method: 'POST',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      email: email,
      password: password
    }),

  });

  const data = await response.json();

  if (!response.ok) {
    // Backend returns ErrorResponse with a list of error strings
    const errorMessage = data.errors && data.errors.length > 0
        ? data.errors[0]
        : (data.message || 'Login failed');

    throw {
      message: errorMessage,
    };
  }

  return {
    accessToken: data.accessToken,
  };
}

/**
 * registerUser
 * Calls the backend API registration endpoint.
 */
export async function registerUser(credentials: RegisterCredentials): Promise<AuthResponse> {
  // Split fullName into firstName and lastName (backend requirement)
  const nameParts = credentials.fullName.trim().split(/\s+/);
  const firstName = nameParts[0] || '';
  const lastName = nameParts.length > 1 ? nameParts.slice(1).join(' ') : ' '; // Space if missing to satisfy NotBlank

  try {
    const { data } = await api.post('/auth/register', {
      firstName,
      lastName,
      email: credentials.email,
      password: credentials.password,
    });
    return {
      user: {
        id: data.id,
        email: data.email,
        firstName: data.firstName,
        lastName: data.lastName
      }
    };
  } catch (error: unknown){

    // Path: error.response.data.errors[0]
    if (axios.isAxiosError(error)) {
      const message = error.response?.data?.errors?.[0] || 'An error occurred';
           throw { message };
        }
      // it is not an axios error
      throw { message: 'A system error occurred' };
  }
}
