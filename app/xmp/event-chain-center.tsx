"use client";

import {
  Activity,
  Bot,
  CheckCircle2,
  GraduationCap,
  HeartHandshake,
  RotateCcw,
  ShieldCheck,
  Sprout,
  X,
} from "lucide-react";
import { useMemo } from "react";
import type { XmpEventDomain } from "@/lib/xmp/event-types";
import { useXmpEvents, XMP_DEMO_CORRELATION_ID } from "./event-store";

const domainMeta: Record<
  XmpEventDomain,
  { label: string; icon: typeof Activity; step: string }
> = {
  classroom: { label: "课堂现场", icon: GraduationCap, step: "01" },
  growth: { label: "成长审核", icon: Sprout, step: "02" },
  family: { label: "家园回路", icon: HeartHandshake, step: "03" },
  fleet: { label: "设备保障", icon: Bot, step: "04" },
};

export function EventChainCenter({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const { events, reset } = useXmpEvents();
  const correlated = useMemo(
    () =>
      events.filter((event) => event.correlationId === XMP_DEMO_CORRELATION_ID),
    [events],
  );
  const latest = correlated.slice(0, 12);

  if (!open) return null;

  return (
    <div className="xmp-event-backdrop" onMouseDown={onClose}>
      <section
        className="xmp-event-center"
        role="dialog"
        aria-modal="true"
        aria-labelledby="xmp-event-title"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <header>
          <div>
            <span>
              <Activity size={18} />
            </span>
            <div>
              <small>LOCAL EVENT FABRIC</small>
              <h2 id="xmp-event-title">教学闭环事件链</h2>
            </div>
          </div>
          <div>
            <button onClick={reset}>
              <RotateCcw size={13} /> 重置演示
            </button>
            <button aria-label="关闭事件链" onClick={onClose}>
              <X size={17} />
            </button>
          </div>
        </header>

        <section className="xmp-event-correlation">
          <div>
            <small>关联课堂</small>
            <b>大一班 ·《会呼吸的种子》</b>
          </div>
          <code>{XMP_DEMO_CORRELATION_ID}</code>
          <span>
            <i /> 本地事件流运行中
          </span>
        </section>

        <section className="xmp-event-flow" aria-label="闭环阶段">
          {(
            Object.entries(domainMeta) as [
              XmpEventDomain,
              (typeof domainMeta)[XmpEventDomain],
            ][]
          ).map(([domain, meta]) => {
            const Icon = meta.icon;
            const count = correlated.filter(
              (event) => event.domain === domain,
            ).length;
            return (
              <article key={domain}>
                <small>{meta.step}</small>
                <span>
                  <Icon size={16} />
                </span>
                <b>{meta.label}</b>
                <em>{count} 个事件</em>
              </article>
            );
          })}
        </section>

        <section className="xmp-event-stream">
          <div className="xmp-event-section-title">
            <small>AUDITABLE STREAM</small>
            <h3>最近事件</h3>
            <span>{events.length} 条本地记录</span>
          </div>
          <div>
            {latest.map((event) => {
              const meta = domainMeta[event.domain];
              const Icon = meta.icon;
              return (
                <article key={event.id}>
                  <time>
                    {new Date(event.occurredAt).toLocaleTimeString("zh-CN", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </time>
                  <span className={event.domain}>
                    <Icon size={14} />
                  </span>
                  <div>
                    <b>{event.title}</b>
                    <p>{event.detail}</p>
                    <small>
                      {event.actor} · {event.entity}
                    </small>
                  </div>
                  <em>
                    {event.privacy === "anonymous"
                      ? "匿名"
                      : event.privacy === "aggregate"
                        ? "聚合"
                        : "教师审核"}
                  </em>
                </article>
              );
            })}
          </div>
        </section>

        <footer>
          <ShieldCheck size={15} />
          <p>
            <b>事件不是儿童画像</b>
            <span>
              本地演示流只记录业务动作、匿名事实和设备健康；生产接入前仍需事件级
              RLS、留存与删除策略。
            </span>
          </p>
          <CheckCircle2 size={15} />
        </footer>
      </section>
    </div>
  );
}
