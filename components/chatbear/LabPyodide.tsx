'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Terminal, Play, Save, Share2, Code2, Layers, Box, Loader2 } from 'lucide-react';
import Editor from '@monaco-editor/react';
import { loadPyodideEnvironment } from '@/lib/chatbear/pyodide';

const DEFAULT_CODE = `import chatbear as cb
from chatbear.eai import RobotAgent

# 初始化机器人角色：小创
agent = RobotAgent(name="Xiao Chuang")

def on_vision_data(data):
    # 检测到物体时的逻辑
    if data.object_name == "Apple":
        agent.move_to(data.position)
        agent.say("发现苹果！开始抓取。")

agent.start_perception(callback=on_vision_data)
`;

export default function LabPyodide() {
  const [code, setCode] = useState(DEFAULT_CODE);
  const [logs, setLogs] = useState<string[]>(['[System] 初始化控制台...']);
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
        setLogs(prev => [...prev, '[System] 正在下载 Python 运行时环境 (Pyodide)...']);
        
        const pyodide = await loadPyodideEnvironment((msg) => {
          if (mounted) {
            setLogs(prev => [...prev, `> ${msg}`]);
          }
        });
        
        if (mounted && pyodide) {
          pyodideRef.current = pyodide;
          setLogs(prev => [...prev, '[System] Python 环境就绪，3D 仿真接口已连接。']);
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
      setLogs(prev => [...prev, '[System Error] Python 环境尚未就绪。']);
      return;
    }

    if (isRunning) return;

    setIsRunning(true);
    setLogs(prev => [...prev, '\n[System] 开始运行仿真...']);

    try {
      await pyodideRef.current.runPythonAsync(code);
      setLogs(prev => [...prev, '[System] 运行结束。']);
    } catch (err: any) {
      setLogs(prev => [...prev, `[Python Error]\n${err.message}`]);
    } finally {
      setIsRunning(false);
    }
  };

  const handleClearLogs = () => {
    setLogs(['[System] 控制台已清空。']);
  };

  return (
    <div className="flex-1 flex flex-col lg:flex-row overflow-hidden border border-gray-100 rounded-3xl bg-white shadow-sm min-h-[500px]">
      {/* Editor Sidebar / Files */}
      <aside className="w-full lg:w-64 bg-white border-b lg:border-b-0 lg:border-r border-gray-100 flex flex-col shrink-0">
        <div className="p-6 border-b border-gray-100">
          <h2 className="text-xs font-black text-gray-900 uppercase tracking-widest flex items-center gap-2">
            <Code2 size={15} className="text-blue-500" /> 项目文件 (Files)
          </h2>
        </div>
        <div className="flex-1 overflow-y-auto p-4">
          <div className="space-y-1">
            {['main.py', 'robot_config.json', 'perception.py'].map((file, i) => (
              <div key={i} className={`px-4 py-2 rounded-xl text-xs cursor-pointer flex items-center gap-3 ${i === 0 ? 'bg-blue-50 text-blue-700 font-bold' : 'text-gray-500 hover:bg-gray-50'}`}>
                 <div className="w-1.5 h-1.5 bg-current rounded-full" />
                 {file}
              </div>
            ))}
          </div>
        </div>
        <div className="p-6 border-t border-gray-100">
           <div className="bg-yellow-50 p-4 rounded-2xl border border-yellow-100 flex gap-3">
              <div className="w-10 h-10 rounded-full overflow-hidden shrink-0 border border-white shadow-sm">
                 <img src="/assets/chatbear/周小麦IP标准设定图.png" alt="小麦" className="w-full h-full object-cover scale-150 translate-y-1.5" />
              </div>
              <p className="text-[9px] text-yellow-800 leading-normal">
                <span className="font-bold block mb-1">小麦提示：</span>
                你可以修改右侧的代码，然后点击右上角的“运行仿真”查看控制台输出！
              </p>
           </div>
        </div>
      </aside>

      {/* Code Editor & Simulation Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Toolbar */}
        <div className="h-14 bg-white border-b border-gray-100 px-6 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-4">
            <span className="text-xs font-bold text-gray-400">项目: MyFirstRobot</span>
            <div className="h-4 w-px bg-gray-200"></div>
            <div className="flex items-center gap-2 text-xs font-medium text-gray-500">
              {isPyodideLoading ? (
                <>
                  <Loader2 size={12} className="animate-spin text-blue-500" />
                  加载环境中...
                </>
              ) : (
                <>
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-green-600 font-semibold text-[11px]">Python 环境就绪</span>
                </>
              )}
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button className="p-2 text-gray-400 hover:text-black transition-colors"><Save size={18} /></button>
            <button className="p-2 text-gray-400 hover:text-black transition-colors"><Share2 size={18} /></button>
            <button 
              onClick={handleRunCode}
              disabled={isPyodideLoading || isRunning}
              className="px-5 py-2 bg-blue-600 text-white rounded-xl font-bold text-xs flex items-center gap-1.5 hover:bg-blue-700 disabled:bg-gray-400 transition-all shadow-md shadow-blue-500/10 active:scale-95"
            >
              {isRunning ? <Loader2 size={12} className="animate-spin" /> : <Play size={12} fill="currentColor" />}
              {isRunning ? '正在运行...' : '运行仿真'}
            </button>
          </div>
        </div>

        {/* Editor + 3D View */}
        <div className="flex-1 flex flex-col lg:flex-row min-h-0">
          {/* Editor Area */}
          <div className="flex-1 bg-[#1e1e1e] relative pt-4 min-h-[250px]">
             <Editor
               height="100%"
               defaultLanguage="python"
               theme="vs-dark"
               value={code}
               onChange={(value) => setCode(value || '')}
               options={{
                 minimap: { enabled: false },
                 fontSize: 13,
                 fontFamily: 'var(--font-mono), monospace',
                 lineHeight: 22,
                 padding: { top: 12 },
                 scrollBeyondLastLine: false,
               }}
             />
          </div>

          {/* Simulation View (Mockup) */}
          <div className="w-full lg:w-[42%] bg-black relative border-t lg:border-t-0 lg:border-l border-white/5 min-h-[200px]">
            <div className="absolute inset-0 flex items-center justify-center">
               <div className="text-center">
                  <div className="relative inline-block mb-4">
                     <div className="absolute -inset-6 bg-blue-500/15 rounded-full blur-2xl animate-pulse"></div>
                     <Box size={60} className="text-white/20" />
                  </div>
                  <p className="text-white/40 text-xs font-bold tracking-widest uppercase">3D 仿真视窗开发中</p>
                  <p className="text-white/20 text-[10px] mt-1">控制台输出已可用</p>
               </div>
            </div>
            
            {/* Overlay HUD */}
            <div className="absolute top-4 left-4 flex flex-col gap-2">
               <div className="px-3 py-1 bg-black/40 backdrop-blur-md border border-white/10 rounded-full text-[9px] text-white/80 font-bold flex items-center gap-1.5">
                  <Layers size={10} /> 物体检测: {isRunning ? <span className="text-green-400">进行中</span> : '待命'}
               </div>
            </div>
          </div>
        </div>

        {/* Console Area */}
        <div className="h-40 bg-white border-t border-gray-100 flex flex-col shrink-0">
           <div className="px-6 py-2 border-b border-gray-50 flex items-center justify-between bg-gray-50/50 shrink-0">
              <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                <Terminal size={14} /> 控制台输出 (Stdout)
              </span>
              <button onClick={handleClearLogs} className="text-[10px] font-bold text-gray-400 hover:text-black">清空</button>
           </div>
           <div className="flex-1 overflow-y-auto p-4 font-mono text-[11px] text-gray-700 bg-gray-50/60 shadow-inner">
              {logs.map((log, i) => (
                <div key={i} className={`whitespace-pre-wrap ${log.includes('Error') ? 'text-red-500 font-bold' : log.includes('System') ? 'text-blue-500' : ''}`}>
                  {log}
                </div>
              ))}
              <div ref={consoleEndRef} />
           </div>
        </div>
      </div>
    </div>
  );
}
