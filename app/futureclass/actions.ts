"use server";

import { getSupabase } from "@/lib/supabase/singleton";
import { revalidatePath, revalidateTag, unstable_cache } from "next/cache";
import { getModel } from "@/lib/ai/providers";
import { callLLM } from "@/lib/ai/llm";

// ─────────────────────────────────────────────────────────────
// 📦 基础查询
// ─────────────────────────────────────────────────────────────

/**
 * 获取所有学员列表
 */
export async function getStudents() {
  const supabase = getSupabase();
  const { data, error } = await supabase
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
  
  if (error) {
    console.error("Error fetching students:", error);
    return [];
  }
  return data;
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
  return data;
}

/**
 * 获取班级列表（含关联课程信息）
 */
export async function getClasses() {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from("erp_classes")
    .select("*, erp_courses(name)")
    .order("created_at", { ascending: false });
  
  if (error) return [];
  return data;
}

/**
 * 获取指定班级的学员列表 (含报读状态)
 */
export async function getStudentsByClass(classId: string) {
  const supabase = getSupabase();
  const { data, error } = await supabase
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
      await supabase
        .from("erp_enrollments")
        .update({ remaining_lessons: newRemaining })
        .eq("id", enrollment.id);
    }
  }

  revalidatePath("/futureclass/attendance");
  revalidatePath("/futureclass/dashboard");
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
      await supabase
        .from("erp_enrollments")
        .update({ remaining_lessons: Math.max(0, Number(enrollment.remaining_lessons) - 1) })
        .eq("id", enrollment.id);
    }
  };

  await Promise.all(studentIds.map(deductOne));

  revalidatePath("/futureclass/attendance");
  revalidatePath("/futureclass/dashboard");
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
  const now = new Date();
  const firstDay = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();

  // 并行执行 4 次独立查询
  const [studentRes, warningRes, newRes, monthEnrollRes] = await Promise.all([
    // 1. 总学员数
    supabase
      .from("erp_students")
      .select("*", { count: "exact", head: true }),
    // 2. 预警学员 (剩余课时 < 3)
    supabase
      .from("erp_enrollments")
      .select("*", { count: "exact", head: true })
      .lt("remaining_lessons", 3),
    // 3. 本月新报
    supabase
      .from("erp_enrollments")
      .select("*", { count: "exact", head: true })
      .gte("created_at", firstDay),
    // 4. 本月报课收入数据
    supabase
      .from("erp_enrollments")
      .select("total_purchased_lessons, erp_courses(price_per_lesson)")
      .gte("created_at", firstDay),
  ]);

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

/**
 * 获取单个学员完整画像 (含报读、考勤、AI点评)
 */
export async function getStudentDetail(studentId: string) {
  const supabase = getSupabase();

  // 并行获取学员基础信息 + 报读记录 + 考勤记录
  const [studentRes, enrollRes, attendRes] = await Promise.all([
    supabase.from("erp_students").select("*").eq("id", studentId).single(),
    supabase.from("erp_enrollments")
      .select(`*, erp_courses(name, price_per_lesson, category), erp_classes(name, classroom)`)
      .eq("student_id", studentId)
      .order("created_at", { ascending: false }),
    supabase.from("erp_attendance")
      .select(`*, erp_classes(name)`)
      .eq("student_id", studentId)
      .order("created_at", { ascending: false })
      .limit(30),
  ]);

  if (studentRes.error || !studentRes.data) return null;

  return {
    ...studentRes.data,
    enrollments: enrollRes.data || [],
    attendanceRecords: attendRes.data || [],
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
  
  const { data: enrollments, error } = await supabase
    .from("erp_enrollments")
    .select("total_purchased_lessons, erp_courses(price_per_lesson)");
  
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
  const { data, error } = await supabase
    .from("erp_enrollments")
    .select(`
      *,
      erp_students(name),
      erp_courses(name, price_per_lesson)
    `)
    .order("created_at", { ascending: false });
  
  if (error) return [];
  return data;
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
  const { data, error } = await supabase
    .from("erp_students")
    .insert([studentData])
    .select()
    .single();

  if (error) throw error;
  revalidatePath("/futureclass/students");
  revalidateTag("erp-data");
  return data;
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
  const { error } = await supabase
    .from("erp_enrollments")
    .insert({
      student_id: enrollData.studentId,
      course_id: enrollData.courseId,
      class_id: enrollData.classId,
      total_purchased_lessons: enrollData.totalLessons,
      remaining_lessons: enrollData.totalLessons,
      enroll_status: 'STUDYING',
      remark: enrollData.remark
    });

  if (error) throw error;
  revalidatePath("/futureclass/students");
  revalidatePath("/futureclass/dashboard");
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
  revalidatePath("/futureclass/courses");
  revalidateTag("erp-data");
  return data;
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
  revalidatePath("/futureclass/classes");
  revalidateTag("erp-data");
  return data;
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
  revalidatePath("/futureclass/courses");
  return { success: true };
}

// ─────────────────────────────────────────────────────────────
// 🤖 AI 智能
// ─────────────────────────────────────────────────────────────

/**
 * AI 智能生成课后点评 (集成 Gemini-3-Flash via Backgrace)
 */
export async function generateAIFeedback(studentName: string, keywords: string[]) {
  try {
    const { model } = getModel({
      providerId: 'google',
      modelId: 'gemini-3-flash', // 🛡️ [Titan Order] 锁死稳定版
      apiKey: process.env.GOOGLE_API_KEY,
    });

    // 超时保护：15秒无响应则降级
    const timeout = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error("AI 响应超时 (15s)")), 15000)
    );

    const llmCall = callLLM({
      model,
      maxTokens: 300,
      system: "你是STEM科技教育老师，用正面专业的语言与家长沟通。直接输出点评内容，不要加任何前缀。",
      prompt: `为学员"${studentName}"写课后微信点评。关键词：${keywords.join("、")}。要求：亲切鼓励，100字内，含Emoji。`,
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
const getCachedDashboardData = unstable_cache(
  async () => {
    const [stats, enrollments, classes, trend] = await Promise.all([
      getDashboardStats(),
      getEnrollments(),
      getClasses(),
      getAttendanceTrend(7),
    ]);
    return { stats, enrollments, classes, trend };
  },
  ['erp-dashboard-data'],
  { revalidate: 60, tags: ['erp-data'] }
);

export async function loadDashboardData() {
  return getCachedDashboardData();
}

/**
 * 考勤页缓存数据加载器
 */
const getCachedAttendanceData = unstable_cache(
  async () => {
    const [classes, stats] = await Promise.all([
      getClasses(),
      getDashboardStats(),
    ]);
    return { classes, stats };
  },
  ['erp-attendance-data'],
  { revalidate: 60, tags: ['erp-data'] }
);

export async function loadAttendanceData() {
  return getCachedAttendanceData();
}

/**
 * 学员管理页缓存数据加载器
 */
const getCachedStudentsPageData = unstable_cache(
  async () => {
    const [students, stats, courses, classes] = await Promise.all([
      getStudents(),
      getDashboardStats(),
      getCourses(),
      getClasses(),
    ]);
    return { students, stats, courses, classes };
  },
  ['erp-students-page-data'],
  { revalidate: 60, tags: ['erp-data'] }
);

export async function loadStudentsPageData() {
  return getCachedStudentsPageData();
}

/**
 * 课程库缓存数据加载器
 */
const getCachedCoursesPageData = unstable_cache(
  async () => {
    const [courses] = await Promise.all([
      getCoursesWithStats()
    ]);
    return courses;
  },
  ['erp-courses-page-data'],
  { revalidate: 60, tags: ['erp-data'] }
);

export async function loadCoursesPageData() {
  return getCachedCoursesPageData();
}

/**
 * 财务中心缓存数据加载器
 */
const getCachedFinancePageData = unstable_cache(
  async () => {
    const [stats, enrollments] = await Promise.all([
      getFinanceStats(),
      getEnrollments(),
    ]);
    return { stats, enrollments };
  },
  ['erp-finance-page-data'],
  { revalidate: 60, tags: ['erp-data'] }
);

export async function loadFinancePageData() {
  return getCachedFinancePageData();
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
  return data;
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
  return data;
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

  revalidatePath("/futureclass/schedules");
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
  revalidatePath("/futureclass/schedules");
  return { success: true };
}
