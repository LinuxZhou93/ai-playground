import { describe, expect, it } from "vitest";
import {
  applyInsightCommand,
  createInitialLearningInsights,
  restoreLearningInsights,
  type XmpInsightCommand,
} from "../lib/xmp/learning-insights";

function command(
  kind: XmpInsightCommand["kind"],
  payload?: XmpInsightCommand["payload"],
  actorId = "principal-teacher",
): XmpInsightCommand {
  return {
    id: `${kind}-${Math.random()}`,
    kind,
    actorId,
    issuedAt: "2026-07-28T10:00:00+08:00",
    payload,
  };
}

describe("XMP learning insights", () => {
  it("generates hypotheses only when two multi-source sessions meet coverage", () => {
    const result = applyInsightCommand(
      createInitialLearningInsights(),
      command("analysis.generate"),
    );
    expect(result.insights.stage).toBe("hypotheses");
    expect(result.audit.outcome).toBe("accepted");
  });

  it("rejects analysis when evidence coverage is insufficient", () => {
    const state = createInitialLearningInsights();
    state.sessions = state.sessions.map((item) => ({ ...item, coverage: 42 }));
    const result = applyInsightCommand(state, command("analysis.generate"));
    expect(result.insights.stage).toBe("evidence");
    expect(result.audit.outcome).toBe("rejected");
  });

  it("keeps blocked low-confidence hypotheses outside teacher decisions", () => {
    let state = applyInsightCommand(
      createInitialLearningInsights(),
      command("analysis.generate"),
    ).insights;
    const result = applyInsightCommand(
      state,
      command("hypothesis.accept", { hypothesisId: "hypothesis-movement" }),
    );
    expect(result.audit.outcome).toBe("rejected");
    expect(result.insights.stage).toBe("hypotheses");
  });

  it("requires the assigned teacher to review a hypothesis", () => {
    const state = applyInsightCommand(
      createInitialLearningInsights(),
      command("analysis.generate"),
    ).insights;
    const result = applyInsightCommand(
      state,
      command(
        "hypothesis.accept",
        { hypothesisId: "hypothesis-peer-question" },
        "edge-ai",
      ),
    );
    expect(result.audit.outcome).toBe("rejected");
  });

  it("requires teacher editing before applying an AI draft", () => {
    let state = applyInsightCommand(
      createInitialLearningInsights(),
      command("analysis.generate"),
    ).insights;
    state = applyInsightCommand(
      state,
      command("hypothesis.accept", {
        hypothesisId: "hypothesis-peer-question",
      }),
    ).insights;
    const result = applyInsightCommand(state, command("adjustment.apply"));
    expect(result.audit.outcome).toBe("rejected");
    expect(result.insights.stage).toBe("reviewed");
  });

  it("rejects diagnostic labels in a next-lesson adjustment", () => {
    let state = applyInsightCommand(
      createInitialLearningInsights(),
      command("analysis.generate"),
    ).insights;
    state = applyInsightCommand(
      state,
      command("hypothesis.accept", {
        hypothesisId: "hypothesis-peer-question",
      }),
    ).insights;
    const result = applyInsightCommand(
      state,
      command("adjustment.edit", {
        adjustment: "下一课重点关注差生排名，并记录每一个孩子的结果。",
      }),
    );
    expect(result.audit.outcome).toBe("rejected");
  });

  it("applies only a teacher-confirmed adjustment to an unpublished lesson draft", () => {
    let state = applyInsightCommand(
      createInitialLearningInsights(),
      command("analysis.generate"),
    ).insights;
    state = applyInsightCommand(
      state,
      command("hypothesis.accept", {
        hypothesisId: "hypothesis-peer-question",
      }),
    ).insights;
    state = applyInsightCommand(
      state,
      command("adjustment.edit", {
        adjustment:
          "分享前安排同伴追问，每组说一条观察事实，教师记录主动引用是否出现。",
      }),
    ).insights;
    state = applyInsightCommand(state, command("adjustment.apply")).insights;
    expect(state.stage).toBe("applied");
    expect(state.adjustment.appliedTo).toContain("教师草稿");
  });

  it("is idempotent for repeated commands", () => {
    const state = createInitialLearningInsights();
    const input = command("analysis.generate");
    const once = applyInsightCommand(state, input).insights;
    const twice = applyInsightCommand(once, input);
    expect(twice.audit.outcome).toBe("duplicate");
    expect(twice.insights.revision).toBe(once.revision);
  });

  it("refuses restored snapshots that weaken privacy boundaries or contain identifiers", () => {
    const state = createInitialLearningInsights();
    expect(restoreLearningInsights(state)).not.toBeNull();
    expect(
      restoreLearningInsights({
        ...state,
        boundaries: { ...state.boundaries, childRanking: true },
      }),
    ).toBeNull();
    expect(
      restoreLearningInsights({ ...state, childName: "演示儿童" }),
    ).toBeNull();
  });
});
