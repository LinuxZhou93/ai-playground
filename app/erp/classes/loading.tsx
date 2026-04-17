import React from "react";
import { SkeletonCard } from "@/components/erp/skeleton-card";
import { BarChart3, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function ClassesLoading() {
  return (
    <div className="space-y-8">
      {/* Header Section Skeleton */}
      <div className="relative flex flex-col md:flex-row md:items-end justify-between gap-8 z-10">
        <div className="space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-100 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700/50">
            <BarChart3 className="h-3.5 w-3.5 text-blue-500 animate-pulse" />
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500">Resource Control</span>
          </div>
          <div className="space-y-1">
            <h2 className="text-5xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-50">
              班级管理 <span className="text-zinc-300 dark:text-zinc-700 font-light ml-2">/ Classes</span>
            </h2>
            <div className="h-6 w-96 bg-zinc-200 dark:bg-zinc-800 rounded-md animate-pulse mt-2" />
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-6">
          <div className="flex items-center gap-10 px-10 py-5 bg-white/40 dark:bg-zinc-900/40 backdrop-blur-2xl rounded-[2rem] border border-zinc-200/50 dark:border-zinc-800/50 shadow-2xl">
            <div className="h-16 w-32 bg-zinc-200 dark:bg-zinc-800 rounded-xl animate-pulse" />
            <div className="w-[1px] h-12 bg-zinc-200 dark:bg-zinc-800" />
            <div className="h-16 w-32 bg-zinc-200 dark:bg-zinc-800 rounded-xl animate-pulse" />
          </div>
          <Button disabled className="h-16 px-10 bg-indigo-600 dark:bg-indigo-500 text-white rounded-[1.5rem] font-bold text-base shadow-lg opacity-50">
            <Plus className="mr-2 h-5 w-5" /> 新建班级
          </Button>
        </div>
      </div>

      {/* Classes Grid Skeleton */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <SkeletonCard key={i} lines={5} />
        ))}
      </div>
    </div>
  );
}
