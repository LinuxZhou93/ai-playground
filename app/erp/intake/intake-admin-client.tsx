"use client";

import { useMemo, useState, useTransition } from "react";
import { Download, ExternalLink, FileDown, RefreshCcw, Search, SlidersHorizontal } from "lucide-react";
import { updateTechSpecialistIntakeStatus, type TechSpecialistIntakeRow } from "./actions";

const statuses = ["NEW", "CONTACTED", "PLANNED", "ARCHIVED"];

function csvEscape(value: unknown) {
  const text = value == null ? "" : String(value);
  return `"${text.replace(/"/g, '""')}"`;
}

function flattenRow(row: TechSpecialistIntakeRow) {
  const p = row.payload || {};
  return {
    提交时间: row.created_at ? new Date(row.created_at).toLocaleString("zh-CN") : "",
    状态: row.status,
    孩子姓名: row.student_name,
    年级学校: row.grade_school || "",
    家长姓名: row.parent_name || "",
    联系方式: row.parent_contact,
    面谈目标: row.meeting_goal || "",
    可沟通时间: row.preferred_time || "",
    当前阶段: Array.isArray(p.currentStage) ? p.currentStage.join("；") : "",
    学习经历: p.learningHistory || "",
    编程基础: JSON.stringify(p.programmingFoundation || {}),
    机器人硬件: JSON.stringify(p.roboticsFoundation || {}),
    项目竞赛: p.projectCompetition || "",
    学习画像: JSON.stringify(p.learningTraits || {}),
    家庭支持: JSON.stringify(p.familySupport || {}),
    家长问题: p.parentQuestions || "",
    孩子兴趣: p.childInterest || "",
    附件说明: p.attachmentsNote || "",
  };
}

export default function IntakeAdminClient({ initialRows, initialError }: { initialRows: TechSpecialistIntakeRow[]; initialError?: string }) {
  const [rows, setRows] = useState(initialRows);
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("ALL");
  const [active, setActive] = useState<TechSpecialistIntakeRow | null>(initialRows[0] || null);
  const [isPending, startTransition] = useTransition();

  const filtered = useMemo(() => {
    const lower = query.trim().toLowerCase();
    return rows.filter((row) => {
      const statusOk = status === "ALL" || row.status === status;
      const text = JSON.stringify(flattenRow(row)).toLowerCase();
      return statusOk && (!lower || text.includes(lower));
    });
  }, [query, rows, status]);

  const exportCsv = () => {
    const flat = filtered.map(flattenRow);
    const headers = Object.keys(flat[0] || flattenRow({} as TechSpecialistIntakeRow));
    const csv = [headers.map(csvEscape).join(","), ...flat.map((row) => headers.map((h) => csvEscape((row as any)[h])).join(","))].join("\n");
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `科技特长生面谈表单_${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const exportJson = () => {
    const blob = new Blob([JSON.stringify(filtered, null, 2)], { type: "application/json;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `tech-specialist-intakes_${new Date().toISOString().slice(0, 10)}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const updateStatus = (row: TechSpecialistIntakeRow, nextStatus: string) => {
    startTransition(async () => {
      await updateTechSpecialistIntakeStatus(row.id, nextStatus);
      setRows((prev) => prev.map((item) => item.id === row.id ? { ...item, status: nextStatus } : item));
      setActive((prev) => prev && prev.id === row.id ? { ...prev, status: nextStatus } : prev);
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-sm font-bold text-emerald-600">咨询后台</p>
          <h1 className="mt-2 text-3xl font-black tracking-tight text-zinc-950 dark:text-zinc-50">科技特长生面谈表单</h1>
          <p className="mt-2 text-sm text-zinc-500">查看家长提交的信息，筛选状态，并导出 CSV / JSON。</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <a href="/tech-specialist-intake" target="_blank" className="inline-flex items-center gap-2 rounded-xl border border-zinc-200 bg-white px-4 py-2.5 text-sm font-bold text-zinc-700 shadow-sm hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-200">
            <ExternalLink className="h-4 w-4" />
            打开家长表单
          </a>
          <button onClick={exportCsv} className="inline-flex items-center gap-2 rounded-xl bg-zinc-950 px-4 py-2.5 text-sm font-bold text-white shadow-sm hover:bg-zinc-800">
            <Download className="h-4 w-4" />
            下载 CSV
          </button>
          <button onClick={exportJson} className="inline-flex items-center gap-2 rounded-xl border border-zinc-200 bg-white px-4 py-2.5 text-sm font-bold text-zinc-700 shadow-sm hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-200">
            <FileDown className="h-4 w-4" />
            下载 JSON
          </button>
        </div>
      </div>

      {initialError ? (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm font-semibold text-amber-900">
          后台暂时无法读取数据：{initialError}。如果提示 relation 不存在，请先在 Supabase SQL Editor 执行 database/tech_specialist_intakes.sql。
        </div>
      ) : null}

      <div className="grid gap-4 md:grid-cols-[1fr_220px]">
        <label className="relative block">
          <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
          <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="搜索孩子姓名、家长电话、目标、项目经历..." className="h-12 w-full rounded-2xl border border-zinc-200 bg-white pl-11 pr-4 text-sm font-medium outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 dark:border-zinc-800 dark:bg-zinc-900" />
        </label>
        <label className="relative block">
          <SlidersHorizontal className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
          <select value={status} onChange={(event) => setStatus(event.target.value)} className="h-12 w-full rounded-2xl border border-zinc-200 bg-white pl-11 pr-4 text-sm font-bold outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 dark:border-zinc-800 dark:bg-zinc-900">
            <option value="ALL">全部状态</option>
            {statuses.map((item) => <option key={item} value={item}>{item}</option>)}
          </select>
        </label>
      </div>

      <div className="grid min-h-[620px] gap-5 xl:grid-cols-[420px_1fr]">
        <div className="overflow-hidden rounded-3xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
          <div className="border-b border-zinc-100 px-5 py-4 text-sm font-black text-zinc-500 dark:border-zinc-800">
            共 {filtered.length} 条提交
          </div>
          <div className="max-h-[720px] overflow-y-auto">
            {filtered.map((row) => (
              <button key={row.id} onClick={() => setActive(row)} className={`block w-full border-b border-zinc-100 px-5 py-4 text-left transition hover:bg-zinc-50 dark:border-zinc-800 dark:hover:bg-zinc-900 ${active?.id === row.id ? "bg-emerald-50/80 dark:bg-emerald-950/20" : ""}`}>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-black text-zinc-950 dark:text-zinc-50">{row.student_name}</p>
                    <p className="mt-1 text-sm text-zinc-500">{row.grade_school || "未填写年级学校"}</p>
                  </div>
                  <span className="rounded-full bg-zinc-100 px-2.5 py-1 text-[11px] font-black text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300">{row.status}</span>
                </div>
                <p className="mt-3 line-clamp-2 text-sm leading-6 text-zinc-600 dark:text-zinc-400">{row.meeting_goal || row.parent_contact}</p>
                <p className="mt-2 text-xs font-semibold text-zinc-400">{new Date(row.created_at).toLocaleString("zh-CN")}</p>
              </button>
            ))}
            {filtered.length === 0 ? <div className="p-6 text-sm text-zinc-500">暂无匹配提交。</div> : null}
          </div>
        </div>

        <div className="rounded-3xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-950 md:p-7">
          {active ? (
            <div className="space-y-6">
              <div className="flex flex-col gap-4 border-b border-zinc-100 pb-5 dark:border-zinc-800 md:flex-row md:items-start md:justify-between">
                <div>
                  <h2 className="text-2xl font-black text-zinc-950 dark:text-zinc-50">{active.student_name}</h2>
                  <p className="mt-2 text-sm text-zinc-500">{active.grade_school || "未填写年级学校"} · {active.parent_contact}</p>
                </div>
                <select disabled={isPending} value={active.status} onChange={(event) => updateStatus(active, event.target.value)} className="h-11 rounded-xl border border-zinc-200 bg-white px-3 text-sm font-black dark:border-zinc-800 dark:bg-zinc-900">
                  {statuses.map((item) => <option key={item} value={item}>{item}</option>)}
                </select>
              </div>

              <DetailGrid row={active} />
            </div>
          ) : (
            <div className="grid min-h-[400px] place-items-center text-zinc-500">
              <div className="text-center">
                <RefreshCcw className="mx-auto mb-3 h-8 w-8" />
                <p className="text-sm font-semibold">请选择一条提交记录。</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function DetailGrid({ row }: { row: TechSpecialistIntakeRow }) {
  const p = row.payload || {};
  const items = [
    ["家长姓名", row.parent_name || ""],
    ["面谈目标", row.meeting_goal || ""],
    ["可沟通时间", row.preferred_time || ""],
    ["当前阶段", Array.isArray(p.currentStage) ? p.currentStage.join("；") : ""],
    ["过往学习经历", p.learningHistory || ""],
    ["编程基础", formatObject(p.programmingFoundation)],
    ["机器人/硬件基础", formatObject(p.roboticsFoundation)],
    ["项目/作品/竞赛", p.projectCompetition || ""],
    ["学习画像", formatObject(p.learningTraits)],
    ["家庭支持", formatObject(p.familySupport)],
    ["家长问题", p.parentQuestions || ""],
    ["孩子兴趣", p.childInterest || ""],
    ["附件说明", p.attachmentsNote || ""],
  ];

  return (
    <div className="grid gap-4">
      {items.map(([label, value]) => (
        <section key={label} className="rounded-2xl border border-zinc-100 bg-zinc-50/70 p-4 dark:border-zinc-800 dark:bg-zinc-900/50">
          <p className="text-xs font-black uppercase tracking-[0.16em] text-zinc-400">{label}</p>
          <p className="mt-2 whitespace-pre-wrap text-sm leading-7 text-zinc-800 dark:text-zinc-200">{value || "未填写"}</p>
        </section>
      ))}
    </div>
  );
}

function formatObject(value: Record<string, any> | undefined) {
  if (!value) return "";
  return Object.entries(value)
    .map(([key, val]) => `${key}: ${val || "未填写"}`)
    .join("\n");
}
