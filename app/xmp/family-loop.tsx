"use client";

import {
  ArrowLeft,
  BellRing,
  BookOpenCheck,
  CalendarClock,
  Check,
  CheckCircle2,
  ChevronRight,
  CircleAlert,
  Clock3,
  FileCheck2,
  HeartHandshake,
  Home,
  Inbox,
  Leaf,
  LockKeyhole,
  MessageCircle,
  Mic2,
  MoreHorizontal,
  Paperclip,
  PenLine,
  Play,
  Send,
  ShieldCheck,
  Smartphone,
  Sparkles,
  Sprout,
  UserRoundCheck,
  UsersRound,
  X,
} from "lucide-react";
import { useMemo, useState } from "react";
import { useXmpEvents, XMP_DEMO_CORRELATION_ID } from "./event-store";

type FamilyPane = "feed" | "task" | "messages";
type DispatchStatus = "ready" | "scheduled" | "delivered";
type FeedbackStatus = "pending" | "approved" | "rejected";

type FamilyContent = {
  id: string;
  type: "brief" | "quest" | "notice";
  title: string;
  summary: string;
  source: string;
  status: DispatchStatus;
  audience: string;
  signed: boolean;
};

type FamilyFeedback = {
  id: string;
  title: string;
  child: string;
  relation: string;
  time: string;
  fact: string;
  note: string;
  source: "text" | "voice";
  status: FeedbackStatus;
};

const contentSeed: FamilyContent[] = [
  {
    id: "fc-01",
    type: "brief",
    title: "在一颗种子里，看见耐心的观察",
    summary: "2 条教师确认证据 · 文老师已签名",
    source: "成长智能 ·《会呼吸的种子》",
    status: "ready",
    audience: "大一班 · 演示家庭 18 户",
    signed: true,
  },
  {
    id: "fc-02",
    type: "quest",
    title: "今晚只观察一个变化",
    summary: "家庭轻任务 · 预计 5 分钟 · 无需上传照片",
    source: "课程工厂 · 家庭延伸建议",
    status: "scheduled",
    audience: "大一班 · 演示家庭 18 户",
    signed: true,
  },
  {
    id: "fc-03",
    type: "notice",
    title: "周五自然材料工作坊提醒",
    summary: "园务通知 · 需要家长确认是否参加",
    source: "园所运营 · 活动排期",
    status: "delivered",
    audience: "大一班 · 演示家庭 18 户",
    signed: true,
  },
];

const feedbackSeed: FamilyFeedback[] = [
  {
    id: "ff-01",
    title: "发现绿豆外皮变软",
    child: "演示幼儿 A17",
    relation: "家庭成员",
    time: "今天 19:42",
    fact: "孩子指着杯子说，绿豆的皮摸起来比早上软，而且水变少了一点。",
    note: "我们只追问了“你看见什么”，没有提示答案。",
    source: "voice",
    status: "pending",
  },
  {
    id: "ff-02",
    title: "主动给家里的植物做标记",
    child: "演示幼儿 B04",
    relation: "家庭成员",
    time: "昨天 20:16",
    fact: "孩子用纸条标出叶片位置，说第二天要看它有没有长高。",
    note: "家庭反馈仅作为新候选，等待教师判断是否与课堂目标相关。",
    source: "text",
    status: "pending",
  },
  {
    id: "ff-03",
    title: "“非常专注”主观评价",
    child: "演示幼儿 C11",
    relation: "家庭成员",
    time: "昨天 19:28",
    fact: "反馈仅写有“今天非常专注、表现特别好”，没有具体行为或情境描述。",
    note: "缺少可观察事实，不能进入成长证据队列。",
    source: "text",
    status: "rejected",
  },
];

const statusLabel: Record<DispatchStatus, string> = {
  ready: "待发布",
  scheduled: "已排期",
  delivered: "已送达",
};

export function FamilyLoop() {
  const { emit } = useXmpEvents();
  const [contents, setContents] = useState(contentSeed);
  const [selectedContentId, setSelectedContentId] = useState("fc-01");
  const [feedback, setFeedback] = useState(feedbackSeed);
  const [selectedFeedbackId, setSelectedFeedbackId] = useState("ff-01");
  const [familyPane, setFamilyPane] = useState<FamilyPane>("feed");
  const [scheduleOpen, setScheduleOpen] = useState(false);
  const [questAccepted, setQuestAccepted] = useState(false);
  const [questSubmitted, setQuestSubmitted] = useState(false);
  const [replyOpen, setReplyOpen] = useState(false);

  const selectedContent =
    contents.find((item) => item.id === selectedContentId) ?? contents[0];
  const selectedFeedback =
    feedback.find((item) => item.id === selectedFeedbackId) ?? feedback[0];
  const pendingFeedback = feedback.filter(
    (item) => item.status === "pending",
  ).length;
  const deliveredCount = contents.filter(
    (item) => item.status === "delivered",
  ).length;

  const familyTimeline = useMemo(
    () => [
      { label: "简报已送达", value: selectedContent.status === "delivered" },
      { label: "家长已阅读", value: selectedContent.status === "delivered" },
      { label: "家庭任务已领取", value: questAccepted },
      { label: "反馈已回流", value: questSubmitted },
    ],
    [selectedContent.status, questAccepted, questSubmitted],
  );

  const updateContentStatus = (status: DispatchStatus) => {
    setContents((items) =>
      items.map((item) =>
        item.id === selectedContent.id ? { ...item, status } : item,
      ),
    );
    setScheduleOpen(false);
    if (status === "delivered") {
      emit({
        correlationId: XMP_DEMO_CORRELATION_ID,
        kind: "family.dispatched",
        domain: "family",
        title: "教师签名内容已送达家庭",
        detail: `“${selectedContent.title}”已按授权范围发布，送达与阅读分开记录。`,
        actor: "文老师",
        entity: selectedContent.audience,
        privacy: "teacher-reviewed",
      });
    }
  };

  const updateFeedbackStatus = (status: FeedbackStatus) => {
    setFeedback((items) =>
      items.map((item) =>
        item.id === selectedFeedback.id ? { ...item, status } : item,
      ),
    );
    if (status !== "pending") {
      emit({
        correlationId: XMP_DEMO_CORRELATION_ID,
        kind:
          status === "approved"
            ? "family.feedback_candidate"
            : "family.feedback_rejected",
        domain: "family",
        title:
          status === "approved"
            ? "家庭事实转为二次审核候选"
            : "家庭反馈未采纳为证据",
        detail:
          status === "approved"
            ? `“${selectedFeedback.title}”仅进入教师候选队列，不直接改变成长画像。`
            : `“${selectedFeedback.title}”缺少可观察事实或相关性，保留处理轨迹。`,
        actor: "文老师",
        entity: selectedFeedback.id.toUpperCase(),
        privacy: "teacher-reviewed",
      });
    }
  };

  return (
    <div className="xmp-family">
      <section className="xmp-family-head">
        <div>
          <span>FAMILY LOOP</span>
          <h1>把课堂带回家，但不把家庭变成第二间教室。</h1>
          <p>
            复用 FutureClass
            家长端、成长档案与园务通知能力，让教师签名内容安全抵达家庭，让真实家庭观察重新回到教师判断。
          </p>
        </div>
        <div>
          <span>
            <ShieldCheck size={14} /> 教师发布 · 家庭自愿 · 反馈再审核
          </span>
          <button onClick={() => setFamilyPane("messages")}>
            <MessageCircle size={15} /> 打开家长消息
          </button>
        </div>
      </section>

      <section className="xmp-family-kpis">
        <article>
          <span>
            <FileCheck2 size={15} />
          </span>
          <div>
            <b>4</b>
            <small>本周已签名简报</small>
          </div>
          <em>全部可追溯证据</em>
        </article>
        <article>
          <span>
            <Send size={15} />
          </span>
          <div>
            <b>{deliveredCount}</b>
            <small>内容已送达</small>
          </div>
          <em>演示家庭 18 户</em>
        </article>
        <article>
          <span>
            <Inbox size={15} />
          </span>
          <div>
            <b>{pendingFeedback}</b>
            <small>家庭反馈待确认</small>
          </div>
          <em className="warn">不自动进入档案</em>
        </article>
        <article>
          <span>
            <HeartHandshake size={15} />
          </span>
          <div>
            <b>76%</b>
            <small>本周家庭阅读覆盖</small>
          </div>
          <em>仅统计送达与阅读</em>
        </article>
      </section>

      <section className="xmp-family-workbench">
        <aside className="xmp-family-outbox">
          <header>
            <div>
              <span>TEACHER OUTBOX</span>
              <h2>待发布内容</h2>
            </div>
            <button aria-label="新建家庭内容">
              <PenLine size={14} />
            </button>
          </header>
          <div className="xmp-family-outbox-tabs">
            <button className="active">全部 {contents.length}</button>
            <button>待处理 1</button>
            <button>已送达 {deliveredCount}</button>
          </div>
          <div className="xmp-family-content-list">
            {contents.map((item) => (
              <button
                key={item.id}
                className={selectedContent.id === item.id ? "active" : ""}
                onClick={() => setSelectedContentId(item.id)}
              >
                <span className={item.type}>
                  {item.type === "brief" ? (
                    <BookOpenCheck size={14} />
                  ) : item.type === "quest" ? (
                    <Home size={14} />
                  ) : (
                    <BellRing size={14} />
                  )}
                </span>
                <div>
                  <b>{item.title}</b>
                  <small>{item.summary}</small>
                  <em>{item.source}</em>
                </div>
                <i className={item.status}>{statusLabel[item.status]}</i>
              </button>
            ))}
          </div>
          <section className="xmp-dispatch-card">
            <div className="xmp-family-section-title">
              <span>DISPATCH CONTROL</span>
              <h3>发布控制</h3>
            </div>
            <dl>
              <div>
                <dt>接收范围</dt>
                <dd>{selectedContent.audience}</dd>
              </div>
              <div>
                <dt>审核状态</dt>
                <dd className={selectedContent.signed ? "safe" : "blocked"}>
                  {selectedContent.signed ? (
                    <>
                      <UserRoundCheck size={12} /> 教师已签名
                    </>
                  ) : (
                    <>
                      <LockKeyhole size={12} /> 尚未签名
                    </>
                  )}
                </dd>
              </div>
              <div>
                <dt>儿童数据</dt>
                <dd>不含原始音视频与精确定位</dd>
              </div>
            </dl>
            {selectedContent.status === "ready" ? (
              <div className="xmp-dispatch-actions">
                <button onClick={() => setScheduleOpen(!scheduleOpen)}>
                  <CalendarClock size={13} /> 设定时间
                </button>
                <button
                  className="primary"
                  onClick={() => updateContentStatus("delivered")}
                  disabled={!selectedContent.signed}
                >
                  <Send size={13} /> 教师确认发布
                </button>
              </div>
            ) : (
              <div className={`xmp-dispatch-state ${selectedContent.status}`}>
                {selectedContent.status === "scheduled" ? (
                  <CalendarClock size={14} />
                ) : (
                  <CheckCircle2 size={14} />
                )}
                <p>
                  <b>
                    {selectedContent.status === "scheduled"
                      ? "计划今晚 19:30 发送"
                      : "已送达家庭端"}
                  </b>
                  <span>
                    {selectedContent.status === "scheduled"
                      ? "到时仍可撤回或改期"
                      : "演示环境未发送真实消息"}
                  </span>
                </p>
              </div>
            )}
            {scheduleOpen && (
              <div className="xmp-schedule-popover">
                <span>建议家庭可阅读时段</span>
                <button onClick={() => updateContentStatus("scheduled")}>
                  <Clock3 size={12} /> 今天 19:30 <Check size={12} />
                </button>
                <button onClick={() => updateContentStatus("scheduled")}>
                  <Clock3 size={12} /> 明天 08:00
                </button>
              </div>
            )}
          </section>
          <footer>
            <ShieldCheck size={13} />
            <span>
              只有教师签名内容可以发布；发送、撤回、阅读与反馈均保留审计记录。
            </span>
          </footer>
        </aside>

        <main className="xmp-family-preview">
          <header>
            <div>
              <span>FAMILY EXPERIENCE PREVIEW</span>
              <h2>家长端实时预览</h2>
            </div>
            <span>
              <Smartphone size={13} /> 390 × 844
            </span>
          </header>
          <div className="xmp-family-device-stage">
            <div className="xmp-family-phone">
              <header>
                <button aria-label="返回">
                  <ArrowLeft size={16} />
                </button>
                <div>
                  <b>奇妙伙伴</b>
                  <small>演示幼儿 A17 的家庭空间</small>
                </div>
                <button aria-label="更多">
                  <MoreHorizontal size={17} />
                </button>
              </header>
              <nav>
                <button
                  className={familyPane === "feed" ? "active" : ""}
                  onClick={() => setFamilyPane("feed")}
                >
                  <Leaf size={15} />
                  今日
                </button>
                <button
                  className={familyPane === "task" ? "active" : ""}
                  onClick={() => setFamilyPane("task")}
                >
                  <Home size={15} />
                  一起做
                </button>
                <button
                  className={familyPane === "messages" ? "active" : ""}
                  onClick={() => setFamilyPane("messages")}
                >
                  <MessageCircle size={15} />
                  消息
                </button>
              </nav>
              <div className="xmp-family-phone-content">
                {familyPane === "feed" ? (
                  <FamilyFeed onOpenTask={() => setFamilyPane("task")} />
                ) : familyPane === "task" ? (
                  <FamilyQuest
                    accepted={questAccepted}
                    submitted={questSubmitted}
                    onAccept={() => setQuestAccepted(true)}
                    onSubmit={() => setQuestSubmitted(true)}
                  />
                ) : (
                  <FamilyMessages
                    replyOpen={replyOpen}
                    onReply={() => setReplyOpen(!replyOpen)}
                  />
                )}
              </div>
            </div>
          </div>
          <footer>
            <LockKeyhole size={13} />
            <span>
              家长仅能查看与自己绑定的儿童内容；本页为本地演示，不触达真实家庭。
            </span>
          </footer>
        </main>

        <aside className="xmp-family-return">
          <header>
            <div>
              <span>RETURN INBOX</span>
              <h2>家庭回流审核</h2>
            </div>
            <em>{pendingFeedback} 待确认</em>
          </header>
          <div className="xmp-return-list">
            {feedback.map((item) => (
              <button
                key={item.id}
                className={selectedFeedback.id === item.id ? "active" : ""}
                onClick={() => setSelectedFeedbackId(item.id)}
              >
                <span className={item.source}>
                  {item.source === "voice" ? (
                    <Mic2 size={13} />
                  ) : (
                    <MessageCircle size={13} />
                  )}
                </span>
                <div>
                  <b>{item.title}</b>
                  <small>
                    {item.child} · {item.time}
                  </small>
                </div>
                <i className={item.status}>
                  {item.status === "approved" ? (
                    <Check size={10} />
                  ) : item.status === "rejected" ? (
                    <X size={10} />
                  ) : (
                    <Clock3 size={10} />
                  )}
                </i>
              </button>
            ))}
          </div>
          <section className="xmp-return-review">
            <div className="xmp-return-context">
              <span>{selectedFeedback.relation}反馈</span>
              <em>{selectedFeedback.time}</em>
            </div>
            <h3>{selectedFeedback.title}</h3>
            {selectedFeedback.source === "voice" && (
              <button className="xmp-voice-summary">
                <Play size={12} fill="currentColor" />
                <i>
                  <span />
                </i>
                <time>0:18</time>
              </button>
            )}
            <div className="xmp-return-fact">
              <span>家庭描述的事实</span>
              <p>{selectedFeedback.fact}</p>
            </div>
            <div className="xmp-return-note">
              <Sparkles size={13} />
              <p>
                <b>AI 仅做结构化整理</b>
                <span>{selectedFeedback.note}</span>
              </p>
            </div>
            <div className="xmp-return-boundary">
              <CircleAlert size={13} />
              <span>
                家庭反馈不能直接改变成长画像；教师确认后也只会成为“家庭情境候选证据”。
              </span>
            </div>
          </section>
          {selectedFeedback.status === "pending" ? (
            <footer>
              <button
                className="reject"
                onClick={() => updateFeedbackStatus("rejected")}
              >
                <X size={13} /> 不采纳
              </button>
              <button
                className="approve"
                onClick={() => updateFeedbackStatus("approved")}
              >
                <Check size={13} /> 转为证据候选
              </button>
            </footer>
          ) : (
            <div className={`xmp-return-result ${selectedFeedback.status}`}>
              {selectedFeedback.status === "approved" ? (
                <CheckCircle2 size={14} />
              ) : (
                <X size={14} />
              )}
              <p>
                <b>
                  {selectedFeedback.status === "approved"
                    ? "已进入教师证据候选队列"
                    : "未采纳为成长证据"}
                </b>
                <span>
                  {selectedFeedback.status === "approved"
                    ? "仍需在成长智能中二次确认"
                    : "原始家庭消息仍按留存策略保存"}
                </span>
              </p>
              <button onClick={() => updateFeedbackStatus("pending")}>
                撤销
              </button>
            </div>
          )}
          <div className="xmp-loop-trace">
            <div className="xmp-family-section-title">
              <span>LOOP TRACE</span>
              <h3>闭环进度</h3>
            </div>
            {familyTimeline.map((step, index) => (
              <div key={step.label} className={step.value ? "done" : ""}>
                <span>{step.value ? <Check size={10} /> : index + 1}</span>
                <b>{step.label}</b>
                {index < familyTimeline.length - 1 && <i />}
              </div>
            ))}
          </div>
        </aside>
      </section>
    </div>
  );
}

function FamilyFeed({ onOpenTask }: { onOpenTask: () => void }) {
  return (
    <div className="xmp-family-feed">
      <section className="xmp-phone-welcome">
        <span>7 月 28 日 · 星期二</span>
        <h3>晚上好，今天有一件小事想和你分享。</h3>
        <p>内容均由文老师确认后发布。</p>
      </section>
      <article className="xmp-phone-story">
        <header>
          <span>
            <Sprout size={14} />
          </span>
          <div>
            <b>今日成长简报</b>
            <small>文老师签名 · 来自 2 条课堂证据</small>
          </div>
        </header>
        <h3>在一颗种子里，看见耐心的观察</h3>
        <p>
          今天，孩子注意到浸水后的种皮出现小缝，并试着用“所以”连接自己看见的变化和猜想。
        </p>
        <blockquote>“它的皮开了一条小缝，所以它可能正在醒来。”</blockquote>
        <button>
          查看完整简报 <ChevronRight size={13} />
        </button>
      </article>
      <article className="xmp-phone-quest-card">
        <span>
          <Home size={15} />
        </span>
        <div>
          <small>今晚可选 · 约 5 分钟</small>
          <b>只观察家里一颗植物的一个变化</b>
          <p>不用教答案，也不要求拍照。</p>
        </div>
        <button onClick={onOpenTask}>一起做</button>
      </article>
      <div className="xmp-phone-privacy">
        <ShieldCheck size={12} />
        <span>这里没有能力分数、同龄排名或自动诊断。</span>
      </div>
    </div>
  );
}

function FamilyQuest({
  accepted,
  submitted,
  onAccept,
  onSubmit,
}: {
  accepted: boolean;
  submitted: boolean;
  onAccept: () => void;
  onSubmit: () => void;
}) {
  return (
    <div className="xmp-family-quest">
      <span className="xmp-quest-index">FAMILY QUEST 01</span>
      <h3>今晚只观察一个变化</h3>
      <p>找一颗家里的植物或一粒泡在水里的豆子，和孩子一起看 5 分钟。</p>
      <section>
        <div>
          <span>1</span>
          <p>
            <b>先让孩子自己看</b>
            <small>不急着提问，也不用解释知识。</small>
          </p>
        </div>
        <div>
          <span>2</span>
          <p>
            <b>只问一个问题</b>
            <small>“你看见了什么，让你这样想？”</small>
          </p>
        </div>
        <div>
          <span>3</span>
          <p>
            <b>愿意再记录</b>
            <small>一句原话就够了，照片与语音都不是必需。</small>
          </p>
        </div>
      </section>
      <div className="xmp-quest-boundary">
        <Clock3 size={13} />
        <p>
          <b>5 分钟后就可以结束</b>
          <span>这不是作业，不评价完成质量，也不会形成家庭排名。</span>
        </p>
      </div>
      {!accepted ? (
        <button className="xmp-quest-primary" onClick={onAccept}>
          <HeartHandshake size={14} /> 我们愿意试试看
        </button>
      ) : !submitted ? (
        <div className="xmp-quest-response">
          <label>
            <span>记录一句看见的事实（可选）</span>
            <textarea defaultValue="孩子说：绿豆的皮比早上软了，杯子里的水也少了一点。" />
          </label>
          <div>
            <button>
              <Paperclip size={13} /> 添加材料
            </button>
            <button className="primary" onClick={onSubmit}>
              <Send size={13} /> 提交给老师
            </button>
          </div>
        </div>
      ) : (
        <div className="xmp-quest-complete">
          <CheckCircle2 size={17} />
          <p>
            <b>谢谢你留下真实的一刻</b>
            <span>反馈已交给文老师审核，不会自动进入成长档案。</span>
          </p>
        </div>
      )}
    </div>
  );
}

function FamilyMessages({
  replyOpen,
  onReply,
}: {
  replyOpen: boolean;
  onReply: () => void;
}) {
  return (
    <div className="xmp-family-messages">
      <header>
        <div>
          <span>文</span>
          <p>
            <b>文老师</b>
            <small>大一班 · 工作时间内回复</small>
          </p>
        </div>
        <em>园所已验证</em>
      </header>
      <section>
        <time>今天 17:26</time>
        <div className="teacher">
          今天的成长简报已经发布。如果晚上愿意，可以和孩子一起观察一颗植物；不方便完成也完全没有关系。
        </div>
        <div className="family">收到，我们会让他自己先看看。</div>
        <div className="teacher">
          好的，记录一句孩子的原话就足够了，不需要拍照。
        </div>
      </section>
      {replyOpen ? (
        <div className="xmp-message-composer">
          <textarea placeholder="输入消息…" autoFocus />
          <div>
            <span>
              <Clock3 size={11} /> 教师可能在下个工作时段回复
            </span>
            <button onClick={onReply}>
              <Send size={13} /> 发送
            </button>
          </div>
        </div>
      ) : (
        <button className="xmp-open-reply" onClick={onReply}>
          <MessageCircle size={14} /> 给文老师留言
        </button>
      )}
      <footer>
        <UsersRound size={12} />{" "}
        紧急接送、健康或安全事项请直接联系园所值班电话。
      </footer>
    </div>
  );
}
