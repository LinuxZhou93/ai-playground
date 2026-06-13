'use client';

import React, { useState, useEffect } from 'react';
import Header from '@/components/chatbear/Header';
import { BookOpen, Cpu, Sparkles, Trophy, ArrowRight, Eye, RotateCcw } from 'lucide-react';
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
    color: 'bg-yellow-500/10 text-yellow-400',
    borderColor: 'hover:shadow-[0_0_30px_rgba(234,179,8,0.2)]'
  },
  {
    id: 'robotics-mech',
    title: '机械大师：周小麦的创客日志',
    desc: '学习齿轮、连杆与力矩。周小麦分享他搭建第一个机器人的故事。',
    icon: <Cpu className="text-blue-500" />,
    level: 'L2 进阶',
    color: 'bg-blue-500/10 text-blue-400',
    borderColor: 'hover:shadow-[0_0_30px_rgba(59,130,246,0.2)]'
  },
  {
    id: 'eai-flagship',
    title: '具身智能 (EAI) 实战',
    desc: '查特熊旗舰课程。在仿真环境中训练你的第一个机器人 Agent。',
    icon: <BookOpen className="text-purple-500" />,
    level: 'L3 巅峰',
    color: 'bg-purple-500/10 text-purple-400',
    borderColor: 'hover:shadow-[0_0_30px_rgba(139,92,246,0.2)]'
  },
  {
    id: 'competition-prep',
    title: '赛事冲刺：CSP-J/S 与 VEX',
    desc: '针对信奥与机器人大赛的深度优化课程，冲击全国大奖。',
    icon: <Trophy className="text-red-500" />,
    level: 'L4 竞赛',
    color: 'bg-red-500/10 text-red-400',
    borderColor: 'hover:shadow-[0_0_30px_rgba(239,68,68,0.2)]'
  }
];

export default function ChatBearHome() {
  // 3D Tilt animation state
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const card = e.currentTarget;
    const rect = card.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    setTilt({ x: x * 12, y: -y * 12 });
  };
  const handleMouseLeave = () => {
    setTilt({ x: 0, y: 0 });
  };

  // Interactive Sandbox state
  const [sbState, setSbState] = useState<'idle' | 'scanning' | 'moving' | 'grabbed'>('idle');
  const [botPos, setBotPos] = useState({ x: 10, y: 50 }); // percentage
  const [appleGlow, setAppleGlow] = useState(false);
  const [logText, setLogText] = useState('🎮 点击下方的【开启感知】启动雷达探测目标...');

  // Sandbox simulation lifecycle
  useEffect(() => {
    let timer: any;
    if (sbState === 'scanning') {
      setLogText('📡 激光雷达扫描中... 避障传感器已打开，正在感知周围物理空间...');
      timer = setTimeout(() => {
        setSbState('moving');
        setAppleGlow(true);
        setLogText('🍎 [感知成功] 在前方 (80%, 50%) 处锁定物体: Apple! 自动触发移动控制指令...');
      }, 2000);
    } else if (sbState === 'moving') {
      let currentX = 10;
      const interval = setInterval(() => {
        currentX += 2;
        setBotPos({ x: currentX, y: 50 });
        if (currentX >= 72) {
          clearInterval(interval);
          setSbState('grabbed');
          setAppleGlow(false);
          setLogText('🦾 [物理交互] 抵达目标点！启动机械臂，执行力度抓取...');
        }
      }, 50);
      return () => clearInterval(interval);
    } else if (sbState === 'grabbed') {
      timer = setTimeout(() => {
        setLogText('🎉 [挑战完成] 成功抓取苹果！小创Agent说: "小麦，感知-决策-执行管线已闭环！"');
      }, 1500);
    }
    return () => clearTimeout(timer);
  }, [sbState]);

  const handleResetSandbox = () => {
    setSbState('idle');
    setBotPos({ x: 10, y: 50 });
    setAppleGlow(false);
    setLogText('🎮 点击下方的【开启感知】启动雷达探测目标...');
  };

  return (
    <div className="min-h-screen bg-[#0d0e12] text-white selection:bg-blue-500 selection:text-white overflow-x-hidden">
      <Header />
      
      <main>
        {/* Hero Section with Aurora Background */}
        <section className="relative pt-20 pb-36 cb-aurora-bg">
          {/* Subtle Grid overlay */}
          <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none"></div>

          <div className="cb-container relative z-10">
            <div className="flex flex-col lg:flex-row items-center gap-16">
              
              {/* Text Area */}
              <div className="flex-1 text-center lg:text-left">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-yellow-400 text-xs font-black tracking-widest uppercase mb-8 shadow-[0_0_20px_rgba(255,215,0,0.1)]">
                  <span className="relative flex h-2.5 w-2.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-yellow-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-yellow-500"></span>
                  </span>
                  查特熊全球具身智能社区已开放
                </div>
                
                <h1 className="text-5xl lg:text-7xl font-black mb-8 leading-tight tracking-tight">
                  让 AI 拥有<br />
                  <span className="cb-text-gradient bg-gradient-to-r from-yellow-300 via-blue-500 to-purple-400">物理交互</span>的力量
                </h1>
                
                <p className="text-lg text-gray-400 mb-12 max-w-xl mx-auto lg:mx-0 leading-relaxed">
                  查特熊 (ChatBear) 是专为青少年打造的 AI 与具身智能学习平台。
                  在这里，周小麦和小创带你连接传感器与执行器，构建真实的智能物理世界。
                </p>
                
                <div className="flex flex-wrap items-center justify-center lg:justify-start gap-5">
                  <Link href="/chatbear/learn" className="px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-2xl font-black flex items-center gap-2 hover:shadow-[0_0_30px_rgba(59,130,246,0.5)] hover:-translate-y-0.5 transition-all active:scale-95">
                    进入 Bear.Path 学堂 <ArrowRight size={18} />
                  </Link>
                  <Link href="/chatbear/lab" className="px-8 py-4 bg-white/5 border border-white/10 rounded-2xl font-black text-gray-300 hover:bg-white/10 hover:text-white transition-all">
                    进入 AI 实验室
                  </Link>
                </div>
              </div>

              {/* Upgraded 3D Tilt Card Visual */}
              <div className="flex-1 w-full flex justify-center">
                <div 
                  className="cb-perspective w-[300px] h-[300px] lg:w-[480px] lg:h-[480px] cursor-pointer"
                  onMouseMove={handleMouseMove}
                  onMouseLeave={handleMouseLeave}
                >
                  <div 
                    className="w-full h-full rounded-[2.5rem] bg-gradient-to-br from-white/10 to-white/0 border border-white/10 relative overflow-hidden transition-transform duration-200 ease-out shadow-2xl flex items-center justify-center p-8 backdrop-blur-sm"
                    style={{
                      transform: `rotateY(${tilt.x}deg) rotateX(${tilt.y}deg)`,
                      transformStyle: 'preserve-3d'
                    }}
                  >
                    {/* Glowing Aura inside the card */}
                    <div className="absolute -inset-10 bg-gradient-to-tr from-blue-500/20 to-purple-500/20 rounded-full blur-3xl opacity-60"></div>
                    
                    <img 
                      src="/assets/chatbear/xiaomai_and_xiaochuang.png" 
                      alt="周小麦与小创老师" 
                      className="w-full h-full object-contain drop-shadow-[0_20px_50px_rgba(0,123,255,0.3)] transition-transform duration-700 hover:scale-105"
                      style={{ transform: 'translateZ(40px)' }}
                    />
                    
                    {/* Subtitle tag inside card */}
                    <div 
                      className="absolute bottom-6 left-6 right-6 bg-black/60 backdrop-blur-md border border-white/10 p-5 rounded-2xl flex items-center gap-4 shadow-2xl"
                      style={{ transform: 'translateZ(60px)' }}
                    >
                      <div className="w-10 h-10 bg-blue-500/10 rounded-xl flex items-center justify-center shrink-0">
                        <Sparkles className="text-blue-400 animate-pulse" size={20} />
                      </div>
                      <div className="text-left">
                        <p className="text-xs font-black text-blue-400">小创导师：</p>
                        <p className="text-xs text-gray-300">小麦，让我们开始具身机器人的物理大冒险！</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* High-Fidelity Interactive Experience Sandbox */}
        <section className="py-28 bg-[#07080a] border-y border-white/5 relative">
          <div className="cb-container">
            <div className="max-w-3xl mx-auto text-center mb-16">
              <h2 className="text-3xl lg:text-4xl font-black mb-4 tracking-tight">具身智能沙盘体验舱</h2>
              <p className="text-gray-400">在网页中零代码感受“传感器感知 - CPU决策 - 机械执行”的智能闭环管线</p>
            </div>

            <div className="max-w-4xl mx-auto bg-[#0d0e12] border border-white/10 rounded-[2.5rem] overflow-hidden shadow-3xl">
              {/* Radar Grid Sandbox screen */}
              <div className="h-64 bg-black relative border-b border-white/5 overflow-hidden flex items-center justify-center">
                {/* SLAM grid lines */}
                <div className="absolute inset-0 bg-[linear-gradient(rgba(16,185,129,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(16,185,129,0.03)_1px,transparent_1px)] bg-[size:24px_24px]"></div>
                
                {/* Radar Sweep Effect */}
                {sbState === 'scanning' && (
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_10%_50%,rgba(6,182,212,0.15),transparent_60%)] animate-pulse">
                     <div className="absolute left-[10%] top-1/2 -translate-y-1/2 w-64 h-64 border border-cyan-500/20 rounded-full scale-150 animate-ping"></div>
                  </div>
                )}

                {/* Robot Agent */}
                <div 
                  className="absolute transition-all duration-300 flex flex-col items-center"
                  style={{ left: `${botPos.x}%`, top: `${botPos.y}%`, transform: 'translate(-50%, -50%)' }}
                >
                  {/* Radar sensor light beam */}
                  {sbState === 'scanning' && (
                    <div className="absolute left-6 w-96 h-12 bg-gradient-to-r from-cyan-500/20 to-transparent blur-[2px] origin-left rotate-0 pointer-events-none rounded-r-full"></div>
                  )}
                  {sbState === 'moving' && (
                    <div className="absolute left-6 w-48 h-8 bg-gradient-to-r from-yellow-500/10 to-transparent blur-[4px] origin-left rotate-0 pointer-events-none"></div>
                  )}

                  <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center border border-white/20 shadow-2xl relative">
                    <img src="/assets/chatbear/白色机器人IP标准设定图.png" alt="bot" className="w-10 h-10 object-contain" />
                    {sbState === 'moving' && (
                      <span className="absolute -bottom-2 px-2 py-0.5 bg-yellow-500 text-black text-[8px] font-black rounded-full uppercase tracking-tighter scale-90">MOVING</span>
                    )}
                  </div>
                </div>

                {/* Target Apple */}
                {sbState !== 'grabbed' && (
                  <div 
                    className={`absolute right-[20%] top-1/2 -translate-y-1/2 w-12 h-12 flex items-center justify-center rounded-full transition-all duration-500 ${appleGlow ? 'bg-red-500/20 shadow-[0_0_30px_rgba(239,68,68,0.8)] scale-110' : 'bg-transparent'}`}
                  >
                    <span className="text-3xl filter drop-shadow-[0_2px_10px_rgba(239,68,68,0.5)]">🍎</span>
                  </div>
                )}
                
                {/* Robot dialog text bubble */}
                {sbState === 'grabbed' && (
                  <div className="absolute left-[70%] top-[30%] -translate-x-1/2 bg-blue-600 border border-blue-400 p-3 rounded-2xl text-xs font-black shadow-2xl text-white flex items-center gap-2 animate-bounce">
                    <span>🦾 已抓取 Apple!</span>
                  </div>
                )}
              </div>

              {/* Console & Operation bar */}
              <div className="p-8 bg-black/60 backdrop-blur-md">
                <div className="font-mono text-xs text-emerald-400 bg-black/90 p-4 rounded-xl border border-white/5 mb-6 leading-relaxed h-16 flex items-center">
                  <span className="cb-terminal-cursor">{logText}</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex gap-4">
                    <button 
                      onClick={() => setSbState('scanning')}
                      disabled={sbState !== 'idle'}
                      className="px-6 py-3 bg-cyan-600 hover:bg-cyan-700 disabled:bg-white/5 disabled:text-gray-600 rounded-xl text-xs font-black uppercase tracking-widest transition-all active:scale-95 flex items-center gap-2"
                    >
                      <Eye size={14} /> 开启感知
                    </button>
                    <button 
                      onClick={handleResetSandbox}
                      className="px-6 py-3 bg-white/5 hover:bg-white/10 rounded-xl text-xs font-black uppercase tracking-widest transition-all flex items-center gap-2 text-gray-400 hover:text-white"
                    >
                      <RotateCcw size={14} /> 重置沙盘
                    </button>
                  </div>
                  
                  <div className="text-[10px] font-black text-gray-600 uppercase tracking-widest">
                    EMBODIED AI PROTOCOL V1.0
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Upgraded Course Path section */}
        <section className="py-32 bg-[#0d0e12] relative">
          <div className="cb-container">
            <div className="flex flex-col md:flex-row items-start md:items-end justify-between mb-16">
              <div>
                <span className="text-xs font-black tracking-widest text-blue-500 uppercase block mb-3">SYSTEMATIC LEARNING</span>
                <h2 className="text-3xl lg:text-4xl font-black tracking-tight">Bear.Path 学习路径</h2>
              </div>
              <Link href="/chatbear/learn" className="text-sm font-black text-blue-400 hover:text-blue-300 flex items-center gap-1 group mt-4 md:mt-0 transition-colors">
                查看学堂全部课程 <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              {courses.map((course) => (
                <Link href={`/chatbear/learn`} key={course.id}>
                  <div className={`cb-card-glow bg-white/5 border border-white/5 p-8 flex gap-6 cursor-pointer group h-full transition-all ${course.borderColor}`}>
                    <div className={`w-16 h-16 ${course.color} rounded-2xl flex items-center justify-center shrink-0 group-hover:scale-110 transition-all duration-300 shadow-lg`}>
                      {course.icon}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-3">
                        <span className="text-[10px] font-black tracking-widest text-gray-500 uppercase">{course.level}</span>
                        <span className="w-1 h-1 bg-white/20 rounded-full"></span>
                        <span className="text-[10px] font-bold text-emerald-400">内容持续更新</span>
                      </div>
                      <h3 className="text-xl font-bold mb-2 group-hover:text-blue-400 transition-colors">{course.title}</h3>
                      <p className="text-gray-400 text-sm leading-relaxed mb-6">
                        {course.desc}
                      </p>
                      <div className="flex items-center gap-4 text-xs font-bold text-gray-500">
                        <span>15 节核心课</span>
                        <span>•</span>
                        <span>4250 名青少年已加入</span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* Upgraded Quote Section with Glassmorphism */}
        <section className="py-24 bg-gradient-to-b from-[#0d0e12] to-[#07080a]">
          <div className="cb-container">
            <div className="max-w-4xl mx-auto bg-white/5 border border-white/10 rounded-[3rem] p-12 lg:p-24 relative overflow-hidden text-center backdrop-blur-sm shadow-3xl">
              <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_0%,rgba(0,123,255,0.1),transparent_60%)]"></div>
              
              <blockquote className="text-2xl lg:text-3xl font-medium mb-12 leading-relaxed relative z-10 text-gray-100 max-w-2xl mx-auto">
                “每一个孩子的奇思妙想，都是未来人工智能的火花。我和小创在这里，等你一起点燃它！”
              </blockquote>
              
              <div className="flex items-center justify-center gap-4 relative z-10">
                <div className="w-14 h-14 rounded-2xl overflow-hidden border border-white/20 bg-white/5 flex items-center justify-center shrink-0">
                  <img src="/assets/chatbear/xiaomai_and_xiaochuang.png" alt="周小麦" className="w-full h-full object-contain scale-125 translate-y-1.5" />
                </div>
                <div className="text-left">
                  <p className="font-bold text-base">周小麦</p>
                  <p className="text-xs text-blue-400 font-bold uppercase tracking-wider">查特熊首席探索官</p>
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
