import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.119.2';

export const SUPABASE_URL = 'https://fefvytprogasugctxdom.supabase.co';
export const SUPABASE_PUBLISHABLE_KEY = 'sb_publishable_xhdlCMR97qQGNiIXtx1s2g_-V9jVpPy';

export const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
});
