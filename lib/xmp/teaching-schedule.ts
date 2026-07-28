export const XMP_SCHEDULE_CATALOG_VERSION = 1;

export type XmpScheduleBatchStatus =
  | "draft"
  | "validated"
  | "published"
  | "superseded";

export type XmpScheduleActor = {
  id: string;
  role: "scheduler" | "release-manager";
  displayName: string;
};

export type XmpTeachingSlot = {
  id: string;
  date: string;
  dayLabel: string;
  startTime: string;
  endTime: string;
  classId: string;
  className: string;
  ageBand: string;
  childCount: number;
  teacherId: string;
  teacherName: string;
  roomId: string;
  roomName: string;
  deviceKitId: string;
  deviceKitName: string;
  courseId: string;
  courseTitle: string;
  courseVersionId: string;
  courseSemanticVersion: string;
  courseSignature: string;
  materialsReady: boolean;
  deliveryStatus: "planned" | "ready" | "substitute";
};

export type XmpScheduleBatch = {
  id: string;
  label: string;
  weekStart: string;
  status: XmpScheduleBatchStatus;
  revision: number;
  createdAt: string;
  validatedAt: string | null;
  publishedAt: string | null;
  signature: string | null;
  slots: XmpTeachingSlot[];
};

export type XmpScheduleConflict = {
  id: string;
  kind: "teacher" | "room" | "device";
  severity: "blocking";
  slotIds: [string, string];
  resourceLabel: string;
  detail: string;
};

export type XmpSlotReadiness = {
  slotId: string;
  checks: {
    id: "course" | "teacher" | "room" | "device" | "materials";
    label: string;
    pass: boolean;
  }[];
  ready: boolean;
};

export type XmpScheduleCommandKind =
  | "slot.resolve-conflict"
  | "slot.materials-ready"
  | "slot.substitute"
  | "batch.bind-course-release"
  | "batch.validate"
  | "batch.publish"
  | "batch.rollback";

export type XmpScheduleCommand = {
  id: string;
  kind: XmpScheduleCommandKind;
  batchId: string;
  slotId?: string;
  issuedAt: string;
  actor: XmpScheduleActor;
  payload?: {
    teacherId?: string;
    teacherName?: string;
    roomId?: string;
    roomName?: string;
    deviceKitId?: string;
    deviceKitName?: string;
    startTime?: string;
    endTime?: string;
    courseVersionId?: string;
    courseSemanticVersion?: string;
    courseSignature?: string;
  };
};

export type XmpScheduleCommandRecord = {
  id: string;
  kind: XmpScheduleCommandKind;
  batchId: string;
  slotId?: string;
  actorLabel: string;
  issuedAt: string;
  outcome: "accepted" | "rejected" | "duplicate";
  reason?: string;
};

export type XmpScheduleCatalog = {
  version: typeof XMP_SCHEDULE_CATALOG_VERSION;
  revision: number;
  activePublishedBatchId: string;
  selectedDraftBatchId: string;
  batches: XmpScheduleBatch[];
  commandLog: XmpScheduleCommandRecord[];
  processedCommandIds: string[];
};

export const XMP_SCHEDULER: XmpScheduleActor = {
  id: "scheduler-li-demo",
  role: "scheduler",
  displayName: "教务 李老师",
};

export const XMP_SCHEDULE_RELEASE_MANAGER: XmpScheduleActor = {
  id: "schedule-release-demo",
  role: "release-manager",
  displayName: "园所教学主管",
};

const baseSlots: XmpTeachingSlot[] = [
  {
    id: "slot-mon-a",
    date: "2026-07-27",
    dayLabel: "周一",
    startTime: "09:20",
    endTime: "09:55",
    classId: "class-big-1",
    className: "大一班",
    ageBand: "5–6 岁",
    childCount: 24,
    teacherId: "teacher-wen-demo",
    teacherName: "文老师",
    roomId: "room-a301",
    roomName: "探究教室 A-301",
    deviceKitId: "kit-a",
    deviceKitName: "奇妙宠套件 A",
    courseId: "course-seed-breathing",
    courseTitle: "会呼吸的种子",
    courseVersionId: "seed-v3.2.0",
    courseSemanticVersion: "3.2.0",
    courseSignature: "LOCAL-SIG-32A7E19C",
    materialsReady: true,
    deliveryStatus: "ready",
  },
  {
    id: "slot-mon-b",
    date: "2026-07-27",
    dayLabel: "周一",
    startTime: "09:30",
    endTime: "10:05",
    classId: "class-big-2",
    className: "大二班",
    ageBand: "5–6 岁",
    childCount: 23,
    teacherId: "teacher-wen-demo",
    teacherName: "文老师",
    roomId: "room-a301",
    roomName: "探究教室 A-301",
    deviceKitId: "kit-a",
    deviceKitName: "奇妙宠套件 A",
    courseId: "course-seed-breathing",
    courseTitle: "会呼吸的种子",
    courseVersionId: "seed-v3.2.0",
    courseSemanticVersion: "3.2.0",
    courseSignature: "LOCAL-SIG-32A7E19C",
    materialsReady: true,
    deliveryStatus: "planned",
  },
  {
    id: "slot-tue-a",
    date: "2026-07-28",
    dayLabel: "周二",
    startTime: "09:20",
    endTime: "09:55",
    classId: "class-middle-1",
    className: "中一班",
    ageBand: "4–5 岁",
    childCount: 22,
    teacherId: "teacher-lin-demo",
    teacherName: "林老师",
    roomId: "room-a302",
    roomName: "创想教室 A-302",
    deviceKitId: "kit-b",
    deviceKitName: "奇妙宠套件 B",
    courseId: "course-seed-breathing",
    courseTitle: "会呼吸的种子",
    courseVersionId: "seed-v3.2.0",
    courseSemanticVersion: "3.2.0",
    courseSignature: "LOCAL-SIG-32A7E19C",
    materialsReady: false,
    deliveryStatus: "planned",
  },
  {
    id: "slot-wed-a",
    date: "2026-07-29",
    dayLabel: "周三",
    startTime: "10:10",
    endTime: "10:45",
    classId: "class-small-1",
    className: "小一班",
    ageBand: "3–4 岁",
    childCount: 20,
    teacherId: "teacher-zhou-demo",
    teacherName: "周老师",
    roomId: "room-nature",
    roomName: "自然工坊 N-01",
    deviceKitId: "kit-c",
    deviceKitName: "奇妙宠套件 C",
    courseId: "course-seed-breathing",
    courseTitle: "会呼吸的种子",
    courseVersionId: "seed-v3.2.0",
    courseSemanticVersion: "3.2.0",
    courseSignature: "LOCAL-SIG-32A7E19C",
    materialsReady: true,
    deliveryStatus: "ready",
  },
  {
    id: "slot-thu-a",
    date: "2026-07-30",
    dayLabel: "周四",
    startTime: "09:20",
    endTime: "09:55",
    classId: "class-big-1",
    className: "大一班",
    ageBand: "5–6 岁",
    childCount: 24,
    teacherId: "teacher-wen-demo",
    teacherName: "文老师",
    roomId: "room-a301",
    roomName: "探究教室 A-301",
    deviceKitId: "kit-a",
    deviceKitName: "奇妙宠套件 A",
    courseId: "course-seed-breathing",
    courseTitle: "会呼吸的种子",
    courseVersionId: "seed-v3.2.0",
    courseSemanticVersion: "3.2.0",
    courseSignature: "LOCAL-SIG-32A7E19C",
    materialsReady: true,
    deliveryStatus: "ready",
  },
  {
    id: "slot-fri-a",
    date: "2026-07-31",
    dayLabel: "周五",
    startTime: "14:30",
    endTime: "15:05",
    classId: "class-big-2",
    className: "大二班",
    ageBand: "5–6 岁",
    childCount: 23,
    teacherId: "teacher-chen-demo",
    teacherName: "陈老师",
    roomId: "room-a302",
    roomName: "创想教室 A-302",
    deviceKitId: "kit-b",
    deviceKitName: "奇妙宠套件 B",
    courseId: "course-seed-breathing",
    courseTitle: "会呼吸的种子",
    courseVersionId: "seed-v3.2.0",
    courseSemanticVersion: "3.2.0",
    courseSignature: "LOCAL-SIG-32A7E19C",
    materialsReady: true,
    deliveryStatus: "ready",
  },
];

function cleanSlots() {
  return baseSlots.map((slot) =>
    slot.id === "slot-mon-b"
      ? {
          ...slot,
          startTime: "10:10",
          endTime: "10:45",
          teacherId: "teacher-lin-demo",
          teacherName: "林老师",
          roomId: "room-a302",
          roomName: "创想教室 A-302",
          deviceKitId: "kit-b",
          deviceKitName: "奇妙宠套件 B",
          deliveryStatus: "ready" as const,
        }
      : { ...slot, materialsReady: true, deliveryStatus: "ready" as const },
  );
}

export function createInitialScheduleCatalog(): XmpScheduleCatalog {
  const published: XmpScheduleBatch = {
    id: "schedule-w31-v1",
    label: "第 31 周教学计划 · v1",
    weekStart: "2026-07-27",
    status: "published",
    revision: 1,
    createdAt: "2026-07-24T09:00:00+08:00",
    validatedAt: "2026-07-24T15:00:00+08:00",
    publishedAt: "2026-07-24T16:00:00+08:00",
    signature: "LOCAL-SCHED-31A0C1",
    slots: cleanSlots(),
  };
  const draft: XmpScheduleBatch = {
    id: "schedule-w31-v2",
    label: "第 31 周教学计划 · v2",
    weekStart: "2026-07-27",
    status: "draft",
    revision: 2,
    createdAt: "2026-07-28T08:40:00+08:00",
    validatedAt: null,
    publishedAt: null,
    signature: null,
    slots: baseSlots.map((slot) => ({ ...slot })),
  };
  return {
    version: XMP_SCHEDULE_CATALOG_VERSION,
    revision: 1,
    activePublishedBatchId: published.id,
    selectedDraftBatchId: draft.id,
    batches: [draft, published],
    commandLog: [],
    processedCommandIds: [],
  };
}

function minutes(value: string) {
  const [hour, minute] = value.split(":").map(Number);
  return hour * 60 + minute;
}

function overlaps(a: XmpTeachingSlot, b: XmpTeachingSlot) {
  return (
    a.date === b.date &&
    minutes(a.startTime) < minutes(b.endTime) &&
    minutes(a.endTime) > minutes(b.startTime)
  );
}

export function detectScheduleConflicts(slots: XmpTeachingSlot[]) {
  const conflicts: XmpScheduleConflict[] = [];
  for (let left = 0; left < slots.length; left += 1) {
    for (let right = left + 1; right < slots.length; right += 1) {
      const a = slots[left];
      const b = slots[right];
      if (!overlaps(a, b)) continue;
      const resources: [XmpScheduleConflict["kind"], string, string][] = [
        ["teacher", a.teacherId, a.teacherName],
        ["room", a.roomId, a.roomName],
        ["device", a.deviceKitId, a.deviceKitName],
      ];
      resources.forEach(([kind, aResource, label]) => {
        const bResource =
          kind === "teacher"
            ? b.teacherId
            : kind === "room"
              ? b.roomId
              : b.deviceKitId;
        if (aResource !== bResource) return;
        conflicts.push({
          id: `${kind}-${a.id}-${b.id}`,
          kind,
          severity: "blocking",
          slotIds: [a.id, b.id],
          resourceLabel: label,
          detail: `${a.dayLabel} ${a.startTime}–${a.endTime} 与 ${b.startTime}–${b.endTime} 重叠`,
        });
      });
    }
  }
  return conflicts;
}

export function getSlotReadiness(slot: XmpTeachingSlot): XmpSlotReadiness {
  const checks: XmpSlotReadiness["checks"] = [
    {
      id: "course",
      label: "签名课程版本",
      pass: Boolean(slot.courseVersionId && slot.courseSignature),
    },
    { id: "teacher", label: "主班教师", pass: Boolean(slot.teacherId) },
    { id: "room", label: "教学空间", pass: Boolean(slot.roomId) },
    { id: "device", label: "可信设备套件", pass: Boolean(slot.deviceKitId) },
    { id: "materials", label: "探究材料", pass: slot.materialsReady },
  ];
  return {
    slotId: slot.id,
    checks,
    ready: checks.every((check) => check.pass),
  };
}

export function getBatchReadiness(batch: XmpScheduleBatch) {
  const conflicts = detectScheduleConflicts(batch.slots);
  const slots = batch.slots.map(getSlotReadiness);
  return {
    conflicts,
    slots,
    readySlots: slots.filter((slot) => slot.ready).length,
    ready: conflicts.length === 0 && slots.every((slot) => slot.ready),
  };
}

function scheduleSignature(batch: XmpScheduleBatch, issuedAt: string) {
  const seed = `${batch.id}:${batch.revision}:${batch.slots.map((slot) => `${slot.id}:${slot.courseSignature}`).join("|")}:${issuedAt}`;
  let hash = 2166136261;
  for (let index = 0; index < seed.length; index += 1) {
    hash ^= seed.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return `LOCAL-SCHED-${(hash >>> 0).toString(16).toUpperCase().padStart(8, "0")}`;
}

function commandRecord(
  command: XmpScheduleCommand,
  outcome: XmpScheduleCommandRecord["outcome"],
  reason?: string,
): XmpScheduleCommandRecord {
  return {
    id: command.id,
    kind: command.kind,
    batchId: command.batchId,
    slotId: command.slotId,
    actorLabel: command.actor.displayName,
    issuedAt: command.issuedAt,
    outcome,
    reason,
  };
}

function finish(
  catalog: XmpScheduleCatalog,
  command: XmpScheduleCommand,
  outcome: XmpScheduleCommandRecord["outcome"],
  reason?: string,
  mutate?: (catalog: XmpScheduleCatalog) => XmpScheduleCatalog,
) {
  const base = mutate ? mutate(catalog) : catalog;
  const record = commandRecord(command, outcome, reason);
  return {
    catalog: {
      ...base,
      revision: outcome === "accepted" ? base.revision + 1 : base.revision,
      commandLog: [record, ...base.commandLog].slice(0, 80),
      processedCommandIds:
        outcome === "duplicate"
          ? base.processedCommandIds
          : [command.id, ...base.processedCommandIds].slice(0, 180),
    },
    record,
  };
}

export function applyScheduleCommand(
  catalog: XmpScheduleCatalog,
  command: XmpScheduleCommand,
) {
  if (catalog.processedCommandIds.includes(command.id))
    return finish(catalog, command, "duplicate", "命令已处理");
  const batch = catalog.batches.find((item) => item.id === command.batchId);
  if (!batch) return finish(catalog, command, "rejected", "教学计划批次不存在");
  const updateBatch = (nextBatch: XmpScheduleBatch) => ({
    ...catalog,
    batches: catalog.batches.map((item) =>
      item.id === nextBatch.id ? nextBatch : item,
    ),
  });
  const draftOnly = () =>
    batch.status === "draft"
      ? null
      : finish(catalog, command, "rejected", "只有草稿批次可以修改");

  if (
    command.kind === "slot.resolve-conflict" ||
    command.kind === "slot.materials-ready" ||
    command.kind === "slot.substitute" ||
    command.kind === "batch.bind-course-release"
  ) {
    const blocked = draftOnly();
    if (blocked) return blocked;
    if (command.actor.role !== "scheduler")
      return finish(catalog, command, "rejected", "仅教务排课员可以修改草稿");
  }

  if (command.kind === "slot.resolve-conflict") {
    const slot = batch.slots.find((item) => item.id === command.slotId);
    if (!slot) return finish(catalog, command, "rejected", "课次不存在");
    const payload = command.payload ?? {};
    if (
      !payload.startTime ||
      !payload.endTime ||
      !payload.teacherId ||
      !payload.roomId ||
      !payload.deviceKitId
    )
      return finish(catalog, command, "rejected", "冲突解决方案不完整");
    const nextSlot: XmpTeachingSlot = {
      ...slot,
      startTime: payload.startTime,
      endTime: payload.endTime,
      teacherId: payload.teacherId,
      teacherName: payload.teacherName ?? slot.teacherName,
      roomId: payload.roomId,
      roomName: payload.roomName ?? slot.roomName,
      deviceKitId: payload.deviceKitId,
      deviceKitName: payload.deviceKitName ?? slot.deviceKitName,
      deliveryStatus: "ready",
    };
    const nextBatch = {
      ...batch,
      revision: batch.revision + 1,
      slots: batch.slots.map((item) => (item.id === slot.id ? nextSlot : item)),
    };
    if (
      detectScheduleConflicts(nextBatch.slots).some((conflict) =>
        conflict.slotIds.includes(slot.id),
      )
    )
      return finish(catalog, command, "rejected", "解决方案仍然存在资源冲突");
    return finish(catalog, command, "accepted", undefined, () =>
      updateBatch(nextBatch),
    );
  }

  if (command.kind === "slot.materials-ready") {
    const slot = batch.slots.find((item) => item.id === command.slotId);
    if (!slot) return finish(catalog, command, "rejected", "课次不存在");
    const nextBatch = {
      ...batch,
      revision: batch.revision + 1,
      slots: batch.slots.map((item) =>
        item.id === slot.id
          ? { ...item, materialsReady: true, deliveryStatus: "ready" as const }
          : item,
      ),
    };
    return finish(catalog, command, "accepted", undefined, () =>
      updateBatch(nextBatch),
    );
  }

  if (command.kind === "slot.substitute") {
    const slot = batch.slots.find((item) => item.id === command.slotId);
    if (!slot || !command.payload?.teacherId || !command.payload.teacherName)
      return finish(catalog, command, "rejected", "替课教师信息不完整");
    const nextBatch = {
      ...batch,
      revision: batch.revision + 1,
      slots: batch.slots.map((item) =>
        item.id === slot.id
          ? {
              ...item,
              teacherId: command.payload!.teacherId!,
              teacherName: command.payload!.teacherName!,
              deliveryStatus: "substitute" as const,
            }
          : item,
      ),
    };
    if (
      detectScheduleConflicts(nextBatch.slots).some((conflict) =>
        conflict.slotIds.includes(slot.id),
      )
    )
      return finish(catalog, command, "rejected", "替课教师在该时段已有课程");
    return finish(catalog, command, "accepted", undefined, () =>
      updateBatch(nextBatch),
    );
  }

  if (command.kind === "batch.bind-course-release") {
    const payload = command.payload ?? {};
    if (
      !payload.courseVersionId ||
      !payload.courseSemanticVersion ||
      !payload.courseSignature
    )
      return finish(catalog, command, "rejected", "只能绑定已签名课程版本");
    const nextBatch = {
      ...batch,
      revision: batch.revision + 1,
      slots: batch.slots.map((slot) => ({
        ...slot,
        courseVersionId: payload.courseVersionId!,
        courseSemanticVersion: payload.courseSemanticVersion!,
        courseSignature: payload.courseSignature!,
      })),
    };
    return finish(catalog, command, "accepted", undefined, () =>
      updateBatch(nextBatch),
    );
  }

  if (command.kind === "batch.validate") {
    if (command.actor.role !== "scheduler")
      return finish(catalog, command, "rejected", "仅教务排课员可以提交校验");
    if (batch.status !== "draft")
      return finish(catalog, command, "rejected", "只有草稿批次可以校验");
    const readiness = getBatchReadiness(batch);
    if (!readiness.ready)
      return finish(
        catalog,
        command,
        "rejected",
        readiness.conflicts.length
          ? `仍有 ${readiness.conflicts.length} 项资源冲突`
          : "仍有课次未完成就绪检查",
      );
    return finish(catalog, command, "accepted", undefined, () =>
      updateBatch({
        ...batch,
        status: "validated",
        validatedAt: command.issuedAt,
      }),
    );
  }

  if (command.kind === "batch.publish") {
    if (command.actor.role !== "release-manager")
      return finish(catalog, command, "rejected", "仅园所教学主管可以发布");
    if (batch.status !== "validated" || !getBatchReadiness(batch).ready)
      return finish(catalog, command, "rejected", "批次尚未通过完整校验");
    const next = catalog.batches.map((item) =>
      item.id === batch.id
        ? {
            ...item,
            status: "published" as const,
            publishedAt: command.issuedAt,
            signature: scheduleSignature(item, command.issuedAt),
          }
        : item.id === catalog.activePublishedBatchId
          ? { ...item, status: "superseded" as const }
          : item,
    );
    return finish(catalog, command, "accepted", undefined, () => ({
      ...catalog,
      activePublishedBatchId: batch.id,
      batches: next,
    }));
  }

  if (command.actor.role !== "release-manager")
    return finish(catalog, command, "rejected", "仅园所教学主管可以回滚");
  if (batch.status !== "superseded" || !batch.signature)
    return finish(catalog, command, "rejected", "只能回滚到曾经发布的签名批次");
  const next = catalog.batches.map((item) =>
    item.id === batch.id
      ? {
          ...item,
          status: "published" as const,
          publishedAt: command.issuedAt,
          signature: scheduleSignature(item, command.issuedAt),
        }
      : item.id === catalog.activePublishedBatchId
        ? { ...item, status: "superseded" as const }
        : item,
  );
  return finish(catalog, command, "accepted", undefined, () => ({
    ...catalog,
    activePublishedBatchId: batch.id,
    batches: next,
  }));
}

export function restoreScheduleCatalog(
  value: unknown,
): XmpScheduleCatalog | null {
  if (!value || typeof value !== "object") return null;
  const candidate = value as Partial<XmpScheduleCatalog>;
  if (
    candidate.version !== XMP_SCHEDULE_CATALOG_VERSION ||
    !Array.isArray(candidate.batches) ||
    !candidate.batches.length ||
    !Array.isArray(candidate.commandLog) ||
    !Array.isArray(candidate.processedCommandIds)
  )
    return null;
  const active = candidate.batches.find(
    (batch) => batch.id === candidate.activePublishedBatchId,
  );
  const draft = candidate.batches.find(
    (batch) => batch.id === candidate.selectedDraftBatchId,
  );
  if (!active || active.status !== "published" || !active.signature || !draft)
    return null;
  if (
    candidate.batches.some(
      (batch) => !Array.isArray(batch.slots) || !batch.slots.length,
    )
  )
    return null;
  return candidate as XmpScheduleCatalog;
}
