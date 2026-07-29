"use client";

import {
  Activity,
  Bot,
  Camera,
  Check,
  CheckCircle2,
  ChevronRight,
  CircleAlert,
  Clock3,
  EyeOff,
  Glasses,
  Gauge,
  Hand,
  Layers3,
  Lightbulb,
  Mic2,
  MonitorUp,
  Network,
  Pause,
  Play,
  Radio,
  RefreshCw,
  Send,
  ShieldCheck,
  Sparkles,
  Tablet,
  UsersRound,
  Volume2,
  Wifi,
  X,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import type {
  XmpInterventionKind,
  XmpTeachingScene,
  XmpTeachingSignalWindow,
} from "@/lib/xmp/classroom-orchestration";
import { useXmpClassroomRuntime } from "./classroom-runtime-store";
import { useXmpClassroomOrchestration } from "./classroom-orchestration-store";
import { useXmpCourseAssets } from "./course-asset-store";
import { useXmpTeachingStrategies } from "./teaching-strategy-store";
import { useXmpEvents, XMP_DEMO_CORRELATION_ID } from "./event-store";

const kindMeta: Record<
  XmpInterventionKind,
  { label: string; icon: typeof Activity }
> = {
  pace: { label: "课堂节奏", icon: Clock3 },
  question: { label: "教师追问", icon: Lightbulb },
  participation: { label: "群体参与", icon: UsersRound },
  materials: { label: "材料流动", icon: Layers3 },
  safety: { label: "现场安全", icon: ShieldCheck },
};

const statusLabel = {
  proposed: "待教师决定",
  accepted: "教师已采纳",
  edited: "教师已修改",
  applied: "已用于课堂",
  dismissed: "教师已忽略",
  expired: "时窗已过期",
};

const deviceIcon = {
  "teacher-console": Tablet,
  display: MonitorUp,
  "edge-hub": Network,
  "companion-group": Bot,
};

function formatClock(value: string) {
  return new Date(value).toLocaleTimeString("zh-CN", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

function signalSourceLabel(source: XmpTeachingSignalWindow["sources"][number]) {
  return {
    "fixed-camera": "教室固定摄像头",
    "rokid-glasses": "Rokid 教师第一视角",
    "companion-camera": "桌宠近场摄像头",
    "companion-mic": "桌宠语音",
    "companion-touch": "桌宠触摸 / 材料操作",
    "teacher-voice": "教师语音指令",
    "anonymous-response-pads": "匿名回应板",
    "material-stations": "材料观察站",
    "teacher-console": "教师控制端",
  }[source];
}

const sceneMeta: Record<XmpTeachingScene, { label: string; note: string }> = {
  collective: { label: "集体教学", note: "全班节奏、提问与表达覆盖" },
  "learning-corner": { label: "区域活动", note: "材料操作、协作与教师巡回" },
  outdoor: { label: "户外运动", note: "动作参与、空间安全与即时指导" },
  life: { label: "生活活动", note: "自主服务、习惯养成与个别支持" },
};

export function ClassroomOrchestrationCenter() {
  const { emit } = useXmpEvents();
  const { runtime, issueTeacherCommand } = useXmpClassroomRuntime();
  const { catalog } = useXmpCourseAssets();
  const { library } = useXmpTeachingStrategies();
  const {
    orchestration,
    classroomContext,
    lastResult,
    ingestSignal,
    acceptIntervention,
    editIntervention,
    applyIntervention,
    dismissIntervention,
    selectScene,
    reviewEvidence,
    resetOrchestration,
  } = useXmpClassroomOrchestration();
  const [selectedSignalId, setSelectedSignalId] = useState(
    orchestration.signalWindows[0]?.id ?? "",
  );
  const [selectedInterventionId, setSelectedInterventionId] = useState(
    orchestration.interventions[0]?.id ?? "",
  );
  const [teacherAction, setTeacherAction] = useState("");
  const [evidenceNotes, setEvidenceNotes] = useState<Record<string, string>>(
    {},
  );

  const pinnedCourse =
    catalog.versions.find(
      (version) => version.id === catalog.classroomPinnedVersionId,
    ) ?? catalog.versions[0];
  const activePhase =
    pinnedCourse?.phases[
      Math.min(runtime.activeStep, Math.max(pinnedCourse.phases.length - 1, 0))
    ];
  const questionPhaseIndex = Math.max(
    pinnedCourse?.phases.findIndex((phase) => phase.id === "question") ?? 1,
    0,
  );
  const selectedSignal =
    orchestration.signalWindows.find((item) => item.id === selectedSignalId) ??
    orchestration.signalWindows[0];
  const signalInterventions = useMemo(
    () =>
      orchestration.interventions.filter(
        (item) => item.signalWindowId === selectedSignal?.id,
      ),
    [orchestration.interventions, selectedSignal?.id],
  );
  const selectedIntervention =
    orchestration.interventions.find(
      (item) => item.id === selectedInterventionId,
    ) ?? signalInterventions[0];
  const approvedStrategies = library.strategies.filter(
    (strategy) => strategy.status === "approved",
  );
  const onlineDevices = runtime.devices.filter(
    (device) => device.connection === "online",
  ).length;

  useEffect(() => {
    if (selectedIntervention)
      setTeacherAction(selectedIntervention.teacherAction);
  }, [selectedIntervention?.id, selectedIntervention?.teacherAction]);

  useEffect(() => {
    if (
      selectedIntervention &&
      selectedIntervention.signalWindowId !== selectedSignal?.id
    ) {
      setSelectedInterventionId(signalInterventions[0]?.id ?? "");
    }
  }, [selectedSignal?.id, selectedIntervention, signalInterventions]);

  const liveReady =
    runtime.lifecycle === "live" &&
    runtime.health !== "offline" &&
    runtime.safetyMode === "normal";
  const phaseAligned = selectedIntervention?.phaseId === activePhase?.id;

  const enterDemoLesson = () => {
    if (runtime.lifecycle === "ended") return;
    if (runtime.safetyMode === "quiet")
      issueTeacherCommand("safety.quiet.disable");
    if (runtime.safetyMode === "teacher-control")
      issueTeacherCommand("safety.release");
    if (runtime.lifecycle === "preflight") issueTeacherCommand("session.start");
    if (runtime.lifecycle === "paused") issueTeacherCommand("session.resume");
    issueTeacherCommand("step.select", {
      step: questionPhaseIndex,
      maxStep: pinnedCourse?.phases.length ? pinnedCourse.phases.length - 1 : 5,
    });
    emit({
      correlationId: XMP_DEMO_CORRELATION_ID,
      kind: "orchestration.session_aligned",
      domain: "orchestration",
      title: "教师进入智慧课堂感知阶段",
      detail:
        "课堂已由教师启动并定位到问题建构节拍，三端采集在园所边缘中枢完成融合。",
      actor: runtime.teacher.displayName,
      entity: `${pinnedCourse?.title ?? "当前课程"} · 问题建构`,
      privacy: "aggregate",
    });
  };

  const createNextWindow = () => {
    const sequence = orchestration.signalWindows.length + 1;
    const now = new Date().toISOString();
    const strongerParticipation = sequence % 2 === 0;
    const signalWindow: XmpTeachingSignalWindow = {
      id: `signal-live-${Date.now()}`,
      sessionId: orchestration.sessionId,
      phaseId: activePhase?.id ?? "unknown",
      phaseTitle: activePhase?.title ?? "当前教学阶段",
      observedAt: now,
      windowSeconds: 90,
      scene: orchestration.activeScene,
      scope: "multi-end-fusion",
      retention: "metrics-24h-evidence-pending-review",
      rawMediaRetained: false,
      sources: [
        "fixed-camera",
        "rokid-glasses",
        "companion-camera",
        "companion-mic",
        "companion-touch",
        "teacher-voice",
        "anonymous-response-pads",
        "material-stations",
        "teacher-console",
      ],
      coverage: [
        {
          source: "fixed-camera",
          label: "教室双机位",
          status: "live",
          coverage: 94,
          observation: "持续覆盖全班移动与同伴互动变化",
          blindSpot: "缺少教师第一视角的语境",
        },
        {
          source: "rokid-glasses",
          label: "教师 Rokid",
          status: "live",
          coverage: 76,
          observation: "补充近场表达、教师关注点和口头指令",
          blindSpot: "视野外区域由固定机位补全",
        },
        {
          source: "companion-touch",
          label: "桌宠近场",
          status: "live",
          coverage: strongerParticipation ? 72 : 61,
          observation: "采集儿童语音、触摸和材料操作事件",
          blindSpot: "仅覆盖当前桌宠互动区域",
        },
      ],
      evidenceCandidates: [
        {
          id: `evidence-live-${Date.now()}`,
          childRef: strongerParticipation ? "C03" : "A07",
          consent: "authorized",
          purpose: "growth-evidence",
          curriculumTarget: "能在同伴交流中说出观察依据",
          observation: strongerParticipation
            ? "桌宠记录到完整表达，Rokid 第一视角确认其向同伴展示材料。"
            : "桌宠记录到关键词表达，固定机位观察到材料重新分类动作。",
          hypothesis:
            "可能形成了从观察特征到解释分类依据的学习进展，等待教师核实。",
          sources: strongerParticipation
            ? ["companion-mic", "rokid-glasses"]
            : ["companion-mic", "companion-touch", "fixed-camera"],
          sourceAgreement: "corroborated",
          confidence: strongerParticipation ? 91 : 83,
          capturedAt: now,
          expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
          rawMedia: "edge-ring-buffer",
          status: "candidate",
          teacherNote: null,
        },
      ],
      metrics: {
        participationCoverage: strongerParticipation ? 76 : 64,
        peerResponseCount: strongerParticipation ? 8 : 4,
        openQuestionCount: 3,
        averageWaitSeconds: strongerParticipation ? 6.2 : 3.1,
        ambientLevelDb: 67,
        activeMaterialStations: strongerParticipation ? 2 : 1,
        anonymousResponses: 19,
      },
    };
    ingestSignal(signalWindow);
    setSelectedSignalId(signalWindow.id);
    emit({
      correlationId: XMP_DEMO_CORRELATION_ID,
      kind: "orchestration.signal_formed",
      domain: "orchestration",
      title: "形成 90 秒匿名课堂信号",
      detail:
        "摄像头、Rokid 与桌宠数据在边缘侧完成时序对齐；原始媒体仅进入本地环形缓存，个体证据需教师审核。",
      actor: "园所边缘中枢 E-01",
      entity: activePhase?.title ?? "当前教学阶段",
      privacy: "aggregate",
    });
  };

  const acceptSelected = () => {
    if (!selectedIntervention) return;
    acceptIntervention(selectedIntervention.id);
    emit({
      correlationId: XMP_DEMO_CORRELATION_ID,
      kind: "orchestration.intervention_decided",
      domain: "orchestration",
      title: "教师采纳现场教学建议",
      detail: selectedIntervention.suggestedAction,
      actor: runtime.teacher.displayName,
      entity: selectedIntervention.title,
      privacy: "teacher-reviewed",
    });
  };

  const saveTeacherEdit = () => {
    if (!selectedIntervention) return;
    editIntervention(selectedIntervention.id, teacherAction);
    emit({
      correlationId: XMP_DEMO_CORRELATION_ID,
      kind: "orchestration.intervention_decided",
      domain: "orchestration",
      title: "教师修改现场教学动作",
      detail: teacherAction,
      actor: runtime.teacher.displayName,
      entity: selectedIntervention.title,
      privacy: "teacher-reviewed",
    });
  };

  const applySelected = () => {
    if (!selectedIntervention) return;
    applyIntervention(selectedIntervention.id);
    if (!liveReady || !phaseAligned) return;
    emit({
      correlationId: XMP_DEMO_CORRELATION_ID,
      kind: "orchestration.intervention_applied",
      domain: "orchestration",
      title: "教师将教学动作应用到课堂",
      detail: selectedIntervention.teacherAction,
      actor: runtime.teacher.displayName,
      entity: activePhase?.title ?? selectedIntervention.title,
      privacy: "teacher-reviewed",
    });
  };

  const statusCopy = useMemo(() => {
    if (runtime.health === "offline") return "关键设备离线 · AI 建议已停用";
    if (runtime.safetyMode !== "normal") return "教师安全接管 · AI 建议已停用";
    if (runtime.lifecycle !== "live") return "等待教师开始课堂";
    return "三端感知运行中 · 教师拥有最终决定权";
  }, [runtime.health, runtime.lifecycle, runtime.safetyMode]);

  return (
    <div className="xmp-orchestration">
      <header className="xmp-orchestration-hero">
        <div>
          <span>SMART CLASSROOM ORCHESTRATION</span>
          <h1>智慧课堂感知中枢</h1>
          <p>
            桌宠、教室摄像头与教师 Rokid 眼镜共同理解课堂：AI
            在边缘侧融合多模态证据，提示教师调整教学，并驱动桌宠完成现场互动。
          </p>
        </div>
        <div className="xmp-orchestration-hero-actions">
          <span className={liveReady ? "live" : "waiting"}>
            <Radio size={13} /> {statusCopy}
          </span>
          <button
            data-testid="prepare-orchestration-session"
            onClick={enterDemoLesson}
            disabled={runtime.lifecycle === "ended"}
          >
            {liveReady && activePhase?.id === "question" ? (
              <Check size={15} />
            ) : (
              <Play size={15} />
            )}
            {liveReady && activePhase?.id === "question"
              ? "课堂已就绪"
              : "进入演示课堂"}
          </button>
        </div>
      </header>

      <section className="xmp-orchestration-boundary">
        <div>
          <EyeOff size={16} />
          <p>
            <b>采集不是监控，算法观察不是事实。</b>
            原始媒体只在教室边缘环形缓存；个体证据必须有授权、有教学目的、有来源，并经教师确认才能进入成长档案。
          </p>
        </div>
        <button onClick={resetOrchestration}>
          <RefreshCw size={13} /> 重置本地演示
        </button>
      </section>

      <section className="xmp-scene-switcher" aria-label="教学场景">
        <header>
          <div>
            <span>DIGITAL TEACHING SCENES</span>
            <h2>一套系统覆盖幼儿园四类真实场景</h2>
          </div>
          <small>切换场景会同步调整采集重点、AI 观察与教师提示</small>
        </header>
        <div>
          {(Object.keys(sceneMeta) as XmpTeachingScene[]).map((scene) => (
            <button
              key={scene}
              className={orchestration.activeScene === scene ? "active" : ""}
              onClick={() => selectScene(scene)}
            >
              <b>{sceneMeta[scene].label}</b>
              <span>{sceneMeta[scene].note}</span>
            </button>
          ))}
        </div>
      </section>

      <section className="xmp-multi-end-stage">
        <header>
          <span>THREE-END PERCEPTION · EDGE FUSION</span>
          <h2>三端不是三套设备，而是一条完整教学数据链</h2>
          <p>
            每个端点补齐另外两个端点的盲区，所有观察绑定当前课程目标与教学节拍。
          </p>
        </header>
        <div className="xmp-multi-end-grid">
          <article className="camera">
            <span>
              <Camera size={22} />
            </span>
            <small>空间全景端</small>
            <h3>教室摄像头</h3>
            <p>持续覆盖全班移动、举手、同伴互动和材料区变化。</p>
            <em>看见“全场发生了什么”</em>
          </article>
          <article className="edge">
            <span>
              <Network size={22} />
            </span>
            <small>园所边缘 AI 大脑</small>
            <h3>时序对齐 · 去重 · 场景理解</h3>
            <p>融合来源、判断冲突、检查授权，只输出可解释的教学事件。</p>
            <em>原始媒体不离开园所</em>
          </article>
          <article className="rokid">
            <span>
              <Glasses size={22} />
            </span>
            <small>教师第一视角端</small>
            <h3>Rokid 教学眼镜</h3>
            <p>补充近场语境，用极简 HUD 提示教师，并接收语音 / 触控确认。</p>
            <em>看见“老师正在关注什么”</em>
          </article>
          <article className="pet">
            <span>
              <Bot size={22} />
            </span>
            <small>儿童近场交互端</small>
            <h3>奇妙伙伴桌宠</h3>
            <p>
              采集语音、触摸与材料操作，也把教师确认的策略变成儿童可感知的互动。
            </p>
            <em>理解“孩子如何表达与操作”</em>
          </article>
        </div>
        <div className="xmp-closed-loop">
          {[
            "多端采集",
            "边缘融合",
            "Rokid 提示",
            "教师确认",
            "桌宠互动",
            "摄像头复证",
          ].map((step, index) => (
            <span key={step}>
              <i>{index + 1}</i>
              {step}
              {index < 5 ? <ChevronRight size={13} /> : null}
            </span>
          ))}
        </div>
      </section>

      <section className="xmp-orchestration-context">
        <article>
          <span>
            <Sparkles size={16} />
          </span>
          <div>
            <small>签名课程</small>
            <b>{pinnedCourse?.title}</b>
          </div>
          <em>v{pinnedCourse?.semanticVersion}</em>
        </article>
        <article>
          <span>
            <Activity size={16} />
          </span>
          <div>
            <small>当前教学节拍</small>
            <b>{activePhase?.title ?? "等待课堂"}</b>
          </div>
          <em>{runtime.lifecycle === "live" ? "进行中" : "未开始"}</em>
        </article>
        <article>
          <span>
            <Wifi size={16} />
          </span>
          <div>
            <small>可信课堂设备</small>
            <b>
              {onlineDevices} / {runtime.devices.length} 在线
            </b>
          </div>
          <em className={runtime.health}>
            {runtime.health === "healthy" ? "可信" : "降级"}
          </em>
        </article>
        <article>
          <span>
            <ShieldCheck size={16} />
          </span>
          <div>
            <small>已审核教学策略</small>
            <b>{approvedStrategies.length} 条可参考</b>
          </div>
          <em>不自动套用</em>
        </article>
      </section>

      <section className="xmp-orchestration-workspace">
        <aside className="xmp-orchestration-devices">
          <header>
            <span>01 · CLASSROOM EDGE</span>
            <h2>课堂设备现场</h2>
            <p>设备服务于教学，不展示与课堂无关的运维指标。</p>
          </header>
          <div className="xmp-orchestration-device-list">
            {runtime.devices.map((device) => {
              const Icon = deviceIcon[device.kind];
              return (
                <article key={device.id} className={device.connection}>
                  <span>
                    <Icon size={17} />
                  </span>
                  <div>
                    <b>{device.name}</b>
                    <small>{device.capabilities.slice(0, 2).join(" · ")}</small>
                  </div>
                  <em>
                    {device.connection === "online"
                      ? `${device.latencyMs}ms`
                      : "离线"}
                  </em>
                </article>
              );
            })}
          </div>
          <div className="xmp-orchestration-edge-rule">
            <ShieldCheck size={16} />
            <div>
              <b>边缘侧先最小化</b>
              <p>原始数据不离开教室；只上传教师确认后的教学事件。</p>
            </div>
          </div>
        </aside>

        <main className="xmp-orchestration-signals">
          <header>
            <div>
              <span>02 · LIVE TEACHING SIGNAL</span>
              <h2>实时教学信号</h2>
            </div>
            <button
              data-testid="ingest-classroom-signal"
              onClick={createNextWindow}
              disabled={!liveReady}
            >
              <Activity size={14} /> 形成下一时窗
            </button>
          </header>

          <div className="xmp-orchestration-signal-tabs" role="tablist">
            {orchestration.signalWindows.map((signal, index) => (
              <button
                key={signal.id}
                className={selectedSignal?.id === signal.id ? "active" : ""}
                onClick={() => setSelectedSignalId(signal.id)}
              >
                <span>{index === 0 ? "最新" : `-${index * 90}s`}</span>
                <b>{signal.phaseTitle}</b>
                <small>{formatClock(signal.observedAt)}</small>
              </button>
            ))}
          </div>

          {selectedSignal ? (
            <div className="xmp-orchestration-signal-canvas">
              <div className="xmp-orchestration-signal-summary">
                <div>
                  <span>
                    <Gauge size={18} />
                  </span>
                  <div>
                    <small>群体参与覆盖</small>
                    <b>{selectedSignal.metrics.participationCoverage}%</b>
                  </div>
                </div>
                <div className="xmp-orchestration-bar">
                  <i
                    style={{
                      width: `${selectedSignal.metrics.participationCoverage}%`,
                    }}
                  />
                </div>
                <p>仅估算课堂互动分布，不对应任何儿童或小组名单。</p>
              </div>
              <div className="xmp-orchestration-metrics">
                <article>
                  <UsersRound size={15} />
                  <small>同伴回应</small>
                  <b>{selectedSignal.metrics.peerResponseCount} 次</b>
                </article>
                <article>
                  <Lightbulb size={15} />
                  <small>开放问题</small>
                  <b>{selectedSignal.metrics.openQuestionCount} 个</b>
                </article>
                <article>
                  <Clock3 size={15} />
                  <small>平均等待</small>
                  <b>{selectedSignal.metrics.averageWaitSeconds}s</b>
                </article>
                <article>
                  <Volume2 size={15} />
                  <small>环境声级</small>
                  <b>{selectedSignal.metrics.ambientLevelDb}dB</b>
                </article>
                <article>
                  <Layers3 size={15} />
                  <small>活跃材料站</small>
                  <b>{selectedSignal.metrics.activeMaterialStations} 个</b>
                </article>
                <article>
                  <Radio size={15} />
                  <small>匿名回应</small>
                  <b>{selectedSignal.metrics.anonymousResponses} 次</b>
                </article>
              </div>
              <div className="xmp-orchestration-sources">
                <header>
                  <Mic2 size={14} />
                  <b>信号来源</b>
                  <span>只保留派生指标</span>
                </header>
                <div>
                  {selectedSignal.sources.map((source) => (
                    <span key={source}>
                      <CheckCircle2 size={11} /> {signalSourceLabel(source)}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ) : null}
        </main>

        <aside className="xmp-orchestration-copilot">
          <header>
            <span>03 · TEACHER DECISION</span>
            <h2>AI 助教建议</h2>
            <p>AI 解释信号，教师决定是否采纳、修改与执行。</p>
          </header>
          <div className="xmp-orchestration-proposals">
            {signalInterventions.length ? (
              signalInterventions.map((item) => {
                const meta = kindMeta[item.kind];
                const Icon = meta.icon;
                return (
                  <button
                    key={item.id}
                    className={`${item.status} ${selectedIntervention?.id === item.id ? "active" : ""}`}
                    onClick={() => setSelectedInterventionId(item.id)}
                  >
                    <span>
                      <Icon size={15} />
                    </span>
                    <div>
                      <small>{meta.label}</small>
                      <b>{item.title}</b>
                    </div>
                    <em>{statusLabel[item.status]}</em>
                  </button>
                );
              })
            ) : (
              <div className="xmp-orchestration-no-proposal">
                <CheckCircle2 size={21} />
                <b>本时窗无需额外干预</b>
                <p>课堂信号处于预期范围，教师可继续当前节拍。</p>
              </div>
            )}
          </div>

          {selectedIntervention ? (
            <div className="xmp-orchestration-decision">
              <div className="xmp-orchestration-rationale">
                <small>为什么出现这条建议</small>
                <p>{selectedIntervention.rationale}</p>
                <span>
                  置信度 {selectedIntervention.confidence}% · 仅供教师参考
                </span>
              </div>
              <label>
                <span>教师最终动作</span>
                <textarea
                  value={teacherAction}
                  onChange={(event) => setTeacherAction(event.target.value)}
                  disabled={["applied", "dismissed", "expired"].includes(
                    selectedIntervention.status,
                  )}
                />
              </label>
              <div className="xmp-orchestration-decision-actions">
                {selectedIntervention.status === "proposed" ? (
                  <button
                    data-testid="accept-classroom-intervention"
                    className="primary"
                    onClick={acceptSelected}
                  >
                    <Check size={14} /> 采纳建议
                  </button>
                ) : null}
                {["proposed", "accepted", "edited"].includes(
                  selectedIntervention.status,
                ) ? (
                  <button
                    data-testid="edit-classroom-intervention"
                    onClick={saveTeacherEdit}
                  >
                    <Hand size={14} /> 保存教师修改
                  </button>
                ) : null}
                {["accepted", "edited"].includes(
                  selectedIntervention.status,
                ) ? (
                  <button
                    data-testid="apply-classroom-intervention"
                    className="primary"
                    onClick={applySelected}
                    disabled={!liveReady || !phaseAligned}
                  >
                    <Send size={14} /> 应用到课堂
                  </button>
                ) : null}
                {["proposed", "accepted", "edited"].includes(
                  selectedIntervention.status,
                ) ? (
                  <button
                    className="quiet"
                    onClick={() => dismissIntervention(selectedIntervention.id)}
                  >
                    <X size={14} /> 忽略
                  </button>
                ) : null}
              </div>
              {!phaseAligned &&
              ["accepted", "edited"].includes(selectedIntervention.status) ? (
                <p className="xmp-orchestration-block">
                  <CircleAlert size={13} /> 请先进入“
                  {selectedSignal?.phaseTitle}
                  ”教学节拍，旧时窗建议不会跨阶段自动执行。
                </p>
              ) : null}
              {selectedIntervention.status === "applied" ? (
                <div
                  data-testid="classroom-intervention-applied"
                  className="xmp-orchestration-applied"
                >
                  <CheckCircle2 size={17} />
                  <div>
                    <b>已由{selectedIntervention.teacherName}应用</b>
                    <p>动作进入课堂事件链，课后仍需用匿名学情重新验证。</p>
                  </div>
                </div>
              ) : null}
            </div>
          ) : null}
        </aside>
      </section>

      {selectedSignal ? (
        <section className="xmp-fusion-review">
          <article className="xmp-coverage-board">
            <header>
              <div>
                <span>MULTI-SOURCE COVERAGE</span>
                <h2>多端融合覆盖</h2>
              </div>
              <em>{sceneMeta[selectedSignal.scene].label}</em>
            </header>
            <div>
              {selectedSignal.coverage.map((item) => (
                <section key={item.source}>
                  <div>
                    <b>{item.label}</b>
                    <span>{item.coverage}% 覆盖</span>
                  </div>
                  <p>{item.observation}</p>
                  <small>盲区：{item.blindSpot}</small>
                </section>
              ))}
            </div>
          </article>

          <article className="xmp-rokid-preview">
            <header>
              <span>ROKID TEACHER HUD</span>
              <h2>教师眼镜即时提示</h2>
            </header>
            <div className="xmp-rokid-screen">
              <small>09:24 · 问题建构</small>
              <span>AI 课堂助理</span>
              <b>{signalInterventions[0]?.title ?? "当前节奏稳定"}</b>
              <p>
                {signalInterventions[0]?.suggestedAction ??
                  "继续观察，不打断教师。"}
              </p>
              <div>
                <i>语音：采纳</i>
                <i>触控：稍后</i>
              </div>
            </div>
            <p>
              HUD
              只显示图标、短句和数字；详细证据留在教师工作台，避免遮挡真实课堂。
            </p>
          </article>

          <article className="xmp-evidence-board">
            <header>
              <div>
                <span>STUDENT EVIDENCE REVIEW</span>
                <h2>学生成长证据候选</h2>
              </div>
              <em>
                {
                  selectedSignal.evidenceCandidates.filter(
                    (item) => item.status === "candidate",
                  ).length
                }{" "}
                条待审核
              </em>
            </header>
            <div>
              {selectedSignal.evidenceCandidates.map((evidence) => (
                <section key={evidence.id} className={evidence.status}>
                  <div className="xmp-evidence-title">
                    <span>{evidence.childRef}</span>
                    <div>
                      <small>{evidence.curriculumTarget}</small>
                      <b>{evidence.observation}</b>
                    </div>
                    <em>{evidence.confidence}%</em>
                  </div>
                  <p>
                    <Lightbulb size={13} /> AI 假设：{evidence.hypothesis}
                  </p>
                  <div className="xmp-evidence-provenance">
                    <span>
                      <ShieldCheck size={12} /> 已单独授权
                    </span>
                    <span>
                      <Network size={12} />{" "}
                      {evidence.sourceAgreement === "corroborated"
                        ? "多源相互印证"
                        : "单一来源待核实"}
                    </span>
                    <span>
                      {evidence.sources.map(signalSourceLabel).join(" · ")}
                    </span>
                  </div>
                  {evidence.status === "candidate" ? (
                    <div className="xmp-evidence-review">
                      <input
                        aria-label={`${evidence.childRef}教师观察`}
                        placeholder="填写教师现场观察后确认…"
                        value={evidenceNotes[evidence.id] ?? ""}
                        onChange={(event) =>
                          setEvidenceNotes((current) => ({
                            ...current,
                            [evidence.id]: event.target.value,
                          }))
                        }
                      />
                      <button
                        onClick={() =>
                          reviewEvidence(
                            evidence.id,
                            "confirm",
                            evidenceNotes[evidence.id],
                          )
                        }
                      >
                        <Check size={13} />
                        确认入档
                      </button>
                      <button
                        className="quiet"
                        onClick={() => reviewEvidence(evidence.id, "reject")}
                      >
                        <X size={13} />
                        否决
                      </button>
                    </div>
                  ) : (
                    <div className="xmp-evidence-result">
                      <CheckCircle2 size={14} />
                      {evidence.status === "teacher-confirmed"
                        ? `教师已确认：${evidence.teacherNote}`
                        : "教师已否决，不进入成长档案"}
                    </div>
                  )}
                </section>
              ))}
            </div>
          </article>
        </section>
      ) : null}

      <section className="xmp-orchestration-loop">
        <article className="xmp-orchestration-pedagogy">
          <header>
            <span>TEACHING BASIS</span>
            <h2>每条现场建议都有教学依据</h2>
          </header>
          <div>
            <section>
              <small>课程目标</small>
              <b>{activePhase?.intent ?? pinnedCourse?.intent}</b>
              <p>课堂建议必须服务于当前签名课程，不替换教师目标。</p>
            </section>
            <section>
              <small>园本策略参考</small>
              <b>{approvedStrategies[0]?.title ?? "暂无已审核策略"}</b>
              <p>
                {approvedStrategies[0]?.limitation ??
                  "策略仅在教师确认后使用。"}
              </p>
            </section>
          </div>
        </article>
        <article className="xmp-orchestration-actions-log">
          <header>
            <span>REVALIDATION LOOP</span>
            <h2>已执行教学动作</h2>
            <em>{orchestration.appliedActions.length} 条</em>
          </header>
          {orchestration.appliedActions.length ? (
            <div>
              {orchestration.appliedActions.slice(0, 3).map((action) => (
                <section key={action.id}>
                  <span>
                    <Check size={13} />
                  </span>
                  <div>
                    <b>{action.action}</b>
                    <small>
                      {action.teacherName} · {formatClock(action.appliedAt)}
                    </small>
                  </div>
                  <em>
                    待学情复证 <ChevronRight size={11} />
                  </em>
                </section>
              ))}
            </div>
          ) : (
            <div className="xmp-orchestration-empty">
              <Pause size={17} />
              <p>尚无已执行动作。AI 建议不会自动进入课堂。</p>
            </div>
          )}
        </article>
      </section>

      {lastResult?.outcome === "rejected" ? (
        <div className="xmp-orchestration-toast">
          <CircleAlert size={14} /> {lastResult.reason}
        </div>
      ) : null}
    </div>
  );
}
