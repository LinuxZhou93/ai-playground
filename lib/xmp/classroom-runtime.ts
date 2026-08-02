export const XMP_CLASSROOM_RUNTIME_VERSION = 1;
export const XMP_CLASSROOM_SESSION_ID = "XMP-CLS-A301-20260728";

export type XmpClassroomLifecycle = "preflight" | "live" | "paused" | "ended";
export type XmpClassroomHealth = "healthy" | "degraded" | "offline";
export type XmpClassroomSafetyMode = "normal" | "quiet" | "teacher-control";
export type XmpDeviceConnection = "online" | "stale" | "offline";
export type XmpDeviceTrust = "demo-verified" | "unverified" | "quarantined";

export type XmpRuntimeActor = {
  id: string;
  kind: "teacher" | "operator" | "device" | "system";
  role: "teacher" | "operator" | "device" | "runtime";
  trust: XmpDeviceTrust;
  displayName: string;
};

export type XmpRuntimeDevice = {
  id: string;
  name: string;
  kind: "teacher-console" | "display" | "edge-hub" | "companion-group";
  critical: boolean;
  trust: XmpDeviceTrust;
  connection: XmpDeviceConnection;
  lastHeartbeatAt: string;
  heartbeatSequence: number;
  latencyMs: number | null;
  capabilities: string[];
};

export type XmpRuntimeCommandKind =
  | "session.start"
  | "session.pause"
  | "session.resume"
  | "session.end"
  | "step.select"
  | "step.next"
  | "step.previous"
  | "safety.quiet.enable"
  | "safety.quiet.disable"
  | "safety.takeover"
  | "safety.release"
  | "device.heartbeat"
  | "device.disconnect"
  | "device.recover";

export type XmpRuntimeCommand = {
  id: string;
  kind: XmpRuntimeCommandKind;
  issuedAt: string;
  actor: XmpRuntimeActor;
  payload?: {
    step?: number;
    maxStep?: number;
    deviceId?: string;
    latencyMs?: number;
  };
};

export type XmpRuntimeCommandRecord = {
  id: string;
  kind: XmpRuntimeCommandKind;
  issuedAt: string;
  actorLabel: string;
  outcome: "accepted" | "rejected" | "duplicate";
  reason?: string;
};

export type XmpClassroomRuntime = {
  version: typeof XMP_CLASSROOM_RUNTIME_VERSION;
  sessionId: string;
  correlationId: string;
  revision: number;
  lifecycle: XmpClassroomLifecycle;
  health: XmpClassroomHealth;
  safetyMode: XmpClassroomSafetyMode;
  aiEnabled: boolean;
  activeStep: number;
  elapsedSeconds: number;
  startedAt: string | null;
  endedAt: string | null;
  teacher: XmpRuntimeActor & {
    sessionFingerprint: string;
    verifiedAt: string;
  };
  devices: XmpRuntimeDevice[];
  commandLog: XmpRuntimeCommandRecord[];
  processedCommandIds: string[];
  lastTransitionAt: string;
};

export type XmpRuntimeTransition = {
  runtime: XmpClassroomRuntime;
  record: XmpRuntimeCommandRecord;
};

export const XMP_DEMO_TEACHER: XmpClassroomRuntime["teacher"] = {
  id: "teacher-wen-demo",
  kind: "teacher",
  role: "teacher",
  trust: "demo-verified",
  displayName: "文老师",
  sessionFingerprint: "LOCAL·7F3A",
  verifiedAt: "2026-07-28T09:15:00+08:00",
};

export const XMP_DEMO_OPERATOR: XmpRuntimeActor = {
  id: "operator-campus-demo",
  kind: "operator",
  role: "operator",
  trust: "demo-verified",
  displayName: "园所运维",
};

function seedDevices(now: string): XmpRuntimeDevice[] {
  return [
    {
      id: "T-01",
      name: "教师控制端 T-01",
      kind: "teacher-console",
      critical: true,
      trust: "demo-verified",
      connection: "online",
      lastHeartbeatAt: now,
      heartbeatSequence: 1842,
      latencyMs: 12,
      capabilities: ["课堂控制", "物理接管", "审核证据"],
    },
    {
      id: "D-01",
      name: "教室大屏 D-01",
      kind: "display",
      critical: false,
      trust: "demo-verified",
      connection: "online",
      lastHeartbeatAt: now,
      heartbeatSequence: 992,
      latencyMs: 18,
      capabilities: ["课件投放", "离线缓存"],
    },
    {
      id: "E-01",
      name: "园所边缘中枢 E-01",
      kind: "edge-hub",
      critical: true,
      trust: "demo-verified",
      connection: "online",
      lastHeartbeatAt: now,
      heartbeatSequence: 4218,
      latencyMs: 7,
      capabilities: ["本地编排", "设备路由", "断网降级"],
    },
    {
      id: "CP-A301",
      name: "奇妙宠设备组 × 6",
      kind: "companion-group",
      critical: false,
      trust: "demo-verified",
      connection: "online",
      lastHeartbeatAt: now,
      heartbeatSequence: 735,
      latencyMs: 26,
      capabilities: ["短句互动", "物理静音", "安全应答"],
    },
  ];
}

export function createInitialClassroomRuntime(
  now = new Date().toISOString(),
): XmpClassroomRuntime {
  return {
    version: XMP_CLASSROOM_RUNTIME_VERSION,
    sessionId: XMP_CLASSROOM_SESSION_ID,
    correlationId: "CLS-A301-20260728-SEED",
    revision: 1,
    lifecycle: "preflight",
    health: "healthy",
    safetyMode: "normal",
    aiEnabled: false,
    activeStep: 0,
    elapsedSeconds: 0,
    startedAt: null,
    endedAt: null,
    teacher: XMP_DEMO_TEACHER,
    devices: seedDevices(now),
    commandLog: [],
    processedCommandIds: [],
    lastTransitionAt: now,
  };
}

function commandRecord(
  command: XmpRuntimeCommand,
  outcome: XmpRuntimeCommandRecord["outcome"],
  reason?: string,
): XmpRuntimeCommandRecord {
  return {
    id: command.id,
    kind: command.kind,
    issuedAt: command.issuedAt,
    actorLabel: command.actor.displayName,
    outcome,
    reason,
  };
}

function appendRecord(
  runtime: XmpClassroomRuntime,
  record: XmpRuntimeCommandRecord,
  processed = true,
) {
  return {
    ...runtime,
    commandLog: [record, ...runtime.commandLog].slice(0, 40),
    processedCommandIds: processed
      ? [record.id, ...runtime.processedCommandIds].slice(0, 120)
      : runtime.processedCommandIds,
  };
}

function reject(
  runtime: XmpClassroomRuntime,
  command: XmpRuntimeCommand,
  reason: string,
): XmpRuntimeTransition {
  const record = commandRecord(command, "rejected", reason);
  return { runtime: appendRecord(runtime, record), record };
}

function isTrustedTeacher(
  runtime: XmpClassroomRuntime,
  actor: XmpRuntimeActor,
) {
  return (
    actor.kind === "teacher" &&
    actor.id === runtime.teacher.id &&
    actor.trust === "demo-verified"
  );
}

function isTrustedOperator(actor: XmpRuntimeActor) {
  return (
    actor.kind === "operator" &&
    actor.id === XMP_DEMO_OPERATOR.id &&
    actor.trust === "demo-verified"
  );
}

function deriveHealth(devices: XmpRuntimeDevice[]): XmpClassroomHealth {
  const criticalOffline = devices.some(
    (device) => device.critical && device.connection === "offline",
  );
  if (criticalOffline) return "offline";
  const impaired = devices.some(
    (device) =>
      device.connection !== "online" || device.trust !== "demo-verified",
  );
  return impaired ? "degraded" : "healthy";
}

function reconcileDeviceSafety(runtime: XmpClassroomRuntime) {
  const health = deriveHealth(runtime.devices);
  const criticalImpaired = runtime.devices.some(
    (device) => device.critical && device.connection !== "online",
  );
  if (!criticalImpaired) return { ...runtime, health };
  return {
    ...runtime,
    health,
    lifecycle:
      runtime.lifecycle === "live" ? ("paused" as const) : runtime.lifecycle,
    safetyMode:
      runtime.safetyMode === "teacher-control"
        ? runtime.safetyMode
        : ("quiet" as const),
    aiEnabled: false,
  };
}

export function applyClassroomCommand(
  current: XmpClassroomRuntime,
  command: XmpRuntimeCommand,
): XmpRuntimeTransition {
  if (current.processedCommandIds.includes(command.id)) {
    return {
      runtime: current,
      record: commandRecord(command, "duplicate", "命令已处理"),
    };
  }

  const deviceCommand = command.kind.startsWith("device.");
  if (!deviceCommand && !isTrustedTeacher(current, command.actor)) {
    return reject(current, command, "需要当前课堂的可信教师会话");
  }

  let next = { ...current };
  const payload = command.payload ?? {};

  switch (command.kind) {
    case "session.start": {
      if (current.lifecycle !== "preflight")
        return reject(current, command, "课堂不在课前检查状态");
      if (current.health === "offline")
        return reject(current, command, "关键设备离线，不能开始课堂");
      next = {
        ...next,
        lifecycle: "live",
        aiEnabled: current.safetyMode === "normal",
        startedAt: command.issuedAt,
      };
      break;
    }
    case "session.pause":
      if (current.lifecycle !== "live")
        return reject(current, command, "只有进行中的课堂可以暂停");
      next = { ...next, lifecycle: "paused", aiEnabled: false };
      break;
    case "session.resume":
      if (current.lifecycle !== "paused")
        return reject(current, command, "课堂不在暂停状态");
      if (current.safetyMode === "teacher-control")
        return reject(current, command, "人工接管尚未释放");
      if (current.health === "offline")
        return reject(current, command, "关键设备仍然离线");
      next = {
        ...next,
        lifecycle: "live",
        aiEnabled: current.safetyMode === "normal",
      };
      break;
    case "session.end":
      if (current.lifecycle === "ended")
        return reject(current, command, "课堂已经结束");
      next = {
        ...next,
        lifecycle: "ended",
        aiEnabled: false,
        endedAt: command.issuedAt,
      };
      break;
    case "step.select":
      if (current.lifecycle === "ended")
        return reject(current, command, "已结束课堂不能切换节拍");
      if (!Number.isInteger(payload.step) || payload.step! < 0)
        return reject(current, command, "课堂节拍无效");
      next = { ...next, activeStep: payload.step! };
      break;
    case "step.next": {
      if (current.lifecycle === "ended")
        return reject(current, command, "课堂已经结束");
      const maxStep = payload.maxStep ?? current.activeStep;
      next = {
        ...next,
        activeStep: Math.min(current.activeStep + 1, maxStep),
      };
      break;
    }
    case "step.previous":
      if (current.lifecycle === "ended")
        return reject(current, command, "课堂已经结束");
      next = { ...next, activeStep: Math.max(0, current.activeStep - 1) };
      break;
    case "safety.quiet.enable":
      if (current.lifecycle === "ended")
        return reject(current, command, "课堂已经结束");
      next = { ...next, safetyMode: "quiet", aiEnabled: false };
      break;
    case "safety.quiet.disable":
      if (current.safetyMode === "teacher-control")
        return reject(current, command, "请先释放人工接管");
      next = {
        ...next,
        safetyMode: "normal",
        aiEnabled: current.lifecycle === "live" && current.health !== "offline",
      };
      break;
    case "safety.takeover":
      if (current.lifecycle === "ended")
        return reject(current, command, "课堂已经结束");
      next = {
        ...next,
        lifecycle: current.lifecycle === "preflight" ? "preflight" : "paused",
        safetyMode: "teacher-control",
        aiEnabled: false,
      };
      break;
    case "safety.release":
      if (current.safetyMode !== "teacher-control")
        return reject(current, command, "当前没有人工接管");
      next = { ...next, safetyMode: "quiet", aiEnabled: false };
      break;
    case "device.heartbeat": {
      const deviceId = payload.deviceId;
      const device = current.devices.find((item) => item.id === deviceId);
      if (
        !device ||
        command.actor.kind !== "device" ||
        command.actor.id !== deviceId ||
        command.actor.trust !== "demo-verified"
      )
        return reject(current, command, "设备身份与心跳声明不匹配");
      next = {
        ...next,
        devices: current.devices.map((item) =>
          item.id === deviceId
            ? {
                ...item,
                connection: "online",
                lastHeartbeatAt: command.issuedAt,
                heartbeatSequence: item.heartbeatSequence + 1,
                latencyMs: payload.latencyMs ?? item.latencyMs,
              }
            : item,
        ),
      };
      next = reconcileDeviceSafety(next);
      break;
    }
    case "device.disconnect":
    case "device.recover": {
      if (
        !isTrustedTeacher(current, command.actor) &&
        !isTrustedOperator(command.actor)
      )
        return reject(current, command, "设备操作需要可信教师或园所运维会话");
      const deviceId = payload.deviceId;
      if (!current.devices.some((item) => item.id === deviceId))
        return reject(current, command, "设备不存在");
      next = {
        ...next,
        devices: current.devices.map((item) =>
          item.id === deviceId
            ? {
                ...item,
                connection:
                  command.kind === "device.disconnect" ? "offline" : "online",
                lastHeartbeatAt: command.issuedAt,
                heartbeatSequence:
                  command.kind === "device.recover"
                    ? item.heartbeatSequence + 1
                    : item.heartbeatSequence,
                latencyMs:
                  command.kind === "device.disconnect"
                    ? null
                    : (payload.latencyMs ?? item.latencyMs ?? 9),
              }
            : item,
        ),
      };
      next = reconcileDeviceSafety(next);
      break;
    }
  }

  const record = commandRecord(command, "accepted");
  next = appendRecord(
    {
      ...next,
      revision: current.revision + 1,
      lastTransitionAt: command.issuedAt,
    },
    record,
  );
  return { runtime: next, record };
}

export function tickClassroomRuntime(
  runtime: XmpClassroomRuntime,
  seconds = 1,
) {
  if (runtime.lifecycle !== "live") return runtime;
  return {
    ...runtime,
    elapsedSeconds: runtime.elapsedSeconds + Math.max(0, seconds),
  };
}

export function restoreClassroomRuntime(value: unknown) {
  if (!value || typeof value !== "object") return null;
  const candidate = value as Partial<XmpClassroomRuntime>;
  if (
    candidate.version !== XMP_CLASSROOM_RUNTIME_VERSION ||
    candidate.sessionId !== XMP_CLASSROOM_SESSION_ID ||
    !["preflight", "live", "paused", "ended"].includes(
      candidate.lifecycle ?? "",
    ) ||
    !["healthy", "degraded", "offline"].includes(candidate.health ?? "") ||
    !["normal", "quiet", "teacher-control"].includes(
      candidate.safetyMode ?? "",
    ) ||
    typeof candidate.revision !== "number" ||
    typeof candidate.activeStep !== "number" ||
    typeof candidate.elapsedSeconds !== "number" ||
    !candidate.teacher ||
    candidate.teacher.id !== XMP_DEMO_TEACHER.id ||
    !Array.isArray(candidate.devices) ||
    candidate.devices.some(
      (device) =>
        !device ||
        typeof device.id !== "string" ||
        !["online", "stale", "offline"].includes(device.connection),
    ) ||
    !Array.isArray(candidate.commandLog) ||
    !Array.isArray(candidate.processedCommandIds)
  )
    return null;
  return candidate as XmpClassroomRuntime;
}
