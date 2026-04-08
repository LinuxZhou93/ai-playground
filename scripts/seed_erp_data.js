const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing Supabase credentials in .env.local");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function seedERP() {
  console.log("🚀 Starting ERP Data Seeding...");

  // 1. Seed Courses
  const { data: courses, error: courseErr } = await supabase.from('erp_courses').insert([
    { name: "VEX GO L3 智能机器人", category: "机器人", duration_min: 90, price_per_lesson: 200, total_lessons: 16 },
    { name: "Python 编程基础", category: "编程", duration_min: 120, price_per_lesson: 280, total_lessons: 24 },
    { name: "Arduino 电子创客", category: "电子", duration_min: 90, price_per_lesson: 180, total_lessons: 12 }
  ]).select();

  if (courseErr) console.error("Course Seed Error:", courseErr);
  else console.log("✅ Courses seeded.");

  // 2. Seed Students
  const { data: students, error: studentErr } = await supabase.from('erp_students').insert([
    { name: "刘沐言", gender: "女", phone: "13800001111", parent_name: "刘先生", source: "地推", grade: "小学三年级" },
    { name: "许高懿", gender: "男", phone: "13911112222", parent_name: "许女士", source: "转介绍", grade: "小学五年级" },
    { name: "唐习远", gender: "男", phone: "13722223333", parent_name: "唐先生", source: "线上广告", grade: "初二" }
  ]).select();

  if (studentErr) console.error("Student Seed Error:", studentErr);
  else console.log("✅ Students seeded.");

  // 3. Seed Classes
  const { data: classes, error: classErr } = await supabase.from('erp_classes').insert([
    { name: "机器人周六班", course_id: courses[0].id, classroom: "科创室 1", capacity: 10, start_date: '2026-04-01' },
    { name: "Python 周日班", course_id: courses[1].id, classroom: "编程实验室", capacity: 8, start_date: '2026-04-01' }
  ]).select();

  if (classErr) console.error("Class Seed Error:", classErr);
  else console.log("✅ Classes seeded.");

  // 4. Seed Enrollments
  const enrollments = students.map((s, i) => ({
    student_id: s.id,
    class_id: classes[i % 2].id,
    course_id: classes[i % 2].course_id,
    total_purchased_lessons: 16,
    remaining_lessons: 16.0,
    enroll_status: 'STUDYING'
  }));

  const { error: enrollErr } = await supabase.from('erp_enrollments').insert(enrollments);
  if (enrollErr) console.error("Enrollment Seed Error:", enrollErr);
  else console.log("✅ Enrollments seeded.");

  console.log("🌟 Seeding Completed Successfully.");
}

seedERP();
