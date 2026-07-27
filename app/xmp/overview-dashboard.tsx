"use client";

import Link from "next/link";
import {
  Activity,
  ArrowUpRight,
  BookOpenCheck,
  Bot,
  CheckCircle2,
  ChevronRight,
  CircleAlert,
  Clock3,
  Play,
  Radio,
  ShieldCheck,
  Sparkles,
  UsersRound,
  Wifi,
} from "lucide-react";
import { useMemo, useState } from "react";
import { XMP_MODULES } from "./demo-data";
import { InvestorDemoRoom } from "./investor-demo-room";
import type { XmpSnapshot } from "@/lib/xmp/types";

type ClassroomState = "live" | "ready" | "review";

const classrooms: Array<{
  id: string;
  time: string;
  className: string;
  course: string;
  teacher: string;
  state: ClassroomState;
  progress: number;
}> = [
  {
    id: "class-01",
    time: "09:20",
    className: "大一班",
    course: "会呼吸的种子",
    teacher: "文老师",
    state: "live",
    progress: 68,
  },
  {
    id: "class-02",
    time: "10:10",
    className: "中三班",
    course: "声音去哪里了",
    teacher: "林老师",
    state: "ready",
    progress: 0,
  },
  {
    id: "class-03",
    time: "14:30",
    className: "小二班",
    course: "颜色变变变",
    teacher: "周老师",
    state: "ready",
    progress: 0,
  },
  {
    id: "class-04",
    time: "昨日",
    className: "大二班",
    course: "我们的影子",
    teacher: "吴老师",
    state: "review",
    progress: 100,
  },
];

const actionSignals = [
  {
    level: "urgent",
    title: "17 条成长证据等待教师确认",
    meta: "来自今日 3 个班级 · 最久等待 46 分钟",
    href: "/xmp/growth",
  },
  {
    level: "warning",
    title: "大一班课堂节奏偏离预案 4 分钟",
    meta: "AI 建议延长探索环节，教师拥有最终决定权",
    href: "/xmp/classroom",
  },
  {
    level: "normal",
    title: "2 台奇妙宠电量低于 25%",
    meta: "设备 C-07、C-11 · 建议午休时充电",
    href: "/xmp/fleet",
  },
];

const loopSteps = [
  { icon: Sparkles, label: "教研意图", detail: "目标与边界" },
  { icon: BookOpenCheck, label: "课程生成", detail: "可编辑教案" },
  { icon: Radio, label: "实时课堂", detail: "教师掌舵" },
  { icon: Activity, label: "证据沉淀", detail: "可溯源片段" },
  { icon: ShieldCheck, label: "人工审核", detail: "确认后入档" },
  { icon: UsersRound, label: "家园延伸", detail: "可执行任务" },
];

const stateLabel: Record<ClassroomState, string> = {
  live: "进行中",
  ready: "待开始",
  review: "待复盘",
};

export function OverviewDashboard({ snapshot }: { snapshot: XmpSnapshot }) {
  const [classroomFilter, setClassroomFilter] = useState<"today" | "review">(
    "today",
  );
  const [demoOpen, setDemoOpen] = useState(false);
  const visibleClassrooms = useMemo(
    () =>
      classrooms.filter((item) =>
        classroomFilter === "today"
          ? item.state !== "review"
          : item.state === "review",
      ),
    [classroomFilter],
  );

  return (
    <div className="xmp-overview">
      <InvestorDemoRoom open={demoOpen} onClose={() => setDemoOpen(false)} />
      <section className="xmp-overview-hero">
        <div className="xmp-overview-intro">
          <span className="xmp-eyebrow">
            <span /> MONDAY ·{" "}
            {snapshot.mode === "futureclass-readonly"
              ? "READ-ONLY LIVE"
              : "LOCAL DEMO"}
          </span>
          <h1>
            让每一次课堂，
            <br />
            都成为可持续的成长。
          </h1>
          <p>
            从教研设计、现场协作到成长证据与家园延伸，XMP
            把分散的幼教工作连接成一个由教师掌舵的 AI 闭环。
          </p>
          <div className="xmp-hero-actions">
            <button
              className="xmp-primary-action"
              onClick={() => setDemoOpen(true)}
            >
              <Play size={14} /> 启动 12 分钟完整演示 <ArrowUpRight size={14} />
            </button>
            <Link href="/xmp/classroom" className="xmp-secondary-action">
              <Radio size={14} /> 进入实时课堂 <ChevronRight size={14} />
            </Link>
          </div>
        </div>
        <div className="xmp-hero-status">
          <div className="xmp-hero-status-head">
            <span>
              <i /> 园所运行态势
            </span>
            <small>{snapshot.freshnessLabel}</small>
          </div>
          <div className="xmp-health-score">
            <strong>92</strong>
            <span>/ 100</span>
            <div>
              <b>运行健康</b>
              <small>关键链路均正常</small>
            </div>
          </div>
          <div className="xmp-health-bars">
            <span>
              <i style={{ width: "96%" }} />
              <small>教学交付</small>
              <b>96%</b>
            </span>
            <span>
              <i style={{ width: "88%" }} />
              <small>审核及时</small>
              <b>88%</b>
            </span>
            <span>
              <i style={{ width: "95%" }} />
              <small>设备在线</small>
              <b>95%</b>
            </span>
          </div>
        </div>
      </section>

      <section className="xmp-kpi-grid" aria-label="今日关键指标">
        <article>
          <span className="mint">
            <Radio size={16} />
          </span>
          <div>
            <small>今日课堂</small>
            <strong>
              {snapshot.metrics.todaySessions}{" "}
              <em>/ {snapshot.metrics.todaySessions}</em>
            </strong>
            <p>
              <b>{snapshot.metrics.completedSessions}</b> 节已完成 ·
              教师确认后入档
            </p>
          </div>
        </article>
        <article>
          <span className="blue">
            <BookOpenCheck size={16} />
          </span>
          <div>
            <small>课程准备度</small>
            <strong>
              {snapshot.metrics.curriculumReadiness}
              <em>%</em>
            </strong>
            <p>
              <b>+6%</b> 较上周同日
            </p>
          </div>
        </article>
        <article>
          <span className="amber">
            <CircleAlert size={16} />
          </span>
          <div>
            <small>待教师确认</small>
            <strong>{snapshot.metrics.pendingEvidence}</strong>
            <p>
              成长证据 · <b>需要行动</b>
            </p>
          </div>
        </article>
        <article>
          <span className="lilac">
            <Wifi size={16} />
          </span>
          <div>
            <small>在线设备</small>
            <strong>
              {snapshot.metrics.onlineDevices}{" "}
              <em>/ {snapshot.metrics.totalDevices}</em>
            </strong>
            <p>2 台低电量 · 网络稳定</p>
          </div>
        </article>
      </section>

      <section className="xmp-dashboard-grid">
        <article className="xmp-panel xmp-classroom-panel">
          <div className="xmp-panel-head">
            <div>
              <span>TEACHING PULSE</span>
              <h2>课堂脉搏</h2>
            </div>
            <div className="xmp-segmented">
              <button
                className={classroomFilter === "today" ? "active" : ""}
                onClick={() => setClassroomFilter("today")}
              >
                今日
              </button>
              <button
                className={classroomFilter === "review" ? "active" : ""}
                onClick={() => setClassroomFilter("review")}
              >
                待复盘
              </button>
            </div>
          </div>
          <div className="xmp-classroom-list">
            {visibleClassrooms.map((item) => (
              <div className="xmp-classroom-row" key={item.id}>
                <time>{item.time}</time>
                <span className={`xmp-state-dot ${item.state}`} />
                <div className="xmp-classroom-main">
                  <b>
                    {item.className} · {item.course}
                  </b>
                  <small>
                    {item.teacher}{" "}
                    {item.state === "live"
                      ? `· 课堂进度 ${item.progress}%`
                      : "· 教案与设备已检查"}
                  </small>
                  {item.state === "live" && (
                    <i>
                      <span style={{ width: `${item.progress}%` }} />
                    </i>
                  )}
                </div>
                <span className={`xmp-classroom-state ${item.state}`}>
                  {stateLabel[item.state]}
                </span>
                <Link
                  href="/xmp/classroom"
                  aria-label={`查看${item.className}课堂`}
                >
                  <ChevronRight size={16} />
                </Link>
              </div>
            ))}
          </div>
        </article>

        <article className="xmp-panel xmp-signal-panel">
          <div className="xmp-panel-head">
            <div>
              <span>ACTION SIGNALS</span>
              <h2>现在需要关注</h2>
            </div>
            <span className="xmp-signal-count">3</span>
          </div>
          <div className="xmp-signal-list">
            {actionSignals.map((signal) => (
              <Link href={signal.href} key={signal.title}>
                <span className={signal.level}>
                  {signal.level === "urgent" ? (
                    <CircleAlert size={15} />
                  ) : signal.level === "warning" ? (
                    <Clock3 size={15} />
                  ) : (
                    <Bot size={15} />
                  )}
                </span>
                <div>
                  <b>{signal.title}</b>
                  <small>{signal.meta}</small>
                </div>
                <ChevronRight size={15} />
              </Link>
            ))}
          </div>
          <div className="xmp-human-control">
            <ShieldCheck size={15} />
            <p>
              <b>教师最终决策</b>
              <span>AI 只提供建议，不自动形成儿童评价。</span>
            </p>
          </div>
        </article>
      </section>

      <section className="xmp-loop-section">
        <div className="xmp-section-title">
          <span>ONE CONTINUOUS LOOP</span>
          <h2>一套系统，完成教学全过程</h2>
          <p>
            每一步都有输入、责任人和可追溯输出，不让 AI 成为孤立的功能按钮。
          </p>
        </div>
        <div className="xmp-loop-track">
          {loopSteps.map(({ icon: Icon, label, detail }, index) => (
            <div className="xmp-loop-step" key={label}>
              <span>
                <Icon size={17} />
              </span>
              <b>{label}</b>
              <small>{detail}</small>
              {index < loopSteps.length - 1 && <ChevronRight size={15} />}
            </div>
          ))}
        </div>
      </section>

      <section className="xmp-capability-section">
        <div className="xmp-section-title compact">
          <span>PRODUCT SYSTEM</span>
          <h2>九大能力，共用同一数据与安全底座</h2>
        </div>
        <div className="xmp-capability-grid">
          {XMP_MODULES.map(
            (
              { id, name, englishName, description, href, icon: Icon },
              index,
            ) => (
              <Link
                href={href}
                key={id}
                className={id === "overview" ? "active" : ""}
              >
                <span className="xmp-module-index">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <i>
                  <Icon size={17} />
                </i>
                <div>
                  <b>{name}</b>
                  <small>{englishName}</small>
                  <p>{description}</p>
                </div>
                <ChevronRight size={14} />
              </Link>
            ),
          )}
        </div>
        <div className="xmp-local-footnote">
          <CheckCircle2 size={15} />
          <span>
            <b>
              {snapshot.tenant.name} · {snapshot.sourceLabel}
            </b>{" "}
            {snapshot.mode === "futureclass-readonly"
              ? "ERP、课程与成长数据仅展示聚合数量；课堂和设备仍使用清晰标记的演示数据。"
              : "本页面指标用于验证产品流程与交互，不代表真实园所运营结果。"}
          </span>
        </div>
      </section>
    </div>
  );
}
