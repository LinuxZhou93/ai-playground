'use client'

import React, { useCallback, useEffect, useState } from 'react'
import {
  ReactFlow,
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  Connection,
  Edge,
  MarkerType,
  Node,
} from '@xyflow/react'
import '@xyflow/react/dist/style.css'
import { createClient } from '@/lib/supabase/client'
import { Brain, Code, Sparkles, Zap, Shield, Globe } from 'lucide-react'
import { motion, AnimatePresence } from 'motion/react'

// --- Types ---
interface KnowledgeNodeData {
  label: string
  category: 'code' | 'trend' | 'concept'
  metadata: any
}

// --- Custom Node Component ---
const CustomKnowledgeNode = ({ data }: { data: KnowledgeNodeData }) => {
  const isCode = data.category === 'code'
  const isTrend = data.category === 'trend'

  return (
    <div className={`
      px-6 py-4 rounded-2xl border backdrop-blur-xl shadow-2xl transition-all duration-500 group
      ${isCode 
        ? 'bg-blue-500/10 border-blue-500/30 text-blue-200 hover:border-blue-500' 
        : 'bg-purple-500/10 border-purple-500/30 text-purple-200 hover:border-purple-500'}
    `}>
      <div className="flex items-center gap-4">
        <div className={`p-3 rounded-xl ${isCode ? 'bg-blue-500/20' : 'bg-purple-500/20'}`}>
          {isCode ? <Code className="w-5 h-5" /> : <Globe className="w-5 h-5" />}
        </div>
        <div>
          <div className="text-[10px] uppercase tracking-widest opacity-40 mb-1">
            {data.category}
          </div>
          <div className="text-sm font-bold tracking-tight">{data.label}</div>
        </div>
      </div>
      
      {/* Glow Effect */}
      <div className={`
        absolute -inset-1 rounded-2xl blur-xl opacity-0 group-hover:opacity-20 transition-opacity duration-500
        ${isCode ? 'bg-blue-500' : 'bg-purple-500'}
      `} />
    </div>
  )
}

const nodeTypes = {
  knowledge: CustomKnowledgeNode,
}

const initialNodes: Node[] = []
const initialEdges: Edge[] = []

export default function KnowledgeGraph() {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes)
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges)
  const [selectedNode, setSelectedNode] = useState<Node | null>(null)
  const supabase = createClient()

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  )

  useEffect(() => {
    async function fetchGraphData() {
      // 1. Fetch Nodes
      const { data: dbNodes } = await supabase.from('knowledge_nodes').select('*')
      // 2. Fetch Edges
      const { data: dbEdges } = await supabase.from('knowledge_edges').select('*')

      if (dbNodes) {
        const groups: Node[] = []
        const fileNodes: Node[] = []
        const dirMap = new Map<string, { id: string, count: number }>()
        
        let dirIndex = 0
        dbNodes.forEach((node) => {
          if (node.category === 'Source Code') {
            const relPath = node.metadata?.path || ''
            const topDir = relPath.split('/')[0] || 'root'
            const groupId = `group-${topDir}`

            if (!dirMap.has(topDir)) {
              dirMap.set(topDir, { id: groupId, count: 0 })
              groups.push({
                id: groupId,
                data: { label: topDir.toUpperCase() },
                type: 'group',
                position: { x: 0, y: dirIndex * 850 },
                style: {
                  width: 1400,
                  height: 800,
                  backgroundColor: 'rgba(59, 130, 246, 0.03)',
                  border: '1px solid rgba(59, 130, 246, 0.1)',
                  borderRadius: '32px',
                  pointerEvents: 'none',
                },
              })
              dirIndex++
            }

            const info = dirMap.get(topDir)!
            const i = info.count
            info.count++

            fileNodes.push({
              id: node.id,
              parentId: groupId,
              type: 'knowledge',
              extent: 'parent',
              position: { 
                x: (i % 6) * 220 + 40, 
                y: Math.floor(i / 6) * 140 + 80 
              },
              data: { 
                label: node.label, 
                category: 'code',
                metadata: node.metadata 
              },
            })
          } else {
            // Trend Nodes Cluster
            const i = fileNodes.filter(fn => !(fn as any).parentId).length
            fileNodes.push({
              id: node.id,
              type: 'knowledge',
              position: { 
                x: 1600 + (i % 2) * 500, 
                y: i * 200 
              },
              data: { 
                label: node.label, 
                category: 'trend',
                metadata: node.metadata 
              },
            })
          }
        })

        setNodes([...groups, ...fileNodes])
      }

      if (dbEdges) {
        const flowEdges = dbEdges.map((edge) => ({
          id: edge.id,
          source: edge.source,
          target: edge.target,
          label: edge.relation_type,
          animated: true,
          style: { stroke: '#4f46e5', strokeWidth: 2, opacity: 0.5 },
          markerEnd: {
            type: MarkerType.ArrowClosed,
            color: '#4f46e5',
          },
        }))
        setEdges(flowEdges)
      }
    }

    fetchGraphData()

    // Real-time subscription
    const channel = supabase
      .channel('knowledge_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'knowledge_nodes' }, fetchGraphData)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'knowledge_edges' }, fetchGraphData)
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [supabase, setNodes, setEdges])

  return (
    <div className="w-full h-[700px] relative rounded-3xl overflow-hidden border border-white/5 bg-black/40">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        nodeTypes={nodeTypes}
        onNodeClick={(_, node) => setSelectedNode(node)}
        fitView
      >
        <Background color="#111" gap={20} />
        <Controls className="!bg-black/80 !border-white/10 !fill-white" />
        <MiniMap 
          nodeColor={(n) => (n.data as any).category === 'code' ? '#3b82f6' : '#a855f7'}
          maskColor="rgba(0, 0, 0, 0.5)"
          className="!bg-black/60 !border-white/10"
        />
      </ReactFlow>

      {/* Info Panel */}
      <AnimatePresence>
        {selectedNode && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="absolute right-6 top-6 bottom-6 w-80 bg-black/80 backdrop-blur-2xl border border-white/10 rounded-3xl p-8 z-50 shadow-2xl"
          >
            <div className="flex justify-between items-start mb-8">
              <div className={`p-4 rounded-2xl ${selectedNode.data.category === 'code' ? 'bg-blue-500/20' : 'bg-purple-500/20'}`}>
                {selectedNode.data.category === 'code' ? <Code className="w-6 h-6 text-blue-400" /> : <Globe className="w-6 h-6 text-purple-400" />}
              </div>
              <button 
                onClick={() => setSelectedNode(null)}
                className="text-white/20 hover:text-white transition-colors"
              >
                ✕
              </button>
            </div>

            <h3 className="text-2xl font-bold mb-2 tracking-tight">{selectedNode.data.label as string}</h3>
            <div className="inline-flex px-2 py-1 bg-white/5 border border-white/10 rounded-md text-[10px] uppercase tracking-widest text-white/40 mb-6">
              {selectedNode.data.category as string}
            </div>

            <div className="space-y-6">
              <div>
                <h4 className="text-xs font-semibold text-white/40 uppercase tracking-wider mb-2">Detailed Insight</h4>
                <p className="text-sm text-white/60 leading-relaxed italic">
                  "{(selectedNode.data.metadata as any)?.purpose || (selectedNode.data.metadata as any)?.description || 'Semantic indexing in progress...'}"
                </p>
              </div>

              <div className="pt-6 border-t border-white/5">
                <div className="flex items-center gap-3 text-xs text-white/40 mb-4">
                  <Sparkles className="w-4 h-4 text-emerald-400" />
                  <span>AI Recommendations</span>
                </div>
                <div className="p-4 bg-emerald-500/5 border border-emerald-500/10 rounded-2xl">
                  <p className="text-xs text-emerald-100/60 leading-relaxed">
                    基于代码实现，建议集成更多分布式共识算法以增强 Swarm 的稳定性。
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Legend */}
      <div className="absolute left-6 bottom-6 flex gap-6 p-4 bg-black/60 backdrop-blur-xl border border-white/10 rounded-2xl z-40">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-blue-500/40 border border-blue-500" />
          <span className="text-[10px] text-white/40 uppercase tracking-widest">Source Code</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-purple-500/40 border border-purple-500" />
          <span className="text-[10px] text-white/40 uppercase tracking-widest">AI Trends</span>
        </div>
      </div>
    </div>
  )
}
