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
  applyInsightCommand,
  createInitialLearningInsights,
  restoreLearningInsights,
  type XmpInsightCommand,
  type XmpInsightCommandKind,
  type XmpLearningInsights,
} from "@/lib/xmp/learning-insights";

const STORAGE_KEY = "xmp-learning-insights-v1";

type ContextValue = {
  insights: XmpLearningInsights;
  issueCommand: (
    kind: XmpInsightCommandKind,
    input?: Omit<XmpInsightCommand, "id" | "kind" | "issuedAt">,
  ) => void;
  resetInsights: () => void;
};

const Context = createContext<ContextValue | null>(null);

export function XmpLearningInsightsProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [insights, setInsights] = useState(createInitialLearningInsights);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const restored = restoreLearningInsights(JSON.parse(stored));
        if (restored) setInsights(restored);
      }
    } catch {
      window.localStorage.removeItem(STORAGE_KEY);
    } finally {
      setHydrated(true);
    }
  }, []);

  useEffect(() => {
    if (hydrated)
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(insights));
  }, [hydrated, insights]);

  const issueCommand = useCallback(
    (
      kind: XmpInsightCommandKind,
      input: Omit<XmpInsightCommand, "id" | "kind" | "issuedAt"> = {
        actorId: "principal-teacher",
      },
    ) => {
      setInsights(
        (current) =>
          applyInsightCommand(current, {
            id: crypto.randomUUID(),
            kind,
            issuedAt: new Date().toISOString(),
            ...input,
          }).insights,
      );
    },
    [],
  );

  const value = useMemo(
    () => ({
      insights,
      issueCommand,
      resetInsights: () => setInsights(createInitialLearningInsights()),
    }),
    [insights, issueCommand],
  );
  return <Context.Provider value={value}>{children}</Context.Provider>;
}

export function useXmpLearningInsights() {
  const value = useContext(Context);
  if (!value)
    throw new Error("useXmpLearningInsights must be used inside its provider");
  return value;
}
