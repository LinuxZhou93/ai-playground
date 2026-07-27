import { createClient } from '@supabase/supabase-js';

const configuredUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const configuredKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
export const isSupabaseConfigured = Boolean(configuredUrl && configuredKey);

if (!isSupabaseConfigured) {
  console.warn('[Supabase] Public URL or anon key is missing. Using an inert local client for build and demo mode.');
}

// Keep module evaluation build-safe without contacting an unrelated remote project.
export const supabase = createClient(
  isSupabaseConfigured ? configuredUrl! : 'http://127.0.0.1:54321',
  isSupabaseConfigured ? configuredKey! : 'local-demo-anon-key',
  {
    auth: {
      persistSession: isSupabaseConfigured,
      autoRefreshToken: isSupabaseConfigured,
    },
  },
);

/**
 * Get the current user from localStorage fallback
 * (Eventually replace with Supabase Auth)
 */
export function getCurrentUser() {
  if (typeof window === 'undefined') return null;
  const email = localStorage.getItem('current_user_email');
  return email ? { email, id: email } : null; // ID-Mock
}
