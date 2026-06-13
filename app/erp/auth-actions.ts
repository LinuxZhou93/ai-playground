"use server";

import { cookies } from "next/headers";
import { encryptSession, decryptSession } from "@/lib/crypto";

/**
 * 设置权限 Cookie (支持 UI 明文 Cookie 与后端防篡改加密 Session 双轨写入)
 */
export async function setAuthCookies(role: string, campusName: string, campusId: string) {
  const cookieStore = await cookies();
  
  // 1. 写入 UI 渲染用普通 Cookie (非敏感，仅用于前端侧边栏展示等交互)
  cookieStore.set("X-FC-Role", role, { path: "/", maxAge: 60 * 60 * 24 });
  cookieStore.set("X-FC-Campus-Name", campusName, { path: "/", maxAge: 60 * 60 * 24 });
  cookieStore.set("X-FC-Campus-Id", campusId, { path: "/", maxAge: 60 * 60 * 24 });
  
  // 2. 写入后端鉴权专用 HttpOnly 加密会话 Token (防篡改)
  const token = await encryptSession({ role, campusName, campusId });
  if (token) {
    cookieStore.set("X-FC-Auth-Token", token, {
      path: "/",
      maxAge: 60 * 60 * 24,
      httpOnly: true, // 彻底防 XSS 读取
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax"
    });
  }
  
  return { success: true };
}

/**
 * 获取经过安全验证的用户权限会话
 */
export async function getAuthCookies() {
  const cookieStore = await cookies();
  const authToken = cookieStore.get("X-FC-Auth-Token")?.value;
  
  // 1. 优先读取并解密安全 Auth Token
  if (authToken) {
    const session = await decryptSession(authToken);
    if (session) {
      return {
        role: session.role || "GUEST",
        campus_name: session.campusName || "ALL",
        campus_id: session.campusId || "",
      };
    }
  }
  
  // 2. 降级逻辑 (若没有 Token，或解密失败)
  const isDev = process.env.NODE_ENV === "development";
  if (isDev) {
    // 本地开发模式下退化到明文 Cookie，方便开发联调
    return {
      role: cookieStore.get("X-FC-Role")?.value || "ADMIN",
      campus_name: cookieStore.get("X-FC-Campus-Name")?.value || "ALL",
      campus_id: cookieStore.get("X-FC-Campus-Id")?.value || "",
    };
  }
  
  // 生产环境安全加固：缺失或伪造 Cookie 时一律直接判定为 GUEST 最低特权
  return {
    role: "GUEST",
    campus_name: "ALL",
    campus_id: "",
  };
}
