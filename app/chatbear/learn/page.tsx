'use client';

import React from 'react';
import Header from '@/components/chatbear/Header';
import AiAssistant from '@/components/chatbear/AiAssistant';
import { Search, Filter, BookOpen, Clock, Users, ArrowRight, Play } from 'lucide-react';
import Link from 'next/link';
import './../chatbear.css';

const courseCategories = [
  { id: 'all', name: '全部课程' },
  { id: '启蒙', name: 'AI 启蒙' },
  { id: '机器人', name: '机器人工程' },
  { id: '编程', name: 'Python 编程' },
  { id: '具身智能', name: '具身智能 (EAI)' },
];

const allCourses = [
  {
    id: 'ai-intro',
    title: 'AI 启蒙之路',
    category: '启蒙',
    level: 'L1',
    duration: '12 课时',
    students: '1.2k',
    image: '/assets/chatbear/周小麦IP标准设定图.png'
  },
  {
    id: 'eai-flagship',
    title: '具身智能 (EAI) 实战',
    category: '具身智能',
    level: 'L3',
    duration: '24 课时',
    students: '3.5k',
    image: '/assets/chatbear/白色机器人IP标准设定图.png'
  },
  {
    id: 'python-bot',
    title: '用 Python 控制你的第一个机器人',
    category: '编程',
    level: 'L2',
    duration: '15 课时',
    students: '800+',
    image: '/assets/chatbear/周小麦IP标准设定图.png'
  },
  {
    id: 'vision-sensing',
    title: '机器视觉：让机器人看懂世界',
    category: '机器人',
    level: 'L2',
    duration: '18 课时',
    students: '1.5k',
    image: '/assets/chatbear/白色机器人IP标准设定图.png'
  }
];

export default function LearnPage() {
  return (
    <div className="min-h-screen bg-white">
      <Header />
      
      <main className="cb-container py-12">
        <div className="mb-12">
          <h1 className="text-4xl font-black text-gray-900 mb-4">Bear.Path 学堂</h1>
          <p className="text-gray-500">
            从零基础到具身智能专家。周小麦和小创为你精心设计的系统化 AI 学习路径。
          </p>
        </div>

        {/* Filter Bar */}
        <div className="flex flex-col md:flex-row items-center gap-6 mb-12">
          <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 w-full md:w-auto">
            {courseCategories.map((cat) => (
              <button 
                key={cat.id}
                className={`px-5 py-2 rounded-full text-sm font-bold transition-all whitespace-nowrap ${cat.id === 'all' ? 'bg-black text-white' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}
              >
                {cat.name}
              </button>
            ))}
          </div>
          <div className="relative flex-1 w-full">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
              type="text" 
              placeholder="搜索课程名称或知识点..." 
              className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
            />
          </div>
        </div>

        {/* Course Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {allCourses.map((course) => (
            <Link key={course.id} href={`/chatbear/learn/${course.id}`} className="group">
              <div className="bg-white rounded-3xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-xl transition-all hover:-translate-y-1">
                {/* Thumbnail Area */}
                <div className="aspect-[16/10] bg-gray-50 relative overflow-hidden flex items-center justify-center">
                   <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5"></div>
                   <img 
                    src={course.image} 
                    alt={course.title} 
                    className="w-32 lg:w-40 drop-shadow-xl group-hover:scale-110 transition-transform duration-500" 
                   />
                   <div className="absolute top-4 left-4">
                      <span className="px-3 py-1 bg-white/90 backdrop-blur-md rounded-lg text-[10px] font-black uppercase tracking-widest shadow-sm">
                        {course.level}
                      </span>
                   </div>
                   <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                      <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all transform scale-50 group-hover:scale-100 shadow-xl">
                         <Play size={20} className="text-black ml-1" fill="currentColor" />
                      </div>
                   </div>
                </div>

                {/* Content Area */}
                <div className="p-6">
                  <div className="text-[10px] font-black text-blue-500 uppercase tracking-widest mb-2">
                    {course.category}
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-4 line-clamp-1 group-hover:text-blue-600 transition-colors">
                    {course.title}
                  </h3>
                  
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1.5 text-xs text-gray-400 font-medium">
                      <Clock size={14} /> {course.duration}
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-gray-400 font-medium">
                      <Users size={14} /> {course.students}
                    </div>
                  </div>
                </div>

                {/* Progress (Mock) */}
                <div className="px-6 pb-6 pt-2">
                   <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full bg-green-400 w-1/4 rounded-full"></div>
                   </div>
                   <div className="flex justify-between items-center mt-2">
                      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">已完成 25%</span>
                      <ArrowRight size={14} className="text-gray-300 group-hover:text-blue-600 transition-colors" />
                   </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </main>

      <AiAssistant />
    </div>
  );
}
