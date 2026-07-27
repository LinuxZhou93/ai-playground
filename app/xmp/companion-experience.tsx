"use client";

import {
  ArrowLeft,
  ArrowRight,
  Bot,
  Check,
  CheckCircle2,
  ChevronRight,
  CircleAlert,
  Clock3,
  Ear,
  Eye,
  Hand,
  HeartHandshake,
  LockKeyhole,
  MessageCircle,
  Mic,
  MicOff,
  Move,
  Pause,
  Play,
  RotateCcw,
  ShieldCheck,
  Sparkles,
  UserRoundCheck,
  Volume2,
  WifiOff,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";

type CompanionView = "child" | "adult" | "safety";
type InteractionState = "idle" | "listening" | "thinking" | "speaking";

const scenes = [
  {
    id: "wake",
    eyebrow: "故事时刻",
    line: "嘘……这颗小种子还在睡觉。我们怎样叫醒它？",
    prompt: "你可以说一说，也可以选一个试试看。",
    choices: ["轻轻叫它", "给它一点水", "先仔细看看"],
    response: "这是一个温柔的办法。我们一起看看，它有没有什么变化。",
    teacherIntent: "引发好奇，允许多种猜想，不提示标准答案。",
  },
  {
    id: "notice",
    eyebrow: "观察挑战",
    line: "你发现种子身上有什么以前没有的小变化吗？",
    prompt: "用眼睛找一找，再用手比一比。",
    choices: ["有一条小缝", "颜色变浅了", "还没有变化"],
    response: "你观察得很认真。没有变化也是一种重要的发现。",
    teacherIntent: "鼓励基于现象表达，避免对回答作对错判断。",
  },
  {
    id: "move",
    eyebrow: "身体表达",
    line: "如果你就是这颗种子，会怎样慢慢伸展身体？",
    prompt: "找一块安全的地方，用动作告诉我。",
    choices: ["蜷成小种子", "慢慢长出根", "伸向阳光"],
    response: "我看见一颗种子正在长大。每颗种子的动作都不一样。",
    teacherIntent: "通过身体动作重新表征变化，保持低屏幕依赖。",
  },
  {
    id: "close",
    eyebrow: "温柔结束",
    line: "谢谢你陪种子醒来。现在把眼睛离开屏幕，去看看真正的植物吧。",
    prompt: "本次对话将在结束后自动清除。",
    choices: ["结束探索", "告诉老师", "和家人继续"],
    response: "再见，小小探索家。下一次，我们继续从真实世界出发。",
    teacherIntent: "主动结束屏幕互动，把注意力带回真实环境。",
  },
];

const boundaryRows = [
  {
    icon: Mic,
    title: "听见当下",
    detail: "只处理按住说话期间的声音",
    state: "允许",
  },
  {
    icon: Eye,
    title: "看见作品",
    detail: "仅在成人确认后分析一次图片",
    state: "需确认",
  },
  {
    icon: MessageCircle,
    title: "回应与追问",
    detail: "使用年龄适配语料和白名单知识",
    state: "允许",
  },
  {
    icon: LockKeyhole,
    title: "长期记忆",
    detail: "默认关闭，不保留原始音频",
    state: "关闭",
  },
];

export function CompanionExperience() {
  const [view, setView] = useState<CompanionView>("child");
  const [sceneIndex, setSceneIndex] = useState(0);
  const [interaction, setInteraction] = useState<InteractionState>("idle");
  const [choice, setChoice] = useState<string | null>(null);
  const [muted, setMuted] = useState(false);
  const [adultTakeover, setAdultTakeover] = useState(false);
  const scene = scenes[sceneIndex];
  const progress = ((sceneIndex + 1) / scenes.length) * 100;
  const statusCopy = useMemo(
    () =>
      interaction === "listening"
        ? "我在认真听……"
        : interaction === "thinking"
          ? "让我想一想……"
          : interaction === "speaking"
            ? scene.response
            : choice
              ? scene.response
              : scene.line,
    [choice, interaction, scene],
  );

  useEffect(() => {
    if (interaction === "listening") {
      const timer = window.setTimeout(() => setInteraction("thinking"), 800);
      return () => window.clearTimeout(timer);
    }
    if (interaction === "thinking") {
      const timer = window.setTimeout(() => setInteraction("speaking"), 650);
      return () => window.clearTimeout(timer);
    }
  }, [interaction]);

  const moveScene = (direction: number) => {
    setSceneIndex((value) =>
      Math.min(scenes.length - 1, Math.max(0, value + direction)),
    );
    setChoice(null);
    setInteraction("idle");
  };
  const choose = (nextChoice: string) => {
    setChoice(nextChoice);
    setInteraction("speaking");
  };

  return (
    <div className={`xmp-companion view-${view}`}>
      <section className="xmp-companion-head">
        <div>
          <span>WONDER COMPANION</span>
          <h1>不是陪孩子盯着屏幕，而是陪他回到真实世界。</h1>
          <p>
            奇妙宠使用短对话、身体动作和真实材料建立探索循环；成人始终可见、可暂停、可接管。
          </p>
        </div>
        <nav aria-label="奇妙宠体验视图">
          <button
            className={view === "child" ? "active" : ""}
            onClick={() => setView("child")}
          >
            <Sparkles size={14} /> 幼儿体验
          </button>
          <button
            className={view === "adult" ? "active" : ""}
            onClick={() => setView("adult")}
          >
            <UserRoundCheck size={14} /> 成人控制
          </button>
          <button
            className={view === "safety" ? "active" : ""}
            onClick={() => setView("safety")}
          >
            <ShieldCheck size={14} /> 安全边界
          </button>
        </nav>
      </section>

      {view === "child" && (
        <section className="xmp-companion-workspace">
          <div className="xmp-device-stage">
            <div className="xmp-tablet-frame">
              <header>
                <span>
                  <i /> 奇妙宠 · 教室模式
                </span>
                <div>
                  <small>
                    {sceneIndex + 1} / {scenes.length}
                  </small>
                  <i>
                    <span style={{ width: `${progress}%` }} />
                  </i>
                </div>
                <button
                  onClick={() => setMuted((value) => !value)}
                  aria-label={muted ? "打开声音" : "关闭声音"}
                >
                  {muted ? <MicOff size={17} /> : <Volume2 size={17} />}
                </button>
              </header>
              <main className={`xmp-child-canvas ${interaction}`}>
                <div className="xmp-nature-lights">
                  <i />
                  <i />
                  <i />
                  <i />
                </div>
                <div className="xmp-mascot-wrap">
                  <span className="xmp-mascot-halo" />
                  <img
                    src="/assets/img/titan-ai-mascot.png"
                    alt="奇妙宠机器人演示形象"
                  />
                  {interaction === "listening" && (
                    <div className="xmp-listening-rings">
                      <i />
                      <i />
                      <i />
                    </div>
                  )}
                </div>
                <span className="xmp-child-eyebrow">{scene.eyebrow}</span>
                <h2>{statusCopy}</h2>
                <p>
                  {interaction === "idle" && !choice
                    ? scene.prompt
                    : interaction === "listening"
                      ? "说完后松开就好"
                      : "没有标准答案，说出你的发现就很棒"}
                </p>
                <button
                  className={`xmp-talk-button ${interaction}`}
                  onClick={() =>
                    setInteraction(
                      interaction === "listening" ? "idle" : "listening",
                    )
                  }
                >
                  <Mic size={23} />
                  <span>
                    {interaction === "listening"
                      ? "正在听你说"
                      : "按一下，说给我听"}
                  </span>
                </button>
                <div className="xmp-child-choices">
                  {scene.choices.map((item) => (
                    <button
                      key={item}
                      aria-label={item}
                      className={choice === item ? "selected" : ""}
                      onClick={() => choose(item)}
                    >
                      <span>
                        {choice === item ? (
                          <Check size={16} />
                        ) : (
                          <Hand size={16} />
                        )}
                      </span>
                      {item}
                    </button>
                  ))}
                </div>
                <div className="xmp-child-privacy">
                  <ShieldCheck size={14} /> 不拍照 · 不定位 · 不识别人脸
                </div>
              </main>
              <footer>
                <button
                  onClick={() => moveScene(-1)}
                  disabled={sceneIndex === 0}
                >
                  <ArrowLeft size={17} /> 上一个
                </button>
                <div>
                  <button onClick={() => setAdultTakeover(true)}>
                    <HeartHandshake size={17} /> 找老师
                  </button>
                  <button
                    onClick={() => {
                      setSceneIndex(0);
                      setChoice(null);
                      setInteraction("idle");
                    }}
                  >
                    <RotateCcw size={16} /> 重新开始
                  </button>
                </div>
                <button
                  onClick={() => moveScene(1)}
                  disabled={sceneIndex === scenes.length - 1}
                >
                  下一个 <ArrowRight size={17} />
                </button>
              </footer>
            </div>
          </div>
          <aside className="xmp-companion-side">
            <div className="xmp-companion-live">
              <header>
                <span>
                  <i /> 体验监护中
                </span>
                <small>本地会话</small>
              </header>
              <div>
                <span>
                  <Bot size={17} />
                </span>
                <p>
                  <b>
                    {scene.eyebrow} · {scene.id.toUpperCase()}
                  </b>
                  <small>{scene.teacherIntent}</small>
                </p>
              </div>
              <dl>
                <div>
                  <dt>互动时长</dt>
                  <dd>04:18</dd>
                </div>
                <div>
                  <dt>屏幕连续使用</dt>
                  <dd className="good">低于 8 分钟</dd>
                </div>
                <div>
                  <dt>成人可见性</dt>
                  <dd className="good">教师端在线</dd>
                </div>
              </dl>
            </div>
            <div className="xmp-interaction-map">
              <div className="xmp-side-title">
                <span>INTERACTION LOOP</span>
                <h3>儿童交互循环</h3>
              </div>
              <div>
                {[
                  { icon: Ear, label: "听", detail: "一句话" },
                  { icon: Eye, label: "看", detail: "一个焦点" },
                  { icon: MessageCircle, label: "说", detail: "自由表达" },
                  { icon: Move, label: "做", detail: "回到真实" },
                ].map(({ icon: Icon, label, detail }, index) => (
                  <article key={label}>
                    <span>
                      <Icon size={16} />
                    </span>
                    <div>
                      <b>{label}</b>
                      <small>{detail}</small>
                    </div>
                    {index < 3 && <ChevronRight size={14} />}
                  </article>
                ))}
              </div>
            </div>
            <div className="xmp-session-memory">
              <Clock3 size={15} />
              <div>
                <b>会话记忆将在结束后清除</b>
                <small>当前仅保留完成本次互动所需的临时上下文。</small>
              </div>
              <span>SESSION ONLY</span>
            </div>
            <button
              className="xmp-adult-takeover"
              onClick={() => setAdultTakeover(true)}
            >
              <Pause size={15} /> 暂停并由成人接管
            </button>
          </aside>
        </section>
      )}
      {view === "adult" && (
        <AdultControl
          onReturn={() => setView("child")}
          onTakeover={() => setAdultTakeover(true)}
        />
      )}
      {view === "safety" && <SafetyBoundary />}
      {adultTakeover && (
        <div
          className="xmp-takeover-backdrop"
          onMouseDown={() => setAdultTakeover(false)}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-label="成人接管奇妙宠"
            onMouseDown={(event) => event.stopPropagation()}
          >
            <span>
              <HeartHandshake size={23} />
            </span>
            <h2>已暂停奇妙宠回应</h2>
            <p>
              麦克风处理、自动语音和临时上下文均已停止。现在由老师或家长面对面回应孩子。
            </p>
            <div>
              <button onClick={() => setAdultTakeover(false)}>保持暂停</button>
              <button
                onClick={() => {
                  setAdultTakeover(false);
                  setInteraction("idle");
                }}
              >
                <Play size={14} /> 成人确认后恢复
              </button>
            </div>
          </section>
        </div>
      )}
    </div>
  );
}

function AdultControl({
  onReturn,
  onTakeover,
}: {
  onReturn: () => void;
  onTakeover: () => void;
}) {
  const [childVoice, setChildVoice] = useState(true);
  const [imageInput, setImageInput] = useState(false);
  return (
    <section className="xmp-adult-console">
      <aside>
        <div className="xmp-side-title">
          <span>SESSION CONTROL</span>
          <h3>奇妙宠会话</h3>
        </div>
        <div className="xmp-adult-status">
          <i />
          <p>
            <b>大一班 · 设备 C-03</b>
            <small>文老师监护 · 本地推理优先</small>
          </p>
        </div>
        {["当前互动", "能力与权限", "内容记录", "家庭延伸"].map(
          (item, index) => (
            <button className={index === 0 ? "active" : ""} key={item}>
              <span>0{index + 1}</span>
              {item}
              <ChevronRight size={14} />
            </button>
          ),
        )}
        <button className="return" onClick={onReturn}>
          <ArrowLeft size={14} /> 返回幼儿体验
        </button>
      </aside>
      <main>
        <header>
          <div>
            <span>ADULT-GOVERNED SESSION</span>
            <h2>孩子在探索，成人掌握边界。</h2>
            <p>
              所有感知能力默认最小开启；涉及图像、保存或分享时必须重新取得成人确认。
            </p>
          </div>
          <button onClick={onTakeover}>
            <Pause size={14} /> 立即接管
          </button>
        </header>
        <div className="xmp-adult-grid">
          <section>
            <div className="xmp-side-title">
              <span>CURRENT CONTEXT</span>
              <h3>当前对话上下文</h3>
            </div>
            <article className="xmp-context-card">
              <span>
                <Bot size={19} />
              </span>
              <div>
                <small>奇妙宠正在引导</small>
                <b>“你发现种子有什么小变化吗？”</b>
                <p>仅保留本轮课程主题、当前节拍和已选择的互动项。</p>
              </div>
            </article>
            <div className="xmp-context-timeline">
              <article>
                <time>09:24:03</time>
                <span />
                <p>
                  <b>儿童选择</b>
                  <small>“先仔细看看”</small>
                </p>
              </article>
              <article>
                <time>09:24:08</time>
                <span />
                <p>
                  <b>系统回应</b>
                  <small>鼓励观察，没有评价正确与否</small>
                </p>
              </article>
              <article>
                <time>现在</time>
                <span />
                <p>
                  <b>等待表达</b>
                  <small>麦克风尚未启动</small>
                </p>
              </article>
            </div>
          </section>
          <section>
            <div className="xmp-side-title">
              <span>CAPABILITY GATES</span>
              <h3>感知能力开关</h3>
            </div>
            <label>
              <span>
                <Mic size={15} />
                <p>
                  <b>按住说话</b>
                  <small>只处理主动触发期间的声音</small>
                </p>
              </span>
              <button
                aria-label={childVoice ? "关闭按住说话" : "开启按住说话"}
                className={childVoice ? "on" : ""}
                onClick={() => setChildVoice(!childVoice)}
              >
                <i />
              </button>
            </label>
            <label>
              <span>
                <Eye size={15} />
                <p>
                  <b>一次性作品识别</b>
                  <small>需成人逐次确认，不连续录像</small>
                </p>
              </span>
              <button
                aria-label={imageInput ? "关闭作品识别" : "开启作品识别"}
                className={imageInput ? "on" : ""}
                onClick={() => setImageInput(!imageInput)}
              >
                <i />
              </button>
            </label>
            <label>
              <span>
                <WifiOff size={15} />
                <p>
                  <b>断网继续</b>
                  <small>使用已审核脚本，停止云端能力</small>
                </p>
              </span>
              <em>已启用</em>
            </label>
            <div className="xmp-data-minimum">
              <ShieldCheck size={15} />
              <p>
                <b>最小化采集正在生效</b>
                <small>不采集定位、通讯录、生物特征和持续环境音。</small>
              </p>
            </div>
          </section>
        </div>
      </main>
    </section>
  );
}

function SafetyBoundary() {
  return (
    <section className="xmp-safety-center">
      <header>
        <span>
          <ShieldCheck size={20} />
        </span>
        <div>
          <small>CHILD SAFETY BY DESIGN</small>
          <h2>不是一份藏在设置里的隐私政策，而是每次互动都能看见的边界。</h2>
          <p>以下状态均为本地演示配置，展示产品默认规则与成人控制点。</p>
        </div>
        <em>8 项规则通过</em>
      </header>
      <div className="xmp-boundary-layout">
        <section>
          <div className="xmp-side-title">
            <span>CAPABILITY BOUNDARY</span>
            <h3>能力边界</h3>
          </div>
          {boundaryRows.map(({ icon: Icon, title, detail, state }) => (
            <article key={title}>
              <span>
                <Icon size={16} />
              </span>
              <div>
                <b>{title}</b>
                <small>{detail}</small>
              </div>
              <em
                className={
                  state === "关闭" ? "off" : state === "需确认" ? "confirm" : ""
                }
              >
                {state}
              </em>
            </article>
          ))}
        </section>
        <section>
          <div className="xmp-side-title">
            <span>CONTENT GUARDRAILS</span>
            <h3>内容护栏</h3>
          </div>
          {[
            "不诱导儿童提供姓名、住址、学校等身份信息",
            "不以奖励或情感依赖换取持续互动",
            "不作医疗、心理或能力诊断，不给儿童贴标签",
            "遇到危险、欺凌或不适表达时，立即转交成人",
          ].map((item, index) => (
            <article key={item}>
              <span>{index + 1}</span>
              <p>{item}</p>
              <CheckCircle2 size={15} />
            </article>
          ))}
        </section>
        <section className="xmp-safety-route">
          <div className="xmp-side-title">
            <span>ESCALATION ROUTE</span>
            <h3>成人升级路径</h3>
          </div>
          <div>
            <article>
              <span>
                <Bot size={16} />
              </span>
              <p>
                <b>奇妙宠识别边界事件</b>
                <small>停止追问，使用中性安抚话术</small>
              </p>
            </article>
            <i />
            <article>
              <span>
                <CircleAlert size={16} />
              </span>
              <p>
                <b>教师端收到提醒</b>
                <small>仅显示必要上下文，不自动归档</small>
              </p>
            </article>
            <i />
            <article>
              <span>
                <HeartHandshake size={16} />
              </span>
              <p>
                <b>成人面对面接管</b>
                <small>由教师决定是否记录与通知家长</small>
              </p>
            </article>
          </div>
        </section>
      </div>
    </section>
  );
}
