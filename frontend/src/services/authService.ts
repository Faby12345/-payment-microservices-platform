// ============================================================
// 📁 src/services/authService.ts
// ROLE: Mock API service for authentication requests
// ============================================================

import {
  type LoginCredentials,
  type RegisterCredentials,
  type AuthUser,
  type AuthResponse,
  type LoginResponse
} from '../types/auth.types';

import {api} from "../api/axios";
import axios from "axios";
import {setAccessToken} from "../api/axios";


/**
 * loginUser
 * Simulates an async login request with mock latency.
 * Throws error if email is 'wrong@test.com'.
 */
export async function loginUser(credentials: LoginCredentials): Promise<LoginResponse> {
  const email = credentials.email;
  const password = credentials.password;

  try {
    const { data } = await api.post('/auth/login', {
      email,
      password,
    });
    setAccessToken(data.accessToken)

    return {
      accessToken: data.accessToken
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
        lastName: data.lastName,
        roles: data.roles
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

/**
 * getCurrentUser
 * Fetches the currently authenticated user's profile from the /me endpoint.
 * Note: No parameters needed because the interceptor adds the token!
 */
export async function getCurrentUser(): Promise<AuthUser> {
  try {
    const { data } = await api.get('/auth/me');
    return data; // Backend returns UserResponseDto which matches AuthUser
  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      const message = error.response?.data?.errors?.[0] || 'Failed to fetch user profile';
      throw { message };
    }
    throw { message: 'A system error occurred' };
  }
}
export async function logout() : Promise<void> {
  try {
    await api.post('/auth/logout');
  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      console.error("Logout on backend failed", error);
    }
  }
}
