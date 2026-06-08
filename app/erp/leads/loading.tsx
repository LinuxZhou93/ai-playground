import React from "react";
import { SkeletonCard } from "@/components/erp/skeleton-card";

export default function LeadsLoading() {
  return (
    <div className="space-y-8 max-w-[1600px] mx-auto pb-20 px-4 sm:px-6 w-full pt-4">
      <div className="h-40 w-full bg-zinc-900 rounded-[2.5rem] animate-pulse"></div>
      <div className="flex gap-6 overflow-x-hidden">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="w-[340px] shrink-0 space-y-4">
             <div className="h-14 w-full bg-zinc-100 dark:bg-zinc-900 rounded-2xl animate-pulse" />
             <SkeletonCard lines={4} />
             <SkeletonCard lines={3} />
          </div>
        ))}
      </div>
    </div>
  );
}
