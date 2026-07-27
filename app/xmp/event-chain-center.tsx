"use client";

import {
  Activity,
  AlertTriangle,
  Bot,
  CheckCircle2,
  Cloud,
  CloudOff,
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
  const { events, reset, transport, pendingCount, failedCount, retrySync } =
    useXmpEvents();
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
            {(pendingCount > 0 || failedCount > 0) && transport.writable ? (
              <button onClick={retrySync} aria-label="重试事件同步">
                <Cloud size={13} />
                {failedCount > 0
                  ? `重试 ${failedCount}`
                  : `同步 ${pendingCount}`}
              </button>
            ) : null}
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
          <span className={transport.writable ? "server" : "local"}>
            {transport.writable ? <Cloud size={12} /> : <CloudOff size={12} />}
            {transport.writable ? "园所事件服务已连接" : "本地安全存储"}
          </span>
        </section>

        <section className="xmp-event-sync-status" aria-label="事件同步状态">
          <div>
            <small>运行模式</small>
            <b>{transport.mode === "local-only" ? "本地优先" : "园所双模"}</b>
          </div>
          <div>
            <small>服务端权限</small>
            <b>
              {transport.writable
                ? "已鉴权 · 可追加"
                : transport.reason === "sign-in-required"
                  ? "等待园所登录"
                  : "关闭 · 零外发"}
            </b>
          </div>
          <div>
            <small>离线 Outbox</small>
            <b>
              {failedCount > 0
                ? `${failedCount} 条待重试`
                : pendingCount > 0
                  ? `${pendingCount} 条同步中`
                  : "队列已清空"}
            </b>
          </div>
          <div>
            <small>写入规则</small>
            <b>幂等 · 仅追加</b>
          </div>
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
                  <aside>
                    <em>
                      {event.privacy === "anonymous"
                        ? "匿名"
                        : event.privacy === "aggregate"
                          ? "聚合"
                          : "教师审核"}
                    </em>
                    {event.sync?.state === "failed" ? (
                      <em className="failed">
                        <AlertTriangle size={9} /> 待重试
                      </em>
                    ) : event.sync?.state === "synced" ? (
                      <em className="synced">
                        <Cloud size={9} /> 已入库
                      </em>
                    ) : event.sync?.state === "pending" ||
                      event.sync?.state === "syncing" ? (
                      <em className="pending">同步中</em>
                    ) : (
                      <em className="local">仅本地</em>
                    )}
                  </aside>
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
              只记录业务动作、匿名事实和设备健康；服务端迁移层已具备租户级
              RLS、幂等追加与 30/90/180 天分级留存策略，当前默认不连接云端。
            </span>
          </p>
          <CheckCircle2 size={15} />
        </footer>
      </section>
    </div>
  );
}
