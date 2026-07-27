"use client";

import {
  Activity,
  Archive,
  BookOpenCheck,
  Bot,
  Check,
  CheckCircle2,
  ChevronDown,
  CircleAlert,
  Clock3,
  FileCheck2,
  FileText,
  Filter,
  HeartHandshake,
  History,
  PenLine,
  Search,
  ShieldCheck,
  Sparkles,
  Sprout,
  UserRoundCheck,
  X,
} from "lucide-react";
import { useMemo, useState } from "react";
import { useXmpEvents, XMP_DEMO_CORRELATION_ID } from "./event-store";

type EvidenceStatus = "pending" | "approved" | "rejected";
type GrowthPane = "map" | "report";

type EvidenceItem = {
  id: string;
  time: string;
  source: string;
  sourceType: "teacher" | "copilot" | "companion" | "family";
  title: string;
  fact: string;
  context: string;
  domain: string;
  interpretation: string;
  confidence: "高" | "中";
  status: EvidenceStatus;
};

const evidenceSeed: EvidenceItem[] = [
  {
    id: "ev-01",
    time: "09:31",
    source: "文老师现场标记",
    sourceType: "teacher",
    title: "用观察现象支持自己的猜想",
    fact: "幼儿指着浸水后的种子说：“它的皮开了一条小缝，所以它可能正在醒来。”",
    context: "《会呼吸的种子》· 分享与追问环节",
    domain: "科学探究",
    interpretation:
      "能够把可见现象与自己的猜想连接起来，并尝试用“所以”表达因果关系。",
    confidence: "高",
    status: "approved",
  },
  {
    id: "ev-02",
    time: "09:27",
    source: "课堂 Copilot 候选",
    sourceType: "copilot",
    title: "与同伴协商轮流使用滴管",
    fact: "小组内两名幼儿同时想拿滴管。该幼儿说：“你先滴两次，然后给我，好吗？”同伴点头后继续实验。",
    context: "《会呼吸的种子》· 动手探究环节",
    domain: "社会协作",
    interpretation:
      "在资源冲突中提出了具体、可执行的轮流方案，并关注到同伴回应。",
    confidence: "中",
    status: "pending",
  },
  {
    id: "ev-03",
    time: "09:22",
    source: "奇妙宠会话摘要",
    sourceType: "companion",
    title: "面对未知时持续观察而非急于回答",
    fact: "面对“种子有什么变化”的问题，幼儿选择“先仔细看看”，约 18 秒后指出颜色变浅。",
    context: "奇妙宠 C-03 · 观察挑战",
    domain: "学习品质",
    interpretation:
      "愿意延迟作答并通过进一步观察补充信息，表现出一定的任务坚持。",
    confidence: "中",
    status: "pending",
  },
  {
    id: "ev-04",
    time: "09:35",
    source: "文老师课后补充",
    sourceType: "teacher",
    title: "用身体动作表现种子生长",
    fact: "从蜷缩姿势开始，先向下伸手表示“长根”，再慢慢站起并向上伸展。",
    context: "《会呼吸的种子》· 身体表达环节",
    domain: "动作与表达",
    interpretation: "能够按时间顺序用动作再现自己理解的发芽过程。",
    confidence: "高",
    status: "pending",
  },
  {
    id: "ev-05",
    time: "09:29",
    source: "课堂 Copilot 候选",
    sourceType: "copilot",
    title: "疑似注意力离开任务",
    fact: "系统检测到该区域约 22 秒没有材料操作记录。",
    context: "《会呼吸的种子》· 动手探究环节",
    domain: "学习品质",
    interpretation:
      "无法仅凭材料操作间隔判断幼儿是否失去注意，需要教师现场观察佐证。",
    confidence: "中",
    status: "rejected",
  },
];

const domainSeed = [
  { name: "科学探究", evidence: 8, recent: "本周 +2", width: 88 },
  { name: "语言沟通", evidence: 6, recent: "本周 +1", width: 70 },
  { name: "社会协作", evidence: 5, recent: "待确认 +1", width: 60 },
  { name: "动作与表达", evidence: 4, recent: "待确认 +1", width: 50 },
  { name: "学习品质", evidence: 7, recent: "待确认 +1", width: 78 },
  { name: "艺术感受", evidence: 3, recent: "近 30 天", width: 38 },
];

const sourceIcon = {
  teacher: UserRoundCheck,
  copilot: Sparkles,
  companion: Bot,
  family: HeartHandshake,
};

const statusText: Record<EvidenceStatus, string> = {
  pending: "待教师确认",
  approved: "已确认入档",
  rejected: "已驳回",
};

export function GrowthIntelligence() {
  const { emit } = useXmpEvents();
  const [evidence, setEvidence] = useState(evidenceSeed);
  const [selectedId, setSelectedId] = useState("ev-02");
  const [queueFilter, setQueueFilter] = useState<"all" | EvidenceStatus>("all");
  const [pane, setPane] = useState<GrowthPane>("map");
  const [editing, setEditing] = useState(false);
  const [teacherNote, setTeacherNote] = useState("");
  const [reportGenerated, setReportGenerated] = useState(false);
  const [signed, setSigned] = useState(false);
  const selected =
    evidence.find((item) => item.id === selectedId) ?? evidence[0];
  const approvedCount = evidence.filter(
    (item) => item.status === "approved",
  ).length;
  const pendingCount = evidence.filter(
    (item) => item.status === "pending",
  ).length;
  const visibleEvidence = useMemo(
    () =>
      evidence.filter(
        (item) => queueFilter === "all" || item.status === queueFilter,
      ),
    [evidence, queueFilter],
  );

  const setStatus = (status: EvidenceStatus) => {
    setEvidence((items) =>
      items.map((item) =>
        item.id === selected.id
          ? {
              ...item,
              status,
              interpretation: teacherNote.trim() || item.interpretation,
            }
          : item,
      ),
    );
    setEditing(false);
    setTeacherNote("");
    emit({
      correlationId: XMP_DEMO_CORRELATION_ID,
      kind: status === "approved" ? "evidence.approved" : "evidence.rejected",
      domain: "growth",
      title: status === "approved" ? "教师确认成长证据" : "教师驳回证据候选",
      detail:
        status === "approved"
          ? `“${selected.title}”已完成事实与解释复核，可进入报告草稿。`
          : `“${selected.title}”未进入成长档案，保留本次审核轨迹。`,
      actor: "文老师",
      entity: selected.id.toUpperCase(),
      privacy: "teacher-reviewed",
    });
  };

  return (
    <div className="xmp-growth">
      <section className="xmp-growth-head">
        <div>
          <span>GROWTH INTELLIGENCE</span>
          <h1>成长结论，必须回到看得见的证据。</h1>
          <p>
            复用 FutureClass
            成长档案与报告能力，将课堂、奇妙宠和家庭反馈统一为可追溯证据；AI
            负责整理，教师负责判断。
          </p>
        </div>
        <div>
          <span>
            <ShieldCheck size={14} /> 教师审核优先
          </span>
          <button onClick={() => setPane("report")}>
            <FileText size={15} /> 打开报告中心
          </button>
        </div>
      </section>

      <section className="xmp-growth-kpis">
        <article>
          <span>
            <Archive size={15} />
          </span>
          <div>
            <b>31</b>
            <small>本学期有效证据</small>
          </div>
          <em>6 个发展领域</em>
        </article>
        <article>
          <span>
            <Clock3 size={15} />
          </span>
          <div>
            <b>{pendingCount}</b>
            <small>等待教师确认</small>
          </div>
          <em className="warn">最长等待 46 分钟</em>
        </article>
        <article>
          <span>
            <CheckCircle2 size={15} />
          </span>
          <div>
            <b>{approvedCount}</b>
            <small>本课已确认</small>
          </div>
          <em>均可追溯来源</em>
        </article>
        <article>
          <span>
            <FileCheck2 size={15} />
          </span>
          <div>
            <b>1</b>
            <small>报告草稿</small>
          </div>
          <em>尚未向家长开放</em>
        </article>
      </section>

      <section className="xmp-growth-workbench">
        <aside className="xmp-evidence-queue">
          <header>
            <div>
              <span>EVIDENCE INBOX</span>
              <h2>证据审核队列</h2>
            </div>
            <button aria-label="筛选证据">
              <Filter size={14} />
            </button>
          </header>
          <label>
            <Search size={13} />
            <input placeholder="搜索来源或发展领域" />
          </label>
          <div className="xmp-evidence-filters">
            <button
              className={queueFilter === "all" ? "active" : ""}
              onClick={() => setQueueFilter("all")}
            >
              全部 {evidence.length}
            </button>
            <button
              className={queueFilter === "pending" ? "active" : ""}
              onClick={() => setQueueFilter("pending")}
            >
              待确认 {pendingCount}
            </button>
            <button
              className={queueFilter === "approved" ? "active" : ""}
              onClick={() => setQueueFilter("approved")}
            >
              已入档 {approvedCount}
            </button>
          </div>
          <div className="xmp-evidence-list">
            {visibleEvidence.map((item) => {
              const Icon = sourceIcon[item.sourceType];
              return (
                <button
                  key={item.id}
                  className={selected.id === item.id ? "active" : ""}
                  onClick={() => {
                    setSelectedId(item.id);
                    setEditing(false);
                    setTeacherNote("");
                  }}
                >
                  <span className={item.sourceType}>
                    <Icon size={14} />
                  </span>
                  <div>
                    <b>{item.title}</b>
                    <small>
                      {item.source} · {item.time}
                    </small>
                    <em>{item.domain}</em>
                  </div>
                  <i className={item.status}>
                    {item.status === "approved" ? (
                      <Check size={10} />
                    ) : item.status === "rejected" ? (
                      <X size={10} />
                    ) : (
                      <Clock3 size={10} />
                    )}
                  </i>
                </button>
              );
            })}
          </div>
          <footer>
            <ShieldCheck size={13} />
            <span>
              未确认的候选证据不会进入成长档案，也不会用于生成家长报告。
            </span>
          </footer>
        </aside>

        <main className="xmp-evidence-review">
          <header>
            <div>
              <span className={`xmp-evidence-state ${selected.status}`}>
                <i /> {statusText[selected.status]}
              </span>
              <h2>{selected.title}</h2>
              <p>{selected.context}</p>
            </div>
            <button>
              <History size={14} /> 版本记录
            </button>
          </header>
          <section className="xmp-source-proof">
            <div className="xmp-review-title">
              <span>SOURCE EVIDENCE</span>
              <h3>观察事实</h3>
              <em>
                <ShieldCheck size={12} /> 来源已验证
              </em>
            </div>
            <blockquote>“{selected.fact}”</blockquote>
            <dl>
              <div>
                <dt>记录来源</dt>
                <dd>{selected.source}</dd>
              </div>
              <div>
                <dt>发生时间</dt>
                <dd>2026-07-28 {selected.time}</dd>
              </div>
              <div>
                <dt>原始媒介</dt>
                <dd>文字摘要 · 无原始音视频</dd>
              </div>
              <div>
                <dt>保留期限</dt>
                <dd>教师确认后 180 天复核</dd>
              </div>
            </dl>
          </section>
          <section className="xmp-ai-interpretation">
            <div className="xmp-review-title">
              <span>AI SUGGESTION · NOT A CONCLUSION</span>
              <h3>建议解释</h3>
              <em className={selected.confidence === "高" ? "high" : ""}>
                证据充分度 {selected.confidence}
              </em>
            </div>
            {editing ? (
              <textarea
                aria-label="教师修改解释"
                value={teacherNote}
                onChange={(event) => setTeacherNote(event.target.value)}
                placeholder={selected.interpretation}
              />
            ) : (
              <p>{selected.interpretation}</p>
            )}
            <div className="xmp-domain-mapping">
              <span>
                <Sprout size={14} /> 建议映射
              </span>
              <b>{selected.domain}</b>
              <button>
                <ChevronDown size={13} /> 调整领域
              </button>
            </div>
          </section>
          <section className="xmp-review-boundary">
            <CircleAlert size={15} />
            <p>
              <b>判断边界</b>
              <span>
                这是一条情境中的行为证据，不能单独推断稳定能力、性格或发展水平。
              </span>
            </p>
          </section>
          <footer>
            {selected.status === "pending" ? (
              <>
                <button
                  className="reject"
                  onClick={() => setStatus("rejected")}
                >
                  <X size={14} /> 驳回候选
                </button>
                <button
                  onClick={() => {
                    setEditing(true);
                    setTeacherNote(selected.interpretation);
                  }}
                >
                  <PenLine size={14} /> 修改解释
                </button>
                <button
                  className="approve"
                  onClick={() => setStatus("approved")}
                >
                  <Check size={14} /> 教师确认并入档
                </button>
              </>
            ) : (
              <>
                <span>
                  <UserRoundCheck size={14} />{" "}
                  {selected.status === "approved"
                    ? "由文老师确认 · 可进入报告"
                    : "由文老师驳回 · 不参与画像"}
                </span>
                {selected.status === "rejected" && (
                  <button onClick={() => setStatus("pending")}>
                    恢复为待审核
                  </button>
                )}
              </>
            )}
          </footer>
        </main>

        <aside className="xmp-growth-side">
          <nav>
            <button
              className={pane === "map" ? "active" : ""}
              onClick={() => setPane("map")}
            >
              成长图谱
            </button>
            <button
              className={pane === "report" ? "active" : ""}
              onClick={() => setPane("report")}
            >
              报告中心
            </button>
          </nav>
          {pane === "map" ? (
            <GrowthMap approvedCount={approvedCount} />
          ) : (
            <ReportCenter
              approvedCount={approvedCount}
              generated={reportGenerated}
              signed={signed}
              onGenerate={() => setReportGenerated(true)}
              onSign={() => setSigned(true)}
            />
          )}
        </aside>
      </section>
    </div>
  );
}

function GrowthMap({ approvedCount }: { approvedCount: number }) {
  return (
    <div className="xmp-growth-map">
      <header>
        <span>
          <Sprout size={16} />
        </span>
        <div>
          <b>演示幼儿 A17</b>
          <small>大一班 · 5–6 岁 · 本地演示身份</small>
        </div>
        <em>证据 31</em>
      </header>
      <div className="xmp-map-period">
        <span>观察窗口</span>
        <button>
          本学期 <ChevronDown size={12} />
        </button>
      </div>
      <section>
        <div className="xmp-side-title">
          <span>EVIDENCE COVERAGE</span>
          <h3>发展领域证据覆盖</h3>
        </div>
        {domainSeed.map((domain) => (
          <article key={domain.name}>
            <div>
              <b>{domain.name}</b>
              <small>{domain.recent}</small>
            </div>
            <i>
              <span style={{ width: `${domain.width}%` }} />
            </i>
            <em>{domain.evidence} 条</em>
          </article>
        ))}
      </section>
      <div className="xmp-growth-note">
        <Activity size={14} />
        <p>
          <b>本课新增 {approvedCount} 条已确认记录</b>
          <span>图谱表示证据覆盖与连续性，不代表能力评分或同龄排名。</span>
        </p>
      </div>
      <div className="xmp-growth-timeline">
        <div className="xmp-side-title">
          <span>RECENT TRACE</span>
          <h3>最近成长轨迹</h3>
        </div>
        <article>
          <time>今天</time>
          <span />
          <p>
            <b>会呼吸的种子</b>
            <small>科学探究 · 教师已确认</small>
          </p>
        </article>
        <article>
          <time>7 月 24 日</time>
          <span />
          <p>
            <b>我们的影子</b>
            <small>语言沟通 · 2 条证据</small>
          </p>
        </article>
        <article>
          <time>7 月 18 日</time>
          <span />
          <p>
            <b>声音去哪里了</b>
            <small>社会协作 · 1 条证据</small>
          </p>
        </article>
      </div>
    </div>
  );
}

function ReportCenter({
  approvedCount,
  generated,
  signed,
  onGenerate,
  onSign,
}: {
  approvedCount: number;
  generated: boolean;
  signed: boolean;
  onGenerate: () => void;
  onSign: () => void;
}) {
  return (
    <div className="xmp-report-center">
      <header>
        <span>
          <FileText size={16} />
        </span>
        <div>
          <b>《会呼吸的种子》成长简报</b>
          <small>
            {generated
              ? "草稿 V1 · 等待教师签名"
              : "尚未生成 · 仅使用已确认证据"}
          </small>
        </div>
      </header>
      {!generated ? (
        <div className="xmp-report-empty">
          <span>
            <BookOpenCheck size={22} />
          </span>
          <h3>从证据生成，不从标签扩写</h3>
          <p>
            当前可使用 {approvedCount}{" "}
            条教师确认记录。报告将明确区分事实、理解与建议。
          </p>
          <button onClick={onGenerate} disabled={approvedCount < 2}>
            <Sparkles size={14} /> 生成本地报告草稿
          </button>
          {approvedCount < 2 && (
            <small>至少需要 2 条已确认且来源不同的证据</small>
          )}
        </div>
      ) : (
        <>
          <div className="xmp-report-preview">
            <span>给家长的成长简报 · 本地预览</span>
            <h3>在一颗种子里，看见耐心的观察</h3>
            <section>
              <b>我们看见的事实</b>
              <p>
                在今天的种子探究中，孩子注意到浸水后的种皮出现小缝，并用“所以”连接观察与猜想；在小组操作中，他提出了轮流使用滴管的具体办法。
              </p>
            </section>
            <section>
              <b>教师的理解</b>
              <p>
                这些表现说明孩子在本次情境中愿意用证据表达，也开始尝试在合作中提出可执行方案。我们仍会在更多活动中持续观察，而不会以一次表现形成固定判断。
              </p>
            </section>
            <section>
              <b>可以在家继续</b>
              <p>
                和孩子选择一颗家中的植物，每天只记录一个看得见的变化。可以追问：“你看见了什么，让你这样想？”
              </p>
            </section>
          </div>
          <div className="xmp-report-audit">
            <ShieldCheck size={13} />
            <span>引用 2 条证据 · 无原始音视频 · AI 草稿尚未对家长开放</span>
          </div>
          {signed ? (
            <div className="xmp-signed-state">
              <CheckCircle2 size={15} />
              <p>
                <b>文老师已签名确认</b>
                <span>报告可以进入家长预览队列，但尚未发送。</span>
              </p>
            </div>
          ) : (
            <button className="xmp-sign-report" onClick={onSign}>
              <UserRoundCheck size={14} /> 教师阅读并签名
            </button>
          )}
        </>
      )}
    </div>
  );
}
