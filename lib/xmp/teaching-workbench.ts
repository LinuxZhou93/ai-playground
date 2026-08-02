export const XMP_TEACHING_WORKBENCH_VERSION = 1;

export type XmpTeachingStage =
  | "prepare"
  | "prepared"
  | "ready"
  | "live"
  | "paused"
  | "review"
  | "signed";

export type XmpTeachingDeviceRole =
  | "edge"
  | "camera"
  | "microphone"
  | "display"
  | "companions";

export type XmpTeachingDevice = {
  id: string;
  name: string;
  role: XmpTeachingDeviceRole;
  status: "ready" | "degraded" | "offline";
  critical: boolean;
  privacyMode: string;
  lastHeartbeatAt: string;
};

export type XmpTeachingCue = {
  id: string;
  category: "pacing" | "question" | "grouping" | "movement";
  title: string;
  rationale: string;
  source: string;
  confidence: "low" | "medium" | "high";
  status: "pending" | "accepted" | "dismissed";
  decidedAt: string | null;
};

export type XmpAnonymousGroupPulse = {
  id: string;
  label: string;
  participation: number;
  trend: "up" | "steady" | "down";
  observedState: "投入探究" | "正在协商" | "需要澄清" | "适合活动转换";
  samples: number;
};

export type XmpTeachingEvidence = {
  id: string;
  groupId: string;
  fact: string;
  source: "teacher-note" | "anonymous-pulse" | "classroom-event";
  createdAt: string;
  teacherConfirmed: boolean;
};

export type XmpTeachingPlanBeat = {
  id: string;
  title: string;
  durationMinutes: number;
  teacherMove: string;
  deviceMove: string;
  status: "upcoming" | "active" | "complete";
};

export type XmpTeachingAudit = {
  id: string;
  command: XmpTeachingCommandKind;
  actor: string;
  outcome: "accepted" | "rejected" | "duplicate";
  detail: string;
  occurredAt: string;
};

export type XmpTeachingWorkbench = {
  version: typeof XMP_TEACHING_WORKBENCH_VERSION;
  revision: number;
  tenantId: "demo-xmp-001";
  campusId: "campus-xmp-west";
  sessionId: "TEACH-A301-20260728";
  correlationId: "CLS-A301-20260728-SEED";
  teacher: { id: "principal-teacher"; name: "文老师" };
  classLabel: "大一班";
  roomLabel: "探究教室 A-301";
  course: {
    title: "会呼吸的种子";
    release: "v3.3.0";
    releaseSignature: "LOCAL-SIG-A9F31C";
    scheduleSignature: "LOCAL-SCHED-31D7A2";
  };
  stage: XmpTeachingStage;
  aiEnabled: boolean;
  teacherTakeover: boolean;
  preparation: {
    generated: boolean;
    objectives: string[];
    materialsReady: boolean;
    estimatedManualMinutes: number;
    actualMinutes: number;
  };
  beats: XmpTeachingPlanBeat[];
  activeBeatId: string;
  devices: XmpTeachingDevice[];
  cues: XmpTeachingCue[];
  groupPulses: XmpAnonymousGroupPulse[];
  evidence: XmpTeachingEvidence[];
  reflection: {
    draft: string;
    teacherSignedAt: string | null;
  };
  privacy: {
    rawMediaUploaded: false;
    individualRanking: false;
    medicalDiagnosis: false;
    edgeInference: true;
    captureEnabled: boolean;
  };
  audit: XmpTeachingAudit[];
  processedCommandIds: string[];
};

export type XmpTeachingCommandKind =
  | "prep.generate"
  | "readiness.verify"
  | "session.start"
  | "beat.advance"
  | "cue.accept"
  | "cue.dismiss"
  | "evidence.capture"
  | "device.degrade"
  | "device.restore"
  | "teacher.takeover"
  | "teacher.release"
  | "session.resume"
  | "session.end"
  | "reflection.sign";

export type XmpTeachingCommand = {
  id: string;
  kind: XmpTeachingCommandKind;
  actorId: string;
  issuedAt: string;
  payload?: {
    cueId?: string;
    deviceId?: string;
    groupId?: string;
    fact?: string;
  };
};

export const XMP_TEACHING_STAGE_LABELS: Record<XmpTeachingStage, string> = {
  prepare: "课前准备",
  prepared: "教学包已生成",
  ready: "课堂已就绪",
  live: "课堂进行中",
  paused: "安全暂停",
  review: "课后复盘",
  signed: "教师已签发",
};

export function getTeachingEfficiency(workbench: XmpTeachingWorkbench) {
  const saved = Math.max(
    0,
    workbench.preparation.estimatedManualMinutes -
      workbench.preparation.actualMinutes,
  );
  return {
    preparationMinutesSaved: workbench.preparation.generated ? saved : 0,
    acceptedCueCount: workbench.cues.filter(
      (item) => item.status === "accepted",
    ).length,
    confirmedEvidenceCount: workbench.evidence.filter(
      (item) => item.teacherConfirmed,
    ).length,
    connectedDeviceCount: workbench.devices.filter(
      (item) => item.status !== "offline",
    ).length,
  };
}

export function createInitialTeachingWorkbench(): XmpTeachingWorkbench {
  return {
    version: XMP_TEACHING_WORKBENCH_VERSION,
    revision: 1,
    tenantId: "demo-xmp-001",
    campusId: "campus-xmp-west",
    sessionId: "TEACH-A301-20260728",
    correlationId: "CLS-A301-20260728-SEED",
    teacher: { id: "principal-teacher", name: "文老师" },
    classLabel: "大一班",
    roomLabel: "探究教室 A-301",
    course: {
      title: "会呼吸的种子",
      release: "v3.3.0",
      releaseSignature: "LOCAL-SIG-A9F31C",
      scheduleSignature: "LOCAL-SCHED-31D7A2",
    },
    stage: "prepare",
    aiEnabled: false,
    teacherTakeover: false,
    preparation: {
      generated: false,
      objectives: [
        "通过观察和动作表达种子生长过程",
        "在小组协商中提出并验证一个猜想",
        "用儿童自己的语言复述发现",
      ],
      materialsReady: true,
      estimatedManualMinutes: 48,
      actualMinutes: 12,
    },
    beats: [
      {
        id: "beat-wonder",
        title: "唤醒好奇",
        durationMinutes: 6,
        teacherMove: "用密封瓶里的种子引出‘它在呼吸吗？’",
        deviceMove: "大屏呈现局部放大，奇妙宠只做追问",
        status: "upcoming",
      },
      {
        id: "beat-explore",
        title: "小组探究",
        durationMinutes: 16,
        teacherMove: "巡视四组，记录事实，不即时给出答案",
        deviceMove: "摄像头仅输出匿名小组结构化脉冲",
        status: "upcoming",
      },
      {
        id: "beat-share",
        title: "表达与共创",
        durationMinutes: 9,
        teacherMove: "邀请不同证据的小组互相追问",
        deviceMove: "奇妙宠复述儿童原话并等待教师确认",
        status: "upcoming",
      },
      {
        id: "beat-reflect",
        title: "回望发现",
        durationMinutes: 5,
        teacherMove: "把事实、猜想和新问题分开整理",
        deviceMove: "边缘端生成匿名课堂摘要草稿",
        status: "upcoming",
      },
    ],
    activeBeatId: "beat-wonder",
    devices: [
      {
        id: "device-edge-a301",
        name: "A-301 边缘中枢",
        role: "edge",
        status: "ready",
        critical: true,
        privacyMode: "结构化指标本地生成",
        lastHeartbeatAt: "2026-07-28T09:18:58+08:00",
      },
      {
        id: "device-camera-a301",
        name: "教室视觉感知",
        role: "camera",
        status: "ready",
        critical: true,
        privacyMode: "原始视频不上传",
        lastHeartbeatAt: "2026-07-28T09:18:56+08:00",
      },
      {
        id: "device-mic-a301",
        name: "课堂拾音阵列",
        role: "microphone",
        status: "ready",
        critical: false,
        privacyMode: "仅提取音量与轮次",
        lastHeartbeatAt: "2026-07-28T09:18:57+08:00",
      },
      {
        id: "device-display-a301",
        name: "互动大屏",
        role: "display",
        status: "ready",
        critical: false,
        privacyMode: "只展示教师批准内容",
        lastHeartbeatAt: "2026-07-28T09:18:55+08:00",
      },
      {
        id: "device-companions-a301",
        name: "奇妙宠 × 6",
        role: "companions",
        status: "ready",
        critical: false,
        privacyMode: "物理静音与教师接管",
        lastHeartbeatAt: "2026-07-28T09:18:54+08:00",
      },
    ],
    cues: [
      {
        id: "cue-clarify",
        category: "question",
        title: "先追问证据，不急着公布答案",
        rationale: "匿名脉冲显示两组正在形成不同解释，适合让儿童互相追问。",
        source: "小组参与趋势 + 教学节拍",
        confidence: "medium",
        status: "pending",
        decidedAt: null,
      },
      {
        id: "cue-movement",
        category: "movement",
        title: "把下一轮观察改成身体模拟",
        rationale: "连续静态探究已接近 12 分钟，可用动作表达降低认知负荷。",
        source: "节拍时长 + 匿名活动水平",
        confidence: "high",
        status: "pending",
        decidedAt: null,
      },
    ],
    groupPulses: [
      {
        id: "group-a",
        label: "青芽组",
        participation: 82,
        trend: "up",
        observedState: "投入探究",
        samples: 18,
      },
      {
        id: "group-b",
        label: "云朵组",
        participation: 74,
        trend: "steady",
        observedState: "正在协商",
        samples: 16,
      },
      {
        id: "group-c",
        label: "松果组",
        participation: 61,
        trend: "down",
        observedState: "需要澄清",
        samples: 14,
      },
      {
        id: "group-d",
        label: "星河组",
        participation: 68,
        trend: "steady",
        observedState: "适合活动转换",
        samples: 15,
      },
    ],
    evidence: [],
    reflection: {
      draft:
        "本节课的高价值时刻来自儿童之间对不同证据的追问。AI 只整理匿名事件与节拍，最终解释由教师完成。",
      teacherSignedAt: null,
    },
    privacy: {
      rawMediaUploaded: false,
      individualRanking: false,
      medicalDiagnosis: false,
      edgeInference: true,
      captureEnabled: true,
    },
    audit: [],
    processedCommandIds: [],
  };
}

function auditFor(
  command: XmpTeachingCommand,
  outcome: XmpTeachingAudit["outcome"],
  detail: string,
): XmpTeachingAudit {
  return {
    id: `teaching-audit-${command.id}`,
    command: command.kind,
    actor: command.actorId === "principal-teacher" ? "文老师" : "本地边缘策略",
    outcome,
    detail,
    occurredAt: command.issuedAt,
  };
}

function appendAudit(
  workbench: XmpTeachingWorkbench,
  command: XmpTeachingCommand,
  outcome: XmpTeachingAudit["outcome"],
  detail: string,
) {
  const audit = auditFor(command, outcome, detail);
  return {
    workbench: {
      ...workbench,
      revision: workbench.revision + (outcome === "accepted" ? 1 : 0),
      audit: [audit, ...workbench.audit].slice(0, 100),
      processedCommandIds: [...workbench.processedCommandIds, command.id].slice(
        -200,
      ),
    },
    audit,
  };
}

export function applyTeachingCommand(
  workbench: XmpTeachingWorkbench,
  command: XmpTeachingCommand,
): { workbench: XmpTeachingWorkbench; audit: XmpTeachingAudit } {
  if (workbench.processedCommandIds.includes(command.id)) {
    return {
      workbench,
      audit: auditFor(command, "duplicate", "重复教学命令已忽略"),
    };
  }
  const isTeacher = command.actorId === workbench.teacher.id;
  const reject = (detail: string) =>
    appendAudit(workbench, command, "rejected", detail);
  const accept = (next: XmpTeachingWorkbench, detail: string) =>
    appendAudit(next, command, "accepted", detail);

  if (command.kind === "prep.generate") {
    if (!isTeacher) return reject("只有本班教师可以生成课前教学包");
    if (workbench.stage !== "prepare") return reject("课前教学包已经生成");
    return accept(
      {
        ...workbench,
        stage: "prepared",
        preparation: { ...workbench.preparation, generated: true },
      },
      "基于签名课程版本生成教师可编辑教学包；预计节省 36 分钟",
    );
  }

  if (command.kind === "readiness.verify") {
    if (!isTeacher) return reject("只有本班教师可以确认课堂就绪");
    if (workbench.stage !== "prepared") return reject("请先生成课前教学包");
    if (!workbench.preparation.materialsReady)
      return reject("教学物料尚未就绪");
    if (
      workbench.devices.some((item) => item.critical && item.status !== "ready")
    )
      return reject("关键教学设备未就绪");
    if (
      !workbench.course.releaseSignature ||
      !workbench.course.scheduleSignature
    )
      return reject("课程或教学计划缺少签名");
    return accept(
      { ...workbench, stage: "ready" },
      "课程、教师、空间、设备与物料已联检；课堂可以启动",
    );
  }

  if (command.kind === "session.start") {
    if (!isTeacher) return reject("只有本班教师可以开始课堂");
    if (workbench.stage !== "ready") return reject("课堂尚未通过就绪验证");
    return accept(
      {
        ...workbench,
        stage: "live",
        aiEnabled: true,
        beats: workbench.beats.map((beat, index) => ({
          ...beat,
          status: index === 0 ? "active" : "upcoming",
        })),
      },
      "教师启动课堂；AI 进入建议模式，不能自主改变教学节奏",
    );
  }

  if (command.kind === "beat.advance") {
    if (!isTeacher || workbench.stage !== "live")
      return reject("只有课堂进行中且由教师推进节拍");
    const activeIndex = workbench.beats.findIndex(
      (item) => item.id === workbench.activeBeatId,
    );
    if (activeIndex < 0 || activeIndex >= workbench.beats.length - 1)
      return reject("已经是最后一个教学节拍");
    const nextId = workbench.beats[activeIndex + 1].id;
    return accept(
      {
        ...workbench,
        activeBeatId: nextId,
        beats: workbench.beats.map((beat, index) => ({
          ...beat,
          status:
            index <= activeIndex
              ? "complete"
              : index === activeIndex + 1
                ? "active"
                : "upcoming",
        })),
      },
      `教师推进至“${workbench.beats[activeIndex + 1].title}”`,
    );
  }

  if (command.kind === "cue.accept" || command.kind === "cue.dismiss") {
    if (!isTeacher || workbench.stage !== "live")
      return reject("AI 建议只能由课堂中的教师处理");
    const cue = workbench.cues.find(
      (item) => item.id === command.payload?.cueId,
    );
    if (!cue || cue.status !== "pending") return reject("建议不存在或已经处理");
    const status = command.kind === "cue.accept" ? "accepted" : "dismissed";
    return accept(
      {
        ...workbench,
        cues: workbench.cues.map((item) =>
          item.id === cue.id
            ? { ...item, status, decidedAt: command.issuedAt }
            : item,
        ),
      },
      `教师${status === "accepted" ? "采用" : "忽略"} AI 建议：${cue.title}`,
    );
  }

  if (command.kind === "evidence.capture") {
    if (!isTeacher || workbench.stage !== "live")
      return reject("只有课堂中的教师可以确认教学证据");
    const group = workbench.groupPulses.find(
      (item) => item.id === command.payload?.groupId,
    );
    const fact = command.payload?.fact?.trim();
    if (!group || !fact || fact.length < 8)
      return reject("证据必须关联匿名小组并包含可观察事实");
    if (/姓名|电话|身份证|人脸|诊断/.test(fact))
      return reject("教学证据不得包含身份、联系方式、人脸或诊断结论");
    const evidence: XmpTeachingEvidence = {
      id: `teaching-evidence-${command.id}`,
      groupId: group.id,
      fact,
      source: "teacher-note",
      createdAt: command.issuedAt,
      teacherConfirmed: true,
    };
    return accept(
      { ...workbench, evidence: [evidence, ...workbench.evidence] },
      `教师确认 ${group.label} 的匿名事实证据`,
    );
  }

  if (command.kind === "device.degrade") {
    const device = workbench.devices.find(
      (item) => item.id === command.payload?.deviceId,
    );
    if (!device) return reject("设备不存在");
    const devices = workbench.devices.map((item) =>
      item.id === device.id ? { ...item, status: "degraded" as const } : item,
    );
    return accept(
      {
        ...workbench,
        devices,
        stage:
          device.critical && workbench.stage === "live"
            ? "paused"
            : workbench.stage,
        aiEnabled:
          device.critical && workbench.stage === "live"
            ? false
            : workbench.aiEnabled,
      },
      device.critical
        ? "关键设备异常，课堂安全暂停且 AI 已关闭"
        : "非关键设备进入降级模式，教师控制保持可用",
    );
  }

  if (command.kind === "device.restore") {
    const device = workbench.devices.find(
      (item) => item.id === command.payload?.deviceId,
    );
    if (!device || device.status === "ready") return reject("设备无需恢复");
    return accept(
      {
        ...workbench,
        devices: workbench.devices.map((item) =>
          item.id === device.id
            ? {
                ...item,
                status: "ready",
                lastHeartbeatAt: command.issuedAt,
              }
            : item,
        ),
      },
      "设备心跳恢复；课堂仍需教师明确继续",
    );
  }

  if (command.kind === "teacher.takeover") {
    if (
      !isTeacher ||
      !(["live", "paused"] as XmpTeachingStage[]).includes(workbench.stage)
    )
      return reject("当前不能启动教师接管");
    return accept(
      { ...workbench, teacherTakeover: true, aiEnabled: false },
      "教师接管全部教学控制，AI 与奇妙宠仅保留静默状态",
    );
  }

  if (command.kind === "teacher.release") {
    if (!isTeacher || !workbench.teacherTakeover)
      return reject("当前没有待释放的教师接管");
    return accept(
      {
        ...workbench,
        teacherTakeover: false,
        aiEnabled: workbench.stage === "live",
      },
      "教师显式释放接管；AI 恢复建议模式",
    );
  }

  if (command.kind === "session.resume") {
    if (!isTeacher || workbench.stage !== "paused")
      return reject("课堂当前不在安全暂停状态");
    if (
      workbench.devices.some((item) => item.critical && item.status !== "ready")
    )
      return reject("关键设备尚未恢复");
    return accept(
      {
        ...workbench,
        stage: "live",
        aiEnabled: !workbench.teacherTakeover,
      },
      "教师确认关键设备恢复并继续课堂",
    );
  }

  if (command.kind === "session.end") {
    if (!isTeacher || workbench.stage !== "live")
      return reject("只有进行中的课堂可以由教师结束");
    return accept(
      { ...workbench, stage: "review", aiEnabled: false },
      "课堂结束，匿名结构化事件进入教师复盘",
    );
  }

  if (command.kind === "reflection.sign") {
    if (!isTeacher || workbench.stage !== "review")
      return reject("只有课后复盘可以由本班教师签发");
    if (!workbench.evidence.some((item) => item.teacherConfirmed))
      return reject("至少确认一条课堂事实证据后才能签发复盘");
    return accept(
      {
        ...workbench,
        stage: "signed",
        reflection: {
          ...workbench.reflection,
          teacherSignedAt: command.issuedAt,
        },
      },
      "教师签发教学复盘；AI 草稿不替代教师判断",
    );
  }

  return reject("未知教学命令");
}

export function restoreTeachingWorkbench(
  value: unknown,
): XmpTeachingWorkbench | null {
  if (!value || typeof value !== "object") return null;
  const workbench = value as Partial<XmpTeachingWorkbench>;
  if (
    workbench.version !== XMP_TEACHING_WORKBENCH_VERSION ||
    workbench.tenantId !== "demo-xmp-001" ||
    workbench.campusId !== "campus-xmp-west" ||
    workbench.sessionId !== "TEACH-A301-20260728" ||
    !Array.isArray(workbench.beats) ||
    !Array.isArray(workbench.devices) ||
    !Array.isArray(workbench.cues) ||
    !Array.isArray(workbench.groupPulses) ||
    !Array.isArray(workbench.evidence) ||
    !Array.isArray(workbench.audit) ||
    !Array.isArray(workbench.processedCommandIds)
  )
    return null;
  if (
    new Set(workbench.beats.map((item) => item.id)).size !==
      workbench.beats.length ||
    new Set(workbench.devices.map((item) => item.id)).size !==
      workbench.devices.length ||
    !workbench.beats.some((item) => item.id === workbench.activeBeatId) ||
    workbench.privacy?.rawMediaUploaded !== false ||
    workbench.privacy.individualRanking !== false ||
    workbench.privacy.medicalDiagnosis !== false
  )
    return null;
  const serialized = JSON.stringify(workbench);
  if (
    /(?:1[3-9]\d{9})|(?:\d{17}[\dXx])|(?:[\w.+-]+@[\w.-]+\.[A-Za-z]{2,})/.test(
      serialized,
    )
  )
    return null;
  return workbench as XmpTeachingWorkbench;
}
