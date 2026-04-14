export const dynamic = "force-dynamic";

import React from "react";
import { getEduCoursesWithDetails, getClasses } from "@/app/erp/actions";
import TuningDeskClient from "./tuning-desk-client";

// Server Component — 直接从 ERP 数据库拉取真实数据及嵌套好的单课信息
export default async function TuningDeskPage() {
  const [courses, classes] = await Promise.all([
    getEduCoursesWithDetails(),
    getClasses(),
  ]);

  return (
    <TuningDeskClient courses={courses} classes={classes} />
  );
}
