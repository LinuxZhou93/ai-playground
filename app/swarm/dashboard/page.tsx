'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { 
  Activity, 
  Cpu, 
  Database, 
  LayoutDashboard, 
  Zap, 
  Shield, 
  CheckCircle2, 
  Clock, 
  AlertCircle,
  Sparkles,
  Server,
  ArrowRight
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

interface NodeStatus {
  node_id: string
  hostname: string
  status: string
  cpu_usage: number
  mem_usage: number
  last_pulse: string
}

interface Mission {
  id: string
  title: string
  status: string
  priority: number
  created_at: string
}

const NodeCard = ({ id, role, status, cpu, mem, active, color = 'blue' }: any) => {
  const isOnline = active && (status === 'ONLINE')
  const accentColor = color === 'purple' ? 'text-purple-400' : color === 'amber' ? 'text-amber-400' : 'text-blue-400'
  const bgColor = color === 'purple' ? 'bg-purple-500/10' : color === 'amber' ? 'bg-amber-500/10' : 'bg-blue-500/10'
  const borderColor = color === 'purple' ? 'border-purple-500/20' : color === 'amber' ? 'border-amber-500/20' : 'border-blue-500/20'

  return (
    <motion.div 
      layout
      className={`bg-white/[0.03] border ${borderColor} rounded-3xl p-6 relative overflow-hidden group hover:border-white/20 transition-colors`}
    >
      <div className={`absolute top-6 right-6 w-2 h-2 rounded-full ${isOnline ? 'bg-emerald-500 shadow-[0_0_10px_#10b981]' : 'bg-red-500'} ${isOnline ? 'animate-pulse' : ''}`} />
      
      <div className="flex items-center gap-4 mb-6">
        <div className={`p-3 ${bgColor} rounded-xl border ${borderColor}`}>
          <Server className={`w-5 h-5 ${accentColor}`} />
        </div>
        <div>
          <span className="text-[10px] uppercase tracking-widest font-black text-white/20">{role}</span>
          <h3 className="text-xl font-bold tracking-tight text-white/90">{id}</h3>
        </div>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <div className="flex justify-between text-[10px] font-mono tracking-wider">
            <span className="text-white/30 uppercase">CPU Load</span>
            <span className={accentColor}>{cpu}%</span>
          </div>
          <div className="w-full bg-white/5 h-1 rounded-full overflow-hidden">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${cpu}%` }}
              className={`h-full ${color === 'purple' ? 'bg-purple-500' : color === 'amber' ? 'bg-amber-500' : 'bg-blue-500'}`} 
            />
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between text-[10px] font-mono tracking-wider">
            <span className="text-white/30 uppercase">Memory</span>
            <span className={accentColor}>{mem}%</span>
          </div>
          <div className="w-full bg-white/5 h-1 rounded-full overflow-hidden">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${mem}%` }}
              className={`h-full ${color === 'purple' ? 'bg-purple-500' : color === 'amber' ? 'bg-amber-500' : 'bg-blue-500'}`} 
            />
          </div>
        </div>
      </div>
    </motion.div>
  )
}

export default function SwarmDashboard() {
  const [nodes, setNodes] = useState<NodeStatus[]>([])
  const [missions, setMissions] = useState<Mission[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()
  const router = useRouter()

  useEffect(() => {
    async function fetchData() {
      const { data: nodesData } = await supabase.from('node_status').select('*').order('node_id')
      const { data: missionsData } = await supabase.from('missions').select('*').order('created_at', { ascending: false }).limit(5)
      
      setNodes(nodesData || [])
      setMissions(missionsData || [])
      setLoading(false)

      const channel = supabase
        .channel('dashboard-master')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'node_status' }, (payload) => {
          setNodes((prev) => {
            const newNode = payload.new as NodeStatus
            const index = prev.findIndex(n => n.node_id === newNode.node_id)
            if (index === -1) return [...prev, newNode]
            const next = [...prev]
            next[index] = newNode
            return next
          })
        })
        .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'missions' }, (payload) => {
          setMissions((prev) => [payload.new as Mission, ...prev].slice(0, 5))
          toast.success(`新任务下发: ${(payload.new as Mission).title}`)
        })
        .subscribe()

      return () => { supabase.removeChannel(channel) }
    }
    fetchData()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0b] flex items-center justify-center">
        <div className="w-12 h-12 border-2 border-blue-500/20 border-t-blue-500 rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0a0a0b] text-white p-6 lg:p-12 font-sans selection:bg-blue-500/30">
      {/* Header */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-16">
        <div className="flex items-center gap-6">
          <div className="p-4 bg-blue-600/10 border border-blue-500/20 rounded-3xl">
            <LayoutDashboard className="w-8 h-8 text-blue-400" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-white/90">Swarm 控制台</h1>
            <p className="text-white/40 text-sm font-medium">Project Chronos · 24/7 全域自主演化</p>
          </div>
        </div>
        
        <motion.div 
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => router.push('/swarm/knowledge')}
          className="flex items-center gap-4 px-6 py-3 bg-emerald-500/5 border border-emerald-500/20 rounded-2xl cursor-pointer group hover:bg-emerald-500/10 transition-all border-dashed"
        >
          <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_8px_#10b981]" />
          <span className="text-xs font-bold text-emerald-400 uppercase tracking-widest">Neural Knowledge Center</span>
          <ArrowRight className="w-4 h-4 text-emerald-500 opacity-0 group-hover:opacity-100 transition-all translate-x-[-10px] group-hover:translate-x-0" />
        </motion.div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Left Section: 3/4 Width */}
        <div className="lg:col-span-3 space-y-12">
          
          {/* Node Grid */}
          <section>
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                <Activity className="w-6 h-6 text-emerald-400" />
                <h2 className="text-xl font-bold tracking-tight">核心节点脉冲 (Nodes)</h2>
              </div>
              <span className="text-[10px] font-bold text-white/20 uppercase tracking-widest bg-white/5 px-3 py-1 rounded-full">3 Nodes Active</span>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <NodeCard 
                id="Unit-1" 
                role="Prime 中枢" 
                status={nodes.find(n => n.node_id === 'unit1')?.status || 'OFFLINE'} 
                cpu={nodes.find(n => n.node_id === 'unit1')?.cpu_usage || 0}
                mem={nodes.find(n => n.node_id === 'unit1')?.mem_usage || 0}
                active={true}
              />
              <NodeCard 
                id="Unit-2" 
                role="Scout 探测" 
                color="purple"
                status={nodes.find(n => n.node_id === 'unit2')?.status || 'WAITING'} 
                cpu={nodes.find(n => n.node_id === 'unit2')?.cpu_usage || 0}
                mem={nodes.find(n => n.node_id === 'unit2')?.mem_usage || 0}
                active={nodes.some(n => n.node_id === 'unit2' && (new Date().getTime() - new Date(n.last_pulse).getTime() < 60000))}
              />
              <NodeCard 
                id="Unit-3" 
                role="Forge 工厂" 
                color="amber"
                status={nodes.find(n => n.node_id === 'unit3')?.status || 'OFFLINE'} 
                cpu={nodes.find(n => n.node_id === 'unit3')?.cpu_usage || 0}
                mem={nodes.find(n => n.node_id === 'unit3')?.mem_usage || 0}
                active={nodes.some(n => n.node_id === 'unit3')}
              />
            </div>
          </section>

          {/* Mission Scroller */}
          <section>
            <div className="flex items-center gap-3 mb-8">
              <Zap className="w-6 h-6 text-yellow-500" />
              <h2 className="text-xl font-bold tracking-tight">实时演化流水 (Missions)</h2>
            </div>
            
            <div className="bg-white/[0.02] border border-white/10 rounded-[2.5rem] overflow-hidden backdrop-blur-sm">
              <div className="divide-y divide-white/5">
                {missions.length === 0 ? (
                  <div className="p-20 text-center text-white/10">
                    <Zap className="w-12 h-12 mx-auto mb-4 opacity-5" />
                    <p className="text-sm font-medium">尚无活跃任务。计算中枢待命。</p>
                  </div>
                ) : (
                  missions.map((m) => (
                    <div key={m.id} className="p-8 flex items-center justify-between hover:bg-white/[0.03] transition-all group">
                      <div className="flex items-center gap-6">
                        <div className={`p-3 rounded-2xl ${
                          m.status === 'COMPLETED' ? 'bg-emerald-500/10' :
                          m.status === 'RUNNING' ? 'bg-blue-500/10' :
                          m.status === 'FAILED' ? 'bg-red-500/10' : 'bg-white/5'
                        }`}>
                          {m.status === 'COMPLETED' ? <CheckCircle2 className="w-6 h-6 text-emerald-400" /> :
                           m.status === 'RUNNING' ? <Activity className="w-6 h-6 text-blue-400 animate-pulse" /> :
                           m.status === 'FAILED' ? <AlertCircle className="w-6 h-6 text-red-400" /> :
                           <Clock className="w-6 h-6 text-white/20" />}
                        </div>
                        <div>
                          <h4 className="text-lg font-bold text-white/80 group-hover:text-white transition-colors">{m.title}</h4>
                          <p className="text-xs text-white/30 font-mono tracking-tight">{new Date(m.created_at).toLocaleString()}</p>
                        </div>
                      </div>
                      <div className="px-4 py-1.5 bg-white/5 border border-white/10 rounded-full text-[10px] font-black tracking-widest text-white/40 uppercase">
                        {m.status}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </section>
        </div>

        {/* Right Sidebar: 1/4 Width */}
        <div className="space-y-8">
          
          {/* Forge Card */}
          <div className="bg-gradient-to-br from-amber-600/10 via-orange-600/5 to-transparent border border-amber-500/20 rounded-[2.5rem] p-10 relative overflow-hidden group">
            <div className="relative z-10">
              <Sparkles className="w-14 h-14 text-amber-400 mb-8" />
              <h3 className="text-2xl font-black mb-4 tracking-tighter">Forge 演化状态</h3>
              <p className="text-white/40 text-sm leading-relaxed mb-8">
                Unit-3 (Forge) 正在基于知识图谱生成的 **“分布式共识模型 (POQ)”** 进行代码级自动化构建。
              </p>
              
              <div className="space-y-3">
                <div className="flex justify-between text-[10px] uppercase tracking-[0.2em] font-black">
                  <span className="text-amber-400/40">Neural Synthesis</span>
                  <span className="text-amber-400">82%</span>
                </div>
                <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: '82%' }}
                    className="h-full bg-gradient-to-r from-amber-500 to-orange-500 shadow-[0_0_15px_rgba(245,158,11,0.3)]"
                  />
                </div>
              </div>
            </div>
            <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-amber-500/10 rounded-full blur-[80px] group-hover:bg-amber-500/20 transition-all duration-1000" />
          </div>

          {/* System Health / Knowledge Link */}
          <div className="bg-white/[0.03] border border-white/10 rounded-[2.5rem] p-10">
            <h3 className="text-xs font-black text-white/20 uppercase tracking-[0.3em] mb-8">Swarm Intelligence</h3>
            <div className="space-y-6">
              <div className="flex justify-between py-4 border-b border-white/5">
                <span className="text-white/40 text-xs">DB Latency</span>
                <span className="text-emerald-400 font-mono text-xs font-bold">12.4ms</span>
              </div>
              <div className="flex justify-between py-4 border-b border-white/5">
                <span className="text-white/40 text-xs">Knowledge Seed</span>
                <span className="text-emerald-400 font-mono text-xs font-bold">OPTIMIZED</span>
              </div>
              <div className="pt-6">
                <button 
                  onClick={() => router.push('/swarm/knowledge')}
                  className="w-full py-5 bg-white/5 border border-white/10 rounded-2xl text-[10px] uppercase tracking-[0.2em] font-black hover:bg-white/10 transition-all flex items-center justify-center gap-3 active:scale-95 group"
                >
                  <Shield className="w-4 h-4 text-blue-400 group-hover:rotate-12 transition-transform" />
                  Open Neural Graph
                </button>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}
