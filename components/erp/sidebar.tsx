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
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "motion/react";
import { getDashboardStats } from "@/app/futureclass/actions";

const menuItems = [
  { name: "教务看板", icon: LayoutDashboard, path: "/futureclass/dashboard" },
  { name: "学员管理", icon: Users, path: "/futureclass/students" },
  { name: "核心物料", icon: PackageOpen, path: "/futureclass/inventory" },
  { name: "家校通报告", icon: FileText, path: "/futureclass/reports" },
  { name: "日常点名", icon: CheckCircle2, path: "/futureclass/attendance" },
  { name: "课程库", icon: BookOpen, path: "/futureclass/courses" },
  { name: "班级管理", icon: GraduationCap, path: "/futureclass/classes" },
  { name: "财务中心", icon: CreditCard, path: "/futureclass/finance" },
  { name: "系统设置", icon: Settings, path: "/futureclass/settings" },
];

export function ERPSidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = React.useState(false);
  const [mobileOpen, setMobileOpen] = React.useState(false);

  // V3: KPI 微组件 — 5 分钟缓存避免频繁 Server Action
  const [kpi, setKpi] = React.useState<{ studentCount: number; warningCount: number } | null>(null);
  React.useEffect(() => {
    const CACHE_KEY = '__erp_sidebar_kpi';
    const CACHE_TTL = 5 * 60 * 1000; // 5 分钟
    try {
      const cached = sessionStorage.getItem(CACHE_KEY);
      if (cached) {
        const { data, ts } = JSON.parse(cached);
        if (Date.now() - ts < CACHE_TTL) {
          setKpi(data);
          return; // 命中缓存，不请求
        }
      }
    } catch {}
    getDashboardStats().then(data => {
      setKpi(data);
      try { sessionStorage.setItem(CACHE_KEY, JSON.stringify({ data, ts: Date.now() })); } catch {}
    }).catch(() => {});
  }, []);

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
        
          {menuItems.map((item) => {
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

      {/* V2.5: AI 引擎运行状态监控区 - 极客玻璃拟物化 */}
      <AnimatePresence>
        {(!collapsed || isMobile) && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="mx-3 mb-4"
          >
            <div className="group relative rounded-2xl p-4 overflow-hidden bg-zinc-900 dark:bg-zinc-900/60 border border-zinc-800 shadow-2xl">
              <div className="absolute top-0 right-0 p-3 opacity-20 group-hover:opacity-40 transition-all duration-1000 group-hover:rotate-12 group-hover:scale-125">
                <Cpu className="h-12 w-12 text-emerald-500" />
              </div>
              
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                    </div>
                    <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Titan Core</span>
                  </div>
                  <ShieldCheck className="h-3 w-3 text-emerald-500/50" />
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between items-end">
                    <p className="text-[12px] font-medium text-zinc-100 tracking-tight">Neural Processing</p>
                    <span className="text-[10px] font-mono text-emerald-400">98.2%</span>
                  </div>
                  <div className="h-1 w-full bg-zinc-800 rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: "98.2%" }}
                      transition={{ duration: 1.5, ease: "circOut" }}
                      className="h-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"
                    />
                  </div>
                  <div className="flex items-center gap-2 bg-black/40 rounded-lg px-2 py-1.5 border border-white/5">
                    <Activity className="h-3 w-3 text-zinc-500 shrink-0" />
                    <p className="text-[9px] text-zinc-400 truncate font-mono">
                      L-Stream: Stable
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* V2.1: KPI 微组件 - 数字化看板风格 */}
      <AnimatePresence>
        {(!collapsed || isMobile) && kpi && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mx-3 mb-6 grid grid-cols-2 gap-2"
          >
            <div className="bg-zinc-50 dark:bg-zinc-900/40 border border-zinc-200/50 dark:border-zinc-800/50 p-3 rounded-2xl group hover:border-emerald-500/30 transition-all duration-300">
              <p className="text-[9px] text-zinc-400 font-bold mb-1 uppercase tracking-widest">Students</p>
              <div className="flex items-baseline gap-1">
                <p className="text-lg font-bold text-zinc-900 dark:text-zinc-100 font-mono tracking-tighter tabular-nums">
                  {kpi.studentCount.toLocaleString()}
                </p>
              </div>
            </div>
            <div className="bg-zinc-50 dark:bg-zinc-900/40 border border-zinc-200/50 dark:border-zinc-800/50 p-3 rounded-2xl group hover:border-rose-500/30 transition-all duration-300">
              <p className="text-[9px] text-zinc-400 font-bold mb-1 uppercase tracking-widest">Alerts</p>
              <div className="flex items-center gap-1.5">
                <p className={cn(
                  "text-lg font-bold font-mono tracking-tighter tabular-nums",
                  kpi.warningCount > 0 ? "text-rose-500" : "text-emerald-500"
                )}>
                  {kpi.warningCount}
                </p>
                {kpi.warningCount > 0 && (
                  <span className="flex h-1.5 w-1.5 rounded-full bg-rose-500 animate-pulse" />
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

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
