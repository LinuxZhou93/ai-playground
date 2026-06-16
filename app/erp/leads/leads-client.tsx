"use client";

import React, { useState } from "react";
import { 
  Magnet, 
  Plus, 
  Search, 
  ArrowRight,
  TrendingUp,
  UserCheck,
  PhoneCall,
  CalendarDays,
  Target,
  ChevronRight,
  Loader2,
  Trophy,
  X,
  Download,
  Table2
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getLeads, updateLeadStatus, convertLeadToStudent, addLead } from "../actions";
import { toast } from "sonner";
import { PageTransition } from "@/components/erp/page-transition";
import { motion, AnimatePresence } from "motion/react";
import * as Dialog from "@radix-ui/react-dialog";

const STAGES = [
  { id: "NEW", name: "新线索", color: "bg-blue-500", icon: Magnet },
  { id: "CONTACTED", name: "跟进中", color: "bg-amber-500", icon: PhoneCall },
  { id: "TRIAL_BOOKED", name: "已约试听", color: "bg-indigo-500", icon: CalendarDays },
  { id: "TRIAL_DONE", name: "试听完成", color: "bg-purple-500", icon: Target },
  { id: "CONVERTED", name: "已成交", color: "bg-emerald-500", icon: Trophy },
  { id: "LOST", name: "流失/丢单", color: "bg-zinc-500", icon: UserCheck },
];

const PROJECT_NAME = "北航具身智能机器人半日研学";

function extractLine(note: string, label: string) {
  const match = note.match(new RegExp(`${label}：([^\\n]+)`));
  return match?.[1]?.trim() || "";
}

function getProjectStudentRows(leads: any[]) {
  return leads
    .filter((lead) => {
      const source = String(lead.source || "");
      const interest = String(lead.interest_course || "");
      return source.includes("EAI619") || interest.includes("北航具身智能机器人半日研学");
    })
    .map((lead, index) => {
      const note = String(lead.follow_up_note || "");
      let noteData: any = {};
      let payload: any = {};

      if (note.trim().startsWith("{")) {
        try {
          noteData = JSON.parse(note);
          payload = noteData.payload || {};
        } catch {
          noteData = {};
          payload = {};
        }
      }

      return {
        index: index + 1,
        id: lead.id,
        childName: extractLine(note, "孩子姓名") || payload.childName || lead.name || "",
        gender: extractLine(note, "孩子性别") || payload.childGender || "",
        age: extractLine(note, "孩子年龄") || payload.childAge || "",
        idNumber: extractLine(note, "孩子身份证号") || payload.childIdNumber || "",
        grade: extractLine(note, "当前年级") || payload.grade || "",
        school: extractLine(note, "就读学校") || payload.school || "",
        phone: lead.phone || payload.parentPhone || "",
        payment: note.includes("已点击") || noteData?.payment?.confirmed_by_parent ? "已点击付款确认" : "待核验",
        createdAt: lead.created_at ? new Date(lead.created_at).toLocaleString("zh-CN", { hour12: false }) : "",
        status: lead.status || "",
        note,
      };
    });
}

function escapeExcelCell(value: unknown) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export default function LeadsClient({ initialLeads }: { initialLeads: any[] }) {
  const [leads, setLeads] = useState<any[]>(initialLeads);
  const [isAdding, setIsAdding] = useState(false);
  
  // New lead state
  const [newLead, setNewLead] = useState({ name: "", phone: "", source: "线下地推", interest_course: "", follow_up_note: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Stats
  const totalLeads = leads.length;
  const converted = leads.filter(l => l.status === "CONVERTED").length;
  const conversionRate = totalLeads ? Math.round((converted / totalLeads) * 100) : 0;
  const projectStudents = getProjectStudentRows(leads);

  const exportProjectExcel = () => {
    if (projectStudents.length === 0) {
      toast.error("暂无可导出的报名数据");
      return;
    }

    const headers = ["序号", "孩子姓名", "性别", "年龄", "身份证号", "当前年级", "就读学校", "家长手机号", "付款状态", "提交时间", "后台状态", "备注"];
    const rows = projectStudents.map((row) => [
      row.index,
      row.childName,
      row.gender,
      row.age,
      row.idNumber,
      row.grade,
      row.school,
      row.phone,
      row.payment,
      row.createdAt,
      row.status,
      row.note,
    ]);
    const tableHtml = `
      <html>
        <head><meta charset="UTF-8" /></head>
        <body>
          <table border="1">
            <caption>${escapeExcelCell(PROJECT_NAME)}报名汇总表</caption>
            <thead><tr>${headers.map((header) => `<th>${escapeExcelCell(header)}</th>`).join("")}</tr></thead>
            <tbody>
              ${rows.map((row) => `<tr>${row.map((cell) => `<td>${escapeExcelCell(cell)}</td>`).join("")}</tr>`).join("")}
            </tbody>
          </table>
        </body>
      </html>
    `;
    const blob = new Blob(["\ufeff", tableHtml], { type: "application/vnd.ms-excel;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${PROJECT_NAME}报名汇总表.xls`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast.success("Excel 已开始导出");
  };

  const handleAddLead = async () => {
    if (!newLead.name || !newLead.phone) {
      toast.error("必填：姓名 与 手机号");
      return;
    }
    
    setIsSubmitting(true);
    try {
      await addLead({ ...newLead, status: "NEW" });
      toast.success("招生线索录入成功");
      // Since it's an RSC architecture, we can either re-fetch or optimistically update.
      // Re-fetching gets real IDs.
      const freshLeads = await getLeads();
      setLeads(freshLeads);
      setIsAdding(false);
      setNewLead({ name: "", phone: "", source: "线下地推", interest_course: "", follow_up_note: "" });
    } catch (err: any) {
      toast.error(`录入失败: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const moveLead = async (leadId: string, currentStatus: string, direction: "NEXT" | "PREV") => {
    const currentIndex = STAGES.findIndex(s => s.id === currentStatus);
    const newIndex = direction === "NEXT" ? currentIndex + 1 : currentIndex - 1;
    if (newIndex < 0 || newIndex >= STAGES.length) return;
    
    const newStatus = STAGES[newIndex].id;
    
    // 乐观更新 UI
    setLeads(prev => prev.map(l => l.id === leadId ? { ...l, status: newStatus } : l));
    
    try {
      await updateLeadStatus(leadId, newStatus);
      toast.success(`已推进至：${STAGES[newIndex].name}`);
    } catch {
      toast.error("全息沙盘同步失败，已回滚");
      const freshLeads = await getLeads();
      setLeads(freshLeads);
    }
  };

  const handleConvert = async (leadId: string) => {
    toast.promise(convertLeadToStudent(leadId), {
      loading: "正在生成学院档案...",
      success: (data) => {
        setLeads(prev => prev.map(l => l.id === leadId ? { ...l, status: "CONVERTED" } : l));
        return "签约成功！系统已将其注入正式学员引擎。";
      },
      error: "转化失败",
    });
  };

  return (
    <PageTransition>
      <div className="space-y-8 max-w-[1600px] mx-auto pb-20 px-4 sm:px-6">
        
        {/* Header */}
        <div className="flex flex-col relative overflow-hidden rounded-[2.5rem] bg-zinc-950 p-8 md:p-12 text-white shadow-2xl border border-white/5">
          <div className="absolute top-0 right-0 -mr-24 -mt-24 h-[500px] w-[500px] rounded-full bg-blue-500/10 blur-[120px] animate-[pulse_4s_ease-in-out_infinite]" />
          
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 relative z-10">
            <div className="flex items-center gap-6">
              <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-3xl bg-blue-500/10 border border-blue-500/20 backdrop-blur-3xl">
                <Magnet className="h-10 w-10 text-blue-400" />
              </div>
              <div className="space-y-2">
                <h2 className="text-4xl font-black tracking-tight">招生漏斗 <span className="text-blue-500/50">CRM</span></h2>
                <div className="flex items-center gap-4 text-zinc-400">
                  <Badge variant="outline" className="border-white/10 bg-white/5 text-zinc-300">
                    累计线索池 {totalLeads}
                  </Badge>
                  <span className="flex items-center gap-1 text-sm font-bold text-emerald-400">
                     <TrendingUp className="h-4 w-4" /> 平均转化率 {conversionRate}%
                  </span>
                </div>
              </div>
            </div>
            <Dialog.Root open={isAdding} onOpenChange={setIsAdding}>
              <Dialog.Trigger asChild>
                <Button className="h-14 px-8 rounded-full bg-white text-zinc-950 hover:bg-zinc-200 font-bold transition-transform active:scale-95 shadow-[0_0_40px_rgba(255,255,255,0.2)]">
                  <Plus className="mr-2 h-5 w-5" /> 录入新线索
                </Button>
              </Dialog.Trigger>
              <Dialog.Portal>
                <Dialog.Overlay className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
                <Dialog.Content className="fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border bg-white dark:bg-zinc-950 p-8 shadow-2xl shadow-black/20 duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] sm:rounded-[2.5rem]">
                  <div className="flex flex-col gap-6">
                    <div>
                      <Dialog.Title className="text-2xl font-black text-zinc-900 dark:text-white">录入新线索</Dialog.Title>
                      <Dialog.Description className="text-sm text-zinc-500 mt-2">将潜在意向家长/学员信息灌入漏斗系统。带星号为必填项。</Dialog.Description>
                    </div>

                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label className="text-xs font-bold text-zinc-500">姓名 *</label>
                          <input 
                            value={newLead.name}
                            onChange={e => setNewLead({...newLead, name: e.target.value})}
                            className="flex h-12 w-full rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="如: 张三妈妈"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-xs font-bold text-zinc-500">联系电话 *</label>
                          <input 
                            value={newLead.phone}
                            onChange={e => setNewLead({...newLead, phone: e.target.value})}
                            className="flex h-12 w-full rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="手机号"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label className="text-xs font-bold text-zinc-500">获客渠道</label>
                          <select 
                            value={newLead.source}
                            onChange={e => setNewLead({...newLead, source: e.target.value})}
                            className="flex h-12 w-full rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                          >
                            <option value="线下地推">线下地推</option>
                            <option value="微信公众池">微信公众池</option>
                            <option value="异业合作">异业合作</option>
                            <option value="学员转介绍">学员转介绍</option>
                            <option value="美团/大众点评">美团/大众点评</option>
                          </select>
                        </div>
                        <div className="space-y-2">
                          <label className="text-xs font-bold text-zinc-500">意向课程区块</label>
                          <input 
                            value={newLead.interest_course}
                            onChange={e => setNewLead({...newLead, interest_course: e.target.value})}
                            className="flex h-12 w-full rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="如: Python进阶"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className="text-xs font-bold text-zinc-500">初步沟通纪要</label>
                        <textarea 
                          value={newLead.follow_up_note}
                          onChange={e => setNewLead({...newLead, follow_up_note: e.target.value})}
                          className="flex w-full rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[100px]"
                          placeholder="记录家长的痛点、诉求等..."
                        />
                      </div>
                    </div>

                    <div className="flex justify-end gap-3 mt-4">
                      <Dialog.Close asChild>
                        <Button variant="ghost" className="rounded-xl">取消</Button>
                      </Dialog.Close>
                      <Button 
                        disabled={isSubmitting} 
                        onClick={handleAddLead}
                        className="bg-blue-600 hover:bg-blue-500 text-white rounded-xl shadow-lg shadow-blue-600/20"
                      >
                        {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : '确认存档线索'}
                      </Button>
                    </div>
                  </div>
                  
                  <Dialog.Close className="absolute right-6 top-6 rounded-full opacity-70 transition-opacity hover:opacity-100 disabled:pointer-events-none data-[state=open]:bg-zinc-100 dark:data-[state=open]:bg-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800 p-2">
                    <X className="h-4 w-4" />
                    <span className="sr-only">Close</span>
                  </Dialog.Close>
                </Dialog.Content>
              </Dialog.Portal>
            </Dialog.Root>
          </div>
        </div>

        <section className="overflow-hidden rounded-[2rem] border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
          <div className="flex flex-col gap-5 border-b border-zinc-200 p-5 dark:border-zinc-800 md:flex-row md:items-center md:justify-between">
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-cyan-500/10 text-cyan-500 ring-1 ring-cyan-500/20">
                <Table2 className="h-6 w-6" />
              </div>
              <div>
                <div className="text-xs font-black uppercase tracking-[0.2em] text-cyan-500">Project Roster</div>
                <h3 className="mt-1 text-2xl font-black tracking-tight text-zinc-950 dark:text-white">{PROJECT_NAME}</h3>
                <p className="mt-1 text-sm font-medium text-zinc-500">共 {projectStudents.length} 名学生，汇总报名信息、保险身份证号与付款核验状态。</p>
              </div>
            </div>
            <Button
              onClick={exportProjectExcel}
              className="h-12 rounded-2xl bg-cyan-500 px-5 font-black text-zinc-950 hover:bg-cyan-400"
            >
              <Download className="mr-2 h-4 w-4" />
              导出 Excel
            </Button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[1180px] border-collapse text-left">
              <thead>
                <tr className="bg-zinc-50 text-xs font-black uppercase tracking-wide text-zinc-500 dark:bg-zinc-900/70 dark:text-zinc-400">
                  <th className="px-5 py-4">序号</th>
                  <th className="px-5 py-4">孩子姓名</th>
                  <th className="px-5 py-4">性别</th>
                  <th className="px-5 py-4">年龄</th>
                  <th className="px-5 py-4">身份证号</th>
                  <th className="px-5 py-4">年级</th>
                  <th className="px-5 py-4">学校</th>
                  <th className="px-5 py-4">家长手机号</th>
                  <th className="px-5 py-4">付款状态</th>
                  <th className="px-5 py-4">提交时间</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 dark:divide-zinc-900">
                {projectStudents.map((student) => (
                  <tr key={student.id} className="text-sm text-zinc-700 transition-colors hover:bg-cyan-50/60 dark:text-zinc-300 dark:hover:bg-cyan-950/20">
                    <td className="px-5 py-4 font-bold text-zinc-400">{student.index}</td>
                    <td className="px-5 py-4 font-black text-zinc-950 dark:text-white">{student.childName}</td>
                    <td className="px-5 py-4">{student.gender || "-"}</td>
                    <td className="px-5 py-4">{student.age || "-"}</td>
                    <td className="px-5 py-4 font-mono text-xs">{student.idNumber || "-"}</td>
                    <td className="px-5 py-4">{student.grade || "-"}</td>
                    <td className="px-5 py-4">{student.school || "-"}</td>
                    <td className="px-5 py-4 font-mono text-xs">{student.phone || "-"}</td>
                    <td className="px-5 py-4">
                      <span className="rounded-full bg-amber-500/10 px-3 py-1 text-xs font-black text-amber-600 dark:text-amber-300">{student.payment}</span>
                    </td>
                    <td className="px-5 py-4 text-xs text-zinc-500">{student.createdAt || "-"}</td>
                  </tr>
                ))}
                {projectStudents.length === 0 && (
                  <tr>
                    <td colSpan={10} className="px-5 py-12 text-center text-sm font-bold text-zinc-400">暂无 EAI619 报名数据</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>

        {/* Kanban Board */}
        <div className="flex gap-6 overflow-x-auto pb-8 snap-x">
          {STAGES.map((stage) => {
            const stageLeads = leads.filter(l => l.status === stage.id);
            const Icon = stage.icon;
            
            return (
              <div key={stage.id} className="w-[340px] shrink-0 snap-start flex flex-col gap-4">
                {/* Column Header */}
                <div className={`p-4 rounded-2xl flex items-center justify-between shadow-sm border ${stage.color.replace('bg-', 'bg-').replace('500', '500/10 text-').replace('500', '600 dark:text-').replace('500', '400 border-').replace('500', '500/20')}`}>
                  <div className="flex items-center gap-3">
                    <Icon className="h-5 w-5" />
                    <span className="font-black text-sm">{stage.name}</span>
                  </div>
                  <Badge variant="secondary" className="bg-white/50 dark:bg-black/20 text-current">{stageLeads.length}</Badge>
                </div>

                {/* Cards Container */}
                <div className="flex-1 space-y-4 min-h-[500px]">
                  <AnimatePresence>
                    {stageLeads.map((lead, idx) => (
                      <motion.div
                        layout
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        transition={{ delay: idx * 0.015, duration: 0.15 }}
                        key={lead.id}
                        className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-5 rounded-2xl shadow-sm hover:shadow-md transition-shadow group relative"
                      >
                        <div className="flex justify-between items-start mb-3">
                          <h4 className="font-black text-zinc-900 dark:text-white text-lg">{lead.name}</h4>
                          <span className="text-[10px] font-bold text-zinc-400 bg-zinc-100 dark:bg-zinc-800 px-2 py-1 rounded-md">{lead.source}</span>
                        </div>
                        
                        <div className="space-y-2 mb-4">
                          <div className="flex items-center text-xs font-bold text-zinc-500">
                            <PhoneCall className="h-3.5 w-3.5 mr-2" />
                            {lead.phone}
                          </div>
                          {lead.interest_course && (
                            <div className="flex items-center text-xs font-bold text-indigo-500">
                              <Target className="h-3.5 w-3.5 mr-2" />
                              意向: {lead.interest_course}
                            </div>
                          )}
                          {lead.follow_up_note && (
                            <p className="text-xs text-zinc-500 mt-2 line-clamp-2 leading-relaxed bg-zinc-50 dark:bg-zinc-950 p-2 rounded-lg border border-zinc-100 dark:border-zinc-800">
                              {lead.follow_up_note}
                            </p>
                          )}
                        </div>

                        {/* Action Buttons */}
                        <div className="flex items-center justify-between pt-3 border-t border-zinc-100 dark:border-zinc-800">
                          {stage.id === "TRIAL_DONE" ? (
                            <Button 
                              onClick={() => handleConvert(lead.id)}
                              className="w-full h-8 flex-1 bg-emerald-500 hover:bg-emerald-400 text-white font-black text-xs rounded-xl shadow-[0_5px_15px_rgba(16,185,129,0.3)] animate-[pulse_3s_ease-in-out_infinite]"
                            >
                              落单签约转为学员
                            </Button>
                          ) : (
                            <>
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                className="h-8 w-8 p-0 rounded-lg text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300"
                                onClick={() => moveLead(lead.id, stage.id, "PREV")}
                                disabled={stage.id === "NEW"}
                              >
                                <ChevronRight className="h-4 w-4 rotate-180" />
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                className="h-8 w-8 p-0 rounded-lg text-blue-500"
                                onClick={() => moveLead(lead.id, stage.id, "NEXT")}
                                disabled={stage.id === "LOST" || stage.id === "CONVERTED"}
                              >
                                <ChevronRight className="h-4 w-4 text-blue-500" />
                              </Button>
                            </>
                          )}
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                  
                  {stageLeads.length === 0 && (
                    <div className="h-32 border-2 border-dashed border-zinc-200 dark:border-zinc-800 rounded-2xl flex flex-col items-center justify-center text-zinc-400">
                      <span className="text-xs font-bold">暂无数据</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </PageTransition>
  );
}
