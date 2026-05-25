"use server";

import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { getSupabase } from "@/lib/supabase/singleton";

export type IntakePayload = {
  studentName: string;
  ageGradeSchool: string;
  parentName: string;
  parentContact: string;
  meetingGoal: string;
  preferredTime: string;
  currentStage: string[];
  learningHistory: string;
  programmingFoundation: Record<string, string>;
  roboticsFoundation: Record<string, string>;
  projectCompetition: string;
  learningTraits: Record<string, string>;
  familySupport: Record<string, string>;
  parentQuestions: string;
  childInterest: string;
  attachmentsNote: string;
};

export type IntakeActionResult = {
  ok: boolean;
  message: string;
  id?: string;
};

export async function submitTechSpecialistIntake(payload: IntakePayload): Promise<IntakeActionResult> {
  const studentName = payload.studentName?.trim();
  const parentContact = payload.parentContact?.trim();

  if (!studentName) {
    return { ok: false, message: "请填写孩子姓名。" };
  }

  if (!parentContact) {
    return { ok: false, message: "请填写家长联系方式，方便老师会前确认。" };
  }

  const headerStore = await headers();
  const userAgent = headerStore.get("user-agent") || "";
  const supabase = getSupabase();
  const intakeRecord = {
    form_type: "TECH_SPECIALIST_INTAKE",
    submitted_at: new Date().toISOString(),
    payload,
    user_agent: userAgent,
  };

  const { data, error } = await supabase
    .from("erp_leads")
    .insert({
      name: payload.parentName?.trim()
        ? `${studentName}（${payload.parentName.trim()}）`
        : studentName,
      phone: parentContact,
      source: "科技特长生面谈表单",
      interest_course: "科技特长生课程规划",
      follow_up_note: JSON.stringify(intakeRecord, null, 2),
      status: "NEW",
    })
    .select("id")
    .single();

  if (error) {
    console.error("submitTechSpecialistIntake failed", error);
    if (error.message?.includes("relation") || error.code === "42P01") {
      return { ok: false, message: "后台招生线索表尚未创建，请先确认 Supabase ERP 数据表。" };
    }
    return { ok: false, message: "提交失败，请稍后重试或直接把填写内容发给周老师。" };
  }

  revalidatePath("/erp/intake");
  return { ok: true, message: "已提交。周老师会基于这份信息准备面谈提纲。", id: data?.id };
}
