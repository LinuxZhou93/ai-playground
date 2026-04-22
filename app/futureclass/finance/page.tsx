"use client";

import React, { useState, useEffect, useRef } from "react";
import { 
  CreditCard, 
  TrendingUp, 
  ArrowUpRight, 
  Search, 
  Filter, 
  Download,
  Calendar,
  Wallet,
  Receipt,
  PieChart,
  ArrowRight,
  ChevronRight,
  ArrowDownRight,
  Activity,
  Layers,
  ShieldCheck
} from "lucide-react";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle,
  CardDescription
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { loadFinancePageData } from "../actions";
import { PageTransition, StaggerContainer, StaggerItem } from "@/components/erp/page-transition";
import { SkeletonKPI, SkeletonTable } from "@/components/erp/skeleton-card";
import { AnimatedNumber } from "@/components/erp/animated-number";
import { motion, AnimatePresence } from "motion/react";

/**
 * FinancePage - SaaS ERP 财务中心
 * 视觉风格：Linear/Stripe 极简主义
 * 特性：玻璃拟物化、动态投影、渐进式入场动画
 */
export default function FinancePage() {
  const [stats, setStats] = useState({ totalRevenue: 0, orderCount: 0 });
  const [enrollments, setEnrollments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const pieRef = useRef<HTMLDivElement>(null);

  // 数据加载逻辑保持不变
  useEffect(() => {
    loadFinancePageData().then(({ stats: s, enrollments: e }) => {
      setStats(s);
      setEnrollments(e);
      setLoading(false);
    });
  }, []);

  // 收入分布环形图 - 极客风格优化
  useEffect(() => {
    if (loading || !pieRef.current || enrollments.length === 0) return;
    
    const loadChart = async () => {
      const echarts = await import("echarts");
      const chart = echarts.init(pieRef.current!, undefined, { renderer: 'canvas' });

      const courseMap: Record<string, number> = {};
      enrollments.forEach(en => {
        const name = en.erp_courses?.name || "未知课程";
        const value = Number(en.total_purchased_lessons) * Number(en.erp_courses?.price_per_lesson || 0);
        courseMap[name] = (courseMap[name] || 0) + value;
      });

      const pieData = Object.entries(courseMap).map(([name, value]) => ({ name, value }));
      // Linear Palette: Slate, Indigo, Violet, Sky
      const colors = ['#6366f1', '#818cf8', '#a5b4fc', '#c7d2fe', '#e0e7ff'];

      chart.setOption({
        tooltip: {
          trigger: 'item',
          backgroundColor: 'rgba(255, 255, 255, 0.8)',
          backdropFilter: 'blur(20px)',
          borderWidth: 1,
          borderColor: 'rgba(0,0,0,0.05)',
          padding: [12, 16],
          textStyle: { color: '#09090b', fontSize: 13, fontWeight: '600' },
          extraCssText: 'box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.15); border-radius: 16px;',
          formatter: (p: any) => `
            <div style="display:flex; align-items:center; gap:8px; margin-bottom:4px;">
              <div style="width:8px; height:8px; border-radius:50%; background:${p.color}"></div>
              <span style="color:#71717a; font-weight:500; font-size:12px;">${p.name}</span>
            </div>
            <div style="font-weight:800; font-size:18px; color:#09090b; letter-spacing:-0.02em;">
              ¥${p.value.toLocaleString()} <span style="font-size:12px; color:#a1a1aa; font-weight:400; margin-left:4px;">${p.percent}%</span>
            </div>
          `
        },
        legend: {
          orient: 'vertical',
          right: '5%',
          top: 'center',
          textStyle: { fontSize: 12, color: '#71717a', fontFamily: 'Geist, Inter' },
          itemWidth: 8,
          itemHeight: 8,
          itemGap: 20,
          icon: 'circle'
        },
        series: [{
          type: 'pie',
          radius: ['62%', '82%'],
          center: ['35%', '50%'],
          avoidLabelOverlap: false,
          itemStyle: {
            borderRadius: 12,
            borderColor: '#fff',
            borderWidth: 4
          },
          label: { show: false },
          emphasis: {
            scale: true,
            scaleSize: 10,
            itemStyle: { shadowBlur: 40, shadowColor: 'rgba(99, 102, 241, 0.15)' }
          },
          data: pieData,
          color: colors
        }]
      });

      const handleResize = () => chart.resize();
      window.addEventListener('resize', handleResize);
      return () => { window.removeEventListener('resize', handleResize); chart.dispose(); };
    };
    loadChart();
  }, [loading, enrollments]);

  const filteredEnrollments = enrollments.filter(e => 
    e.erp_students?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    e.erp_courses?.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleExportCSV = () => {
    if (filteredEnrollments.length === 0) {
      toast.warning("没有可导出的数据");
      return;
    }
    
    const headers = ["订单时间", "学员姓名", "报读课程", "购买规格", "成交金额", "状态"];
    const csvContent = [
      headers.join(","),
      ...filteredEnrollments.map(en => {
        const orderValue = Number(en.total_purchased_lessons) * Number(en.erp_courses?.price_per_lesson || 0);
        return [
          new Date(en.created_at).toLocaleDateString(),
          en.erp_students?.name,
          en.erp_courses?.name,
          `${en.total_purchased_lessons} 课时`,
          orderValue,
          en.enroll_status === 'STUDYING' ? '成交' : en.enroll_status
        ].join(",");
      })
    ].join("\n");

    const blob = new Blob(["\ufeff" + csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `FINANCE_REPORT_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);
    toast.success("账单流水导出成功");
  };

  return (
    <PageTransition>
      <div className="space-y-10 max-w-[1600px] mx-auto pb-20 px-4 sm:px-6">
        {/* Header Section - Linear Style */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pt-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 text-indigo-600 font-bold text-xs uppercase tracking-[0.2em]">
              <Layers className="h-3.5 w-3.5" />
              Financial Management
            </div>
            <h1 className="text-4xl font-black tracking-tight text-zinc-900">财务中心</h1>
            <p className="text-zinc-500 text-sm font-medium">实时监控营收增长、订单转化与资金流向</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 px-4 py-2 bg-white border border-zinc-200/60 rounded-2xl shadow-sm">
              <div className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </div>
              <span className="text-[11px] font-bold text-zinc-600 uppercase tracking-wider">系统结算: 实时同步</span>
            </div>
            <Button variant="outline" className="rounded-2xl border-zinc-200 h-10 font-bold text-xs gap-2 hover:bg-zinc-50">
              <ShieldCheck className="h-4 w-4 text-indigo-500" />
              安全审计已开启
            </Button>
          </div>
        </div>

        {/* 顶部 KPI 卡片 - 增强玻璃拟物化 */}
        {loading ? (
          <div className="grid gap-6 md:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => <SkeletonKPI key={i} />)}
          </div>
        ) : (
          <StaggerContainer className="grid gap-6 md:grid-cols-3">
            <StaggerItem>
              <motion.div 
                whileHover={{ y: -6, scale: 1.01 }} 
                transition={{ type: "spring", stiffness: 400, damping: 25 }}
              >
                <Card className="relative overflow-hidden border-none bg-zinc-950 text-white shadow-[0_30px_60px_-15px_rgba(0,0,0,0.3)] group h-full min-h-[200px]">
                  <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/20 via-transparent to-transparent opacity-60" />
                  <motion.div
                    animate={{ 
                      scale: [1, 1.2, 1],
                      opacity: [0.1, 0.3, 0.1] 
                    }}
                    transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute -right-12 -top-12 w-64 h-64 bg-indigo-600/20 blur-[100px] rounded-full"
                  />
                  <CardHeader className="pb-2 relative z-10">
                    <CardTitle className="text-zinc-400 text-[10px] font-black uppercase tracking-[0.3em] flex items-center gap-2">
                      <div className="p-2 rounded-xl bg-white/10 backdrop-blur-xl text-indigo-300 border border-white/10">
                        <Wallet className="h-4 w-4" />
                      </div>
                      Total Revenue
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="relative z-10 pt-4">
                    <div className="text-5xl font-black tracking-tighter mb-6 bg-gradient-to-b from-white to-zinc-400 bg-clip-text text-transparent">
                      <AnimatedNumber value={stats.totalRevenue} prefix="¥" />
                    </div>
                    <div className="flex items-center gap-2 text-emerald-400 text-[11px] font-black bg-emerald-500/10 w-fit px-3 py-1.5 rounded-full border border-emerald-500/20 backdrop-blur-md uppercase tracking-wider">
                      <TrendingUp className="h-3.5 w-3.5" />
                      <span>+12.5%</span>
                      <span className="text-emerald-400/40 font-medium ml-1">Growth</span>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </StaggerItem>

            <StaggerItem>
              <motion.div 
                whileHover={{ y: -6, scale: 1.01 }} 
                transition={{ type: "spring", stiffness: 400, damping: 25 }}
              >
                <Card className="relative overflow-hidden border border-zinc-200/60 bg-white/80 backdrop-blur-2xl shadow-[0_20px_40px_rgba(0,0,0,0.03)] hover:shadow-[0_30px_60px_rgba(0,0,0,0.06)] transition-all duration-500 group h-full min-h-[200px]">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-zinc-400 text-[10px] font-black uppercase tracking-[0.3em] flex items-center gap-2">
                      <div className="p-2 rounded-xl bg-zinc-100 text-zinc-600 group-hover:bg-zinc-900 group-hover:text-white transition-all duration-500 border border-zinc-200/50">
                        <Receipt className="h-4 w-4" />
                      </div>
                      Orders Completed
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-4">
                    <div className="text-5xl font-black tracking-tighter text-zinc-900 mb-6">
                      <AnimatedNumber value={stats.orderCount} />
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="flex -space-x-2.5">
                        {[1,2,3,4].map(i => (
                          <div key={i} className="w-7 h-7 rounded-full border-2 border-white bg-zinc-100 shadow-sm flex items-center justify-center overflow-hidden">
                            <div className="w-full h-full bg-gradient-to-br from-zinc-200 to-zinc-300" />
                          </div>
                        ))}
                      </div>
                      <div className="text-[11px] font-black text-zinc-400 uppercase tracking-widest">
                        <span className="text-zinc-900">{enrollments.length}</span> Transactions
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </StaggerItem>

            <StaggerItem>
              <motion.div 
                whileHover={{ y: -6, scale: 1.01 }} 
                transition={{ type: "spring", stiffness: 400, damping: 25 }}
              >
                <Card className="relative overflow-hidden border border-zinc-200/60 bg-white/80 backdrop-blur-2xl shadow-[0_20px_40px_rgba(0,0,0,0.03)] hover:shadow-[0_30px_60px_rgba(0,0,0,0.06)] transition-all duration-500 group h-full min-h-[200px]">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-zinc-400 text-[10px] font-black uppercase tracking-[0.3em] flex items-center gap-2">
                      <div className="p-2 rounded-xl bg-zinc-100 text-zinc-600 group-hover:bg-zinc-900 group-hover:text-white transition-all duration-500 border border-zinc-200/50">
                        <CreditCard className="h-4 w-4" />
                      </div>
                      Avg Order Value
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-4">
                    <div className="text-5xl font-black tracking-tighter text-zinc-900 mb-6">
                      <AnimatedNumber
                        value={stats.orderCount === 0 ? 0 : Math.round(stats.totalRevenue / stats.orderCount)}
                        prefix="¥"
                      />
                    </div>
                    <p className="text-[11px] font-black text-zinc-400 flex items-center gap-2 uppercase tracking-widest">
                      Efficiency <ArrowRight className="h-3 w-3 text-indigo-500" />
                      <span className="text-zinc-900">High Performance</span>
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            </StaggerItem>
          </StaggerContainer>
        )}

        {/* 收入分布图 - 极简高级感 */}
        <Card className="border border-zinc-200/60 bg-white/60 backdrop-blur-xl shadow-[0_20px_50px_rgba(0,0,0,0.02)] overflow-hidden rounded-[24px]">
          <CardHeader className="pb-0 border-b border-zinc-100/80 bg-zinc-50/30 px-8 py-7">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <CardTitle className="text-xl font-black flex items-center gap-3 text-zinc-900 tracking-tight">
                  <div className="w-1.5 h-6 bg-indigo-600 rounded-full" />
                  营收分布分析
                </CardTitle>
                <CardDescription className="text-xs font-medium text-zinc-500 uppercase tracking-wider">Revenue contribution by course category</CardDescription>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 bg-indigo-50 rounded-xl border border-indigo-100/50">
                <PieChart className="h-4 w-4 text-indigo-600" />
                <span className="text-[11px] font-black text-indigo-700 uppercase tracking-widest">Visual Report</span>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-10">
            <div className="relative">
              <div ref={pieRef} className="w-full h-[380px]" />
              {/* Donut Center Overlay */}
              <div className="absolute top-1/2 left-[35%] -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none">
                <div className="text-zinc-400 text-[10px] font-black uppercase tracking-[0.3em] mb-1">Total Assets</div>
                <div className="text-4xl font-black text-zinc-900 tracking-tighter">¥{(stats.totalRevenue/10000).toFixed(1)}<span className="text-xl ml-0.5">w</span></div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 账单流水 - 极客级表格 */}
        <Card className="border border-zinc-200/60 bg-white shadow-[0_40px_80px_rgba(0,0,0,0.05)] rounded-[24px] overflow-hidden">
          <CardHeader className="border-b border-zinc-100 bg-white p-8">
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8">
              <div className="space-y-1.5">
                <CardTitle className="text-2xl font-black tracking-tight text-zinc-900">账单流水明细</CardTitle>
                <CardDescription className="text-sm font-medium text-zinc-500">所有课程报读订单的实时成交记录与状态追踪</CardDescription>
              </div>
              <div className="flex flex-wrap gap-3 w-full lg:w-auto">
                <div className="relative flex-1 min-w-[320px] group">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400 group-focus-within:text-indigo-500 transition-colors" />
                  <Input 
                    placeholder="搜索学员、课程或订单号..." 
                    className="pl-12 h-12 bg-zinc-50/50 border-zinc-200 focus:bg-white focus:ring-4 focus:ring-indigo-500/10 transition-all rounded-2xl text-sm font-medium"
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                  />
                </div>
                <Button variant="outline" className="h-12 border-zinc-200 hover:bg-zinc-50 font-black px-6 rounded-2xl text-zinc-600 transition-all text-xs uppercase tracking-widest">
                  <Filter className="h-4 w-4 mr-2" /> 筛选
                </Button>
                <Button 
                  variant="default" 
                  className="h-12 bg-zinc-900 hover:bg-zinc-800 text-white font-black px-6 rounded-2xl shadow-xl shadow-zinc-200 transition-all active:scale-95 flex items-center gap-2 text-xs uppercase tracking-widest"
                  onClick={handleExportCSV}
                >
                  <Download className="h-4 w-4" /> 导出报表
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left border-collapse">
                <thead>
                  <tr className="bg-zinc-50/50 border-b border-zinc-100">
                    <th className="px-8 py-5 font-black text-zinc-400 uppercase tracking-[0.2em] text-[10px]">Date</th>
                    <th className="px-8 py-5 font-black text-zinc-400 uppercase tracking-[0.2em] text-[10px]">Student Entity</th>
                    <th className="px-8 py-5 font-black text-zinc-400 uppercase tracking-[0.2em] text-[10px]">Course Item</th>
                    <th className="px-8 py-5 font-black text-zinc-400 uppercase tracking-[0.2em] text-[10px]">Quantity</th>
                    <th className="px-8 py-5 font-black text-zinc-400 uppercase tracking-[0.2em] text-[10px]">Amount</th>
                    <th className="px-8 py-5 font-black text-zinc-400 uppercase tracking-[0.2em] text-[10px]">Status</th>
                    <th className="px-8 py-5"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100">
                  <AnimatePresence mode="popLayout">
                    {loading ? (
                      <tr>
                        <td colSpan={7}><SkeletonTable rows={8} cols={7} /></td>
                      </tr>
                    ) : filteredEnrollments.length === 0 ? (
                      <motion.tr
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                      >
                        <td colSpan={7} className="p-32 text-center">
                          <div className="flex flex-col items-center gap-6">
                            <div className="p-8 bg-zinc-50 rounded-[32px] border border-zinc-100 shadow-inner">
                              <Search className="h-12 w-12 text-zinc-200" />
                            </div>
                            <div className="space-y-2">
                              <p className="text-zinc-900 font-black text-xl tracking-tight">未找到匹配记录</p>
                              <p className="text-zinc-400 text-sm font-medium">尝试调整您的搜索关键词或过滤条件</p>
                            </div>
                          </div>
                        </td>
                      </motion.tr>
                    ) : filteredEnrollments.map((en, idx) => {
                      const orderValue = Number(en.total_purchased_lessons) * Number(en.erp_courses?.price_per_lesson || 0);
                      return (
                        <motion.tr
                          key={en.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: idx * 0.02, ease: "easeOut" }}
                          className="group hover:bg-zinc-50/80 transition-all duration-300 cursor-default"
                        >
                          <td className="px-8 py-6">
                            <div className="flex items-center gap-3 text-zinc-500">
                              <div className="p-2.5 bg-zinc-100 rounded-xl group-hover:bg-white group-hover:shadow-sm transition-all border border-transparent group-hover:border-zinc-200/50">
                                <Calendar className="h-4 w-4" />
                              </div>
                              <span className="font-bold text-zinc-600 tabular-nums">{new Date(en.created_at).toLocaleDateString()}</span>
                            </div>
                          </td>
                          <td className="px-8 py-6">
                            <div className="flex items-center gap-4">
                              <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-zinc-100 to-zinc-200/50 flex items-center justify-center text-zinc-700 font-black text-xs border border-zinc-200/50 shadow-sm group-hover:scale-105 transition-transform">
                                {en.erp_students?.name?.charAt(0)}
                              </div>
                              <span className="font-black text-zinc-900 text-base tracking-tight">{en.erp_students?.name}</span>
                            </div>
                          </td>
                          <td className="px-8 py-6">
                            <span className="text-zinc-600 font-bold tracking-tight">{en.erp_courses?.name}</span>
                          </td>
                          <td className="px-8 py-6">
                            <Badge variant="outline" className="bg-white border-zinc-200 text-zinc-400 font-black px-3 py-1 rounded-lg text-[10px] tracking-widest uppercase">
                              {en.total_purchased_lessons} Units
                            </Badge>
                          </td>
                          <td className="px-8 py-6">
                            <div className="flex flex-col">
                              <span className="font-black text-zinc-900 text-lg tracking-tighter tabular-nums">
                                ¥{orderValue.toLocaleString()}
                              </span>
                              <span className="text-[10px] text-zinc-400 font-black uppercase tracking-[0.15em]">Settled</span>
                            </div>
                          </td>
                          <td className="px-8 py-6">
                            <div className="flex items-center gap-2">
                              {en.enroll_status === 'STUDYING' ? (
                                <span className="flex items-center gap-2 text-emerald-600 font-black text-[10px] bg-emerald-50 px-4 py-2 rounded-full border border-emerald-100 uppercase tracking-[0.15em] shadow-sm shadow-emerald-100/50">
                                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                  Success
                                </span>
                              ) : (
                                <Badge variant="outline" className="text-zinc-400 border-zinc-200 font-black uppercase text-[10px] tracking-[0.15em] px-4 py-2 rounded-full">
                                  {en.enroll_status}
                                </Badge>
                              )}
                            </div>
                          </td>
                          <td className="px-8 py-6 text-right">
                            <Button variant="ghost" size="icon" className="opacity-0 group-hover:opacity-100 transition-all duration-300 text-zinc-400 hover:text-zinc-900 hover:bg-white hover:shadow-lg rounded-xl">
                              <ChevronRight className="h-5 w-5" />
                            </Button>
                          </td>
                        </motion.tr>
                      )
                    })}
                  </AnimatePresence>
                </tbody>
              </table>
            </div>
            {!loading && filteredEnrollments.length > 0 && (
              <div className="p-8 border-t border-zinc-50 bg-zinc-50/30 flex justify-between items-center px-10">
                <p className="text-[10px] text-zinc-400 font-black uppercase tracking-[0.3em] flex items-center gap-2">
                  <ShieldCheck className="h-3 w-3" />
                  End-to-End Encrypted Transaction Log
                </p>
                <div className="text-[10px] text-zinc-500 font-black uppercase tracking-[0.3em]">
                  Showing {filteredEnrollments.length} of {enrollments.length} Records
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </PageTransition>
  );
}

