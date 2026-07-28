import { z } from "zod";

export const xmpCorrelationSchema = z
  .string()
  .min(8)
  .max(96)
  .regex(/^[A-Za-z0-9._:-]+$/);

const obviousSensitivePattern =
  /(?:1[3-9]\d{9})|(?:\d{17}[\dXx])|(?:[\w.+-]+@[\w.-]+\.[A-Za-z]{2,})/;

export const xmpEventSchema = z
  .object({
    id: z.string().uuid(),
    correlationId: xmpCorrelationSchema,
    kind: z.enum([
      "classroom.started",
      "classroom.paused",
      "classroom.adjusted",
      "schedule.adjusted",
      "schedule.validated",
      "schedule.published",
      "schedule.rolled_back",
      "evidence.candidate",
      "evidence.approved",
      "evidence.rejected",
      "family.dispatched",
      "family.feedback_candidate",
      "family.feedback_rejected",
      "device.degraded",
      "device.diagnostic_completed",
      "device.recovered",
      "access.requested",
      "access.approved",
      "access.granted",
      "access.revoked",
      "access.session_revoked",
    ]),
    domain: z.enum([
      "classroom",
      "scheduling",
      "growth",
      "family",
      "fleet",
      "access",
    ]),
    title: z.string().trim().min(1).max(120),
    detail: z.string().trim().min(1).max(600),
    actor: z.string().trim().min(1).max(80),
    entity: z.string().trim().min(1).max(120),
    occurredAt: z.string().datetime({ offset: true }),
    privacy: z.enum(["anonymous", "aggregate", "teacher-reviewed"]),
    source: z.literal("local-interaction"),
  })
  .strict()
  .superRefine((event, context) => {
    const expectedDomain = event.kind.startsWith("classroom.")
      ? "classroom"
      : event.kind.startsWith("schedule.")
        ? "scheduling"
        : event.kind.startsWith("evidence.")
          ? "growth"
          : event.kind.startsWith("family.")
            ? "family"
            : event.kind.startsWith("device.")
              ? "fleet"
              : "access";
    if (event.domain !== expectedDomain) {
      context.addIssue({
        code: "custom",
        path: ["domain"],
        message: "事件类型与业务域不匹配",
      });
    }

    const searchableText = [
      event.title,
      event.detail,
      event.actor,
      event.entity,
    ].join(" ");
    if (obviousSensitivePattern.test(searchableText)) {
      context.addIssue({
        code: "custom",
        path: ["detail"],
        message: "事件中不得包含电话、身份证号或邮箱",
      });
    }
  });
