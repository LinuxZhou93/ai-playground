export const XMP_TEACHING_STRATEGY_VERSION = 1;

export type XmpStrategyStatus =
  | "candidate"
  | "in-review"
  | "approved"
  | "changes-requested"
  | "retired";

export type XmpStrategyEvidence = {
  sessionRef: string;
  kind: "anonymous-aggregate" | "teacher-confirmed";
  summary: string;
  coverage: number;
};

export type XmpTeachingStrategy = {
  id: string;
  version: string;
  title: string;
  teachingProblem: string;
  pattern: string;
  teacherMoves: string[];
  observableSignals: string[];
  ageBands: string[];
  suitableMoments: string[];
  evidence: XmpStrategyEvidence[];
  limitation: string;
  sourceInquiry: string;
  sourceInsightId: string;
  author: { id: string; name: string };
  reviewer: { id: string; name: string } | null;
  status: XmpStrategyStatus;
  createdAt: string;
  reviewedAt: string | null;
};

export type XmpStrategyAdaptation = {
  id: string;
  strategyId: string;
  targetCourse: string;
  targetCourseVersionId: string;
  targetPhaseId: string;
  ageBand: string;
  teacherAuthoredAction: string;
  status: "draft-created";
  courseDraftId: string;
  createdAt: string;
};

export type XmpStrategyAudit = {
  id: string;
  command: XmpStrategyCommandKind;
  outcome: "accepted" | "rejected" | "duplicate";
  detail: string;
  occurredAt: string;
};

export type XmpTeachingStrategyLibrary = {
  schemaVersion: typeof XMP_TEACHING_STRATEGY_VERSION;
  revision: number;
  tenantId: "demo-xmp-001";
  strategies: XmpTeachingStrategy[];
  adaptations: XmpStrategyAdaptation[];
  boundaries: {
    teacherDecisionRequired: true;
    independentReviewRequired: true;
    childIdentityAllowed: false;
    diagnosisAllowed: false;
    automaticPublishing: false;
    minimumEvidenceSessions: 2;
    minimumCoverage: 70;
  };
  audit: XmpStrategyAudit[];
  processedCommandIds: string[];
};

export type XmpStrategyCommandKind =
  | "candidate.import"
  | "review.submit"
  | "review.approve"
  | "review.request_changes"
  | "adaptation.create";

export type XmpStrategyCommand = {
  id: string;
  kind: XmpStrategyCommandKind;
  actorId: string;
  issuedAt: string;
  payload?: {
    strategyId?: string;
    sourceInsightId?: string;
    sourceInquiry?: string;
    acceptedHypothesis?: boolean;
    teacherEdited?: boolean;
    appliedToNextLesson?: boolean;
    title?: string;
    pattern?: string;
    limitation?: string;
    targetCourse?: string;
    targetCourseVersionId?: string;
    targetPhaseId?: string;
    ageBand?: string;
    teacherAuthoredAction?: string;
  };
};

const sensitivePattern =
  /姓名|电话|身份证|人脸|face|childName|诊断|排名|优生|差生|能力分数/i;

function approvedSeed(
  id: string,
  version: string,
  title: string,
  problem: string,
  pattern: string,
  moments: string[],
  evidenceCount: number,
): XmpTeachingStrategy {
  return {
    id,
    version,
    title,
    teachingProblem: problem,
    pattern,
    teacherMoves: [
      "明确本轮观察焦点",
      "给小组留出协商时间",
      "只记录可观察事实",
    ],
    observableSignals: [
      "匿名小组话轮变化",
      "教师确认的证据引用",
      "节拍转换耗时",
    ],
    ageBands: ["4–5 岁", "5–6 岁"],
    suitableMoments: moments,
    evidence: Array.from({ length: evidenceCount }, (_, index) => ({
      sessionRef: `DEMO-LESSON-${id}-${index + 1}`,
      kind: index % 2 ? "teacher-confirmed" : "anonymous-aggregate",
      summary: "本地演示课堂的匿名结构证据与教师确认事实",
      coverage: 82 + (index % 3) * 3,
    })),
    limitation: "仅适用于相近年龄、课程目标与课堂条件，迁移后必须重新验证。",
    sourceInquiry: "园本教研历史策略（本地演示）",
    sourceInsightId: `demo-seed-${id}`,
    author: { id: "teacher-wen-demo", name: "文老师" },
    reviewer: { id: "research-lead-demo", name: "教研负责人 周老师" },
    status: "approved",
    createdAt: "2026-07-21T09:00:00+08:00",
    reviewedAt: "2026-07-23T15:00:00+08:00",
  };
}

export function createInitialTeachingStrategyLibrary(): XmpTeachingStrategyLibrary {
  return {
    schemaVersion: XMP_TEACHING_STRATEGY_VERSION,
    revision: 1,
    tenantId: "demo-xmp-001",
    strategies: [
      approvedSeed(
        "strategy-fact-before-explanation",
        "2.1",
        "先事实，后解释",
        "分享时儿童容易先说结论，忽略观察依据",
        "教师先邀请小组说一条看见或听见的事实，再允许提出解释。",
        ["探究分享", "集体回顾"],
        5,
      ),
      approvedSeed(
        "strategy-peer-question",
        "1.4",
        "同伴证据追问",
        "小组分享容易变成轮流汇报，缺少彼此回应",
        "分享前安排短时同伴追问：先说事实，再向另一组提出证据问题。",
        ["分享与追问", "观点比较"],
        4,
      ),
    ],
    adaptations: [],
    boundaries: {
      teacherDecisionRequired: true,
      independentReviewRequired: true,
      childIdentityAllowed: false,
      diagnosisAllowed: false,
      automaticPublishing: false,
      minimumEvidenceSessions: 2,
      minimumCoverage: 70,
    },
    audit: [],
    processedCommandIds: [],
  };
}

function appendAudit(
  library: XmpTeachingStrategyLibrary,
  command: XmpStrategyCommand,
  outcome: XmpStrategyAudit["outcome"],
  detail: string,
) {
  const audit: XmpStrategyAudit = {
    id: `strategy-audit-${command.id}`,
    command: command.kind,
    outcome,
    detail,
    occurredAt: command.issuedAt,
  };
  return {
    library: {
      ...library,
      revision: library.revision + (outcome === "accepted" ? 1 : 0),
      audit: [audit, ...library.audit].slice(0, 100),
      processedCommandIds: [...library.processedCommandIds, command.id].slice(
        -200,
      ),
    },
    audit,
  };
}

export function applyStrategyCommand(
  library: XmpTeachingStrategyLibrary,
  command: XmpStrategyCommand,
): { library: XmpTeachingStrategyLibrary; audit: XmpStrategyAudit } {
  if (library.processedCommandIds.includes(command.id)) {
    return {
      library,
      audit: {
        id: `strategy-audit-${command.id}`,
        command: command.kind,
        outcome: "duplicate",
        detail: "重复策略命令已忽略",
        occurredAt: command.issuedAt,
      },
    };
  }
  const reject = (detail: string) =>
    appendAudit(library, command, "rejected", detail);
  const accept = (next: XmpTeachingStrategyLibrary, detail: string) =>
    appendAudit(next, command, "accepted", detail);
  const payloadText = JSON.stringify(command.payload ?? {});
  if (sensitivePattern.test(payloadText))
    return reject("策略资产不得包含儿童身份、诊断、排名或能力标签");

  if (command.kind === "candidate.import") {
    if (command.actorId !== "principal-teacher")
      return reject("只有形成洞察的本班教师可以导入候选策略");
    if (
      !command.payload?.acceptedHypothesis ||
      !command.payload.teacherEdited ||
      !command.payload.appliedToNextLesson
    )
      return reject("候选策略必须来自教师接受、编辑并应用的教学洞察");
    const sourceInsightId = command.payload.sourceInsightId?.trim() ?? "";
    if (
      !sourceInsightId ||
      library.strategies.some(
        (item) => item.sourceInsightId === sourceInsightId,
      )
    )
      return reject("洞察来源缺失或已经导入");
    const strategy: XmpTeachingStrategy = {
      id: `strategy-${command.id}`,
      version: "0.1",
      title: command.payload.title?.trim() || "同伴追问促进证据表达",
      teachingProblem: command.payload.sourceInquiry?.trim() || "课堂教学问题",
      pattern: command.payload.pattern?.trim() || "教师确认的课堂调整",
      teacherMoves: ["说明追问规则", "给小组三分钟互问", "记录主动引用事实"],
      observableSignals: ["匿名小组证据引用趋势", "教师确认的主动追问事实"],
      ageBands: ["5–6 岁"],
      suitableMoments: ["分享与追问"],
      evidence: [
        {
          sessionRef: "TEACH-A301-20260728",
          kind: "teacher-confirmed",
          summary: "教师确认的匿名课堂事实",
          coverage: 91,
        },
        {
          sessionRef: "TEACH-A301-20260727",
          kind: "anonymous-aggregate",
          summary: "覆盖达标的匿名小组趋势",
          coverage: 86,
        },
      ],
      limitation:
        command.payload.limitation?.trim() ||
        "当前仅有两节可比课堂，不能证明因果；跨课程使用必须再次验证。",
      sourceInquiry: command.payload.sourceInquiry?.trim() || "教师教学问题",
      sourceInsightId,
      author: { id: "principal-teacher", name: "文老师" },
      reviewer: null,
      status: "candidate",
      createdAt: command.issuedAt,
      reviewedAt: null,
    };
    return accept(
      { ...library, strategies: [strategy, ...library.strategies] },
      "教师将已验证教学调整导入候选策略库",
    );
  }

  const strategy = library.strategies.find(
    (item) => item.id === command.payload?.strategyId,
  );
  if (!strategy) return reject("教学策略不存在");
  const replace = (next: XmpTeachingStrategy) =>
    library.strategies.map((item) => (item.id === next.id ? next : item));

  if (command.kind === "review.submit") {
    if (command.actorId !== strategy.author.id)
      return reject("只有策略作者可以提交教研审核");
    if (
      !(
        strategy.status === "candidate" ||
        strategy.status === "changes-requested"
      )
    )
      return reject("当前策略状态不可送审");
    const usableEvidence = strategy.evidence.filter(
      (item) => item.coverage >= library.boundaries.minimumCoverage,
    );
    if (usableEvidence.length < library.boundaries.minimumEvidenceSessions)
      return reject("策略至少需要两节覆盖达标的课堂证据");
    if (!strategy.limitation.trim()) return reject("策略必须说明适用局限");
    return accept(
      { ...library, strategies: replace({ ...strategy, status: "in-review" }) },
      "候选策略进入独立教研审核",
    );
  }

  if (command.kind === "review.approve") {
    if (
      command.actorId !== "research-lead-demo" ||
      command.actorId === strategy.author.id
    )
      return reject("策略必须由独立教研负责人审核");
    if (strategy.status !== "in-review") return reject("策略尚未进入审核");
    return accept(
      {
        ...library,
        strategies: replace({
          ...strategy,
          version: "1.0",
          status: "approved",
          reviewer: { id: "research-lead-demo", name: "教研负责人 周老师" },
          reviewedAt: command.issuedAt,
        }),
      },
      "教研负责人批准策略资产；迁移使用仍需再次验证",
    );
  }

  if (command.kind === "review.request_changes") {
    if (
      command.actorId !== "research-lead-demo" ||
      strategy.status !== "in-review"
    )
      return reject("只有审核中的策略可由教研负责人退回");
    return accept(
      {
        ...library,
        strategies: replace({
          ...strategy,
          status: "changes-requested",
          reviewer: { id: "research-lead-demo", name: "教研负责人 周老师" },
          reviewedAt: command.issuedAt,
        }),
      },
      "策略已退回教师补充证据或适用边界",
    );
  }

  if (strategy.status !== "approved")
    return reject("只有审核通过的策略可以复用");
  if (command.actorId !== "principal-teacher")
    return reject("只有目标课程教师可以创建适配草稿");
  const action = command.payload?.teacherAuthoredAction?.trim() ?? "";
  if (action.length < 18) return reject("适配草稿需包含明确动作与观察方法");
  const targetCourseVersionId =
    command.payload?.targetCourseVersionId?.trim() ?? "";
  const targetPhaseId = command.payload?.targetPhaseId?.trim() ?? "";
  if (!targetCourseVersionId || !targetPhaseId)
    return reject("目标课程版本或节拍缺失");
  const adaptation: XmpStrategyAdaptation = {
    id: `adaptation-${command.id}`,
    strategyId: strategy.id,
    targetCourse: command.payload?.targetCourse?.trim() || "会呼吸的种子",
    targetCourseVersionId,
    targetPhaseId,
    ageBand: command.payload?.ageBand?.trim() || "5–6 岁",
    teacherAuthoredAction: action,
    status: "draft-created",
    courseDraftId: `strategy-draft-${strategy.id}`,
    createdAt: command.issuedAt,
  };
  return accept(
    { ...library, adaptations: [adaptation, ...library.adaptations] },
    "教师基于已审核策略创建未发布课程适配草稿",
  );
}

export function restoreTeachingStrategyLibrary(
  value: unknown,
): XmpTeachingStrategyLibrary | null {
  if (!value || typeof value !== "object") return null;
  const library = value as Partial<XmpTeachingStrategyLibrary>;
  if (
    library.schemaVersion !== XMP_TEACHING_STRATEGY_VERSION ||
    library.tenantId !== "demo-xmp-001" ||
    !Array.isArray(library.strategies) ||
    !Array.isArray(library.adaptations) ||
    library.boundaries?.teacherDecisionRequired !== true ||
    library.boundaries?.independentReviewRequired !== true ||
    library.boundaries?.childIdentityAllowed !== false ||
    library.boundaries?.diagnosisAllowed !== false ||
    library.boundaries?.automaticPublishing !== false ||
    sensitivePattern.test(JSON.stringify(value))
  )
    return null;
  return value as XmpTeachingStrategyLibrary;
}
