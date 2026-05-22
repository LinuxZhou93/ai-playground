import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://znmbkxmnwuurzhevfxtq.supabase.co';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

if (!supabaseKey) {
  console.warn('[Supabase] Missing NEXT_PUBLIC_SUPABASE_ANON_KEY. Client may not function correctly.');
}

export const supabase = createClient(supabaseUrl, supabaseKey);

/**
 * Get the current user from localStorage fallback
 * (Eventually replace with Supabase Auth)
 */
export function getCurrentUser() {
  if (typeof window === 'undefined') return null;
  const email = localStorage.getItem('current_user_email');
  return email ? { email, id: email } : null; // ID-Mock
}
