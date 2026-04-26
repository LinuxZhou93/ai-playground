"use client";

import React, { useState, useOptimistic } from "react";
import { 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Sparkles, 
  GraduationCap,
  Loader2,
  Copy,
  Check,
  Users,
  CalendarDays,
  TrendingUp,
  ChevronRight,
  Zap,
  ArrowUpRight,
  MousePointerClick,
  Activity,
  ShieldCheck,
  Target,
  ImagePlus
} from "lucide-react";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle,
  CardDescription,
  CardFooter
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { 
  generateAIFeedback, 
  getStudentsByClass, 
  markAttendance,
  batchMarkAttendance,
  loadAttendanceData
} from "../actions";
import { toast } from "sonner";
import { PageTransition, StaggerContainer, StaggerItem } from "@/components/erp/page-transition";
import { motion, AnimatePresence } from "motion/react";

export default function AttendanceClient({ initialData }: { initialData: any }) {
  const { classes: c, stats: st } = initialData;
  const [classes, setClasses] = useState<any[]>(c);
  const [selectedClassId, setSelectedClassId] = useState<string>(c.length > 0 ? c[0].id : "");
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [markingId, setMarkingId] = useState<string | null>(null);
  const [batchLoading, setBatchLoading] = useState(false);
  const [stats, setStats] = useState<any>(st);
  
  const [aiLoading, setAiLoading] = useState(false);
  const [reportText, setReportText] = useState("");
  const [selectedKeywords, setSelectedKeywords] = useState<string[]>([]);
  const [selectedStudentForAI, setSelectedStudentForAI] = useState<any>(null);
  const [copied, setCopied] = useState(false);

  // V3 乐观更新 Hook
  const [optimisticStudents, addOptimisticUpdate] = useOptimistic(
    students,
    (state, update: { type: "SINGLE", id: string, status: string } | { type: "BATCH" }) => {
      if (update.type === "SINGLE") {
        return state.map(s => s.id === update.id ? { 
          ...s, 
          attendanceStatus: update.status, 
          remaining_lessons: update.status === 'PRESENT' ? Math.max(0, Number(s.remaining_lessons) - 1) : s.remaining_lessons 
        } : s);
      } else {
        return state.map(s => !s.attendanceStatus ? {
          ...s,
          attendanceStatus: 'PRESENT',
          remaining_lessons: Math.max(0, Number(s.remaining_lessons) - 1)
        } : s);
      }
    }
  );

  const today = new Date();
  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
  const weekDay = ["日", "一", "二", "三", "四", "五", "六"][today.getDay()];


  // 选择班级时加载学员
  React.useEffect(() => {
    if (selectedClassId) {
      setLoading(true);
      getStudentsByClass(selectedClassId).then(data => {
        setStudents(data);
        setLoading(false);
      });
    }
  }, [selectedClassId]);

  const playBeep = () => {
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = "sine";
      osc.frequency.setValueAtTime(800, ctx.currentTime);
      gain.gain.setValueAtTime(0.1, ctx.currentTime);
      osc.start();
      osc.stop(ctx.currentTime + 0.1);
    } catch(e) {}
  };

  const handleMarkAttendance = async (studentId: string, status: "PRESENT" | "ABSENT" | "LEAVE") => {
    // 乐观立刻更新 UI
    if (status === "PRESENT") playBeep();
    addOptimisticUpdate({ type: "SINGLE", id: studentId, status });
    
    // 静默状态锁定（可选，防止重复点击）
    setMarkingId(studentId);
    try {
      await markAttendance({ studentId, classId: selectedClassId, status, consumptionValue: 1.0 });
      // 网络请求真正成功后再同步 React State
      setStudents(prev => prev.map(s => 
        s.id === studentId ? { ...s, attendanceStatus: status, remaining_lessons: status === 'PRESENT' ? Math.max(0, Number(s.remaining_lessons) - 1) : s.remaining_lessons } : s
      ));
      toast.success(`${status === "PRESENT" ? "✅ 出席已记录" : status === "ABSENT" ? "❌ 缺席已记录" : "⏳ 请假已记录"}`);
    } catch (error) {
      toast.error("操作失败，页面即将回滚");
    } finally {
      setMarkingId(null);
    }
  };

  const handleBatchMark = async () => {
    const unmarked = students.filter(s => !s.attendanceStatus);
    if (unmarked.length === 0) {
      toast.info("所有学员已完成签到");
      return;
    }
    
    // 一键乐观标绿
    playBeep();
    addOptimisticUpdate({ type: "BATCH" });
    setBatchLoading(true);

    try {
      const result = await batchMarkAttendance(selectedClassId, unmarked.map(s => s.id));
      setStudents(prev => prev.map(s => ({
        ...s,
        attendanceStatus: s.attendanceStatus || 'PRESENT',
        remaining_lessons: !s.attendanceStatus ? Math.max(0, Number(s.remaining_lessons) - 1) : s.remaining_lessons
      })));
      toast.success(`🎉 批量签到静默完成！共记录 ${result.count} 名`);
    } catch (err) {
      toast.error("批量签到网络异常");
    } finally {
      setBatchLoading(false);
    }
  };

  const handleGenerateAI = async () => {
    if (!selectedStudentForAI) {
      toast.warning("请先在左侧点击学员以选中。");
      return;
    }
    if (selectedKeywords.length === 0) {
      toast.warning("请至少勾选一个关键词。");
      return;
    }
    
    setAiLoading(true);
    setReportText("");
    try {
      const feedback = await generateAIFeedback(selectedStudentForAI.name, selectedKeywords, selectedClassId);
      // 打字机效果
      let idx = 0;
      const interval = setInterval(() => {
        idx += 2;
        setReportText(feedback.slice(0, idx));
        if (idx >= feedback.length) clearInterval(interval);
      }, 20);
      toast.success("AI 点评生成成功！");
    } catch (error) {
      toast.error("生成失败");
    } finally {
      setAiLoading(false);
    }
  };

  const handleCopy = () => {
    if (reportText) {
      navigator.clipboard.writeText(reportText);
      setCopied(true);
      toast.success("已复制到剪贴板");
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const toggleKeyword = (kw: string) => {
    setSelectedKeywords(prev => 
      prev.includes(kw) ? prev.filter(k => k !== kw) : [...prev, kw]
    );
  };

  const presentCount = optimisticStudents.filter(s => s.attendanceStatus === 'PRESENT').length;
  const markedCount = optimisticStudents.filter(s => s.attendanceStatus).length;
  const attendanceRate = markedCount > 0 ? (presentCount / markedCount) * 100 : 0;
  
  return (
    <PageTransition>
      <div className="space-y-8 max-w-[1440px] mx-auto pb-20 px-4 sm:px-6">
        {/* Header Section: Linear/Stripe Glassmorphism */}
        <div className="relative overflow-hidden rounded-[2.5rem] bg-zinc-950 p-8 md:p-12 text-white shadow-[0_40px_80px_-20px_rgba(0,0,0,0.5)] border border-white/5">
          <div className="absolute top-0 right-0 -mr-24 -mt-24 h-[500px] w-[500px] rounded-full bg-emerald-500/10 blur-[120px] animate-pulse" />
          <div className="absolute bottom-0 left-0 -ml-24 -mb-24 h-[500px] w-[500px] rounded-full bg-indigo-500/10 blur-[120px] animate-pulse" />
          
          <div className="relative flex flex-col lg:flex-row lg:items-center justify-between gap-10">
            <div className="flex items-start md:items-center gap-8">
              <motion.div 
                initial={{ scale: 0.8, opacity: 0, rotate: -10 }}
                animate={{ scale: 1, opacity: 1, rotate: 0 }}
                transition={{ type: "spring", damping: 15 }}
                className="flex h-24 w-24 shrink-0 items-center justify-center rounded-[2rem] bg-gradient-to-br from-white/15 to-white/5 backdrop-blur-3xl border border-white/20 shadow-[0_20px_40px_rgba(0,0,0,0.3)]"
              >
                <CheckCircle2 className="h-12 w-12 text-emerald-400 drop-shadow-[0_0_15px_rgba(52,211,153,0.6)]" />
              </motion.div>
              <div className="space-y-3">
                <div className="flex flex-wrap items-center gap-4">
                  <h2 className="text-5xl font-black tracking-tighter bg-clip-text text-transparent bg-gradient-to-b from-white via-zinc-200 to-zinc-500">
                    智能教务签到
                  </h2>
                  <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/30 backdrop-blur-md px-4 py-1.5 text-[10px] font-black uppercase tracking-[0.2em]">
                    Live System
                  </Badge>
                </div>
                <div className="flex flex-wrap items-center gap-6 text-zinc-400">
                  <div className="relative group">
                    <select 
                      className="bg-zinc-900/80 hover:bg-zinc-800 transition-all rounded-2xl px-6 py-2.5 pr-12 font-bold text-emerald-400 border border-white/10 focus:ring-4 focus:ring-emerald-500/10 cursor-pointer appearance-none text-sm shadow-xl"
                      value={selectedClassId}
                      onChange={(e) => setSelectedClassId(e.target.value)}
                    >
                      {classes.map(c => <option key={c.id} value={c.id} className="bg-zinc-900 text-white">{c.name}</option>)}
                    </select>
                    <ChevronRight className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 rotate-90 pointer-events-none text-emerald-400/50" />
                  </div>
                  <div className="flex items-center gap-3 text-sm font-bold bg-white/5 px-5 py-2.5 rounded-2xl border border-white/10 backdrop-blur-md">
                    <CalendarDays className="h-4 w-4 text-zinc-500" />
                    <span className="text-zinc-100">{todayStr}</span>
                    <span className="text-zinc-500 font-black">周{weekDay}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-8">
              <div className="flex items-center gap-6 bg-white/[0.02] backdrop-blur-3xl p-5 px-8 rounded-[2.5rem] border border-white/10 shadow-2xl ring-1 ring-white/5">
                <div className="relative w-20 h-20 flex items-center justify-center">
                  <svg className="w-20 h-20 transform -rotate-90">
                    <circle cx="40" cy="40" r="36" stroke="currentColor" strokeWidth="6" fill="transparent" className="text-white/5" />
                    <motion.circle
                      cx="40" cy="40" r="36"
                      stroke="currentColor" strokeWidth="6" fill="transparent"
                      strokeDasharray={2 * Math.PI * 36}
                      initial={{ strokeDashoffset: 2 * Math.PI * 36 }}
                      animate={{ strokeDashoffset: 2 * Math.PI * 36 - (attendanceRate / 100) * (2 * Math.PI * 36) }}
                      transition={{ duration: 2, ease: [0.23, 1, 0.32, 1] }}
                      className={attendanceRate >= 80 ? "text-emerald-400" : attendanceRate >= 60 ? "text-amber-400" : "text-rose-400"}
                      strokeLinecap="round"
                    />
                  </svg>
                  <span className="absolute text-lg font-black tracking-tighter font-mono">
                    {optimisticStudents.length > 0 ? Math.round(attendanceRate) + "%" : "0%"}
                  </span>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] uppercase tracking-[0.3em] text-zinc-500 font-black">Attendance Rate</p>
                  <p className="text-3xl font-mono font-black flex items-baseline gap-2">
                    <span className="text-emerald-400">{markedCount}</span>
                    <span className="text-zinc-800 text-xl">/</span>
                    <span className="text-zinc-400">{optimisticStudents.length}</span>
                  </p>
                </div>
              </div>
              
              <Button 
                onClick={handleBatchMark}
                disabled={batchLoading}
                className="group relative h-20 px-12 rounded-[2rem] bg-emerald-500 hover:bg-emerald-400 text-emerald-950 font-black text-lg transition-all hover:scale-[1.02] active:scale-95 shadow-[0_25px_50px_-12px_rgba(16,185,129,0.4)] overflow-hidden border-b-4 border-emerald-700"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:animate-[shimmer_2s_infinite]" />
                {batchLoading ? <Loader2 className="h-7 w-7 animate-spin" /> : (
                  <div className="flex items-center gap-4">
                    <Zap className="h-6 w-6 fill-current" />
                    <span>一键全员签到</span>
                  </div>
                )}
              </Button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* Main Attendance List */}
          <Card className="lg:col-span-8 border-none bg-white/80 dark:bg-zinc-900/40 backdrop-blur-2xl shadow-[0_40px_100px_-20px_rgba(0,0,0,0.1)] ring-1 ring-zinc-200 dark:ring-zinc-800/50 overflow-hidden rounded-[3rem]">
            <CardHeader className="border-b border-zinc-100 dark:border-zinc-800/50 px-12 py-10 bg-zinc-50/50 dark:bg-zinc-900/50">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <CardTitle className="text-2xl font-black tracking-tight flex items-center gap-4 text-zinc-900 dark:text-zinc-100">
                    学员签到名册
                    <Badge className="px-4 py-1 text-[10px] bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 rounded-full font-black uppercase tracking-widest">
                      {optimisticStudents.length} Active Students
                    </Badge>
                  </CardTitle>
                  <CardDescription className="text-zinc-500 font-bold text-sm">点击学员卡片开启 AI 深度点评模式，系统将自动分析课堂表现</CardDescription>
                </div>
                <AnimatePresence>
                  {markedCount === optimisticStudents.length && optimisticStudents.length > 0 && (
                    <motion.div
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className="flex items-center gap-3 px-6 py-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-black shadow-sm"
                    >
                      <ShieldCheck className="h-5 w-5" />
                      今日任务已全部达成
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </CardHeader>
            <CardContent className="p-0">
               <div className="relative min-h-[600px]">
                  {loading ? (
                     <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/60 dark:bg-zinc-950/60 backdrop-blur-xl z-20">
                        <div className="relative">
                          <Loader2 className="h-16 w-16 animate-spin text-emerald-500" />
                          <div className="absolute inset-0 blur-2xl bg-emerald-500/30 animate-pulse" />
                        </div>
                        <p className="mt-8 text-xs font-black text-zinc-400 uppercase tracking-[0.4em] animate-pulse">Synchronizing Data</p>
                     </div>
                  ) : optimisticStudents.length === 0 ? (
                     <div className="flex flex-col items-center justify-center p-40 text-center">
                        <div className="h-32 w-32 rounded-[3rem] bg-zinc-100 dark:bg-zinc-800/50 flex items-center justify-center mb-8 shadow-inner ring-1 ring-zinc-200 dark:ring-zinc-700">
                          <Users className="h-12 w-12 text-zinc-300 dark:text-zinc-600" />
                        </div>
                        <h3 className="text-2xl font-black text-zinc-900 dark:text-zinc-100">暂无学员数据</h3>
                        <p className="text-sm text-zinc-500 max-w-[280px] mt-3 font-bold leading-relaxed">该班级目前没有在读学员，请先在教务系统添加学员信息。</p>
                     </div>
                  ) : (
                    <div className="divide-y divide-zinc-100 dark:divide-zinc-800/50">
                      {optimisticStudents.map((student, idx) => (
                        <motion.div
                          key={student.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: idx * 0.015, duration: 0.15, ease: [0.23, 1, 0.32, 1] }}
                          className={`group relative flex flex-col sm:flex-row sm:items-center justify-between px-12 py-8 transition-all duration-500 cursor-pointer ${
                            selectedStudentForAI?.id === student.id 
                              ? "bg-indigo-50/60 dark:bg-indigo-500/5" 
                              : "hover:bg-zinc-50/80 dark:hover:bg-zinc-800/30"
                          }`}
                          onClick={() => setSelectedStudentForAI(student)}
                        >
                           {selectedStudentForAI?.id === student.id && (
                             <motion.div layoutId="active-indicator" className="absolute left-0 top-4 bottom-4 w-1.5 bg-indigo-500 rounded-r-full shadow-[0_0_15px_rgba(79,70,229,0.5)]" />
                           )}
                           
                           <div className="flex items-center gap-8">
                              <div className="relative">
                                <motion.div 
                                  whileHover={{ scale: 1.05, rotate: 5 }}
                                  whileTap={{ scale: 0.95 }}
                                  className={`h-20 w-20 rounded-[1.75rem] flex items-center justify-center font-black text-2xl transition-all duration-500 shadow-2xl ${
                                  student.attendanceStatus === 'PRESENT' 
                                    ? 'bg-emerald-500 text-white' 
                                    : student.attendanceStatus === 'ABSENT'
                                    ? 'bg-rose-500 text-white'
                                    : student.attendanceStatus === 'LEAVE'
                                    ? 'bg-amber-500 text-white'
                                    : selectedStudentForAI?.id === student.id 
                                    ? "bg-indigo-600 text-white scale-110 shadow-indigo-500/40 ring-4 ring-indigo-500/20" 
                                    : "bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 ring-1 ring-zinc-200 dark:ring-zinc-700"
                                }`}>
                                   {student.name[0]}
                                </motion.div>
                                <AnimatePresence>
                                  {student.attendanceStatus && (
                                    <motion.div 
                                      initial={{ scale: 0, rotate: -90 }} animate={{ scale: 1, rotate: 0 }}
                                      className="absolute -bottom-2 -right-2 bg-white dark:bg-zinc-900 rounded-2xl p-2 shadow-2xl ring-2 ring-white dark:ring-zinc-900"
                                    >
                                      {student.attendanceStatus === 'PRESENT' && <CheckCircle2 className="h-5 w-5 text-emerald-500" />}
                                      {student.attendanceStatus === 'ABSENT' && <XCircle className="h-5 w-5 text-rose-500" />}
                                      {student.attendanceStatus === 'LEAVE' && <Clock className="h-5 w-5 text-amber-500" />}
                                    </motion.div>
                                  )}
                                </AnimatePresence>
                              </div>
                              <div className="space-y-2">
                                 <p className="font-black text-zinc-900 dark:text-zinc-100 tracking-tight text-xl flex items-center gap-3">
                                   {student.name}
                                   {selectedStudentForAI?.id === student.id && (
                                     <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-[10px] font-black text-indigo-500 bg-indigo-500/10 px-2 py-0.5 rounded-md uppercase tracking-widest">Selected</motion.span>
                                   )}
                                 </p>
                                 <div className="flex items-center gap-4">
                                   <Badge variant="secondary" className={`text-[11px] font-black px-4 py-1 rounded-xl shadow-none border-none ${Number(student.remaining_lessons) < 3 ? 'bg-rose-100 text-rose-600 dark:bg-rose-500/20' : 'bg-zinc-100 text-zinc-500 dark:bg-zinc-800'}`}>
                                     {student.remaining_lessons} 课时剩余
                                   </Badge>
                                   {Number(student.remaining_lessons) < 3 && (
                                     <span className="flex items-center gap-1.5 text-[10px] font-black text-rose-500 animate-pulse uppercase tracking-tighter">
                                       <Activity className="h-3.5 w-3.5" /> 余额告急
                                     </span>
                                   )}
                                 </div>
                              </div>
                           </div>
                           
                           <div className="flex items-center gap-4 mt-6 sm:mt-0">
                              <button 
                                disabled={markingId === student.id}
                                onClick={(e) => { e.stopPropagation(); handleMarkAttendance(student.id, "PRESENT"); }}
                                className={`flex items-center gap-2 px-8 py-4 rounded-2xl font-black text-xs transition-all duration-300 active:scale-95 ${student.attendanceStatus === "PRESENT" ? "bg-emerald-500 text-white shadow-[0_15px_30px_rgba(16,185,129,0.4)]" : "bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400 hover:bg-emerald-500 hover:text-white hover:shadow-xl"}`}
                              >
                                 {markingId === student.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
                                 出席
                              </button>
                              <button 
                                disabled={markingId === student.id}
                                onClick={(e) => { e.stopPropagation(); handleMarkAttendance(student.id, "ABSENT"); }}
                                className={`flex items-center gap-2 px-8 py-4 rounded-2xl font-black text-xs transition-all duration-300 active:scale-95 ${student.attendanceStatus === "ABSENT" ? "bg-rose-500 text-white shadow-[0_15px_30px_rgba(244,63,94,0.4)]" : "bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400 hover:bg-rose-500 hover:text-white hover:shadow-xl"}`}
                              >
                                 <XCircle className="h-4 w-4" />
                                 缺席
                              </button>
                              <button 
                                disabled={markingId === student.id}
                                onClick={(e) => { e.stopPropagation(); handleMarkAttendance(student.id, "LEAVE"); }}
                                className={`flex items-center gap-2 px-8 py-4 rounded-2xl font-black text-xs transition-all duration-300 active:scale-95 ${student.attendanceStatus === "LEAVE" ? "bg-amber-500 text-white shadow-[0_15px_30px_rgba(245,158,11,0.4)]" : "bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400 hover:bg-amber-500 hover:text-white hover:shadow-xl"}`}
                              >
                                 <Clock className="h-4 w-4" />
                                 请假
                              </button>
                           </div>
                        </motion.div>
                      ))}
                    </div>
                  )}
               </div>
            </CardContent>
            <CardFooter className="px-12 py-8 bg-zinc-50/80 dark:bg-zinc-900/80 border-t border-zinc-100 dark:border-zinc-800/50">
              <div className="flex items-center gap-4 text-[11px] font-black text-zinc-400 uppercase tracking-widest">
                <div className="h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.8)]" />
                系统提示：签到状态将实时同步至家长端，请谨慎操作。
              </div>
            </CardFooter>
          </Card>

          {/* Right Sidebar: AI & Stats */}
          <div className="lg:col-span-4 space-y-10">
            {/* AI Feedback Card: Linear Style */}
            <Card className="relative overflow-hidden border-none bg-gradient-to-br from-indigo-600 via-indigo-700 to-violet-900 text-white shadow-[0_40px_80px_-15px_rgba(79,70,229,0.5)] rounded-[3rem]">
              <div className="absolute top-0 right-0 p-8 opacity-10">
                <Sparkles className="h-40 w-40 rotate-12" />
              </div>
              <CardHeader className="relative pb-8 pt-12 px-10">
                <CardTitle className="text-3xl font-black flex items-center gap-4">
                  <div className="p-3 bg-white/20 rounded-2xl backdrop-blur-2xl ring-1 ring-white/30">
                    <Sparkles className="h-7 w-7 text-amber-300 animate-pulse" />
                  </div>
                  AI 课堂点评
                </CardTitle>
                <CardDescription className="text-indigo-100/80 text-sm font-bold mt-3 leading-relaxed">
                  {selectedStudentForAI 
                    ? <span className="flex items-center gap-3">正在为 <span className="text-white bg-white/20 px-4 py-1.5 rounded-xl border border-white/20">{selectedStudentForAI.name}</span> 生成报告</span>
                    : "请在左侧名册中点击选择一名学员以开始"}
                </CardDescription>
              </CardHeader>
              <CardContent className="relative space-y-10 px-10 pb-12">
                <div className="space-y-5">
                  <p className="text-[10px] font-black uppercase tracking-[0.3em] text-indigo-200/60">课堂表现维度</p>
                  <div className="flex flex-wrap gap-2.5">
                    {["专注度高", "逻辑严密", "动手能力强", "积极参与", "有创意", "协作能力好", "需多加练习"].map(kw => (
                      <motion.button 
                        key={kw}
                        whileHover={{ y: -3, scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => toggleKeyword(kw)}
                        className={`px-5 py-2.5 rounded-2xl text-[11px] font-black transition-all duration-300 border ${
                          selectedKeywords.includes(kw) 
                            ? 'bg-white text-indigo-700 border-white shadow-[0_15px_30px_rgba(255,255,255,0.3)]' 
                            : 'bg-white/10 border-white/10 text-indigo-100 hover:bg-white/20'
                        }`}
                      >
                        {kw}
                      </motion.button>
                    ))}
                  </div>
                </div>
                
                <div className="relative group">
                  <div className="absolute -inset-1.5 bg-gradient-to-r from-indigo-400 to-purple-400 rounded-[2.5rem] blur-xl opacity-20 group-hover:opacity-40 transition duration-1000"></div>
                  <Textarea 
                    placeholder="AI 生成的专业点评将在此处实时呈现..." 
                    className="relative min-h-[240px] bg-zinc-950/50 border-white/10 text-white placeholder:text-indigo-200/30 resize-none text-sm leading-relaxed focus-visible:ring-white/20 rounded-[2rem] p-8 backdrop-blur-3xl shadow-2xl"
                    value={reportText}
                    onChange={(e) => setReportText(e.target.value)}
                  />
                  <AnimatePresence>
                    {reportText && (
                      <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} className="absolute top-6 right-6">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-12 w-12 rounded-2xl bg-white/10 hover:bg-white/20 text-white backdrop-blur-md border border-white/10"
                          onClick={handleCopy}
                        >
                          {copied ? <Check className="h-6 w-6 text-emerald-300" /> : <Copy className="h-6 w-6" />}
                        </Button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* 🚧 Media Upload Placeholder (In Development) */}
                <div className="flex items-center justify-between p-4 rounded-2xl bg-zinc-900 border border-white/5 shadow-inner">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center">
                      <ImagePlus className="h-5 w-5 text-indigo-300 opacity-50" />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-xs font-bold text-zinc-300">多媒体挂载 (预留接口)</span>
                      <span className="text-[10px] text-zinc-600 mt-0.5">支持课堂照片/视频附件直拽上云，直通兵力家长端端点</span>
                    </div>
                  </div>
                  <Badge className="bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 text-[10px] uppercase font-black tracking-widest px-3">
                    Development P2
                  </Badge>
                </div>
                
                <Button 
                  className="w-full h-20 rounded-[2rem] bg-white text-indigo-700 hover:bg-indigo-50 font-black text-lg shadow-[0_20px_40px_rgba(0,0,0,0.2)] transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed group border-b-4 border-indigo-200"
                  onClick={handleGenerateAI}
                  disabled={aiLoading || !selectedStudentForAI}
                >
                  {aiLoading ? <Loader2 className="h-7 w-7 animate-spin mr-4" /> : <Sparkles className="h-7 w-7 mr-4 group-hover:rotate-12 transition-transform" />}
                  {aiLoading ? "AI 正在深度分析..." : "生成专业点评报告"}
                </Button>
              </CardContent>
            </Card>
            
            {/* Stats Card: Dark Minimalist */}
            <Card className="border-none bg-zinc-950 text-white shadow-[0_40px_80px_-20px_rgba(0,0,0,0.6)] overflow-hidden rounded-[3rem] ring-1 ring-white/10">
              <CardHeader className="pb-6 pt-10 px-10 border-b border-white/5">
                <CardTitle className="text-xs font-black flex items-center gap-4 text-zinc-500 uppercase tracking-[0.4em]">
                  <Activity className="h-5 w-5 text-emerald-400" />
                  教务实时看板
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="grid grid-cols-2 divide-x divide-y divide-white/5">
                  <div className="p-10 space-y-3 group hover:bg-white/[0.03] transition-colors">
                    <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">在读学员</p>
                    <div className="flex items-center justify-between">
                      <p className="text-5xl font-mono font-black tracking-tighter">{stats?.studentCount || "0"}</p>
                      <ArrowUpRight className="h-5 w-5 text-zinc-800 group-hover:text-zinc-400 transition-colors" />
                    </div>
                  </div>
                  <div className="p-10 space-y-3 group hover:bg-white/[0.03] transition-colors">
                    <p className="text-[10px] font-black text-rose-500 uppercase tracking-widest">课时预警</p>
                    <div className="flex items-center justify-between">
                      <p className="text-5xl font-mono font-black tracking-tighter text-rose-500">{stats?.warningCount || 0}</p>
                      <div className="h-3 w-3 rounded-full bg-rose-500 animate-ping shadow-[0_0_15px_rgba(244,63,94,0.8)]" />
                    </div>
                  </div>
                  <div className="p-10 space-y-3 group hover:bg-white/[0.03] transition-colors">
                    <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">本月新签</p>
                    <p className="text-5xl font-mono font-black tracking-tighter text-indigo-400">{stats?.newCount || 0}</p>
                  </div>
                  <div className="p-10 space-y-3 group hover:bg-white/[0.03] transition-colors">
                    <p className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">确认收入</p>
                    <div className="flex items-baseline gap-2">
                      <span className="text-lg font-black text-emerald-400/30">¥</span>
                      <p className="text-4xl font-mono font-black tracking-tighter text-emerald-400">
                        {(stats?.revenueMonth || 0).toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
              <div className="bg-emerald-500/5 p-8 flex items-center justify-between border-t border-white/5">
                <div className="flex items-center gap-3">
                  <Target className="h-4 w-4 text-emerald-500" />
                  <span className="text-[10px] font-black text-emerald-500 uppercase tracking-[0.3em]">教务健康度评分</span>
                </div>
                <div className="flex gap-2">
                  {[1,2,3,4,5].map(i => (
                    <motion.div 
                      key={i} 
                      initial={{ opacity: 0.2 }}
                      animate={{ opacity: i <= 4 ? 1 : 0.1 }}
                      className={`h-2 w-8 rounded-full ${i <= 4 ? 'bg-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.6)]' : 'bg-zinc-800'}`} 
                    />
                  ))}
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
      
      <style jsx global>{`
        @keyframes shimmer {
          100% { transform: translateX(100%); }
        }
        ::selection {
          background: rgba(79, 70, 229, 0.2);
          color: #4f46e5;
        }
      `}</style>
    </PageTransition>
  );
}

