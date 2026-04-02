"use client";

import React from "react";
import { motion } from "motion/react";
import Image from "next/image";
import Link from "next/link";
import { 
  ChevronLeft, Github, FileText, Trophy, Rocket, Laptop, BookOpen, Fingerprint
} from "lucide-react";

export default function BurtOutcomes() {
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
      {/* Navbar overlay */}
      <nav className="fixed top-0 w-full backdrop-blur-xl bg-neutral-950/70 border-b border-neutral-800 z-50 transition-all">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center gap-4">
          <Link href="/burt" className="p-2 -ml-2 rounded-lg hover:bg-neutral-800 transition-colors text-neutral-400 hover:text-white flex items-center justify-center">
            <ChevronLeft className="w-5 h-5" />
          </Link>
          <div className="font-semibold text-lg tracking-wide flex items-center gap-2">
            <span className="text-blue-500">X-LAB</span> <span className="text-neutral-600">/</span> <span className="text-neutral-300">Outputs & Deliverables</span>
          </div>
        </div>
      </nav>

      <main className="pt-32 px-6 lg:px-8 max-w-6xl mx-auto">
        <motion.div initial="hidden" animate="visible" variants={fadeIn} className="mb-20 text-center max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-green-500/10 border border-green-500/20 text-green-400 text-xs font-semibold uppercase tracking-widest mb-6">
            <Trophy className="w-4 h-4" /> Final Deliverables
          </div>
          <h1 className="text-4xl lg:text-6xl font-extrabold tracking-tight mb-6 bg-gradient-to-br from-white via-neutral-200 to-neutral-500 bg-clip-text text-transparent">
            科研战果与成果出口
          </h1>
          <p className="text-neutral-400 text-lg leading-relaxed">
            藤校招生官看重的不再是单纯的标化成绩，而是真实世界的“工程造物能力”与“开源极客精神”。以下是 Burt 在整个 50 周周期结束时，必将向梦校展现的四大重磅成就。
          </p>
        </motion.div>

        {/* --- 核心出口一：GitHub 开源精神档案 --- */}
        <motion.section 
          initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-50px" }} variants={staggerContainer}
          className="mb-24"
        >
          <div className="grid lg:grid-cols-2 gap-12 items-center bg-gradient-to-br from-neutral-900 to-black border border-neutral-800 rounded-3xl p-8 lg:p-12 relative overflow-hidden">
             <div className="absolute right-0 top-0 w-1/2 h-full bg-blue-600/5 blur-[100px] pointer-events-none"></div>

             <div>
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center">
                    <Github className="w-6 h-6 text-white" />
                  </div>
                  <h2 className="text-2xl font-bold text-white">GitHub 极客档案 (首要战略出口)</h2>
                </div>
                <p className="text-neutral-300 leading-relaxed mb-6">
                  这是最重要的一环：我们会指引 Burt 开通并经营个人的 GitHub 账号。招生官更愿意在这个平台看到候选人作为 Hacker 的“数字脚印”。
                </p>
                <ul className="space-y-4 mb-8">
                  <li className="flex items-start gap-3 text-neutral-400 text-sm">
                    <Fingerprint className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
                    <span><strong>开源记录分享：</strong>将代码构建、环境踩坑、机械臂控制等所有研发过程转化为 Commit 记录，全网透明，这就是最无可辨驳的“硬核实力”。</span>
                  </li>
                  <li className="flex items-start gap-3 text-neutral-400 text-sm">
                    <Laptop className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
                    <span><strong>全球社区连接：</strong>加入 Hugging Face 及 NVIDIA 开源技术圈，让他的代码与世界级工程师产生关联。</span>
                  </li>
                </ul>
                <a href="https://github.com/huggingface/lerobot" target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white text-black font-semibold hover:bg-neutral-200 transition-colors">
                  <Github className="w-5 h-5" /> 前往共建开源社区
                </a>
             </div>

             {/* Github UI Mockup SVG */}
             <div className="bg-neutral-950 border border-neutral-800 rounded-2xl p-4 shadow-2xl relative">
                <div className="flex items-center gap-2 mb-4 px-2">
                  <div className="w-3 h-3 rounded-full bg-red-500"></div>
                  <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                  <div className="w-3 h-3 rounded-full bg-green-500"></div>
                  <div className="ml-4 font-mono text-[10px] text-neutral-600">github.com/burt-innovates</div>
                </div>
                {/* Mock Git contribution chart */}
                <div className="mb-4 bg-neutral-900 border border-neutral-800 rounded-lg p-3">
                   <div className="flex gap-1">
                      {Array.from({ length: 15 }).map((_, col) => (
                        <div key={col} className="flex flex-col gap-1">
                          {Array.from({ length: 7 }).map((_, row) => {
                             const intensity = Math.random();
                             let color = "bg-neutral-800";
                             if (intensity > 0.8) color = "bg-green-400";
                             else if (intensity > 0.5) color = "bg-green-600";
                             else if (intensity > 0.3) color = "bg-green-800";
                             return <div key={row} className={`w-3 h-3 rounded-sm ${color}`}></div>;
                          })}
                        </div>
                      ))}
                   </div>
                   <div className="mt-3 font-mono text-[10px] text-neutral-500">984 contributions in the last year</div>
                </div>
             </div>
          </div>
        </motion.section>

        {/* --- 其他出口（学术 & 实体） --- */}
        <motion.section 
          initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-50px" }} variants={staggerContainer}
          className="grid md:grid-cols-2 gap-8"
        >
           {/* 出口二：学术论文 */}
           <motion.div variants={fadeIn} className="bg-neutral-900 border border-neutral-800 rounded-3xl p-8 hover:-translate-y-1 transition-transform group">
              <div className="w-12 h-12 bg-purple-500/10 rounded-2xl flex items-center justify-center border border-purple-500/20 mb-6">
                 <FileText className="w-6 h-6 text-purple-400" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3 group-hover:text-purple-400 transition-colors">国际级学术顶刊发表</h3>
              <p className="text-neutral-400 text-sm leading-relaxed mb-6">
                最终的理论升华，我们将把控制算法的创新总结为一篇英文学术论文，冲击 IEEE 或其他计算机学科的权威刊物阵地。以科研作者的身份，证明对 AI 最前沿趋势的把控力。
              </p>
              <div className="text-purple-500 text-xs font-mono bg-purple-500/10 px-3 py-1 rounded inline-block">
                # Research Paper & Publishing
              </div>
           </motion.div>

           {/* 出口三：科技原型实体 */}
           <motion.div variants={fadeIn} className="bg-neutral-900 border border-neutral-800 rounded-3xl p-8 hover:-translate-y-1 transition-transform group">
              <div className="w-12 h-12 bg-orange-500/10 rounded-2xl flex items-center justify-center border border-orange-500/20 mb-6">
                 <Rocket className="w-6 h-6 text-orange-400" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3 group-hover:text-orange-400 transition-colors">全功能实物与测试日志</h3>
              <p className="text-neutral-400 text-sm leading-relaxed mb-6">
                区别于只能停留在 PPT 里的单纯软件代码，我们将拿出一台能够独立完成“抓取追踪”等具身智能交互的物理机械原型。配以详细的测试记录，成为大学面试时绝对的王牌秀案。
              </p>
              <div className="text-orange-500 text-xs font-mono bg-orange-500/10 px-3 py-1 rounded inline-block">
                # AI Physical Prototype
              </div>
           </motion.div>
        </motion.section>
      </main>
    </div>
  );
}
