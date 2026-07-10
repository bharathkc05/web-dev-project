import { useAuthStore } from '../store/authStore';
import { authService } from '../features/auth/services/auth.service';

export const useAuth = () => {
  const { user, token, isAuthenticated, setAuth, logout: clearAuth } = useAuthStore();

  const login = async (credentials) => {
    try {
      const response = await authService.login(credentials);
      setAuth(response.data.user, response.data.accessToken, response.data.refreshToken);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  };

  const signup = async (data) => {
    try {
      const response = await authService.signup(data);
      setAuth(response.data.user, response.data.accessToken, response.data.refreshToken);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  };

  const logout = async () => {
    try {
      // Call backend to invalidate token/cookie
      await authService.logout();
    } catch (error) {
      console.error('Logout error', error);
    } finally {
      clearAuth();
      window.location.href = '/';
    }
  };

  return {
    user,
    token,
    isAuthenticated,
    login,
    signup,
    logout,
  };
};
