import axios from 'axios';
import { useAuthStore } from '../store/authStore';

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config) => {
    // Dynamically get the token from authStore
    const token = useAuthStore.getState().token;
    
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
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // Handle 401 Unauthorized errors and attempt token refresh
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const authState = useAuthStore.getState();
        const userId = authState.user?._id || authState.user?.id;
        const refreshToken = authState.refreshToken;
        
        if (!userId || !refreshToken) {
          throw new Error("Missing user info or refresh token");
        }

        // Attempt to refresh the token
        const response = await axios.post(`${import.meta.env.VITE_API_URL}/auth/refresh`, {
          userId,
          refreshToken
        });

        const newToken = response.data.data.accessToken;
        const newRefreshToken = response.data.data.refreshToken;
        const user = response.data.data.user || authState.user;
        
        // Update the token in store
        authState.setAuth(user, newToken, newRefreshToken);

        // Update authorization header for the original request and retry
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        // Handle refresh failure (e.g., logout user)
        useAuthStore.getState().logout();
        window.location.href = '/';
        
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);
