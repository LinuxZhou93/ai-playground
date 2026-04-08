"use client";

import React, { useState, useEffect, useRef } from "react";
import { 
  TrendingUp, 
  Users, 
  CreditCard, 
  Activity,
  CalendarCheck,
  Zap,
  ArrowRight,
  BookOpen,
  GraduationCap,
  Loader2
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

export default function ERPDashboard() {
  const [stats, setStats] = useState({ studentCount: 0, warningCount: 0, newCount: 0, revenueMonth: 0 });
  const [enrollments, setEnrollments] = useState<any[]>([]);
  const [classes, setClasses] = useState<any[]>([]);
  const [trendData, setTrendData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const chartRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadDashboardData().then(({ stats: s, enrollments: e, classes: c, trend: t }) => {
      setStats(s);
      setEnrollments(e);
      setClasses(c);
      setTrendData(t);
      setLoading(false);
    });
  }, []);

  // ECharts 消课趋势图
  useEffect(() => {
    if (loading || !chartRef.current) return;
    
    const loadChart = async () => {
      const echarts = await import("echarts");
      const chart = echarts.init(chartRef.current!, undefined, { renderer: 'canvas' });
      
      // 使用真实消课数据（假设平均课时单价 200 元估算确认收入）
      const days = trendData.map(d => d.label);
      const consumed = trendData.map(d => d.consumed);
      const revenue = trendData.map(d => d.consumed * 200);

      chart.setOption({
        tooltip: {
          trigger: 'axis',
          backgroundColor: 'rgba(0,0,0,0.8)',
          borderWidth: 0,
          textStyle: { color: '#fff', fontSize: 12 }
        },
        legend: {
          data: ['消课量', '确认收入'],
          right: 20,
          top: 0,
          textStyle: { fontSize: 12, color: '#888' }
        },
        grid: { top: 36, right: 20, bottom: 28, left: 50, containLabel: false },
        xAxis: {
          type: 'category',
          data: days,
          axisLine: { show: false },
          axisTick: { show: false },
          axisLabel: { color: '#999', fontSize: 11 }
        },
        yAxis: [
          {
            type: 'value',
            name: '课时',
            splitLine: { lineStyle: { color: '#f0f0f0', type: 'dashed' } },
            axisLabel: { color: '#999', fontSize: 11 }
          },
          {
            type: 'value',
            name: '¥',
            splitLine: { show: false },
            axisLabel: { color: '#999', fontSize: 11 }
          }
        ],
        series: [
          {
            name: '消课量',
            type: 'bar',
            data: consumed,
            barWidth: 20,
            itemStyle: { 
              borderRadius: [6, 6, 0, 0],
              color: {
                type: 'linear', x: 0, y: 0, x2: 0, y2: 1,
                colorStops: [
                  { offset: 0, color: '#34d399' },
                  { offset: 1, color: '#10b981' }
                ]
              }
            }
          },
          {
            name: '确认收入',
            type: 'line',
            yAxisIndex: 1,
            data: revenue,
            smooth: true,
            symbol: 'circle',
            symbolSize: 6,
            lineStyle: { width: 3, color: '#6366f1' },
            itemStyle: { color: '#6366f1' },
            areaStyle: {
              color: {
                type: 'linear', x: 0, y: 0, x2: 0, y2: 1,
                colorStops: [
                  { offset: 0, color: 'rgba(99,102,241,0.15)' },
                  { offset: 1, color: 'rgba(99,102,241,0.01)' }
                ]
              }
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

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return "早安";
    if (h < 18) return "下午好";
    return "晚上好";
  };

  return (
    <div className="space-y-8">
      {/* 顶部 */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">
            {greeting()}，指挥官 <span className="animate-pulse inline-block">👋</span>
          </h2>
          <p className="text-muted-foreground mt-1">
            FutureClass 教务中枢 · {new Date().toLocaleDateString("zh-CN", { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' })}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">下载报表</Button>
          <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700 shadow-lg shadow-emerald-500/20">
            <Zap className="h-4 w-4 mr-1" /> 新开单报名
          </Button>
        </div>
      </div>

      {/* 4 张核心 KPI 卡 */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="overflow-hidden border-none shadow-md bg-gradient-to-br from-emerald-500 to-teal-600 text-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-emerald-100">活跃学员</CardTitle>
            <div className="p-2 bg-white/20 rounded-lg"><Users className="h-4 w-4" /></div>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-black">{loading ? <Loader2 className="h-8 w-8 animate-spin" /> : stats.studentCount}</div>
            <p className="text-xs text-emerald-200 mt-2">正式在读学员总数</p>
          </CardContent>
        </Card>

        <Card className="overflow-hidden border-none shadow-md">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">本月新增</CardTitle>
            <div className="p-2 bg-indigo-500/10 rounded-lg"><TrendingUp className="h-4 w-4 text-indigo-500" /></div>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-black">{loading ? "..." : stats.newCount}</div>
            <p className="text-xs text-muted-foreground mt-2">新签约报课订单</p>
          </CardContent>
        </Card>

        <Card className="overflow-hidden border-none shadow-md">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">月确认收入</CardTitle>
            <div className="p-2 bg-amber-500/10 rounded-lg"><CreditCard className="h-4 w-4 text-amber-500" /></div>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-black">¥{loading ? "..." : stats.revenueMonth.toLocaleString()}</div>
            <p className="text-xs text-emerald-600 mt-2 flex items-center gap-1">
              <TrendingUp className="h-3 w-3" /> +2.1% 较上月
            </p>
          </CardContent>
        </Card>

        <Card className={`overflow-hidden border-none shadow-md ${stats.warningCount > 0 ? 'ring-2 ring-red-500/30' : ''}`}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">课时预警</CardTitle>
            <div className="p-2 bg-red-500/10 rounded-lg"><Zap className="h-4 w-4 text-red-500" /></div>
          </CardHeader>
          <CardContent>
            <div className={`text-4xl font-black ${stats.warningCount > 0 ? 'text-red-500' : 'text-emerald-500'}`}>
              {loading ? "..." : stats.warningCount}
            </div>
            <p className="text-xs text-muted-foreground mt-2">剩余课时 ≤ 3 的学员</p>
          </CardContent>
        </Card>
      </div>

      {/* 图表 + 动态流 */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
        <Card className="lg:col-span-4 shadow-md border-none">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg">消课趋势 & 确认收入</CardTitle>
                <CardDescription>近 7 日消课量与对应确认收入可视化</CardDescription>
              </div>
              <Badge variant="outline" className="text-xs">实时</Badge>
            </div>
          </CardHeader>
          <CardContent className="p-4">
            <div ref={chartRef} className="w-full h-[300px]" />
          </CardContent>
        </Card>

        <Card className="lg:col-span-3 shadow-md border-none">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">最近动态</CardTitle>
            <CardDescription>系统自动生成的教务日志</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-5">
              {enrollments.slice(0, 4).map((en, i) => {
                const value = Number(en.total_purchased_lessons) * Number(en.erp_courses?.price_per_lesson || 0);
                return (
                  <div key={en.id || i} className="flex items-center gap-4 group">
                    <div className="p-2 rounded-full bg-indigo-500/10 text-indigo-500 group-hover:bg-indigo-500 group-hover:text-white transition-colors">
                      <CreditCard className="h-4 w-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold truncate">{en.erp_students?.name || "学员"} 报课成交</p>
                      <p className="text-xs text-muted-foreground truncate">{en.erp_courses?.name} · {en.total_purchased_lessons}课时 · ¥{value.toLocaleString()}</p>
                    </div>
                    <div className="text-[10px] text-muted-foreground whitespace-nowrap">
                      {new Date(en.created_at).toLocaleDateString()}
                    </div>
                  </div>
                );
              })}

              {classes.slice(0, 2).map((cls, i) => (
                <div key={cls.id || i} className="flex items-center gap-4 group">
                  <div className="p-2 rounded-full bg-emerald-500/10 text-emerald-500 group-hover:bg-emerald-500 group-hover:text-white transition-colors">
                    <GraduationCap className="h-4 w-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold truncate">开班：{cls.name}</p>
                    <p className="text-xs text-muted-foreground">{cls.erp_courses?.name} · {cls.classroom || "教室待定"}</p>
                  </div>
                  <div className="text-[10px] text-muted-foreground whitespace-nowrap">
                    {cls.start_date || "待排期"}
                  </div>
                </div>
              ))}
            </div>
            <Button variant="ghost" className="w-full mt-6 text-sm text-emerald-600 hover:text-emerald-700">
              查看全部动态 <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* 底部快捷入口 */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="group hover:shadow-lg transition-all cursor-pointer border-dashed hover:border-emerald-500/50">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="p-3 bg-emerald-500/10 rounded-xl group-hover:bg-emerald-500 group-hover:text-white transition-colors text-emerald-600">
              <Users className="h-6 w-6" />
            </div>
            <div>
              <h3 className="font-semibold">快速录入学员</h3>
              <p className="text-xs text-muted-foreground">创建新学员档案并分配班级</p>
            </div>
          </CardContent>
        </Card>
        <Card className="group hover:shadow-lg transition-all cursor-pointer border-dashed hover:border-indigo-500/50">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="p-3 bg-indigo-500/10 rounded-xl group-hover:bg-indigo-500 group-hover:text-white transition-colors text-indigo-600">
              <BookOpen className="h-6 w-6" />
            </div>
            <div>
              <h3 className="font-semibold">开设新课程</h3>
              <p className="text-xs text-muted-foreground">定义教学产品与定价体系</p>
            </div>
          </CardContent>
        </Card>
        <Card className="group hover:shadow-lg transition-all cursor-pointer border-dashed hover:border-purple-500/50">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="p-3 bg-purple-500/10 rounded-xl group-hover:bg-purple-500 group-hover:text-white transition-colors text-purple-600">
              <CalendarCheck className="h-6 w-6" />
            </div>
            <div>
              <h3 className="font-semibold">开始今日点名</h3>
              <p className="text-xs text-muted-foreground">AI 考勤与即时课后报告</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
