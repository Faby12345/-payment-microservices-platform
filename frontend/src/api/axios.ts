import axios from 'axios'

const BASE_URL = 'http://localhost:8080/api/v1';

export const api = axios.create({

    baseURL: BASE_URL,
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json',
    },
});


api.interceptors.request.use(
    (config) => {
        const token = getAccessToken();

        if (token && config.headers) {
            config.headers.Authorization = `Bearer ${token}`;
        }

        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;
        console.log(`Interceptor: Error caught [${error.response?.status}] for ${originalRequest.url}`);

        if ((error.response?.status === 401 || error.response?.status === 403) && !originalRequest._retry) {
            console.log("Interceptor: 401/403 detected, attempting refresh...");
            originalRequest._retry = true;

            try {
                const response = await axios.post(
                    `${BASE_URL}/auth/refresh`,
                    {},
                    { withCredentials: true }
                );

                const newAccessToken = response.data.accessToken;
                console.log("Interceptor: Refresh successful, new token obtained.");
                setAccessToken(newAccessToken);

                if (originalRequest.headers) {
                    originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
                }
                
                console.log("Interceptor: Retrying original request...");
                return api(originalRequest);

            } catch (refreshError) {
                console.error("Interceptor: Refresh failed!", refreshError);
                setAccessToken(null);
                return Promise.reject(refreshError);
            }
        }

        return Promise.reject(error);
    }
);

let accessToken: string | null = null;

export const setAccessToken = (newToken : string | null ) => {
    accessToken = newToken;
}

export const getAccessToken = () => accessToken;
