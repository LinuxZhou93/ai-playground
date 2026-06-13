"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import type React from "react";
import { ArrowRight, Check, ClipboardList, Download, FileText, Printer, RefreshCcw, Send, ShieldCheck } from "lucide-react";
import { submitTechSpecialistIntake, type IntakePayload } from "./actions";

const storageKey = "tech-specialist-intake-draft-v1";

const emptyPayload: IntakePayload = {
  studentName: "",
  ageGradeSchool: "",
  parentName: "",
  parentContact: "",
  meetingGoal: "",
  preferredTime: "",
  currentStage: [],
  learningHistory: "",
  programmingFoundation: {
    languages: "",
    concepts: "",
    independence: "",
    debugging: "",
  },
  roboticsFoundation: {
    platforms: "",
    hardware: "",
    controlTasks: "",
    engineeringProcess: "",
  },
  projectCompetition: "",
  learningTraits: {
    interest: "",
    focus: "",
    difficultyResponse: "",
    expression: "",
  },
  familySupport: {
    weeklyTime: "",
    devices: "",
    budgetCycle: "",
    constraints: "",
  },
  parentQuestions: "",
  childInterest: "",
  attachmentsNote: "",
};

const stageOptions = [
  "零基础，想先判断是否适合",
  "学过 Scratch/图形化编程",
  "学过 Python 或 C++",
  "做过机器人或开源硬件",
  "参加过机器人/信息学/科创比赛",
  "已有作品或项目，想系统规划",
  "希望走科技特长/综合素质材料路线",
];

const sectionNav = [
  "基本信息",
  "学习经历",
  "编程基础",
  "机器人硬件",
  "项目竞赛",
  "学习画像",
  "家庭资源",
  "面谈问题",
];

function textBlock(payload: IntakePayload) {
  return [
    "科技特长生面谈沟通信息表单",
    "",
    `孩子姓名：${payload.studentName}`,
    `年龄/年级/学校：${payload.ageGradeSchool}`,
    `家长姓名：${payload.parentName}`,
    `联系方式：${payload.parentContact}`,
    `面谈目标：${payload.meetingGoal}`,
    `可沟通时间：${payload.preferredTime}`,
    "",
    `当前阶段：${payload.currentStage.join("；")}`,
    "",
    `过往学习经历：\n${payload.learningHistory}`,
    "",
    `编程基础：\n语言/工具：${payload.programmingFoundation.languages}\n概念掌握：${payload.programmingFoundation.concepts}\n独立完成度：${payload.programmingFoundation.independence}\n调试能力：${payload.programmingFoundation.debugging}`,
    "",
    `机器人/硬件基础：\n平台器材：${payload.roboticsFoundation.platforms}\n硬件认识：${payload.roboticsFoundation.hardware}\n控制任务：${payload.roboticsFoundation.controlTasks}\n工程过程：${payload.roboticsFoundation.engineeringProcess}`,
    "",
    `项目/作品/竞赛：\n${payload.projectCompetition}`,
    "",
    `学习画像：\n兴趣来源：${payload.learningTraits.interest}\n专注情况：${payload.learningTraits.focus}\n遇到困难：${payload.learningTraits.difficultyResponse}\n表达展示：${payload.learningTraits.expression}`,
    "",
    `家庭支持：\n每周时间：${payload.familySupport.weeklyTime}\n设备资源：${payload.familySupport.devices}\n预算/周期：${payload.familySupport.budgetCycle}\n限制条件：${payload.familySupport.constraints}`,
    "",
    `家长问题：\n${payload.parentQuestions}`,
    "",
    `孩子本人想学/想做：\n${payload.childInterest}`,
    "",
    `附件说明：\n${payload.attachmentsNote}`,
  ].join("\n");
}

export default function IntakeFormClient() {
  const [payload, setPayload] = useState<IntakePayload>(emptyPayload);
  const [message, setMessage] = useState("");
  const [isPending, startTransition] = useTransition();
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    const raw = window.localStorage.getItem(storageKey);
    if (raw) {
      try {
        setPayload({ ...emptyPayload, ...JSON.parse(raw) });
      } catch {
        window.localStorage.removeItem(storageKey);
      }
    }
  }, []);

  useEffect(() => {
    // 只有当未提交成功时才保存草稿
    if (!isSuccess) {
      window.localStorage.setItem(storageKey, JSON.stringify(payload));
    }
  }, [payload, isSuccess]);

  const completion = useMemo(() => {
    const important = [
      payload.studentName,
      payload.ageGradeSchool,
      payload.parentContact,
      payload.meetingGoal,
      payload.learningHistory,
      payload.programmingFoundation.languages,
      payload.roboticsFoundation.platforms,
      payload.learningTraits.interest,
      payload.familySupport.weeklyTime,
      payload.parentQuestions,
    ];
    return Math.round((important.filter(Boolean).length / important.length) * 100);
  }, [payload]);

  const setValue = (key: keyof IntakePayload, value: string | string[]) => {
    setPayload((prev) => ({ ...prev, [key]: value }));
  };

  const setNestedValue = (group: "programmingFoundation" | "roboticsFoundation" | "learningTraits" | "familySupport", key: string, value: string) => {
    setPayload((prev) => ({ ...prev, [group]: { ...prev[group], [key]: value } }));
  };

  const toggleStage = (option: string) => {
    setPayload((prev) => {
      const exists = prev.currentStage.includes(option);
      return {
        ...prev,
        currentStage: exists ? prev.currentStage.filter((item) => item !== option) : [...prev.currentStage, option],
      };
    });
  };

  const downloadTxt = () => {
    const blob = new Blob([textBlock(payload)], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `科技特长生面谈信息_${payload.studentName || "未命名"}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const copySummary = async () => {
    await navigator.clipboard.writeText(textBlock(payload));
    setMessage("已复制为面谈摘要，可以直接发给周老师。");
  };

  const submit = () => {
    setMessage("");
    startTransition(async () => {
      const result = await submitTechSpecialistIntake(payload);
      setMessage(result.message);
      if (result.ok) {
        window.localStorage.removeItem(storageKey);
        setIsSuccess(true);
      }
    });
  };

  const handleReset = () => {
    setPayload(emptyPayload);
    setIsSuccess(false);
    setMessage("");
  };

  if (isSuccess) {
    return (
      <main className="min-h-screen bg-[#f5f7fb] flex flex-col justify-center items-center p-5 text-slate-950">
        <div className="w-full max-w-2xl bg-white border border-slate-200 rounded-3xl p-8 md:p-12 shadow-xl text-center space-y-6">
          <div className="mx-auto w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center text-emerald-500 shadow-inner">
            <ShieldCheck className="w-12 h-12" />
          </div>
          <h1 className="text-3xl font-black text-slate-900">提交成功！</h1>
          <p className="text-slate-600 leading-relaxed max-w-md mx-auto text-base">
            感谢家长的配合。周老师已收到您为 <span className="font-bold text-slate-900">“{payload.studentName}”</span> 填写的科技特长生面谈表单，会基于这份信息认真准备面谈提纲。
          </p>
          <div className="bg-slate-50 border border-slate-100 rounded-2xl p-5 text-left text-sm space-y-2 text-slate-600">
            <p className="font-bold text-slate-800">面谈准备提示：</p>
            <p>1. 如果有孩子的编程作品、证书、获奖证明等，面谈时可以直接携带或提前发送给周老师。</p>
            <p>2. 周老师会在确认好表单后，与您微信或电话联系沟通具体面谈的会议室/时间安排。</p>
          </div>
          <div className="flex flex-col sm:flex-row justify-center gap-3 pt-4">
            <button type="button" onClick={copySummary} className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 px-5 py-3 text-sm font-bold text-slate-700 hover:bg-slate-50 transition">
              <ClipboardList className="h-4 w-4" />
              复制我填写的摘要
            </button>
            <button type="button" onClick={handleReset} className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-950 px-5 py-3 text-sm font-black text-white hover:bg-slate-800 transition">
              <RefreshCcw className="h-4 w-4" />
              重新填写新表单
            </button>
          </div>
          {message ? <p className="text-sm font-semibold text-emerald-600">{message}</p> : null}
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#f5f7fb] text-slate-950">
      <section className="relative overflow-hidden bg-[#132236] text-white">
        <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_20%_20%,#38bdf8_0,transparent_28%),radial-gradient(circle_at_82%_12%,#22c55e_0,transparent_24%)]" />
        <div className="relative mx-auto grid max-w-7xl gap-8 px-5 py-10 md:grid-cols-[1.1fr_0.9fr] md:px-8 md:py-14">
          <div className="flex flex-col justify-center">
            <div className="mb-5 inline-flex w-fit items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-sm text-sky-100">
              <ShieldCheck className="h-4 w-4" />
              面谈前填写，便于制定个性化课程规划
            </div>
            <h1 className="max-w-3xl text-3xl font-black leading-tight tracking-normal md:text-5xl">
              科技特长生面谈沟通信息表单
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-8 text-slate-200 md:text-lg">
              请家长尽量按真实情况填写。老师会根据孩子的科创基础、项目经历、学习状态和家庭目标，提前准备面谈提纲与阶段性学习建议。
            </p>
            <div className="mt-7 flex flex-wrap gap-3 text-sm text-slate-200">
              <span className="rounded-full bg-white/10 px-4 py-2">编程基础</span>
              <span className="rounded-full bg-white/10 px-4 py-2">机器人/硬件</span>
              <span className="rounded-full bg-white/10 px-4 py-2">项目竞赛</span>
              <span className="rounded-full bg-white/10 px-4 py-2">升学规划</span>
            </div>
          </div>
          <div className="relative min-h-[260px] overflow-hidden rounded-3xl border border-white/10 bg-white/10">
            <img src="/assets/images/robotics.png" alt="机器人课程视觉图" className="absolute inset-0 h-full w-full object-cover opacity-80" />
            <div className="absolute inset-0 bg-gradient-to-tr from-[#132236] via-[#132236]/40 to-transparent" />
            <div className="absolute bottom-5 left-5 right-5 rounded-2xl bg-white/90 p-4 text-slate-950 shadow-2xl">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-bold text-slate-500">填写进度</p>
                  <p className="mt-1 text-2xl font-black">{completion}%</p>
                </div>
                <div className="h-2 flex-1 overflow-hidden rounded-full bg-slate-200">
                  <div className="h-full rounded-full bg-emerald-500 transition-all" style={{ width: `${completion}%` }} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="mx-auto grid max-w-7xl gap-6 px-5 py-8 md:grid-cols-[260px_1fr] md:px-8">
        <aside className="hidden md:block">
          <div className="sticky top-6 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <p className="mb-3 text-xs font-black uppercase tracking-[0.18em] text-slate-400">填写结构</p>
            <div className="space-y-1">
              {sectionNav.map((item, index) => (
                <a key={item} href={`#s${index + 1}`} className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100 hover:text-slate-950">
                  <span className="grid h-5 w-5 place-items-center rounded-full bg-slate-100 text-[11px] text-slate-500">{index + 1}</span>
                  {item}
                </a>
              ))}
            </div>
          </div>
        </aside>

        <form className="space-y-6" onSubmit={(event) => event.preventDefault()}>
          <Panel id="s1" title="1. 基本信息" desc="先确认孩子和家长的基础信息，便于面谈前建立初始画像。">
            <Grid>
              <TextInput label="孩子姓名" required value={payload.studentName} onChange={(v) => setValue("studentName", v)} />
              <TextInput label="年龄 / 年级 / 学校" value={payload.ageGradeSchool} onChange={(v) => setValue("ageGradeSchool", v)} placeholder="例如：五年级，XX小学" />
              <TextInput label="家长姓名" value={payload.parentName} onChange={(v) => setValue("parentName", v)} />
              <TextInput label="家长联系方式" required value={payload.parentContact} onChange={(v) => setValue("parentContact", v)} placeholder="手机号/微信号" />
              <TextInput label="方便沟通的时间" value={payload.preferredTime} onChange={(v) => setValue("preferredTime", v)} placeholder="例如：周三晚 19:30 后" />
            </Grid>
            <TextArea label="本次面谈最希望解决的问题" value={payload.meetingGoal} onChange={(v) => setValue("meetingGoal", v)} placeholder="例如：判断孩子适合走机器人还是编程方向；规划一年内竞赛/作品路径。" />
          </Panel>

          <Panel id="s2" title="2. 学习经历" desc="请勾选孩子当前阶段，并补充以往课程经历、机构、老师、频率和孩子反馈。">
            <div className="grid gap-3 sm:grid-cols-2">
              {stageOptions.map((option) => (
                <button key={option} type="button" onClick={() => toggleStage(option)} className={`flex items-center gap-3 rounded-2xl border p-3 text-left text-sm font-semibold transition ${payload.currentStage.includes(option) ? "border-emerald-500 bg-emerald-50 text-emerald-800" : "border-slate-200 bg-white text-slate-600 hover:border-slate-300"}`}>
                  <span className={`grid h-5 w-5 place-items-center rounded-md border ${payload.currentStage.includes(option) ? "border-emerald-500 bg-emerald-500 text-white" : "border-slate-300"}`}>
                    {payload.currentStage.includes(option) ? <Check className="h-3.5 w-3.5" /> : null}
                  </span>
                  {option}
                </button>
              ))}
            </div>
            <TextArea label="过往科创/编程/机器人学习经历" rows={6} value={payload.learningHistory} onChange={(v) => setValue("learningHistory", v)} placeholder="请写时间段、学习内容、机构或老师、每周频率、孩子是否喜欢、阶段成果或卡点。" />
          </Panel>

          <Panel id="s3" title="3. 编程基础" desc="用于判断是否需要先补程序逻辑，还是可以进入项目制/竞赛型学习。">
            <Grid>
              <TextArea label="接触过的语言/工具" value={payload.programmingFoundation.languages} onChange={(v) => setNestedValue("programmingFoundation", "languages", v)} placeholder="Scratch、Python、C++、Arduino IDE、Mind+、VS Code 等。" />
              <TextArea label="基础概念掌握情况" value={payload.programmingFoundation.concepts} onChange={(v) => setNestedValue("programmingFoundation", "concepts", v)} placeholder="变量、条件、循环、函数、数组、面向对象等。" />
              <TextArea label="独立完成度" value={payload.programmingFoundation.independence} onChange={(v) => setNestedValue("programmingFoundation", "independence", v)} placeholder="能否独立完成小程序、小游戏、算法题或课堂任务。" />
              <TextArea label="调试和解决问题能力" value={payload.programmingFoundation.debugging} onChange={(v) => setNestedValue("programmingFoundation", "debugging", v)} placeholder="遇到报错时通常会怎么处理，是否愿意反复尝试。" />
            </Grid>
          </Panel>

          <Panel id="s4" title="4. 机器人、硬件与工程实践" desc="用于判断孩子是否具备传感器、结构搭建、控制逻辑和工程迭代基础。">
            <Grid>
              <TextArea label="用过的平台/器材" value={payload.roboticsFoundation.platforms} onChange={(v) => setNestedValue("roboticsFoundation", "platforms", v)} placeholder="乐高、VEX、Arduino、micro:bit、ESP32、STM32、树莓派、3D打印等。" />
              <TextArea label="硬件基础" value={payload.roboticsFoundation.hardware} onChange={(v) => setNestedValue("roboticsFoundation", "hardware", v)} placeholder="传感器、马达、舵机、主控板、电源、接线、焊接、万用表等。" />
              <TextArea label="做过的控制任务" value={payload.roboticsFoundation.controlTasks} onChange={(v) => setNestedValue("roboticsFoundation", "controlTasks", v)} placeholder="巡线、避障、抓取、搬运、遥控、自动任务、视觉识别等。" />
              <TextArea label="工程过程能力" value={payload.roboticsFoundation.engineeringProcess} onChange={(v) => setNestedValue("roboticsFoundation", "engineeringProcess", v)} placeholder="是否会设计方案、测试记录、定位结构/接线/程序问题、迭代优化。" />
            </Grid>
          </Panel>

          <Panel id="s5" title="5. 项目、作品与竞赛经历" desc="如果有照片、代码、视频、证书或项目说明，面谈前可一并发给老师。">
            <TextArea label="项目/作品/竞赛记录" rows={7} value={payload.projectCompetition} onChange={(v) => setValue("projectCompetition", v)} placeholder="请写项目或比赛名称、时间、孩子负责部分、成果/奖项、是否有可展示材料。" />
            <TextArea label="可补充发送的附件说明" value={payload.attachmentsNote} onChange={(v) => setValue("attachmentsNote", v)} placeholder="例如：已发送作品视频、证书照片、代码压缩包；或暂时没有资料。" />
          </Panel>

          <Panel id="s6" title="6. 学习画像" desc="面谈会重点判断孩子更适合兴趣启蒙、能力补强、项目制成长还是竞赛路线。">
            <Grid>
              <TextArea label="兴趣来源" value={payload.learningTraits.interest} onChange={(v) => setNestedValue("learningTraits", "interest", v)} placeholder="孩子是主动想学，还是家长希望引导？最喜欢哪类内容？" />
              <TextArea label="专注与投入" value={payload.learningTraits.focus} onChange={(v) => setNestedValue("learningTraits", "focus", v)} placeholder="一节课或一个任务通常能持续投入多久？课后会不会主动研究？" />
              <TextArea label="遇到困难时的反应" value={payload.learningTraits.difficultyResponse} onChange={(v) => setNestedValue("learningTraits", "difficultyResponse", v)} placeholder="会主动尝试、求助、放弃，还是容易急躁？" />
              <TextArea label="表达与展示" value={payload.learningTraits.expression} onChange={(v) => setNestedValue("learningTraits", "expression", v)} placeholder="是否愿意讲解自己的想法、作品和过程？" />
            </Grid>
          </Panel>

          <Panel id="s7" title="7. 家庭支持与时间资源" desc="课程规划需要同时考虑孩子状态、家庭时间和阶段目标。">
            <Grid>
              <TextInput label="每周可投入时间" value={payload.familySupport.weeklyTime} onChange={(v) => setNestedValue("familySupport", "weeklyTime", v)} placeholder="例如：每周 1 次课，课后 30 分钟复盘" />
              <TextArea label="家里可用设备/材料" value={payload.familySupport.devices} onChange={(v) => setNestedValue("familySupport", "devices", v)} placeholder="电脑、平板、机器人套件、电子元件、工具等。" />
              <TextArea label="预算与周期预期" value={payload.familySupport.budgetCycle} onChange={(v) => setNestedValue("familySupport", "budgetCycle", v)} placeholder="可写大致范围，不方便可留空。" />
              <TextArea label="时间限制或特殊情况" value={payload.familySupport.constraints} onChange={(v) => setNestedValue("familySupport", "constraints", v)} placeholder="考试、培训班、接送、注意力、健康、出行等。" />
            </Grid>
          </Panel>

          <Panel id="s8" title="8. 面谈问题" desc="请把家长最想问的问题写在这里，老师会提前准备回应。">
            <TextArea label="家长最关心的问题" rows={6} value={payload.parentQuestions} onChange={(v) => setValue("parentQuestions", v)} placeholder="例如：适不适合走科技特长？要不要比赛？机器人和编程怎么选？多久能看到成果？" />
            <TextArea label="孩子本人最想学/最想做的东西" rows={4} value={payload.childInterest} onChange={(v) => setValue("childInterest", v)} placeholder="可以让孩子自己说一句。" />
          </Panel>

          <div className="sticky bottom-0 z-20 rounded-t-3xl border border-slate-200 bg-white/95 p-4 shadow-2xl backdrop-blur md:rounded-3xl">
            {message ? <p className="mb-3 rounded-2xl bg-slate-100 px-4 py-3 text-sm font-semibold text-slate-700">{message}</p> : null}
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex flex-wrap gap-2">
                <button type="button" onClick={copySummary} className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-bold text-slate-700 hover:bg-slate-50">
                  <ClipboardList className="h-4 w-4" />
                  复制摘要
                </button>
                <button type="button" onClick={downloadTxt} className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-bold text-slate-700 hover:bg-slate-50">
                  <Download className="h-4 w-4" />
                  下载文本
                </button>
                <button type="button" onClick={() => window.print()} className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-bold text-slate-700 hover:bg-slate-50">
                  <Printer className="h-4 w-4" />
                  打印
                </button>
              </div>
              <button type="button" disabled={isPending} onClick={submit} className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-950 px-5 py-3 text-sm font-black text-white shadow-lg shadow-slate-300 transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60">
                {isPending ? <RefreshCcw className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                提交给周老师
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </form>
      </div>
    </main>
  );
}

function Panel({ id, title, desc, children }: { id: string; title: string; desc: string; children: React.ReactNode }) {
  return (
    <section id={id} className="scroll-mt-8 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm md:p-7">
      <div className="mb-5 flex gap-4">
        <div className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-slate-950 text-white">
          <FileText className="h-5 w-5" />
        </div>
        <div>
          <h2 className="text-xl font-black tracking-normal text-slate-950">{title}</h2>
          <p className="mt-1 text-sm leading-6 text-slate-500">{desc}</p>
        </div>
      </div>
      <div className="space-y-5">{children}</div>
    </section>
  );
}

function Grid({ children }: { children: React.ReactNode }) {
  return <div className="grid gap-4 md:grid-cols-2">{children}</div>;
}

function TextInput({ label, value, onChange, placeholder, required }: { label: string; value: string; onChange: (value: string) => void; placeholder?: string; required?: boolean }) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-black text-slate-700">
        {label}
        {required ? <span className="text-red-500"> *</span> : null}
      </span>
      <input value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} className="h-12 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm font-medium outline-none transition focus:border-slate-900 focus:bg-white focus:ring-4 focus:ring-slate-100" />
    </label>
  );
}

function TextArea({ label, value, onChange, placeholder, rows = 4 }: { label: string; value: string; onChange: (value: string) => void; placeholder?: string; rows?: number }) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-black text-slate-700">{label}</span>
      <textarea value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} rows={rows} className="w-full resize-y rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium leading-6 outline-none transition focus:border-slate-900 focus:bg-white focus:ring-4 focus:ring-slate-100" />
    </label>
  );
}
