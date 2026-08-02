import "server-only";

import { createClient } from "@supabase/supabase-js";
import { createDemoSnapshot } from "./demo-snapshot";
import type { XmpCapabilityProbe, XmpSnapshot } from "./types";

type CountResult = { count: number | null; error: { message: string } | null };

const safeCount = async (request: PromiseLike<CountResult>) => {
  try {
    const result = await request;
    return result.error ? null : (result.count ?? 0);
  } catch {
    return null;
  }
};

export async function getXmpSnapshot(): Promise<XmpSnapshot> {
  if (process.env.XMP_DATA_MODE !== "futureclass-readonly") {
    return createDemoSnapshot();
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const tenantId = process.env.XMP_TENANT_ID;

  if (!url || !anonKey || !tenantId) {
    return createDemoSnapshot(
      "只读模式缺少 Supabase 公共连接参数或 XMP_TENANT_ID，未尝试访问真实数据。",
    );
  }

  try {
    const client = createClient(url, anonKey, {
      auth: { persistSession: false, autoRefreshToken: false },
      global: {
        fetch: (input, init) =>
          fetch(input, { ...init, signal: AbortSignal.timeout(6000) }),
      },
    });

    const [children, classes, courses, curriculumAssets, growthEvidence] =
      await Promise.all([
        safeCount(
          client
            .from("erp_students")
            .select("id", { count: "exact", head: true })
            .eq("campus_id", tenantId),
        ),
        safeCount(
          client
            .from("erp_classes")
            .select("id", { count: "exact", head: true })
            .eq("campus_id", tenantId),
        ),
        safeCount(
          client
            .from("erp_courses")
            .select("id", { count: "exact", head: true }),
        ),
        safeCount(
          client
            .from("edu_assets")
            .select("id", { count: "exact", head: true }),
        ),
        safeCount(
          client
            .from("erp_growth_archives")
            .select("id", { count: "exact", head: true })
            .eq("campus_id", tenantId),
        ),
      ]);

    if (children === null && classes === null && courses === null) {
      return createDemoSnapshot(
        "FutureClass 只读探针未获得 ERP 聚合权限，已阻止空数据覆盖并回退演示快照。",
      );
    }

    const capabilities: XmpCapabilityProbe[] = [
      {
        id: "erp",
        label: "园所 ERP",
        state: children !== null || classes !== null ? "ready" : "unavailable",
        detail:
          children !== null || classes !== null
            ? "聚合计数已同步"
            : "RLS 未授权",
      },
      {
        id: "curriculum",
        label: "课程资产",
        state:
          curriculumAssets !== null || courses !== null
            ? "ready"
            : "unavailable",
        detail:
          curriculumAssets !== null
            ? `${curriculumAssets} 项资产可见`
            : "资产表不可见",
      },
      {
        id: "growth",
        label: "成长档案",
        state: growthEvidence !== null ? "ready" : "unavailable",
        detail: growthEvidence !== null ? "仅返回匿名总量" : "档案表不可见",
      },
      {
        id: "classroom",
        label: "课堂事件",
        state: "planned",
        detail: "未读取实时事件",
      },
      {
        id: "fleet",
        label: "设备遥测",
        state: "planned",
        detail: "未读取设备遥测",
      },
    ];

    return {
      ...createDemoSnapshot(),
      mode: "futureclass-readonly",
      sourceState: "connected",
      sourceLabel: "FutureClass · 只读聚合",
      generatedAt: new Date().toISOString(),
      freshnessLabel: "刚刚完成只读同步",
      privacy: {
        aggregateOnly: true,
        writesAllowed: false,
        containsChildIdentity: false,
      },
      tenant: {
        id: tenantId,
        name: process.env.XMP_TENANT_NAME || "FutureClass 园所",
        campus: process.env.XMP_CAMPUS_NAME || "已授权园区",
      },
      metrics: {
        ...createDemoSnapshot().metrics,
        children: children ?? 0,
        classes: classes ?? 0,
        courses: courses ?? 0,
        pendingEvidence: growthEvidence ?? 0,
      },
      capabilities,
    };
  } catch {
    return createDemoSnapshot(
      "FutureClass 连接超时或不可用，系统已自动切回本地演示数据。",
    );
  }
}
