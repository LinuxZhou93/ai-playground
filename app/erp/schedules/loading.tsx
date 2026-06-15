import React from "react";
import { SkeletonCard } from "@/components/erp/skeleton-card";
import { CalendarDays, Plus, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const WEEKDAY_LABELS = ["周一", "周二", "周三", "周四", "周五", "周六", "周日"];
const HOURS = Array.from({ length: 8 }, (_, i) => i + 9); // 9:00 ~ 16:00 for skeleton

export default function SchedulesLoading() {
  return (
    <div className="space-y-8 max-w-[1600px] mx-auto pb-20 px-4 sm:px-6">
      {/* Header Skeleton */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 pt-4">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-100 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700/50">
            <CalendarDays className="h-3.5 w-3.5 text-indigo-500" />
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500">
              Intelligent Scheduling Engine
            </span>
          </div>
          <h1 className="text-4xl font-black tracking-tight text-zinc-900 dark:text-zinc-50">
            排课日历
          </h1>
          <div className="h-4 w-96 bg-zinc-200 dark:bg-zinc-800 rounded animate-pulse" />
        </div>

        <div className="flex flex-wrap items-center gap-4">
          <div className="h-14 w-48 bg-white dark:bg-zinc-900/40 rounded-2xl border border-zinc-200 dark:border-zinc-800 animate-pulse" />
          <Button disabled className="h-14 px-8 bg-indigo-600 rounded-2xl font-bold text-sm opacity-50">
            <Plus className="mr-2 h-5 w-5" />
            智能排课
          </Button>
        </div>
      </div>

      {/* Navigation Bar Skeleton */}
      <div className="flex items-center justify-between bg-white dark:bg-zinc-900/60 rounded-2xl border border-zinc-200/60 dark:border-zinc-800/60 px-6 py-4 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 bg-zinc-100 dark:bg-zinc-800 rounded-xl animate-pulse" />
          <div className="h-10 w-10 bg-zinc-100 dark:bg-zinc-800 rounded-xl animate-pulse" />
          <div className="h-10 w-24 bg-zinc-100 dark:bg-zinc-800 rounded-xl animate-pulse" />
        </div>
        <div className="h-6 w-48 bg-zinc-200 dark:bg-zinc-800 rounded-md animate-pulse" />
        <div className="flex gap-4">
            {[1, 2, 3].map(i => (
                <div key={i} className="h-4 w-12 bg-zinc-100 dark:bg-zinc-800 rounded animate-pulse" />
            ))}
        </div>
      </div>

      {/* Calendar Grid Skeleton - High Fidelity */}
      <Card className="border border-zinc-200/60 dark:border-zinc-800/60 bg-white dark:bg-zinc-950 rounded-3xl overflow-hidden">
        <CardContent className="p-0">
          <div className="min-w-[900px]">
            {/* Table Header Skeleton */}
            <div style={{ display: "grid", gridTemplateColumns: "80px repeat(7, 1fr)" }} className="border-b border-zinc-100 dark:border-zinc-800/60">
              <div className="p-4 border-r border-zinc-100 dark:border-zinc-800/60" />
              {WEEKDAY_LABELS.map((_, i) => (
                <div key={i} className="p-4 text-center border-r last:border-r-0 border-zinc-100 dark:border-zinc-800/60">
                  <div className="h-2 w-8 bg-zinc-100 dark:bg-zinc-800 rounded mx-auto mb-2 animate-pulse" />
                  <div className="h-8 w-8 bg-zinc-200 dark:bg-zinc-800 rounded-xl mx-auto animate-pulse" />
                </div>
              ))}
            </div>

            {/* Time Rows Skeleton */}
            {HOURS.map(hour => (
              <div key={hour} style={{ display: "grid", gridTemplateColumns: "80px repeat(7, 1fr)" }} className="border-b border-zinc-50 dark:border-zinc-900 min-h-[72px]">
                <div className="p-3 border-r border-zinc-100 dark:border-zinc-800/60 flex items-start justify-end">
                   <div className="h-3 w-8 bg-zinc-100 dark:bg-zinc-800 rounded animate-pulse" />
                </div>
                {WEEKDAY_LABELS.map((_, i) => (
                  <div key={i} className="relative border-r last:border-r-0 border-zinc-100 dark:border-zinc-800/60 p-1">
                    {/* Occasionally add a skeleton block to simulate a class */}
                    {(hour + i) % 5 === 0 && (
                        <div className="absolute inset-x-1 top-1 bottom-1 bg-zinc-100 dark:bg-zinc-800/40 rounded-xl animate-pulse" />
                    )}
                  </div>
                ))}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
