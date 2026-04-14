"use client";

import React, { useState } from "react";
import { 
  Settings,
  Server,
  Key,
  Database,
  BrainCircuit,
  Lock,
  Zap,
  Globe,
  Radio,
  Save,
  ShieldCheck
} from "lucide-react";

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState("ai_models");

  return (
    <div className="flex flex-col h-[calc(100vh-80px)] bg-[#0d121c] animate-in fade-in duration-700">
      
      {/* 顶部标题栏 */}
      <div className="h-20 shrink-0 border-b border-slate-800 bg-[#080b12] flex items-center justify-between px-8 z-10">
        <div>
           <h1 className="text-2xl font-black text-white flex items-center gap-3">
             <Settings className="h-6 w-6 text-blue-500" />
             系统集控中心
           </h1>
           <p className="text-xs text-slate-500 font-bold tracking-widest uppercase mt-1">Superuser Configuration Panel</p>
        </div>
        <button className="px-6 py-2.5 bg-blue-600 hover:bg-blue-500 rounded-xl text-white font-bold flex items-center gap-2 transition-all shadow-[0_0_20px_rgba(37,99,235,0.3)]">
          <Save className="h-4 w-4" /> 部署并保存全局配置
        </button>
      </div>

      <div className="flex-1 flex overflow-hidden">
         {/* 左侧配置目录 */}
         <div className="w-64 shrink-0 bg-[#080b12] border-r border-slate-800 p-4 flex flex-col gap-2">
            {[
              { id: "ai_models", icon: BrainCircuit, label: "AI 大模型网关" },
              { id: "database", icon: Database, label: "云端向量资产库" },
              { id: "security", icon: ShieldCheck, label: "隐私与权限隔离" },
              { id: "nodes", icon: Server, label: "边缘部署节点 (Edge)" },
              { id: "api_keys", icon: Key, label: "外部平台联接凭证" },
              { id: "network", icon: Radio, label: "内网穿透与跨域" },
            ].map(tab => (
              <button 
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all ${
                  activeTab === tab.id 
                  ? "bg-blue-600/10 text-blue-400 border border-blue-500/30" 
                  : "text-slate-400 hover:text-white hover:bg-slate-800/50 border border-transparent"
                }`}
              >
                <tab.icon className="h-5 w-5" />
                {tab.label}
              </button>
            ))}
         </div>

         {/* 右侧表单内容区 */}
         <div className="flex-1 overflow-y-auto p-10 bg-[url('/bg-dots.svg')] relative">
            <div className="absolute top-0 right-0 w-[800px] h-[600px] bg-blue-600/5 blur-[150px] rounded-full pointer-events-none" />
            
            <div className="max-w-4xl mx-auto space-y-8 relative z-10">
               
               {activeTab === "ai_models" && (
                 <div className="animate-in fade-in slide-in-from-right-8 duration-500">
                    <div className="mb-8">
                       <h2 className="text-2xl font-black text-white mb-2">大模型计算网关设置</h2>
                       <p className="text-slate-400 text-sm">配置 FutureClass 智能体生态连接的底层引擎与推理参数。</p>
                    </div>

                    <div className="space-y-6">
                       {/* 引擎切换卡片 */}
                       <div className="p-6 bg-slate-900 border border-slate-800 rounded-2xl shadow-xl flex items-start gap-6">
                          <div className="h-12 w-12 rounded-xl bg-indigo-500/20 flex items-center justify-center border border-indigo-500/30 shrink-0">
                             <Globe className="h-6 w-6 text-indigo-400" />
                          </div>
                          <div className="flex-1">
                             <h3 className="text-lg font-bold text-white mb-1">主推理引擎适配器</h3>
                             <p className="text-sm text-slate-500 mb-4">选择教研系统全局默认使用的大脑基座。</p>
                             
                             <div className="grid grid-cols-3 gap-4">
                               <div className="px-4 py-3 rounded-xl border-2 border-blue-500 bg-blue-600/10 cursor-pointer relative overflow-hidden">
                                 <div className="absolute top-0 right-0 px-2 py-0.5 bg-blue-500 text-white text-[10px] font-black rounded-bl-lg">ACTIVE</div>
                                 <h4 className="font-bold text-blue-400 mb-1">Backgrace Proxy</h4>
                                 <p className="text-xs text-blue-500/70">Powered by Gemini-3-Flash</p>
                               </div>
                               <div className="px-4 py-3 rounded-xl border border-slate-700 bg-slate-800 cursor-pointer hover:border-slate-500 transition-colors">
                                 <h4 className="font-bold text-slate-300 mb-1">Ollama Local</h4>
                                 <p className="text-xs text-slate-500">Llama3 / Qwen 本地军火库</p>
                               </div>
                               <div className="px-4 py-3 rounded-xl border border-slate-700 bg-slate-800 cursor-pointer hover:border-slate-500 transition-colors">
                                 <h4 className="font-bold text-slate-300 mb-1">DeepSeek Platform</h4>
                                 <p className="text-xs text-slate-500">DeepSeek-Coder V2</p>
                               </div>
                             </div>
                          </div>
                       </div>

                       {/* API Key 注入 */}
                       <div className="p-6 bg-slate-900 border border-slate-800 rounded-2xl shadow-xl flex items-start gap-6">
                          <div className="h-12 w-12 rounded-xl bg-emerald-500/20 flex items-center justify-center border border-emerald-500/30 shrink-0">
                             <Lock className="h-6 w-6 text-emerald-400" />
                          </div>
                          <div className="flex-1">
                             <h3 className="text-lg font-bold text-white mb-1">Backgrace API Token</h3>
                             <p className="text-sm text-slate-500 mb-4">填入您的中转凭证以打通网络流。</p>
                             <div className="flex gap-4">
                                <input 
                                  type="password" 
                                  value="sk-yRWWj3wDJfuUXhddTtdTb59ax9ExqC7DAgbpBt5Oe50yDFjK" 
                                  readOnly
                                  className="flex-1 bg-slate-950 border border-slate-700 rounded-xl px-4 py-2 text-white font-mono focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                                />
                                <button className="px-6 py-2 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl transition-colors">测试连通性</button>
                             </div>
                             <p className="text-xs text-emerald-500 mt-3 flex items-center gap-1.5"><ShieldCheck className="h-3 w-3" /> 连接正常，延迟 142ms</p>
                          </div>
                       </div>

                       {/* 推理参数滑动 */}
                       <div className="p-6 bg-slate-900 border border-slate-800 rounded-2xl shadow-xl flex items-start gap-6">
                          <div className="h-12 w-12 rounded-xl bg-orange-500/20 flex items-center justify-center border border-orange-500/30 shrink-0">
                             <Zap className="h-6 w-6 text-orange-400" />
                          </div>
                          <div className="flex-1">
                             <h3 className="text-lg font-bold text-white mb-1">创造力与发散阈值 (Temperature)</h3>
                             <p className="text-sm text-slate-500 mb-6">值越高，教案生成越天马行空；值越低，越严谨固执。</p>
                             
                             <div className="space-y-2">
                               <div className="flex justify-between text-xs font-bold text-slate-400">
                                 <span>绝对严谨 (0.0)</span>
                                 <span className="text-orange-400">当前: 0.70</span>
                                 <span>神经漫游 (1.0)</span>
                               </div>
                               <input type="range" min="0" max="100" defaultValue="70" className="w-full h-2 bg-slate-800 rounded-full appearance-none cursor-pointer accent-orange-500" />
                             </div>
                          </div>
                       </div>

                    </div>
                 </div>
               )}

               {activeTab !== "ai_models" && (
                 <div className="flex flex-col items-center justify-center h-96 text-center animate-in fade-in duration-500">
                    <Database className="h-20 w-20 text-slate-800 mb-6" />
                    <h2 className="text-2xl font-black text-white mb-2">此模块暂未开放</h2>
                    <p className="text-slate-500">需要更高权限的组织架构或版本更新。</p>
                 </div>
               )}

            </div>
         </div>
      </div>
    </div>
  );
}
