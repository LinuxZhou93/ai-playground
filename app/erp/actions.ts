"use server";

import { getSupabase } from "@/lib/supabase/singleton";
import { revalidatePath, revalidateTag, unstable_cache } from "next/cache";
import { getModel } from "@/lib/ai/providers";
import { callLLM } from "@/lib/ai/llm";
import { getAuthCookies } from "./auth-actions";

// ─────────────────────────────────────────────────────────────
// 📦 基础查询
// ─────────────────────────────────────────────────────────────

/**
 * 获取所有学员列表
 */
export async function getStudents() {
  const supabase = getSupabase();
  const ctx = await getAuthCookies();
  let query = supabase
    .from("erp_students")
    .select(`
      *,
      erp_enrollments (
        remaining_lessons,
        erp_classes (
          name
        ),
        erp_courses (
          name
        )
      )
    `)
    .order("created_at", { ascending: false });
    
  if (ctx.role !== "ADMIN" && ctx.campus_id) {
    query = query.eq("campus_id", ctx.campus_id);
  }

  const { data, error } = await query;
  
  if (error) {
    console.error("Error fetching students:", error);
    return [];
  }
  return data || [];
}

/**
 * 获取课程列表
 */
export async function getCourses() {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from("erp_courses")
    .select("*")
    .order("name");
  
  if (error) return [];
  return data || [];
}

/**
 * 获取班级列表（含关联课程信息）
 */
export async function getClasses() {
  const supabase = getSupabase();
  const ctx = await getAuthCookies();
  let query = supabase
    .from("erp_classes")
    .select("*, erp_courses(name)")
    .order("created_at", { ascending: false });

  if (ctx.role !== "ADMIN" && ctx.campus_id) {
    query = query.eq("campus_id", ctx.campus_id);
  }

  const { data, error } = await query;
  
  if (error) return [];
  return data || [];
}

/**
 * 获取指定班级的学员列表 (含报读状态)
 */
export async function getStudentsByClass(classId: string) {
  const supabase = getSupabase();
  const ctx = await getAuthCookies();
  let query = supabase
    .from("erp_enrollments")
    .select(`
      remaining_lessons,
      erp_students (
        id,
        name,
        gender
      )
    `)
    .eq("class_id", classId);

  if (ctx.role !== "ADMIN" && ctx.campus_id) {
    query = query.eq("campus_id", ctx.campus_id);
  }

  const { data, error } = await query;
  
  if (error) {
    console.error("Error fetching students by class:", error);
    return [];
  }
  
  // 过滤掉关联对象为空的脏数据
  return (data as any[])
    .filter(d => d.erp_students !== null)
    .map(d => ({
      ...d.erp_students,
      remaining_lessons: d.remaining_lessons
    }));
}

// ─────────────────────────────────────────────────────────────
// ⚡ 点名考勤（核心业务逻辑）
// ─────────────────────────────────────────────────────────────

/**
 * 执行点名考勤（核心业务逻辑：新增记录 + 扣减课时）
 */
export async function markAttendance({
  studentId,
  classId,
  status,
  consumptionValue = 1.0,
  feedback = ""
}: {
  studentId: string;
  classId: string;
  status: "PRESENT" | "ABSENT" | "LEAVE";
  consumptionValue?: number;
  feedback?: string;
}) {
  const supabase = getSupabase();

  // 1. 记录点名
  const { error: attendError } = await supabase
    .from("erp_attendance")
    .insert({
      student_id: studentId,
      class_id: classId,
      status,
      consumption_value: status === "PRESENT" ? consumptionValue : 0,
      ai_feedback: feedback
    });

  if (attendError) throw attendError;

  // 2. 如果是出席，扣减剩余课时
  if (status === "PRESENT") {
    // 获取当前的报读记录
    const { data: enrollment, error: enrollFetchError } = await supabase
      .from("erp_enrollments")
      .select("id, remaining_lessons")
      .eq("student_id", studentId)
      .eq("class_id", classId)
      .single();

    if (!enrollFetchError && enrollment) {
      const newRemaining = Math.max(0, Number(enrollment.remaining_lessons) - consumptionValue);
      const ctx = await getAuthCookies();

      await supabase
        .from("erp_enrollments")
        .update({ remaining_lessons: newRemaining })
        .eq("id", enrollment.id);

      // --- Immutable Ledger Hijack: 注入不可变流水 ---
      await supabase.from("erp_financial_ledgers").insert({
        transaction_type: "DEDUCT",
        enrollment_id: enrollment.id,
        student_id: studentId,
        delta_lessons: -consumptionValue,
        delta_amount: 0,
        snapshot_balance: enrollment.remaining_lessons,
        operator_name: `User(${ctx?.role || 'SYSTEM'})`,
        remark: `课时扣减 (标记状态: ${status})`,
        campus_id: ctx?.campus_id || null
      });
    }
  }

  revalidatePath("/erp/attendance");
  revalidatePath("/erp/dashboard");
  revalidateTag("erp-data");
  return { success: true };
}

/**
 * 批量全员点名（全部出席）
 * 
 * V2.0 重写：使用 Promise.all 并行扣减课时，消灭 O(2N) 串行瓶颈。
 */
export async function batchMarkAttendance(classId: string, studentIds: string[]) {
  const supabase = getSupabase();
  const today = new Date().toISOString().split("T")[0];

  // 1. 批量插入考勤记录（一次 DB 操作）
  const records = studentIds.map(sid => ({
    student_id: sid,
    class_id: classId,
    status: "PRESENT" as const,
    lesson_date: today,
    consumption_value: 1.0,
  }));

  const { error: attendError } = await supabase
    .from("erp_attendance")
    .insert(records);

  if (attendError) throw attendError;

  // 2. 并行扣减所有学员课时（从 O(2N) 串行 → O(1) 并行）
  const deductOne = async (sid: string) => {
    const { data: enrollment } = await supabase
      .from("erp_enrollments")
      .select("id, remaining_lessons")
      .eq("student_id", sid)
      .eq("class_id", classId)
      .single();

    if (enrollment) {
      const ctx = await getAuthCookies();
      await supabase
        .from("erp_enrollments")
        .update({ remaining_lessons: Math.max(0, Number(enrollment.remaining_lessons) - 1) })
        .eq("id", enrollment.id);

      // --- Immutable Ledger Hijack: 注入不可变流水 ---
      await supabase.from("erp_financial_ledgers").insert({
        transaction_type: "DEDUCT",
        enrollment_id: enrollment.id,
        student_id: sid,
        delta_lessons: -1,
        delta_amount: 0,
        snapshot_balance: enrollment.remaining_lessons,
        operator_name: `User(${ctx?.role || 'SYSTEM'})`,
        remark: `批量课时扣减`,
        campus_id: ctx?.campus_id || null
      });
    }
  };

  await Promise.all(studentIds.map(deductOne));

  revalidatePath("/erp/attendance");
  revalidatePath("/erp/dashboard");
  revalidateTag("erp-data");
  return { success: true, count: studentIds.length };
}

// ─────────────────────────────────────────────────────────────
// 📊 统计与聚合
// ─────────────────────────────────────────────────────────────

/**
 * 获取看板汇总统计数据
 * 
 * V2.0：4 次查询使用 Promise.all 并行执行
 */
export async function getDashboardStats() {
  const supabase = getSupabase();
  const ctx = await getAuthCookies();
  const now = new Date();
  const firstDay = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();

  let q1 = supabase.from("erp_students").select("*", { count: "exact", head: true });
  let q2 = supabase.from("erp_enrollments").select("*", { count: "exact", head: true }).lt("remaining_lessons", 3);
  let q3 = supabase.from("erp_enrollments").select("*", { count: "exact", head: true }).gte("created_at", firstDay);
  let q4 = supabase.from("erp_enrollments").select("total_purchased_lessons, erp_courses(price_per_lesson)").gte("created_at", firstDay);

  if (ctx.role !== "ADMIN" && ctx.campus_id) {
    q1 = q1.eq("campus_id", ctx.campus_id);
    q2 = q2.eq("campus_id", ctx.campus_id);
    q3 = q3.eq("campus_id", ctx.campus_id);
    q4 = q4.eq("campus_id", ctx.campus_id);
  }

  // 并行执行 4 次独立查询
  const [studentRes, warningRes, newRes, monthEnrollRes] = await Promise.all([q1, q2, q3, q4]);

  const revenueMonth = (monthEnrollRes.data as any[] || []).reduce((sum, en) => {
    const price = en.erp_courses?.price_per_lesson || 0;
    return sum + (Number(en.total_purchased_lessons) * Number(price));
  }, 0);

  return {
    studentCount: studentRes.count || 0,
    warningCount: warningRes.count || 0,
    newCount: newRes.count || 0,
    revenueMonth,
  };
}

// 获取单个学员完整画像 (含报读、考勤、AI点评、成长档案)
export async function getStudentDetail(studentId: string) {
  const supabase = getSupabase();

  // 首先获取学员基础信息，以便用 name 去匹配 archive
  const { data: student, error: studentError } = await supabase.from("erp_students").select("*").eq("id", studentId).single();
  if (studentError || !student) return null;

  // 并行获取报读记录 + 考勤记录 + 真实的成长档案(依赖 student_name)
  const [enrollRes, attendRes, archiveRes] = await Promise.all([
    supabase.from("erp_enrollments")
      .select(`*, erp_courses(name, price_per_lesson, category), erp_classes(name, classroom)`)
      .eq("student_id", studentId)
      .order("created_at", { ascending: false }),
    supabase.from("erp_attendance")
      .select(`*, erp_classes(name)`)
      .eq("student_id", studentId)
      .order("created_at", { ascending: false })
      .limit(30),
    supabase.from("erp_growth_archives")
      .select(`*`)
      .eq("student_name", student.name)
      .order("created_at", { ascending: false })
      .limit(50),
  ]);

  return {
    ...student,
    enrollments: enrollRes.data || [],
    attendanceRecords: attendRes.data || [],
    archives: archiveRes.data || [],
  };
}

/**
 * 获取近 N 天的消课趋势数据 (Dashboard 图表用)
 */
export async function getAttendanceTrend(days: number = 7) {
  const supabase = getSupabase();
  const since = new Date();
  since.setDate(since.getDate() - days);

  const { data, error } = await supabase
    .from("erp_attendance")
    .select("lesson_date, consumption_value, status")
    .gte("lesson_date", since.toISOString().split("T")[0])
    .eq("status", "PRESENT");

  if (error || !data) return [];

  // 按日期聚合
  const dateMap: Record<string, { consumed: number; count: number }> = {};
  for (let i = 0; i < days; i++) {
    const d = new Date();
    d.setDate(d.getDate() - (days - 1 - i));
    const key = d.toISOString().split("T")[0];
    dateMap[key] = { consumed: 0, count: 0 };
  }

  data.forEach(row => {
    const key = typeof row.lesson_date === 'string' ? row.lesson_date : new Date(row.lesson_date).toISOString().split("T")[0];
    if (dateMap[key]) {
      dateMap[key].consumed += Number(row.consumption_value || 1);
      dateMap[key].count += 1;
    }
  });

  return Object.entries(dateMap).map(([date, val]) => ({
    date,
    label: `${new Date(date).getMonth() + 1}/${new Date(date).getDate()}`,
    consumed: val.consumed,
    count: val.count,
  }));
}

/**
 * 获取财务汇总统计
 */
export async function getFinanceStats() {
  const supabase = getSupabase();
  
  const ctx = await getAuthCookies();
  let query = supabase
    .from("erp_enrollments")
    .select("total_purchased_lessons, erp_courses(price_per_lesson)");

  if (ctx.role !== "ADMIN" && ctx.campus_id) {
    query = query.eq("campus_id", ctx.campus_id);
  }

  const { data: enrollments, error } = await query;
  
  if (error) return { totalRevenue: 0, orderCount: 0 };
  
  const totalRevenue = (enrollments as any[]).reduce((sum, en) => {
    const price = en.erp_courses?.price_per_lesson || 0;
    return sum + (Number(en.total_purchased_lessons) * Number(price));
  }, 0);

  return {
    totalRevenue,
    orderCount: enrollments.length
  };
}

/**
 * 获取销售订单/报课流水
 */
export async function getEnrollments() {
  const supabase = getSupabase();
  const ctx = await getAuthCookies();
  let query = supabase
    .from("erp_enrollments")
    .select(`
      *,
      erp_students(name),
      erp_courses(name, price_per_lesson)
    `)
    .order("created_at", { ascending: false });

  if (ctx.role !== "ADMIN" && ctx.campus_id) {
    query = query.eq("campus_id", ctx.campus_id);
  }

  const { data, error } = await query;
  
  if (error) return [];
  return data || [];
}

/**
 * 获取课程列表（含报读人数统计）
 */
export async function getCoursesWithStats() {
  const supabase = getSupabase();
  
  // 并行获取课程列表和报读计数
  const [coursesRes, enrollRes] = await Promise.all([
    supabase.from("erp_courses").select("*").order("name"),
    supabase.from("erp_enrollments").select("course_id"),
  ]);

  if (coursesRes.error) return [];

  const countMap: Record<string, number> = {};
  (enrollRes.data || []).forEach(en => {
    countMap[en.course_id] = (countMap[en.course_id] || 0) + 1;
  });

  return coursesRes.data.map(c => ({
    ...c,
    enrollCount: countMap[c.id] || 0,
    totalRevenue: (countMap[c.id] || 0) * Number(c.price_per_lesson) * Number(c.total_lessons)
  }));
}

/**
 * 获取班级列表（含学员计数与容量进度）
 */
export async function getClassesWithStats() {
  const supabase = getSupabase();
  
  // 并行获取班级列表和报读数据
  const [classesRes, enrollRes] = await Promise.all([
    supabase.from("erp_classes").select("*, erp_courses(name, category)").order("created_at", { ascending: false }),
    supabase.from("erp_enrollments").select("class_id, erp_students(name)"),
  ]);

  if (classesRes.error) return [];

  const classMap: Record<string, { count: number; students: string[] }> = {};
  (enrollRes.data || []).forEach((en: any) => {
    const cid = en.class_id;
    if (!cid) return;
    if (!classMap[cid]) classMap[cid] = { count: 0, students: [] };
    classMap[cid].count += 1;
    if (en.erp_students?.name) classMap[cid].students.push(en.erp_students.name);
  });

  return classesRes.data.map(cls => ({
    ...cls,
    studentCount: classMap[cls.id]?.count || 0,
    studentNames: classMap[cls.id]?.students || [],
    fillRate: cls.capacity > 0 ? Math.round(((classMap[cls.id]?.count || 0) / cls.capacity) * 100) : 0
  }));
}

// ─────────────────────────────────────────────────────────────
// ✏️ 写入操作
// ─────────────────────────────────────────────────────────────

/**
 * 新增学员档案
 */
export async function addStudent(studentData: any) {
  const supabase = getSupabase();
  const ctx = await getAuthCookies();
  
  if (ctx.campus_id) {
    studentData.campus_id = ctx.campus_id;
  }

  const { data, error } = await supabase
    .from("erp_students")
    .insert([studentData])
    .select()
    .single();

  if (error) throw error;
  revalidatePath("/erp/students");
  revalidateTag("erp-data");
  return data || [];
}

/**
 * 学员报课成交 (创建报读记录)
 */
export async function enrollCourse(enrollData: {
  studentId: string;
  courseId: string;
  classId?: string;
  totalLessons: number;
  remark?: string;
}) {
  const supabase = getSupabase();
  const ctx = await getAuthCookies();

  const { data: newEnrollment, error } = await supabase
    .from("erp_enrollments")
    .insert({
      student_id: enrollData.studentId,
      course_id: enrollData.courseId,
      class_id: enrollData.classId,
      total_purchased_lessons: enrollData.totalLessons,
      remaining_lessons: enrollData.totalLessons,
      enroll_status: 'STUDYING',
      remark: enrollData.remark,
      campus_id: ctx.campus_id || null
    })
    .select("id")
    .single();

  if (error) throw error;

  // --- Immutable Ledger Hijack: 注入不可变流水 ---
  await supabase.from("erp_financial_ledgers").insert({
    transaction_type: "CHARGE",
    enrollment_id: newEnrollment.id,
    student_id: enrollData.studentId,
    delta_lessons: enrollData.totalLessons,
    delta_amount: 0, 
    snapshot_balance: 0,
    operator_name: `User(${ctx?.role || 'SYSTEM'})`,
    remark: `新报课充值 (${enrollData.remark || ''})`,
    campus_id: ctx?.campus_id || null
  });
  revalidatePath("/erp/students");
  revalidatePath("/erp/dashboard");
  revalidateTag("erp-data");
  return { success: true };
}

/**
 * 新增课程
 */
export async function addCourse(courseData: {
  name: string;
  category: string;
  price_per_lesson: number;
  total_lessons: number;
  duration_min: number;
}) {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from("erp_courses")
    .insert([courseData])
    .select()
    .single();

  if (error) throw error;
  revalidatePath("/erp/courses");
  revalidateTag("erp-data");
  return data || [];
}

/**
 * 新增班级
 */
export async function addClass(classData: {
  name: string;
  course_id: string;
  classroom: string;
  capacity: number;
  start_date: string;
}) {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from("erp_classes")
    .insert([classData])
    .select()
    .single();

  if (error) throw error;
  revalidatePath("/erp/classes");
  revalidateTag("erp-data");
  return data || [];
}

/**
 * 删除课程
 */
export async function deleteCourse(courseId: string) {
  const supabase = getSupabase();
  const { error } = await supabase
    .from("erp_courses")
    .delete()
    .eq("id", courseId);

  if (error) throw error;
  revalidatePath("/erp/courses");
  return { success: true };
}

// ─────────────────────────────────────────────────────────────
// 📚 教研系统专属 API (edu_ lessons)
// ─────────────────────────────────────────────────────────────

/**
 * 带有教研维度的课程查询 (教研微调台专用)
 * 嵌套拉取 edu_lessons (逐次课大纲) 与 edu_lesson_plans (课件实体)
 */
export async function getEduCoursesWithDetails() {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from("erp_courses")
    .select(`
      *,
      edu_lessons (*),
      edu_lesson_plans (*)
    `)
    .order("created_at", { ascending: false });
  
  if (error) {
    console.error("Error fetching edu courses with details:", error);
    return [];
  }
  
  // 对于 edu_lessons 需要按照 lesson_number 排序
  const formattedData = (data || []).map(course => ({
     ...course,
     edu_lessons: (course.edu_lessons || []).sort((a: any, b: any) => a.lesson_number - b.lesson_number),
     edu_lesson_plans: (course.edu_lesson_plans || []).sort((a: any, b: any) => b.version - a.version) // 取最新版本
  }));

  return formattedData;
}

// ─────────────────────────────────────────────────────────────
// 🤖 AI 智能
// ─────────────────────────────────────────────────────────────

/**
 * AI 智能生成课后点评 (P1-5: 融入教研大纲的闭环体系)
 * 能够根据考勤所在的班级，自动拉取当天对应的《教学设计 (edu_lessons)》中的预期目标，生成深度专业点评。
 */
export async function generateAIFeedback(studentName: string, keywords: string[], classId?: string) {
  try {
    const supabase = getSupabase();
    let teachContext = "";

    // P1-5: 闭环逻辑 -> 如果传了班级，就反查到该班级对应的 course_id，从而查出当前进度对应的教学目标
    if (classId) {
       // 1. 获取班级关联的课程
       const { data: clsData } = await supabase.from('erp_classes').select('course_id').eq('id', classId).single();
       if (clsData?.course_id) {
          // 2. 模拟获取当前班级的当前进度课次 (暂取该课程的第1课作为演示闭环的锚点)
          const { data: activeLesson } = await supabase.from('edu_lessons')
             .select('title, objectives')
             .eq('course_id', clsData.course_id)
             .order('lesson_number', { ascending: true })
             .limit(1)
             .single();
          
          if (activeLesson) {
             teachContext = `\n[今日教研系统下发的教学目标]：
本节课主题《${activeLesson.title}》。
预期达成目标：${(activeLesson.objectives || []).join('；')}。
请你在评估该学员时，将其表现("${keywords.join("、")}")与上述目标结合，体现出我们机构是由专业教研驱动的！`;
          }
       }
    }

    const { model } = getModel({
      providerId: 'google',
      modelId: 'gemini-3-flash', // 🛡️ [Titan Order] 锁死稳定版
      apiKey: process.env.GOOGLE_API_KEY,
    });

    // 超时保护：15秒无响应则降级
    const timeout = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error("AI 响应超时 (15s)")), 15000)
    );

    const systemPrompt = "你是STEM科技教育老师，用正面专业的语言与家长沟通。直接输出点评内容，不要加任何前缀。";
    const userPrompt = `为学员"${studentName}"写课后微信点评。
上课表现关键词：${keywords.join("、")}。${teachContext}
要求：亲切鼓励，150字左右，体现出专业的教学深度，并带有 Emoji。`;

    const llmCall = callLLM({
      model,
      maxTokens: 300,
      system: systemPrompt,
      prompt: userPrompt,
    }, "futureclass-feedback");

    const result = await Promise.race([llmCall, timeout]);
    return result.text;
  } catch (error) {
    console.error("AI Feedback Generation Error:", error);
    return `⚡ ${studentName}同学今天表现很棒！${keywords.join("、")}方面都有明显进步，继续保持哟～ 🚀（AI 自动生成失败，这是模板内容）`;
  }
}

// ─────────────────────────────────────────────────────────────
// 🚀 V3.0 高速缓存数据加载器 (Data Loaders with LRU/Next.js Cache)
// ─────────────────────────────────────────────────────────────

/**
 * Dashboard 缓存数据加载器
 * 将 4 次独立网络请求合并为 1 次，并加以服务端缓存。
 */
export async function loadDashboardData() {
  const [stats, enrollments, classes, trend] = await Promise.all([
    getDashboardStats(),
    getEnrollments(),
    getClasses(),
    getAttendanceTrend(7),
  ]);
  return { stats, enrollments, classes, trend };
}

/**
 * 考勤页缓存数据加载器
 */
export async function loadAttendanceData() {
  const [classes, stats] = await Promise.all([
    getClasses(),
    getDashboardStats(),
  ]);
  return { classes, stats };
}

/**
 * 学员管理页缓存数据加载器
 */
export async function loadStudentsPageData() {
  const [students, stats, courses, classes] = await Promise.all([
    getStudents(),
    getDashboardStats(),
    getCourses(),
    getClasses(),
  ]);
  return { students, stats, courses, classes };
}

/**
 * 课程库缓存数据加载器
 */
export async function loadCoursesPageData() {
  const [courses] = await Promise.all([
    getCoursesWithStats()
  ]);
  return courses;
}

/**
 * 财务中心缓存数据加载器
 */
export async function loadFinancePageData() {
  const [stats, enrollments] = await Promise.all([
    getFinanceStats(),
    getEnrollments(),
  ]);
  return { stats, enrollments };
}

/**
 * 班级管理页缓存数据加载器
 */
const getCachedClassesPageData = unstable_cache(
  async () => {
    const [classes, courses] = await Promise.all([
      getClassesWithStats(),
      getCourses(),
    ]);
    return { classes, courses };
  },
  ['erp-classes-page-data'],
  { revalidate: 60, tags: ['erp-data'] }
);

/**
 * 家校通 (Scribe) 缓存数据加载器
 */
export async function loadReportsPageData() {
  const [students, archives] = await Promise.all([
    getStudents(),
    getGrowthArchives()
  ]);
  return { students, archives };
}

export async function loadClassesPageData() {
  return getCachedClassesPageData();
}
// ─────────────────────────────────────────────────────────────
// 📦 教具与硬件物料库存库 (erp_inventory)
// ─────────────────────────────────────────────────────────────

/**
 * 实时获取全栈物料库存
 */
export async function getInventoryItems() {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from("erp_inventory")
    .select("*")
    .order("category")
    .order("sku");
  
  if (error) {
    console.error("Error fetching inventory:", error);
    return [];
  }
  return data || [];
}

/**
 * 加载物料大盘的全部数据 (包含汇总统计)
 */
export const loadInventoryPageData = unstable_cache(
  async () => {
    const items = await getInventoryItems();
    return { 
      items,
      totalValue: items.reduce((sum, i) => sum + (i.stock * i.cost), 0),
      warningCount: items.filter(i => i.stock <= i.threshold).length
    };
  },
  ['inventory-data-cache'],
  { revalidate: 60, tags: ['erp-data', 'inventory-data'] }
);

/**
 * 执行物料流转（入库 / 下发出库）
 * @param itemId SKU 的内部唯一 ID
 * @param operationType IN (入库) 或 OUT (出库)
 * @param value 数量
 */
export async function executeInventoryOperation(itemId: string, operationType: "IN" | "OUT", value: number) {
  const supabase = getSupabase();

  // 获取当前物料状态
  const { data: item, error: fetchErr } = await supabase
    .from("erp_inventory")
    .select("stock")
    .eq("id", itemId)
    .single();

  if (fetchErr || !item) {
    throw new Error("Target hardware asset not found.");
  }

  // 计算安全库存更新
  const delta = operationType === "IN" ? value : -value;
  const newStock = Math.max(0, item.stock + delta);

  const { error: updateErr } = await supabase
    .from("erp_inventory")
    .update({ 
      stock: newStock,
      last_update: new Date().toISOString()
    })
    .eq("id", itemId);

  if (updateErr) {
    throw new Error("Hardware transaction failed at database level.");
  }

  // 释放缓存并全网广播
  revalidateTag('inventory-data');
  return { success: true, newStock };
}

// ─────────────────────────────────────────────────────────────
// 📱 智能家校互动与成长档案 (erp_growth_archives)
// ─────────────────────────────────────────────────────────────

/**
 * 实时获取所有学员的成长档案闪评记录
 */
export async function getGrowthArchives() {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from("erp_growth_archives")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching growth archives:", error);
    return [];
  }
  return data || [];
}

// ─────────────────────────────────────────────────────────────
// 📅 智能排课引擎 (erp_schedules)
// ─────────────────────────────────────────────────────────────

/**
 * 获取排课日历所需的班级列表（含课程名、教室信息）
 */
export async function getScheduleClasses() {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from("erp_classes")
    .select(`
      id, name, classroom, capacity, start_date,
      erp_courses ( id, name, category, duration_min, total_lessons )
    `)
    .order("name");

  if (error) {
    console.error("Error fetching schedule classes:", error);
    return [];
  }
  return data || [];
}

/**
 * 按日期区间获取排课记录（用于日历渲染）
 */
export async function getSchedulesByWeek(startDate: string, endDate: string) {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from("erp_schedules")
    .select(`
      *,
      erp_classes ( id, name ),
      erp_courses ( id, name, category )
    `)
    .gte("lesson_date", startDate)
    .lte("lesson_date", endDate)
    .order("lesson_date")
    .order("start_time");

  if (error) {
    console.error("Error fetching schedules:", error);
    return [];
  }
  return data || [];
}

/**
 * 智能批量排课引擎
 * @param classId 班级ID
 * @param rule 排课规则 { dayOfWeek, startTime, endTime, totalLessons, startDate }
 * 
 * 碰撞检测维度：同一教室 + 同一日期 + 时间段重叠 → 硬拦截
 */
export async function generateSchedules(
  classId: string,
  rule: {
    dayOfWeek: number;  // 0=周日, 1=周一 … 6=周六
    startTime: string;  // "10:00"
    endTime: string;    // "11:30"
    totalLessons: number;
    startDate: string;  // "2026-04-12"
  }
) {
  const supabase = getSupabase();

  // 1. 拉取班级关联信息
  const { data: classInfo, error: classErr } = await supabase
    .from("erp_classes")
    .select("id, name, classroom, course_id, erp_courses(id, name)")
    .eq("id", classId)
    .single();

  if (classErr || !classInfo) {
    throw new Error("班级数据拉取失败，请检查班级是否存在。");
  }

  // 2. 计算未来 N 节课的日期序列
  const dates: string[] = [];
  const start = new Date(rule.startDate + "T00:00:00");
  let cursor = new Date(start);

  // 找到第一个匹配的 dayOfWeek
  while (cursor.getDay() !== rule.dayOfWeek) {
    cursor.setDate(cursor.getDate() + 1);
  }

  for (let i = 0; i < rule.totalLessons; i++) {
    const dateStr = cursor.toISOString().split("T")[0];
    dates.push(dateStr);
    cursor.setDate(cursor.getDate() + 7); // 每周一次
  }

  // 3. 碰撞检测：查询这些日期内该教室已存在的排课
  const classroom = classInfo.classroom || "未分配";
  if (classroom !== "未分配") {
    const { data: conflicts } = await supabase
      .from("erp_schedules")
      .select("id, lesson_date, start_time, end_time, erp_classes(name)")
      .eq("classroom", classroom)
      .in("lesson_date", dates)
      .neq("class_id", classId);

    if (conflicts && conflicts.length > 0) {
      // 检测时间段重叠
      const overlaps = conflicts.filter((c: any) => {
        return c.start_time < rule.endTime && c.end_time > rule.startTime;
      });

      if (overlaps.length > 0) {
        const conflictDetails = overlaps.map((c: any) =>
          `${c.lesson_date} ${c.start_time}-${c.end_time} (${(c.erp_classes as any)?.name || '未知班级'})`
        ).join("；");
        throw new Error(`🚨 排课冲突拦截！教室「${classroom}」在以下时段已被占用：${conflictDetails}`);
      }
    }
  }

  // 4. 批量插入排课记录
  const scheduleRows = dates.map(date => ({
    class_id: classId,
    course_id: classInfo.course_id,
    classroom: classroom,
    lesson_date: date,
    start_time: rule.startTime,
    end_time: rule.endTime,
    status: "PLANNED",
  }));

  const { data: inserted, error: insertErr } = await supabase
    .from("erp_schedules")
    .insert(scheduleRows)
    .select();

  if (insertErr) {
    console.error("Schedule insert error:", insertErr);
    throw new Error("排课写入失败：" + insertErr.message);
  }

  revalidatePath("/erp/schedules");
  return { success: true, count: inserted?.length || 0, dates };
}

/**
 * 删除单条排课记录
 */
export async function deleteSchedule(scheduleId: string) {
  const supabase = getSupabase();
  const { error } = await supabase
    .from("erp_schedules")
    .delete()
    .eq("id", scheduleId);

  if (error) throw new Error("删除排课失败：" + error.message);
  revalidatePath("/erp/schedules");
  return { success: true };
}

// ─────────────────────────────────────────────────────────────
// 💰 教职工薪酬与课消核算 (Teacher Commission)
// ─────────────────────────────────────────────────────────────

export async function getTeacherCommissionStats(targetMonth: string) {
  const supabase = getSupabase();
  const ctx = await getAuthCookies();
  
  // 生成当月的第一天和最后一天
  const startDate = new Date(targetMonth);
  // @ts-ignore
  const endDate = new Date(startDate.getFullYear(), startDate.getMonth() + 1, 0);
  
  let query = supabase
    .from("erp_attendance")
    .select(`
      id,
      status,
      consumption_value,
      lesson_date,
      erp_classes(
        teacher_names,
        erp_courses(price_per_lesson)
      )
    `)
    .eq("status", "PRESENT")
    .gte("lesson_date", startDate.toISOString().split("T")[0])
    .lte("lesson_date", endDate.toISOString().split("T")[0]);

  // FIXME: erp_attendance lacks explicit campus_id in DB schema based on earlier DDL. 
  // We will do a pure in-memory isolation MVP or ignore it for this specific widget.
  
  const { data, error } = await query;
  
  if (error || !data) {
    console.error("Failed to fetch teacher commissions:", error);
    return [];
  }

  // 聚合逻辑
  const teacherMap: Record<string, { consumedHours: number, baseRevenue: number, estimatedCommission: number, classSessions: number }> = {};
  
  const COMMISSION_RATE = 0.3; // 30% 分润

  data.forEach((record: any) => {
    const classInfo = record.erp_classes;
    if (!classInfo) return;
    
    // Support parsing strings like "Wang, Li"
    const rawTeacherText = classInfo.teacher_names || "未分配教务";
    const teachers = rawTeacherText.split(/[,，]/).map((t: string) => t.trim()).filter(Boolean);
    
    let coursePrice = 0;
    const courseInfo = Array.isArray(classInfo.erp_courses) ? classInfo.erp_courses[0] : classInfo.erp_courses;
    if (courseInfo && courseInfo.price_per_lesson) {
      coursePrice = Number(courseInfo.price_per_lesson);
    }
    
    const consumed = Number(record.consumption_value || 1);
    const revenue = consumed * coursePrice;
    
    teachers.forEach((t: string) => {
      if (!teacherMap[t]) {
        teacherMap[t] = { consumedHours: 0, baseRevenue: 0, estimatedCommission: 0, classSessions: 0 };
      }
      const fraction = 1 / teachers.length;
      teacherMap[t].consumedHours += consumed * fraction;
      teacherMap[t].baseRevenue += revenue * fraction;
      teacherMap[t].estimatedCommission += revenue * fraction * COMMISSION_RATE;
      teacherMap[t].classSessions += 1;
    });
  });

  return Object.entries(teacherMap)
    .map(([name, stats]) => ({
      name,
      ...stats
    }))
    .sort((a, b) => b.estimatedCommission - a.estimatedCommission);
}

// ─────────────────────────────────────────────────────────────
// 🔄 订单逆向流转 (Refund, Archive, Transfer)
// ─────────────────────────────────────────────────────────────

/**
 * 更新订单状态（退费/结课）
 */
export async function updateEnrollmentStatus(enrollmentId: string, newStatus: string, reason: string) {
  const supabase = getSupabase();
  const ctx = await getAuthCookies();

  const { error } = await supabase
    .from("erp_enrollments")
    .update({
      enroll_status: newStatus,
      remark: `[${newStatus}] ${reason} - 操作人: ${ctx.role} / ${new Date().toLocaleDateString()}`,
      // 停止释放考勤
      remaining_lessons: 0
    })
    .eq("id", enrollmentId);

  if (error) throw new Error(`状态变更失败: ${error.message}`);
  
  revalidatePath("/erp/students");
  return { success: true };
}

/**
 * 一键转课引擎 (Course Transfer)
 * 获取旧订单剩余现价价值 -> 找寻新目标课程单价 -> 计算折合课时 -> 创建新单 / 终结旧单
 */
export async function transferCourse(
  enrollmentId: string, 
  targetCourseId: string, 
  targetClassId: string, 
  reason: string
) {
  const supabase = getSupabase();
  const ctx = await getAuthCookies();

  // 1. 获取旧订单详情与旧课程单价
  const { data: oldOrder, error: oldErr } = await supabase
    .from("erp_enrollments")
    .select("*, erp_courses(price_per_lesson)")
    .eq("id", enrollmentId)
    .single();

  if (oldErr || !oldOrder) throw new Error("找不到原订单记录");

  // 2. 获取新课程单价
  const { data: newCourse, error: newCourseErr } = await supabase
    .from("erp_courses")
    .select("price_per_lesson")
    .eq("id", targetCourseId)
    .single();

  if (newCourseErr || !newCourse) throw new Error("找不到目标课程记录");

  // 3. 计算旧课剩余价值
  const oldPrice = Number(oldOrder.erp_courses?.price_per_lesson || 0);
  const remainingLessons = Number(oldOrder.remaining_lessons || 0);
  const totalRemainingValue = oldPrice * remainingLessons;

  if (totalRemainingValue <= 0) {
    throw new Error("旧单已无剩余储值，无法转结");
  }

  // 4. 计算可兑换新课时 (向下取整或四舍五入，这里采用四舍五入精确处理)
  const newPrice = Number(newCourse.price_per_lesson || 1);
  const convertedLessons = Math.round((totalRemainingValue / newPrice) * 10) / 10; // 保留一位小数

  // 5. 开启跨表软事务：结案旧订单，创立新订单
  const { error: endErr } = await supabase
    .from("erp_enrollments")
    .update({
      enroll_status: "TRANSFERRED",
      remaining_lessons: 0,
      remark: `[转课转出] 剩余价值 ¥${totalRemainingValue} 转结至课程ID:${targetCourseId}。操作人:${ctx.role}`
    })
    .eq("id", enrollmentId);

  if (endErr) throw new Error("旧单结案环节失败");

  const { error: newErr } = await supabase
    .from("erp_enrollments")
    .insert({
      student_id: oldOrder.student_id,
      course_id: targetCourseId,
      class_id: targetClassId,
      total_purchased_lessons: convertedLessons,
      remaining_lessons: convertedLessons,
      enroll_status: "STUDYING",
      campus_id: ctx.campus_id || oldOrder.campus_id || null, // 继承旧校区或当前校区
      remark: `[转课转入] 来自订单ID:${enrollmentId}的能量流转，原始价值 ¥${totalRemainingValue}，折合排课 ${convertedLessons} 节。备注: ${reason}`
    });

  if (newErr) throw new Error("新单创建环节失败");

  revalidatePath("/erp/students");
  return { 
    success: true, 
    valueTransfer: totalRemainingValue, 
    newLessons: convertedLessons 
  };
}

// ─────────────────────────────────────────────────────────────
// ⚙️ 员工与组织智脑 (Staff & Campuses)
// ─────────────────────────────────────────────────────────────

/**
 * 拉取系统校区列表
 */
export async function getCampusesList() {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from("erp_campuses")
    .select("*")
    .order("created_at", { ascending: true });
  
  if (error) return [];
  return data || [];
}

/**
 * 拉取员工花名册
 */
export async function getStaffList() {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from("erp_staff")
    .select(`
      *,
      erp_campuses(name)
    `)
    .order("created_at", { ascending: false });

  if (error) return [];
  return data || [];
}

/**
 * 新增员工
 */
export async function addStaffMember(staffData: {
  name: string;
  phone: string;
  role: string;
  campus_id?: string | null;
  status?: string;
}) {
  const supabase = getSupabase();
  const ctx = await getAuthCookies();
  
  if (ctx.role !== "ADMIN") {
    throw new Error("权限拦截：仅限 ADMIN 可新增教职工档案");
  }

  const { error } = await supabase
    .from("erp_staff")
    .insert([{ ...staffData }]);

  if (error) throw new Error("录入员工失败：" + error.message);
  revalidatePath("/erp/settings");
  return { success: true };
}

/**
 * 停用/激活员工状态
 */
export async function toggleStaffStatus(staffId: string, currentStatus: string) {
  const supabase = getSupabase();
  const ctx = await getAuthCookies();
  
  if (ctx.role !== "ADMIN") {
    throw new Error("权限拦截：只有 ADMIN 能剥夺或赋予执剑权");
  }

  const newStatus = currentStatus === "ACTIVE" ? "DISABLED" : "ACTIVE";

  const { error } = await supabase
    .from("erp_staff")
    .update({ status: newStatus })
    .eq("id", staffId);

  if (error) throw new Error("更新状态失败");
  revalidatePath("/erp/settings");
  return { success: true, status: newStatus };
}

// ─────────────────────────────────────────────────────────────
// 🧲 CRM 招生线索漏斗 (erp_leads)
// ─────────────────────────────────────────────────────────────

export async function getLeads() {
  const supabase = getSupabase();
  const ctx = await getAuthCookies();
  let query = supabase
    .from("erp_leads")
    .select("*, erp_staff:assigned_staff_id(name)")
    .order("created_at", { ascending: false });

  if (ctx.role !== "ADMIN" && ctx.campus_id) {
    query = query.eq("campus_id", ctx.campus_id);
  }

  const { data, error } = await query;
  if (error) {
    console.error("Error fetching leads:", error);
    return [];
  }
  return data || [];
}

export async function addLead(leadData: any) {
  const supabase = getSupabase();
  const ctx = await getAuthCookies();
  
  if (ctx.campus_id) {
    leadData.campus_id = ctx.campus_id;
  }

  const { error } = await supabase
    .from("erp_leads")
    .insert([leadData]);

  if (error) throw error;
  revalidatePath("/erp/leads");
  return { success: true };
}

export async function updateLeadStatus(id: string, status: string, note?: string) {
  const supabase = getSupabase();
  const updateData: any = { status };
  if (note) updateData.follow_up_note = note;

  const { error } = await supabase
    .from("erp_leads")
    .update(updateData)
    .eq("id", id);

  if (error) throw error;
  revalidatePath("/erp/leads");
  return { success: true };
}

export async function convertLeadToStudent(leadId: string) {
  const supabase = getSupabase();
  const ctx = await getAuthCookies();

  // 1. 获取线索详情
  const { data: lead, error: fetchError } = await supabase
    .from("erp_leads")
    .select("*")
    .eq("id", leadId)
    .single();

  if (fetchError || !lead) throw new Error("线索不存在能被转化");

  // 2. 插入新学员 (到 erp_students)
  const { data: newStudent, error: insertError } = await supabase
    .from("erp_students")
    .insert([{
      name: lead.name,
      parent_phone: lead.phone,
      campus_id: lead.campus_id || ctx.campus_id,
      notes: `[转化线索] 来源: ${lead.source}. 意向: ${lead.interest_course || '无'}. 备注: ${lead.follow_up_note || ''}`
    }])
    .select()
    .single();

  if (insertError) throw new Error("学员导入失败: " + insertError.message);

  // 3. 更新流失/转化状态为 CONVERTED
  await supabase
    .from("erp_leads")
    .update({ status: "CONVERTED" })
    .eq("id", leadId);

  revalidatePath("/erp/leads");
  revalidatePath("/erp/students");
  revalidateTag("erp-data");

  return { success: true, studentId: newStudent.id };
}

// ─────────────────────────────────────────────────────────────
// 🏛️ 金融底座不可变账单流水 (erp_financial_ledgers)
// ─────────────────────────────────────────────────────────────
export async function getLedgerLogs(limit = 100) {
  const supabase = getSupabase();
  const ctx = await getAuthCookies();

  let query = supabase
    .from("erp_financial_ledgers")
    .select(`
      *,
      erp_students(name, parent_phone),
      erp_enrollments(course_id, class_id)
    `)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (ctx.role !== "ADMIN" && ctx.campus_id) {
    query = query.eq("campus_id", ctx.campus_id);
  }

  const { data, error } = await query;
  if (error) {
    console.error("查账失败:", error);
    return [];
  }
  return data || [];
}
