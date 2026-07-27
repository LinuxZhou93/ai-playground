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
import type {
  XmpEvent,
  XmpEventInput,
  XmpEventTransportStatus,
} from "@/lib/xmp/event-types";

const STORAGE_KEY = "xmp-local-event-stream-v1";
export const XMP_DEMO_CORRELATION_ID = "CLS-A301-20260728-SEED";

const seedEvents = (
  [
    {
      id: "evt-seed-01",
      correlationId: XMP_DEMO_CORRELATION_ID,
      kind: "classroom.started",
      domain: "classroom",
      title: "《会呼吸的种子》课堂开始",
      detail: "教师端、大屏与 6 台奇妙宠完成课前检查。",
      actor: "文老师",
      entity: "大一班 · A-301",
      occurredAt: "2026-07-28T09:20:00+08:00",
      privacy: "aggregate",
      source: "demo-seed",
    },
    {
      id: "evt-seed-02",
      correlationId: XMP_DEMO_CORRELATION_ID,
      kind: "device.degraded",
      domain: "fleet",
      title: "奇妙宠 C-03 自动降级",
      detail: "语音延迟升高，已切换短句模式；物理静音与教师接管正常。",
      actor: "边缘策略引擎",
      entity: "C-03",
      occurredAt: "2026-07-28T09:28:00+08:00",
      privacy: "aggregate",
      source: "demo-seed",
    },
    {
      id: "evt-seed-03",
      correlationId: XMP_DEMO_CORRELATION_ID,
      kind: "evidence.candidate",
      domain: "growth",
      title: "同伴协商候选证据生成",
      detail: "仅保存文字事实摘要，尚未进入成长档案。",
      actor: "课堂 Copilot",
      entity: "匿名小组事件",
      occurredAt: "2026-07-28T09:29:00+08:00",
      privacy: "anonymous",
      source: "demo-seed",
    },
    {
      id: "evt-seed-04",
      correlationId: XMP_DEMO_CORRELATION_ID,
      kind: "evidence.approved",
      domain: "growth",
      title: "教师确认观察证据",
      detail: "事实、解释与发展领域完成教师复核，可用于报告草稿。",
      actor: "文老师",
      entity: "证据 EV-01",
      occurredAt: "2026-07-28T09:46:00+08:00",
      privacy: "teacher-reviewed",
      source: "demo-seed",
    },
    {
      id: "evt-seed-05",
      correlationId: XMP_DEMO_CORRELATION_ID,
      kind: "family.dispatched",
      domain: "family",
      title: "成长简报由教师签名发布",
      detail: "送达演示家庭；不含能力分数、同龄排名或自动诊断。",
      actor: "文老师",
      entity: "大一班家庭群",
      occurredAt: "2026-07-28T17:30:00+08:00",
      privacy: "teacher-reviewed",
      source: "demo-seed",
    },
  ] satisfies XmpEvent[]
).reverse();

type EventContextValue = {
  events: XmpEvent[];
  emit: (event: XmpEventInput) => void;
  reset: () => void;
  transport: XmpEventTransportStatus;
  pendingCount: number;
  failedCount: number;
  retrySync: () => void;
};

const EventContext = createContext<EventContextValue | null>(null);

const localTransport: XmpEventTransportStatus = {
  mode: "local-only",
  configured: false,
  authenticated: false,
  writable: false,
  reason: "local-mode",
};

function normalizeStoredEvent(event: XmpEvent): XmpEvent {
  if (event.source === "demo-seed") {
    return { ...event, sync: { state: "local-only", attempts: 0 } };
  }
  if (event.source === "server-sync") {
    return { ...event, sync: { state: "synced", attempts: 0 } };
  }
  if (event.sync?.state === "syncing") {
    return {
      ...event,
      sync: { ...event.sync, state: "pending", lastError: undefined },
    };
  }
  return event.sync
    ? event
    : { ...event, sync: { state: "local-only", attempts: 0 } };
}

function eventForServer(event: XmpEvent) {
  return {
    id: event.id,
    correlationId: event.correlationId,
    kind: event.kind,
    domain: event.domain,
    title: event.title,
    detail: event.detail,
    actor: event.actor,
    entity: event.entity,
    occurredAt: event.occurredAt,
    privacy: event.privacy,
    source: "local-interaction" as const,
  };
}

export function XmpEventProvider({ children }: { children: React.ReactNode }) {
  const [events, setEvents] = useState<XmpEvent[]>(seedEvents);
  const [hydrated, setHydrated] = useState(false);
  const [transport, setTransport] =
    useState<XmpEventTransportStatus>(localTransport);
  const eventsRef = useRef(events);
  const syncInFlight = useRef(false);

  useEffect(() => {
    eventsRef.current = events;
  }, [events]);

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as XmpEvent[];
        if (Array.isArray(parsed) && parsed.length)
          setEvents(parsed.slice(0, 80).map(normalizeStoredEvent));
      }
    } catch {
      window.localStorage.removeItem(STORAGE_KEY);
    } finally {
      setHydrated(true);
    }
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(events.slice(0, 80)),
    );
  }, [events, hydrated]);

  useEffect(() => {
    if (!hydrated) return;
    const controller = new AbortController();

    void fetch(
      `/api/xmp/events?correlationId=${encodeURIComponent(XMP_DEMO_CORRELATION_ID)}`,
      { cache: "no-store", signal: controller.signal },
    )
      .then(async (response) => {
        if (!response.ok) throw new Error(`STATUS_${response.status}`);
        return (await response.json()) as XmpEventTransportStatus & {
          events?: XmpEvent[];
        };
      })
      .then((result) => {
        setTransport({
          mode: result.mode,
          configured: result.configured,
          authenticated: result.authenticated,
          writable: result.writable,
          reason: result.reason,
        });

        if (!result.writable) return;
        setEvents((current) => {
          const serverEvents = (result.events ?? []).map(normalizeStoredEvent);
          const serverIds = new Set(serverEvents.map((event) => event.id));
          const localEvents = current
            .filter((event) => !serverIds.has(event.id))
            .map((event) =>
              event.source === "local-interaction" &&
              event.sync?.state === "local-only"
                ? {
                    ...event,
                    sync: {
                      state: "pending" as const,
                      attempts: event.sync.attempts,
                    },
                  }
                : event,
            );
          return [...serverEvents, ...localEvents]
            .sort(
              (left, right) =>
                new Date(right.occurredAt).getTime() -
                new Date(left.occurredAt).getTime(),
            )
            .slice(0, 80);
        });
      })
      .catch((error: unknown) => {
        if (error instanceof DOMException && error.name === "AbortError")
          return;
        setTransport(localTransport);
      });

    return () => controller.abort();
  }, [hydrated]);

  const flushPending = useCallback(async () => {
    if (!transport.writable || syncInFlight.current) return;
    const pending = eventsRef.current.filter(
      (event) => event.sync?.state === "pending",
    );
    if (!pending.length) return;

    syncInFlight.current = true;
    for (const event of pending) {
      setEvents((current) =>
        current.map((candidate) =>
          candidate.id === event.id
            ? {
                ...candidate,
                sync: {
                  state: "syncing",
                  attempts: (candidate.sync?.attempts ?? 0) + 1,
                },
              }
            : candidate,
        ),
      );

      try {
        const response = await fetch("/api/xmp/events", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(eventForServer(event)),
        });
        if (!response.ok) throw new Error(`SYNC_${response.status}`);
        const result = (await response.json()) as { event?: XmpEvent };
        setEvents((current) =>
          current.map((candidate) =>
            candidate.id === event.id
              ? {
                  ...(result.event ?? candidate),
                  sync: {
                    state: "synced",
                    attempts: candidate.sync?.attempts ?? 1,
                  },
                }
              : candidate,
          ),
        );
      } catch (error) {
        setEvents((current) =>
          current.map((candidate) =>
            candidate.id === event.id
              ? {
                  ...candidate,
                  sync: {
                    state: "failed",
                    attempts: candidate.sync?.attempts ?? 1,
                    lastError:
                      error instanceof Error ? error.message : "SYNC_FAILED",
                  },
                }
              : candidate,
          ),
        );
      }
    }
    syncInFlight.current = false;
  }, [transport.writable]);

  useEffect(() => {
    if (
      hydrated &&
      transport.writable &&
      events.some((event) => event.sync?.state === "pending")
    ) {
      void flushPending();
    }
  }, [events, flushPending, hydrated, transport.writable]);

  const emit = useCallback(
    (input: XmpEventInput) => {
      const id =
        typeof crypto !== "undefined" && "randomUUID" in crypto
          ? crypto.randomUUID()
          : `evt-${Date.now()}`;
      const nextEvent: XmpEvent = {
        ...input,
        id,
        occurredAt: input.occurredAt ?? new Date().toISOString(),
        source: "local-interaction",
        sync: {
          state: transport.writable ? "pending" : "local-only",
          attempts: 0,
        },
      };
      setEvents((current) => [nextEvent, ...current].slice(0, 80));
    },
    [transport.writable],
  );

  const reset = useCallback(() => setEvents(seedEvents), []);
  const retrySync = useCallback(() => {
    setEvents((current) =>
      current.map((event) =>
        event.sync?.state === "failed"
          ? {
              ...event,
              sync: { ...event.sync, state: "pending", lastError: undefined },
            }
          : event,
      ),
    );
  }, []);
  const pendingCount = events.filter(
    (event) =>
      event.sync?.state === "pending" || event.sync?.state === "syncing",
  ).length;
  const failedCount = events.filter(
    (event) => event.sync?.state === "failed",
  ).length;
  const value = useMemo(
    () => ({
      events,
      emit,
      reset,
      transport,
      pendingCount,
      failedCount,
      retrySync,
    }),
    [events, emit, reset, transport, pendingCount, failedCount, retrySync],
  );

  return (
    <EventContext.Provider value={value}>{children}</EventContext.Provider>
  );
}

export function useXmpEvents() {
  const value = useContext(EventContext);
  if (!value)
    throw new Error("useXmpEvents must be used inside XmpEventProvider");
  return value;
}
