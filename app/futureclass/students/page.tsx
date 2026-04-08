"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { 
  Users, 
  Search, 
  UserPlus, 
  Filter, 
  Download, 
  MoreHorizontal,
  GraduationCap,
  Sparkles,
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
  DialogTrigger,
} from "@/components/ui/dialog";
import { 
  getStudents, 
  getDashboardStats,
  addStudent,
  getCourses,
  getClasses,
  enrollCourse
} from "../actions";
import { toast } from "sonner";

export default function StudentsPage() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [students, setStudents] = useState<any[]>([]);
  const [stats, setStats] = useState({ studentCount: 0, warningCount: 0 });
  const [loading, setLoading] = useState(true);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newStudent, setNewStudent] = useState({ name: "", phone: "", gender: "男", grade: "", source: "地推" });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 报课相关的状态
  const [isEnrollDialogOpen, setIsEnrollDialogOpen] = useState(false);
  const [selectedStudentForEnroll, setSelectedStudentForEnroll] = useState<any>(null);
  const [courses, setCourses] = useState<any[]>([]);
  const [allClasses, setAllClasses] = useState<any[]>([]);
  const [enrollForm, setEnrollForm] = useState({ courseId: "", classId: "", totalLessons: 16 });

  const fetchStudents = () => {
    setLoading(true);
    Promise.all([getStudents(), getDashboardStats()]).then(([studentsData, statsData]) => {
      setStudents(studentsData);
      setStats(statsData);
      setLoading(false);
    });
  };

  React.useEffect(() => {
    fetchStudents();
    getCourses().then(setCourses);
    getClasses().then(setAllClasses);
  }, []);

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
      fetchStudents();
    } catch (err) {
      toast.error("报课失败，请检查网络或权限");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddStudent = async () => {
    if (!newStudent.name || !newStudent.phone) {
      toast.error("完成必填项才能存档指挥官。");
      return;
    }
    setIsSubmitting(true);
    try {
      await addStudent(newStudent);
      toast.success(`学员 ${newStudent.name} 档案已建立`);
      setIsAddDialogOpen(false);
      setNewStudent({ name: "", phone: "", gender: "男", grade: "", source: "地推" });
      fetchStudents();
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
    <div className="space-y-6">
      {/* 报班续费对话框 */}
      <Dialog open={isEnrollDialogOpen} onOpenChange={setIsEnrollDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>学员报班续费</DialogTitle>
            <DialogDescription>
              正在为 {selectedStudentForEnroll?.name} 办理报课业务。
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
             <div className="grid grid-cols-4 items-center gap-4">
               <label className="text-right text-sm">选择课程</label>
               <select 
                 className="col-span-3 h-10 rounded-md border border-input px-3 py-2 bg-background text-sm"
                 value={enrollForm.courseId}
                 onChange={e => setEnrollForm({...enrollForm, courseId: e.target.value, classId: ""})}
               >
                 <option value="">请选择课程</option>
                 {courses.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
               </select>
             </div>
             <div className="grid grid-cols-4 items-center gap-4">
               <label className="text-right text-sm">选择班级</label>
               <select 
                 className="col-span-3 h-10 rounded-md border border-input px-3 py-2 bg-background text-sm"
                 value={enrollForm.classId}
                 onChange={e => setEnrollForm({...enrollForm, classId: e.target.value})}
                 disabled={!enrollForm.courseId}
               >
                 <option value="">（选填）选择排课班级</option>
                 {availableClasses.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
               </select>
             </div>
             <div className="grid grid-cols-4 items-center gap-4">
               <label className="text-right text-sm">购买课时</label>
               <Input 
                 type="number"
                 className="col-span-3"
                 value={enrollForm.totalLessons}
                 onChange={e => setEnrollForm({...enrollForm, totalLessons: Number(e.target.value)})}
               />
             </div>
          </div>
          <DialogFooter>
             <Button 
               onClick={handleEnroll} 
               disabled={isSubmitting || !enrollForm.courseId}
               className="bg-emerald-600 hover:bg-emerald-700"
             >
               {isSubmitting ? "正在处理订单..." : "确认报课"}
             </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 统计横图层 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-emerald-500/5 to-emerald-500/10 border-emerald-500/20">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">在读学员</p>
                <h3 className="text-3xl font-bold mt-1 text-emerald-600">{loading ? "..." : stats.studentCount}</h3>
              </div>
              <div className="p-3 bg-emerald-500/20 rounded-xl">
                <Users className="h-6 w-6 text-emerald-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">月度转化</p>
                <h3 className="text-3xl font-bold mt-1">24%</h3>
              </div>
              <div className="p-3 bg-blue-500/10 rounded-xl">
                <Sparkles className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">欠费预警</p>
                <h3 className="text-3xl font-bold mt-1 text-red-500">{loading ? "..." : stats.warningCount}</h3>
              </div>
              <div className="p-3 bg-red-500/10 rounded-xl">
                <Filter className="h-6 w-6 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-500/5 to-purple-500/10 border-purple-500/20">
          <CardContent className="p-6 text-purple-600">
             <div className="flex items-center justify-between">
                <div className="text-left">
                    <p className="text-sm font-medium text-muted-foreground">AI 智能分析分</p>
                    <p className="text-xs mt-1">续费潜力值</p>
                </div>
                <Sparkles className="h-6 w-6 animate-pulse" />
             </div>
             <p className="text-2xl font-bold mt-2">86%</p>
          </CardContent>
        </Card>
      </div>

      {/* 学员列表操作区 */}
      <Card className="border-none shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-7">
          <div>
            <CardTitle className="text-xl font-bold">学员名册</CardTitle>
            <CardDescription>管理您的所有学员、报读状态及合同余额</CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm">
              <Download className="mr-2 h-4 w-4" /> 导出数据
            </Button>
            <Button className="bg-emerald-600 hover:bg-emerald-700" size="sm" onClick={() => setIsAddDialogOpen(true)}>
              <UserPlus className="mr-2 h-4 w-4" /> 添加学员
            </Button>
          </div>
        </CardHeader>
        
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between mb-6">
            <div className="relative w-full md:w-96">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="搜索学员姓名、手机号..." 
                className="pl-10 h-11 bg-card border-none shadow-sm"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex gap-2 w-full md:w-auto">
              <Button className="bg-emerald-600 hover:bg-emerald-700 h-11 flex-1 md:flex-none" onClick={() => setIsAddDialogOpen(true)}>
                <UserPlus className="h-4 w-4 mr-2" /> 新增学员
              </Button>
              <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                <DialogContent className="sm:max-w-[425px]">
                  <DialogHeader>
                    <DialogTitle>新建学员档案</DialogTitle>
                    <DialogDescription>
                      请输入学员基础信息，档案建立后可进行报班与消课。
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                      <label className="text-right text-sm">姓名</label>
                      <Input 
                        className="col-span-3" 
                        value={newStudent.name}
                        onChange={e => setNewStudent({...newStudent, name: e.target.value})}
                      />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <label className="text-right text-sm">手机号</label>
                      <Input 
                        className="col-span-3"
                        value={newStudent.phone}
                        onChange={e => setNewStudent({...newStudent, phone: e.target.value})}
                      />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <label className="text-right text-sm">性别</label>
                      <select 
                        className="col-span-3 h-10 rounded-md border border-input px-3 py-2 bg-background text-sm"
                        value={newStudent.gender}
                        onChange={e => setNewStudent({...newStudent, gender: e.target.value})}
                      >
                        <option>男</option>
                        <option>女</option>
                      </select>
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <label className="text-right text-sm">年级</label>
                      <Input 
                        className="col-span-3"
                        value={newStudent.grade}
                        onChange={e => setNewStudent({...newStudent, grade: e.target.value})}
                      />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <label className="text-right text-sm">来源</label>
                      <Input 
                        placeholder="例如：地推、转介绍"
                        className="col-span-3"
                        value={newStudent.source}
                        onChange={e => setNewStudent({...newStudent, source: e.target.value})}
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button 
                      onClick={handleAddStudent} 
                      disabled={isSubmitting}
                      className="bg-emerald-600 hover:bg-emerald-700"
                    >
                      {isSubmitting ? "正在存档..." : "保存学员"}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
              <Button variant="outline" className="h-11 flex-1 md:flex-none">
                <Filter className="h-4 w-4 mr-2" /> 筛选项
              </Button>
              <Button variant="outline" className="h-11 flex-1 md:flex-none" onClick={fetchStudents}>
                <Download className="h-4 w-4 mr-2" /> 刷新
              </Button>
            </div>
          </div>

          <div className="rounded-md border overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-muted/50 border-b">
                <tr className="text-left font-medium">
                  <th className="p-4">姓名</th>
                  <th className="p-4">性别/年龄</th>
                  <th className="p-4">联系电话</th>
                  <th className="p-4">在读课程</th>
                  <th className="p-4">剩余课时</th>
                  <th className="p-4">状态</th>
                  <th className="p-4 text-right">操作</th>
                </tr>
              </thead>
              <tbody className="divide-y relative">
                {loading ? (
                   <tr>
                     <td colSpan={7} className="p-12 text-center text-muted-foreground">
                        <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2" />
                        正在同步 FutureClass 学员数据...
                     </td>
                   </tr>
                ) : filteredStudents.length === 0 ? (
                   <tr>
                     <td colSpan={7} className="p-12 text-center text-muted-foreground">
                        未找到对应的学员记录
                     </td>
                   </tr>
                ) : filteredStudents.map((student) => {
                  const enrollment = student.erp_enrollments?.[0];
                  return (
                    <tr key={student.id} className="hover:bg-muted/30 transition-colors">
                      <td className="p-4 font-medium">
                        <span
                          className="cursor-pointer hover:text-emerald-600 hover:underline underline-offset-4 transition-colors"
                          onClick={() => router.push(`/futureclass/students/${student.id}`)}
                        >
                          {student.name}
                        </span>
                      </td>
                      <td className="p-4 text-muted-foreground">{student.gender || "-"} / {student.grade || "-"}</td>
                      <td className="p-4 text-muted-foreground">{student.phone}</td>
                      <td className="p-4">
                        <div className="flex items-center gap-1.5">
                          <GraduationCap className="h-3.5 w-3.5 text-blue-500" />
                          {enrollment?.erp_classes?.name || enrollment?.erp_courses?.name || "未分班"}
                        </div>
                      </td>
                      <td className="p-4 font-semibold">
                        <span className={(enrollment?.remaining_lessons || 0) < 3 ? "text-red-500" : "text-emerald-600"}>
                          {enrollment?.remaining_lessons ?? 0}
                        </span>
                      </td>
                      <td className="p-4">
                        <Badge variant={student.status === "ACTIVE" ? "secondary" : "destructive"}>
                          {student.status === "ACTIVE" ? "在读" : student.status}
                        </Badge>
                      </td>
                      <td className="p-4 text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>操作菜单</DropdownMenuLabel>
                            <DropdownMenuItem onClick={() => router.push(`/futureclass/students/${student.id}`)}>查看画像</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => {
                               setSelectedStudentForEnroll(student);
                               setIsEnrollDialogOpen(true);
                            }}>报班续费</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => router.push('/futureclass/attendance')}>考勤签单</DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="text-red-600">删除档案</DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
