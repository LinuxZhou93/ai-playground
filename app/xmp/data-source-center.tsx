"use client";

import {
  CheckCircle2,
  CircleAlert,
  Database,
  LockKeyhole,
  RefreshCw,
  Server,
  X,
} from "lucide-react";
import type { XmpSnapshot } from "@/lib/xmp/types";

export function DataSourceCenter({
  open,
  snapshot,
  loading,
  onClose,
  onRefresh,
}: {
  open: boolean;
  snapshot: XmpSnapshot;
  loading: boolean;
  onClose: () => void;
  onRefresh: () => void;
}) {
  if (!open) return null;

  const live = snapshot.mode === "futureclass-readonly";

  return (
    <div
      className="xmp-source-backdrop"
      role="presentation"
      onMouseDown={onClose}
    >
      <section
        className="xmp-source-center"
        role="dialog"
        aria-modal="true"
        aria-labelledby="xmp-source-title"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <header>
          <div>
            <span className={live ? "live" : "demo"}>
              {live ? <Server size={17} /> : <Database size={17} />}
            </span>
            <div>
              <small>DATA FOUNDATION</small>
              <h2 id="xmp-source-title">数据源与安全边界</h2>
            </div>
          </div>
          <button aria-label="关闭数据源中心" onClick={onClose}>
            <X size={18} />
          </button>
        </header>

        <div className={`xmp-source-state ${snapshot.sourceState}`}>
          <div>
            <i />
            <span>
              <small>当前运行模式</small>
              <b>{snapshot.sourceLabel}</b>
            </span>
          </div>
          <button onClick={onRefresh} disabled={loading}>
            <RefreshCw size={13} className={loading ? "spinning" : ""} />
            {loading ? "正在检查" : "重新检查"}
          </button>
        </div>

        {snapshot.fallbackReason && (
          <div className="xmp-source-warning">
            <CircleAlert size={15} />
            <p>
              <b>已启用安全回退</b>
              <span>{snapshot.fallbackReason}</span>
            </p>
          </div>
        )}

        <div className="xmp-source-tenant">
          <div>
            <small>授权租户</small>
            <b>{snapshot.tenant.name}</b>
            <span>{snapshot.tenant.campus}</span>
          </div>
          <div>
            <small>快照时间</small>
            <b>{snapshot.freshnessLabel}</b>
            <span>
              {new Date(snapshot.generatedAt).toLocaleString("zh-CN")}
            </span>
          </div>
        </div>

        <div className="xmp-source-probes">
          <div className="xmp-source-section-title">
            <small>CAPABILITY PROBES</small>
            <b>能力可用性</b>
          </div>
          {snapshot.capabilities.map((item) => (
            <div key={item.id} className={item.state}>
              {item.state === "ready" ? (
                <CheckCircle2 size={14} />
              ) : (
                <CircleAlert size={14} />
              )}
              <b>{item.label}</b>
              <span>{item.detail}</span>
              <em>
                {item.state === "ready"
                  ? "可用"
                  : item.state === "planned"
                    ? "待接入"
                    : "不可用"}
              </em>
            </div>
          ))}
        </div>

        <footer>
          <LockKeyhole size={16} />
          <p>
            <b>不可跨越的安全边界</b>
            <span>
              只返回聚合数量 · 不含幼儿姓名/电话/原始音视频 · 不允许任何写操作
            </span>
          </p>
        </footer>
      </section>
    </div>
  );
}
