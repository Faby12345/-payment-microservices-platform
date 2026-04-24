import axios, { type AxiosInstance } from 'axios';


const getBaseUrl = (envUrl: string) => {
    const host = window.location.hostname;
    // If we are browsing via an IP (phone), replace 'localhost' with that IP
    return envUrl.replace('localhost', host).replace('127.0.0.1', host);
};

const AUTH_BASE_URL = getBaseUrl(import.meta.env.VITE_AUTH_API_BASE_URL);
const WALLET_BASE_URL = getBaseUrl(import.meta.env.VITE_WALLET_API_BASE_URL);

// Token storage (Internal to this module)
let accessToken: string | null = null;

export const setAccessToken = (newToken: string | null) => {
    accessToken = newToken;
};

export const getAccessToken = () => accessToken;

/**
 * Factory function to create synchronized instances
 */
const createServiceInstance = (baseURL: string): AxiosInstance => {
    const instance = axios.create({
        baseURL,
        withCredentials: true,
        headers: {
            'Content-Type': 'application/json',
        },
    });

    // Request Interceptor: Attach JWT to every call
    instance.interceptors.request.use((config) => {
        const token = getAccessToken();
        if (token && config.headers) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    });

    // Response Interceptor: Handle 401 Unauthorized (Token Refresh)
    instance.interceptors.response.use(
        (response) => response,
        async (error) => {
            const originalRequest = error.config;
            
            // If error is 401/403 and we haven't tried refreshing yet
            if ((error.response?.status === 401 || error.response?.status === 403) && !originalRequest._retry) {
                originalRequest._retry = true;

                try {
                    // Always use AUTH_BASE_URL for the refresh call
                    const response = await axios.post(`${AUTH_BASE_URL}/auth/refresh`, {}, { withCredentials: true });
                    const newAccessToken = response.data.accessToken;
                    
                    setAccessToken(newAccessToken);
                    
                    if (originalRequest.headers) {
                        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
                    }
                    
                    return instance(originalRequest);
                } catch (refreshError) {
                    setAccessToken(null);
                    return Promise.reject(refreshError);
                }
            }
            return Promise.reject(error);
        }
    );

    return instance;
};

//  Export specific instances for your services
export const authApi = createServiceInstance(AUTH_BASE_URL);
export const walletApi = createServiceInstance(WALLET_BASE_URL);

/**
 * Compatibility Export
 * Keeps existing code working by aliasing authApi as 'api'
 */
export const api = authApi;
