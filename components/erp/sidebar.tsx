"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  BookOpen,
  CheckCircle2,
  GraduationCap,
  CreditCard,
  Settings,
  ChevronLeft,
  ChevronRight,
  Menu,
  X,
  AlertTriangle,
  Activity,
  Zap,
  Cpu,
  ShieldCheck,
  PackageOpen, // V3: 核心物料
  FileText, // V3: 家校互动档案
  CalendarDays, // V4: 智能排课日历
  Magnet, // V5: 招生线索漏斗
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "motion/react";

const menuItems = [
  { name: "教务看板", icon: LayoutDashboard, path: "/erp/dashboard" },
  { name: "学员管理", icon: Users, path: "/erp/students" },
  { name: "招生线索", icon: Magnet, path: "/erp/leads" },
  { name: "核心物料", icon: PackageOpen, path: "/erp/inventory" },
  { name: "家校通报告", icon: FileText, path: "/erp/reports" },
  { name: "日常点名", icon: CheckCircle2, path: "/erp/attendance" },
  { name: "课程库", icon: BookOpen, path: "/erp/courses" },
  { name: "班级管理", icon: GraduationCap, path: "/erp/classes" },
  { name: "排课日历", icon: CalendarDays, path: "/erp/schedules" },
  { name: "财务中心", icon: CreditCard, path: "/erp/finance" },
  { name: "系统设置", icon: Settings, path: "/erp/settings" },
];

export function ERPSidebar({ role = "ADMIN" }: { role?: string }) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = React.useState(false);
  const [mobileOpen, setMobileOpen] = React.useState(false);

  // 动态过滤菜单权限
  const filteredItems = React.useMemo(() => {
    return menuItems.filter(item => {
      if (role === "SALES" && ["/erp/schedules", "/erp/settings", "/erp/courses", "/erp/inventory", "/erp/attendance", "/erp/classes"].includes(item.path)) return false;
      if (role === "ACADEMIC" && ["/erp/finance", "/erp/settings", "/erp/leads"].includes(item.path)) return false; // 教务不看线索和财务
      if (role === "TEACHER" && ["/erp/finance", "/erp/settings", "/erp/leads", "/erp/inventory", "/erp/courses"].includes(item.path)) return false; // 教师专注于上课与排课
      return true;
    });
  }, [role]);
  // 路由变化时关闭移动端菜单
  React.useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  const sidebarContent = (isMobile: boolean) => (
    <div className="flex flex-col h-full bg-white/80 dark:bg-zinc-950/80 backdrop-blur-xl border-r border-zinc-200/50 dark:border-zinc-800/50 shadow-[1px_0_0_0_rgba(0,0,0,0.02)]">
      {/* Logo 区 - Linear 风格极简设计 */}
      <div className="flex items-center gap-3 px-6 h-20 border-b border-zinc-200/50 dark:border-zinc-800/50 overflow-hidden relative">
        <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-emerald-500/20 to-transparent" />
        
        <motion.div 
          whileHover={{ scale: 1.05, rotate: -5 }}
          whileTap={{ scale: 0.95 }}
          className="relative h-10 w-10 rounded-xl bg-zinc-900 dark:bg-zinc-100 flex items-center justify-center shadow-2xl shadow-emerald-500/20 group cursor-pointer overflow-hidden"
        >
          <GraduationCap className="h-5 w-5 text-white dark:text-zinc-900 relative z-10" />
          <motion.div 
            className="absolute inset-0 bg-gradient-to-tr from-emerald-500 to-teal-400 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
          />
        </motion.div>

        <AnimatePresence mode="wait">
          {(!collapsed || isMobile) && (
            <motion.div
              initial={{ opacity: 0, x: -10, filter: "blur(8px)" }}
              animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
              exit={{ opacity: 0, x: -10, filter: "blur(8px)" }}
              transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
              className="flex flex-col"
            >
              <span className="font-bold text-[15px] tracking-tight text-zinc-900 dark:text-zinc-100 leading-none">
                FutureClass
              </span>
              <div className="flex items-center gap-1.5 mt-1.5">
                <span className="h-1 w-1 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[9px] font-bold text-zinc-400 dark:text-zinc-500 tracking-[0.15em] uppercase">
                  Enterprise
                </span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {isMobile && (
          <Button 
            variant="ghost" 
            size="icon" 
            className="ml-auto rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors" 
            onClick={() => setMobileOpen(false)}
          >
            <X className="h-4 w-4 text-zinc-500" />
          </Button>
        )}
      </div>

      {/* 导航菜单 */}
      <nav className="flex-1 overflow-y-auto py-6 px-3 space-y-1.5 custom-scrollbar">
        
          {filteredItems.map((item) => {
            const isActive = pathname === item.path || pathname?.startsWith(item.path + "/");
            return (
              <Link key={item.path} href={item.path} className="block relative group">
                <motion.div 
                  className={cn(
                    "relative px-3.5 py-2.5 rounded-xl transition-all duration-300 flex items-center gap-3 overflow-hidden",
                    isActive ? "bg-zinc-100/80 dark:bg-zinc-900/80 shadow-sm" : "hover:bg-zinc-50 dark:hover:bg-zinc-900/40"
                  )}
                >
                  {/* Active Indicator Bar */}
                  {isActive && (
                    <motion.div
                      layoutId="active-bar"
                      className="absolute left-0 top-2 bottom-2 w-1 bg-emerald-500 rounded-full"
                      transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                    />
                  )}
                  
                  <item.icon
                    className={cn(
                      "h-[18px] w-[18px] shrink-0 relative z-10 transition-all duration-500",
                      isActive 
                        ? "text-emerald-600 dark:text-emerald-400 scale-110" 
                        : "text-zinc-400 group-hover:text-zinc-900 dark:group-hover:text-zinc-200"
                    )}
                  />
                  
                  <AnimatePresence mode="wait">
                    {(!collapsed || isMobile) && (
                      <motion.span
                        initial={{ opacity: 0, x: -4 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -4 }}
                        className={cn(
                          "text-[13px] font-medium relative z-10 tracking-tight transition-colors duration-300",
                          isActive 
                            ? "text-zinc-900 dark:text-zinc-100" 
                            : "text-zinc-500 group-hover:text-zinc-900 dark:group-hover:text-zinc-200"
                        )}
                      >
                        {item.name}
                      </motion.span>
                    )}
                  </AnimatePresence>

                  {isActive && (
                    <motion.div 
                      layoutId="active-glow"
                      className="absolute inset-0 bg-emerald-500/5 dark:bg-emerald-500/10 pointer-events-none"
                    />
                  )}
                </motion.div>
              </Link>
            );
          })}
        
      </nav>

      {/* 底部控制栏 */}
      <div className="p-4 border-t border-zinc-200/50 dark:border-zinc-800/50 flex flex-col items-center gap-4 bg-zinc-50/50 dark:bg-zinc-900/20">
        <AnimatePresence>
          {(!collapsed || isMobile) && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm"
            >
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.6)]" />
              <span className="text-[10px] text-zinc-500 dark:text-zinc-400 font-mono font-bold tracking-tight">
                v3.0.0
              </span>
            </motion.div>
          )}
        </AnimatePresence>
        
        {!isMobile && (
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setCollapsed(!collapsed)}
            className="h-9 w-9 rounded-xl hover:bg-white dark:hover:bg-zinc-800 hover:shadow-md transition-all duration-300 group"
          >
            <motion.div
              animate={{ rotate: collapsed ? 180 : 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
            >
              <ChevronLeft className="h-4 w-4 text-zinc-400 group-hover:text-zinc-900 dark:group-hover:text-zinc-100" />
            </motion.div>
          </Button>
        )}
      </div>
    </div>
  );

  return (
    <>
      {/* 移动端汉堡按钮 - 悬浮玻璃态 */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="fixed top-5 left-5 z-50 md:hidden p-3 rounded-2xl bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl border border-zinc-200 dark:border-zinc-800 shadow-xl"
        onClick={() => setMobileOpen(true)}
      >
        <Menu className="h-5 w-5 text-zinc-700 dark:text-zinc-300" />
      </motion.button>

      {/* 移动端抽屉覆盖层 */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-zinc-950/40 backdrop-blur-sm z-40 md:hidden"
              onClick={() => setMobileOpen(false)}
            />
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed top-0 left-0 z-50 w-[280px] h-screen bg-white dark:bg-zinc-950 flex flex-col md:hidden shadow-2xl"
            >
              {sidebarContent(true)}
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* 桌面端侧边栏 - 动态宽度与平滑阴影 */}
      <motion.div
        className={cn(
          "relative flex-col h-screen hidden md:flex z-30",
          "shadow-[20px_0_40px_-20px_rgba(0,0,0,0.05)]"
        )}
        animate={{ width: collapsed ? 88 : 280 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      >
        {sidebarContent(false)}
      </motion.div>
    </>
  );
}
