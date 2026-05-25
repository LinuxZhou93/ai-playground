import { Suspense } from "react";
import IntakeFormClient from "./intake-form-client";

export const metadata = {
  title: "科技特长生面谈沟通信息表单｜周小麦",
  description: "面谈前收集孩子科创学习基础、项目经历、家庭目标与课程规划需求。",
};

export default function TechSpecialistIntakePage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#f5f7fb] p-8 text-slate-500">表单加载中...</div>}>
      <IntakeFormClient />
    </Suspense>
  );
}

