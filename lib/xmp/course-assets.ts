export const XMP_COURSE_CATALOG_VERSION = 1;
export const XMP_SEED_COURSE_ID = "course-seed-breathing";

export type XmpCourseVersionStatus =
  | "draft"
  | "in-review"
  | "changes-requested"
  | "approved"
  | "published"
  | "superseded";

export type XmpCourseActor = {
  id: string;
  role: "author" | "reviewer" | "release-manager";
  displayName: string;
};

export type XmpCoursePhase = {
  id: string;
  title: string;
  duration: number;
  owner: "奇妙宠" | "教师" | "幼儿" | "家园";
  detail: string;
  intent: string;
  prompt: string;
  screen: string;
};

export type XmpCourseSafetyCheck = {
  id: string;
  label: string;
  status: "pass" | "fail";
};

export type XmpCourseAsset = {
  id: string;
  label: string;
  detail: string;
  checksum: string;
};

export type XmpCourseVersion = {
  id: string;
  courseId: string;
  semanticVersion: string;
  basedOnVersionId: string | null;
  status: XmpCourseVersionStatus;
  title: string;
  series: string;
  ageBand: string;
  durationMinutes: number;
  intent: string;
  phases: XmpCoursePhase[];
  assets: XmpCourseAsset[];
  safetyChecks: XmpCourseSafetyCheck[];
  changeSummary: string[];
  author: XmpCourseActor;
  reviewer: XmpCourseActor | null;
  createdAt: string;
  reviewedAt: string | null;
  publishedAt: string | null;
  signature: string | null;
  sourceStrategyId?: string;
};

export type XmpCourseCommandKind =
  | "review.submit"
  | "review.approve"
  | "review.request-changes"
  | "release.publish"
  | "release.rollback"
  | "classroom.pin"
  | "strategy.apply";

export type XmpCourseCommand = {
  id: string;
  kind: XmpCourseCommandKind;
  issuedAt: string;
  actor: XmpCourseActor;
  versionId: string;
  payload?: {
    classroomLifecycle?: "preflight" | "live" | "paused" | "ended";
    strategyId?: string;
    targetPhaseId?: string;
    adaptationText?: string;
    ageBand?: string;
  };
};

export type XmpCourseCommandRecord = {
  id: string;
  kind: XmpCourseCommandKind;
  versionId: string;
  actorLabel: string;
  issuedAt: string;
  outcome: "accepted" | "rejected" | "duplicate";
  reason?: string;
};

export type XmpCourseCatalog = {
  version: typeof XMP_COURSE_CATALOG_VERSION;
  revision: number;
  courseId: string;
  activePublishedVersionId: string;
  classroomPinnedVersionId: string;
  versions: XmpCourseVersion[];
  commandLog: XmpCourseCommandRecord[];
  processedCommandIds: string[];
};

export const XMP_COURSE_AUTHOR: XmpCourseActor = {
  id: "teacher-wen-demo",
  role: "author",
  displayName: "文老师",
};

export const XMP_COURSE_REVIEWER: XmpCourseActor = {
  id: "research-lead-demo",
  role: "reviewer",
  displayName: "教研负责人 周老师",
};

export const XMP_RELEASE_MANAGER: XmpCourseActor = {
  id: "release-manager-demo",
  role: "release-manager",
  displayName: "园所发布经理",
};

const phasesV32: XmpCoursePhase[] = [
  {
    id: "wake",
    title: "故事唤醒",
    duration: 3,
    owner: "奇妙宠",
    detail: "奇妙宠带来一颗“不愿醒来”的种子，引发幼儿猜想。",
    intent: "让幼儿对沉睡的种子产生好奇",
    prompt: "你觉得这颗种子为什么还没有醒来？",
    screen: "一颗沉睡的种子，正等待孩子们叫醒它。",
  },
  {
    id: "question",
    title: "问题建构",
    duration: 5,
    owner: "教师",
    detail: "教师收集“种子需要什么”的表达，形成班级问题墙。",
    intent: "收集猜想，不急于给出答案",
    prompt: "种子醒来可能需要哪些朋友？",
    screen: "水、空气和阳光，谁会是种子的好朋友？",
  },
  {
    id: "explore",
    title: "动手探究",
    duration: 12,
    owner: "幼儿",
    detail: "三组对照实验：水、空气、阳光，幼儿自主选择并记录。",
    intent: "自主选择变量并完成三组对照",
    prompt: "你们小组想先验证哪一个猜想？",
    screen: "选择一项条件，开始你们的种子实验。",
  },
  {
    id: "share",
    title: "分享与追问",
    duration: 7,
    owner: "教师",
    detail: "展示观察证据；AI 仅向教师建议追问，不直接判断幼儿。",
    intent: "用观察到的现象支持表达",
    prompt: "你看到了什么，让你这样想？",
    screen: "把你们看到的证据，讲给大家听。",
  },
  {
    id: "body",
    title: "身体表达",
    duration: 5,
    owner: "幼儿",
    detail: "用身体模仿种子舒展、生根和发芽的变化。",
    intent: "用动作重新表征发芽过程",
    prompt: "如果你是一颗种子，身体会怎样慢慢醒来？",
    screen: "从一颗小小的种子，长成你想象中的植物。",
  },
  {
    id: "family",
    title: "家庭延伸",
    duration: 3,
    owner: "家园",
    detail: "生成“陪种子喝水”的亲子任务，经教师确认后发送。",
    intent: "把持续观察带回真实生活",
    prompt: "今晚想邀请家人和你一起观察什么？",
    screen: "把今天的发现带回家，继续照顾一颗种子。",
  },
];

const safetyChecks: XmpCourseSafetyCheck[] = [
  "年龄与语言适配",
  "教师始终拥有最终控制权",
  "无儿童身份与个体画像",
  "无自动化能力评判",
  "对话脚本边界",
  "课堂时长与身体负荷",
  "家庭任务隐私最小化",
  "离线教学降级可用",
].map((label, index) => ({ id: `safe-${index + 1}`, label, status: "pass" }));

const assetsV32: XmpCourseAsset[] = [
  {
    id: "teacher-script",
    label: "教师引导脚本",
    detail: "含 12 个可选追问",
    checksum: "SHA256·A92F",
  },
  {
    id: "screen-deck",
    label: "大屏互动课件",
    detail: "9 页 · 含 2 个互动",
    checksum: "SHA256·43DE",
  },
  {
    id: "companion-script",
    label: "奇妙宠对话脚本",
    detail: "已通过年龄与安全校验",
    checksum: "SHA256·78B1",
  },
];

function signature(version: XmpCourseVersion, issuedAt: string) {
  const seed = `${version.courseId}:${version.semanticVersion}:${issuedAt}`;
  let hash = 2166136261;
  for (let index = 0; index < seed.length; index += 1) {
    hash ^= seed.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return `LOCAL-SIG-${(hash >>> 0).toString(16).toUpperCase().padStart(8, "0")}`;
}

export function createInitialCourseCatalog(): XmpCourseCatalog {
  const v32: XmpCourseVersion = {
    id: "seed-v3.2.0",
    courseId: XMP_SEED_COURSE_ID,
    semanticVersion: "3.2.0",
    basedOnVersionId: "seed-v3.1.0",
    status: "published",
    title: "会呼吸的种子",
    series: "春日自然探究",
    ageBand: "5–6 岁",
    durationMinutes: 35,
    intent:
      "本课不是让幼儿记住“发芽条件”，而是经历一次提出猜想、动手验证、用证据表达的完整探究。",
    phases: phasesV32.map((phase) => ({ ...phase })),
    assets: assetsV32.map((asset) => ({ ...asset })),
    safetyChecks: safetyChecks.map((check) => ({ ...check })),
    changeSummary: ["形成六节拍探究闭环", "加入教师确认后的家庭延伸"],
    author: XMP_COURSE_AUTHOR,
    reviewer: XMP_COURSE_REVIEWER,
    createdAt: "2026-07-24T09:00:00+08:00",
    reviewedAt: "2026-07-25T14:20:00+08:00",
    publishedAt: "2026-07-26T08:30:00+08:00",
    signature: "LOCAL-SIG-32A7E19C",
  };
  const v33: XmpCourseVersion = {
    ...v32,
    id: "seed-v3.3.0",
    semanticVersion: "3.3.0",
    basedOnVersionId: v32.id,
    status: "draft",
    durationMinutes: 37,
    phases: phasesV32.map((phase) =>
      phase.id === "share"
        ? {
            ...phase,
            duration: 9,
            detail:
              "先呈现证据，再讨论“泥土是不是种子的食物”；AI 只向教师提供可选追问。",
            prompt: "你从哪里看出泥土像食物？还有别的证据吗？",
          }
        : phase,
    ),
    assets: assetsV32.map((asset) =>
      asset.id === "teacher-script"
        ? { ...asset, detail: "含 14 个可选追问", checksum: "SHA256·D8C4" }
        : asset.id === "companion-script"
          ? { ...asset, checksum: "SHA256·91C6" }
          : { ...asset },
    ),
    safetyChecks: safetyChecks.map((check) => ({ ...check })),
    changeSummary: [
      "分享与追问延长 2 分钟",
      "新增“泥土是不是食物”的证据追问",
      "更新教师与奇妙宠脚本校验和",
    ],
    reviewer: null,
    createdAt: "2026-07-28T10:12:00+08:00",
    reviewedAt: null,
    publishedAt: null,
    signature: null,
  };
  return {
    version: XMP_COURSE_CATALOG_VERSION,
    revision: 1,
    courseId: XMP_SEED_COURSE_ID,
    activePublishedVersionId: v32.id,
    classroomPinnedVersionId: v32.id,
    versions: [v33, v32],
    commandLog: [],
    processedCommandIds: [],
  };
}

function record(
  command: XmpCourseCommand,
  outcome: XmpCourseCommandRecord["outcome"],
  reason?: string,
): XmpCourseCommandRecord {
  return {
    id: command.id,
    kind: command.kind,
    versionId: command.versionId,
    actorLabel: command.actor.displayName,
    issuedAt: command.issuedAt,
    outcome,
    reason,
  };
}

function finish(
  catalog: XmpCourseCatalog,
  command: XmpCourseCommand,
  outcome: XmpCourseCommandRecord["outcome"],
  reason?: string,
  mutate?: (catalog: XmpCourseCatalog) => XmpCourseCatalog,
) {
  const base = mutate ? mutate(catalog) : catalog;
  const commandRecord = record(command, outcome, reason);
  return {
    catalog: {
      ...base,
      revision: outcome === "accepted" ? base.revision + 1 : base.revision,
      commandLog: [commandRecord, ...base.commandLog].slice(0, 60),
      processedCommandIds:
        outcome === "duplicate"
          ? base.processedCommandIds
          : [command.id, ...base.processedCommandIds].slice(0, 160),
    },
    record: commandRecord,
  };
}

export function applyCourseCommand(
  catalog: XmpCourseCatalog,
  command: XmpCourseCommand,
) {
  if (catalog.processedCommandIds.includes(command.id))
    return finish(catalog, command, "duplicate", "命令已处理");
  const version = catalog.versions.find(
    (item) => item.id === command.versionId,
  );
  if (!version) return finish(catalog, command, "rejected", "课程版本不存在");
  const update = (
    next: XmpCourseVersion[],
    extra: Partial<XmpCourseCatalog> = {},
  ) => ({ ...catalog, ...extra, versions: next });
  const replace = (nextVersion: XmpCourseVersion) =>
    catalog.versions.map((item) =>
      item.id === nextVersion.id ? nextVersion : item,
    );
  const allSafe = version.safetyChecks.every(
    (check) => check.status === "pass",
  );

  if (command.kind === "strategy.apply") {
    if (command.actor.role !== "author")
      return finish(
        catalog,
        command,
        "rejected",
        "只有课程教师可以创建策略适配草稿",
      );
    if (
      version.id !== catalog.activePublishedVersionId ||
      version.status !== "published" ||
      !version.signature
    )
      return finish(
        catalog,
        command,
        "rejected",
        "策略只能基于当前签名发布版本创建草稿",
      );
    const strategyId = command.payload?.strategyId?.trim() ?? "";
    const targetPhaseId = command.payload?.targetPhaseId?.trim() ?? "";
    const adaptationText = command.payload?.adaptationText?.trim() ?? "";
    if (
      !strategyId ||
      catalog.versions.some((item) => item.sourceStrategyId === strategyId)
    )
      return finish(
        catalog,
        command,
        "rejected",
        "策略来源缺失或已经创建课程草稿",
      );
    if (!version.phases.some((item) => item.id === targetPhaseId))
      return finish(catalog, command, "rejected", "目标教学节拍不存在");
    if (adaptationText.length < 18)
      return finish(
        catalog,
        command,
        "rejected",
        "策略适配必须包含明确教学动作与观察方法",
      );
    if (/姓名|电话|人脸|诊断|排名|优生|差生|能力分数/.test(adaptationText))
      return finish(
        catalog,
        command,
        "rejected",
        "课程适配不得包含身份、诊断、排名或儿童标签",
      );
    const nextVersion: XmpCourseVersion = {
      ...version,
      id: `strategy-draft-${strategyId}`,
      semanticVersion: `${version.semanticVersion}-strategy.1`,
      basedOnVersionId: version.id,
      status: "draft",
      ageBand: command.payload?.ageBand?.trim() || version.ageBand,
      durationMinutes: version.durationMinutes + 3,
      phases: version.phases.map((phase) =>
        phase.id === targetPhaseId
          ? {
              ...phase,
              duration: phase.duration + 3,
              detail: adaptationText,
              intent: `${phase.intent}；验证迁移后的教学策略是否适用`,
            }
          : { ...phase },
      ),
      assets: version.assets.map((asset) => ({ ...asset })),
      safetyChecks: version.safetyChecks.map((check) => ({ ...check })),
      changeSummary: [
        `复用审核策略 ${strategyId}`,
        `调整“${version.phases.find((item) => item.id === targetPhaseId)?.title}”节拍并增加 3 分钟`,
        "保留再次验证标记，尚未提交审核或发布",
      ],
      author: command.actor,
      reviewer: null,
      createdAt: command.issuedAt,
      reviewedAt: null,
      publishedAt: null,
      signature: null,
      sourceStrategyId: strategyId,
    };
    return finish(catalog, command, "accepted", undefined, () =>
      update([nextVersion, ...catalog.versions]),
    );
  }

  if (command.kind === "review.submit") {
    if (
      command.actor.id !== version.author.id ||
      command.actor.role !== "author"
    )
      return finish(catalog, command, "rejected", "仅版本作者可送审");
    if (
      !(["draft", "changes-requested"] as XmpCourseVersionStatus[]).includes(
        version.status,
      )
    )
      return finish(catalog, command, "rejected", "当前状态不可送审");
    if (!allSafe)
      return finish(catalog, command, "rejected", "安全门禁未全部通过");
    return finish(catalog, command, "accepted", undefined, () =>
      update(replace({ ...version, status: "in-review" })),
    );
  }
  if (command.kind === "review.approve") {
    if (
      command.actor.role !== "reviewer" ||
      command.actor.id === version.author.id
    )
      return finish(catalog, command, "rejected", "审核人与作者必须分离");
    if (version.status !== "in-review")
      return finish(catalog, command, "rejected", "版本尚未进入审核");
    if (!allSafe)
      return finish(catalog, command, "rejected", "安全门禁未全部通过");
    return finish(catalog, command, "accepted", undefined, () =>
      update(
        replace({
          ...version,
          status: "approved",
          reviewer: command.actor,
          reviewedAt: command.issuedAt,
        }),
      ),
    );
  }
  if (command.kind === "review.request-changes") {
    if (command.actor.role !== "reviewer" || version.status !== "in-review")
      return finish(catalog, command, "rejected", "仅教研审核中的版本可退回");
    return finish(catalog, command, "accepted", undefined, () =>
      update(
        replace({
          ...version,
          status: "changes-requested",
          reviewer: command.actor,
          reviewedAt: command.issuedAt,
        }),
      ),
    );
  }
  if (command.kind === "release.publish") {
    if (command.actor.role !== "release-manager")
      return finish(catalog, command, "rejected", "仅发布经理可发布");
    if (version.status !== "approved" || !version.reviewer || !allSafe)
      return finish(
        catalog,
        command,
        "rejected",
        "版本未完成独立审核与安全门禁",
      );
    const next = catalog.versions.map((item) =>
      item.id === version.id
        ? {
            ...item,
            status: "published" as const,
            publishedAt: command.issuedAt,
            signature: signature(item, command.issuedAt),
          }
        : item.id === catalog.activePublishedVersionId
          ? { ...item, status: "superseded" as const }
          : item,
    );
    return finish(catalog, command, "accepted", undefined, () =>
      update(next, { activePublishedVersionId: version.id }),
    );
  }
  if (command.kind === "release.rollback") {
    if (command.actor.role !== "release-manager")
      return finish(catalog, command, "rejected", "仅发布经理可回滚");
    if (version.status !== "superseded" || !version.signature)
      return finish(
        catalog,
        command,
        "rejected",
        "只能回滚到曾经签名发布的版本",
      );
    const next = catalog.versions.map((item) =>
      item.id === version.id
        ? {
            ...item,
            status: "published" as const,
            publishedAt: command.issuedAt,
            signature: signature(item, command.issuedAt),
          }
        : item.id === catalog.activePublishedVersionId
          ? { ...item, status: "superseded" as const }
          : item,
    );
    return finish(catalog, command, "accepted", undefined, () =>
      update(next, { activePublishedVersionId: version.id }),
    );
  }
  if (command.actor.role !== "release-manager")
    return finish(catalog, command, "rejected", "仅发布经理可切换课堂版本");
  if (command.payload?.classroomLifecycle !== "preflight")
    return finish(catalog, command, "rejected", "课堂已开始，禁止替换锁定版本");
  if (
    version.id !== catalog.activePublishedVersionId ||
    version.status !== "published" ||
    !version.signature
  )
    return finish(catalog, command, "rejected", "课堂只能锁定当前签名发布版本");
  return finish(catalog, command, "accepted", undefined, () => ({
    ...catalog,
    classroomPinnedVersionId: version.id,
  }));
}

export function diffCourseVersions(
  current: XmpCourseVersion,
  previous?: XmpCourseVersion,
) {
  if (!previous)
    return current.changeSummary.map((detail) => ({
      field: "版本说明",
      detail,
    }));
  const changes: { field: string; detail: string }[] = [];
  if (current.durationMinutes !== previous.durationMinutes)
    changes.push({
      field: "课堂时长",
      detail: `${previous.durationMinutes} → ${current.durationMinutes} 分钟`,
    });
  current.phases.forEach((phase) => {
    const before = previous.phases.find((item) => item.id === phase.id);
    if (
      before &&
      (before.duration !== phase.duration || before.prompt !== phase.prompt)
    )
      changes.push({
        field: phase.title,
        detail: `${before.duration} → ${phase.duration} 分钟 · 追问脚本已更新`,
      });
  });
  current.assets.forEach((asset) => {
    const before = previous.assets.find((item) => item.id === asset.id);
    if (before && before.checksum !== asset.checksum)
      changes.push({
        field: asset.label,
        detail: `${before.checksum} → ${asset.checksum}`,
      });
  });
  return changes;
}

export function restoreCourseCatalog(value: unknown): XmpCourseCatalog | null {
  if (!value || typeof value !== "object") return null;
  const candidate = value as Partial<XmpCourseCatalog>;
  if (
    candidate.version !== XMP_COURSE_CATALOG_VERSION ||
    candidate.courseId !== XMP_SEED_COURSE_ID ||
    !Array.isArray(candidate.versions) ||
    !candidate.versions.length
  )
    return null;
  const active = candidate.versions.find(
    (item) => item.id === candidate.activePublishedVersionId,
  );
  const pinned = candidate.versions.find(
    (item) => item.id === candidate.classroomPinnedVersionId,
  );
  if (
    !active ||
    active.status !== "published" ||
    !active.signature ||
    !pinned ||
    !pinned.signature ||
    !Array.isArray(candidate.commandLog) ||
    !Array.isArray(candidate.processedCommandIds)
  )
    return null;
  return candidate as XmpCourseCatalog;
}
