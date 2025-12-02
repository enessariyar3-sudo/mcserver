import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

// Environment variables kullan (Netlify'da ayarlanacak)
// Fallback olarak mevcut değerler kullanılır (development için)
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || "https://bxhnxfwrumeqvnpwymin.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ4aG54ZndydW1lcXZucHd5bWluIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM0NDI5MDUsImV4cCI6MjA2OTAxODkwNX0.YXWu3lJQkUfo7PLe1NlYy3yTMIUH4SWS_bHcwpG_na0";

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    storage: localStorage,
    persistSession: true,
    autoRefreshToken: true,
  }
});