"use client";

import React, { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  Phone,
  Calendar,
  GraduationCap,
  BookOpen,
  CheckCircle2,
  XCircle,
  Clock,
  Sparkles,
  User2,
  MapPin,
  Tag,
  Loader2,
  TrendingUp,
  CreditCard
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getStudentDetail } from "../../actions";

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
        <Button variant="outline" className="mt-4" onClick={() => router.push('/futureclass/students')}>
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
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* 顶部导航 */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.push('/futureclass/students')}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h2 className="text-2xl font-bold tracking-tight">学员画像</h2>
          <p className="text-muted-foreground text-sm">{data.name} 的完整教务档案</p>
        </div>
      </div>

      {/* 学员信息卡 + 出勤率 */}
      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2 border-none shadow-md overflow-hidden">
          <div className="h-2 bg-gradient-to-r from-emerald-500 to-teal-500" />
          <CardContent className="p-6">
            <div className="flex items-start gap-6">
              <div className="h-20 w-20 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white text-3xl font-black shadow-lg shadow-emerald-500/30 shrink-0">
                {data.name[0]}
              </div>
              <div className="flex-1 space-y-4">
                <div>
                  <h3 className="text-2xl font-bold">{data.name}</h3>
                  <div className="flex items-center gap-3 mt-2 text-sm text-muted-foreground flex-wrap">
                    {data.gender && <span className="flex items-center gap-1"><User2 className="h-3.5 w-3.5" /> {data.gender}</span>}
                    {data.phone && <span className="flex items-center gap-1"><Phone className="h-3.5 w-3.5" /> {data.phone}</span>}
                    {data.grade && <span className="flex items-center gap-1"><GraduationCap className="h-3.5 w-3.5" /> {data.grade}</span>}
                    {data.source && <span className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5" /> 来源: {data.source}</span>}
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4 pt-4 border-t">
                  <div>
                    <p className="text-xs text-muted-foreground">累计消费</p>
                    <p className="text-xl font-bold text-indigo-600">¥{totalSpent.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">剩余课时</p>
                    <p className={`text-xl font-bold ${totalLessons < 3 ? 'text-red-500' : 'text-emerald-600'}`}>{totalLessons}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">报读课程</p>
                    <p className="text-xl font-bold">{data.enrollments?.length || 0}</p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

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
      </div>

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
            <div className="space-y-3">
              {data.enrollments?.map((en: any) => {
                const value = Number(en.total_purchased_lessons) * Number(en.erp_courses?.price_per_lesson || 0);
                const progress = en.total_purchased_lessons > 0
                  ? Math.round((Number(en.remaining_lessons) / Number(en.total_purchased_lessons)) * 100)
                  : 0;
                return (
                  <div key={en.id} className="p-4 rounded-xl border bg-card hover:shadow-sm transition-shadow">
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
                      <div className="text-right">
                        <p className="font-bold text-indigo-600">¥{value.toLocaleString()}</p>
                        <Badge variant={en.enroll_status === 'STUDYING' ? 'secondary' : 'outline'} className="text-[10px] mt-1">
                          {en.enroll_status === 'STUDYING' ? '在读' : en.enroll_status}
                        </Badge>
                      </div>
                    </div>
                    <div className="mt-3 flex items-center gap-3">
                      <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all ${progress < 20 ? 'bg-red-500' : progress < 50 ? 'bg-amber-500' : 'bg-emerald-500'}`}
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                      <span className="text-xs text-muted-foreground whitespace-nowrap">
                        余 {en.remaining_lessons}/{en.total_purchased_lessons} 课时
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* 考勤 & AI 点评历史 */}
      <Card className="border-none shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-emerald-500" /> 考勤记录
          </CardTitle>
          <CardDescription>近 30 次上课的出勤情况与 AI 课后点评</CardDescription>
        </CardHeader>
        <CardContent>
          {data.attendanceRecords?.length === 0 ? (
            <p className="text-center py-8 text-muted-foreground">暂无考勤记录</p>
          ) : (
            <div className="space-y-3">
              {data.attendanceRecords?.map((rec: any) => (
                <div key={rec.id} className="p-4 rounded-xl border bg-card">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {statusIcon(rec.status)}
                      <div>
                        <p className="text-sm font-medium flex items-center gap-2">
                          {statusText(rec.status)}
                          <span className="text-xs text-muted-foreground">· {rec.erp_classes?.name || "班级"}</span>
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(rec.lesson_date || rec.created_at).toLocaleDateString("zh-CN")}
                          {rec.consumption_value > 0 && ` · 消耗 ${rec.consumption_value} 课时`}
                        </p>
                      </div>
                    </div>
                    <Badge variant="outline" className="text-[10px]">
                      {new Date(rec.created_at).toLocaleTimeString("zh-CN", { hour: '2-digit', minute: '2-digit' })}
                    </Badge>
                  </div>
                  {rec.ai_feedback && (
                    <div className="mt-3 p-3 rounded-lg bg-indigo-500/5 border border-indigo-500/10">
                      <p className="text-xs font-medium text-indigo-600 flex items-center gap-1 mb-1">
                        <Sparkles className="h-3 w-3" /> AI 课后点评
                      </p>
                      <p className="text-sm text-muted-foreground leading-relaxed">{rec.ai_feedback}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
