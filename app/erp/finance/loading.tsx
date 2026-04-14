import React from "react";
import { SkeletonKPI, SkeletonTable, SkeletonChart } from "@/components/erp/skeleton-card";

export default function FinanceLoading() {
  return (
    <div className="space-y-10 max-w-[1600px] mx-auto px-6 pb-24 pt-4 w-full">
      <div className="flex flex-col gap-4">
          <div className="h-10 w-48 bg-zinc-200 dark:bg-zinc-800 rounded-md animate-pulse"></div>
          <div className="h-4 w-64 bg-zinc-100 dark:bg-zinc-900 rounded-md animate-pulse"></div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {Array.from({ length: 3 }).map((_, i) => <SkeletonKPI key={i} />)}
      </div>
      <div className="mt-10">
        <SkeletonChart />
      </div>
      <div className="mt-10">
        <SkeletonTable rows={8} cols={6} />
      </div>
    </div>
  );
}
