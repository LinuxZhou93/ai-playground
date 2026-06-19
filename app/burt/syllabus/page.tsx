"use client";

import React from "react";
import Link from "next/link";
import { motion } from "motion/react";
import {
  ArrowRight,
  Bot,
  BrainCircuit,
  ChevronLeft,
  Clock3,
  Code2,
  Cpu,
  Database,
  FileText,
  GitCommitHorizontal,
  Layers3,
  MonitorCog,
  Network,
  PenTool,
  Route,
  Wrench,
} from "lucide-react";

const fadeIn = {
  hidden: { opacity: 0, y: 26 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.72, ease: "easeOut" as const } },
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.12 } },
};

const hours = [
  {
    label: "暑期成都线下集训",
    count: "12 次 × 3 小时",
    total: "36 小时",
    note: "6 周推进；原则上周一 14:00-17:00，另择周内一个晚上 3 小时。",
  },
  {
    label: "后续线上 1V1",
    count: "15 次 × 2 小时",
    total: "30 小时",
    note: "线下集训后滚动安排，用于代码复盘、实验记录、技术文档和项目持续推进。",
  },
  {
    label: "固定授课合计",
    count: "线下 + 线上",
    total: "66 小时",
    note: "导师答疑、资料整理和项目督导属于整体服务支持，不单独折算为固定授课课时。",
  },
];

const modules = [
  {
    icon: MonitorCog,
    title: "模块 A：AI 工具链与 VibeCoding",
    sessions: "线下前段优先启动",
    points: ["Cursor / Codex / Claude Code 工作流", "Prompt 拆解与任务分层", "网页、小工具、数据面板等快速原型", "GitHub 仓库与提交记录"],
    outcome: "形成第一批可运行的小项目和个人代码仓库。",
  },
  {
    icon: Code2,
    title: "模块 B：Python 与工程化编程",
    sessions: "贯穿线下与线上",
    points: ["Python 基础与项目结构", "文件读写、数据处理、API 调用", "调试、测试和版本管理", "用 AI 做代码审查与复盘"],
    outcome: "能读懂、修改并维护自己的项目代码。",
  },
  {
    icon: Network,
    title: "模块 C：ROS2 与机器人系统",
    sessions: "线下中段进入",
    points: ["Ubuntu / ROS2 环境", "Node、Topic、Service、Launch", "RViz / Rqt 可视化", "传感器数据与运动控制接口"],
    outcome: "搭起机器人系统的基础通信与控制框架。",
  },
  {
    icon: Bot,
    title: "模块 D：具身智能任务设计",
    sessions: "线下中后段推进",
    points: ["机械臂与移动平台任务拆解", "视觉识别与目标追踪", "遥操作与动作数据采集", "抓取、移动、反馈等真实交互任务"],
    outcome: "把 AI 模型、传感器和执行机构连接成一个可测试任务。",
  },
  {
    icon: Layers3,
    title: "模块 E：仿真与 Sim-to-Real",
    sessions: "线下打底，线上延展",
    points: ["MuJoCo / Isaac Sim / LeRobot 资料导入", "URDF 与机器人结构描述", "仿真测试与现实误差记录", "从仿真策略迁移到真实硬件"],
    outcome: "建立“先仿真验证，再真实测试”的项目方法。",
  },
  {
    icon: FileText,
    title: "模块 F：项目文档与英文技术表达",
    sessions: "线上阶段重点沉淀",
    points: ["实验记录模板", "README 与技术说明", "阶段复盘报告", "演示脚本与项目展示材料"],
    outcome: "把每次推进转化为可复盘、可展示、可继续迭代的材料。",
  },
];

const firstSixWeeks = [
  {
    week: "Week 1",
    title: "工具链启动",
    desc: "从 AI Foundations 与 Codex 实操启动，完成第一个 VibeCoding 网页作品：SAT 核心词汇 Flashcard 记忆工具。",
    icon: Cpu,
  },
  {
    week: "Week 2",
    title: "AI 项目原型",
    desc: "用 AI 辅助完成一个可运行网页或学习工具，训练需求拆解、调试和复盘。",
    icon: BrainCircuit,
  },
  {
    week: "Week 3",
    title: "Python 与数据任务",
    desc: "补齐工程化编程基础，开始把学习记录、实验数据和可视化整理成结构化材料。",
    icon: Database,
  },
  {
    week: "Week 4",
    title: "ROS2 基础",
    desc: "进入 Ubuntu、ROS2 节点通信、Topic、Service 与机器人系统的基础结构。",
    icon: Network,
  },
  {
    week: "Week 5",
    title: "硬件与仿真",
    desc: "推进机械臂、传感器、仿真环境和基础控制任务，建立真实实验记录。",
    icon: Wrench,
  },
  {
    week: "Week 6",
    title: "阶段作品搭建",
    desc: "把前五周的工具、代码、硬件和文档收束为一个可继续迭代的阶段项目。",
    icon: Route,
  },
];

export default function BurtSyllabus() {
  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 selection:bg-blue-500 selection:text-white pb-24 overflow-x-hidden">
      <nav className="fixed top-0 w-full backdrop-blur-xl bg-neutral-950/80 border-b border-neutral-800 z-50">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center gap-4">
          <Link prefetch={false} href="/burt" className="p-2 -ml-2 rounded-lg hover:bg-neutral-800 transition-colors text-neutral-400 hover:text-white flex items-center justify-center">
            <ChevronLeft className="w-5 h-5" />
          </Link>
          <div className="font-semibold text-lg tracking-wide flex items-center gap-2">
            <span className="text-blue-400">X-LAB</span>
            <span className="text-neutral-600">/</span>
            <span className="text-neutral-300">Course Breakdown</span>
          </div>
        </div>
      </nav>

      <main className="pt-32 px-6 lg:px-8 max-w-6xl mx-auto">
        <motion.div initial="hidden" animate="visible" variants={fadeIn} className="mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-300 text-xs font-semibold uppercase tracking-widest mb-6">
            <Clock3 className="w-3.5 h-3.5" />
            66 Hours · One-on-One
          </div>
          <h1 className="text-4xl lg:text-6xl font-extrabold tracking-tight mb-5 text-white">
            课时与模块拆解
          </h1>
          <p className="text-neutral-400 text-lg max-w-3xl leading-relaxed">
            本页用于说明第一阶段课程如何推进：先完成 AI 工具链和 VibeCoding 的高频实操，再进入 ROS2、仿真、机械臂与具身智能任务，最后通过线上辅导把代码、实验和文档持续沉淀。
          </p>
        </motion.div>

        <motion.section initial="hidden" animate="visible" variants={staggerContainer} className="grid md:grid-cols-3 gap-5 mb-24">
          {hours.map((item) => (
            <motion.div key={item.label} variants={fadeIn} className="rounded-3xl bg-neutral-900 border border-neutral-800 p-6">
              <p className="text-sm text-neutral-400 mb-3">{item.label}</p>
              <p className="font-mono text-blue-300 text-lg mb-2">{item.count}</p>
              <p className="text-4xl font-extrabold text-white mb-4">{item.total}</p>
              <p className="text-sm leading-relaxed text-neutral-400">{item.note}</p>
            </motion.div>
          ))}
        </motion.section>

        <motion.section initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-80px" }} variants={staggerContainer} className="mb-24">
          <motion.div variants={fadeIn} className="mb-10">
            <h2 className="text-3xl font-bold text-white mb-4">六个课程模块</h2>
            <p className="text-neutral-400 max-w-3xl leading-relaxed">
              模块不是彼此割裂的章节，而是会随着项目推进交叉出现：AI 工具链负责提高实现效率，机器人系统负责把算法落到物理任务，文档表达负责把过程保存下来。
            </p>
          </motion.div>

          <div className="grid lg:grid-cols-2 gap-5">
            {modules.map((module) => {
              const Icon = module.icon;
              return (
                <motion.div key={module.title} variants={fadeIn} className="rounded-3xl bg-neutral-900 border border-neutral-800 p-7 hover:bg-neutral-800/70 transition-colors">
                  <div className="flex items-start gap-4 mb-5">
                    <div className="w-12 h-12 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center shrink-0">
                      <Icon className="w-6 h-6 text-blue-300" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-white mb-1">{module.title}</h3>
                      <p className="font-mono text-xs text-cyan-300">{module.sessions}</p>
                    </div>
                  </div>
                  <div className="grid sm:grid-cols-2 gap-2 mb-5">
                    {module.points.map((point) => (
                      <div key={point} className="flex items-start gap-2 rounded-xl bg-neutral-950 border border-neutral-800 px-3 py-2">
                        <GitCommitHorizontal className="w-4 h-4 text-neutral-500 shrink-0 mt-0.5" />
                        <span className="text-xs leading-relaxed text-neutral-300">{point}</span>
                      </div>
                    ))}
                  </div>
                  <p className="text-sm leading-relaxed text-neutral-400">
                    <span className="text-neutral-200 font-semibold">阶段产出：</span>
                    {module.outcome}
                  </p>
                </motion.div>
              );
            })}
          </div>
        </motion.section>

        <motion.section initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-80px" }} variants={staggerContainer} className="mb-20">
          <motion.div variants={fadeIn} className="mb-10">
            <h2 className="text-3xl font-bold text-white mb-4">前 6 周线下推进节奏</h2>
            <p className="text-neutral-400 max-w-3xl leading-relaxed">
              每周两次课会尽量形成“讲解、实操、复盘、下一步任务”的闭环。具体内容会根据开课后的工具配置、硬件到位和项目进度微调。
            </p>
          </motion.div>

          <div className="relative">
            <div className="hidden lg:block absolute left-[39px] top-10 bottom-10 w-px bg-neutral-800" />
            <div className="space-y-5">
              {firstSixWeeks.map((week) => {
                const Icon = week.icon;
                return (
                  <motion.div key={week.week} variants={fadeIn} className="grid lg:grid-cols-[80px_1fr] gap-5 items-start">
                    <div className="w-20 h-20 rounded-3xl bg-neutral-900 border border-neutral-800 flex items-center justify-center relative z-10">
                      <Icon className="w-7 h-7 text-cyan-300" />
                    </div>
                    <div className="rounded-3xl bg-neutral-900 border border-neutral-800 p-6">
                      <div className="flex flex-wrap items-baseline gap-3 mb-2">
                        <span className="font-mono text-sm text-blue-300">{week.week}</span>
                        <h3 className="text-xl font-bold text-white">{week.title}</h3>
                      </div>
                      <p className="text-sm leading-relaxed text-neutral-400">{week.desc}</p>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </motion.section>

        <motion.section initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeIn} className="rounded-[2rem] bg-neutral-900 border border-neutral-800 p-8 lg:p-10">
          <div className="flex flex-col lg:flex-row gap-8 lg:items-center justify-between">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <PenTool className="w-6 h-6 text-blue-300" />
                <h2 className="text-2xl font-bold text-white">确认后进入执行</h2>
              </div>
              <p className="text-neutral-400 leading-relaxed max-w-2xl">
                如果对课时结构、模块顺序和阶段产出方向没有问题，就可以按 6 月 18 日开课节奏启动首批工具、账号、代码仓库和软硬件材料准备。
              </p>
            </div>
            <Link prefetch={false} href="/burt/outcomes" className="inline-flex justify-center items-center gap-2 px-7 py-4 rounded-full bg-neutral-100 text-neutral-950 font-bold hover:bg-white hover:scale-[1.02] active:scale-[0.98] transition-all shadow-lg">
              查看阶段成果
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </motion.section>
      </main>
    </div>
  );
}
