import React from "react";
import { EduSidebar } from "@/components/edu/sidebar";
import { Bell, Search } from "lucide-react";
import { ThemeToggle } from "@/app/erp/ThemeToggle";
import { TopLoadingBar } from "@/components/erp/top-loading-bar";
import { DevAuthSwitcher } from "@/components/erp/auth-switcher";

export default function EduLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex bg-[#0f172a] min-h-screen overflow-hidden dark text-slate-100">
      {/* 全局顶部加载进度条 */}
      <TopLoadingBar />

      {/* 专用教研侧边栏 */}
      <EduSidebar />

      {/* 主内容区域 */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* 顶部导航栏 — 深色科创极客悬浮毛玻璃 */}
        <header className="h-20 flex items-center justify-between px-6 sm:px-10 sticky top-0 z-20 bg-[#0f172a]/70 backdrop-blur-2xl border-b border-indigo-500/20 shadow-lg shadow-black/20">
          
          <div className="flex items-center gap-4 flex-1 pl-12 md:pl-0">
             <div className="relative group hidden sm:flex items-center">
                <Search className="absolute left-3 text-slate-400 h-4 w-4" />
                <input 
                  type="text" 
                  placeholder="搜索教案、课件模型或素材..." 
                  className="bg-slate-800/50 border border-slate-700 rounded-full pl-10 pr-4 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 w-64 transition-all"
                />
             </div>
          </div>

          {/* 右侧：交互组件区 */}
          <div className="flex items-center gap-5 sm:gap-8">
            <DevAuthSwitcher />
            <div className="h-4 w-[1px] bg-slate-700 hidden sm:block" />

            <div className="flex items-center gap-3">
              <ThemeToggle />
              <button className="relative p-2.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-full transition-all">
                <Bell className="h-5 w-5" />
                <span className="absolute top-2 right-2.5 h-2 w-2 bg-blue-500 rounded-full shadow-[0_0_8px_rgba(59,130,246,0.8)] animate-pulse" />
              </button>
            </div>
            
            <div className="h-8 w-[1px] bg-slate-700 hidden sm:block" />
            
            <div className="flex items-center gap-4 pl-2 cursor-pointer group">
              <div className="flex-col items-end hidden sm:flex">
                <span className="text-[13px] font-black tracking-tight text-white group-hover:text-blue-400 transition-colors">T. Zhou</span>
                <span className="text-[10px] font-bold text-blue-500 uppercase tracking-widest mt-0.5">HEAD OF R&D</span>
              </div>
              <div className="relative">
                <div className="absolute -inset-1 bg-gradient-to-br from-blue-600 to-indigo-500 rounded-full blur opacity-70 group-hover:opacity-100 transition-opacity" />
                <div className="relative h-10 w-10 rounded-full bg-slate-900 border border-slate-700 flex items-center justify-center text-white text-sm font-bold">
                  TZ
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* 内容区 */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-8 bg-[#0a0f1c] relative z-0 custom-scrollbar">
          {/* 背景光晕装饰 */}
          <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[120px] pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-[600px] h-[400px] bg-indigo-600/5 rounded-full blur-[100px] pointer-events-none" />
          
          <div className="relative z-10 max-w-[1600px] mx-auto min-h-full">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
