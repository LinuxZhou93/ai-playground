export const XMP_LEARNING_INSIGHTS_VERSION = 1;

export type XmpInsightStage =
  | "evidence"
  | "hypotheses"
  | "reviewed"
  | "applied";

export type XmpInsightSession = {
  id: string;
  label: string;
  strategy: string;
  coverage: number;
  confirmedFacts: number;
  participation: number;
  evidenceUse: number;
  transitionMinutes: number;
  sources: string[];
};

export type XmpTeachingHypothesis = {
  id: string;
  statement: string;
  evidence: string[];
  confidence: "low" | "medium" | "high";
  status: "candidate" | "accepted" | "dismissed" | "blocked";
  limitation: string;
  teacherDecisionAt: string | null;
};

export type XmpInsightAudit = {
  id: string;
  command: XmpInsightCommandKind;
  outcome: "accepted" | "rejected" | "duplicate";
  detail: string;
  occurredAt: string;
};

export type XmpLearningInsights = {
  version: typeof XMP_LEARNING_INSIGHTS_VERSION;
  revision: number;
  tenantId: "demo-xmp-001";
  teacher: { id: "principal-teacher"; name: "文老师" };
  course: "会呼吸的种子";
  classLabel: "大一班";
  inquiry: string;
  stage: XmpInsightStage;
  sessions: XmpInsightSession[];
  hypotheses: XmpTeachingHypothesis[];
  adjustment: {
    draft: string;
    teacherEdited: boolean;
    appliedTo: string | null;
    appliedAt: string | null;
  };
  boundaries: {
    anonymousOnly: true;
    rawMediaRetained: false;
    childRanking: false;
    diagnosis: false;
    minimumCoverage: 70;
  };
  audit: XmpInsightAudit[];
  processedCommandIds: string[];
};

export type XmpInsightCommandKind =
  | "analysis.generate"
  | "hypothesis.accept"
  | "hypothesis.dismiss"
  | "adjustment.edit"
  | "adjustment.apply";

export type XmpInsightCommand = {
  id: string;
  kind: XmpInsightCommandKind;
  actorId: string;
  issuedAt: string;
  payload?: { hypothesisId?: string; adjustment?: string };
};

export const XMP_INSIGHT_STAGE_LABELS: Record<XmpInsightStage, string> = {
  evidence: "证据已汇集",
  hypotheses: "等待教师研判",
  reviewed: "教师已研判",
  applied: "已进入下一课",
};

export function createInitialLearningInsights(): XmpLearningInsights {
  return {
    version: XMP_LEARNING_INSIGHTS_VERSION,
    revision: 1,
    tenantId: "demo-xmp-001",
    teacher: { id: "principal-teacher", name: "文老师" },
    course: "会呼吸的种子",
    classLabel: "大一班",
    inquiry: "怎样让更多小组在分享环节主动引用观察证据？",
    stage: "evidence",
    sessions: [
      {
        id: "session-31-1",
        label: "第 31 周 · 第 1 课",
        strategy: "教师集中讲解",
        coverage: 86,
        confirmedFacts: 7,
        participation: 64,
        evidenceUse: 41,
        transitionMinutes: 4.8,
        sources: ["匿名小组脉冲", "教师确认事实", "课堂节拍"],
      },
      {
        id: "session-31-2",
        label: "第 31 周 · 第 2 课",
        strategy: "小组先互相追问",
        coverage: 91,
        confirmedFacts: 11,
        participation: 78,
        evidenceUse: 67,
        transitionMinutes: 3.1,
        sources: ["匿名小组脉冲", "教师确认事实", "话轮聚合"],
      },
      {
        id: "session-31-3",
        label: "第 31 周 · 第 3 课",
        strategy: "身体模拟后分享",
        coverage: 48,
        confirmedFacts: 4,
        participation: 72,
        evidenceUse: 58,
        transitionMinutes: 3.6,
        sources: ["教师确认事实"],
      },
    ],
    hypotheses: [
      {
        id: "hypothesis-peer-question",
        statement: "分享前加入同伴追问，可能帮助更多小组引用观察证据。",
        evidence: [
          "两节覆盖率达标的课堂中，采用同伴追问的一节证据引用率高 26 个百分点",
          "该节课教师确认事实为 11 条，且匿名参与趋势同步上升",
        ],
        confidence: "medium",
        status: "candidate",
        limitation: "仅有两节可比课堂，不能证明因果；需由教师结合现场判断。",
        teacherDecisionAt: null,
      },
      {
        id: "hypothesis-movement",
        statement: "身体模拟可能直接提升证据表达。",
        evidence: ["第 3 课出现参与上升趋势"],
        confidence: "low",
        status: "blocked",
        limitation:
          "设备有效覆盖仅 48%，且缺少第二来源印证，暂不进入教师决策。",
        teacherDecisionAt: null,
      },
    ],
    adjustment: {
      draft:
        "分享前增加 3 分钟同伴追问：每组先说出一条观察事实，再向另一组提出一个证据问题。教师观察并记录是否出现主动引用。",
      teacherEdited: false,
      appliedTo: null,
      appliedAt: null,
    },
    boundaries: {
      anonymousOnly: true,
      rawMediaRetained: false,
      childRanking: false,
      diagnosis: false,
      minimumCoverage: 70,
    },
    audit: [],
    processedCommandIds: [],
  };
}

function appendAudit(
  state: XmpLearningInsights,
  command: XmpInsightCommand,
  outcome: XmpInsightAudit["outcome"],
  detail: string,
) {
  const audit: XmpInsightAudit = {
    id: `insight-audit-${command.id}`,
    command: command.kind,
    outcome,
    detail,
    occurredAt: command.issuedAt,
  };
  return {
    insights: {
      ...state,
      revision: state.revision + (outcome === "accepted" ? 1 : 0),
      audit: [audit, ...state.audit].slice(0, 100),
      processedCommandIds: [...state.processedCommandIds, command.id].slice(
        -200,
      ),
    },
    audit,
  };
}

export function applyInsightCommand(
  state: XmpLearningInsights,
  command: XmpInsightCommand,
): { insights: XmpLearningInsights; audit: XmpInsightAudit } {
  if (state.processedCommandIds.includes(command.id)) {
    return {
      insights: state,
      audit: {
        id: `insight-audit-${command.id}`,
        command: command.kind,
        outcome: "duplicate",
        detail: "重复教研命令已忽略",
        occurredAt: command.issuedAt,
      },
    };
  }
  const reject = (detail: string) =>
    appendAudit(state, command, "rejected", detail);
  const accept = (next: XmpLearningInsights, detail: string) =>
    appendAudit(next, command, "accepted", detail);
  const isTeacher = command.actorId === state.teacher.id;

  if (command.kind === "analysis.generate") {
    if (!isTeacher) return reject("只有本班教师可以发起教学洞察");
    if (state.stage !== "evidence") return reject("教学洞察已经生成");
    const usable = state.sessions.filter(
      (item) =>
        item.coverage >= state.boundaries.minimumCoverage &&
        item.sources.length >= 2,
    );
    if (usable.length < 2)
      return reject("至少需要两节覆盖达标且具备多源印证的课堂");
    return accept(
      { ...state, stage: "hypotheses" },
      "AI 基于匿名聚合证据生成可质疑的教学假设",
    );
  }

  if (
    command.kind === "hypothesis.accept" ||
    command.kind === "hypothesis.dismiss"
  ) {
    if (!isTeacher || state.stage !== "hypotheses")
      return reject("教学假设必须由本班教师在研判阶段处理");
    const hypothesis = state.hypotheses.find(
      (item) => item.id === command.payload?.hypothesisId,
    );
    if (!hypothesis || hypothesis.status !== "candidate")
      return reject("该假设不可处理或已被证据门槛拦截");
    const status =
      command.kind === "hypothesis.accept" ? "accepted" : "dismissed";
    return accept(
      {
        ...state,
        stage: "reviewed",
        hypotheses: state.hypotheses.map((item) =>
          item.id === hypothesis.id
            ? { ...item, status, teacherDecisionAt: command.issuedAt }
            : item,
        ),
      },
      `教师${status === "accepted" ? "接受" : "驳回"}教学假设`,
    );
  }

  if (command.kind === "adjustment.edit") {
    if (!isTeacher || state.stage !== "reviewed")
      return reject("教师研判后才能编辑下一课调整");
    if (!state.hypotheses.some((item) => item.status === "accepted"))
      return reject("没有被教师接受的教学假设");
    const draft = command.payload?.adjustment?.trim() ?? "";
    if (draft.length < 18) return reject("教学调整需包含可执行动作与观察方法");
    if (/姓名|人脸|诊断|排名|优生|差生/.test(draft))
      return reject("教学调整不得包含身份、诊断、排名或儿童标签");
    return accept(
      {
        ...state,
        adjustment: { ...state.adjustment, draft, teacherEdited: true },
      },
      "教师确认并编辑下一课教学调整",
    );
  }

  if (command.kind === "adjustment.apply") {
    if (!isTeacher || state.stage !== "reviewed")
      return reject("当前不能应用教学调整");
    if (!state.adjustment.teacherEdited)
      return reject("AI 草稿必须经教师编辑确认后才能进入下一课");
    return accept(
      {
        ...state,
        stage: "applied",
        adjustment: {
          ...state.adjustment,
          appliedTo: "第 32 周 · 第 1 课（教师草稿）",
          appliedAt: command.issuedAt,
        },
      },
      "教师将调整写入下一课草稿，未自动发布",
    );
  }

  return reject("未知教研命令");
}

export function restoreLearningInsights(
  value: unknown,
): XmpLearningInsights | null {
  if (!value || typeof value !== "object") return null;
  const state = value as Partial<XmpLearningInsights>;
  if (
    state.version !== XMP_LEARNING_INSIGHTS_VERSION ||
    state.tenantId !== "demo-xmp-001" ||
    !Array.isArray(state.sessions) ||
    !Array.isArray(state.hypotheses) ||
    state.boundaries?.anonymousOnly !== true ||
    state.boundaries?.rawMediaRetained !== false ||
    state.boundaries?.childRanking !== false ||
    state.boundaries?.diagnosis !== false
  )
    return null;
  if (
    JSON.stringify(value).match(
      /(?:1[3-9]\d{9})|(?:\d{17}[\dXx])|childName|faceId/,
    )
  )
    return null;
  return value as XmpLearningInsights;
}
