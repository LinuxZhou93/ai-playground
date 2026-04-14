"use server";

import { createClient } from "@supabase/supabase-js";
import { revalidatePath } from "next/cache";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

function getSupabaseAdmin() {
  return createClient(supabaseUrl, supabaseServiceKey, {
    auth: { persistSession: false },
  });
}

// 1. 获取所有素材 (P1-7 Vault)
export async function getEduAssets(category?: string) {
  const supabase = getSupabaseAdmin();
  let query = supabase.from("edu_assets").select("*").order("created_at", { ascending: false });
  
  if (category && category !== "全部") {
    query = query.eq("category", category);
  }

  const { data, error } = await query;
  if (error) {
    console.error("Error fetching assets:", error);
    return [];
  }
  return data || [];
}

// 2. 将文件上传到 Supabase Storage, 然后在数据表插入记录
export async function uploadAsset(formData: FormData) {
  try {
    const file = formData.get("file") as File;
    if (!file) throw new Error("No file provided");

    const category = formData.get("category") as string || "未分类";
    const author = formData.get("author") as string || "教研组长";

    const supabase = getSupabaseAdmin();

    // 解析出文件类型映射为系统标准
    const ext = file.name.split('.').pop()?.toUpperCase() || "BIN";
    let type = "DOC";
    if (["PNG", "JPG", "JPEG", "GIF", "SVG", "WEBP"].includes(ext)) type = "IMAGE";
    if (["STL", "OBJ", "GLTF"].includes(ext)) type = "3D";
    if (["INO", "CPP", "PY", "JS", "TS", "JSON"].includes(ext)) type = "CODE";
    if (ext === "TLDRAW") type = "INTERACTIVE";

    // 上传文件到 bucket
    const filePath = `vault/${Date.now()}_${file.name}`;
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from("edu_vault_assets")
      .upload(filePath, file, { upsert: true });

    if (uploadError) throw uploadError;

    // 获取公开访问链接 (用于前端直接渲染如图片)
    const { data: publicUrlData } = supabase.storage
      .from("edu_vault_assets")
      .getPublicUrl(filePath);

    // 格式化文件大小
    let sizeStr = "";
    if (file.size < 1024 * 1024) sizeStr = (file.size / 1024).toFixed(1) + " KB";
    else sizeStr = (file.size / (1024 * 1024)).toFixed(1) + " MB";

    // 插入数据库
    const { data: insertData, error: dbError } = await supabase.from("edu_assets").insert([
      {
        name: file.name,
        type,
        category,
        format: ext,
        size_bytes: file.size,
        author,
        storage_path: filePath,
        thumbnail_url: type === 'IMAGE' ? publicUrlData.publicUrl : null,
      }
    ]).select().single();

    if (dbError) throw dbError;

    revalidatePath("/edu/vault");
    return { success: true, asset: insertData };

  } catch (err: any) {
    console.error("Asset upload failed:", err);
    return { success: false, error: err.message };
  }
}

// 3. (可选) 删除素材
export async function deleteAsset(id: string, storagePath: string) {
  const supabase = getSupabaseAdmin();
  // 删除物理文件
  await supabase.storage.from("edu_vault_assets").remove([storagePath]);
  // 删除记录
  await supabase.from("edu_assets").delete().eq("id", id);
  revalidatePath("/edu/vault");
}
