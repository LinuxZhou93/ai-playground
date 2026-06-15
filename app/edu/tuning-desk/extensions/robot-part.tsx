import { Node, mergeAttributes } from '@tiptap/core'
import { ReactNodeViewRenderer, NodeViewWrapper } from '@tiptap/react'
import React from 'react'
import { Cpu, Wrench, Zap, Info } from 'lucide-react'

const RobotPartComponent = (props: any) => {
  const { node } = props
  const { name, category, thumbnail, spec } = node.attrs

  return (
    <NodeViewWrapper className="robot-part-node my-4">
      <div className="max-w-sm rounded-2xl bg-slate-900 border border-slate-800 overflow-hidden shadow-xl hover:border-indigo-500/50 transition-all group">
         <div className="h-32 w-full bg-slate-950 relative flex items-center justify-center">
            {thumbnail ? (
              <img src={thumbnail} alt={name} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
            ) : (
              <div className="flex flex-col items-center justify-center text-slate-700">
                 <Wrench className="h-10 w-10 mb-2" />
                 <span className="text-[10px] font-bold uppercase">Hardware Component</span>
              </div>
            )}
            <div className="absolute top-2 right-2 px-2 py-0.5 rounded-full bg-black/60 backdrop-blur-md border border-white/10 text-[9px] font-black text-indigo-400 uppercase tracking-tighter">
               {category}
            </div>
         </div>
         <div className="p-4">
            <h4 className="text-white font-black text-sm mb-1">{name}</h4>
            <p className="text-[11px] text-slate-500 leading-snug line-clamp-2 mb-3">
               {spec || "暂无详细技术指标描述，请查阅教研手册。"}
            </p>
            <div className="flex items-center justify-between pt-3 border-t border-slate-800">
               <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400">
                  <Zap className="h-3 w-3 text-amber-500" /> 核心模组
               </div>
               <button className="flex items-center gap-1 text-[10px] font-bold text-indigo-400 hover:text-indigo-300 transition-colors">
                  <Info className="h-3 w-3" /> 详情
               </button>
            </div>
         </div>
      </div>
    </NodeViewWrapper>
  )
}

export const RobotPart = Node.create({
  name: 'robotPart',
  group: 'block',
  atom: true, // 作为一个原子整体，不可在内部编辑

  addAttributes() {
    return {
      name: { default: '未知组件' },
      category: { default: '硬件' },
      thumbnail: { default: null },
      spec: { default: '' },
    }
  },

  parseHTML() {
    return [{ tag: 'div[data-type="robot-part"]' }]
  },

  renderHTML({ HTMLAttributes }) {
    return ['div', mergeAttributes(HTMLAttributes, { 'data-type': 'robot-part' })]
  },

  addNodeView() {
    return ReactNodeViewRenderer(RobotPartComponent)
  },
})
