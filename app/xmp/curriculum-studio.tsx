"use client";

import Link from "next/link";
import {
  Archive,
  ArrowRight,
  Bot,
  Check,
  CheckCircle2,
  ChevronDown,
  CircleDashed,
  Clock3,
  FileCheck2,
  FileDiff,
  FileText,
  GitBranch,
  History,
  Layers3,
  Library,
  LockKeyhole,
  Play,
  Plus,
  RotateCcw,
  Search,
  ShieldCheck,
  Sparkles,
  Stamp,
  WandSparkles,
} from "lucide-react";
import { useMemo, useState } from "react";
import {
  diffCourseVersions,
  type XmpCourseVersionStatus,
} from "@/lib/xmp/course-assets";
import { useXmpClassroomRuntime } from "./classroom-runtime-store";
import {
  useXmpCourseAssets,
  XMP_COURSE_AUTHOR,
  XMP_COURSE_REVIEWER,
  XMP_RELEASE_MANAGER,
} from "./course-asset-store";
import { useXmpEvents, XMP_DEMO_CORRELATION_ID } from "./event-store";

const otherCourses = [
  {
    id: "sound",
    title: "声音去哪里了",
    series: "奇妙物理实验室",
    meta: "4–5 岁 · 30 分钟",
    state: "待审核",
    color: "#e2ecf5",
  },
  {
    id: "color",
    title: "颜色变变变",
    series: "艺术与科学",
    meta: "3–4 岁 · 25 分钟",
    state: "草稿",
    color: "#f4e6dc",
  },
  {
    id: "shadow",
    title: "我们的影子",
    series: "光影探索计划",
    meta: "5–6 岁 · 35 分钟",
    state: "已发布",
    color: "#ece8f5",
  },
];

const statusText: Record<XmpCourseVersionStatus, string> = {
  draft: "教师草稿",
  "in-review": "教研审核中",
  "changes-requested": "已退回修改",
  approved: "审核已批准",
  published: "当前发布",
  superseded: "历史发布",
};

export function CurriculumStudio() {
  const { catalog, issueCommand } = useXmpCourseAssets();
  const { runtime } = useXmpClassroomRuntime();
  const { emit } = useXmpEvents();
  const [query, setQuery] = useState("");
  const [selectedVersionId, setSelectedVersionId] = useState("seed-v3.3.0");
  const [workbenchOpen, setWorkbenchOpen] = useState(false);
  const [brief, setBrief] = useState(
    "围绕春天和种子，为大班设计一节能动手、有讨论、有家庭延伸的探究课",
  );
  const [age, setAge] = useState("5–6 岁");
  const [generating, setGenerating] = useState(false);
  const [generated, setGenerated] = useState(false);

  const selected =
    catalog.versions.find((version) => version.id === selectedVersionId) ??
    catalog.versions[0];
  const active = catalog.versions.find(
    (version) => version.id === catalog.activePublishedVersionId,
  )!;
  const pinned = catalog.versions.find(
    (version) => version.id === catalog.classroomPinnedVersionId,
  )!;
  const base = catalog.versions.find(
    (version) => version.id === selected.basedOnVersionId,
  );
  const differences = useMemo(
    () => diffCourseVersions(selected, base),
    [selected, base],
  );
  const safetyPassed = selected.safetyChecks.filter(
    (check) => check.status === "pass",
  ).length;
  const classroomLocked = runtime.lifecycle !== "preflight";

  const act = (
    kind:
      | "review.submit"
      | "review.approve"
      | "review.request-changes"
      | "release.publish"
      | "release.rollback"
      | "classroom.pin",
  ) => {
    const actor =
      kind === "review.submit"
        ? XMP_COURSE_AUTHOR
        : kind.startsWith("review.")
          ? XMP_COURSE_REVIEWER
          : XMP_RELEASE_MANAGER;
    issueCommand(kind, selected.id, actor, runtime.lifecycle);
    const labels = {
      "review.submit": "课程版本已提交教研审核",
      "review.approve": "教研负责人已批准课程版本",
      "review.request-changes": "教研负责人退回课程版本",
      "release.publish": "课程版本已签名发布",
      "release.rollback": "课程发布已回滚",
      "classroom.pin": "下一堂课已锁定课程版本",
    };
    emit({
      correlationId: XMP_DEMO_CORRELATION_ID,
      kind: "classroom.adjusted",
      domain: "classroom",
      title: labels[kind],
      detail: `${selected.title} v${selected.semanticVersion} · ${actor.displayName}`,
      actor: actor.displayName,
      entity: selected.id,
      privacy: "aggregate",
    });
  };

  const runDemoGeneration = () => {
    if (!brief.trim() || generating) return;
    if (generated) {
      setSelectedVersionId("seed-v3.3.0");
      setWorkbenchOpen(false);
      return;
    }
    setGenerating(true);
    window.setTimeout(() => {
      setGenerating(false);
      setGenerated(true);
    }, 650);
  };

  const filteredOthers = otherCourses.filter((course) =>
    `${course.title}${course.series}`.includes(query),
  );

  return (
    <div className="xmp-curriculum">
      <section className="xmp-curriculum-head">
        <div>
          <span>CURRICULUM RELEASE OPERATING SYSTEM</span>
          <h1>每一次改变，都能被审核、锁定和安全撤回。</h1>
          <p>
            课程不再是一份会被覆盖的文件，而是带结构化差异、安全门禁、本地签名和课堂锁版的可治理资产。
          </p>
        </div>
        <button onClick={() => setWorkbenchOpen(true)}>
          <WandSparkles size={16} /> 新建 AI 课程
        </button>
      </section>

      <section className="xmp-release-strip" aria-label="课程发布状态">
        <div>
          <span>
            <Stamp size={15} />
          </span>
          <small>园所当前发布</small>
          <b>v{active.semanticVersion}</b>
          <em>{active.signature}</em>
        </div>
        <ArrowRight size={15} />
        <div>
          <span>
            <LockKeyhole size={15} />
          </span>
          <small>大一班课堂锁版</small>
          <b>v{pinned.semanticVersion}</b>
          <em>{classroomLocked ? "课堂运行中 · 禁止替换" : "课前可切换"}</em>
        </div>
        <div
          className={`xmp-release-health ${active.id === pinned.id ? "synced" : "pending"}`}
        >
          <i />
          {active.id === pinned.id ? "发布与课堂一致" : "新版本等待下一堂课"}
        </div>
      </section>

      <section className="xmp-curriculum-kpis">
        <article>
          <span>
            <Library size={15} />
          </span>
          <div>
            <b>28</b>
            <small>园本课程资产</small>
          </div>
          <em>本地目录</em>
        </article>
        <article>
          <span>
            <GitBranch size={15} />
          </span>
          <div>
            <b>{catalog.versions.length}</b>
            <small>种子课可追溯版本</small>
          </div>
          <em>不可覆盖</em>
        </article>
        <article>
          <span>
            <ShieldCheck size={15} />
          </span>
          <div>
            <b>{safetyPassed}/8</b>
            <small>当前版本安全门禁</small>
          </div>
          <em>全部通过</em>
        </article>
        <article>
          <span>
            <History size={15} />
          </span>
          <div>
            <b>{catalog.commandLog.length}</b>
            <small>本地发布审计</small>
          </div>
          <em>可回放</em>
        </article>
      </section>

      <section className="xmp-curriculum-workspace xmp-release-workspace">
        <aside className="xmp-course-library">
          <div className="xmp-library-head">
            <div>
              <span>课程资产</span>
              <b>CURRICULUM LIBRARY</b>
            </div>
            <button
              aria-label="新建课程"
              onClick={() => setWorkbenchOpen(true)}
            >
              <Plus size={15} />
            </button>
          </div>
          <label>
            <Search size={14} />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="搜索主题、系列"
            />
          </label>
          <div className="xmp-course-filters">
            <button className="active">全部 28</button>
            <button>待审核 6</button>
            <button>草稿 3</button>
          </div>
          {"会呼吸的种子春日自然探究".includes(query) && (
            <div className="xmp-version-group">
              <div className="xmp-version-course">
                <i>
                  <FileCheck2 size={16} />
                </i>
                <div>
                  <b>会呼吸的种子</b>
                  <small>春日自然探究</small>
                </div>
              </div>
              <div className="xmp-version-list">
                {catalog.versions.map((version) => (
                  <button
                    key={version.id}
                    className={selected.id === version.id ? "active" : ""}
                    onClick={() => setSelectedVersionId(version.id)}
                  >
                    <span>v{version.semanticVersion}</span>
                    <em className={version.status}>
                      {statusText[version.status]}
                    </em>
                    {version.id === catalog.classroomPinnedVersionId && (
                      <LockKeyhole size={11} />
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}
          <div className="xmp-course-list xmp-other-courses">
            {filteredOthers.map((course) => (
              <button key={course.id}>
                <i style={{ background: course.color }}>
                  <FileText size={16} />
                </i>
                <div>
                  <b>{course.title}</b>
                  <small>{course.series}</small>
                  <span>{course.meta}</span>
                </div>
                <em>{course.state}</em>
              </button>
            ))}
          </div>
          <button className="xmp-import-course">
            <Archive size={14} /> 从 FutureClass 课程库导入
          </button>
        </aside>

        <main className="xmp-course-canvas">
          <header>
            <div>
              <span className={`xmp-course-status ${selected.status}`}>
                <i /> {statusText[selected.status]}
              </span>
              <h2>
                {selected.title} <small>v{selected.semanticVersion}</small>
              </h2>
              <p>
                {selected.series} · {selected.ageBand} · 单课{" "}
                {selected.durationMinutes} 分钟
              </p>
            </div>
            <div>
              <Link href="/xmp/classroom" className="xmp-preview-link">
                <Play size={14} /> 预演课堂
              </Link>
            </div>
          </header>

          <section className="xmp-release-actions" aria-label="版本发布操作">
            <div>
              <small>责任链</small>
              <b>
                {selected.author.displayName} <ArrowRight size={11} />{" "}
                {selected.reviewer?.displayName ?? "待分配教研审核"}{" "}
                <ArrowRight size={11} /> 园所发布经理
              </b>
            </div>
            <div className="xmp-action-buttons">
              {(selected.status === "draft" ||
                selected.status === "changes-requested") && (
                <button
                  data-testid="submit-review"
                  onClick={() => act("review.submit")}
                >
                  <ArrowRight size={13} /> 提交教研审核
                </button>
              )}
              {selected.status === "in-review" && (
                <>
                  <button
                    className="secondary"
                    onClick={() => act("review.request-changes")}
                  >
                    <RotateCcw size={13} /> 退回修改
                  </button>
                  <button
                    data-testid="approve-version"
                    onClick={() => act("review.approve")}
                  >
                    <CheckCircle2 size={13} /> 教研批准
                  </button>
                </>
              )}
              {selected.status === "approved" && (
                <button
                  data-testid="publish-version"
                  onClick={() => act("release.publish")}
                >
                  <Stamp size={13} /> 签名并发布
                </button>
              )}
              {selected.status === "published" && selected.id !== pinned.id && (
                <button
                  data-testid="pin-version"
                  disabled={classroomLocked}
                  title={classroomLocked ? "课堂已开始，不能替换课程版本" : ""}
                  onClick={() => act("classroom.pin")}
                >
                  <LockKeyhole size={13} /> 用于下一堂课
                </button>
              )}
              {selected.status === "superseded" && (
                <button
                  data-testid="rollback-version"
                  onClick={() => act("release.rollback")}
                >
                  <History size={13} /> 回滚到此版本
                </button>
              )}
              {selected.id === pinned.id && (
                <span className="xmp-pinned-label">
                  <LockKeyhole size={12} /> 当前课堂锁定
                </span>
              )}
            </div>
          </section>

          <div className="xmp-course-meta">
            <div>
              <small>核心发展目标</small>
              <p>
                <span>科学探究</span>
                <span>语言表达</span>
                <span>合作与坚持</span>
              </p>
            </div>
            <div>
              <small>版本来源</small>
              <p>
                <b>v{selected.semanticVersion}</b> · 基于{" "}
                {base ? `v${base.semanticVersion}` : "初始版本"}
              </p>
            </div>
            <div>
              <small>安全检查</small>
              <p className="safe">
                <ShieldCheck size={13} /> {safetyPassed} 项规则已通过
              </p>
            </div>
          </div>

          <div className="xmp-release-columns">
            <section className="xmp-release-main">
              <section className="xmp-lesson-intent">
                <div>
                  <span>LESSON INTENT</span>
                  <h3>{selected.intent}</h3>
                </div>
              </section>
              <section className="xmp-journey">
                <div className="xmp-subsection-head">
                  <div>
                    <span>LEARNING JOURNEY</span>
                    <h3>课堂学习旅程</h3>
                  </div>
                  <p>
                    总时长 <b>{selected.durationMinutes} 分钟</b> ·{" "}
                    {selected.phases.length} 个教学节拍
                  </p>
                </div>
                <div className="xmp-phase-list">
                  {selected.phases.map((phase, index) => (
                    <article key={phase.id}>
                      <time>{phase.duration}&apos;</time>
                      <span>{String(index + 1).padStart(2, "0")}</span>
                      <div>
                        <b>{phase.title}</b>
                        <p>{phase.detail}</p>
                      </div>
                      <em>{phase.owner}</em>
                    </article>
                  ))}
                </div>
              </section>
              <section className="xmp-course-assets">
                <div className="xmp-subsection-head">
                  <div>
                    <span>IMMUTABLE TEACHING PACKAGE</span>
                    <h3>签名教学包</h3>
                  </div>
                  <small>
                    {selected.signature ?? "草稿资产 · 发布后生成签名"}
                  </small>
                </div>
                <div>
                  {selected.assets.map((asset) => (
                    <article key={asset.id}>
                      <FileText size={17} />
                      <div>
                        <b>{asset.label}</b>
                        <small>
                          {asset.detail} · {asset.checksum}
                        </small>
                      </div>
                      <Check size={14} />
                    </article>
                  ))}
                </div>
              </section>
            </section>

            <aside className="xmp-release-rail">
              <section>
                <header>
                  <FileDiff size={14} />
                  <div>
                    <b>结构化差异</b>
                    <small>
                      对比 {base ? `v${base.semanticVersion}` : "初始版本"}
                    </small>
                  </div>
                </header>
                <div className="xmp-diff-list">
                  {differences.map((change) => (
                    <article key={`${change.field}-${change.detail}`}>
                      <span>{change.field}</span>
                      <p>{change.detail}</p>
                    </article>
                  ))}
                </div>
              </section>
              <section>
                <header>
                  <ShieldCheck size={14} />
                  <div>
                    <b>安全发布门禁</b>
                    <small>
                      {safetyPassed}/{selected.safetyChecks.length} 项通过
                    </small>
                  </div>
                </header>
                <ul>
                  {selected.safetyChecks.map((check) => (
                    <li key={check.id}>
                      <CheckCircle2 size={12} />
                      <span>{check.label}</span>
                    </li>
                  ))}
                </ul>
              </section>
              <section className="xmp-audit-mini">
                <header>
                  <Clock3 size={14} />
                  <div>
                    <b>最近审计</b>
                    <small>本机追加记录</small>
                  </div>
                </header>
                {catalog.commandLog.length ? (
                  catalog.commandLog.slice(0, 4).map((entry) => (
                    <p key={entry.id}>
                      <span>{entry.actorLabel}</span>
                      {entry.kind}
                      <em className={entry.outcome}>
                        {entry.outcome === "accepted"
                          ? "已接受"
                          : entry.outcome === "rejected"
                            ? "已拒绝"
                            : "重复"}
                      </em>
                    </p>
                  ))
                ) : (
                  <div className="xmp-empty-audit">
                    尚无操作，发布链路等待启动。
                  </div>
                )}
              </section>
            </aside>
          </div>
        </main>
      </section>

      {workbenchOpen && (
        <div
          className="xmp-workbench-backdrop"
          role="presentation"
          onMouseDown={() => setWorkbenchOpen(false)}
        >
          <section
            className="xmp-ai-workbench"
            role="dialog"
            aria-modal="true"
            aria-label="新建 AI 课程"
            onMouseDown={(event) => event.stopPropagation()}
          >
            <header>
              <div>
                <span>
                  <Sparkles size={15} />
                </span>
                <div>
                  <b>AI 课程协同设计</b>
                  <small>本地演示生成 · 不发送儿童数据</small>
                </div>
              </div>
              <button onClick={() => setWorkbenchOpen(false)}>×</button>
            </header>
            <div className="xmp-agent-line">
              <span className="done">
                <Check size={12} /> 教研架构师
              </span>
              <i />
              <span className={generating || generated ? "active" : ""}>
                <Bot size={12} /> 活动设计师
              </span>
              <i />
              <span className={generated ? "done" : ""}>
                <ShieldCheck size={12} /> 安全审校员
              </span>
            </div>
            <label className="xmp-brief-field">
              <span>用自然语言描述你的课程想法</span>
              <textarea
                value={brief}
                onChange={(event) => setBrief(event.target.value)}
              />
              <small>{brief.length} 字 · 不要输入真实儿童姓名或个体资料</small>
            </label>
            <div className="xmp-brief-options">
              <label>
                <span>年龄段</span>
                <select
                  value={age}
                  onChange={(event) => setAge(event.target.value)}
                >
                  <option>3–4 岁</option>
                  <option>4–5 岁</option>
                  <option>5–6 岁</option>
                </select>
                <ChevronDown size={13} />
              </label>
              <label>
                <span>课堂时长</span>
                <select defaultValue="35">
                  <option>25</option>
                  <option>30</option>
                  <option>35</option>
                  <option>40</option>
                </select>
                <ChevronDown size={13} />
              </label>
              <label>
                <span>设计模式</span>
                <select defaultValue="探究式">
                  <option>探究式</option>
                  <option>项目式</option>
                  <option>故事式</option>
                </select>
                <ChevronDown size={13} />
              </label>
            </div>
            {generated && (
              <div className="xmp-generation-result">
                <Check size={14} />
                <div>
                  <b>课程骨架已生成，可进入教师审阅</b>
                  <small>
                    已形成 6 个教学节拍、3 类教学资产和 8 项安全检查。
                  </small>
                </div>
              </div>
            )}
            <footer>
              <p>
                <ShieldCheck size={13} /> AI 内容必须经独立教研审核后才能发布
              </p>
              <button
                className="secondary"
                onClick={() => setWorkbenchOpen(false)}
              >
                保存草稿
              </button>
              <button onClick={runDemoGeneration} disabled={generating}>
                {generating ? (
                  <>
                    <CircleDashed size={14} /> 多智能体协作中…
                  </>
                ) : generated ? (
                  <>
                    进入教师审阅 <ArrowRight size={14} />
                  </>
                ) : (
                  <>
                    <Sparkles size={14} /> 生成课程骨架
                  </>
                )}
              </button>
            </footer>
          </section>
        </div>
      )}
    </div>
  );
}
