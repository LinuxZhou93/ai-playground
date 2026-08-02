import type { XmpSnapshot } from "./types";

export function createDemoSnapshot(reason?: string): XmpSnapshot {
  return {
    schemaVersion: 1,
    mode: "demo",
    sourceState: reason ? "degraded" : "demo",
    sourceLabel: reason ? "安全回退 · 本地演示" : "本地演示数据",
    generatedAt: new Date().toISOString(),
    freshnessLabel: "随页面载入生成",
    ...(reason ? { fallbackReason: reason } : {}),
    privacy: {
      aggregateOnly: true,
      writesAllowed: false,
      containsChildIdentity: false,
    },
    tenant: {
      id: "demo-xmp-001",
      name: "西马棚幼儿园",
      campus: "本地产品演示租户",
    },
    metrics: {
      children: 186,
      classes: 8,
      teachers: 24,
      courses: 32,
      todaySessions: 10,
      completedSessions: 6,
      pendingEvidence: 17,
      onlineDevices: 42,
      totalDevices: 44,
      curriculumReadiness: 82,
    },
    capabilities: [
      {
        id: "erp",
        label: "园所 ERP",
        state: "ready",
        detail: "演示快照已加载",
      },
      {
        id: "curriculum",
        label: "课程资产",
        state: "ready",
        detail: "本地课程样例",
      },
      {
        id: "growth",
        label: "成长档案",
        state: "ready",
        detail: "匿名证据样例",
      },
      {
        id: "classroom",
        label: "课堂事件",
        state: "planned",
        detail: "下一阶段接入",
      },
      {
        id: "fleet",
        label: "设备遥测",
        state: "planned",
        detail: "下一阶段接入",
      },
    ],
  };
}
