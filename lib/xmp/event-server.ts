import "server-only";

import { getSupabaseAdmin } from "@/lib/supabase/singleton";
import type { XmpEvent, XmpEventTransportStatus } from "@/lib/xmp/event-types";

const EVENT_MODE = process.env.XMP_EVENT_MODE;
const TENANT_ID = process.env.XMP_TENANT_ID?.trim();
const hasServerCredentials = Boolean(
  process.env.NEXT_PUBLIC_SUPABASE_URL &&
  process.env.SUPABASE_SERVICE_ROLE_KEY &&
  TENANT_ID,
);

export type XmpVerifiedSession = {
  role: string;
  campusId: string;
};

export function getXmpEventStatus(
  session: XmpVerifiedSession | null,
): XmpEventTransportStatus {
  if (EVENT_MODE !== "futureclass-server") {
    return {
      mode: "local-only",
      configured: false,
      authenticated: false,
      writable: false,
      reason: "local-mode",
    };
  }

  if (!hasServerCredentials) {
    return {
      mode: "futureclass-server",
      configured: false,
      authenticated: false,
      writable: false,
      reason: "missing-server-config",
    };
  }

  if (!session) {
    return {
      mode: "futureclass-server",
      configured: true,
      authenticated: false,
      writable: false,
      reason: "sign-in-required",
    };
  }

  const tenantMatches =
    session.role === "ADMIN" || session.campusId === TENANT_ID;
  if (!tenantMatches) {
    return {
      mode: "futureclass-server",
      configured: true,
      authenticated: true,
      writable: false,
      reason: "tenant-mismatch",
    };
  }

  return {
    mode: "futureclass-server",
    configured: true,
    authenticated: true,
    writable: true,
    reason: "ready",
  };
}

type EventRow = {
  id: string;
  correlation_id: string;
  kind: XmpEvent["kind"];
  domain: XmpEvent["domain"];
  title: string;
  detail: string;
  actor_label: string;
  entity_ref: string;
  occurred_at: string;
  privacy_level: XmpEvent["privacy"];
};

function mapEventRow(row: EventRow): XmpEvent {
  return {
    id: row.id,
    correlationId: row.correlation_id,
    kind: row.kind,
    domain: row.domain,
    title: row.title,
    detail: row.detail,
    actor: row.actor_label,
    entity: row.entity_ref,
    occurredAt: row.occurred_at,
    privacy: row.privacy_level,
    source: "server-sync",
    sync: { state: "synced", attempts: 0 },
  };
}

export async function listXmpEvents(correlationId: string) {
  const { data, error } = await getSupabaseAdmin()
    .from("xmp_events")
    .select(
      "id,correlation_id,kind,domain,title,detail,actor_label,entity_ref,occurred_at,privacy_level",
    )
    .eq("tenant_id", TENANT_ID!)
    .eq("correlation_id", correlationId)
    .order("occurred_at", { ascending: false })
    .limit(80);

  if (error) throw new Error(`XMP_EVENT_READ_FAILED:${error.code}`);
  return (data as EventRow[]).map(mapEventRow);
}

export async function appendXmpEvent(event: XmpEvent) {
  const row = {
    id: event.id,
    tenant_id: TENANT_ID!,
    correlation_id: event.correlationId,
    idempotency_key: event.id,
    kind: event.kind,
    domain: event.domain,
    title: event.title,
    detail: event.detail,
    actor_label: event.actor,
    entity_ref: event.entity,
    occurred_at: event.occurredAt,
    privacy_level: event.privacy,
    source: "local-interaction",
    payload_version: 1,
  };

  const { data, error } = await getSupabaseAdmin()
    .from("xmp_events")
    .upsert(row, {
      onConflict: "tenant_id,idempotency_key",
      ignoreDuplicates: true,
    })
    .select(
      "id,correlation_id,kind,domain,title,detail,actor_label,entity_ref,occurred_at,privacy_level",
    )
    .maybeSingle();

  if (error) throw new Error(`XMP_EVENT_WRITE_FAILED:${error.code}`);
  if (data) return mapEventRow(data as EventRow);

  const { data: existing, error: readError } = await getSupabaseAdmin()
    .from("xmp_events")
    .select(
      "id,correlation_id,kind,domain,title,detail,actor_label,entity_ref,occurred_at,privacy_level",
    )
    .eq("tenant_id", TENANT_ID!)
    .eq("idempotency_key", event.id)
    .single();

  if (readError || !existing)
    throw new Error(`XMP_EVENT_IDEMPOTENCY_READ_FAILED:${readError?.code}`);
  return mapEventRow(existing as EventRow);
}
