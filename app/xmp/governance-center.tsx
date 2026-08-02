"use client";

import {
  AlertTriangle,
  Archive,
  Check,
  CheckCircle2,
  ChevronRight,
  CircleAlert,
  Clock3,
  Database,
  Download,
  Eye,
  FileCheck2,
  FileClock,
  FileKey,
  Fingerprint,
  HardDrive,
  KeyRound,
  Link2Off,
  ListChecks,
  LockKeyhole,
  MapPin,
  Mic,
  PackageCheck,
  RefreshCw,
  ScanSearch,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Trash2,
  UserCheck,
  UserRoundCheck,
  Users,
  X,
} from "lucide-react";
import { useMemo, useState } from "react";

type GovernancePane = "inventory" | "consent" | "rights" | "assurance";
type DomainId = "identity" | "classroom" | "growth" | "family" | "device";
type RiskState = "open" | "contained" | "closed";
type DataDomain = {
  id: DomainId;
  name: string;
  category: string;
  purpose: string;
  fields: string;
  location: string;
  retention: string;
  subjects: string;
  status: "active" | "restricted";
  icon: typeof Database;
};

const domains: DataDomain[] = [
  {
    id: "identity",
    name: "幼儿与监护关系",
    category: "儿童敏感个人信息",
    purpose: "建立园内服务身份与监护授权关系",
    fields: "化名编号、班级、监护关系、授权版本",
    location: "园所本地业务库",
    retention: "离园后 30 天进入删除队列",
    subjects: "186 个演示主体",
    status: "active",
    icon: Users,
  },
  {
    id: "classroom",
    name: "课堂互动片段",
    category: "音频与课堂事件",
    purpose: "支持当堂互动与教师课后复盘",
    fields: "短时音频、轮次、教师标注、安全事件",
    location: "教室边缘节点",
    retention: "原始片段 24 小时自动删除",
    subjects: "8 个班级",
    status: "restricted",
    icon: Mic,
  },
  {
    id: "growth",
    name: "成长观察证据",
    category: "教育与发展记录",
    purpose: "形成可解释的成长观察与家园建议",
    fields: "作品、教师观察、能力维度、证据来源",
    location: "园所本地业务库",
    retention: "学期归档；离园请求触发删除",
    subjects: "1,428 条演示记录",
    status: "active",
    icon: FileCheck2,
  },
  {
    id: "family",
    name: "家园沟通记录",
    category: "监护人通信信息",
    purpose: "送达周报、授权变更与权利请求结果",
    fields: "监护人账号、消息状态、回执、请求编号",
    location: "园所本地业务库",
    retention: "服务期内；到期按策略清理",
    subjects: "174 个演示家庭",
    status: "active",
    icon: UserRoundCheck,
  },
  {
    id: "device",
    name: "设备安全遥测",
    category: "非儿童身份设备数据",
    purpose: "设备健康、安全策略与故障定位",
    fields: "设备号、版本、网络状态、操作流水",
    location: "园所边缘中枢",
    retention: "运行日志 180 天",
    subjects: "24 台演示设备",
    status: "active",
    icon: HardDrive,
  },
];

const lifecycle = [
  ["采集", "目的与字段白名单", "passed"],
  ["存储", "本地加密与租户隔离", "passed"],
  ["使用", "最小权限 + 访问审批", "passed"],
  ["共享", "默认关闭，逐项评估", "limited"],
  ["归档", "按业务与法定义务分层", "passed"],
  ["删除", "到期队列 + 删除证明", "passed"],
] as const;

const auditItems = [
  ["监护人知情与授权", "版本化告知、同意范围、撤回时间", "保护专员", "已取证"],
  [
    "最少必要与目的限定",
    "数据地图、字段白名单、目的变更门禁",
    "产品与教研",
    "已取证",
  ],
  [
    "访问审批与操作留痕",
    "角色权限、审批单、不可变访问流水",
    "数据管理员",
    "已取证",
  ],
  [
    "委托处理与第三方管理",
    "处理清单、协议范围、退出删除证明",
    "交付与法务",
    "待补 1 项",
  ],
  ["安全事件响应", "演练记录、隔离时长、通知决策链", "安全负责人", "已取证"],
] as const;

export function GovernanceCenter() {
  const [pane, setPane] = useState<GovernancePane>("inventory");
  const [selectedId, setSelectedId] = useState<DomainId>("classroom");
  const [collectionPaused, setCollectionPaused] = useState(false);
  const [modal, setModal] = useState<"pause" | "delete" | null>(null);
  const [deleteState, setDeleteState] = useState<
    "pending" | "processing" | "complete"
  >("pending");
  const [consentState, setConsentState] = useState<"valid" | "withdrawn">(
    "valid",
  );
  const [riskState, setRiskState] = useState<RiskState>("open");
  const [packageState, setPackageState] = useState<
    "ready" | "building" | "complete"
  >("ready");
  const selected =
    domains.find((domain) => domain.id === selectedId) ?? domains[0];
  const SelectedIcon = selected.icon;
  const readiness = useMemo(() => {
    const checks = [consentState === "valid", riskState !== "open", true, true];
    return Math.round((checks.filter(Boolean).length / checks.length) * 100);
  }, [consentState, riskState]);

  const processDelete = () => {
    setDeleteState("processing");
    setModal(null);
    window.setTimeout(() => setDeleteState("complete"), 750);
  };
  const buildEvidencePackage = () => {
    setPackageState("building");
    window.setTimeout(() => setPackageState("complete"), 700);
  };
  const downloadEvidence = () => {
    const evidence = {
      environment: "local-demo",
      generatedAt: new Date().toISOString(),
      containsPersonalInformation: false,
      controls: auditItems.map(([control, , , state]) => ({ control, state })),
      disclaimer: "演示证据包，不构成认证或法律意见。",
    };
    const url = URL.createObjectURL(
      new Blob([JSON.stringify(evidence, null, 2)], {
        type: "application/json",
      }),
    );
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "xmp-local-trust-evidence.json";
    anchor.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="xmp-governance">
      <section className="xmp-trust-head">
        <div>
          <span>TRUST CENTER</span>
          <h1>儿童数据不是资产池，而是一份有期限的托付。</h1>
          <p>
            把监护授权、处理目的、数据流向、访问审批、权利请求和安全事件放在同一条可验证控制链上。
          </p>
        </div>
        <div>
          <span>
            <ShieldCheck size={14} /> 本地优先 · 默认不出园
          </span>
          <button onClick={() => setPane("assurance")}>
            <PackageCheck size={15} /> 查看审计准备度
          </button>
        </div>
      </section>

      <section className="xmp-trust-kpis">
        {[
          [Database, "5", "已登记数据域", "字段级目的映射", ""],
          [MapPin, "100%", "演示数据在园内处理", "跨境传输 0", ""],
          [UserCheck, "98.9%", "授权记录完整度", "2 份待更新", "warn"],
          [FileClock, "18h", "权利请求平均响应", "目标 72 小时内", ""],
        ].map(([Icon, value, label, note, tone]) => {
          const KpiIcon = Icon as typeof Database;
          return (
            <article key={String(label)}>
              <span>
                <KpiIcon size={15} />
              </span>
              <div>
                <b>{String(value)}</b>
                <small>{String(label)}</small>
              </div>
              <em className={String(tone)}>{String(note)}</em>
            </article>
          );
        })}
      </section>

      <section className="xmp-trust-workbench">
        <aside className="xmp-domain-rail">
          <header>
            <div>
              <span>DATA INVENTORY</span>
              <h2>数据域与处理目的</h2>
            </div>
            <button aria-label="扫描数据资产">
              <ScanSearch size={15} />
            </button>
          </header>
          <div className="xmp-domain-scope">
            <button className="active">全部 5</button>
            <button>儿童数据 3</button>
            <button>设备数据 1</button>
          </div>
          <div className="xmp-domain-list">
            {domains.map((domain) => {
              const Icon = domain.icon;
              return (
                <button
                  key={domain.id}
                  className={selectedId === domain.id ? "active" : ""}
                  onClick={() => setSelectedId(domain.id)}
                >
                  <span className={domain.status}>
                    <Icon size={15} />
                  </span>
                  <div>
                    <b>{domain.name}</b>
                    <small>{domain.category}</small>
                    <em>{domain.subjects}</em>
                  </div>
                  <ChevronRight size={13} />
                </button>
              );
            })}
          </div>
          <div className="xmp-domain-boundary">
            <LockKeyhole size={14} />
            <div>
              <b>环境边界</b>
              <span>LOCAL-DEMO / CN · 未连接真实儿童数据</span>
            </div>
          </div>
          <footer>
            <Shield size={14} />
            <p>
              <b>专门保护规则已建模</b>
              <span>产品控制不等同于外部认证或法律结论。</span>
            </p>
          </footer>
        </aside>

        <main className="xmp-trust-main">
          <header>
            <div>
              <span>{selected.category}</span>
              <h2>{selected.name}</h2>
              <p>
                <SelectedIcon size={13} /> {selected.fields}
              </p>
            </div>
            <div>
              <button>
                <Eye size={14} /> 查看处理记录
              </button>
              <button
                className={collectionPaused ? "paused" : ""}
                disabled={collectionPaused}
                onClick={() => setModal("pause")}
              >
                <Link2Off size={14} />
                {collectionPaused ? "采集已暂停" : "暂停采集"}
              </button>
            </div>
          </header>
          <nav className="xmp-trust-tabs" aria-label="信任中心视图">
            {(
              [
                ["inventory", "数据地图"],
                ["consent", "授权台账"],
                ["rights", "权利响应"],
                ["assurance", "审计保证"],
              ] as [GovernancePane, string][]
            ).map(([id, label]) => (
              <button
                key={id}
                className={pane === id ? "active" : ""}
                onClick={() => setPane(id)}
              >
                {label}
              </button>
            ))}
          </nav>
          {pane === "inventory" && (
            <InventoryPane selected={selected} paused={collectionPaused} />
          )}
          {pane === "consent" && (
            <ConsentPane
              state={consentState}
              onWithdraw={() => setConsentState("withdrawn")}
            />
          )}
          {pane === "rights" && (
            <RightsPane
              state={deleteState}
              onDelete={() => setModal("delete")}
            />
          )}
          {pane === "assurance" && (
            <AssurancePane
              readiness={readiness}
              state={packageState}
              onBuild={buildEvidencePackage}
              onDownload={downloadEvidence}
            />
          )}
          <section className="xmp-regulatory-baseline">
            <ShieldCheck size={17} />
            <div>
              <b>控制基线</b>
              <p>
                依据现行儿童个人信息保护与未成年人网络保护要求建模；上线前仍需结合实际处理活动完成影响评估、制度审查与法律复核。
              </p>
            </div>
            <span>法规映射 v2026.07</span>
          </section>
        </main>

        <aside className="xmp-assurance-rail">
          <header>
            <div>
              <span>ASSURANCE</span>
              <h2>风险与证据</h2>
            </div>
            <em>{readiness}% 准备度</em>
          </header>
          <section className={`xmp-risk-event ${riskState}`}>
            <div>
              <span>
                {riskState === "open" ? (
                  <ShieldAlert size={15} />
                ) : (
                  <ShieldCheck size={15} />
                )}
              </span>
              <p>
                <b>课堂音频缓存超出策略 17 分钟</b>
                <small>边缘节点 E-01 · 演示安全事件</small>
              </p>
            </div>
            <dl>
              <div>
                <dt>影响</dt>
                <dd>1 个演示班级 · 未离开园区</dd>
              </div>
              <div>
                <dt>控制</dt>
                <dd>
                  {riskState === "open"
                    ? "等待隔离与删除"
                    : riskState === "contained"
                      ? "已隔离，等待复盘"
                      : "已关闭并留存证据"}
                </dd>
              </div>
            </dl>
            {riskState === "open" ? (
              <button onClick={() => setRiskState("contained")}>
                <AlertTriangle size={13} /> 启动应急编排
              </button>
            ) : riskState === "contained" ? (
              <button onClick={() => setRiskState("closed")}>
                <CheckCircle2 size={13} /> 完成复盘并关闭
              </button>
            ) : (
              <p className="xmp-risk-closed">
                <Check size={13} /> 缓存已删除，事件证据已封存
              </p>
            )}
          </section>
          <section className="xmp-rights-queue">
            <div className="xmp-rail-title">
              <span>RIGHTS QUEUE</span>
              <h3>监护人权利请求</h3>
            </div>
            <article>
              <span className="delete">
                <Trash2 size={14} />
              </span>
              <p>
                <b>删除请求 · REQ-0728-03</b>
                <small>演示幼儿 C-018 · 29 分钟前</small>
              </p>
              <em>{deleteState === "complete" ? "已完成" : "待核验"}</em>
            </article>
            <article>
              <span>
                <Download size={14} />
              </span>
              <p>
                <b>副本导出 · REQ-0728-02</b>
                <small>身份核验通过 · 正在生成</small>
              </p>
              <em>处理中</em>
            </article>
            <button onClick={() => setPane("rights")}>进入权利响应台</button>
          </section>
          <section className="xmp-access-ledger">
            <div className="xmp-rail-title">
              <span>ACCESS LEDGER</span>
              <h3>最近访问流水</h3>
            </div>
            {[
              ["10:42", "成长报告批量查阅", "教研负责人 · 已审批"],
              ["10:16", "授权记录版本核对", "数据管理员 · 最小权限"],
              ["09:58", "设备事件日志读取", "安全负责人 · 无儿童身份"],
            ].map(([time, title, detail]) => (
              <article key={time}>
                <time>{time}</time>
                <i />
                <p>
                  <b>{title}</b>
                  <small>{detail}</small>
                </p>
              </article>
            ))}
          </section>
          <section className="xmp-trust-owner">
            <span>保</span>
            <p>
              <b>儿童个人信息保护专员</b>
              <small>演示岗位 · 受理、审批、审计与事件协调</small>
            </p>
            <KeyRound size={15} />
          </section>
        </aside>
      </section>

      {modal && (
        <div className="xmp-trust-modal" role="dialog" aria-modal="true">
          <section>
            <header>
              <span className={modal === "delete" ? "danger" : "warn"}>
                {modal === "delete" ? (
                  <Trash2 size={17} />
                ) : (
                  <Link2Off size={17} />
                )}
              </span>
              <div>
                <b>
                  {modal === "delete"
                    ? "二次确认删除权利请求"
                    : "确认暂停课堂音频采集"}
                </b>
                <small>高影响操作 · 本地演示环境</small>
              </div>
              <button aria-label="关闭" onClick={() => setModal(null)}>
                <X size={16} />
              </button>
            </header>
            <div>
              <CircleAlert size={15} />
              <p>
                {modal === "delete"
                  ? "系统将先停止相关数据处理，核验法定或业务留存义务，再从活动存储与派生索引中执行删除并生成证明。"
                  : "暂停后，奇妙宠仍保留物理静音、教师接管和离线安全反馈，但不再生成新的课堂音频片段。"}
              </p>
            </div>
            <dl>
              <div>
                <dt>业务对象</dt>
                <dd>
                  {modal === "delete"
                    ? "演示幼儿 C-018 / REQ-0728-03"
                    : "课堂互动片段 / 大一班"}
                </dd>
              </div>
              <div>
                <dt>审批人</dt>
                <dd>园所管理者 + 儿童信息保护专员</dd>
              </div>
              <div>
                <dt>审计结果</dt>
                <dd>记录原因、操作人、前后状态与证据编号</dd>
              </div>
            </dl>
            <footer>
              <button onClick={() => setModal(null)}>取消</button>
              <button
                className={modal === "delete" ? "danger" : "confirm"}
                onClick={
                  modal === "delete"
                    ? processDelete
                    : () => {
                        setCollectionPaused(true);
                        setModal(null);
                      }
                }
              >
                {modal === "delete" ? (
                  <Trash2 size={13} />
                ) : (
                  <Check size={13} />
                )}
                {modal === "delete" ? "核验并执行删除" : "确认暂停采集"}
              </button>
            </footer>
          </section>
        </div>
      )}
    </div>
  );
}

function InventoryPane({
  selected,
  paused,
}: {
  selected: DataDomain;
  paused: boolean;
}) {
  return (
    <div className="xmp-inventory-pane">
      <section className="xmp-purpose-card">
        <div>
          <span>PROCESSING PURPOSE</span>
          <h3>为什么需要这组数据？</h3>
          <p>{selected.purpose}</p>
        </div>
        <em className={paused ? "paused" : ""}>
          {paused ? "采集已暂停" : "目的范围内处理"}
        </em>
      </section>
      <section className="xmp-data-facts">
        {[
          [MapPin, "存储位置", selected.location],
          [Clock3, "保存与退出", selected.retention],
          [Fingerprint, "身份策略", "化名标识与业务身份分离"],
        ].map(([Icon, label, value]) => {
          const FactIcon = Icon as typeof MapPin;
          return (
            <article key={String(label)}>
              <FactIcon size={15} />
              <p>
                <small>{String(label)}</small>
                <b>{String(value)}</b>
              </p>
            </article>
          );
        })}
      </section>
      <section className="xmp-lifecycle">
        <TrustTitle
          eyebrow="DATA LIFECYCLE"
          title="全生命周期控制链"
          note="每一步都有责任人、策略与证据"
        />
        <div className="xmp-lifecycle-track">
          {lifecycle.map(([name, detail, state], index) => (
            <article key={name}>
              <span className={state}>
                {state === "passed" ? (
                  <Check size={13} />
                ) : (
                  <Link2Off size={13} />
                )}
              </span>
              <p>
                <b>{name}</b>
                <small>{detail}</small>
              </p>
              {index < lifecycle.length - 1 && <i />}
            </article>
          ))}
        </div>
      </section>
      <section className="xmp-flow-map">
        <TrustTitle eyebrow="VERIFIABLE FLOW" title="数据去向与禁止路径" />
        <div>
          {[
            [Mic, "课堂设备", "短时采集 · 物理静音优先"],
            [HardDrive, "园所边缘节点", "识别与安全过滤"],
            [FileCheck2, "教师可解释摘要", "人工确认后进入成长档案"],
          ].map(([Icon, title, detail], index) => {
            const FlowIcon = Icon as typeof Mic;
            return (
              <div className="xmp-flow-step" key={String(title)}>
                <article>
                  <span>
                    <FlowIcon size={15} />
                  </span>
                  <p>
                    <b>{String(title)}</b>
                    <small>{String(detail)}</small>
                  </p>
                </article>
                {index < 2 && <ChevronRight size={15} />}
              </div>
            );
          })}
        </div>
        <footer>
          <Link2Off size={14} />{" "}
          禁止用于广告画像、无关训练或未经评估的第三方共享
        </footer>
      </section>
    </div>
  );
}

function ConsentPane({
  state,
  onWithdraw,
}: {
  state: "valid" | "withdrawn";
  onWithdraw: () => void;
}) {
  return (
    <div className="xmp-consent-pane">
      <section className="xmp-consent-summary">
        <div>
          <span>GUARDIAN CONSENT</span>
          <h3>授权不是一次勾选，而是持续可撤回的关系。</h3>
          <p>
            告知版本、处理目的、字段范围、存储期限与拒绝后果分别记录；目的实质变化时重新取得授权。
          </p>
        </div>
        <strong>98.9%</strong>
      </section>
      <section className="xmp-consent-record">
        <header>
          <div>
            <span>
              <UserRoundCheck size={15} />
            </span>
            <p>
              <b>演示家庭 F-032 / 幼儿 C-018</b>
              <small>监护关系已核验 · 告知版本 CHILD-PRIVACY-2.3</small>
            </p>
          </div>
          <em className={state}>{state === "valid" ? "授权有效" : "已撤回"}</em>
        </header>
        <div className="xmp-consent-scopes">
          {[
            ["园内服务身份", "必要", true],
            ["课堂短时互动", "可选", state === "valid"],
            ["成长档案", "可选", state === "valid"],
            ["家园周报", "可选", state === "valid"],
            ["产品训练", "禁止", false],
            ["商业营销", "禁止", false],
          ].map(([name, kind, enabled]) => (
            <article key={String(name)} className={enabled ? "enabled" : "off"}>
              <span>{enabled ? <Check size={13} /> : <X size={13} />}</span>
              <p>
                <b>{String(name)}</b>
                <small>{String(kind)}</small>
              </p>
            </article>
          ))}
        </div>
        <footer>
          <p>
            <FileKey size={14} />
            <span>
              <b>证据编号 CONSENT-2026-0712-032</b>
              <small>告知、确认、版本与时间戳已留存</small>
            </span>
          </p>
          <button disabled={state === "withdrawn"} onClick={onWithdraw}>
            {state === "withdrawn" ? "授权已撤回" : "演示撤回可选授权"}
          </button>
        </footer>
      </section>
      <section className="xmp-consent-rules">
        {[
          [
            "拒绝同样可用",
            "拒绝可选处理不影响基础园务服务，不使用“不同意即退出”强迫授权。",
          ],
          [
            "范围变化重签",
            "新增处理目的、扩大字段或第三方范围时，旧授权不会自动继承。",
          ],
          [
            "儿童友好说明",
            "教师端提供可口述、可演示的简明说明，不只依赖监护人长文本。",
          ],
        ].map(([title, detail]) => (
          <article key={title}>
            <b>{title}</b>
            <p>{detail}</p>
          </article>
        ))}
      </section>
    </div>
  );
}

function RightsPane({
  state,
  onDelete,
}: {
  state: "pending" | "processing" | "complete";
  onDelete: () => void;
}) {
  return (
    <div className="xmp-rights-pane">
      <section className="xmp-rights-header">
        <div>
          <span>DATA SUBJECT RIGHTS</span>
          <h3>每个请求都有身份核验、处理范围、时限与结果证明。</h3>
        </div>
        <button>
          <ListChecks size={14} /> 查看服务标准
        </button>
      </section>
      <div className="xmp-rights-list">
        <RightRequest
          icon={Trash2}
          kind="REQ-0728-03 · 删除"
          title="删除演示幼儿 C-018 的可选服务数据"
          detail="身份已核验 · 影响 3 个数据域 · 无外部共享副本"
          status={
            state === "pending"
              ? "待执行"
              : state === "processing"
                ? "正在删除"
                : "已完成"
          }
          priority
          action={
            state === "pending"
              ? "核验并处理"
              : state === "processing"
                ? "处理中"
                : "查看删除证明"
          }
          disabled={state !== "pending"}
          onClick={onDelete}
        />
        <RightRequest
          icon={Download}
          kind="REQ-0728-02 · 副本"
          title="导出监护关系与成长档案副本"
          detail="身份已核验 · 脱敏包生成中 · 下载链接限时有效"
          status="处理中"
          action="预计 11 分钟"
          disabled
        />
        <RightRequest
          icon={FileCheck2}
          kind="REQ-0727-08 · 更正"
          title="更正监护关系称谓"
          detail="由园务人员复核完成 · 已同步家园端 · 留存前后值"
          status="已完成"
          action="查看回执"
        />
      </div>
      {state === "complete" && (
        <section className="xmp-deletion-proof">
          <CheckCircle2 size={19} />
          <div>
            <b>删除证明 DEL-2026-0728-003 已生成</b>
            <p>
              活动存储 3/3 已清除 · 派生索引 2/2 已清除 ·
              审计流水仅保留请求编号与操作证明，不保留被删内容。
            </p>
          </div>
          <button>
            <Download size={13} /> 下载证明
          </button>
        </section>
      )}
    </div>
  );
}

function RightRequest({
  icon: Icon,
  kind,
  title,
  detail,
  status,
  action,
  priority,
  disabled,
  onClick,
}: {
  icon: typeof Trash2;
  kind: string;
  title: string;
  detail: string;
  status: string;
  action: string;
  priority?: boolean;
  disabled?: boolean;
  onClick?: () => void;
}) {
  return (
    <article className={priority ? "priority" : ""}>
      <span>
        <Icon size={16} />
      </span>
      <div>
        <em>{kind}</em>
        <b>{title}</b>
        <p>{detail}</p>
      </div>
      <small>{status}</small>
      <button disabled={disabled} onClick={onClick}>
        {status === "正在删除" && <RefreshCw size={13} className="spin" />}
        {action}
      </button>
    </article>
  );
}

function AssurancePane({
  readiness,
  state,
  onBuild,
  onDownload,
}: {
  readiness: number;
  state: "ready" | "building" | "complete";
  onBuild: () => void;
  onDownload: () => void;
}) {
  return (
    <div className="xmp-assurance-pane">
      <section className="xmp-assurance-score">
        <div>
          <span>ASSURANCE READINESS</span>
          <h3>审计准备不是一张证书，而是随时能拿出的证据链。</h3>
          <p>当前为内部演示自检结果，不代表监管认可或第三方认证。</p>
        </div>
        <strong>
          {readiness}
          <small>/100</small>
        </strong>
      </section>
      <section className="xmp-audit-matrix">
        <header>
          <span>控制项</span>
          <span>关键证据</span>
          <span>责任人</span>
          <span>状态</span>
        </header>
        {auditItems.map(([control, evidence, owner, itemState]) => (
          <article key={control}>
            <b>{control}</b>
            <p>{evidence}</p>
            <span>{owner}</span>
            <em className={itemState.startsWith("待") ? "warn" : ""}>
              {itemState}
            </em>
          </article>
        ))}
      </section>
      <section className="xmp-evidence-builder">
        <span>
          <Archive size={18} />
        </span>
        <div>
          <b>生成去标识化审计证据包</b>
          <p>
            仅包含控制状态、证据索引和演示环境说明，不导出儿童信息或原始内容。
          </p>
        </div>
        {state === "complete" ? (
          <button onClick={onDownload}>
            <Download size={13} /> 下载 JSON 证据包
          </button>
        ) : (
          <button disabled={state === "building"} onClick={onBuild}>
            {state === "building" ? (
              <>
                <RefreshCw size={13} className="spin" /> 正在封装
              </>
            ) : (
              <>
                <PackageCheck size={13} /> 生成证据包
              </>
            )}
          </button>
        )}
      </section>
    </div>
  );
}

function TrustTitle({
  eyebrow,
  title,
  note,
}: {
  eyebrow: string;
  title: string;
  note?: string;
}) {
  return (
    <div className="xmp-trust-section-title">
      <div>
        <span>{eyebrow}</span>
        <h3>{title}</h3>
      </div>
      {note && <small>{note}</small>}
    </div>
  );
}
