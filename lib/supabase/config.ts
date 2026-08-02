const publicUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

export const isSupabasePublicConfigured = Boolean(publicUrl && anonKey);
export const isSupabaseServerConfigured = Boolean(
  publicUrl && (serviceKey || anonKey),
);

export const buildSafeSupabaseUrl = publicUrl || "http://127.0.0.1:54321";
export const buildSafeSupabaseAnonKey = anonKey || "local-demo-anon-key";
export const buildSafeSupabaseServerKey =
  serviceKey || anonKey || "local-demo-server-key";
