"use client";

import Link from "next/link";
import {
  Activity,
  Check,
  ChevronDown,
  ChevronRight,
  Command,
  Database,
  Search,
  ShieldAlert,
  ShieldCheck,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { createDemoSnapshot } from "@/lib/xmp/demo-snapshot";
import type { XmpSnapshot } from "@/lib/xmp/types";
import { XMP_MODULES, XMP_ROLES } from "./demo-data";
import type { XmpModuleId, XmpRole } from "./model";
import { OverviewDashboard } from "./overview-dashboard";
import { CurriculumStudio } from "./curriculum-studio";
import { ClassroomConsole } from "./classroom-console";
import { CompanionExperience } from "./companion-experience";
import { GrowthIntelligence } from "./growth-intelligence";
import { FamilyLoop } from "./family-loop";
import { EdgeFleet } from "./edge-fleet";
import { OperationsCenter } from "./operations-center";
import { GovernanceCenter } from "./governance-center";
import { DataSourceCenter } from "./data-source-center";
import { EventChainCenter } from "./event-chain-center";
import { useXmpEvents, XmpEventProvider } from "./event-store";
import { XmpClassroomRuntimeProvider } from "./classroom-runtime-store";
import { XmpClassroomOrchestrationProvider } from "./classroom-orchestration-store";
import { ClassroomOrchestrationCenter } from "./classroom-orchestration-center";
import { XmpCourseAssetProvider } from "./course-asset-store";
import { XmpTeachingScheduleProvider } from "./teaching-schedule-store";
import { TeachingScheduler } from "./teaching-scheduler";
import { AiTeachingWorkbench } from "./ai-teaching-workbench";
import { XmpTeachingWorkbenchProvider } from "./teaching-workbench-store";
import { XmpLearningInsightsProvider } from "./learning-insights-store";
import { LearningInsightsCenter } from "./learning-insights-center";
import { TeachingStrategyLibrary } from "./teaching-strategy-library";
import { XmpTeachingStrategyProvider } from "./teaching-strategy-store";
import { AccessControlCenter } from "./access-control-center";
import { XmpAccessControlProvider } from "./access-control-store";
import { canXmpRoleViewModule } from "@/lib/xmp/access-control";

export function XmpShell({ current }: { current: XmpModuleId }) {
  return (
    <XmpAccessControlProvider>
      <XmpEventProvider>
        <XmpCourseAssetProvider>
          <XmpTeachingScheduleProvider>
            <XmpTeachingWorkbenchProvider>
              <XmpLearningInsightsProvider>
                <XmpTeachingStrategyProvider>
                  <XmpClassroomRuntimeProvider>
                    <XmpClassroomOrchestrationProvider>
                      <XmpShellInner current={current} />
                    </XmpClassroomOrchestrationProvider>
                  </XmpClassroomRuntimeProvider>
                </XmpTeachingStrategyProvider>
              </XmpLearningInsightsProvider>
            </XmpTeachingWorkbenchProvider>
          </XmpTeachingScheduleProvider>
        </XmpCourseAssetProvider>
      </XmpEventProvider>
    </XmpAccessControlProvider>
  );
}

function XmpShellInner({ current }: { current: XmpModuleId }) {
  const { events } = useXmpEvents();
  const [role, setRole] = useState<XmpRole>("operator");
  const [roleMenuOpen, setRoleMenuOpen] = useState(false);
  const [sourceOpen, setSourceOpen] = useState(false);
  const [eventOpen, setEventOpen] = useState(false);
  const [sourceLoading, setSourceLoading] = useState(false);
  const [hydrated, setHydrated] = useState(false);
  const [snapshot, setSnapshot] = useState<XmpSnapshot>(() =>
    createDemoSnapshot(),
  );

  const refreshSnapshot = async () => {
    setSourceLoading(true);
    try {
      const response = await fetch("/api/xmp/snapshot", { cache: "no-store" });
      if (!response.ok) throw new Error("snapshot unavailable");
      setSnapshot((await response.json()) as XmpSnapshot);
    } catch {
      setSnapshot(
        createDemoSnapshot("本地快照接口暂不可用，页面继续使用内置演示数据。"),
      );
    } finally {
      setSourceLoading(false);
    }
  };

  useEffect(() => {
    setHydrated(true);
    const stored = window.localStorage.getItem("xmp-role") as XmpRole | null;
    if (stored && XMP_ROLES.some((item) => item.id === stored)) setRole(stored);
  }, []);

  useEffect(() => {
    void refreshSnapshot();
  }, []);

  const activeRole = XMP_ROLES.find((item) => item.id === role)!;
  const activeModule = XMP_MODULES.find((item) => item.id === current)!;
  const visibleModules = useMemo(
    () => XMP_MODULES.filter((module) => canXmpRoleViewModule(role, module.id)),
    [role],
  );
  const hasModuleAccess = canXmpRoleViewModule(role, current);

  const selectRole = (nextRole: XmpRole) => {
    setRole(nextRole);
    window.localStorage.setItem("xmp-role", nextRole);
    setRoleMenuOpen(false);
  };

  return (
    <div className="xmp-app" data-xmp-hydrated={hydrated ? "true" : "false"}>
      <DataSourceCenter
        open={sourceOpen}
        snapshot={snapshot}
        loading={sourceLoading}
        onClose={() => setSourceOpen(false)}
        onRefresh={refreshSnapshot}
      />
      <EventChainCenter open={eventOpen} onClose={() => setEventOpen(false)} />
      <aside className="xmp-sidebar">
        <Link href="/xmp" className="xmp-brand">
          <span className="xmp-brand-mark">
            <img
              src="/api/xmp/ximapeng-media?asset=logo"
              alt="四川省直属机关西马棚幼儿园园徽"
            />
          </span>
          <span>
            <b>奇妙伙伴</b>
            <small>XMP · 西幼数智教学</small>
          </span>
        </Link>
        <div className="xmp-local-label">
          1943 · 宽窄巷子文化圈 <span>LOCAL</span>
        </div>
        <nav aria-label="XMP 产品模块">
          {visibleModules.map(({ id, name, englishName, href, icon: Icon }) => (
            <Link
              key={id}
              href={href}
              className={`xmp-nav-item ${current === id ? "active" : ""}`}
            >
              <Icon size={18} />
              <span>
                <b>{name}</b>
                <small>{englishName}</small>
              </span>
              <ChevronRight size={14} />
            </Link>
          ))}
        </nav>
        <button
          className="xmp-sidebar-status"
          onClick={() => setSourceOpen(true)}
        >
          <span />
          <div>
            <b>{snapshot.sourceLabel}</b>
            <small>
              {snapshot.privacy.writesAllowed ? "可写" : "只读保护"} ·
              未发布云端
            </small>
          </div>
        </button>
      </aside>
      <main className="xmp-main">
        <header className="xmp-topbar">
          <div className="xmp-page-name">
            <small>XMP / {activeModule.englishName}</small>
            <b>{activeModule.name}</b>
          </div>
          <div className="xmp-top-actions">
            <button
              className="xmp-event-pill"
              onClick={() => setEventOpen(true)}
              aria-label={`打开教学闭环事件链，共 ${events.length} 条事件`}
            >
              <Activity size={14} />
              <span>事件链</span>
              <b>{events.length}</b>
            </button>
            <button
              className={`xmp-source-pill ${snapshot.sourceState}`}
              onClick={() => setSourceOpen(true)}
            >
              <Database size={14} />
              <span>
                {snapshot.mode === "futureclass-readonly"
                  ? "READ-ONLY LIVE"
                  : "DEMO DATA"}
              </span>
              <i />
            </button>
            <button className="xmp-command">
              <Search size={16} />
              <span>搜索幼儿、课程、课堂</span>
              <kbd>
                <Command size={11} />K
              </kbd>
            </button>
            <div className="xmp-role-switcher">
              <button onClick={() => setRoleMenuOpen(!roleMenuOpen)}>
                <span>{activeRole.shortName}</span>
                <div>
                  <small>当前角色</small>
                  <b>{activeRole.name}</b>
                </div>
                <ChevronDown size={15} />
              </button>
              {roleMenuOpen && (
                <div className="xmp-role-menu">
                  {XMP_ROLES.map((item) => (
                    <button key={item.id} onClick={() => selectRole(item.id)}>
                      <span>{item.shortName}</span>
                      {item.name}
                      {role === item.id && <Check size={15} />}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </header>
        <section className="xmp-content">
          <div className={`xmp-demo-notice ${snapshot.sourceState}`}>
            <div>
              <ShieldCheck size={15} />
              <b>{snapshot.sourceLabel}</b>
            </div>
            <p>
              {snapshot.mode === "futureclass-readonly"
                ? "仅同步园所级聚合数量；不读取儿童身份字段，不允许写入数据库。"
                : "所有数据均为演示数据，不代表真实运营结果；当前不采集、不上传任何儿童信息。"}
            </p>
          </div>
          {!hasModuleAccess ? (
            <section className="xmp-access-denied" aria-label="访问被拒绝">
              <div>
                <span>
                  <ShieldAlert size={28} />
                </span>
                <h1>这个角色没有进入该模块的权限。</h1>
                <p>
                  XMP
                  采用默认拒绝策略。请切换到具备授权的园所主体，或在“身份与权限”中发起限时访问申请。
                </p>
                <code>
                  DENY · {activeRole.name} · {activeModule.englishName}
                </code>
              </div>
            </section>
          ) : current === "overview" ? (
            <OverviewDashboard snapshot={snapshot} />
          ) : current === "curriculum" ? (
            <CurriculumStudio />
          ) : current === "scheduling" ? (
            <TeachingScheduler />
          ) : current === "teaching" ? (
            <AiTeachingWorkbench />
          ) : current === "insights" ? (
            <LearningInsightsCenter />
          ) : current === "strategies" ? (
            <TeachingStrategyLibrary />
          ) : current === "orchestration" ? (
            <ClassroomOrchestrationCenter />
          ) : current === "classroom" ? (
            <ClassroomConsole />
          ) : current === "companion" ? (
            <CompanionExperience />
          ) : current === "growth" ? (
            <GrowthIntelligence />
          ) : current === "family" ? (
            <FamilyLoop />
          ) : current === "fleet" ? (
            <EdgeFleet />
          ) : current === "operations" ? (
            <OperationsCenter />
          ) : current === "access" ? (
            <AccessControlCenter />
          ) : current === "governance" ? (
            <GovernanceCenter />
          ) : (
            <>
              <section className="xmp-foundation-card">
                <div className="xmp-foundation-copy">
                  <span>
                    MODULE {String(activeModule.phase).padStart(2, "0")}
                  </span>
                  <h1>{activeModule.name}</h1>
                  <p>{activeModule.description}</p>
                  <div>
                    <b>工程底座已就绪</b>
                    <small>
                      模块能力将在对应开发阶段逐步接入，并在本地完成验收。
                    </small>
                  </div>
                </div>
                <div className="xmp-tenant-card">
                  <small>当前演示租户</small>
                  <h2>{snapshot.tenant.name}</h2>
                  <p>{snapshot.tenant.campus}</p>
                  <div>
                    <span>
                      <b>{snapshot.metrics.children}</b>
                      <small>幼儿</small>
                    </span>
                    <span>
                      <b>{snapshot.metrics.classes}</b>
                      <small>班级</small>
                    </span>
                    <span>
                      <b>{snapshot.metrics.teachers}</b>
                      <small>教师</small>
                    </span>
                  </div>
                </div>
              </section>
              <section className="xmp-foundation-grid">
                <article>
                  <span>01</span>
                  <h3>统一角色模型</h3>
                  <p>
                    园所、教研、教师和家长共享同一平台，按角色呈现不同能力和数据边界。
                  </p>
                </article>
                <article>
                  <span>02</span>
                  <h3>统一模块注册</h3>
                  <p>
                    十五大模块拥有独立路由、权限范围和开发阶段，以教学数字化为主轴持续扩展。
                  </p>
                </article>
                <article>
                  <span>03</span>
                  <h3>统一演示数据</h3>
                  <p>
                    本地租户和数据状态集中管理，后续可平滑切换到 Supabase 与
                    FutureClass ERP。
                  </p>
                </article>
                <article>
                  <span>04</span>
                  <h3>统一信任边界</h3>
                  <p>
                    默认本地、默认最小化采集、默认人工审核，为所有后续模块提供安全底线。
                  </p>
                </article>
              </section>
            </>
          )}
        </section>
      </main>
    </div>
  );
}
