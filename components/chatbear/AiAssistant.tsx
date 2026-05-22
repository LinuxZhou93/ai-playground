'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, X, Send, Minus } from 'lucide-react';

export default function AiAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: 'assistant', content: '嗨！我是小创。如果在学习“具身智能”时有任何不懂的概念，或者需要代码建议，随时可以问我哦！' }
  ]);
  const [input, setInput] = useState('');

  const handleSend = () => {
    if (!input.trim()) return;
    
    const newMessages = [...messages, { role: 'user', content: input }];
    setMessages(newMessages);
    setInput('');

    // Simulate AI response
    setTimeout(() => {
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: `你问得太棒了！关于“${input}”，我的理解是：这是具身智能中非常核心的一个环节。你想听听周小麦在做项目时是怎么处理这个问题的吗？` 
      }]);
    }, 1000);
  };

  return (
    <div className="fixed bottom-8 right-8 z-[100]">
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            className="absolute bottom-20 right-0 w-[400px] h-[600px] bg-white rounded-[2rem] shadow-2xl border border-blue-50 flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="p-6 bg-gradient-to-r from-blue-600 to-cyan-500 text-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center border border-white/30">
                  <img src="/assets/chatbear/白色机器人IP标准设定图.png" alt="小创" className="w-6 h-6 object-contain" />
                </div>
                <div>
                  <h3 className="font-bold text-sm">小创 (Xiao Chuang)</h3>
                  <p className="text-[10px] opacity-80 uppercase tracking-widest font-black">AI Tutor & EAI Guide</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => setIsOpen(false)} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                  <Minus size={18} />
                </button>
                <button onClick={() => setIsOpen(false)} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* Chat Area */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-gray-50/50">
              {messages.map((msg, i) => (
                <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[85%] p-4 rounded-2xl text-sm leading-relaxed ${
                    msg.role === 'user' 
                      ? 'bg-blue-600 text-white rounded-tr-none shadow-lg' 
                      : 'bg-white text-gray-800 rounded-tl-none shadow-sm border border-gray-100'
                  }`}>
                    {msg.content}
                  </div>
                </div>
              ))}
            </div>

            {/* Input Area */}
            <div className="p-4 bg-white border-t border-gray-100">
              <div className="relative">
                <input 
                  type="text" 
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                  placeholder="询问小创..." 
                  className="w-full pl-4 pr-12 py-4 bg-gray-50 border border-gray-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
                />
                <button 
                  onClick={handleSend}
                  className="absolute right-2 top-2 w-10 h-10 bg-blue-600 text-white rounded-lg flex items-center justify-center hover:bg-blue-700 transition-colors"
                >
                  <Send size={18} />
                </button>
              </div>
              <p className="text-[10px] text-gray-400 text-center mt-3 uppercase tracking-tighter font-bold">
                Powered by ChatBear Intelligence
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Toggle Button */}
      <div className="relative group">
        <div className="absolute -inset-1 bg-gradient-to-r from-blue-400 to-cyan-400 rounded-full blur opacity-40 group-hover:opacity-70 transition duration-1000"></div>
        <button 
          onClick={() => setIsOpen(!isOpen)}
          className={`relative w-16 h-16 rounded-full shadow-2xl flex items-center justify-center border border-blue-100 hover:scale-110 transition-transform active:scale-95 ${isOpen ? 'bg-blue-600 text-white' : 'bg-white'}`}
        >
          {isOpen ? (
            <X size={28} />
          ) : (
            <img src="/assets/chatbear/白色机器人IP标准设定图.png" alt="小创" className="w-10 h-10 object-contain" />
          )}
        </button>
        {!isOpen && (
          <div className="absolute bottom-20 right-0 w-64 p-4 bg-white rounded-2xl shadow-2xl border border-gray-100 opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity">
            <p className="text-xs font-bold text-blue-500 mb-2 flex items-center gap-2">
              <MessageSquare size={12} /> 小创助手在线
            </p>
            <p className="text-[11px] text-gray-600 leading-relaxed">
              嗨！我是小创。如果在学习过程中有任何疑问，随时点我哦！
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
