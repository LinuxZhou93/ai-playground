import { NextResponse } from 'next/server';
import { addCourse } from '@/app/erp/actions';
import { getSupabase } from '@/lib/supabase/singleton';

/**
 * POST /api/edu/publish
 * 将 AI 生成的课件发布到 FutureClass ERP 教务中台
 * V2 重构：不仅下发元数据，同时持久化完整的课件正文(slides)和逐课大纲(lesson_plans)
 */
export async function POST(req: Request) {
  try {
    const data = await req.json();
    const { course_meta, slides, lesson_plan } = data;

    if (!course_meta || !course_meta.name) {
      return NextResponse.json({ error: 'Missing course metadata' }, { status: 400 });
    }

    const totalLessons = course_meta.total_lessons || slides?.length || 8;

    // 1. 将课件元数据适配到 ERP
    const coursePayload = {
      name: course_meta.name,
      category: course_meta.category || '综合',
      price_per_lesson: 0,  // 新课件默认价格为0，后续由教务在 ERP 里调整
      total_lessons: totalLessons,
      duration_min: course_meta.duration_min || 90,
    };

    const newCourse = await addCourse(coursePayload);
    const courseId = newCourse?.id;

    if (courseId) {
       const supabase = getSupabase();
       
       // 2. 课件正文持久化 (解决“生成即丢弃”断点)
       await supabase.from('edu_lesson_plans').insert({
         course_id: courseId,
         version: 1,
         slides: slides || [],
         lesson_plan: lesson_plan || '',
         status: 'PUBLISHED',
         created_by: 'AI_GENERATOR'
       });

       // 3. 逐课骨架生成 (提供教研管理最小颗粒度维度)
       const lessonsData = [];
       const outlineList = data.lessons_outline || [];
       
       for (let i = 1; i <= totalLessons; i++) {
          // 如果生成了幻灯片，尝试将前几课与幻灯片页面直接映射辅助设计
          const matchSlide = slides[i - 1]; 
          // 查找是否有对应的 outline
          const outline = outlineList.find((ol: any) => ol.lesson_number === i) || {};
          
          lessonsData.push({
             course_id: courseId,
             lesson_number: i,
             title: outline.title || (matchSlide ? matchSlide.title : `第 ${i} 课时 (教学设计待补全)`),
             objectives: outline.objectives || [],
             materials: outline.materials || [],
             duration_min: course_meta.duration_min || 90,
             slide_index: matchSlide ? i - 1 : null,
             status: 'PLANNED'
          });
       }
       await supabase.from('edu_lessons').insert(lessonsData);
    }

    return NextResponse.json({
      success: true,
      data: {
        course: newCourse,
        message: '课程骨架排配及其附属全景课件已入库！'
      }
    });

  } catch (error: any) {
    console.error('Publish API Error:', error);
    return NextResponse.json({ 
      error: 'Failed to publish course and lesson plans', 
      details: error.message 
    }, { status: 500 });
  }
}
