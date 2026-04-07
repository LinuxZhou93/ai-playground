'use client'

import React from 'react'
import KnowledgeGraph from '@/components/swarm/KnowledgeGraph'
import { Brain, Sparkles, BookOpen, Network, Activity, Info } from 'lucide-react'
import { motion } from 'motion/react'

export default function KnowledgePage() {
  return (
    <div className="min-h-screen bg-[#050505] text-white p-8">
      {/* Header Section */}
      <header className="max-w-[1400px] mx-auto mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-purple-500/20 rounded-lg">
              <Brain className="w-6 h-6 text-purple-400" />
            </div>
            <span className="text-sm font-bold text-purple-500/80 uppercase tracking-widest">Chronos Knowledge Graph</span>
          </div>
          <h1 className="text-5xl font-black tracking-tighter mb-4 bg-gradient-to-r from-white via-white to-white/20 bg-clip-text text-transparent">
            知识图谱：AI 索引中心
          </h1>
          <p className="text-white/40 max-w-2xl text-lg leading-relaxed">
            自动化全网代码与知识库索引。实时映射本地实现与 2026 全球 AI 技术趋势的交点。
          </p>
        </div>

        <div className="flex gap-4">
          <button className="px-6 py-3 bg-white text-black font-bold rounded-2xl hover:bg-white/90 transition-all flex items-center gap-2 group">
            <Sparkles className="w-4 h-4" />
            立即同步全网知识
          </button>
          <button className="px-6 py-3 bg-white/5 border border-white/10 font-bold rounded-2xl hover:bg-white/10 transition-all">
            导出研究报告
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-[1400px] mx-auto grid grid-cols-1 xl:grid-cols-4 gap-8">
        
        {/* Left Stats Panel */}
        <div className="xl:col-span-1 space-y-6">
          <StatCard 
            icon={<Network className="w-5 h-5 text-blue-400" />}
            title="神经节点总数"
            value="142"
            delta="+12% Since Yesterday"
          />
          <StatCard 
            icon={<Activity className="w-5 h-5 text-emerald-400" />}
            title="知识密度"
            value="89.4%"
            delta="High Accuracy Index"
          />
          
          <div className="bg-white/5 border border-white/10 rounded-3xl p-8">
            <h3 className="text-sm font-bold text-white/40 uppercase tracking-widest mb-6 flex items-center gap-2">
              <BookOpen className="w-4 h-4" />
              当前索引领域
            </h3>
            <ul className="space-y-4">
              {['Multi-Agent Orchestration', 'RLS & JWT Security', 'Telemetry Pulse', 'MCP Protocol'].map((topic) => (
                <li key={topic} className="flex items-center justify-between group cursor-pointer">
                  <span className="text-white/60 group-hover:text-white transition-colors">{topic}</span>
                  <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
                </li>
              ))}
            </ul>
          </div>

          <div className="bg-gradient-to-br from-indigo-600/20 to-blue-600/20 border border-indigo-500/20 rounded-3xl p-8 relative overflow-hidden group hover:scale-[1.02] transition-transform">
            <div className="relative z-10">
              <Info className="w-10 h-10 text-indigo-400 mb-4" />
              <h3 className="text-lg font-bold mb-2">深度交叉验证</h3>
              <p className="text-white/40 text-xs leading-relaxed">
                正在通过 Unit-2 (Scout) 对本地 `scripts/swarm_pulse.ts` 进行全球最新 Agentic 遥测标准比对。
              </p>
            </div>
          </div>
        </div>

        {/* Right Graph Panel */}
        <div className="xl:col-span-3">
          <KnowledgeGraph />
        </div>

      </main>

      {/* Footer / Status Bar */}
      <footer className="max-w-[1400px] mx-auto mt-12 py-6 border-t border-white/5 flex justify-between items-center text-[10px] text-white/20 uppercase tracking-widest font-bold">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            Neural Engine Active
          </div>
          <div>Last Sync: 2026-04-05 22:33:01</div>
        </div>
        <div>v0.4.0 (Knowledge Alpha)</div>
      </footer>
    </div>
  )
}

function StatCard({ icon, title, value, delta }: { icon: any, title: string, value: string, delta: string }) {
  return (
    <div className="bg-white/5 border border-white/10 rounded-3xl p-8 hover:bg-white/[0.07] transition-all">
      <div className="flex justify-between items-start mb-4">
        <div className="p-3 bg-white/5 rounded-xl border border-white/10">{icon}</div>
        <span className="text-[10px] text-emerald-400 font-bold bg-emerald-400/10 px-2 py-1 rounded-md">{delta}</span>
      </div>
      <div className="text-3xl font-black tracking-tight mb-1">{value}</div>
      <div className="text-[10px] text-white/40 uppercase tracking-widest font-bold">{title}</div>
    </div>
  )
}
