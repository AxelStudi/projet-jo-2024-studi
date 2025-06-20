
import { create } from 'zustand';
import { supabase } from '../supabase/supabaseClient';
import { toast } from 'react-toastify';

interface MfaState {
  isSetupMode: boolean;
  qrCodeUrl: string | null;
  secret: string | null;
  backupCodes: string[] | null;
  isLoading: boolean;
  error: string | null;
  setupMfa: () => Promise<{ success: boolean; error?: string }>;
  enableMfa: (token: string) => Promise<{ success: boolean; error?: string }>;
  verifyMfa: (token: string) => Promise<{ success: boolean; error?: string }>;
  disableMfa: (token: string) => Promise<{ success: boolean; error?: string }>;
  reset: () => void;
}

export const useMfaStore = create<MfaState>((set, get) => ({
  isSetupMode: false,
  qrCodeUrl: null,
  secret: null,
  backupCodes: null,
  isLoading: false,
  error: null,

  setupMfa: async () => {
    set({ isLoading: true, error: null });
    
    try {
      const { data, error } = await supabase.functions.invoke('mfa-setup', {
        body: JSON.stringify({ action: 'setup' })
      });
      
      if (error) {
        console.error('MFA setup error:', error);
        const errorMessage = 'Erreur de configuration MFA';
        set({ error: errorMessage, isLoading: false });
        return { success: false, error: errorMessage };
      }
      
      if (!data?.success) {
        const errorMessage = data?.error || 'Erreur de configuration MFA';
        set({ error: errorMessage, isLoading: false });
        return { success: false, error: errorMessage };
      }
      
      set({
        qrCodeUrl: data.qrCodeUrl || null,
        secret: data.secret || null,
        isSetupMode: true,
        isLoading: false,
        error: null
      });
      
      return { success: true };
    } catch (error) {
      console.error('MFA setup error:', error);
      const errorMessage = 'Erreur lors de la configuration MFA';
      set({ error: errorMessage, isLoading: false });
      return { success: false, error: errorMessage };
    }
  },

  enableMfa: async (token: string) => {
    const state = get();
    set({ isLoading: true, error: null });
    
    try {
      const { data, error } = await supabase.functions.invoke('mfa-setup', {
        body: JSON.stringify({ 
          action: 'enable',
          token
        }),
        headers: {
          'X-MFA-Secret': state.secret || ''
        }
      });
      
      if (error) {
        console.error('MFA enable error:', error);
        const errorMessage = 'Erreur lors de l\'activation MFA';
        set({ error: errorMessage, isLoading: false });
        return { success: false, error: errorMessage };
      }
      
      if (!data?.success) {
        const errorMessage = data?.error || 'Code invalide';
        set({ error: errorMessage, isLoading: false });
        return { success: false, error: errorMessage };
      }
      
      set({ 
        isLoading: false, 
        isSetupMode: false,
        backupCodes: data.backupCodes || null,
        error: null
      });
      
      toast.success('Authentification à deux facteurs activée avec succès');
      return { success: true };
    } catch (error) {
      console.error('MFA enable error:', error);
      const errorMessage = 'Erreur lors de l\'activation MFA';
      set({ error: errorMessage, isLoading: false });
      return { success: false, error: errorMessage };
    }
  },

  verifyMfa: async (token: string) => {
    set({ isLoading: true, error: null });
    
    try {
      const { data, error } = await supabase.functions.invoke('mfa-setup', {
        body: JSON.stringify({ 
          action: 'verify',
          token
        })
      });
      
      if (error) {
        console.error('MFA verification error:', error);
        const errorMessage = 'Erreur de vérification MFA';
        set({ error: errorMessage, isLoading: false });
        return { success: false, error: errorMessage };
      }
      
      if (!data?.success) {
        const errorMessage = data?.error || 'Code invalide';
        set({ error: errorMessage, isLoading: false });
        return { success: false, error: errorMessage };
      }
      
      set({ isLoading: false, error: null });
      return { success: true };
    } catch (error) {
      console.error('MFA verification error:', error);
      // Ne pas afficher d'erreur pour les codes invalides, c'est normal
      const errorMessage = 'Code invalide';
      set({ error: null, isLoading: false }); // Pas d'erreur dans le store
      return { success: false, error: errorMessage };
    }
  },

  disableMfa: async (token: string) => {
    set({ isLoading: true, error: null });
    
    try {
      const { data, error } = await supabase.functions.invoke('mfa-setup', {
        body: JSON.stringify({ 
          action: 'disable',
          token
        })
      });
      
      if (error) {
        console.error('MFA disable error:', error);
        // Si l'erreur est liée à un code invalide (400 Bad Request)
        if (error.message && error.message.includes('non-2xx status code')) {
          const errorMessage = 'Code invalide';
          set({ error: errorMessage, isLoading: false });
          return { success: false, error: errorMessage };
        } else {
          const errorMessage = 'Erreur lors de la désactivation MFA';
          set({ error: errorMessage, isLoading: false });
          return { success: false, error: errorMessage };
        }
      }
      
      if (!data?.success) {
        const errorMessage = data?.error || 'Code invalide';
        set({ error: errorMessage, isLoading: false });
        return { success: false, error: errorMessage };
      }
      
      set({ isLoading: false, error: null });
      toast.success('Authentification à deux facteurs désactivée');
      return { success: true };
    } catch (error: any) {
      console.error('MFA disable error:', error);
      // Amélioration de la gestion des erreurs pour les erreurs 400
      if (error.message && error.message.includes('non-2xx status code')) {
        const errorMessage = 'Code invalide';
        set({ error: errorMessage, isLoading: false });
        toast.error('Code invalide. Veuillez réessayer.');
        return { success: false, error: errorMessage };
      } else {
        const errorMessage = 'Erreur lors de la désactivation MFA';
        set({ error: errorMessage, isLoading: false });
        return { success: false, error: errorMessage };
      }
    }
  },

  reset: () => {
    set({
      isSetupMode: false,
      qrCodeUrl: null,
      secret: null,
      backupCodes: null,
      isLoading: false,
      error: null
    });
  }
}));
