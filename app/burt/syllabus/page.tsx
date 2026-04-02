"use client";

import React from "react";
import { motion } from "motion/react";
import Image from "next/image";
import Link from "next/link";
import { 
  ChevronLeft, Database, Cpu, Share2, Layers, 
  TerminalSquare, GitMerge, Rotate3D, Wrench, Focus
} from "lucide-react";

export default function BurtSyllabus() {
  const fadeIn = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" as const } }
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.15 } }
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 font-sans selection:bg-blue-500 selection:text-white pb-24 overflow-x-hidden">
      {/* Navbar */}
      <nav className="fixed top-0 w-full backdrop-blur-xl bg-neutral-950/80 border-b border-neutral-800 z-50">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center gap-4">
          <Link href="/burt" className="p-2 -ml-2 rounded-lg hover:bg-neutral-800 transition-colors text-neutral-400 hover:text-white flex items-center justify-center">
            <ChevronLeft className="w-5 h-5" />
          </Link>
          <div className="font-semibold text-lg tracking-wide flex items-center gap-2">
            <span className="text-blue-500">X-LAB</span> <span className="text-neutral-600">/</span> <span className="text-neutral-300">Syllabus Breakdown</span>
          </div>
        </div>
      </nav>

      <main className="pt-32 px-6 lg:px-8 max-w-6xl mx-auto">
        <motion.div initial="hidden" animate="visible" variants={fadeIn} className="mb-20">
          <h1 className="text-4xl lg:text-5xl font-extrabold tracking-tight mb-4 text-white">
            Embodied AI 50-Week Curriculum
          </h1>
          <p className="text-neutral-400 text-lg max-w-3xl leading-relaxed">
            全量课程大纲 V1.0 深度切片。基于项目路线，系统拆解 Burt 未来将面临的底层极客基建、模拟引擎环境以及核心硬件控制体系。
          </p>
        </motion.div>

        {/* --- 专业术语展板 (The Requested Glossary with Internet Images/SVGs) --- */}
        <motion.section 
          initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-50px" }} variants={staggerContainer}
          className="mb-24"
        >
          <motion.h2 variants={fadeIn} className="text-2xl font-bold text-white mb-8 border-b border-neutral-800 pb-4">
            核心技术栈与专业术语库
          </motion.h2>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            
            {/* Term 1: Hugging Face */}
            <motion.div variants={fadeIn} className="bg-neutral-900 border border-neutral-800 rounded-3xl p-6 hover:bg-neutral-800/80 transition-colors">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center border border-white/10 shrink-0">
                  <Image 
                    src="https://huggingface.co/front/assets/huggingface_logo-noborder.svg" 
                    alt="Hugging Face Logo" width={28} height={28} 
                  />
                </div>
                <h3 className="text-xl font-bold text-white">Hugging Face</h3>
              </div>
              <p className="text-neutral-400 text-sm leading-relaxed mb-4">
                全球最大的开源 AI 社区底座。为您提供开源版的自动驾驶及机器人操作大模型底库（例如 LeRobot 框架），是目前工业界获取和分享 AI 权重的首选。
              </p>
              <div className="w-full bg-neutral-950 rounded-xl p-3 flex justify-between items-center text-xs text-neutral-500 font-mono border border-neutral-800">
                <span>Domain</span>
                <span className="text-yellow-500 bg-yellow-500/10 px-2 py-0.5 rounded">Model Hub</span>
              </div>
            </motion.div>

            {/* Term 2: Isaac Sim */}
            <motion.div variants={fadeIn} className="bg-neutral-900 border border-neutral-800 rounded-3xl p-6 hover:bg-neutral-800/80 transition-colors">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-green-500/10 rounded-2xl flex items-center justify-center border border-green-500/20 shrink-0">
                  <Rotate3D className="w-6 h-6 text-green-500" />
                </div>
                <h3 className="text-xl font-bold text-white">NVIDIA Isaac Sim</h3>
              </div>
              <p className="text-neutral-400 text-sm leading-relaxed mb-4">
                英伟达建立的宇宙级工业仿真环境（Omniverse）。我们在此平台进行千百次机器人动作推理，模拟重力与物理碰撞，确认安全后再下发到现实世界的机械臂。
              </p>
              <div className="w-full bg-neutral-950 rounded-xl p-3 flex gap-2 flex-wrap items-center text-xs font-mono border border-neutral-800">
                <span className="text-green-400 bg-green-400/10 px-2 py-0.5 rounded border border-green-400/20">Graphics</span>
                <span className="text-neutral-400 bg-neutral-800 px-2 py-0.5 rounded border border-neutral-700">Physics Env</span>
              </div>
            </motion.div>

            {/* Term 3: PyTorch & Transformer */}
            <motion.div variants={fadeIn} className="bg-neutral-900 border border-neutral-800 rounded-3xl p-6 hover:bg-neutral-800/80 transition-colors">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-red-500/10 rounded-2xl flex items-center justify-center border border-red-500/20 shrink-0">
                  <Layers className="w-6 h-6 text-red-500" />
                </div>
                <h3 className="text-xl font-bold text-white">Transformer & RL</h3>
              </div>
              <p className="text-neutral-400 text-sm leading-relaxed mb-4">
                改变 AI 历史的架构（ChatGPT的核心）。本项目将引导学生掌握视觉和动作特征序列化，利用强化学习 (RL) 让机器人自我纠错进化。
              </p>
              <div className="w-full bg-neutral-950 rounded-xl p-3 flex justify-between items-center text-xs text-neutral-500 font-mono border border-neutral-800">
                <span>Architecture</span>
                <span className="text-red-400 bg-red-400/10 px-2 py-0.5 rounded">Neural Net</span>
              </div>
            </motion.div>

            {/* Term 4: Sim2Real */}
            <motion.div variants={fadeIn} className="md:col-span-2 lg:col-span-3 bg-gradient-to-r from-blue-900/20 to-neutral-900 border border-blue-900/40 rounded-3xl p-8 flex flex-col md:flex-row items-center gap-10">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-4">
                  <Share2 className="w-8 h-8 text-blue-500" />
                  <h3 className="text-2xl font-bold text-white">Sim2Real (极客鸿沟跨越)</h3>
                </div>
                <p className="text-neutral-300 leading-relaxed mb-6">
                  “虚拟到现实”的转移能力是 Embodied AI 顶级实验室的命题。纯代码世界没有“电机磨损”和“传感器噪点”，而我们的目标就是用巧妙的控制算法去抚平这道巨大的 Reality Gap。
                </p>
                <div className="flex flex-wrap gap-4">
                  <div className="flex items-center gap-2 text-sm text-neutral-400 bg-neutral-950 px-4 py-2 rounded-full border border-neutral-800">
                    <Focus className="w-4 h-4 text-cyan-400" /> 阻抗控制 (Impedance Control)
                  </div>
                  <div className="flex items-center gap-2 text-sm text-neutral-400 bg-neutral-950 px-4 py-2 rounded-full border border-neutral-800">
                    <Wrench className="w-4 h-4 text-yellow-400" /> PID 调参体系
                  </div>
                </div>
              </div>
              
              {/* Infographic SVG Element for Sim2Real */}
              <div className="w-full md:w-1/3 shrink-0 flex items-center justify-center p-6 bg-neutral-950/50 rounded-2xl border border-neutral-800/50 relative">
                {/* Simulated SVG Pipeline Graphic */}
                <svg viewBox="0 0 400 150" className="w-full h-auto drop-shadow-lg">
                   {/* Virtual Side */}
                   <rect x="20" y="25" width="100" height="100" rx="16" fill="#1e1b4b" stroke="#6366f1" strokeWidth="3" />
                   <path d="M40 75 h60 M70 45 v60" stroke="#818cf8" strokeWidth="2" opacity="0.5" strokeDasharray="4 4" />
                   <text x="70" y="80" textAnchor="middle" fill="#818cf8" fontSize="14" fontWeight="bold">Sim (虚拟)</text>
                   
                   {/* Flow Arrow */}
                   <path d="M130 75 C180 75, 220 75, 270 75" stroke="#3b82f6" strokeWidth="3" fill="none" className="animate-pulse" />
                   <circle cx="200" cy="75" r="15" fill="#0f172a" stroke="#3b82f6" strokeWidth="3" />
                   <text x="200" y="80" textAnchor="middle" fill="#60a5fa" fontSize="12" fontWeight="bold">AI</text>
                   <polygon points="260,65 275,75 260,85" fill="#3b82f6" />

                   {/* Real Side */}
                   <rect x="280" y="25" width="100" height="100" rx="16" fill="#064e3b" stroke="#10b981" strokeWidth="3" />
                   <circle cx="330" cy="75" r="25" fill="none" stroke="#34d399" strokeWidth="2" opacity="0.6" />
                   <circle cx="330" cy="75" r="10" fill="#34d399" />
                   <text x="330" y="115" textAnchor="middle" fill="#34d399" fontSize="14" fontWeight="bold">Real (现实)</text>
                </svg>
              </div>
            </motion.div>
          </div>
        </motion.section>

        {/* --- Information Graphics / SVG Timeline for Course Sections --- */}
        <motion.section 
          initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-50px" }} variants={staggerContainer}
        >
          <motion.h2 variants={fadeIn} className="text-2xl font-bold text-white mb-8 border-b border-neutral-800 pb-4">
            阶段精讲图示 (全景进度表)
          </motion.h2>

          <div className="flex flex-col gap-8">
            {/* Step 1 */}
            <motion.div variants={fadeIn} className="flex flex-col md:flex-row gap-6 bg-neutral-900 border border-neutral-800 rounded-3xl p-2 relative overflow-hidden">
               <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent pointer-events-none"></div>
               
               {/* Left Visual SVG */}
               <div className="w-full md:w-64 h-48 md:h-auto bg-neutral-950 rounded-2xl flex items-center justify-center shrink-0 border border-neutral-800/50 p-6 relative">
                 <TerminalSquare className="w-20 h-20 text-blue-500/30 font-thin absolute right-4 bottom-4" />
                 <div className="z-10 w-full">
                    <div className="w-full h-3 bg-neutral-800 rounded-full mb-3 overflow-hidden"><div className="h-full bg-blue-500 w-[80%]"></div></div>
                    <div className="w-full h-3 bg-neutral-800 rounded-full mb-3 overflow-hidden"><div className="h-full bg-blue-400 w-[50%]"></div></div>
                    <div className="w-full h-3 bg-neutral-800 rounded-full overflow-hidden"><div className="h-full bg-cyan-500 w-[90%]"></div></div>
                 </div>
               </div>

               <div className="p-6 md:pl-2 flex-1 relative z-10">
                 <div className="inline-flex items-center gap-2 px-3 py-1 rounded bg-blue-500/10 text-blue-400 text-xs font-bold mb-4">
                    阶段 1 / Weeks 1-12
                 </div>
                 <h3 className="text-2xl font-bold text-white mb-3">环境与算法前置准备</h3>
                 <p className="text-neutral-400 leading-relaxed text-sm mb-4">
                   系统搭建物理实体所需的开发环境，脱离 Windows 图形界面，掌握 Linux 终端指令集、Git 工业流，攻克 ROS2 与 PyTorch。
                 </p>
                 <div className="grid grid-cols-2 gap-3 text-xs text-neutral-300 font-mono">
                    <span className="flex items-center gap-1.5"><div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div> Ubuntu 22.04 LTS</span>
                    <span className="flex items-center gap-1.5"><div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div> Git Hooks & CI/CD</span>
                    <span className="flex items-center gap-1.5"><div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div> ROS2 Humble Nodes</span>
                    <span className="flex items-center gap-1.5"><div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div> 基础卷积与微积分链式求导</span>
                 </div>
               </div>
            </motion.div>

            {/* Step 2 */}
            <motion.div variants={fadeIn} className="flex flex-col md:flex-row gap-6 bg-neutral-900 border border-neutral-800 rounded-3xl p-2 relative overflow-hidden">
               <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-transparent pointer-events-none"></div>
               
               <div className="w-full md:w-64 h-48 md:h-auto bg-neutral-950 rounded-2xl flex items-center justify-center shrink-0 border border-neutral-800/50 p-6 relative">
                 <Database className="w-20 h-20 text-purple-500/30 font-thin absolute right-4 bottom-4" />
                 <svg viewBox="0 0 100 100" className="w-24 h-24 z-10">
                    <path d="M50 10 L80 30 L80 70 L50 90 L20 70 L20 30 Z" fill="none" stroke="#a855f7" strokeWidth="4" />
                    <circle cx="50" cy="50" r="10" fill="#c084fc" />
                    <line x1="50" y1="10" x2="50" y2="40" stroke="#a855f7" strokeWidth="2" />
                    <line x1="80" y1="70" x2="55" y2="55" stroke="#a855f7" strokeWidth="2" />
                    <line x1="20" y1="70" x2="45" y2="55" stroke="#a855f7" strokeWidth="2" />
                 </svg>
               </div>

               <div className="p-6 md:pl-2 flex-1 relative z-10">
                 <div className="inline-flex items-center gap-2 px-3 py-1 rounded bg-purple-500/10 text-purple-400 text-xs font-bold mb-4">
                    阶段 2 / Weeks 13-22
                 </div>
                 <h3 className="text-2xl font-bold text-white mb-3">顶刊精读与虚拟克隆</h3>
                 <p className="text-neutral-400 leading-relaxed text-sm mb-4">
                   利用 MuJoCo 引入高仿真物理场引擎。通过大规模人类监督数据注入模拟场，跑通一套最基础的动作跟随大脑。
                 </p>
                 <div className="grid grid-cols-2 gap-3 text-xs text-neutral-300 font-mono">
                    <span className="flex items-center gap-1.5"><div className="w-1.5 h-1.5 rounded-full bg-purple-500"></div> IEEE ICRA 解析</span>
                    <span className="flex items-center gap-1.5"><div className="w-1.5 h-1.5 rounded-full bg-purple-500"></div> URDF 机器结构语法</span>
                    <span className="flex items-center gap-1.5"><div className="w-1.5 h-1.5 rounded-full bg-purple-500"></div> Diffusion Action Model</span>
                    <span className="flex items-center gap-1.5"><div className="w-1.5 h-1.5 rounded-full bg-purple-500"></div> Isaac Gym 强化集群</span>
                 </div>
               </div>
            </motion.div>

            {/* Step 3 */}
            <motion.div variants={fadeIn} className="flex flex-col md:flex-row gap-6 bg-neutral-900 border border-neutral-800 rounded-3xl p-2 relative overflow-hidden">
               <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-transparent pointer-events-none"></div>
               
               <div className="w-full md:w-64 h-48 md:h-auto bg-neutral-950 rounded-2xl flex items-center justify-center shrink-0 border border-neutral-800/50 p-6 relative">
                 <GitMerge className="w-20 h-20 text-green-500/30 font-thin absolute right-4 bottom-4" />
                 <div className="w-32 h-32 relative flex items-center justify-center">
                    <div className="absolute inset-2 border-[4px] border-green-500 border-t-transparent rounded-full animate-spin"></div>
                    <div className="absolute inset-6 border-[4px] border-emerald-400 border-b-transparent rounded-full animate-[spin_3s_linear_infinite_reverse]"></div>
                    <Cpu className="w-8 h-8 text-white z-10" />
                 </div>
               </div>

               <div className="p-6 md:pl-2 flex-1 relative z-10">
                 <div className="inline-flex items-center gap-2 px-3 py-1 rounded bg-green-500/10 text-green-400 text-xs font-bold mb-4">
                    阶段 3 / Weeks 23-47
                 </div>
                 <h3 className="text-2xl font-bold text-white mb-3">核心攻坚：实体操作降临</h3>
                 <p className="text-neutral-400 leading-relaxed text-sm mb-4">
                   最艰难的实物调试期。控制真实硬件力矩，校准机械误差，将算法下放到 LeRobot 实现跨维度控制同步，彻底掌握闭环。
                 </p>
                 <div className="grid grid-cols-2 gap-3 text-xs text-neutral-300 font-mono">
                    <span className="flex items-center gap-1.5"><div className="w-1.5 h-1.5 rounded-full bg-green-500"></div> Teleoperation 标定</span>
                    <span className="flex items-center gap-1.5"><div className="w-1.5 h-1.5 rounded-full bg-green-500"></div> 电源与串口协议层</span>
                    <span className="flex items-center gap-1.5"><div className="w-1.5 h-1.5 rounded-full bg-green-500"></div> 多模态摄像头时序对齐</span>
                    <span className="flex items-center gap-1.5"><div className="w-1.5 h-1.5 rounded-full bg-green-500"></div> 振荡反馈与卡尔曼滤波</span>
                 </div>
               </div>
            </motion.div>

          </div>
        </motion.section>

      </main>
    </div>
  );
}
