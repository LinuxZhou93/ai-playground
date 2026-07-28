"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  applyCourseCommand,
  createInitialCourseCatalog,
  restoreCourseCatalog,
  XMP_COURSE_AUTHOR,
  XMP_COURSE_REVIEWER,
  XMP_RELEASE_MANAGER,
  type XmpCourseActor,
  type XmpCourseCatalog,
  type XmpCourseCommandKind,
} from "@/lib/xmp/course-assets";

const STORAGE_KEY = "xmp-course-assets-v1";

type CourseAssetContextValue = {
  catalog: XmpCourseCatalog;
  hydrated: boolean;
  issueCommand: (
    kind: XmpCourseCommandKind,
    versionId: string,
    actor: XmpCourseActor,
    classroomLifecycle?: "preflight" | "live" | "paused" | "ended",
  ) => void;
  resetCatalog: () => void;
  applyStrategy: (input: {
    strategyId: string;
    targetPhaseId: string;
    adaptationText: string;
    ageBand: string;
  }) => void;
};

const CourseAssetContext = createContext<CourseAssetContextValue | null>(null);

function commandId() {
  return typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `course-${Date.now()}`;
}

export function XmpCourseAssetProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [catalog, setCatalog] = useState(createInitialCourseCatalog);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const restored = restoreCourseCatalog(JSON.parse(stored));
        if (restored) setCatalog(restored);
      }
    } catch {
      window.localStorage.removeItem(STORAGE_KEY);
    } finally {
      setHydrated(true);
    }
  }, []);

  useEffect(() => {
    if (hydrated)
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(catalog));
  }, [catalog, hydrated]);

  useEffect(() => {
    const sync = (event: StorageEvent) => {
      if (event.key !== STORAGE_KEY || !event.newValue) return;
      try {
        const restored = restoreCourseCatalog(JSON.parse(event.newValue));
        if (restored) setCatalog(restored);
      } catch {
        // 损坏的跨标签页快照不会污染当前课程资产。
      }
    };
    window.addEventListener("storage", sync);
    return () => window.removeEventListener("storage", sync);
  }, []);

  const issueCommand = useCallback(
    (
      kind: XmpCourseCommandKind,
      versionId: string,
      actor: XmpCourseActor,
      classroomLifecycle?: "preflight" | "live" | "paused" | "ended",
    ) => {
      setCatalog(
        (current) =>
          applyCourseCommand(current, {
            id: commandId(),
            kind,
            versionId,
            actor,
            issuedAt: new Date().toISOString(),
            payload: { classroomLifecycle },
          }).catalog,
      );
    },
    [],
  );

  const applyStrategy = useCallback(
    (input: {
      strategyId: string;
      targetPhaseId: string;
      adaptationText: string;
      ageBand: string;
    }) => {
      setCatalog(
        (current) =>
          applyCourseCommand(current, {
            id: commandId(),
            kind: "strategy.apply",
            versionId: current.activePublishedVersionId,
            actor: XMP_COURSE_AUTHOR,
            issuedAt: new Date().toISOString(),
            payload: input,
          }).catalog,
      );
    },
    [],
  );

  const value = useMemo(
    () => ({
      catalog,
      hydrated,
      issueCommand,
      applyStrategy,
      resetCatalog: () => setCatalog(createInitialCourseCatalog()),
    }),
    [applyStrategy, catalog, hydrated, issueCommand],
  );
  return (
    <CourseAssetContext.Provider value={value}>
      {children}
    </CourseAssetContext.Provider>
  );
}

export function useXmpCourseAssets() {
  const value = useContext(CourseAssetContext);
  if (!value)
    throw new Error(
      "useXmpCourseAssets must be used inside XmpCourseAssetProvider",
    );
  return value;
}

export { XMP_COURSE_AUTHOR, XMP_COURSE_REVIEWER, XMP_RELEASE_MANAGER };
