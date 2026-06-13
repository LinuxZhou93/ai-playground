'use client';

import React, { useState, useEffect, useRef } from 'react';

export default function CourseDetailsPage({ params }: { params: { id: string } }) {
  const courseTitle = `课程 #${params.id}：JavaScript 高级编程`;
  const courseDesc = "欢迎来到本期课程！通过右侧的代码沙箱，你可以直接编写、修改并安全执行 JavaScript 案例，实时观察控制台输出与返回值。";
  
  const [code, setCode] = useState('// 在这里编写您的 JS 代码\nconsole.log("沙箱运行成功！");\nreturn 100 + 200;');
  const [output, setOutput] = useState<string[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showResult, setShowResult] = useState(false);
  
  const workerRef = useRef<Worker | null>(null);
  const timeoutMs = 2000;

  const runCode = () => {
    if (isRunning) return;

    setIsRunning(true);
    setError(null);
    setOutput([]);
    setShowResult(false);

    const workerCode = `
      const logs = [];
      const originalLog = console.log;
      console.log = (...args) => {
        logs.push(args.map(arg => {
          if (arg === null) return 'null';
          if (arg === undefined) return 'undefined';
          if (typeof arg === 'object') {
            try { return JSON.stringify(arg); } catch(e) { return '[Object]'; }
          }
          return String(arg);
        }).join(' '));
        originalLog(...args);
      };

      self.onmessage = function(e) {
        try {
          const userCode = e.data;
          const result = new Function(userCode)();
          self.postMessage({ success: true, logs, result: result !== undefined ? String(result) : undefined });
        } catch (err) {
          self.postMessage({ success: false, error: err.message, logs });
        }
      };
    `;

    try {
      const blob = new Blob([workerCode], { type: 'application/javascript' });
      const workerUrl = URL.createObjectURL(blob);
      const worker = new Worker(workerUrl);
      workerRef.current = worker;

      const timeoutId = setTimeout(() => {
        if (workerRef.current === worker) {
          worker.terminate();
          setIsRunning(false);
          setError(`执行超时：代码运行时间超过 ${timeoutMs / 1000} 秒，已被终止。`);
          setShowResult(true);
          workerRef.current = null;
        }
      }, timeoutMs);

      worker.onmessage = (e) => {
        clearTimeout(timeoutId);
        setIsRunning(false);
        const { success, logs, result, error: runError } = e.data;
        
        const newOutput = logs && logs.length > 0 ? [...logs] : [];
        if (success) {
          if (result !== undefined) {
            newOutput.push(`返回值: ${result}`);
          }
        } else {
          setError(runError || '执行错误');
        }
        setOutput(newOutput);
        setShowResult(true);
        worker.terminate();
        workerRef.current = null;
      };

      worker.onerror = (err) => {
        clearTimeout(timeoutId);
        setIsRunning(false);
        setError(err.message || 'Worker 运行时错误');
        setShowResult(true);
        worker.terminate();
        workerRef.current = null;
      };

      worker.postMessage(code);
    } catch (e: any) {
      setIsRunning(false);
      setError(e.message || '初始化沙箱失败');
      setShowResult(true);
    }
  };

  useEffect(() => {
    return () => {
      if (workerRef.current) {
        workerRef.current.terminate();
      }
    };
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 text-white p-8">
      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="flex flex-col justify-center space-y-6">
          <h1 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-cyan-400">
            {courseTitle}
          </h1>
          <p className="text-slate-300 text-lg leading-relaxed">
            {courseDesc}
          </p>
          <div className="p-4 bg-slate-900/60 border border-white/10 rounded-2xl">
            <h4 className="font-semibold text-cyan-400 mb-2">💡 安全运行沙箱提示</h4>
            <ul className="text-sm text-slate-400 list-disc list-inside space-y-1">
              <li>沙箱运行在独立的 Web Worker 线程中，完全隔绝 DOM 与 window</li>
              <li>运行环境设定有 2 秒的强制超时监控，防范死循环攻击</li>
            </ul>
          </div>
        </div>

        <div className="p-6 bg-slate-900/60 backdrop-blur-md border border-white/10 rounded-2xl flex flex-col space-y-4 shadow-xl" data-testid="code-sandbox-card">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-green-500 animate-ping"></span>
              代码实践沙箱
            </h2>
            <button
              onClick={runCode}
              disabled={isRunning}
              data-testid="run-button"
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-extrabold text-sm transition-all duration-300 ${
                isRunning
                  ? 'bg-slate-800 text-slate-400 cursor-not-allowed border border-white/5 animate-pulse'
                  : 'bg-gradient-to-r from-violet-600 to-cyan-500 hover:from-violet-500 hover:to-cyan-400 text-white shadow-lg hover:shadow-cyan-500/20 active:scale-95'
              }`}
            >
              {isRunning && (
                <svg className="animate-spin h-4 w-4 text-slate-400" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
              )}
              {isRunning ? '正在沙箱中执行...' : '执行代码'}
            </button>
          </div>

          <div className="flex flex-col space-y-1.5">
            <label className="text-xs text-slate-400 font-semibold">用户代码编辑</label>
            <textarea
              value={code}
              onChange={(e) => setCode(e.target.value)}
              data-testid="editor-textarea"
              className="w-full h-44 bg-black/60 border border-white/10 rounded-xl p-4 text-sm font-mono text-slate-100 focus:outline-none focus:border-cyan-500/60 resize-none leading-relaxed"
              placeholder="// 请输入您的代码..."
            />
          </div>

          <div className="flex flex-col space-y-1.5">
            <label className="text-xs text-slate-400 font-semibold">沙箱输出反馈</label>
            <div
              data-testid="output-console"
              className={`w-full min-h-[120px] max-h-[200px] bg-black/80 border border-white/10 rounded-xl p-4 text-xs font-mono overflow-y-auto text-green-400 leading-relaxed transition-all duration-500 ${
                showResult ? 'opacity-100 translate-y-0 scale-100' : 'opacity-60 -translate-y-1 scale-98'
              }`}
            >
              {error && (
                <div data-testid="console-error" className="text-rose-400 mb-2 font-semibold">
                  {error}
                </div>
              )}
              {output.length === 0 && !error ? (
                <span className="text-slate-600">// 点击“执行代码”查看反馈输出</span>
              ) : (
                output.map((line, idx) => (
                  <div key={idx} className="whitespace-pre-wrap py-0.5 border-b border-white/5 last:border-0">
                    {line}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
