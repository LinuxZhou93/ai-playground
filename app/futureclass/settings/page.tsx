"use client";

import React, { useState } from "react";
import { 
  School2, 
  Shield, 
  Palette, 
  Bell, 
  Database, 
  Save,
  Check,
  Loader2,
  Globe,
  Key,
  UserCog,
  Cpu
} from "lucide-react";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle,
  CardDescription,
  CardFooter
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

export default function SettingsPage() {
  const [saving, setSaving] = useState(false);
  const [config, setConfig] = useState({
    orgName: "FutureClass STEM 科创中心",
    orgPhone: "028-8888-6666",
    orgAddress: "成都市高新区天府四街 199号",
    notifyWechat: true,
    notifySms: false,
    aiModel: "gemini-3-flash-preview",
    aiProxy: "backgrace.com",
    lessonsPerSession: 1,
    warningThreshold: 3,
  });

  const handleSave = async () => {
    setSaving(true);
    await new Promise(r => setTimeout(r, 800));
    setSaving(false);
    toast.success("设置已保存 ✅");
  };

  const sections = [
    {
      icon: School2,
      title: "机构信息",
      description: "配置你的机构基本资料",
      color: "emerald",
      content: (
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">机构名称</label>
            <Input value={config.orgName} onChange={e => setConfig({...config, orgName: e.target.value})} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">联系电话</label>
              <Input value={config.orgPhone} onChange={e => setConfig({...config, orgPhone: e.target.value})} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">地址</label>
              <Input value={config.orgAddress} onChange={e => setConfig({...config, orgAddress: e.target.value})} />
            </div>
          </div>
        </div>
      )
    },
    {
      icon: Cpu,
      title: "AI 引擎配置",
      description: "管理 AI 点评报告的模型与代理设置",
      color: "indigo",
      content: (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">AI 模型</label>
              <div className="relative">
                <Input value={config.aiModel} onChange={e => setConfig({...config, aiModel: e.target.value})} className="pr-16" />
                <Badge className="absolute right-2 top-1/2 -translate-y-1/2 bg-emerald-500">在线</Badge>
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">代理网关</label>
              <Input value={config.aiProxy} onChange={e => setConfig({...config, aiProxy: e.target.value})} />
            </div>
          </div>
          <div className="p-3 rounded-lg bg-indigo-500/5 border border-indigo-500/20">
            <p className="text-xs text-muted-foreground flex items-center gap-2">
              <Key className="h-3.5 w-3.5 text-indigo-500" />
              API 密钥已通过环境变量安全注入，无需在此页面配置。
            </p>
          </div>
        </div>
      )
    },
    {
      icon: Bell,
      title: "通知与推送",
      description: "控制家校通知与消息推送渠道",
      color: "amber",
      content: (
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 rounded-lg bg-muted/30">
            <div>
              <p className="text-sm font-medium">微信服务号推送</p>
              <p className="text-xs text-muted-foreground">课后报告实时推送至家长微信</p>
            </div>
            <button 
              onClick={() => setConfig({...config, notifyWechat: !config.notifyWechat})}
              className={`w-11 h-6 rounded-full transition-colors relative ${config.notifyWechat ? 'bg-emerald-500' : 'bg-muted'}`}
            >
              <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow-sm transition-transform ${config.notifyWechat ? 'translate-x-5' : 'translate-x-0.5'}`} />
            </button>
          </div>
          <div className="flex items-center justify-between p-4 rounded-lg bg-muted/30">
            <div>
              <p className="text-sm font-medium">短信通知</p>
              <p className="text-xs text-muted-foreground">关键变更（如退课、转班）通知家长</p>
            </div>
            <button 
              onClick={() => setConfig({...config, notifySms: !config.notifySms})}
              className={`w-11 h-6 rounded-full transition-colors relative ${config.notifySms ? 'bg-emerald-500' : 'bg-muted'}`}
            >
              <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow-sm transition-transform ${config.notifySms ? 'translate-x-5' : 'translate-x-0.5'}`} />
            </button>
          </div>
        </div>
      )
    },
    {
      icon: Database,
      title: "消课规则",
      description: "配置默认课时扣减与预警阈值",
      color: "purple",
      content: (
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">每次签到扣减课时</label>
            <Input type="number" value={config.lessonsPerSession} onChange={e => setConfig({...config, lessonsPerSession: Number(e.target.value)})} />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">预警阈值（剩余课时）</label>
            <Input type="number" value={config.warningThreshold} onChange={e => setConfig({...config, warningThreshold: Number(e.target.value)})} />
          </div>
          <div className="col-span-2 p-3 rounded-lg bg-purple-500/5 border border-purple-500/20">
            <p className="text-xs text-muted-foreground">
              当学员剩余课时 ≤ {config.warningThreshold} 时，系统将在 Dashboard 预警区域标红提醒。
            </p>
          </div>
        </div>
      )
    }
  ];

  const colorMap: Record<string, string> = {
    emerald: "bg-emerald-500/10 text-emerald-600",
    indigo: "bg-indigo-500/10 text-indigo-600",
    amber: "bg-amber-500/10 text-amber-600",
    purple: "bg-purple-500/10 text-purple-600"
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">系统设置</h2>
          <p className="text-muted-foreground text-sm mt-1">管理 FutureClass 的全局配置参数</p>
        </div>
        <Button onClick={handleSave} disabled={saving} className="bg-emerald-600 hover:bg-emerald-700 shadow-lg shadow-emerald-500/20">
          {saving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
          {saving ? "保存中..." : "保存设置"}
        </Button>
      </div>

      <div className="space-y-6">
        {sections.map((section, i) => (
          <Card key={i} className="shadow-sm border-none overflow-hidden">
            <CardHeader className="pb-4">
              <div className="flex items-center gap-3">
                <div className={`p-2.5 rounded-xl ${colorMap[section.color]}`}>
                  <section.icon className="h-5 w-5" />
                </div>
                <div>
                  <CardTitle className="text-base">{section.title}</CardTitle>
                  <CardDescription className="text-xs">{section.description}</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {section.content}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* 系统信息 */}
      <Card className="shadow-sm border-dashed">
        <CardContent className="p-6">
          <h4 className="font-semibold text-sm mb-3 flex items-center gap-2">
            <Globe className="h-4 w-4 text-muted-foreground" /> 系统信息
          </h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
            <div>
              <span className="text-muted-foreground">版本</span>
              <p className="font-mono font-semibold mt-0.5">FutureClass v1.2.0</p>
            </div>
            <div>
              <span className="text-muted-foreground">框架</span>
              <p className="font-mono font-semibold mt-0.5">Next.js 15.5.14</p>
            </div>
            <div>
              <span className="text-muted-foreground">数据库</span>
              <p className="font-mono font-semibold mt-0.5">Supabase PostgreSQL</p>
            </div>
            <div>
              <span className="text-muted-foreground">AI 引擎</span>
              <p className="font-mono font-semibold mt-0.5">Gemini 3 Flash</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
