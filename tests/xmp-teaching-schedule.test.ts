import { describe, expect, it } from "vitest";
import {
  applyScheduleCommand,
  createInitialScheduleCatalog,
  detectScheduleConflicts,
  getBatchReadiness,
  restoreScheduleCatalog,
  XMP_SCHEDULER,
  XMP_SCHEDULE_RELEASE_MANAGER,
  type XmpScheduleActor,
  type XmpScheduleCommandKind,
} from "../lib/xmp/teaching-schedule";

function command(
  kind: XmpScheduleCommandKind,
  actor: XmpScheduleActor,
  id = kind,
  slotId?: string,
  payload?: Record<string, string>,
) {
  return {
    id,
    kind,
    batchId: "schedule-w31-v2",
    slotId,
    actor,
    issuedAt: "2026-07-28T12:00:00+08:00",
    payload,
  };
}

function resolvedCatalog() {
  let catalog = createInitialScheduleCatalog();
  catalog = applyScheduleCommand(
    catalog,
    command("slot.resolve-conflict", XMP_SCHEDULER, "resolve", "slot-mon-b", {
      startTime: "10:10",
      endTime: "10:45",
      teacherId: "teacher-lin-demo",
      teacherName: "林老师",
      roomId: "room-a302",
      roomName: "创想教室 A-302",
      deviceKitId: "kit-b",
      deviceKitName: "奇妙宠套件 B",
    }),
  ).catalog;
  return applyScheduleCommand(
    catalog,
    command("slot.materials-ready", XMP_SCHEDULER, "materials", "slot-tue-a"),
  ).catalog;
}

describe("XMP teaching schedule delivery protocol", () => {
  it("detects teacher, room and device collisions", () => {
    const draft = createInitialScheduleCatalog().batches[0];
    const conflicts = detectScheduleConflicts(draft.slots);
    expect(conflicts).toHaveLength(3);
    expect(conflicts.map((item) => item.kind).sort()).toEqual([
      "device",
      "room",
      "teacher",
    ]);
  });

  it("blocks validation while conflicts or readiness gaps remain", () => {
    const result = applyScheduleCommand(
      createInitialScheduleCatalog(),
      command("batch.validate", XMP_SCHEDULER),
    );
    expect(result.record).toMatchObject({
      outcome: "rejected",
      reason: "仍有 3 项资源冲突",
    });
  });

  it("resolves collisions and completes materials readiness", () => {
    const catalog = resolvedCatalog();
    const readiness = getBatchReadiness(catalog.batches[0]);
    expect(readiness.conflicts).toHaveLength(0);
    expect(readiness.readySlots).toBe(6);
    expect(readiness.ready).toBe(true);
  });

  it("binds a signed course release to every draft slot", () => {
    const catalog = applyScheduleCommand(
      createInitialScheduleCatalog(),
      command("batch.bind-course-release", XMP_SCHEDULER, "bind", undefined, {
        courseVersionId: "seed-v3.3.0",
        courseSemanticVersion: "3.3.0",
        courseSignature: "LOCAL-SIG-NEW",
      }),
    ).catalog;
    expect(
      catalog.batches[0].slots.every(
        (slot) => slot.courseVersionId === "seed-v3.3.0",
      ),
    ).toBe(true);
  });

  it("validates and publishes an immutable schedule batch", () => {
    let catalog = resolvedCatalog();
    catalog = applyScheduleCommand(
      catalog,
      command("batch.validate", XMP_SCHEDULER, "validate"),
    ).catalog;
    expect(catalog.batches[0].status).toBe("validated");
    const published = applyScheduleCommand(
      catalog,
      command("batch.publish", XMP_SCHEDULE_RELEASE_MANAGER, "publish"),
    );
    expect(published.record.outcome).toBe("accepted");
    expect(published.catalog.activePublishedBatchId).toBe("schedule-w31-v2");
    expect(published.catalog.batches[0].signature).toMatch(/^LOCAL-SCHED-/);
    expect(published.catalog.batches[1].status).toBe("superseded");
  });

  it("supports conflict-safe substitution and rejects a busy teacher", () => {
    const base = resolvedCatalog();
    const accepted = applyScheduleCommand(
      base,
      command("slot.substitute", XMP_SCHEDULER, "sub-ok", "slot-fri-a", {
        teacherId: "teacher-lin-demo",
        teacherName: "林老师",
      }),
    );
    expect(accepted.record.outcome).toBe("accepted");
    expect(
      accepted.catalog.batches[0].slots.find((slot) => slot.id === "slot-fri-a")
        ?.deliveryStatus,
    ).toBe("substitute");
    const rejected = applyScheduleCommand(
      createInitialScheduleCatalog(),
      command("slot.substitute", XMP_SCHEDULER, "sub-busy", "slot-mon-b", {
        teacherId: "teacher-wen-demo",
        teacherName: "文老师",
      }),
    );
    expect(rejected.record.outcome).toBe("rejected");
  });

  it("rolls back only to a previously signed schedule batch", () => {
    let catalog = resolvedCatalog();
    catalog = applyScheduleCommand(
      catalog,
      command("batch.validate", XMP_SCHEDULER, "v"),
    ).catalog;
    catalog = applyScheduleCommand(
      catalog,
      command("batch.publish", XMP_SCHEDULE_RELEASE_MANAGER, "p"),
    ).catalog;
    const rollback = applyScheduleCommand(catalog, {
      ...command("batch.rollback", XMP_SCHEDULE_RELEASE_MANAGER, "r"),
      batchId: "schedule-w31-v1",
    });
    expect(rollback.record.outcome).toBe("accepted");
    expect(rollback.catalog.activePublishedBatchId).toBe("schedule-w31-v1");
  });

  it("is idempotent and rejects corrupted snapshots", () => {
    const initial = createInitialScheduleCatalog();
    const first = applyScheduleCommand(
      initial,
      command("slot.materials-ready", XMP_SCHEDULER, "same", "slot-tue-a"),
    );
    const duplicate = applyScheduleCommand(
      first.catalog,
      command("slot.materials-ready", XMP_SCHEDULER, "same", "slot-tue-a"),
    );
    expect(duplicate.record.outcome).toBe("duplicate");
    expect(restoreScheduleCatalog(first.catalog)).not.toBeNull();
    expect(
      restoreScheduleCatalog({
        ...first.catalog,
        activePublishedBatchId: "missing",
      }),
    ).toBeNull();
  });
});
