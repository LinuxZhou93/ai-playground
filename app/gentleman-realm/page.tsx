"use client";

import React, { useState, useEffect } from 'react';

export default function GentlemanRealm() {
  const [timeStr, setTimeStr] = useState('00:00:00');
  const [reflection, setReflection] = useState('');
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    let startTime = localStorage.getItem('gentleman_start_time');
    if (!startTime) {
      startTime = Date.now().toString();
      localStorage.setItem('gentleman_start_time', startTime);
    }

    const updateTime = () => {
      const diff = Date.now() - parseInt(localStorage.getItem('gentleman_start_time') || Date.now().toString(), 10);
      const h = Math.floor(diff / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      const s = Math.floor((diff % 60000) / 1000);
      setTimeStr(`${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`);
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    
    const savedReflection = localStorage.getItem('gentleman_reflection');
    if (savedReflection) {
      setReflection(savedReflection);
    }

    return () => clearInterval(interval);
  }, []);

  const handleReset = () => {
    if (window.confirm('立志如山，确认重置？')) { 
      const startTime = Date.now().toString(); 
      localStorage.setItem('gentleman_start_time', startTime);
      setTimeStr('00:00:00');
    }
  };

  const handleReflectionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    setReflection(val);
    localStorage.setItem('gentleman_reflection', val);
  };

  if (!isClient) return null; // Avoid hydration mismatch

  return (
    <div 
      className="min-h-screen text-[#f0f0f0] bg-black relative overflow-hidden" 
      style={{ fontFamily: "'Inter', 'Noto Serif SC', serif" }}
    >
      {/* Background Image */}
      <div 
        className="fixed top-0 left-0 w-full h-full -z-10"
        style={{ 
          background: "url('https://images.unsplash.com/photo-1506744038136-46273834b3fb?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80') no-repeat center center",
          backgroundSize: "cover",
          filter: "brightness(0.5)"
        }}
      />

      <div className="relative z-10 min-h-screen max-w-[1600px] mx-auto p-10 grid grid-cols-1 lg:grid-cols-[350px_1fr_350px] gap-5 items-center">
        
        {/* Header */}
        <header className="lg:col-span-3 text-center mb-5 self-start">
          <h1 className="text-5xl font-black tracking-[0.5rem] bg-gradient-to-b from-white to-[#aaa] bg-clip-text text-transparent mt-10">
            君子之境
          </h1>
        </header>

        {/* Left Aside: Rules */}
        <aside className="bg-white/10 backdrop-blur-xl border border-white/15 rounded-3xl p-8 flex flex-col h-[500px] animate-in fade-in slide-in-from-bottom-5 duration-1000">
          <h3 className="text-[#d4af37] text-xl font-semibold mb-4">修身十二条</h3>
          <div className="py-4 border-b border-white/15">
            <span className="text-xs text-[#d4af37] mb-1 block">其一</span>
            <p className="text-sm/relaxed text-white/90">主敬：整齐严肃，无时或懈。</p>
          </div>
          <div className="py-4 border-b border-white/15">
            <span className="text-xs text-[#d4af37] mb-1 block">其二</span>
            <p className="text-sm/relaxed text-white/90">静坐：每日不拘何时，静坐四刻。</p>
          </div>
          <div className="py-4 border-b border-white/15">
            <span className="text-xs text-[#d4af37] mb-1 block">其三</span>
            <p className="text-sm/relaxed text-white/90">早起：黎明即起，醒后勿沾恋。</p>
          </div>
          <div className="py-4 border-b border-white/15">
            <span className="text-xs text-[#d4af37] mb-1 block">其五</span>
            <p className="text-sm/relaxed text-white/90">谨言：刻刻留心，不妄发议论。</p>
          </div>
        </aside>

        {/* Center Main: Timer */}
        <main className="flex flex-col justify-center items-center text-center">
          <p className="text-[#d4af37] tracking-[5px] text-lg font-medium">正气积累时长</p>
          <div className="text-[5rem] font-extralight my-5" style={{ textShadow: "0 0 30px rgba(255,255,255,0.2)" }}>
            {timeStr}
          </div>
          <button 
            onClick={handleReset}
            className="mt-8 px-10 py-3 bg-transparent border border-[#d4af37] text-[#d4af37] rounded-full cursor-pointer transition-all duration-300 tracking-[2px] hover:bg-[#d4af37] hover:text-black hover:shadow-[0_0_20px_rgba(212,175,55,0.4)]"
          >
            重新立志
          </button>
        </main>

        {/* Right Aside: Reflection */}
        <aside className="bg-white/10 backdrop-blur-xl border border-white/15 rounded-3xl p-8 flex flex-col h-[500px] animate-in fade-in slide-in-from-bottom-5 duration-1000">
          <h3 className="text-[#d4af37] text-xl font-semibold mb-4">日知其所亡</h3>
          <textarea 
            value={reflection}
            onChange={handleReflectionChange}
            className="flex-1 bg-transparent border-none text-[#f0f0f0] text-lg leading-relaxed resize-none outline-none mt-5 placeholder:text-white/30"
            placeholder="在此静心输入..."
            style={{ fontFamily: "'Noto Serif SC', serif" }}
          />
        </aside>

      </div>
    </div>
  );
}
