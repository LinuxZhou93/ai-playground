-- ==============================================================================
-- P1-7 阶段：FutureClass Educator Studio - 教研素材库 (Vault) 结构体系
-- 请前往 Supabase Dashboard -> SQL Editor 粘贴并运行此脚本
-- ==============================================================================

-- 1. 创建 edu_assets 教研素材元数据表
CREATE TABLE IF NOT EXISTS public.edu_assets (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name text NOT NULL,                    -- 素材名称
    type text NOT NULL,                    -- 元件类型 (IMAGE, 3D, CODE, INTERACTIVE, WIDGET, DIAGRAM, DOC)
    category text DEFAULT '未分类',          -- 细分品类 (如：机械零件, 电子元件)
    format text,                           -- 格式 (PNG, STL, INO, TLDR, BIN...)
    size_bytes bigint DEFAULT 0,           -- 文件尺寸 (KB/MB 展示基础)
    author text DEFAULT 'System',          -- 贡献者/上传者
    storage_path text NOT NULL,            -- 在 Supabase Storage 中的文件物理路径
    thumbnail_url text,                    -- (可选) 预览缩略图的路径或外链
    metadata jsonb,                        -- (扩展) 其他动态属性
    is_public boolean DEFAULT true,        -- 是否在机构内全职员共享
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- 开启安全策略 (为了加速原型开发，在此我们设置全选放开，生产环境建议绑定 auth.uid)
ALTER TABLE public.edu_assets ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Enable read access for all users" ON public.edu_assets FOR SELECT USING (true);
CREATE POLICY "Enable insert access for all users" ON public.edu_assets FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update access for all users" ON public.edu_assets FOR UPDATE USING (true);

-- 2. 注册 Supabase Storage Bucket (确保存储桶可用以支持直接上传)
-- 该命令将在后台建立名为 "edu_vault_assets" 的公有读容器
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'edu_vault_assets',
  'edu_vault_assets',
  true,
  52428800, -- 50MB 限制
  ARRAY['image/png', 'image/jpeg', 'image/gif', 'image/svg+xml', 'application/json', 'model/stl', 'text/plain', 'application/pdf', 'application/zip']
)
ON CONFLICT (id) DO UPDATE SET public = true;

-- 放开 Storage bucket 的策略以允许公上传（教务后台）
CREATE POLICY "Public Access"
ON storage.objects FOR SELECT
USING ( bucket_id = 'edu_vault_assets' );

CREATE POLICY "Public Uploads"
ON storage.objects FOR INSERT
WITH CHECK ( bucket_id = 'edu_vault_assets' );

CREATE POLICY "Public Deletes"
ON storage.objects FOR DELETE
USING ( bucket_id = 'edu_vault_assets' );
