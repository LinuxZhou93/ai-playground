"use client";

import {
  AlertTriangle,
  BadgeCheck,
  Ban,
  Building2,
  Check,
  CheckCircle2,
  ChevronRight,
  CircleDashed,
  Clock3,
  FileKey2,
  Fingerprint,
  KeyRound,
  Laptop2,
  LockKeyhole,
  RefreshCw,
  RotateCw,
  ShieldAlert,
  ShieldCheck,
  Stamp,
  UserCheck,
  UserRoundCheck,
  UsersRound,
  X,
} from "lucide-react";
import { useMemo, useState } from "react";
import {
  evaluateAccess,
  getRoleActions,
  XMP_ACCESS_ACTION_LABELS,
  XMP_ACCESS_MODULE_LABELS,
  XMP_ACCESS_ROLE_LABELS,
  type XmpAccessAction,
  type XmpAccessModule,
  type XmpAccessRole,
} from "@/lib/xmp/access-control";
import { useXmpEvents, XMP_DEMO_CORRELATION_ID } from "./event-store";
import { useXmpAccessControl } from "./access-control-store";

const matrixRoles: XmpAccessRole[] = [
  "tenant-admin",
  "research-lead",
  "teacher",
  "family",
  "support",
  "security-officer",
];

const matrixModules: XmpAccessModule[] = [
  "curriculum",
  "scheduling",
  "classroom",
  "companion",
  "growth",
  "family",
  "fleet",
  "operations",
  "governance",
  "access",
];

const actionShort: Record<XmpAccessAction, string> = {
  view: "看",
  operate: "做",
  approve: "审",
  publish: "发",
  export: "出",
  manage: "管",
};

const requestStatus = {
  pending: "待首审",
  "first-approved": "待安全复核",
  active: "限时生效",
  denied: "已拒绝",
  revoked: "已撤销",
  expired: "已过期",
};

export function AccessControlCenter() {
  const { catalog, issueCommand, resetCatalog } = useXmpAccessControl();
  const { emit } = useXmpEvents();
  const [selectedPrincipalId, setSelectedPrincipalId] =
    useState("principal-teacher");
  const [selectedModule, setSelectedModule] =
    useState<XmpAccessModule>("fleet");
  const [selectedAction, setSelectedAction] =
    useState<XmpAccessAction>("operate");

  const selectedPrincipal = catalog.principals.find(
    (item) => item.id === selectedPrincipalId,
  )!;
  const selectedSession =
    catalog.sessions.find(
      (item) => item.principalId === selectedPrincipal.id && !item.revokedAt,
    ) ??
    catalog.sessions.find((item) => item.principalId === selectedPrincipal.id);
  const request = catalog.requests.find(
    (item) => item.id === "request-teacher-fleet",
  )!;
  const decision = selectedSession
    ? evaluateAccess(catalog, {
        principalId: selectedPrincipal.id,
        sessionId: selectedSession.id,
        module: selectedModule,
        action: selectedAction,
        tenantId: catalog.tenant.id,
        campusId:
          selectedPrincipal.scope.campusId === "*"
            ? "campus-xmp-west"
            : selectedPrincipal.scope.campusId,
        at: "2026-07-28T09:30:00+08:00",
      })
    : {
        allowed: false,
        source: "denied" as const,
        reason: "主体没有可用会话",
        policyVersion: catalog.policyVersion,
        requestId: null,
      };
  const activeSessions = catalog.sessions.filter((item) => !item.revokedAt);
  const privilegedRoles = matrixRoles.filter((role) =>
    getRoleActions(role, "access").includes("manage"),
  ).length;
  const coverage = useMemo(() => {
    const total = matrixRoles.length * matrixModules.length;
    const granted = matrixRoles.reduce(
      (sum, role) =>
        sum +
        matrixModules.filter(
          (module) => getRoleActions(role, module).length > 0,
        ).length,
      0,
    );
    return Math.round((granted / total) * 100);
  }, []);

  const emitAccess = (
    kind:
      | "access.requested"
      | "access.approved"
      | "access.granted"
      | "access.revoked"
      | "access.session_revoked",
    title: string,
    detail: string,
  ) =>
    emit({
      correlationId: XMP_DEMO_CORRELATION_ID,
      kind,
      domain: "access",
      title,
      detail,
      actor: "XMP 身份与权限控制面",
      entity: request.id,
      privacy: "aggregate",
    });

  const approveManager = () => {
    issueCommand("request.approve", "principal-admin", {
      requestId: request.id,
    });
    emitAccess(
      "access.approved",
      "园所管理员完成临时权限首审",
      "文老师的设备操作申请进入安全官复核，不因首审自动生效。",
    );
  };

  const approveSecurity = () => {
    issueCommand("request.approve", "principal-security", {
      requestId: request.id,
    });
    emitAccess(
      "access.granted",
      "高风险限时授权完成双人审批",
      "设备舰队操作权仅在西园和申请时段内生效，可随时撤销。",
    );
  };

  const revokeGrant = () => {
    issueCommand("grant.revoke", "principal-security", {
      requestId: request.id,
    });
    emitAccess(
      "access.revoked",
      "安全官即时撤销限时权限",
      "后续设备操作判定恢复为默认拒绝，历史审批记录保留。",
    );
  };

  return (
    <div className="xmp-access-center">
      <header className="xmp-access-head">
        <div>
          <span>IDENTITY · TENANT · LEAST PRIVILEGE</span>
          <h1>每一次访问，都先回答“谁、在哪、为什么”。</h1>
          <p>
            从 FutureClass 的加密会话、ERP
            角色与校区上下文出发，升级为默认拒绝、双人审批、限时授权和不可覆盖审计。
          </p>
        </div>
        <div className="xmp-access-head-actions">
          <span>
            <LockKeyhole size={12} /> 本地策略演示 · 不连接生产身份
          </span>
          <button onClick={resetCatalog}>
            <RefreshCw size={14} /> 重置权限演练
          </button>
        </div>
      </header>

      <section
        className="xmp-access-trust-strip"
        aria-label="当前可信访问上下文"
      >
        <div className="identity">
          <span>
            <Fingerprint size={17} />
          </span>
          <p>
            <small>当前可信主体</small>
            <b>周园长 · 园所负责人</b>
          </p>
          <code>LOCAL·A91F</code>
        </div>
        <ChevronRight size={14} />
        <div>
          <span>
            <Building2 size={16} />
          </span>
          <p>
            <small>租户与作用域</small>
            <b>西马棚幼儿园 · 全园区</b>
          </p>
        </div>
        <ChevronRight size={14} />
        <div>
          <span>
            <ShieldCheck size={16} />
          </span>
          <p>
            <small>策略与会话保障</small>
            <b>{catalog.policyVersion} · 设备绑定</b>
          </p>
        </div>
        <em>
          <CheckCircle2 size={13} /> VERIFIED
        </em>
      </section>

      <section className="xmp-access-kpis" aria-label="身份权限关键指标">
        <article>
          <span>
            <UsersRound size={16} />
          </span>
          <p>
            <small>可信主体</small>
            <b>{catalog.principals.length}</b>
          </p>
          <em>6 类职责</em>
        </article>
        <article>
          <span>
            <Laptop2 size={16} />
          </span>
          <p>
            <small>活跃会话</small>
            <b>{activeSessions.length}</b>
          </p>
          <em>全部 MFA+</em>
        </article>
        <article className={request.status === "active" ? "safe" : "pending"}>
          <span>
            <FileKey2 size={16} />
          </span>
          <p>
            <small>高风险申请</small>
            <b>{request.status === "active" ? 0 : 1}</b>
          </p>
          <em>{requestStatus[request.status]}</em>
        </article>
        <article>
          <span>
            <KeyRound size={16} />
          </span>
          <p>
            <small>特权角色</small>
            <b>{privilegedRoles}</b>
          </p>
          <em>{coverage}% 矩阵覆盖</em>
        </article>
      </section>

      <div className="xmp-access-workspace">
        <aside className="xmp-access-principals">
          <header>
            <div>
              <small>DIRECTORY</small>
              <h2>主体与会话</h2>
            </div>
            <span>{catalog.principals.length}</span>
          </header>
          <div className="xmp-access-principal-list">
            {catalog.principals.map((principal) => {
              const session = catalog.sessions.find(
                (item) => item.principalId === principal.id && !item.revokedAt,
              );
              return (
                <button
                  key={principal.id}
                  className={
                    selectedPrincipal.id === principal.id ? "active" : ""
                  }
                  onClick={() => setSelectedPrincipalId(principal.id)}
                >
                  <span>{principal.displayName.slice(0, 1)}</span>
                  <p>
                    <b>{principal.displayName}</b>
                    <small>{XMP_ACCESS_ROLE_LABELS[principal.role]}</small>
                  </p>
                  <em className={session ? "online" : "offline"}>
                    {session ? session.fingerprint : "无会话"}
                  </em>
                </button>
              );
            })}
          </div>
          <section className="xmp-access-session-card">
            <header>
              <span>
                <UserRoundCheck size={14} />
              </span>
              <div>
                <small>选中主体</small>
                <b>{selectedPrincipal.displayName}</b>
              </div>
              <em className={selectedPrincipal.status}>
                {selectedPrincipal.status === "active" ? "ACTIVE" : "SUSPENDED"}
              </em>
            </header>
            <dl>
              <div>
                <dt>组织职责</dt>
                <dd>{selectedPrincipal.title}</dd>
              </div>
              <div>
                <dt>园区作用域</dt>
                <dd>
                  {selectedPrincipal.scope.campusId === "*" ? "全园区" : "西园"}
                </dd>
              </div>
              <div>
                <dt>会话保障</dt>
                <dd>{selectedSession?.assurance ?? "无"}</dd>
              </div>
              <div>
                <dt>可信设备</dt>
                <dd>{selectedSession?.deviceTrusted ? "已绑定" : "未绑定"}</dd>
              </div>
            </dl>
            {selectedPrincipal.id === "principal-support" && (
              <button
                onClick={() =>
                  issueCommand("principal.suspend", "principal-security", {
                    principalId: selectedPrincipal.id,
                  })
                }
                disabled={selectedPrincipal.status === "suspended"}
              >
                <Ban size={13} /> 停用主体并撤销会话
              </button>
            )}
          </section>
        </aside>

        <main className="xmp-access-matrix-panel">
          <header>
            <div>
              <small>POLICY MATRIX · {catalog.policyVersion}</small>
              <h2>模块 × 角色最小权限</h2>
              <p>空白即拒绝；颜色只表达权限深度，不代表菜单是否可见。</p>
            </div>
            <div className="xmp-access-legend">
              <span>
                <i className="view" /> 只读
              </span>
              <span>
                <i className="operate" /> 可操作
              </span>
              <span>
                <i className="privileged" /> 特权
              </span>
            </div>
          </header>
          <div
            className="xmp-access-matrix"
            role="table"
            aria-label="角色权限矩阵"
          >
            <div className="matrix-corner" role="columnheader">
              业务模块
            </div>
            {matrixRoles.map((role) => (
              <div className="matrix-role" role="columnheader" key={role}>
                <span>{XMP_ACCESS_ROLE_LABELS[role].slice(0, 1)}</span>
                <b>{XMP_ACCESS_ROLE_LABELS[role]}</b>
              </div>
            ))}
            {matrixModules.map((module) => (
              <div className="matrix-row" role="row" key={module}>
                <div className="matrix-module" role="rowheader">
                  <b>{XMP_ACCESS_MODULE_LABELS[module]}</b>
                  <small>{module.toUpperCase()}</small>
                </div>
                {matrixRoles.map((role) => {
                  const actions = getRoleActions(role, module);
                  const level = actions.some((action) =>
                    ["approve", "publish", "export", "manage"].includes(action),
                  )
                    ? "privileged"
                    : actions.includes("operate")
                      ? "operate"
                      : actions.includes("view")
                        ? "view"
                        : "none";
                  return (
                    <div
                      className={`matrix-cell ${level}`}
                      role="cell"
                      key={role}
                    >
                      {actions.length ? (
                        <span
                          title={actions
                            .map((action) => XMP_ACCESS_ACTION_LABELS[action])
                            .join("、")}
                        >
                          {actions
                            .map((action) => actionShort[action])
                            .join("·")}
                        </span>
                      ) : (
                        <X size={11} />
                      )}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>

          <section className="xmp-access-simulator" aria-label="权限判定模拟器">
            <header>
              <div>
                <span>
                  <ShieldAlert size={15} />
                </span>
                <p>
                  <small>POLICY DECISION POINT</small>
                  <b>权限判定模拟器</b>
                </p>
              </div>
              <em
                className={decision.allowed ? "allow" : "deny"}
                data-testid="access-decision"
              >
                {decision.allowed ? <Check size={13} /> : <X size={13} />}
                {decision.allowed ? "ALLOW" : "DENY"}
              </em>
            </header>
            <div className="xmp-access-simulator-controls">
              <label>
                <span>主体</span>
                <select
                  value={selectedPrincipalId}
                  onChange={(event) =>
                    setSelectedPrincipalId(event.target.value)
                  }
                >
                  {catalog.principals.map((principal) => (
                    <option key={principal.id} value={principal.id}>
                      {principal.displayName}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                <span>模块</span>
                <select
                  value={selectedModule}
                  onChange={(event) =>
                    setSelectedModule(event.target.value as XmpAccessModule)
                  }
                >
                  {matrixModules.map((module) => (
                    <option key={module} value={module}>
                      {XMP_ACCESS_MODULE_LABELS[module]}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                <span>动作</span>
                <select
                  value={selectedAction}
                  onChange={(event) =>
                    setSelectedAction(event.target.value as XmpAccessAction)
                  }
                >
                  {(
                    Object.keys(XMP_ACCESS_ACTION_LABELS) as XmpAccessAction[]
                  ).map((action) => (
                    <option key={action} value={action}>
                      {XMP_ACCESS_ACTION_LABELS[action]}
                    </option>
                  ))}
                </select>
              </label>
            </div>
            <footer>
              <code>
                {selectedPrincipal.id} / {selectedModule}.{selectedAction}
              </code>
              <p>
                <b>{decision.reason}</b>
                <span>
                  {decision.source} · {decision.policyVersion}
                </span>
              </p>
            </footer>
          </section>
        </main>

        <aside className="xmp-access-inspector">
          <section className={`xmp-access-request-card ${request.status}`}>
            <header>
              <div>
                <span>
                  <FileKey2 size={15} />
                </span>
                <p>
                  <small>JUST-IN-TIME ACCESS</small>
                  <b>高风险限时授权</b>
                </p>
              </div>
              <em data-testid="access-request-status">
                {requestStatus[request.status]}
              </em>
            </header>
            <div className="request-summary">
              <span>文</span>
              <p>
                <b>文老师</b>
                <small>设备舰队 · 操作权限</small>
              </p>
              <strong>60 MIN</strong>
            </div>
            <blockquote>{request.reason}</blockquote>
            <dl>
              <div>
                <dt>作用域</dt>
                <dd>西马棚幼儿园 / 西园</dd>
              </div>
              <div>
                <dt>有效期</dt>
                <dd>09:12 — 10:12</dd>
              </div>
              <div>
                <dt>风险</dt>
                <dd>高 · 设备控制</dd>
              </div>
            </dl>
            <div className="xmp-access-approval-line">
              <div
                className={
                  request.approvals.some((item) => item.role === "tenant-admin")
                    ? "done"
                    : ""
                }
              >
                <span>
                  {request.approvals.some(
                    (item) => item.role === "tenant-admin",
                  ) ? (
                    <Check size={12} />
                  ) : (
                    "1"
                  )}
                </span>
                <p>
                  <b>园所管理员</b>
                  <small>业务必要性</small>
                </p>
              </div>
              <i />
              <div
                className={
                  request.approvals.some(
                    (item) => item.role === "security-officer",
                  )
                    ? "done"
                    : ""
                }
              >
                <span>
                  {request.approvals.some(
                    (item) => item.role === "security-officer",
                  ) ? (
                    <Check size={12} />
                  ) : (
                    "2"
                  )}
                </span>
                <p>
                  <b>安全官</b>
                  <small>风险与边界</small>
                </p>
              </div>
            </div>
            <div className="xmp-access-request-actions">
              {request.status === "pending" && (
                <button
                  data-testid="approve-access-manager"
                  onClick={approveManager}
                >
                  <UserCheck size={13} /> 管理员首审
                </button>
              )}
              {request.status === "first-approved" && (
                <button
                  data-testid="approve-access-security"
                  onClick={approveSecurity}
                >
                  <Stamp size={13} /> 安全官复核并激活
                </button>
              )}
              {request.status === "active" && (
                <button
                  className="danger"
                  data-testid="revoke-temporary-grant"
                  onClick={revokeGrant}
                >
                  <Ban size={13} /> 即时撤销授权
                </button>
              )}
              {["denied", "revoked", "expired"].includes(request.status) && (
                <span>
                  <LockKeyhole size={13} /> 当前无有效临时权限
                </span>
              )}
            </div>
          </section>

          <section className="xmp-access-assurance-card">
            <header>
              <div>
                <small>SESSION ASSURANCE</small>
                <h3>会话可信度</h3>
              </div>
              <BadgeCheck size={17} />
            </header>
            <div className="assurance-levels">
              <span className="done">
                <Check size={11} /> 身份验证
              </span>
              <i />
              <span className="done">
                <Check size={11} /> MFA
              </span>
              <i />
              <span className="done">
                <Check size={11} /> 设备绑定
              </span>
            </div>
            <button
              onClick={() =>
                issueCommand("session.rotate", "principal-admin", {
                  principalId: "principal-admin",
                })
              }
            >
              <RotateCw size={12} /> 轮换管理员会话
            </button>
          </section>

          <section className="xmp-access-audit-card">
            <header>
              <div>
                <small>APPEND-ONLY EVIDENCE</small>
                <h3>最近审计证据</h3>
              </div>
              <span>{catalog.auditLog.length}</span>
            </header>
            <div>
              {catalog.auditLog.slice(0, 5).map((record) => (
                <article key={record.id} className={record.outcome}>
                  <span>
                    {record.outcome === "accepted" ? (
                      <CheckCircle2 size={13} />
                    ) : record.outcome === "rejected" ? (
                      <AlertTriangle size={13} />
                    ) : (
                      <CircleDashed size={13} />
                    )}
                  </span>
                  <p>
                    <b>
                      {record.actorLabel} · {record.targetLabel}
                    </b>
                    <small>{record.reason}</small>
                  </p>
                  <time>{record.occurredAt.slice(11, 16)}</time>
                </article>
              ))}
            </div>
            <footer>
              <Clock3 size={12} /> 本地追加式记录 · 不含儿童身份数据
            </footer>
          </section>
        </aside>
      </div>
    </div>
  );
}
