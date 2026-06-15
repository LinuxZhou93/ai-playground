import { NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabase/singleton";

type SignupPayload = {
  phone?: string;
  childName?: string;
  childGender?: string;
  childAge?: string;
  idNumber?: string;
  grade?: string;
  school?: string;
  paidConfirmed?: boolean;
};

function clean(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

export async function POST(request: Request) {
  let payload: SignupPayload;

  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ ok: false, message: "提交内容格式不正确。" }, { status: 400 });
  }

  const phone = clean(payload.phone);
  const childName = clean(payload.childName);
  const idNumber = clean(payload.idNumber);

  if (!phone || !childName || !idNumber) {
    return NextResponse.json({ ok: false, message: "请补全手机号、孩子姓名和身份证号。" }, { status: 400 });
  }

  const record = {
    form_type: "EAI619_BEIHANG_STUDY_TOUR",
    submitted_at: new Date().toISOString(),
    payment: {
      method: "收钱吧扫码",
      amount_yuan: 180,
      confirmed_by_parent: payload.paidConfirmed === true,
    },
    payload: {
      parentPhone: phone,
      childName,
      childGender: clean(payload.childGender),
      childAge: clean(payload.childAge),
      childIdNumber: idNumber,
      grade: clean(payload.grade),
      school: clean(payload.school),
      activity: "未来工程师：具身智能机器人北航半日研学",
      activityTime: "2026-06-19 09:00-12:30",
      activityAddress: "北京航空航天大学成都研究院",
    },
  };

  try {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from("erp_leads")
      .insert({
        name: childName,
        phone,
        source: "EAI619北航具身智能研学报名页",
        interest_course: "北航具身智能机器人半日研学",
        follow_up_note: JSON.stringify(record, null, 2),
        status: payload.paidConfirmed ? "PAID_PENDING_REVIEW" : "NEW",
      })
      .select("id")
      .single();

    if (error) {
      console.error("EAI619 signup insert failed", error);
      return NextResponse.json({ ok: false, message: "提交失败，请稍后重试。" }, { status: 500 });
    }

    return NextResponse.json({ ok: true, id: data?.id });
  } catch (error) {
    console.error("EAI619 signup route failed", error);
    return NextResponse.json({ ok: false, message: "后台服务暂时不可用。" }, { status: 500 });
  }
}
