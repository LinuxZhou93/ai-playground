"use client";

import React, { useState } from "react";
import { Search, FileBox, Database, Code, Wrench, MonitorPlay, Zap, PlusCircle, LayoutPanelRight } from "lucide-react";

interface VaultSidebarProps {
  assets: any[];
  onInsert: (asset: any) => void;
}

export default function VaultSidebar({ assets, onInsert }: VaultSidebarProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const categories = ["全部", "机械零件", "电子元件", "代码片段"];
  const [activeCat, setActiveCat] = useState("全部");

  const filteredAssets = assets.filter(a => {
    const matchesSearch = a.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCat = activeCat === "全部" || a.category === activeCat;
    return matchesSearch && matchesCat;
  });

  return (
    <div className="w-[300px] shrink-0 border-l border-slate-800 bg-[#0d121c]/80 flex flex-col h-full animate-in slide-in-from-right duration-500">
      <div className="p-5 border-b border-slate-800">
        <h2 className="text-sm font-black tracking-widest text-slate-300 uppercase flex items-center gap-2">
          <Database className="h-4 w-4 text-amber-500" />
          素材宝库 (Vault)
        </h2>
        <p className="text-[10px] text-slate-500 mt-1 uppercase font-bold tracking-tighter">组件、模块与交互资产系统</p>
      </div>

      <div className="p-4 space-y-4 flex-1 overflow-y-auto custom-scrollbar">
        {/* 搜索栏 */}
        <div className="relative group">
          <Search className="absolute left-3 top-2.5 text-slate-500 h-3.5 w-3.5" />
          <input 
            type="text" 
            placeholder="搜索教研物料..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-950/50 border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-xs text-white focus:outline-none focus:border-indigo-500/50 transition-all font-medium"
          />
        </div>

        {/* 分类快速筛选 */}
        <div className="flex flex-wrap gap-1.5 pt-1">
          {categories.map(cat => (
            <button 
               key={cat}
               onClick={() => setActiveCat(cat)}
               className={`px-3 py-1 rounded-lg text-[10px] font-bold transition-all ${activeCat === cat ? 'bg-indigo-600/20 text-indigo-400 border border-indigo-500/30' : 'bg-slate-800/40 text-slate-500 border border-transparent hover:border-slate-700 hover:text-slate-300'}`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* 素材列表 */}
        <div className="space-y-3 mt-2">
          {filteredAssets.length === 0 ? (
            <div className="text-center py-10 opacity-30 flex flex-col items-center gap-3">
               <FileBox className="h-10 w-10" />
               <span className="text-[10px] font-bold uppercase">无匹配素材</span>
            </div>
          ) : (
            filteredAssets.map(asset => (
              <div 
                key={asset.id} 
                className="group p-3 rounded-xl bg-slate-900 border border-slate-800/50 hover:border-indigo-500/40 hover:bg-slate-800/60 transition-all cursor-default"
              >
                <div className="flex items-start gap-3">
                   <div className="h-10 w-10 shrink-0 rounded-lg bg-slate-950 border border-slate-800 overflow-hidden flex items-center justify-center">
                      {asset.thumbnail_url ? (
                        <img src={asset.thumbnail_url} className="w-full h-full object-cover opacity-70 group-hover:opacity-100" />
                      ) : (
                        <div className="text-slate-600">
                           {asset.type === 'CODE' ? <Code className="h-5 w-5" /> : 
                            asset.type === '3D' ? <Wrench className="h-5 w-5" /> : 
                            asset.type === 'INTERACTIVE' ? <MonitorPlay className="h-5 w-5" /> : 
                            <Zap className="h-5 w-5" />}
                        </div>
                      )}
                   </div>
                   <div className="flex-1 min-w-0">
                      <div className="text-[11px] font-bold text-slate-200 truncate group-hover:text-white">{asset.name}</div>
                      <div className="flex items-center gap-2 mt-1">
                         <span className="text-[9px] font-black text-slate-600 uppercase tracking-widest">{asset.format}</span>
                         <div className="w-1 h-1 rounded-full bg-slate-700" />
                         <span className="text-[9px] font-bold text-slate-500">{asset.category}</span>
                      </div>
                   </div>
                </div>
                <div className="mt-3 opacity-0 group-hover:opacity-100 transition-opacity flex justify-end">
                   <button 
                     onClick={() => onInsert(asset)}
                     className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-[10px] font-black flex items-center gap-1.5 shadow-lg shadow-indigo-500/20"
                   >
                     <PlusCircle className="h-3 w-3" />
                     注入教案
                   </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <div className="p-4 border-t border-slate-800 bg-black/20">
         <div className="flex items-center justify-between text-[10px] font-bold text-slate-500 uppercase">
            <span>素材库版本</span>
            <span className="text-slate-300">V1.4.2</span>
         </div>
      </div>
    </div>
  );
}
