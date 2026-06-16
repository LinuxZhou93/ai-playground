"use client";

import React from "react";
import Link from "next/link";
import { motion } from "motion/react";
import {
  Archive,
  Bot,
  CheckCircle2,
  ChevronLeft,
  ClipboardList,
  FileCode2,
  FileText,
  Github,
  Laptop,
  Radar,
  SlidersHorizontal,
} from "lucide-react";

const fadeIn = {
  hidden: { opacity: 0, y: 26 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.72, ease: "easeOut" as const } },
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.12 } },
};

const deliverables = [
  {
    icon: Github,
    title: "GitHub 代码仓库",
    text: "保存 AI 工具项目、机器人实验代码、配置说明和每周迭代记录。重点是让项目过程可追踪，而不是只留下最终文件。",
    tags: ["README", "Commit", "Issue Log"],
  },
  {
    icon: FileCode2,
    title: "AI / VibeCoding 小项目",
    text: "通过网页、小工具、数据整理脚本和学习辅助工具，把 AI 编程能力变成可运行、可演示、可继续修改的作品。",
    tags: ["Prototype", "Debug", "Demo"],
  },
  {
    icon: Bot,
    title: "具身智能实验原型",
    text: "围绕机械臂、传感器、视觉识别、ROS2 和仿真环境，逐步搭建可以测试真实交互任务的项目框架。",
    tags: ["ROS2", "Sim2Real", "Robotics"],
  },
  {
    icon: FileText,
    title: "实验记录与技术文档",
    text: "每个阶段沉淀实验目标、环境配置、失败记录、调试过程、数据截图和英文技术说明。",
    tags: ["Lab Notes", "Tech Writing", "Review"],
  },
];

const checkpoints = [
  "AI 工具账号和本地开发环境完成配置",
  "建立课程代码仓库和每周任务板",
  "完成第一批 VibeCoding 可运行项目",
  "完成机器人系统资料、硬件清单和实验模板整理",
  "推进 ROS2 / 仿真 / 机械臂相关实验",
  "形成阶段展示材料和下一阶段任务清单",
];

const reviewFlow = [
  {
    step: "Before Class",
    title: "课前准备",
    text: "确认本次课目标、工具环境、项目文件和需要解决的问题。",
  },
  {
    step: "In Class",
    title: "课中推进",
    text: "讲解关键概念，现场完成代码、实验、硬件或文档任务。",
  },
  {
    step: "After Class",
    title: "课后沉淀",
    text: "整理代码提交、实验记录、阶段截图和下一次课的任务。",
  },
];

export default function BurtOutcomes() {
  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 selection:bg-blue-500 selection:text-white pb-24 overflow-x-hidden">
      <nav className="fixed top-0 w-full backdrop-blur-xl bg-neutral-950/80 border-b border-neutral-800 z-50 transition-all">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center gap-4">
          <Link prefetch={false} href="/burt" className="p-2 -ml-2 rounded-lg hover:bg-neutral-800 transition-colors text-neutral-400 hover:text-white flex items-center justify-center">
            <ChevronLeft className="w-5 h-5" />
          </Link>
          <div className="font-semibold text-lg tracking-wide flex items-center gap-2">
            <span className="text-blue-400">X-LAB</span>
            <span className="text-neutral-600">/</span>
            <span className="text-neutral-300">Outputs & Checklist</span>
          </div>
        </div>
      </nav>

      <main className="pt-32 px-6 lg:px-8 max-w-6xl mx-auto">
        <motion.div initial="hidden" animate="visible" variants={fadeIn} className="mb-16 text-center max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs font-semibold uppercase tracking-widest mb-6">
            <ClipboardList className="w-4 h-4" />
            Course Outputs
          </div>
          <h1 className="text-4xl lg:text-6xl font-extrabold tracking-tight mb-6 bg-gradient-to-br from-white via-neutral-200 to-neutral-500 bg-clip-text text-transparent">
            阶段成果与确认清单
          </h1>
          <p className="text-neutral-400 text-lg leading-relaxed">
            这部分用于说明课程推进后会沉淀什么材料。重点不是做一次性展示，而是让每次学习都留下代码、实验、文档和下一步迭代依据。
          </p>
        </motion.div>

        <motion.section initial="hidden" animate="visible" variants={staggerContainer} className="grid md:grid-cols-2 gap-6 mb-24">
          {deliverables.map((item) => {
            const Icon = item.icon;
            return (
              <motion.div key={item.title} variants={fadeIn} className="bg-neutral-900 border border-neutral-800 rounded-3xl p-7 hover:bg-neutral-800/70 transition-colors">
                <div className="flex items-start gap-4 mb-5">
                  <div className="w-12 h-12 bg-blue-500/10 rounded-2xl flex items-center justify-center border border-blue-500/20 shrink-0">
                    <Icon className="w-6 h-6 text-blue-300" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-white mb-2">{item.title}</h2>
                    <p className="text-sm text-neutral-400 leading-relaxed">{item.text}</p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  {item.tags.map((tag) => (
                    <span key={tag} className="px-3 py-1 rounded-full bg-neutral-950 border border-neutral-800 text-xs font-mono text-neutral-300">
                      {tag}
                    </span>
                  ))}
                </div>
              </motion.div>
            );
          })}
        </motion.section>

        <motion.section initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-80px" }} variants={staggerContainer} className="mb-24">
          <motion.div variants={fadeIn} className="grid lg:grid-cols-[0.95fr_1.05fr] gap-10 items-center rounded-[2rem] bg-neutral-900 border border-neutral-800 p-8 lg:p-10 overflow-hidden relative">
            <div className="absolute right-0 top-0 w-1/2 h-full bg-blue-600/5 blur-[100px] pointer-events-none" />
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-5">
                <Archive className="w-6 h-6 text-emerald-300" />
                <h2 className="text-3xl font-bold text-white">课程资料会如何整理</h2>
              </div>
              <p className="text-neutral-400 leading-relaxed mb-7">
                每周推进后，课程资料会尽量按照“代码、实验、文档、展示”四类进行归档。这样后续线上课接着推进时，不会重新从零开始找资料，也方便 Burt 自己复盘。
              </p>
              <div className="grid sm:grid-cols-2 gap-3">
                {["/code", "/lab-notes", "/docs", "/demo"].map((folder) => (
                  <div key={folder} className="rounded-2xl bg-neutral-950 border border-neutral-800 px-4 py-3 font-mono text-sm text-neutral-300">
                    burt-ai-eai{folder}
                  </div>
                ))}
              </div>
            </div>
            <div className="relative z-10 rounded-3xl bg-neutral-950 border border-neutral-800 p-5">
              <div className="h-9 border-b border-neutral-800 flex items-center gap-2 mb-5">
                <div className="w-3 h-3 rounded-full bg-red-500" />
                <div className="w-3 h-3 rounded-full bg-yellow-500" />
                <div className="w-3 h-3 rounded-full bg-green-500" />
                <span className="ml-3 text-[10px] font-mono text-neutral-500">weekly-review.md</span>
              </div>
              <div className="space-y-3 font-mono text-sm">
                <p className="text-blue-300">## Week Review</p>
                <p className="text-neutral-400">- goal: run first AI-assisted prototype</p>
                <p className="text-neutral-400">- code: commit and explain changes</p>
                <p className="text-neutral-400">- lab: record errors and fixes</p>
                <p className="text-neutral-400">- next: robotics environment setup</p>
              </div>
            </div>
          </motion.div>
        </motion.section>

        <motion.section initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-80px" }} variants={staggerContainer} className="mb-24">
          <motion.div variants={fadeIn} className="mb-10">
            <h2 className="text-3xl font-bold text-white mb-4">每次课的闭环方式</h2>
            <p className="text-neutral-400 max-w-3xl leading-relaxed">
              为了避免课程只停留在“听懂了”，每次课都会尽量围绕一个小闭环推进：课前明确问题，课中完成任务，课后留下可复盘资料。
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-5">
            {reviewFlow.map((flow, index) => (
              <motion.div key={flow.step} variants={fadeIn} className="rounded-3xl bg-neutral-900 border border-neutral-800 p-7">
                <div className="flex items-center justify-between mb-6">
                  <span className="font-mono text-xs text-blue-300">{flow.step}</span>
                  <span className="w-9 h-9 rounded-full bg-neutral-950 border border-neutral-800 flex items-center justify-center text-neutral-300 font-mono text-sm">
                    {index + 1}
                  </span>
                </div>
                <h3 className="text-xl font-bold text-white mb-3">{flow.title}</h3>
                <p className="text-sm text-neutral-400 leading-relaxed">{flow.text}</p>
              </motion.div>
            ))}
          </div>
        </motion.section>

        <motion.section initial="hidden" whileInView="visible" viewport={{ once: true }} variants={staggerContainer} className="grid lg:grid-cols-[0.9fr_1.1fr] gap-8 items-start">
          <motion.div variants={fadeIn} className="rounded-3xl bg-neutral-900 border border-neutral-800 p-8">
            <div className="flex items-center gap-3 mb-5">
              <SlidersHorizontal className="w-6 h-6 text-blue-300" />
              <h2 className="text-2xl font-bold text-white">确认前可重点看这几项</h2>
            </div>
            <p className="text-neutral-400 leading-relaxed">
              发给 Burt 确认时，可以让他重点看：学习方向是否认可、线下与线上节奏是否清楚、第一阶段是否愿意从工具配置和 AI 编程实操开始。
            </p>
          </motion.div>

          <motion.div variants={fadeIn} className="rounded-3xl bg-neutral-900 border border-neutral-800 p-8">
            <div className="grid sm:grid-cols-2 gap-3">
              {checkpoints.map((item) => (
                <div key={item} className="flex items-start gap-3 rounded-2xl bg-neutral-950 border border-neutral-800 px-4 py-3">
                  <CheckCircle2 className="w-5 h-5 text-emerald-300 shrink-0 mt-0.5" />
                  <span className="text-sm text-neutral-300 leading-relaxed">{item}</span>
                </div>
              ))}
            </div>
          </motion.div>
        </motion.section>

        <div className="mt-14 flex flex-col sm:flex-row justify-center gap-4">
          <Link prefetch={false} href="/burt" className="inline-flex justify-center items-center gap-2 px-8 py-4 rounded-full border border-neutral-700 bg-neutral-900 text-white font-bold hover:bg-neutral-800 hover:border-neutral-600 hover:scale-[1.02] active:scale-[0.98] transition-all">
            <Laptop className="w-5 h-5 text-blue-300" />
            回到学习计划首页
          </Link>
          <Link prefetch={false} href="/burt/syllabus" className="inline-flex justify-center items-center gap-2 px-8 py-4 rounded-full bg-neutral-100 text-neutral-950 font-bold hover:bg-white hover:scale-[1.02] active:scale-[0.98] transition-all shadow-lg">
            <Radar className="w-5 h-5" />
            查看课程拆解
          </Link>
        </div>
      </main>
    </div>
  );
}
