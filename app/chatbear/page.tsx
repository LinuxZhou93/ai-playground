import React from 'react';
import Header from '@/components/chatbear/Header';
import { BookOpen, Cpu, Sparkles, Trophy, ArrowRight } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import AiAssistant from '@/components/chatbear/AiAssistant';
import './chatbear.css';

const courses = [
  {
    id: 'ai-intro',
    title: 'AI 启蒙之路',
    desc: '从认识神经网络开始，由小创带你走进人工智能的世界。',
    icon: <Sparkles className="text-yellow-500" />,
    level: 'L1 入门',
    color: 'bg-yellow-50'
  },
  {
    id: 'robotics-mech',
    title: '机械大师：周小麦的创客日志',
    desc: '学习齿轮、连杆与力矩。周小麦分享他搭建第一个机器人的故事。',
    icon: <Cpu className="text-blue-500" />,
    level: 'L2 进阶',
    color: 'bg-blue-50'
  },
  {
    id: 'eai-flagship',
    title: '具身智能 (EAI) 实战',
    desc: '查特熊旗舰课程。在仿真环境中训练你的第一个机器人 Agent。',
    icon: <BookOpen className="text-purple-500" />,
    level: 'L3 巅峰',
    color: 'bg-purple-50'
  },
  {
    id: 'competition-prep',
    title: '赛事冲刺：CSP-J/S 与 VEX',
    desc: '针对信奥与机器人大赛的深度优化课程，冲击全国大奖。',
    icon: <Trophy className="text-red-500" />,
    level: 'L4 竞赛',
    color: 'bg-red-50'
  }
];

export default function ChatBearHome() {
  return (
    <div className="min-h-screen bg-white">
      <Header />
      
      <main>
        {/* Hero Section */}
        <section className="relative overflow-hidden pt-20 pb-32 border-b border-gray-100">
          <div className="cb-container">
            <div className="flex flex-col lg:flex-row items-center gap-12">
              <div className="flex-1 text-center lg:text-left">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-yellow-100 text-yellow-700 text-sm font-bold mb-6">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-yellow-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-yellow-500"></span>
                  </span>
                  查特熊全球学习社区已开放
                </div>
                <h1 className="text-5xl lg:text-7xl font-black text-gray-900 mb-6 leading-tight">
                  让 AI 拥有<br />
                  <span className="cb-text-gradient">温暖的力量</span>
                </h1>
                <p className="text-xl text-gray-500 mb-10 max-w-xl mx-auto lg:mx-0">
                  查特熊 (ChatBear) 是专为青少年打造的 AI 与具身智能 (EAI) 学习平台。
                  在这里，周小麦和小创将带你从零开始，构建未来的智能世界。
                </p>
                <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4">
                  <Link href="/chatbear/learn" className="px-8 py-4 bg-black text-white rounded-xl font-bold flex items-center gap-2 hover:bg-gray-800 transition-all transform hover:-translate-y-1">
                    开始学习 <ArrowRight size={20} />
                  </Link>
                  <Link href="/chatbear/learn" className="px-8 py-4 bg-white border-2 border-gray-100 rounded-xl font-bold text-gray-600 hover:bg-gray-50 transition-all">
                    了解课程体系
                  </Link>
                </div>
              </div>

              {/* IP Visuals - Real Combined Photo */}
              <div className="flex-1 relative w-full h-[400px] lg:h-[550px]">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[110%] h-[110%] bg-gradient-to-tr from-yellow-200/20 to-blue-200/20 rounded-full blur-[100px] opacity-40"></div>
                <div className="relative z-10 flex items-center justify-center h-full">
                   <img 
                      src="/assets/chatbear/xiaomai_and_xiaochuang.png" 
                      alt="周小麦与小创老师" 
                      className="w-full h-full object-contain drop-shadow-[0_20px_50px_rgba(0,0,0,0.2)] hover:scale-105 transition-transform duration-700"
                    />
                </div>
                {/* Visual Accent */}
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-white/90 backdrop-blur-md px-6 py-4 rounded-2xl shadow-2xl border border-white/50 z-20 flex items-center gap-4 animate-bounce-slow">
                   <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center shrink-0">
                      <Sparkles className="text-yellow-600" size={20} />
                   </div>
                   <div className="text-left">
                      <p className="text-sm font-black text-gray-900">小创老师：</p>
                      <p className="text-xs text-gray-600">小麦，准备好开始今天的 AI 挑战了吗？</p>
                   </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Course Grid (HF Style) */}
        <section className="py-24 bg-gray-50/50">
          <div className="cb-container">
            <div className="flex items-center justify-between mb-12">
              <div>
                <h2 className="text-3xl font-bold text-gray-900 mb-2">Bear.Path 学习路径</h2>
                <p className="text-gray-500">由浅入深，从算法启蒙到硬核工程</p>
              </div>
              <Link href="/chatbear/learn" className="text-sm font-bold text-gray-900 flex items-center gap-1 group">
                查看全部 <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {courses.map((course) => (
                <Link href={`/chatbear/learn`} key={course.id}>
                  <div className="cb-card bg-white p-8 flex gap-6 cursor-pointer group h-full">
                    <div className={`w-16 h-16 ${course.color} rounded-2xl flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform`}>
                      {course.icon}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-xs font-black tracking-widest text-gray-400 uppercase">{course.level}</span>
                        <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                        <span className="text-xs font-bold text-green-500">正在更新</span>
                      </div>
                      <h3 className="text-xl font-bold text-gray-900 mb-2">{course.title}</h3>
                      <p className="text-gray-500 text-sm leading-relaxed mb-4">
                        {course.desc}
                      </p>
                      <div className="flex items-center gap-4 text-xs font-medium text-gray-400">
                        <span>15 节课</span>
                        <span>•</span>
                        <span>4250 人已加入</span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* Quote Section with IP */}
        <section className="py-24">
          <div className="cb-container">
            <div className="max-w-4xl mx-auto bg-black rounded-[2.5rem] p-12 lg:p-20 relative overflow-hidden text-white text-center">
              <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_0%,rgba(0,123,255,0.2),transparent)]"></div>
              <blockquote className="text-2xl lg:text-4xl font-medium mb-10 leading-snug relative z-10">
                “每一个孩子的奇思妙想，都是未来人工智能的火花。我和小创在这里，等你一起点燃它！”
              </blockquote>
              <div className="flex items-center justify-center gap-3 relative z-10">
                <div className="w-14 h-14 rounded-full overflow-hidden border-2 border-yellow-400 bg-white">
                  <img src="/assets/chatbear/xiaomai_and_xiaochuang.png" alt="周小麦" className="w-full h-full object-contain scale-125 translate-y-2" />
                </div>
                <div className="text-left">
                  <p className="font-bold">周小麦</p>
                  <p className="text-xs text-gray-400">查特熊首席探索官</p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="py-12 border-t border-gray-100">
        <div className="cb-container text-center">
          <p className="text-sm text-gray-400 tracking-widest uppercase font-bold">
            ChatBear © 2026 查特熊 · 全球青少年 AI & EAI 学习平台
          </p>
        </div>
      </footer>

      <AiAssistant />
    </div>
  );
}
