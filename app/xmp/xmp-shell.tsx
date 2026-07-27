"use client";

import Link from "next/link";
import {
  Check,
  ChevronDown,
  ChevronRight,
  Command,
  Leaf,
  Search,
  ShieldCheck,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { XMP_DEMO_TENANT, XMP_MODULES, XMP_ROLES } from "./demo-data";
import type { XmpModuleId, XmpRole } from "./model";
import { OverviewDashboard } from "./overview-dashboard";
import { CurriculumStudio } from "./curriculum-studio";
import { ClassroomConsole } from "./classroom-console";
import { CompanionExperience } from "./companion-experience";
import { GrowthIntelligence } from "./growth-intelligence";
import { FamilyLoop } from "./family-loop";
import { EdgeFleet } from "./edge-fleet";

export function XmpShell({ current }: { current: XmpModuleId }) {
  const [role, setRole] = useState<XmpRole>("operator");
  const [roleMenuOpen, setRoleMenuOpen] = useState(false);

  useEffect(() => {
    const stored = window.localStorage.getItem("xmp-role") as XmpRole | null;
    if (stored && XMP_ROLES.some((item) => item.id === stored)) setRole(stored);
  }, []);

  const activeRole = XMP_ROLES.find((item) => item.id === role)!;
  const activeModule = XMP_MODULES.find((item) => item.id === current)!;
  const visibleModules = useMemo(
    () => XMP_MODULES.filter((module) => module.roles.includes(role)),
    [role],
  );

  const selectRole = (nextRole: XmpRole) => {
    setRole(nextRole);
    window.localStorage.setItem("xmp-role", nextRole);
    setRoleMenuOpen(false);
  };

  return (
    <div className="xmp-app">
      <aside className="xmp-sidebar">
        <Link href="/xmp" className="xmp-brand">
          <span className="xmp-brand-mark">
            <Leaf size={20} />
          </span>
          <span>
            <b>XMP</b>
            <small>奇妙伙伴</small>
          </span>
        </Link>
        <div className="xmp-local-label">
          幼教 AI 操作系统 <span>LOCAL</span>
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
        <div className="xmp-sidebar-status">
          <span />
          <div>
            <b>本地演示环境</b>
            <small>未连接生产数据 · 未发布云端</small>
          </div>
        </div>
      </aside>
      <main className="xmp-main">
        <header className="xmp-topbar">
          <div className="xmp-page-name">
            <small>XMP / {activeModule.englishName}</small>
            <b>{activeModule.name}</b>
          </div>
          <div className="xmp-top-actions">
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
          <div className="xmp-demo-notice">
            <div>
              <ShieldCheck size={15} />
              <b>本地产品演示</b>
            </div>
            <p>
              所有数据均为演示数据，不代表真实运营结果；当前不采集、不上传任何儿童信息。
            </p>
          </div>
          {current === "overview" ? (
            <OverviewDashboard />
          ) : current === "curriculum" ? (
            <CurriculumStudio />
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
                  <h2>{XMP_DEMO_TENANT.name}</h2>
                  <p>{XMP_DEMO_TENANT.campus}</p>
                  <div>
                    <span>
                      <b>{XMP_DEMO_TENANT.children}</b>
                      <small>幼儿</small>
                    </span>
                    <span>
                      <b>{XMP_DEMO_TENANT.classes}</b>
                      <small>班级</small>
                    </span>
                    <span>
                      <b>{XMP_DEMO_TENANT.teachers}</b>
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
                    九大模块拥有独立路由、权限范围和开发阶段，可持续扩展而不互相污染。
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
