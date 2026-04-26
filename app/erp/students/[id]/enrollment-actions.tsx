"use client";

import React, { useState, useEffect } from "react";
import { updateEnrollmentStatus, transferCourse } from "../../actions";
import { getClasses } from "../../actions"; // fetch active courses and classes
import { toast } from "sonner";
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
  DialogTitle 
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  MoreHorizontal, 
  RefreshCcw, 
  Archive, 
  Banknote,
  ArrowRight,
  Zap
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";

interface EnrollmentActionsProps {
  enrollmentId: string;
  status: string;
  remainingLessons: number;
  coursePrice: number;
  courseName: string;
}

export function EnrollmentActions({ 
  enrollmentId, 
  status, 
  remainingLessons, 
  coursePrice,
  courseName
}: EnrollmentActionsProps) {
  const [loading, setLoading] = useState(false);
  const [activeDialog, setActiveDialog] = useState<"NONE" | "REFUND" | "ARCHIVE" | "TRANSFER">("NONE");
  const [reason, setReason] = useState("");

  const [availableClasses, setAvailableClasses] = useState<any[]>([]);
  const [selectedClassId, setSelectedClassId] = useState("");
  const totalRemainingValue = remainingLessons * coursePrice;

  // If status is not STUDYING, we don't show the advanced actions
  if (status !== 'STUDYING') return null;

  const handleStatusUpdate = async (newStatus: string) => {
    if (!reason) {
      toast.error("必须填写原因");
      return;
    }
    setLoading(true);
    try {
      await updateEnrollmentStatus(enrollmentId, newStatus, reason);
      toast.success(newStatus === "REFUNDED" ? "退费成功！" : "结课归档成功！");
      setActiveDialog("NONE");
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleTransfer = async () => {
    if (!selectedClassId) {
      toast.error("请选择目标新班级与课程");
      return;
    }
    setLoading(true);
    try {
      const targetClass = availableClasses.find(c => c.id === selectedClassId);
      if (!targetClass) throw new Error("Invalid class");
      
      const res = await transferCourse(enrollmentId, targetClass.course_id, targetClass.id, reason || "内部一键转结");
      
      toast.success("能量结转成功！", {
        description: `原始残值 ¥${res.valueTransfer} 已置换为新课 ${res.newLessons} 节。`
      });
      setActiveDialog("NONE");
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setLoading(false);
    }
  };

  const openTransferDialog = async () => {
    setActiveDialog("TRANSFER");
    const supabase = createClient();
    const { data } = await supabase.from("erp_classes").select("id, name, course_id, erp_courses(name, price_per_lesson)").order("created_at", { ascending: false });
    if(data) setAvailableClasses(data);
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="h-8 w-8 ml-2 mt-2 absolute top-2 right-2 hover:bg-zinc-100 dark:hover:bg-zinc-800">
             <MoreHorizontal className="h-4 w-4 text-zinc-500" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48 rounded-xl shadow-xl dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800">
          <DropdownMenuLabel className="text-xs font-black text-zinc-400">单据生命周期</DropdownMenuLabel>
          <DropdownMenuSeparator />
          
          <DropdownMenuItem onClick={openTransferDialog} className="font-bold text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-950/30 cursor-pointer py-2.5">
            <RefreshCcw className="h-4 w-4 mr-2" />
            余课结转 (Transfer)
          </DropdownMenuItem>
          
          <DropdownMenuItem onClick={() => setActiveDialog("REFUND")} className="font-bold text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 cursor-pointer py-2.5">
            <Banknote className="h-4 w-4 mr-2" />
            结业退费 (Refund)
          </DropdownMenuItem>
          
          <DropdownMenuItem onClick={() => setActiveDialog("ARCHIVE")} className="font-bold text-zinc-600 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800 cursor-pointer py-2.5">
            <Archive className="h-4 w-4 mr-2" />
            终止归档 (Archive)
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* 退费 / 结课 Dialog */}
      <Dialog open={activeDialog === "REFUND" || activeDialog === "ARCHIVE"} onOpenChange={(open) => !open && setActiveDialog("NONE")}>
        <DialogContent className="sm:max-w-[425px] rounded-[24px]">
          <DialogHeader>
            <DialogTitle>
              {activeDialog === "REFUND" ? "确认为该学员退费？" : "确认将报单强制归档？"}
            </DialogTitle>
            <DialogDescription>
              {activeDialog === "REFUND" 
                ? `该订单剩余 ${remainingLessons} 节课未销，依据原价应退还 ¥${totalRemainingValue} (仅作系统账面销核，不进行实际资金划扣)。`
                : "将立即清除剩余全部课时，停止日后所有考勤。"}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <label className="text-sm font-bold">操作原因备注</label>
              <Input 
                value={reason} 
                onChange={(e) => setReason(e.target.value)} 
                placeholder={activeDialog === "REFUND" ? "必填，如：搬家/体验不佳" : "必填，如：升学毕业等"} 
                className="rounded-xl w-full"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setActiveDialog("NONE")}>取消</Button>
            <Button 
              variant="destructive" 
              onClick={() => handleStatusUpdate(activeDialog === "REFUND" ? "REFUNDED" : "GRADUATED")}
              disabled={loading || !reason}
            >
              确认生效
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 一键结转 Dialog */}
      <Dialog open={activeDialog === "TRANSFER"} onOpenChange={(open) => !open && setActiveDialog("NONE")}>
        <DialogContent className="sm:max-w-[500px] rounded-[24px] bg-gradient-to-b from-white to-zinc-50 dark:from-zinc-950 dark:to-black">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl font-black">
               <Zap className="h-5 w-5 text-amber-500 fill-amber-500" />
               课程能量结转流 (Course Transfer)
            </DialogTitle>
            <DialogDescription>
               将旧课程池里的残余现金价值无损兑换为新课程。
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6 pt-4 pb-2">
            
            {/* 价值提现 */}
            <div className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-100/50 dark:bg-zinc-900/50">
              <div className="flex justify-between items-center mb-1 text-xs font-bold text-zinc-500 uppercase">
                <span>来源: {courseName}</span>
                <span>残余净资产</span>
              </div>
              <div className="text-2xl font-black text-zinc-900 dark:text-zinc-100">
                ¥{totalRemainingValue.toLocaleString()} 
                <span className="text-sm font-medium text-zinc-400 ml-2">({remainingLessons}节 × ¥{coursePrice})</span>
              </div>
            </div>

            <div className="flex justify-center -my-2 opacity-50"><ArrowRight className="h-6 w-6 rotate-90 text-amber-500" /></div>

            {/* 目标注入 */}
            <div className="grid gap-2">
              <label className="text-sm font-bold">目标接收课程与班级</label>
              <select 
                className="w-full h-10 px-3 rounded-xl border bg-white dark:bg-zinc-950 outline-none text-sm font-medium border-zinc-200 dark:border-zinc-800 focus:ring-2 focus:ring-amber-500"
                value={selectedClassId}
                onChange={(e) => setSelectedClassId(e.target.value)}
              >
                <option value="">-- 选择目标班级 --</option>
                {availableClasses.map(c => {
                  const p = Array.isArray(c.erp_courses) ? c.erp_courses[0]?.price_per_lesson : c.erp_courses?.price_per_lesson;
                  return (
                    <option key={c.id} value={c.id}>
                      {c.name} · {Array.isArray(c.erp_courses) ? c.erp_courses[0]?.name : c.erp_courses?.name} (¥{p}/节)
                    </option>
                  )
                })}
              </select>
            </div>

            {selectedClassId && (
              <div className="p-4 rounded-xl border border-amber-200 bg-amber-50 dark:bg-amber-950/20 dark:border-amber-900 pr-8 relative overflow-hidden">
                <div className="absolute right-0 top-0 bottom-0 w-2 bg-amber-500" />
                <p className="text-xs font-bold text-amber-600/70 dark:text-amber-500/70 mb-1">系统预估置换结果</p>
                <p className="text-xl font-black text-amber-700 dark:text-amber-500">
                  可兑换 <span className="text-3xl">
                    {(() => {
                      const tgt = availableClasses.find(c => c.id === selectedClassId);
                      const np = Array.isArray(tgt?.erp_courses) ? tgt.erp_courses[0]?.price_per_lesson : tgt?.erp_courses?.price_per_lesson;
                      return Math.floor((totalRemainingValue / Number(np || 1)) * 10) / 10;
                    })()}
                  </span> 节课时！
                </p>
              </div>
            )}

            <div className="grid gap-2">
              <label className="text-sm font-bold">转移备注</label>
              <Input 
                value={reason} 
                onChange={(e) => setReason(e.target.value)} 
                placeholder="必填，如：学生对当前机器人课程兴趣转移，折算入编程课。" 
                className="rounded-xl w-full"
              />
            </div>
            
          </div>

          <DialogFooter>
            <Button variant="ghost" onClick={() => setActiveDialog("NONE")}>取消中止</Button>
            <Button 
              className="bg-zinc-900 text-white hover:bg-zinc-800 dark:bg-white dark:text-zinc-900"
              onClick={handleTransfer}
              disabled={loading || !reason || !selectedClassId || totalRemainingValue <= 0}
            >
              立刻执行能量转移
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
