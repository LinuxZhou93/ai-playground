import { describe, expect, it } from "vitest";
import {
  applyCourseCommand,
  createInitialCourseCatalog,
  diffCourseVersions,
  restoreCourseCatalog,
  XMP_COURSE_AUTHOR,
  XMP_COURSE_REVIEWER,
  XMP_RELEASE_MANAGER,
  type XmpCourseActor,
  type XmpCourseCatalog,
  type XmpCourseCommandKind,
} from "../lib/xmp/course-assets";

function command(
  kind: XmpCourseCommandKind,
  actor: XmpCourseActor,
  versionId = "seed-v3.3.0",
  id = `${kind}-1`,
  lifecycle: "preflight" | "live" = "preflight",
) {
  return {
    id,
    kind,
    actor,
    versionId,
    issuedAt: "2026-07-28T12:00:00+08:00",
    payload: { classroomLifecycle: lifecycle },
  };
}

function approvedCatalog() {
  let catalog = createInitialCourseCatalog();
  catalog = applyCourseCommand(
    catalog,
    command("review.submit", XMP_COURSE_AUTHOR),
  ).catalog;
  return applyCourseCommand(
    catalog,
    command("review.approve", XMP_COURSE_REVIEWER, "seed-v3.3.0", "approve-1"),
  ).catalog;
}

describe("XMP governed course releases", () => {
  it("requires author submission and an independent reviewer", () => {
    let catalog = createInitialCourseCatalog();
    const wrongSubmit = applyCourseCommand(
      catalog,
      command("review.submit", XMP_COURSE_REVIEWER),
    );
    expect(wrongSubmit.record.outcome).toBe("rejected");
    catalog = applyCourseCommand(
      catalog,
      command("review.submit", XMP_COURSE_AUTHOR),
    ).catalog;
    expect(catalog.versions[0].status).toBe("in-review");
    const selfReviewer = { ...XMP_COURSE_AUTHOR, role: "reviewer" as const };
    expect(
      applyCourseCommand(
        catalog,
        command("review.approve", selfReviewer, "seed-v3.3.0", "self-review"),
      ).record.outcome,
    ).toBe("rejected");
    const approved = applyCourseCommand(
      catalog,
      command(
        "review.approve",
        XMP_COURSE_REVIEWER,
        "seed-v3.3.0",
        "real-review",
      ),
    );
    expect(approved.catalog.versions[0].status).toBe("approved");
  });

  it("blocks submission when any safety gate fails", () => {
    const catalog = createInitialCourseCatalog();
    catalog.versions[0].safetyChecks[0].status = "fail";
    const result = applyCourseCommand(
      catalog,
      command("review.submit", XMP_COURSE_AUTHOR),
    );
    expect(result.record).toMatchObject({
      outcome: "rejected",
      reason: "安全门禁未全部通过",
    });
  });

  it("publishes an immutable signed release and supersedes the old active version", () => {
    const approved = approvedCatalog();
    const result = applyCourseCommand(
      approved,
      command(
        "release.publish",
        XMP_RELEASE_MANAGER,
        "seed-v3.3.0",
        "publish-1",
      ),
    );
    expect(result.record.outcome).toBe("accepted");
    expect(result.catalog.activePublishedVersionId).toBe("seed-v3.3.0");
    expect(result.catalog.classroomPinnedVersionId).toBe("seed-v3.2.0");
    expect(
      result.catalog.versions.find((item) => item.id === "seed-v3.3.0"),
    ).toMatchObject({
      status: "published",
      signature: expect.stringMatching(/^LOCAL-SIG-/),
    });
    expect(
      result.catalog.versions.find((item) => item.id === "seed-v3.2.0")?.status,
    ).toBe("superseded");
  });

  it("keeps a live classroom locked and permits preflight pinning only", () => {
    const published = applyCourseCommand(
      approvedCatalog(),
      command(
        "release.publish",
        XMP_RELEASE_MANAGER,
        "seed-v3.3.0",
        "publish-2",
      ),
    ).catalog;
    const live = applyCourseCommand(
      published,
      command(
        "classroom.pin",
        XMP_RELEASE_MANAGER,
        "seed-v3.3.0",
        "pin-live",
        "live",
      ),
    );
    expect(live.record.outcome).toBe("rejected");
    expect(live.catalog.classroomPinnedVersionId).toBe("seed-v3.2.0");
    const preflight = applyCourseCommand(
      live.catalog,
      command("classroom.pin", XMP_RELEASE_MANAGER, "seed-v3.3.0", "pin-ready"),
    );
    expect(preflight.record.outcome).toBe("accepted");
    expect(preflight.catalog.classroomPinnedVersionId).toBe("seed-v3.3.0");
  });

  it("rolls back only to a previously signed release", () => {
    const published = applyCourseCommand(
      approvedCatalog(),
      command(
        "release.publish",
        XMP_RELEASE_MANAGER,
        "seed-v3.3.0",
        "publish-3",
      ),
    ).catalog;
    const rollback = applyCourseCommand(
      published,
      command(
        "release.rollback",
        XMP_RELEASE_MANAGER,
        "seed-v3.2.0",
        "rollback-1",
      ),
    );
    expect(rollback.record.outcome).toBe("accepted");
    expect(rollback.catalog.activePublishedVersionId).toBe("seed-v3.2.0");
    expect(rollback.catalog.classroomPinnedVersionId).toBe("seed-v3.2.0");
  });

  it("is idempotent and rejects corrupted snapshots", () => {
    const catalog = createInitialCourseCatalog();
    const first = applyCourseCommand(
      catalog,
      command("review.submit", XMP_COURSE_AUTHOR),
    );
    const duplicate = applyCourseCommand(
      first.catalog,
      command("review.submit", XMP_COURSE_AUTHOR),
    );
    expect(duplicate.record.outcome).toBe("duplicate");
    expect(restoreCourseCatalog(first.catalog)).not.toBeNull();
    const corrupt: XmpCourseCatalog = {
      ...first.catalog,
      activePublishedVersionId: "missing",
    };
    expect(restoreCourseCatalog(corrupt)).toBeNull();
  });

  it("produces structured differences between course versions", () => {
    const catalog = createInitialCourseCatalog();
    const changes = diffCourseVersions(
      catalog.versions[0],
      catalog.versions[1],
    );
    expect(changes.map((change) => change.field)).toEqual(
      expect.arrayContaining(["课堂时长", "分享与追问", "教师引导脚本"]),
    );
  });
});
