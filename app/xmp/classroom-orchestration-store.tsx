"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
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
  backend: {
    mode: "local-only" | "supabase";
    state: "checking" | "local" | "synced" | "pending" | "conflict" | "error";
    reason: string;
    lastSyncedAt: string | null;
  };
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
  const [backend, setBackend] = useState<
    ClassroomOrchestrationContextValue["backend"]
  >({
    mode: "local-only",
    state: "checking",
    reason: "正在检查 Supabase 后端",
    lastSyncedAt: null,
  });
  const remoteRevision = useRef<number | null>(null);
  const remoteReady = useRef(false);
  const syncTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

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

  useEffect(() => {
    if (!hydrated) return;
    const controller = new AbortController();
    void fetch(
      `/api/xmp/orchestration?sessionId=${encodeURIComponent(orchestration.sessionId)}`,
      { cache: "no-store", signal: controller.signal },
    )
      .then(async (response) => {
        if (!response.ok) throw new Error(`STATUS_${response.status}`);
        return (await response.json()) as {
          mode: "local-only" | "supabase";
          writable: boolean;
          reason: string;
          remote?: {
            state: XmpClassroomOrchestration;
            revision: number;
            updatedAt: string;
          } | null;
        };
      })
      .then((result) => {
        if (!result.writable) {
          setBackend({
            mode: result.mode,
            state: "local",
            reason:
              result.reason === "sign-in-required"
                ? "登录园所账号后启用 Supabase 同步"
                : result.reason === "missing-server-config"
                  ? "Supabase 环境变量尚未配置"
                  : "本地离线模式",
            lastSyncedAt: null,
          });
          return;
        }
        remoteRevision.current = result.remote?.revision ?? null;
        if (
          result.remote?.state &&
          result.remote.state.revision > orchestration.revision
        )
          setOrchestration(result.remote.state);
        remoteReady.current = true;
        setBackend({
          mode: "supabase",
          state: result.remote ? "synced" : "pending",
          reason: result.remote ? "已连接 Supabase" : "等待首次写入 Supabase",
          lastSyncedAt: result.remote?.updatedAt ?? null,
        });
      })
      .catch((error: unknown) => {
        if (error instanceof DOMException && error.name === "AbortError")
          return;
        setBackend({
          mode: "local-only",
          state: "error",
          reason: "Supabase 暂不可用，改为本地安全保存",
          lastSyncedAt: null,
        });
      });
    return () => controller.abort();
    // Each classroom provider owns one stable session during its lifetime.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hydrated]);

  useEffect(() => {
    if (!hydrated || !remoteReady.current || backend.mode !== "supabase")
      return;
    if (
      remoteRevision.current !== null &&
      orchestration.revision <= remoteRevision.current
    )
      return;
    if (syncTimer.current) clearTimeout(syncTimer.current);
    setBackend((current) => ({
      ...current,
      state: "pending",
      reason: "课堂变更等待同步",
    }));
    syncTimer.current = setTimeout(() => {
      const expectedRevision = remoteRevision.current;
      void fetch("/api/xmp/orchestration", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ state: orchestration, expectedRevision }),
      })
        .then(async (response) => {
          const value = (await response.json()) as {
            revision?: number;
            updatedAt?: string;
            error?: { code?: string; message?: string };
          };
          if (response.status === 409) {
            setBackend((current) => ({
              ...current,
              state: "conflict",
              reason: value.error?.message ?? "服务端状态冲突",
            }));
            return;
          }
          if (!response.ok)
            throw new Error(value.error?.message ?? "SYNC_FAILED");
          remoteRevision.current = value.revision ?? orchestration.revision;
          setBackend({
            mode: "supabase",
            state: "synced",
            reason: "课堂数据已安全写入 Supabase",
            lastSyncedAt: value.updatedAt ?? new Date().toISOString(),
          });
        })
        .catch(() =>
          setBackend((current) => ({
            ...current,
            state: "error",
            reason: "同步失败，本地副本仍然保留",
          })),
        );
    }, 650);
    return () => {
      if (syncTimer.current) clearTimeout(syncTimer.current);
    };
  }, [backend.mode, hydrated, orchestration]);

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
      backend,
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
      backend,
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
