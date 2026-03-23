-- =========================================================================
-- TITAN AI - Data Lake Optimization (High-Fidelity Evolution)
-- Purpose: Support high-volume user behavior analysis for future unicorn scaling.
-- =========================================================================

-- 1. Create a "Write-Ahead" Log table for granular message tracking
-- This table is optimized for INSERT-ONLY performance to minimize overhead.
CREATE TABLE IF NOT EXISTS public.ai_chat_logs (
    id bigserial PRIMARY KEY,
    user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
    session_id uuid, -- Optional: group messages into sessions
    role text NOT NULL, -- 'user' or 'assistant'
    content text NOT NULL,
    metadata jsonb DEFAULT '{}'::jsonb, -- Store tags, tokens, Latency, etc.
    created_at timestamp with time zone DEFAULT now()
);

-- 2. Add an index for lightning-fast analysis queries by User and Time
CREATE INDEX IF NOT EXISTS idx_chat_logs_user_time ON public.ai_chat_logs (user_id, created_at DESC);

-- 3. Security: Restricted Read-only for Analytics (unless Admin)
ALTER TABLE public.ai_chat_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can insert their own logs"
ON public.ai_chat_logs
FOR INSERT
WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Users can read their own logs"
ON public.ai_chat_logs
FOR SELECT
USING (auth.uid() = user_id);

-- 4. Maintain the session snapshot table for fast UI hydration
-- (Already exists, but adding a 'session_metadata' for future session naming)
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='ai_chat_sessions' AND column_name='session_metadata') THEN
        ALTER TABLE public.ai_chat_sessions ADD COLUMN session_metadata jsonb DEFAULT '{}'::jsonb;
    END IF;
END $$;
