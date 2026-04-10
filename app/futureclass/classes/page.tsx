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
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-black tracking-tight">班级管理</h2>
            <p className="text-muted-foreground text-sm mt-1">安排教学任务、教师及教室资源。</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex gap-2 text-sm">
              <div className="px-3 py-1.5 rounded-xl bg-blue-500/10 text-blue-600 font-bold flex items-center gap-1.5 ring-1 ring-blue-500/20">
                <BarChart3 className="h-3.5 w-3.5" /> {classes.length} 个班级
              </div>
              <div className="px-3 py-1.5 rounded-xl bg-emerald-500/10 text-emerald-600 font-bold flex items-center gap-1.5 ring-1 ring-emerald-500/20">
                <Users className="h-3.5 w-3.5" /> {totalStudents} 名学员
              </div>
              <div className="px-3 py-1.5 rounded-xl bg-amber-500/10 text-amber-600 font-bold ring-1 ring-amber-500/20">
                平均满班率 {avgFillRate}%
              </div>
            </div>
            <Button className="bg-emerald-600 hover:bg-emerald-700 shadow-lg shadow-emerald-500/20 rounded-xl" onClick={() => setIsAddDialogOpen(true)}>
              <Plus className="mr-2 h-4 w-4" /> 创建班级
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
                <Card className="hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 shadow-sm border-none overflow-hidden group">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-4">
                        <div className="h-12 w-12 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-emerald-500/20">
                          <GraduationCap className="h-6 w-6" />
                        </div>
                        <div className="space-y-1">
                          <CardTitle className="text-lg">{cls.name}</CardTitle>
                          <CardDescription className="flex items-center gap-2">
                            <span className="font-medium text-foreground">{cls.erp_courses?.name || "未指定课程"}</span>
                            <span>•</span>
                            <span>{cls.erp_courses?.category || ""}</span>
                          </CardDescription>
                        </div>
                      </div>
                      {getStatusBadge(cls)}
                    </div>
                    
                    <div className="grid grid-cols-2 gap-6 mt-5">
                      <div className="space-y-2.5">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Calendar className="h-4 w-4 shrink-0" />
                          <span>开课：{cls.start_date || "未定"}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <MapPin className="h-4 w-4 shrink-0" />
                          <span>{cls.classroom || "待排教室"}</span>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex justify-between text-xs">
                          <span className="text-muted-foreground">满班率</span>
                          <span className="font-bold">{cls.studentCount}/{cls.capacity} 人 ({cls.fillRate}%)</span>
                        </div>
                        <div className="h-2 bg-muted rounded-full overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${Math.min(100, cls.fillRate)}%` }}
                            transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
                            className={`h-full rounded-full ${getProgressColor(cls.fillRate)}`}
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
          <DialogContent>
            <DialogHeader>
              <DialogTitle>开设新班级</DialogTitle>
              <DialogDescription>为指定课程新开一个班组，请指定上课地点与预计开课日期。</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <label className="text-right text-sm font-medium">班级名称</label>
                <Input className="col-span-3" value={newClass.name} onChange={e => setNewClass({...newClass, name: e.target.value})} />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <label className="text-right text-sm font-medium">选择课程</label>
                <select 
                  className="col-span-3 h-10 rounded-md border border-input px-3 py-2 bg-background text-sm"
                  value={newClass.course_id}
                  onChange={e => setNewClass({...newClass, course_id: e.target.value})}
                >
                  <option value="">请选择关联课程</option>
                  {courses.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <label className="text-right text-sm font-medium">教室</label>
                <Input className="col-span-3" value={newClass.classroom} onChange={e => setNewClass({...newClass, classroom: e.target.value})} />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <label className="text-right text-sm font-medium">容量 (人)</label>
                <Input type="number" className="col-span-3" value={newClass.capacity} onChange={e => setNewClass({...newClass, capacity: Number(e.target.value)})} />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <label className="text-right text-sm font-medium">开课日期</label>
                <Input type="date" className="col-span-3" value={newClass.start_date} onChange={e => setNewClass({...newClass, start_date: e.target.value})} />
              </div>
            </div>
            <DialogFooter>
              <Button onClick={handleAddClass} disabled={isSubmitting} className="bg-emerald-600 hover:bg-emerald-700">
                {isSubmitting ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> 建立中...</> : "确认建班"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </PageTransition>
  );
}
