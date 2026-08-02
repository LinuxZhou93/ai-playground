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
  applyAccessCommand,
  createInitialAccessCatalog,
  restoreAccessCatalog,
  type XmpAccessCatalog,
  type XmpAccessCommand,
  type XmpAccessCommandKind,
} from "@/lib/xmp/access-control";

const STORAGE_KEY = "xmp-access-control-v1";

type AccessContextValue = {
  catalog: XmpAccessCatalog;
  hydrated: boolean;
  issueCommand: (
    kind: XmpAccessCommandKind,
    actorId: string,
    input?: Omit<XmpAccessCommand, "id" | "kind" | "actorId" | "issuedAt">,
  ) => void;
  resetCatalog: () => void;
};

const AccessContext = createContext<AccessContextValue | null>(null);

function commandId() {
  return typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `access-${Date.now()}`;
}

export function XmpAccessControlProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [catalog, setCatalog] = useState(createInitialAccessCatalog);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const restored = restoreAccessCatalog(JSON.parse(stored));
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
        const restored = restoreAccessCatalog(JSON.parse(event.newValue));
        if (restored) setCatalog(restored);
      } catch {
        // 损坏的跨标签页权限快照不会覆盖当前可信状态。
      }
    };
    window.addEventListener("storage", sync);
    return () => window.removeEventListener("storage", sync);
  }, []);

  const issueCommand = useCallback(
    (
      kind: XmpAccessCommandKind,
      actorId: string,
      input: Omit<
        XmpAccessCommand,
        "id" | "kind" | "actorId" | "issuedAt"
      > = {},
    ) => {
      setCatalog(
        (current) =>
          applyAccessCommand(current, {
            id: commandId(),
            kind,
            actorId,
            issuedAt: new Date().toISOString(),
            ...input,
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
      resetCatalog: () => setCatalog(createInitialAccessCatalog()),
    }),
    [catalog, hydrated, issueCommand],
  );

  return (
    <AccessContext.Provider value={value}>{children}</AccessContext.Provider>
  );
}

export function useXmpAccessControl() {
  const value = useContext(AccessContext);
  if (!value)
    throw new Error(
      "useXmpAccessControl must be used inside XmpAccessControlProvider",
    );
  return value;
}
