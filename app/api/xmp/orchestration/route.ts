import { NextRequest, NextResponse } from "next/server";
import { decryptSession } from "@/lib/crypto";
import { restoreClassroomOrchestration } from "@/lib/xmp/classroom-orchestration";
import type { XmpVerifiedSession } from "@/lib/xmp/event-server";
import {
  getOrchestrationStatus,
  readOrchestrationState,
  saveOrchestrationState,
} from "@/lib/xmp/orchestration-server";

export const dynamic = "force-dynamic";
const headers = {
  "Cache-Control": "no-store, max-age=0",
  "X-Content-Type-Options": "nosniff",
  "X-XMP-Data-Mode": "server-governed",
};

async function session(
  request: NextRequest,
): Promise<XmpVerifiedSession | null> {
  const token = request.cookies.get("X-FC-Auth-Token")?.value;
  if (!token) return null;
  const value = await decryptSession(token);
  if (!value || !["ADMIN", "TEACHER", "ACADEMIC"].includes(value.role))
    return null;
  return { role: value.role, campusId: value.campusId ?? "" };
}

export async function GET(request: NextRequest) {
  const verified = await session(request);
  const status = getOrchestrationStatus(verified);
  const sessionId = request.nextUrl.searchParams.get("sessionId")?.trim();
  if (!status.writable || !sessionId)
    return NextResponse.json({ ...status, state: null }, { headers });
  try {
    const remote = await readOrchestrationState(sessionId);
    return NextResponse.json({ ...status, remote }, { headers });
  } catch {
    return NextResponse.json(
      { error: { code: "READ_UNAVAILABLE", message: "课堂状态读取失败" } },
      { status: 503, headers },
    );
  }
}

export async function PUT(request: NextRequest) {
  const verified = await session(request);
  const status = getOrchestrationStatus(verified);
  if (!status.configured)
    return NextResponse.json(
      { error: { code: "LOCAL_ONLY", message: "Supabase 同步尚未配置" } },
      { status: 503, headers },
    );
  if (!status.authenticated)
    return NextResponse.json(
      { error: { code: "AUTH_REQUIRED", message: "需要有效园所会话" } },
      { status: 401, headers },
    );
  if (!status.writable)
    return NextResponse.json(
      { error: { code: "TENANT_MISMATCH", message: "园所租户不匹配" } },
      { status: 403, headers },
    );

  const raw = await request.text();
  if (new TextEncoder().encode(raw).byteLength > 262_144)
    return NextResponse.json(
      { error: { code: "PAYLOAD_TOO_LARGE", message: "课堂状态超过 256KB" } },
      { status: 413, headers },
    );
  try {
    const body = JSON.parse(raw) as {
      state?: unknown;
      expectedRevision?: unknown;
    };
    const state = restoreClassroomOrchestration(body.state);
    if (!state)
      return NextResponse.json(
        { error: { code: "INVALID_STATE", message: "课堂状态协议无效" } },
        { status: 400, headers },
      );
    const expectedRevision =
      body.expectedRevision === null
        ? null
        : typeof body.expectedRevision === "number"
          ? body.expectedRevision
          : undefined;
    if (expectedRevision === undefined)
      return NextResponse.json(
        { error: { code: "INVALID_REVISION", message: "缺少服务端修订号" } },
        { status: 400, headers },
      );
    const saved = await saveOrchestrationState(
      state,
      expectedRevision,
      `${verified!.role}:${verified!.campusId || "all"}`,
    );
    if (saved.conflict)
      return NextResponse.json(
        {
          error: {
            code: "REVISION_CONFLICT",
            message: "服务端已有更新，请刷新后重试",
          },
        },
        { status: 409, headers },
      );
    return NextResponse.json({ ok: true, ...saved }, { headers });
  } catch {
    return NextResponse.json(
      { error: { code: "WRITE_UNAVAILABLE", message: "课堂状态保存失败" } },
      { status: 503, headers },
    );
  }
}
