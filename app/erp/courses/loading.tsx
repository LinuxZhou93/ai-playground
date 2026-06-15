import React from "react";
import { SkeletonCard } from "@/components/erp/skeleton-card";
import { Sparkles, Search, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function CoursesLoading() {
  return (
    <div className="space-y-10 max-w-[1400px] mx-auto pb-20 px-4 sm:px-6">
      {/* Header Section Skeleton */}
      <div className="relative flex flex-col lg:flex-row lg:items-end justify-between gap-8">
        <div className="space-y-4 relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-100 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700/50">
            <Sparkles className="h-3.5 w-3.5 text-amber-500 animate-pulse" />
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500">Product Architecture</span>
          </div>
          <div className="space-y-1">
            <h2 className="text-5xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-50">
              课程库 <span className="text-zinc-300 dark:text-zinc-700 font-light ml-2">/ Courses</span>
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
          <Button disabled className="h-16 px-10 bg-zinc-900 dark:bg-zinc-50 rounded-[1.5rem] group font-bold text-base opacity-50">
            <Plus className="mr-2 h-5 w-5" /> 
            新增课程
          </Button>
        </div>
      </div>

      {/* Filter Bar Skeleton */}
      <div className="sticky top-6 z-30 flex flex-col md:flex-row items-center gap-4 bg-white/70 dark:bg-zinc-900/80 p-2.5 rounded-[2rem] border border-zinc-200/60 dark:border-zinc-800/60 backdrop-blur-3xl">
        <div className="relative flex-1 w-full md:max-w-md bg-zinc-100 dark:bg-zinc-800 h-10 rounded-xl animate-pulse" />
        <div className="h-8 w-[1px] bg-zinc-200 dark:bg-zinc-800 hidden md:block" />
        <div className="flex gap-1.5 overflow-x-auto w-full md:w-auto pb-2 md:pb-0 px-2">
            {[1, 2, 3, 4, 5].map(i => (
                <div key={i} className="h-10 w-20 bg-zinc-200 dark:bg-zinc-800 rounded-2xl animate-pulse" />
            ))}
        </div>
      </div>

      {/* Course Cards Grid Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {Array.from({ length: 6 }).map((_, i) => (
          <SkeletonCard key={i} lines={4} />
        ))}
      </div>
    </div>
  );
}
