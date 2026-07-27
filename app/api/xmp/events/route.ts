import { NextRequest, NextResponse } from "next/server";
import { decryptSession } from "@/lib/crypto";
import {
  appendXmpEvent,
  getXmpEventStatus,
  listXmpEvents,
  type XmpVerifiedSession,
} from "@/lib/xmp/event-server";
import type { XmpEvent } from "@/lib/xmp/event-types";
import {
  xmpCorrelationSchema,
  xmpEventSchema,
} from "@/lib/xmp/event-validation";

export const dynamic = "force-dynamic";

const noStoreHeaders = {
  "Cache-Control": "no-store, max-age=0",
  "X-Content-Type-Options": "nosniff",
  "X-XMP-Privacy": "event-metadata-only",
};

async function verifiedSession(
  request: NextRequest,
): Promise<XmpVerifiedSession | null> {
  const token = request.cookies.get("X-FC-Auth-Token")?.value;
  if (!token) return null;
  const session = await decryptSession(token);
  if (
    !session ||
    typeof session.role !== "string" ||
    !["ADMIN", "TEACHER", "ACADEMIC"].includes(session.role)
  )
    return null;
  return {
    role: session.role,
    campusId: typeof session.campusId === "string" ? session.campusId : "",
  };
}

export async function GET(request: NextRequest) {
  const status = getXmpEventStatus(await verifiedSession(request));
  const correlationId = request.nextUrl.searchParams.get("correlationId");

  if (!status.writable || !correlationId) {
    return NextResponse.json(
      { ...status, events: [] },
      { headers: noStoreHeaders },
    );
  }

  const parsedCorrelation = xmpCorrelationSchema.safeParse(correlationId);
  if (!parsedCorrelation.success) {
    return NextResponse.json(
      { error: { code: "INVALID_CORRELATION_ID", message: "关联 ID 不合法" } },
      { status: 400, headers: noStoreHeaders },
    );
  }

  try {
    const events = await listXmpEvents(parsedCorrelation.data);
    return NextResponse.json(
      { ...status, events },
      { headers: noStoreHeaders },
    );
  } catch {
    return NextResponse.json(
      {
        error: { code: "EVENT_READ_UNAVAILABLE", message: "事件服务暂不可用" },
      },
      { status: 503, headers: noStoreHeaders },
    );
  }
}

export async function POST(request: NextRequest) {
  const status = getXmpEventStatus(await verifiedSession(request));
  if (status.mode === "local-only" || !status.configured) {
    return NextResponse.json(
      { error: { code: "LOCAL_ONLY", message: "服务端事件同步未启用" } },
      { status: 503, headers: noStoreHeaders },
    );
  }
  if (!status.authenticated) {
    return NextResponse.json(
      { error: { code: "AUTH_REQUIRED", message: "需要有效园所会话" } },
      { status: 401, headers: noStoreHeaders },
    );
  }
  if (!status.writable) {
    return NextResponse.json(
      { error: { code: "TENANT_MISMATCH", message: "园所租户不匹配" } },
      { status: 403, headers: noStoreHeaders },
    );
  }

  const contentLength = Number(request.headers.get("content-length") ?? 0);
  if (contentLength > 16_384) {
    return NextResponse.json(
      { error: { code: "PAYLOAD_TOO_LARGE", message: "事件载荷过大" } },
      { status: 413, headers: noStoreHeaders },
    );
  }

  let body: unknown;
  try {
    const rawBody = await request.text();
    if (new TextEncoder().encode(rawBody).byteLength > 16_384) {
      return NextResponse.json(
        { error: { code: "PAYLOAD_TOO_LARGE", message: "事件载荷过大" } },
        { status: 413, headers: noStoreHeaders },
      );
    }
    body = JSON.parse(rawBody);
  } catch {
    return NextResponse.json(
      { error: { code: "INVALID_JSON", message: "JSON 格式无效" } },
      { status: 400, headers: noStoreHeaders },
    );
  }

  const parsed = xmpEventSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      {
        error: {
          code: "INVALID_EVENT",
          message: parsed.error.issues[0]?.message ?? "事件格式无效",
        },
      },
      { status: 400, headers: noStoreHeaders },
    );
  }

  try {
    const event = await appendXmpEvent(parsed.data as XmpEvent);
    return NextResponse.json(
      { ok: true, event },
      { status: 201, headers: noStoreHeaders },
    );
  } catch {
    return NextResponse.json(
      { error: { code: "EVENT_WRITE_UNAVAILABLE", message: "事件暂存失败" } },
      { status: 503, headers: noStoreHeaders },
    );
  }
}
