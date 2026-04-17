'use client'

import React, { useState, useEffect } from 'react'
import { 
  Zap, Brain, Shield, Rocket, Target, 
  Activity, Star, Search, Plus, ExternalLink,
  ChevronRight, ArrowUpRight, Lock, Sparkles,
  Trophy, Flame, Layers, Globe, Code, 
  Terminal, Github, Cpu, MessageSquare, Heart, Youtube 
} from 'lucide-react'
import { motion, AnimatePresence } from 'motion/react'

// --- Types ---
interface Skill {
  id: string
  name: string
  category: string
  level: number
  exp: number
  maxExp: number
  summary: string
  core_code?: string
  tony_insight?: string
  source_urls?: string[]
  icon?: string
  color: string
}

const CATEGORIES = ['All', 'Coding', 'AI & Data', 'Product', 'Strategy', 'Life']

const MARKET_SKILLS = [
  { name: 'LLM 微调实战', provider: 'HuggingFace Academy', cost: '1200 EXP', rating: 4.9 },
  { name: '分布式系统共识算法', provider: 'MIT OpenCourse', cost: '3000 EXP', rating: 5.0 },
  { name: '神经形态计算引擎', provider: 'Antigravity Research', cost: '5000 EXP', rating: 4.8 },
]

export default function TonySkillsPage() {
  const [skills, setSkills] = useState<Skill[]>([])
  const [activeTab, setActiveTab] = useState('My Skills')
  const [activeCategory, setActiveCategory] = useState('All')
  const [ingestUrl, setIngestUrl] = useState('')
  const [isIngesting, setIsIngesting] = useState(false)
  const [selectedSkill, setSelectedSkill] = useState<Skill | null>(null)

  // 1. 获取真实技能数据
  const fetchSkills = async () => {
    try {
      const res = await fetch('/api/tony/skills')
      const result = await res.json()
      if (result.success) {
        const mapped = result.data.map((s: any) => ({
          ...s,
          color: s.category === 'Coding' ? 'from-blue-500 to-cyan-400' : 
                 s.category === 'AI & Data' ? 'from-purple-500 to-indigo-400' :
                 s.category === 'Product' ? 'from-emerald-500 to-teal-400' :
                 'from-amber-500 to-orange-400',
          maxExp: (s.level || 1) * 1000
        }))
        setSkills(mapped)
      }
    } catch (err) {
      console.error('Failed to fetch skills', err)
    }
  }

  useEffect(() => {
    fetchSkills()
  }, [])

  const handleIngest = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!ingestUrl) return
    setIsIngesting(true)
    
    try {
      const response = await fetch('/api/tony/ingest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: ingestUrl })
      })
      const result = await response.json()
      
      if (result.success) {
        fetchSkills()
        alert(`Tony 报告：新技能 [${result.data.name}] 挂载成功！\n获得 EXP: +${result.data.exp}`)
        setIngestUrl('')
      } else {
        alert(`吞噬失败: ${result.error}`)
      }
    } catch (err) {
      console.error('Ingest failed', err)
    } finally {
      setIsIngesting(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#020408] text-slate-100 p-8 selection:bg-indigo-500/30">
      <div className="max-w-[1400px] mx-auto">
        
        {/* --- Header --- */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-8 mb-16 relative">
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-6">
              <div className="flex -space-x-3">
                <div className="h-10 w-10 border-2 border-[#020408] rounded-full bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
                  <span className="text-[10px] font-black">TONY</span>
                </div>
                <div className="h-10 w-10 border-2 border-[#020408] rounded-full bg-slate-800 flex items-center justify-center">
                  <span className="text-[10px] font-black">USER</span>
                </div>
              </div>
              <div className="h-px w-8 bg-slate-800"></div>
              <span className="text-[10px] font-black tracking-widest text-slate-500 uppercase">Neural Matrix v2.0</span>
            </div>
            
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-6xl font-black tracking-tighter mb-4"
            >
              技能实验室 <span className="text-indigo-500">.</span>
            </motion.h1>
            <p className="text-slate-500 text-lg max-w-xl font-medium leading-relaxed">
              实时从全网吞噬知识碎片，并将其封装为可安装、可调用的真实技能。
              当前技能库已挂载 <span className="text-white">{skills.length}</span> 个核心模块。
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4 w-full md:w-auto shrink-0">
            <div className="bg-slate-900/50 border border-slate-800 rounded-3xl p-6">
              <div className="text-slate-500 text-[10px] font-black uppercase tracking-widest mb-2">数字化等级</div>
              <div className="text-4xl font-black text-white">LV. 14</div>
            </div>
            <div className="bg-slate-900/50 border border-slate-800 rounded-3xl p-6">
              <div className="text-slate-500 text-[10px] font-black uppercase tracking-widest mb-2">综合算力</div>
              <div className="text-4xl font-black text-indigo-400">2.8T</div>
            </div>
          </div>
        </header>

        {/* --- Ingestion Hub --- */}
        <section className="mb-16">
          <div className="bg-gradient-to-b from-slate-900 to-transparent border border-white/5 rounded-[40px] p-1 pb-0 overflow-hidden shadow-2xl">
            <div className="bg-[#0b101a] rounded-[38px] p-10 md:p-14 border border-white/5 relative overflow-hidden">
               <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-500/10 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2" />
               <div className="relative z-10">
                 <div className="flex items-center gap-3 mb-8">
                   <div className="p-3 bg-indigo-500/10 rounded-2xl border border-indigo-500/20 text-indigo-400">
                     <Brain className="w-6 h-6" />
                   </div>
                   <h2 className="text-2xl font-black">首席知识专员：解析并挂载</h2>
                 </div>

                 <form onSubmit={handleIngest} className="flex flex-col md:flex-row gap-4">
                   <div className="flex-1 relative group">
                     <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within:text-indigo-400 transition-colors" />
                     <input 
                       disabled={isIngesting}
                       value={ingestUrl}
                       onChange={(e) => setIngestUrl(e.target.value)}
                       placeholder="粘贴 YouTube/Bilibili 链接... 让 Tony 进行深度解析"
                       className="w-full h-16 md:h-20 bg-slate-950 border border-white/10 rounded-[28px] pl-16 pr-8 text-lg font-medium outline-none focus:border-indigo-500/50 transition-all disabled:opacity-50"
                     />
                   </div>
                   <button 
                     disabled={isIngesting || !ingestUrl}
                     className="h-16 md:h-20 px-10 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-800 text-white font-black rounded-[28px] flex items-center justify-center gap-3 transition-all shadow-xl shadow-indigo-500/20 active:scale-95 whitespace-nowrap"
                   >
                     {isIngesting ? "Tony 正在解析..." : "吞噬这个链接"}
                   </button>
                 </form>
               </div>
            </div>
          </div>
        </section>

        {/* --- Tabs --- */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-6 mb-12">
          <div className="flex bg-slate-900/50 border border-white/5 p-1 rounded-2xl">
            {['My Skills', 'Skills Market', 'Evolution Logs'].map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-8 py-3 rounded-xl text-sm font-black transition-all ${activeTab === tab ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
              >
                {tab}
              </button>
            ))}
          </div>
          <div className="flex gap-2 font-bold">
            {CATEGORIES.map(cat => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-4 py-2 rounded-full text-xs transition-all ${activeCategory === cat ? 'bg-white text-black' : 'bg-slate-900 border border-slate-800 text-slate-500'}`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* --- Grid --- */}
        <AnimatePresence mode="wait">
          {activeTab === 'My Skills' ? (
            <motion.div 
              key="grid"
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
            >
              {skills.filter(s => activeCategory === 'All' || s.category === activeCategory).map((skill, idx) => (
                <motion.div
                  key={skill.id}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  onClick={() => setSelectedSkill(skill)}
                  className="group relative bg-slate-900 border border-white/5 rounded-[32px] p-8 hover:border-indigo-500/20 transition-all cursor-pointer overflow-hidden shadow-xl"
                >
                  <div className={`absolute top-0 right-0 w-24 h-24 bg-gradient-to-br ${skill.color} opacity-0 group-hover:opacity-10 blur-2xl transition-opacity`} />
                  <div className="relative z-10">
                    {/* Icon & Meta */}
                    <div className="flex justify-between items-start mb-6">
                      <div className={`p-4 rounded-2xl bg-gradient-to-br ${skill.color} shadow-lg shadow-indigo-500/10`}>
                        {skill.icon === 'Github' ? <div className="text-white"><Github className="w-6 h-6" /></div> : 
                         skill.icon === 'Code' ? <div className="text-white"><Code className="w-6 h-6" /></div> :
                         skill.icon === 'Terminal' ? <div className="text-white"><Terminal className="w-6 h-6" /></div> :
                         skill.icon === 'Cpu' ? <div className="text-white"><Cpu className="w-6 h-6" /></div> :
                         skill.icon === 'Globe' ? <div className="text-white"><Globe className="w-6 h-6" /></div> :
                         skill.icon === 'MessageSquare' ? <div className="text-white"><MessageSquare className="w-6 h-6" /></div> :
                         skill.icon === 'Heart' ? <div className="text-white"><Heart className="w-6 h-6" /></div> :
                         skill.icon === 'Youtube' ? <div className="text-white"><Youtube className="w-6 h-6" /></div> :
                         <div className="text-white"><Zap className="w-6 h-6" /></div>}
                      </div>
                      <div className="flex flex-col items-end">
                        <span className="text-[10px] font-black italic text-indigo-500/50">#00{skill.id?.slice(0,4)}</span>
                        <div className="flex items-center gap-1 mt-1">
                          {[1, 2, 3].map((s) => (
                            <div key={s} className={`w-1 h-1 rounded-full ${s <= (skill.level || 1) ? 'bg-indigo-500' : 'bg-slate-800'}`} />
                          ))}
                        </div>
                      </div>
                    </div>
                    <h3 className="text-xl font-black mb-2 group-hover:text-indigo-300 transition-colors line-clamp-1">{skill.name}</h3>
                    <p className="text-sm text-slate-500 mb-6 line-clamp-2 leading-relaxed">{skill.summary}</p>
                    <div className="flex justify-between items-end mb-2">
                      <span className="text-[10px] font-black text-white">LV. {skill.level || 1}</span>
                      <span className="text-[9px] font-bold text-slate-600 uppercase">EXP: {skill.exp}</span>
                    </div>
                    <div className="h-1 w-full bg-slate-800 rounded-full overflow-hidden">
                      <div className={`h-full bg-gradient-to-r ${skill.color} w-[30%]`} />
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          ) : activeTab === 'Skills Market' ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {MARKET_SKILLS.map((skill, idx) => (
                <div key={idx} className="bg-slate-900/40 border border-white/5 rounded-[40px] p-10 hover:border-indigo-500/30 transition-all">
                   <h3 className="text-2xl font-black mb-2">{skill.name}</h3>
                   <p className="text-slate-500 text-sm mb-8 font-medium italic">来自 {skill.provider}</p>
                   <div className="flex items-center justify-between">
                     <span className="text-xl font-black text-indigo-400">{skill.cost}</span>
                     <button className="px-6 py-2 bg-white text-black font-black rounded-xl text-xs">立即同步</button>
                   </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-slate-500 text-center py-20 font-black uppercase tracking-widest">Evolution Logs Empty</div>
          )}
        </AnimatePresence>
      </div>

      {/* --- Detail Modal --- */}
      <AnimatePresence>
        {selectedSkill && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSelectedSkill(null)} className="absolute inset-0 bg-black/90 backdrop-blur-2xl" />
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="relative w-full max-w-5xl max-h-[90vh] bg-[#05070a] border border-white/10 rounded-[48px] shadow-2xl overflow-hidden flex flex-col p-0 overflow-y-auto custom-scrollbar">
                {/* Modal Header Decoration */}
                <div className="h-2 w-full bg-gradient-to-r from-transparent via-indigo-500 to-transparent opacity-50" />
                
                <div className="p-12">
                  <div className="flex justify-between items-start mb-12">
                    <div>
                      <div className="flex items-center gap-3 mb-4">
                        <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter bg-gradient-to-r ${selectedSkill.color} text-white`}>
                          {selectedSkill.category}
                        </span>
                        <span className="text-slate-500 text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
                          <Activity className="w-3 h-3 text-indigo-500" />
                          Neural Sync: 98%
                        </span>
                      </div>
                      <h2 className="text-5xl font-black tracking-tighter bg-clip-text text-transparent bg-gradient-to-b from-white to-slate-500">
                        {selectedSkill.name}
                      </h2>
                    </div>
                    <button onClick={() => setSelectedSkill(null)} className="p-4 bg-slate-900 rounded-full hover:bg-slate-800 transition-colors">
                      <Plus className="w-8 h-8 rotate-45 text-slate-500 hover:text-white" />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                    {/* Left Column: Logic & Insights */}
                    <div className="lg:col-span-8 space-y-10">
                      <section className="relative">
                        <div className="absolute -left-6 top-1 bottom-1 w-1 bg-indigo-500/30 rounded-full" />
                        <h4 className="text-[12px] font-black text-white uppercase tracking-[0.2em] mb-6 flex items-center gap-3">
                          <Code className="w-4 h-4 text-indigo-400" />
                          数字化灵魂 (Logic Kernel)
                        </h4>
                        <div className="relative group">
                          <div className="absolute inset-0 bg-indigo-500/5 blur-xl group-hover:bg-indigo-500/10 transition-colors rounded-3xl" />
                          <pre className="relative p-8 bg-black/60 border border-white/5 rounded-3xl text-sm font-mono text-emerald-400 overflow-x-auto whitespace-pre-wrap leading-relaxed shadow-inner">
                            {selectedSkill.core_code || '// Neural network analysis in progress...'}
                          </pre>
                        </div>
                      </section>

                      <section>
                        <h4 className="text-[12px] font-black text-white uppercase tracking-[0.2em] mb-6 flex items-center gap-3">
                          <Brain className="w-4 h-4 text-purple-400" />
                          Tony 的深层索引 (Deep Insights)
                        </h4>
                        <div className="p-8 bg-gradient-to-br from-indigo-500/10 to-transparent border border-indigo-500/10 rounded-[32px] text-lg leading-relaxed text-slate-300 italic font-medium relative group">
                          <span className="absolute top-4 left-4 text-5xl text-indigo-500/10 font-serif leading-none">“</span>
                          <p className="relative z-10 pl-8">
                            {selectedSkill.tony_insight || 'Tony 正在对该技能进行语义重构...'}
                          </p>
                        </div>
                      </section>
                    </div>

                    {/* Right Column: Actions & Stats */}
                    <div className="lg:col-span-4 space-y-8">
                      <div className="bg-slate-900/50 border border-white/5 rounded-[32px] p-8 space-y-6">
                        <div>
                          <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4">掌握进度</h4>
                          <div className="flex justify-between items-end mb-2">
                            <span className="text-2xl font-black text-white">LV. {selectedSkill.level || 1}</span>
                            <span className="text-xs font-bold text-slate-500 uppercase">EXP: {selectedSkill.exp}</span>
                          </div>
                          <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                            <motion.div 
                              initial={{ width: 0 }}
                              animate={{ width: `${(selectedSkill.exp / selectedSkill.maxExp) * 100}%` }}
                              className={`h-full bg-gradient-to-r ${selectedSkill.color}`} 
                            />
                          </div>
                        </div>

                        <div className="pt-6 border-t border-white/5 space-y-4">
                           <button className="w-full py-5 bg-indigo-600 hover:bg-indigo-500 text-white font-black rounded-2xl shadow-xl shadow-indigo-500/20 active:scale-95 transition-all flex items-center justify-center gap-3">
                             <Layers className="w-5 h-5" />
                             挂载到我的核心
                           </button>
                           <button className="w-full py-5 bg-slate-800 hover:bg-slate-700 text-white font-black rounded-2xl transition-all flex items-center justify-center gap-3">
                             <Globe className="w-5 h-5" />
                             同步至 NotebookLM
                           </button>
                           <button className="w-full py-5 bg-white/5 hover:bg-white/10 text-slate-400 font-bold rounded-2xl flex items-center justify-center gap-3 text-sm">
                             <Rocket className="w-4 h-4" />
                             生成播客概览
                           </button>
                        </div>
                      </div>

                      <div className="bg-indigo-950/20 border border-indigo-500/10 rounded-[32px] p-8">
                        <h4 className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                           <Trophy className="w-4 h-4" />
                           Source Origin
                        </h4>
                        <a 
                          href={selectedSkill.source_urls?.[0]} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="group block p-4 bg-black/40 rounded-2xl border border-white/5 hover:border-indigo-500/30 transition-all text-xs text-slate-400 hover:text-indigo-300 break-all leading-relaxed"
                        >
                          {selectedSkill.source_urls?.[0]}
                          <ExternalLink className="w-3 h-3 inline ml-2 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 10px; }
      `}</style>
    </div>
  )
}
