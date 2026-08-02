"use client";

import {
  AlertTriangle,
  ArrowRight,
  BadgeCheck,
  CalendarCheck2,
  CalendarRange,
  Check,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  CircleDashed,
  Clock3,
  Cpu,
  FileSignature,
  GraduationCap,
  History,
  Layers3,
  MapPin,
  PackageCheck,
  RefreshCw,
  RotateCcw,
  ShieldCheck,
  Sparkles,
  Stamp,
  UserRoundCheck,
  UsersRound,
} from "lucide-react";
import { useMemo, useState } from "react";
import {
  getBatchReadiness,
  getSlotReadiness,
  XMP_SCHEDULER,
  XMP_SCHEDULE_RELEASE_MANAGER,
  type XmpScheduleBatchStatus,
} from "@/lib/xmp/teaching-schedule";
import { useXmpCourseAssets } from "./course-asset-store";
import { useXmpEvents, XMP_DEMO_CORRELATION_ID } from "./event-store";
import { useXmpTeachingSchedule } from "./teaching-schedule-store";
import type { XmpEventKind } from "@/lib/xmp/event-types";

const days = [
  { date: "2026-07-27", weekday: "周一", day: "27" },
  { date: "2026-07-28", weekday: "周二", day: "28" },
  { date: "2026-07-29", weekday: "周三", day: "29" },
  { date: "2026-07-30", weekday: "周四", day: "30" },
  { date: "2026-07-31", weekday: "周五", day: "31" },
];

const statusLabel: Record<XmpScheduleBatchStatus, string> = {
  draft: "编排草稿",
  validated: "校验通过",
  published: "当前发布",
  superseded: "历史发布",
};

const conflictLabel = {
  teacher: "教师冲突",
  room: "空间冲突",
  device: "设备冲突",
};

export function TeachingScheduler() {
  const { catalog, issueCommand, resetCatalog } = useXmpTeachingSchedule();
  const { catalog: courseCatalog } = useXmpCourseAssets();
  const { emit } = useXmpEvents();
  const [selectedBatchId, setSelectedBatchId] = useState(
    catalog.selectedDraftBatchId,
  );
  const [selectedSlotId, setSelectedSlotId] = useState("slot-mon-b");
  const [classFilter, setClassFilter] = useState("all");

  const batch =
    catalog.batches.find((item) => item.id === selectedBatchId) ??
    catalog.batches[0];
  const activeBatch = catalog.batches.find(
    (item) => item.id === catalog.activePublishedBatchId,
  )!;
  const activeCourse = courseCatalog.versions.find(
    (item) => item.id === courseCatalog.activePublishedVersionId,
  )!;
  const readiness = useMemo(() => getBatchReadiness(batch), [batch]);
  const selectedSlot =
    batch.slots.find((slot) => slot.id === selectedSlotId) ?? batch.slots[0];
  const selectedReadiness = getSlotReadiness(selectedSlot);
  const classNames = Array.from(
    new Set(batch.slots.map((slot) => slot.className)),
  );
  const visibleSlots = batch.slots.filter(
    (slot) => classFilter === "all" || slot.className === classFilter,
  );
  const materialsGap = batch.slots.find((slot) => !slot.materialsReady);
  const courseOutdated = batch.slots.some(
    (slot) => slot.courseVersionId !== activeCourse.id,
  );

  const emitAction = (
    title: string,
    detail: string,
    kind: XmpEventKind = "schedule.adjusted",
  ) =>
    emit({
      correlationId: XMP_DEMO_CORRELATION_ID,
      kind,
      domain: "scheduling",
      title,
      detail,
      actor: "教务 李老师",
      entity: batch.id,
      privacy: "aggregate",
    });

  const resolveConflicts = () => {
    issueCommand(
      "slot.resolve-conflict",
      batch.id,
      XMP_SCHEDULER,
      "slot-mon-b",
      {
        startTime: "10:10",
        endTime: "10:45",
        teacherId: "teacher-lin-demo",
        teacherName: "林老师",
        roomId: "room-a302",
        roomName: "创想教室 A-302",
        deviceKitId: "kit-b",
        deviceKitName: "奇妙宠套件 B",
      },
    );
    emitAction(
      "教务接受资源冲突解决方案",
      "大二班调整至 10:10，由林老师在 A-302 使用套件 B 授课。",
    );
  };

  const markMaterialsReady = () => {
    if (!materialsGap) return;
    issueCommand(
      "slot.materials-ready",
      batch.id,
      XMP_SCHEDULER,
      materialsGap.id,
    );
    emitAction(
      "探究材料完成课前核验",
      `${materialsGap.className} · ${materialsGap.courseTitle} 材料包已由教师确认。`,
    );
  };

  const bindCourseRelease = () => {
    if (!activeCourse.signature) return;
    issueCommand(
      "batch.bind-course-release",
      batch.id,
      XMP_SCHEDULER,
      undefined,
      {
        courseVersionId: activeCourse.id,
        courseSemanticVersion: activeCourse.semanticVersion,
        courseSignature: activeCourse.signature,
      },
    );
    emitAction(
      "教学计划绑定园所课程发布",
      `${batch.label} 已绑定《${activeCourse.title}》v${activeCourse.semanticVersion}。`,
    );
  };

  const validateBatch = () => {
    issueCommand("batch.validate", batch.id, XMP_SCHEDULER);
    emitAction(
      "教学计划提交完整校验",
      `${batch.label} 完成五项课前资源检查。`,
      "schedule.validated",
    );
  };

  const publishBatch = () => {
    issueCommand("batch.publish", batch.id, XMP_SCHEDULE_RELEASE_MANAGER);
    emitAction(
      "园所教学计划签名发布",
      `${batch.label} 成为当前执行批次，历史批次保留可回滚。`,
      "schedule.published",
    );
  };

  const rollbackBatch = () => {
    issueCommand("batch.rollback", batch.id, XMP_SCHEDULE_RELEASE_MANAGER);
    emitAction(
      "园所教学计划回滚",
      `${batch.label} 被恢复为当前执行批次。`,
      "schedule.rolled_back",
    );
  };

  const substituteTeacher = () => {
    issueCommand("slot.substitute", batch.id, XMP_SCHEDULER, selectedSlot.id, {
      teacherId: "teacher-zhou-demo",
      teacherName: "周老师",
    });
    emitAction(
      "教务完成替课安排",
      `${selectedSlot.className} ${selectedSlot.dayLabel}课次改由周老师授课，资源冲突已复核。`,
    );
  };

  return (
    <div className="xmp-scheduler">
      <section className="xmp-scheduler-head">
        <div>
          <span>TEACHING DELIVERY CONTROL</span>
          <h1>把一周的每一堂课，编排成可验证的交付承诺。</h1>
          <p>
            复用 FutureClass
            班级与排课底座，把教师、空间、设备、材料和签名课程版本纳入同一个发布批次；冲突未解决，计划不能进入课堂。
          </p>
        </div>
        <div className="xmp-scheduler-head-actions">
          <span>
            <ShieldCheck size={13} /> 本地计划协议 · 未写入 ERP
          </span>
          {batch.status === "draft" && (
            <button
              data-testid="validate-schedule"
              disabled={!readiness.ready}
              onClick={validateBatch}
            >
              <CalendarCheck2 size={15} /> 完整校验
            </button>
          )}
          {batch.status === "validated" && (
            <button data-testid="publish-schedule" onClick={publishBatch}>
              <Stamp size={15} /> 签名发布计划
            </button>
          )}
          {batch.status === "superseded" && (
            <button data-testid="rollback-schedule" onClick={rollbackBatch}>
              <History size={15} /> 回滚到此批次
            </button>
          )}
          {batch.status === "published" && (
            <b>
              <BadgeCheck size={15} /> 当前执行计划
            </b>
          )}
        </div>
      </section>

      <section className="xmp-schedule-release-strip">
        <div>
          <span>
            <FileSignature size={15} />
          </span>
          <small>当前签名教学计划</small>
          <b>{activeBatch.label}</b>
          <code>{activeBatch.signature}</code>
        </div>
        <ArrowRight size={15} />
        <div>
          <span>
            <Sparkles size={15} />
          </span>
          <small>园所签名课程发布</small>
          <b>
            {activeCourse.title} · v{activeCourse.semanticVersion}
          </b>
          <code>{activeCourse.signature}</code>
        </div>
        <em className={activeBatch.id === batch.id ? "active" : "editing"}>
          <i />
          {activeBatch.id === batch.id ? "正在执行" : "草稿不影响现场"}
        </em>
      </section>

      <section className="xmp-scheduler-kpis">
        <article>
          <span>
            <CalendarRange size={15} />
          </span>
          <div>
            <b>{batch.slots.length}</b>
            <small>本周 AI 教学课次</small>
          </div>
          <em>{classNames.length} 个班级</em>
        </article>
        <article className={readiness.conflicts.length ? "warning" : "ok"}>
          <span>
            <AlertTriangle size={15} />
          </span>
          <div>
            <b>{readiness.conflicts.length}</b>
            <small>阻断级资源冲突</small>
          </div>
          <em>{readiness.conflicts.length ? "必须处理" : "资源无碰撞"}</em>
        </article>
        <article>
          <span>
            <PackageCheck size={15} />
          </span>
          <div>
            <b>
              {readiness.readySlots}/{batch.slots.length}
            </b>
            <small>课次资源就绪</small>
          </div>
          <em>{readiness.ready ? "可提交校验" : "仍有缺口"}</em>
        </article>
        <article>
          <span>
            <UsersRound size={15} />
          </span>
          <div>
            <b>{new Set(batch.slots.map((slot) => slot.teacherId)).size}</b>
            <small>本周授课教师</small>
          </div>
          <em>
            总计 {batch.slots.reduce((sum, slot) => sum + slot.childCount, 0)}{" "}
            人次
          </em>
        </article>
      </section>

      <section className="xmp-schedule-workspace">
        <aside className="xmp-schedule-left">
          <header>
            <div>
              <span>RELEASE BATCHES</span>
              <h2>教学计划批次</h2>
            </div>
            <button aria-label="重置教学计划演示" onClick={resetCatalog}>
              <RefreshCw size={13} />
            </button>
          </header>
          <div className="xmp-schedule-batches">
            {catalog.batches.map((item) => (
              <button
                key={item.id}
                className={item.id === batch.id ? "active" : ""}
                onClick={() => setSelectedBatchId(item.id)}
              >
                <span className={item.status}>
                  {item.status === "draft" ? (
                    <CircleDashed size={13} />
                  ) : (
                    <FileSignature size={13} />
                  )}
                </span>
                <div>
                  <b>{item.label}</b>
                  <small>
                    R{item.revision} · {item.slots.length} 个课次
                  </small>
                </div>
                <em className={item.status}>{statusLabel[item.status]}</em>
              </button>
            ))}
          </div>
          <div className="xmp-class-filter">
            <span>班级视图</span>
            <button
              className={classFilter === "all" ? "active" : ""}
              onClick={() => setClassFilter("all")}
            >
              全部班级 <b>{batch.slots.length}</b>
            </button>
            {classNames.map((name) => (
              <button
                key={name}
                className={classFilter === name ? "active" : ""}
                onClick={() => setClassFilter(name)}
              >
                {name}
                <b>
                  {batch.slots.filter((slot) => slot.className === name).length}
                </b>
              </button>
            ))}
          </div>
          <div className="xmp-schedule-legend">
            <p>
              <i className="ready" /> 课前就绪
            </p>
            <p>
              <i className="planned" /> 等待检查
            </p>
            <p>
              <i className="conflict" /> 资源冲突
            </p>
          </div>
        </aside>

        <main className="xmp-week-board">
          <header>
            <div>
              <button aria-label="上一周">
                <ChevronLeft size={14} />
              </button>
              <div>
                <span>2026 年 7 月</span>
                <b>07.27 — 07.31</b>
              </div>
              <button aria-label="下一周">
                <ChevronRight size={14} />
              </button>
            </div>
            <p>
              <Clock3 size={12} /> 园所教学时区 · Asia/Shanghai
            </p>
          </header>
          <div className="xmp-week-grid">
            {days.map((day) => {
              const slots = visibleSlots
                .filter((slot) => slot.date === day.date)
                .sort((a, b) => a.startTime.localeCompare(b.startTime));
              return (
                <section key={day.date}>
                  <header>
                    <span>{day.weekday}</span>
                    <b>{day.day}</b>
                    <small>{slots.length} 节</small>
                  </header>
                  <div>
                    {slots.length ? (
                      slots.map((slot) => {
                        const slotReady = getSlotReadiness(slot).ready;
                        const hasConflict = readiness.conflicts.some(
                          (conflict) => conflict.slotIds.includes(slot.id),
                        );
                        return (
                          <button
                            key={slot.id}
                            className={`${selectedSlot.id === slot.id ? "active" : ""} ${hasConflict ? "conflict" : slotReady ? "ready" : "planned"}`}
                            onClick={() => setSelectedSlotId(slot.id)}
                          >
                            <div>
                              <time>{slot.startTime}</time>
                              <em>{slot.endTime}</em>
                            </div>
                            <span className="xmp-slot-state">
                              {hasConflict ? (
                                <AlertTriangle size={11} />
                              ) : slotReady ? (
                                <CheckCircle2 size={11} />
                              ) : (
                                <CircleDashed size={11} />
                              )}
                              {hasConflict
                                ? "冲突"
                                : slot.deliveryStatus === "substitute"
                                  ? "替课"
                                  : slotReady
                                    ? "就绪"
                                    : "待检查"}
                            </span>
                            <h3>{slot.className}</h3>
                            <p>{slot.courseTitle}</p>
                            <ul>
                              <li>
                                <UserRoundCheck size={10} /> {slot.teacherName}
                              </li>
                              <li>
                                <MapPin size={10} />{" "}
                                {slot.roomName.replace("教室 ", "")}
                              </li>
                              <li>
                                <Cpu size={10} /> {slot.deviceKitName}
                              </li>
                            </ul>
                            <code>v{slot.courseSemanticVersion}</code>
                          </button>
                        );
                      })
                    ) : (
                      <div className="xmp-day-empty">该视图暂无课次</div>
                    )}
                  </div>
                </section>
              );
            })}
          </div>
        </main>

        <aside className="xmp-schedule-inspector">
          <header>
            <div>
              <span>DELIVERY INSPECTOR</span>
              <h2>发布就绪检查</h2>
            </div>
            <em className={readiness.ready ? "ready" : "blocked"}>
              {readiness.ready ? "READY" : "BLOCKED"}
            </em>
          </header>

          {batch.status === "draft" && readiness.conflicts.length > 0 && (
            <section className="xmp-conflict-stack">
              <div className="xmp-inspector-title">
                <AlertTriangle size={13} />
                <b>{readiness.conflicts.length} 项冲突来自同一课次</b>
              </div>
              {readiness.conflicts.map((conflict) => (
                <article key={conflict.id}>
                  <span>{conflictLabel[conflict.kind]}</span>
                  <b>{conflict.resourceLabel}</b>
                  <p>{conflict.detail}</p>
                </article>
              ))}
              <button
                data-testid="resolve-schedule-conflicts"
                onClick={resolveConflicts}
              >
                <Sparkles size={13} /> 应用无冲突建议方案
              </button>
            </section>
          )}

          <section className="xmp-selected-slot">
            <div className="xmp-inspector-title">
              <GraduationCap size={13} />
              <b>选中课次</b>
            </div>
            <h3>
              {selectedSlot.className} · {selectedSlot.dayLabel}
            </h3>
            <p>
              {selectedSlot.startTime}–{selectedSlot.endTime} ·{" "}
              {selectedSlot.childCount} 名幼儿
            </p>
            <div className="xmp-readiness-list">
              {selectedReadiness.checks.map((check) => (
                <div key={check.id} className={check.pass ? "pass" : "fail"}>
                  {check.pass ? (
                    <Check size={11} />
                  ) : (
                    <CircleDashed size={11} />
                  )}
                  <span>{check.label}</span>
                  <b>{check.pass ? "已就绪" : "待确认"}</b>
                </div>
              ))}
            </div>
            {batch.status === "draft" && (
              <button className="xmp-substitute" onClick={substituteTeacher}>
                <UserRoundCheck size={12} /> 安排周老师替课并复核冲突
              </button>
            )}
          </section>

          {batch.status === "draft" && (
            <section className="xmp-gate-actions">
              <div className="xmp-inspector-title">
                <Layers3 size={13} />
                <b>批次发布门禁</b>
              </div>
              <article className={courseOutdated ? "pending" : "done"}>
                <span>
                  {courseOutdated ? (
                    <CircleDashed size={12} />
                  ) : (
                    <Check size={12} />
                  )}
                </span>
                <div>
                  <b>课程发布一致性</b>
                  <small>
                    {courseOutdated
                      ? `园所当前为 v${activeCourse.semanticVersion}`
                      : `全部课次已绑定 v${activeCourse.semanticVersion}`}
                  </small>
                </div>
                {courseOutdated && (
                  <button onClick={bindCourseRelease}>同步</button>
                )}
              </article>
              <article className={materialsGap ? "pending" : "done"}>
                <span>
                  {materialsGap ? (
                    <CircleDashed size={12} />
                  ) : (
                    <Check size={12} />
                  )}
                </span>
                <div>
                  <b>材料包核验</b>
                  <small>
                    {materialsGap
                      ? `${materialsGap.className}等待教师确认`
                      : "全部探究材料已就绪"}
                  </small>
                </div>
                {materialsGap && (
                  <button
                    data-testid="mark-materials-ready"
                    onClick={markMaterialsReady}
                  >
                    确认
                  </button>
                )}
              </article>
              <article
                className={readiness.conflicts.length ? "pending" : "done"}
              >
                <span>
                  {readiness.conflicts.length ? (
                    <AlertTriangle size={12} />
                  ) : (
                    <Check size={12} />
                  )}
                </span>
                <div>
                  <b>三资源碰撞检查</b>
                  <small>
                    {readiness.conflicts.length
                      ? `${readiness.conflicts.length} 项阻断`
                      : "教师、空间、设备无冲突"}
                  </small>
                </div>
              </article>
            </section>
          )}

          <section className="xmp-schedule-audit">
            <div className="xmp-inspector-title">
              <Clock3 size={13} />
              <b>最近审计</b>
            </div>
            {catalog.commandLog.length ? (
              catalog.commandLog.slice(0, 4).map((record) => (
                <p key={record.id}>
                  <span>{record.actorLabel}</span>
                  {record.kind}
                  <em className={record.outcome}>
                    {record.outcome === "accepted" ? "接受" : "拒绝"}
                  </em>
                </p>
              ))
            ) : (
              <div>等待教务处理本批次。</div>
            )}
          </section>
        </aside>
      </section>
    </div>
  );
}
