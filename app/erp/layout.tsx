import React from "react";
import { ERPSidebar } from "@/components/erp/sidebar";
import { Bell } from "lucide-react";
import { ThemeToggle } from "./ThemeToggle";
import { CommandPalette } from "@/components/erp/command-palette";
import { TopLoadingBar } from "@/components/erp/top-loading-bar";
import { DevAuthSwitcher } from "@/components/erp/auth-switcher";
import { cookies } from "next/headers";

export default async function ERPLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const role = cookieStore.get("X-FC-Role")?.value || "ADMIN";
  const campusName = cookieStore.get("X-FC-Campus-Name")?.value || "ALL";

  return (
    <div className="flex bg-background min-h-screen overflow-hidden">
      {/* V3: 全局顶部加载进度条 */}
      <TopLoadingBar />

      {/* 侧边栏 */}
      <ERPSidebar role={role} />

      {/* 主内容区域 */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* 顶部导航栏 — 极客悬浮毛玻璃 */}
        <header className="h-20 flex items-center justify-between px-6 sm:px-10 sticky top-0 z-20 bg-background/30 dark:bg-background/20 backdrop-blur-3xl border-b border-white/10 dark:border-white/5 shadow-sm">
          {/* 左侧：Cmd+K 全局指令面板 */}
          <div className="flex items-center gap-4 flex-1 pl-12 md:pl-0">
            <CommandPalette />
          </div>

          {/* 右侧：交互组件区 */}
          <div className="flex items-center gap-5 sm:gap-8">
            <DevAuthSwitcher />
            <div className="h-4 w-[1px] bg-zinc-200 dark:bg-zinc-800 hidden sm:block" />

            <div className="flex items-center gap-3">
              <ThemeToggle />
              <button className="relative p-2.5 text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-full transition-all">
                <Bell className="h-5 w-5" />
                <span className="absolute top-2 right-2.5 h-2 w-2 bg-red-500 rounded-full border-2 border-white dark:border-zinc-950 animate-pulse" />
              </button>
            </div>
            
            <div className="h-8 w-[1px] bg-zinc-200 dark:bg-zinc-800 hidden sm:block" />
            
            <div className="flex items-center gap-4 pl-2 cursor-pointer group">
              <div className="flex-col items-end hidden sm:flex">
                <span className="text-[13px] font-black tracking-tight text-zinc-900 dark:text-zinc-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">Zhou Lin</span>
                <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mt-0.5">{role} / {campusName === 'ALL' ? '总部' : campusName}</span>
              </div>
              <div className="relative">
                <div className="absolute -inset-1.5 bg-gradient-to-br from-indigo-500 to-cyan-400 rounded-full blur-md opacity-0 group-hover:opacity-40 transition-opacity duration-500" />
                <div className="relative h-11 w-11 rounded-full bg-zinc-900 dark:bg-zinc-50 flex items-center justify-center text-white dark:text-zinc-900 text-base font-black shadow-lg shadow-zinc-200 dark:shadow-none ring-2 ring-white dark:ring-zinc-950">
                  Z
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* 内容区 */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-8 bg-zinc-50/50 dark:bg-[#0a0a0b] relative">
          <div className="absolute top-0 inset-x-0 h-[500px] bg-gradient-to-b from-white to-transparent dark:from-zinc-900/20 dark:to-transparent pointer-events-none" />
          <div className="relative z-10 max-w-[1600px] mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
