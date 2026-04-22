"use client";

import React from "react";
import { cn } from "@/lib/utils";

/**
 * V3 高性能 Shimmer 占位条
 * 用纯 CSS animation 替代 JS 驱动，GPU 合成层友好
 */
function Shimmer({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <div
      style={style}
      className={cn(
        "relative overflow-hidden rounded-md bg-muted/60",
        "animate-pulse",
        className
      )}
    />
  );
}

/**
 * KPI 卡片骨架屏
 */
export function SkeletonKPI() {
  return (
    <div className="rounded-2xl border bg-card p-6 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <Shimmer className="h-4 w-20" />
        <Shimmer className="h-9 w-9 rounded-xl" />
      </div>
      <Shimmer className="h-8 w-28 mb-2" />
      <Shimmer className="h-3 w-36 opacity-60" />
    </div>
  );
}

/**
 * 通用内容卡片骨架屏
 */
export function SkeletonCard({ lines = 3 }: { lines?: number }) {
  return (
    <div className="rounded-2xl border bg-card p-6 shadow-sm space-y-5">
      <div className="flex items-center gap-4">
        <Shimmer className="h-12 w-12 rounded-xl shrink-0" />
        <div className="space-y-2 flex-1">
          <Shimmer className="h-4 w-1/3" />
          <Shimmer className="h-3 w-1/2 opacity-50" />
        </div>
      </div>
      <div className="space-y-2.5">
        {Array.from({ length: lines }).map((_, i) => (
          <Shimmer
            key={i}
            className="h-3"
            style={{ width: `${100 - i * 15}%`, opacity: 1 - i * 0.15 }}
          />
        ))}
      </div>
    </div>
  );
}

/**
 * 表格行骨架屏
 */
export function SkeletonTable({ rows = 5, cols = 5 }: { rows?: number; cols?: number }) {
  return (
    <div className="w-full overflow-hidden rounded-xl border bg-card">
      <div className="divide-y">
        {Array.from({ length: rows }).map((_, r) => (
          <div key={r} className="flex gap-4 items-center p-4">
            {Array.from({ length: cols }).map((_, c) => (
              <Shimmer
                key={c}
                className={cn(
                  "h-3.5 flex-1",
                  c === 0 ? "max-w-[100px]" : "",
                  c === cols - 1 ? "max-w-[60px] ml-auto" : ""
                )}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * 图表区域骨架屏 — 纯 CSS 动画柱状图
 */
export function SkeletonChart() {
  return (
    <div className="relative w-full h-[280px] flex items-end justify-between gap-2 p-6 rounded-xl border bg-card">
      {Array.from({ length: 10 }).map((_, i) => (
        <div
          key={i}
          className="flex-1 rounded-t-md bg-muted/50 animate-pulse"
          style={{
            height: `${20 + ((i * 37 + 13) % 60)}%`,
            animationDelay: `${i * 100}ms`,
          }}
        />
      ))}
    </div>
  );
}
