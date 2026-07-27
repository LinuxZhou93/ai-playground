export type XmpEventDomain = "classroom" | "growth" | "family" | "fleet";

export type XmpEventKind =
  | "classroom.started"
  | "classroom.paused"
  | "classroom.adjusted"
  | "evidence.candidate"
  | "evidence.approved"
  | "evidence.rejected"
  | "family.dispatched"
  | "family.feedback_candidate"
  | "family.feedback_rejected"
  | "device.degraded"
  | "device.diagnostic_completed"
  | "device.recovered";

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
  source: "demo-seed" | "local-interaction";
};

export type XmpEventInput = Omit<XmpEvent, "id" | "occurredAt" | "source"> & {
  occurredAt?: string;
};
