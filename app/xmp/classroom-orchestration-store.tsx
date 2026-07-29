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
  applyOrchestrationCommand,
  createInitialClassroomOrchestration,
  restoreClassroomOrchestration,
  type XmpClassroomContext,
  type XmpClassroomOrchestration,
  type XmpOrchestrationCommand,
  type XmpTeachingSignalWindow,
  type XmpTeachingScene,
} from "@/lib/xmp/classroom-orchestration";
import { useXmpClassroomRuntime } from "./classroom-runtime-store";
import { useXmpCourseAssets } from "./course-asset-store";

const STORAGE_KEY = "xmp-classroom-orchestration-v1";

type ClassroomOrchestrationContextValue = {
  orchestration: XmpClassroomOrchestration;
  classroomContext: XmpClassroomContext;
  hydrated: boolean;
  lastResult: { outcome: string; reason: string } | null;
  ingestSignal: (window: XmpTeachingSignalWindow) => void;
  acceptIntervention: (interventionId: string) => void;
  editIntervention: (interventionId: string, teacherAction: string) => void;
  applyIntervention: (interventionId: string) => void;
  dismissIntervention: (interventionId: string) => void;
  selectScene: (scene: XmpTeachingScene) => void;
  reviewEvidence: (
    evidenceId: string,
    decision: "confirm" | "reject",
    teacherNote?: string,
  ) => void;
  resetOrchestration: () => void;
};

const ClassroomOrchestrationContext =
  createContext<ClassroomOrchestrationContextValue | null>(null);

function commandId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto)
    return crypto.randomUUID();
  return `orchestration-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export function XmpClassroomOrchestrationProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { runtime } = useXmpClassroomRuntime();
  const { catalog } = useXmpCourseAssets();
  const [orchestration, setOrchestration] = useState(
    createInitialClassroomOrchestration,
  );
  const [hydrated, setHydrated] = useState(false);
  const [lastResult, setLastResult] = useState<{
    outcome: string;
    reason: string;
  } | null>(null);

  const pinnedCourse =
    catalog.versions.find(
      (version) => version.id === catalog.classroomPinnedVersionId,
    ) ?? catalog.versions[0];
  const activePhase =
    pinnedCourse?.phases[
      Math.min(runtime.activeStep, Math.max(pinnedCourse.phases.length - 1, 0))
    ];
  const classroomContext = useMemo<XmpClassroomContext>(
    () => ({
      lifecycle: runtime.lifecycle,
      health: runtime.health,
      safetyMode: runtime.safetyMode,
      activePhaseId: activePhase?.id ?? "unknown",
      trustedDeviceIds: runtime.devices
        .filter((device) => device.trust === "demo-verified")
        .map((device) => device.id),
    }),
    [
      runtime.lifecycle,
      runtime.health,
      runtime.safetyMode,
      runtime.devices,
      activePhase?.id,
    ],
  );

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const restored = restoreClassroomOrchestration(JSON.parse(stored));
        if (restored) setOrchestration(restored);
      }
    } catch {
      window.localStorage.removeItem(STORAGE_KEY);
    } finally {
      setHydrated(true);
    }
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(orchestration));
  }, [hydrated, orchestration]);

  const issue = useCallback(
    (command: XmpOrchestrationCommand) => {
      setOrchestration((current) => {
        const result = applyOrchestrationCommand(
          current,
          command,
          classroomContext,
        );
        setLastResult({ outcome: result.outcome, reason: result.reason });
        return result.orchestration;
      });
    },
    [classroomContext],
  );

  const teacherActor = {
    id: runtime.teacher.id,
    kind: "teacher" as const,
    displayName: runtime.teacher.displayName,
    trusted: runtime.teacher.trust === "demo-verified",
  };

  const ingestSignal = useCallback(
    (window: XmpTeachingSignalWindow) => {
      const edge = runtime.devices.find((device) => device.id === "E-01");
      issue({
        id: commandId(),
        kind: "signal.ingest",
        issuedAt: new Date().toISOString(),
        actor: {
          id: edge?.id ?? "E-01",
          kind: "device",
          displayName: edge?.name ?? "园所边缘中枢 E-01",
          trusted: edge?.trust === "demo-verified",
        },
        payload: { window },
      });
    },
    [issue, runtime.devices],
  );

  const teacherCommand = useCallback(
    (
      kind:
        | "intervention.accept"
        | "intervention.edit"
        | "intervention.apply"
        | "intervention.dismiss",
      interventionId: string,
      teacherAction?: string,
    ) =>
      issue({
        id: commandId(),
        kind,
        issuedAt: new Date().toISOString(),
        actor: teacherActor,
        payload: { interventionId, teacherAction },
      }),
    [issue, teacherActor],
  );

  const selectScene = useCallback(
    (scene: XmpTeachingScene) =>
      issue({
        id: commandId(),
        kind: "scene.select",
        issuedAt: new Date().toISOString(),
        actor: teacherActor,
        payload: { scene },
      }),
    [issue, teacherActor],
  );

  const reviewEvidence = useCallback(
    (
      evidenceId: string,
      decision: "confirm" | "reject",
      teacherNote?: string,
    ) =>
      issue({
        id: commandId(),
        kind: decision === "confirm" ? "evidence.confirm" : "evidence.reject",
        issuedAt: new Date().toISOString(),
        actor: teacherActor,
        payload: { evidenceId, teacherNote },
      }),
    [issue, teacherActor],
  );

  const value = useMemo<ClassroomOrchestrationContextValue>(
    () => ({
      orchestration,
      classroomContext,
      hydrated,
      lastResult,
      ingestSignal,
      acceptIntervention: (id) => teacherCommand("intervention.accept", id),
      editIntervention: (id, action) =>
        teacherCommand("intervention.edit", id, action),
      applyIntervention: (id) => teacherCommand("intervention.apply", id),
      dismissIntervention: (id) => teacherCommand("intervention.dismiss", id),
      selectScene,
      reviewEvidence,
      resetOrchestration: () => {
        setOrchestration(createInitialClassroomOrchestration());
        setLastResult(null);
      },
    }),
    [
      orchestration,
      classroomContext,
      hydrated,
      lastResult,
      ingestSignal,
      teacherCommand,
      selectScene,
      reviewEvidence,
    ],
  );

  return (
    <ClassroomOrchestrationContext.Provider value={value}>
      {children}
    </ClassroomOrchestrationContext.Provider>
  );
}

export function useXmpClassroomOrchestration() {
  const value = useContext(ClassroomOrchestrationContext);
  if (!value)
    throw new Error(
      "useXmpClassroomOrchestration must be used inside XmpClassroomOrchestrationProvider",
    );
  return value;
}
