import { PostgrestError } from '@supabase/supabase-js';
import { supabase } from '../integrations/supabase/client';

// Re-export the supabase client for other parts of the app
export { supabase };

// Utility function to handle Supabase errors
export const handleSupabaseError = (error: PostgrestError) => {
  console.error('Supabase error:', error);
  return {
    error: error.message || 'Une erreur est survenue lors de la communication avec la base de données',
  };
};

// Helper functions for database operations
export const fetchOffers = async () => {
  const { data, error } = await supabase
    .from('offers')
    .select('*')
    .order('price');
  
  if (error) return { error: handleSupabaseError(error) };
  return { data };
};

export const fetchOfferById = async (id: string) => {
  const { data, error } = await supabase
    .from('offers')
    .select('*')
    .eq('id', id)
    .single();
  
  if (error) return { error: handleSupabaseError(error) };
  return { data };
};

export const fetchUserReservations = async (userId: string) => {
  const { data, error } = await supabase
    .from('reservations')
    .select(`
      *,
      offers(name, description, price),
      transactions(id, status, created_at),
      e_tickets(qr_code_url, is_used)
    `)
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  
  if (error) return { error: handleSupabaseError(error) };
  return { data };
};

export const fetchAdminSalesData = async () => {
  const { data, error } = await supabase
    .from('offers')
    .select(`
      id,
      name,
      price,
      reservations(count)
    `);
  
  if (error) return { error: handleSupabaseError(error) };
  return { data };
};
