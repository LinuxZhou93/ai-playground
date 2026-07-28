import { describe, expect, it } from "vitest";
import {
  applyAccessCommand,
  canXmpRoleViewModule,
  createInitialAccessCatalog,
  evaluateAccess,
  restoreAccessCatalog,
  type XmpAccessCommand,
  type XmpAccessCommandKind,
} from "../lib/xmp/access-control";

const now = "2026-07-28T09:30:00+08:00";

function command(
  kind: XmpAccessCommandKind,
  actorId: string,
  id = kind,
  extra: Partial<XmpAccessCommand> = {},
): XmpAccessCommand {
  return { id, kind, actorId, issuedAt: now, ...extra };
}

function teacherFleetDecision(catalog = createInitialAccessCatalog()) {
  return evaluateAccess(catalog, {
    principalId: "principal-teacher",
    sessionId: "session-teacher",
    module: "fleet",
    action: "operate",
    tenantId: "demo-xmp-001",
    campusId: "campus-xmp-west",
    at: now,
  });
}

describe("XMP tenant identity and access protocol", () => {
  it("centralizes module visibility for XMP product roles", () => {
    expect(canXmpRoleViewModule("operator", "access")).toBe(true);
    expect(canXmpRoleViewModule("teacher", "classroom")).toBe(true);
    expect(canXmpRoleViewModule("teacher", "teaching")).toBe(true);
    expect(canXmpRoleViewModule("teacher", "fleet")).toBe(false);
    expect(canXmpRoleViewModule("family", "growth")).toBe(true);
    expect(canXmpRoleViewModule("family", "operations")).toBe(false);
  });

  it("allows base-role access and denies missing capabilities", () => {
    const catalog = createInitialAccessCatalog();
    const classroom = evaluateAccess(catalog, {
      principalId: "principal-teacher",
      sessionId: "session-teacher",
      module: "classroom",
      action: "operate",
      tenantId: "demo-xmp-001",
      campusId: "campus-xmp-west",
      at: now,
    });
    expect(classroom).toMatchObject({ allowed: true, source: "base-role" });
    expect(teacherFleetDecision()).toMatchObject({
      allowed: false,
      source: "denied",
    });
  });

  it("rejects cross-tenant, cross-campus and expired sessions", () => {
    const catalog = createInitialAccessCatalog();
    expect(
      evaluateAccess(catalog, {
        principalId: "principal-teacher",
        sessionId: "session-teacher",
        module: "classroom",
        action: "view",
        tenantId: "another-tenant",
        campusId: "campus-xmp-west",
        at: now,
      }).reason,
    ).toContain("租户");
    expect(
      evaluateAccess(catalog, {
        principalId: "principal-teacher",
        sessionId: "session-teacher",
        module: "classroom",
        action: "view",
        tenantId: "demo-xmp-001",
        campusId: "campus-xmp-east",
        at: now,
      }).reason,
    ).toContain("校区");
    expect(
      evaluateAccess(catalog, {
        principalId: "principal-teacher",
        sessionId: "session-teacher",
        module: "classroom",
        action: "view",
        tenantId: "demo-xmp-001",
        campusId: "campus-xmp-west",
        at: "2026-07-29T09:30:00+08:00",
      }).reason,
    ).toContain("过期");
  });

  it("requires distinct admin and security approvals for a high-risk grant", () => {
    let catalog = createInitialAccessCatalog();
    catalog = applyAccessCommand(
      catalog,
      command("request.approve", "principal-admin", "approve-admin", {
        requestId: "request-teacher-fleet",
      }),
    ).catalog;
    expect(catalog.requests[0].status).toBe("first-approved");
    expect(teacherFleetDecision(catalog).allowed).toBe(false);
    catalog = applyAccessCommand(
      catalog,
      command("request.approve", "principal-security", "approve-security", {
        requestId: "request-teacher-fleet",
      }),
    ).catalog;
    expect(catalog.requests[0].status).toBe("active");
    expect(teacherFleetDecision(catalog)).toMatchObject({
      allowed: true,
      source: "temporary-grant",
      requestId: "request-teacher-fleet",
    });
  });

  it("prevents self approval, duplicate approval and unauthorized approvers", () => {
    const unauthorized = applyAccessCommand(
      createInitialAccessCatalog(),
      command("request.approve", "principal-teacher", "self", {
        requestId: "request-teacher-fleet",
      }),
    );
    expect(unauthorized.record.outcome).toBe("rejected");
    let catalog = applyAccessCommand(
      createInitialAccessCatalog(),
      command("request.approve", "principal-admin", "a1", {
        requestId: "request-teacher-fleet",
      }),
    ).catalog;
    const duplicateActor = applyAccessCommand(
      catalog,
      command("request.approve", "principal-admin", "a2", {
        requestId: "request-teacher-fleet",
      }),
    );
    expect(duplicateActor.record.outcome).toBe("rejected");
  });

  it("revokes a temporary grant immediately", () => {
    let catalog = createInitialAccessCatalog();
    for (const [id, actorId] of [
      ["a", "principal-admin"],
      ["b", "principal-security"],
    ] as const) {
      catalog = applyAccessCommand(
        catalog,
        command("request.approve", actorId, id, {
          requestId: "request-teacher-fleet",
        }),
      ).catalog;
    }
    expect(teacherFleetDecision(catalog).allowed).toBe(true);
    catalog = applyAccessCommand(
      catalog,
      command("grant.revoke", "principal-security", "revoke", {
        requestId: "request-teacher-fleet",
      }),
    ).catalog;
    expect(catalog.requests[0].status).toBe("revoked");
    expect(teacherFleetDecision(catalog).allowed).toBe(false);
  });

  it("suspends a principal and revokes every active session", () => {
    const result = applyAccessCommand(
      createInitialAccessCatalog(),
      command("principal.suspend", "principal-admin", "suspend", {
        principalId: "principal-teacher",
      }),
    );
    expect(
      result.catalog.principals.find((item) => item.id === "principal-teacher")
        ?.status,
    ).toBe("suspended");
    expect(
      result.catalog.sessions.find((item) => item.id === "session-teacher")
        ?.revokedAt,
    ).toBe(now);
    expect(teacherFleetDecision(result.catalog).reason).toContain("停用");
  });

  it("rotates sessions and revokes the previous credential", () => {
    const result = applyAccessCommand(
      createInitialAccessCatalog(),
      command("session.rotate", "principal-admin", "rotate", {
        principalId: "principal-admin",
      }),
    );
    expect(result.record.outcome).toBe("accepted");
    expect(result.catalog.activeSessionId).not.toBe("session-admin");
    expect(
      result.catalog.sessions.find((item) => item.id === "session-admin")
        ?.revokedAt,
    ).toBe(now);
  });

  it("is idempotent and rejects corrupt or cross-tenant snapshots", () => {
    const initial = createInitialAccessCatalog();
    const first = applyAccessCommand(
      initial,
      command("request.approve", "principal-admin", "same", {
        requestId: "request-teacher-fleet",
      }),
    );
    const duplicate = applyAccessCommand(
      first.catalog,
      command("request.approve", "principal-admin", "same", {
        requestId: "request-teacher-fleet",
      }),
    );
    expect(duplicate.record.outcome).toBe("duplicate");
    expect(restoreAccessCatalog(first.catalog)).not.toBeNull();
    expect(
      restoreAccessCatalog({ ...first.catalog, activeSessionId: "missing" }),
    ).toBeNull();
    expect(
      restoreAccessCatalog({
        ...first.catalog,
        principals: first.catalog.principals.map((item, index) =>
          index === 0
            ? { ...item, scope: { ...item.scope, tenantId: "cross-tenant" } }
            : item,
        ),
      }),
    ).toBeNull();
  });
});
