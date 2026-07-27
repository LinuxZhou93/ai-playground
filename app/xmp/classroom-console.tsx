"use client";

import {
  Activity,
  ArrowLeft,
  ArrowRight,
  Bot,
  Check,
  CheckCircle2,
  ChevronRight,
  CircleAlert,
  Clock3,
  Eye,
  Hand,
  MonitorUp,
  Pause,
  Play,
  Radio,
  RotateCcw,
  ShieldCheck,
  Sparkles,
  Square,
  Tablet,
  UsersRound,
  Volume2,
  VolumeX,
  Wifi,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";

type SessionState = "ready" | "live" | "paused" | "ended";
type SideTab = "guide" | "evidence" | "devices";

const lessonSteps = [
  {
    title: "故事唤醒",
    duration: 3,
    owner: "奇妙宠",
    intent: "让幼儿对“沉睡的种子”产生好奇",
    prompt: "你觉得这颗种子为什么还没有醒来？",
    screen: "一颗沉睡的种子，正等待孩子们叫醒它。",
  },
  {
    title: "问题建构",
    duration: 5,
    owner: "教师",
    intent: "收集猜想，不急于给出答案",
    prompt: "种子醒来可能需要哪些朋友？",
    screen: "水、空气和阳光，谁会是种子的好朋友？",
  },
  {
    title: "动手探究",
    duration: 12,
    owner: "幼儿",
    intent: "自主选择变量并完成三组对照",
    prompt: "你们小组想先验证哪一个猜想？",
    screen: "选择一项条件，开始你们的种子实验。",
  },
  {
    title: "分享与追问",
    duration: 7,
    owner: "教师",
    intent: "用观察到的现象支持表达",
    prompt: "你看到了什么，让你这样想？",
    screen: "把你们看到的证据，讲给大家听。",
  },
  {
    title: "身体表达",
    duration: 5,
    owner: "幼儿",
    intent: "用动作重新表征发芽过程",
    prompt: "如果你是一颗种子，身体会怎样慢慢醒来？",
    screen: "从一颗小小的种子，长成你想象中的植物。",
  },
  {
    title: "家庭延伸",
    duration: 3,
    owner: "家园",
    intent: "把持续观察带回真实生活",
    prompt: "今晚想邀请家人和你一起观察什么？",
    screen: "把今天的发现带回家，继续照顾一颗种子。",
  },
];

const copilotSuggestions = [
  {
    id: "pace",
    type: "节奏",
    title: "孩子们仍在交换猜想",
    detail: "建议将讨论延长 2 分钟，再进入材料选择。",
    action: "延长 2 分钟",
  },
  {
    id: "question",
    type: "追问",
    title: "出现了“种子需要泥土吃饭”的表达",
    detail: "可追问：你从哪里看出泥土像食物？",
    action: "加入提问卡",
  },
  {
    id: "evidence",
    type: "证据",
    title: "检测到一次完整的同伴协商",
    detail: "候选成长证据仅保存文字摘要，等待教师确认。",
    action: "加入待审核",
  },
];

const deviceRows = [
  {
    icon: MonitorUp,
    name: "教室大屏",
    detail: "1920×1080 · 课件同步",
    signal: "18 ms",
  },
  {
    icon: Tablet,
    name: "教师控制端",
    detail: "本机 · 主控权限",
    signal: "在线",
  },
  {
    icon: Bot,
    name: "奇妙宠 × 6",
    detail: "对话脚本 V3.2",
    signal: "全部在线",
  },
];

function formatTime(seconds: number) {
  const minutes = Math.floor(seconds / 60)
    .toString()
    .padStart(2, "0");
  const rest = (seconds % 60).toString().padStart(2, "0");
  return `${minutes}:${rest}`;
}

export function ClassroomConsole() {
  const [session, setSession] = useState<SessionState>("ready");
  const [activeStep, setActiveStep] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const [sideTab, setSideTab] = useState<SideTab>("guide");
  const [quietMode, setQuietMode] = useState(false);
  const [accepted, setAccepted] = useState<string[]>([]);
  const [showSafety, setShowSafety] = useState(false);
  const current = lessonSteps[activeStep];
  const plannedMinutes = useMemo(
    () =>
      lessonSteps
        .slice(0, activeStep)
        .reduce((sum, step) => sum + step.duration, 0),
    [activeStep],
  );

  useEffect(() => {
    if (session !== "live") return;
    const timer = window.setInterval(
      () => setElapsed((value) => value + 1),
      1000,
    );
    return () => window.clearInterval(timer);
  }, [session]);

  const toggleSession = () => {
    if (session === "ready" || session === "paused") setSession("live");
    else if (session === "live") setSession("paused");
  };

  const nextStep = () => {
    if (activeStep < lessonSteps.length - 1)
      setActiveStep((value) => value + 1);
    else setSession("ended");
  };

  const acceptSuggestion = (id: string) =>
    setAccepted((items) => (items.includes(id) ? items : [...items, id]));

  return (
    <div className={`xmp-classroom-console ${quietMode ? "quiet" : ""}`}>
      <header className="xmp-live-header">
        <div className="xmp-session-identity">
          <span className={`xmp-live-dot ${session}`} />
          <div>
            <b>大一班 · 会呼吸的种子</b>
            <small>文老师主控 · 24 名幼儿 · 教室 A-301</small>
          </div>
        </div>
        <div className="xmp-session-timer">
          <small>课堂计时</small>
          <strong>{formatTime(elapsed)}</strong>
          <span>计划 {plannedMinutes + current.duration}:00</span>
        </div>
        <div className="xmp-session-health">
          <span>
            <Wifi size={13} /> 本地链路正常
          </span>
          <span>
            <ShieldCheck size={13} /> 隐私保护中
          </span>
          <button onClick={() => setShowSafety(true)}>
            <CircleAlert size={14} /> 安全接管
          </button>
        </div>
      </header>

      <section className="xmp-live-layout">
        <aside className="xmp-runbook">
          <div className="xmp-runbook-head">
            <span>LESSON RUNBOOK</span>
            <h2>课堂节拍</h2>
            <p>教师可随时调整，不由 AI 自动推进。</p>
          </div>
          <div className="xmp-runbook-list">
            {lessonSteps.map((step, index) => (
              <button
                key={step.title}
                className={`${index === activeStep ? "active" : ""} ${index < activeStep ? "done" : ""}`}
                onClick={() => setActiveStep(index)}
              >
                <span>
                  {index < activeStep ? (
                    <Check size={12} />
                  ) : (
                    String(index + 1).padStart(2, "0")
                  )}
                </span>
                <div>
                  <b>{step.title}</b>
                  <small>
                    {step.owner} · {step.duration} 分钟
                  </small>
                </div>
                {index === activeStep && <i />}
              </button>
            ))}
          </div>
          <div className="xmp-runbook-foot">
            <Clock3 size={14} />
            <div>
              <b>计划总时长 35 分钟</b>
              <small>当前节奏较预案慢 1 分 24 秒</small>
            </div>
          </div>
        </aside>

        <main className="xmp-teaching-stage">
          <div className="xmp-stage-toolbar">
            <div>
              <span>当前节拍 {String(activeStep + 1).padStart(2, "0")}</span>
              <b>{current.title}</b>
            </div>
            <div>
              <button
                className={!quietMode ? "active" : ""}
                onClick={() => setQuietMode(false)}
              >
                <Volume2 size={13} /> 教学模式
              </button>
              <button
                className={quietMode ? "active" : ""}
                onClick={() => setQuietMode(true)}
              >
                <VolumeX size={13} /> 静默模式
              </button>
            </div>
          </div>
          <section className="xmp-screen-preview">
            <div className="xmp-screen-meta">
              <span>
                <MonitorUp size={13} /> 教室大屏正在同步
              </span>
              <small>儿童端不显示教师提示</small>
            </div>
            <div className="xmp-screen-scene">
              <span className="xmp-seed-orbit">
                <i />
                <i />
                <i />
              </span>
              <small>WONDER MOMENT</small>
              <h1>{current.screen}</h1>
              <p>轻轻说出你的想法，也可以用动作告诉大家。</p>
              <div>
                <span>水</span>
                <span>空气</span>
                <span>阳光</span>
              </div>
            </div>
          </section>
          <section className="xmp-teacher-prompt">
            <div>
              <span>TEACHER PROMPT</span>
              <h3>“{current.prompt}”</h3>
              <p>{current.intent}</p>
            </div>
            <button>
              <Eye size={14} /> 仅教师可见
            </button>
          </section>
          <section className="xmp-group-pulse">
            <div className="xmp-subsection-head">
              <div>
                <span>GROUP PULSE · ANONYMOUS</span>
                <h3>小组参与脉搏</h3>
              </div>
              <p>不进行人脸识别 · 不做个体排名</p>
            </div>
            <div>
              {["向日葵组", "小雨滴组", "蒲公英组"].map((name, index) => (
                <article key={name}>
                  <span>
                    <UsersRound size={14} />
                  </span>
                  <div>
                    <b>{name}</b>
                    <small>
                      {index === 1
                        ? "正在协商材料"
                        : index === 2
                          ? "等待教师支持"
                          : "表达活跃"}
                    </small>
                  </div>
                  <i>
                    <span style={{ width: `${[78, 62, 41][index]}%` }} />
                  </i>
                  <em>{["稳定", "稳定", "需关注"][index]}</em>
                </article>
              ))}
            </div>
          </section>
        </main>

        <aside className="xmp-live-sidecar">
          <nav>
            <button
              className={sideTab === "guide" ? "active" : ""}
              onClick={() => setSideTab("guide")}
            >
              Copilot
            </button>
            <button
              className={sideTab === "evidence" ? "active" : ""}
              onClick={() => setSideTab("evidence")}
            >
              证据 <span>3</span>
            </button>
            <button
              className={sideTab === "devices" ? "active" : ""}
              onClick={() => setSideTab("devices")}
            >
              多端
            </button>
          </nav>
          {sideTab === "guide" && (
            <div className="xmp-copilot-panel">
              <div className="xmp-copilot-intro">
                <span>
                  <Sparkles size={15} />
                </span>
                <div>
                  <b>教师 Copilot</b>
                  <small>观察课堂，只向教师提供建议</small>
                </div>
                <i>LIVE</i>
              </div>
              <div className="xmp-copilot-list">
                {copilotSuggestions.map((item) => (
                  <article
                    key={item.id}
                    className={accepted.includes(item.id) ? "accepted" : ""}
                  >
                    <header>
                      <span>{item.type}</span>
                      <small>刚刚</small>
                    </header>
                    <h3>{item.title}</h3>
                    <p>{item.detail}</p>
                    <footer>
                      {accepted.includes(item.id) ? (
                        <span>
                          <CheckCircle2 size={13} /> 已由教师采纳
                        </span>
                      ) : (
                        <>
                          <button onClick={() => acceptSuggestion(item.id)}>
                            {item.action}
                          </button>
                          <button className="ignore">忽略</button>
                        </>
                      )}
                    </footer>
                  </article>
                ))}
              </div>
              <div className="xmp-copilot-boundary">
                <ShieldCheck size={14} />
                <p>
                  <b>AI 权限边界</b>
                  <span>不能自动切换节拍、评价幼儿或向家长发送内容。</span>
                </p>
              </div>
            </div>
          )}
          {sideTab === "evidence" && (
            <div className="xmp-evidence-panel">
              <div className="xmp-side-empty-head">
                <Activity size={16} />
                <div>
                  <b>候选课堂证据</b>
                  <small>全部等待教师确认</small>
                </div>
              </div>
              {[
                "同伴协商：轮流使用滴管",
                "因果表达：没有水就不会醒",
                "持续探究：重复观察三次",
              ].map((item, index) => (
                <article key={item}>
                  <span>{String(index + 1).padStart(2, "0")}</span>
                  <div>
                    <b>{item}</b>
                    <small>文字摘要 · 无人脸影像</small>
                  </div>
                  <button>
                    <ChevronRight size={14} />
                  </button>
                </article>
              ))}
              <button className="xmp-review-all">课后统一审核</button>
            </div>
          )}
          {sideTab === "devices" && (
            <div className="xmp-device-panel">
              <div className="xmp-side-empty-head">
                <Radio size={16} />
                <div>
                  <b>多端同步</b>
                  <small>园所边缘节点 · 房间 A-301</small>
                </div>
              </div>
              {deviceRows.map(({ icon: Icon, name, detail, signal }) => (
                <article key={name}>
                  <span>
                    <Icon size={15} />
                  </span>
                  <div>
                    <b>{name}</b>
                    <small>{detail}</small>
                  </div>
                  <em>
                    <i /> {signal}
                  </em>
                </article>
              ))}
              <div className="xmp-device-policy">
                <b>断网策略</b>
                <p>本地课件和教师控制持续可用，停止云端推理与数据同步。</p>
              </div>
            </div>
          )}
        </aside>
      </section>

      <footer className="xmp-live-controls">
        <div>
          <button
            onClick={() => setActiveStep((value) => Math.max(0, value - 1))}
            disabled={activeStep === 0}
          >
            <ArrowLeft size={15} /> 上一步
          </button>
          <button onClick={nextStep} disabled={session === "ended"}>
            下一节拍 <ArrowRight size={15} />
          </button>
        </div>
        <button
          className={`xmp-play-control ${session}`}
          onClick={toggleSession}
          disabled={session === "ended"}
        >
          {session === "live" ? (
            <>
              <Pause size={17} /> 暂停课堂
            </>
          ) : session === "paused" ? (
            <>
              <Play size={17} /> 继续课堂
            </>
          ) : session === "ended" ? (
            <>
              <Check size={17} /> 课堂已结束
            </>
          ) : (
            <>
              <Play size={17} /> 开始课堂
            </>
          )}
        </button>
        <div>
          <button
            onClick={() => {
              setSession("ready");
              setActiveStep(0);
              setElapsed(0);
            }}
          >
            <RotateCcw size={14} /> 重置演示
          </button>
          <button className="end" onClick={() => setSession("ended")}>
            <Square size={13} /> 结束课堂
          </button>
        </div>
      </footer>

      {session === "ready" && (
        <div className="xmp-preflight">
          <div>
            <span>
              <CheckCircle2 size={15} />
            </span>
            <p>
              <b>课前检查完成</b>
              <small>课件、教师端、教室大屏和 6 台奇妙宠已就绪。</small>
            </p>
          </div>
          <button onClick={() => setSession("live")}>
            <Play size={14} /> 开始课堂
          </button>
        </div>
      )}
      {showSafety && (
        <div
          className="xmp-safety-backdrop"
          onMouseDown={() => setShowSafety(false)}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-label="课堂安全接管"
            onMouseDown={(event) => event.stopPropagation()}
          >
            <span>
              <ShieldCheck size={22} />
            </span>
            <h2>课堂安全接管</h2>
            <p>
              立即暂停 AI
              语音、奇妙宠自动回应和候选证据采集。教师端与大屏课件仍保持可用。
            </p>
            <div>
              <button onClick={() => setShowSafety(false)}>取消</button>
              <button
                onClick={() => {
                  setQuietMode(true);
                  setSession("paused");
                  setShowSafety(false);
                }}
              >
                <Hand size={14} /> 确认接管
              </button>
            </div>
          </section>
        </div>
      )}
    </div>
  );
}
