export type XmpDataMode = "demo" | "futureclass-readonly";
export type XmpSourceState = "demo" | "connected" | "degraded";

export type XmpCapabilityProbe = {
  id: "erp" | "curriculum" | "growth" | "classroom" | "fleet";
  label: string;
  state: "ready" | "unavailable" | "planned";
  detail: string;
};

export type XmpSnapshot = {
  schemaVersion: 1;
  mode: XmpDataMode;
  sourceState: XmpSourceState;
  sourceLabel: string;
  generatedAt: string;
  freshnessLabel: string;
  fallbackReason?: string;
  privacy: {
    aggregateOnly: true;
    writesAllowed: false;
    containsChildIdentity: false;
  };
  tenant: {
    id: string;
    name: string;
    campus: string;
  };
  metrics: {
    children: number;
    classes: number;
    teachers: number;
    courses: number;
    todaySessions: number;
    completedSessions: number;
    pendingEvidence: number;
    onlineDevices: number;
    totalDevices: number;
    curriculumReadiness: number;
  };
  capabilities: XmpCapabilityProbe[];
};
