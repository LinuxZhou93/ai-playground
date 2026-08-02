import { describe, expect, it } from "vitest";
import {
  applyTeachingCommand,
  createInitialTeachingWorkbench,
  getTeachingEfficiency,
  restoreTeachingWorkbench,
  type XmpTeachingCommand,
  type XmpTeachingCommandKind,
} from "../lib/xmp/teaching-workbench";

const now = "2026-07-28T09:20:00+08:00";

function command(
  kind: XmpTeachingCommandKind,
  actorId = "principal-teacher",
  extra: Partial<XmpTeachingCommand> = {},
): XmpTeachingCommand {
  return { id: `${kind}-${actorId}`, kind, actorId, issuedAt: now, ...extra };
}

function liveWorkbench() {
  let workbench = createInitialTeachingWorkbench();
  for (const [kind, id] of [
    ["prep.generate", "prepare"],
    ["readiness.verify", "ready"],
    ["session.start", "start"],
  ] as const) {
    workbench = applyTeachingCommand(
      workbench,
      command(kind, "principal-teacher", { id }),
    ).workbench;
  }
  return workbench;
}

describe("XMP AI teaching workbench protocol", () => {
  it("requires teacher preparation and five-part readiness before class", () => {
    let workbench = createInitialTeachingWorkbench();
    expect(
      applyTeachingCommand(workbench, command("session.start")).audit.outcome,
    ).toBe("rejected");
    workbench = applyTeachingCommand(
      workbench,
      command("prep.generate"),
    ).workbench;
    expect(workbench.stage).toBe("prepared");
    workbench = applyTeachingCommand(
      workbench,
      command("readiness.verify"),
    ).workbench;
    expect(workbench.stage).toBe("ready");
    workbench = applyTeachingCommand(
      workbench,
      command("session.start"),
    ).workbench;
    expect(workbench).toMatchObject({ stage: "live", aiEnabled: true });
  });

  it("refuses readiness when a critical edge device is unavailable", () => {
    let workbench = createInitialTeachingWorkbench();
    workbench = applyTeachingCommand(
      workbench,
      command("prep.generate"),
    ).workbench;
    workbench.devices[0].status = "offline";
    const result = applyTeachingCommand(workbench, command("readiness.verify"));
    expect(result.audit.detail).toContain("关键教学设备");
  });

  it("keeps AI cues advisory and teacher-decided", () => {
    const workbench = liveWorkbench();
    const outsider = applyTeachingCommand(
      workbench,
      command("cue.accept", "edge-policy", {
        payload: { cueId: "cue-clarify" },
      }),
    );
    expect(outsider.audit.outcome).toBe("rejected");
    const accepted = applyTeachingCommand(
      workbench,
      command("cue.accept", "principal-teacher", {
        id: "accept-cue",
        payload: { cueId: "cue-clarify" },
      }),
    );
    expect(
      accepted.workbench.cues.find((item) => item.id === "cue-clarify")?.status,
    ).toBe("accepted");
  });

  it("captures only teacher-confirmed anonymous facts", () => {
    const workbench = liveWorkbench();
    const rejected = applyTeachingCommand(
      workbench,
      command("evidence.capture", "principal-teacher", {
        payload: { groupId: "group-a", fact: "张三的诊断结果" },
      }),
    );
    expect(rejected.audit.outcome).toBe("rejected");
    const accepted = applyTeachingCommand(
      workbench,
      command("evidence.capture", "principal-teacher", {
        id: "capture-safe",
        payload: {
          groupId: "group-a",
          fact: "青芽组用瓶壁水珠支持了种子正在呼吸的猜想。",
        },
      }),
    );
    expect(accepted.workbench.evidence[0]).toMatchObject({
      groupId: "group-a",
      teacherConfirmed: true,
    });
  });

  it("pauses on critical device degradation and requires explicit teacher resume", () => {
    let workbench = liveWorkbench();
    workbench = applyTeachingCommand(
      workbench,
      command("device.degrade", "edge-policy", {
        payload: { deviceId: "device-edge-a301" },
      }),
    ).workbench;
    expect(workbench).toMatchObject({ stage: "paused", aiEnabled: false });
    expect(
      applyTeachingCommand(workbench, command("session.resume")).audit.outcome,
    ).toBe("rejected");
    workbench = applyTeachingCommand(
      workbench,
      command("device.restore", "edge-policy", {
        id: "restore-edge",
        payload: { deviceId: "device-edge-a301" },
      }),
    ).workbench;
    workbench = applyTeachingCommand(
      workbench,
      command("session.resume"),
    ).workbench;
    expect(workbench).toMatchObject({ stage: "live", aiEnabled: true });
  });

  it("isolates AI during teacher takeover until explicit release", () => {
    let workbench = liveWorkbench();
    workbench = applyTeachingCommand(
      workbench,
      command("teacher.takeover"),
    ).workbench;
    expect(workbench).toMatchObject({
      teacherTakeover: true,
      aiEnabled: false,
    });
    workbench = applyTeachingCommand(
      workbench,
      command("teacher.release"),
    ).workbench;
    expect(workbench).toMatchObject({
      teacherTakeover: false,
      aiEnabled: true,
    });
  });

  it("requires confirmed evidence before teacher signs the post-class reflection", () => {
    let workbench = liveWorkbench();
    workbench = applyTeachingCommand(
      workbench,
      command("session.end"),
    ).workbench;
    expect(
      applyTeachingCommand(workbench, command("reflection.sign")).audit.outcome,
    ).toBe("rejected");
    workbench.stage = "live";
    workbench = applyTeachingCommand(
      workbench,
      command("evidence.capture", "principal-teacher", {
        id: "evidence-before-end",
        payload: {
          groupId: "group-b",
          fact: "云朵组通过轮流表达形成了两种可验证的解释。",
        },
      }),
    ).workbench;
    workbench = applyTeachingCommand(
      workbench,
      command("session.end", "principal-teacher", { id: "end-after-evidence" }),
    ).workbench;
    workbench = applyTeachingCommand(
      workbench,
      command("reflection.sign"),
    ).workbench;
    expect(workbench).toMatchObject({ stage: "signed" });
  });

  it("calculates teacher-efficiency outcomes without claiming live production data", () => {
    let workbench = createInitialTeachingWorkbench();
    expect(getTeachingEfficiency(workbench).preparationMinutesSaved).toBe(0);
    workbench = applyTeachingCommand(
      workbench,
      command("prep.generate"),
    ).workbench;
    expect(getTeachingEfficiency(workbench)).toMatchObject({
      preparationMinutesSaved: 36,
      connectedDeviceCount: 5,
    });
  });

  it("is idempotent and refuses corrupt, unsafe or cross-tenant snapshots", () => {
    const workbench = createInitialTeachingWorkbench();
    const first = applyTeachingCommand(workbench, command("prep.generate"));
    expect(
      applyTeachingCommand(first.workbench, command("prep.generate")).audit
        .outcome,
    ).toBe("duplicate");
    expect(restoreTeachingWorkbench(workbench)?.revision).toBe(1);
    expect(
      restoreTeachingWorkbench({ ...workbench, tenantId: "other" }),
    ).toBeNull();
    expect(
      restoreTeachingWorkbench({
        ...workbench,
        evidence: [
          {
            id: "unsafe",
            groupId: "group-a",
            fact: "电话 13812345678",
            source: "teacher-note",
            createdAt: now,
            teacherConfirmed: true,
          },
        ],
      }),
    ).toBeNull();
  });
});
