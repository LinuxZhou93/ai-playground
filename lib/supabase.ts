import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://znmbkxmnwuurzhevfxtq.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpubWJreG1ud3V1cnpoZXZmeHRxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ1Nzk1MDQsImV4cCI6MjA4MDE1NTUwNH0.y0m9rnug3WduVyuKZLL25PBA4C2Ys0_WSgMrzokSh5g';

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
