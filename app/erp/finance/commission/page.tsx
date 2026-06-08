"use client";

import React, { useState, useEffect, useRef } from "react";
import { 
  Users, 
  Wallet, 
  TrendingUp,
  Landmark,
  ChevronLeft,
  CalendarDays,
  FileSpreadsheet,
  Download,
  Flame
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
import { toast } from "sonner";
import { getTeacherCommissionStats } from "../../actions";
import { PageTransition, StaggerContainer, StaggerItem } from "@/components/erp/page-transition";
import { SkeletonTable } from "@/components/erp/skeleton-card";
import Link from "next/link";

export default function CommissionPage() {
  const [stats, setStats] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentMonth, setCurrentMonth] = useState(new Date().toISOString().substring(0, 7)); // YYYY-MM
  const chartRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setLoading(true);
    getTeacherCommissionStats(`${currentMonth}-01`).then(data => {
      setStats(data);
      setLoading(false);
    });
  }, [currentMonth]);

  // ECharts 柱状图：展示所有老师的提成分布
  useEffect(() => {
    if (loading || !chartRef.current || stats.length === 0) return;
    
    const loadChart = async () => {
      const echarts = await import("echarts");
      const chart = echarts.init(chartRef.current!, undefined, { renderer: 'canvas' });
      
      const names = stats.map(s => s.name);
      const commissions = stats.map(s => Math.round(s.estimatedCommission));

      const isDark = document.documentElement.classList.contains('dark');

      chart.setOption({
        tooltip: {
          trigger: 'axis',
          axisPointer: { type: 'shadow' },
          backgroundColor: isDark ? 'rgba(9, 9, 11, 0.9)' : 'rgba(255, 255, 255, 0.9)',
          borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
          textStyle: { color: isDark ? '#fff' : '#000' }
        },
        grid: { top: 30, right: 20, bottom: 30, left: 60 },
        xAxis: {
          type: 'category',
          data: names,
          axisLine: { show: false },
          axisTick: { show: false },
          axisLabel: { color: '#a1a1aa', fontWeight: 600 }
        },
        yAxis: {
          type: 'value',
          splitLine: { lineStyle: { color: isDark ? 'rgba(39, 39, 42, 0.4)' : '#f1f5f9' } },
        },
        series: [{
          name: '预估课时提成 (元)',
          type: 'bar',
          data: commissions,
          barWidth: '40%',
          itemStyle: {
            borderRadius: [8, 8, 0, 0],
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: '#f59e0b' },
              { offset: 1, color: '#d97706' }
            ])
          }
        }]
      });
      window.addEventListener('resize', () => chart.resize());
    };
    loadChart();
  }, [loading, stats]);

  const totalPayout = stats.reduce((sum, s) => sum + s.estimatedCommission, 0);

  return (
    <PageTransition>
      <div className="space-y-8 max-w-[1400px] mx-auto pb-20 px-4 sm:px-6 pt-4">
        
        {/* Header Navigation */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-1.5 flex items-center gap-4">
            <Link href="/erp/finance">
              <Button variant="ghost" size="icon" className="h-10 w-10 rounded-full bg-zinc-100 dark:bg-zinc-900 hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-colors">
                <ChevronLeft className="h-5 w-5 text-zinc-600 dark:text-zinc-400" />
              </Button>
            </Link>
            <div>
              <div className="flex items-center gap-2 text-amber-600 font-bold text-xs uppercase tracking-[0.2em] mb-1">
                <Landmark className="h-3.5 w-3.5" />
                Payroll & Commission Settlement
              </div>
              <h1 className="text-3xl font-black tracking-tight text-zinc-900 border-l-[3px] border-amber-500 pl-3">
                课时薪酬结算中心
              </h1>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <input 
              type="month" 
              value={currentMonth}
              onChange={(e) => setCurrentMonth(e.target.value)}
              className="px-4 py-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl text-sm font-semibold shadow-sm focus:ring-2 focus:ring-amber-500 outline-none"
            />
            <Button className="rounded-xl font-bold bg-amber-500 hover:bg-amber-600 text-white shadow-lg shadow-amber-500/20 gap-2">
              <Download className="h-4 w-4" />
              导出工资条 CSV
            </Button>
          </div>
        </div>

        {loading ? <SkeletonTable /> : (
          <StaggerContainer className="grid lg:grid-cols-3 gap-8">
            
            {/* 左侧：聚合卡片与图表 */}
            <div className="lg:col-span-1 space-y-8">
              <StaggerItem>
                <div className="relative overflow-hidden rounded-[24px] bg-gradient-to-b from-zinc-900 to-black p-8 shadow-2xl border border-zinc-800">
                  <div className="absolute top-0 right-0 p-32 bg-amber-500/10 blur-[100px] rounded-full mix-blend-screen" />
                  <div className="relative z-10">
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center gap-2 text-zinc-400 font-medium">
                        <Wallet className="h-5 w-5 text-amber-500" />
                        <span>本月预计发放（提成）</span>
                      </div>
                    </div>
                    <div className="text-5xl font-black text-white tracking-tighter mb-4">
                      <span className="text-3xl text-zinc-500 mr-1">¥</span>
                      {totalPayout.toLocaleString('zh-CN', { maximumFractionDigits: 0 })}
                    </div>
                    <div className="flex flex-wrap gap-2 mt-6">
                      <Badge variant="outline" className="bg-white/5 border-white/10 text-zinc-300 font-medium flex items-center gap-1.5 px-3 py-1 text-xs">
                        <Users className="h-3.5 w-3.5" /> 授课讲师 {stats.length} 人
                      </Badge>
                      <Badge variant="outline" className="bg-amber-500/10 border-amber-500/20 text-amber-400 font-medium flex items-center gap-1.5 px-3 py-1 text-xs">
                        <TrendingUp className="h-3.5 w-3.5" /> 成本极速核算
                      </Badge>
                    </div>
                  </div>
                </div>
              </StaggerItem>

              <StaggerItem>
                <Card className="rounded-[24px] border-zinc-200/60 shadow-sm overflow-hidden bg-white/50 backdrop-blur-xl">
                  <CardHeader className="bg-zinc-50/50 border-b border-zinc-100 pb-4">
                    <CardTitle className="text-base font-bold flex items-center gap-2">
                      <Flame className="h-4 w-4 text-orange-500" /> 
                      本月“吸金”排行榜
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-0">
                    <div ref={chartRef} className="h-[280px] w-full p-4" />
                  </CardContent>
                </Card>
              </StaggerItem>
            </div>

            {/* 右侧：教师提成明细表格 */}
            <StaggerItem className="lg:col-span-2">
              <Card className="rounded-[24px] border-zinc-200/60 shadow-xl overflow-hidden h-full flex flex-col">
                <CardHeader className="bg-zinc-50/80 dark:bg-zinc-900 border-b border-zinc-100 dark:border-zinc-800 pb-5">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-xl font-bold">教师薪酬明细</CardTitle>
                      <CardDescription className="mt-1 font-medium text-zinc-500">
                        基于真实考勤与课程单价，按 30% 基础分润率计算
                      </CardDescription>
                    </div>
                    <Badge variant="secondary" className="px-3 rounded-full text-xs font-bold text-indigo-700 bg-indigo-100">
                      Auto-Calculated
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="p-0 flex-1 overflow-x-auto">
                  <table className="w-full text-sm text-left">
                    <thead className="bg-zinc-50 dark:bg-zinc-900/40 text-zinc-500 dark:text-zinc-400 text-xs uppercase font-bold tracking-wider">
                      <tr>
                        <th className="px-6 py-4">教师姓名</th>
                        <th className="px-6 py-4">出勤上课频次</th>
                        <th className="px-6 py-4">消耗课时(带班学员数)</th>
                        <th className="px-6 py-4">创造确认收入</th>
                        <th className="px-6 py-4 text-right">预估提成工资</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                      {stats.map((teacher, idx) => (
                        <tr key={teacher.name} className="hover:bg-zinc-50 dark:hover:bg-zinc-900/50 transition-colors group">
                          <td className="px-6 py-4 font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-3">
                            <div className="h-8 w-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white text-xs">
                              {teacher.name.charAt(0)}
                            </div>
                            {teacher.name}
                          </td>
                          <td className="px-6 py-4 font-medium text-zinc-600 dark:text-zinc-400">
                            {teacher.classSessions} 次
                          </td>
                          <td className="px-6 py-4">
                            <Badge variant="outline" className="font-mono text-zinc-700 bg-zinc-100">
                              {teacher.consumedHours.toFixed(1)} hrs
                            </Badge>
                          </td>
                          <td className="px-6 py-4 font-mono text-zinc-500">
                            ¥ {Math.round(teacher.baseRevenue).toLocaleString()}
                          </td>
                          <td className="px-6 py-4 text-right font-black text-amber-600 text-base">
                            ¥ {Math.round(teacher.estimatedCommission).toLocaleString()}
                          </td>
                        </tr>
                      ))}
                      
                      {stats.length === 0 && (
                        <tr>
                          <td colSpan={5} className="px-6 py-20 text-center text-zinc-500">
                            <FileSpreadsheet className="h-10 w-10 mx-auto text-zinc-300 mb-3" />
                            该月份暂无任何有效的带班上课（考勤）记录
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </CardContent>
              </Card>
            </StaggerItem>
          </StaggerContainer>
        )}
      </div>
    </PageTransition>
  );
}
