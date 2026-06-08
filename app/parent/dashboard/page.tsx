"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getParentDashboardData, parentLogout } from "../actions";
import { toast } from "sonner";
import { 
  LogOut, 
  Baby, 
  Sparkles, 
  Wallet,
  Clock,
  BookOpen,
  ChevronRight,
  GraduationCap,
  ImagePlus
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { motion, AnimatePresence } from "motion/react";

export default function ParentDashboard() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeChildIdx, setActiveChildIdx] = useState(0);
  const router = useRouter();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const res = await getParentDashboardData();
      setData(res);
    } catch (err) {
      toast.error("会话已过期，请重新认证");
      router.push("/parent/login");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await parentLogout();
    toast.info("已安全退出");
    router.push("/parent/login");
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center relative w-full overflow-hidden">
         <div className="absolute inset-0 bg-white dark:bg-zinc-950 z-0" />
         <div className="w-16 h-16 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin z-10" />
      </div>
    );
  }

  if (!data || data.children.length === 0) return null;

  const activeChild = data.children[activeChildIdx];
  const { assets, timeline } = activeChild;

  // 计算圆环比例
  let percentage = 0;
  if (assets.totalPurchased > 0) {
    percentage = Math.round((assets.totalRemaining / assets.totalPurchased) * 100);
  }
  const dashArray = 283; // 2 * PI * R (R=45)
  const dashOffset = dashArray - (dashArray * percentage) / 100;

  return (
    <div className="flex flex-col min-h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 pb-24">
      {/* 顶部导航与切换栏 */}
      <header className="sticky top-0 z-50 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-xl border-b border-zinc-200 dark:border-zinc-800 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-black shadow-sm">
            F
          </div>
          <span className="font-black tracking-tighter text-lg">掌上空间</span>
        </div>
        <Button variant="ghost" size="icon" onClick={handleLogout} className="text-zinc-400 hover:text-zinc-800 rounded-full">
          <LogOut className="h-5 w-5" />
        </Button>
      </header>

      {/* 多孩切换卡槽 (仅在有多个孩子时显示) */}
      {data.children.length > 1 && (
        <div className="px-6 pt-6 flex gap-3 overflow-x-auto snap-x hide-scrollbar">
          {data.children.map((child: any, idx: number) => {
            const isActive = idx === activeChildIdx;
            return (
              <button
                key={child.id}
                onClick={() => setActiveChildIdx(idx)}
                className={`snap-start shrink-0 flex items-center gap-2 px-5 py-3 rounded-full transition-all duration-300 font-bold text-sm border ${
                  isActive 
                  ? "bg-zinc-900 border-zinc-900 text-white shadow-lg shadow-zinc-200" 
                  : "bg-white border-zinc-200 text-zinc-500"
                }`}
              >
                <Baby className="h-4 w-4" />
                {child.name}
              </button>
            );
          })}
        </div>
      )}

      {/* 核心资产总览圆环 (Hero Section) */}
      <motion.div 
        key={`hero-${activeChildIdx}`}
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="px-6 pt-8 pb-4"
      >
        <div className="relative bg-white dark:bg-zinc-900 rounded-[32px] p-8 shadow-xl shadow-zinc-200/40 dark:shadow-none border border-zinc-100 dark:border-zinc-800 overflow-hidden text-center">
          <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 blur-[50px] rounded-full pointer-events-none" />
          
          <h2 className="text-zinc-500 font-bold text-sm tracking-widest uppercase mb-6 flex items-center justify-center gap-2">
            <Wallet className="h-4 w-4" />
            Total Assets 核心课时储蓄
          </h2>
          
          <div className="relative w-48 h-48 mx-auto flex items-center justify-center">
             {/* SVG Radial Progress */}
            <svg className="absolute inset-0 w-full h-full -rotate-90 transform" viewBox="0 0 100 100">
              {/* Background circle */}
              <circle cx="50" cy="50" r="45" fill="none" stroke="currentColor" strokeWidth="6" className="text-zinc-100 dark:text-zinc-800" />
              {/* Foreground circle */}
              <circle 
                cx="50" 
                cy="50" 
                r="45" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="6" 
                strokeLinecap="round"
                className="text-emerald-500 transition-all duration-1000 ease-out"
                strokeDasharray={dashArray}
                strokeDashoffset={dashOffset}
              />
            </svg>
            <div className="flex flex-col items-center">
               <span className="text-5xl font-black tabular-nums tracking-tighter text-zinc-900 dark:text-white">
                 {assets.totalRemaining}
               </span>
               <span className="text-xs font-black text-zinc-400 mt-1">剩余课节</span>
            </div>
          </div>
          
          <div className="mt-8 flex justify-center divide-x divide-zinc-200 dark:divide-zinc-800">
            <div className="px-6 flex flex-col">
               <span className="text-xl font-black text-zinc-800 dark:text-zinc-200 tabular-nums">{assets.totalPurchased}</span>
               <span className="text-[10px] uppercase font-bold text-zinc-400 tracking-widest mt-1">Total History</span>
            </div>
            <div className="px-6 flex flex-col">
               <span className="text-xl font-black text-indigo-500 tabular-nums">{assets.details.length}</span>
               <span className="text-[10px] uppercase font-bold text-zinc-400 tracking-widest mt-1">Active Classes</span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* AI 成长档案时间线 */}
      <div className="px-6 mt-6">
        <div className="flex items-center justify-between mb-6">
           <h3 className="text-lg font-black tracking-tight text-zinc-900 dark:text-white flex items-center gap-2">
             <Sparkles className="h-5 w-5 text-indigo-500" />
             AI 成长雷达评点
           </h3>
           <span className="text-xs font-bold text-zinc-400">{timeline.length} 条记录</span>
        </div>

        <div className="space-y-6 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-zinc-200 before:to-transparent">
          {timeline.length === 0 ? (
            <div className="bg-white rounded-3xl p-10 text-center border border-zinc-100 text-zinc-400 font-bold text-sm">
              孩子暂未产生课堂表现报告
            </div>
          ) : (
            timeline.map((log: any, idx: number) => (
              <motion.div 
                key={log.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active"
              >
                {/* Timeline Node */}
                <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-white dark:border-zinc-950 bg-indigo-100 text-indigo-600 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10">
                  <GraduationCap className="h-4 w-4" />
                </div>
                
                {/* Content Card */}
                <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-5 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 shadow-sm relative">
                   <div className="flex justify-between items-start mb-3">
                     <span className="text-[10px] font-black uppercase tracking-widest text-indigo-500 bg-indigo-50 px-2 py-1 rounded-md">
                       {log.erp_classes?.name || "常规课"}
                     </span>
                     <span className="text-[10px] font-bold text-zinc-400 flex items-center gap-1">
                       <Clock className="h-3 w-3" />
                       {new Date(log.created_at).toLocaleDateString()}
                     </span>
                   </div>
                   
                   <p className="text-sm font-medium text-zinc-600 dark:text-zinc-300 leading-relaxed mb-4">
                     {log.ai_feedback}
                   </p>
                   
                   {/* 🚧 Media Gallery Placeholder */}
                   <div className="mb-4 p-4 rounded-[1.25rem] bg-zinc-50/80 dark:bg-zinc-800/20 border border-zinc-100 dark:border-zinc-800/50 flex flex-col items-center justify-center gap-2">
                     <ImagePlus className="h-5 w-5 text-zinc-300 dark:text-zinc-600" />
                     <span className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest text-center mt-1">课堂瞬间相册<br/>加载模块构建中</span>
                   </div>
                   
                   <div className="pt-3 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-zinc-200 flex items-center justify-center text-[10px] font-black text-zinc-600">
                          {log.erp_classes?.erp_staff?.name?.charAt(0) || "T"}
                        </div>
                        <span className="text-xs font-bold text-zinc-500">{log.erp_classes?.erp_staff?.name || "主教导师"} 签注</span>
                      </div>
                      <span className="text-[10px] font-black tracking-widest text-emerald-500 uppercase">
                         - {log.consumption_value} Ks
                      </span>
                   </div>
                </div>
              </motion.div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
