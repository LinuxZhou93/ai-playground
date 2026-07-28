export const XMP_ACCESS_CATALOG_VERSION = 1;

export type XmpAccessModule =
  | "overview"
  | "curriculum"
  | "scheduling"
  | "teaching"
  | "insights"
  | "strategies"
  | "classroom"
  | "companion"
  | "growth"
  | "family"
  | "fleet"
  | "operations"
  | "governance"
  | "access";

export type XmpAccessAction =
  | "view"
  | "operate"
  | "approve"
  | "publish"
  | "export"
  | "manage";

export type XmpAccessRole =
  | "tenant-admin"
  | "research-lead"
  | "teacher"
  | "family"
  | "support"
  | "security-officer";

export type XmpAssuranceLevel = "password" | "mfa" | "device-bound";

export type XmpAccessScope = {
  tenantId: string;
  campusId: string;
  classIds: string[];
};

export type XmpAccessPrincipal = {
  id: string;
  displayName: string;
  title: string;
  role: XmpAccessRole;
  status: "active" | "suspended";
  scope: XmpAccessScope;
};

export type XmpAccessSession = {
  id: string;
  principalId: string;
  tenantId: string;
  campusId: string;
  assurance: XmpAssuranceLevel;
  deviceTrusted: boolean;
  issuedAt: string;
  expiresAt: string;
  revokedAt: string | null;
  fingerprint: string;
};

export type XmpAccessApproval = {
  principalId: string;
  role: "tenant-admin" | "security-officer";
  approvedAt: string;
};

export type XmpAccessRequest = {
  id: string;
  requesterId: string;
  module: XmpAccessModule;
  actions: XmpAccessAction[];
  tenantId: string;
  campusId: string;
  reason: string;
  risk: "standard" | "high";
  status:
    | "pending"
    | "first-approved"
    | "active"
    | "denied"
    | "revoked"
    | "expired";
  requestedAt: string;
  validFrom: string;
  validUntil: string;
  approvals: XmpAccessApproval[];
  revokedAt: string | null;
};

export type XmpAccessAuditRecord = {
  id: string;
  kind: XmpAccessCommandKind | "decision.evaluated";
  actorLabel: string;
  targetLabel: string;
  occurredAt: string;
  outcome: "accepted" | "rejected" | "duplicate";
  reason: string;
};

export type XmpAccessCatalog = {
  version: typeof XMP_ACCESS_CATALOG_VERSION;
  revision: number;
  policyVersion: string;
  tenant: {
    id: string;
    name: string;
    campuses: { id: string; name: string }[];
  };
  activePrincipalId: string;
  activeSessionId: string;
  principals: XmpAccessPrincipal[];
  sessions: XmpAccessSession[];
  requests: XmpAccessRequest[];
  auditLog: XmpAccessAuditRecord[];
  processedCommandIds: string[];
};

export type XmpAccessCommandKind =
  | "request.submit"
  | "request.approve"
  | "request.deny"
  | "grant.revoke"
  | "principal.suspend"
  | "principal.restore"
  | "session.revoke"
  | "session.rotate"
  | "session.switch";

export type XmpAccessCommand = {
  id: string;
  kind: XmpAccessCommandKind;
  actorId: string;
  issuedAt: string;
  requestId?: string;
  principalId?: string;
  sessionId?: string;
  payload?: {
    module?: XmpAccessModule;
    actions?: XmpAccessAction[];
    tenantId?: string;
    campusId?: string;
    reason?: string;
    validUntil?: string;
  };
};

export type XmpAccessDecision = {
  allowed: boolean;
  source: "base-role" | "temporary-grant" | "denied";
  reason: string;
  policyVersion: string;
  requestId: string | null;
};

const assuranceRank: Record<XmpAssuranceLevel, number> = {
  password: 1,
  mfa: 2,
  "device-bound": 3,
};

const privilegedActions = new Set<XmpAccessAction>([
  "approve",
  "publish",
  "export",
  "manage",
]);

const rolePermissions: Record<
  XmpAccessRole,
  Partial<Record<XmpAccessModule, XmpAccessAction[]>>
> = {
  "tenant-admin": {
    overview: ["view", "operate"],
    curriculum: ["view", "operate", "approve", "publish"],
    scheduling: ["view", "operate", "approve", "publish"],
    teaching: ["view", "operate"],
    insights: ["view", "operate", "approve"],
    strategies: ["view", "operate", "approve", "publish"],
    classroom: ["view", "operate"],
    companion: ["view", "operate"],
    growth: ["view", "operate", "approve", "export"],
    family: ["view", "operate", "approve"],
    fleet: ["view", "operate", "approve"],
    operations: ["view", "operate", "approve", "export"],
    governance: ["view", "operate", "approve", "export"],
    access: ["view", "operate", "approve", "manage"],
  },
  "research-lead": {
    overview: ["view"],
    curriculum: ["view", "operate", "approve", "publish"],
    scheduling: ["view", "operate", "approve"],
    teaching: ["view"],
    insights: ["view", "operate", "approve"],
    strategies: ["view", "operate", "approve", "publish"],
    classroom: ["view"],
    companion: ["view"],
    growth: ["view", "operate", "approve", "export"],
    family: ["view"],
    governance: ["view"],
    access: ["view"],
  },
  teacher: {
    overview: ["view"],
    curriculum: ["view"],
    scheduling: ["view"],
    teaching: ["view", "operate"],
    insights: ["view", "operate"],
    strategies: ["view", "operate"],
    classroom: ["view", "operate"],
    companion: ["view", "operate"],
    growth: ["view", "operate", "approve"],
    family: ["view", "operate"],
  },
  family: {
    companion: ["view"],
    growth: ["view"],
    family: ["view", "operate"],
  },
  support: {
    overview: ["view"],
    classroom: ["view"],
    fleet: ["view", "operate"],
    access: ["view"],
  },
  "security-officer": {
    overview: ["view"],
    fleet: ["view"],
    operations: ["view"],
    governance: ["view", "operate", "approve", "export"],
    access: ["view", "approve", "manage"],
  },
};

export const XMP_ACCESS_ROLE_LABELS: Record<XmpAccessRole, string> = {
  "tenant-admin": "园所管理员",
  "research-lead": "教研负责人",
  teacher: "主班教师",
  family: "监护人",
  support: "设备服务",
  "security-officer": "安全官",
};

export const XMP_ACCESS_MODULE_LABELS: Record<XmpAccessModule, string> = {
  overview: "系统总控",
  curriculum: "课程工厂",
  scheduling: "教学调度",
  teaching: "AI 教学",
  insights: "智慧学情",
  strategies: "教学策略库",
  classroom: "实时课堂",
  companion: "奇妙宠",
  growth: "成长智能",
  family: "家园共育",
  fleet: "设备舰队",
  operations: "园所运营",
  governance: "数据治理",
  access: "身份权限",
};

export const XMP_ACCESS_ACTION_LABELS: Record<XmpAccessAction, string> = {
  view: "查看",
  operate: "操作",
  approve: "审批",
  publish: "发布",
  export: "导出",
  manage: "管理",
};

export function getRoleActions(role: XmpAccessRole, module: XmpAccessModule) {
  return rolePermissions[role][module] ?? [];
}

export function canXmpRoleViewModule(
  role: "operator" | "research" | "teacher" | "family",
  module: XmpAccessModule,
) {
  const mappedRole: XmpAccessRole =
    role === "operator"
      ? "tenant-admin"
      : role === "research"
        ? "research-lead"
        : role;
  return getRoleActions(mappedRole, module).includes("view");
}

export function evaluateAccess(
  catalog: XmpAccessCatalog,
  input: {
    principalId: string;
    sessionId: string;
    module: XmpAccessModule;
    action: XmpAccessAction;
    tenantId: string;
    campusId: string;
    at: string;
  },
): XmpAccessDecision {
  const denied = (reason: string): XmpAccessDecision => ({
    allowed: false,
    source: "denied",
    reason,
    policyVersion: catalog.policyVersion,
    requestId: null,
  });
  const principal = catalog.principals.find(
    (item) => item.id === input.principalId,
  );
  if (!principal || principal.status !== "active")
    return denied("主体不存在或已停用");
  const session = catalog.sessions.find((item) => item.id === input.sessionId);
  if (!session || session.principalId !== principal.id)
    return denied("没有匹配的可信会话");
  if (session.revokedAt) return denied("会话已撤销");
  if (new Date(input.at) >= new Date(session.expiresAt))
    return denied("会话已过期");
  if (
    input.tenantId !== catalog.tenant.id ||
    input.tenantId !== principal.scope.tenantId ||
    input.tenantId !== session.tenantId
  )
    return denied("租户作用域不匹配");
  if (
    !principal.scope.campusId ||
    (principal.scope.campusId !== "*" &&
      principal.scope.campusId !== input.campusId) ||
    (session.campusId !== "*" && session.campusId !== input.campusId)
  )
    return denied("校区作用域不匹配");
  if (
    privilegedActions.has(input.action) &&
    (assuranceRank[session.assurance] < assuranceRank.mfa ||
      !session.deviceTrusted)
  )
    return denied("高权限动作需要 MFA 与可信设备");

  if (getRoleActions(principal.role, input.module).includes(input.action)) {
    return {
      allowed: true,
      source: "base-role",
      reason: `${XMP_ACCESS_ROLE_LABELS[principal.role]}基础权限`,
      policyVersion: catalog.policyVersion,
      requestId: null,
    };
  }

  const grant = catalog.requests.find(
    (request) =>
      request.status === "active" &&
      request.requesterId === principal.id &&
      request.module === input.module &&
      request.actions.includes(input.action) &&
      request.tenantId === input.tenantId &&
      request.campusId === input.campusId &&
      !request.revokedAt &&
      new Date(input.at) >= new Date(request.validFrom) &&
      new Date(input.at) < new Date(request.validUntil),
  );
  if (grant) {
    return {
      allowed: true,
      source: "temporary-grant",
      reason: `限时授权至 ${grant.validUntil}`,
      policyVersion: catalog.policyVersion,
      requestId: grant.id,
    };
  }
  return denied("默认拒绝：角色无此权限且没有有效限时授权");
}

function localSignature(input: string) {
  let hash = 2166136261;
  for (let index = 0; index < input.length; index += 1) {
    hash ^= input.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return Math.abs(hash >>> 0)
    .toString(16)
    .toUpperCase()
    .padStart(8, "0");
}

export function createInitialAccessCatalog(): XmpAccessCatalog {
  const tenantId = "demo-xmp-001";
  const campusId = "campus-xmp-west";
  return {
    version: XMP_ACCESS_CATALOG_VERSION,
    revision: 1,
    policyVersion: "POLICY-2026.07-R1",
    tenant: {
      id: tenantId,
      name: "西马棚幼儿园",
      campuses: [
        { id: campusId, name: "西园" },
        { id: "campus-xmp-east", name: "东园" },
      ],
    },
    activePrincipalId: "principal-admin",
    activeSessionId: "session-admin",
    principals: [
      {
        id: "principal-admin",
        displayName: "周园长",
        title: "园所负责人",
        role: "tenant-admin",
        status: "active",
        scope: { tenantId, campusId: "*", classIds: [] },
      },
      {
        id: "principal-research",
        displayName: "宋老师",
        title: "教研负责人",
        role: "research-lead",
        status: "active",
        scope: { tenantId, campusId, classIds: [] },
      },
      {
        id: "principal-teacher",
        displayName: "文老师",
        title: "大一班主班教师",
        role: "teacher",
        status: "active",
        scope: { tenantId, campusId, classIds: ["class-big-1"] },
      },
      {
        id: "principal-family",
        displayName: "苗苗监护人",
        title: "大一班监护人",
        role: "family",
        status: "active",
        scope: { tenantId, campusId, classIds: ["class-big-1"] },
      },
      {
        id: "principal-support",
        displayName: "设备工程师 07",
        title: "现场设备服务",
        role: "support",
        status: "active",
        scope: { tenantId, campusId, classIds: [] },
      },
      {
        id: "principal-security",
        displayName: "顾安全官",
        title: "儿童数据安全官",
        role: "security-officer",
        status: "active",
        scope: { tenantId, campusId: "*", classIds: [] },
      },
    ],
    sessions: [
      {
        id: "session-admin",
        principalId: "principal-admin",
        tenantId,
        campusId: "*",
        assurance: "device-bound",
        deviceTrusted: true,
        issuedAt: "2026-07-28T08:00:00+08:00",
        expiresAt: "2026-07-29T08:00:00+08:00",
        revokedAt: null,
        fingerprint: "LOCAL·A91F",
      },
      {
        id: "session-teacher",
        principalId: "principal-teacher",
        tenantId,
        campusId,
        assurance: "mfa",
        deviceTrusted: true,
        issuedAt: "2026-07-28T08:40:00+08:00",
        expiresAt: "2026-07-28T18:40:00+08:00",
        revokedAt: null,
        fingerprint: "LOCAL·7F3A",
      },
      {
        id: "session-security",
        principalId: "principal-security",
        tenantId,
        campusId: "*",
        assurance: "device-bound",
        deviceTrusted: true,
        issuedAt: "2026-07-28T08:10:00+08:00",
        expiresAt: "2026-07-29T08:10:00+08:00",
        revokedAt: null,
        fingerprint: "LOCAL·C284",
      },
    ],
    requests: [
      {
        id: "request-teacher-fleet",
        requesterId: "principal-teacher",
        module: "fleet",
        actions: ["operate"],
        tenantId,
        campusId,
        reason: "课堂 E-01 断线，需在现场演练中执行一次可信心跳恢复。",
        risk: "high",
        status: "pending",
        requestedAt: "2026-07-28T09:12:00+08:00",
        validFrom: "2026-07-28T09:12:00+08:00",
        validUntil: "2026-07-28T10:12:00+08:00",
        approvals: [],
        revokedAt: null,
      },
    ],
    auditLog: [
      {
        id: "audit-seed-policy",
        kind: "session.rotate",
        actorLabel: "系统策略",
        targetLabel: "园所管理员会话",
        occurredAt: "2026-07-28T08:00:00+08:00",
        outcome: "accepted",
        reason: "设备绑定会话签发；默认拒绝策略已加载。",
      },
      {
        id: "audit-seed-request",
        kind: "request.submit",
        actorLabel: "文老师",
        targetLabel: "设备舰队 · 操作",
        occurredAt: "2026-07-28T09:12:00+08:00",
        outcome: "accepted",
        reason: "限时 60 分钟；高风险动作需要双人审批。",
      },
    ],
    processedCommandIds: [],
  };
}

function appendRecord(
  catalog: XmpAccessCatalog,
  command: XmpAccessCommand,
  outcome: XmpAccessAuditRecord["outcome"],
  reason: string,
  targetLabel: string,
) {
  const actor = catalog.principals.find((item) => item.id === command.actorId);
  const record: XmpAccessAuditRecord = {
    id: `audit-${command.id}`,
    kind: command.kind,
    actorLabel: actor?.displayName ?? "未知主体",
    targetLabel,
    occurredAt: command.issuedAt,
    outcome,
    reason,
  };
  return {
    ...catalog,
    revision: catalog.revision + (outcome === "accepted" ? 1 : 0),
    auditLog: [record, ...catalog.auditLog].slice(0, 80),
    processedCommandIds: [...catalog.processedCommandIds, command.id].slice(
      -200,
    ),
  };
}

export function applyAccessCommand(
  catalog: XmpAccessCatalog,
  command: XmpAccessCommand,
): { catalog: XmpAccessCatalog; record: XmpAccessAuditRecord } {
  if (catalog.processedCommandIds.includes(command.id)) {
    const actor = catalog.principals.find(
      (item) => item.id === command.actorId,
    );
    return {
      catalog,
      record: {
        id: `audit-duplicate-${command.id}`,
        kind: command.kind,
        actorLabel: actor?.displayName ?? "未知主体",
        targetLabel: command.requestId ?? command.principalId ?? "访问控制",
        occurredAt: command.issuedAt,
        outcome: "duplicate",
        reason: "重复命令已忽略",
      },
    };
  }
  const actor = catalog.principals.find((item) => item.id === command.actorId);
  const reject = (reason: string, target = "访问控制") => {
    const next = appendRecord(catalog, command, "rejected", reason, target);
    return { catalog: next, record: next.auditLog[0] };
  };
  if (!actor || actor.status !== "active")
    return reject("操作主体无效或已停用");

  if (command.kind === "session.switch") {
    const principal = catalog.principals.find(
      (item) => item.id === command.principalId,
    );
    const session = catalog.sessions.find(
      (item) => item.principalId === principal?.id && !item.revokedAt,
    );
    if (!principal || !session) return reject("目标主体没有可用可信会话");
    const next = appendRecord(
      {
        ...catalog,
        activePrincipalId: principal.id,
        activeSessionId: session.id,
      },
      command,
      "accepted",
      "本地演示主体已切换",
      principal.displayName,
    );
    return { catalog: next, record: next.auditLog[0] };
  }

  if (command.kind === "request.submit") {
    if (!command.payload?.module || !command.payload.actions?.length)
      return reject("缺少申请模块或动作");
    const requester = catalog.principals.find(
      (item) => item.id === command.principalId,
    );
    if (!requester || requester.id !== actor.id)
      return reject("只能为当前主体提交申请");
    const request: XmpAccessRequest = {
      id: `request-${localSignature(command.id)}`,
      requesterId: requester.id,
      module: command.payload.module,
      actions: command.payload.actions,
      tenantId: command.payload.tenantId ?? requester.scope.tenantId,
      campusId: command.payload.campusId ?? requester.scope.campusId,
      reason: command.payload.reason ?? "临时业务需要",
      risk: command.payload.actions.some((item) => privilegedActions.has(item))
        ? "high"
        : "standard",
      status: "pending",
      requestedAt: command.issuedAt,
      validFrom: command.issuedAt,
      validUntil: command.payload.validUntil ?? "2026-07-28T18:00:00+08:00",
      approvals: [],
      revokedAt: null,
    };
    const next = appendRecord(
      { ...catalog, requests: [request, ...catalog.requests] },
      command,
      "accepted",
      "临时授权申请已进入审批",
      `${XMP_ACCESS_MODULE_LABELS[request.module]} · ${request.actions.map((item) => XMP_ACCESS_ACTION_LABELS[item]).join("/")}`,
    );
    return { catalog: next, record: next.auditLog[0] };
  }

  if (
    command.kind === "request.approve" ||
    command.kind === "request.deny" ||
    command.kind === "grant.revoke"
  ) {
    const request = catalog.requests.find(
      (item) => item.id === command.requestId,
    );
    if (!request) return reject("授权申请不存在");
    const target = `${XMP_ACCESS_MODULE_LABELS[request.module]} · ${request.id}`;
    if (command.kind === "request.approve") {
      if (!["tenant-admin", "security-officer"].includes(actor.role))
        return reject("只有园所管理员或安全官可审批", target);
      if (!["pending", "first-approved"].includes(request.status))
        return reject("申请不在可审批状态", target);
      if (request.requesterId === actor.id)
        return reject("申请人与审批人必须分离", target);
      if (
        request.approvals.some((approval) => approval.principalId === actor.id)
      )
        return reject("同一审批人不能重复批准", target);
      const approvals = [
        ...request.approvals,
        {
          principalId: actor.id,
          role: actor.role as "tenant-admin" | "security-officer",
          approvedAt: command.issuedAt,
        },
      ];
      const requiredRoles = new Set(approvals.map((item) => item.role));
      const active =
        request.risk === "standard"
          ? approvals.length >= 1
          : requiredRoles.has("tenant-admin") &&
            requiredRoles.has("security-officer");
      const requests = catalog.requests.map((item) =>
        item.id === request.id
          ? {
              ...item,
              approvals,
              status: active
                ? ("active" as const)
                : ("first-approved" as const),
            }
          : item,
      );
      const next = appendRecord(
        { ...catalog, requests },
        command,
        "accepted",
        active ? "双人审批完成，限时授权已激活" : "第一位审批人已确认",
        target,
      );
      return { catalog: next, record: next.auditLog[0] };
    }
    if (!["tenant-admin", "security-officer"].includes(actor.role))
      return reject("没有处置授权申请的权限", target);
    const nextStatus: XmpAccessRequest["status"] =
      command.kind === "request.deny" ? "denied" : "revoked";
    if (command.kind === "grant.revoke" && request.status !== "active")
      return reject("只有生效中的授权可以撤销", target);
    const requests: XmpAccessRequest[] = catalog.requests.map((item) =>
      item.id === request.id
        ? {
            ...item,
            status: nextStatus,
            revokedAt:
              command.kind === "grant.revoke"
                ? command.issuedAt
                : item.revokedAt,
          }
        : item,
    );
    const next = appendRecord(
      { ...catalog, requests },
      command,
      "accepted",
      command.kind === "request.deny" ? "授权申请已拒绝" : "限时授权已撤销",
      target,
    );
    return { catalog: next, record: next.auditLog[0] };
  }

  if (
    command.kind === "principal.suspend" ||
    command.kind === "principal.restore"
  ) {
    if (actor.role !== "tenant-admin" && actor.role !== "security-officer")
      return reject("没有管理主体状态的权限");
    const principal = catalog.principals.find(
      (item) => item.id === command.principalId,
    );
    if (!principal || principal.id === actor.id)
      return reject("目标主体无效或不能停用自己");
    const status: XmpAccessPrincipal["status"] =
      command.kind === "principal.suspend" ? "suspended" : "active";
    const principals: XmpAccessPrincipal[] = catalog.principals.map((item) =>
      item.id === principal.id ? { ...item, status } : item,
    );
    const sessions = catalog.sessions.map((session) =>
      status === "suspended" &&
      session.principalId === principal.id &&
      !session.revokedAt
        ? { ...session, revokedAt: command.issuedAt }
        : session,
    );
    const next = appendRecord(
      { ...catalog, principals, sessions },
      command,
      "accepted",
      status === "suspended"
        ? "主体已停用且会话全部撤销"
        : "主体已恢复，需重新签发会话",
      principal.displayName,
    );
    return { catalog: next, record: next.auditLog[0] };
  }

  if (command.kind === "session.revoke") {
    if (actor.role !== "tenant-admin" && actor.role !== "security-officer")
      return reject("没有撤销会话的权限");
    const session = catalog.sessions.find(
      (item) => item.id === command.sessionId,
    );
    if (!session || session.revokedAt) return reject("会话不存在或已撤销");
    const sessions = catalog.sessions.map((item) =>
      item.id === session.id ? { ...item, revokedAt: command.issuedAt } : item,
    );
    const next = appendRecord(
      { ...catalog, sessions },
      command,
      "accepted",
      "可信会话已立即撤销",
      session.fingerprint,
    );
    return { catalog: next, record: next.auditLog[0] };
  }

  if (command.kind === "session.rotate") {
    const principal = catalog.principals.find(
      (item) => item.id === command.principalId,
    );
    if (!principal || principal.status !== "active")
      return reject("目标主体不存在或已停用");
    if (
      actor.id !== principal.id &&
      actor.role !== "tenant-admin" &&
      actor.role !== "security-officer"
    )
      return reject("不能为该主体轮换会话");
    const sessions = catalog.sessions.map((session) =>
      session.principalId === principal.id && !session.revokedAt
        ? { ...session, revokedAt: command.issuedAt }
        : session,
    );
    const newSession: XmpAccessSession = {
      id: `session-${localSignature(command.id)}`,
      principalId: principal.id,
      tenantId: principal.scope.tenantId,
      campusId: principal.scope.campusId,
      assurance: "device-bound",
      deviceTrusted: true,
      issuedAt: command.issuedAt,
      expiresAt: "2026-07-29T18:00:00+08:00",
      revokedAt: null,
      fingerprint: `LOCAL·${localSignature(command.id).slice(0, 4)}`,
    };
    const next = appendRecord(
      {
        ...catalog,
        sessions: [newSession, ...sessions],
        activeSessionId:
          catalog.activePrincipalId === principal.id
            ? newSession.id
            : catalog.activeSessionId,
      },
      command,
      "accepted",
      "旧会话已撤销，新设备绑定会话已签发",
      principal.displayName,
    );
    return { catalog: next, record: next.auditLog[0] };
  }

  return reject("未知访问控制命令");
}

export function restoreAccessCatalog(input: unknown): XmpAccessCatalog | null {
  if (!input || typeof input !== "object") return null;
  const catalog = input as XmpAccessCatalog;
  if (
    catalog.version !== XMP_ACCESS_CATALOG_VERSION ||
    !catalog.tenant?.id ||
    !catalog.policyVersion ||
    !Array.isArray(catalog.principals) ||
    !Array.isArray(catalog.sessions) ||
    !Array.isArray(catalog.requests) ||
    !Array.isArray(catalog.auditLog) ||
    !Array.isArray(catalog.processedCommandIds) ||
    !catalog.principals.some((item) => item.id === catalog.activePrincipalId) ||
    !catalog.sessions.some(
      (item) =>
        item.id === catalog.activeSessionId &&
        item.principalId === catalog.activePrincipalId,
    ) ||
    catalog.principals.some(
      (item) => item.scope.tenantId !== catalog.tenant.id,
    ) ||
    catalog.requests.some(
      (item) =>
        item.tenantId !== catalog.tenant.id ||
        !catalog.principals.some(
          (principal) => principal.id === item.requesterId,
        ),
    )
  )
    return null;
  return catalog;
}
