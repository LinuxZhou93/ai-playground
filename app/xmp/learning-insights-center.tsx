"use client";

import {
  ArrowRight,
  BadgeCheck,
  BarChart3,
  BookOpenCheck,
  BrainCircuit,
  Check,
  CircleAlert,
  Database,
  FilePenLine,
  Layers3,
  LockKeyhole,
  RotateCcw,
  ShieldCheck,
  Sparkles,
  Target,
} from "lucide-react";
import { useState } from "react";
import {
  createInitialLearningInsights,
  XMP_INSIGHT_STAGE_LABELS,
} from "@/lib/xmp/learning-insights";
import { useXmpEvents, XMP_DEMO_CORRELATION_ID } from "./event-store";
import { useXmpLearningInsights } from "./learning-insights-store";

export function LearningInsightsCenter() {
  const { insights, issueCommand, resetInsights } = useXmpLearningInsights();
  const { emit } = useXmpEvents();
  const [adjustment, setAdjustment] = useState(insights.adjustment.draft);
  const reviewable = insights.hypotheses.find(
    (item) => item.status === "candidate",
  );
  const accepted = insights.hypotheses.find(
    (item) => item.status === "accepted",
  );
  const usableSessions = insights.sessions.filter(
    (item) => item.coverage >= insights.boundaries.minimumCoverage,
  );

  const emitInsight = (
    kind: "insight.generated" | "insight.reviewed" | "insight.applied",
    title: string,
    detail: string,
  ) =>
    emit({
      correlationId: XMP_DEMO_CORRELATION_ID,
      kind,
      domain: "insights",
      title,
      detail,
      actor: "文老师",
      entity: "大一班 · 会呼吸的种子",
      privacy: "teacher-reviewed",
    });

  const generate = () => {
    issueCommand("analysis.generate");
    emitInsight(
      "insight.generated",
      "跨课堂教学假设已生成",
      "仅使用覆盖达标的匿名聚合证据；低覆盖课堂已被拦截。",
    );
  };

  const accept = () => {
    if (!reviewable) return;
    issueCommand("hypothesis.accept", {
      actorId: "principal-teacher",
      payload: { hypothesisId: reviewable.id },
    });
    emitInsight(
      "insight.reviewed",
      "教师接受教学假设",
      "教师结合现场经验接受同伴追问假设，AI 不替代教研判断。",
    );
  };

  const saveAdjustment = () => {
    issueCommand("adjustment.edit", {
      actorId: "principal-teacher",
      payload: { adjustment },
    });
  };

  const apply = () => {
    issueCommand("adjustment.apply");
    emitInsight(
      "insight.applied",
      "教学调整进入下一课草稿",
      "调整由教师编辑确认，仅写入第 32 周教学草稿，未自动发布。",
    );
  };

  return (
    <div className="xmp-insights">
      <section className="xmp-insights-hero">
        <div>
          <span>LEARNING INSIGHT · 教师教研闭环</span>
          <h1>让多节课的数据，真正帮助老师把下一节课教得更好。</h1>
          <p>
            系统把智慧教室和教学设备产生的匿名结构化信号，与教师确认的课堂事实放在一起。
            AI
            提出可追溯、可质疑的教学假设；老师作出判断，再把调整带回下一节课。
          </p>
        </div>
        <aside>
          <small>当前教研状态</small>
          <b data-testid="insight-stage">
            {XMP_INSIGHT_STAGE_LABELS[insights.stage]}
          </b>
          <span>
            {insights.classLabel} · {insights.course}
          </span>
          <button
            onClick={() => {
              resetInsights();
              setAdjustment(createInitialLearningInsights().adjustment.draft);
            }}
          >
            <RotateCcw size={14} /> 重置本地演示
          </button>
        </aside>
      </section>

      <section className="xmp-insights-boundary" aria-label="学情数据边界">
        <span>
          <ShieldCheck size={14} /> 只用匿名聚合数据
        </span>
        <span>
          <Database size={14} /> 原始音视频不留存
        </span>
        <span>
          <LockKeyhole size={14} /> 不做儿童排名与诊断
        </span>
        <b>LOCAL DEMO · 非真实教学结果</b>
      </section>

      <section className="xmp-inquiry-card">
        <span>
          <Target size={18} />
        </span>
        <div>
          <small>本轮教学问题 · 由教师提出</small>
          <h2>{insights.inquiry}</h2>
          <p>分析单位是“课堂策略与匿名小组表现”，不是儿童个人。</p>
        </div>
        <div className="xmp-inquiry-quality">
          <b>{usableSessions.length}/3</b>
          <small>课堂证据达标</small>
        </div>
      </section>

      <section className="xmp-insight-workflow" aria-label="教学洞察工作流">
        <article className="xmp-evidence-column">
          <header>
            <div>
              <Layers3 size={17} />
              <span>
                <small>STEP 01</small>
                <b>课堂证据</b>
              </span>
            </div>
            <em>观察事实</em>
          </header>
          <p>
            同一课程的三节本地演示课堂，仅高于 70%
            覆盖率且具备多源印证的数据进入分析。
          </p>
          <div className="xmp-session-list">
            {insights.sessions.map((session) => {
              const usable =
                session.coverage >= insights.boundaries.minimumCoverage;
              return (
                <div key={session.id} className={usable ? "usable" : "blocked"}>
                  <div className="xmp-session-head">
                    <span>
                      <b>{session.label}</b>
                      <small>{session.strategy}</small>
                    </span>
                    <em>
                      {usable ? (
                        <>
                          <Check size={12} /> 可用
                        </>
                      ) : (
                        <>
                          <CircleAlert size={12} /> 拦截
                        </>
                      )}
                    </em>
                  </div>
                  <div className="xmp-metric-pair">
                    <span>
                      <small>证据引用</small>
                      <b>{session.evidenceUse}%</b>
                    </span>
                    <span>
                      <small>匿名参与</small>
                      <b>{session.participation}%</b>
                    </span>
                    <span>
                      <small>有效覆盖</small>
                      <b>{session.coverage}%</b>
                    </span>
                  </div>
                  <div className="xmp-coverage-track">
                    <i style={{ width: `${session.coverage}%` }} />
                  </div>
                  <small>{session.sources.join(" · ")}</small>
                </div>
              );
            })}
          </div>
          <button
            className="xmp-primary-action"
            data-testid="generate-insights"
            disabled={insights.stage !== "evidence"}
            onClick={generate}
          >
            <Sparkles size={15} /> 生成带证据的教学假设 <ArrowRight size={15} />
          </button>
        </article>

        <article className="xmp-hypothesis-column">
          <header>
            <div>
              <BrainCircuit size={17} />
              <span>
                <small>STEP 02</small>
                <b>AI 教学假设</b>
              </span>
            </div>
            <em>不是结论</em>
          </header>
          <p>
            每条假设必须展示证据、置信度和局限；证据不足时系统不能给老师行动建议。
          </p>
          {insights.hypotheses.map((hypothesis) => (
            <div
              key={hypothesis.id}
              className={`xmp-hypothesis ${hypothesis.status}`}
            >
              <div className="xmp-hypothesis-state">
                <span>
                  {hypothesis.status === "blocked"
                    ? "证据不足 · 已拦截"
                    : `中等置信度 · ${hypothesis.status === "accepted" ? "教师已接受" : hypothesis.status === "dismissed" ? "教师已驳回" : "待教师研判"}`}
                </span>
                {hypothesis.status === "accepted" && <BadgeCheck size={16} />}
              </div>
              <h3>{hypothesis.statement}</h3>
              <ul>
                {hypothesis.evidence.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
              <div className="xmp-limitation">
                <CircleAlert size={14} />
                <span>
                  <b>局限</b>
                  {hypothesis.limitation}
                </span>
              </div>
              {hypothesis.status === "candidate" &&
                insights.stage === "hypotheses" && (
                  <div className="xmp-hypothesis-actions">
                    <button
                      data-testid="dismiss-insight"
                      onClick={() =>
                        issueCommand("hypothesis.dismiss", {
                          actorId: "principal-teacher",
                          payload: { hypothesisId: hypothesis.id },
                        })
                      }
                    >
                      证据不足，驳回
                    </button>
                    <button data-testid="accept-insight" onClick={accept}>
                      <Check size={14} />
                      结合现场，接受
                    </button>
                  </div>
                )}
            </div>
          ))}
        </article>

        <article className="xmp-adjustment-column">
          <header>
            <div>
              <BookOpenCheck size={17} />
              <span>
                <small>STEP 03</small>
                <b>下一课调整</b>
              </span>
            </div>
            <em>教师决定</em>
          </header>
          <p>
            AI
            只起草。教师需要把建议改成明确的教学动作和可观察目标，系统不会自动发布。
          </p>
          <label>
            <span>
              <FilePenLine size={14} /> 教师教学调整
            </span>
            <textarea
              value={adjustment}
              disabled={!accepted || insights.stage === "applied"}
              onChange={(event) => setAdjustment(event.target.value)}
              aria-label="下一课教学调整"
            />
          </label>
          <div className="xmp-adjustment-checks">
            <span className={accepted ? "done" : ""}>
              <i>{accepted ? <Check size={11} /> : "1"}</i> 教师接受假设
            </span>
            <span className={insights.adjustment.teacherEdited ? "done" : ""}>
              <i>
                {insights.adjustment.teacherEdited ? <Check size={11} /> : "2"}
              </i>{" "}
              编辑确认动作
            </span>
            <span className={insights.stage === "applied" ? "done" : ""}>
              <i>{insights.stage === "applied" ? <Check size={11} /> : "3"}</i>{" "}
              写入下节课草稿
            </span>
          </div>
          {insights.stage === "applied" ? (
            <div className="xmp-applied-card" data-testid="insight-applied">
              <BadgeCheck size={22} />
              <span>
                <b>已进入 {insights.adjustment.appliedTo}</b>
                <small>仍需教师在课程工厂审核发布</small>
              </span>
            </div>
          ) : insights.adjustment.teacherEdited ? (
            <button
              className="xmp-primary-action"
              data-testid="apply-adjustment"
              onClick={apply}
            >
              写入下一课草稿 <ArrowRight size={15} />
            </button>
          ) : (
            <button
              className="xmp-primary-action"
              data-testid="save-adjustment"
              disabled={!accepted}
              onClick={saveAdjustment}
            >
              确认我的教学调整 <ArrowRight size={15} />
            </button>
          )}
          <div className="xmp-teacher-boundary">
            <BarChart3 size={16} />
            <span>
              <b>系统优化的是教学策略</b>
              <small>不生成儿童能力分数、风险标签或医学判断。</small>
            </span>
          </div>
        </article>
      </section>
    </div>
  );
}
