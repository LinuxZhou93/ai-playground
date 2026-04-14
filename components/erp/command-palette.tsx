"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Search, Monitor, Terminal, Users, BookOpen, UserPlus, CreditCard, Command, ArrowRight } from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { motion, AnimatePresence } from "motion/react";
import { cn } from "@/lib/utils";

export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const router = useRouter();

  // 监听 Cmd+K
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  const commands = [
    { id: "nav-dash", category: "导航", name: "教务看板", icon: <Monitor className="w-4 h-4" />, action: () => router.push("/erp/dashboard") },
    { id: "nav-students", category: "导航", name: "学员管理", icon: <Users className="w-4 h-4" />, action: () => router.push("/erp/students") },
    { id: "nav-courses", category: "导航", name: "课程库", icon: <BookOpen className="w-4 h-4" />, action: () => router.push("/erp/courses") },
    { id: "nav-finance", category: "导航", name: "财务概览", icon: <CreditCard className="w-4 h-4" />, action: () => router.push("/erp/finance") },
    { id: "action-add-student", category: "快捷动作", name: "快速录入学员", icon: <UserPlus className="w-4 h-4" />, action: () => router.push("/erp/students") },
    { id: "action-mark", category: "快捷动作", name: "极速点名", icon: <Terminal className="w-4 h-4" />, action: () => router.push("/erp/attendance") },
  ];

  const filteredCommands = search 
    ? commands.filter(c => c.name.toLowerCase().includes(search.toLowerCase()) || c.category.includes(search))
    : commands;

  const handleSelect = (action: () => void) => {
    setOpen(false);
    action();
  };

  const categories = Array.from(new Set(filteredCommands.map(c => c.category)));

  return (
    <>
      <button 
        onClick={() => setOpen(true)}
        className={cn(
          "group hidden md:flex items-center gap-3 px-4 py-2 text-sm transition-all duration-300",
          "bg-zinc-100/50 dark:bg-zinc-900/50 hover:bg-white dark:hover:bg-zinc-800",
          "border border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700",
          "rounded-2xl shadow-[0_2px_10px_-3px_rgba(0,0,0,0.07)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.12)]",
          "backdrop-blur-md"
        )}
      >
        <Search className="w-4 h-4 text-zinc-400 group-hover:text-zinc-600 dark:group-hover:text-zinc-300 transition-colors" />
        <span className="text-zinc-500 dark:text-zinc-400 font-medium">搜索与快速指令...</span>
        <div className="ml-8 flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-zinc-200/50 dark:bg-zinc-800/50 border border-zinc-300/50 dark:border-zinc-700/50">
          <Command className="w-3 h-3 text-zinc-500" />
          <span className="text-[10px] font-bold text-zinc-500">K</span>
        </div>
      </button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="p-0 overflow-hidden border-zinc-200/50 dark:border-zinc-800/50 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-2xl shadow-[0_0_50px_-12px_rgba(0,0,0,0.5)] max-w-2xl rounded-3xl">
          <div className="relative flex items-center px-6 py-5 border-b border-zinc-200/50 dark:border-zinc-800/50">
            <Search className="w-5 h-5 text-zinc-400 mr-4" />
            <input
              autoFocus
              className="flex-1 bg-transparent border-none outline-none text-lg font-medium text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400/60"
              placeholder="你想去哪里？"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400 border-none px-2 py-0.5 text-[10px] font-bold">ESC</Badge>
            </div>
          </div>

          <div className="max-h-[420px] overflow-y-auto p-3 scrollbar-none">
            <AnimatePresence mode="popLayout">
              {filteredCommands.length === 0 ? (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="py-20 text-center"
                >
                  <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-zinc-100 dark:bg-zinc-900 mb-4">
                    <Search className="w-6 h-6 text-zinc-300" />
                  </div>
                  <p className="text-zinc-500 text-sm font-medium">未找到相关指令，换个关键词试试？</p>
                </motion.div>
              ) : (
                <div className="space-y-6 py-2 px-1">
                  {categories.map((category) => (
                    <div key={category}>
                      <h3 className="px-4 mb-2 text-[11px] font-bold uppercase tracking-widest text-zinc-400/80">
                        {category}
                      </h3>
                      <div className="space-y-1">
                        {filteredCommands
                          .filter((c) => c.category === category)
                          .map((cmd, idx) => (
                            <motion.button
                              key={cmd.id}
                              initial={{ opacity: 0, x: -10 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: idx * 0.03 }}
                              onClick={() => handleSelect(cmd.action)}
                              className={cn(
                                "group w-full flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-200",
                                "hover:bg-zinc-900/5 dark:hover:bg-white/5",
                                "relative overflow-hidden"
                              )}
                            >
                              <div className={cn(
                                "flex items-center justify-center w-9 h-9 rounded-lg transition-all duration-300",
                                "bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800",
                                "group-hover:scale-110 group-hover:shadow-lg group-hover:border-zinc-300 dark:group-hover:border-zinc-600",
                                "text-zinc-500 dark:text-zinc-400 group-hover:text-zinc-900 dark:group-hover:text-zinc-100"
                              )}>
                                {cmd.icon}
                              </div>
                              
                              <div className="flex flex-col items-start flex-1">
                                <span className="text-sm font-semibold text-zinc-700 dark:text-zinc-200 group-hover:text-zinc-900 dark:group-hover:text-white transition-colors">
                                  {cmd.name}
                                </span>
                                <span className="text-[11px] text-zinc-400 font-medium">
                                  {category} · 快速跳转
                                </span>
                              </div>

                              <div className="opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-2 group-hover:translate-x-0">
                                <ArrowRight className="w-4 h-4 text-zinc-400" />
                              </div>
                            </motion.button>
                          ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </AnimatePresence>
          </div>

          <div className="px-6 py-3 border-t border-zinc-200/50 dark:border-zinc-800/50 bg-zinc-50/50 dark:bg-zinc-900/30 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1.5">
                <kbd className="px-1.5 py-0.5 rounded border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-[10px] font-bold text-zinc-500 shadow-sm">↑↓</kbd>
                <span className="text-[11px] text-zinc-400 font-medium">选择</span>
              </div>
              <div className="flex items-center gap-1.5">
                <kbd className="px-1.5 py-0.5 rounded border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-[10px] font-bold text-zinc-500 shadow-sm">Enter</kbd>
                <span className="text-[11px] text-zinc-400 font-medium">确认</span>
              </div>
            </div>
            <div className="text-[11px] font-medium text-zinc-400/60">
              FutureClass ERP v3.0
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

