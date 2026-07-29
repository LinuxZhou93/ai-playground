export const XMP_CLASSROOM_ORCHESTRATION_VERSION = 2;

export type XmpSignalSource =
  | "fixed-camera"
  | "rokid-glasses"
  | "companion-camera"
  | "companion-mic"
  | "companion-touch"
  | "teacher-voice"
  | "anonymous-response-pads"
  | "material-stations"
  | "teacher-console";

export type XmpTeachingScene =
  | "collective"
  | "learning-corner"
  | "outdoor"
  | "life";

export type XmpSourceCoverage = {
  source: XmpSignalSource;
  label: string;
  status: "live" | "limited" | "offline";
  coverage: number;
  observation: string;
  blindSpot: string;
};

export type XmpStudentEvidenceCandidate = {
  id: string;
  childRef: string;
  consent: "authorized";
  purpose: "teaching-adjustment" | "growth-evidence";
  curriculumTarget: string;
  observation: string;
  hypothesis: string;
  sources: XmpSignalSource[];
  sourceAgreement: "single-source" | "corroborated" | "conflicted";
  confidence: number;
  capturedAt: string;
  expiresAt: string;
  rawMedia: "edge-ring-buffer";
  status: "candidate" | "teacher-confirmed" | "rejected";
  teacherNote: string | null;
};

export type XmpTeachingSignalMetric = {
  participationCoverage: number;
  peerResponseCount: number;
  openQuestionCount: number;
  averageWaitSeconds: number;
  ambientLevelDb: number;
  activeMaterialStations: number;
  anonymousResponses: number;
};

export type XmpTeachingSignalWindow = {
  id: string;
  sessionId: string;
  phaseId: string;
  phaseTitle: string;
  observedAt: string;
  windowSeconds: 90;
  scene: XmpTeachingScene;
  scope: "multi-end-fusion";
  retention: "metrics-24h-evidence-pending-review";
  rawMediaRetained: false;
  sources: XmpSignalSource[];
  coverage: XmpSourceCoverage[];
  evidenceCandidates: XmpStudentEvidenceCandidate[];
  metrics: XmpTeachingSignalMetric;
};

export type XmpInterventionKind =
  | "pace"
  | "question"
  | "participation"
  | "materials"
  | "safety";

export type XmpInterventionStatus =
  | "proposed"
  | "accepted"
  | "edited"
  | "applied"
  | "dismissed"
  | "expired";

export type XmpTeachingIntervention = {
  id: string;
  signalWindowId: string;
  phaseId: string;
  kind: XmpInterventionKind;
  title: string;
  rationale: string;
  suggestedAction: string;
  teacherAction: string;
  status: XmpInterventionStatus;
  confidence: number;
  createdAt: string;
  decidedAt: string | null;
  appliedAt: string | null;
  teacherId: string | null;
  teacherName: string | null;
};

export type XmpAppliedTeachingAction = {
  id: string;
  interventionId: string;
  phaseId: string;
  action: string;
  appliedAt: string;
  teacherId: string;
  teacherName: string;
  revalidation: "required";
};

export type XmpClassroomOrchestration = {
  version: typeof XMP_CLASSROOM_ORCHESTRATION_VERSION;
  revision: number;
  sessionId: string;
  activeScene: XmpTeachingScene;
  signalWindows: XmpTeachingSignalWindow[];
  interventions: XmpTeachingIntervention[];
  appliedActions: XmpAppliedTeachingAction[];
  processedCommandIds: string[];
};

export type XmpOrchestrationActor = {
  id: string;
  kind: "teacher" | "device" | "system";
  displayName: string;
  trusted: boolean;
};

export type XmpClassroomContext = {
  lifecycle: "preflight" | "live" | "paused" | "ended";
  health: "healthy" | "degraded" | "offline";
  safetyMode: "normal" | "quiet" | "teacher-control";
  activePhaseId: string;
  trustedDeviceIds: string[];
};

export type XmpOrchestrationCommand =
  | {
      id: string;
      kind: "scene.select";
      issuedAt: string;
      actor: XmpOrchestrationActor;
      payload: { scene: XmpTeachingScene };
    }
  | {
      id: string;
      kind: "evidence.confirm" | "evidence.reject";
      issuedAt: string;
      actor: XmpOrchestrationActor;
      payload: { evidenceId: string; teacherNote?: string };
    }
  | {
      id: string;
      kind: "signal.ingest";
      issuedAt: string;
      actor: XmpOrchestrationActor;
      payload: { window: XmpTeachingSignalWindow };
    }
  | {
      id: string;
      kind:
        | "intervention.accept"
        | "intervention.edit"
        | "intervention.apply"
        | "intervention.dismiss";
      issuedAt: string;
      actor: XmpOrchestrationActor;
      payload: { interventionId: string; teacherAction?: string };
    };

export type XmpOrchestrationResult = {
  orchestration: XmpClassroomOrchestration;
  outcome: "accepted" | "rejected" | "duplicate";
  reason: string;
  affectedInterventionId: string | null;
};

const unsafePattern =
  /(child|student|幼儿|学生)(id|编号|姓名|名字)|人脸模板|声纹模板|诊断|智商|能力分|排名|落后|差生/i;

function result(
  orchestration: XmpClassroomOrchestration,
  outcome: XmpOrchestrationResult["outcome"],
  reason: string,
  affectedInterventionId: string | null = null,
): XmpOrchestrationResult {
  return { orchestration, outcome, reason, affectedInterventionId };
}

function remember(
  orchestration: XmpClassroomOrchestration,
  commandId: string,
): XmpClassroomOrchestration {
  return {
    ...orchestration,
    revision: orchestration.revision + 1,
    processedCommandIds: [
      commandId,
      ...orchestration.processedCommandIds,
    ].slice(0, 160),
  };
}

function isTrustedTeacher(actor: XmpOrchestrationActor) {
  return actor.kind === "teacher" && actor.trusted;
}

function proposalId(windowId: string, kind: XmpInterventionKind) {
  return `${windowId}-${kind}`;
}

export function deriveInterventions(
  window: XmpTeachingSignalWindow,
): XmpTeachingIntervention[] {
  const proposals: Omit<XmpTeachingIntervention, "id">[] = [];
  const base = {
    signalWindowId: window.id,
    phaseId: window.phaseId,
    status: "proposed" as const,
    createdAt: window.observedAt,
    decidedAt: null,
    appliedAt: null,
    teacherId: null,
    teacherName: null,
  };

  if (
    window.metrics.participationCoverage < 70 &&
    window.metrics.peerResponseCount < 5
  ) {
    proposals.push({
      ...base,
      kind: "participation",
      title: "先让更多小组交换证据",
      rationale: `本时窗群体参与覆盖约 ${window.metrics.participationCoverage}%，同伴回应 ${window.metrics.peerResponseCount} 次；仅表示课堂分布，不指向任何幼儿。`,
      suggestedAction: "请相邻小组先交换一个观察证据，再邀请全班分享。",
      teacherAction: "请相邻小组先交换一个观察证据，再邀请全班分享。",
      confidence: 84,
    });
  }

  if (
    window.metrics.averageWaitSeconds < 4 &&
    window.metrics.openQuestionCount >= 2
  ) {
    proposals.push({
      ...base,
      kind: "pace",
      title: "把等待时间还给孩子",
      rationale: `连续开放问题后的平均等待时间为 ${window.metrics.averageWaitSeconds} 秒，可能不足以形成完整表达。`,
      suggestedAction: "下一次追问后静候 6 秒，并用手势邀请孩子继续想。",
      teacherAction: "下一次追问后静候 6 秒，并用手势邀请孩子继续想。",
      confidence: 88,
    });
  }

  if (
    window.metrics.anonymousResponses >= 12 &&
    window.metrics.peerResponseCount < 7
  ) {
    proposals.push({
      ...base,
      kind: "question",
      title: "从选择答案转向解释证据",
      rationale: `匿名回应板收到 ${window.metrics.anonymousResponses} 次选择，但同伴回应较少，适合追问判断依据。`,
      suggestedAction: "追问：你观察到了什么，让你选择这个答案？",
      teacherAction: "追问：你观察到了什么，让你选择这个答案？",
      confidence: 91,
    });
  }

  if (
    window.metrics.activeMaterialStations <= 1 &&
    window.metrics.participationCoverage < 75
  ) {
    proposals.push({
      ...base,
      kind: "materials",
      title: "开放第二个材料观察点",
      rationale: `当前仅 ${window.metrics.activeMaterialStations} 个材料站活跃，群体参与覆盖偏低。设备只计数，不记录由谁操作。`,
      suggestedAction: "开放备用观察托盘，让等待的小组并行验证。",
      teacherAction: "开放备用观察托盘，让等待的小组并行验证。",
      confidence: 79,
    });
  }

  if (window.metrics.ambientLevelDb >= 82) {
    proposals.push({
      ...base,
      kind: "safety",
      title: "现场声级持续偏高",
      rationale: `环境声级聚合值达到 ${window.metrics.ambientLevelDb}dB；不保留录音，也不识别说话者。`,
      suggestedAction: "由教师暂停设备播报，确认现场安全后再继续。",
      teacherAction: "由教师暂停设备播报，确认现场安全后再继续。",
      confidence: 96,
    });
  }

  return proposals.map((proposal) => ({
    ...proposal,
    id: proposalId(window.id, proposal.kind),
  }));
}

export function createInitialClassroomOrchestration(): XmpClassroomOrchestration {
  const window: XmpTeachingSignalWindow = {
    id: "signal-seed-03",
    sessionId: "XMP-CLS-A301-20260728",
    phaseId: "question",
    phaseTitle: "问题建构",
    observedAt: "2026-07-28T09:24:30+08:00",
    windowSeconds: 90,
    scene: "collective",
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
    ],
    coverage: [
      {
        source: "fixed-camera",
        label: "教室双机位",
        status: "live",
        coverage: 92,
        observation: "覆盖全班移动、举手与小组互动分布",
        blindSpot: "无法理解教师当前关注对象与提问语境",
      },
      {
        source: "rokid-glasses",
        label: "教师 Rokid 第一视角",
        status: "live",
        coverage: 71,
        observation: "获得教师视线方向、近场表达与教学语境",
        blindSpot: "视野外区域需由固定摄像头补全",
      },
      {
        source: "companion-touch",
        label: "桌宠近场交互",
        status: "live",
        coverage: 64,
        observation: "记录语音、触摸与材料操作形成的学习事件",
        blindSpot: "只覆盖正在使用桌宠的儿童",
      },
    ],
    evidenceCandidates: [
      {
        id: "evidence-seed-a07",
        childRef: "A07",
        consent: "authorized",
        purpose: "growth-evidence",
        curriculumTarget: "能用可观察特征解释分类依据",
        observation:
          "在桌宠追问后说出“叶片边缘不一样”，并移动材料完成重新分类。",
        hypothesis: "可能正在从直觉选择转向基于特征的证据表达。",
        sources: ["companion-mic", "companion-touch", "rokid-glasses"],
        sourceAgreement: "corroborated",
        confidence: 86,
        capturedAt: "2026-07-28T09:24:18+08:00",
        expiresAt: "2026-07-29T09:24:18+08:00",
        rawMedia: "edge-ring-buffer",
        status: "candidate",
        teacherNote: null,
      },
      {
        id: "evidence-seed-b12",
        childRef: "B12",
        consent: "authorized",
        purpose: "teaching-adjustment",
        curriculumTarget: "在同伴交流中补充自己的观察",
        observation: "固定机位检测到三次同伴转向，桌宠侧未采集到有效语音。",
        hypothesis: "可能尝试加入讨论，但证据不足，需要教师现场观察确认。",
        sources: ["fixed-camera"],
        sourceAgreement: "single-source",
        confidence: 58,
        capturedAt: "2026-07-28T09:24:22+08:00",
        expiresAt: "2026-07-29T09:24:22+08:00",
        rawMedia: "edge-ring-buffer",
        status: "candidate",
        teacherNote: null,
      },
    ],
    metrics: {
      participationCoverage: 62,
      peerResponseCount: 3,
      openQuestionCount: 3,
      averageWaitSeconds: 2.8,
      ambientLevelDb: 68,
      activeMaterialStations: 1,
      anonymousResponses: 16,
    },
  };
  return {
    version: XMP_CLASSROOM_ORCHESTRATION_VERSION,
    revision: 1,
    sessionId: window.sessionId,
    activeScene: "collective",
    signalWindows: [window],
    interventions: deriveInterventions(window),
    appliedActions: [],
    processedCommandIds: [],
  };
}

export function applyOrchestrationCommand(
  current: XmpClassroomOrchestration,
  command: XmpOrchestrationCommand,
  context: XmpClassroomContext,
): XmpOrchestrationResult {
  if (current.processedCommandIds.includes(command.id))
    return result(current, "duplicate", "命令已处理");

  if (command.kind === "scene.select") {
    if (!isTrustedTeacher(command.actor))
      return result(current, "rejected", "只有当前可信教师可以切换教学场景");
    return result(
      remember({ ...current, activeScene: command.payload.scene }, command.id),
      "accepted",
      "教学场景已切换，多端采集策略同步更新",
    );
  }

  if (
    command.kind === "evidence.confirm" ||
    command.kind === "evidence.reject"
  ) {
    if (!isTrustedTeacher(command.actor))
      return result(current, "rejected", "个体证据必须由当前可信教师审核");
    const window = current.signalWindows.find((item) =>
      item.evidenceCandidates.some(
        (evidence) => evidence.id === command.payload.evidenceId,
      ),
    );
    const evidence = window?.evidenceCandidates.find(
      (item) => item.id === command.payload.evidenceId,
    );
    if (!window || !evidence || evidence.status !== "candidate")
      return result(current, "rejected", "证据候选不存在或已完成审核");
    const teacherNote = command.payload.teacherNote?.trim() ?? "";
    if (command.kind === "evidence.confirm" && teacherNote.length < 6)
      return result(current, "rejected", "确认成长证据前请填写教师观察");
    const next = remember(
      {
        ...current,
        signalWindows: current.signalWindows.map((item) =>
          item.id === window.id
            ? {
                ...item,
                evidenceCandidates: item.evidenceCandidates.map((candidate) =>
                  candidate.id === evidence.id
                    ? {
                        ...candidate,
                        status:
                          command.kind === "evidence.confirm"
                            ? ("teacher-confirmed" as const)
                            : ("rejected" as const),
                        teacherNote: teacherNote || "教师判定不进入成长档案",
                      }
                    : candidate,
                ),
              }
            : item,
        ),
      },
      command.id,
    );
    return result(
      next,
      "accepted",
      command.kind === "evidence.confirm"
        ? "教师已确认，结构化证据可进入成长档案"
        : "教师已否决，候选证据将在到期后清除",
    );
  }

  if (command.kind === "signal.ingest") {
    const { window } = command.payload;
    if (context.lifecycle !== "live")
      return result(
        current,
        "rejected",
        "只有进行中的课堂可以形成实时教学信号",
      );
    if (
      command.actor.kind !== "device" ||
      !command.actor.trusted ||
      !context.trustedDeviceIds.includes(command.actor.id)
    ) {
      return result(current, "rejected", "仅可信边缘中枢可上报多端融合信号");
    }
    if (
      window.scope !== "multi-end-fusion" ||
      window.rawMediaRetained !== false ||
      window.retention !== "metrics-24h-evidence-pending-review"
    ) {
      return result(
        current,
        "rejected",
        "融合结果必须遵循本地原始媒体环形缓存与教师审核策略",
      );
    }
    if (
      window.sessionId !== current.sessionId ||
      current.signalWindows.some((item) => item.id === window.id)
    ) {
      return result(current, "rejected", "课堂会话不匹配或信号时窗已存在");
    }
    if (
      unsafePattern.test(
        `${window.phaseTitle} ${window.sources.join(" ")} ${JSON.stringify(window.metrics)}`,
      )
    ) {
      return result(current, "rejected", "信号包含儿童身份、诊断或排名字段");
    }
    const next = remember(
      {
        ...current,
        signalWindows: [window, ...current.signalWindows].slice(0, 16),
        interventions: [
          ...deriveInterventions(window),
          ...current.interventions.map((item) =>
            item.status === "proposed"
              ? { ...item, status: "expired" as const }
              : item,
          ),
        ].slice(0, 48),
      },
      command.id,
    );
    return result(next, "accepted", "三端数据已融合并形成教师建议与证据候选");
  }

  if (!isTrustedTeacher(command.actor))
    return result(current, "rejected", "只有当前可信教师可以处理教学建议");

  const interventionPayload = command.payload as {
    interventionId: string;
    teacherAction?: string;
  };
  const intervention = current.interventions.find(
    (item) => item.id === interventionPayload.interventionId,
  );
  if (!intervention) return result(current, "rejected", "教学建议不存在");

  if (command.kind === "intervention.dismiss") {
    if (!["proposed", "accepted", "edited"].includes(intervention.status))
      return result(current, "rejected", "当前建议不能忽略");
    const next = remember(
      {
        ...current,
        interventions: current.interventions.map((item) =>
          item.id === intervention.id
            ? {
                ...item,
                status: "dismissed" as const,
                decidedAt: command.issuedAt,
                teacherId: command.actor.id,
                teacherName: command.actor.displayName,
              }
            : item,
        ),
      },
      command.id,
    );
    return result(next, "accepted", "教师已忽略建议", intervention.id);
  }

  if (command.kind === "intervention.accept") {
    if (intervention.status !== "proposed")
      return result(current, "rejected", "只有待处理建议可以采纳");
    const next = remember(
      {
        ...current,
        interventions: current.interventions.map((item) =>
          item.id === intervention.id
            ? {
                ...item,
                status: "accepted" as const,
                decidedAt: command.issuedAt,
                teacherId: command.actor.id,
                teacherName: command.actor.displayName,
              }
            : item,
        ),
      },
      command.id,
    );
    return result(
      next,
      "accepted",
      "教师已采纳建议，尚未执行",
      intervention.id,
    );
  }

  if (command.kind === "intervention.edit") {
    const teacherAction = interventionPayload.teacherAction?.trim() ?? "";
    if (!["proposed", "accepted", "edited"].includes(intervention.status))
      return result(current, "rejected", "当前建议不能编辑");
    if (teacherAction.length < 12 || unsafePattern.test(teacherAction))
      return result(
        current,
        "rejected",
        "教师动作需具体且不得包含个体标签或诊断",
      );
    const next = remember(
      {
        ...current,
        interventions: current.interventions.map((item) =>
          item.id === intervention.id
            ? {
                ...item,
                teacherAction,
                status: "edited" as const,
                decidedAt: command.issuedAt,
                teacherId: command.actor.id,
                teacherName: command.actor.displayName,
              }
            : item,
        ),
      },
      command.id,
    );
    return result(
      next,
      "accepted",
      "教师已修改建议，尚未执行",
      intervention.id,
    );
  }

  if (!["accepted", "edited"].includes(intervention.status))
    return result(current, "rejected", "建议必须先由教师采纳或修改");
  if (context.lifecycle !== "live")
    return result(current, "rejected", "只有进行中的课堂可以执行教学动作");
  if (context.health === "offline" || context.safetyMode !== "normal")
    return result(current, "rejected", "课堂处于安全降级状态，AI 建议不可执行");
  if (intervention.phaseId !== context.activePhaseId)
    return result(current, "rejected", "建议不属于当前教学阶段，需要重新验证");

  const applied: XmpAppliedTeachingAction = {
    id: `action-${command.id}`,
    interventionId: intervention.id,
    phaseId: intervention.phaseId,
    action: intervention.teacherAction,
    appliedAt: command.issuedAt,
    teacherId: command.actor.id,
    teacherName: command.actor.displayName,
    revalidation: "required",
  };
  const next = remember(
    {
      ...current,
      interventions: current.interventions.map((item) =>
        item.id === intervention.id
          ? { ...item, status: "applied" as const, appliedAt: command.issuedAt }
          : item,
      ),
      appliedActions: [applied, ...current.appliedActions].slice(0, 40),
    },
    command.id,
  );
  return result(
    next,
    "accepted",
    "教师教学动作已执行并进入复盘链",
    intervention.id,
  );
}

export function restoreClassroomOrchestration(
  value: unknown,
): XmpClassroomOrchestration | null {
  if (!value || typeof value !== "object") return null;
  const candidate = value as Partial<XmpClassroomOrchestration>;
  if (
    candidate.version !== XMP_CLASSROOM_ORCHESTRATION_VERSION ||
    !Array.isArray(candidate.signalWindows) ||
    !Array.isArray(candidate.interventions) ||
    !Array.isArray(candidate.appliedActions) ||
    !Array.isArray(candidate.processedCommandIds)
  )
    return null;
  const unsafe = candidate.signalWindows.some(
    (window) =>
      window.scope !== "multi-end-fusion" ||
      window.rawMediaRetained !== false ||
      window.retention !== "metrics-24h-evidence-pending-review" ||
      !Array.isArray(window.coverage) ||
      !Array.isArray(window.evidenceCandidates) ||
      unsafePattern.test(`${window.phaseTitle} ${window.sources.join(" ")}`),
  );
  if (unsafe) return null;
  return candidate as XmpClassroomOrchestration;
}
