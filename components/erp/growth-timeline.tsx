"use client";

import React, { useMemo } from 'react';
import { motion } from 'motion/react';
import { 
  Sparkles, 
  Trophy, 
  Target, 
  Flag, 
  CheckCircle2, 
  XCircle, 
  Clock,
  Briefcase,
  Quote,
  Star,
  Zap,
  Flame
} from 'lucide-react';
import { Badge } from "@/components/ui/badge";

export type TimelineSource = 'ATTENDANCE' | 'ARCHIVE';

export interface TimelineItem {
  id: string;
  source: TimelineSource;
  date: string;       // YYYY-MM-DD
  timestamp: number;  // for sorting
  data: any;          // raw object
}

interface GrowthTimelineProps {
  attendanceRecords: any[];
  archives: any[];
}

export function GrowthTimeline({ attendanceRecords = [], archives = [] }: GrowthTimelineProps) {
  // 合并并按时间倒序排序
  const items = useMemo<TimelineItem[]>(() => {
    const list: TimelineItem[] = [];
    
    attendanceRecords.forEach(rec => {
      const dateStr = rec.lesson_date || rec.created_at.split('T')[0];
      list.push({
        id: `att_${rec.id}`,
        source: 'ATTENDANCE',
        date: dateStr,
        timestamp: new Date(dateStr).getTime(),
        data: rec
      });
    });

    archives.forEach(arc => {
      const dateStr = arc.record_date || arc.created_at.split('T')[0];
      list.push({
        id: `arc_${arc.id}`,
        source: 'ARCHIVE',
        date: dateStr,
        timestamp: new Date(dateStr).getTime() + 1000, // Make archive appear slightly above attendance if same day
        data: arc
      });
    });

    return list.sort((a, b) => b.timestamp - a.timestamp);
  }, [attendanceRecords, archives]);

  if (items.length === 0) {
    return (
      <div className="py-20 flex flex-col items-center justify-center text-zinc-400">
        <Target className="h-12 w-12 mb-4 opacity-20" />
        <p>暂无成长档案记录</p>
      </div>
    );
  }

  // Render Strategy Default Options
  const renderIcon = (item: TimelineItem) => {
    if (item.source === 'ATTENDANCE') {
      const status = item.data.status;
      if (status === 'PRESENT') return <CheckCircle2 className="h-5 w-5 text-emerald-500" />;
      if (status === 'ABSENT') return <XCircle className="h-5 w-5 text-red-500" />;
      return <Clock className="h-5 w-5 text-amber-500" />;
    }
    return <Sparkles className="h-5 w-5 text-indigo-500" />;
  };

  const renderIconContainerStyle = (item: TimelineItem) => {
    if (item.source === 'ATTENDANCE') {
       if (item.data.status === 'PRESENT') return "bg-emerald-500/10 ring-emerald-500/20 text-emerald-500";
       if (item.data.status === 'ABSENT') return "bg-red-500/10 ring-red-500/20 text-red-500";
       return "bg-amber-500/10 ring-amber-500/20 text-amber-500";
    }
    return "bg-indigo-500/10 ring-indigo-500/20 text-indigo-500";
  };

  return (
    <div className="relative py-8">
      {/* 中轴线 Glowing Line */}
      <div className="absolute left-[39px] top-8 bottom-8 w-[2px] bg-gradient-to-b from-indigo-500/50 via-zinc-200 dark:via-zinc-800 to-transparent" />
      
      <div className="space-y-12 relative">
        {items.map((item, index) => {
          const delay = Math.min(index * 0.1, 1.5);
          
          return (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              className="flex gap-8 relative group"
            >
              {/* 日期侧边栏 (可选) 或交由主卡片渲染 */}
              
              {/* 图标节点 */}
              <div className="relative z-10 shrink-0 mt-1">
                <div className={`h-12 w-12 rounded-2xl flex items-center justify-center shadow-xl ring-1 backdrop-blur-xl transition-all duration-500 group-hover:scale-110 ${renderIconContainerStyle(item)}`}>
                  {renderIcon(item)}
                </div>
              </div>

              {/* 内容卡片 */}
              <div className="flex-1 min-w-0 pb-6">
                
                {item.source === 'ARCHIVE' && (
                  <div className="p-8 rounded-[2rem] bg-gradient-to-b from-white to-zinc-50 dark:from-zinc-950 dark:to-zinc-900 border border-zinc-200/60 dark:border-zinc-800/60 shadow-lg hover:shadow-2xl transition-all hover:border-indigo-500/30 overflow-hidden relative">
                    {/* Decorative Background */}
                    <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-indigo-500/5 rounded-full blur-[100px] pointer-events-none -translate-y-1/2 translate-x-1/2" />
                    
                    <div className="flex items-center justify-between mb-4 relative z-10">
                      <div className="flex items-center gap-3">
                        <Badge variant="outline" className="uppercase tracking-widest text-[10px] font-black text-indigo-500 border-indigo-200 bg-indigo-500/5 px-3 py-1">
                          COMPREHENSIVE REPORT
                        </Badge>
                        <span className="text-xs font-bold text-zinc-400 tabular-nums">{item.date}</span>
                      </div>
                    </div>
                    
                    <h3 className="text-2xl font-black text-zinc-900 dark:text-zinc-100 mb-2 tracking-tight relative z-10">
                      {item.data.course_topic || "综合实训挑战"}
                    </h3>
                    <p className="text-sm font-bold text-indigo-600 dark:text-indigo-400 mb-6 relative z-10">
                      {item.data.class_name || "素养进阶班"}
                    </p>

                    {/* Tags Area */}
                    <div className="flex flex-wrap gap-2 mb-6 relative z-10">
                      {item.data.positive_tags?.map((tag: string, i: number) => (
                        <span key={`pos-${i}`} className="flex items-center gap-1.5 px-3 py-1 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 rounded-full text-xs font-bold">
                          <Zap className="w-3 h-3" /> {tag}
                        </span>
                      ))}
                      {item.data.negative_tags?.map((tag: string, i: number) => (
                        <span key={`neg-${i}`} className="flex items-center gap-1.5 px-3 py-1 bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20 rounded-full text-xs font-bold">
                          <Flame className="w-3 h-3" /> {tag}
                        </span>
                      ))}
                    </div>

                    <div className="space-y-6 relative z-10">
                      {item.data.ai_greetings && (
                        <div className="relative pl-4 border-l-2 border-indigo-500">
                          <p className="text-sm font-medium text-zinc-600 dark:text-zinc-300 leading-relaxed italic">
                            "{item.data.ai_greetings}"
                          </p>
                        </div>
                      )}
                      
                      {item.data.ai_class_performance && (
                        <div className="bg-white dark:bg-black/20 p-6 rounded-2xl border border-zinc-100 dark:border-zinc-800 shadow-sm">
                          <h4 className="text-xs font-black text-zinc-900 dark:text-zinc-100 uppercase tracking-widest mb-3 flex items-center gap-2">
                            <Target className="w-4 h-4 text-indigo-500" />
                            实操表现 & 深度评估
                          </h4>
                          <p className="text-sm font-medium text-zinc-600 dark:text-zinc-400 leading-loose">
                            {item.data.ai_class_performance}
                          </p>
                        </div>
                      )}

                      {item.data.ai_homework_guide && (
                        <div className="bg-indigo-50 dark:bg-indigo-500/5 p-6 rounded-2xl border border-indigo-100 dark:border-indigo-500/10 shadow-sm">
                          <h4 className="text-xs font-black text-indigo-900 dark:text-indigo-200 uppercase tracking-widest mb-3 flex items-center gap-2">
                            <Sparkles className="w-4 h-4 text-indigo-500" />
                            陪伴指南 & 进阶赋能
                          </h4>
                          <p className="text-sm font-medium text-indigo-700/80 dark:text-indigo-300/80 leading-relaxed">
                            {item.data.ai_homework_guide}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {item.source === 'ATTENDANCE' && (
                  <div className="p-5 rounded-3xl bg-transparent hover:bg-zinc-50 dark:hover:bg-zinc-900/50 transition-colors border border-transparent hover:border-zinc-200/50 dark:hover:border-zinc-800/50 mt-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="text-base font-bold text-zinc-800 dark:text-zinc-200">
                          {item.data.status === 'PRESENT' ? '已出勤' : item.data.status === 'ABSENT' ? '缺勤缺课' : '请假'}
                        </span>
                        <span className="text-xs font-bold text-zinc-400">· {item.data.erp_classes?.name || "常规考勤"}</span>
                      </div>
                      <span className="text-[11px] font-black text-zinc-400 tabular-nums">
                        {item.date} {item.data.consumption_value > 0 && `(消课 -${item.data.consumption_value})`}
                      </span>
                    </div>

                    {item.data.ai_feedback && (
                      <div className="mt-4 p-4 rounded-2xl bg-gradient-to-r from-indigo-500/5 to-purple-500/5 border border-indigo-500/10">
                        <div className="flex items-center gap-2 mb-2">
                          <Sparkles className="h-3.5 w-3.5 text-indigo-500" />
                          <span className="text-[11px] font-black uppercase tracking-[0.2em] text-indigo-600 dark:text-indigo-400">Titan AI 每课反馈</span>
                        </div>
                        <p className="text-sm text-zinc-600 dark:text-zinc-300 font-medium leading-relaxed">
                          {item.data.ai_feedback}
                        </p>
                      </div>
                    )}
                  </div>
                )}

              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
