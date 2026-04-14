export const dynamic = "force-dynamic";

import React from "react";
import { BrainCircuit, Cpu, LibraryBig, Activity, Sparkles, ArrowRight, Settings, Terminal, Bot, Zap, Plus, CircleDot } from "lucide-react";
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
        <div className="lg:col-span-2 rounded-3xl bg-slate-900 border border-slate-800 p-8 shadow-xl">
           <div className="flex items-center justify-between mb-6 border-b border-slate-800 pb-4">
             <h3 className="text-xl font-bold text-white flex items-center gap-2">
               <LibraryBig className="h-5 w-5 text-indigo-400" /> 
               专项教研开发库 (R&D Modules)
             </h3>
             <span className="text-xs font-bold text-slate-400 bg-slate-800 px-3 py-1 rounded-full border border-slate-700">6 大核心课程流</span>
           </div>
           
           <div className="space-y-6">
              {[
                { key: 'mech', name: "机械工程", icon: Settings, color: "text-slate-400", bg: "bg-slate-800/40 border-slate-700", fill: "bg-slate-900/50", match: ['机械', '硬件'] },
                { key: 'elec', name: "电子信息工程", icon: Zap, color: "text-amber-400", bg: "bg-amber-900/20 border-amber-500/20", fill: "bg-amber-950/20", match: ['电子', '电路', 'Arduino', '硬件'] },
                { key: 'cs', name: "计算机科学与软件编程", icon: Terminal, color: "text-blue-400", bg: "bg-blue-900/20 border-blue-500/20", fill: "bg-blue-950/20", match: ['编程', '代码', 'Python', 'C++'] },
                { key: 'ai', name: "人工智能与具身智能", icon: BrainCircuit, color: "text-purple-400", bg: "bg-purple-900/20 border-purple-500/20", fill: "bg-purple-950/20", match: ['AI', '人工智能', '模型'] },
                { key: 'vex', name: "VEX 国际竞赛机器人", icon: Bot, color: "text-emerald-400", bg: "bg-emerald-900/20 border-emerald-500/20", fill: "bg-emerald-950/20", match: ['VEX', '机器人', 'Bot'] },
                { key: 'steam', name: "STEAM 综合科学", icon: LibraryBig, color: "text-indigo-400", bg: "bg-indigo-900/20 border-indigo-500/20", fill: "bg-indigo-950/20", match: ['STEAM', '科学', '综合', '科普'] }
              ].map((mod) => {
                // Filter matching courses or randomly assign unassigned ones for visual fullness
                const modCourses = courses.filter((c: any) => {
                   const searchStr = `${c.name || ''} ${c.category || ''}`.toLowerCase();
                   return mod.match.some(m => searchStr.includes(m.toLowerCase()));
                });
                
                return (
                  <div key={mod.key} className={`border rounded-2xl overflow-hidden transition-all hover:shadow-lg ${mod.bg}`}>
                    <div className="px-4 py-3 border-b border-inherit flex items-center justify-between bg-black/20">
                      <div className="flex items-center gap-3">
                        <mod.icon className={`h-5 w-5 ${mod.color}`} />
                        <span className="font-bold text-slate-200 tracking-wide">{mod.name}</span>
                        <span className="text-[10px] font-black text-slate-500 px-2 py-0.5 rounded bg-black/40 border border-slate-800/50">
                          {modCourses.length} TASKS
                        </span>
                      </div>
                      <Link href="/edu/generator" className={`text-xs ${mod.color} hover:opacity-70 font-bold flex items-center gap-1 transition-opacity`}>
                        <Plus className="h-3 w-3" /> 新设课题
                      </Link>
                    </div>
                    
                    <div className={`p-4 space-y-3 ${mod.fill}`}>
                      {modCourses.length === 0 ? (
                        <div className="text-center py-6 text-slate-600 text-sm italic">当前分支尚未规划核心课研任务...</div>
                      ) : (
                        modCourses.map((course: any, index: number) => {
                           // 随机分配一个研发状态作为演示交互
                           const statusDice = course.id % 3;
                           const statusRender = statusDice === 0 
                             ? <span className="px-2 py-1 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 text-[10px] font-bold flex items-center gap-1"><CircleDot className="h-3 w-3" /> 大纲推演中</span>
                             : statusDice === 1 
                             ? <span className="px-2 py-1 rounded bg-amber-500/10 text-amber-500 border border-amber-500/20 text-[10px] font-bold flex items-center gap-1"><CircleDot className="h-3 w-3" /> 内容精调中</span>
                             : <span className="px-2 py-1 rounded bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 text-[10px] font-bold flex items-center gap-1"><CircleDot className="h-3 w-3" /> 就绪发布服</span>
                           
                           return (
                             <div key={course.id} id={`agent-course-${course.id}`} data-agent-target="true" data-agent-desc={`[${mod.name}] 分组下的课程：${course.name}`} className="group flex flex-col md:flex-row md:items-center justify-between p-3 rounded-xl bg-black/20 border border-transparent hover:border-slate-700 hover:bg-black/40 transition-all cursor-pointer">
                               <div className="flex items-center gap-3 mb-2 md:mb-0">
                                  <div className={`w-1.5 h-1.5 rounded-full ${mod.color.replace('text-', 'bg-')} opacity-50 group-hover:opacity-100 transition-opacity`} />
                                  <div>
                                    <div className="text-slate-200 font-bold text-sm">{course.name}</div>
                                    <div className="text-xs font-mono text-slate-500 mt-1">
                                      {course.category || '综合选修'} · 核心 {course.total_lessons || 0} 讲
                                    </div>
                                  </div>
                               </div>
                               <div className="flex items-center gap-3">
                                  {statusRender}
                                  <div className="text-[10px] text-slate-600 font-mono hidden md:block">ID: #{course.id}</div>
                               </div>
                             </div>
                           )
                        })
                      )}
                    </div>
                  </div>
                )
              })}
           </div>
        </div>

        <div className="rounded-3xl bg-gradient-to-br from-blue-900/40 to-indigo-900/40 border border-blue-500/20 p-8 flex flex-col items-center justify-center text-center">
           <div className="h-16 w-16 rounded-2xl bg-blue-500 flex items-center justify-center shadow-lg shadow-blue-500/25 mb-6">
              <Sparkles className="h-8 w-8 text-white" />
           </div>
           <h3 className="text-xl font-bold text-white mb-2">新建一堂课</h3>
           <p className="text-slate-400 text-sm mb-6">AI 将自动生成完整 PPT 课件并可一键发布到教务中台。</p>
           <Link id="agent-btn-generator" data-agent-target="true" data-agent-desc="创建新课件模块按钮（偏页面右侧区域）" href="/edu/generator" className="px-6 py-3 rounded-full bg-blue-600 hover:bg-blue-500 text-white font-bold w-full transition-colors text-center block">
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
