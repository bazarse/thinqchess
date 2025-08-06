// Supabase configuration and client
import { createClient } from '@supabase/supabase-js';

// Check if Supabase should be initialized
const isSupabaseEnabled = process.env.NEXT_PUBLIC_DEVELOPMENT_MODE !== 'true';

let supabase = null;

// Initialize Supabase only in production mode
if (isSupabaseEnabled) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (supabaseUrl && supabaseAnonKey) {
    supabase = createClient(supabaseUrl, supabaseAnonKey);
  } else {
    console.warn('Supabase credentials not found in environment variables');
  }
}

// Export Supabase client (will be null in development mode)
export { supabase };

// Helper function to get Supabase client
export const getSupabase = () => {
  if (!isSupabaseEnabled) {
    throw new Error('Supabase not available in development mode');
  }
  
  if (!supabase) {
    throw new Error('Supabase not initialized. Check your environment variables.');
  }
  
  return supabase;
};

// Check if Supabase is available
export const isSupabaseAvailable = () => {
  return isSupabaseEnabled && supabase !== null;
};

export default supabase;
