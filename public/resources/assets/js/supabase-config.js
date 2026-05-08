const SUPABASE_CONFIG = {
    url: 'https://znmbkxmnwuurzhevfxtq.supabase.co',
    key: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpubWJreG1ud3V1cnpoZXZmeHRxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ1Nzk1MDQsImV4cCI6MjA4MDE1NTUwNH0.y0m9rnug3WduVyuKZLL25PBA4C2Ys0_WSgMrzokSh5g'
};

// Expose to window immediately for other scripts
window.SUPABASE_CONFIG = SUPABASE_CONFIG;
console.log('✅ Supabase Config Loaded');
