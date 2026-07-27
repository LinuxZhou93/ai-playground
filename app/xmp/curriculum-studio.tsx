"use client";

import {
  Archive,
  ArrowRight,
  BookOpenCheck,
  Bot,
  Check,
  ChevronDown,
  CircleDashed,
  Clock3,
  FileText,
  Layers3,
  Library,
  MoreHorizontal,
  Play,
  Plus,
  Search,
  ShieldCheck,
  Sparkles,
  WandSparkles,
} from "lucide-react";
import { useMemo, useState } from "react";

type CourseState = "published" | "review" | "draft";

const seedCourses = [
  { id: "seed", title: "会呼吸的种子", series: "春日自然探究", age: "5–6 岁", duration: 35, lessons: 4, state: "published" as CourseState, updated: "12 分钟前", color: "#dfeee1" },
  { id: "sound", title: "声音去哪里了", series: "奇妙物理实验室", age: "4–5 岁", duration: 30, lessons: 3, state: "review" as CourseState, updated: "今天 08:42", color: "#e2ecf5" },
  { id: "color", title: "颜色变变变", series: "艺术与科学", age: "3–4 岁", duration: 25, lessons: 3, state: "draft" as CourseState, updated: "昨天", color: "#f4e6dc" },
  { id: "shadow", title: "我们的影子", series: "光影探索计划", age: "5–6 岁", duration: 35, lessons: 4, state: "published" as CourseState, updated: "7 月 24 日", color: "#ece8f5" },
];

const coursePhases = [
  { time: "3'", title: "故事唤醒", detail: "奇妙宠带来一颗“不愿醒来”的种子，引发幼儿猜想。", owner: "奇妙宠" },
  { time: "5'", title: "问题建构", detail: "教师收集“种子需要什么”的表达，形成班级问题墙。", owner: "教师" },
  { time: "12'", title: "动手探究", detail: "三组对照实验：水、空气、阳光，幼儿自主选择并记录。", owner: "幼儿" },
  { time: "7'", title: "分享与追问", detail: "展示观察证据；AI 仅向教师建议追问，不直接判断幼儿。", owner: "教师" },
  { time: "5'", title: "身体表达", detail: "用身体模仿种子舒展、生根和发芽的变化。", owner: "幼儿" },
  { time: "3'", title: "家庭延伸", detail: "生成“陪种子喝水”的亲子任务，经教师确认后发送。", owner: "家园" },
];

const statusText: Record<CourseState,string> = { published: "已发布", review: "待审核", draft: "草稿" };

export function CurriculumStudio() {
  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState("seed");
  const [workbenchOpen, setWorkbenchOpen] = useState(false);
  const [brief, setBrief] = useState("围绕春天和种子，为大班设计一节能动手、有讨论、有家庭延伸的探究课");
  const [age, setAge] = useState("5–6 岁");
  const [generating, setGenerating] = useState(false);
  const [generated, setGenerated] = useState(false);
  const filtered = useMemo(() => seedCourses.filter((course) => `${course.title}${course.series}`.includes(query)), [query]);
  const selected = seedCourses.find((course) => course.id === selectedId) ?? seedCourses[0];

  const runDemoGeneration = () => {
    if (!brief.trim() || generating) return;
    setGenerating(true);
    setGenerated(false);
    window.setTimeout(() => { setGenerating(false); setGenerated(true); }, 850);
  };

  return <div className="xmp-curriculum">
    <section className="xmp-curriculum-head">
      <div><span>CURRICULUM OPERATING SYSTEM</span><h1>把一个好想法，变成一堂真正能上的课。</h1><p>复用 FutureClass 的多智能体生成、课件编辑、素材库与 ERP 发布能力，并为幼儿课堂加入年龄适配、教师审核和安全边界。</p></div>
      <button onClick={() => setWorkbenchOpen(true)}><WandSparkles size={16}/> 新建 AI 课程</button>
    </section>

    <section className="xmp-curriculum-kpis">
      <article><span><Library size={15}/></span><div><b>28</b><small>园本课程</small></div><em>+4 本月</em></article>
      <article><span><CircleDashed size={15}/></span><div><b>6</b><small>待教研审核</small></div><em className="warn">需要行动</em></article>
      <article><span><Layers3 size={15}/></span><div><b>86%</b><small>标准复用率</small></div><em>减少重复备课</em></article>
      <article><span><Archive size={15}/></span><div><b>142</b><small>可用教学素材</small></div><em>FutureClass Vault</em></article>
    </section>

    <section className="xmp-curriculum-workspace">
      <aside className="xmp-course-library">
        <div className="xmp-library-head"><div><span>课程资产</span><b>CURRICULUM LIBRARY</b></div><button aria-label="新建课程" onClick={() => setWorkbenchOpen(true)}><Plus size={15}/></button></div>
        <label><Search size={14}/><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="搜索主题、系列"/></label>
        <div className="xmp-course-filters"><button className="active">全部 28</button><button>待审核 6</button><button>草稿 3</button></div>
        <div className="xmp-course-list">{filtered.map((course) => <button key={course.id} onClick={() => setSelectedId(course.id)} className={selectedId === course.id ? "active" : ""}>
          <i style={{background:course.color}}><BookOpenCheck size={16}/></i><div><b>{course.title}</b><small>{course.series}</small><span>{course.age} · {course.duration} 分钟</span></div><em className={course.state}>{statusText[course.state]}</em>
        </button>)}</div>
        <button className="xmp-import-course"><Archive size={14}/> 从 FutureClass 课程库导入</button>
      </aside>

      <main className="xmp-course-canvas">
        <header><div><span className={`xmp-course-status ${selected.state}`}><i/> {statusText[selected.state]}</span><h2>{selected.title}</h2><p>{selected.series} · {selected.age} · 单课 {selected.duration} 分钟</p></div><div><button><MoreHorizontal size={16}/></button><button className="preview"><Play size={14}/> 预演课堂</button></div></header>
        <div className="xmp-course-meta">
          <div><small>核心发展目标</small><p><span>科学探究</span><span>语言表达</span><span>合作与坚持</span></p></div>
          <div><small>版本与责任人</small><p><b>V3.2</b> · 文老师主编 · AI 协同</p></div>
          <div><small>安全检查</small><p className="safe"><ShieldCheck size={13}/> 8 项规则已通过</p></div>
        </div>
        <section className="xmp-lesson-intent"><div><span>LESSON INTENT</span><h3>本课不是让幼儿记住“发芽条件”，而是经历一次提出猜想、动手验证、用证据表达的完整探究。</h3></div><button>编辑意图 <ArrowRight size={13}/></button></section>
        <section className="xmp-journey">
          <div className="xmp-subsection-head"><div><span>LEARNING JOURNEY</span><h3>课堂学习旅程</h3></div><p>总时长 <b>35 分钟</b> · 6 个教学节拍</p></div>
          <div className="xmp-phase-list">{coursePhases.map((phase,index) => <article key={phase.title}><time>{phase.time}</time><span>{String(index + 1).padStart(2,"0")}</span><div><b>{phase.title}</b><p>{phase.detail}</p></div><em>{phase.owner}</em><button aria-label={`编辑${phase.title}`}><MoreHorizontal size={14}/></button></article>)}</div>
        </section>
        <section className="xmp-course-assets"><div className="xmp-subsection-head"><div><span>TEACHING PACKAGE</span><h3>可执行教学包</h3></div><button><Plus size={13}/> 添加资源</button></div><div><article><FileText size={17}/><div><b>教师引导脚本</b><small>含 12 个可选追问</small></div><Check size={14}/></article><article><Sparkles size={17}/><div><b>大屏互动课件</b><small>9 页 · 含 2 个互动</small></div><Check size={14}/></article><article><Bot size={17}/><div><b>奇妙宠对话脚本</b><small>已通过年龄与安全校验</small></div><Check size={14}/></article></div></section>
      </main>
    </section>

    {workbenchOpen && <div className="xmp-workbench-backdrop" role="presentation" onMouseDown={() => setWorkbenchOpen(false)}><section className="xmp-ai-workbench" role="dialog" aria-modal="true" aria-label="新建 AI 课程" onMouseDown={(event) => event.stopPropagation()}>
      <header><div><span><Sparkles size={15}/></span><div><b>AI 课程协同设计</b><small>本地演示生成 · 不发送儿童数据</small></div></div><button onClick={() => setWorkbenchOpen(false)}>×</button></header>
      <div className="xmp-agent-line"><span className="done"><Check size={12}/> 教研架构师</span><i/><span className={generating || generated ? "active" : ""}><Bot size={12}/> 活动设计师</span><i/><span className={generated ? "done" : ""}><ShieldCheck size={12}/> 安全审校员</span></div>
      <label className="xmp-brief-field"><span>用自然语言描述你的课程想法</span><textarea value={brief} onChange={(event) => setBrief(event.target.value)}/><small>{brief.length} 字 · 不要输入真实儿童姓名或个体资料</small></label>
      <div className="xmp-brief-options"><label><span>年龄段</span><select value={age} onChange={(event) => setAge(event.target.value)}><option>3–4 岁</option><option>4–5 岁</option><option>5–6 岁</option></select><ChevronDown size={13}/></label><label><span>课堂时长</span><select defaultValue="35"><option>25</option><option>30</option><option>35</option><option>40</option></select><ChevronDown size={13}/></label><label><span>设计模式</span><select defaultValue="探究式"><option>探究式</option><option>项目式</option><option>故事式</option></select><ChevronDown size={13}/></label></div>
      {generated && <div className="xmp-generation-result"><Check size={14}/><div><b>课程骨架已生成，可进入教师审阅</b><small>已形成 6 个教学节拍、3 类教学资产和 8 项安全检查。</small></div></div>}
      <footer><p><ShieldCheck size={13}/> AI 内容必须经教师确认后才能发布</p><button className="secondary" onClick={() => setWorkbenchOpen(false)}>保存草稿</button><button onClick={runDemoGeneration} disabled={generating}>{generating ? <><CircleDashed size={14}/> 多智能体协作中…</> : generated ? <>进入教师审阅 <ArrowRight size={14}/></> : <><Sparkles size={14}/> 生成课程骨架</>}</button></footer>
    </section></div>}
  </div>;
}
