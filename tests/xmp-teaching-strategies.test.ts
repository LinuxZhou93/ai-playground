import { describe, expect, it } from "vitest";
import {
  applyStrategyCommand,
  createInitialTeachingStrategyLibrary,
  restoreTeachingStrategyLibrary,
  type XmpStrategyCommand,
} from "../lib/xmp/teaching-strategies";

function command(
  kind: XmpStrategyCommand["kind"],
  payload?: XmpStrategyCommand["payload"],
  actorId = "principal-teacher",
  id = `${kind}-${Math.random()}`,
): XmpStrategyCommand {
  return { id, kind, actorId, issuedAt: "2026-07-28T14:00:00+08:00", payload };
}

function importCandidate() {
  return applyStrategyCommand(
    createInitialTeachingStrategyLibrary(),
    command("candidate.import", {
      sourceInsightId: "INSIGHT-TEST-1",
      sourceInquiry: "怎样让更多小组主动引用观察证据？",
      acceptedHypothesis: true,
      teacherEdited: true,
      appliedToNextLesson: true,
      title: "同伴追问促进证据表达",
      pattern: "分享前先说事实，再向另一组提出一个证据问题。",
      limitation: "目前只有两节覆盖达标课堂，迁移后需要重新验证。",
    }),
  ).library;
}

function approvedCandidate() {
  let library = importCandidate();
  const strategyId = library.strategies[0].id;
  library = applyStrategyCommand(
    library,
    command("review.submit", { strategyId }),
  ).library;
  return applyStrategyCommand(
    library,
    command("review.approve", { strategyId }, "research-lead-demo"),
  ).library;
}

describe("XMP teaching strategy library", () => {
  it("imports only a teacher-accepted, edited and applied insight", () => {
    expect(importCandidate().strategies[0]).toMatchObject({
      status: "candidate",
      sourceInsightId: "INSIGHT-TEST-1",
      author: { id: "principal-teacher" },
    });
    const rejected = applyStrategyCommand(
      createInitialTeachingStrategyLibrary(),
      command("candidate.import", {
        sourceInsightId: "INSIGHT-TEST-2",
        acceptedHypothesis: true,
        teacherEdited: false,
        appliedToNextLesson: true,
      }),
    );
    expect(rejected.audit.outcome).toBe("rejected");
  });

  it("prevents importing the same insight twice", () => {
    const result = applyStrategyCommand(
      importCandidate(),
      command("candidate.import", {
        sourceInsightId: "INSIGHT-TEST-1",
        acceptedHypothesis: true,
        teacherEdited: true,
        appliedToNextLesson: true,
      }),
    );
    expect(result.audit.outcome).toBe("rejected");
  });

  it("blocks child labels and diagnostic language at ingress", () => {
    const result = applyStrategyCommand(
      createInitialTeachingStrategyLibrary(),
      command("candidate.import", {
        sourceInsightId: "INSIGHT-UNSAFE",
        acceptedHypothesis: true,
        teacherEdited: true,
        appliedToNextLesson: true,
        pattern: "对差生进行能力分数排名并形成诊断。",
      }),
    );
    expect(result.audit.outcome).toBe("rejected");
  });

  it("requires two coverage-qualified evidence sessions before review", () => {
    const library = importCandidate();
    library.strategies[0].evidence[1].coverage = 40;
    const result = applyStrategyCommand(
      library,
      command("review.submit", { strategyId: library.strategies[0].id }),
    );
    expect(result.audit.outcome).toBe("rejected");
    expect(result.audit.detail).toContain("两节");
  });

  it("separates the strategy author from the independent reviewer", () => {
    let library = importCandidate();
    const strategyId = library.strategies[0].id;
    library = applyStrategyCommand(
      library,
      command("review.submit", { strategyId }),
    ).library;
    expect(
      applyStrategyCommand(
        library,
        command("review.approve", { strategyId }, "principal-teacher"),
      ).audit.outcome,
    ).toBe("rejected");
    const approved = applyStrategyCommand(
      library,
      command("review.approve", { strategyId }, "research-lead-demo"),
    );
    expect(approved.library.strategies[0]).toMatchObject({
      status: "approved",
      version: "1.0",
      reviewer: { id: "research-lead-demo" },
    });
  });

  it("creates an unpublished adaptation only from an approved strategy", () => {
    const library = approvedCandidate();
    const strategyId = library.strategies[0].id;
    const result = applyStrategyCommand(
      library,
      command("adaptation.create", {
        strategyId,
        targetCourse: "会呼吸的种子",
        targetCourseVersionId: "seed-v3.2.0",
        targetPhaseId: "share",
        ageBand: "5–6 岁",
        teacherAuthoredAction:
          "分享前安排三分钟同伴追问，教师记录匿名小组是否主动引用观察事实。",
      }),
    );
    expect(result.audit.outcome).toBe("accepted");
    expect(result.library.adaptations[0]).toMatchObject({
      status: "draft-created",
      targetPhaseId: "share",
    });
  });

  it("requires the target course teacher and a concrete adaptation", () => {
    const library = approvedCandidate();
    const result = applyStrategyCommand(
      library,
      command(
        "adaptation.create",
        {
          strategyId: library.strategies[0].id,
          targetCourseVersionId: "seed-v3.2.0",
          targetPhaseId: "share",
          teacherAuthoredAction: "直接自动应用。",
        },
        "edge-ai",
      ),
    );
    expect(result.audit.outcome).toBe("rejected");
  });

  it("is idempotent and refuses weakened governance snapshots", () => {
    const library = importCandidate();
    const input = command(
      "review.submit",
      { strategyId: library.strategies[0].id },
      "principal-teacher",
      "same-command",
    );
    const once = applyStrategyCommand(library, input).library;
    const twice = applyStrategyCommand(once, input);
    expect(twice.audit.outcome).toBe("duplicate");
    expect(twice.library.revision).toBe(once.revision);
    expect(restoreTeachingStrategyLibrary(library)).not.toBeNull();
    expect(
      restoreTeachingStrategyLibrary({
        ...library,
        boundaries: { ...library.boundaries, automaticPublishing: true },
      }),
    ).toBeNull();
  });
});
