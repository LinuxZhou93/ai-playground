"use client";

import React, { useState } from "react";
import { 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Sparkles, 
  ChevronLeft,
  ChevronRight,
  GraduationCap,
  Loader2,
  Copy,
  Check,
  Users,
  CalendarDays,
  TrendingUp
} from "lucide-react";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle,
  CardDescription,
  CardFooter
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { 
  generateAIFeedback, 
  getStudentsByClass, 
  markAttendance,
  batchMarkAttendance,
  loadAttendanceData
} from "../actions";
import { toast } from "sonner";

export default function AttendancePage() {
  const [classes, setClasses] = useState<any[]>([]);
  const [selectedClassId, setSelectedClassId] = useState<string>("");
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [markingId, setMarkingId] = useState<string | null>(null);
  const [batchLoading, setBatchLoading] = useState(false);
  const [stats, setStats] = useState<any>(null);
  
  const [aiLoading, setAiLoading] = useState(false);
  const [reportText, setReportText] = useState("");
  const [selectedKeywords, setSelectedKeywords] = useState<string[]>([]);
  const [selectedStudentForAI, setSelectedStudentForAI] = useState<any>(null);
  const [copied, setCopied] = useState(false);

  const today = new Date();
  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
  const weekDay = ["日", "一", "二", "三", "四", "五", "六"][today.getDay()];

  // 初次加载 (批量)
  React.useEffect(() => {
    loadAttendanceData().then(({ classes: classData, stats: statsData }) => {
      setClasses(classData);
      setStats(statsData);
      if (classData.length > 0) {
        setSelectedClassId(classData[0].id);
      }
    });
  }, []);

  // 选择班级时加载学员
  React.useEffect(() => {
    if (selectedClassId) {
      setLoading(true);
      getStudentsByClass(selectedClassId).then(data => {
        setStudents(data);
        setLoading(false);
      });
    }
  }, [selectedClassId]);

  const handleMarkAttendance = async (studentId: string, status: "PRESENT" | "ABSENT" | "LEAVE") => {
    setMarkingId(studentId);
    try {
      await markAttendance({ studentId, classId: selectedClassId, status, consumptionValue: 1.0 });
      setStudents(prev => prev.map(s => 
        s.id === studentId ? { ...s, attendanceStatus: status, remaining_lessons: status === 'PRESENT' ? Math.max(0, Number(s.remaining_lessons) - 1) : s.remaining_lessons } : s
      ));
      toast.success(`${status === "PRESENT" ? "✅ 出席，已扣 1 课时" : status === "ABSENT" ? "❌ 缺席已记录" : "⏳ 请假已记录"}`);
    } catch (error) {
      toast.error("操作失败");
    } finally {
      setMarkingId(null);
    }
  };

  const handleBatchMark = async () => {
    const unmarked = students.filter(s => !s.attendanceStatus);
    if (unmarked.length === 0) {
      toast.info("所有学员已完成签到");
      return;
    }
    setBatchLoading(true);
    try {
      const result = await batchMarkAttendance(selectedClassId, unmarked.map(s => s.id));
      setStudents(prev => prev.map(s => ({
        ...s,
        attendanceStatus: s.attendanceStatus || 'PRESENT',
        remaining_lessons: !s.attendanceStatus ? Math.max(0, Number(s.remaining_lessons) - 1) : s.remaining_lessons
      })));
      toast.success(`🎉 批量签到完成！${result.count} 名学员全部出席`);
    } catch (err) {
      toast.error("批量签到失败");
    } finally {
      setBatchLoading(false);
    }
  };

  const handleGenerateAI = async () => {
    if (!selectedStudentForAI) {
      toast.warning("请先在左侧点击学员以选中。");
      return;
    }
    if (selectedKeywords.length === 0) {
      toast.warning("请至少勾选一个关键词。");
      return;
    }
    
    setAiLoading(true);
    try {
      const feedback = await generateAIFeedback(selectedStudentForAI.name, selectedKeywords);
      setReportText(feedback);
      toast.success("AI 点评生成成功！");
    } catch (error) {
      toast.error("生成失败");
    } finally {
      setAiLoading(false);
    }
  };

  const handleCopy = () => {
    if (reportText) {
      navigator.clipboard.writeText(reportText);
      setCopied(true);
      toast.success("已复制到剪贴板");
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const toggleKeyword = (kw: string) => {
    setSelectedKeywords(prev => 
      prev.includes(kw) ? prev.filter(k => k !== kw) : [...prev, kw]
    );
  };

  const presentCount = students.filter(s => s.attendanceStatus === 'PRESENT').length;
  const markedCount = students.filter(s => s.attendanceStatus).length;

  return (
    <div className="space-y-6">
      {/* 页头 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-gradient-to-br from-emerald-500 to-teal-600 p-3 rounded-xl text-white shadow-lg shadow-emerald-500/20">
             <CheckCircle2 className="h-6 w-6" />
          </div>
          <div>
            <h2 className="text-2xl font-bold tracking-tight">极速点名</h2>
            <div className="flex items-center gap-3 mt-1 text-sm">
              <select 
                className="bg-transparent font-medium border-none p-0 focus:ring-0 cursor-pointer text-emerald-600"
                value={selectedClassId}
                onChange={(e) => setSelectedClassId(e.target.value)}
              >
                {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
              <span className="text-muted-foreground border-l pl-3 flex items-center gap-1.5">
                <CalendarDays className="h-3.5 w-3.5" />
                {todayStr} 周{weekDay}
              </span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-right mr-2">
            <p className="text-xs text-muted-foreground">已签到</p>
            <p className="text-lg font-bold">
              <span className="text-emerald-600">{markedCount}</span>
              <span className="text-muted-foreground">/{students.length}</span>
            </p>
          </div>
          <Button 
            variant="outline" 
            className="border-emerald-500/30 text-emerald-600 hover:bg-emerald-50"
            onClick={handleBatchMark}
            disabled={batchLoading}
          >
            {batchLoading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Users className="h-4 w-4 mr-2" />}
            全部出勤
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 左侧学员点名列表 */}
        <Card className="lg:col-span-2 shadow-sm border-none">
          <CardHeader className="border-b py-4">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base flex items-center gap-2">
                 学员签到列表
                 <Badge variant="secondary" className="bg-emerald-500/10 text-emerald-600 border-none">
                   {presentCount} 出席
                 </Badge>
              </CardTitle>
              {markedCount === students.length && students.length > 0 && (
                <Badge className="bg-emerald-500 text-white animate-in fade-in">✅ 签到完成</Badge>
              )}
            </div>
          </CardHeader>
          <CardContent className="p-0">
             <div className="divide-y relative min-h-[300px]">
                {loading ? (
                   <div className="absolute inset-0 flex items-center justify-center bg-card/60 z-10">
                      <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
                   </div>
                ) : students.length === 0 ? (
                   <div className="p-12 text-center text-muted-foreground">该班级暂无在读学员</div>
                ) : students.map((student) => (
                  <div 
                    key={student.id} 
                    className={`flex items-center justify-between p-5 hover:bg-muted/10 transition-colors cursor-pointer ${selectedStudentForAI?.id === student.id ? "bg-indigo-500/5 ring-1 ring-inset ring-indigo-500/20" : ""}`}
                    onClick={() => setSelectedStudentForAI(student)}
                  >
                     <div className="flex items-center gap-4">
                        <div className={`h-11 w-11 rounded-full flex items-center justify-center font-bold relative text-sm ${
                          student.attendanceStatus === 'PRESENT' 
                            ? 'bg-emerald-100 text-emerald-700 ring-2 ring-emerald-500/30' 
                            : student.attendanceStatus === 'ABSENT'
                            ? 'bg-red-100 text-red-700 ring-2 ring-red-500/30'
                            : student.attendanceStatus === 'LEAVE'
                            ? 'bg-amber-100 text-amber-700 ring-2 ring-amber-500/30'
                            : selectedStudentForAI?.id === student.id 
                            ? "bg-indigo-600 text-white" 
                            : "bg-accent text-emerald-600"
                        }`}>
                           {student.name[0]}
                           {student.attendanceStatus === 'PRESENT' && (
                              <span className="absolute -top-1 -right-1 bg-white rounded-full p-0.5">
                                 <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                              </span>
                           )}
                           {student.attendanceStatus === 'ABSENT' && (
                              <span className="absolute -top-1 -right-1 bg-white rounded-full p-0.5">
                                 <XCircle className="h-4 w-4 text-red-500" />
                              </span>
                           )}
                        </div>
                        <div className="space-y-0.5">
                           <p className="font-semibold">{student.name}</p>
                           <p className="text-xs text-muted-foreground">
                             余额: <span className={`font-medium ${Number(student.remaining_lessons) < 3 ? 'text-red-500' : 'text-emerald-600'}`}>{student.remaining_lessons}</span> 课时
                             {Number(student.remaining_lessons) < 3 && <span className="text-red-400 ml-1">⚠️ 课时不足</span>}
                           </p>
                        </div>
                     </div>
                     
                     <div className="flex items-center gap-2 font-medium text-sm">
                        <button 
                          disabled={markingId === student.id}
                          onClick={(e) => { e.stopPropagation(); handleMarkAttendance(student.id, "PRESENT"); }}
                          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full transition-all border text-xs ${student.attendanceStatus === "PRESENT" ? "bg-emerald-500 text-white border-emerald-500 shadow-sm" : "bg-emerald-500/10 text-emerald-600 border-emerald-500/20 hover:bg-emerald-500/20"}`}
                        >
                           {markingId === student.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <CheckCircle2 className="h-3.5 w-3.5" />}
                           出席
                        </button>
                        <button 
                          disabled={markingId === student.id}
                          onClick={(e) => { e.stopPropagation(); handleMarkAttendance(student.id, "ABSENT"); }}
                          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full transition-all border text-xs ${student.attendanceStatus === "ABSENT" ? "bg-red-500 text-white border-red-500 shadow-sm" : "bg-muted/50 text-muted-foreground border-transparent hover:bg-red-500/10 hover:text-red-500"}`}
                        >
                           <XCircle className="h-3.5 w-3.5" />
                           缺席
                        </button>
                        <button 
                          disabled={markingId === student.id}
                          onClick={(e) => { e.stopPropagation(); handleMarkAttendance(student.id, "LEAVE"); }}
                          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full transition-all border text-xs ${student.attendanceStatus === "LEAVE" ? "bg-amber-500 text-white border-amber-500 shadow-sm" : "bg-muted/50 text-muted-foreground border-transparent hover:bg-amber-500/10 hover:text-amber-500"}`}
                        >
                           <Clock className="h-3.5 w-3.5" />
                           请假
                        </button>
                     </div>
                  </div>
                ))}
             </div>
          </CardContent>
          <CardFooter className="p-4 bg-muted/10 text-xs text-muted-foreground">
            注：确认出席后将自动扣除该学员对应课程的 1 个课时。
          </CardFooter>
        </Card>

        {/* 右侧 AI 点评 + 统计 */}
        <div className="space-y-5">
          <Card className="bg-gradient-to-br from-indigo-500/5 to-purple-500/5 border-indigo-500/20 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-indigo-500 animate-pulse" />
                AI 课堂随记
              </CardTitle>
              <CardDescription className="text-xs">
                {selectedStudentForAI 
                  ? <>为 <span className="font-semibold text-indigo-600">{selectedStudentForAI.name}</span> 生成报告</>
                  : "选中一名学员，AI 将为您生成微信点评报告。"}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-medium text-muted-foreground">快速关键词：</label>
                <div className="flex flex-wrap gap-1.5">
                  {["专注度高", "逻辑严密", "动手能力强", "积极参与", "有创意", "协作能力好", "需多加练习"].map(kw => (
                    <Badge 
                      key={kw}
                      variant={selectedKeywords.includes(kw) ? "default" : "outline"} 
                      className={`cursor-pointer text-[11px] transition-all ${selectedKeywords.includes(kw) ? 'bg-indigo-600' : 'hover:border-indigo-500/50'}`}
                      onClick={() => toggleKeyword(kw)}
                    >
                      {kw}
                    </Badge>
                  ))}
                </div>
              </div>
              
              <div className="relative">
                <Textarea 
                  placeholder="AI 生成结果将在此处展示..." 
                  className="min-h-[130px] bg-card resize-none text-sm pr-10"
                  value={reportText}
                  onChange={(e) => setReportText(e.target.value)}
                />
                {reportText && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute top-2 right-2 h-7 w-7"
                    onClick={handleCopy}
                  >
                    {copied ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
                  </Button>
                )}
              </div>
              
              <Button 
                className="w-full bg-indigo-600 hover:bg-indigo-700 flex items-center justify-center gap-2 shadow-lg shadow-indigo-500/20"
                onClick={handleGenerateAI}
                disabled={aiLoading}
              >
                {aiLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                {aiLoading ? "AI 正在构思中..." : "一键生成点评"}
              </Button>
            </CardContent>
          </Card>
          
          {/* 实时统计 */}
          <Card className="shadow-sm border-none">
            <CardHeader className="py-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-emerald-500" />
                实时教务统计
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between items-center py-2 border-b border-dashed">
                <span className="text-xs text-muted-foreground">在读学员总数</span>
                <span className="font-bold text-lg">{stats?.studentCount || "-"}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-dashed">
                <span className="text-xs text-muted-foreground">课时预警人数</span>
                <span className="font-bold text-lg text-red-500">{stats?.warningCount || 0}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-dashed">
                <span className="text-xs text-muted-foreground">本月新单</span>
                <span className="font-bold text-lg text-indigo-600">{stats?.newCount || 0}</span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="text-xs text-muted-foreground">本月确认收入</span>
                <span className="font-bold text-lg text-emerald-600">¥{(stats?.revenueMonth || 0).toLocaleString()}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
