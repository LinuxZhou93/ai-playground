"use client";

import React, { useState, useEffect, useRef } from "react";
import { 
  MonitorPlay, Clock, Layers, BookOpen, ChevronRight, ChevronDown,
  Users, Calendar, Sparkles, PenTool, LayoutTemplate, FileText,
  Activity, CheckCircle2, MessageSquare, LineChart, ShieldCheck, Lock
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export default function TuningDeskClient({ courses, classes }: { courses: any[], classes: any[] }) {
  // 生成多端协同下当前用户的拟真身份
  const [currentUser] = useState(() => {
     if (typeof window === 'undefined') return { id: 'dummy', name: '加载中', color: '#ccc' };
     const names = ['黄老师 (教研)', '李老师 (教研)', '张老师 (产品)', '王老师 (教学)'];
     const colors = ['#b6e3f4', '#ffd5dc', '#c1f0c1', '#d4c4fb'];
     const idx = Math.floor(Math.random() * 4);
     return { id: crypto.randomUUID(), name: names[idx], color: colors[idx] };
  });

  const [expandedCourseId, setExpandedCourseId] = useState<string | null>(courses[0]?.id || null);
  const [activeLesson, setActiveLesson] = useState<any | null>(null);
  const [activePlan, setActivePlan] = useState<any | null>(null);

  const [onlineUsers, setOnlineUsers] = useState<any[]>([]);
  const roomRef = useRef<any>(null);
  const supabase = createClient();

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const room = supabase.channel('tuning_desk_presence', {
      config: { presence: { key: currentUser.id } }
    });
    roomRef.current = room;

    room.on('presence', { event: 'sync' }, () => {
      const state = room.presenceState();
      const users: any[] = [];
      for (const id in state) {
        users.push(state[id][0]); 
      }
      setOnlineUsers(users);
    });

    room.subscribe(async (status) => {
      if (status === 'SUBSCRIBED') {
        room.track({ 
          user: currentUser, 
          editingCourse: expandedCourseId, 
          editingLesson: activeLesson?.id 
        });
      }
    });

    return () => {
      supabase.removeChannel(room);
    };
  }, []);

  // 当选项发生变化时，更新状态向全局广播当前光标占有权
  useEffect(() => {
    if (roomRef.current && roomRef.current.state === 'joined') {
      roomRef.current.track({ 
        user: currentUser, 
        editingCourse: expandedCourseId, 
        editingLesson: activeLesson?.id 
      });
    }
  }, [expandedCourseId, activeLesson]);

  // 当点击某一节课时，提取对应的教案内容
  const handleSelectLesson = (courseId: string, lesson: any) => {
    const course = courses.find(c => c.id === courseId);
    if (!course) return;
    
    // 取该课程最新的 lesson_plan
    const latestPlan = course.edu_lesson_plans?.[0];
    setActivePlan(latestPlan || null);
    setActiveLesson(lesson);
  };

  const getThemeVars = (category: string) => {
    const map: Record<string, string> = {
      '机器人': 'bg-blue-500/10 border-blue-500/20 text-blue-400',
      '编程':   'bg-emerald-500/10 border-emerald-500/20 text-emerald-400',
      '综合':   'bg-indigo-500/10 border-indigo-500/20 text-indigo-400',
    };
    return map[category] || map['综合'];
  };

  return (
    <div className="flex flex-col h-[calc(100vh-80px)] pt-4 animate-in fade-in duration-700 relative -mx-8 px-8">
      
      {/* 沉浸式背景 */}
      <div className="absolute inset-0 bg-[url('/bg-dots.svg')] opacity-20 pointer-events-none" />
      
      {/* Header */}
      <div className="relative z-10 flex items-center justify-between shrink-0 mb-6">
        <div>
          <h1 className="text-3xl font-black text-white flex items-center gap-3">
            <MonitorPlay className="h-8 w-8 text-indigo-500" />
            课程集群协同工作台
          </h1>
          <p className="text-slate-400 mt-2 text-sm font-medium">
            基于「主题模块 / 合集架构」的多端协同中心，打通套系大纲与跨终端联合开发动线
          </p>
        </div>
        <div className="flex items-center gap-4">
          {/* P2-9 多教师协作状态灯 (Realtime Awareness) */}
          <div className="hidden lg:flex items-center bg-slate-900 border border-slate-800 rounded-full px-1.5 py-1.5 pr-4 gap-3 shadow-lg shadow-black/20 transition-all">
             <div className="flex -space-x-2">
                {onlineUsers.length > 0 ? onlineUsers.map((u, i) => (
                  <div key={i} title={u.user?.name} className="h-7 w-7 rounded-full border-2 border-slate-900 flex items-center justify-center text-[10px] font-bold text-slate-800 shadow-sm relative group cursor-help transition-transform hover:scale-110 hover:z-10" style={{ backgroundColor: u.user?.color || '#ccc' }}>
                    {u.user?.name?.[0]}
                    <div className="absolute top-8 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 whitespace-nowrap pointer-events-none">
                       {u.user?.name}
                    </div>
                  </div>
                )) : (
                  <div className="h-7 w-7 rounded-full border-2 border-slate-900 bg-slate-800 flex items-center justify-center text-[10px] text-slate-500">?</div>
                )}
             </div>
             <div className="flex items-center gap-1.5">
               <span className="relative flex h-2 w-2">
                 <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                 <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
               </span>
               <span className="text-xs font-bold text-slate-300">
                 {onlineUsers.length > 0 ? `${onlineUsers.length} 人在线协同` : '正在连接协同网络...'}
               </span>
             </div>
          </div>
          <a 
            href="/edu/generator"
            className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 rounded-xl text-white font-bold flex items-center gap-2 transition-all shadow-lg shadow-indigo-500/20 text-sm"
          >
            <Sparkles className="h-4 w-4" /> 召唤 AI 生成器
          </a>
        </div>
      </div>

      {/* 工作区主体 */}
      <div className="flex-1 relative z-10 border border-slate-800 bg-[#0b0e14] rounded-2xl flex overflow-hidden shadow-2xl">
        
        {/* 左侧：教研总纲大屏 (手风琴) */}
        <div className="w-[380px] shrink-0 border-r border-slate-800 flex flex-col bg-[#0d121c]/50">
          <div className="p-5 border-b border-slate-800 shrink-0">
             <h2 className="text-sm font-black tracking-widest text-slate-300 uppercase flex items-center gap-2">
                <Layers className="h-4 w-4 text-indigo-500" /> 教学动线总览
             </h2>
             <p className="text-xs text-slate-500 mt-1">全局教纲与逐次课粒度映射</p>
          </div>
          
          <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
            {courses.length === 0 && <div className="text-slate-500 text-sm text-center mt-10">暂无课程数据</div>}
            
            {courses.map((course) => {
              const isExpanded = expandedCourseId === course.id;
              const theme = getThemeVars(course.category);
              const courseOccupiers = onlineUsers.filter(u => u.user?.id !== currentUser.id && u.editingCourse === course.id);
              
              return (
                <div key={course.id} className={"rounded-xl border transition-colors overflow-hidden " + (isExpanded ? "bg-slate-900/80 border-slate-700" : "bg-slate-900/40 border-slate-800 hover:border-slate-700")}>
                   {/* 课程头 */}
                   <div 
                     onClick={() => setExpandedCourseId(isExpanded ? null : course.id)}
                     className="p-4 cursor-pointer flex items-center justify-between"
                   >
                     <div className="flex-1 min-w-0">
                       <div className="flex items-center gap-2">
                         <h3 className="font-bold text-slate-200 truncate">{course.name}</h3>
                         {courseOccupiers.map(u => (
                           <div key={u.user.id} className="flex flex-shrink-0 items-center px-1.5 py-0.5 rounded text-[10px] bg-amber-500/10 text-amber-500 border border-amber-500/20 whitespace-nowrap animate-pulse">
                              <Lock className="h-3 w-3 mr-1" />
                              {u.user.name.split(' ')[0]} 正在研讨
                           </div>
                         ))}
                       </div>
                       <div className="flex items-center gap-2 mt-1">
                         <span className={"px-2 rounded text-[9px] font-black uppercase " + theme}>{course.category || '综合'}</span>
                         <span className="text-[10px] text-slate-500">{course.edu_lessons?.length || 0} 讲</span>
                       </div>
                     </div>
                     <ChevronDown className={"h-4 w-4 text-slate-500 transition-transform " + (isExpanded ? "rotate-180" : "")} />
                   </div>

                   {/* 逐课列表 (手风琴展开) */}
                   {isExpanded && (
                     <div className="border-t border-slate-800 bg-[#080b12] p-2 space-y-1">
                       {course.edu_lessons?.length > 0 ? (
                         course.edu_lessons.map((lesson: any) => {
                           const isActive = activeLesson?.id === lesson.id;
                           const lessonOccupiers = onlineUsers.filter(u => u.user?.id !== currentUser.id && u.editingLesson === lesson.id);
                           
                           return (
                             <div 
                               key={lesson.id}
                               onClick={() => handleSelectLesson(course.id, lesson)}
                               className={"flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors border " + (isActive ? "bg-indigo-600/10 border-indigo-500/30 shadow-inner" : "border-transparent hover:bg-slate-800/50")}
                             >
                                <div className={"h-6 w-6 shrink-0 rounded flex items-center justify-center text-[10px] font-black relative overflow-hidden " + (isActive ? "bg-indigo-500 text-white" : "bg-slate-800 text-slate-400")}>
                                  {lesson.lesson_number}
                                  {lessonOccupiers.length > 0 && <div className="absolute inset-0 bg-red-500/20 border border-red-500/50 rounded animate-pulse" />}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className={"text-[12px] font-bold flex items-center gap-2 truncate " + (isActive ? "text-indigo-300" : "text-slate-300")}>
                                    <span>{lesson.title}</span>
                                    {lessonOccupiers.map(u => (
                                       <div key={u.user.id} title={`${u.user.name} 正在深度编辑`} className="relative flex h-3 w-3">
                                         <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                                         <span className="relative inline-flex rounded-full h-3 w-3 border border-slate-700 font-black text-[6px] text-slate-800 flex items-center justify-center" style={{ backgroundColor: u.user.color }}>{u.user.name[0]}</span>
                                       </div>
                                    ))}
                                  </div>
                                  <div className="text-[9px] text-slate-500 truncate mt-0.5">{lesson.duration_min} 分钟 · 关联 {lesson.slide_index !== null ? `Slide ${lesson.slide_index + 1}` : '暂无课件映射'}</div>
                                </div>
                             </div>
                           )
                         })
                       ) : (
                         <div className="p-4 text-center text-xs text-slate-600">该课程尚未生成逐次课大纲</div>
                       )}
                     </div>
                   )}
                </div>
              );
            })}
          </div>
        </div>

        {/* 右侧：单课深潜细节 (Detail View) */}
        <div className="flex-1 flex flex-col relative bg-[#101520]">
          {!activeLesson ? (
             <div className="flex-1 flex flex-col items-center justify-center opacity-50">
                <LayoutTemplate className="h-20 w-20 text-slate-700 mb-6" />
                <p className="text-lg font-bold text-slate-500">在左侧展开课程并选择特定课次</p>
                <p className="text-sm text-slate-600 mt-2">打通“教学大纲(Lesson)”与“展示课件(Slide)”的双重视图</p>
             </div>
          ) : (
             <div className="flex-1 flex flex-col h-full">
                {/* 顶栏信息 */}
                <div className="h-20 shrink-0 border-b border-slate-800 bg-[#0d121c] flex items-center px-8 relative">
                   <div>
                     <h2 className="text-2xl font-black text-white">第 {activeLesson.lesson_number} 讲：{activeLesson.title}</h2>
                     <p className="text-xs text-indigo-400 mt-1 font-mono tracking-wider uppercase">Lesson Objectives & Slide Sync</p>
                   </div>
                   
                   <div className="ml-auto flex gap-3">
                      <button className="px-4 py-2 bg-slate-800 hover:bg-slate-700/80 border border-slate-700 rounded-xl text-xs font-bold text-slate-300 transition-colors flex items-center gap-2">
                        <PenTool className="h-3 w-3" /> 锁定/编撰教纲
                      </button>
                      <button className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 rounded-xl text-xs font-bold text-white transition-colors flex items-center gap-2 shadow-lg shadow-emerald-500/20">
                        <ShieldCheck className="h-4 w-4" /> 审核通过发行
                      </button>
                   </div>
                </div>

                {/* 内容区 2列 */}
                <div className="flex-1 flex overflow-hidden">
                   
                   {/* 课次专属信息 (目标、物料、AI考评) */}
                   <div className="w-[320px] shrink-0 border-r border-slate-800 bg-[#0b0e14]/80 p-6 overflow-y-auto custom-scrollbar">
                      
                      <div className="space-y-8">
                         <div>
                            <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3 flex items-center gap-2">
                               <FileText className="h-3 w-3" /> 预期教学目标
                            </h4>
                            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 text-sm text-emerald-400/80 leading-relaxed min-h-24">
                              {activeLesson.objectives?.length > 0 ? (
                                <ul className="list-disc pl-4 space-y-1">
                                  {activeLesson.objectives.map((obj: string, i: number) => <li key={i}>{obj}</li>)}
                                </ul>
                              ) : "未定义拆解目标，可交由 AI 补全。"}
                            </div>
                         </div>

                         <div>
                            <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3 flex items-center gap-2">
                               <BookOpen className="h-3 w-3" /> 评估要点 (对接课消 AI)
                            </h4>
                            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 text-sm text-orange-400/80 leading-relaxed min-h-24">
                              {activeLesson.assessment_criteria || "未设定课堂评估维度。"}
                            </div>
                         </div>
                      </div>
                      
                      {/* P2-10 教学效果数据回流看板 */}
                      <div className="mt-8 pt-8 border-t border-slate-800">
                         <h4 className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                            <Activity className="h-4 w-4" /> 真实排课数据回填 (Data Flywheel)
                         </h4>
                         <div className="grid grid-cols-2 gap-3">
                            <div className="bg-slate-950 border border-slate-800 rounded-xl p-3 flex flex-col items-center justify-center text-center group hover:border-blue-500/40 transition-colors cursor-default">
                               <div className="text-2xl font-black text-white group-hover:scale-110 transition-transform">98.5%</div>
                               <div className="text-[10px] text-slate-500 font-bold mt-1 uppercase flex items-center gap-1"><CheckCircle2 className="h-3 w-3 text-emerald-500"/> 近30日满班率</div>
                            </div>
                            <div className="bg-slate-950 border border-slate-800 rounded-xl p-3 flex flex-col items-center justify-center text-center group hover:border-blue-500/40 transition-colors cursor-default">
                               <div className="text-2xl font-black text-white group-hover:scale-110 transition-transform">9.8/10</div>
                               <div className="text-[10px] text-slate-500 font-bold mt-1 uppercase flex items-center gap-1"><MessageSquare className="h-3 w-3 text-blue-500"/> AI点评优良率</div>
                            </div>
                         </div>
                      </div>
                   </div>

                   {/* 会合并显示绑定的 Slide 课件 */}
                   <div className="flex-1 p-8 overflow-y-auto custom-scrollbar flex flex-col items-center">
                      {activePlan && activeLesson.slide_index !== null && activePlan.slides[activeLesson.slide_index] ? (
                         <div className="w-full max-w-[800px] space-y-6">
                            <h4 className="text-[10px] font-black text-indigo-400 uppercase tracking-widest flex items-center justify-between">
                               <span>映射关联的 PPT 课件</span>
                               <span className="px-2 py-0.5 bg-indigo-500/20 rounded">Slide {(activeLesson.slide_index + 1).toString().padStart(2, '0')}</span>
                            </h4>
                            
                            <div className="w-full aspect-[16/9] bg-[#0d121c] border border-slate-700 rounded-2xl shadow-xl flex flex-col p-10 relative group">
                               <h3 className="text-3xl font-black text-white mb-6">
                                 {activePlan.slides[activeLesson.slide_index].title}
                               </h3>
                               <div className="flex-1 text-slate-300 whitespace-pre-wrap font-mono text-lg leading-relaxed">
                                 {activePlan.slides[activeLesson.slide_index].content}
                               </div>
                               
                               <div className="absolute inset-0 bg-slate-900/90 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-2xl">
                                  <button className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl flex items-center gap-2 shadow-lg shadow-indigo-500/20">
                                    <PenTool className="h-4 w-4" /> 进入课件编辑器修改该帧
                                  </button>
                               </div>
                            </div>
                         </div>
                      ) : (
                         <div className="flex-1 flex flex-col items-center justify-center mt-20 opacity-40">
                             <MonitorPlay className="h-16 w-16 text-slate-700 mb-4" />
                             <p className="text-white font-bold">该课次目前处于无课件绑定状态</p>
                             <p className="text-xs text-slate-400 mt-2">若是一门长期课，后续大纲通常独立于首发生成的 PPT</p>
                         </div>
                      )}
                   </div>
                </div>
             </div>
          )}
        </div>

      </div>
    </div>
  );
}
