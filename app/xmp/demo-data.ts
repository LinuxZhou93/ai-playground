import {
  Bot,
  Building2,
  GraduationCap,
  HeartHandshake,
  LayoutDashboard,
  Network,
  ShieldCheck,
  Sparkles,
  Sprout,
} from "lucide-react";
import type { XmpDemoTenant, XmpModule, XmpRole } from "./model";

export const XMP_ROLES: { id: XmpRole; name: string; shortName: string }[] = [
  { id: "operator", name: "园所管理者", shortName: "园" },
  { id: "research", name: "教研负责人", shortName: "研" },
  { id: "teacher", name: "主班教师", shortName: "师" },
  { id: "family", name: "家长体验", shortName: "家" },
];

export const XMP_MODULES: XmpModule[] = [
  { id: "overview", name: "系统总控台", englishName: "Command Center", description: "产品全景、教学闭环与关键行动信号。", href: "/xmp", icon: LayoutDashboard, roles: ["operator", "research", "teacher"], phase: 1 },
  { id: "curriculum", name: "AI 课程工厂", englishName: "Curriculum OS", description: "从教研意图到可执行课堂的多智能体生成。", href: "/xmp/curriculum", icon: Sparkles, roles: ["operator", "research", "teacher"], phase: 2 },
  { id: "classroom", name: "实时课堂", englishName: "Live Classroom", description: "教师掌舵的多端课堂编排与现场 Copilot。", href: "/xmp/classroom", icon: GraduationCap, roles: ["research", "teacher"], phase: 3 },
  { id: "companion", name: "奇妙宠", englishName: "Wonder Companion", description: "安全、温暖、低认知负担的幼儿多模态体验。", href: "/xmp/companion", icon: Bot, roles: ["teacher", "family"], phase: 4 },
  { id: "growth", name: "成长智能", englishName: "Growth Intelligence", description: "可溯源成长证据、教师审核与发展报告。", href: "/xmp/growth", icon: Sprout, roles: ["operator", "research", "teacher", "family"], phase: 5 },
  { id: "family", name: "家园共育", englishName: "Family Loop", description: "家长报告、家庭延伸任务与反馈闭环。", href: "/xmp/family", icon: HeartHandshake, roles: ["operator", "teacher", "family"], phase: 6 },
  { id: "fleet", name: "设备与边缘云", englishName: "Edge Fleet", description: "奇妙宠、教师终端、教室大屏与园所边缘节点。", href: "/xmp/fleet", icon: Network, roles: ["operator"], phase: 7 },
  { id: "operations", name: "园所运营", englishName: "Delivery & ERP", description: "学员、班级、排课、考勤、交付质量与经营分析。", href: "/xmp/operations", icon: Building2, roles: ["operator", "research"], phase: 8 },
  { id: "governance", name: "数据治理", englishName: "Trust Center", description: "授权、采集、访问、审计、导出与删除。", href: "/xmp/governance", icon: ShieldCheck, roles: ["operator", "research"], phase: 9 },
];

export const XMP_DEMO_TENANT: XmpDemoTenant = {
  id: "demo-xmp-001",
  name: "西马棚幼儿园",
  campus: "本地产品演示租户",
  environment: "local-demo",
  children: 186,
  classes: 8,
  teachers: 24,
};
