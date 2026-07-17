import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

export const PublicOrCustomerRoute = ({ children }) => {
  const { isAuthenticated, user } = useAuthStore();

  if (isAuthenticated) {
    if (user?.role === 'ADMIN') {
      return <Navigate to="/admin" replace />;
    }
    if (user?.role === 'MANAGER') {
      return <Navigate to="/manager" replace />;
    }
  }

  return children;
};
