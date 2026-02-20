import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,      // Save session to localStorage
    autoRefreshToken: true,    // Auto-refresh before it expires
    detectSessionInUrl: true,  // Handle auth redirects
    storageKey: 'amilax-auth', // Unique key so it doesn't clash
  }
})