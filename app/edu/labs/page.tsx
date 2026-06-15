export const dynamic = "force-dynamic";

import React from "react";
import { loadInventoryPageData } from "@/app/erp/actions";
import { 
  Cpu, Activity, AlertTriangle, Box,
  HardDrive, MonitorPlay, Zap, PackageOpen, LayoutGrid 
} from "lucide-react";

// Server Component (RSC)
export default async function MoziLabsPage() {
  const inventoryData = await loadInventoryPageData();
  const { items, totalValue, warningCount } = inventoryData;

  const totalItems = items.length;
  const inStockQty = items.reduce((sum: number, i: any) => sum + i.stock, 0);

  return (
    <div className="min-h-full flex flex-col space-y-6 pt-4 animate-in fade-in duration-700 relative">
      
      {/* 沉浸式虚空网格光晕 */}
      <div className="absolute inset-0 bg-[url('/bg-dots.svg')] opacity-20 pointer-events-none" />
      <div className="absolute top-0 right-10 w-[600px] h-[300px] bg-blue-600/10 blur-[120px] rounded-full pointer-events-none" />
      
      {/* Header */}
      <div className="relative flex items-center justify-between z-10 px-2 lg:px-0">
        <div>
          <h1 className="text-3xl font-black text-white flex items-center gap-3">
            <Cpu className="h-8 w-8 text-blue-500" />
            WOW CREATOR 控制中心
          </h1>
          <p className="text-slate-400 mt-2 text-sm font-medium flex items-center gap-2">
            <Activity className="h-4 w-4 text-emerald-500 animate-pulse" />
            WOW CREATOR Hardware Research & Inventory HUD
          </p>
        </div>
        <div className="hidden lg:flex items-center gap-3 bg-slate-900 border border-slate-700/50 p-1.5 rounded-xl">
          <button className="px-4 py-2 bg-blue-600/20 text-blue-400 font-bold text-sm rounded-lg flex items-center gap-2 border border-blue-500/20">
            <LayoutGrid className="h-4 w-4" /> 监控柜视窗
          </button>
          <button className="px-4 py-2 hover:bg-slate-800 text-slate-400 font-bold text-sm rounded-lg flex items-center gap-2 transition-colors">
            <PackageOpen className="h-4 w-4" /> 物料调拨申领
          </button>
        </div>
      </div>

      {/* Primary HUD Dashboard */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 relative z-10">
        <div className="bg-slate-900/80 backdrop-blur-md rounded-2xl p-6 border border-slate-700/50 shadow-2xl relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          <div className="flex justify-between items-start mb-4">
            <div className="h-10 w-10 rounded-xl bg-blue-500/20 flex items-center justify-center border border-blue-500/30">
              <Box className="h-5 w-5 text-blue-400" />
            </div>
            <span className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Active SKU</span>
          </div>
          <div className="text-4xl font-black text-white">{totalItems} <span className="text-sm font-medium text-slate-500 ml-1">类</span></div>
          <p className="text-sm font-medium text-slate-400 mt-2 mt-4 flex items-center gap-1.5">
            涵盖教具与基础元件
          </p>
        </div>

        <div className="bg-slate-900/80 backdrop-blur-md rounded-2xl p-6 border border-slate-700/50 shadow-2xl relative overflow-hidden group">
          <div className="flex justify-between items-start mb-4">
            <div className="h-10 w-10 rounded-xl bg-indigo-500/20 flex items-center justify-center border border-indigo-500/30">
              <HardDrive className="h-5 w-5 text-indigo-400" />
            </div>
            <span className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Total Stock</span>
          </div>
          <div className="text-4xl font-black text-white">{inStockQty} <span className="text-sm font-medium text-slate-500 ml-1">件</span></div>
          <p className="text-sm font-medium text-slate-400 mt-2 mt-4 flex items-center gap-1.5">
            实验室内可用备件总容积
          </p>
        </div>

        <div className="bg-slate-900/80 backdrop-blur-md rounded-2xl p-6 border border-slate-700/50 shadow-2xl relative overflow-hidden group">
          <div className="flex justify-between items-start mb-4">
            <div className="h-10 w-10 rounded-xl bg-emerald-500/20 flex items-center justify-center border border-emerald-500/30">
              <Zap className="h-5 w-5 text-emerald-400" />
            </div>
            <span className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Asset Value</span>
          </div>
          <div className="text-4xl font-black text-white">¥{(totalValue || 0).toLocaleString()}</div>
          <p className="text-sm font-medium text-slate-400 mt-2 mt-4 flex items-center gap-1.5">
            实验室在库物资重置估值
          </p>
        </div>

        <div className="bg-slate-900/80 backdrop-blur-md rounded-2xl p-6 border border-slate-700/50 shadow-xl shadow-red-500/5 relative overflow-hidden group">
          {warningCount > 0 && <div className="absolute top-0 right-0 h-16 w-16 bg-red-500/20 blur-2xl rounded-full" />}
          <div className="flex justify-between items-start mb-4">
            <div className={"h-10 w-10 rounded-xl flex items-center justify-center border " + (warningCount > 0 ? "bg-red-500/20 border-red-500/40" : "bg-slate-800 border-slate-700")}>
              <AlertTriangle className={"h-5 w-5 " + (warningCount > 0 ? "text-red-400 animate-pulse" : "text-slate-500")} />
            </div>
            <span className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Low Stock Alert</span>
          </div>
          <div className={"text-4xl font-black " + (warningCount > 0 ? "text-red-400" : "text-slate-300")}>{warningCount} <span className="text-sm font-medium text-slate-500 ml-1">项</span></div>
          <p className="text-sm font-medium text-slate-400 mt-2 mt-4 flex items-center gap-1.5">
            需要即刻进行采购流转
          </p>
        </div>
      </div>

      {/* Inventory Matrix Array */}
      <div className="mt-8 flex-1 relative z-10 flex flex-col">
        <h3 className="text-lg font-black text-white flex items-center gap-2 mb-6">
          <MonitorPlay className="h-5 w-5 text-blue-500" /> 
          元器件全息矩阵 (Matrix Storage)
        </h3>

        {items.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-700/50 bg-slate-900/20 p-20">
             <Box className="h-16 w-16 text-slate-700 mb-6" />
             <p className="text-xl font-bold text-slate-500">机柜暂无入库物资</p>
             <p className="text-sm text-slate-600 mt-2">请先在 ERP 进行采购扫码入库</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {items.map((item: any) => {
              const isDanger = item.stock <= item.threshold;
              
              return (
                <div key={item.id} className={"relative rounded-2xl p-5 border bg-slate-900/60 backdrop-blur-md transition-all duration-300 hover:scale-[1.02] " + (isDanger ? "border-red-500/30 shadow-[0_0_15px_rgba(239,68,68,0.1)]" : "border-slate-800 hover:border-blue-500/30")}>
                  <div className="flex justify-between items-start mb-3">
                    <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-slate-800 text-slate-400">
                      {item.category || "GENERAL"}
                    </span>
                    {isDanger && (
                      <span className="flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-2 w-2 rounded-full bg-red-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                      </span>
                    )}
                  </div>
                  
                  <h4 className="text-base font-bold text-slate-200 mb-1 truncate" title={item.name}>{item.name}</h4>
                  <p className="text-xs text-slate-500 font-mono tracking-wider mb-6">SKU: {item.sku}</p>
                  
                  <div className="flex justify-between items-end border-t border-slate-800/80 pt-4 mt-auto">
                    <div>
                      <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Stock</p>
                      <div className="flex items-baseline gap-1">
                        <span className={"text-2xl font-black " + (isDanger ? "text-red-400" : "text-emerald-400")}>{item.stock}</span>
                        <span className="text-xs text-slate-600">/ {item.threshold} (预警线)</span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
      
    </div>
  );
}
