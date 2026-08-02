import "server-only";

import { getSupabaseAdmin } from "@/lib/supabase/singleton";
import {
  restoreClassroomOrchestration,
  type XmpClassroomOrchestration,
} from "@/lib/xmp/classroom-orchestration";
import type { XmpVerifiedSession } from "@/lib/xmp/event-server";

const MODE = process.env.XMP_ORCHESTRATION_MODE ?? process.env.XMP_EVENT_MODE;
const TENANT_ID = process.env.XMP_TENANT_ID?.trim();
const configured = Boolean(
  process.env.NEXT_PUBLIC_SUPABASE_URL &&
  process.env.SUPABASE_SERVICE_ROLE_KEY &&
  TENANT_ID,
);

export type XmpOrchestrationTransportStatus = {
  mode: "local-only" | "supabase";
  configured: boolean;
  authenticated: boolean;
  writable: boolean;
  reason:
    | "local-mode"
    | "missing-server-config"
    | "sign-in-required"
    | "tenant-mismatch"
    | "ready";
};

export function getOrchestrationStatus(
  session: XmpVerifiedSession | null,
): XmpOrchestrationTransportStatus {
  if (MODE !== "supabase" && MODE !== "futureclass-server")
    return {
      mode: "local-only",
      configured: false,
      authenticated: false,
      writable: false,
      reason: "local-mode",
    };
  if (!configured)
    return {
      mode: "supabase",
      configured: false,
      authenticated: false,
      writable: false,
      reason: "missing-server-config",
    };
  if (!session)
    return {
      mode: "supabase",
      configured: true,
      authenticated: false,
      writable: false,
      reason: "sign-in-required",
    };
  if (session.role !== "ADMIN" && session.campusId !== TENANT_ID)
    return {
      mode: "supabase",
      configured: true,
      authenticated: true,
      writable: false,
      reason: "tenant-mismatch",
    };
  return {
    mode: "supabase",
    configured: true,
    authenticated: true,
    writable: true,
    reason: "ready",
  };
}

type StateRow = {
  state: unknown;
  revision: number;
  updated_at: string;
};

export async function readOrchestrationState(sessionId: string) {
  const { data, error } = await getSupabaseAdmin()
    .from("xmp_classroom_orchestration_states")
    .select("state,revision,updated_at")
    .eq("tenant_id", TENANT_ID!)
    .eq("session_id", sessionId)
    .maybeSingle();
  if (error) throw new Error(`XMP_ORCHESTRATION_READ_FAILED:${error.code}`);
  if (!data) return null;
  const row = data as StateRow;
  const state = restoreClassroomOrchestration(row.state);
  if (!state) throw new Error("XMP_ORCHESTRATION_STATE_INVALID");
  return { state, revision: row.revision, updatedAt: row.updated_at };
}

export async function saveOrchestrationState(
  state: XmpClassroomOrchestration,
  expectedRevision: number | null,
  actorId: string,
) {
  const { data, error } = await getSupabaseAdmin().rpc(
    "xmp_save_orchestration_state",
    {
      p_tenant_id: TENANT_ID!,
      p_session_id: state.sessionId,
      p_expected_revision: expectedRevision,
      p_next_revision: state.revision,
      p_state: state,
      p_actor_id: actorId,
    },
  );
  if (error) {
    if (error.message.includes("XMP_REVISION_CONFLICT"))
      return { conflict: true as const };
    throw new Error(`XMP_ORCHESTRATION_WRITE_FAILED:${error.code}`);
  }
  const row = (Array.isArray(data) ? data[0] : data) as
    | { revision: number; updated_at: string }
    | undefined;
  return {
    conflict: false as const,
    revision: row?.revision ?? state.revision,
    updatedAt: row?.updated_at ?? new Date().toISOString(),
  };
}
