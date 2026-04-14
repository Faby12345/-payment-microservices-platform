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

        // If error is 401 and we haven't retried yet
        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            try {
                // Call the refresh endpoint using GLOBAL axios
                // This ensures we don't trigger this interceptor again!
                const response = await axios.post(
                    `${BASE_URL}/auth/refresh`,
                    {},
                    { withCredentials: true }
                );

                const newAccessToken = response.data.accessToken;
                setAccessToken(newAccessToken);

                // Update the failed request and retry
                if (originalRequest.headers) {
                    originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
                }
                return api(originalRequest);

            } catch (refreshError) {
                // Refresh also failed - session is dead
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
