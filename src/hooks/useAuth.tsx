
import { useEffect, useRef } from 'react';
import { useAuthStore } from '../stores/authStore';

export const useAuth = () => {
  const { user, isLoading, isAuthenticated, isAdmin, checkAuth } = useAuthStore();
  const hasCheckedAuth = useRef(false);

  useEffect(() => {
    // Ne vérifier l'auth qu'une seule fois au montage du composant
    if (!hasCheckedAuth.current) {
      hasCheckedAuth.current = true;
      checkAuth();
    }
  }, [checkAuth]);

  return {
    user,
    isLoading,
    isAuthenticated,
    isAdmin
  };
};

export const useAuthActions = () => {
  const { login, register, logout, clearError } = useAuthStore();
  
  return {
    login,
    register,
    logout,
    clearError
  };
};
