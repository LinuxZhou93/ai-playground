"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "motion/react";
import {
  ArrowRight,
  BookOpen,
  Bot,
  CalendarDays,
  CheckCircle2,
  Cpu,
  FileCode2,
  FlaskConical,
  GitBranch,
  Laptop,
  ListChecks,
  Network,
  Route,
  Sparkles,
} from "lucide-react";

const fadeIn = {
  hidden: { opacity: 0, y: 26 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.72, ease: "easeOut" as const } },
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.14 } },
};

const focusTracks = [
  {
    icon: Laptop,
    title: "AI Native 工具链",
    text: "从第一周开始配置 Cursor、Codex、GitHub、Python 环境和项目仓库，让 AI 成为日常学习与开发协作工具。",
  },
  {
    icon: FileCode2,
    title: "VibeCoding 与工程表达",
    text: "用 AI 辅助把想法快速转化为网页、小工具、实验记录和可复盘代码，训练“提出问题-拆解任务-迭代实现”的能力。",
  },
  {
    icon: Bot,
    title: "具身智能机器人课题",
    text: "围绕 ROS2、仿真、机械臂、视觉识别和 Sim-to-Real，逐步把软件算法落到真实硬件任务中。",
  },
];

const weeklyFlow = [
  {
    title: "周一下午",
    time: "14:00-17:00",
    desc: "线下主课，完成核心概念讲解、代码推进、硬件联调和阶段复盘。",
  },
  {
    title: "周内晚间",
    time: "3 小时",
    desc: "线下第二次推进，处理项目卡点、补齐作业、继续推进实验任务。",
  },
  {
    title: "后续线上",
    time: "15 次 × 2 小时",
    desc: "离开线下集训后，继续用线上 1V1 推进代码、实验记录、英文技术文档和阶段展示。",
  },
];

const preparationItems = [
  "AI 编程工具与账号：Cursor、Codex、Claude Code、GitHub、Replit 等",
  "本地开发环境：Python、Node.js、Git、VS Code / Cursor、项目仓库结构",
  "机器人学习材料：ROS2、Ubuntu、仿真工具、机械臂相关资料与硬件清单",
  "课程协作资料：每周任务板、实验记录模板、代码提交规范、阶段复盘模板",
];

const milestones = [
  {
    tag: "01",
    title: "启动与工具配置",
    period: "6 月 18 日起",
    body: "完成 AI 工具链、代码环境、学习账号和第一批项目资料配置；建立课程任务板与代码仓库。",
    accent: "border-blue-500/30 bg-blue-500/10 text-blue-300",
  },
  {
    tag: "02",
    title: "AI + VibeCoding 入门项目",
    period: "线下集训前段",
    body: "通过可运行的小项目学习 Prompt 拆解、代码生成、调试、版本管理和网页/工具交付。",
    accent: "border-cyan-500/30 bg-cyan-500/10 text-cyan-300",
  },
  {
    tag: "03",
    title: "机器人系统与具身智能",
    period: "线下集训中后段",
    body: "进入 ROS2、传感器、仿真、机械臂与视觉任务，把 AI 能力连接到真实物理交互。",
    accent: "border-emerald-500/30 bg-emerald-500/10 text-emerald-300",
  },
  {
    tag: "04",
    title: "线上延展与成果整理",
    period: "后续 15 次线上课",
    body: "持续推进代码、实验记录、英文技术说明、阶段展示材料和下一阶段长期规划。",
    accent: "border-violet-500/30 bg-violet-500/10 text-violet-300",
  },
];

export default function BurtCoursePlan() {
  const [repoProgress, setRepoProgress] = useState(18);
  const [labProgress, setLabProgress] = useState(8);

  useEffect(() => {
    const interval = window.setInterval(() => {
      setRepoProgress((value) => Math.min(92, value + 3));
      setLabProgress((value) => Math.min(78, value + 2));
    }, 2200);
    return () => window.clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 selection:bg-blue-500 selection:text-white pb-24 overflow-x-hidden">
      <motion.nav
        initial={{ y: -80 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.7, ease: "easeOut" }}
        className="fixed top-0 w-full backdrop-blur-xl bg-neutral-950/75 border-b border-neutral-800 z-50"
      >
        <div className="max-w-6xl mx-auto px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="font-semibold text-lg tracking-wide flex items-center gap-2">
            <span className="text-blue-400">X-LAB</span>
            <span className="text-neutral-600">/</span>
            <span className="text-neutral-300">Burt Learning Plan</span>
          </div>
          <div className="hidden sm:flex space-x-6 text-sm font-medium text-neutral-400">
            <a href="#tracks" className="hover:text-white transition">
              双主线
            </a>
            <a href="#schedule" className="hover:text-white transition">
              课时安排
            </a>
            <a href="#prep" className="hover:text-white transition">
              启动准备
            </a>
          </div>
        </div>
      </motion.nav>

      <section className="relative pt-32 pb-20 lg:pt-44 lg:pb-28 px-6 lg:px-8 max-w-6xl mx-auto">
        <div className="absolute top-24 left-1/2 -translate-x-1/2 w-[680px] max-w-full h-[420px] bg-blue-600/10 blur-[110px] pointer-events-none" />

        <motion.div initial="hidden" animate="visible" variants={staggerContainer} className="grid lg:grid-cols-[1fr_0.92fr] gap-12 items-center">
          <motion.div variants={fadeIn}>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-300 text-xs font-semibold uppercase tracking-widest mb-8">
              <Sparkles className="w-3.5 h-3.5" />
              2026 Summer Start · AI + Embodied AI
            </div>
            <h1 className="text-5xl lg:text-7xl font-extrabold tracking-tight mb-6 bg-gradient-to-br from-white via-neutral-200 to-neutral-500 bg-clip-text text-transparent">
              Burt AI 与具身智能学习计划
            </h1>
            <p className="text-lg lg:text-xl text-neutral-400 leading-relaxed mb-8 max-w-2xl">
              这是一份用于确认课程推进节奏的学习网页。第一阶段从 2026 年 6 月 18 日启动，以 AI 工具链、VibeCoding、机器人系统和具身智能课题为双主线，先把工具、代码、实验和项目框架搭起来。
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <Link prefetch={false} href="/burt/syllabus" className="inline-flex justify-center items-center gap-2 px-7 py-4 rounded-full bg-neutral-100 text-neutral-950 font-bold hover:bg-white hover:scale-[1.02] active:scale-[0.98] transition-all shadow-lg">
                <BookOpen className="w-5 h-5" />
                查看课时与模块拆解
              </Link>
              <Link prefetch={false} href="/burt/outcomes" className="inline-flex justify-center items-center gap-2 px-7 py-4 rounded-full border border-neutral-700 bg-neutral-900 text-white font-bold hover:bg-neutral-800 hover:border-neutral-600 hover:scale-[1.02] active:scale-[0.98] transition-all">
                <ListChecks className="w-5 h-5 text-blue-300" />
                查看阶段成果
              </Link>
            </div>
          </motion.div>

          <motion.div variants={fadeIn} className="relative">
            <div className="absolute -inset-1 bg-gradient-to-r from-blue-600/35 via-cyan-500/15 to-emerald-500/25 rounded-[2rem] blur opacity-60" />
            <div className="relative rounded-[2rem] overflow-hidden border border-neutral-800 bg-neutral-900 shadow-2xl">
              <Image
                src="/images/burt/hero.png"
                alt="AI robotics learning workspace"
                width={1200}
                height={760}
                className="w-full h-[360px] object-cover opacity-85"
                priority
              />
              <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-neutral-950/20 to-transparent" />
              <div className="absolute left-5 right-5 bottom-5 grid grid-cols-2 gap-3">
                <div className="rounded-2xl border border-white/10 bg-neutral-950/80 backdrop-blur p-4">
                  <p className="text-xs text-neutral-500 mb-1">固定授课</p>
                  <p className="text-2xl font-mono font-bold text-white">66h</p>
                  <p className="text-xs text-neutral-400 mt-1">36h 线下 + 30h 线上</p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-neutral-950/80 backdrop-blur p-4">
                  <p className="text-xs text-neutral-500 mb-1">启动日期</p>
                  <p className="text-2xl font-mono font-bold text-blue-300">06.18</p>
                  <p className="text-xs text-neutral-400 mt-1">先完成工具与环境配置</p>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </section>

      <section id="tracks" className="py-20 px-6 lg:px-8 max-w-6xl mx-auto">
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-80px" }} variants={staggerContainer}>
          <motion.div variants={fadeIn} className="mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold tracking-tight text-white mb-4">接下来课程要推进的三件事</h2>
            <p className="text-neutral-400 max-w-3xl leading-relaxed">
              课程不是单纯“讲概念”，而是把工具能力、工程实现和机器人课题串起来。每一次课都尽量留下可继续迭代的代码、记录或硬件进展。
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-5">
            {focusTracks.map((track) => {
              const Icon = track.icon;
              return (
                <motion.div key={track.title} variants={fadeIn} className="rounded-3xl bg-neutral-900 border border-neutral-800 p-7 hover:bg-neutral-800/70 transition-colors">
                  <div className="w-12 h-12 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center mb-6">
                    <Icon className="w-6 h-6 text-blue-300" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-3">{track.title}</h3>
                  <p className="text-sm leading-relaxed text-neutral-400">{track.text}</p>
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      </section>

      <section id="schedule" className="py-24 bg-neutral-900/50 border-y border-neutral-800/50 relative overflow-hidden">
        <div className="absolute right-0 top-0 w-1/3 h-full bg-cyan-900/10 blur-[100px] pointer-events-none" />
        <div className="px-6 lg:px-8 max-w-6xl mx-auto grid lg:grid-cols-[0.9fr_1.1fr] gap-12 items-start">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeIn}>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-300 text-xs font-semibold uppercase tracking-widest mb-6">
              <CalendarDays className="w-3.5 h-3.5" />
              66 Hours Plan
            </div>
            <h2 className="text-3xl lg:text-4xl font-bold tracking-tight text-white mb-5">6 周线下集训 + 后续线上延展</h2>
            <p className="text-neutral-400 leading-relaxed mb-8">
              线下阶段优先完成高频推进：每周两次，每次三小时，共 36 小时。线上阶段保留 15 次一对一辅导，共 30 小时，用来持续推进代码、实验、文档和项目展示。
            </p>

            <div className="rounded-3xl bg-neutral-950 border border-neutral-800 p-5">
              <div className="flex items-center gap-3 mb-5">
                <Network className="w-5 h-5 text-blue-300" />
                <h3 className="font-bold text-white">课程结构</h3>
              </div>
              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between text-sm mb-2">
                    <span className="text-neutral-300">代码仓库与工具链</span>
                    <span className="font-mono text-blue-300">{repoProgress}%</span>
                  </div>
                  <div className="h-2 rounded-full bg-neutral-800 overflow-hidden">
                    <motion.div className="h-full bg-blue-400" animate={{ width: `${repoProgress}%` }} transition={{ duration: 0.7 }} />
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-between text-sm mb-2">
                    <span className="text-neutral-300">机器人项目准备</span>
                    <span className="font-mono text-emerald-300">{labProgress}%</span>
                  </div>
                  <div className="h-2 rounded-full bg-neutral-800 overflow-hidden">
                    <motion.div className="h-full bg-emerald-400" animate={{ width: `${labProgress}%` }} transition={{ duration: 0.7 }} />
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={staggerContainer} className="space-y-4">
            {weeklyFlow.map((item) => (
              <motion.div key={item.title} variants={fadeIn} className="rounded-3xl border border-neutral-800 bg-neutral-950 p-6 flex gap-5">
                <div className="w-12 h-12 rounded-2xl bg-neutral-900 border border-neutral-700 flex items-center justify-center shrink-0">
                  <Route className="w-5 h-5 text-cyan-300" />
                </div>
                <div>
                  <div className="flex flex-wrap items-baseline gap-3 mb-2">
                    <h3 className="text-xl font-bold text-white">{item.title}</h3>
                    <span className="font-mono text-sm text-cyan-300">{item.time}</span>
                  </div>
                  <p className="text-sm leading-relaxed text-neutral-400">{item.desc}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      <section id="prep" className="py-24 px-6 lg:px-8 max-w-6xl mx-auto">
        <div className="grid lg:grid-cols-[1.05fr_0.95fr] gap-12 items-center">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={staggerContainer}>
            <motion.h2 variants={fadeIn} className="text-3xl lg:text-4xl font-bold tracking-tight text-white mb-5">
              开课前先把首批资源配置好
            </motion.h2>
            <motion.p variants={fadeIn} className="text-neutral-400 leading-relaxed mb-8">
              第一节课前，先把 AI 学习工具、代码环境、项目资料、软硬件清单和任务协作方式准备起来。这样 6 月 18 日开课时，可以直接进入实操，而不是把时间花在零散安装和账号整理上。
            </motion.p>
            <div className="space-y-3">
              {preparationItems.map((item) => (
                <motion.div key={item} variants={fadeIn} className="flex gap-3 rounded-2xl bg-neutral-900 border border-neutral-800 px-5 py-4">
                  <CheckCircle2 className="w-5 h-5 text-emerald-300 shrink-0 mt-0.5" />
                  <p className="text-sm text-neutral-300 leading-relaxed">{item}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, x: 40 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.75 }} className="rounded-[2rem] overflow-hidden border border-neutral-800 bg-neutral-950 shadow-2xl">
            <div className="h-10 bg-neutral-900 border-b border-neutral-800 flex items-center px-4 gap-2">
              <div className="w-3 h-3 rounded-full bg-red-500/80" />
              <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
              <div className="w-3 h-3 rounded-full bg-green-500/80" />
              <div className="ml-4 font-mono text-[10px] text-neutral-500 uppercase">course-startup.yaml</div>
            </div>
            <div className="p-6 font-mono text-sm leading-7">
              <p className="text-neutral-500">course:</p>
              <p className="pl-4 text-blue-300">start: 2026-06-18</p>
              <p className="pl-4 text-cyan-300">offline: 12 sessions / 36h</p>
              <p className="pl-4 text-emerald-300">online: 15 sessions / 30h</p>
              <p className="text-neutral-500 mt-4">first_week:</p>
              <p className="pl-4 text-neutral-300">- setup_ai_tools</p>
              <p className="pl-4 text-neutral-300">- create_github_repo</p>
              <p className="pl-4 text-neutral-300">- run_first_vibecoding_task</p>
              <p className="pl-4 text-neutral-300">- prepare_robotics_materials</p>
            </div>
          </motion.div>
        </div>
      </section>

      <section className="py-20 px-6 lg:px-8 max-w-6xl mx-auto">
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={staggerContainer} className="space-y-5">
          <motion.div variants={fadeIn} className="flex items-center gap-3 mb-8">
            <GitBranch className="w-6 h-6 text-blue-300" />
            <h2 className="text-3xl font-bold text-white">阶段推进图</h2>
          </motion.div>
          {milestones.map((milestone) => (
            <motion.div key={milestone.tag} variants={fadeIn} className="rounded-3xl border border-neutral-800 bg-neutral-900 p-6 hover:bg-neutral-800/70 transition-colors">
              <div className="grid md:grid-cols-[110px_1fr] gap-5 items-start">
                <div className={`rounded-2xl border px-4 py-3 font-mono font-bold ${milestone.accent}`}>
                  <div className="text-2xl">{milestone.tag}</div>
                  <div className="text-xs mt-1">{milestone.period}</div>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white mb-2">{milestone.title}</h3>
                  <p className="text-sm leading-relaxed text-neutral-400">{milestone.body}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        <div className="mt-14 flex flex-col sm:flex-row justify-center gap-4">
          <Link prefetch={false} href="/burt/syllabus" className="inline-flex justify-center items-center gap-2 px-8 py-4 rounded-full bg-neutral-100 text-neutral-950 font-bold hover:bg-white hover:scale-[1.02] active:scale-[0.98] transition-all shadow-lg">
            进入课程拆解
            <ArrowRight className="w-5 h-5" />
          </Link>
          <Link prefetch={false} href="/burt/outcomes" className="inline-flex justify-center items-center gap-2 px-8 py-4 rounded-full border border-neutral-700 bg-neutral-900 text-white font-bold hover:bg-neutral-800 hover:border-neutral-600 hover:scale-[1.02] active:scale-[0.98] transition-all">
            查看成果清单
            <FlaskConical className="w-5 h-5 text-blue-300" />
          </Link>
        </div>
      </section>
    </div>
  );
}
