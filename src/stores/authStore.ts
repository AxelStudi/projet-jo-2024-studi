import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { supabase } from '../integrations/supabase/client';
import apiClient from '../api/apiClient';
import { AxiosError } from 'axios';
import { toast } from 'react-toastify';

// Définition des types pour le state et les actions
interface UserProfile {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  is_admin: boolean;
}

interface AuthState {
  user: UserProfile | null;
  token: string | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isLoading: boolean;
  isInitialized: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, firstName: string, lastName: string) => Promise<boolean>;
  logout: () => void;
  checkAuth: () => Promise<void>;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      // State initial
      user: null,
      token: null,
      isAuthenticated: false,
      isAdmin: false,
      isLoading: false,
      isInitialized: false, // Sera mis à true après la vérification initiale
      error: null,

      // Actions
      login: async (email, password) => {
        set({ isLoading: true, error: null });
        try {
          const response = await apiClient.post('/users/login', {
            email: email,
            password: password,
          });
          
          const { access_token, user_profile } = response.data;

          // Informer le client Supabase de la session actuelle pour que RLS fonctionne
          supabase.auth.setSession({ access_token, refresh_token: '' });
          
          set({
            user: user_profile,
            token: access_token,
            isAuthenticated: true,
            isAdmin: user_profile.is_admin,
            isLoading: false,
          });
          
          toast.success('Connexion réussie !');
        } catch (error) {
          let errorMessage = 'Une erreur est survenue lors de la connexion.';
          if (error instanceof AxiosError && error.response) {
            errorMessage = error.response.data?.detail || errorMessage;
          }
          set({ error: errorMessage, isLoading: false });
          toast.error(errorMessage);
        }
      },

      register: async (email, password, firstName, lastName) => {
        set({ isLoading: true, error: null });
        try {
          await apiClient.post('/users/register', {
            email,
            password,
            first_name: firstName,
            last_name: lastName,
          });
          
          set({ isLoading: false });
          toast.success('Inscription réussie ! Vous pouvez maintenant vous connecter.');
          return true;
        } catch (error) {
          let errorMessage = "Une erreur est survenue lors de l'inscription.";
          if (error instanceof AxiosError && error.response) {
            errorMessage = error.response.data?.detail || errorMessage;
          }
          set({ error: errorMessage, isLoading: false });
          toast.error(errorMessage);
          return false;
        }
      },

      logout: () => {
        // Vider la session du client Supabase en plus de celle de l'app
        supabase.auth.signOut();
        set({
          user: null,
          token: null,
          isAuthenticated: false,
          isAdmin: false,
        });
        toast.info('Vous avez été déconnecté.');
      },

      checkAuth: async () => {
        const token = get().token;
        if (!token) {
          set({ isInitialized: true, isLoading: false, user: null, token: null });
          return;
        }

        // Restaurer la session dans le client Supabase au chargement de l'app
        supabase.auth.setSession({ access_token: token, refresh_token: '' });

        try {
          // Valider le token auprès du backend pour s'assurer qu'il est toujours valide
          const response = await apiClient.get('/users/me');
          const user_profile = response.data;
          set({
            user: user_profile,
            isAuthenticated: true,
            isAdmin: user_profile.is_admin,
            isInitialized: true,
            isLoading: false,
          });
        } catch (error) {
          // Si le token n'est plus valide, vider la session partout
          supabase.auth.signOut();
          set({
            user: null,
            token: null,
            isAuthenticated: false,
            isAdmin: false,
            isInitialized: true,
            isLoading: false,
          });
        }
      },

      clearError: () => {
        set({ error: null });
      },
    }),
    {
      name: 'auth-storage', // Clé pour le localStorage
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ token: state.token }), // Ne persister que le token
    }
  )
);
