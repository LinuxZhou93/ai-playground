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
  applyScheduleCommand,
  createInitialScheduleCatalog,
  restoreScheduleCatalog,
  type XmpScheduleActor,
  type XmpScheduleCatalog,
  type XmpScheduleCommand,
  type XmpScheduleCommandKind,
} from "@/lib/xmp/teaching-schedule";

const STORAGE_KEY = "xmp-teaching-schedule-v1";

type ScheduleContextValue = {
  catalog: XmpScheduleCatalog;
  hydrated: boolean;
  issueCommand: (
    kind: XmpScheduleCommandKind,
    batchId: string,
    actor: XmpScheduleActor,
    slotId?: string,
    payload?: XmpScheduleCommand["payload"],
  ) => void;
  resetCatalog: () => void;
};

const ScheduleContext = createContext<ScheduleContextValue | null>(null);

function commandId() {
  return typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `schedule-${Date.now()}`;
}

export function XmpTeachingScheduleProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [catalog, setCatalog] = useState(createInitialScheduleCatalog);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const restored = restoreScheduleCatalog(JSON.parse(stored));
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
        const restored = restoreScheduleCatalog(JSON.parse(event.newValue));
        if (restored) setCatalog(restored);
      } catch {
        // 损坏的跨标签页快照不会覆盖当前教学计划。
      }
    };
    window.addEventListener("storage", sync);
    return () => window.removeEventListener("storage", sync);
  }, []);

  const issueCommand = useCallback(
    (
      kind: XmpScheduleCommandKind,
      batchId: string,
      actor: XmpScheduleActor,
      slotId?: string,
      payload?: XmpScheduleCommand["payload"],
    ) => {
      setCatalog(
        (current) =>
          applyScheduleCommand(current, {
            id: commandId(),
            kind,
            batchId,
            slotId,
            actor,
            issuedAt: new Date().toISOString(),
            payload,
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
      resetCatalog: () => setCatalog(createInitialScheduleCatalog()),
    }),
    [catalog, hydrated, issueCommand],
  );
  return (
    <ScheduleContext.Provider value={value}>
      {children}
    </ScheduleContext.Provider>
  );
}

export function useXmpTeachingSchedule() {
  const value = useContext(ScheduleContext);
  if (!value)
    throw new Error(
      "useXmpTeachingSchedule must be used inside XmpTeachingScheduleProvider",
    );
  return value;
}
