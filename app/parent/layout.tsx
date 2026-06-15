import React from "react";

export default function ParentLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 font-sans selection:bg-indigo-500/30 selection:text-indigo-900 overflow-x-hidden">
      {/* 
        面向 C 端家长的 UI 抛弃了 B 端沉重的左侧边栏。
        这里预留全部空间给手机屏幕。
      */}
      <main className="w-full max-w-md mx-auto min-h-screen bg-white dark:bg-zinc-950 shadow-2xl relative shadow-zinc-200/50 dark:shadow-none border-x border-zinc-100 dark:border-zinc-900">
        {children}
      </main>
    </div>
  );
}
