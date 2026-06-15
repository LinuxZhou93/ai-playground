import React from 'react';
import Header from '@/components/chatbear/Header';
import { ChevronRight, PlayCircle, BookOpen, CheckCircle2, MessageSquare } from 'lucide-react';
import AiAssistant from '@/components/chatbear/AiAssistant';
import './../../chatbear.css';

const chapters = [
  {
    title: '第一章：初识 AI 与具身智能',
    lessons: ['什么是具身智能？', 'AI 的进化简史', '周小麦的第一个智能项目']
  },
  {
    title: '第二章：传感器：机器人的感官',
    lessons: ['视觉传感器：机器人的眼睛', '超声波与红外：避障基础', '数据如何变成决策']
  },
  {
    title: '第三章：大脑：大语言模型基础',
    lessons: ['提示词工程初步', '让机器人听懂指令', 'Xiao Chuang 的思维逻辑']
  }
];

export default function CoursePage() {
  return (
    <div className="min-h-screen bg-white">
      <Header />
      
      <div className="flex h-[calc(100vh-64px)] overflow-hidden">
        {/* Sidebar (HF Style) */}
        <aside className="w-80 border-r border-gray-100 bg-gray-50/30 overflow-y-auto hidden lg:block">
          <div className="p-6">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center text-purple-600 font-bold">
                EAI
              </div>
              <div>
                <h2 className="font-bold text-gray-900 leading-tight">具身智能 (EAI) 实战</h2>
                <p className="text-xs text-gray-400">正在进行：3 / 15 节</p>
              </div>
            </div>

            <nav className="space-y-6">
              {chapters.map((chapter, i) => (
                <div key={i}>
                  <h3 className="text-[11px] font-black uppercase tracking-widest text-gray-400 mb-3 px-2">
                    {chapter.title}
                  </h3>
                  <div className="space-y-1">
                    {chapter.lessons.map((lesson, j) => (
                      <button 
                        key={j}
                        className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-all flex items-center justify-between group ${
                          i === 0 && j === 0 ? 'bg-white shadow-sm border border-gray-100 text-black font-medium' : 'text-gray-500 hover:bg-gray-100'
                        }`}
                      >
                        <span className="truncate">{lesson}</span>
                        {i === 0 && j < 2 ? (
                          <CheckCircle2 size={14} className="text-green-500 shrink-0" />
                        ) : (
                          <PlayCircle size={14} className="text-gray-300 opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </nav>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto bg-white relative">
          <div className="max-w-4xl mx-auto px-8 lg:px-12 py-12 pb-32">
            <nav className="flex items-center gap-2 text-xs font-bold text-gray-400 mb-8 uppercase tracking-widest">
              <span>Bear.Path</span>
              <ChevronRight size={12} />
              <span>具身智能实战</span>
              <ChevronRight size={12} />
              <span className="text-black">什么是具身智能？</span>
            </nav>

            <article className="prose prose-slate max-w-none">
              <h1 className="text-4xl font-black text-gray-900 mb-8 tracking-tight">什么是具身智能？ (Embodied AI)</h1>
              
              <div className="bg-yellow-50/50 border-l-4 border-yellow-400 p-6 rounded-r-2xl mb-10 flex gap-4">
                <div className="w-12 h-12 rounded-full overflow-hidden shrink-0 border-2 border-white shadow-sm">
                   <img src="/assets/chatbear/周小麦IP标准设定图.png" alt="周小麦" className="w-full h-full object-cover scale-150 translate-y-2" />
                </div>
                <div>
                  <p className="text-yellow-900 font-bold mb-1 italic">周小麦的学习笔记：</p>
                  <p className="text-yellow-800 text-sm leading-relaxed">
                    “以前我们觉得 AI 就是在电脑里下棋或者聊天，但『具身智能』是让 AI 走进现实世界，去搬东西、开门，甚至是和我们击掌。这就像是给 AI 装上了身体 and 双手！”
                  </p>
                </div>
              </div>

              <p className="text-xl text-gray-600 leading-relaxed mb-8">
                具身智能（Embodied AI）是人工智能研究的一个前沿分支。它的核心观点是：<strong>智能不应仅存在于抽象的数字空间，而必须通过与物理世界的交互来学习。</strong>
              </p>

              <div className="aspect-video w-full bg-gray-900 rounded-3xl mb-12 flex items-center justify-center group cursor-pointer relative overflow-hidden shadow-2xl">
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                <div className="relative z-10 text-center">
                  <PlayCircle size={64} className="text-white mb-4 group-hover:scale-110 transition-transform" />
                  <p className="text-white font-bold">观看小创的演示视频：具身智能的一天</p>
                </div>
              </div>

              <h2 className="text-2xl font-black text-gray-900 mb-6">关键区别：传统 AI vs. 具身 AI</h2>
              <div className="grid sm:grid-cols-2 gap-4 mb-12">
                <div className="p-6 bg-gray-50 rounded-2xl border border-gray-100">
                  <h3 className="font-bold text-gray-400 mb-3 uppercase tracking-widest text-xs">传统 AI (Internet AI)</h3>
                  <p className="text-sm text-gray-600">处理文字、图像、音频。数据来自互联网，通过屏幕与人类交互。</p>
                </div>
                <div className="p-6 bg-blue-50 rounded-2xl border border-blue-100">
                  <h3 className="font-bold text-blue-500 mb-3 uppercase tracking-widest text-xs">具身智能 (Embodied AI)</h3>
                  <p className="text-sm text-gray-600">处理物理碰撞、重力、摩擦。数据来自传感器，通过执行器直接影响现实。</p>
                </div>
              </div>
            </article>

            {/* Navigation Buttons */}
            <div className="mt-20 flex items-center justify-between py-12 border-t border-gray-100">
              <button className="flex flex-col items-start gap-2 group">
                 <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">上一节</span>
                 <span className="font-bold text-gray-500 group-hover:text-black transition-colors">没有了，你是第一个！</span>
              </button>
              <button className="flex flex-col items-end gap-2 group text-right">
                 <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">下一节</span>
                 <span className="font-bold text-gray-900 group-hover:text-blue-500 transition-colors flex items-center gap-1">
                    AI 的进化简史 <ChevronRight size={18} />
                 </span>
              </button>
            </div>
          </div>
        </main>
      </div>
      <AiAssistant />
    </div>
  );
}
