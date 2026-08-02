import { describe, expect, it } from "vitest";
import {
  applyClassroomCommand,
  createInitialClassroomRuntime,
  restoreClassroomRuntime,
  XMP_DEMO_OPERATOR,
  XMP_DEMO_TEACHER,
  type XmpRuntimeCommand,
} from "../lib/xmp/classroom-runtime";

const baseTime = "2026-07-28T09:20:00+08:00";

function teacherCommand(
  id: string,
  kind: XmpRuntimeCommand["kind"],
  payload?: XmpRuntimeCommand["payload"],
): XmpRuntimeCommand {
  return { id, kind, payload, actor: XMP_DEMO_TEACHER, issuedAt: baseTime };
}

describe("XMP classroom runtime", () => {
  it("starts only from a healthy preflight with the trusted teacher", () => {
    const initial = createInitialClassroomRuntime(baseTime);
    const result = applyClassroomCommand(
      initial,
      teacherCommand("cmd-start", "session.start"),
    );
    expect(result.record.outcome).toBe("accepted");
    expect(result.runtime.lifecycle).toBe("live");
    expect(result.runtime.aiEnabled).toBe(true);
    expect(result.runtime.startedAt).toBe(baseTime);
  });

  it("does not apply the same command id twice", () => {
    const initial = createInitialClassroomRuntime(baseTime);
    const command = teacherCommand("cmd-idempotent", "session.start");
    const first = applyClassroomCommand(initial, command).runtime;
    const second = applyClassroomCommand(first, command);
    expect(second.record.outcome).toBe("duplicate");
    expect(second.runtime.revision).toBe(first.revision);
    expect(second.runtime.commandLog).toHaveLength(1);
  });

  it("rejects a teacher command from an untrusted actor", () => {
    const initial = createInitialClassroomRuntime(baseTime);
    const result = applyClassroomCommand(initial, {
      ...teacherCommand("cmd-forged", "session.start"),
      actor: { ...XMP_DEMO_TEACHER, id: "forged-teacher" },
    });
    expect(result.record.outcome).toBe("rejected");
    expect(result.runtime.lifecycle).toBe("preflight");
  });

  it("allows trusted operations to recover devices but not control teaching", () => {
    const initial = createInitialClassroomRuntime(baseTime);
    const recovered = applyClassroomCommand(initial, {
      id: "cmd-operator-device",
      kind: "device.recover",
      actor: XMP_DEMO_OPERATOR,
      issuedAt: baseTime,
      payload: { deviceId: "E-01" },
    });
    expect(recovered.record.outcome).toBe("accepted");

    const forbidden = applyClassroomCommand(recovered.runtime, {
      id: "cmd-operator-start",
      kind: "session.start",
      actor: XMP_DEMO_OPERATOR,
      issuedAt: baseTime,
    });
    expect(forbidden.record.outcome).toBe("rejected");
    expect(forbidden.runtime.lifecycle).toBe("preflight");
  });

  it("pauses and enters quiet safety when the edge hub disconnects", () => {
    const live = applyClassroomCommand(
      createInitialClassroomRuntime(baseTime),
      teacherCommand("cmd-live", "session.start"),
    ).runtime;
    const result = applyClassroomCommand(
      live,
      teacherCommand("cmd-fault", "device.disconnect", { deviceId: "E-01" }),
    );
    expect(result.runtime.health).toBe("offline");
    expect(result.runtime.lifecycle).toBe("paused");
    expect(result.runtime.safetyMode).toBe("quiet");
    expect(result.runtime.aiEnabled).toBe(false);
  });

  it("recovers health without automatically resuming the class or AI", () => {
    const live = applyClassroomCommand(
      createInitialClassroomRuntime(baseTime),
      teacherCommand("cmd-live-2", "session.start"),
    ).runtime;
    const offline = applyClassroomCommand(
      live,
      teacherCommand("cmd-offline", "device.disconnect", {
        deviceId: "E-01",
      }),
    ).runtime;
    const recovered = applyClassroomCommand(
      offline,
      teacherCommand("cmd-recover", "device.recover", {
        deviceId: "E-01",
        latencyMs: 9,
      }),
    ).runtime;
    expect(recovered.health).toBe("healthy");
    expect(recovered.lifecycle).toBe("paused");
    expect(recovered.safetyMode).toBe("quiet");
    expect(recovered.aiEnabled).toBe(false);
  });

  it("requires explicit release before a teacher-controlled class can resume", () => {
    const live = applyClassroomCommand(
      createInitialClassroomRuntime(baseTime),
      teacherCommand("cmd-live-3", "session.start"),
    ).runtime;
    const takeover = applyClassroomCommand(
      live,
      teacherCommand("cmd-takeover", "safety.takeover"),
    ).runtime;
    const blocked = applyClassroomCommand(
      takeover,
      teacherCommand("cmd-resume-blocked", "session.resume"),
    );
    expect(blocked.record.outcome).toBe("rejected");
    const released = applyClassroomCommand(
      blocked.runtime,
      teacherCommand("cmd-release", "safety.release"),
    ).runtime;
    expect(released.lifecycle).toBe("paused");
    expect(released.safetyMode).toBe("quiet");
  });

  it("rejects a heartbeat whose device identity does not match", () => {
    const initial = createInitialClassroomRuntime(baseTime);
    const result = applyClassroomCommand(initial, {
      id: "cmd-heartbeat-forged",
      kind: "device.heartbeat",
      issuedAt: baseTime,
      actor: {
        id: "T-01",
        kind: "device",
        role: "device",
        trust: "demo-verified",
        displayName: "伪造设备",
      },
      payload: { deviceId: "E-01", latencyMs: 3 },
    });
    expect(result.record.outcome).toBe("rejected");
    expect(
      result.runtime.devices.find((item) => item.id === "E-01")
        ?.heartbeatSequence,
    ).toBe(4218);
  });

  it("keeps ended sessions terminal", () => {
    const ended = applyClassroomCommand(
      createInitialClassroomRuntime(baseTime),
      teacherCommand("cmd-end", "session.end"),
    ).runtime;
    const result = applyClassroomCommand(
      ended,
      teacherCommand("cmd-resume-ended", "session.resume"),
    );
    expect(result.record.outcome).toBe("rejected");
    expect(result.runtime.lifecycle).toBe("ended");
  });

  it("rejects corrupted or forged local snapshots", () => {
    const initial = createInitialClassroomRuntime(baseTime);
    expect(restoreClassroomRuntime(initial)).toEqual(initial);
    expect(restoreClassroomRuntime({ ...initial, lifecycle: "hacked" })).toBe(
      null,
    );
    expect(
      restoreClassroomRuntime({
        ...initial,
        teacher: { ...initial.teacher, id: "forged-teacher" },
      }),
    ).toBe(null);
  });
});
