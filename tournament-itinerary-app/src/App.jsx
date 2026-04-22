import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ShieldAlert, 
  Cpu, 
  MapPin, 
  Plane, 
  Calendar, 
  Users, 
  Info, 
  ChevronRight, 
  Lock, 
  Unlock,
  Printer,
  Maximize2,
  CheckCircle2,
  PhoneCall,
  Clock
} from 'lucide-react';

const ITINERARY_DATA = {
  title: "2026世界锦标赛 (科技竞赛)",
  location: "Dallas, USA / 达拉斯, 美国",
  date: "2026.04.20 - 2026.04.30",
  status: "MISSION ACTIVE",
  roster: [
    { name: "张教练", role: "带队教练", id: "001" },
    { name: "李程序", role: "程序手", id: "002" },
    { name: "王搭建", role: "搭建手", id: "003" },
    { name: "赵操作", role: "操作手", id: "004" },
  ],
  schedule: [
    { date: "Day 1 (04.20)", event: "抵达/报到", desc: "抵达达拉斯，前往酒店驻扎，调试机器。" },
    { date: "Day 2 (04.21)", event: "练习赛", desc: "正式练习赛，场地适应性训练。" },
    { date: "Day 3 (04.22)", event: "资格赛", desc: "资格赛开始，全天高强度比赛。" },
    { date: "Day 4 (04.23)", event: "决赛/颁奖", desc: "淘汰赛及总决赛，闭幕式颁奖。" },
  ]
};

function App() {
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [passcode, setPasscode] = useState('');
  const [error, setError] = useState('');

  const handleUnlock = (e) => {
    e.preventDefault();
    if (passcode === '123456') { // 演示默认密码
      setIsUnlocked(true);
      setError('');
    } else {
      setError('SYSTEM DENIED: 凭证无效，请重试');
    }
  };

  return (
    <div className="min-h-screen p-4 md:p-8 max-w-4xl mx-auto relative overflow-hidden">
      {/* Background Subtle Elements */}
      <div className="fixed inset-0 pointer-events-none opacity-20">
        <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-cyber-blue rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[400px] h-[400px] bg-cyber-orange rounded-full blur-[100px]" />
      </div>

      {/* Header */}
      <header className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-cyber-blue mb-2">
            <Cpu size={20} className="animate-pulse" />
            <span className="font-mono text-xs tracking-[0.3em] uppercase">Mission Control Center</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-white mb-2 italic">
            {ITINERARY_DATA.title}
          </h1>
          <div className="flex items-center gap-4 text-slate-400 font-mono text-sm leading-relaxed">
            <div className="flex items-center gap-1.5"><MapPin size={14} className="text-cyber-blue" />{ITINERARY_DATA.location}</div>
            <div className="flex items-center gap-1.5"><Calendar size={14} className="text-cyber-green" />{ITINERARY_DATA.date}</div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button className="tech-button-primary bg-cyber-panel/40 border-slate-700 text-slate-400 h-10 px-4 w-fit flex items-center justify-center">
            <Printer size={16} />
          </button>
          <div className="px-4 py-1.5 rounded bg-cyber-blue/10 border border-cyber-blue/30 text-cyber-blue font-mono text-xs animate-pulse">
            {ITINERARY_DATA.status}
          </div>
        </div>
      </header>

      {/* Grid Content */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* Roster Panel */}
        <section className="glass-panel p-6 relative overflow-hidden group">
          <div className="scan-line" />
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <Users className="text-cyber-blue" size={20} />
              <h2 className="text-lg font-bold">战队编制</h2>
            </div>
            <span className="tech-badge">Active Team</span>
          </div>
          <div className="space-y-4">
            {ITINERARY_DATA.roster.map(member => (
              <div key={member.name} className="flex items-center justify-between p-3 rounded bg-white/5 border border-white/5 hover:border-cyber-blue/30 transition-colors">
                <span className="text-slate-200">{member.name}</span>
                <span className="font-mono text-[10px] text-cyber-blue/80 bg-cyber-blue/5 px-2 py-0.5 rounded border border-cyber-blue/20">{member.role}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Schedule Highlights */}
        <section className="glass-panel p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <Clock className="text-cyber-green" size={20} />
              <h2 className="text-lg font-bold">核心赛程</h2>
            </div>
            <div className="flex items-center gap-1 text-[10px] font-mono text-cyber-blue italic">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyber-blue opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-cyber-blue"></span>
              </span>
              REALTIME SYNC
            </div>
          </div>
          <div className="space-y-4">
            {ITINERARY_DATA.schedule.map(item => (
              <div key={item.date} className="relative pl-6 before:absolute before:left-0 before:top-2 before:bottom-0 before:w-0.5 before:bg-slate-700">
                <div className="absolute left-[-2px] top-2 h-1.5 w-1.5 rounded-full bg-cyber-green shadow-[0_0_8px_rgba(0,255,157,0.5)]" />
                <p className="text-[10px] font-mono text-cyber-green/70 mb-0.5">{item.date}</p>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm font-bold text-white uppercase italic tracking-wider">{item.event}</span>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* Lock Overlay for Content */}
      <AnimatePresence>
        {!isUnlocked && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="glass-panel border-cyber-orange/30 p-12 mb-8 flex flex-col items-center text-center space-y-6 bg-cyber-orange/5"
          >
            <div className="w-16 h-16 rounded-full bg-cyber-orange/10 flex items-center justify-center border border-cyber-orange/40 text-cyber-orange animate-pulse">
              <Lock size={32} />
            </div>
            <div>
              <h3 className="text-xl font-bold text-cyber-orange mb-2 italic">SYSTEM LOCKED</h3>
              <p className="text-sm text-slate-400 max-w-sm">检测到敏感后勤数据（机票/酒店/个人信息）。请输入授权通行证或护照后六位以继续访问。</p>
            </div>
            <form onSubmit={handleUnlock} className="flex flex-col gap-3 w-full max-w-xs">
              <input 
                type="password"
                value={passcode}
                onChange={(e) => setPasscode(e.target.value)}
                placeholder="AUTHENTICATION PASSCODE"
                className="bg-black/40 border border-slate-700 text-white rounded p-3 text-center font-mono tracking-[0.2em] focus:border-cyber-orange outline-none transition-all"
              />
              {error && <span className="text-[10px] text-cyber-red font-mono uppercase">{error}</span>}
              <button type="submit" className="tech-button-primary border-cyber-orange/50 text-cyber-orange hover:bg-cyber-orange/10 flex items-center justify-center gap-2">
                <Unlock size={14} /> 解码权限
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Protected Unlocked Content */}
      {isUnlocked && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <section className="glass-panel p-6 border-cyber-blue/40">
              <div className="flex items-center gap-2 mb-4">
                <Plane className="text-cyber-blue" />
                <h2 className="text-lg font-bold">机票与大交通</h2>
              </div>
              <div className="bg-black/20 rounded p-4 border border-white/5">
                <div className="flex justify-between items-center mb-4">
                  <div className="text-left">
                    <p className="text-[10px] text-slate-500 font-mono">PEK / 北京</p>
                    <p className="text-2xl font-bold italic text-white">10:25</p>
                  </div>
                  <div className="flex-1 px-4 flex flex-col items-center">
                    <p className="text-[9px] text-cyber-blue font-mono mb-1 tracking-tighter">DL-123 DIRECT</p>
                    <div className="h-0.5 w-full bg-slate-700 relative">
                       <Plane size={12} className="absolute right-0 top-[-5px] text-cyber-blue rotate-90" />
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] text-slate-500 font-mono">DFW / 达拉斯</p>
                    <p className="text-2xl font-bold italic text-white">09:15</p>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-2 pt-4 border-t border-white/10 italic font-mono text-[10px]">
                  <div><span className="text-slate-500">GATE</span> <span className="text-white">C24</span></div>
                  <div><span className="text-slate-500">SEAT</span> <span className="text-white">12A-15B</span></div>
                  <div><span className="text-slate-500">GROUP</span> <span className="text-white">TEAM MONGO</span></div>
                </div>
              </div>
            </section>

            <section className="glass-panel p-6">
              <div className="flex items-center gap-2 mb-6">
                <PhoneCall className="text-cyber-red" size={20} />
                <h2 className="text-lg font-bold italic underline decoration-cyber-red/30 underline-offset-4">应急联络终端</h2>
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 rounded bg-cyber-red/5 border border-cyber-red/10">
                  <div>
                    <p className="text-xs text-white font-bold mb-0.5">王老师 (领队/紧急联系)</p>
                    <p className="text-[10px] text-slate-500 font-mono">+86 138-XXXX-XXXX</p>
                  </div>
                  <button className="h-8 w-8 rounded-full bg-cyber-red/20 flex items-center justify-center text-cyber-red">
                    <PhoneCall size={14} />
                  </button>
                </div>
                <div className="flex items-center justify-between p-3 rounded bg-cyber-blue/5 border border-cyber-blue/10">
                  <div>
                    <p className="text-xs text-white font-bold mb-0.5">当地向导 (Jason)</p>
                    <p className="text-[10px] text-slate-500 font-mono">+1 (XXX) XXX-XXXX</p>
                  </div>
                  <button className="h-8 w-8 rounded-full bg-cyber-blue/20 flex items-center justify-center text-cyber-blue">
                    <PhoneCall size={14} />
                  </button>
                </div>
              </div>
            </section>
          </div>
          
          {/* Equipment Checklist */}
          <section className="glass-panel p-6 mb-8">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <ShieldAlert className="text-cyber-orange" size={20} />
                <h2 className="text-lg font-bold">器材与物资清点</h2>
              </div>
              <span className="text-[10px] font-mono text-slate-500">PRE-MISSION CHECKLIST</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <h4 className="text-xs font-mono text-cyber-blue uppercase mb-3 px-1 border-l-2 border-cyber-blue">比赛器材</h4>
                {['核心控制器 (主/备)', '底盘及搭建备件(机甲类)', '程序笔记本及各种调试线', '大容量电池包 (已过安检认证)'].map(item => (
                  <div key={item} className="flex items-center gap-3 p-2 text-xs text-slate-300">
                    <CheckCircle2 size={16} className="text-slate-600" /> {item}
                  </div>
                ))}
              </div>
              <div className="space-y-2">
                <h4 className="text-xs font-mono text-cyber-orange uppercase mb-3 px-1 border-l-2 border-cyber-orange">个人物资</h4>
                {['有效护照及签证F/B', '酒店确认单(纸质)', '队服/Lab专属工牌', '漫游流量卡及转换插头'].map(item => (
                  <div key={item} className="flex items-center gap-3 p-2 text-xs text-slate-300">
                    <CheckCircle2 size={16} className="text-slate-600" /> {item}
                  </div>
                ))}
              </div>
            </div>
          </section>
        </motion.div>
      )}

      {/* Footer Info */}
      <footer className="text-center py-12 border-t border-white/5 opacity-50">
        <p className="font-mono text-[9px] text-slate-400 tracking-widest uppercase">
          &copy; 2026 Mozi Lab - Special Ops Itinerary System // v1.0.4-RECON
        </p>
      </footer>
    </div>
  );
}

export default App;
