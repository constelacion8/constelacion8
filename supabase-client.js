import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.110.8/+esm';

const SUPABASE_URL = 'https://kvoldyeinvjajsimxmyc.supabase.co';
const SUPABASE_PUBLISHABLE_KEY = 'sb_publishable_AjQQNYKbCwaGNv_o1GopAw_TzyLkHXh';

export const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    storageKey: 'c8-auth'
  }
});
