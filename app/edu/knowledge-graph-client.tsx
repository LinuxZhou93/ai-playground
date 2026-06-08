"use client";

import React, { useMemo } from 'react';
import { ReactFlow, MiniMap, Controls, Background, useNodesState, useEdgesState, MarkerType } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { BrainCircuit, Cpu } from 'lucide-react';

const CATEGORY_COLORS: Record<string, string> = {
  "机器人": "#3B82F6",    // Blue
  "编程": "#10B981",      // Emerald
  "电子": "#F59E0B",      // Amber
  "3D打印": "#8B5CF6",    // Violet
  "综合": "#64748B",      // Slate
};

export default function KnowledgeGraphClient({ courses }: { courses: any[] }) {
  // 1. 数据预处理，生成节点和连线
  const { initialNodes, initialEdges } = useMemo(() => {
    // 简单对每个分类进行X轴布局，同分类下延Y轴排列
    const categories = Array.from(new Set(courses.map(c => c.category || '综合')));
    
    const nodes: any[] = [];
    const edges: any[] = [];

    const categoryXMap = categories.reduce((acc, cat, idx) => {
      acc[cat] = idx * 350 + 100;
      return acc;
    }, {} as Record<string, number>);

    const categoryYTracker: Record<string, number> = {};

    courses.forEach((course) => {
      const cat = course.category || '综合';
      const color = CATEGORY_COLORS[cat] || CATEGORY_COLORS["综合"];
      
      const prevY = categoryYTracker[cat] || 100;
      const currentY = prevY + 150;
      categoryYTracker[cat] = currentY;

      nodes.push({
        id: course.id,
        type: 'default',
        data: { 
          label: (
            <div className="flex flex-col items-center p-2 min-w-[150px]">
               <div className="mb-2 h-8 w-8 rounded-full bg-slate-800/80 border border-slate-700 flex items-center justify-center text-white shadow-lg">
                 <Cpu className="h-4 w-4" style={{ color }} />
               </div>
               <div className="font-bold text-sm text-slate-200">{course.name}</div>
               <div className="text-[10px] text-slate-500 font-mono mt-1">{course.total_lessons}课时 | {course.duration_min}min</div>
            </div>
          )
        },
        position: { x: categoryXMap[cat], y: currentY },
        style: {
          background: '#0f172a',
          borderColor: color,
          borderWidth: '2px',
          borderRadius: '16px',
          boxShadow: `0 0 15px ${color}20`,
          color: '#e2e8f0',
        }
      });
    });

    // 绘制虚拟前置节点连线，用于示例展示（假设基于课时量作为上下游依赖条件）
    categories.forEach(cat => {
      const catCourses = courses.filter(c => (c.category || '综合') === cat).sort((a,b) => (a.total_lessons || 0) - (b.total_lessons || 0));
      for(let i=0; i<catCourses.length - 1; i++) {
        edges.push({
          id: `e-${catCourses[i].id}-${catCourses[i+1].id}`,
          source: catCourses[i].id,
          target: catCourses[i+1].id,
          animated: true,
          style: { stroke: CATEGORY_COLORS[cat] || '#CBD5E1', strokeWidth: 2 },
          markerEnd: {
            type: MarkerType.ArrowClosed,
            color: CATEGORY_COLORS[cat] || '#CBD5E1',
          },
        });
      }
    });

    // 假定添加跨学科关联线 
    if (categories.length >= 2 && courses.length >= 2) {
       edges.push({
          id: `cross-edge`,
          source: courses[0].id,
          target: courses[courses.length-1].id,
          animated: true,
          style: { stroke: '#ec4899', strokeWidth: 2, strokeDasharray: '5 5' },
          type: 'step',
       });
    }

    // 增加顶层的锚点 Category Nodes
    categories.forEach(cat => {
      nodes.push({
        id: `cat-${cat}`,
        data: { 
          label: (
            <div className="font-black text-lg text-white tracking-widest">{cat} 赛道</div>
          ) 
        },
        position: { x: categoryXMap[cat] - 20, y: 50 },
        className: 'border-none bg-transparent shadow-none',
        draggable: false,
      })
    })

    return { initialNodes: nodes, initialEdges: edges };
  }, [courses]);

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  return (
    <div className="h-[600px] w-full bg-[#080b12] border border-slate-800 rounded-3xl overflow-hidden shadow-[inset_0_0_100px_rgba(0,0,0,0.5)] relative">
      <div className="absolute top-6 left-6 z-10 flex items-center gap-3">
        <div className="h-10 w-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-600/20">
          <BrainCircuit className="h-5 w-5 text-white" />
        </div>
        <div>
          <h2 className="text-xl font-black text-white">全景知识图谱</h2>
          <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-0.5">Knowledge Navigator</p>
        </div>
      </div>
      
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        fitView
        colorMode="dark"
        minZoom={0.5}
        maxZoom={1.5}
      >
        <Background color="#1e293b" gap={24} size={2} />
        <Controls className="!bg-slate-900 !border-slate-800 !fill-slate-400" />
      </ReactFlow>
    </div>
  );
}
