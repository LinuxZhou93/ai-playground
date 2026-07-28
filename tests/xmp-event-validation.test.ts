import { describe, expect, it } from "vitest";
import { xmpEventSchema } from "../lib/xmp/event-validation";

const validEvent = {
  id: "46c5751a-1119-44d1-89a7-7daf66d631f2",
  correlationId: "CLS-A301-20260728-SEED",
  kind: "classroom.started" as const,
  domain: "classroom" as const,
  title: "教师开始课堂",
  detail: "教师端与六台匿名终端完成课前检查。",
  actor: "主班教师",
  entity: "大一班 · A-301",
  occurredAt: "2026-07-28T09:20:00+08:00",
  privacy: "aggregate" as const,
  source: "local-interaction" as const,
};

describe("XMP event contract", () => {
  it("accepts a bounded aggregate operational event", () => {
    expect(xmpEventSchema.safeParse(validEvent).success).toBe(true);
  });

  it("rejects a client-supplied tenant id", () => {
    expect(
      xmpEventSchema.safeParse({ ...validEvent, tenantId: "other-campus" })
        .success,
    ).toBe(false);
  });

  it("accepts a scheduling event only in the scheduling domain", () => {
    expect(
      xmpEventSchema.safeParse({
        ...validEvent,
        kind: "schedule.published",
        domain: "scheduling",
      }).success,
    ).toBe(true);
    expect(
      xmpEventSchema.safeParse({
        ...validEvent,
        kind: "schedule.published",
        domain: "classroom",
      }).success,
    ).toBe(false);
  });

  it("accepts access decisions only in the access domain", () => {
    expect(
      xmpEventSchema.safeParse({
        ...validEvent,
        kind: "access.granted",
        domain: "access",
      }).success,
    ).toBe(true);
    expect(
      xmpEventSchema.safeParse({
        ...validEvent,
        kind: "access.granted",
        domain: "governance",
      }).success,
    ).toBe(false);
  });

  it("accepts teacher-workbench decisions only in the teaching domain", () => {
    expect(
      xmpEventSchema.safeParse({
        ...validEvent,
        kind: "teaching.evidence_confirmed",
        domain: "teaching",
      }).success,
    ).toBe(true);
    expect(
      xmpEventSchema.safeParse({
        ...validEvent,
        kind: "teaching.evidence_confirmed",
        domain: "growth",
      }).success,
    ).toBe(false);
  });

  it("accepts learning insights only in the insights domain", () => {
    expect(
      xmpEventSchema.safeParse({
        ...validEvent,
        kind: "insight.reviewed",
        domain: "insights",
      }).success,
    ).toBe(true);
    expect(
      xmpEventSchema.safeParse({
        ...validEvent,
        kind: "insight.reviewed",
        domain: "growth",
      }).success,
    ).toBe(false);
  });

  it("accepts strategy lifecycle events only in the strategies domain", () => {
    expect(
      xmpEventSchema.safeParse({
        ...validEvent,
        kind: "strategy.approved",
        domain: "strategies",
      }).success,
    ).toBe(true);
    expect(
      xmpEventSchema.safeParse({
        ...validEvent,
        kind: "strategy.approved",
        domain: "insights",
      }).success,
    ).toBe(false);
  });

  it("rejects an event kind mapped to the wrong business domain", () => {
    expect(
      xmpEventSchema.safeParse({ ...validEvent, domain: "family" }).success,
    ).toBe(false);
  });

  it.each([
    "家长电话 13800138000",
    "证件 11010519491231002X",
    "联系人 child@example.com",
  ])("rejects obvious sensitive data: %s", (detail) => {
    expect(xmpEventSchema.safeParse({ ...validEvent, detail }).success).toBe(
      false,
    );
  });

  it("rejects oversized details", () => {
    expect(
      xmpEventSchema.safeParse({ ...validEvent, detail: "事".repeat(601) })
        .success,
    ).toBe(false);
  });
});
