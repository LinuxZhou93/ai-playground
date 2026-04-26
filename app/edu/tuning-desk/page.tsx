import { getEduCoursesWithDetails, getClasses } from "@/app/erp/actions";
import { getEduAssets } from "@/app/edu/vault/actions";
import TuningDeskClient from "./tuning-desk-client";

// Server Component — 直接从 ERP 数据库拉取真实数据及嵌套好的单课信息
export default async function TuningDeskPage() {
  const courses = await getEduCoursesWithDetails() || [];
  const classes = await getClasses() || [];
  let assets = [];
  try {
     assets = await getEduAssets() || [];
  } catch (e) {
     console.warn("Vault data suppressed due to potential schema misalignment:", e);
  }

  return (
    <TuningDeskClient courses={courses} classes={classes} initialAssets={assets} />
  );
}
