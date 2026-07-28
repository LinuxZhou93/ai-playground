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
  applyTeachingCommand,
  createInitialTeachingWorkbench,
  restoreTeachingWorkbench,
  type XmpTeachingCommand,
  type XmpTeachingCommandKind,
  type XmpTeachingWorkbench,
} from "@/lib/xmp/teaching-workbench";

const STORAGE_KEY = "xmp-teaching-workbench-v1";

type TeachingWorkbenchContextValue = {
  workbench: XmpTeachingWorkbench;
  hydrated: boolean;
  issueCommand: (
    kind: XmpTeachingCommandKind,
    input?: Omit<XmpTeachingCommand, "id" | "kind" | "issuedAt">,
  ) => void;
  resetWorkbench: () => void;
};

const TeachingWorkbenchContext =
  createContext<TeachingWorkbenchContextValue | null>(null);

function commandId() {
  return typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `teaching-${Date.now()}`;
}

export function XmpTeachingWorkbenchProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [workbench, setWorkbench] = useState(createInitialTeachingWorkbench);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const restored = restoreTeachingWorkbench(JSON.parse(stored));
        if (restored) setWorkbench(restored);
      }
    } catch {
      window.localStorage.removeItem(STORAGE_KEY);
    } finally {
      setHydrated(true);
    }
  }, []);

  useEffect(() => {
    if (hydrated)
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(workbench));
  }, [hydrated, workbench]);

  useEffect(() => {
    const sync = (event: StorageEvent) => {
      if (event.key !== STORAGE_KEY || !event.newValue) return;
      try {
        const restored = restoreTeachingWorkbench(JSON.parse(event.newValue));
        if (restored) setWorkbench(restored);
      } catch {
        // 损坏的跨标签页教学快照不会覆盖当前可信状态。
      }
    };
    window.addEventListener("storage", sync);
    return () => window.removeEventListener("storage", sync);
  }, []);

  const issueCommand = useCallback(
    (
      kind: XmpTeachingCommandKind,
      input: Omit<XmpTeachingCommand, "id" | "kind" | "issuedAt"> = {
        actorId: "principal-teacher",
      },
    ) => {
      setWorkbench(
        (current) =>
          applyTeachingCommand(current, {
            id: commandId(),
            kind,
            issuedAt: new Date().toISOString(),
            ...input,
          }).workbench,
      );
    },
    [],
  );

  const value = useMemo(
    () => ({
      workbench,
      hydrated,
      issueCommand,
      resetWorkbench: () => setWorkbench(createInitialTeachingWorkbench()),
    }),
    [hydrated, issueCommand, workbench],
  );

  return (
    <TeachingWorkbenchContext.Provider value={value}>
      {children}
    </TeachingWorkbenchContext.Provider>
  );
}

export function useXmpTeachingWorkbench() {
  const value = useContext(TeachingWorkbenchContext);
  if (!value)
    throw new Error(
      "useXmpTeachingWorkbench must be used inside XmpTeachingWorkbenchProvider",
    );
  return value;
}
