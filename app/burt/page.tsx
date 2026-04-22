"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "motion/react";
import { ChevronRight, Download, Activity, Cpu, Bot, Rocket, BookOpen, Trophy } from "lucide-react";

export default function BurtCoursePlan() {
  const [modelLoss, setModelLoss] = useState(0.85);
  const [syncRate, setSyncRate] = useState(12);

  // Simulate real-time metrics update
  useEffect(() => {
    const interval = setInterval(() => {
      setModelLoss(prev => Math.max(0.01, prev - Math.random() * 0.05));
      setSyncRate(prev => Math.min(99.9, prev + Math.random() * 2));
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  const fadeIn: any = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" } }
  };

  const staggerContainer: any = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.2 } }
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 font-sans selection:bg-blue-500 selection:text-white pb-24 overflow-x-hidden">
      {/* Navbar overlay */}
      <motion.nav 
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="fixed top-0 w-full backdrop-blur-xl bg-neutral-950/70 border-b border-neutral-800 z-50"
      >
        <div className="max-w-6xl mx-auto px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="font-semibold text-lg tracking-wide flex items-center gap-2">
            <span className="text-blue-500">X-LAB</span> <span>|</span> <span className="text-neutral-300">Burt's Blueprint</span>
          </div>
          <div className="hidden sm:flex space-x-6 text-sm font-medium text-neutral-400">
            <a href="#vision" className="hover:text-white transition">Vision</a>
            <a href="#hardware" className="hover:text-white transition">Hardware & Sim</a>
            <a href="#roadmap" className="hover:text-white transition">Roadmap</a>
          </div>
        </div>
      </motion.nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 px-6 lg:px-8 max-w-6xl mx-auto flex flex-col items-center text-center">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-600/20 rounded-full blur-[120px] pointer-events-none"></div>
        
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-semibold uppercase tracking-widest mb-8 hover:bg-blue-500/20 transition-colors cursor-pointer"
        >
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
          </span>
          Project X-Lab Auto-Evolution
        </motion.div>

        <motion.h1 
          variants={fadeIn}
          initial="hidden"
          animate="visible"
          className="text-5xl lg:text-7xl font-extrabold tracking-tight mb-6 bg-gradient-to-br from-white via-neutral-200 to-neutral-500 bg-clip-text text-transparent"
        >
          Burt's Embodied AI <br className="hidden lg:block" /> Research Initiative
        </motion.h1>
        
        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.8 }}
          className="text-lg lg:text-xl text-neutral-400 max-w-2xl leading-relaxed mb-10"
        >
          Bridging the gap between High-Frequency Quantitative Computing and Real-World Physical Interaction. A dedicated 50-week sprint towards Ivy League excellence.
        </motion.p>

        <motion.div 
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 1 }}
          className="w-full relative rounded-2xl overflow-hidden border border-neutral-800 shadow-2xl shadow-blue-900/20 group"
        >
          <Image 
            src="/images/burt/hero.png" 
            alt="AI Robotic Arm Design" 
            width={1200} 
            height={600} 
            className="w-full h-auto object-cover group-hover:scale-105 transition-transform duration-[2000ms] ease-out"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-transparent to-transparent opacity-80"></div>
          
          {/* Hero Overlay Data Metrics */}
          <div className="absolute bottom-6 left-6 right-6 hidden md:flex justify-between items-end">
            <div className="bg-neutral-900/80 backdrop-blur-md border border-neutral-700 rounded-xl p-4 flex gap-4">
              <div>
                <p className="text-xs text-neutral-400 uppercase">Core Framework</p>
                <p className="font-mono text-blue-400 font-semibold">LeRobot SO-100</p>
              </div>
              <div className="w-px bg-neutral-700"></div>
              <div>
                <p className="text-xs text-neutral-400 uppercase">Architecture</p>
                <p className="font-mono text-cyan-400 font-semibold">Transformer / ACT</p>
              </div>
            </div>
            <button className="bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20 text-white px-6 py-3 rounded-xl font-medium transition-all flex items-center gap-2 group/btn">
              <Download className="w-4 h-4 group-hover/btn:-translate-y-1 transition-transform" />
              Download Prospectus
            </button>
          </div>
        </motion.div>
      </section>

      {/* Vision Section */}
      <section id="vision" className="py-20 px-6 lg:px-8 max-w-5xl mx-auto overflow-hidden">
        <motion.div 
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={fadeIn}
          className="grid md:grid-cols-2 gap-16 items-center"
        >
          <div>
            <h2 className="text-3xl lg:text-4xl font-bold mb-6 text-white tracking-tight">从虚拟走向实体，<br/>打破“量化”同质化困局。</h2>
            <p className="text-neutral-400 leading-relaxed mb-4">
              我们深知，对于冲刺藤校等顶尖美本的阶段，传统、纯后台数据的“金融量化回测”类项目在申请池中极易陷入同源与同质化。
            </p>
            <p className="text-neutral-400 leading-relaxed mb-4">
              本课题的战略使命，是为 Burt 极强的“宏观环境认知与数据算力”底色上，再武装上一把<strong className="text-white">“物理世界的破冰利刃”</strong>。我们将带他进入目前全球最前沿的交叉学科——<strong className="text-blue-400">具身智能（Embodied AI）</strong>。
            </p>
          </div>
          
          <motion.div 
            whileHover={{ scale: 1.02 }}
            className="relative group"
          >
            <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-cyan-500 rounded-2xl blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
            <div className="relative rounded-2xl overflow-hidden bg-neutral-900 border border-neutral-800 p-8 h-full">
              <Activity className="w-10 h-10 text-blue-500 mb-6" />
              <h3 className="text-xl font-semibold text-white mb-3">AI Model & Mathematical Foundation</h3>
              <p className="text-sm text-neutral-400">将已有的高等数学与特征工程能力，降维融合至机器人运动学矩阵与物理强化学习空间，完成知识迁移的底层闭环。</p>
            </div>
          </motion.div>
        </motion.div>
      </section>

      {/* Core Hardware & Dashboard Section */}
      <section id="hardware" className="py-24 bg-neutral-900/50 border-y border-neutral-800/50 relative overflow-hidden">
        <div className="absolute right-0 top-0 w-1/3 h-full bg-blue-900/10 blur-[100px] pointer-events-none"></div>
        <div className="px-6 lg:px-8 max-w-6xl mx-auto">
          
          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeIn}
            className="text-center mb-16"
          >
            <h2 className="text-3xl lg:text-4xl font-bold tracking-tight mb-4 text-white">核心硬件平台：直击工业最前沿</h2>
            <p className="text-neutral-400 max-w-2xl mx-auto">告别黑盒教具，介入全球顶尖开源架构的底层控制</p>
          </motion.div>

          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div 
              variants={staggerContainer}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className="space-y-8"
            >
              {[
                { icon: <Bot className="w-6 h-6"/>, color: "text-blue-500", bg: "bg-blue-500/10", border: "border-blue-500/20", title: "国际顶级开源社区赋能", desc: "基于 Hugging Face 提供战略框架支持的核心研究版机械臂。直接站在全球顶级 AI 工程师圈子的起跑线上展开研究。" },
                { icon: <Cpu className="w-6 h-6"/>, color: "text-cyan-500", bg: "bg-cyan-500/10", border: "border-cyan-500/20", title: "底层白盒深度探索", desc: "绝不局限于简单的 API 调用，底层控制彻底开放。调取每一个机械关节底层的电流反馈、PID闭环与力矩数据。" },
                { icon: <Rocket className="w-6 h-6"/>, color: "text-indigo-400", bg: "bg-indigo-500/10", border: "border-indigo-500/20", title: "Sim-to-Real 的跨越挑战", desc: "让最先进的算法模型下放真机，对抗滑脱与振动，经历学术界最热门的“从数字孪生到物理实体”挑战。" }
              ].map((item, idx) => (
                <motion.div key={idx} variants={fadeIn} className="flex gap-4 group">
                  <div className={`flex-shrink-0 w-14 h-14 rounded-2xl ${item.bg} flex items-center justify-center border ${item.border} group-hover:scale-110 transition-transform`}>
                    <div className={item.color}>{item.icon}</div>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-2 group-hover:text-blue-400 transition-colors">{item.title}</h3>
                    <p className="text-neutral-400 text-sm leading-relaxed">{item.desc}</p>
                  </div>
                </motion.div>
              ))}
            </motion.div>
            
            {/* Live Interactive Dashboard Panel */}
            <motion.div 
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="rounded-2xl overflow-hidden border border-neutral-800 bg-neutral-950 shadow-2xl relative flex flex-col"
            >
              <div className="h-10 bg-neutral-900 border-b border-neutral-800 flex items-center px-4 gap-2">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-red-500/80"></div>
                  <div className="w-3 h-3 rounded-full bg-yellow-500/80"></div>
                  <div className="w-3 h-3 rounded-full bg-green-500/80"></div>
                </div>
                <div className="ml-4 font-mono text-[10px] text-neutral-500 uppercase">Sim2Real Telemetry Live</div>
              </div>
              
              <div className="p-6 relative">
                 <Image 
                  src="/images/burt/sim2real.png" 
                  alt="Sim-to-Real Robotics" 
                  width={800} 
                  height={400} 
                  className="w-full h-48 object-cover rounded-lg border border-neutral-800 mb-6 opacity-60 mix-blend-screen"
                />
                
                {/* Simulated Live Data Overlay */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-neutral-900/80 border border-neutral-800 rounded-xl p-4">
                    <p className="text-neutral-500 text-xs font-mono mb-1">Model Loss (MSE)</p>
                    <p className="text-3xl font-mono text-cyan-400 font-bold">{modelLoss.toFixed(4)}</p>
                    <div className="w-full bg-neutral-800 h-1 mt-2 rounded-full overflow-hidden">
                      <motion.div 
                        className="bg-cyan-500 h-full" 
                        animate={{ width: `${(1 - modelLoss) * 100}%` }}
                        transition={{ ease: "linear", duration: 2 }}
                      />
                    </div>
                  </div>
                  <div className="bg-neutral-900/80 border border-neutral-800 rounded-xl p-4">
                    <p className="text-neutral-500 text-xs font-mono mb-1">Action Sync Rate</p>
                    <p className="text-3xl font-mono text-blue-500 font-bold">{syncRate.toFixed(1)}%</p>
                    <div className="w-full bg-neutral-800 h-1 mt-2 rounded-full overflow-hidden">
                      <motion.div 
                        className="bg-blue-500 h-full shadow-[0_0_10px_#3b82f6]" 
                        animate={{ width: `${syncRate}%` }}
                        transition={{ ease: "linear", duration: 2 }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Roadmap Section */}
      <section id="roadmap" className="py-24 px-6 lg:px-8 max-w-5xl mx-auto">
        <motion.div 
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeIn}
          className="text-center mb-20"
        >
          <h2 className="text-3xl lg:text-4xl font-bold tracking-tight mb-4 bg-gradient-to-r from-white to-neutral-400 bg-clip-text text-transparent">项目里程碑（50周冲刺路线）</h2>
          <p className="text-neutral-400 max-w-2xl mx-auto">
            建立一套真实科技原型 + 产出一篇国际高含金量学术论文
          </p>
        </motion.div>

        <div className="space-y-6 relative">
          {[
            { tag: "M1", color: "blue", period: "Weeks 1 - 12 (约 12 周)", title: "跨越极客底座，重构AI认知", items: ["Ubuntu、Git 工业级操作", "深入 ROS2 框架理解节点分布式通信", "直击 PyTorch 本质，攻克 Transformer"] },
            { tag: "M2", color: "cyan", period: "Weeks 13 - 22 (约 10 周)", title: "站在学术巅峰，主导虚拟仿真", items: ["剖析国际顶会综述原刊，理解进化史", "构建虚拟孪生：引入 Isaac Sim 物理引擎", "复现经典端到端模仿学习模型 (ACT)"] },
            { tag: "M3", color: "purple", period: "Weeks 23 - 47 (核心攻坚 25 周)", title: "核心攻坚期——突破物理屏障", items: ["手算运动学变换与实操双环 PID 控制", "录制人类专家数据对齐，Sim2Real部署", "变阻抗控制、多模态感官判断发掘学术Gap"] },
            { tag: "M4", color: "green", period: "Weeks 48 - 50 (约 3 周)", title: "知识收网与荣誉变现", items: ["掌握对照消融实验与严谨图表可视化", "论文撰写：高阶 Abstract 至 Exp 结版", "形成系统脱稿答辩战力，应对国际目光"] },
          ].map((mile, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ delay: i * 0.15 }}
              whileHover={{ scale: 1.01 }}
              className="w-full p-6 sm:p-8 rounded-3xl bg-neutral-900 border border-neutral-800 hover:border-neutral-700 hover:bg-neutral-800/80 transition-all group cursor-default"
            >
              <div className="flex flex-col sm:flex-row sm:items-center gap-6">
                <div className={`w-16 h-16 rounded-2xl bg-${mile.color}-500/10 border border-${mile.color}-500/20 flex flex-col items-center justify-center shrink-0`}>
                  <span className={`text-${mile.color}-500 font-mono font-black text-xl`}>{mile.tag}</span>
                </div>
                <div className="flex-1">
                  <span className={`text-${mile.color}-400 font-mono text-xs uppercase tracking-widest block mb-2`}>{mile.period}</span>
                  <h3 className="text-2xl font-bold text-white mb-4">{mile.title}</h3>
                  <div className="flex flex-wrap gap-3">
                    {mile.items.map((item, idx) => (
                      <span key={idx} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-neutral-950 border border-neutral-800 text-xs text-neutral-300">
                        <ChevronRight className={`w-3 h-3 text-${mile.color}-500`} />
                        {item}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="mt-16 flex flex-col sm:flex-row justify-center gap-4">
          <Link href="/burt/syllabus" className="inline-flex justify-center items-center gap-2 px-8 py-4 rounded-full bg-neutral-100 text-neutral-950 font-bold hover:bg-white hover:scale-105 active:scale-95 transition-all shadow-lg group">
            <BookOpen className="w-5 h-5" />
            查看全量课程大纲 V1.0 (Syllabus)
          </Link>
          <Link href="/burt/outcomes" className="inline-flex justify-center items-center gap-2 px-8 py-4 rounded-full border border-neutral-700 bg-neutral-900 text-white font-bold hover:bg-neutral-800 hover:border-neutral-600 hover:scale-105 active:scale-95 transition-all shadow-lg shadow-blue-500/10 group">
            <Trophy className="w-5 h-5 text-blue-400 group-hover:text-blue-300 transition-colors" />
            前置浏览项目成果出口 (Outcomes)
          </Link>
        </div>
      </section>

      {/* Footer Visual */}
      <motion.section 
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        className="py-20 px-6 max-w-4xl mx-auto flex flex-col items-center border-t border-neutral-800/50 mt-10"
      >
        <div className="w-full max-w-2xl rounded-2xl overflow-hidden border border-neutral-800 shadow-2xl mb-8 relative">
           <Image 
            src="/images/burt/milestone.png" 
            alt="AI Innovation" 
            width={800} 
            height={400} 
            className="w-full h-48 sm:h-64 object-cover"
          />
          <div className="absolute inset-0 bg-neutral-950/20 mix-blend-overlay"></div>
        </div>
        <p className="text-center text-neutral-400 text-sm leading-relaxed max-w-2xl font-medium">
          Burt 的数学与逻辑基本盘非常棒，我们坚信这条极具挑战与深度的“代码造物”科研之路，将极大构筑他在顶尖大学申请池中的独特竞争内核。
        </p>
      </motion.section>
      
    </div>
  );
}
