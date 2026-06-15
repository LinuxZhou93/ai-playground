"use server";

import { revalidatePath } from "next/cache";
import { getSupabase } from "@/lib/supabase/singleton";

export type TechSpecialistIntakeRow = {
  id: string;
  student_name: string;
  grade_school: string | null;
  parent_name: string | null;
  parent_contact: string;
  meeting_goal: string | null;
  preferred_time: string | null;
  status: string;
  payload: Record<string, any>;
  created_at: string;
  updated_at: string;
};

type LeadRow = {
  id: string;
  name: string | null;
  phone: string | null;
  source: string | null;
  interest_course: string | null;
  follow_up_note: string | null;
  status: string;
  created_at: string;
  updated_at?: string | null;
};

function parseLeadPayload(lead: LeadRow) {
  try {
    const parsed = JSON.parse(lead.follow_up_note || "{}");
    return parsed?.payload || {};
  } catch {
    return {};
  }
}

function leadToIntakeRow(lead: LeadRow): TechSpecialistIntakeRow {
  const payload = parseLeadPayload(lead);
  return {
    id: lead.id,
    student_name: payload.studentName || lead.name || "",
    grade_school: payload.ageGradeSchool || null,
    parent_name: payload.parentName || null,
    parent_contact: payload.parentContact || lead.phone || "",
    meeting_goal: payload.meetingGoal || null,
    preferred_time: payload.preferredTime || null,
    status: lead.status || "NEW",
    payload,
    created_at: lead.created_at,
    updated_at: lead.updated_at || lead.created_at,
  };
}

export async function getTechSpecialistIntakes(): Promise<{ data: TechSpecialistIntakeRow[]; error?: string }> {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from("erp_leads")
    .select("*")
    .eq("source", "科技特长生面谈表单")
    .order("created_at", { ascending: false })
    .limit(500);

  if (error) {
    console.error("getTechSpecialistIntakes failed", error);
    return { data: [], error: error.message };
  }

  return { data: ((data || []) as LeadRow[]).map(leadToIntakeRow) };
}

export async function updateTechSpecialistIntakeStatus(id: string, status: string) {
  const supabase = getSupabase();
  const { error } = await supabase
    .from("erp_leads")
    .update({ status })
    .eq("id", id);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/erp/intake");
  return { success: true };
}
