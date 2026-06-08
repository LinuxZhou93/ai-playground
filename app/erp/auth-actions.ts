"use server";

import { cookies } from "next/headers";

export async function setAuthCookies(role: string, campusName: string, campusId: string) {
  // Wait for cookies due to Next.js 15+ potential deprecations if sync 
  const cookieStore = await cookies();
  
  // Note: For Next14 cookies().set() works sync, but we treat it loosely
  cookieStore.set("X-FC-Role", role, { path: "/", maxAge: 60 * 60 * 24 });
  cookieStore.set("X-FC-Campus-Name", campusName, { path: "/", maxAge: 60 * 60 * 24 });
  cookieStore.set("X-FC-Campus-Id", campusId, { path: "/", maxAge: 60 * 60 * 24 });
  
  return { success: true };
}

export async function getAuthCookies() {
  const cookieStore = await cookies();
  return {
    role: cookieStore.get("X-FC-Role")?.value || "ADMIN",
    campus_name: cookieStore.get("X-FC-Campus-Name")?.value || "ALL",
    campus_id: cookieStore.get("X-FC-Campus-Id")?.value || "",
  };
}
