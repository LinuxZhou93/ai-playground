-- =========================================================================
-- Supabase Schema Backend initialization for TITAN AI Assistant 
-- =========================================================================
-- Execution Log: Directly implemented in Supabase using Browser Subagent
-- Auto-commit for version control documentation.
-- =========================================================================

-- 1. Create table for persisting cross-device unified chat histories.
CREATE TABLE IF NOT EXISTS public.ai_chat_sessions (
   user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
   history jsonb NOT NULL DEFAULT '[]'::jsonb,
   updated_at timestamp with time zone DEFAULT now()
);

-- 2. Enforce High-Security Row Level Access
ALTER TABLE public.ai_chat_sessions ENABLE ROW LEVEL SECURITY;

-- 3. Policy: User Data Privacy Isolation
CREATE POLICY "Users can manage their own chat sessions"
ON public.ai_chat_sessions
FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);
