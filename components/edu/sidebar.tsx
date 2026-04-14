"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Cpu,
  MonitorPlay,
  Settings,
  ChevronLeft,
  ChevronRight,
  Menu,
  X,
  FileBox,
  BrainCircuit,
  Wrench,
  Blocks, // 机器人积木
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "motion/react";

const menuItems = [
  { name: "教研总览", icon: LayoutDashboard, path: "/edu" },
  { name: "AI 智能生成器", icon: BrainCircuit, path: "/edu/generator" },
  { name: "剧本微调台", icon: MonitorPlay, path: "/edu/tuning-desk" },
  { name: "组件素材库", icon: FileBox, path: "/edu/vault" },
  { name: "WOW CREATOR", icon: Cpu, path: "/edu/labs" },
  { name: "系统集控", icon: Settings, path: "/edu/settings" },
];

export function EduSidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = React.useState(false);
  const [mobileOpen, setMobileOpen] = React.useState(false);

  // 路由变化时关闭移动端菜单
  React.useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  const sidebarContent = (isMobile: boolean) => (
    <div className="flex flex-col h-full bg-slate-900/95 dark:bg-zinc-950/95 backdrop-blur-xl border-r border-slate-700/50 shadow-2xl">
      {/* Logo 区 - 极客风设计 */}
      <div className="flex items-center gap-3 px-6 h-20 border-b border-slate-800 overflow-hidden relative">
        <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-blue-500/50 to-transparent" />
        
        <motion.div 
          whileHover={{ scale: 1.05, rotate: 180 }}
          whileTap={{ scale: 0.95 }}
          transition={{ duration: 0.5 }}
          className="relative h-10 w-10 rounded-xl bg-blue-900/50 flex items-center justify-center shadow-lg shadow-blue-500/20 group cursor-pointer overflow-hidden border border-blue-500/30"
        >
          <Blocks className="h-5 w-5 text-blue-400 relative z-10" />
        </motion.div>

        <AnimatePresence mode="wait">
          {(!collapsed || isMobile) && (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              className="flex flex-col"
            >
              <span className="font-bold text-[15px] tracking-tight text-white leading-none">
                FutureClass
              </span>
              <div className="flex items-center gap-1.5 mt-1.5">
                <span className="h-1 w-1 rounded-full bg-blue-500 animate-pulse" />
                <span className="text-[9px] font-bold text-slate-400 tracking-[0.1em] uppercase">
                  Educator Studio
                </span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {isMobile && (
          <Button 
            variant="ghost" 
            size="icon" 
            className="ml-auto rounded-full text-slate-300 hover:bg-slate-800" 
            onClick={() => setMobileOpen(false)}
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* 导航菜单 */}
      <nav className="flex-1 overflow-y-auto py-6 px-3 space-y-2 custom-scrollbar">
          {menuItems.map((item) => {
            const isActive = pathname === item.path || (item.path !== '/edu' && pathname?.startsWith(item.path + "/"));
            return (
              <Link key={item.path} href={item.path} className="block relative group">
                <motion.div 
                  className={cn(
                    "relative px-3.5 py-3 rounded-xl transition-all duration-300 flex items-center gap-3 overflow-hidden",
                    isActive ? "bg-blue-600/20 shadow-inner border border-blue-500/30" : "hover:bg-slate-800/60 border border-transparent"
                  )}
                >
                  {/* Active Indicator Bar */}
                  {isActive && (
                    <motion.div
                      layoutId="edu-active-bar"
                      className="absolute left-0 top-2 bottom-2 w-1 bg-blue-500 rounded-r-full shadow-[0_0_8px_rgba(59,130,246,0.8)]"
                      transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                    />
                  )}
                  
                  <item.icon
                    className={cn(
                      "h-[18px] w-[18px] shrink-0 relative z-10 transition-all duration-500",
                      isActive 
                        ? "text-blue-400 scale-110" 
                        : "text-slate-500 group-hover:text-slate-300"
                    )}
                  />
                  
                  <AnimatePresence mode="wait">
                    {(!collapsed || isMobile) && (
                      <motion.span
                        initial={{ opacity: 0, x: -4 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -4 }}
                        className={cn(
                          "text-[13px] font-medium relative z-10 tracking-wide transition-colors duration-300",
                          isActive 
                            ? "text-white" 
                            : "text-slate-400 group-hover:text-slate-200"
                        )}
                      >
                        {item.name}
                      </motion.span>
                    )}
                  </AnimatePresence>

                  {isActive && (
                    <motion.div 
                      layoutId="edu-active-glow"
                      className="absolute inset-0 bg-blue-500/5 pointer-events-none"
                    />
                  )}
                </motion.div>
              </Link>
            );
          })}
      </nav>

      {/* 底部控制栏 */}
      <div className="p-4 border-t border-slate-800 flex flex-col items-center gap-3">
        {!isMobile && (
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setCollapsed(!collapsed)}
            className="h-10 w-10 border border-slate-700 bg-slate-800 rounded-xl hover:bg-slate-700 text-slate-300 transition-all duration-300"
          >
            <motion.div animate={{ rotate: collapsed ? 180 : 0 }}>
              <ChevronLeft className="h-4 w-4" />
            </motion.div>
          </Button>
        )}
      </div>
    </div>
  );

  return (
    <>
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="fixed top-5 left-5 z-50 md:hidden p-3 rounded-2xl bg-slate-900 border border-slate-700 text-white shadow-xl"
        onClick={() => setMobileOpen(true)}
      >
        <Menu className="h-5 w-5" />
      </motion.button>

      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden"
              onClick={() => setMobileOpen(false)}
            />
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed top-0 left-0 z-50 w-[280px] h-screen flex flex-col md:hidden"
            >
              {sidebarContent(true)}
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <motion.div
        className="relative flex-col h-screen hidden md:flex z-30 shadow-[20px_0_40px_-20px_rgba(0,0,0,0.5)]"
        animate={{ width: collapsed ? 88 : 260 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      >
        {sidebarContent(false)}
      </motion.div>
    </>
  );
}
