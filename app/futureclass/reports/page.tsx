"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  FileText, Sparkles, Send, CheckCircle2, AlertTriangle, 
  UserSquare2, Loader2, Bot, ChevronRight, Inbox, MailOpen
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { getStudents, getGrowthArchives } from "../actions";

const POSITIVE_TAGS = [
  "逻辑极强能举一反三", "专注度极高无干扰", "空间想象力出众", 
  "代码排错有耐心", "动手能力极强", "主动帮助遇到困难的组员",
  "作品外观极具创意", "能迅速吸收新知识点"
];

const NEGATIVE_TAGS = [
  "上课容易走神分心", "遇到Bug容易情绪激动", "不愿意动手尝试",
  "依赖心强老喊老师", "缺乏团队协作意识", "不爱表达自己的想法"
];

export default function ReportsPage() {
  const [students, setStudents] = useState<any[]>([]);
  const [archives, setArchives] = useState<any[]>([]);
  const [selectedStudentName, setSelectedStudentName] = useState("");
  const [courseTopic, setCourseTopic] = useState("");
  
  const [activePosTags, setActivePosTags] = useState<string[]>([]);
  const [activeNegTags, setActiveNegTags] = useState<string[]>([]);
  
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedResult, setGeneratedResult] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<"NEW" | "HISTORY">("NEW");

  useEffect(() => {
    getStudents().then(setStudents);
    getGrowthArchives().then(setArchives);
  }, []);

  const toggleTag = (tag: string, type: "POS" | "NEG") => {
    if (type === "POS") {
      setActivePosTags(prev => prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]);
    } else {
      setActiveNegTags(prev => prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]);
    }
  };

  const handleGenerate = async () => {
    if (!selectedStudentName || !courseTopic) {
      toast.error("学员姓名和课题为必填项！");
      return;
    }
    if (activePosTags.length === 0 && activeNegTags.length === 0) {
      toast.error("为了确保评语的丰富度，请至少选择一个行为胶囊。");
      return;
    }

    setIsGenerating(true);
    setGeneratedResult(null);

    try {
      const parentProps = {
        student_name: selectedStudentName,
        class_name: "默认班级", // For simplification, can be updated later
        course_topic: courseTopic,
        positive_tags: activePosTags,
        negative_tags: activeNegTags
      };

      const res = await fetch("/api/scribe/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(parentProps)
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Generation failed");

      setGeneratedResult(data);
      toast.success("闪电撰写完毕并已自动归档！");
      // Refresh history
      getGrowthArchives().then(setArchives);
    } catch (err: any) {
      toast.error(`撰写失败: ${err.message}`);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
      <div className="w-full p-8 pb-32 max-w-7xl mx-auto space-y-8 select-none">
        
        {/* Header Section */}
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2.5 rounded-[1.2rem] bg-indigo-500/10 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400">
                <FileText className="w-7 h-7" />
              </div>
              <h1 className="text-4xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-50 drop-shadow-sm">
                智能家校通 <span className="text-zinc-300 dark:text-zinc-700">/</span> Scribe
              </h1>
            </div>
            <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400 tracking-wide mt-2">
              借助大模型瞬间为本次课堂生成极具针对性和同理心的高保真成长快评。
            </p>
          </div>
          
          <div className="flex gap-2 p-1.5 rounded-[1rem] bg-zinc-100/80 dark:bg-zinc-800/80 backdrop-blur-xl border border-white/20 dark:border-white/5">
            <button 
              onClick={() => setActiveTab("NEW")}
              className={cn(
                "px-6 py-2 rounded-[0.8rem] text-sm font-bold transition-all",
                activeTab === "NEW" 
                  ? "bg-white dark:bg-zinc-700 text-indigo-600 dark:text-indigo-400 shadow-sm" 
                  : "text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"
              )}
            >
              撰写新点评
            </button>
            <button 
              onClick={() => setActiveTab("HISTORY")}
              className={cn(
                "px-6 py-2 rounded-[0.8rem] text-sm font-bold transition-all",
                activeTab === "HISTORY" 
                  ? "bg-white dark:bg-zinc-700 text-indigo-600 dark:text-indigo-400 shadow-sm" 
                  : "text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"
              )}
            >
              时空历史档案
            </button>
          </div>
        </div>

        {activeTab === "NEW" ? (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* Left Control Panel */}
            <div className="lg:col-span-7 space-y-6">
              <div className="bg-white/80 dark:bg-zinc-900/60 backdrop-blur-3xl rounded-[2rem] p-8 border border-white/40 dark:border-white/5 shadow-2xl shadow-indigo-900/5">
                <h2 className="text-xl font-bold flex items-center gap-2 text-zinc-800 dark:text-zinc-100 mb-6">
                  <UserSquare2 className="w-5 h-5 text-indigo-500" />
                  基础锚点信息
                </h2>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-black uppercase text-zinc-400 ml-1">点评对象 (学员)</label>
                    <select 
                      className="w-full bg-zinc-100/50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 rounded-[1rem] p-3 text-sm font-medium focus:ring-2 focus:ring-indigo-500/50 focus:outline-none transition-all"
                      value={selectedStudentName}
                      onChange={(e) => setSelectedStudentName(e.target.value)}
                    >
                      <option value="">-- 请选择学员 --</option>
                      {students.map((stu, i) => (
                        <option key={stu.id || i} value={stu.name}>{stu.name}</option>
                      ))}
                      {students.length === 0 && <option value="测试学员李启明">测试学员李启明 (Fallback)</option>}
                    </select>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-xs font-black uppercase text-zinc-400 ml-1">本节课探究课题</label>
                    <input 
                      type="text" 
                      placeholder="例: 火星探测车红外避障系统"
                      className="w-full bg-zinc-100/50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 rounded-[1rem] p-3 text-sm font-medium focus:ring-2 focus:ring-indigo-500/50 focus:outline-none transition-all placeholder-zinc-400/50"
                      value={courseTopic}
                      onChange={(e) => setCourseTopic(e.target.value)}
                    />
                  </div>
                </div>

                <div className="mt-8 space-y-6">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-black uppercase text-emerald-500 flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5" /> 本节课出众亮点
                      </label>
                      <span className="text-xs text-zinc-400">{activePosTags.length} / {POSITIVE_TAGS.length}</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {POSITIVE_TAGS.map(tag => (
                        <button
                          key={tag}
                          onClick={() => toggleTag(tag, "POS")}
                          className={cn(
                            "px-4 py-2 rounded-full text-[13px] font-bold transition-all border",
                            activePosTags.includes(tag)
                              ? "bg-emerald-500 text-white border-emerald-500 shadow-md shadow-emerald-500/20"
                              : "bg-emerald-50/50 dark:bg-emerald-900/10 text-emerald-600 dark:text-emerald-400 border-emerald-200/50 dark:border-emerald-800/50 hover:bg-emerald-100 dark:hover:bg-emerald-900/30"
                          )}
                        >
                          {tag}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-black uppercase text-rose-500 flex items-center gap-1.5">
                        <AlertTriangle className="w-3.5 h-3.5" /> 存在改进空间的漏点
                      </label>
                      <span className="text-xs text-zinc-400">{activeNegTags.length} / {NEGATIVE_TAGS.length}</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {NEGATIVE_TAGS.map(tag => (
                        <button
                          key={tag}
                          onClick={() => toggleTag(tag, "NEG")}
                          className={cn(
                            "px-4 py-2 rounded-full text-[13px] font-bold transition-all border",
                            activeNegTags.includes(tag)
                              ? "bg-rose-500 text-white border-rose-500 shadow-md shadow-rose-500/20"
                              : "bg-rose-50/50 dark:bg-rose-900/10 text-rose-600 dark:text-rose-400 border-rose-200/50 dark:border-rose-800/50 hover:bg-rose-100 dark:hover:bg-rose-900/30"
                          )}
                        >
                          {tag}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="mt-8 pt-8 border-t border-zinc-100 dark:border-zinc-800">
                  <button
                    onClick={handleGenerate}
                    disabled={isGenerating}
                    className="w-full group relative flex items-center justify-center gap-3 overflow-hidden rounded-[1.2rem] bg-indigo-600 px-6 py-4 font-bold text-white transition-all hover:bg-indigo-500 active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed shadow-xl shadow-indigo-600/20"
                  >
                    {isGenerating ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <>
                        <Sparkles className="w-5 h-5 group-hover:rotate-12 transition-transform" />
                        <span className="tracking-widest relative z-10 text-[15px]">启动 AI 闪电融合撰写</span>
                      </>
                    )}
                    <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/10 to-transparent pointer-events-none" />
                  </button>
                </div>

              </div>
            </div>

            {/* Right Phone Mockup Preview */}
            <div className="lg:col-span-5 h-[750px] relative flex justify-center sticky top-8">
              {/* iPhone style frame */}
              <div className="w-[380px] h-[720px] bg-zinc-950 rounded-[3.5rem] p-3 shadow-2xl shadow-black/40 ring-1 ring-zinc-800 flex flex-col relative z-10 overflow-hidden">
                <div className="absolute top-0 left-[50%] -translate-x-[50%] w-32 h-7 bg-black rounded-b-3xl z-50"></div>
                
                <div className="flex-1 bg-[#F1F1F1] rounded-[2.8rem] overflow-hidden flex flex-col relative">
                  {/* Mock WeChat Header */}
                  <div className="bg-zinc-100 pt-12 pb-3 px-5 flex items-center justify-between border-b border-zinc-200 sticky top-0 z-40 relative">
                      <div className="flex items-center gap-2 z-10">
                        <ChevronRight className="w-5 h-5 rotate-180 text-zinc-900" />
                        <span className="font-bold text-zinc-900">{selectedStudentName || "家长"}</span>
                      </div>
                      <div className="flex gap-4">
                        <div className="w-5 h-5 rounded-full border border-black" />
                      </div>
                      
                      {/* Sub-header text overlay simulation */}
                      <div className="absolute inset-0 bg-zinc-100/80 backdrop-blur-md z-0 flex items-center justify-center pt-8">
                         <span className="font-bold text-zinc-900 text-[15px] z-10">{selectedStudentName ? `${selectedStudentName}妈妈` : "家长微信"}</span>
                      </div>
                  </div>

                  {/* Chat Area */}
                  <div className="flex-1 overflow-y-auto p-4 space-y-4 pb-20 custom-scrollbar">
                     <p className="text-center text-[11px] text-zinc-400 font-medium my-4">今天 16:30 教务老师下发</p>
                     
                     <AnimatePresence mode="wait">
                       {!generatedResult && !isGenerating && (
                          <motion.div 
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="bg-white rounded-2xl p-5 text-center space-y-3 shadow-sm"
                          >
                             <div className="w-12 h-12 bg-indigo-50 rounded-full flex items-center justify-center mx-auto mb-2">
                               <Bot className="w-6 h-6 text-indigo-400" />
                             </div>
                             <p className="text-xs text-zinc-500 leading-relaxed">
                               在此区域实时预览生成的 AI 评价长文。<br/>不仅结构专业，话术也绝对令家长感动。
                             </p>
                          </motion.div>
                       )}

                       {isGenerating && (
                           <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex justify-start">
                             <div className="bg-white rounded-[1.2rem] rounded-tl-sm px-4 py-3 shadow-sm flex gap-2 items-center">
                               <span className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" />
                               <span className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce [animation-delay:-0.15s]" />
                               <span className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce [animation-delay:-0.3s]" />
                             </div>
                           </motion.div>
                       )}

                       {generatedResult && !isGenerating && (
                         <motion.div 
                            key="result"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="flex justify-start"
                         >
                            <div className="w-full bg-white rounded-[1.2rem] rounded-tl-sm p-4 shadow-sm border border-zinc-100">
                               <div className="flex items-center gap-2 mb-3 pb-3 border-b border-zinc-100">
                                  <Sparkles className="w-4 h-4 text-amber-400" />
                                  <span className="text-[13px] font-bold text-zinc-800">课程跟踪快报 (AI)</span>
                               </div>
                               
                               <div className="space-y-4 text-[13px] text-zinc-700 leading-relaxed">
                                  <p className="font-medium text-zinc-900 border-l-2 border-indigo-500 pl-2">
                                    {generatedResult.ai_greetings}
                                  </p>
                                  
                                  <div className="bg-zinc-50 p-3 rounded-xl border border-zinc-100">
                                    <p className="text-xs font-bold text-zinc-500 mb-1">【课堂表现详述】</p>
                                    <p>{generatedResult.ai_class_performance}</p>
                                  </div>

                                  <div className="bg-emerald-50 p-3 rounded-xl border border-emerald-100">
                                    <p className="text-xs font-bold text-emerald-600 mb-1">【家庭延展及后续建议】</p>
                                    <p>{generatedResult.ai_homework_guide}</p>
                                  </div>
                               </div>

                               <div className="mt-4 pt-3 border-t border-zinc-100 flex justify-between items-center">
                                  <span className="text-[10px] text-zinc-400">FutureClass Scribe 引擎驱动</span>
                                  <button className="flex items-center gap-1.5 text-xs font-bold text-indigo-500 bg-indigo-50 px-3 py-1.5 rounded-full">
                                    <Send className="w-3 h-3" /> 一键发送微信
                                  </button>
                               </div>
                            </div>
                         </motion.div>
                       )}
                     </AnimatePresence>
                  </div>
                </div>
              </div>
              
              {/* Backglow effect behind phone */}
              <div className="absolute inset-0 bg-indigo-500/20 blur-[100px] z-0 pointer-events-none rounded-full shrink-0" />
            </div>

          </div>
        ) : (
          /* Archive History View */
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
             <div className="bg-white/80 dark:bg-zinc-900/60 backdrop-blur-3xl rounded-[2rem] p-8 border border-white/40 dark:border-white/5 shadow-2xl shadow-indigo-900/5 min-h-[60vh]">
                {archives.length === 0 ? (
                   <div className="flex flex-col items-center justify-center h-full text-zinc-400 space-y-4 py-20">
                     <Inbox className="w-16 h-16 opacity-30" />
                     <p className="font-bold tracking-widest text-sm uppercase">暂无家校互动的历史落盘记录</p>
                   </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {archives.map((arc, idx) => (
                      <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.05 }}
                        key={arc.id} 
                        className="bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200 dark:border-zinc-700/50 p-5 rounded-[1.5rem] hover:shadow-xl hover:shadow-indigo-500/5 transition-all group"
                      >
                         <div className="flex justify-between items-start mb-4">
                           <div>
                              <h3 className="font-bold text-lg text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                                <MailOpen className="w-5 h-5 text-indigo-400 group-hover:scale-110 transition-transform" /> 
                                {arc.student_name}
                              </h3>
                              <p className="text-[11px] text-zinc-500 font-medium mt-1">{arc.class_name} • {arc.course_topic}</p>
                           </div>
                           <span className="text-[10px] bg-zinc-200/50 dark:bg-zinc-700/50 px-2 py-1 rounded-md text-zinc-600 dark:text-zinc-400 font-mono">
                              {new Date(arc.created_at).toLocaleDateString()}
                           </span>
                         </div>
                         <p className="text-sm text-zinc-600 dark:text-zinc-300 line-clamp-3 mb-4 leading-relaxed">
                            "{arc.ai_greetings}"
                         </p>
                         <div className="flex gap-2 font-mono text-[10px]">
                            {arc.positive_tags && arc.positive_tags.length > 0 && (
                              <span className="text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">+{arc.positive_tags.length} 亮点</span>
                            )}
                            {arc.negative_tags && arc.negative_tags.length > 0 && (
                              <span className="text-rose-500 bg-rose-500/10 px-2 py-0.5 rounded-full border border-rose-500/20">-{arc.negative_tags.length} 提升项</span>
                            )}
                         </div>
                      </motion.div>
                    ))}
                  </div>
                )}
             </div>
          </motion.div>
        )}

      </div>
  );
}
