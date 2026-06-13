'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, X, Send, Minus, Sparkles, MessageCircle } from 'lucide-react';

interface MsgItem {
  role: 'assistant' | 'user' | 'xiaomai';
  author: string;
  avatar: string;
  content: string;
}

export default function AiAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<MsgItem[]>([
    { 
      role: 'assistant', 
      author: '小创老师', 
      avatar: '/assets/chatbear/白色机器人IP标准设定图.png', 
      content: '嗨！我是小创。如果在学习“具身智能”或 Python 编程时有任何疑问，随时可以发消息问我哦！' 
    }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  const handleSend = () => {
    if (!input.trim()) return;
    
    const newMessages: MsgItem[] = [...messages, { 
      role: 'user', 
      author: '小麦同学', 
      avatar: '/assets/chatbear/周小麦IP标准设定图.png', 
      content: input 
    }];
    
    setMessages(newMessages);
    setInput('');
    setIsTyping(true);

    // 1. 模拟小创老师进行第一阶段专业解答
    setTimeout(() => {
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        author: '小创老师', 
        avatar: '/assets/chatbear/白色机器人IP标准设定图.png', 
        content: `你问得太棒了！关于“${input}”，在具身智能 EAI 体系中属于核心课题。我们的 RobotAgent 需要先读取红外雷达的感知数组，然后再驱动底盘电机转动。`
      }]);
      
      // 2. 延迟 1.5 秒自动追加周小麦的趣味同伴对话，形成戏剧交互感
      setTimeout(() => {
        setIsTyping(false);
        setMessages(prev => [...prev, { 
          role: 'xiaomai', 
          author: '周小麦', 
          avatar: '/assets/chatbear/周小麦IP标准设定图.png', 
          content: `（凑过来）嘿嘿，我以前调这个时也踩过坑！其实就像你在主页体验舱看到的那样，一旦感知完成，调用 agent.move_to 就能立刻在 Canvas 物理沙箱里滑行过去，超好玩！`
        }]);
      }, 1500);

    }, 1200);
  };

  return (
    <div className="fixed bottom-8 right-8 z-[100] font-sans">
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.85, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.85, y: 30 }}
            className="absolute bottom-20 right-0 w-[420px] h-[620px] bg-slate-950/80 backdrop-blur-xl rounded-[2.5rem] shadow-[0_30px_100px_rgba(0,0,0,0.5)] border border-white/10 flex flex-col overflow-hidden text-white"
          >
            {/* Header with Colorful Tech Gradient */}
            <div className="p-6 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 flex items-center justify-between border-b border-white/5 relative">
              <div className="absolute inset-0 bg-black/10"></div>
              <div className="flex items-center gap-3 relative z-10">
                <div className="w-11 h-11 bg-white/15 backdrop-blur-md rounded-2xl flex items-center justify-center border border-white/20 shadow-lg">
                  <img src="/assets/chatbear/白色机器人IP标准设定图.png" alt="小创" className="w-7 h-7 object-contain" />
                </div>
                <div>
                  <h3 className="font-black text-sm tracking-wide">查特熊 AI 互动舱</h3>
                  <p className="text-[9px] text-blue-200 uppercase tracking-widest font-black flex items-center gap-1">
                    <Sparkles size={8} /> 小创 & 小麦双智能体
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1.5 relative z-10">
                <button onClick={() => setIsOpen(false)} className="p-2 hover:bg-white/10 rounded-full transition-colors text-white/80 hover:text-white">
                  <Minus size={16} />
                </button>
                <button onClick={() => setIsOpen(false)} className="p-2 hover:bg-white/10 rounded-full transition-colors text-white/80 hover:text-white">
                  <X size={16} />
                </button>
              </div>
            </div>

            {/* Chat Conversation Area */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-black/30">
              {messages.map((msg, i) => (
                <div key={i} className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  {msg.role !== 'user' && (
                    <div className={`w-9 h-9 rounded-xl overflow-hidden shrink-0 border border-white/15 bg-white flex items-center justify-center ${msg.role === 'xiaomai' ? 'border-yellow-400' : 'border-blue-400'}`}>
                      <img src={msg.avatar} alt="avatar" className="w-7 h-7 object-contain scale-110 translate-y-0.5" />
                    </div>
                  )}
                  
                  <div className="flex flex-col gap-1 max-w-[75%]">
                    <span className={`text-[10px] font-black text-gray-500 uppercase tracking-wider ${msg.role === 'user' ? 'text-right' : ''}`}>
                      {msg.author}
                    </span>
                    
                    <div className={`p-4 rounded-[1.5rem] text-xs leading-relaxed ${
                      msg.role === 'user' 
                        ? 'bg-blue-600 text-white rounded-tr-none shadow-lg' 
                        : msg.role === 'xiaomai'
                          ? 'bg-yellow-500/10 text-yellow-100 border border-yellow-500/20 rounded-tl-none'
                          : 'bg-white/5 text-gray-200 border border-white/5 rounded-tl-none shadow-sm'
                    }`}>
                      {msg.content}
                    </div>
                  </div>
                </div>
              ))}
              
              {isTyping && (
                <div className="flex items-center gap-2 text-xs text-gray-500 font-bold px-3">
                  <Loader2 size={12} className="animate-spin text-blue-500" /> 小麦正在碎碎念补充中...
                </div>
              )}
            </div>

            {/* Input Form Area */}
            <div className="p-5 bg-slate-950/60 border-t border-white/5">
              <div className="relative">
                <input 
                  type="text" 
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                  placeholder="询问小创或讨论..." 
                  className="w-full pl-5 pr-14 py-4 bg-white/5 border border-white/5 rounded-2xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/30 text-white placeholder-gray-500 font-bold transition-all"
                />
                <button 
                  onClick={handleSend}
                  className="absolute right-2.5 top-2.5 w-9 h-9 bg-blue-600 text-white rounded-xl flex items-center justify-center hover:bg-blue-700 hover:shadow-[0_0_15px_rgba(37,99,235,0.4)] transition-all active:scale-90"
                >
                  <Send size={14} />
                </button>
              </div>
              <p className="text-[9px] text-gray-600 text-center mt-3 uppercase tracking-widest font-black">
                Powered by ChatBear Dual-Agent Intelligence
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Toggle Button with Glowing Pulse */}
      <div className="relative group">
        <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full blur-lg opacity-40 group-hover:opacity-85 transition duration-1000"></div>
        <button 
          onClick={() => setIsOpen(!isOpen)}
          className={`relative w-16 h-16 rounded-full shadow-2xl flex items-center justify-center border border-white/10 hover:scale-110 transition-all active:scale-95 ${isOpen ? 'bg-blue-600 text-white' : 'bg-slate-900'}`}
        >
          {isOpen ? (
            <X size={26} />
          ) : (
            <img src="/assets/chatbear/白色机器人IP标准设定图.png" alt="小创" className="w-10 h-10 object-contain hover:rotate-6 transition-transform" />
          )}
        </button>
        
        {!isOpen && (
          <div className="absolute bottom-20 right-0 w-72 p-5 bg-slate-950/90 border border-white/10 rounded-2xl shadow-3xl opacity-0 pointer-events-none group-hover:opacity-100 transition-all duration-300">
            <p className="text-xs font-black text-blue-400 mb-2 flex items-center gap-1.5">
              <MessageCircle size={14} /> 导师小创 & 小麦在线
            </p>
            <p className="text-[11px] text-gray-400 leading-relaxed font-bold">
              哈罗！我们在具身实验室等你，如果遇到 Python 报错或想跟我们唠唠，随时点我哦！
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
