"use client";

import React, { useState } from "react";
import { 
  BookOpen, 
  Plus, 
  Search, 
  Clock, 
  CreditCard, 
  Trash2,
  Users,
  TrendingUp,
  Loader2,
  Bot,
  Cpu,
  Wrench,
  ChevronRight,
  Layers,
  Sparkles
} from "lucide-react";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle,
  CardFooter
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { addCourse, deleteCourse } from "../actions";
import { toast } from "sonner";
import { PageTransition, StaggerContainer, StaggerItem } from "@/components/erp/page-transition";
import { AnimatePresence, motion } from "motion/react";
import { useRouter } from "next/navigation";

const categoryIcons: Record<string, React.ReactNode> = {
  "机器人": <Bot className="h-5 w-5" />,
  "编程": <Cpu className="h-5 w-5" />,
  "电子": <Wrench className="h-5 w-5" />,
  "创客": <Layers className="h-5 w-5" />,
};

const categoryColors: Record<string, string> = {
  "机器人": "from-blue-500/20 to-cyan-400/20 text-blue-600 dark:text-blue-400 border-blue-200/50 dark:border-blue-800/50 bg-blue-50/50 dark:bg-blue-900/20",
  "编程": "from-indigo-600/20 to-violet-500/20 text-indigo-600 dark:text-indigo-400 border-indigo-200/50 dark:border-indigo-800/50 bg-indigo-50/50 dark:bg-indigo-900/20",
  "电子": "from-amber-500/20 to-orange-400/20 text-amber-600 dark:text-amber-400 border-amber-200/50 dark:border-amber-800/50 bg-amber-50/50 dark:bg-amber-900/20",
  "创客": "from-rose-500/20 to-pink-500/20 text-rose-600 dark:text-rose-400 border-rose-200/50 dark:border-rose-800/50 bg-rose-50/50 dark:bg-rose-900/20",
};

const categoryGlow: Record<string, string> = {
  "机器人": "group-hover:shadow-blue-500/15",
  "编程": "group-hover:shadow-indigo-500/15",
  "电子": "group-hover:shadow-amber-500/15",
  "创客": "group-hover:shadow-rose-500/15",
};

interface CoursesClientProps {
  initialCourses: any[];
}

export default function CoursesClient({ initialCourses }: CoursesClientProps) {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [activeCategory, setActiveCategory] = useState("全部");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<any>(null);
  const [newCourse, setNewCourse] = useState({
    name: "",
    category: "机器人",
    duration_min: 90,
    price_per_lesson: 200,
    total_lessons: 16
  });

  const handleAddCourse = async () => {
    if (!newCourse.name) return;
    setIsSubmitting(true);
    try {
      await addCourse(newCourse);
      toast.success(`课程 ${newCourse.name} 已加入课程库`);
      setIsAddDialogOpen(false);
      setNewCourse({ name: "", category: "机器人", duration_min: 90, price_per_lesson: 200, total_lessons: 16 });
      router.refresh();
    } catch (err) {
      toast.error("新增失败");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteCourse(deleteTarget.id);
      toast.success(`已删除课程：${deleteTarget.name}`);
      setDeleteTarget(null);
      router.refresh();
    } catch (err) {
      toast.error("删除失败，该课程可能有关联的报课记录");
    }
  };

  const categories = ["全部", ...Array.from(new Set(initialCourses.map(c => c.category).filter(Boolean)))];

  const filteredCourses = initialCourses.filter(c => {
    const matchSearch = c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.category?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchCategory = activeCategory === "全部" || c.category === activeCategory;
    return matchSearch && matchCategory;
  });

  const totalEnroll = initialCourses.reduce((sum, c) => sum + (c.enrollCount || 0), 0);

  return (
    <PageTransition>
      <div className="space-y-10 max-w-[1400px] mx-auto pb-20 px-4 sm:px-6">
        {/* Header Section with Linear Style Glassmorphism */}
        <div className="relative flex flex-col lg:flex-row lg:items-end justify-between gap-8">
          <div className="space-y-4 relative z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-100 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700/50">
              <Sparkles className="h-3.5 w-3.5 text-amber-500 animate-pulse" />
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500">Product Architecture</span>
            </div>
            <div className="space-y-1">
              <h2 className="text-5xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-50">
                课程库 <span className="text-zinc-300 dark:text-zinc-700 font-light ml-2">/ Courses</span>
              </h2>
              <p className="text-zinc-500 dark:text-zinc-400 text-lg max-w-xl leading-relaxed">
                定义和管理教学产品、定价及课时规格，构建标准化的教研体系。
              </p>
            </div>
          </div>
          
          <div className="flex flex-wrap items-center gap-6">
            <div className="flex items-center gap-10 px-10 py-5 bg-white/40 dark:bg-zinc-900/40 backdrop-blur-2xl rounded-[2rem] border border-zinc-200/50 dark:border-zinc-800/50 shadow-2xl shadow-zinc-200/20 dark:shadow-none">
              <div className="relative">
                <p className="text-[10px] uppercase tracking-widest text-zinc-400 font-bold mb-2">课程总数</p>
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-black text-zinc-900 dark:text-zinc-100 tabular-nums tracking-tighter">{initialCourses.length}</span>
                  <span className="text-xs text-zinc-400 font-bold">SKU</span>
                </div>
              </div>
              <div className="w-[1px] h-12 bg-zinc-200 dark:bg-zinc-800" />
              <div className="relative">
                <p className="text-[10px] uppercase tracking-widest text-zinc-400 font-bold mb-2">在读学员</p>
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-black text-emerald-600 dark:text-emerald-400 tabular-nums tracking-tighter">{totalEnroll}</span>
                  <span className="text-xs text-zinc-400 font-bold">ACTIVE</span>
                </div>
              </div>
            </div>
            <Button 
              className="h-16 px-10 bg-zinc-900 dark:bg-zinc-50 text-white dark:text-zinc-900 hover:scale-[1.02] active:scale-[0.98] transition-all shadow-2xl shadow-zinc-500/20 rounded-[1.5rem] group font-bold text-base"
              onClick={() => setIsAddDialogOpen(true)}
            >
              <Plus className="mr-2 h-5 w-5 transition-transform group-hover:rotate-90 duration-500" /> 
              新增课程
            </Button>
          </div>
        </div>

        {/* Filter Bar - Dock Style */}
        <div className="sticky top-6 z-30 flex flex-col md:flex-row items-center gap-4 bg-white/70 dark:bg-zinc-900/80 p-2.5 rounded-[2rem] border border-zinc-200/60 dark:border-zinc-800/60 backdrop-blur-3xl shadow-2xl shadow-zinc-200/30 dark:shadow-none">
          <div className="relative flex-1 w-full md:max-w-md group">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400 group-focus-within:text-zinc-900 dark:group-focus-within:text-zinc-100 transition-colors" />
            <Input 
              placeholder="搜索课程名称、分类或关键词..." 
              className="pl-12 h-12 bg-transparent border-none focus-visible:ring-0 focus-visible:ring-offset-0 text-sm font-semibold placeholder:text-zinc-400"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="h-8 w-[1px] bg-zinc-200 dark:bg-zinc-800 hidden md:block" />
          <div className="flex gap-1.5 overflow-x-auto w-full md:w-auto pb-2 md:pb-0 no-scrollbar px-2">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-6 py-2.5 rounded-2xl text-xs font-bold transition-all whitespace-nowrap tracking-wide ${
                  activeCategory === cat 
                    ? 'bg-zinc-900 text-zinc-100 dark:bg-zinc-100 dark:text-zinc-900 shadow-lg scale-[1.05]' 
                    : 'text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800/50 hover:text-zinc-900 dark:hover:text-zinc-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Course Cards Grid */}
        {filteredCourses.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center justify-center py-40 text-zinc-400 space-y-8 bg-zinc-50/50 dark:bg-zinc-900/20 rounded-[3rem] border-2 border-dashed border-zinc-200 dark:border-zinc-800"
          >
            <div className="p-8 bg-white dark:bg-zinc-800 rounded-[2rem] shadow-xl border border-zinc-100 dark:border-zinc-700">
              <Search className="h-12 w-12 text-zinc-200 dark:text-zinc-600" />
            </div>
            <div className="text-center space-y-2">
              <p className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">未找到匹配课程</p>
              <p className="text-zinc-500 font-medium">尝试调整您的搜索条件或切换分类</p>
            </div>
            <Button variant="outline" onClick={() => {setSearchTerm(""); setActiveCategory("全部");}} className="rounded-xl font-bold">
              重置筛选条件
            </Button>
          </motion.div>
        ) : (
          <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <AnimatePresence mode="popLayout">
              {filteredCourses.map((course) => (
                <StaggerItem key={course.id}>
                  <motion.div 
                    layout
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
                    className="group h-full"
                  >
                    <Card className={`relative h-full bg-white dark:bg-zinc-900/40 border-zinc-200/60 dark:border-zinc-800/60 shadow-[0_4px_20px_rgba(0,0,0,0.03)] hover:shadow-[0_40px_80px_-15px_rgba(0,0,0,0.12)] dark:hover:shadow-[0_40px_80px_-15px_rgba(0,0,0,0.5)] transition-all duration-700 overflow-hidden rounded-[2.5rem] hover:-translate-y-3 border-t-0 ${categoryGlow[course.category]}`}>
                      
                      {/* Top Accent Gradient */}
                      <div className={`absolute top-0 left-0 right-0 h-2 bg-gradient-to-r ${categoryColors[course.category]?.split(' ')[0] || 'from-zinc-400'} to-transparent opacity-40`} />
                      
                      <CardHeader className="pb-4 pt-10 px-10">
                        <div className="flex justify-between items-start">
                          <div className="flex items-center gap-4">
                            <div className={`p-4 rounded-[1.25rem] backdrop-blur-xl shadow-inner transition-all duration-700 group-hover:scale-110 group-hover:rotate-6 border ${categoryColors[course.category] || 'bg-zinc-100 text-zinc-600'}`}>
                              {categoryIcons[course.category] || <BookOpen className="h-6 w-6" />}
                            </div>
                            <Badge variant="secondary" className="bg-zinc-100/80 dark:bg-zinc-800/80 text-zinc-500 dark:text-zinc-400 border-none font-black text-[10px] tracking-[0.15em] uppercase px-3 py-1 rounded-lg">
                              {course.category}
                            </Badge>
                          </div>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-10 w-10 rounded-2xl opacity-0 group-hover:opacity-100 transition-all duration-500 text-zinc-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30"
                            onClick={() => setDeleteTarget(course)}
                          >
                            <Trash2 className="h-5 w-5" />
                          </Button>
                        </div>
                        <CardTitle className="text-2xl font-black pt-8 tracking-tight text-zinc-900 dark:text-zinc-100 group-hover:text-black dark:group-hover:text-white transition-colors leading-[1.1]">
                          {course.name}
                        </CardTitle>
                      </CardHeader>

                      <CardContent className="space-y-10 px-10 py-8">
                        <div className="grid grid-cols-2 gap-y-8 gap-x-6">
                          <div className="space-y-2">
                            <p className="text-[10px] text-zinc-400 font-black uppercase tracking-widest flex items-center gap-2">
                              <Clock className="h-3.5 w-3.5 opacity-70" /> 时长
                            </p>
                            <p className="text-lg font-bold text-zinc-800 dark:text-zinc-200 tabular-nums">{course.duration_min}<span className="text-xs font-medium ml-1.5 text-zinc-400">MIN</span></p>
                          </div>
                          <div className="space-y-2">
                            <p className="text-[10px] text-zinc-400 font-black uppercase tracking-widest flex items-center gap-2">
                              <Layers className="h-3.5 w-3.5 opacity-70" /> 课时
                            </p>
                            <p className="text-lg font-bold text-zinc-800 dark:text-zinc-200 tabular-nums">{course.total_lessons}<span className="text-xs font-medium ml-1.5 text-zinc-400">UNIT</span></p>
                          </div>
                          <div className="space-y-2">
                            <p className="text-[10px] text-zinc-400 font-black uppercase tracking-widest flex items-center gap-2">
                              <CreditCard className="h-3.5 w-3.5 opacity-70" /> 课单价
                            </p>
                            <p className="text-2xl font-black text-zinc-900 dark:text-zinc-100 tabular-nums">
                              <span className="text-sm font-bold mr-1 opacity-50">¥</span>{course.price_per_lesson}
                            </p>
                          </div>
                          <div className="space-y-2">
                            <p className="text-[10px] text-zinc-400 font-black uppercase tracking-widest flex items-center gap-2">
                              <Users className="h-3.5 w-3.5 opacity-70" /> 在读
                            </p>
                            <div className="flex items-center gap-3">
                              <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400 tabular-nums">{course.enrollCount}</p>
                              <div className="flex -space-x-2.5">
                                {[1,2,3].map(i => (
                                  <div key={i} className="h-6 w-6 rounded-full border-2 border-white dark:border-zinc-900 bg-zinc-100 dark:bg-zinc-800 shadow-sm" />
                                ))}
                              </div>
                            </div>
                          </div>
                        </div>
                      </CardContent>

                      <CardFooter className="bg-zinc-50/40 dark:bg-zinc-800/20 py-6 px-10 flex justify-between items-center border-t border-zinc-100/50 dark:border-zinc-800/50">
                        <div className="flex flex-col">
                          <p className="text-[9px] font-black text-zinc-400 uppercase tracking-widest mb-1">EST. REVENUE</p>
                          <div className="flex items-center gap-2 text-zinc-900 dark:text-zinc-100">
                            <TrendingUp className="h-4 w-4 text-emerald-500" />
                            <span className="text-base font-black tabular-nums">¥{(course.totalRevenue || 0).toLocaleString()}</span>
                          </div>
                        </div>
                        <Button variant="ghost" className="rounded-2xl h-11 px-5 text-xs font-black text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-white dark:hover:bg-zinc-800 shadow-sm border border-transparent hover:border-zinc-200 dark:hover:border-zinc-700 transition-all group/btn">
                          管理详情 <ChevronRight className="ml-1.5 h-4 w-4 transition-transform group-hover/btn:translate-x-1.5" />
                        </Button>
                      </CardFooter>
                    </Card>
                  </motion.div>
                </StaggerItem>
              ))}
            </AnimatePresence>
          </StaggerContainer>
        )}

        {/* Add Course Dialog - Refined UI */}
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogContent className="sm:max-w-[560px] p-0 overflow-hidden rounded-[3rem] border-zinc-200 dark:border-zinc-800 shadow-3xl bg-white dark:bg-zinc-950">
            <div className="bg-zinc-900 dark:bg-zinc-100 p-10 text-white dark:text-zinc-900 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 dark:bg-black/5 rounded-full -mr-32 -mt-32 blur-3xl" />
              <div className="flex items-center gap-6 relative z-10">
                <div className="w-16 h-16 rounded-[1.5rem] bg-white/10 dark:bg-black/5 flex items-center justify-center backdrop-blur-2xl border border-white/10">
                  <Plus className="h-8 w-8" />
                </div>
                <div>
                  <DialogTitle className="text-3xl font-black tracking-tight">定义新课程</DialogTitle>
                  <DialogDescription className="text-zinc-400 dark:text-zinc-500 font-bold text-sm mt-1">
                    设定课程名称、分类及标准化课时单价。
                  </DialogDescription>
                </div>
              </div>
            </div>
            
            <div className="p-10 space-y-8">
              <div className="space-y-3">
                <label className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em] ml-1">课程名称 / COURSE NAME</label>
                <Input 
                  placeholder="例如：乐高动力机械基础"
                  className="h-16 rounded-[1.25rem] border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50 focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-100 transition-all text-lg font-bold px-6" 
                  value={newCourse.name} 
                  onChange={e => setNewCourse({...newCourse, name: e.target.value})} 
                />
              </div>
              
              <div className="grid grid-cols-2 gap-8">
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em] ml-1">业务分类</label>
                  <div className="relative">
                    <select 
                      className="w-full h-16 rounded-[1.25rem] border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50 px-6 py-2 text-base font-bold focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-100 transition-all appearance-none"
                      value={newCourse.category}
                      onChange={e => setNewCourse({...newCourse, category: e.target.value})}
                    >
                      <option>机器人</option>
                      <option>编程</option>
                      <option>电子</option>
                      <option>创客</option>
                    </select>
                    <ChevronRight className="absolute right-5 top-1/2 -translate-y-1/2 h-5 w-5 rotate-90 text-zinc-400 pointer-events-none" />
                  </div>
                </div>
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em] ml-1">课时单价 (¥)</label>
                  <Input 
                    type="number" 
                    className="h-16 rounded-[1.25rem] border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50 px-6 font-black text-xl tabular-nums" 
                    value={newCourse.price_per_lesson} 
                    onChange={e => setNewCourse({...newCourse, price_per_lesson: Number(e.target.value)})} 
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-8">
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em] ml-1">标准课时数</label>
                  <Input 
                    type="number" 
                    className="h-16 rounded-[1.25rem] border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50 px-6 font-bold text-lg tabular-nums" 
                    value={newCourse.total_lessons} 
                    onChange={e => setNewCourse({...newCourse, total_lessons: Number(e.target.value)})} 
                  />
                </div>
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em] ml-1">单节时长 (min)</label>
                  <Input 
                    type="number" 
                    className="h-16 rounded-[1.25rem] border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50 px-6 font-bold text-lg tabular-nums" 
                    value={newCourse.duration_min} 
                    onChange={e => setNewCourse({...newCourse, duration_min: Number(e.target.value)})} 
                  />
                </div>
              </div>

              <div className="pt-6 flex gap-4">
                <Button 
                  variant="outline" 
                  onClick={() => setIsAddDialogOpen(false)}
                  className="flex-1 h-16 rounded-[1.25rem] border-zinc-200 dark:border-zinc-800 font-black hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-all"
                >
                  取消
                </Button>
                <Button 
                  onClick={handleAddCourse} 
                  disabled={isSubmitting} 
                  className="flex-[2] h-16 rounded-[1.25rem] bg-zinc-900 dark:bg-zinc-100 dark:text-zinc-900 font-black shadow-2xl shadow-zinc-900/20 hover:scale-[1.02] active:scale-[0.98] transition-all text-base"
                >
                  {isSubmitting ? <><Loader2 className="h-6 w-6 mr-2 animate-spin" /> 处理中...</> : "确认发布课程"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation - Linear Style */}
        <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
          <AlertDialogContent className="rounded-[3rem] border-zinc-200 dark:border-zinc-800 p-10 shadow-3xl bg-white dark:bg-zinc-950">
            <AlertDialogHeader className="space-y-6">
              <div className="w-20 h-20 rounded-[2rem] bg-red-50 dark:bg-red-950/30 flex items-center justify-center text-red-600 dark:text-red-400 shadow-inner">
                <Trash2 className="h-10 w-10" />
              </div>
              <div className="space-y-3">
                <AlertDialogTitle className="text-3xl font-black tracking-tight">确认移除此课程？</AlertDialogTitle>
                <AlertDialogDescription className="text-zinc-500 dark:text-zinc-400 text-lg leading-relaxed font-medium">
                  您即将从课程库中移除 <span className="font-black text-zinc-900 dark:text-zinc-100 underline decoration-red-500/40 underline-offset-8 decoration-4">「{deleteTarget?.name}」</span>。
                  <br /><br />
                  此操作将永久删除该课程定义。如果该课程已有学员报课或存在历史订单，系统将自动拦截此操作以保证财务数据完整。
                </AlertDialogDescription>
              </div>
            </AlertDialogHeader>
            <AlertDialogFooter className="mt-10 gap-4">
              <AlertDialogCancel className="rounded-2xl border-zinc-200 dark:border-zinc-800 h-14 px-8 font-black text-base">取消</AlertDialogCancel>
              <AlertDialogAction 
                onClick={handleDelete} 
                className="bg-red-600 hover:bg-red-700 text-white rounded-2xl h-14 px-10 font-black text-base shadow-2xl shadow-red-500/30 border-none transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                确认删除
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </PageTransition>
  );
}
