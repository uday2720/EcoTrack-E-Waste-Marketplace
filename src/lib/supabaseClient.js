import { createClient } from '@supabase/supabase-js';

/**
 * EcoTrack Supabase client
 *
 * Required Vite environment variables (create .env.local in the project root):
 * VITE_SUPABASE_URL=https://YOUR_PROJECT_ID.supabase.co
 * VITE_SUPABASE_PUBLISHABLE_KEY=YOUR_SUPABASE_PUBLISHABLE_KEY
 *
 * Use only the project's publishable/anon key in browser code.
 * NEVER use a service_role or secret key here.
 */
const env = (typeof import.meta !== 'undefined' && import.meta.env) ? import.meta.env : (typeof process !== 'undefined' && process.env) ? process.env : {};
const supabaseUrl = env.VITE_SUPABASE_URL?.trim();
const supabaseKey = env.VITE_SUPABASE_PUBLISHABLE_KEY?.trim();

export const isSupabaseConfigured = Boolean(
  supabaseUrl &&
  supabaseKey &&
  !supabaseUrl.includes('YOUR_PROJECT_ID')
);

if (!isSupabaseConfigured) {
  console.info(
    '%c[EcoTrack]%c Supabase credentials not found or unconfigured. Running in offline/demo mode with mock listings. Add VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY to .env.local to enable real backend persistence.',
    'color: #16a34a; font-weight: bold;',
    'color: inherit;'
  );
}

// Fallback to a valid placeholder client to prevent bundle-level crashes during development
const effectiveUrl = isSupabaseConfigured ? supabaseUrl : 'https://placeholder.supabase.co';
const effectiveKey = isSupabaseConfigured ? supabaseKey : 'placeholder-anon-key';

export const supabase = createClient(effectiveUrl, effectiveKey, {
  auth: {
    persistSession: isSupabaseConfigured,
    autoRefreshToken: isSupabaseConfigured,
    detectSessionInUrl: isSupabaseConfigured,
  },
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
  },
});

export default supabase;
