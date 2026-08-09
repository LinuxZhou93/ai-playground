import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const runtime = 'nodejs';

const CAMP_NAME = '成电创客基地×川大MBA校友会·2026亲子公益研学体验活动';
const SUPABASE_URL_FALLBACK = 'https://znmbkxmnwuurzhevfxtq.supabase.co';
const SUPABASE_ANON_FALLBACK =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpubWJreG1ud3V1cnpoZXZmeHRxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ1Nzk1MDQsImV4cCI6MjA4MDE1NTUwNH0.y0m9rnug3WduVyuKZLL25PBA4C2Ys0_WSgMrzokSh5g';

const dimensions = [
  { key: 'focus_score', name: '专注度' },
  { key: 'dexterity_score', name: '动手精细度' },
  { key: 'logic_score', name: '逻辑理解力' },
  { key: 'resilience_score', name: '抗挫折恢复' },
  { key: 'self_management_score', name: '情绪与收纳' },
  { key: 'social_score', name: '社会化融入' },
  { key: 'creativity_score', name: '创新想象力' },
  { key: 'collaboration_score', name: '协作沟通力' },
] as const;

type DimensionKey = (typeof dimensions)[number]['key'];

function safeText(value: unknown, maxLength: number) {
  return typeof value === 'string' ? value.trim().slice(0, maxLength) : '';
}

function scoreBand(score: number) {
  if (score >= 90) return '表现突出';
  if (score >= 80) return '表现良好';
  if (score >= 70) return '具备基础';
  return '建议持续观察';
}

function encodeMetadata(metadata: Record<string, string | number>) {
  return `EXP64:${Buffer.from(JSON.stringify(metadata), 'utf8').toString('base64url')}`;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const studentName = safeText(body.student_name, 40);
    const grade = safeText(body.grade, 30);
    const evaluatorName = safeText(body.evaluator_name, 40);
    const highlights = safeText(body.highlights, 500);
    const potentialImprovements = safeText(body.potential_improvements, 500);
    const age = Number(body.age);

    if (!studentName || !grade || !Number.isInteger(age) || age < 6 || age > 18) {
      return NextResponse.json(
        { success: false, error: '请完整填写学生姓名、年龄和年级。' },
        { status: 400 },
      );
    }

    const scores = {} as Record<DimensionKey, number>;
    for (const dimension of dimensions) {
      const value = Number(body[dimension.key]);
      if (!Number.isInteger(value) || value < 0 || value > 100) {
        return NextResponse.json(
          { success: false, error: `${dimension.name}需为0—100之间的整数。` },
          { status: 400 },
        );
      }
      scores[dimension.key] = value;
    }

    const ranked = dimensions
      .map((dimension) => ({ ...dimension, score: scores[dimension.key] }))
      .sort((a, b) => b.score - a.score);
    const average = Math.round(ranked.reduce((sum, item) => sum + item.score, 0) / ranked.length);
    const strengths = ranked.slice(0, 3);
    const growth = [...ranked].reverse().slice(0, 2);
    const observationNote = highlights
      ? `结合现场记录，孩子在活动中呈现出“${highlights}”等可观察表现。`
      : '本次结论依据现场八维评分形成，建议结合后续多场景表现持续观察。';
    const growthNote = potentialImprovements
      ? `后续可重点关注：${potentialImprovements}。`
      : `后续可优先通过短周期、可完成的小任务，继续观察${growth.map((item) => item.name).join('与')}的稳定性。`;

    const overallReport = `${studentName}本次体验活动八维综合得分为${average}分，整体处于“${scoreBand(average)}”区间。相对优势集中在${strengths.map((item) => `${item.name}（${item.score}分）`).join('、')}，说明孩子在本次科技实践情境中展现了较好的相关潜力。${observationNote}${growthNote}本报告反映的是单次活动中的行为观察，不等同于心理诊断、能力定型或升学结论。`;

    const recommendations = [
      `优势迁移：围绕${strengths
        .slice(0, 2)
        .map((item) => item.name)
        .join('和')}设计每周1次、30—45分钟的科技实践任务，让优势在持续作品中沉淀。`,
      `成长训练：针对${growth.map((item) => item.name).join('和')}，采用“任务拆小—即时反馈—复盘改进”的节奏，每次只设一个可观察目标。`,
      '家校共察：连续4周记录孩子的任务选择、坚持时间、求助方式与复盘表达，再据此调整课程难度和培养方向。',
    ];

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || SUPABASE_URL_FALLBACK;
    const supabaseKey =
      process.env.SUPABASE_SERVICE_ROLE_KEY ||
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
      SUPABASE_ANON_FALLBACK;
    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json(
        { success: false, error: '报告服务暂未完成环境配置，请联系工作人员。' },
        { status: 503 },
      );
    }

    const supabase = createClient(supabaseUrl, supabaseKey, {
      auth: { persistSession: false },
    });
    const studentId = encodeMetadata({
      ref: `EXP-${Date.now().toString(36).toUpperCase()}`,
      age,
      grade,
      evaluator_name: evaluatorName,
    });

    const { data, error } = await supabase
      .from('camp_evaluations')
      .insert({
        student_id: studentId,
        student_name: studentName,
        camp_name: CAMP_NAME,
        ...scores,
        highlights,
        potential_improvements: potentialImprovements,
        ai_overall_report: overallReport,
        ai_recommendations: recommendations,
      })
      .select('id')
      .single();

    if (error) {
      console.error('experience report insert failed', error);
      return NextResponse.json(
        { success: false, error: '报告生成失败，请稍后重试或联系工作人员。' },
        { status: 500 },
      );
    }

    return NextResponse.json({ success: true, id: data.id });
  } catch (error) {
    console.error('experience report request failed', error);
    return NextResponse.json(
      { success: false, error: '提交内容无法识别，请检查后重试。' },
      { status: 400 },
    );
  }
}
