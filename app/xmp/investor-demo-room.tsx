"use client";

import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  BookOpenCheck,
  Building2,
  Check,
  ChevronRight,
  CircleDot,
  GraduationCap,
  HeartHandshake,
  Layers3,
  Network,
  ShieldCheck,
  Sparkles,
  Sprout,
  X,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";

const demoSteps = [
  {
    id: "system",
    time: "01:30",
    label: "系统机会",
    title: "幼教缺的不是另一个 AI 功能，而是一套能进入日常工作的操作系统。",
    question: "为什么这是平台机会，而不是单点工具？",
    answer:
      "教研、课堂、观察、家园、设备和经营本来就是一条连续链路。XMP 用统一角色、数据与安全边界把它们连接起来。",
    proof: [
      "十一个模块共用同一产品壳与角色模型",
      "每个 AI 输出都进入人工责任链",
      "本地演示数据贯穿完整业务闭环",
    ],
    href: "/xmp",
    action: "查看系统全景",
    icon: Layers3,
    color: "mint",
  },
  {
    id: "curriculum",
    time: "02:00",
    label: "内容供给",
    title: "把教研意图变成可执行、可审核、可复用的课堂资产。",
    question: "课程供给怎样规模化，又不牺牲教育质量？",
    answer:
      "课程工厂把教案变成不可覆盖的版本资产：作者送审、独立教研批准、八项门禁和发布经理签名缺一不可；课堂只在课前锁版，历史版本可以审计回滚。",
    proof: [
      "多智能体生成流程可见",
      "课程阶段、教学包与结构化差异可追溯",
      "发布不替换正在运行的课堂",
    ],
    href: "/xmp/curriculum",
    action: "打开课程工厂",
    icon: BookOpenCheck,
    color: "blue",
  },
  {
    id: "classroom",
    time: "02:30",
    label: "现场交付",
    title: "AI 在课堂里协作，但方向盘始终握在教师手中。",
    question: "产品如何真正进入课堂，而不是停留在备课阶段？",
    answer:
      "实时课堂用一个可信状态机统一教师台、课堂大屏、边缘中枢与奇妙宠；现场支持节奏编排、Copilot、静音、故障降级和人工接管。",
    proof: [
      "教师命令幂等，接受与拒绝均可审计",
      "关键心跳丢失会暂停课堂并关闭 AI",
      "设备恢复后仍需教师明确恢复课堂",
    ],
    href: "/xmp/classroom",
    action: "进入实时课堂",
    icon: GraduationCap,
    color: "amber",
  },
  {
    id: "growth",
    time: "02:00",
    label: "数据复利",
    title: "课堂结束后，证据才开始产生长期价值。",
    question: "数据壁垒来自哪里，怎样避免给儿童贴标签？",
    answer:
      "系统保存可溯源的观察证据，由教师审核后形成成长记录，再转化为家园建议和下一轮课程输入。",
    proof: [
      "证据与原始课堂片段可追溯",
      "AI 解释必须经过教师确认",
      "成长—家园—课程形成反馈闭环",
    ],
    href: "/xmp/growth",
    action: "查看成长证据",
    icon: Sprout,
    color: "lilac",
  },
  {
    id: "operations",
    time: "02:00",
    label: "规模复制",
    title: "把一所园的成功，变成下一所园可重复的交付系统。",
    question: "产品怎样从项目制走向可规模化经营？",
    answer:
      "FutureClass 的班级、排课、课消、库存与财务能力被重组为园所运营和标准化交付中心；教学计划先消解教师、空间和设备冲突，再经五项就绪门禁签名发布。",
    proof: [
      "合同到 30 天陪跑的六阶段交付",
      "三类资源冲突与五项课堂就绪统一校验",
      "设备诊断、灰度发布与工单闭环",
    ],
    href: "/xmp/operations",
    action: "查看交付与 ERP",
    icon: Building2,
    color: "slate",
  },
  {
    id: "trust",
    time: "02:00",
    label: "信任门槛",
    title: "儿童数据的边界不是附录，而是产品本身。",
    question: "什么构成长期防御力和进入园所的信任基础？",
    answer:
      "默认拒绝、租户作用域、会话可信度、双人审批、监护授权、到期删除和证据审计被做成可操作控制；商业化由软件订阅、边缘硬件、实施与课程服务共同承载。",
    proof: [
      "默认拒绝与跨租户边界可验证",
      "高风险权限双人审批、限时生效、即时撤销",
      "审计证据链支撑园所采购与规模治理",
    ],
    href: "/xmp/access",
    action: "验证身份与权限",
    icon: ShieldCheck,
    color: "forest",
  },
] as const;

export function InvestorDemoRoom({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const [index, setIndex] = useState(0);
  const chapterNavRef = useRef<HTMLElement>(null);
  const active = demoSteps[index];
  const ActiveIcon = active.icon;

  useEffect(() => {
    if (!open) return;
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
      if (event.key === "ArrowRight")
        setIndex((value) => Math.min(value + 1, demoSteps.length - 1));
      if (event.key === "ArrowLeft")
        setIndex((value) => Math.max(value - 1, 0));
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [onClose, open]);

  useEffect(() => {
    const navigation = chapterNavRef.current;
    const activeButton = navigation?.children[index] as HTMLElement | undefined;
    if (!navigation || !activeButton) return;
    navigation.scrollLeft = Math.max(
      0,
      activeButton.offsetLeft -
        navigation.clientWidth / 2 +
        activeButton.clientWidth / 2,
    );
  }, [index]);

  if (!open) return null;

  return (
    <div
      className="xmp-demo-room"
      role="dialog"
      aria-modal="true"
      aria-label="XMP 融资级产品演示"
    >
      <section className="xmp-demo-room-shell">
        <header>
          <div className="xmp-demo-room-brand">
            <span>
              <Sparkles size={16} />
            </span>
            <p>
              <b>XMP PRODUCT DEMO</b>
              <small>12 分钟 · 6 幕 · 本地产品演示</small>
            </p>
          </div>
          <div className="xmp-demo-room-meta">
            <span>
              <i /> 十一大模块已就绪
            </span>
            <span>演示数据 · 非经营承诺</span>
          </div>
          <button aria-label="关闭演示" onClick={onClose}>
            <X size={18} />
          </button>
        </header>

        <div className="xmp-demo-room-body">
          <aside>
            <div>
              <span>DEMO RUNWAY</span>
              <h2>从产品闭环到规模壁垒</h2>
            </div>
            <nav ref={chapterNavRef} aria-label="演示章节">
              {demoSteps.map((step, stepIndex) => {
                const Icon = step.icon;
                return (
                  <button
                    key={step.id}
                    className={
                      stepIndex === index
                        ? "active"
                        : stepIndex < index
                          ? "done"
                          : ""
                    }
                    onClick={() => setIndex(stepIndex)}
                  >
                    <span>
                      {stepIndex < index ? (
                        <Check size={13} />
                      ) : (
                        <Icon size={13} />
                      )}
                    </span>
                    <p>
                      <b>
                        {String(stepIndex + 1).padStart(2, "0")} · {step.label}
                      </b>
                      <small>{step.time}</small>
                    </p>
                    <ChevronRight size={13} />
                  </button>
                );
              })}
            </nav>
            <footer>
              <CircleDot size={13} />
              <span>键盘 ← → 切换章节，Esc 退出</span>
            </footer>
          </aside>

          <main>
            <div className="xmp-demo-chapter-head">
              <span className={active.color}>
                <ActiveIcon size={19} />
              </span>
              <p>
                <small>
                  ACT {String(index + 1).padStart(2, "0")} / {demoSteps.length}
                </small>
                <b>{active.label}</b>
              </p>
              <em>{active.time}</em>
            </div>
            <h1>{active.title}</h1>
            <section className="xmp-demo-investor-question">
              <span>INVESTOR QUESTION</span>
              <h3>{active.question}</h3>
              <p>{active.answer}</p>
            </section>
            <section className="xmp-demo-proof">
              <span>WHAT TO PROVE LIVE</span>
              <div>
                {active.proof.map((item, proofIndex) => (
                  <article key={item}>
                    <i>{proofIndex + 1}</i>
                    <p>{item}</p>
                  </article>
                ))}
              </div>
            </section>
            {index === demoSteps.length - 1 && (
              <section className="xmp-demo-business-model">
                <span>COMMERCIAL ENGINE</span>
                <div>
                  <p>
                    <Network size={14} />
                    <b>园所软件订阅</b>
                  </p>
                  <p>
                    <Layers3 size={14} />
                    <b>边缘硬件与设备</b>
                  </p>
                  <p>
                    <HeartHandshake size={14} />
                    <b>实施与课程服务</b>
                  </p>
                </div>
              </section>
            )}
          </main>
        </div>

        <footer className="xmp-demo-room-footer">
          <div className="xmp-demo-progress">
            <span
              style={{ width: `${((index + 1) / demoSteps.length) * 100}%` }}
            />
          </div>
          <p>
            <b>
              {index + 1} / {demoSteps.length}
            </b>
            <span>只展示已实现能力；生产数据与商业指标需尽调核验。</span>
          </p>
          <button
            disabled={index === 0}
            onClick={() => setIndex((value) => Math.max(0, value - 1))}
          >
            <ArrowLeft size={14} /> 上一幕
          </button>
          <Link href={active.href} onClick={onClose}>
            {active.action}
            <ChevronRight size={14} />
          </Link>
          <button
            className="next"
            disabled={index === demoSteps.length - 1}
            onClick={() =>
              setIndex((value) => Math.min(demoSteps.length - 1, value + 1))
            }
          >
            下一幕 <ArrowRight size={14} />
          </button>
        </footer>
      </section>
    </div>
  );
}
