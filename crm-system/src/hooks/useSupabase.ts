import { supabase } from '../services/supabase';

// Supabase hook
export const useSupabase = () => {
  return {
    client: supabase,
    // TODO: Add common Supabase operations
  };
};