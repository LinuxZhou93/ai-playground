"use client";

import React, { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { 
  Users, 
  Search, 
  UserPlus, 
  Filter, 
  Download, 
  MoreHorizontal,
  GraduationCap,
  Sparkles,
  Loader2,
  ArrowUpRight,
  TrendingUp,
  AlertCircle,
  RefreshCw,
  ChevronRight,
  Phone,
  User,
  ShieldCheck,
  Zap,
  ArrowRight
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { 
  loadStudentsPageData,
  addStudent,
  enrollCourse
} from "../actions";
import { toast } from "sonner";
import { PageTransition, StaggerContainer, StaggerItem } from "@/components/erp/page-transition";
import { AnimatedNumber } from "@/components/erp/animated-number";
import { SkeletonKPI, SkeletonTable } from "@/components/erp/skeleton-card";
import { motion, AnimatePresence } from "motion/react";
import { cn } from "@/lib/utils";

export default function StudentsClient({ initialData }: { initialData: any }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [searchTerm, setSearchTerm] = useState(searchParams?.get("q") || "");
  const [students, setStudents] = useState<any[]>(initialData.students);
  const [stats, setStats] = useState(initialData.stats);
  const [loading, setLoading] = useState(false);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newStudent, setNewStudent] = useState({ name: "", phone: "", gender: "男", grade: "", source: "地推" });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 报课相关的状态
  const [isEnrollDialogOpen, setIsEnrollDialogOpen] = useState(false);
  const [selectedStudentForEnroll, setSelectedStudentForEnroll] = useState<any>(null);
  const [courses, setCourses] = useState<any[]>(initialData.courses);
  const [allClasses, setAllClasses] = useState<any[]>(initialData.classes);
  const [enrollForm, setEnrollForm] = useState({ courseId: "", classId: "", totalLessons: 16 });

  const fetchAll = async () => {
    setLoading(true);
    const dashData = await loadStudentsPageData();
    setStudents(dashData.students);
    setStats(dashData.stats);
    setCourses(dashData.courses);
    setAllClasses(dashData.classes);
    setLoading(false);
  };

  const handleEnroll = async () => {
    if (!enrollForm.courseId || !selectedStudentForEnroll) return;
    setIsSubmitting(true);
    try {
      await enrollCourse({
        studentId: selectedStudentForEnroll.id,
        courseId: enrollForm.courseId,
        classId: enrollForm.classId || undefined,
        totalLessons: enrollForm.totalLessons
      });
      toast.success(`学员 ${selectedStudentForEnroll.name} 报课成功！`);
      setIsEnrollDialogOpen(false);
      fetchAll();
    } catch (err) {
      toast.error("报课失败，请检查网络或权限");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddStudent = async () => {
    if (!newStudent.name || !newStudent.phone) {
      toast.error("请完善必填信息后再保存。");
      return;
    }
    setIsSubmitting(true);
    try {
      await addStudent(newStudent);
      toast.success(`学员 ${newStudent.name} 档案已建立`);
      setIsAddDialogOpen(false);
      setNewStudent({ name: "", phone: "", gender: "男", grade: "", source: "地推" });
      fetchAll();
    } catch (err) {
      toast.error("录入失败，请检查数据库权限");
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredStudents = students.filter(s => 
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    s.phone?.includes(searchTerm)
  );

  const availableClasses = allClasses.filter(c => c.course_id === enrollForm.courseId);

  return (
    <PageTransition>
      <div className="space-y-10 max-w-[1600px] mx-auto px-6 pb-24 pt-4">
        {/* 报班续费对话框 - 极致玻璃拟物化 */}
        <Dialog open={isEnrollDialogOpen} onOpenChange={setIsEnrollDialogOpen}>
          <DialogContent className="sm:max-w-[520px] border-zinc-200/50 dark:border-zinc-800/50 backdrop-blur-3xl bg-white/90 dark:bg-zinc-950/90 shadow-[0_32px_64px_-12px_rgba(0,0,0,0.2)] rounded-[32px] overflow-hidden p-0">
            <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-zinc-200 via-zinc-500 to-zinc-200 dark:from-zinc-800 dark:via-zinc-400 dark:to-zinc-800" />
            <DialogHeader className="px-10 pt-12 pb-6">
              <DialogTitle className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">学员报班续费</DialogTitle>
              <DialogDescription className="text-zinc-500 text-base mt-3">
                正在为 <span className="font-bold text-zinc-900 dark:text-zinc-100 underline decoration-zinc-300 underline-offset-8">{selectedStudentForEnroll?.name}</span> 办理报课业务。
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-8 px-10 py-6">
               <div className="space-y-3">
                 <label className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em] ml-1">选择课程</label>
                 <div className="relative group">
                    <select 
                      className="w-full h-16 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50 px-6 py-2 text-base font-medium focus:ring-4 focus:ring-zinc-500/5 transition-all outline-none appearance-none cursor-pointer group-hover:border-zinc-300 dark:group-hover:border-zinc-700"
                      value={enrollForm.courseId}
                      onChange={e => setEnrollForm({...enrollForm, courseId: e.target.value, classId: ""})}
                    >
                      <option value="">请选择课程</option>
                      {courses.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                    <ChevronRight className="absolute right-6 top-1/2 -translate-y-1/2 h-5 w-5 text-zinc-400 rotate-90 pointer-events-none" />
                 </div>
               </div>
               <div className="space-y-3">
                 <label className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em] ml-1">选择班级</label>
                 <div className="relative group">
                    <select 
                      className="w-full h-16 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50 px-6 py-2 text-base font-medium focus:ring-4 focus:ring-zinc-500/5 transition-all outline-none disabled:opacity-40 appearance-none cursor-pointer group-hover:border-zinc-300 dark:group-hover:border-zinc-700"
                      value={enrollForm.classId}
                      onChange={e => setEnrollForm({...enrollForm, classId: e.target.value})}
                      disabled={!enrollForm.courseId}
                    >
                      <option value="">（选填）选择排课班级</option>
                      {availableClasses.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                    <ChevronRight className="absolute right-6 top-1/2 -translate-y-1/2 h-5 w-5 text-zinc-400 rotate-90 pointer-events-none" />
                 </div>
               </div>
               <div className="space-y-3">
                 <label className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em] ml-1">购买课时</label>
                 <Input 
                   type="number"
                   className="h-16 rounded-2xl border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50 px-6 focus-visible:ring-4 focus-visible:ring-zinc-500/5 text-xl font-black tracking-tighter"
                   value={enrollForm.totalLessons}
                   onChange={e => setEnrollForm({...enrollForm, totalLessons: Number(e.target.value)})}
                 />
               </div>
            </div>
            <DialogFooter className="px-10 pb-12 pt-6">
               <Button 
                 onClick={handleEnroll} 
                 disabled={isSubmitting || !enrollForm.courseId}
                 className="w-full h-16 bg-zinc-900 dark:bg-zinc-100 text-zinc-100 dark:text-zinc-900 hover:scale-[1.02] active:scale-[0.98] transition-all rounded-2xl font-bold text-lg shadow-2xl shadow-zinc-200 dark:shadow-none"
               >
                 {isSubmitting ? <Loader2 className="mr-2 h-6 w-6 animate-spin" /> : <ShieldCheck className="mr-2 h-6 w-6" />}
                 {isSubmitting ? "正在处理订单..." : "确认报课并生成合同"}
               </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* 统计横图层 - Linear 风格卡片 */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {Array.from({ length: 4 }).map((_, i) => <SkeletonKPI key={i} />)}
          </div>
        ) : (
          <StaggerContainer className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <StaggerItem>
              <motion.div whileHover={{ y: -8 }} transition={{ type: "spring", stiffness: 400, damping: 25 }}>
                <Card className="relative overflow-hidden border-zinc-200/60 dark:border-zinc-800/60 bg-white/50 dark:bg-zinc-900/50 backdrop-blur-xl shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.1)] transition-all duration-500 group rounded-[32px]">
                  <CardContent className="p-8">
                    <div className="flex items-center justify-between">
                      <div className="space-y-4">
                        <p className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.25em]">Active Students</p>
                        <div className="flex items-baseline gap-3">
                          <h3 className="text-5xl font-bold tracking-tighter text-zinc-900 dark:text-zinc-50">
                            <AnimatedNumber value={stats.studentCount} />
                          </h3>
                          <span className="text-[10px] font-black text-emerald-600 flex items-center bg-emerald-50 dark:bg-emerald-500/10 px-2.5 py-1 rounded-full ring-1 ring-emerald-100 dark:ring-emerald-500/20">
                            <TrendingUp className="h-3 w-3 mr-1" /> +12%
                          </span>
                        </div>
                      </div>
                      <div className="p-5 bg-zinc-100 dark:bg-zinc-800 rounded-[24px] ring-1 ring-zinc-200/50 dark:ring-zinc-700/50 group-hover:rotate-12 transition-transform duration-500">
                        <Users className="h-7 w-7 text-zinc-600 dark:text-zinc-400" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </StaggerItem>
            
            <StaggerItem>
              <motion.div whileHover={{ y: -8 }} transition={{ type: "spring", stiffness: 400, damping: 25 }}>
                <Card className="relative overflow-hidden border-zinc-200/60 dark:border-zinc-800/60 bg-white/50 dark:bg-zinc-900/50 backdrop-blur-xl shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.1)] transition-all duration-500 group rounded-[32px]">
                  <CardContent className="p-8">
                    <div className="flex items-center justify-between">
                      <div className="space-y-4">
                        <p className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.25em]">Conversion Rate</p>
                        <h3 className="text-5xl font-bold tracking-tighter text-zinc-900 dark:text-zinc-50">24.8%</h3>
                      </div>
                      <div className="p-5 bg-blue-50 dark:bg-blue-500/10 rounded-[24px] ring-1 ring-blue-100 dark:ring-blue-900/30 group-hover:rotate-12 transition-transform duration-500">
                        <ArrowUpRight className="h-7 w-7 text-blue-600 dark:text-blue-400" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </StaggerItem>

            <StaggerItem>
              <motion.div whileHover={{ y: -8 }} transition={{ type: "spring", stiffness: 400, damping: 25 }}>
                <Card className="relative overflow-hidden border-zinc-200/60 dark:border-zinc-800/60 bg-white/50 dark:bg-zinc-900/50 backdrop-blur-xl shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.1)] transition-all duration-500 group rounded-[32px]">
                  <CardContent className="p-8">
                    <div className="flex items-center justify-between">
                      <div className="space-y-4">
                        <p className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.25em]">Arrears Warning</p>
                        <h3 className="text-5xl font-bold tracking-tighter text-rose-600">
                          <AnimatedNumber value={stats.warningCount} />
                        </h3>
                      </div>
                      <div className="p-5 bg-rose-50 dark:bg-rose-500/10 rounded-[24px] ring-1 ring-rose-100 dark:ring-rose-900/30 group-hover:rotate-12 transition-transform duration-500">
                        <AlertCircle className="h-7 w-7 text-rose-600 dark:text-rose-400" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </StaggerItem>

            <StaggerItem>
              <motion.div whileHover={{ y: -8 }} transition={{ type: "spring", stiffness: 400, damping: 25 }}>
                <Card className="relative overflow-hidden border-none bg-zinc-900 dark:bg-zinc-50 shadow-2xl transition-all duration-500 group rounded-[32px]">
                  <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity duration-700">
                    <Zap className="h-24 w-24 text-white dark:text-zinc-900 fill-current" />
                  </div>
                  <CardContent className="p-8">
                    <div className="flex items-center justify-between">
                      <div className="space-y-4">
                        <p className="text-[10px] font-black text-zinc-500 dark:text-zinc-400 uppercase tracking-[0.25em]">AI Renewal Score</p>
                        <h3 className="text-5xl font-bold tracking-tighter text-white dark:text-zinc-950">86%</h3>
                      </div>
                      <div className="p-5 bg-white/10 dark:bg-black/5 rounded-[24px] backdrop-blur-2xl border border-white/10 dark:border-black/5">
                        <Sparkles className="h-7 w-7 text-zinc-100 dark:text-zinc-800 animate-pulse" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </StaggerItem>
          </StaggerContainer>
        )}

        {/* 学员列表操作区 - 极简白/深灰风格 */}
        <Card className="border-zinc-200/60 dark:border-zinc-800/60 bg-white/70 dark:bg-zinc-950/70 backdrop-blur-2xl shadow-[0_8px_40px_rgba(0,0,0,0.04)] rounded-[40px] overflow-hidden">
          <CardHeader className="flex flex-col md:flex-row items-start md:items-center justify-between space-y-8 md:space-y-0 p-12 border-b border-zinc-100/50 dark:border-zinc-900/50">
            <div className="space-y-3">
              <CardTitle className="text-4xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">学员名册</CardTitle>
              <CardDescription className="text-zinc-500 font-medium text-lg">管理您的所有学员、报读状态及合同余额</CardDescription>
            </div>
            <div className="flex items-center gap-4">
              <Button variant="outline" size="sm" className="rounded-2xl h-14 px-8 border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-all font-bold text-sm">
                <Download className="mr-2.5 h-4 w-4" /> 导出数据
              </Button>
              <Button className="bg-zinc-900 dark:bg-zinc-100 text-zinc-100 dark:text-zinc-900 hover:scale-[1.02] active:scale-[0.98] rounded-2xl h-14 px-10 font-bold text-sm transition-all shadow-2xl shadow-zinc-200/50 dark:shadow-none" onClick={() => setIsAddDialogOpen(true)}>
                <UserPlus className="mr-2.5 h-5 w-5" /> 添加学员
              </Button>
            </div>
          </CardHeader>
          
          <CardContent className="p-12">
            <div className="flex flex-col md:flex-row gap-6 items-center justify-between mb-12">
              <div className="relative w-full md:w-[540px] group">
                <Search className="absolute left-6 top-1/2 -translate-y-1/2 h-5 w-5 text-zinc-400 group-focus-within:text-zinc-900 dark:group-focus-within:text-zinc-100 transition-colors" />
                <Input 
                  placeholder="搜索学员姓名、手机号..." 
                  className="pl-16 h-16 bg-zinc-50/50 dark:bg-zinc-900/50 border-zinc-200 dark:border-zinc-800 rounded-[24px] focus-visible:ring-4 focus-visible:ring-zinc-500/5 text-lg transition-all"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="flex gap-4 w-full md:w-auto">
                <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                  <DialogContent className="sm:max-w-[580px] border-zinc-200/50 dark:border-zinc-800/50 backdrop-blur-3xl bg-white/95 dark:bg-zinc-950/95 shadow-2xl rounded-[40px] p-0 overflow-hidden">
                    <div className="h-2 bg-zinc-900 dark:bg-zinc-100 w-full" />
                    <DialogHeader className="px-12 pt-12 pb-6">
                      <DialogTitle className="text-3xl font-bold tracking-tight">新建学员档案</DialogTitle>
                      <DialogDescription className="text-zinc-500 text-lg mt-3">
                        请输入学员基础信息，档案建立后可进行报班与消课。
                      </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-8 px-12 py-8">
                      <div className="space-y-3">
                        <label className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.25em] ml-1">姓名</label>
                        <div className="relative">
                          <User className="absolute left-6 top-1/2 -translate-y-1/2 h-5 w-5 text-zinc-400" />
                          <Input 
                            className="h-16 pl-16 rounded-2xl border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50 text-lg font-medium" 
                            value={newStudent.name}
                            onChange={e => setNewStudent({...newStudent, name: e.target.value})}
                          />
                        </div>
                      </div>
                      <div className="space-y-3">
                        <label className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.25em] ml-1">手机号</label>
                        <div className="relative">
                          <Phone className="absolute left-6 top-1/2 -translate-y-1/2 h-5 w-5 text-zinc-400" />
                          <Input 
                            className="h-16 pl-16 rounded-2xl border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50 text-lg font-medium"
                            value={newStudent.phone}
                            onChange={e => setNewStudent({...newStudent, phone: e.target.value})}
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-8">
                        <div className="space-y-3">
                          <label className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.25em] ml-1">性别</label>
                          <div className="relative">
                            <select 
                              className="w-full h-16 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50 px-6 py-2 text-lg font-medium outline-none focus:ring-4 focus:ring-zinc-500/5 appearance-none cursor-pointer"
                              value={newStudent.gender}
                              onChange={e => setNewStudent({...newStudent, gender: e.target.value})}
                            >
                              <option>男</option>
                              <option>女</option>
                            </select>
                            <ChevronRight className="absolute right-6 top-1/2 -translate-y-1/2 h-5 w-5 text-zinc-400 rotate-90 pointer-events-none" />
                          </div>
                        </div>
                        <div className="space-y-3">
                          <label className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.25em] ml-1">年级</label>
                          <Input 
                            className="h-16 rounded-2xl border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50 px-6 text-lg font-medium"
                            value={newStudent.grade}
                            onChange={e => setNewStudent({...newStudent, grade: e.target.value})}
                          />
                        </div>
                      </div>
                      <div className="space-y-3">
                        <label className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.25em] ml-1">来源</label>
                        <Input 
                          placeholder="例如：地推、转介绍"
                          className="h-16 rounded-2xl border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50 px-6 text-lg font-medium"
                          value={newStudent.source}
                          onChange={e => setNewStudent({...newStudent, source: e.target.value})}
                        />
                      </div>
                    </div>
                    <DialogFooter className="px-12 pb-14 pt-6">
                      <Button 
                        onClick={handleAddStudent} 
                        disabled={isSubmitting}
                        className="w-full h-16 bg-zinc-900 dark:bg-zinc-100 text-zinc-100 dark:text-zinc-900 hover:scale-[1.02] active:scale-[0.98] transition-all rounded-2xl font-bold text-lg shadow-2xl"
                      >
                        {isSubmitting ? <Loader2 className="mr-2 h-6 w-6 animate-spin" /> : null}
                        {isSubmitting ? "正在存档..." : "保存学员档案"}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
                <Button variant="outline" className="h-16 rounded-[24px] px-8 border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-all font-bold">
                  <Filter className="h-5 w-5 mr-2.5 text-zinc-500" /> 筛选
                </Button>
                <Button variant="outline" className="h-16 rounded-[24px] px-8 border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-all font-bold" onClick={fetchAll}>
                  <RefreshCw className={cn("h-5 w-5 mr-2.5 text-zinc-500", loading && "animate-spin")} /> 刷新
                </Button>
              </div>
            </div>

            <div className="rounded-[32px] border border-zinc-100 dark:border-zinc-900 overflow-hidden bg-white/40 dark:bg-zinc-950/40 backdrop-blur-sm">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-zinc-50/50 dark:bg-zinc-900/50 border-b border-zinc-100 dark:border-zinc-900 text-zinc-400">
                    <th className="p-8 text-left font-black uppercase tracking-[0.2em] text-[10px]">学员姓名</th>
                    <th className="p-8 text-left font-black uppercase tracking-[0.2em] text-[10px]">基本信息</th>
                    <th className="p-8 text-left font-black uppercase tracking-[0.2em] text-[10px]">联系电话</th>
                    <th className="p-8 text-left font-black uppercase tracking-[0.2em] text-[10px]">在读课程</th>
                    <th className="p-8 text-left font-black uppercase tracking-[0.2em] text-[10px]">剩余课时</th>
                    <th className="p-8 text-left font-black uppercase tracking-[0.2em] text-[10px]">状态</th>
                    <th className="p-8 text-right font-black uppercase tracking-[0.2em] text-[10px]">操作</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-50 dark:divide-zinc-900/50">
                  {loading ? (
                     <tr>
                       <td colSpan={7}><SkeletonTable rows={8} cols={7} /></td>
                     </tr>
                  ) : filteredStudents.length === 0 ? (
                     <tr>
                       <td colSpan={7} className="p-40 text-center">
                          <div className="flex flex-col items-center gap-8 text-zinc-400">
                            <div className="p-12 bg-zinc-50 dark:bg-zinc-900 rounded-full ring-1 ring-zinc-100 dark:ring-zinc-800">
                              <Search className="h-20 w-20 opacity-10" />
                            </div>
                            <div className="space-y-3">
                              <p className="text-3xl font-bold text-zinc-900 dark:text-zinc-100">未找到对应的学员记录</p>
                              <p className="text-lg opacity-60">尝试更换搜索关键词或重置筛选条件</p>
                            </div>
                          </div>
                       </td>
                     </tr>
                  ) : (
                    <AnimatePresence mode="popLayout">
                      {filteredStudents.map((student, idx) => {
                        const enrollment = student.erp_enrollments?.[0];
                        return (
                          <motion.tr
                            key={student.id}
                            initial={{ opacity: 0, y: 15 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.98 }}
                            transition={{ delay: idx * 0.015, duration: 0.15, ease: [0.23, 1, 0.32, 1] }}
                            className="hover:bg-zinc-50/60 dark:hover:bg-zinc-900/30 transition-all group"
                          >
                            <td className="p-8">
                              <div 
                                className="flex items-center gap-5 cursor-pointer group/name"
                                onClick={() => router.push(`/erp/students/${student.id}`)}
                              >
                                <div className="h-14 w-14 rounded-2xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center font-black text-zinc-600 dark:text-zinc-400 group-hover/name:bg-zinc-900 group-hover/name:text-white dark:group-hover/name:bg-zinc-100 dark:group-hover/name:text-zinc-900 transition-all duration-500 shadow-sm">
                                  {student.name.charAt(0)}
                                </div>
                                <div className="flex flex-col">
                                  <span className="font-bold text-zinc-900 dark:text-zinc-100 text-xl group-hover/name:translate-x-1 transition-transform duration-300">
                                    {student.name}
                                  </span>
                                  <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mt-1">ID: {student.id.slice(0, 8)}</span>
                                </div>
                              </div>
                            </td>
                            <td className="p-8">
                              <div className="flex items-center gap-3">
                                <Badge variant="outline" className="rounded-xl font-bold px-4 py-2 bg-zinc-50/50 dark:bg-zinc-900/50 border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400">
                                  {student.gender || "未知"}
                                </Badge>
                                <span className="text-zinc-200 dark:text-zinc-800">|</span>
                                <span className="text-zinc-600 dark:text-zinc-400 font-bold text-base">{student.grade || "未填"}</span>
                              </div>
                            </td>
                            <td className="p-8 text-zinc-600 dark:text-zinc-400 font-bold tracking-tight text-lg">{student.phone}</td>
                            <td className="p-8">
                              <div className="flex items-center gap-4 text-zinc-700 dark:text-zinc-300">
                                <div className="p-3 bg-zinc-100 dark:bg-zinc-800 rounded-2xl">
                                  <GraduationCap className="h-6 w-6 text-zinc-500" />
                                </div>
                                <span className="truncate max-w-[200px] font-bold text-lg">
                                  {enrollment?.erp_classes?.name || enrollment?.erp_courses?.name || "未分班"}
                                </span>
                              </div>
                            </td>
                            <td className="p-8">
                              <div className="flex items-center gap-4">
                                <div className={cn(
                                  "h-3 w-3 rounded-full shadow-[0_0_15px_rgba(0,0,0,0.1)]",
                                  (enrollment?.remaining_lessons || 0) < 3 ? "bg-rose-500 animate-pulse shadow-rose-200" : "bg-emerald-500 shadow-emerald-200"
                                )} />
                                <span className={cn(
                                  "font-black text-3xl tracking-tighter",
                                  (enrollment?.remaining_lessons || 0) < 3 ? "text-rose-600" : "text-zinc-900 dark:text-zinc-100"
                                )}>
                                  {enrollment?.remaining_lessons ?? 0}
                                </span>
                              </div>
                            </td>
                            <td className="p-8">
                              <Badge 
                                className={cn(
                                  "rounded-full px-6 py-2 font-black border-none shadow-sm text-[10px] uppercase tracking-[0.2em]",
                                  student.status === "ACTIVE" 
                                    ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400" 
                                    : "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400"
                                )}
                              >
                                {student.status === "ACTIVE" ? "在读中" : student.status}
                              </Badge>
                            </td>
                            <td className="p-8 text-right">
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" className="h-14 w-14 p-0 rounded-2xl hover:bg-zinc-100 dark:hover:bg-zinc-800 opacity-0 group-hover:opacity-100 transition-all duration-300">
                                    <MoreHorizontal className="h-7 w-7 text-zinc-500" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-72 rounded-[28px] border-zinc-200/50 dark:border-zinc-800/50 backdrop-blur-3xl bg-white/95 dark:bg-zinc-950/95 shadow-2xl p-4">
                                  <DropdownMenuLabel className="px-4 py-4 text-[10px] text-zinc-400 font-black uppercase tracking-[0.3em]">学员管理中心</DropdownMenuLabel>
                                  <DropdownMenuItem className="rounded-2xl cursor-pointer py-4 px-5 focus:bg-zinc-100 dark:focus:bg-zinc-900 transition-colors font-bold text-base" onClick={() => router.push(`/erp/students/${student.id}`)}>
                                    <User className="mr-4 h-5 w-5 opacity-70" /> 查看画像
                                  </DropdownMenuItem>
                                  <DropdownMenuItem className="rounded-2xl cursor-pointer py-4 px-5 focus:bg-zinc-100 dark:focus:bg-zinc-900 transition-colors font-bold text-base" onClick={() => {
                                     setSelectedStudentForEnroll(student);
                                     setIsEnrollDialogOpen(true);
                                  }}>
                                    <RefreshCw className="mr-4 h-5 w-5 opacity-70" /> 报班续费
                                  </DropdownMenuItem>
                                  <DropdownMenuItem className="rounded-2xl cursor-pointer py-4 px-5 focus:bg-zinc-100 dark:focus:bg-zinc-900 transition-colors font-bold text-base" onClick={() => router.push('/erp/attendance')}>
                                    <GraduationCap className="mr-4 h-5 w-5 opacity-70" /> 考勤签单
                                  </DropdownMenuItem>
                                  <DropdownMenuSeparator className="my-4 bg-zinc-100 dark:bg-zinc-900" />
                                  <DropdownMenuItem className="text-rose-600 rounded-2xl cursor-pointer py-4 px-5 focus:bg-rose-50 focus:text-rose-600 dark:focus:bg-rose-950 transition-colors font-bold text-base">
                                    <AlertCircle className="mr-4 h-5 w-5 opacity-70" /> 删除档案
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </td>
                          </motion.tr>
                        )
                      })}
                    </AnimatePresence>
                  )}
                </tbody>
              </table>
            </div>
            
            {!loading && filteredStudents.length > 0 && (
              <div className="mt-12 flex items-center justify-between px-6">
                <p className="text-lg text-zinc-500 font-bold">
                  显示 <span className="text-zinc-900 dark:text-zinc-100 underline decoration-zinc-200 underline-offset-8 decoration-2">{filteredStudents.length}</span> 位学员记录
                </p>
                <div className="flex gap-4">
                  <Button variant="outline" size="sm" className="rounded-2xl h-14 px-8 border-zinc-200 dark:border-zinc-800 disabled:opacity-30 font-bold text-base" disabled>上一页</Button>
                  <Button variant="outline" size="sm" className="rounded-2xl h-14 px-8 border-zinc-200 dark:border-zinc-800 disabled:opacity-30 font-bold text-base" disabled>下一页</Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </PageTransition>
  );
}



