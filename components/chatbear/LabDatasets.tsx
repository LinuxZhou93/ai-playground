'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Database, Play, Loader2, FileSpreadsheet, Terminal, RefreshCw } from 'lucide-react';
import Editor from '@monaco-editor/react';
import { loadPyodideEnvironment } from '@/lib/chatbear/pyodide';

// Predefined datasets
const DATASETS = [
  {
    id: 'vex_telemetry',
    name: 'VEX 机器人电机控制回传 (vex_telemetry.csv)',
    desc: '包含 VEX 机器人行驶时的左/右电机转速、编码器值、超声波避障传感器读数与电压。',
    columns: ['Timestamp(ms)', 'LeftMotorPower', 'RightMotorPower', 'EncoderLeft', 'EncoderRight', 'Ultrasound(cm)', 'Battery(V)'],
    data: [
      { 'Timestamp(ms)': 100, 'LeftMotorPower': 50, 'RightMotorPower': 50, 'EncoderLeft': 10, 'EncoderRight': 10, 'Ultrasound(cm)': 120.4, 'Battery(V)': 7.82 },
      { 'Timestamp(ms)': 200, 'LeftMotorPower': 80, 'RightMotorPower': 80, 'EncoderLeft': 28, 'EncoderRight': 27, 'Ultrasound(cm)': 98.2, 'Battery(V)': 7.79 },
      { 'Timestamp(ms)': 300, 'LeftMotorPower': 100, 'RightMotorPower': 100, 'EncoderLeft': 55, 'EncoderRight': 53, 'Ultrasound(cm)': 72.1, 'Battery(V)': 7.74 },
      { 'Timestamp(ms)': 400, 'LeftMotorPower': 100, 'RightMotorPower': 80, 'EncoderLeft': 82, 'EncoderRight': 76, 'Ultrasound(cm)': 45.8, 'Battery(V)': 7.71 },
      { 'Timestamp(ms)': 500, 'LeftMotorPower': 40, 'RightMotorPower': 20, 'EncoderLeft': 95, 'EncoderRight': 85, 'Ultrasound(cm)': 18.3, 'Battery(V)': 7.68 },
      { 'Timestamp(ms)': 600, 'LeftMotorPower': -50, 'RightMotorPower': -50, 'EncoderLeft': 80, 'EncoderRight': 70, 'Ultrasound(cm)': 35.1, 'Battery(V)': 7.73 }
    ]
  },
  {
    id: 'pbl_grades',
    name: '科创特长生 PBL 综合能力表 (pbl_grades.xlsx)',
    desc: '记录科技特长生在 Scratch 基础、Python 进阶、机器人设计、创造性思维和团队协作五维评分。',
    columns: ['StudentID', 'ScratchGrade', 'PythonGrade', 'RoboticsGrade', 'CreativeThinking', 'Teamwork', 'ProjectResult'],
    data: [
      { 'StudentID': 'S101', 'ScratchGrade': 92, 'PythonGrade': 85, 'RoboticsGrade': 78, 'CreativeThinking': 95, 'Teamwork': 88, 'ProjectResult': '优秀' },
      { 'StudentID': 'S102', 'ScratchGrade': 76, 'PythonGrade': 92, 'RoboticsGrade': 95, 'CreativeThinking': 90, 'Teamwork': 92, 'ProjectResult': '优秀' },
      { 'StudentID': 'S103', 'ScratchGrade': 88, 'PythonGrade': 74, 'RoboticsGrade': 82, 'CreativeThinking': 85, 'Teamwork': 78, 'ProjectResult': '良好' },
      { 'StudentID': 'S104', 'ScratchGrade': 95, 'PythonGrade': 68, 'RoboticsGrade': 70, 'CreativeThinking': 80, 'Teamwork': 95, 'ProjectResult': '良好' },
      { 'StudentID': 'S105', 'ScratchGrade': 80, 'PythonGrade': 78, 'RoboticsGrade': 88, 'CreativeThinking': 88, 'Teamwork': 82, 'ProjectResult': '良好' }
    ]
  }
];

const DEFAULT_PYTHON_CODE = `import json

# 1. 载入前端注入的数据集 JSON 字符串
data = json.loads(raw_json_data)

# 2. 统计平均值
print("📊 [数据处理实验室] 开始统计分析：")
print(f"数据总条数: {len(data)}")

# 计算数值平均值
for col in keys_to_analyze:
    values = [row[col] for row in data if isinstance(row[col], (int, float))]
    if values:
        avg = sum(values) / len(values)
        print(f" - {col} 字段平均值: {avg:.2f}")

print("\n📈 [清洗与预览] 完成。")
`;

export default function LabDatasets() {
  const [selectedDataset, setSelectedDataset] = useState(DATASETS[0]);
  const [pyodide, setPyodide] = useState<any>(null);
  const [isPyodideLoading, setIsPyodideLoading] = useState(true);
  const [isRunning, setIsRunning] = useState(false);
  const [code, setCode] = useState(DEFAULT_PYTHON_CODE);
  const [consoleLogs, setConsoleLogs] = useState<string[]>(['[System] 初始化本地数据终端...']);

  useEffect(() => {
    let mounted = true;
    async function init() {
      try {
        setConsoleLogs(prev => [...prev, '[System] 正在请求浏览器端 Python 运行时环境 (Pyodide)...']);
        const pyEnv = await loadPyodideEnvironment((msg) => {
          if (mounted) {
            setConsoleLogs(prev => [...prev, `> ${msg}`]);
          }
        });

        if (mounted && pyEnv) {
          setPyodide(pyEnv);
          setIsPyodideLoading(false);
          setConsoleLogs(prev => [...prev, '[System] Python 引擎就绪。可以使用 Python 脚本分析数据集！']);
        }
      } catch (err: any) {
        if (mounted) {
          setConsoleLogs(prev => [...prev, `[System Error] 加载失败: ${err.message}`]);
          setIsPyodideLoading(false);
        }
      }
    }
    init();
    return () => { mounted = false; };
  }, []);

  const handleRunPython = async () => {
    if (!pyodide || isRunning) return;

    setIsRunning(true);
    setConsoleLogs(prev => [...prev, `\n[System] 执行数据科学脚本 (Dataset: ${selectedDataset.id})...`]);

    try {
      // 1. 将数据集注入为全局 Python 变量
      pyodide.globals.set('raw_json_data', JSON.stringify(selectedDataset.data));
      
      // 筛选哪些字段属于数值型，作为分析指标
      const numericCols = selectedDataset.columns.filter(col => 
        selectedDataset.data.every(row => typeof row[col] === 'number')
      );
      pyodide.globals.set('keys_to_analyze', pyodide.toPy(numericCols));

      // 2. 执行代码
      await pyodide.runPythonAsync(code);
      setConsoleLogs(prev => [...prev, '[System] 脚本运行成功。']);
    } catch (err: any) {
      setConsoleLogs(prev => [...prev, `[Python Error]\n${err.message}`]);
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Top: Dataset Selectors */}
      <div className="grid md:grid-cols-2 gap-6">
        {DATASETS.map((ds) => (
          <div
            key={ds.id}
            onClick={() => {
              setSelectedDataset(ds);
              setConsoleLogs(prev => [...prev, `[System] 已切换至数据集: ${ds.name}`]);
            }}
            className={`p-6 rounded-3xl border-2 transition-all cursor-pointer flex gap-4 ${
              selectedDataset.id === ds.id
                ? 'border-blue-500 bg-blue-50/10'
                : 'border-gray-100 hover:border-gray-200 bg-white'
            }`}
          >
            <div className={`p-3 rounded-2xl shrink-0 h-fit ${selectedDataset.id === ds.id ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-500'}`}>
              <Database size={22} />
            </div>
            <div>
              <h3 className="font-bold text-sm text-gray-900 mb-1">{ds.name}</h3>
              <p className="text-[11px] text-gray-400 leading-normal mb-3">{ds.desc}</p>
              <div className="flex flex-wrap gap-1">
                {ds.columns.map((col, i) => (
                  <span key={i} className="text-[9px] bg-gray-100 border border-gray-200 text-gray-500 px-2 py-0.5 rounded font-bold">
                    {col}
                  </span>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Middle: Preview and Editor */}
      <div className="flex flex-col lg:flex-row gap-6 min-h-[400px]">
        {/* Left: Table Preview */}
        <div className="flex-1 bg-white border border-gray-100 rounded-3xl p-6 shadow-sm overflow-hidden flex flex-col">
          <h3 className="text-xs font-black text-gray-900 mb-4 uppercase tracking-widest flex items-center gap-2">
            <FileSpreadsheet size={16} className="text-blue-500" /> 数据集预览 (Data Preview)
          </h3>
          <div className="flex-1 overflow-auto border border-gray-50 rounded-xl">
            <table className="w-full text-[11px] text-left border-collapse bg-white">
              <thead>
                <tr className="bg-gray-50 text-gray-400 font-black border-b border-gray-100">
                  {selectedDataset.columns.map((col, i) => (
                    <th key={i} className="p-3 text-nowrap">{col}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-gray-700">
                {selectedDataset.data.map((row: any, i) => (
                  <tr key={i} className="hover:bg-gray-50/50">
                    {selectedDataset.columns.map((col, j) => (
                      <td key={j} className="p-3 font-semibold text-nowrap">{row[col]}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right: Code Sandbox */}
        <div className="w-full lg:w-[48%] flex flex-col gap-4">
          <div className="bg-white border border-gray-100 rounded-3xl overflow-hidden flex-1 flex flex-col shadow-sm">
            {/* Header */}
            <div className="px-6 py-3 border-b border-gray-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-xs font-black text-gray-900 uppercase tracking-wider">数据处理 Python 脚本</span>
                {isPyodideLoading ? (
                  <span className="text-[10px] text-blue-500 font-bold flex items-center gap-1">
                    <Loader2 size={10} className="animate-spin" /> 加载环境...
                  </span>
                ) : (
                  <span className="text-[10px] text-green-500 font-bold">● Python 已就绪</span>
                )}
              </div>
              <button
                onClick={handleRunPython}
                disabled={isPyodideLoading || isRunning}
                className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 disabled:bg-gray-300 transition-all shadow-md shadow-blue-500/10 active:scale-95"
              >
                {isRunning ? <Loader2 size={12} className="animate-spin" /> : <Play size={12} fill="currentColor" />}
                运行数据清洗
              </button>
            </div>

            {/* Monaco Editor */}
            <div className="flex-1 bg-[#1e1e1e] pt-3 min-h-[200px]">
              <Editor
                height="100%"
                defaultLanguage="python"
                theme="vs-dark"
                value={code}
                onChange={(val) => setCode(val || '')}
                options={{
                  minimap: { enabled: false },
                  fontSize: 12,
                  fontFamily: 'var(--font-mono), monospace',
                  lineHeight: 20,
                  padding: { top: 8 },
                  scrollBeyondLastLine: false,
                }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Bottom: Console Logs */}
      <div className="bg-white border border-gray-100 rounded-3xl overflow-hidden shadow-sm flex flex-col">
        <div className="px-6 py-3 border-b border-gray-50 bg-gray-50/50 flex items-center justify-between">
          <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
            <Terminal size={14} /> 数据分析输出 (Console)
          </span>
          <button
            onClick={() => setConsoleLogs(['[System] 控制台已清空。'])}
            className="text-[10px] font-bold text-gray-400 hover:text-black"
          >
            清空
          </button>
        </div>
        <div className="p-4 font-mono text-[11px] text-gray-700 bg-gray-50 min-h-[120px] max-h-[220px] overflow-y-auto">
          {consoleLogs.map((log, i) => (
            <div key={i} className={`whitespace-pre-wrap ${log.includes('Error') ? 'text-red-500 font-bold' : log.includes('System') ? 'text-blue-500' : ''}`}>
              {log}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
