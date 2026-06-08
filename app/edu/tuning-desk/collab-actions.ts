"use server";

import { getSupabase } from "@/lib/supabase/singleton";
import { revalidatePath } from "next/cache";

export async function persistCollabContent(roomName: string, htmlContent: string) {
  const supabase = getSupabase();
  
  if (roomName.startsWith("titan-collab-lesson-")) {
    // roomName format: titan-collab-lesson-[lessonId]-[field]
    const parts = roomName.replace("titan-collab-lesson-", "").split("-");
    const lessonId = parts[0];
    const field = parts[1];

    if (!lessonId || !field) return { success: false };

    let updatePayload: any = {};
    if (field === "objectives") {
      // 解析 HTML 到 text[]
      const liMatches = [...htmlContent.matchAll(/<li>(.*?)<\/li>/g)];
      let objectivesArray: string[] = [];
      if (liMatches.length > 0) {
        objectivesArray = liMatches.map(m => m[1].replace(/<[^>]*>?/gm, ""));
      } else {
        const pureText = htmlContent.replace(/<[^>]*>?/gm, "").trim();
        objectivesArray = pureText ? [pureText] : [];
      }
      updatePayload = { objectives: objectivesArray };
    } else if (field === "assessment") {
      updatePayload = { assessment_criteria: htmlContent };
    }

    if (Object.keys(updatePayload).length > 0) {
      await supabase.from("edu_lessons").update(updatePayload).eq("id", lessonId);
    }
  } 
  else if (roomName.startsWith("titan-collab-slide-")) {
    // roomName format: titan-collab-slide-[planId]-[slideIndex]-[field]
    const parts = roomName.replace("titan-collab-slide-", "").split("-");
    const planId = parts[0];
    const slideIndex = parseInt(parts[1], 10);
    const field = parts[2]; // title or content

    if (!planId || isNaN(slideIndex) || !field) return { success: false };

    // 获取并更新特定 slide
    const { data: plan } = await supabase.from("edu_lesson_plans").select("slides").eq("id", planId).single();
    if (plan && Array.isArray(plan.slides) && plan.slides[slideIndex]) {
      // 为了防止富文本格式覆盖 json 结构，我们对内容做处理
      if (field === "title") {
          plan.slides[slideIndex].title = htmlContent.replace(/<[^>]*>?/gm, ""); // 标题去标签
      } else if (field === "content") {
          // 只保留文字逻辑，或者直接存 html。
          // 之前生成器可能是用 \n 换行的，现在协同台用 html，这里我们允许存 html
          plan.slides[slideIndex].content = htmlContent;
      }
      await supabase.from("edu_lesson_plans").update({ slides: plan.slides }).eq("id", planId);
    }
  }

  // 虽然不需要完全 revalidate，但确保数据流通
  revalidatePath("/edu/tuning-desk");
  return { success: true };
}
