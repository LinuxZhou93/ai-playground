'use client';

import React, { useState, useEffect, useRef } from 'react';
import Header from '@/components/chatbear/Header';
import AiAssistant from '@/components/chatbear/AiAssistant';
import { Terminal, Play, Save, Share2, Code2, Loader2, RefreshCw } from 'lucide-react';
import Editor from '@monaco-editor/react';
import { loadPyodideEnvironment } from '@/lib/chatbear/pyodide';
import SimVisualizer from '@/components/chatbear/SimVisualizer';
import './../chatbear.css';

const CODE_SAMPLES = {
  apple: `import chatbear as cb
from chatbear.eai import RobotAgent

# 初始化具身智能小创机器人
agent = RobotAgent(name="Xiao Chuang")

def on_vision_data(data):
    if data.object_name == "Apple":
        agent.say("检测到红苹果！位置: " + str(data.position))
        # 执行平滑移动抓取指令
        agent.move_to(data.position)

# 开启雷达视觉感知
agent.start_perception(callback=on_vision_data)
`,
  avoidance: `import chatbear as cb
from chatbear.eai import RobotAgent

agent = RobotAgent(name="Xiao Chuang")

# 启动雷达扫描
agent.start_perception(lambda d: None)

agent.say("避障系统初始化成功。正在巡线...")
# 模拟执行边缘规避
agent.move_to([40.0, 25.0, 0.0])
agent.say("发现边缘！紧急规避。")
agent.move_to([20.0, 75.0, 0.0])
`,
  dialog: `import chatbear as cb
from chatbear.eai import RobotAgent

agent = RobotAgent(name="Xiao Chuang")

# 智能对话移动示例
agent.say("小麦，我正在用 Python 控制我的钢铁底盘！")
agent.move_to([50.0, 50.0, 0.0])
agent.say("你看！我已经平移到了网格中心点 (50, 50)！")
`
};

export default function LabPage() {
  const [code, setCode] = useState(CODE_SAMPLES.apple);
  const [logs, setLogs] = useState<string[]>(['[System] 初始化雷达控制台...']);
  const [isPyodideLoading, setIsPyodideLoading] = useState(true);
  const [isRunning, setIsRunning] = useState(false);
  const pyodideRef = useRef<any>(null);
  const consoleEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // 自动滚动控制台到底部
    if (consoleEndRef.current) {
      consoleEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [logs]);

  useEffect(() => {
    let mounted = true;

    async function initPyodide() {
      try {
        setLogs(prev => [...prev, '[System] 正在下载 Python 运行时环境 (Pyodide WebAssembly)...']);
        
        const pyodide = await loadPyodideEnvironment((msg) => {
          if (mounted) {
            setLogs(prev => [...prev, `> ${msg}`]);
          }
        });
        
        if (mounted && pyodide) {
          pyodideRef.current = pyodide;
          setLogs(prev => [...prev, '[System] Python 3.11 环境就绪，3D 仿真物理接口桥接成功。']);
          setIsPyodideLoading(false);
        }
      } catch (err: any) {
        if (mounted) {
          setLogs(prev => [...prev, `[System Error] 加载失败: ${err.message}`]);
          setIsPyodideLoading(false);
        }
      }
    }

    initPyodide();

    return () => { mounted = false; };
  }, []);

  const handleRunCode = async () => {
    if (!pyodideRef.current) {
      setLogs(prev => [...prev, '[System Error] Python 环境尚未就绪，请等待 Wasm 加载完毕。']);
      return;
    }

    if (isRunning) return;

    setIsRunning(true);
    setLogs(prev => [...prev, '\n[System] 开始执行 Python 程序...']);

    try {
      // 捕获可能的前端重置
      if ((window as any).onRobotReset) {
        (window as any).onRobotReset();
      }
      await pyodideRef.current.runPythonAsync(code);
      setLogs(prev => [...prev, '[System] Python 进程执行完毕。']);
    } catch (err: any) {
      setLogs(prev => [...prev, `[Python 报错]\n${err.message}`]);
    } finally {
      setIsRunning(false);
    }
  };

  const handleClearLogs = () => {
    setLogs(['[System] 控制台已清空。']);
  };

  const handleResetSim = () => {
    if ((window as any).onRobotReset) {
      (window as any).onRobotReset();
      setLogs(prev => [...prev, '[System] 物理世界已成功重置。']);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />
      
      <main className="flex-1 flex flex-col lg:flex-row overflow-hidden h-[calc(100vh-80px)]">
        {/* Editor Sidebar / Files & Samples */}
        <aside className="w-full lg:w-80 bg-white border-r border-gray-100 flex flex-col shrink-0">
          <div className="p-6 border-b border-gray-100">
            <h2 className="text-sm font-black text-gray-900 uppercase tracking-widest flex items-center gap-2">
              <Code2 size={16} className="text-blue-500" /> 项目管理
            </h2>
          </div>
          
          {/* File Explorer */}
          <div className="p-4 border-b border-gray-50 bg-gray-50/20">
            <div className="space-y-1">
              {['main.py', 'robot_config.json', 'perception.py'].map((file, i) => (
                <div key={i} className={`px-4 py-2.5 rounded-xl text-xs cursor-pointer flex items-center gap-3 ${i === 0 ? 'bg-blue-50 text-blue-700 font-black' : 'text-gray-500 hover:bg-gray-50'}`}>
                   <div className="w-1.5 h-1.5 bg-current rounded-full" />
                   {file}
                </div>
              ))}
            </div>
          </div>

          {/* Quick Samples Section */}
          <div className="p-6 border-b border-gray-100 flex-1 overflow-y-auto">
            <h3 className="text-[11px] font-black text-gray-400 uppercase tracking-widest mb-4">快捷代码样例库</h3>
            <div className="space-y-3">
              <button 
                onClick={() => setCode(CODE_SAMPLES.apple)}
                className={`w-full text-left p-3.5 border rounded-2xl text-xs font-bold transition-all flex flex-col gap-1.5 ${code === CODE_SAMPLES.apple ? 'border-blue-500 bg-blue-50/20 text-blue-800' : 'border-gray-100 bg-white hover:border-gray-300 text-gray-700'}`}
              >
                <div className="flex justify-between items-center w-full">
                  <span>🍎 视觉寻找苹果</span>
                  <span className="text-[9px] text-blue-500 bg-blue-50/80 px-1.5 py-0.5 rounded font-black">L1 入门</span>
                </div>
                <p className="text-[10px] text-gray-400 font-medium leading-relaxed">调用激光雷达扫描寻找前方 Apple 并执行自动抓取。</p>
              </button>
              
              <button 
                onClick={() => setCode(CODE_SAMPLES.avoidance)}
                className={`w-full text-left p-3.5 border rounded-2xl text-xs font-bold transition-all flex flex-col gap-1.5 ${code === CODE_SAMPLES.avoidance ? 'border-purple-500 bg-purple-50/20 text-purple-800' : 'border-gray-100 bg-white hover:border-gray-300 text-gray-700'}`}
              >
                <div className="flex justify-between items-center w-full">
                  <span>🛡️ 避障与边缘规避</span>
                  <span className="text-[9px] text-purple-500 bg-purple-50/80 px-1.5 py-0.5 rounded font-black">L2 进阶</span>
                </div>
                <p className="text-[10px] text-gray-400 font-medium leading-relaxed">测试机器人对激光测距障碍的传感器检测与轨迹路线微调。</p>
              </button>

              <button 
                onClick={() => setCode(CODE_SAMPLES.dialog)}
                className={`w-full text-left p-3.5 border rounded-2xl text-xs font-bold transition-all flex flex-col gap-1.5 ${code === CODE_SAMPLES.dialog ? 'border-emerald-500 bg-emerald-50/20 text-emerald-800' : 'border-gray-100 bg-white hover:border-gray-300 text-gray-700'}`}
              >
                <div className="flex justify-between items-center w-full">
                  <span>💬 智能语音与移动</span>
                  <span className="text-[9px] text-emerald-500 bg-emerald-50/80 px-1.5 py-0.5 rounded font-black">L1 启蒙</span>
                </div>
                <p className="text-[10px] text-gray-400 font-medium leading-relaxed">让机器人在移动到特定坐标时执行同步气泡对话。</p>
              </button>
            </div>
          </div>

          <div className="p-6 border-t border-gray-100 bg-gray-50/50">
             <div className="bg-yellow-50/60 p-4.5 rounded-2xl border border-yellow-100 flex gap-3">
                <div className="w-10 h-10 rounded-full overflow-hidden shrink-0 border-2 border-white shadow-sm bg-white">
                   <img src="/assets/chatbear/周小麦IP标准设定图.png" alt="小麦" className="w-full h-full object-cover scale-150 translate-y-1.5" />
                </div>
                <p className="text-[10px] text-yellow-800 leading-relaxed font-bold">
                  <span className="font-black block mb-1">小麦探索日记：</span>
                  你可以在左侧选择不同的样例加载，然后点击右上角蓝色的“运行仿真”按钮看看我的表现！
                </p>
             </div>
          </div>
        </aside>

        {/* Code Editor & Simulation Area */}
        <div className="flex-1 flex flex-col min-w-0">
          
          {/* Toolbar */}
          <div className="h-16 bg-white border-b border-gray-100 px-6 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-4">
              <span className="text-xs font-black text-gray-900 bg-gray-100 px-3 py-1 rounded-lg">工程: MyFirstRobot</span>
              <div className="h-4 w-px bg-gray-200"></div>
              <div className="flex items-center gap-2 text-xs font-bold">
                {isPyodideLoading ? (
                  <div className="flex items-center gap-1.5 text-blue-600">
                    <Loader2 size={14} className="animate-spin" />
                    Wasm 引擎初始化中...
                  </div>
                ) : (
                  <div className="flex items-center gap-1.5 text-emerald-600">
                    <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-pulse"></div>
                    <span>EAI 仿真环境联通就绪</span>
                  </div>
                )}
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <button onClick={handleResetSim} className="p-2.5 text-gray-400 hover:text-black rounded-xl hover:bg-gray-50 transition-colors" title="重置物理沙盒">
                <RefreshCw size={18} />
              </button>
              <button className="p-2.5 text-gray-400 hover:text-black rounded-xl hover:bg-gray-50 transition-colors"><Save size={18} /></button>
              <button className="p-2.5 text-gray-400 hover:text-black rounded-xl hover:bg-gray-50 transition-colors"><Share2 size={18} /></button>
              
              <button 
                onClick={handleRunCode}
                disabled={isPyodideLoading || isRunning}
                className="px-6 py-2.5 bg-blue-600 text-white rounded-xl font-black text-xs flex items-center gap-2 hover:bg-blue-700 disabled:bg-gray-300 transition-all shadow-lg shadow-blue-500/10 active:scale-95 disabled:active:scale-100"
              >
                {isRunning ? <Loader2 size={14} className="animate-spin" /> : <Play size={14} fill="currentColor" />}
                {isRunning ? '正在执行...' : '运行仿真'}
              </button>
            </div>
          </div>

          {/* Editor + Simulation Canvas Sandbox */}
          <div className="flex-1 flex flex-col lg:flex-row min-h-0">
            {/* Editor Area */}
            <div className="flex-1 bg-[#1e1e1e] relative min-h-[300px]">
               <Editor
                 height="100%"
                 defaultLanguage="python"
                 theme="vs-dark"
                 value={code}
                 onChange={(value) => setCode(value || '')}
                 options={{
                   minimap: { enabled: false },
                   fontSize: 14,
                   fontFamily: 'var(--font-mono), monospace',
                   lineHeight: 24,
                   padding: { top: 16 },
                   scrollBeyondLastLine: false,
                   tabSize: 4,
                 }}
               />
            </div>

            {/* Simulation Canvas View */}
            <div className="w-full lg:w-[45%] bg-[#07080a] relative border-l border-gray-100/5 min-h-[300px] flex flex-col">
              <SimVisualizer />
            </div>
          </div>

          {/* Upgraded Cyberpunk Console Terminal Area */}
          <div className="h-56 bg-[#07080a] border-t border-white/5 flex flex-col shrink-0">
             <div className="px-6 py-2.5 border-b border-white/5 flex items-center justify-between bg-black/40 shrink-0">
                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                  <Terminal size={14} className="text-emerald-500" /> 控制台输出终端
                </span>
                <button onClick={handleClearLogs} className="text-[10px] font-black text-gray-400 hover:text-emerald-400 uppercase tracking-wide transition-colors">清空</button>
             </div>
             
             <div className="flex-1 overflow-y-auto p-5 font-mono text-[12px] text-emerald-400/90 bg-[#090a0f] space-y-1.5">
                {logs.map((log, i) => (
                  <div 
                    key={i} 
                    className={`whitespace-pre-wrap leading-relaxed ${
                      log.includes('Error') || log.includes('报错') 
                        ? 'text-red-400 font-bold drop-shadow-[0_0_8px_rgba(239,68,68,0.2)]' 
                        : log.includes('System') 
                          ? 'text-blue-400 font-semibold' 
                          : log.startsWith('>') 
                            ? 'text-gray-400' 
                            : 'text-emerald-400 drop-shadow-[0_0_8px_rgba(16,185,129,0.1)]'
                    }`}
                  >
                    {log}
                  </div>
                ))}
                <div ref={consoleEndRef} />
             </div>
          </div>
        </div>
      </main>

      <AiAssistant />
    </div>
  );
}
