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
  applyClassroomCommand,
  createInitialClassroomRuntime,
  restoreClassroomRuntime,
  tickClassroomRuntime,
  XMP_DEMO_OPERATOR,
  type XmpClassroomRuntime,
  type XmpRuntimeCommand,
  type XmpRuntimeCommandKind,
} from "@/lib/xmp/classroom-runtime";

const STORAGE_KEY = "xmp-classroom-runtime-v1";

type CommandPayload = XmpRuntimeCommand["payload"];

type ClassroomRuntimeContextValue = {
  runtime: XmpClassroomRuntime;
  hydrated: boolean;
  issueTeacherCommand: (
    kind: XmpRuntimeCommandKind,
    payload?: CommandPayload,
  ) => string;
  issueOperatorCommand: (
    kind: "device.disconnect" | "device.recover",
    payload?: CommandPayload,
  ) => string;
  issueDeviceHeartbeat: (deviceId: string, latencyMs?: number) => string;
  tick: () => void;
  resetRuntime: () => void;
};

const ClassroomRuntimeContext =
  createContext<ClassroomRuntimeContextValue | null>(null);

function commandId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto)
    return crypto.randomUUID();
  return `00000000-0000-4000-8000-${Date.now().toString().padStart(12, "0").slice(-12)}`;
}

export function XmpClassroomRuntimeProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [runtime, setRuntime] = useState(createInitialClassroomRuntime);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const restored = restoreClassroomRuntime(JSON.parse(stored));
        if (restored) setRuntime(restored);
      }
    } catch {
      window.localStorage.removeItem(STORAGE_KEY);
    } finally {
      setHydrated(true);
    }
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(runtime));
  }, [hydrated, runtime]);

  useEffect(() => {
    const handleStorage = (event: StorageEvent) => {
      if (event.key !== STORAGE_KEY || !event.newValue) return;
      try {
        const restored = restoreClassroomRuntime(JSON.parse(event.newValue));
        if (!restored) return;
        setRuntime((current) =>
          JSON.stringify(current) === event.newValue ? current : restored,
        );
      } catch {
        // 其他标签页的损坏快照不会覆盖当前可信运行状态。
      }
    };
    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  const issueTeacherCommand = useCallback(
    (kind: XmpRuntimeCommandKind, payload?: CommandPayload) => {
      const id = commandId();
      const issuedAt = new Date().toISOString();
      setRuntime(
        (current) =>
          applyClassroomCommand(current, {
            id,
            kind,
            issuedAt,
            actor: current.teacher,
            payload,
          }).runtime,
      );
      return id;
    },
    [],
  );

  const issueDeviceHeartbeat = useCallback(
    (deviceId: string, latencyMs?: number) => {
      const id = commandId();
      const issuedAt = new Date().toISOString();
      setRuntime((current) => {
        const device = current.devices.find((item) => item.id === deviceId);
        if (!device) return current;
        return applyClassroomCommand(current, {
          id,
          kind: "device.heartbeat",
          issuedAt,
          actor: {
            id: device.id,
            kind: "device",
            role: "device",
            trust: device.trust,
            displayName: device.name,
          },
          payload: { deviceId, latencyMs },
        }).runtime;
      });
      return id;
    },
    [],
  );

  const issueOperatorCommand = useCallback(
    (
      kind: "device.disconnect" | "device.recover",
      payload?: CommandPayload,
    ) => {
      const id = commandId();
      const issuedAt = new Date().toISOString();
      setRuntime(
        (current) =>
          applyClassroomCommand(current, {
            id,
            kind,
            issuedAt,
            actor: XMP_DEMO_OPERATOR,
            payload,
          }).runtime,
      );
      return id;
    },
    [],
  );

  const tick = useCallback(
    () => setRuntime((current) => tickClassroomRuntime(current)),
    [],
  );
  const resetRuntime = useCallback(
    () => setRuntime(createInitialClassroomRuntime()),
    [],
  );

  const value = useMemo(
    () => ({
      runtime,
      hydrated,
      issueTeacherCommand,
      issueOperatorCommand,
      issueDeviceHeartbeat,
      tick,
      resetRuntime,
    }),
    [
      runtime,
      hydrated,
      issueTeacherCommand,
      issueOperatorCommand,
      issueDeviceHeartbeat,
      tick,
      resetRuntime,
    ],
  );

  return (
    <ClassroomRuntimeContext.Provider value={value}>
      {children}
    </ClassroomRuntimeContext.Provider>
  );
}

export function useXmpClassroomRuntime() {
  const value = useContext(ClassroomRuntimeContext);
  if (!value)
    throw new Error(
      "useXmpClassroomRuntime must be used inside XmpClassroomRuntimeProvider",
    );
  return value;
}
