# Database Setup Guide

## Prerequisites
- Supabase account (https://supabase.com)
- Project created in Supabase

## Setup Steps

### 1. Create Supabase Project
1. Go to https://supabase.com/dashboard
2. Click "New Project"
3. Enter project details:
   - Name: `coding-platform` (or your choice)
   - Database Password: (save this securely)
   - Region: Choose closest to your users

### 2. Run Database Schema
1. In Supabase Dashboard, go to **SQL Editor**
2. Click "New Query"
3. Copy the entire content of `schema.sql`
4. Paste and click "Run"
5. Verify tables are created in **Table Editor**

### 3. Configure Authentication
1. Go to **Authentication** → **Providers**
2. Enable **GitHub** provider:
   - Create GitHub OAuth App: https://github.com/settings/developers
   - Callback URL: `https://<your-project-ref>.supabase.co/auth/v1/callback`
   - Copy Client ID and Secret to Supabase
3. (Optional) Enable **Email** provider if needed

### 4. Get API Keys
1. Go to **Settings** → **API**
2. Copy:
   - **Project URL**: `https://<your-project-ref>.supabase.co`
   - **anon public** key (for client-side)
3. Update `assets/js/supabase-client.js` with these values

### 5. Test Connection
1. Open your app in browser
2. Open DevTools Console
3. Run: `SupabaseClient.client.from('projects').select('*')`
4. Should return empty array (no error)

## Database Structure

### Tables
- `profiles` - User profiles
- `projects` - Coding projects
- `project_likes` - Like relationships
- `project_comments` - Project comments

### Security
- Row Level Security (RLS) enabled on all tables
- Users can only modify their own data
- Public can view published projects

## Seed Data (Optional)

To add demo projects for testing:

```sql
-- Insert test user (replace with your auth.users ID)
INSERT INTO profiles (id, username, avatar_url)
VALUES 
  ('your-user-id-here', 'demo_user', 'https://i.pravatar.cc/150?img=1');

-- Insert demo project
INSERT INTO projects (
  title, description, author_id, author_name,
  type, difficulty, tags, is_published
) VALUES (
  'My First Game',
  'A simple platformer game made with Scratch',
  'your-user-id-here',
  'demo_user',
  'scratch',
  'beginner',
  ARRAY['游戏', '平台'],
  true
);
```

## Troubleshooting

### "relation does not exist" error
- Make sure you ran the entire `schema.sql` file
- Check if tables exist in Table Editor

### "JWT expired" or auth errors
- Clear browser localStorage
- Re-login to refresh session

### RLS policy errors
- Verify you're logged in
- Check RLS policies in Table Editor → Policies tab

## Next Steps
1. Update frontend to use `SupabaseProjects` API
2. Test CRUD operations
3. Deploy to production
