'use client';

import React, { useState, useEffect, useRef } from 'react';

interface CodeRunnerProps {
  initialCode?: string;
  timeoutMs?: number; // Supports custom timeout for testing efficiency
}

export default function CodeRunner({ 
  initialCode = '// 在此编写 JavaScript 代码\nconsole.log("Hello, Sandbox!");', 
  timeoutMs = 2000 
}: CodeRunnerProps) {
  const [code, setCode] = useState(initialCode);
  const [output, setOutput] = useState<string[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const workerRef = useRef<Worker | null>(null);

  const runCode = () => {
    if (isRunning) return;

    setIsRunning(true);
    setError(null);
    setOutput([]);

    // Worker code containing sandboxed execution logic and console.log interception
    const workerCode = `
      const logs = [];
      const originalLog = console.log;
      console.log = (...args) => {
        logs.push(args.map(arg => {
          if (arg === null) return 'null';
          if (arg === undefined) return 'undefined';
          if (typeof arg === 'object') {
            try {
              return JSON.stringify(arg);
            } catch(e) {
              return '[Object]';
            }
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

      // Set timeout fallback
      const timeoutId = setTimeout(() => {
        if (workerRef.current === worker) {
          worker.terminate();
          setIsRunning(false);
          setError(`执行超时：代码运行时间超过 ${timeoutMs / 1000} 秒，已被强行终止。`);
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
        worker.terminate();
        workerRef.current = null;
      };

      worker.onerror = (err) => {
        clearTimeout(timeoutId);
        setIsRunning(false);
        setError(err.message || 'Worker 运行时未知错误');
        worker.terminate();
        workerRef.current = null;
      };

      worker.postMessage(code);
    } catch (e: any) {
      setIsRunning(false);
      setError(e.message || '无法初始化 Web Worker 沙箱');
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
    <div className="glass border border-white/10 rounded-2xl p-6 bg-slate-900/50 backdrop-blur-md" data-testid="code-runner">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-bold text-white flex items-center gap-2">
          <span>💻</span> JS 沙箱运行器
        </h3>
        <button
          onClick={runCode}
          disabled={isRunning}
          data-testid="run-btn"
          className={`px-4 py-2 rounded-xl font-bold text-sm transition-all duration-300 ${
            isRunning 
              ? 'bg-gray-700 text-gray-400 cursor-not-allowed' 
              : 'bg-gradient-to-r from-violet-600 to-cyan-500 hover:from-violet-500 hover:to-cyan-400 text-white shadow-lg hover:shadow-cyan-500/20 active:scale-95'
          }`}
        >
          {isRunning ? '运行中...' : '运行代码'}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Code Input Area */}
        <div className="flex flex-col">
          <label className="text-xs text-gray-400 mb-1.5 font-semibold">代码输入</label>
          <textarea
            value={code}
            onChange={(e) => setCode(e.target.value)}
            data-testid="code-input"
            className="flex-1 min-h-[160px] bg-black/60 border border-white/10 rounded-xl p-4 text-sm font-mono text-gray-200 focus:outline-none focus:border-cyan-500/50 resize-y leading-relaxed"
            placeholder="// 输入您的 JavaScript 代码..."
          />
        </div>

        {/* Console Output Area */}
        <div className="flex flex-col">
          <label className="text-xs text-gray-400 mb-1.5 font-semibold">输出控制台</label>
          <div
            data-testid="console-output"
            className="flex-1 min-h-[160px] bg-black/80 border border-white/10 rounded-xl p-4 text-xs font-mono overflow-y-auto max-h-[240px] text-green-400 leading-relaxed"
          >
            {error && (
              <div data-testid="console-error" className="text-rose-400 mb-2 font-semibold">
                {error}
              </div>
            )}
            {output.length === 0 && !error ? (
              <span className="text-gray-600">// 点击右上角“运行代码”查看输出</span>
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
  );
}
