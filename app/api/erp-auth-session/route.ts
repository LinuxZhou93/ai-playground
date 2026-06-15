import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { encryptSession } from "@/lib/crypto";

const ADMIN_EMAIL = "13699466775@swarm.local";

export async function POST(request: NextRequest) {
  const authHeader = request.headers.get("authorization") || "";
  const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : "";

  if (!token) {
    return NextResponse.json({ ok: false, message: "Missing auth token" }, { status: 401 });
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    return NextResponse.json({ ok: false, message: "Missing Supabase config" }, { status: 500 });
  }

  const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const { data, error } = await supabase.auth.getUser(token);
  const email = data.user?.email || "";

  if (error || email !== ADMIN_EMAIL) {
    return NextResponse.json({ ok: false, message: "Unauthorized" }, { status: 403 });
  }

  const response = NextResponse.json({ ok: true });
  const maxAge = 60 * 60 * 24;
  const role = "ADMIN";
  const campusName = "ALL";
  const campusId = "";
  const sessionToken = await encryptSession({ role, campusName, campusId });

  response.cookies.set("X-FC-Role", role, { path: "/", maxAge });
  response.cookies.set("X-FC-Campus-Name", campusName, { path: "/", maxAge });
  response.cookies.set("X-FC-Campus-Id", campusId, { path: "/", maxAge });

  if (sessionToken) {
    response.cookies.set("X-FC-Auth-Token", sessionToken, {
      path: "/",
      maxAge,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
    });
  }

  return response;
}
