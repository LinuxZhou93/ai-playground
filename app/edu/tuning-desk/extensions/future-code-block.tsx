"use client";

import { Node, mergeAttributes } from '@tiptap/core';
import { ReactNodeViewRenderer, NodeViewWrapper } from '@tiptap/react';
import React, { useState, useEffect } from 'react';
import { Copy, Check, Terminal, Code2, ChevronDown } from 'lucide-react';
import { codeToHtml } from 'shiki';

const FutureCodeBlockComponent = ({ node, updateAttributes, extension }: any) => {
  const { language, content, showLineNumbers } = node.attrs;
  const [highlighted, setHighlighted] = useState('');
  const [copied, setCopied] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    const highlight = async () => {
      try {
        const html = await codeToHtml(content || '', {
          lang: language || 'javascript',
          theme: 'github-dark-dimmed',
        });
        setHighlighted(html);
      } catch (e) {
        setHighlighted(`<pre><code>${content}</code></pre>`);
      }
    };
    highlight();
  }, [content, language]);

  const handleCopy = () => {
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <NodeViewWrapper className="future-code-block my-6 group/code relative">
      <div 
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className="rounded-2xl bg-[#0b0e14] border border-slate-800 shadow-2xl overflow-hidden transition-all focus-within:ring-2 focus-within:ring-indigo-500/40"
      >
        {/* Header Bar */}
        <div className="flex items-center justify-between px-4 py-2.5 bg-slate-900/80 border-b border-slate-800/60 backdrop-blur-md">
          <div className="flex items-center gap-3">
             {/* Mac style control dots */}
             <div className="flex gap-1.5 mr-2">
                <div className="w-2.5 h-2.5 rounded-full bg-[#ff5f56]" />
                <div className="w-2.5 h-2.5 rounded-full bg-[#ffbd2e]" />
                <div className="w-2.5 h-2.5 rounded-full bg-[#27c93f]" />
             </div>
             <div className="flex items-center gap-1.5">
                <Terminal className="h-3 w-3 text-slate-500" />
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">
                  {language || 'plain text'}
                </span>
             </div>
          </div>
          
          <div className="flex items-center gap-2">
             <button 
               onClick={handleCopy}
               className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-all active:scale-90"
             >
               {copied ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
             </button>
          </div>
        </div>

        {/* Code Content */}
        <div className="relative p-0 font-mono text-[13px] leading-relaxed overflow-x-auto custom-scrollbar min-h-[4rem]">
          {highlighted ? (
             <div 
               className="p-5 shiki-container"
               dangerouslySetInnerHTML={{ __html: highlighted }} 
             />
          ) : (
             <pre className="p-5 text-slate-500 italic">正在注入语法分析器...</pre>
          )}
        </div>

        {/* Floating Tooltip / Status */}
        <div className="absolute bottom-3 right-3 opacity-0 group-hover/code:opacity-100 transition-opacity pointer-events-none">
           <div className="flex items-center gap-1 px-2 py-1 rounded bg-indigo-500/20 text-[9px] font-bold text-indigo-400 border border-indigo-500/30 backdrop-blur-xl">
              <Code2 className="h-2.5 w-2.5" /> FutureClass IDE Runtime
           </div>
        </div>
      </div>

      <style jsx global>{`
        .shiki-container pre {
          background-color: transparent !important;
          margin: 0 !important;
          padding: 0 !important;
        }
        .shiki-container code {
          background-color: transparent !important;
        }
        .future-code-block .shiki {
          background-color: transparent !important;
        }
      `}</style>
    </NodeViewWrapper>
  );
};

export const FutureCodeBlock = Node.create({
  name: 'futureCodeBlock',
  group: 'block',
  content: 'text*',
  marks: '',
  code: true,
  defining: true,

  addAttributes() {
    return {
      language: { default: 'javascript' },
      content: { default: '' },
      showLineNumbers: { default: true },
    };
  },

  parseHTML() {
    return [{ tag: 'div[data-type="future-code-block"]' }];
  },

  renderHTML({ HTMLAttributes }) {
    return ['div', mergeAttributes(HTMLAttributes, { 'data-type': 'future-code-block' }), 0];
  },

  addNodeView() {
    return ReactNodeViewRenderer(FutureCodeBlockComponent);
  },
});
