export type XmpEventDomain =
  | "classroom"
  | "scheduling"
  | "teaching"
  | "insights"
  | "growth"
  | "family"
  | "fleet"
  | "access";

export type XmpEventKind =
  | "classroom.started"
  | "classroom.paused"
  | "classroom.adjusted"
  | "schedule.adjusted"
  | "schedule.validated"
  | "schedule.published"
  | "schedule.rolled_back"
  | "teaching.prepared"
  | "teaching.started"
  | "teaching.cue_decided"
  | "teaching.evidence_confirmed"
  | "teaching.reflection_signed"
  | "insight.generated"
  | "insight.reviewed"
  | "insight.applied"
  | "evidence.candidate"
  | "evidence.approved"
  | "evidence.rejected"
  | "family.dispatched"
  | "family.feedback_candidate"
  | "family.feedback_rejected"
  | "device.degraded"
  | "device.diagnostic_completed"
  | "device.recovered"
  | "access.requested"
  | "access.approved"
  | "access.granted"
  | "access.revoked"
  | "access.session_revoked";

export type XmpEventSyncState =
  | "local-only"
  | "pending"
  | "syncing"
  | "synced"
  | "failed";

export type XmpEventSync = {
  state: XmpEventSyncState;
  attempts: number;
  lastError?: string;
};

export type XmpEvent = {
  id: string;
  correlationId: string;
  kind: XmpEventKind;
  domain: XmpEventDomain;
  title: string;
  detail: string;
  actor: string;
  entity: string;
  occurredAt: string;
  privacy: "anonymous" | "aggregate" | "teacher-reviewed";
  source: "demo-seed" | "local-interaction" | "server-sync";
  sync?: XmpEventSync;
};

export type XmpEventInput = Omit<
  XmpEvent,
  "id" | "occurredAt" | "source" | "sync"
> & { occurredAt?: string };

export type XmpEventTransportStatus = {
  mode: "local-only" | "futureclass-server";
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
