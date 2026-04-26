"use server";

import { createClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// 获取独立的 C 端 Supabase 实例
function getParentSupabase() {
  return createClient(supabaseUrl, supabaseAnonKey);
}

// ─────────────────────────────────────────────────────────────
// 📱 家长端身份鉴权 (极简免密 MVP)
// ─────────────────────────────────────────────────────────────

export async function parentLogin(phone: string) {
  if (!phone || phone.trim() === "") {
    throw new Error("请输入手机号码");
  }

  const supabase = getParentSupabase();
  const cleanPhone = phone.trim();

  // 查询该手机号下是否有存量学员
  const { data, error } = await supabase
    .from("erp_students")
    .select("id, name")
    .eq("parent_phone", cleanPhone);

  if (error) {
    throw new Error("系统繁忙，请稍后重试");
  }

  if (!data || data.length === 0) {
    throw new Error("未找到该号码绑定的学员档案，请联系教务老师或检查输入");
  }

  // 登入成功，签发专用的家长端轻量 Cookie
  const cookieStore = await cookies();
  cookieStore.set({
    name: "futureclass_parent_auth",
    value: cleanPhone,
    httpOnly: true,
    path: "/",
    maxAge: 60 * 60 * 24 * 30, // 30天免密
    sameSite: "lax",
  });

  return { success: true, count: data.length };
}

export async function parentLogout() {
  const cookieStore = await cookies();
  cookieStore.delete("futureclass_parent_auth");
  return { success: true };
}

// ─────────────────────────────────────────────────────────────
// 📈 聚合大盘数据拉取
// ─────────────────────────────────────────────────────────────

export async function getParentDashboardData() {
  const cookieStore = await cookies();
  const phone = cookieStore.get("futureclass_parent_auth")?.value;

  if (!phone) {
    throw new Error("UNAUTHORIZED");
  }

  const supabase = getParentSupabase();

  // 1. 获取该家长的所有孩子基本信息
  const { data: students, error: stdErr } = await supabase
    .from("erp_students")
    .select("id, name, created_at")
    .eq("parent_phone", phone)
    .order("created_at", { ascending: true });

  if (stdErr || !students || students.length === 0) {
    throw new Error("学员数据异常");
  }

  const studentIds = students.map((s) => s.id);

  // 2. 获取所有孩子们的所有正在生效的报课资产
  const { data: enrollments } = await supabase
    .from("erp_enrollments")
    .select(`
      id, student_id, remaining_lessons, total_purchased_lessons, enroll_status, created_at,
      erp_courses(name, category)
    `)
    .in("student_id", studentIds)
    .eq("enroll_status", "STUDYING");

  // 3. 获取近期带有 AI 评语的互动记录，按时间倒序
  const { data: attendances } = await supabase
    .from("erp_attendance")
    .select(`
      id, student_id, status, ai_feedback, created_at, consumption_value,
      erp_classes(name, erp_staff(name))
    `)
    .in("student_id", studentIds)
    .not("ai_feedback", "is", null) // 必须有评语才展示给家长
    .order("created_at", { ascending: false })
    .limit(20);

  // 组装数据模型 (Data Shaping for the UI)
  const childrenMap = students.map((stu) => {
    // 该孩子的课程资产
    const stuEnrollments = (enrollments || []).filter((e) => e.student_id === stu.id);
    const totalRemaining = stuEnrollments.reduce((acc, cur) => acc + Number(cur.remaining_lessons), 0);
    const totalPurchased = stuEnrollments.reduce((acc, cur) => acc + Number(cur.total_purchased_lessons), 0);

    // 该孩子的互动日志
    const stuTimeline = (attendances || []).filter((a) => a.student_id === stu.id);

    return {
      ...stu,
      assets: {
        totalRemaining: Math.max(0, totalRemaining),
        totalPurchased,
        details: stuEnrollments,
      },
      timeline: stuTimeline,
    };
  });

  return {
    parentPhone: phone,
    children: childrenMap,
  };
}
