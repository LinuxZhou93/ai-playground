"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "motion/react";
import { 
  TrendingUp, 
  Users, 
  CreditCard, 
  Zap,
  ArrowRight,
  BookOpen,
  GraduationCap,
  CalendarCheck,
  Sparkles,
  ChevronRight,
  Activity,
  ArrowUpRight,
  Target,
  Layers,
  ShieldCheck,
  Clock,
  ArrowDownRight
} from "lucide-react";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle,
  CardDescription
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { loadDashboardData } from "../actions";
import { getOperationalDiagnosis, generateOperationalDirective } from "../diagnosis_actions";
import { PageTransition, StaggerContainer, StaggerItem } from "@/components/erp/page-transition";
import { SkeletonKPI, SkeletonChart } from "@/components/erp/skeleton-card";
import { AnimatedNumber } from "@/components/erp/animated-number";
import DiagnosisBoard from "./DiagnosisBoard";

export default function ERPDashboard() {
  const [stats, setStats] = useState({ studentCount: 0, warningCount: 0, newCount: 0, revenueMonth: 0 });
  const [enrollments, setEnrollments] = useState<any[]>([]);
  const [classes, setClasses] = useState<any[]>([]);
  const [trendData, setTrendData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const chartRef = useRef<HTMLDivElement>(null);
  const radarRef = useRef<HTMLDivElement>(null);

  // V2.1: AI 运营诊断状态
  const [diagnosis, setDiagnosis] = useState<any>(null);
  const [directive, setDirective] = useState("");
  const [diagLoading, setDiagLoading] = useState(true);

  // V3: 首屏数据优先加载（~200ms），不等 AI 诊断
  useEffect(() => {
    loadDashboardData().then(dashData => {
      setStats(dashData.stats);
      setEnrollments(dashData.enrollments);
      setClasses(dashData.classes);
      setTrendData(dashData.trend);
      setLoading(false);
    });
  }, []);

  // V3: AI 诊断异步后挂，不阻塞首屏渲染
  useEffect(() => {
    getOperationalDiagnosis().then(diagData => {
      setDiagnosis(diagData);
      if (diagData) {
        generateOperationalDirective(diagData).then(text => {
          setDirective(text);
          setDiagLoading(false);
        });
      } else {
        setDiagLoading(false);
      }
    });
  }, []);

  // ECharts 消课趋势图
  useEffect(() => {
    if (loading || !chartRef.current) return;
    
    const loadChart = async () => {
      const echarts = await import("echarts");
      const chart = echarts.init(chartRef.current!, undefined, { renderer: 'canvas' });
      
      const days = trendData.map(d => d.label);
      const consumed = trendData.map(d => d.consumed);
      const revenue = trendData.map(d => d.consumed * 200);

      const isDark = document.documentElement.classList.contains('dark');

      chart.setOption({
        tooltip: {
          trigger: 'axis',
          backgroundColor: isDark ? 'rgba(9, 9, 11, 0.95)' : 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(20px)',
          borderWidth: 1,
          borderColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)',
          padding: [16, 20],
          textStyle: { color: isDark ? '#f4f4f5' : '#1e293b', fontSize: 13, fontWeight: '600' },
          extraCssText: 'box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5); border-radius: 20px;',
          axisPointer: { lineStyle: { color: isDark ? '#3f3f46' : '#e2e8f0', width: 2 } }
        },
        legend: {
          data: ['消课量', '确认收入'],
          right: 20,
          top: 0,
          icon: 'rect',
          itemWidth: 12,
          itemHeight: 4,
          itemGap: 32,
          textStyle: { fontSize: 12, color: '#71717a', fontWeight: 600, letterSpacing: 0.5 }
        },
        grid: { top: 60, right: 20, bottom: 40, left: 50, containLabel: false },
        xAxis: {
          type: 'category',
          data: days,
          axisLine: { show: false },
          axisTick: { show: false },
          axisLabel: { color: '#a1a1aa', fontSize: 11, margin: 20, fontWeight: 600 }
        },
        yAxis: [
          {
            type: 'value',
            splitLine: { lineStyle: { color: isDark ? 'rgba(39, 39, 42, 0.4)' : 'rgba(241, 245, 249, 1)', type: 'solid' } },
            axisLabel: { color: '#a1a1aa', fontSize: 11, fontWeight: 600 }
          },
          {
            type: 'value',
            splitLine: { show: false },
            axisLabel: { show: false }
          }
        ],
        series: [
          {
            name: '消课量',
            type: 'bar',
            data: consumed,
            barWidth: 10,
            itemStyle: { 
              borderRadius: [6, 6, 0, 0],
              color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                { offset: 0, color: '#10b981' },
                { offset: 1, color: '#059669' }
              ])
            },
            emphasis: { itemStyle: { color: '#34d399' } }
          },
          {
            name: '确认收入',
            type: 'line',
            yAxisIndex: 1,
            data: revenue,
            smooth: 0.4,
            symbol: 'circle',
            symbolSize: 8,
            showSymbol: false,
            lineStyle: { width: 4, color: '#6366f1', shadowBlur: 20, shadowColor: 'rgba(99,102,241,0.4)' },
            itemStyle: { color: '#6366f1', borderWidth: 3, borderColor: isDark ? '#09090b' : '#fff' },
            areaStyle: {
              color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                { offset: 0, color: 'rgba(99,102,241,0.15)' },
                { offset: 1, color: 'rgba(99,102,241,0)' }
              ])
            }
          }
        ]
      });

      const handleResize = () => chart.resize();
      window.addEventListener('resize', handleResize);
      return () => {
        window.removeEventListener('resize', handleResize);
        chart.dispose();
      };
    };

    loadChart();
  }, [loading, trendData]);

  // 渲染健康度雷达图
  useEffect(() => {
    if (loading || !radarRef.current) return;
    const loadRadar = async () => {
      const echarts = await import('echarts');
      const chart = echarts.init(radarRef.current);
      
      const isDark = document.documentElement.classList.contains('dark');
      const textColor = isDark ? '#a1a1aa' : '#64748b';
      const splitColor = isDark ? 'rgba(39, 39, 42, 0.6)' : '#f1f5f9';

      chart.setOption({
        radar: {
          indicator: [
            { name: '转化率', max: 100 },
            { name: '出勤率', max: 100 },
            { name: '续费预警', max: 100 },
            { name: '客单价', max: 100 },
            { name: '开课率', max: 100 }
          ],
          splitArea: { show: false },
          axisLine: { lineStyle: { color: splitColor } },
          splitLine: { lineStyle: { color: splitColor } },
          axisName: { color: textColor, fontSize: 11, fontWeight: 700, padding: [5, 5], letterSpacing: 1 }
        },
        series: [{
          name: '健康度',
          type: 'radar',
          symbol: 'none',
          data: [{
            value: [78, 92, 45, 88, 70],
            name: '当前周期',
            itemStyle: { color: '#6366f1' },
            areaStyle: { color: 'rgba(99, 102, 241, 0.2)' },
            lineStyle: { width: 3, color: '#6366f1' }
          },
          {
             value: [65, 80, 60, 75, 55],
             name: '上周同期',
             itemStyle: { color: '#94a3b8' },
             areaStyle: { color: 'rgba(148, 163, 184, 0.05)' },
             lineStyle: { width: 2, type: 'dashed', color: '#94a3b8' }
          }]
        }]
      });

      const handleResize = () => chart.resize();
      window.addEventListener('resize', handleResize);
      return () => { window.removeEventListener('resize', handleResize); chart.dispose(); };
    };
    loadRadar();
  }, [loading]);

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return "早安";
    if (h < 18) return "下午好";
    return "晚上好";
  };

  return (
    <PageTransition>
      <div className="space-y-10 pb-24 max-w-[1600px] mx-auto">
        {/* 顶部 Header - Linear 风格 */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 px-2">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="space-y-4"
          >
            <div className="flex items-center gap-3">
              <div className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-indigo-600"></span>
              </div>
              <Badge variant="secondary" className="bg-zinc-100 dark:bg-zinc-800/50 text-zinc-500 dark:text-zinc-400 border-none px-3 py-1 text-[10px] font-black tracking-[0.2em] uppercase">
                Operational Intelligence v4.2
              </Badge>
            </div>
            <h2 className="text-5xl sm:text-7xl font-black tracking-tight text-zinc-900 dark:text-white">
              {greeting()}，指挥官
            </h2>
            <div className="flex flex-wrap items-center gap-6 text-zinc-500 dark:text-zinc-400 font-bold">
              <div className="flex items-center gap-2.5">
                <Activity className="h-4 w-4 text-indigo-500" />
                <span className="text-xs tracking-tight">FutureClass 教务中枢 · 实时就绪</span>
              </div>
              <div className="h-1 w-1 rounded-full bg-zinc-300 dark:bg-zinc-700" />
              <div className="flex items-center gap-2.5">
                <Clock className="h-4 w-4 text-zinc-400" />
                <span className="text-xs tabular-nums tracking-wider uppercase">
                  {new Date().toLocaleDateString("zh-CN", { month: 'long', day: 'numeric', weekday: 'long' })}
                </span>
              </div>
            </div>
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="flex items-center gap-4"
          >
            <Button variant="outline" className="h-14 rounded-2xl px-8 border-zinc-200 dark:border-zinc-800 bg-white/50 dark:bg-zinc-900/50 backdrop-blur-xl hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-all duration-300 font-bold text-xs shadow-sm group">
              <Layers className="h-4 w-4 mr-2 text-zinc-400 group-hover:text-zinc-900 dark:group-hover:text-white transition-colors" />
              导出经营报告
            </Button>
            <Link href="/futureclass/students">
              <Button className="h-14 rounded-2xl px-10 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 hover:bg-black dark:hover:bg-white shadow-[0_20px_40px_-12px_rgba(0,0,0,0.3)] dark:shadow-[0_20px_40px_-12px_rgba(255,255,255,0.1)] transition-all duration-500 group font-bold text-xs">
                <Zap className="h-4 w-4 mr-2 fill-current group-hover:scale-125 transition-transform duration-500" /> 
                新开单报名
              </Button>
            </Link>
          </motion.div>
        </div>

        {/* 4 张核心 KPI 卡 - Glassmorphism & High Contrast */}
        {loading ? (
          <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => <SkeletonKPI key={i} />)}
          </div>
        ) : (
          <StaggerContainer className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
            <StaggerItem>
              <Card className="relative overflow-hidden border-none bg-zinc-950 dark:bg-white group transition-all duration-700 hover:shadow-[0_40px_80px_-15px_rgba(0,0,0,0.4)] dark:hover:shadow-[0_40px_80px_-15px_rgba(0,0,0,0.1)] rounded-[2.5rem]">
                <div className="absolute top-0 right-0 p-10 opacity-10 group-hover:scale-150 group-hover:rotate-12 transition-transform duration-1000 ease-in-out">
                  <Users className="h-32 w-32 text-white dark:text-zinc-900" />
                </div>
                <CardHeader className="pb-2 relative z-10">
                  <CardTitle className="text-[11px] font-black uppercase tracking-[0.25em] text-zinc-500 dark:text-zinc-400">活跃学员总数</CardTitle>
                </CardHeader>
                <CardContent className="relative z-10">
                  <div className="text-7xl font-black text-white dark:text-zinc-950 tracking-tighter">
                    <AnimatedNumber value={stats.studentCount} />
                  </div>
                  <div className="mt-10 flex items-center gap-4">
                    <div className="flex -space-x-3">
                      {[1,2,3,4].map(i => (
                        <div key={i} className="h-8 w-8 rounded-full border-4 border-zinc-950 dark:border-white bg-zinc-800 dark:bg-zinc-200 shadow-2xl" />
                      ))}
                    </div>
                    <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Live Tracking</span>
                  </div>
                </CardContent>
              </Card>
            </StaggerItem>

            <StaggerItem>
              <Card className="relative overflow-hidden border border-zinc-200/50 dark:border-zinc-800/50 bg-white/40 dark:bg-zinc-900/40 backdrop-blur-3xl group hover:border-indigo-500/40 transition-all duration-700 rounded-[2.5rem] hover:shadow-2xl hover:shadow-indigo-500/10">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-[11px] font-black uppercase tracking-[0.25em] text-zinc-500">本月新增报名</CardTitle>
                  <div className="p-3 bg-indigo-500/10 rounded-2xl text-indigo-600 dark:text-indigo-400 group-hover:rotate-[360deg] transition-transform duration-1000 shadow-sm"><TrendingUp className="h-5 w-5" /></div>
                </CardHeader>
                <CardContent>
                  <div className="text-7xl font-black text-zinc-900 dark:text-zinc-100 tracking-tighter">
                    <AnimatedNumber value={stats.newCount} />
                  </div>
                  <div className="mt-10 flex items-center gap-3">
                    <span className="flex items-center text-[11px] font-black text-emerald-500 bg-emerald-500/10 px-4 py-1.5 rounded-full border border-emerald-500/20">
                      <ArrowUpRight className="h-4 w-4 mr-1.5" /> 12.5%
                    </span>
                    <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">vs last month</span>
                  </div>
                </CardContent>
              </Card>
            </StaggerItem>

            <StaggerItem>
              <Card className="relative overflow-hidden border border-zinc-200/50 dark:border-zinc-800/50 bg-white/40 dark:bg-zinc-900/40 backdrop-blur-3xl group hover:border-amber-500/40 transition-all duration-700 rounded-[2.5rem] hover:shadow-2xl hover:shadow-amber-500/10">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-[11px] font-black uppercase tracking-[0.25em] text-zinc-500">月度确认收入</CardTitle>
                  <div className="p-3 bg-amber-500/10 rounded-2xl text-amber-600 dark:text-amber-400 group-hover:scale-125 transition-transform duration-500 shadow-sm"><CreditCard className="h-5 w-5" /></div>
                </CardHeader>
                <CardContent>
                  <div className="text-7xl font-black text-zinc-900 dark:text-zinc-100 tracking-tighter">
                    <AnimatedNumber value={stats.revenueMonth} prefix="¥" />
                  </div>
                  <div className="mt-10 flex items-center gap-4">
                    <div className="w-full h-2.5 bg-zinc-100 dark:bg-zinc-800/50 rounded-full overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: "84%" }}
                        transition={{ duration: 2, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
                        className="h-full bg-gradient-to-r from-amber-400 to-amber-600 rounded-full shadow-[0_0_15px_rgba(245,158,11,0.4)]"
                      />
                    </div>
                    <span className="text-[11px] font-black text-zinc-500 tabular-nums">84%</span>
                  </div>
                </CardContent>
              </Card>
            </StaggerItem>

            <StaggerItem>
              <Card className={`relative overflow-hidden border transition-all duration-700 rounded-[2.5rem] ${stats.warningCount > 0 ? 'border-red-200 bg-red-50/40 dark:border-red-900/30 dark:bg-red-950/20 shadow-2xl shadow-red-500/10' : 'border-zinc-200/50 dark:border-zinc-800/50 bg-white/40 dark:bg-zinc-900/40 backdrop-blur-3xl'}`}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-[11px] font-black uppercase tracking-[0.25em] text-zinc-500">课时预警人数</CardTitle>
                  <div className={`p-3 rounded-2xl ${stats.warningCount > 0 ? 'bg-red-500/10 text-red-600 dark:text-red-400 animate-pulse' : 'bg-zinc-500/10 text-zinc-600'} shadow-sm`}><Zap className="h-5 w-5" /></div>
                </CardHeader>
                <CardContent>
                  <div className={`text-7xl font-black tracking-tighter ${stats.warningCount > 0 ? 'text-red-600 dark:text-red-500' : 'text-zinc-900 dark:text-zinc-100'}`}>
                    <AnimatedNumber value={stats.warningCount} />
                  </div>
                  <div className="mt-10 flex items-center gap-3">
                    <ShieldCheck className={`h-5 w-5 ${stats.warningCount > 0 ? 'text-red-500' : 'text-emerald-500'}`} />
                    <p className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em]">
                      {stats.warningCount > 0 ? 'Immediate Action Required' : 'System Status: Secure'}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </StaggerItem>
          </StaggerContainer>
        )}

        {/* V2.1: AI 运营诊断看板 - Enhanced Glow */}
        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 1, ease: [0.16, 1, 0.3, 1] }}
          className="relative group px-2"
        >
          <div className="absolute -inset-2 bg-gradient-to-r from-indigo-500/20 via-purple-500/20 to-emerald-500/20 rounded-[3rem] blur-3xl opacity-40 group-hover:opacity-80 transition duration-1000" />
          <div className="relative">
            <DiagnosisBoard
              diagnosis={diagnosis}
              directive={directive}
              loading={diagLoading && loading}
            />
          </div>
        </motion.div>

        {/* 图表 + 动态流 - Linear Layout */}
        <div className="grid gap-8 grid-cols-1 lg:grid-cols-12 px-2">
          <Card className="lg:col-span-8 border-zinc-200/50 dark:border-zinc-800/50 bg-white/40 dark:bg-zinc-900/40 backdrop-blur-3xl shadow-2xl shadow-zinc-200/20 dark:shadow-none overflow-hidden rounded-[3rem]">
            <CardHeader className="pb-0 border-b border-zinc-100/50 dark:border-zinc-800/50 mb-10 px-12 pt-12">
              <div className="flex items-center justify-between pb-10">
                <div className="space-y-2">
                  <CardTitle className="text-3xl font-black text-zinc-900 dark:text-zinc-100 tracking-tight">业务增长矩阵</CardTitle>
                  <CardDescription className="text-[11px] font-bold text-zinc-400 uppercase tracking-[0.2em]">Multi-dimensional Campus Health Analysis</CardDescription>
                </div>
                <div className="flex items-center gap-4 px-5 py-2.5 rounded-2xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-100 dark:border-zinc-700/50 shadow-inner">
                  <div className="h-2.5 w-2.5 rounded-full bg-indigo-500 animate-pulse" />
                  <span className="text-[10px] font-black uppercase tracking-[0.25em] text-zinc-500">Analytics Engine</span>
                </div>
              </div>
            </CardHeader>
            <CardContent className="px-12 pb-12 pt-0 flex flex-col xl:flex-row gap-16">
              <div className="flex-[1.8]">
                {loading ? <SkeletonChart /> : <div ref={chartRef} className="w-full h-[420px]" />}
              </div>
              <div className="flex-1 flex flex-col justify-center border-t xl:border-t-0 xl:border-l border-zinc-100 dark:border-zinc-800/80 pt-12 xl:pt-0 xl:pl-16">
                 <div className="mb-12">
                   <div className="inline-flex items-center gap-3 px-5 py-2 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 mb-6 border border-emerald-500/20 shadow-sm">
                     <Target className="h-4 w-4"/> 
                     <span className="text-[11px] font-black uppercase tracking-[0.2em]">Health Index</span>
                   </div>
                   <p className="text-sm font-semibold text-zinc-500 leading-relaxed">
                     基于转化、出勤、续费等 5 个核心维度的自动化评估模型，实时反馈校区运营效能。
                   </p>
                 </div>
                 {loading ? <SkeletonChart /> : <div ref={radarRef} className="w-full h-[320px]" />}
              </div>
            </CardContent>
          </Card>

          <Card className="lg:col-span-4 border-zinc-200/50 dark:border-zinc-800/50 bg-white/40 dark:bg-zinc-900/40 backdrop-blur-3xl shadow-2xl shadow-zinc-200/20 dark:shadow-none rounded-[3rem] overflow-hidden">
            <CardHeader className="pb-10 px-12 pt-12">
              <div className="flex items-center justify-between">
                <CardTitle className="text-3xl font-black text-zinc-900 dark:text-zinc-100 tracking-tight">实时动态</CardTitle>
                <Badge variant="outline" className="rounded-full px-5 py-1.5 border-zinc-200 dark:border-zinc-800 text-[10px] font-black text-zinc-400 tracking-[0.25em] uppercase">Live Feed</Badge>
              </div>
            </CardHeader>
            <CardContent className="px-12">
              {loading ? (
                <div className="space-y-10">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="flex items-center gap-6">
                      <div className="h-16 w-16 rounded-2xl bg-zinc-100 dark:bg-zinc-800 animate-pulse" />
                      <div className="flex-1 space-y-3">
                        <div className="h-5 bg-zinc-100 dark:bg-zinc-800 rounded-lg w-3/4 animate-pulse" />
                        <div className="h-4 bg-zinc-100 dark:bg-zinc-800 rounded-lg w-1/2 animate-pulse" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="relative">
                  <div className="absolute left-[31px] top-4 bottom-4 w-[2px] bg-gradient-to-b from-indigo-500/50 via-zinc-200 dark:via-zinc-800 to-transparent" />
                  <StaggerContainer className="space-y-12 relative">
                    {enrollments.slice(0, 3).map((en, i) => {
                      const value = Number(en.total_purchased_lessons) * Number(en.erp_courses?.price_per_lesson || 0);
                      return (
                        <StaggerItem key={en.id || i}>
                          <div className="flex items-start gap-8 group cursor-default">
                            <div className="relative z-10 p-4 rounded-2xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-indigo-500 shadow-xl group-hover:scale-110 group-hover:border-indigo-500/50 group-hover:shadow-indigo-500/20 transition-all duration-500">
                              <CreditCard className="h-6 w-6" />
                            </div>
                            <div className="flex-1 min-w-0 pt-2">
                              <p className="text-base font-black text-zinc-800 dark:text-zinc-200 truncate group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors duration-300">
                                {en.erp_students?.name || "学员"} 报课成交
                              </p>
                              <p className="text-xs font-bold text-zinc-400 truncate mt-2">
                                {en.erp_courses?.name} · <span className="text-zinc-900 dark:text-zinc-200 font-black">¥{value.toLocaleString()}</span>
                              </p>
                            </div>
                            <div className="text-[11px] font-black text-zinc-400 pt-3 tabular-nums tracking-tighter">
                              {new Date(en.created_at).toLocaleDateString(undefined, { month: 'numeric', day: 'numeric' })}
                            </div>
                          </div>
                        </StaggerItem>
                      );
                    })}

                    {classes.slice(0, 2).map((cls, i) => (
                      <StaggerItem key={cls.id || i}>
                        <div className="flex items-start gap-8 group cursor-default">
                          <div className="relative z-10 p-4 rounded-2xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-emerald-500 shadow-xl group-hover:scale-110 group-hover:border-emerald-500/50 group-hover:shadow-emerald-500/20 transition-all duration-500">
                            <GraduationCap className="h-6 w-6" />
                          </div>
                          <div className="flex-1 min-w-0 pt-2">
                            <p className="text-base font-black text-zinc-800 dark:text-zinc-200 truncate group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors duration-300">
                              新开班级：{cls.name}
                            </p>
                            <p className="text-xs font-bold text-zinc-400 truncate mt-2">
                              {cls.erp_courses?.name} · {cls.classroom || "标准教室"}
                            </p>
                          </div>
                          <div className="text-[11px] font-black text-zinc-400 pt-3 tabular-nums tracking-tighter">
                            {cls.start_date ? cls.start_date.split('-').slice(1).join('/') : 'NEW'}
                          </div>
                        </div>
                      </StaggerItem>
                    ))}
                  </StaggerContainer>
                </div>
              )}
              <Button variant="ghost" className="w-full mt-14 h-14 text-[11px] font-black uppercase tracking-[0.3em] text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800/80 rounded-2xl transition-all duration-500 border border-transparent hover:border-zinc-200 dark:hover:border-zinc-700">
                查看全部动态日志 <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* V2.1: 底部快捷入口 — 路由联通 - Glass Cards */}
        <StaggerContainer className="grid gap-8 grid-cols-1 sm:grid-cols-3 px-2">
          {[
            { 
              href: "/futureclass/students", 
              icon: Users, 
              title: "快速录入学员", 
              desc: "创建新学员档案并分配班级", 
              color: "emerald" 
            },
            { 
              href: "/futureclass/courses", 
              icon: BookOpen, 
              title: "开设新课程", 
              desc: "定义教学产品与定价体系", 
              color: "indigo" 
            },
            { 
              href: "/futureclass/attendance", 
              icon: CalendarCheck, 
              title: "开始今日点名", 
              desc: "AI 考勤与即时课后报告", 
              color: "purple" 
            }
          ].map((item, idx) => (
            <StaggerItem key={idx}>
              <Link href={item.href}>
                <Card className="group relative overflow-hidden border border-zinc-200/50 dark:border-zinc-800/50 bg-white dark:bg-zinc-900/40 hover:bg-zinc-50 dark:hover:bg-zinc-800/60 transition-all duration-700 cursor-pointer rounded-[3rem] hover:shadow-2xl hover:shadow-zinc-200/50 dark:hover:shadow-none">
                  <div className={`absolute top-0 right-0 w-48 h-48 -mr-20 -mt-20 bg-${item.color}-500/5 rounded-full group-hover:scale-150 transition-transform duration-1000`} />
                  <CardContent className="p-12 flex items-center gap-10 relative z-10">
                    <div className={`p-6 bg-${item.color}-500/10 rounded-[2rem] text-${item.color}-600 dark:text-${item.color}-400 group-hover:scale-110 group-hover:rotate-6 transition-all duration-700 shadow-sm border border-${item.color}-500/10`}>
                      <item.icon className="h-10 w-10" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-black text-zinc-900 dark:text-zinc-100 group-hover:text-zinc-950 dark:group-hover:text-white transition-colors duration-300 tracking-tight">{item.title}</h3>
                      <p className="text-xs font-bold text-zinc-400 mt-3 leading-relaxed tracking-wide">{item.desc}</p>
                    </div>
                    <div className="h-14 w-14 rounded-full flex items-center justify-center bg-zinc-100 dark:bg-zinc-800 group-hover:bg-zinc-950 dark:group-hover:bg-white group-hover:text-white dark:group-hover:text-zinc-900 transition-all duration-700 shadow-inner border border-zinc-200/50 dark:border-zinc-700/50">
                      <ArrowRight className="h-6 w-6 transform group-hover:translate-x-1.5 transition-transform duration-500" />
                    </div>
                  </CardContent>
                </Card>
              </Link>
            </StaggerItem>
          ))}
        </StaggerContainer>
      </div>
    </PageTransition>
  );
}

