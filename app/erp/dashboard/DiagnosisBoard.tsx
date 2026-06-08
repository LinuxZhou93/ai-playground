"use client";

import React from "react";
import { 
  ShieldAlert, 
  BrainCircuit, 
  Zap, 
  ArrowRight, 
  TrendingDown, 
  Users,
  AlertCircle,
  Sparkles,
  Loader2,
  ChevronRight,
  Activity
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { StaggerContainer, StaggerItem } from "@/components/erp/page-transition";
import { AnimatedNumber } from "@/components/erp/animated-number";
import { motion, AnimatePresence } from "motion/react";
import { pushDiagnosisToFeishu } from "./../diagnosis_actions";
import { toast } from "sonner";

interface DiagnosisBoardProps {
  diagnosis: any;
  directive: string;
  loading: boolean;
}

export default function DiagnosisBoard({ diagnosis, directive, loading }: DiagnosisBoardProps) {
  if (loading) {
    return (
      <Card className="col-span-full border-zinc-200/50 dark:border-zinc-800/50 bg-white/40 dark:bg-zinc-950/40 backdrop-blur-xl shadow-2xl overflow-hidden">
        <div className="h-[240px] flex flex-col items-center justify-center gap-4">
          <div className="relative">
            <div className="absolute inset-0 rounded-full bg-indigo-500/20 animate-ping" />
            <div className="relative bg-gradient-to-b from-indigo-500 to-blue-600 p-3 rounded-2xl shadow-lg shadow-indigo-500/20">
              <Loader2 className="h-6 w-6 animate-spin text-white" />
            </div>
          </div>
          <div className="flex flex-col items-center gap-1">
            <span className="text-zinc-900 dark:text-zinc-100 font-semibold tracking-tight">智能运营大脑正在深度扫描</span>
            <span className="text-zinc-500 dark:text-zinc-400 text-xs animate-pulse">正在穿透 12,402 条资产底层数据...</span>
          </div>
        </div>
      </Card>
    );
  }

  if (!diagnosis) return null;

  return (
    <Card className="col-span-full border-zinc-200/60 dark:border-zinc-800/60 bg-white dark:bg-zinc-950 shadow-[0_8px_40px_-12px_rgba(0,0,0,0.1)] dark:shadow-[0_20px_50px_-12px_rgba(0,0,0,0.5)] overflow-hidden group transition-all duration-500">
      {/* 顶部极简装饰条 */}
      <div className="h-[2px] w-full flex">
        <div className="h-full w-1/3 bg-red-500/60" />
        <div className="h-full w-1/3 bg-amber-500/60" />
        <div className="h-full w-1/3 bg-indigo-500/60" />
      </div>
      
      <CardHeader className="pb-6 pt-8 px-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <motion.div
              initial={{ rotate: -15, scale: 0.9, opacity: 0 }}
              animate={{ rotate: 0, scale: 1, opacity: 1 }}
              transition={{ type: "spring", stiffness: 260, damping: 20 }}
              className="relative"
            >
              <div className="absolute inset-0 bg-indigo-500/20 blur-xl rounded-full" />
              <div className="relative p-3 bg-zinc-900 dark:bg-zinc-100 rounded-2xl text-white dark:text-zinc-900 shadow-xl">
                <BrainCircuit className="h-6 w-6" />
              </div>
            </motion.div>
            <div>
              <div className="flex items-center gap-2">
                <CardTitle className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
                  智能运营诊断
                </CardTitle>
                <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                  <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider">Live Analysis</span>
                </div>
              </div>
              <CardDescription className="text-zinc-500 dark:text-zinc-400 mt-1 font-medium">
                数据快照: {new Date(diagnosis.timestamp).toLocaleTimeString()} · 系统已自动识别潜在流失风险
              </CardDescription>
            </div>
          </div>
          <motion.div
            initial={{ x: 20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            className="hidden sm:block"
          >
            <Badge variant="outline" className="px-4 py-1.5 rounded-full bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 font-semibold shadow-sm">
              <Activity className="h-3.5 w-3.5 mr-2 text-red-500" />
              发现 {diagnosis.dormantCount + diagnosis.inefficientClassesCount} 个异常因子
            </Badge>
          </motion.div>
        </div>
      </CardHeader>

      <CardContent className="grid md:grid-cols-12 gap-8 px-8 pb-8">
        {/* 左侧：风险雷达 */}
        <div className="md:col-span-5 space-y-6">
          <StaggerContainer className="grid grid-cols-2 gap-4">
            <StaggerItem>
              <motion.div 
                whileHover={{ y: -4 }}
                className="p-5 rounded-2xl bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800/50 transition-all hover:shadow-lg hover:shadow-red-500/5 group/card"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="p-2 rounded-lg bg-red-500/10 text-red-600">
                    <Users className="h-4 w-4" />
                  </div>
                  <span className="text-[10px] font-bold text-red-500/70 tracking-widest">CRITICAL</span>
                </div>
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-bold tracking-tighter text-zinc-900 dark:text-zinc-50">
                    <AnimatedNumber value={diagnosis.dormantCount} />
                  </span>
                  <span className="text-zinc-400 text-xs font-medium">位</span>
                </div>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 font-medium">14天未消课学员</p>
              </motion.div>
            </StaggerItem>
            
            <StaggerItem>
              <motion.div 
                whileHover={{ y: -4 }}
                className="p-5 rounded-2xl bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800/50 transition-all hover:shadow-lg hover:shadow-amber-500/5 group/card"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="p-2 rounded-lg bg-amber-500/10 text-amber-600">
                    <TrendingDown className="h-4 w-4" />
                  </div>
                  <span className="text-[10px] font-bold text-amber-500/70 tracking-widest">REVENUE</span>
                </div>
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-bold tracking-tighter text-zinc-900 dark:text-zinc-50">
                    <AnimatedNumber value={diagnosis.riskRevenue} prefix="¥" />
                  </span>
                </div>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 font-medium">预计流失风险敞口</p>
              </motion.div>
            </StaggerItem>
          </StaggerContainer>

          <div className="relative p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/30 dark:bg-zinc-900/20 backdrop-blur-sm">
            <h4 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 mb-4 flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-zinc-400" /> 
              高危预警名单
              <span className="ml-auto text-[10px] text-zinc-400 font-normal">TOP 3</span>
            </h4>
            <div className="space-y-2.5">
              {diagnosis.dormantList.length > 0 ? (
                diagnosis.dormantList.slice(0, 3).map((s: any, idx: number) => (
                  <motion.div
                    key={s.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 * idx }}
                    className="group/item flex items-center justify-between p-3 bg-white dark:bg-zinc-900 rounded-xl border border-zinc-100 dark:border-zinc-800 shadow-sm hover:border-indigo-500/30 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-[10px] font-bold text-zinc-500">
                        {s.name.charAt(0)}
                      </div>
                      <span className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">{s.name}</span>
                    </div>
                    <div className="text-right">
                      <div className="text-[10px] text-zinc-400 uppercase font-bold tracking-tighter">Last Active</div>
                      <div className="text-[11px] font-medium text-zinc-600 dark:text-zinc-400">{s.lastDate}</div>
                    </div>
                  </motion.div>
                ))
              ) : (
                <div className="py-8 flex flex-col items-center justify-center border-2 border-dashed border-zinc-100 dark:border-zinc-800 rounded-xl">
                  <Sparkles className="h-5 w-5 text-emerald-500 mb-2" />
                  <p className="text-xs text-zinc-400 font-medium">当前无极高危沉睡学员</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 右侧：AI 指令区 */}
        <div className="md:col-span-7">
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="h-full flex flex-col p-8 rounded-[2rem] bg-zinc-900 dark:bg-zinc-50 text-zinc-50 dark:text-zinc-900 relative overflow-hidden shadow-2xl"
          >
            {/* 极客感背景装饰 */}
            <div className="absolute top-0 right-0 p-8 opacity-10 dark:opacity-5">
              <BrainCircuit className="h-32 w-32 rotate-12" />
            </div>
            <div className="absolute -bottom-24 -right-24 h-64 w-64 bg-indigo-500/20 blur-[100px] rounded-full" />
            
            <div className="relative z-10 flex flex-col h-full">
              <div className="flex items-center gap-3 mb-8">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 dark:bg-black/5 backdrop-blur-md border border-white/20 dark:border-black/10">
                  <Zap className="h-5 w-5 fill-amber-400 text-amber-400" />
                </div>
                <div>
                  <h3 className="text-lg font-bold tracking-tight">AI 运营助手</h3>
                  <p className="text-xs text-white/60">实时诊断与建议</p>
                </div>
              </div>
              
              <div className="flex-1">
                <div className="relative">
                  <span className="absolute -top-4 -left-2 text-4xl text-indigo-500/40 font-serif">“</span>
                  <p className="text-xl md:text-2xl font-medium leading-relaxed tracking-tight italic text-zinc-100 dark:text-zinc-800 pl-4">
                    {directive}
                  </p>
                </div>
              </div>

              <div className="mt-10 flex flex-wrap gap-4">
                <Button 
                  size="lg" 
                  className="bg-indigo-500 hover:bg-indigo-600 text-white border-none px-8 rounded-xl font-bold shadow-lg shadow-indigo-500/25 transition-all hover:scale-[1.02] active:scale-[0.98]"
                >
                  立即执行策略
                </Button>
                <Button 
                  size="lg" 
                  variant="outline" 
                  onClick={async () => {
                    toast.loading("正在推送至飞书机器人...");
                    const res = await pushDiagnosisToFeishu(diagnosis, directive);
                    toast.dismiss();
                    if (res.success) {
                      if (res.mock) {
                        toast.success("已生成预警简报 (本地模拟)");
                      } else {
                        toast.success("已成功推送至飞书运营群！", { icon: "🚀" });
                      }
                    } else {
                      toast.error("推送飞书失败: " + res.error);
                    }
                  }}
                  className="bg-transparent border-zinc-700 dark:border-zinc-300 text-zinc-300 dark:text-zinc-600 hover:bg-white/5 dark:hover:bg-black/5 px-6 rounded-xl font-semibold"
                >
                  推送预警至飞书 <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      </CardContent>
    </Card>
  );
}

