"use client";

import React, { useState } from "react";
import { 
  BookOpen, 
  Plus, 
  Search, 
  Clock, 
  CreditCard, 
  Tag, 
  Trash2,
  Users,
  TrendingUp,
  Loader2,
  Bot,
  Cpu,
  Wrench
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
import { getCoursesWithStats, addCourse, deleteCourse } from "../actions";
import { toast } from "sonner";

const categoryIcons: Record<string, React.ReactNode> = {
  "机器人": <Bot className="h-5 w-5" />,
  "编程": <Cpu className="h-5 w-5" />,
  "电子": <Wrench className="h-5 w-5" />,
  "创客": <Wrench className="h-5 w-5" />,
};

const categoryColors: Record<string, string> = {
  "机器人": "from-emerald-500 to-teal-600",
  "编程": "from-indigo-500 to-blue-600",
  "电子": "from-amber-500 to-orange-600",
  "创客": "from-purple-500 to-pink-600",
};

const categoryBg: Record<string, string> = {
  "机器人": "bg-emerald-500/10 text-emerald-600",
  "编程": "bg-indigo-500/10 text-indigo-600",
  "电子": "bg-amber-500/10 text-amber-600",
  "创客": "bg-purple-500/10 text-purple-600",
};

export default function CoursesPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeCategory, setActiveCategory] = useState("全部");
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
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

  const fetchCourses = () => {
    setLoading(true);
    getCoursesWithStats().then(data => {
      setCourses(data);
      setLoading(false);
    });
  };

  React.useEffect(() => {
    fetchCourses();
  }, []);

  const handleAddCourse = async () => {
    if (!newCourse.name) return;
    setIsSubmitting(true);
    try {
      await addCourse(newCourse);
      toast.success(`课程 ${newCourse.name} 已加入课程库`);
      setIsAddDialogOpen(false);
      setNewCourse({ name: "", category: "机器人", duration_min: 90, price_per_lesson: 200, total_lessons: 16 });
      fetchCourses();
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
      fetchCourses();
    } catch (err) {
      toast.error("删除失败，该课程可能有关联的报课记录");
    }
  };

  const categories = ["全部", ...Array.from(new Set(courses.map(c => c.category).filter(Boolean)))];

  const filteredCourses = courses.filter(c => {
    const matchSearch = c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.category?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchCategory = activeCategory === "全部" || c.category === activeCategory;
    return matchSearch && matchCategory;
  });

  const totalRevenue = courses.reduce((sum, c) => sum + (c.totalRevenue || 0), 0);
  const totalEnroll = courses.reduce((sum, c) => sum + (c.enrollCount || 0), 0);

  return (
    <div className="space-y-6">
      {/* 页头 + 统计 */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">课程库</h2>
          <p className="text-muted-foreground text-sm mt-1">定义和管理教学产品、定价及课时规格。</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex gap-2 text-sm">
            <div className="px-3 py-1.5 rounded-lg bg-indigo-500/10 text-indigo-600 font-semibold">{courses.length} 门课程</div>
            <div className="px-3 py-1.5 rounded-lg bg-emerald-500/10 text-emerald-600 font-semibold">{totalEnroll} 名在读</div>
          </div>
          <Button className="bg-emerald-600 hover:bg-emerald-700 shadow-lg shadow-emerald-500/20" onClick={() => setIsAddDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" /> 新增课程
          </Button>
        </div>
      </div>

      {/* 搜索 + 分类过滤 */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="搜索课程名称或分类..." 
            className="pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          {categories.map(cat => (
            <Badge 
              key={cat}
              variant={activeCategory === cat ? "default" : "outline"} 
              className={`px-3 py-1.5 cursor-pointer transition-all hover:scale-105 ${activeCategory === cat ? 'bg-emerald-600' : ''}`}
              onClick={() => setActiveCategory(cat)}
            >
              {cat}
            </Badge>
          ))}
        </div>
      </div>

      {/* 课程卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 relative min-h-[300px]">
        {loading ? (
          <div className="absolute inset-0 flex items-center justify-center">
            <Loader2 className="h-10 w-10 animate-spin text-emerald-500" />
          </div>
        ) : filteredCourses.length === 0 ? (
          <div className="col-span-full p-12 text-center text-muted-foreground">暂无匹配的课程记录</div>
        ) : filteredCourses.map((course) => (
          <Card key={course.id} className="group hover:shadow-lg transition-all border-none shadow-sm overflow-hidden">
            <div className={`h-2 bg-gradient-to-r ${categoryColors[course.category] || 'from-gray-400 to-gray-500'} opacity-60 group-hover:opacity-100 transition-opacity`} />
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-2">
                  <div className={`p-2 rounded-lg ${categoryBg[course.category] || 'bg-gray-100 text-gray-600'}`}>
                    {categoryIcons[course.category] || <BookOpen className="h-5 w-5" />}
                  </div>
                  <Badge variant="outline" className="text-[10px] h-5">{course.category}</Badge>
                </div>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity text-red-400 hover:text-red-600 hover:bg-red-50"
                  onClick={() => setDeleteTarget(course)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
              <CardTitle className="text-xl pt-2">{course.name}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Clock className="h-4 w-4 shrink-0" />
                  <span>{course.duration_min} 分钟/课</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <BookOpen className="h-4 w-4 shrink-0" />
                  <span>总 {course.total_lessons} 课时</span>
                </div>
                <div className="flex items-center gap-2">
                  <CreditCard className="h-4 w-4 shrink-0 text-muted-foreground" />
                  <span className="font-bold text-indigo-600">¥{course.price_per_lesson}/课</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 shrink-0 text-muted-foreground" />
                  <span className="font-bold text-emerald-600">{course.enrollCount} 人在读</span>
                </div>
              </div>
            </CardContent>
            <CardFooter className="bg-muted/30 py-3 px-6 flex justify-between items-center text-xs">
              <div className="flex items-center gap-1.5 text-muted-foreground">
                <TrendingUp className="h-3 w-3" />
                累计营收 ¥{(course.totalRevenue || 0).toLocaleString()}
              </div>
              <Badge variant="secondary" className="h-5 text-[10px] bg-emerald-500/10 text-emerald-600 border-none">
                {course.status || "在售"}
              </Badge>
            </CardFooter>
          </Card>
        ))}
      </div>

      {/* 新增课程 Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>定义新课程</DialogTitle>
            <DialogDescription>设定课程名称、分类及标准化课时单价。</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <label className="text-right text-sm">课程名称</label>
              <Input className="col-span-3" value={newCourse.name} onChange={e => setNewCourse({...newCourse, name: e.target.value})} />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <label className="text-right text-sm">分类</label>
              <select 
                className="col-span-3 h-10 rounded-md border border-input px-3 py-2 bg-background text-sm"
                value={newCourse.category}
                onChange={e => setNewCourse({...newCourse, category: e.target.value})}
              >
                <option>机器人</option>
                <option>编程</option>
                <option>电子</option>
                <option>创客</option>
              </select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <label className="text-right text-sm">课时单价</label>
              <Input type="number" className="col-span-3" value={newCourse.price_per_lesson} onChange={e => setNewCourse({...newCourse, price_per_lesson: Number(e.target.value)})} />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <label className="text-right text-sm">标准课时</label>
              <Input type="number" className="col-span-3" value={newCourse.total_lessons} onChange={e => setNewCourse({...newCourse, total_lessons: Number(e.target.value)})} />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <label className="text-right text-sm">课时时长</label>
              <Input type="number" className="col-span-3" value={newCourse.duration_min} onChange={e => setNewCourse({...newCourse, duration_min: Number(e.target.value)})} placeholder="分钟" />
            </div>
          </div>
          <DialogFooter>
            <Button onClick={handleAddCourse} disabled={isSubmitting} className="bg-emerald-600 hover:bg-emerald-700">
              {isSubmitting ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> 保存中...</> : "确认发布"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 删除确认 */}
      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>确认删除课程？</AlertDialogTitle>
            <AlertDialogDescription>
              即将删除课程「{deleteTarget?.name}」。如有关联的报课记录，将无法删除。此操作不可逆。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>取消</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">确认删除</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
