import React from "react";
import { SkeletonCard, SkeletonTable } from "@/components/erp/skeleton-card";

export default function AttendanceLoading() {
  return (
    <div className="space-y-8 max-w-[1440px] mx-auto pb-20 px-4 sm:px-6 w-full">
      <div className="h-48 w-full bg-zinc-900 rounded-[2.5rem] animate-pulse"></div>
      
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        <div className="lg:col-span-8">
          <SkeletonTable rows={8} cols={4} />
        </div>
        <div className="lg:col-span-4 space-y-10">
          <SkeletonCard lines={8} />
          <SkeletonCard lines={4} />
        </div>
      </div>
    </div>
  );
}
