-- =========================================================================
-- Supabase Schema Backend initialization for CHRONOS SWARM (V3)
-- Purpose: 建立高频实时状态同步与任务下发的分布式底座
-- =========================================================================

-- 1. Create `node_status` table (实时蜂群状态墙)
CREATE TABLE IF NOT EXISTS public.node_status (
   node_id text PRIMARY KEY, -- unit1, unit2, unit3
   hostname text,
   status text DEFAULT 'OFFLINE', -- ONLINE, OFFLINE, BUSY
   cpu_usage float DEFAULT 0,
   mem_usage float DEFAULT 0,
   last_pulse timestamp with time zone NOT NULL DEFAULT now(),
   created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- 2. Create `missions` table (核心任务/目标追踪)
CREATE TABLE IF NOT EXISTS public.missions (
   id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
   title text NOT NULL,
   description text,
   status text NOT NULL DEFAULT 'PENDING', -- PENDING, RUNNING, COMPLETED, FAILED
   priority integer DEFAULT 0,
   assigned_node text REFERENCES public.node_status(node_id) ON DELETE SET NULL,
   commander_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
   metadata jsonb DEFAULT '{}'::jsonb,
   created_at timestamp with time zone NOT NULL DEFAULT now(),
   updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- 3. Update `node_status` to include current_task_id
ALTER TABLE public.node_status ADD COLUMN IF NOT EXISTS current_task_id uuid REFERENCES public.missions(id);

-- 3. Enhance Security (RLS) for v3
ALTER TABLE public.missions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.node_status ENABLE ROW LEVEL SECURITY;

-- 4. Policies: 只有登录后的指挥官 (Commander) 可以完全操控
-- (假设指挥官是特定的 UUID，或者所有 auth.role = 'authenticated' 的用户均为合法操作者)
DROP POLICY IF EXISTS "Commanders ONLY: Missions" ON public.missions;
CREATE POLICY "Commanders ONLY: Missions" ON public.missions 
FOR ALL USING (auth.role() = 'authenticated') 
WITH CHECK (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Public View: Node Status" ON public.node_status;
CREATE POLICY "Public View: Node Status" ON public.node_status 
FOR SELECT USING (true); -- 允许公开查看状态

DROP POLICY IF EXISTS "Internal Node: Heartbeat Update" ON public.node_status;
CREATE POLICY "Internal Node: Heartbeat Update" ON public.node_status 
FOR UPDATE USING (true); -- 允许节点更新自身心跳 (后期可收紧至 Service Role)

-- 5. Enable Real-time for Node Status & Missions
-- (Please ensure 'realtime' publication is enabled in Supabase Dashboard for these tables)
-- Logic prefix: alter publication supabase_realtime add table public.node_status, public.missions;

-- 6. Trigger for updated_at
CREATE OR REPLACE FUNCTION update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_missions_modtime 
BEFORE UPDATE ON public.missions 
FOR EACH ROW EXECUTE PROCEDURE update_modified_column();
