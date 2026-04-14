"use client";

import React, { useState } from "react";
import { 
  Calendar, 
  MapPin, 
  Plus, 
  ChevronRight, 
  GraduationCap,
  Users,
  Loader2,
  BarChart3
} from "lucide-react";
import { 
  Card, 
  CardContent, 
  CardTitle,
  CardDescription
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
import { loadClassesPageData, addClass } from "../actions";
import { toast } from "sonner";
import { PageTransition, StaggerContainer, StaggerItem } from "@/components/erp/page-transition";
import { SkeletonCard } from "@/components/erp/skeleton-card";
import { motion } from "motion/react";

export default function ClassesPage() {
  const [classes, setClasses] = useState<any[]>([]);
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newClass, setNewClass] = useState({
     name: "",
     course_id: "",
     classroom: "",
     capacity: 10,
     start_date: new Date().toISOString().split('T')[0]
  });

  // V2.0: 批量加载器
  const fetchData = () => {
    setLoading(true);
    loadClassesPageData().then(({ classes: c, courses: co }) => {
      setClasses(c);
      setCourses(co);
      setLoading(false);
    });
  };

  React.useEffect(() => {
    fetchData();
  }, []);

  const handleAddClass = async () => {
    if (!newClass.name || !newClass.course_id) {
       toast.warning("完成必填项：班级名称与课程");
       return;
    }
    setIsSubmitting(true);
    try {
       await addClass(newClass);
       toast.success(`班级 ${newClass.name} 建立成功`);
       setIsAddDialogOpen(false);
       setNewClass({ name: "", course_id: "", classroom: "", capacity: 10, start_date: new Date().toISOString().split('T')[0] });
       fetchData();
    } catch (err) {
       toast.error("创建失败");
    } finally {
       setIsSubmitting(false);
    }
  };

  const totalStudents = classes.reduce((sum, c) => sum + (c.studentCount || 0), 0);
  const avgFillRate = classes.length > 0 ? Math.round(classes.reduce((sum, c) => sum + (c.fillRate || 0), 0) / classes.length) : 0;

  const getStatusBadge = (cls: any) => {
    if (cls.fillRate >= 100) return <Badge className="bg-red-500/10 text-red-600 border-none text-[10px]">满班</Badge>;
    if (cls.fillRate >= 70) return <Badge className="bg-amber-500/10 text-amber-600 border-none text-[10px]">接近满班</Badge>;
    return <Badge className="bg-emerald-500/10 text-emerald-600 border-none text-[10px]">招生中</Badge>;
  };

  const getProgressColor = (rate: number) => {
    if (rate >= 100) return 'bg-red-500';
    if (rate >= 70) return 'bg-amber-500';
    return 'bg-emerald-500';
  };

  return (
    <PageTransition>
      <div className="space-y-8">
        <div className="relative flex flex-col md:flex-row md:items-end justify-between gap-8 z-10">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-100 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700/50">
              <BarChart3 className="h-3.5 w-3.5 text-blue-500 animate-pulse" />
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500">Resource Control</span>
            </div>
            <div className="space-y-1">
              <h2 className="text-5xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-50">
                班级管理 <span className="text-zinc-300 dark:text-zinc-700 font-light ml-2">/ Classes</span>
              </h2>
              <p className="text-zinc-500 dark:text-zinc-400 text-lg max-w-xl leading-relaxed">
                动态调度教学班次，监控容量负荷与实时座位。
              </p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-6">
            <div className="flex items-center gap-10 px-10 py-5 bg-white/40 dark:bg-zinc-900/40 backdrop-blur-2xl rounded-[2rem] border border-zinc-200/50 dark:border-zinc-800/50 shadow-2xl shadow-zinc-200/20 dark:shadow-none">
              <div className="relative">
                <p className="text-[10px] uppercase tracking-widest text-zinc-400 font-bold mb-2">活跃班级</p>
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-black text-blue-600 dark:text-blue-400 tabular-nums tracking-tighter">{classes.length}</span>
                  <span className="text-xs text-zinc-400 font-bold">GROUPS</span>
                </div>
              </div>
              <div className="w-[1px] h-12 bg-zinc-200 dark:bg-zinc-800" />
              <div className="relative">
                <p className="text-[10px] uppercase tracking-widest text-zinc-400 font-bold mb-2">平均满班率</p>
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-black text-emerald-600 dark:text-emerald-400 tabular-nums tracking-tighter">{avgFillRate}</span>
                  <span className="text-xs text-zinc-400 font-bold">%</span>
                </div>
              </div>
            </div>
            <Button 
              className="h-16 px-10 bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 text-white rounded-[1.5rem] font-bold text-base shadow-lg shadow-indigo-500/25 transition-all hover:scale-[1.02] active:scale-[0.98] group" 
              onClick={() => setIsAddDialogOpen(true)}
            >
              <Plus className="mr-2 h-5 w-5 transition-transform group-hover:rotate-90 duration-500" /> 新建班级
            </Button>
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
            {Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} lines={5} />)}
          </div>
        ) : classes.length === 0 ? (
          <div className="col-span-full p-20 text-center text-muted-foreground bg-card rounded-xl border-dashed border-2">
            暂无班级。点击右上方创建班级。
          </div>
        ) : (
          <StaggerContainer className="grid grid-cols-1 xl:grid-cols-2 gap-4">
            {classes.map((cls) => (
              <StaggerItem key={cls.id}>
                <Card className="relative h-full bg-white dark:bg-zinc-900/40 border-zinc-200/60 dark:border-zinc-800/60 shadow-[0_4px_20px_rgba(0,0,0,0.03)] hover:shadow-[0_40px_80px_-15px_rgba(0,0,0,0.12)] border-t-0 rounded-[2.5rem] overflow-hidden group transition-all duration-700 hover:-translate-y-2">
                  <div className={`absolute top-0 left-0 right-0 h-2 bg-gradient-to-r ${cls.fillRate >= 100 ? 'from-red-500' : 'from-indigo-500'} to-transparent opacity-40`} />
                  <CardContent className="p-8 pb-6">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-4">
                        <div className="h-14 w-14 bg-gradient-to-br from-indigo-500 to-blue-600 rounded-[1.25rem] flex items-center justify-center text-white shadow-xl shadow-indigo-500/20 group-hover:scale-110 group-hover:rotate-6 transition-transform duration-700">
                          <GraduationCap className="h-7 w-7" />
                        </div>
                        <div className="space-y-1.5">
                          <CardTitle className="text-2xl font-black tracking-tight text-zinc-900 dark:text-zinc-100">{cls.name}</CardTitle>
                          <CardDescription className="flex items-center gap-2 text-sm font-bold text-zinc-500">
                            <span>{cls.erp_courses?.name || "未指定课程"}</span>
                            <span>•</span>
                            <span className="px-2 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-800 text-[10px] uppercase tracking-widest">{cls.erp_courses?.category || "未知"}</span>
                          </CardDescription>
                        </div>
                      </div>
                      {getStatusBadge(cls)}
                    </div>
                    
                    <div className="grid grid-cols-2 gap-8 mt-10">
                      <div className="space-y-3">
                        <div className="flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.2em] text-zinc-400">
                          <Calendar className="h-4 w-4 shrink-0 text-zinc-300 dark:text-zinc-600" />
                          <span>开课日期</span>
                        </div>
                        <p className="text-lg font-bold text-zinc-800 dark:text-zinc-200">{cls.start_date || "未定"}</p>
                      </div>
                      <div className="space-y-3">
                        <div className="flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.2em] text-zinc-400">
                          <MapPin className="h-4 w-4 shrink-0 text-zinc-300 dark:text-zinc-600" />
                          <span>分配教室</span>
                        </div>
                        <p className="text-lg font-bold text-zinc-800 dark:text-zinc-200">{cls.classroom || "待排教室"}</p>
                      </div>
                      
                      <div className="col-span-2 space-y-3 p-5 rounded-2xl bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-100 dark:border-zinc-800">
                        <div className="flex justify-between text-xs font-bold items-center">
                          <span className="text-zinc-500 uppercase tracking-widest text-[10px]">满班率 ( {cls.fillRate}% )</span>
                          <span className="text-zinc-900 dark:text-zinc-100">{cls.studentCount} / {cls.capacity} <span className="text-zinc-400 ml-1">人</span></span>
                        </div>
                        <div className="h-2.5 bg-zinc-200 dark:bg-zinc-800 rounded-full overflow-hidden shadow-inner">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${Math.min(100, cls.fillRate)}%` }}
                            transition={{ duration: 1, ease: [0.23, 1, 0.32, 1], delay: 0.2 }}
                            className={`h-full rounded-full ${getProgressColor(cls.fillRate)} shadow-lg`}
                          />
                        </div>
                      </div>
                    </div>

                    {/* 学员名单预览 */}
                    <div className="mt-5 pt-5 border-t">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <Users className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm font-medium">班级学员</span>
                        </div>
                        <Button variant="link" size="sm" className="text-emerald-500 p-0 h-auto text-xs">
                          管理详情 <ChevronRight className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                      {cls.studentNames.length === 0 ? (
                        <p className="text-xs text-muted-foreground">暂无学员报读此班级</p>
                      ) : (
                        <div className="flex flex-wrap gap-2">
                          {cls.studentNames.slice(0, 8).map((name: string, i: number) => (
                            <motion.div
                              key={i}
                              initial={{ opacity: 0, scale: 0.8 }}
                              animate={{ opacity: 1, scale: 1 }}
                              transition={{ delay: i * 0.05 }}
                              className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-muted/50 text-xs font-medium"
                            >
                              <div className="h-5 w-5 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-white text-[10px] font-bold">
                                {name[0]}
                              </div>
                              {name}
                            </motion.div>
                          ))}
                          {cls.studentNames.length > 8 && (
                            <div className="px-2.5 py-1 rounded-full bg-muted/50 text-xs text-muted-foreground">
                              +{cls.studentNames.length - 8} 人
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </StaggerItem>
            ))}
          </StaggerContainer>
        )}

        {/* 创建班级 Dialog */}
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogContent className="sm:max-w-[560px] p-0 overflow-hidden rounded-[3rem] border-zinc-200 dark:border-zinc-800 shadow-[0_40px_80px_-15px_rgba(0,0,0,0.5)] bg-white dark:bg-zinc-950">
            <div className="bg-zinc-900 dark:bg-zinc-100 p-10 text-white dark:text-zinc-900 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 dark:bg-black/5 rounded-full -mr-32 -mt-32 blur-3xl" />
              <div className="flex items-center gap-6 relative z-10">
                <div className="w-16 h-16 rounded-[1.5rem] bg-white/10 dark:bg-black/5 flex items-center justify-center backdrop-blur-2xl border border-white/10 shadow-inner">
                  <Plus className="h-8 w-8" />
                </div>
                <div>
                  <DialogTitle className="text-3xl font-black tracking-tight">开设新班级</DialogTitle>
                  <DialogDescription className="text-zinc-400 dark:text-zinc-500 font-bold text-sm mt-1">
                    设立全新教学组并关联底层课程元数据。
                  </DialogDescription>
                </div>
              </div>
            </div>
            
            <div className="p-10 space-y-8">
              <div className="space-y-3">
                <label className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em] ml-1">班级名称 / CLASS NAME</label>
                <Input 
                  placeholder="例如：周六上午乐高初级班"
                  className="h-16 rounded-[1.25rem] border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50 focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-100 transition-all text-lg font-bold px-6" 
                  value={newClass.name} 
                  onChange={e => setNewClass({...newClass, name: e.target.value})} 
                />
              </div>
              
              <div className="space-y-3">
                <label className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em] ml-1">关联课程库</label>
                <div className="relative group">
                  <select 
                    className="w-full h-16 rounded-[1.25rem] border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50 px-6 py-2 text-base font-bold focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-100 transition-all appearance-none text-zinc-900 dark:text-zinc-100"
                    value={newClass.course_id}
                    onChange={e => setNewClass({...newClass, course_id: e.target.value})}
                  >
                    <option value="">请选择教学产品</option>
                    {courses.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                  <ChevronRight className="absolute right-5 top-1/2 -translate-y-1/2 h-5 w-5 rotate-90 text-zinc-400 pointer-events-none group-focus-within:text-zinc-900 dark:group-focus-within:text-zinc-100 transition-colors" />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-8">
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em] ml-1">分配教室</label>
                  <Input 
                    placeholder="例如：2A01"
                    className="h-16 rounded-[1.25rem] border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50 px-6 font-bold text-lg" 
                    value={newClass.classroom} 
                    onChange={e => setNewClass({...newClass, classroom: e.target.value})} 
                  />
                </div>
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em] ml-1">满载人数</label>
                  <Input 
                    type="number" 
                    className="h-16 rounded-[1.25rem] border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50 px-6 font-bold text-lg tabular-nums" 
                    value={newClass.capacity} 
                    onChange={e => setNewClass({...newClass, capacity: Number(e.target.value)})} 
                  />
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em] ml-1">开课日期</label>
                <Input 
                  type="date" 
                  className="h-16 rounded-[1.25rem] border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50 px-6 font-bold text-[15px]" 
                  value={newClass.start_date} 
                  onChange={e => setNewClass({...newClass, start_date: e.target.value})} 
                />
              </div>
              
              <div className="pt-6 flex gap-4">
                <Button 
                  variant="outline" 
                  onClick={() => setIsAddDialogOpen(false)}
                  className="flex-1 h-16 rounded-[1.25rem] border-zinc-200 dark:border-zinc-800 font-black hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-all text-base"
                >
                  取消
                </Button>
                <Button 
                  onClick={handleAddClass} 
                  disabled={isSubmitting} 
                  className="flex-[2] h-16 rounded-[1.25rem] bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 text-white font-black shadow-2xl shadow-indigo-500/30 hover:scale-[1.02] active:scale-[0.98] transition-all text-base border-none"
                >
                  {isSubmitting ? <><Loader2 className="h-6 w-6 mr-2 animate-spin" /> 处理中...</> : "立即开启招生"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </PageTransition>
  );
}
