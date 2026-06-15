"use client";

import React, { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  Phone,
  GraduationCap,
  BookOpen,
  CheckCircle2,
  XCircle,
  Clock,
  Sparkles,
  User2,
  MapPin,
  Loader2,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getStudentDetail } from "../../actions";
import { PageTransition, StaggerContainer, StaggerItem } from "@/components/erp/page-transition";
import { GrowthTimeline } from "@/components/erp/growth-timeline";
import { AnimatedNumber } from "@/components/erp/animated-number";
import { EnrollmentActions } from "./enrollment-actions";
import { motion } from "motion/react";

export default function StudentDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const chartRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (params.id) {
      getStudentDetail(params.id as string).then(d => {
        setData(d);
        setLoading(false);
      });
    }
  }, [params.id]);

  // 出勤率环形图
  useEffect(() => {
    if (!data || !chartRef.current) return;
    const loadChart = async () => {
      const echarts = await import("echarts");
      const chart = echarts.init(chartRef.current!, undefined, { renderer: 'canvas' });
      const total = data.attendanceRecords?.length || 0;
      const present = data.attendanceRecords?.filter((a: any) => a.status === 'PRESENT').length || 0;
      const absent = total - present;
      const rate = total > 0 ? Math.round((present / total) * 100) : 100;

      chart.setOption({
        series: [{
          type: 'pie',
          radius: ['65%', '85%'],
          avoidLabelOverlap: false,
          silent: true,
          label: {
            show: true,
            position: 'center',
            formatter: `{rate|${rate}%}\n{sub|出勤率}`,
            rich: {
              rate: { fontSize: 28, fontWeight: 'bold', color: rate >= 80 ? '#10b981' : '#ef4444', lineHeight: 36 },
              sub: { fontSize: 11, color: '#999', lineHeight: 20 }
            }
          },
          data: [
            { value: present, itemStyle: { color: '#10b981' } },
            { value: absent || 0.01, itemStyle: { color: '#f0f0f0' } }
          ],
          itemStyle: { borderRadius: 6, borderColor: '#fff', borderWidth: 2 }
        }]
      });
      const handleResize = () => chart.resize();
      window.addEventListener('resize', handleResize);
      return () => { window.removeEventListener('resize', handleResize); chart.dispose(); };
    };
    loadChart();
  }, [data]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-10 w-10 animate-spin text-emerald-500" />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="text-center py-20 text-muted-foreground">
        <p className="text-lg">未找到该学员档案</p>
        <Button variant="outline" className="mt-4" onClick={() => router.push('/erp/students')}>
          返回学员列表
        </Button>
      </div>
    );
  }

  const totalSpent = data.enrollments?.reduce((sum: number, en: any) => {
    return sum + (Number(en.total_purchased_lessons) * Number(en.erp_courses?.price_per_lesson || 0));
  }, 0) || 0;

  const totalLessons = data.enrollments?.reduce((sum: number, en: any) => sum + Number(en.remaining_lessons || 0), 0) || 0;

  const statusIcon = (s: string) => {
    if (s === 'PRESENT') return <CheckCircle2 className="h-4 w-4 text-emerald-500" />;
    if (s === 'ABSENT') return <XCircle className="h-4 w-4 text-red-500" />;
    return <Clock className="h-4 w-4 text-amber-500" />;
  };
  const statusText = (s: string) => {
    if (s === 'PRESENT') return '出席';
    if (s === 'ABSENT') return '缺席';
    return '请假';
  };

  return (
    <PageTransition>
      <div className="space-y-8 max-w-6xl mx-auto">
        {/* 顶部导航 */}
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" className="rounded-xl hover:bg-emerald-500/10" onClick={() => router.push('/erp/students')}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h2 className="text-2xl font-black tracking-tight">学员画像</h2>
            <p className="text-muted-foreground text-sm">{data.name} 的完整教务档案 · 360° 全视角</p>
          </div>
        </div>

        {/* 学员信息卡 + 出勤率 */}
        <StaggerContainer className="grid gap-6 lg:grid-cols-3">
          <StaggerItem className="lg:col-span-2">
            <Card className="border-none shadow-lg overflow-hidden relative">
              <div className="h-24 bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-500 relative">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_30%,rgba(255,255,255,0.2),transparent)]" />
              </div>
              <CardContent className="p-6 -mt-12 relative">
                <div className="flex items-start gap-6">
                  <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ type: "spring", bounce: 0.3 }}
                    className="h-20 w-20 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white text-3xl font-black shadow-xl shadow-emerald-500/30 shrink-0 ring-4 ring-card"
                  >
                    {data.name[0]}
                  </motion.div>
                  <div className="flex-1 space-y-4 pt-4">
                    <div>
                      <h3 className="text-2xl font-black">{data.name}</h3>
                      <div className="flex items-center gap-3 mt-2 text-sm text-muted-foreground flex-wrap">
                        {data.gender && <span className="flex items-center gap-1"><User2 className="h-3.5 w-3.5" /> {data.gender}</span>}
                        {data.phone && <span className="flex items-center gap-1"><Phone className="h-3.5 w-3.5" /> {data.phone}</span>}
                        {data.grade && <span className="flex items-center gap-1"><GraduationCap className="h-3.5 w-3.5" /> {data.grade}</span>}
                        {data.source && <Badge variant="outline" className="text-[10px]">{data.source}</Badge>}
                      </div>
                    </div>
                  </div>
                </div>
                {/* 毒玉球模块统计条 */}
                <div className="grid grid-cols-3 gap-4 mt-6 p-4 rounded-2xl bg-muted/30 backdrop-blur-sm border">
                  <div className="text-center">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1">累计消费</p>
                    <p className="text-xl font-black text-indigo-600"><AnimatedNumber value={totalSpent} prefix="¥" /></p>
                  </div>
                  <div className="text-center border-x">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1">剩余课时</p>
                    <p className={`text-xl font-black ${totalLessons < 3 ? 'text-red-500' : 'text-emerald-600'}`}>
                      <AnimatedNumber value={totalLessons} />
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1">报读课程</p>
                    <p className="text-xl font-black"><AnimatedNumber value={data.enrollments?.length || 0} /></p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </StaggerItem>

          <StaggerItem>
            <Card className="border-none shadow-md">
              <CardHeader className="pb-0">
                <CardTitle className="text-sm text-muted-foreground">出勤率</CardTitle>
              </CardHeader>
              <CardContent className="p-2">
                <div ref={chartRef} className="w-full h-[180px]" />
                <div className="flex justify-center gap-4 text-xs text-muted-foreground -mt-2">
                  <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-500" />出席 {data.attendanceRecords?.filter((a: any) => a.status === 'PRESENT').length || 0}</span>
                  <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-gray-200" />缺席/请假 {data.attendanceRecords?.filter((a: any) => a.status !== 'PRESENT').length || 0}</span>
                </div>
              </CardContent>
            </Card>
          </StaggerItem>
        </StaggerContainer>

        {/* Tab 控制器: Overview 与 Growth Archive */}
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="bg-zinc-100 dark:bg-zinc-900/50 p-1 rounded-2xl mb-8">
            <TabsTrigger value="overview" className="rounded-xl px-8 py-2.5 text-xs font-black uppercase tracking-widest data-[state=active]:bg-white dark:data-[state=active]:bg-zinc-800 data-[state=active]:text-indigo-600 dark:data-[state=active]:text-indigo-400 data-[state=active]:shadow-sm transition-all duration-300">
              总览视图 (Overview)
            </TabsTrigger>
            <TabsTrigger value="archive" className="rounded-xl px-8 py-2.5 text-xs font-black uppercase tracking-widest data-[state=active]:bg-white dark:data-[state=active]:bg-zinc-800 data-[state=active]:text-emerald-600 dark:data-[state=active]:text-emerald-400 data-[state=active]:shadow-sm transition-all duration-300 flex items-center gap-2">
              <Sparkles className="h-3.5 w-3.5" /> 成长档案 (Growth Archive)
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="mt-0 outline-none animate-in fade-in zoom-in-95 duration-500">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
               {/* 报读记录 */}
               <Card className="border-none shadow-sm">
                 <CardHeader>
                   <CardTitle className="text-lg flex items-center gap-2">
                     <BookOpen className="h-5 w-5 text-indigo-500" /> 报读记录
                   </CardTitle>
                   <CardDescription>该学员的所有课程订单与课时余额</CardDescription>
                 </CardHeader>
                 <CardContent>
                   {data.enrollments?.length === 0 ? (
                     <p className="text-center py-8 text-muted-foreground">暂无报读记录</p>
                   ) : (
                     <StaggerContainer className="space-y-3">
                       {data.enrollments?.map((en: any) => {
                         const value = Number(en.total_purchased_lessons) * Number(en.erp_courses?.price_per_lesson || 0);
                         const progress = en.total_purchased_lessons > 0
                           ? Math.round((Number(en.remaining_lessons) / Number(en.total_purchased_lessons)) * 100)
                           : 0;
                         return (
                           <StaggerItem key={en.id}>
                             <div className="relative p-4 rounded-xl border bg-card hover:shadow-sm transition-shadow">
                               <EnrollmentActions 
                                 enrollmentId={en.id} 
                                 status={en.enroll_status} 
                                 remainingLessons={Number(en.remaining_lessons)} 
                                 coursePrice={Number(en.erp_courses?.price_per_lesson || 0)} 
                                 courseName={en.erp_courses?.name || "未知课程"} 
                               />
                               <div className="flex items-center justify-between">
                                 <div className="flex items-center gap-3">
                                   <div className="p-2 rounded-lg bg-indigo-500/10">
                                     <GraduationCap className="h-5 w-5 text-indigo-500" />
                                   </div>
                                   <div>
                                     <p className="font-semibold">{en.erp_courses?.name || "未知课程"}</p>
                                     <p className="text-xs text-muted-foreground">
                                       {en.erp_classes?.name || "未分班"} · {en.erp_courses?.category || ""}
                                     </p>
                                   </div>
                                 </div>
                                 <div className="text-right pr-6">
                                   <p className="font-bold text-indigo-600">¥{value.toLocaleString()}</p>
                                   <Badge variant={en.enroll_status === 'STUDYING' ? 'secondary' : 'outline'} className="text-[10px] mt-1">
                                     {en.enroll_status === 'STUDYING' ? '在读' : en.enroll_status}
                                   </Badge>
                                 </div>
                               </div>
                               <div className="mt-3 flex items-center gap-3">
                                 <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                                   <motion.div
                                     initial={{ width: 0 }}
                                     animate={{ width: `${progress}%` }}
                                     transition={{ duration: 1, ease: "easeOut", delay: 0.3 }}
                                     className={`h-full rounded-full ${progress < 20 ? 'bg-red-500' : progress < 50 ? 'bg-amber-500' : 'bg-emerald-500'}`}
                                   />
                                 </div>
                                 <span className="text-xs text-muted-foreground whitespace-nowrap">
                                   余 {en.remaining_lessons}/{en.total_purchased_lessons} 课时
                                 </span>
                               </div>
                             </div>
                           </StaggerItem>
                         );
                       })}
                     </StaggerContainer>
                   )}
                 </CardContent>
               </Card>

               {/* 生源标签与备注 */}
               <Card className="border-none shadow-sm">
                  <CardHeader>
                   <CardTitle className="text-lg flex items-center gap-2">
                     <User2 className="h-5 w-5 text-indigo-500" /> 生源标签与记录
                   </CardTitle>
                   <CardDescription>CRM 核心备注信息</CardDescription>
                 </CardHeader>
                 <CardContent>
                    {data.tags && data.tags.length > 0 ? (
                      <div className="flex flex-wrap gap-2">
                        {data.tags.map((tag: string, i: number) => (
                          <Badge key={i} variant="secondary" className="px-3 py-1 rounded-full text-xs">{tag}</Badge>
                        ))}
                      </div>
                    ) : (
                      <p className="text-muted-foreground text-sm">暂无标签。</p>
                    )}
                 </CardContent>
               </Card>
            </div>
          </TabsContent>

          <TabsContent value="archive" className="mt-0 outline-none animate-in fade-in slide-in-from-bottom-4 duration-500">
            <Card className="border-none shadow-sm bg-zinc-50 dark:bg-zinc-950 rounded-3xl overflow-hidden">
               <CardHeader className="border-b border-border pb-6 pt-8 px-8">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-2xl font-black flex items-center gap-3 tracking-tight">
                        <Sparkles className="h-6 w-6 text-indigo-500" />
                        成长星际档案 
                      </CardTitle>
                      <CardDescription className="text-xs font-bold mt-2 uppercase tracking-widest text-muted-foreground">
                        High-Fidelity Student Growth Timeline & Highlights
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-8">
                  <GrowthTimeline 
                    attendanceRecords={data.attendanceRecords || []} 
                    archives={data.archives || []} 
                  />
                </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </PageTransition>
  );
}
