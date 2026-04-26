import React from "react";
import { SkeletonKPI, SkeletonTable } from "@/components/erp/skeleton-card";

export default function StudentsLoading() {
  return (
    <div className="space-y-10 max-w-[1600px] mx-auto px-6 pb-24 pt-4 w-full">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {Array.from({ length: 4 }).map((_, i) => <SkeletonKPI key={i} />)}
      </div>
      <div className="mt-10">
        <SkeletonTable rows={10} cols={7} />
      </div>
    </div>
  );
}
