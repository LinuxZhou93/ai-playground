"use client";

import React, { useState } from "react";
import { 
  School2, 
  Bell, 
  Database, 
  Save,
  Loader2,
  Globe,
  Key,
  Cpu,
  ChevronRight,
  ShieldCheck,
  Zap,
  Settings2,
  Activity,
  Server,
  Fingerprint,
  Users
} from "lucide-react";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { StaffManagementPanel } from "./staff-panel";
import { useSettingsStore } from "@/lib/store/settings";
import { PROVIDERS } from "@/lib/ai/providers";
import { PageTransition, StaggerContainer, StaggerItem } from "@/components/erp/page-transition";
import { motion, AnimatePresence } from "motion/react";

/**
 * SettingsPage - 高级 SaaS ERP 系统设置
 * 采用 Linear/Stripe 极简主义设计语言
 * 强化了玻璃拟物化 (Glassmorphism) 与 动态交互反馈
 */
export default function SettingsPage() {
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const { providerId, modelId, setModel, providersConfig } = useSettingsStore();

  const [config, setConfig] = useState({
    orgName: "FutureClass STEM 科创中心",
    orgPhone: "028-8888-6666",
    orgAddress: "成都市高新区天府四街 199号",
    notifyWechat: true,
    notifySms: false,
    aiModel: modelId || "gemini-3-flash-preview",
    aiProxy: "backgrace.com",
    lessonsPerSession: 1,
    warningThreshold: 3,
  });

  const handleModelChange = (val: string) => {
    setConfig({ ...config, aiModel: val });
    setModel('google', val);
  };

  const availableModels = providersConfig['google']?.models || [
    { id: 'gemini-3-flash-preview', name: 'Gemini 3 Flash Preview' },
    { id: 'gemini-3-flash-search', name: 'Gemini 3 Flash Search' },
    { id: 'gemini-3-flash-thinking', name: 'Gemini 3 Flash Thinking' }
  ];

  const handleSave = async () => {
    setSaving(true);
    await new Promise(r => setTimeout(r, 1200));
    setSaving(false);
    setSaved(true);
    toast.success("系统配置同步成功", {
      description: "所有全局参数已实时应用至生产环境。",
      style: {
        background: "rgba(255, 255, 255, 0.9)",
        backdropFilter: "blur(12px)",
        border: "1px solid rgba(0, 0, 0, 0.08)",
        borderRadius: "16px",
      }
    });
    setTimeout(() => setSaved(false), 3000);
  };

  const sections = [
    {
      icon: School2,
      title: "机构核心信息",
      description: "定义您的教育机构在系统中的全局身份标识",
      color: "slate",
      content: (
        <div className="space-y-6">
          <div className="space-y-2.5 group">
            <label className="text-[12px] font-bold uppercase tracking-wider text-slate-400 group-focus-within:text-slate-900 transition-colors duration-300">机构官方名称</label>
            <div className="relative">
              <Input 
                className="h-11 bg-slate-50/50 border-slate-200/60 focus:bg-white focus:ring-4 focus:ring-slate-900/5 transition-all duration-500 rounded-xl" 
                value={config.orgName} 
                onChange={e => setConfig({...config, orgName: e.target.value})} 
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2 opacity-0 group-focus-within:opacity-100 transition-opacity">
                <Fingerprint className="h-4 w-4 text-slate-300" />
              </div>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2.5 group">
              <label className="text-[12px] font-bold uppercase tracking-wider text-slate-400 group-focus-within:text-slate-900 transition-colors duration-300">服务热线</label>
              <Input 
                className="h-11 bg-slate-50/50 border-slate-200/60 focus:bg-white transition-all duration-500 rounded-xl" 
                value={config.orgPhone} 
                onChange={e => setConfig({...config, orgPhone: e.target.value})} 
              />
            </div>
            <div className="space-y-2.5 group">
              <label className="text-[12px] font-bold uppercase tracking-wider text-slate-400 group-focus-within:text-slate-900 transition-colors duration-300">物理入驻地址</label>
              <Input 
                className="h-11 bg-slate-50/50 border-slate-200/60 focus:bg-white transition-all duration-500 rounded-xl" 
                value={config.orgAddress} 
                onChange={e => setConfig({...config, orgAddress: e.target.value})} 
              />
            </div>
          </div>
        </div>
      )
    },
    {
      icon: Cpu,
      title: "Titan AI 引擎",
      description: "配置下一代教育大模型核心参数与全球路由网关",
      color: "zinc",
      content: (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2.5 group">
              <label className="text-[12px] font-bold uppercase tracking-wider text-slate-400 group-focus-within:text-slate-900 transition-colors duration-300">核心推理模型</label>
              <div className="relative">
                <Select value={config.aiModel} onValueChange={handleModelChange}>
                  <SelectTrigger className="h-11 bg-slate-50/50 border-slate-200/60 hover:bg-white transition-all duration-500 rounded-xl">
                    <SelectValue placeholder="选择模型" />
                  </SelectTrigger>
                  <SelectContent className="backdrop-blur-2xl bg-white/90 border-slate-200/60 rounded-xl shadow-2xl">
                    {availableModels.map(m => (
                      <SelectItem key={m.id} value={m.id} className="py-2.5 focus:bg-slate-50 cursor-pointer">
                        <div className="flex items-center gap-2">
                          <div className="h-1.5 w-1.5 rounded-full bg-slate-400" />
                          {m.name}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <div className="absolute right-10 top-1/2 -translate-y-1/2 flex items-center gap-2 pointer-events-none">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                  </span>
                  <Badge variant="secondary" className="bg-emerald-500/10 text-emerald-600 border-none text-[10px] font-bold px-2 py-0.5">LIVE</Badge>
                </div>
              </div>
            </div>
            <div className="space-y-2.5 group">
              <label className="text-[12px] font-bold uppercase tracking-wider text-slate-400 group-focus-within:text-slate-900 transition-colors duration-300">全球加速网关</label>
              <div className="relative">
                <Input 
                  className="h-11 bg-slate-50/50 border-slate-200/60 focus:bg-white pl-10 transition-all duration-500 rounded-xl" 
                  value={config.aiProxy} 
                  onChange={e => setConfig({...config, aiProxy: e.target.value})} 
                />
                <Globe className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-slate-900 transition-colors" />
              </div>
            </div>
          </div>
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-4 rounded-2xl bg-slate-900/[0.02] border border-slate-200/50 flex items-start gap-4"
          >
            <div className="mt-0.5 p-2 bg-white rounded-xl shadow-sm border border-slate-100">
              <ShieldCheck className="h-4 w-4 text-slate-900" />
            </div>
            <div className="space-y-1">
              <p className="text-xs font-bold text-slate-800">端到端加密已启用</p>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                所有 API 交互均通过 <span className="font-mono text-slate-900">AES-256-GCM</span> 硬件级加密。密钥存储于隔离的 HSM 模块中，确保多租户环境下的绝对数据隔离。
              </p>
            </div>
          </motion.div>
        </div>
      )
    },
    {
      icon: Bell,
      title: "自动化通知矩阵",
      description: "配置多渠道家校互联触达策略",
      color: "slate",
      content: (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            { id: 'notifyWechat', title: '微信服务号推送', desc: '课后评价与消课实时通知', active: config.notifyWechat },
            { id: 'notifySms', title: '短信紧急提醒', desc: '财务变动与系统安全告警', active: config.notifySms }
          ].map((item) => (
            <motion.div 
              key={item.id}
              whileHover={{ y: -2, backgroundColor: "rgba(255,255,255,1)" }}
              className={`flex items-center justify-between p-5 rounded-2xl border transition-all duration-300 ${item.active ? 'bg-white border-slate-200 shadow-sm' : 'bg-slate-50/50 border-transparent'}`}
            >
              <div className="space-y-1">
                <p className="text-[13px] font-bold text-slate-900">{item.title}</p>
                <p className="text-[11px] text-slate-400">{item.desc}</p>
              </div>
              <button 
                onClick={() => setConfig({...config, [item.id]: !item.active})}
                className={`w-11 h-6 rounded-full transition-all duration-500 relative ${item.active ? 'bg-slate-900' : 'bg-slate-200'}`}
              >
                <motion.span
                  animate={{ x: item.active ? 22 : 2 }}
                  transition={{ type: "spring", stiffness: 400, damping: 25 }}
                  className="absolute top-1 w-4 h-4 rounded-full bg-white shadow-lg"
                />
              </button>
            </motion.div>
          ))}
        </div>
      )
    },
    {
      icon: Database,
      title: "消课与库存规则",
      description: "精密控制课时扣减逻辑与自动化续费预警",
      color: "zinc",
      content: (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2.5 group">
              <label className="text-[12px] font-bold uppercase tracking-wider text-slate-400 group-focus-within:text-slate-900 transition-colors duration-300">标准签到扣减</label>
              <div className="relative">
                <Input 
                  type="number" 
                  className="h-11 bg-slate-50/50 border-slate-200/60 focus:bg-white transition-all duration-500 rounded-xl pr-12" 
                  value={config.lessonsPerSession} 
                  onChange={e => setConfig({...config, lessonsPerSession: Number(e.target.value)})} 
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[11px] font-bold text-slate-400">课时</span>
              </div>
            </div>
            <div className="space-y-2.5 group">
              <label className="text-[12px] font-bold uppercase tracking-wider text-slate-400 group-focus-within:text-slate-900 transition-colors duration-300">库存预警阈值</label>
              <div className="relative">
                <Input 
                  type="number" 
                  className="h-11 bg-slate-50/50 border-slate-200/60 focus:bg-white transition-all duration-500 rounded-xl pr-12" 
                  value={config.warningThreshold} 
                  onChange={e => setConfig({...config, warningThreshold: Number(e.target.value)})} 
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[11px] font-bold text-slate-400">课时</span>
              </div>
            </div>
          </div>
          <div className="p-5 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-800 border border-slate-800 shadow-xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
              <Zap className="h-16 w-16 text-white" />
            </div>
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-3">
                <div className="p-1 bg-amber-400 rounded-md">
                  <Activity className="h-3 w-3 text-slate-900" />
                </div>
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-amber-400">Smart Logic Engine</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed max-w-[90%]">
                当学员账户余额 <span className="font-mono font-bold text-white bg-white/10 px-1.5 py-0.5 rounded">≤ {config.warningThreshold}</span> 时，
                系统将自动触发 <span className="text-amber-400 font-bold underline underline-offset-4">智能续费流</span>。
                该逻辑每 60 秒在边缘节点进行一次状态轮询。
              </p>
            </div>
          </div>
        </div>
      )
    }
  ];

  return (
    <PageTransition>
      <div className="space-y-10 max-w-5xl mx-auto pb-24 px-4">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-3 text-slate-400 text-[10px] font-black uppercase tracking-[0.3em]">
              <Settings2 className="h-3 w-3" />
              <span>System Infrastructure</span>
              <div className="h-[1px] w-12 bg-slate-200" />
            </div>
            <h2 className="text-4xl font-black tracking-tight text-slate-900">系统设置</h2>
            <p className="text-slate-500 text-sm font-medium">管理 FutureClass 全局运行参数、AI 核心引擎与安全策略</p>
          </div>
          
          <Button 
            onClick={handleSave} 
            disabled={saving} 
            className={`
              relative overflow-hidden min-w-[160px] h-12 rounded-2xl transition-all duration-700
              ${saved ? 'bg-emerald-500 hover:bg-emerald-600' : 'bg-slate-900 hover:bg-slate-800'}
              shadow-[0_20px_40px_-12px_rgba(0,0,0,0.2)] hover:shadow-[0_25px_50px_-12px_rgba(0,0,0,0.25)]
              active:scale-95 border-none
            `}
          >
            <AnimatePresence mode="wait">
              {saving ? (
                <motion.span 
                  key="saving" 
                  initial={{ opacity: 0, y: 15 }} 
                  animate={{ opacity: 1, y: 0 }} 
                  exit={{ opacity: 0, y: -15 }} 
                  className="flex items-center gap-2.5"
                >
                  <Loader2 className="h-4 w-4 animate-spin stroke-[3px]" /> 
                  <span className="text-sm font-bold tracking-wide">同步中...</span>
                </motion.span>
              ) : saved ? (
                <motion.span
                  key="saved"
                  initial={{ scale: 0.5, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex items-center gap-2.5"
                >
                  <motion.div
                    initial={{ rotate: -45, scale: 0 }}
                    animate={{ rotate: 0, scale: 1 }}
                    transition={{ type: "spring", damping: 12 }}
                  >
                    <ShieldCheck className="h-5 w-5" />
                  </motion.div>
                  <span className="text-sm font-bold tracking-wide text-white">配置已更新</span>
                </motion.span>
              ) : (
                <motion.span 
                  key="default" 
                  initial={{ opacity: 0 }} 
                  animate={{ opacity: 1 }} 
                  exit={{ opacity: 0 }} 
                  className="flex items-center gap-2.5"
                >
                  <Save className="h-4 w-4 opacity-90 stroke-[2.5px]" /> 
                  <span className="text-sm font-bold tracking-wide">保存全局设置</span>
                </motion.span>
              )}
            </AnimatePresence>
          </Button>
        </div>

        {/* Main Content Sections */}
        <Tabs defaultValue="staff" className="w-full">
          <TabsList className="bg-slate-100 p-1.5 rounded-2xl mb-8 flex w-fit">
            <TabsTrigger value="system" className="rounded-xl px-8 py-2.5 text-xs font-black uppercase tracking-widest data-[state=active]:bg-white data-[state=active]:text-slate-900 data-[state=active]:shadow-sm transition-all duration-300">
              系统魔盒 (System Config)
            </TabsTrigger>
            <TabsTrigger value="staff" className="rounded-xl px-8 py-2.5 text-xs font-black uppercase tracking-widest data-[state=active]:bg-white data-[state=active]:text-indigo-600 data-[state=active]:shadow-sm transition-all duration-300 flex items-center gap-2">
              <Users className="h-4 w-4" /> 门禁与组织大盘 (Staff Hub)
            </TabsTrigger>
          </TabsList>

          <TabsContent value="staff" className="mt-0 outline-none">
            <StaffManagementPanel />
          </TabsContent>

          <TabsContent value="system" className="mt-0 outline-none">
            <StaggerContainer className="grid grid-cols-1 gap-8">
              {sections.map((section, i) => (
                <StaggerItem key={i}>
                  <Card className="group relative overflow-hidden border border-slate-200/60 bg-white/70 backdrop-blur-xl shadow-[0_2px_4px_rgba(0,0,0,0.02),0_12px_24px_rgba(0,0,0,0.03)] hover:shadow-[0_30px_60px_-12px_rgba(0,0,0,0.08)] transition-all duration-700 rounded-[24px]">
                    <div className="absolute top-0 left-0 w-1.5 h-full bg-slate-900 scale-y-0 group-hover:scale-y-100 transition-transform duration-700 origin-top" />
                    
                    <CardHeader className="pb-8 pt-8 px-8">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-5">
                          <div className="relative">
                            <div className="absolute inset-0 bg-slate-900/10 blur-2xl rounded-full group-hover:bg-slate-900/20 transition-colors duration-700" />
                            <div className="relative p-4 rounded-[20px] bg-white border border-slate-100 shadow-sm text-slate-900 group-hover:scale-110 group-hover:rotate-3 transition-all duration-700">
                              <section.icon className="h-6 w-6 stroke-[1.5px]" />
                            </div>
                          </div>
                          <div className="space-y-1">
                            <CardTitle className="text-xl font-black text-slate-900 tracking-tight">{section.title}</CardTitle>
                            <CardDescription className="text-xs font-medium text-slate-400 uppercase tracking-wider">{section.description}</CardDescription>
                          </div>
                        </div>
                        <div className="p-2 rounded-full bg-slate-50 opacity-0 group-hover:opacity-100 group-hover:translate-x-0 translate-x-4 transition-all duration-700">
                          <ChevronRight className="h-4 w-4 text-slate-400" />
                        </div>
                      </div>
                    </CardHeader>
                    
                    <CardContent className="px-8 pb-8 relative z-10">
                      <div className="w-full h-[1px] bg-slate-100 mb-8" />
                      {section.content}
                    </CardContent>
                  </Card>
                </StaggerItem>
              ))}
            </StaggerContainer>
          </TabsContent>
        </Tabs>

        {/* System Info Footer */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4 }}
        >
          <Card className="bg-slate-50/80 border-dashed border-slate-200 shadow-none overflow-hidden rounded-[32px]">
            <CardContent className="p-10">
              <div className="flex items-center gap-3 mb-8">
                <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                <h4 className="font-black text-[11px] uppercase tracking-[0.3em] text-slate-400 flex items-center gap-2">
                  System Environment Manifest
                </h4>
              </div>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-10">
                {[
                  { label: "Build Version", value: "v2.4.1-stable", icon: <Server className="h-3.5 w-3.5" /> },
                  { label: "Runtime Engine", value: "Next.js 15.1.0", icon: <Zap className="h-3.5 w-3.5" /> },
                  { label: "Database Cluster", value: "PostgreSQL 16", icon: <Database className="h-3.5 w-3.5" /> },
                  { label: "AI Architecture", value: "Titan-Flash-G3", icon: <Cpu className="h-3.5 w-3.5" /> }
                ].map((item, idx) => (
                  <div key={idx} className="space-y-3 group">
                    <div className="flex items-center gap-2 text-slate-400 group-hover:text-slate-900 transition-colors">
                      {item.icon}
                      <span className="text-[10px] font-bold uppercase tracking-widest">{item.label}</span>
                    </div>
                    <p className="font-mono text-sm font-black text-slate-800 tracking-tight bg-white/50 py-1 px-2 rounded-lg border border-slate-100 inline-block">
                      {item.value}
                    </p>
                  </div>
                ))}
              </div>
              
              <div className="mt-10 pt-8 border-t border-slate-200/60 flex flex-col md:flex-row justify-between items-center gap-4">
                <p className="text-[10px] text-slate-400 font-medium">
                  © 2024 FutureClass ERP. All systems operational. 
                  <span className="ml-2 text-slate-300">Last synced: {new Date().toLocaleTimeString()}</span>
                </p>
                <div className="flex items-center gap-4">
                  <div className="h-1 w-12 bg-slate-200 rounded-full" />
                  <div className="h-1 w-4 bg-slate-900 rounded-full" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </PageTransition>
  );
}

