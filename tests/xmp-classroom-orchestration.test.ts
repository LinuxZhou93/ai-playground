import { describe, expect, it } from "vitest";
import {
  applyOrchestrationCommand,
  createInitialClassroomOrchestration,
  deriveInterventions,
  restoreClassroomOrchestration,
  type XmpClassroomContext,
  type XmpOrchestrationActor,
  type XmpTeachingSignalWindow,
} from "../lib/xmp/classroom-orchestration";

const teacher: XmpOrchestrationActor = {
  id: "teacher-wen-demo",
  kind: "teacher",
  displayName: "文老师",
  trusted: true,
};

const device: XmpOrchestrationActor = {
  id: "E-01",
  kind: "device",
  displayName: "园所边缘中枢 E-01",
  trusted: true,
};

const liveContext: XmpClassroomContext = {
  lifecycle: "live",
  health: "healthy",
  safetyMode: "normal",
  activePhaseId: "question",
  trustedDeviceIds: ["E-01", "T-01", "CP-A301"],
};

function signal(id = "signal-04"): XmpTeachingSignalWindow {
  return {
    id,
    sessionId: "XMP-CLS-A301-20260728",
    phaseId: "question",
    phaseTitle: "问题建构",
    observedAt: "2026-07-28T09:26:00+08:00",
    windowSeconds: 90,
    scene: "collective",
    scope: "multi-end-fusion",
    retention: "metrics-24h-evidence-pending-review",
    rawMediaRetained: false,
    sources: ["fixed-camera", "rokid-glasses", "companion-mic"],
    coverage: [
      {
        source: "fixed-camera",
        label: "教室机位",
        status: "live",
        coverage: 90,
        observation: "覆盖群体互动",
        blindSpot: "缺少近场语境",
      },
    ],
    evidenceCandidates: [],
    metrics: {
      participationCoverage: 58,
      peerResponseCount: 2,
      openQuestionCount: 3,
      averageWaitSeconds: 2.4,
      ambientLevelDb: 66,
      activeMaterialStations: 1,
      anonymousResponses: 18,
    },
  };
}

describe("XMP classroom orchestration", () => {
  it("lets only a trusted teacher confirm authorized evidence with an observation note", () => {
    const initial = createInitialClassroomOrchestration();
    const evidenceId = initial.signalWindows[0].evidenceCandidates[0].id;
    const rejected = applyOrchestrationCommand(
      initial,
      {
        id: "cmd-evidence-empty",
        kind: "evidence.confirm",
        issuedAt: "2026-07-28T09:27:00+08:00",
        actor: teacher,
        payload: { evidenceId, teacherNote: "" },
      },
      liveContext,
    );
    expect(rejected.outcome).toBe("rejected");

    const confirmed = applyOrchestrationCommand(
      initial,
      {
        id: "cmd-evidence-confirm",
        kind: "evidence.confirm",
        issuedAt: "2026-07-28T09:27:10+08:00",
        actor: teacher,
        payload: {
          evidenceId,
          teacherNote: "现场观察确认其能解释叶片分类依据。",
        },
      },
      liveContext,
    );
    expect(confirmed.outcome).toBe("accepted");
    expect(
      confirmed.orchestration.signalWindows[0].evidenceCandidates[0].status,
    ).toBe("teacher-confirmed");
  });

  it("derives explainable group-level teaching proposals", () => {
    const proposals = deriveInterventions(signal());
    expect(proposals.map((item) => item.kind)).toEqual([
      "participation",
      "pace",
      "question",
      "materials",
    ]);
    expect(proposals.every((item) => item.status === "proposed")).toBe(true);
    expect(proposals[0].rationale).toContain("不指向任何幼儿");
  });

  it("accepts governed multi-end fusion signals from trusted edge devices", () => {
    const initial = createInitialClassroomOrchestration();
    const result = applyOrchestrationCommand(
      initial,
      {
        id: "cmd-ingest-1",
        kind: "signal.ingest",
        issuedAt: "2026-07-28T09:26:01+08:00",
        actor: device,
        payload: { window: signal() },
      },
      liveContext,
    );
    expect(result.outcome).toBe("accepted");
    expect(result.orchestration.signalWindows[0].id).toBe("signal-04");
    expect(result.orchestration.interventions[0].status).toBe("proposed");
  });

  it("rejects untrusted device ingestion", () => {
    const result = applyOrchestrationCommand(
      createInitialClassroomOrchestration(),
      {
        id: "cmd-ingest-2",
        kind: "signal.ingest",
        issuedAt: "2026-07-28T09:26:01+08:00",
        actor: { ...device, trusted: false },
        payload: { window: signal() },
      },
      liveContext,
    );
    expect(result.outcome).toBe("rejected");
    expect(result.reason).toContain("可信边缘中枢");
  });

  it("rejects raw media retention and identity-bearing signals", () => {
    const rawSignal = {
      ...signal(),
      rawMediaRetained: true,
    } as unknown as XmpTeachingSignalWindow;
    const rawResult = applyOrchestrationCommand(
      createInitialClassroomOrchestration(),
      {
        id: "cmd-ingest-raw",
        kind: "signal.ingest",
        issuedAt: "2026-07-28T09:26:01+08:00",
        actor: device,
        payload: { window: rawSignal },
      },
      liveContext,
    );
    expect(rawResult.outcome).toBe("rejected");

    const identitySignal = {
      ...signal("signal-identity"),
      phaseTitle: "幼儿姓名分析",
    };
    const identityResult = applyOrchestrationCommand(
      createInitialClassroomOrchestration(),
      {
        id: "cmd-ingest-identity",
        kind: "signal.ingest",
        issuedAt: "2026-07-28T09:26:01+08:00",
        actor: device,
        payload: { window: identitySignal },
      },
      liveContext,
    );
    expect(identityResult.outcome).toBe("rejected");
  });

  it("requires a trusted teacher to accept or edit a proposal", () => {
    const initial = createInitialClassroomOrchestration();
    const interventionId = initial.interventions[0].id;
    const result = applyOrchestrationCommand(
      initial,
      {
        id: "cmd-accept-untrusted",
        kind: "intervention.accept",
        issuedAt: "2026-07-28T09:25:00+08:00",
        actor: { ...teacher, trusted: false },
        payload: { interventionId },
      },
      liveContext,
    );
    expect(result.outcome).toBe("rejected");
    expect(result.reason).toContain("可信教师");
  });

  it("supports teacher edit before application", () => {
    const initial = createInitialClassroomOrchestration();
    const interventionId = initial.interventions[0].id;
    const edited = applyOrchestrationCommand(
      initial,
      {
        id: "cmd-edit-1",
        kind: "intervention.edit",
        issuedAt: "2026-07-28T09:25:00+08:00",
        actor: teacher,
        payload: {
          interventionId,
          teacherAction: "先请每组选择一条观察证据，再与邻组交换理由。",
        },
      },
      liveContext,
    );
    expect(edited.outcome).toBe("accepted");
    expect(edited.orchestration.interventions[0].status).toBe("edited");
    expect(edited.orchestration.interventions[0].teacherName).toBe("文老师");
  });

  it("never auto-applies and requires a live healthy classroom", () => {
    const initial = createInitialClassroomOrchestration();
    const interventionId = initial.interventions[0].id;
    const accepted = applyOrchestrationCommand(
      initial,
      {
        id: "cmd-accept-1",
        kind: "intervention.accept",
        issuedAt: "2026-07-28T09:25:00+08:00",
        actor: teacher,
        payload: { interventionId },
      },
      liveContext,
    ).orchestration;
    expect(accepted.appliedActions).toHaveLength(0);

    const blocked = applyOrchestrationCommand(
      accepted,
      {
        id: "cmd-apply-paused",
        kind: "intervention.apply",
        issuedAt: "2026-07-28T09:25:05+08:00",
        actor: teacher,
        payload: { interventionId },
      },
      { ...liveContext, lifecycle: "paused" },
    );
    expect(blocked.outcome).toBe("rejected");
    expect(blocked.orchestration.appliedActions).toHaveLength(0);
  });

  it("blocks AI intervention in offline or teacher-control safety modes", () => {
    const initial = createInitialClassroomOrchestration();
    const interventionId = initial.interventions[0].id;
    const accepted = applyOrchestrationCommand(
      initial,
      {
        id: "cmd-accept-2",
        kind: "intervention.accept",
        issuedAt: "2026-07-28T09:25:00+08:00",
        actor: teacher,
        payload: { interventionId },
      },
      liveContext,
    ).orchestration;
    const blocked = applyOrchestrationCommand(
      accepted,
      {
        id: "cmd-apply-offline",
        kind: "intervention.apply",
        issuedAt: "2026-07-28T09:25:05+08:00",
        actor: teacher,
        payload: { interventionId },
      },
      { ...liveContext, health: "offline", safetyMode: "teacher-control" },
    );
    expect(blocked.outcome).toBe("rejected");
    expect(blocked.reason).toContain("安全降级");
  });

  it("records an applied teacher action with required revalidation", () => {
    const initial = createInitialClassroomOrchestration();
    const interventionId = initial.interventions[0].id;
    const accepted = applyOrchestrationCommand(
      initial,
      {
        id: "cmd-accept-3",
        kind: "intervention.accept",
        issuedAt: "2026-07-28T09:25:00+08:00",
        actor: teacher,
        payload: { interventionId },
      },
      liveContext,
    ).orchestration;
    const applied = applyOrchestrationCommand(
      accepted,
      {
        id: "cmd-apply-1",
        kind: "intervention.apply",
        issuedAt: "2026-07-28T09:25:05+08:00",
        actor: teacher,
        payload: { interventionId },
      },
      liveContext,
    );
    expect(applied.outcome).toBe("accepted");
    expect(applied.orchestration.interventions[0].status).toBe("applied");
    expect(applied.orchestration.appliedActions[0].revalidation).toBe(
      "required",
    );
  });

  it("rejects restored state that weakens privacy boundaries", () => {
    const initial = createInitialClassroomOrchestration();
    expect(restoreClassroomOrchestration(initial)).not.toBeNull();
    expect(
      restoreClassroomOrchestration({
        ...initial,
        signalWindows: [
          { ...initial.signalWindows[0], rawMediaRetained: true },
        ],
      }),
    ).toBeNull();
  });
});
