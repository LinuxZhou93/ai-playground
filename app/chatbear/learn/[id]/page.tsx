import React from 'react';
import Header from '@/components/chatbear/Header';
import { ChevronRight, PlayCircle, BookOpen, CheckCircle2, MessageSquare, ArrowLeft, Play } from 'lucide-react';
import AiAssistant from '@/components/chatbear/AiAssistant';
import Link from 'next/link';
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
    <div className="min-h-screen bg-[#0d0e12] text-white overflow-hidden">
      <Header />
      
      <div className="flex h-[calc(100vh-80px)] overflow-hidden">
        {/* Sidebar (Upgraded Cyber Glass Style) */}
        <aside className="w-80 border-r border-white/5 bg-black/40 overflow-y-auto hidden lg:block backdrop-blur-md">
          <div className="p-6">
            <div className="flex items-center gap-3 mb-8 pb-6 border-b border-white/5">
              <div className="w-12 h-12 bg-purple-500/10 rounded-2xl flex items-center justify-center text-purple-400 font-black border border-purple-500/20 shadow-lg shadow-purple-500/5">
                EAI
              </div>
              <div>
                <h2 className="font-bold text-gray-200 leading-tight">具身智能 (EAI) 实战</h2>
                <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider mt-1">正在进行：3 / 15 节</p>
              </div>
            </div>

            <nav className="space-y-6">
              {chapters.map((chapter, i) => (
                <div key={i}>
                  <h3 className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-3 px-2">
                    {chapter.title}
                  </h3>
                  <div className="space-y-1">
                    {chapter.lessons.map((lesson, j) => (
                      <button 
                        key={j}
                        className={`w-full text-left px-3 py-2.5 rounded-xl text-xs transition-all flex items-center justify-between group ${
                          i === 0 && j === 0 
                            ? 'bg-white/5 border border-white/10 text-white font-bold shadow-2xl' 
                            : 'text-gray-400 hover:bg-white/5 hover:text-gray-200 border border-transparent'
                        }`}
                      >
                        <span className="truncate pr-2">{lesson}</span>
                        {i === 0 && j < 2 ? (
                          <CheckCircle2 size={12} className="text-emerald-400 shrink-0" />
                        ) : (
                          <PlayCircle size={12} className="text-gray-600 opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </nav>
          </div>
        </aside>

        {/* Main Content Area with Glow grid */}
        <main className="flex-1 overflow-y-auto bg-[#07080a] relative">
          {/* Subtle Grid overlay */}
          <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.01)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.01)_1px,transparent_1px)] bg-[size:30px_30px] pointer-events-none"></div>

          <div className="max-w-4xl mx-auto px-8 lg:px-16 py-12 pb-32 relative z-10">
            {/* Breadcrumb navigation */}
            <nav className="flex items-center gap-2 text-[10px] font-black text-gray-500 mb-8 uppercase tracking-widest">
              <Link href="/chatbear/learn" className="hover:text-blue-400 transition-colors flex items-center gap-1">
                <ArrowLeft size={10} /> 学堂列表
              </Link>
              <ChevronRight size={10} />
              <span>具身智能实战</span>
              <ChevronRight size={10} />
              <span className="text-white">什么是具身智能？</span>
            </nav>

            <article className="prose prose-invert max-w-none">
              <h1 className="text-4xl lg:text-5xl font-black text-white mb-8 tracking-tight">什么是具身智能？ (Embodied AI)</h1>
              
              {/* Upgraded Xiaomai note box with Glassmorphism and Yellow glow */}
              <div className="bg-yellow-500/5 border border-yellow-500/20 p-6 rounded-[2rem] mb-12 flex gap-5 shadow-[0_15px_40px_rgba(255,215,0,0.04)] backdrop-blur-md">
                <div className="w-14 h-14 rounded-2xl overflow-hidden shrink-0 border border-yellow-400/30 bg-white/5 flex items-center justify-center">
                   <img src="/assets/chatbear/周小麦IP标准设定图.png" alt="周小麦" className="w-full h-full object-cover scale-150 translate-y-2" />
                </div>
                <div>
                  <p className="text-yellow-400 text-xs font-black uppercase tracking-widest mb-1.5">周小麦的学习日记：</p>
                  <p className="text-yellow-100/90 text-sm leading-relaxed font-medium">
                    “以前我们觉得 AI 就是在电脑里下下棋或者聊聊天，但『具身智能』是让 AI 走进我们生活的现实世界，去开门、拿苹果，甚至是和我们击掌。这就像是给 AI 装上了机械底盘与双手！”
                  </p>
                </div>
              </div>

              <p className="text-lg text-gray-300 leading-relaxed mb-8">
                具身智能（Embodied AI）是人工智能研究的一个前沿分支。它的核心观点是：<strong>智能不应仅存在于抽象的数字空间，而必须通过与物理世界的交互来学习。</strong>
              </p>

              {/* Upgraded Video Player Mockup with SLAM scanning interface */}
              <div className="aspect-video w-full bg-black border border-white/10 rounded-[2.5rem] mb-12 flex items-center justify-center group cursor-pointer relative overflow-hidden shadow-2xl">
                {/* Visual scan ring background */}
                <div className="absolute inset-0 bg-[linear-gradient(rgba(16,185,129,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(16,185,129,0.02)_1px,transparent_1px)] bg-[size:20px_20px]"></div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>
                <div className="absolute -inset-10 bg-gradient-to-tr from-blue-500/10 to-purple-500/10 rounded-full blur-3xl opacity-50"></div>
                
                {/* Glowing play button */}
                <div className="relative z-10 text-center flex flex-col items-center gap-4">
                  <div className="w-20 h-20 bg-white/5 border border-white/20 rounded-full flex items-center justify-center group-hover:scale-110 group-hover:shadow-[0_0_30px_rgba(0,123,255,0.4)] group-hover:border-blue-500 transition-all duration-300">
                    <Play size={32} className="text-white fill-current translate-x-0.5" />
                  </div>
                  <p className="text-gray-300 text-xs font-black uppercase tracking-wider">观看演示视频：具身智能的一天</p>
                </div>
              </div>

              <h2 className="text-2xl font-black text-white mb-6">关键区别：传统 AI vs. 具身 AI</h2>
              <div className="grid sm:grid-cols-2 gap-6 mb-12">
                <div className="p-6 bg-white/5 rounded-[2rem] border border-white/5">
                  <h3 className="font-black text-gray-400 mb-3 uppercase tracking-widest text-[10px]">传统 AI (Internet AI)</h3>
                  <p className="text-xs text-gray-400 leading-relaxed">主要处理虚拟层面的文字、图像、音频。数据大多来自互联网抓取，通过屏幕与人类间接交互，不具备真实的物理反馈。</p>
                </div>
                <div className="p-6 bg-blue-500/5 rounded-[2rem] border border-blue-500/15">
                  <h3 className="font-black text-blue-400 mb-3 uppercase tracking-widest text-[10px]">具身智能 (Embodied AI)</h3>
                  <p className="text-xs text-gray-300 leading-relaxed">需要处理现实世界中的碰撞、重力、摩擦力。数据直接来自传感器雷达，并通过电机执行器对现实做出物理反馈。</p>
                </div>
              </div>
            </article>

            {/* Navigation Buttons */}
            <div className="mt-20 flex items-center justify-between py-12 border-t border-white/5">
              <button className="flex flex-col items-start gap-2 group">
                 <span className="text-[9px] font-black text-gray-500 uppercase tracking-widest">上一节</span>
                 <span className="font-bold text-gray-400 group-hover:text-white transition-colors text-xs">没有了，你是第一个！</span>
              </button>
              <button className="flex flex-col items-end gap-2 group text-right">
                 <span className="text-[9px] font-black text-gray-500 uppercase tracking-widest">下一节</span>
                 <span className="font-bold text-white group-hover:text-blue-400 transition-colors flex items-center gap-1 text-xs">
                    AI 的进化简史 <ChevronRight size={14} />
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
