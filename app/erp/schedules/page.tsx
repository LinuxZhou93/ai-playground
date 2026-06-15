import React from "react";
import { getScheduleClasses, getSchedulesByWeek } from "../actions";
import SchedulesClient from "./schedules-client";

// 工具函数：获取周一
function getMonday(d: Date): Date {
  const date = new Date(d);
  const day = date.getDay();
  const diff = date.getDate() - day + (day === 0 ? -6 : 1);
  date.setDate(diff);
  date.setHours(0, 0, 0, 0);
  return date;
}

function addDays(d: Date, n: number): Date {
  const r = new Date(d);
  r.setDate(r.getDate() + n);
  return r;
}

function fmt(d: Date): string {
  return d.toISOString().split("T")[0];
}

export default async function SchedulesPage() {
  // 服务端获取本周初始数据
  const now = new Date();
  const weekStart = getMonday(now);
  const weekEnd = addDays(weekStart, 6);

  // 并行拉取数据
  const [initialSchedules, initialClasses] = await Promise.all([
    getSchedulesByWeek(fmt(weekStart), fmt(weekEnd)),
    getScheduleClasses()
  ]);

  return (
    <SchedulesClient 
      initialSchedules={initialSchedules} 
      initialClasses={initialClasses}
      initialWeekStartIso={weekStart.toISOString()}
    />
  );
}
