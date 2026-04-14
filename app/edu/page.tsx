import React from "react";
import { BrainCircuit, Cpu, LibraryBig, Activity, Sparkles, ArrowRight } from "lucide-react";
import { getCourses, getClasses, getInventoryItems } from "@/app/erp/actions";
import Link from "next/link";
import KnowledgeGraphClient from "./knowledge-graph-client";

// Server Component — 从 ERP 中台拉取真实数据
export default async function EduDashboard() {
  const [courses, classes, inventory] = await Promise.all([
    getCourses(),
    getClasses(),
    getInventoryItems(),
  ]);

  const totalLessons = courses.reduce((sum: number, c: any) => sum + (c.total_lessons || 0), 0);

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-6 duration-1000">
      <div>
        <h1 className="text-3xl font-black text-white tracking-tight flex items-center gap-3">
          <BrainCircuit className="h-8 w-8 text-blue-500" />
          科创教研中心 (FutureClass Educator Studio)
        </h1>
        <p className="text-slate-400 mt-2 text-sm font-medium tracking-wide">
          多智能体课程生成台 / 机器人搭建、电子、机械、编程 / AI 驱动引擎
        </p>
      </div>

      {/* 数据概览卡片 — 真实 ERP 数据 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { icon: LibraryBig, title: "已建课程", value: String(courses.length) },
          { icon: Activity, title: "运行中班级", value: String(classes.length) },
          { icon: Cpu, title: "库内元件与物料", value: String(inventory.length) },
          { icon: BrainCircuit, title: "总课时容量", value: String(totalLessons) },
        ].map((stat, i) => (
          <div 
            key={i} 
            className="p-6 rounded-3xl bg-slate-800/40 border border-slate-700/50 backdrop-blur-md relative overflow-hidden group hover:border-blue-500/50 transition-colors"
          >
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
               <stat.icon className="h-20 w-20 text-blue-400 -mr-6 -mt-6 transform rotate-12" />
            </div>
            <div className="relative z-10">
              <stat.icon className="h-6 w-6 text-blue-400 mb-4" />
              <div className="text-4xl font-black text-white tracking-tighter">{stat.value}</div>
              <div className="text-sm font-semibold text-slate-400 uppercase tracking-widest mt-1">{stat.title}</div>
            </div>
          </div>
        ))}
      </div>

      {/* 课程列表与快捷操作 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 rounded-3xl bg-slate-900 border border-slate-800 p-8">
           <h3 className="text-xl font-bold text-white mb-4">教务中台课程清单</h3>
           <div className="space-y-4">
              {courses.length === 0 ? (
                <p className="text-slate-500 text-sm py-8 text-center">暂无课程，请前往 AI 生成器创建</p>
              ) : (
                courses.slice(0, 5).map((course: any) => (
                  <div key={course.id} className="flex items-center justify-between p-4 rounded-2xl bg-slate-800/30 border border-slate-800 hover:bg-slate-800/80 transition-colors cursor-pointer">
                    <div className="flex items-center gap-4">
                       <div className="h-10 w-10 rounded-full bg-blue-900/40 flex items-center justify-center text-blue-400 border border-blue-500/20">
                          <Cpu className="h-5 w-5" />
                       </div>
                       <div>
                         <div className="text-white font-bold">{course.name}</div>
                         <div className="text-xs font-mono text-slate-500 mt-1">
                           {course.category || '综合'} · {course.total_lessons || 0} 课时 · {course.duration_min || 90} min/节
                         </div>
                       </div>
                    </div>
                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-400">
                      已就绪
                    </span>
                  </div>
                ))
              )}
              {courses.length > 5 && (
                <Link href="/edu/tuning-desk" className="block text-center text-xs text-blue-400 font-bold hover:text-blue-300 transition-colors pt-2">
                  查看全部 {courses.length} 门课程 <ArrowRight className="h-3 w-3 inline" />
                </Link>
              )}
           </div>
        </div>

        <div className="rounded-3xl bg-gradient-to-br from-blue-900/40 to-indigo-900/40 border border-blue-500/20 p-8 flex flex-col items-center justify-center text-center">
           <div className="h-16 w-16 rounded-2xl bg-blue-500 flex items-center justify-center shadow-lg shadow-blue-500/25 mb-6">
              <Sparkles className="h-8 w-8 text-white" />
           </div>
           <h3 className="text-xl font-bold text-white mb-2">新建一堂课</h3>
           <p className="text-slate-400 text-sm mb-6">AI 将自动生成完整 PPT 课件并可一键发布到教务中台。</p>
           <Link href="/edu/generator" className="px-6 py-3 rounded-full bg-blue-600 hover:bg-blue-500 text-white font-bold w-full transition-colors text-center block">
              启动 AI 课件引擎
           </Link>
        </div>
      </div>

      {/* 课程动态链路大盘：知识图谱 (P2-8) */}
      <div className="mt-12 pt-8 border-t border-slate-800">
         <KnowledgeGraphClient courses={courses} />
      </div>
    </div>
  );
}
