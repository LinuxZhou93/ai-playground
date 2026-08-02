"use client";

import {
  Activity,
  ArrowRight,
  BadgeCheck,
  BrainCircuit,
  Camera,
  Check,
  CheckCircle2,
  ChevronRight,
  CircleDot,
  Clock3,
  Cpu,
  FileSignature,
  GraduationCap,
  Hand,
  HeartPulse,
  Lightbulb,
  Mic2,
  MonitorPlay,
  Pause,
  Play,
  RefreshCw,
  RotateCcw,
  ShieldCheck,
  Sparkles,
  UsersRound,
  WandSparkles,
  X,
} from "lucide-react";
import { useMemo } from "react";
import {
  getTeachingEfficiency,
  XMP_TEACHING_STAGE_LABELS,
  type XmpTeachingDeviceRole,
  type XmpTeachingPlanBeat,
} from "@/lib/xmp/teaching-workbench";
import { useXmpEvents, XMP_DEMO_CORRELATION_ID } from "./event-store";
import { useXmpTeachingWorkbench } from "./teaching-workbench-store";

const stageOrder = [
  "prepare",
  "prepared",
  "ready",
  "live",
  "review",
  "signed",
] as const;

const deviceIcons: Record<XmpTeachingDeviceRole, typeof Cpu> = {
  edge: Cpu,
  camera: Camera,
  microphone: Mic2,
  display: MonitorPlay,
  companions: Sparkles,
};

const trendLabel = { up: "参与上升", steady: "保持稳定", down: "需要关注" };

export function AiTeachingWorkbench() {
  const { workbench, issueCommand, resetWorkbench } = useXmpTeachingWorkbench();
  const { emit } = useXmpEvents();
  const efficiency = getTeachingEfficiency(workbench);
  const activeBeat =
    workbench.beats.find((item) => item.id === workbench.activeBeatId) ??
    workbench.beats[0];
  const currentStageIndex = stageOrder.findIndex((item) => {
    if (workbench.stage === "paused") return item === "live";
    return item === workbench.stage;
  });
  const confirmedEvidence = workbench.evidence.filter(
    (item) => item.teacherConfirmed,
  );
  const pendingCues = workbench.cues.filter(
    (item) => item.status === "pending",
  );
  const criticalProblem = workbench.devices.find(
    (item) => item.critical && item.status !== "ready",
  );

  const averageParticipation = useMemo(
    () =>
      Math.round(
        workbench.groupPulses.reduce(
          (total, group) => total + group.participation,
          0,
        ) / workbench.groupPulses.length,
      ),
    [workbench.groupPulses],
  );

  const emitTeaching = (
    kind:
      | "teaching.prepared"
      | "teaching.started"
      | "teaching.cue_decided"
      | "teaching.evidence_confirmed"
      | "teaching.reflection_signed",
    title: string,
    detail: string,
    entity: string,
  ) => {
    emit({
      correlationId: XMP_DEMO_CORRELATION_ID,
      kind,
      domain: "teaching",
      title,
      detail,
      actor: "文老师",
      entity,
      privacy: "teacher-reviewed",
    });
  };

  const generatePreparation = () => {
    issueCommand("prep.generate");
    emitTeaching(
      "teaching.prepared",
      "AI 课前教学包生成",
      "基于 v3.3.0 签名课程版本生成目标、节拍和设备动作；教师可继续编辑。",
      "会呼吸的种子 · 课前包",
    );
  };

  const startSession = () => {
    issueCommand("session.start");
    emitTeaching(
      "teaching.started",
      "教师启动数字化课堂",
      "课程、排课、设备与物料完成联检；AI 仅进入建议模式。",
      "大一班 · A-301",
    );
  };

  const decideCue = (cueId: string, accepted: boolean) => {
    const cue = workbench.cues.find((item) => item.id === cueId);
    issueCommand(accepted ? "cue.accept" : "cue.dismiss", {
      actorId: "principal-teacher",
      payload: { cueId },
    });
    if (cue)
      emitTeaching(
        "teaching.cue_decided",
        `教师${accepted ? "采用" : "忽略"}课堂建议`,
        `${cue.title}；决定权与教学责任保留在教师。`,
        cue.title,
      );
  };

  const captureEvidence = (groupId: string, label: string) => {
    const fact = `${label}通过轮流表达形成了两种可验证的解释，并主动引用观察事实。`;
    issueCommand("evidence.capture", {
      actorId: "principal-teacher",
      payload: { groupId, fact },
    });
    emitTeaching(
      "teaching.evidence_confirmed",
      "教师确认匿名课堂事实",
      `${label}的可观察事实进入课后复盘；不含姓名、人脸或诊断。`,
      `${label} · 匿名小组证据`,
    );
  };

  const signReflection = () => {
    issueCommand("reflection.sign");
    emitTeaching(
      "teaching.reflection_signed",
      "教师签发教学复盘",
      "AI 仅整理结构化事件，复盘结论由本班教师确认。",
      "第 31 周课堂复盘",
    );
  };

  return (
    <div className="xmp-ai-teaching">
      <section className="xmp-teaching-hero">
        <div className="xmp-teaching-hero-copy">
          <span>AI TEACHING COCKPIT · 教师主导</span>
          <h1>
            把老师的一节课，从 48 分钟备课到课堂复盘，连成一条数字化工作流。
          </h1>
          <p>
            深度连接课程资产、签名排课、课堂大屏、视觉感知、拾音阵列、边缘中枢与
            6 台奇妙宠。AI
            负责准备、感知和整理，教师始终决定教什么、何时调整、什么可以进入成长证据。
          </p>
        </div>
        <div className="xmp-teaching-hero-action">
          <div
            className={`xmp-teaching-live-state ${workbench.stage}`}
            data-testid="teaching-stage"
          >
            <i />
            <span>
              <small>当前教学状态</small>
              <b>{XMP_TEACHING_STAGE_LABELS[workbench.stage]}</b>
            </span>
          </div>
          <button onClick={resetWorkbench} aria-label="重置教学演示">
            <RotateCcw size={15} /> 重置本节课
          </button>
        </div>
      </section>

      <section
        className="xmp-teaching-trust-strip"
        aria-label="教学数据安全边界"
      >
        <span>
          <Cpu size={14} /> 边缘端推理
        </span>
        <span>
          <Camera size={14} /> 原始视频不上传
        </span>
        <span>
          <UsersRound size={14} /> 只看匿名小组趋势
        </span>
        <span>
          <ShieldCheck size={14} /> 教学辅助 · 非诊断
        </span>
        <b>LOCAL DEMO</b>
      </section>

      <section className="xmp-teaching-kpis">
        <article>
          <span className="mint">
            <Clock3 size={17} />
          </span>
          <div>
            <small>本节课预计节省备课时间</small>
            <b>
              {efficiency.preparationMinutesSaved || "—"}
              <em> 分钟</em>
            </b>
          </div>
          <p>演示口径 · 48 → 12</p>
        </article>
        <article>
          <span className="blue">
            <Cpu size={17} />
          </span>
          <div>
            <small>教学设备在线</small>
            <b>
              {efficiency.connectedDeviceCount}
              <em> / 5 组</em>
            </b>
          </div>
          <p>边缘、视觉、音频、大屏、萌宠</p>
        </article>
        <article>
          <span className="amber">
            <Activity size={17} />
          </span>
          <div>
            <small>匿名小组参与脉冲</small>
            <b>
              {averageParticipation}
              <em>%</em>
            </b>
          </div>
          <p>非个人评分 · 仅辅助巡班</p>
        </article>
        <article>
          <span className="lilac">
            <BadgeCheck size={17} />
          </span>
          <div>
            <small>教师确认事实证据</small>
            <b>
              {efficiency.confirmedEvidenceCount}
              <em> 条</em>
            </b>
          </div>
          <p>未经确认不进入成长档案</p>
        </article>
      </section>

      <section className="xmp-teaching-workspace">
        <aside className="xmp-teaching-flow">
          <header>
            <span>ONE LESSON FLOW</span>
            <h2>一节课的数字化链路</h2>
          </header>
          <ol>
            {stageOrder.map((stage, index) => {
              const complete = index < currentStageIndex;
              const active = index === currentStageIndex;
              return (
                <li
                  key={stage}
                  className={`${complete ? "complete" : ""} ${active ? "active" : ""}`}
                >
                  <span>{complete ? <Check size={13} /> : index + 1}</span>
                  <div>
                    <b>{XMP_TEACHING_STAGE_LABELS[stage]}</b>
                    <small>
                      {stage === "prepare"
                        ? "课程目标与材料"
                        : stage === "prepared"
                          ? "AI 生成、教师可改"
                          : stage === "ready"
                            ? "课程/人/场/设备/物料"
                            : stage === "live"
                              ? "教师掌舵、多端协作"
                              : stage === "review"
                                ? "事实证据与反思"
                                : "教师签名归档"}
                    </small>
                  </div>
                </li>
              );
            })}
          </ol>
          <div className="xmp-teaching-course-lock">
            <span>
              <FileSignature size={15} /> 已锁定教学资产
            </span>
            <h3>《{workbench.course.title}》</h3>
            <p>
              {workbench.course.release} · {workbench.roomLabel}
            </p>
            <code>{workbench.course.releaseSignature}</code>
            <code>{workbench.course.scheduleSignature}</code>
          </div>
        </aside>

        <main className="xmp-teaching-stage">
          <TeachingStageHeader
            stage={workbench.stage}
            teacherTakeover={workbench.teacherTakeover}
          />

          {workbench.stage === "prepare" && (
            <section className="xmp-teaching-prep-panel">
              <div className="xmp-teaching-prep-intro">
                <span>
                  <WandSparkles size={16} /> AI 课前准备
                </span>
                <h2>把课程版本变成今天可执行的一节课。</h2>
                <p>
                  自动读取课程目标、签名排课、设备能力与物料清单，生成教学节拍和各终端动作。生成结果必须由文老师确认后使用。
                </p>
              </div>
              <div className="xmp-teaching-objectives">
                <small>本节课目标</small>
                {workbench.preparation.objectives.map((objective, index) => (
                  <p key={objective}>
                    <span>0{index + 1}</span> {objective}
                  </p>
                ))}
              </div>
              <button
                className="xmp-teaching-primary"
                onClick={generatePreparation}
                data-testid="generate-teaching-prep"
              >
                <Sparkles size={16} /> 生成教师可编辑教学包
                <ArrowRight size={15} />
              </button>
            </section>
          )}

          {workbench.stage === "prepared" && (
            <section className="xmp-teaching-readiness">
              <div className="xmp-teaching-ready-head">
                <span>
                  <CheckCircle2 size={17} /> 教学包生成完成
                </span>
                <h2>不是“生成完”就上课，还要通过五项课堂就绪。</h2>
              </div>
              <div className="xmp-teaching-five-ready">
                {[
                  ["课程", `${workbench.course.release} 已签名`],
                  ["教师", "文老师 · 本班可信身份"],
                  ["空间", `${workbench.roomLabel} 已锁定`],
                  ["设备", "5 组教学设备心跳正常"],
                  ["物料", "种子探究材料包 × 6"],
                ].map(([label, value]) => (
                  <article key={label}>
                    <Check size={14} />
                    <div>
                      <b>{label}</b>
                      <small>{value}</small>
                    </div>
                  </article>
                ))}
              </div>
              <TeachingBeats beats={workbench.beats} />
              <button
                className="xmp-teaching-primary"
                onClick={() => issueCommand("readiness.verify")}
                data-testid="verify-teaching-readiness"
              >
                <BadgeCheck size={16} /> 教师确认五项就绪
                <ArrowRight size={15} />
              </button>
            </section>
          )}

          {workbench.stage === "ready" && (
            <section className="xmp-teaching-launch">
              <div className="xmp-teaching-launch-orbit">
                <span className="center">
                  <GraduationCap size={29} />
                </span>
                <span className="node one">
                  <Camera size={16} />
                </span>
                <span className="node two">
                  <Mic2 size={16} />
                </span>
                <span className="node three">
                  <MonitorPlay size={16} />
                </span>
                <span className="node four">
                  <Sparkles size={16} />
                </span>
              </div>
              <span>ALL SYSTEMS READY</span>
              <h2>设备已经就绪，但课堂只能由教师开始。</h2>
              <p>
                启动后 AI
                进入建议模式，不会自动推进节拍、评价儿童或写入成长档案。
              </p>
              <button
                className="xmp-teaching-primary"
                onClick={startSession}
                data-testid="start-teaching-session"
              >
                <Play size={16} /> 文老师开始课堂
              </button>
            </section>
          )}

          {(workbench.stage === "live" || workbench.stage === "paused") && (
            <section className="xmp-teaching-live-console">
              {workbench.stage === "paused" && (
                <div className="xmp-teaching-safety-pause">
                  <Pause size={18} />
                  <div>
                    <b>关键教学设备异常，课堂已安全暂停。</b>
                    <small>AI 已关闭。设备恢复后仍需文老师明确继续课堂。</small>
                  </div>
                </div>
              )}
              <div className="xmp-teaching-current-beat">
                <header>
                  <span>NOW TEACHING · {activeBeat.durationMinutes} MIN</span>
                  <b>
                    {workbench.teacherTakeover ? "教师接管" : "AI 建议模式"}
                  </b>
                </header>
                <h2>{activeBeat.title}</h2>
                <div>
                  <article>
                    <GraduationCap size={17} />
                    <span>
                      <small>教师动作</small>
                      <b>{activeBeat.teacherMove}</b>
                    </span>
                  </article>
                  <article>
                    <BrainCircuit size={17} />
                    <span>
                      <small>设备协作</small>
                      <b>{activeBeat.deviceMove}</b>
                    </span>
                  </article>
                </div>
                {workbench.stage === "live" && (
                  <div className="xmp-teaching-live-actions">
                    <button
                      onClick={() => issueCommand("beat.advance")}
                      data-testid="advance-teaching-beat"
                    >
                      推进下一节拍 <ChevronRight size={15} />
                    </button>
                    <button
                      className={
                        workbench.teacherTakeover ? "release" : "takeover"
                      }
                      onClick={() =>
                        issueCommand(
                          workbench.teacherTakeover
                            ? "teacher.release"
                            : "teacher.takeover",
                        )
                      }
                    >
                      <Hand size={15} />
                      {workbench.teacherTakeover ? "释放接管" : "教师接管"}
                    </button>
                  </div>
                )}
              </div>

              {workbench.stage === "live" && (
                <div className="xmp-teaching-cues">
                  <header>
                    <div>
                      <span>AI COPILOT · 只提供建议</span>
                      <h3>此刻值得教师注意的两件事</h3>
                    </div>
                    <b>{pendingCues.length} 待处理</b>
                  </header>
                  {workbench.cues.map((cue) => (
                    <article key={cue.id} className={cue.status}>
                      <span className="icon">
                        <Lightbulb size={17} />
                      </span>
                      <div>
                        <small>
                          {cue.source} · {cue.confidence} confidence
                        </small>
                        <h4>{cue.title}</h4>
                        <p>{cue.rationale}</p>
                      </div>
                      {cue.status === "pending" ? (
                        <aside>
                          <button
                            aria-label={`采用建议：${cue.title}`}
                            onClick={() => decideCue(cue.id, true)}
                            data-testid={
                              cue.id === "cue-clarify"
                                ? "accept-teaching-cue"
                                : undefined
                            }
                          >
                            <Check size={14} /> 采用
                          </button>
                          <button
                            aria-label={`忽略建议：${cue.title}`}
                            onClick={() => decideCue(cue.id, false)}
                          >
                            <X size={14} /> 忽略
                          </button>
                        </aside>
                      ) : (
                        <em>
                          {cue.status === "accepted"
                            ? "教师已采用"
                            : "教师已忽略"}
                        </em>
                      )}
                    </article>
                  ))}
                </div>
              )}

              {workbench.stage === "paused" && criticalProblem && (
                <div className="xmp-teaching-recovery">
                  <b>{criticalProblem.name}</b>
                  <span>{criticalProblem.status} · AI OFF</span>
                  <button
                    onClick={() =>
                      issueCommand("device.restore", {
                        actorId: "edge-policy",
                        payload: { deviceId: criticalProblem.id },
                      })
                    }
                  >
                    <RefreshCw size={14} /> 模拟可信心跳恢复
                  </button>
                  <button
                    disabled={Boolean(criticalProblem)}
                    onClick={() => issueCommand("session.resume")}
                  >
                    <Play size={14} /> 教师继续课堂
                  </button>
                </div>
              )}

              {workbench.stage === "paused" && !criticalProblem && (
                <button
                  className="xmp-teaching-primary"
                  onClick={() => issueCommand("session.resume")}
                  data-testid="resume-teaching-session"
                >
                  <Play size={16} /> 文老师确认继续课堂
                </button>
              )}

              {workbench.stage === "live" && (
                <button
                  className="xmp-teaching-end"
                  onClick={() => issueCommand("session.end")}
                  data-testid="end-teaching-session"
                >
                  结束课堂并进入教师复盘 <ArrowRight size={15} />
                </button>
              )}
            </section>
          )}

          {(workbench.stage === "review" || workbench.stage === "signed") && (
            <section className="xmp-teaching-reflection">
              <div className="xmp-teaching-reflection-head">
                <span>
                  <FileSignature size={17} /> POST-CLASS REFLECTION
                </span>
                <h2>AI 整理事实，教师形成教学判断。</h2>
                <p>
                  本地边缘端只保留匿名结构化事件。没有教师确认的内容不会进入成长档案、家长端或下一轮课程。
                </p>
              </div>
              <div className="xmp-teaching-reflection-grid">
                <article>
                  <small>AI 复盘草稿</small>
                  <p>{workbench.reflection.draft}</p>
                  <span>可编辑 · 尚不代表教师结论</span>
                </article>
                <article>
                  <small>教师确认的事实证据</small>
                  {confirmedEvidence.length ? (
                    confirmedEvidence.map((evidence) => (
                      <p key={evidence.id}>
                        <Check size={13} /> {evidence.fact}
                      </p>
                    ))
                  ) : (
                    <p className="empty">尚无教师确认事实，不能签发复盘。</p>
                  )}
                </article>
              </div>
              {workbench.stage === "review" ? (
                <button
                  className="xmp-teaching-primary"
                  disabled={!confirmedEvidence.length}
                  onClick={signReflection}
                  data-testid="sign-teaching-reflection"
                >
                  <FileSignature size={16} /> 文老师确认并签发复盘
                </button>
              ) : (
                <div className="xmp-teaching-signed">
                  <BadgeCheck size={23} />
                  <div>
                    <b>教学复盘已由文老师签发</b>
                    <small>{workbench.reflection.teacherSignedAt}</small>
                  </div>
                </div>
              )}
            </section>
          )}

          <section className="xmp-teaching-pulses">
            <header>
              <div>
                <span>ANONYMOUS LEARNING PULSE</span>
                <h3>小组学情不是儿童评分，而是教师巡班的第二双眼睛。</h3>
              </div>
              <small>边缘推理 · 4 个匿名小组 · 非诊断</small>
            </header>
            <div>
              {workbench.groupPulses.map((group) => (
                <article key={group.id} className={group.trend}>
                  <header>
                    <b>{group.label}</b>
                    <span>{group.participation}%</span>
                  </header>
                  <div className="xmp-teaching-pulse-bar">
                    <i style={{ width: `${group.participation}%` }} />
                  </div>
                  <p>{group.observedState}</p>
                  <small>
                    {trendLabel[group.trend]} · {group.samples} 个结构化样本
                  </small>
                  {workbench.stage === "live" && (
                    <button
                      onClick={() => captureEvidence(group.id, group.label)}
                      data-testid={
                        group.id === "group-a"
                          ? "capture-teaching-evidence"
                          : undefined
                      }
                    >
                      <CircleDot size={12} /> 教师记录事实
                    </button>
                  )}
                </article>
              ))}
            </div>
          </section>
        </main>

        <aside className="xmp-teaching-infrastructure">
          <header>
            <span>SMART CLASSROOM</span>
            <h2>五组设备，一套教学现场</h2>
            <p>所有设备服务于教师教学，不是独立的数据采集系统。</p>
          </header>
          <div className="xmp-teaching-device-list">
            {workbench.devices.map((device) => {
              const Icon = deviceIcons[device.role];
              return (
                <article key={device.id} className={device.status}>
                  <span>
                    <Icon size={16} />
                  </span>
                  <div>
                    <b>{device.name}</b>
                    <small>{device.privacyMode}</small>
                  </div>
                  <i />
                </article>
              );
            })}
          </div>
          <section className="xmp-teaching-privacy-card">
            <span>
              <ShieldCheck size={17} /> 数据边界
            </span>
            <ul>
              <li>
                <Check size={12} /> 原始音视频不上传
              </li>
              <li>
                <Check size={12} /> 不生成儿童排名
              </li>
              <li>
                <Check size={12} /> 不作医学或心理诊断
              </li>
              <li>
                <Check size={12} /> 教师确认后才入档
              </li>
            </ul>
          </section>
          <section className="xmp-teaching-proof-card">
            <span>
              <HeartPulse size={16} /> 教学价值证据
            </span>
            <div>
              <p>
                <b>{efficiency.preparationMinutesSaved || 0}</b>
                <small>备课分钟节省</small>
              </p>
              <p>
                <b>{efficiency.acceptedCueCount}</b>
                <small>教师采用建议</small>
              </p>
              <p>
                <b>{confirmedEvidence.length}</b>
                <small>确认事实证据</small>
              </p>
            </div>
            <small>全部为本地演示过程数据，不代表真实园所成效。</small>
          </section>
        </aside>
      </section>
    </div>
  );
}

function TeachingStageHeader({
  stage,
  teacherTakeover,
}: {
  stage: keyof typeof XMP_TEACHING_STAGE_LABELS;
  teacherTakeover: boolean;
}) {
  return (
    <header className="xmp-teaching-stage-head">
      <div>
        <span>文老师 · 大一班 · 第 31 周</span>
        <h2>{XMP_TEACHING_STAGE_LABELS[stage]}</h2>
      </div>
      <div className={teacherTakeover ? "takeover" : "copilot"}>
        {teacherTakeover ? <Hand size={14} /> : <BrainCircuit size={14} />}
        {teacherTakeover ? "教师全接管" : "AI 只建议"}
      </div>
    </header>
  );
}

function TeachingBeats({ beats }: { beats: XmpTeachingPlanBeat[] }) {
  return (
    <div className="xmp-teaching-beats-preview">
      <small>AI 生成的教学节拍 · 教师可修改</small>
      {beats.map((beat, index) => (
        <article key={beat.id}>
          <span>{String(index + 1).padStart(2, "0")}</span>
          <div>
            <b>{beat.title}</b>
            <small>{beat.teacherMove}</small>
          </div>
          <em>{beat.durationMinutes} min</em>
        </article>
      ))}
    </div>
  );
}
