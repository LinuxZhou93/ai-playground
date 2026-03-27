'use client';

import React, { useEffect, useRef } from 'react';
import { useLearningGitStore } from '@/lib/store/learning-git';
import { useStageStore } from '@/lib/store/stage';
import { X, Clock, PlayCircle, Save } from 'lucide-react';
import { cn } from '@/lib/utils';

export function LearningGitDrawer() {
  const { 
    isDrawerOpen, 
    toggleDrawer, 
    snapshots, 
    currentNote, 
    updateCurrentNote, 
    saveCurrentNoteToCloud,
    checkoutSnapshot,
    loadSnapshots 
  } = useLearningGitStore();
  
  const currentStage = useStageStore.use.stage();
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // 初次加载数据
  useEffect(() => {
    if (isDrawerOpen && currentStage?.id) {
      loadSnapshots(currentStage.id);
    }
  }, [isDrawerOpen, currentStage?.id, loadSnapshots]);

  // 实现笔记的防抖自动保存
  const handleNoteChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    updateCurrentNote(e.target.value);
    
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }
    
    saveTimeoutRef.current = setTimeout(() => {
      saveCurrentNoteToCloud();
    }, 1500); // 1.5s 无输入后自动上传云端
  };

  const currentSnapshot = snapshots.length > 0 ? snapshots[0] : null;

  return (
    <>
      {/* 半透明遮罩 (点击可关闭) */}
      {isDrawerOpen && (
        <div 
          className="fixed inset-0 bg-black/40 z-40 transition-opacity" 
          onClick={toggleDrawer}
        />
      )}

      {/* 右侧边栏主体 */}
      <div 
        className={cn(
          "fixed top-0 right-0 h-full w-[400px] bg-slate-900 border-l border-slate-700 shadow-2xl z-50 transform transition-transform duration-300 ease-in-out flex flex-col",
          isDrawerOpen ? "translate-x-0" : "translate-x-full"
        )}
      >
        {/* 头部 */}
        <div className="flex items-center justify-between p-4 border-b border-slate-700/50">
          <div className="flex items-center space-x-2 text-white">
            <span className="text-xl">📚</span>
            <h2 className="font-semibold text-lg">AI 学习时光机</h2>
          </div>
          <button 
            onClick={toggleDrawer}
            className="p-1 rounded-md text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X size={20} />
          </button>
        </div>

        {/* 笔记区域 (始终指向当前挂载的最新 Snapshot) */}
        <div className="p-4 flex-shrink-0 border-b border-slate-700/50 bg-slate-800/30">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-slate-300">本节学习笔记</span>
            <span className="text-xs text-slate-500 flex items-center">
              <Save size={12} className="mr-1" /> 自动同步云端
            </span>
          </div>
          <textarea 
            value={currentNote}
            onChange={handleNoteChange}
            placeholder="在这里记录你的思维火花..."
            className="w-full h-32 bg-slate-800 text-slate-100 text-sm p-3 rounded-lg border border-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-500 resize-none"
          />
        </div>

        {/* 时光机时间轴 */}
        <div className="flex-1 overflow-y-auto p-4">
          <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4 flex items-center">
             <Clock size={14} className="mr-2" /> 学习快照线
          </h3>
          
          <div className="relative border-l-2 border-slate-700 ml-3 space-y-6 pb-4">
            {snapshots.length === 0 && (
               <div className="pl-6 text-sm text-slate-500 italic">
                 还没有任何学习记录产生。继续翻页学习，小创会自动为你生成快照！
               </div>
            )}
            
            {snapshots.map((snap, index) => {
              const isLatest = index === 0;
              const date = new Date(snap.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
              
              return (
                <div key={snap.id} className="relative pl-6">
                  {/* Timeline dot */}
                  <div className={cn(
                    "absolute left-[-5px] top-1.5 w-2 h-2 rounded-full border border-slate-900 bg-slate-500",
                    isLatest ? "bg-blue-400 w-2.5 h-2.5 left-[-5.5px]" : ""
                  )} />
                  
                  {/* Snapshot Card */}
                  <div className={cn(
                    "bg-slate-800/80 rounded-lg p-3 border", 
                    isLatest ? "border-blue-500/50" : "border-slate-700"
                  )}>
                    <div className="flex justify-between items-start mb-1">
                      <span className="text-xs font-medium text-blue-400">
                        幻灯片 {snap.scene_index + 1}
                      </span>
                      <span className="text-[10px] text-slate-500">{date}</span>
                    </div>
                    <p className="text-sm text-slate-200 mb-2 leading-relaxed">
                      {snap.ai_summary || "暂无结构化摘要"}
                    </p>
                    
                    {!isLatest && (
                      <button
                        onClick={() => checkoutSnapshot(snap.id)}
                        className="flex items-center text-xs text-slate-300 hover:text-white bg-slate-700/50 hover:bg-slate-600 px-2 py-1.5 rounded transition"
                      >
                        <PlayCircle size={14} className="mr-1.5" /> 穿越回此进度
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </>
  );
}
