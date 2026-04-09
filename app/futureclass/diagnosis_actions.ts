"use server";

import { getSupabase } from "@/lib/supabase/singleton";
import { unstable_cache } from "next/cache";
import { getModel } from "@/lib/ai/providers";
import { callLLM } from "@/lib/ai/llm";

/**
 * 核心诊断逻辑：多维度识别校区运营风险
 * 
 * V3.0: 增加 unstable_cache 全局缓存，避免每次刷新首屏耗时查询
 */
const getCachedOperationalDiagnosis = unstable_cache(
  async () => {
    const supabase = getSupabase();
    const now = new Date();
    const fourteenDaysAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

  try {
    // V2.1: 4 次查询并行执行（从 ~800ms 降到 ~250ms）
    const [studentsRes, enrollmentsRes, classesRes, enrollCountRes] = await Promise.all([
      // 1. 获取所有学员及最新考勤
      supabase
        .from("erp_students")
        .select(`id, name, erp_attendance (lesson_date)`)
        .order('lesson_date', { foreignTable: 'erp_attendance', ascending: false }),
      // 2. 营收预警（剩余课时 < 3）
      supabase
        .from("erp_enrollments")
        .select(`student_id, remaining_lessons, erp_courses (price_per_lesson)`)
        .lt("remaining_lessons", 3),
      // 3. 班级容量数据
      supabase
        .from("erp_classes")
        .select("id, name, capacity"),
      // 4. 班级报读计数
      supabase
        .from("erp_enrollments")
        .select("class_id"),
    ]);

    if (studentsRes.error) throw studentsRes.error;

    // 识别沉睡学员 (14天无消课)
    const dormantStudents = (studentsRes.data || []).filter(student => {
      const lastAttendance = student.erp_attendance?.[0]?.lesson_date;
      if (!lastAttendance) return true;
      return new Date(lastAttendance) < new Date(fourteenDaysAgo);
    }).map(s => ({
      id: s.id,
      name: s.name,
      lastDate: s.erp_attendance?.[0]?.lesson_date || '从未到课'
    }));

    // 营收预警
    const riskRevenue = (enrollmentsRes.data || []).reduce((sum, en) => {
      const price = Number((en as any).erp_courses?.price_per_lesson || 0);
      return sum + (Number(en.remaining_lessons) * price);
    }, 0);

    // 低效班级（fillRate < 50%）
    const classPeopleMap: Record<string, number> = {};
    enrollCountRes.data?.forEach(e => {
      if (e.class_id) classPeopleMap[e.class_id] = (classPeopleMap[e.class_id] || 0) + 1;
    });

    const inefficientClasses = (classesRes.data || [])
      .map(c => ({
        ...c,
        studentCount: classPeopleMap[c.id] || 0,
        fillRate: c.capacity > 0 ? (classPeopleMap[c.id] || 0) / c.capacity : 0
      }))
      .filter(c => c.fillRate < 0.5);

    return {
      dormantCount: dormantStudents.length,
      dormantList: dormantStudents.slice(0, 5),
      riskRevenue,
      inefficientClassesCount: inefficientClasses.length,
      timestamp: now.toISOString()
    };
  } catch (error) {
    console.error("Diagnosis Data Fetch Error:", error);
    return null;
  }
}, ['erp-operational-diagnosis'], { revalidate: 60, tags: ['erp-data'] });

export async function getOperationalDiagnosis() {
  return getCachedOperationalDiagnosis();
}

/**
 * AI 运营指令生成（15s 超时保护）
 */
export async function generateOperationalDirective(data: any) {
  if (!data) return "暂无运营数据可供诊断。";

  try {
    const { model } = getModel({
      providerId: 'google',
      modelId: 'gemini-3-flash-preview',
      apiKey: process.env.GOOGLE_API_KEY,
    });

    const prompt = `
      请作为 FutureClass 校区运营总监，针对以下诊断数据生成一段 150 字以内的运营指令：
      - 沉睡学员（14天未消课）：${data.dormantCount}人
      - 课时预警营收风险：¥${data.riskRevenue.toLocaleString()}
      - 低效班级（满班率<50%）：${data.inefficientClassesCount}个
      
      要求：语气专业严谨且有煽动力，指出核心风险点，并给出具体的行动建议（如家校沟通、班级优化或续费攻坚）。
      直接输出指令文本，含 Emoji。
    `;

    const timeout = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error("AI Directive 超时 (15s)")), 15000)
    );

    const llmCall = callLLM({
      model,
      maxTokens: 400,
      system: "你是资深教育机构运营专家，擅长从数据中挖掘增长机会并化解流失风险。",
      prompt,
    }, "operational-directive");

    const result = await Promise.race([llmCall, timeout]);
    return result.text;
  } catch (error) {
    console.error("AI Directive Error:", error);
    return "⚠️ 运营大脑暂无法连通，建议优先关注沉睡学员的 1 对 1 回访及剩余课时不足 3 节的学员续费跟进。";
  }
}
