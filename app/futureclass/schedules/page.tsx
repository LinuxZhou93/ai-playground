"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Plus,
  Trash2,
  Loader2,
  Clock,
  MapPin,
  GraduationCap,
  Zap,
  AlertTriangle,
  CheckCircle2,
  X,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  getScheduleClasses,
  getSchedulesByWeek,
  generateSchedules,
  deleteSchedule,
} from "../actions";
import { toast } from "sonner";
import { PageTransition } from "@/components/erp/page-transition";
import { motion, AnimatePresence } from "motion/react";

// ── 工具函数 ──────────────────────────────────────────────
const WEEKDAY_LABELS = ["周日", "周一", "周二", "周三", "周四", "周五", "周六"];
const HOURS = Array.from({ length: 14 }, (_, i) => i + 8); // 8:00 ~ 21:00

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

function fmtShort(d: Date): string {
  return `${d.getMonth() + 1}/${d.getDate()}`;
}

// 课程类别对应的颜色方案
const CATEGORY_COLORS: Record<string, { bg: string; border: string; text: string; dot: string }> = {
  "机器人": { bg: "bg-blue-500/10", border: "border-blue-500/30", text: "text-blue-700 dark:text-blue-300", dot: "bg-blue-500" },
  "编程":   { bg: "bg-violet-500/10", border: "border-violet-500/30", text: "text-violet-700 dark:text-violet-300", dot: "bg-violet-500" },
  "电子":   { bg: "bg-amber-500/10", border: "border-amber-500/30", text: "text-amber-700 dark:text-amber-300", dot: "bg-amber-500" },
  "碳材料": { bg: "bg-emerald-500/10", border: "border-emerald-500/30", text: "text-emerald-700 dark:text-emerald-300", dot: "bg-emerald-500" },
};
const DEFAULT_COLOR = { bg: "bg-indigo-500/10", border: "border-indigo-500/30", text: "text-indigo-700 dark:text-indigo-300", dot: "bg-indigo-500" };

function getColor(category: string | null | undefined) {
  return CATEGORY_COLORS[category || ""] || DEFAULT_COLOR;
}

// ── 主组件 ────────────────────────────────────────────────
export default function SchedulesPage() {
  const [classes, setClasses] = useState<any[]>([]);
  const [schedules, setSchedules] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [weekStart, setWeekStart] = useState<Date>(() => getMonday(new Date()));

  // 排课对话框
  const [dialogOpen, setDialogOpen] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [rule, setRule] = useState({
    classId: "",
    dayOfWeek: 6,      // 默认周六
    startTime: "10:00",
    endTime: "11:30",
    totalLessons: 16,
    startDate: fmt(new Date()),
  });

  // 删除确认
  const [deleteTarget, setDeleteTarget] = useState<any>(null);
  const [deleting, setDeleting] = useState(false);

  const weekEnd = addDays(weekStart, 6);

  // ── 数据加载 ──
  const fetchSchedules = useCallback(async () => {
    setLoading(true);
    const data = await getSchedulesByWeek(fmt(weekStart), fmt(weekEnd));
    setSchedules(data);
    setLoading(false);
  }, [weekStart]);

  useEffect(() => {
    getScheduleClasses().then(setClasses);
  }, []);

  useEffect(() => {
    fetchSchedules();
  }, [fetchSchedules]);

  // ── 周导航 ──
  const prevWeek = () => setWeekStart(prev => addDays(prev, -7));
  const nextWeek = () => setWeekStart(prev => addDays(prev, 7));
  const goToday = () => setWeekStart(getMonday(new Date()));

  // ── 排课执行 ──
  const handleGenerate = async () => {
    if (!rule.classId) { toast.warning("请选择班级"); return; }
    setGenerating(true);
    try {
      const result = await generateSchedules(rule.classId, {
        dayOfWeek: rule.dayOfWeek,
        startTime: rule.startTime,
        endTime: rule.endTime,
        totalLessons: rule.totalLessons,
        startDate: rule.startDate,
      });
      toast.success(`🎯 排课成功！已生成 ${result.count} 节课`);
      setDialogOpen(false);
      fetchSchedules();
    } catch (err: any) {
      toast.error(err.message || "排课失败");
    } finally {
      setGenerating(false);
    }
  };

  // ── 删除 ──
  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await deleteSchedule(deleteTarget.id);
      toast.success("已移除该排课");
      setDeleteTarget(null);
      fetchSchedules();
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setDeleting(false);
    }
  };

  // ── 日历网格数据处理 ──
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
  const today = fmt(new Date());

  // 按 (日期, 时间) 映射排课块
  function getSchedulesForSlot(date: string, hour: number) {
    return schedules.filter((s: any) => {
      const sHour = parseInt(s.start_time?.split(":")[0] || "0", 10);
      return s.lesson_date === date && sHour === hour;
    });
  }

  // 计算排课块的高度跨度（小时数）
  function getSpanHours(s: any): number {
    const sh = parseInt(s.start_time?.split(":")[0] || "0", 10);
    const sm = parseInt(s.start_time?.split(":")[1] || "0", 10);
    const eh = parseInt(s.end_time?.split(":")[0] || "0", 10);
    const em = parseInt(s.end_time?.split(":")[1] || "0", 10);
    return (eh * 60 + em - sh * 60 - sm) / 60;
  }

  // 统计本周排课数
  const weekTotal = schedules.length;
  const weekClassrooms = new Set(schedules.map((s: any) => s.classroom)).size;

  return (
    <PageTransition>
      <div className="space-y-8 max-w-[1600px] mx-auto pb-20 px-4 sm:px-6">
        {/* ── Header ── */}
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
            <p className="text-zinc-500 text-sm font-medium max-w-lg">
              可视化总部教室的每周排课全景，支持一键批量生成未来 N 周的课程时间片，并自动拦截教室冲突。
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-4">
            {/* 统计胶囊 */}
            <div className="flex items-center gap-6 px-6 py-3 bg-white/60 dark:bg-zinc-900/40 backdrop-blur-xl rounded-2xl border border-zinc-200/60 dark:border-zinc-800/60 shadow-lg">
              <div>
                <p className="text-[9px] uppercase tracking-widest text-zinc-400 font-bold">本周排课</p>
                <p className="text-2xl font-black text-zinc-900 dark:text-zinc-100 tabular-nums tracking-tighter">
                  {weekTotal}
                </p>
              </div>
              <div className="w-px h-10 bg-zinc-200 dark:bg-zinc-800" />
              <div>
                <p className="text-[9px] uppercase tracking-widest text-zinc-400 font-bold">教室占用</p>
                <p className="text-2xl font-black text-indigo-600 dark:text-indigo-400 tabular-nums tracking-tighter">
                  {weekClassrooms}
                </p>
              </div>
            </div>

            {/* 一键排课 */}
            <Button
              onClick={() => setDialogOpen(true)}
              className="h-14 px-8 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-bold text-sm shadow-lg shadow-indigo-500/25 transition-all hover:scale-[1.02] active:scale-95 group"
            >
              <Plus className="mr-2 h-5 w-5 transition-transform group-hover:rotate-90 duration-500" />
              智能排课
            </Button>
          </div>
        </div>

        {/* ── 周导航栏 ── */}
        <div className="flex items-center justify-between bg-white dark:bg-zinc-900/60 rounded-2xl border border-zinc-200/60 dark:border-zinc-800/60 px-6 py-4 shadow-sm">
          <div className="flex items-center gap-3">
            <Button variant="outline" size="icon" onClick={prevWeek} className="rounded-xl h-10 w-10 border-zinc-200 dark:border-zinc-800">
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon" onClick={nextWeek} className="rounded-xl h-10 w-10 border-zinc-200 dark:border-zinc-800">
              <ChevronRight className="h-4 w-4" />
            </Button>
            <Button variant="ghost" onClick={goToday} className="text-xs font-bold text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 rounded-xl px-4">
              回到本周
            </Button>
          </div>
          <h2 className="text-lg font-black text-zinc-900 dark:text-zinc-100 tracking-tight">
            {fmtShort(weekStart)} — {fmtShort(weekEnd)}
            <span className="text-zinc-400 font-medium text-sm ml-3">
              {weekStart.getFullYear()}
            </span>
          </h2>
          <div className="flex items-center gap-4">
            {Object.entries(CATEGORY_COLORS).map(([cat, c]) => (
              <div key={cat} className="flex items-center gap-1.5">
                <div className={`h-2.5 w-2.5 rounded-full ${c.dot}`} />
                <span className="text-[10px] font-bold text-zinc-400">{cat}</span>
              </div>
            ))}
          </div>
        </div>

        {/* ── 日历网格 ── */}
        <Card className="border border-zinc-200/60 dark:border-zinc-800/60 bg-white dark:bg-zinc-950 shadow-[0_20px_60px_rgba(0,0,0,0.06)] rounded-3xl overflow-hidden">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <div className="min-w-[900px]">
                {/* 表头：星期 */}
                <div style={{ display: "grid", gridTemplateColumns: "80px repeat(7, 1fr)" }} className="border-b border-zinc-100 dark:border-zinc-800/60 sticky top-0 z-10 bg-white dark:bg-zinc-950">
                  <div className="p-4 border-r border-zinc-100 dark:border-zinc-800/60" />
                  {weekDays.map((d, i) => {
                    const isToday = fmt(d) === today;
                    return (
                      <div
                        key={i}
                        className={`p-4 text-center border-r last:border-r-0 border-zinc-100 dark:border-zinc-800/60 transition-colors ${
                          isToday ? "bg-indigo-50/60 dark:bg-indigo-500/5" : ""
                        }`}
                      >
                        <p className={`text-[10px] font-black uppercase tracking-widest ${
                          isToday ? "text-indigo-600 dark:text-indigo-400" : "text-zinc-400"
                        }`}>
                          {WEEKDAY_LABELS[d.getDay()]}
                        </p>
                        <p className={`text-lg font-black mt-1 tabular-nums ${
                          isToday
                            ? "text-white bg-indigo-600 w-9 h-9 rounded-xl flex items-center justify-center mx-auto"
                            : "text-zinc-900 dark:text-zinc-100"
                        }`}>
                          {d.getDate()}
                        </p>
                      </div>
                    );
                  })}
                </div>

                {/* 时间轴行 */}
                {loading ? (
                  <div className="flex items-center justify-center py-40">
                    <div className="flex flex-col items-center gap-4">
                      <Loader2 className="h-10 w-10 animate-spin text-indigo-500" />
                      <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest">
                        Loading Schedule Grid
                      </p>
                    </div>
                  </div>
                ) : (
                  <div>
                    {HOURS.map(hour => (
                      <div key={hour} style={{ display: "grid", gridTemplateColumns: "80px repeat(7, 1fr)" }} className="border-b border-zinc-50 dark:border-zinc-900 min-h-[72px]">
                        {/* 时间标签 */}
                        <div className="p-3 border-r border-zinc-100 dark:border-zinc-800/60 flex items-start justify-end">
                          <span className="text-[11px] font-bold text-zinc-300 dark:text-zinc-600 tabular-nums">
                            {String(hour).padStart(2, "0")}:00
                          </span>
                        </div>

                        {/* 7 天的时间格 */}
                        {weekDays.map((d, dayIdx) => {
                          const dateStr = fmt(d);
                          const isToday = dateStr === today;
                          const items = getSchedulesForSlot(dateStr, hour);

                          return (
                            <div
                              key={dayIdx}
                              className={`relative border-r last:border-r-0 border-zinc-100 dark:border-zinc-800/60 p-1 ${
                                isToday ? "bg-indigo-50/30 dark:bg-indigo-500/[0.02]" : ""
                              }`}
                            >
                              <AnimatePresence>
                                {items.map((s: any) => {
                                  const span = getSpanHours(s);
                                  const cat = (s.erp_courses as any)?.category;
                                  const color = getColor(cat);
                                  return (
                                    <motion.div
                                      key={s.id}
                                      initial={{ opacity: 0, scale: 0.9, y: 5 }}
                                      animate={{ opacity: 1, scale: 1, y: 0 }}
                                      exit={{ opacity: 0, scale: 0.9 }}
                                      transition={{ type: "spring", damping: 20, stiffness: 300 }}
                                      className={`absolute inset-x-1 rounded-xl ${color.bg} ${color.border} border p-2.5 cursor-pointer group hover:shadow-lg hover:scale-[1.02] transition-all duration-300 z-[5] overflow-hidden`}
                                      style={{ height: `${Math.max(span * 72 - 8, 56)}px` }}
                                      onClick={() => setDeleteTarget(s)}
                                    >
                                      <div className="flex items-start justify-between">
                                        <div className="min-w-0 flex-1">
                                          <p className={`text-[11px] font-black truncate ${color.text}`}>
                                            {(s.erp_classes as any)?.name || "未知班级"}
                                          </p>
                                          <p className="text-[9px] text-zinc-400 font-bold mt-0.5 truncate">
                                            {s.start_time?.slice(0, 5)} - {s.end_time?.slice(0, 5)}
                                          </p>
                                        </div>
                                        <div className={`h-1.5 w-1.5 rounded-full ${color.dot} shrink-0 mt-1`} />
                                      </div>
                                      {span >= 1.5 && (
                                        <div className="mt-2 flex items-center gap-1.5">
                                          <MapPin className="h-2.5 w-2.5 text-zinc-400" />
                                          <span className="text-[9px] text-zinc-400 font-bold truncate">
                                            {s.classroom || "待定"}
                                          </span>
                                        </div>
                                      )}
                                      {/* 悬浮删除按钮 */}
                                      <div className="absolute top-1.5 right-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <div className="p-1 bg-white dark:bg-zinc-900 rounded-lg shadow-md border border-zinc-200 dark:border-zinc-700">
                                          <Trash2 className="h-3 w-3 text-rose-500" />
                                        </div>
                                      </div>
                                    </motion.div>
                                  );
                                })}
                              </AnimatePresence>
                            </div>
                          );
                        })}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* ── 空状态提示 ── */}
        {!loading && schedules.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center py-16 gap-6"
          >
            <div className="p-8 bg-zinc-100 dark:bg-zinc-900 rounded-[2rem] border border-zinc-200 dark:border-zinc-800 shadow-inner">
              <CalendarDays className="h-16 w-16 text-zinc-300 dark:text-zinc-600" />
            </div>
            <div className="text-center space-y-2">
              <h3 className="text-xl font-black text-zinc-900 dark:text-zinc-100">
                本周暂无排课记录
              </h3>
              <p className="text-sm text-zinc-500 font-medium max-w-sm">
                点击右上角「智能排课」按钮，选择班级和时间段，一键生成未来 N 周的课程日历。
              </p>
            </div>
            <Button
              onClick={() => setDialogOpen(true)}
              className="h-12 px-8 bg-indigo-600 text-white rounded-2xl font-bold shadow-lg shadow-indigo-500/20"
            >
              <Plus className="mr-2 h-5 w-5" />
              开始排课
            </Button>
          </motion.div>
        )}

        {/* ── 智能排课 Dialog ── */}
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent className="sm:max-w-[560px] p-0 overflow-hidden rounded-3xl border-zinc-200 dark:border-zinc-800 shadow-[0_40px_80px_-15px_rgba(0,0,0,0.4)] bg-white dark:bg-zinc-950">
            {/* Dialog Header */}
            <div className="bg-zinc-900 dark:bg-zinc-100 p-8 text-white dark:text-zinc-900 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-48 h-48 bg-indigo-500/10 rounded-full -mr-24 -mt-24 blur-3xl" />
              <div className="flex items-center gap-5 relative z-10">
                <div className="w-14 h-14 rounded-2xl bg-indigo-500/20 flex items-center justify-center backdrop-blur-xl border border-white/10">
                  <Zap className="h-7 w-7 text-indigo-300 dark:text-indigo-600" />
                </div>
                <div>
                  <DialogTitle className="text-2xl font-black tracking-tight">
                    智能排课引擎
                  </DialogTitle>
                  <DialogDescription className="text-zinc-400 dark:text-zinc-500 font-bold text-sm mt-1">
                    选定班级与时间规则，引擎将自动检测冲突并批量生成课表。
                  </DialogDescription>
                </div>
              </div>
            </div>

            {/* Dialog Body */}
            <div className="p-8 space-y-6">
              {/* 班级选择 */}
              <div className="space-y-2">
                <label className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em] ml-1">
                  目标班级
                </label>
                <div className="relative">
                  <select
                    className="w-full h-14 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50 px-5 text-base font-bold appearance-none text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
                    value={rule.classId}
                    onChange={e => setRule({ ...rule, classId: e.target.value })}
                  >
                    <option value="">请选择班级</option>
                    {classes.map((c: any) => (
                      <option key={c.id} value={c.id}>
                        {c.name} — {(c.erp_courses as any)?.name || "无课程"} （{c.classroom || "未分配教室"}）
                      </option>
                    ))}
                  </select>
                  <ChevronRight className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 rotate-90 text-zinc-400 pointer-events-none" />
                </div>
              </div>

              {/* 排课规则 */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em] ml-1">
                    上课星期
                  </label>
                  <select
                    className="w-full h-14 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50 px-5 font-bold appearance-none text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
                    value={rule.dayOfWeek}
                    onChange={e => setRule({ ...rule, dayOfWeek: Number(e.target.value) })}
                  >
                    {WEEKDAY_LABELS.map((label, i) => (
                      <option key={i} value={i}>{label}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em] ml-1">
                    总节数
                  </label>
                  <Input
                    type="number"
                    className="h-14 rounded-2xl border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50 px-5 font-bold text-lg tabular-nums"
                    value={rule.totalLessons}
                    onChange={e => setRule({ ...rule, totalLessons: Number(e.target.value) })}
                    min={1}
                    max={52}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em] ml-1">
                    开始时间
                  </label>
                  <Input
                    type="time"
                    className="h-14 rounded-2xl border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50 px-5 font-bold text-base"
                    value={rule.startTime}
                    onChange={e => setRule({ ...rule, startTime: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em] ml-1">
                    结束时间
                  </label>
                  <Input
                    type="time"
                    className="h-14 rounded-2xl border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50 px-5 font-bold text-base"
                    value={rule.endTime}
                    onChange={e => setRule({ ...rule, endTime: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em] ml-1">
                  从哪天开始
                </label>
                <Input
                  type="date"
                  className="h-14 rounded-2xl border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50 px-5 font-bold"
                  value={rule.startDate}
                  onChange={e => setRule({ ...rule, startDate: e.target.value })}
                />
              </div>

              {/* 冲突提醒 */}
              <div className="flex items-start gap-3 p-4 bg-amber-50 dark:bg-amber-500/5 rounded-2xl border border-amber-200 dark:border-amber-500/20">
                <AlertTriangle className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <p className="text-xs font-bold text-amber-700 dark:text-amber-400">
                    冲突检测已启用
                  </p>
                  <p className="text-[11px] text-amber-600/70 dark:text-amber-400/60 leading-relaxed">
                    引擎会自动检测同一教室在相同时间段的重叠排课，发现冲突将硬拦截并提示具体冲撞数据。
                  </p>
                </div>
              </div>

              {/* 操作按钮 */}
              <div className="flex gap-4 pt-2">
                <Button
                  variant="outline"
                  onClick={() => setDialogOpen(false)}
                  className="flex-1 h-14 rounded-2xl border-zinc-200 dark:border-zinc-800 font-bold"
                >
                  取消
                </Button>
                <Button
                  onClick={handleGenerate}
                  disabled={generating || !rule.classId}
                  className="flex-[2] h-14 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold shadow-xl shadow-indigo-500/20 hover:scale-[1.02] active:scale-95 transition-all"
                >
                  {generating ? (
                    <><Loader2 className="h-5 w-5 mr-2 animate-spin" /> 碰撞检测中...</>
                  ) : (
                    <><Zap className="h-5 w-5 mr-2" /> 执行批量排课</>
                  )}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* ── 删除确认 Dialog ── */}
        <Dialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
          <DialogContent className="sm:max-w-[420px] rounded-3xl border-zinc-200 dark:border-zinc-800 shadow-2xl">
            <DialogHeader>
              <DialogTitle className="text-xl font-black flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-rose-100 dark:bg-rose-500/10">
                  <Trash2 className="h-5 w-5 text-rose-500" />
                </div>
                移除排课
              </DialogTitle>
              <DialogDescription className="text-sm text-zinc-500 font-medium pt-3 leading-relaxed">
                确定要移除{" "}
                <span className="font-bold text-zinc-900 dark:text-zinc-100">
                  {deleteTarget?.lesson_date}
                </span>{" "}
                {deleteTarget?.start_time?.slice(0, 5)} - {deleteTarget?.end_time?.slice(0, 5)} 的排课吗？
                <br />
                班级：
                <span className="font-bold text-zinc-900 dark:text-zinc-100">
                  {(deleteTarget?.erp_classes as any)?.name || ""}
                </span>
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="gap-3 pt-4">
              <Button
                variant="outline"
                onClick={() => setDeleteTarget(null)}
                className="flex-1 h-12 rounded-xl font-bold"
              >
                取消
              </Button>
              <Button
                onClick={handleDelete}
                disabled={deleting}
                className="flex-1 h-12 rounded-xl bg-rose-500 hover:bg-rose-600 text-white font-bold shadow-lg shadow-rose-500/20"
              >
                {deleting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Trash2 className="h-4 w-4 mr-2" />}
                确认移除
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </PageTransition>
  );
}
