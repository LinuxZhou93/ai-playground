"use client";

import {
  AlertTriangle,
  BadgeCheck,
  Banknote,
  Boxes,
  Building2,
  CalendarCheck2,
  Check,
  CheckCircle2,
  ChevronDown,
  CircleAlert,
  ClipboardCheck,
  Clock3,
  FileCheck2,
  GraduationCap,
  HandCoins,
  History,
  LayoutDashboard,
  LockKeyhole,
  PackageCheck,
  ReceiptText,
  RefreshCw,
  Search,
  ShieldCheck,
  TicketCheck,
  UserRoundCheck,
  UsersRound,
  Warehouse,
  Wrench,
  X,
} from "lucide-react";
import { useMemo, useState } from "react";

type OpsPane = "business" | "delivery" | "resources";
type ProjectStatus = "live" | "launching" | "risk";
type ApprovalStatus = "pending" | "approved" | "rejected";

type CampusProject = {
  id: string;
  name: string;
  location: string;
  status: ProjectStatus;
  phase: string;
  progress: number;
  children: number;
  classes: number;
  owner: string;
};

type Approval = {
  id: string;
  type: "transfer" | "inventory" | "refund";
  title: string;
  description: string;
  impact: string;
  requester: string;
  status: ApprovalStatus;
};

const projectsSeed: CampusProject[] = [
  {
    id: "campus-jj",
    name: "锦江实验幼儿园",
    location: "锦江园 · 演示租户",
    status: "live",
    phase: "稳定运营",
    progress: 100,
    children: 168,
    classes: 8,
    owner: "实施负责人 林老师",
  },
  {
    id: "campus-tf",
    name: "天府自然幼儿园",
    location: "天府园 · 上线项目",
    status: "launching",
    phase: "教师培训",
    progress: 72,
    children: 126,
    classes: 6,
    owner: "交付经理 周老师",
  },
  {
    id: "campus-gx",
    name: "高新未来幼儿园",
    location: "高新园 · 上线项目",
    status: "risk",
    phase: "设备部署",
    progress: 48,
    children: 142,
    classes: 7,
    owner: "交付经理 陈老师",
  },
];

const approvalsSeed: Approval[] = [
  {
    id: "ap-01",
    type: "transfer",
    title: "课程权益转班申请",
    description: "演示幼儿 D08 · 大一班转入大二班",
    impact: "剩余 9.5 课时，价值保持不变",
    requester: "教务老师 · 12 分钟前",
    status: "pending",
  },
  {
    id: "ap-02",
    type: "inventory",
    title: "探究材料包出库",
    description: "《会呼吸的种子》材料包 × 18",
    impact: "出库后库存 24 套，高于安全库存",
    requester: "文老师 · 28 分钟前",
    status: "pending",
  },
  {
    id: "ap-03",
    type: "refund",
    title: "课程退费复核",
    description: "演示家庭 F12 · 未开课权益",
    impact: "预计退款 ¥1,280 · 尚未执行",
    requester: "园务主管 · 1 小时前",
    status: "pending",
  },
];

const projectStatusLabel: Record<ProjectStatus, string> = {
  live: "稳定运营",
  launching: "上线中",
  risk: "存在风险",
};

export function OperationsCenter() {
  const [projects, setProjects] = useState(projectsSeed);
  const [selectedProjectId, setSelectedProjectId] = useState("campus-jj");
  const [pane, setPane] = useState<OpsPane>("business");
  const [approvals, setApprovals] = useState(approvalsSeed);
  const [selectedApprovalId, setSelectedApprovalId] = useState("ap-01");
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [milestoneDone, setMilestoneDone] = useState(false);
  const [ticketResolved, setTicketResolved] = useState(false);

  const selectedProject =
    projects.find((item) => item.id === selectedProjectId) ?? projects[0];
  const selectedApproval =
    approvals.find((item) => item.id === selectedApprovalId) ?? approvals[0];
  const pendingApprovals = approvals.filter(
    (item) => item.status === "pending",
  ).length;
  const liveProjects = projects.filter((item) => item.status === "live").length;

  const updateApproval = (status: ApprovalStatus) => {
    setApprovals((items) =>
      items.map((item) =>
        item.id === selectedApproval.id ? { ...item, status } : item,
      ),
    );
    setConfirmOpen(false);
  };

  const deliverySteps = useMemo(
    () => [
      { name: "合同与范围确认", owner: "商务 + 交付", status: "done" },
      { name: "园区网络与空间勘察", owner: "实施工程师", status: "done" },
      { name: "设备与账号初始化", owner: "设备运营", status: "done" },
      {
        name: "教师分层培训",
        owner: "教研顾问",
        status: milestoneDone ? "done" : "active",
      },
      {
        name: "影子课堂与安全演练",
        owner: "园所 + XMP",
        status: milestoneDone ? "active" : "pending",
      },
      { name: "上线验收与 30 天陪跑", owner: "交付经理", status: "pending" },
    ],
    [milestoneDone],
  );

  return (
    <div className="xmp-operations">
      <section className="xmp-ops-head">
        <div>
          <span>DELIVERY & ERP</span>
          <h1>让每一次交付、每一节课、每一笔账都对得上。</h1>
          <p>
            汇总 FutureClass
            学员、班级、排课、考勤课消、库存、员工和财务流水，把 AI
            幼教产品真正落到园所日常经营。
          </p>
        </div>
        <div>
          <span>
            <ShieldCheck size={14} /> 关键运营动作审批留痕
          </span>
          <button onClick={() => setPane("delivery")}>
            <ClipboardCheck size={15} /> 打开交付项目
          </button>
        </div>
      </section>

      <section className="xmp-ops-kpis">
        <article>
          <span>
            <UsersRound size={15} />
          </span>
          <div>
            <b>168</b>
            <small>在园演示幼儿</small>
          </div>
          <em>8 个班级</em>
        </article>
        <article>
          <span>
            <CalendarCheck2 size={15} />
          </span>
          <div>
            <b>82%</b>
            <small>本周空间利用率</small>
          </div>
          <em>无排课冲突</em>
        </article>
        <article>
          <span>
            <Banknote size={15} />
          </span>
          <div>
            <b>¥128,400</b>
            <small>本月确认收入</small>
          </div>
          <em>以已核销课消计</em>
        </article>
        <article>
          <span>
            <Building2 size={15} />
          </span>
          <div>
            <b>{liveProjects}/3</b>
            <small>园区稳定运营</small>
          </div>
          <em className="warn">2 个上线项目</em>
        </article>
      </section>

      <section className="xmp-ops-workbench">
        <aside className="xmp-project-rail">
          <header>
            <div>
              <span>CAMPUS PORTFOLIO</span>
              <h2>园区与交付项目</h2>
            </div>
            <button aria-label="筛选园区">
              <ChevronDown size={14} />
            </button>
          </header>
          <label>
            <Search size={13} />
            <input placeholder="搜索园区或负责人" />
          </label>
          <div className="xmp-project-filter">
            <button className="active">全部 {projects.length}</button>
            <button>上线中 2</button>
            <button>风险 1</button>
          </div>
          <div className="xmp-project-list">
            {projects.map((project) => (
              <button
                key={project.id}
                className={selectedProject.id === project.id ? "active" : ""}
                onClick={() => setSelectedProjectId(project.id)}
              >
                <span className={project.status}>
                  <Building2 size={14} />
                </span>
                <div>
                  <b>{project.name}</b>
                  <small>{project.location}</small>
                  <i>
                    <span style={{ width: `${project.progress}%` }} />
                  </i>
                  <em>
                    {project.phase} · {project.progress}%
                  </em>
                </div>
                <strong className={project.status}>
                  {projectStatusLabel[project.status]}
                </strong>
              </button>
            ))}
          </div>
          <section className="xmp-campus-summary">
            <div className="xmp-ops-section-title">
              <span>SELECTED CAMPUS</span>
              <h3>{selectedProject.name}</h3>
            </div>
            <dl>
              <div>
                <dt>当前阶段</dt>
                <dd>{selectedProject.phase}</dd>
              </div>
              <div>
                <dt>项目负责人</dt>
                <dd>{selectedProject.owner}</dd>
              </div>
              <div>
                <dt>服务范围</dt>
                <dd>
                  {selectedProject.children} 名幼儿 · {selectedProject.classes}{" "}
                  个班
                </dd>
              </div>
              <div>
                <dt>最近复盘</dt>
                <dd>今天 08:45 · 记录完整</dd>
              </div>
            </dl>
            <button>
              <FileCheck2 size={13} /> 查看项目台账
            </button>
          </section>
          <footer>
            <LockKeyhole size={13} />
            <span>
              此页面使用本地演示口径，不读取真实学员、家长、员工或财务数据。
            </span>
          </footer>
        </aside>

        <main className="xmp-ops-main">
          <header>
            <div>
              <small>{selectedProject.location}</small>
              <h2>{selectedProject.name}</h2>
              <p>
                <i className={selectedProject.status} />{" "}
                {projectStatusLabel[selectedProject.status]} · 数据更新 2 分钟前
              </p>
            </div>
            <div>
              <button>
                <History size={14} /> 经营日志
              </button>
              <button className="primary">
                <ReceiptText size={14} /> 导出月报
              </button>
            </div>
          </header>
          <nav>
            <button
              className={pane === "business" ? "active" : ""}
              onClick={() => setPane("business")}
            >
              <LayoutDashboard size={13} /> 经营总览
            </button>
            <button
              className={pane === "delivery" ? "active" : ""}
              onClick={() => setPane("delivery")}
            >
              <ClipboardCheck size={13} /> 实施交付
            </button>
            <button
              className={pane === "resources" ? "active" : ""}
              onClick={() => setPane("resources")}
            >
              <Boxes size={13} /> 人员与资源
            </button>
          </nav>
          {pane === "business" ? (
            <BusinessPanel />
          ) : pane === "delivery" ? (
            <DeliveryPanel
              steps={deliverySteps}
              milestoneDone={milestoneDone}
              onComplete={() => setMilestoneDone(true)}
            />
          ) : (
            <ResourcesPanel />
          )}
          <section className="xmp-finance-boundary">
            <ShieldCheck size={15} />
            <div>
              <b>经营口径可追溯</b>
              <p>
                收入来自已核销课消；预收、退款、转课和库存价值单独记录，不混入确认收入。
              </p>
            </div>
            <em>FutureClass Ledger</em>
          </section>
        </main>

        <aside className="xmp-action-rail">
          <header>
            <div>
              <span>ACTION CENTER</span>
              <h2>今日行动中心</h2>
            </div>
            <em>{pendingApprovals} 待审批</em>
          </header>
          <section className="xmp-approval-list">
            {approvals.map((approval) => (
              <button
                key={approval.id}
                className={selectedApproval.id === approval.id ? "active" : ""}
                onClick={() => setSelectedApprovalId(approval.id)}
              >
                <span className={approval.type}>
                  {approval.type === "transfer" ? (
                    <RefreshCw size={13} />
                  ) : approval.type === "inventory" ? (
                    <Warehouse size={13} />
                  ) : (
                    <HandCoins size={13} />
                  )}
                </span>
                <div>
                  <b>{approval.title}</b>
                  <small>{approval.requester}</small>
                </div>
                <i className={approval.status}>
                  {approval.status === "approved" ? (
                    <Check size={10} />
                  ) : approval.status === "rejected" ? (
                    <X size={10} />
                  ) : (
                    <Clock3 size={10} />
                  )}
                </i>
              </button>
            ))}
          </section>
          <section className="xmp-approval-detail">
            <div className="xmp-approval-context">
              <span>
                {selectedApproval.type === "transfer"
                  ? "权益流转"
                  : selectedApproval.type === "inventory"
                    ? "物料出库"
                    : "财务复核"}
              </span>
              <em>{selectedApproval.requester}</em>
            </div>
            <h3>{selectedApproval.title}</h3>
            <p>{selectedApproval.description}</p>
            <dl>
              <div>
                <dt>影响范围</dt>
                <dd>{selectedApproval.impact}</dd>
              </div>
              <div>
                <dt>校验结果</dt>
                <dd className="safe">
                  <BadgeCheck size={12} /> 规则与权限校验通过
                </dd>
              </div>
              <div>
                <dt>执行方式</dt>
                <dd>审批后写入不可变流水</dd>
              </div>
            </dl>
            <div className="xmp-approval-warning">
              <CircleAlert size={13} />
              <span>演示操作不会变更真实权益、库存或资金。</span>
            </div>
          </section>
          {selectedApproval.status === "pending" ? (
            <div className="xmp-approval-actions">
              <button
                className="reject"
                onClick={() => updateApproval("rejected")}
              >
                <X size={13} /> 驳回
              </button>
              <button className="approve" onClick={() => setConfirmOpen(true)}>
                <Check size={13} /> 审批并执行
              </button>
            </div>
          ) : (
            <div className={`xmp-approval-result ${selectedApproval.status}`}>
              <CheckCircle2 size={14} />
              <p>
                <b>
                  {selectedApproval.status === "approved"
                    ? "审批完成并写入流水"
                    : "申请已驳回"}
                </b>
                <span>
                  {selectedApproval.status === "approved"
                    ? "业务对象、操作人和前后值均已记录"
                    : "未执行任何业务变更"}
                </span>
              </p>
              <button onClick={() => updateApproval("pending")}>撤销</button>
            </div>
          )}
          <section className="xmp-service-ticket">
            <div className="xmp-ops-section-title">
              <span>SERVICE DESK</span>
              <h3>交付服务工单</h3>
            </div>
            <article>
              <span className={ticketResolved ? "done" : "warn"}>
                {ticketResolved ? <Check size={12} /> : <Wrench size={12} />}
              </span>
              <div>
                <b>高新园无线覆盖复测</b>
                <small>影响设备部署 · 交付负责人今天处理</small>
              </div>
            </article>
            {ticketResolved ? (
              <div className="resolved">
                <CheckCircle2 size={13} /> 已复测通过，项目风险待复盘关闭
              </div>
            ) : (
              <button onClick={() => setTicketResolved(true)}>
                <TicketCheck size={13} /> 标记现场复测完成
              </button>
            )}
          </section>
          <section className="xmp-ledger-preview">
            <div className="xmp-ops-section-title">
              <span>IMMUTABLE LEDGER</span>
              <h3>最近运营流水</h3>
            </div>
            <article>
              <time>09:36</time>
              <span />
              <p>
                <b>考勤核销 18 人次</b>
                <small>大一班 · ATTENDANCE</small>
              </p>
            </article>
            <article>
              <time>09:18</time>
              <span />
              <p>
                <b>材料包预占 18 套</b>
                <small>文老师 · INVENTORY_HOLD</small>
              </p>
            </article>
            <article>
              <time>08:45</time>
              <span />
              <p>
                <b>园区晨间健康确认</b>
                <small>系统自动 · OPS_CHECK</small>
              </p>
            </article>
          </section>
        </aside>
      </section>

      {confirmOpen && (
        <div className="xmp-ops-modal" role="dialog" aria-modal="true">
          <section>
            <header>
              <span>
                <LockKeyhole size={18} />
              </span>
              <div>
                <b>确认审批并执行</b>
                <small>LOCAL DEMO · 不会修改真实业务数据</small>
              </div>
              <button
                aria-label="关闭审批确认"
                onClick={() => setConfirmOpen(false)}
              >
                <X size={16} />
              </button>
            </header>
            <div>
              <AlertTriangle size={15} />
              <p>
                将执行“{selectedApproval.title}
                ”，并记录业务对象、前后值、申请人、审批人和原因。
              </p>
            </div>
            <dl>
              <div>
                <dt>业务影响</dt>
                <dd>{selectedApproval.impact}</dd>
              </div>
              <div>
                <dt>流水编号</dt>
                <dd>LEDGER-LOCAL-0728</dd>
              </div>
            </dl>
            <footer>
              <button onClick={() => setConfirmOpen(false)}>取消</button>
              <button
                className="confirm"
                onClick={() => updateApproval("approved")}
              >
                <ShieldCheck size={13} /> 二次确认并执行
              </button>
            </footer>
          </section>
        </div>
      )}
    </div>
  );
}

function BusinessPanel() {
  return (
    <div className="xmp-business">
      <section className="xmp-business-metrics">
        <article>
          <div>
            <span>本周出勤率</span>
            <b>94.2%</b>
            <small>较上周 +1.8%</small>
          </div>
          <i>
            <span style={{ width: "94%" }} />
          </i>
        </article>
        <article>
          <div>
            <span>本周计划课次</span>
            <b>42 / 46</b>
            <small>4 节待完成</small>
          </div>
          <i>
            <span style={{ width: "91%" }} />
          </i>
        </article>
        <article>
          <div>
            <span>教师培训覆盖</span>
            <b>16 / 18</b>
            <small>2 人待完成安全认证</small>
          </div>
          <i>
            <span style={{ width: "89%" }} />
          </i>
        </article>
      </section>
      <section className="xmp-ops-chart">
        <div className="xmp-ops-section-title">
          <span>LESSON CONSUMPTION · 7 DAYS</span>
          <h3>课消与确认收入趋势</h3>
        </div>
        <div className="xmp-ops-chart-legend">
          <span>
            <i />
            核销课次
          </span>
          <span>
            <i />
            确认收入
          </span>
        </div>
        <div className="xmp-ops-bars">
          {[58, 72, 64, 86, 76, 92, 68].map((height, index) => (
            <i key={index} style={{ height: `${height}%` }}>
              <span />
            </i>
          ))}
          <svg
            viewBox="0 0 100 42"
            preserveAspectRatio="none"
            aria-hidden="true"
          >
            <path d="M0,34 C12,31 17,26 28,28 S43,16 52,20 S67,10 76,14 S91,5 100,9" />
          </svg>
        </div>
        <footer>
          <span>周一</span>
          <span>周二</span>
          <span>周三</span>
          <span>周四</span>
          <span>周五</span>
          <span>周六</span>
          <span>周日</span>
        </footer>
      </section>
      <section className="xmp-ops-grid">
        <article>
          <div className="xmp-ops-section-title">
            <span>CLASS CAPACITY</span>
            <h3>班级与空间负载</h3>
          </div>
          <div className="xmp-capacity-row">
            <span>大一班</span>
            <i>
              <b style={{ width: "88%" }} />
            </i>
            <em>22/25</em>
          </div>
          <div className="xmp-capacity-row">
            <span>大二班</span>
            <i>
              <b style={{ width: "76%" }} />
            </i>
            <em>19/25</em>
          </div>
          <div className="xmp-capacity-row">
            <span>中三班</span>
            <i>
              <b style={{ width: "92%" }} />
            </i>
            <em>23/25</em>
          </div>
        </article>
        <article>
          <div className="xmp-ops-section-title">
            <span>OPERATION SIGNAL</span>
            <h3>经营提醒</h3>
          </div>
          <div className="xmp-signal">
            <AlertTriangle size={13} />
            <p>
              <b>2 名教师安全认证将在 7 天后到期</b>
              <small>已自动安排复训，不影响当前授课权限。</small>
            </p>
          </div>
          <div className="xmp-signal normal">
            <PackageCheck size={13} />
            <p>
              <b>种子探究材料库存可覆盖 3 周</b>
              <small>按当前排课与安全库存计算。</small>
            </p>
          </div>
        </article>
      </section>
    </div>
  );
}

function DeliveryPanel({
  steps,
  milestoneDone,
  onComplete,
}: {
  steps: { name: string; owner: string; status: string }[];
  milestoneDone: boolean;
  onComplete: () => void;
}) {
  return (
    <div className="xmp-delivery">
      <section className="xmp-delivery-hero">
        <div>
          <span>TIANFU CAMPUS · LAUNCH PROGRAM</span>
          <h3>天府自然幼儿园上线项目</h3>
          <p>计划 8 月 12 日进入影子课堂，当前重点是教师分层培训与安全演练。</p>
        </div>
        <strong>72%</strong>
      </section>
      <section className="xmp-milestone-list">
        <div className="xmp-ops-section-title">
          <span>IMPLEMENTATION PLAYBOOK</span>
          <h3>标准交付里程碑</h3>
        </div>
        {steps.map((step, index) => (
          <article key={step.name} className={step.status}>
            <span>
              {step.status === "done" ? <Check size={12} /> : index + 1}
            </span>
            <div>
              <b>{step.name}</b>
              <small>{step.owner}</small>
            </div>
            <em>
              {step.status === "done"
                ? "已完成"
                : step.status === "active"
                  ? "进行中"
                  : "待开始"}
            </em>
            {index < steps.length - 1 && <i />}
          </article>
        ))}
      </section>
      <section className="xmp-delivery-readiness">
        <div className="xmp-ops-section-title">
          <span>GO-LIVE READINESS</span>
          <h3>上线准备度</h3>
        </div>
        <div>
          <article>
            <span>
              <PackageCheck size={14} />
            </span>
            <p>
              <b>设备与账号</b>
              <small>24 台已注册 · 角色权限已校验</small>
            </p>
            <em>100%</em>
          </article>
          <article>
            <span>
              <GraduationCap size={14} />
            </span>
            <p>
              <b>教师培训</b>
              <small>14/18 完成 · 4 人正在训练</small>
            </p>
            <em>78%</em>
          </article>
          <article>
            <span>
              <ShieldCheck size={14} />
            </span>
            <p>
              <b>安全演练</b>
              <small>物理静音、教师接管、断网降级</small>
            </p>
            <em>66%</em>
          </article>
        </div>
        {!milestoneDone ? (
          <button onClick={onComplete}>
            <BadgeCheck size={13} /> 确认教师培训里程碑
          </button>
        ) : (
          <div className="xmp-milestone-complete">
            <CheckCircle2 size={14} />
            <p>
              <b>教师培训已确认完成</b>
              <span>下一步：安排影子课堂和儿童安全演练。</span>
            </p>
          </div>
        )}
      </section>
    </div>
  );
}

function ResourcesPanel() {
  return (
    <div className="xmp-resources">
      <section className="xmp-staff-board">
        <div className="xmp-ops-section-title">
          <span>STAFF READINESS</span>
          <h3>教师与交付团队</h3>
        </div>
        <article>
          <span>文</span>
          <p>
            <b>文老师 · 大一班</b>
            <small>课堂 Copilot 认证 · 儿童安全认证</small>
          </p>
          <em className="ready">就绪</em>
        </article>
        <article>
          <span>周</span>
          <p>
            <b>周老师 · 交付经理</b>
            <small>园区上线 · 数据治理 · 设备运营</small>
          </p>
          <em className="ready">就绪</em>
        </article>
        <article>
          <span>林</span>
          <p>
            <b>林老师 · 中三班</b>
            <small>安全认证 7 天后到期</small>
          </p>
          <em className="warn">待复训</em>
        </article>
        <button>
          <UserRoundCheck size={13} /> 打开人员与权限中心
        </button>
      </section>
      <section className="xmp-inventory-board">
        <div className="xmp-ops-section-title">
          <span>INVENTORY & ASSETS</span>
          <h3>物料与硬件资源</h3>
        </div>
        <article>
          <span>
            <PackageCheck size={14} />
          </span>
          <p>
            <b>种子探究材料包</b>
            <small>安全库存 18 · 当前可用 42</small>
          </p>
          <em>充足</em>
        </article>
        <article>
          <span>
            <Boxes size={14} />
          </span>
          <p>
            <b>通用传感器套件</b>
            <small>安全库存 8 · 当前可用 11</small>
          </p>
          <em className="warn">关注</em>
        </article>
        <article>
          <span>
            <Wrench size={14} />
          </span>
          <p>
            <b>奇妙宠备件包</b>
            <small>安全库存 3 · 当前可用 2</small>
          </p>
          <em className="danger">补货</em>
        </article>
        <button>
          <Warehouse size={13} /> 打开库存与领用台账
        </button>
      </section>
    </div>
  );
}
