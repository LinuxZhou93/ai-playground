"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  BookOpen,
  CalendarDays,
  CheckCircle2,
  Receipt,
  Settings,
  ChevronLeft,
  ChevronRight,
  GraduationCap,
  CreditCard
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const menuItems = [
  { name: "教务看板", icon: LayoutDashboard, path: "/futureclass/dashboard", color: "text-blue-500" },
  { name: "学员管理", icon: Users, path: "/futureclass/students", color: "text-emerald-500" },
  { name: "日常点名", icon: CheckCircle2, path: "/futureclass/attendance", color: "text-orange-500" },
  { name: "课程库", icon: BookOpen, path: "/futureclass/courses", color: "text-indigo-500" },
  { name: "班级管理", icon: GraduationCap, path: "/futureclass/classes", color: "text-purple-500" },
  { name: "财务中心", icon: CreditCard, path: "/futureclass/finance", color: "text-amber-500" },
  { name: "系统设置", icon: Settings, path: "/futureclass/settings", color: "text-gray-500" },
];

export function ERPSidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div
      className={cn(
        "relative flex flex-col h-screen border-r bg-card transition-all duration-300",
        collapsed ? "w-20" : "w-64"
      )}
    >
      <div className="flex items-center gap-2 px-6 h-16 border-b overflow-hidden whitespace-nowrap">
        <GraduationCap className="h-8 w-8 text-emerald-500 shrink-0" />
        {!collapsed && (
          <span className="font-bold text-xl tracking-tight text-emerald-600">FutureClass</span>
        )}
      </div>

      <nav className="flex-1 overflow-y-auto p-3 space-y-1">
        {menuItems.map((item) => {
          const isActive = pathname === item.path;
          return (
            <Link key={item.path} href={item.path}>
              <div
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group mb-1",
                  isActive
                    ? "bg-emerald-500/10 text-emerald-600 font-bold shadow-sm"
                    : "text-muted-foreground hover:bg-emerald-500/5 hover:text-emerald-500"
                )}
              >
                <item.icon className={cn("h-5 w-5 shrink-0 transition-colors", isActive ? "text-emerald-500" : "text-muted-foreground group-hover:text-emerald-500")} />
                {!collapsed && <span className="text-sm">{item.name}</span>}
              </div>
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t flex items-center justify-center">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setCollapsed(!collapsed)}
          className="rounded-full hover:bg-accent"
        >
          {collapsed ? <ChevronRight className="h-5 w-5" /> : <ChevronLeft className="h-5 w-5" />}
        </Button>
      </div>
    </div>
  );
}
