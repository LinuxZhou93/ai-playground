"use client";

import Link from "next/link";
import {
  ArrowRight,
  BadgeCheck,
  BookCopy,
  BrainCircuit,
  Check,
  ChevronRight,
  CircleAlert,
  FileClock,
  FilePenLine,
  Filter,
  GitBranch,
  LibraryBig,
  Link2,
  LockKeyhole,
  RefreshCw,
  RotateCcw,
  Search,
  ShieldCheck,
  Sparkles,
  Stamp,
  Target,
  UserCheck,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import type { XmpStrategyStatus } from "@/lib/xmp/teaching-strategies";
import { useXmpCourseAssets } from "./course-asset-store";
import { useXmpEvents, XMP_DEMO_CORRELATION_ID } from "./event-store";
import { useXmpLearningInsights } from "./learning-insights-store";
import { useXmpTeachingStrategies } from "./teaching-strategy-store";

const statusLabels: Record<XmpStrategyStatus, string> = {
  candidate: "候选策略",
  "in-review": "教研审核中",
  approved: "审核通过",
  "changes-requested": "待补充证据",
  retired: "已停用",
};

export function TeachingStrategyLibrary() {
  const { library, issueCommand, resetLibrary } = useXmpTeachingStrategies();
  const { insights } = useXmpLearningInsights();
  const { catalog, applyStrategy } = useXmpCourseAssets();
  const { emit } = useXmpEvents();
  const [selectedId, setSelectedId] = useState("strategy-peer-question");
  const [query, setQuery] = useState("");
  const [ageBand, setAgeBand] = useState("5–6 岁");
  const [targetPhaseId, setTargetPhaseId] = useState("share");
  const [adaptationText, setAdaptationText] = useState(
    "分享前安排三分钟同伴追问：每组先说一条观察事实，再向另一组提出一个证据问题；教师记录是否出现主动引用。",
  );

  const filtered = useMemo(
    () =>
      library.strategies.filter((item) =>
        `${item.title}${item.teachingProblem}${item.suitableMoments.join("")}`.includes(
          query,
        ),
      ),
    [library.strategies, query],
  );
  const selected =
    library.strategies.find((item) => item.id === selectedId) ?? filtered[0];
  const activeCourse = catalog.versions.find(
    (item) => item.id === catalog.activePublishedVersionId,
  )!;
  const canImport =
    insights.stage === "applied" &&
    insights.hypotheses.some((item) => item.status === "accepted") &&
    insights.adjustment.teacherEdited;
  const sourceImported = library.strategies.some(
    (item) => item.sourceInsightId === "INSIGHT-A301-20260728",
  );
  const latestAdaptation = library.adaptations.find(
    (item) => item.strategyId === selected?.id,
  );

  useEffect(() => {
    if (!library.strategies.some((item) => item.id === selectedId))
      setSelectedId(library.strategies[0]?.id ?? "");
  }, [library.strategies, selectedId]);

  useEffect(() => {
    const imported = library.strategies.find(
      (item) => item.sourceInsightId === "INSIGHT-A301-20260728",
    );
    if (imported) setSelectedId(imported.id);
  }, [sourceImported, library.strategies]);

  const emitStrategy = (
    kind:
      | "strategy.candidate_imported"
      | "strategy.approved"
      | "strategy.adapted",
    title: string,
    detail: string,
  ) =>
    emit({
      correlationId: XMP_DEMO_CORRELATION_ID,
      kind,
      domain: "strategies",
      title,
      detail,
      actor: kind === "strategy.approved" ? "教研负责人 周老师" : "文老师",
      entity: selected?.title ?? "教学策略",
      privacy: "teacher-reviewed",
    });

  const importCandidate = () => {
    issueCommand("candidate.import", {
      actorId: "principal-teacher",
      payload: {
        sourceInsightId: "INSIGHT-A301-20260728",
        sourceInquiry: insights.inquiry,
        acceptedHypothesis: insights.hypotheses.some(
          (item) => item.status === "accepted",
        ),
        teacherEdited: insights.adjustment.teacherEdited,
        appliedToNextLesson: insights.stage === "applied",
        title: "同伴追问促进证据表达",
        pattern: insights.adjustment.draft,
        limitation:
          "目前仅在同一课程的两节覆盖达标课堂中形成线索，迁移后必须重新验证。",
      },
    });
    emitStrategy(
      "strategy.candidate_imported",
      "教师导入候选教学策略",
      "来源为教师接受、编辑并应用的课堂洞察；尚未成为可复用资产。",
    );
  };

  const submit = () => {
    if (!selected) return;
    issueCommand("review.submit", {
      actorId: selected.author.id,
      payload: { strategyId: selected.id },
    });
  };

  const approve = () => {
    if (!selected) return;
    issueCommand("review.approve", {
      actorId: "research-lead-demo",
      payload: { strategyId: selected.id },
    });
    emitStrategy(
      "strategy.approved",
      "教研负责人批准教学策略",
      "策略具备两节覆盖达标证据和明确适用局限；跨课程仍需再次验证。",
    );
  };

  const createAdaptation = () => {
    if (!selected) return;
    issueCommand("adaptation.create", {
      actorId: "principal-teacher",
      payload: {
        strategyId: selected.id,
        targetCourse: activeCourse.title,
        targetCourseVersionId: activeCourse.id,
        targetPhaseId,
        ageBand,
        teacherAuthoredAction: adaptationText,
      },
    });
    applyStrategy({
      strategyId: selected.id,
      targetPhaseId,
      adaptationText,
      ageBand,
    });
    emitStrategy(
      "strategy.adapted",
      "教学策略进入课程适配草稿",
      `${selected.title}已应用到${activeCourse.title}的分享节拍；未送审、未发布。`,
    );
  };

  return (
    <div className="xmp-strategies">
      <section className="xmp-strategy-hero">
        <div>
          <span>TEACHING STRATEGY LIBRARY · 园本教研资产</span>
          <h1>
            让一位老师验证过的方法，成为整个园所可复用、可追溯的教学能力。
          </h1>
          <p>
            策略不是 AI
            自动总结的“最佳实践”。它必须来自课堂证据和教师判断，经过独立教研审核；
            迁移到新课程时只生成草稿，并重新进入验证闭环。
          </p>
        </div>
        <aside>
          <small>策略资产状态</small>
          <b>
            {
              library.strategies.filter((item) => item.status === "approved")
                .length
            }
          </b>
          <span>个审核通过 · 本地演示</span>
          <button
            onClick={() => {
              resetLibrary();
              setSelectedId("strategy-peer-question");
            }}
          >
            <RotateCcw size={14} /> 重置策略演示
          </button>
        </aside>
      </section>

      <section className="xmp-strategy-boundary" aria-label="策略资产安全边界">
        <span>
          <UserCheck size={14} /> 教师形成与确认
        </span>
        <span>
          <Stamp size={14} /> 独立教研审核
        </span>
        <span>
          <ShieldCheck size={14} /> 不含儿童画像与诊断
        </span>
        <span>
          <LockKeyhole size={14} /> 复用只生成未发布草稿
        </span>
        <b>LOCAL DEMO</b>
      </section>

      <section
        className={`xmp-strategy-handoff ${canImport ? "ready" : "waiting"}`}
      >
        <div className="xmp-handoff-line">
          <span>
            <BrainCircuit size={18} />
          </span>
          <div>
            <small>来自智慧学情</small>
            <b>{insights.inquiry}</b>
          </div>
          <ChevronRight size={16} />
          <div>
            <small>教师研判</small>
            <b>{canImport ? "已接受并应用" : "尚未完成闭环"}</b>
          </div>
          <ChevronRight size={16} />
          <div>
            <small>策略资产</small>
            <b>{sourceImported ? "候选已导入" : "等待教师导入"}</b>
          </div>
        </div>
        {sourceImported ? (
          <span className="xmp-handoff-done">
            <Check size={14} /> 来源已锁定，不重复导入
          </span>
        ) : canImport ? (
          <button
            data-testid="import-strategy-candidate"
            onClick={importCandidate}
          >
            <Link2 size={14} /> 导入候选策略
          </button>
        ) : (
          <Link href="/xmp/insights">
            先完成教师教学洞察 <ArrowRight size={14} />
          </Link>
        )}
      </section>

      <section className="xmp-strategy-workspace">
        <aside className="xmp-strategy-catalog">
          <header>
            <div>
              <LibraryBig size={17} />
              <span>
                <small>园本资产</small>
                <b>教学策略目录</b>
              </span>
            </div>
            <button aria-label="筛选策略">
              <Filter size={14} />
            </button>
          </header>
          <label>
            <Search size={14} />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="搜索教学问题或课堂节拍"
            />
          </label>
          <div className="xmp-strategy-list">
            {filtered.map((strategy) => (
              <button
                key={strategy.id}
                className={strategy.id === selected?.id ? "active" : ""}
                onClick={() => setSelectedId(strategy.id)}
              >
                <div>
                  <span className={strategy.status}>
                    {statusLabels[strategy.status]}
                  </span>
                  <em>v{strategy.version}</em>
                </div>
                <b>{strategy.title}</b>
                <small>{strategy.teachingProblem}</small>
                <p>
                  <span>{strategy.evidence.length} 节证据课堂</span>
                  <span>{strategy.suitableMoments[0]}</span>
                </p>
              </button>
            ))}
          </div>
        </aside>

        {selected && (
          <article className="xmp-strategy-evidence">
            <header>
              <div>
                <small>STRATEGY / {selected.version}</small>
                <h2>{selected.title}</h2>
              </div>
              <span className={selected.status}>
                {statusLabels[selected.status]}
              </span>
            </header>
            <div className="xmp-strategy-problem">
              <Target size={17} />
              <span>
                <small>解决的教学问题</small>
                <b>{selected.teachingProblem}</b>
              </span>
            </div>
            <section>
              <small>策略模式 · 教师可编辑</small>
              <p className="xmp-strategy-pattern">{selected.pattern}</p>
              <div className="xmp-strategy-tags">
                {selected.ageBands.map((item) => (
                  <span key={item}>{item}</span>
                ))}
                {selected.suitableMoments.map((item) => (
                  <span key={item}>{item}</span>
                ))}
              </div>
            </section>
            <section>
              <div className="xmp-section-title">
                <span>
                  <GitBranch size={15} />
                  证据谱系
                </span>
                <em>匿名聚合 + 教师确认</em>
              </div>
              <div className="xmp-strategy-evidence-list">
                {selected.evidence.map((item) => (
                  <div key={item.sessionRef}>
                    <i className={item.coverage >= 70 ? "pass" : "blocked"}>
                      {item.coverage}%
                    </i>
                    <span>
                      <b>{item.summary}</b>
                      <small>
                        {item.sessionRef} ·{" "}
                        {item.kind === "teacher-confirmed"
                          ? "教师确认"
                          : "匿名聚合"}
                      </small>
                    </span>
                    {item.coverage >= 70 ? (
                      <Check size={14} />
                    ) : (
                      <CircleAlert size={14} />
                    )}
                  </div>
                ))}
              </div>
            </section>
            <div className="xmp-strategy-limitation">
              <CircleAlert size={16} />
              <span>
                <small>适用局限必须保留</small>
                <b>{selected.limitation}</b>
              </span>
            </div>
            <div className="xmp-strategy-review-chain">
              <div>
                <span>{selected.author.name.slice(0, 1)}</span>
                <small>策略作者</small>
                <b>{selected.author.name}</b>
              </div>
              <ChevronRight size={15} />
              <div>
                <span>{selected.reviewer?.name.slice(-2, -1) ?? "待"}</span>
                <small>独立审核</small>
                <b>{selected.reviewer?.name ?? "等待教研负责人"}</b>
              </div>
            </div>
            {selected.status === "candidate" ||
            selected.status === "changes-requested" ? (
              <button
                className="xmp-strategy-primary"
                data-testid="submit-strategy-review"
                onClick={submit}
              >
                <FileClock size={15} />
                提交独立教研审核 <ArrowRight size={15} />
              </button>
            ) : selected.status === "in-review" ? (
              <div className="xmp-review-actions">
                <button
                  onClick={() =>
                    issueCommand("review.request_changes", {
                      actorId: "research-lead-demo",
                      payload: { strategyId: selected.id },
                    })
                  }
                >
                  退回补证
                </button>
                <button data-testid="approve-strategy" onClick={approve}>
                  <BadgeCheck size={15} />
                  审核通过
                </button>
              </div>
            ) : (
              <div className="xmp-approved-seal">
                <BadgeCheck size={20} />
                <span>
                  <b>可进入课程适配</b>
                  <small>每次迁移仍需教师改写并再次验证</small>
                </span>
              </div>
            )}
          </article>
        )}

        {selected && (
          <aside className="xmp-strategy-adaptation">
            <header>
              <div>
                <BookCopy size={17} />
                <span>
                  <small>COURSE ADAPTATION</small>
                  <b>课程复用草稿</b>
                </span>
              </div>
              <em>教师决定</em>
            </header>
            <p>
              策略不会直接覆盖课程。选择明确的课程版本与节拍，教师改写后生成一个新的未发布版本。
            </p>
            <div className="xmp-course-base">
              <span>
                <small>基于签名课程</small>
                <b>
                  {activeCourse.title} · v{activeCourse.semanticVersion}
                </b>
                <em>{activeCourse.signature}</em>
              </span>
              <LockKeyhole size={15} />
            </div>
            <label>
              <span>适用年龄</span>
              <select
                value={ageBand}
                onChange={(event) => setAgeBand(event.target.value)}
                disabled={selected.status !== "approved"}
              >
                <option>5–6 岁</option>
                <option>4–5 岁</option>
              </select>
            </label>
            <label>
              <span>目标教学节拍</span>
              <select
                value={targetPhaseId}
                onChange={(event) => setTargetPhaseId(event.target.value)}
                disabled={selected.status !== "approved"}
              >
                {activeCourse.phases.map((phase) => (
                  <option key={phase.id} value={phase.id}>
                    {phase.title} · {phase.duration} 分钟
                  </option>
                ))}
              </select>
            </label>
            <label>
              <span>
                <FilePenLine size={14} />
                教师适配动作
              </span>
              <textarea
                aria-label="教师策略适配动作"
                value={adaptationText}
                onChange={(event) => setAdaptationText(event.target.value)}
                disabled={selected.status !== "approved" || !!latestAdaptation}
              />
            </label>
            <div className="xmp-revalidation">
              <RefreshCw size={15} />
              <span>
                <b>再次验证计划</b>
                <small>
                  下一课继续观察匿名证据引用与教师确认事实，不沿用原课堂结论。
                </small>
              </span>
            </div>
            {latestAdaptation ? (
              <div
                className="xmp-draft-created"
                data-testid="strategy-course-draft"
              >
                <BadgeCheck size={22} />
                <span>
                  <b>课程变体草稿已创建</b>
                  <small>{latestAdaptation.courseDraftId}</small>
                  <em>未送审 · 未发布 · 待课堂再验证</em>
                </span>
              </div>
            ) : (
              <button
                className="xmp-strategy-primary"
                data-testid="create-strategy-course-draft"
                disabled={selected.status !== "approved"}
                onClick={createAdaptation}
              >
                <Sparkles size={15} />
                生成课程适配草稿 <ArrowRight size={15} />
              </button>
            )}
            <Link className="xmp-view-curriculum" href="/xmp/curriculum">
              在课程工厂查看版本差异 <ArrowRight size={14} />
            </Link>
          </aside>
        )}
      </section>
    </div>
  );
}
