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
  applyStrategyCommand,
  createInitialTeachingStrategyLibrary,
  restoreTeachingStrategyLibrary,
  type XmpStrategyCommand,
  type XmpStrategyCommandKind,
  type XmpTeachingStrategyLibrary,
} from "@/lib/xmp/teaching-strategies";

const STORAGE_KEY = "xmp-teaching-strategies-v1";

type StrategyContextValue = {
  library: XmpTeachingStrategyLibrary;
  issueCommand: (
    kind: XmpStrategyCommandKind,
    input?: Omit<XmpStrategyCommand, "id" | "kind" | "issuedAt">,
  ) => void;
  resetLibrary: () => void;
};

const StrategyContext = createContext<StrategyContextValue | null>(null);

function commandId() {
  return typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `strategy-${Date.now()}`;
}

export function XmpTeachingStrategyProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [library, setLibrary] = useState(createInitialTeachingStrategyLibrary);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const restored = restoreTeachingStrategyLibrary(JSON.parse(stored));
        if (restored) setLibrary(restored);
      }
    } catch {
      window.localStorage.removeItem(STORAGE_KEY);
    } finally {
      setHydrated(true);
    }
  }, []);

  useEffect(() => {
    if (hydrated)
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(library));
  }, [hydrated, library]);

  const issueCommand = useCallback(
    (
      kind: XmpStrategyCommandKind,
      input: Omit<XmpStrategyCommand, "id" | "kind" | "issuedAt"> = {
        actorId: "principal-teacher",
      },
    ) => {
      setLibrary(
        (current) =>
          applyStrategyCommand(current, {
            id: commandId(),
            kind,
            issuedAt: new Date().toISOString(),
            ...input,
          }).library,
      );
    },
    [],
  );

  const value = useMemo(
    () => ({
      library,
      issueCommand,
      resetLibrary: () => setLibrary(createInitialTeachingStrategyLibrary()),
    }),
    [issueCommand, library],
  );

  return (
    <StrategyContext.Provider value={value}>
      {children}
    </StrategyContext.Provider>
  );
}

export function useXmpTeachingStrategies() {
  const value = useContext(StrategyContext);
  if (!value)
    throw new Error(
      "useXmpTeachingStrategies must be used inside XmpTeachingStrategyProvider",
    );
  return value;
}
