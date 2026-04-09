import React from "react";
import { ERPSidebar } from "@/components/erp/sidebar";
import { Bell, Search, UserCircle } from "lucide-react";
import { Input } from "@/components/ui/input";

export default function ERPLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex bg-background min-h-screen overflow-hidden">
      {/* 侧边栏 */}
      <ERPSidebar />

      {/* 主内中心区域 */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* 顶部导航栏 */}
        <header className="h-16 border-b flex items-center justify-between px-8 bg-card sticky top-0 z-10">
          <div className="flex items-center gap-4 w-1/3">
            <div className="relative w-full max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="快速搜索学员/排课..."
                className="pl-10 bg-muted/30 border-none focus-visible:ring-emerald-500"
              />
            </div>
          </div>

          <div className="flex items-center gap-6">
            <button className="relative p-2 text-muted-foreground hover:text-foreground transition-colors">
              <Bell className="h-5 w-5" />
              <span className="absolute top-1.5 right-1.5 h-2 w-2 bg-red-500 rounded-full border-2 border-card" />
            </button>
            <div className="h-8 w-px bg-border sm:block hidden" />
            <div className="flex items-center gap-3">
              <div className="flex flex-col items-end sm:flex hidden">
                <span className="text-sm font-medium">Zhou Lin</span>
                <span className="text-xs text-muted-foreground">校长/Admin</span>
              </div>
              <UserCircle className="h-9 w-9 text-muted-foreground" />
            </div>
          </div>
        </header>

        {/* 内容区 */}
        <main className="flex-1 overflow-y-auto p-8 bg-muted/10">
          {children}
        </main>
      </div>
    </div>
  );
}
