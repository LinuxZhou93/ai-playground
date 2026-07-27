"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import type { XmpEvent, XmpEventInput } from "@/lib/xmp/event-types";

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
};

const EventContext = createContext<EventContextValue | null>(null);

export function XmpEventProvider({ children }: { children: React.ReactNode }) {
  const [events, setEvents] = useState<XmpEvent[]>(seedEvents);

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as XmpEvent[];
        if (Array.isArray(parsed) && parsed.length)
          setEvents(parsed.slice(0, 80));
      }
    } catch {
      window.localStorage.removeItem(STORAGE_KEY);
    }
  }, []);

  useEffect(() => {
    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(events.slice(0, 80)),
    );
  }, [events]);

  const emit = useCallback((input: XmpEventInput) => {
    const id =
      typeof crypto !== "undefined" && "randomUUID" in crypto
        ? crypto.randomUUID()
        : `evt-${Date.now()}`;
    const nextEvent: XmpEvent = {
      ...input,
      id,
      occurredAt: input.occurredAt ?? new Date().toISOString(),
      source: "local-interaction",
    };
    setEvents((current) => [nextEvent, ...current].slice(0, 80));
  }, []);

  const reset = useCallback(() => setEvents(seedEvents), []);
  const value = useMemo(() => ({ events, emit, reset }), [events, emit, reset]);

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
