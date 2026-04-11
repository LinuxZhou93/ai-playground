"use client";

import React, { useState } from "react";
import { 
  PackageOpen, 
  Search, 
  Filter, 
  Download, 
  Plus, 
  ArrowRightLeft,
  AlertTriangle,
  Cpu,
  Layers,
  Box,
  BatteryCharging,
  Zap,
  TrendingDown,
  ShieldCheck,
  ChevronRight,
  Loader2,
  Share2
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { PageTransition, StaggerContainer, StaggerItem } from "@/components/erp/page-transition";
import { AnimatedNumber } from "@/components/erp/animated-number";
import { motion, AnimatePresence } from "motion/react";

import { loadInventoryPageData, executeInventoryOperation } from "../actions";

export default function InventoryPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [inventory, setInventory] = useState<any[]>([]);
  const [stats, setStats] = useState({ totalValue: 0, warningCount: 0 });
  const [loading, setLoading] = useState(true);
  
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [activeItem, setActiveItem] = useState<any>(null);
  const [operationType, setOperationType] = useState<"IN" | "OUT">("OUT");
  const [opValue, setOpValue] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 挂载真实数据源
  const fetchAll = () => {
    setLoading(true);
    loadInventoryPageData().then(({ items, totalValue, warningCount }) => {
      setInventory(items);
      setStats({ totalValue, warningCount });
      setLoading(false);
    });
  };

  React.useEffect(() => {
    fetchAll();
  }, []);

  const filteredItems = inventory.filter(i => 
    i.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    i.sku.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleOpenOp = (item: any, type: "IN" | "OUT") => {
    setActiveItem(item);
    setOperationType(type);
    setOpValue(1);
    setIsDialogOpen(true);
  };

  const executeOperation = async () => {
    setIsSubmitting(true);
    try {
      await executeInventoryOperation(activeItem.id, operationType, opValue);
      toast.success(`库存已${operationType === "IN" ? "补充" : "下发"}，云端链路同步完毕。`);
      setIsDialogOpen(false);
      fetchAll(); // 重新拉取新数据
    } catch (err) {
      toast.error("数据库事务失败，请检查连接或库存余量。");
    } finally {
      setIsSubmitting(false);
    }
  };





  return (
    <PageTransition>
      <div className="space-y-10 max-w-[1600px] mx-auto pb-24 pt-4 px-4 sm:px-6">
        
        {/* 指挥大屏标题区 */}
        <div className="relative flex flex-col md:flex-row md:items-end justify-between gap-8 z-10">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-500/10 dark:bg-orange-500/5 border border-orange-500/20">
              <Box className="h-3.5 w-3.5 text-orange-600 animate-bounce" />
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-orange-600">Hardware Control Base</span>
            </div>
            <div className="space-y-1">
              <h2 className="text-5xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-50">
                硬件物料库 <span className="text-zinc-300 dark:text-zinc-700 font-light ml-2">/ Inventory</span>
              </h2>
              <p className="text-zinc-500 dark:text-zinc-400 text-lg max-w-xl leading-relaxed">
                高精度的硬件资产中枢，无缝管控每一块微型主板与传感器的终端下发。
              </p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-6">
            <Button 
              className="h-16 px-10 bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-100 dark:hover:bg-white text-white dark:text-zinc-900 rounded-[1.5rem] font-bold text-base shadow-2xl transition-all hover:scale-[1.02] active:scale-[0.98] group border-none"
            >
              <ArrowRightLeft className="mr-2 h-5 w-5 transition-transform group-hover:rotate-180 duration-500" /> 批量扫码分发
            </Button>
          </div>
        </div>

        {/* 核心资产监控矩阵 */}
        <StaggerContainer className="grid gap-6 md:grid-cols-3">
          
          <StaggerItem>
            <motion.div whileHover={{ y: -6 }} transition={{ type: "spring", stiffness: 400, damping: 25 }}>
              <Card className="relative overflow-hidden border border-zinc-200/60 dark:border-zinc-800/60 bg-white/60 dark:bg-zinc-900/40 backdrop-blur-3xl shadow-[0_4px_20px_rgba(0,0,0,0.02)] rounded-[2.5rem] group h-[220px]">
                <CardContent className="p-8 pb-6 flex flex-col h-full justify-between relative z-10">
                  <div className="flex items-start justify-between">
                    <div className="p-3 rounded-[1rem] bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20 group-hover:bg-indigo-600 group-hover:text-white transition-colors duration-500">
                      <Cpu className="h-6 w-6" />
                    </div>
                    <Badge variant="outline" className="bg-white/50 border-zinc-200 text-zinc-400 font-bold px-3 py-1 rounded-full text-[10px] uppercase tracking-widest">
                      Gross Assets
                    </Badge>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[11px] font-black uppercase tracking-[0.25em] text-zinc-400">核定在库总值</p>
                    <div className="flex items-baseline gap-1.5">
                      <h3 className="text-5xl font-black text-zinc-900 dark:text-zinc-100 tracking-tighter">
                        <AnimatedNumber value={stats.totalValue} prefix="¥" />
                      </h3>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </StaggerItem>

          <StaggerItem>
            <motion.div whileHover={{ y: -6 }} transition={{ type: "spring", stiffness: 400, damping: 25 }}>
              <Card className="relative overflow-hidden border-none bg-zinc-900 text-white shadow-[0_30px_60px_-15px_rgba(0,0,0,0.4)] rounded-[2.5rem] group h-[220px]">
                <div className="absolute inset-0 bg-gradient-to-br from-zinc-800 to-transparent opacity-60" />
                <motion.div
                  animate={{ scale: [1, 1.1, 1], opacity: [0.1, 0.2, 0.1] }}
                  transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                  className="absolute right-0 top-0 w-48 h-48 bg-zinc-500/20 blur-[60px] rounded-full pointer-events-none"
                />
                <CardContent className="p-8 pb-6 flex flex-col h-full justify-between relative z-10">
                  <div className="flex items-start justify-between">
                    <div className="p-3 rounded-[1rem] bg-white/10 text-zinc-200 border border-white/10 backdrop-blur-md">
                      <Layers className="h-6 w-6" />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[11px] font-black uppercase tracking-[0.25em] text-zinc-400">活跃库位 (SKU)</p>
                    <div className="flex items-baseline gap-3">
                      <h3 className="text-5xl font-black text-white tracking-tighter">
                        <AnimatedNumber value={inventory.length} />
                      </h3>
                      <span className="text-zinc-500 font-bold uppercase tracking-widest text-[10px]">Active</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </StaggerItem>

          <StaggerItem>
            <motion.div whileHover={{ y: -6 }} transition={{ type: "spring", stiffness: 400, damping: 25 }}>
              <Card className="relative overflow-hidden border border-rose-200/60 dark:border-rose-900/30 bg-rose-50/50 dark:bg-rose-950/20 backdrop-blur-3xl shadow-[0_20px_40px_rgba(244,63,94,0.05)] rounded-[2.5rem] group h-[220px]">
                <div className="absolute inset-0 bg-gradient-to-br from-rose-500/5 to-transparent pointer-events-none" />
                <CardContent className="p-8 pb-6 flex flex-col h-full justify-between relative z-10">
                  <div className="flex items-start justify-between">
                    <div className="p-3 rounded-[1rem] bg-rose-100 dark:bg-rose-900/50 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-800 shadow-[0_0_15px_rgba(244,63,94,0.2)]">
                      <TrendingDown className="h-6 w-6" />
                    </div>
                    {stats.warningCount > 0 && (
                      <span className="flex items-center gap-1.5 px-3 py-1 bg-rose-500 text-white rounded-full text-[10px] font-black uppercase tracking-widest shadow-lg shadow-rose-500/30 animate-pulse">
                        <AlertTriangle className="h-3 w-3" /> Action Reqd
                      </span>
                    )}
                  </div>
                  <div className="space-y-1">
                    <p className="text-[11px] font-black uppercase tracking-[0.25em] text-rose-400">红线短缺警报数</p>
                    <div className="flex items-baseline gap-1.5">
                      <h3 className="text-5xl font-black text-rose-600 dark:text-rose-400 tracking-tighter">
                        <AnimatedNumber value={stats.warningCount} />
                      </h3>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </StaggerItem>

        </StaggerContainer>

        {/* 物料下层表格与搜索引擎 */}
        <Card className="border-none bg-transparent shadow-none">
          <CardHeader className="p-0 mb-8 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
            <div>
              <CardTitle className="text-2xl font-black tracking-tight text-zinc-900 dark:text-zinc-50">底层栈位清单</CardTitle>
            </div>
            <div className="flex flex-wrap gap-3 w-full lg:w-auto">
              <div className="relative flex-1 min-w-[320px] group">
                <Search className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-zinc-400 group-focus-within:text-orange-500 transition-colors" />
                <Input 
                  placeholder="检索 SKU 编号或教具品类..." 
                  className="pl-14 h-14 bg-white/60 dark:bg-zinc-900/60 border-zinc-200/80 dark:border-zinc-800 backdrop-blur-md focus:bg-white focus:ring-4 focus:ring-orange-500/10 transition-all rounded-[1.25rem] text-sm font-bold shadow-sm"
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                />
              </div>
              <Button variant="outline" className="h-14 border-zinc-200/80 dark:border-zinc-800 bg-white/60 dark:bg-zinc-900/60 backdrop-blur-md hover:bg-white font-black px-6 rounded-[1.25rem] text-zinc-600 dark:text-zinc-300 transition-all text-[11px] uppercase tracking-widest shadow-sm">
                <Filter className="h-4 w-4 mr-2" /> 多维过滤
              </Button>
            </div>
          </CardHeader>
          
          <CardContent className="p-0 grid grid-cols-1 gap-4">
            <AnimatePresence mode="popLayout">
              {filteredItems.map((item, idx) => {
                const isWarning = item.stock <= item.threshold;
                return (
                  <motion.div
                    key={item.id}
                    layout
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ delay: idx * 0.05 }}
                    className={`flex flex-col lg:flex-row items-center justify-between p-6 rounded-[2rem] border backdrop-blur-2xl transition-all duration-500 hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.1)] ${isWarning ? 'border-rose-200 dark:border-rose-900/50 bg-rose-50/40 dark:bg-rose-950/20' : 'border-zinc-200/60 dark:border-zinc-800/60 bg-white/80 dark:bg-zinc-900/50'}`}
                  >
                    <div className="flex items-center gap-6 w-full lg:w-1/2">
                      <div className={`w-16 h-16 rounded-[1.25rem] border shadow-sm flex items-center justify-center shrink-0 ${isWarning ? 'bg-rose-100 border-rose-200 text-rose-600 shadow-rose-500/20' : 'bg-zinc-50 border-zinc-200 text-zinc-500'}`}>
                        {item.category.includes('控制') || item.category.includes('感') ? <Cpu className="h-8 w-8" /> : item.category.includes('源') ? <BatteryCharging className="h-8 w-8" /> : <PackageOpen className="h-8 w-8" />}
                      </div>
                      <div className="space-y-1.5 flex-1 min-w-0">
                        <div className="flex items-center gap-3">
                          <span className="px-2.5 py-0.5 rounded-full bg-zinc-900 text-white text-[9px] font-black uppercase tracking-[0.25em]">{item.sku}</span>
                          <span className="text-zinc-400 text-xs font-bold truncate hidden sm:inline-block">/ {item.category}</span>
                        </div>
                        <h4 className="text-xl font-black text-zinc-900 dark:text-zinc-100 truncate">{item.name}</h4>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between lg:justify-end gap-10 mt-6 lg:mt-0 w-full lg:w-1/2">
                      <div className="flex flex-col items-center">
                        <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-1">实时在位</span>
                        <div className="flex items-baseline gap-1">
                          <span className={`text-3xl font-black tracking-tighter tabular-nums ${isWarning ? 'text-rose-600' : 'text-zinc-900 dark:text-zinc-100'}`}>{item.stock}</span>
                          <span className="text-xs text-zinc-400 font-bold">件</span>
                        </div>
                      </div>
                      <div className="w-[1px] h-10 bg-zinc-200 dark:bg-zinc-800 hidden sm:block" />
                      <div className="flex flex-col items-center hidden sm:flex">
                        <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-1">资产单价</span>
                        <span className="text-lg font-bold text-zinc-700 dark:text-zinc-300 tabular-nums">¥{item.cost.toFixed(2)}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <Button 
                          onClick={() => handleOpenOp(item, "OUT")}
                          className="h-12 w-12 rounded-[1rem] rounded-tr-sm bg-orange-100 text-orange-600 hover:bg-orange-200 shadow-none hover:rotate-[-5deg] transition-all p-0"
                          title="下发 / 出库"
                        >
                          <Share2 className="h-5 w-5" />
                        </Button>
                        <Button 
                          onClick={() => handleOpenOp(item, "IN")}
                          className="h-12 w-12 rounded-[1rem] rounded-bl-sm bg-indigo-100 text-indigo-600 hover:bg-indigo-200 shadow-none hover:rotate-[5deg] transition-all p-0"
                          title="入库补充"
                        >
                          <Plus className="h-5 w-5" />
                        </Button>
                      </div>
                    </div>
                  </motion.div>
                )
              })}
            </AnimatePresence>
          </CardContent>
        </Card>

        {/* 执行指令的 Glassmorphism Dialog */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="sm:max-w-[480px] p-0 overflow-hidden rounded-[3rem] border-zinc-200 dark:border-zinc-800 shadow-[0_40px_80px_-15px_rgba(0,0,0,0.5)] bg-white dark:bg-zinc-950">
            <div className={`p-10 relative overflow-hidden ${operationType === "IN" ? "bg-indigo-600 text-white" : "bg-orange-500 text-white"}`}>
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32 blur-3xl" />
              <div className="relative z-10 space-y-2">
                <Badge variant="outline" className="bg-white/20 border-transparent text-white font-black px-3 py-1 rounded-full text-[10px] tracking-widest uppercase mb-2">
                  {operationType === "IN" ? "System Restock" : "Hardware Dispatch"}
                </Badge>
                <DialogTitle className="text-3xl font-black tracking-tight">{operationType === "IN" ? "教具物资入库登记" : "物料包裹出库下发"}</DialogTitle>
                <DialogDescription className="text-white/70 font-bold text-sm">
                  标的物: {activeItem?.sku}
                </DialogDescription>
              </div>
            </div>
            
            <div className="p-10 space-y-8">
              <div className="space-y-3">
                <label className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em] ml-1">执行标的名称</label>
                <div className="h-16 px-6 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-[1.25rem] flex items-center justify-between">
                   <span className="font-bold text-zinc-900 dark:text-zinc-100 truncate pr-4">{activeItem?.name}</span>
                   <span className="font-mono text-zinc-400 text-xs shrink-0">Current: {activeItem?.stock}</span>
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em] ml-1">{operationType === "IN" ? "采购入库总量" : "分配下发数量"}</label>
                <Input 
                  type="number" 
                  min="1"
                  className="h-20 rounded-[1.5rem] border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50 px-8 font-black text-3xl tabular-nums text-center focus:ring-4 focus:ring-zinc-900/10" 
                  value={opValue} 
                  onChange={e => setOpValue(Number(e.target.value))} 
                />
              </div>

              <div className="pt-4 flex gap-4">
                <Button 
                  variant="ghost" 
                  onClick={() => setIsDialogOpen(false)}
                  className="flex-1 h-16 rounded-[1.25rem] font-black hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-all text-sm"
                >
                  放弃指令
                </Button>
                <Button 
                  onClick={executeOperation} 
                  disabled={isSubmitting || opValue < 1} 
                  className={`flex-[2] h-16 rounded-[1.25rem] text-white font-black shadow-2xl transition-all text-base border-none hover:scale-[1.02] active:scale-[0.98] ${operationType === "IN" ? "bg-indigo-600 hover:bg-indigo-700 shadow-indigo-500/30" : "bg-orange-600 hover:bg-orange-700 shadow-orange-500/30"}`}
                >
                  {isSubmitting ? <><Loader2 className="h-6 w-6 mr-2 animate-spin" /> 数据同步中...</> : (operationType === "IN" ? "确认为核心库存加水" : "授权释放硬件资产")}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

      </div>
    </PageTransition>
  );
}
