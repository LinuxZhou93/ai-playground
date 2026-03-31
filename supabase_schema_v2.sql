-- =========================================================================
-- Supabase Schema Backend initialization for TITAN AI Assistant (V2)
-- Purpose: 彻底抛弃 Vercel 本地 FS 限制，为高并发和即开即用的云端课堂设立的数据中枢
-- =========================================================================

-- 1. Create `stages` table (课堂总概)
CREATE TABLE IF NOT EXISTS public.stages (
   id text PRIMARY KEY,
   name text NOT NULL,
   description text,
   language text,
   style text,
   agent_ids jsonb DEFAULT '[]'::jsonb,
   whiteboard jsonb DEFAULT '[]'::jsonb,
   author_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
   is_public boolean DEFAULT false,
   forked_from text,
   likes_count integer DEFAULT 0,
   views_count integer DEFAULT 0,
   forks_count integer DEFAULT 0,
   created_at bigint NOT NULL,
   updated_at bigint NOT NULL
);

-- 2. Create `scenes` table (分段渲染与课堂章节)
CREATE TABLE IF NOT EXISTS public.scenes (
   id text PRIMARY KEY,
   stage_id text NOT NULL REFERENCES public.stages(id) ON DELETE CASCADE,
   type text NOT NULL,
   title text NOT NULL,
   display_order integer NOT NULL,
   content jsonb NOT NULL DEFAULT '{}'::jsonb,
   actions jsonb DEFAULT '[]'::jsonb,
   whiteboards jsonb DEFAULT '[]'::jsonb,
   multi_agent jsonb DEFAULT '{}'::jsonb,
   created_at bigint,
   updated_at bigint
);

-- 3. Create `classroom_jobs` table (供客户端无状态轮询的实时任务)
CREATE TABLE IF NOT EXISTS public.classroom_jobs (
   id text PRIMARY KEY,
   status text NOT NULL,
   step text NOT NULL,
   progress integer NOT NULL DEFAULT 0,
   message text,
   created_at timestamp with time zone NOT NULL,
   updated_at timestamp with time zone NOT NULL,
   started_at timestamp with time zone,
   completed_at timestamp with time zone,
   input_summary jsonb NOT NULL DEFAULT '{}'::jsonb,
   scenes_generated integer DEFAULT 0,
   total_scenes integer,
   result jsonb,
   error text
);

-- 4. Set extremely permissive row level security for AI Generation API 
-- (Given that serverless generates files via Service Roles mostly)
ALTER TABLE public.stages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scenes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.classroom_jobs ENABLE ROW LEVEL SECURITY;

-- Auto-provision policies for everyone to insert/select (MVP Phase)
CREATE POLICY "Public Stages Access" ON public.stages FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public Scenes Access" ON public.scenes FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public Jobs Access" ON public.classroom_jobs FOR ALL USING (true) WITH CHECK (true);

-- =========================================================================
-- Storage Bucket Creation for Media
-- =========================================================================
-- Please run the snippet below via the Supabase Admin API or simply create via UI:
-- Bucket Name: classroom-media
-- Public: YES
-- Object Name constraints: allowed extensions: .png, .mp4, .mp3, .webp, .jpg
-- =========================================================================
INSERT INTO storage.buckets (id, name, public) 
VALUES ('classroom-media', 'classroom-media', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Public Bucket Access" ON storage.objects FOR ALL USING (bucket_id = 'classroom-media') WITH CHECK (bucket_id = 'classroom-media');
