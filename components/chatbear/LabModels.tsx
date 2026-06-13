'use client';

import React, { useState } from 'react';
import { Play, Sparkles, Settings2, Code, Eye, RefreshCw, AlertCircle, FileJson } from 'lucide-react';

const MODELS = [
  { id: 'gemini-3.5-flash', name: 'Gemini 3.5 Flash', type: 'text', provider: 'Backgrace', desc: 'Google 旗舰轻量模型，超快响应速度，适合对话与逻辑推理。' },
  { id: 'gpt-4o-mini', name: 'GPT-4o Mini', type: 'text', provider: 'Backgrace', desc: 'OpenAI 高性能轻量化模型，知识面广，文本处理及格式化表现卓越。' },
  { id: 'agnes-image-2.0-flash', name: 'Agnes Image 2.0 Flash', type: 'image', provider: 'Agnes', desc: 'Agnes 极速图像生成引擎，支持丰富的光影及艺术细节。' }
];

export default function LabModels() {
  const [selectedModel, setSelectedModel] = useState(MODELS[0]);
  const [systemPrompt, setSystemPrompt] = useState('你是一个智能 AI 助教，名叫小创。请以友好、幽默的语气为青少年解答科学与编程问题。');
  const [userPrompt, setUserPrompt] = useState('为什么天空是蓝色的？请用 100 字以内通俗地向我解释。');
  const [temperature, setTemperature] = useState(0.7);
  const [maxTokens, setMaxTokens] = useState(1024);
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [rawJson, setRawJson] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'preview' | 'json'>('preview');

  const handleInference = async () => {
    setIsLoading(true);
    setError(null);
    setResult(null);
    setRawJson(null);

    try {
      if (selectedModel.type === 'text') {
        const response = await fetch('/api/chatbear/lab', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            type: 'llm',
            model: selectedModel.id,
            messages: [
              { role: 'system', content: systemPrompt },
              { role: 'user', content: userPrompt }
            ],
            temperature,
            max_tokens: maxTokens
          })
        });

        const data = await response.json();
        setRawJson(data);

        if (!response.ok) {
          throw new Error(data.error?.message || '推理失败，请检查配置或密钥。');
        }

        const reply = data.choices?.[0]?.message?.content || '未返回有效内容';
        setResult(reply);
      } else {
        // Image generation
        const response = await fetch('/api/chatbear/lab', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            type: 'image',
            model: selectedModel.id,
            prompt: userPrompt,
            size: '512x512',
            n: 1
          })
        });

        const data = await response.json();
        setRawJson(data);

        if (!response.ok) {
          throw new Error(data.error?.message || '生图失败，请检查配置或密钥。');
        }

        const imgUrl = data.data?.[0]?.url || '';
        if (imgUrl) {
          setResult(imgUrl);
        } else {
          throw new Error('未返回图片 URL');
        }
      }
    } catch (err: any) {
      setError(err.message || '网络请求失败');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col lg:flex-row gap-8">
      {/* Left Column: Model list & parameters */}
      <div className="w-full lg:w-[380px] shrink-0 space-y-6">
        {/* Model Selection */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
          <h2 className="text-sm font-black text-gray-900 mb-4 uppercase tracking-wider flex items-center gap-2">
            <Sparkles size={16} className="text-blue-500" /> 选择推理模型
          </h2>
          <div className="space-y-3">
            {MODELS.map((model) => (
              <div
                key={model.id}
                onClick={() => {
                  setSelectedModel(model);
                  // 针对生图自动修改默认 Prompt，以获取更好的演示效果
                  if (model.type === 'image') {
                    setUserPrompt('A cute little robot wearing a golden space suit, high-tech, cyber, 3d render, white background');
                  } else {
                    setUserPrompt('为什么天空是蓝色的？请用 100 字以内通俗地向我解释。');
                  }
                  setResult(null);
                  setRawJson(null);
                  setError(null);
                }}
                className={`p-4 rounded-xl border-2 transition-all cursor-pointer ${
                  selectedModel.id === model.id
                    ? 'border-blue-500 bg-blue-50/20'
                    : 'border-gray-100 hover:border-gray-200 bg-white'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-sm text-gray-900">{model.name}</span>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider ${
                    model.type === 'text' ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800'
                  }`}>
                    {model.type === 'text' ? '文本生成' : '图像生成'}
                  </span>
                </div>
                <p className="text-[11px] text-gray-400 leading-normal">{model.desc}</p>
                <div className="mt-2 text-[10px] text-gray-400 font-bold uppercase tracking-wider">
                  通道: {model.provider}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Hyperparameters */}
        {selectedModel.type === 'text' && (
          <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
            <h2 className="text-sm font-black text-gray-900 mb-4 uppercase tracking-wider flex items-center gap-2">
              <Settings2 size={16} className="text-blue-500" /> 超参数控制
            </h2>
            <div className="space-y-5">
              <div>
                <div className="flex justify-between text-xs font-bold text-gray-500 mb-2">
                  <span>Temperature (温度系数)</span>
                  <span className="text-blue-600">{temperature}</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="1.2"
                  step="0.1"
                  value={temperature}
                  onChange={(e) => setTemperature(parseFloat(e.target.value))}
                  className="w-full h-1.5 bg-gray-100 rounded-lg appearance-none cursor-pointer accent-blue-500"
                />
                <p className="text-[10px] text-gray-400 mt-1 leading-normal">
                  值越高，回答越有创意；值越低（如 0.2），回答越严谨和稳定。
                </p>
              </div>

              <div>
                <div className="flex justify-between text-xs font-bold text-gray-500 mb-2">
                  <span>Max Tokens (单次最大生成)</span>
                  <span className="text-blue-600">{maxTokens}</span>
                </div>
                <input
                  type="range"
                  min="256"
                  max="2048"
                  step="64"
                  value={maxTokens}
                  onChange={(e) => setMaxTokens(parseInt(e.target.value))}
                  className="w-full h-1.5 bg-gray-100 rounded-lg appearance-none cursor-pointer accent-blue-500"
                />
                <p className="text-[10px] text-gray-400 mt-1 leading-normal">
                  单次推理允许返回的最大 Token 数。1 Token 约等于 1.5 个汉字。
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Right Column: Prompts and Output */}
      <div className="flex-1 flex flex-col gap-6">
        {/* Prompts Input area */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm space-y-4">
          {selectedModel.type === 'text' && (
            <div>
              <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">
                System Prompt (系统提示词 - 设定角色与底线)
              </label>
              <textarea
                value={systemPrompt}
                onChange={(e) => setSystemPrompt(e.target.value)}
                rows={2}
                className="w-full p-4 bg-gray-50 border border-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-sm"
                placeholder="在此输入系统角色设定..."
              />
            </div>
          )}

          <div>
            <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">
              {selectedModel.type === 'text' ? 'User Prompt (用户提示词 / 提问)' : 'Image Prompt (绘画提示词)'}
            </label>
            <textarea
              value={userPrompt}
              onChange={(e) => setUserPrompt(e.target.value)}
              rows={3}
              className="w-full p-4 bg-gray-50 border border-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-sm font-medium"
              placeholder={selectedModel.type === 'text' ? '在此输入您要向大模型提问的内容...' : '用英文描述您想生成的画面细节...'}
            />
          </div>

          <div className="flex justify-end">
            <button
              onClick={handleInference}
              disabled={isLoading || !userPrompt.trim()}
              className="px-6 py-3 bg-blue-600 text-white rounded-xl font-bold text-sm flex items-center gap-2 hover:bg-blue-700 disabled:bg-gray-300 transition-all shadow-lg shadow-blue-500/20 active:scale-95"
            >
              {isLoading ? (
                <>
                  <RefreshCw size={16} className="animate-spin" />
                  正在进行推理...
                </>
              ) : (
                <>
                  <Play size={16} fill="currentColor" />
                  运行推理 (Inference)
                </>
              )}
            </button>
          </div>
        </div>

        {/* Output view area */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm flex-1 flex flex-col min-h-[350px]">
          {/* Header tabs */}
          <div className="px-6 py-3 border-b border-gray-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xs font-black text-gray-900 uppercase tracking-wider">Inference Output (推理结果)</span>
            </div>
            <div className="flex bg-gray-100 p-0.5 rounded-lg">
              <button
                onClick={() => setActiveTab('preview')}
                className={`px-3 py-1.5 rounded-md text-[11px] font-bold flex items-center gap-1.5 transition-all ${
                  activeTab === 'preview' ? 'bg-white text-black shadow-sm' : 'text-gray-400 hover:text-black'
                }`}
              >
                <Eye size={12} /> 渲染预览
              </button>
              <button
                onClick={() => setActiveTab('json')}
                className={`px-3 py-1.5 rounded-md text-[11px] font-bold flex items-center gap-1.5 transition-all ${
                  activeTab === 'json' ? 'bg-white text-black shadow-sm' : 'text-gray-400 hover:text-black'
                }`}
              >
                <FileJson size={12} /> 原始 JSON 树
              </button>
            </div>
          </div>

          {/* Tab content */}
          <div className="flex-1 p-6 flex flex-col bg-gray-50/30">
            {error && (
              <div className="bg-red-50 border border-red-100 text-red-700 p-4 rounded-xl flex gap-3 items-start">
                <AlertCircle className="shrink-0 mt-0.5" size={18} />
                <div className="text-xs font-semibold">
                  <p className="font-bold">错误警告:</p>
                  <p className="mt-1">{error}</p>
                </div>
              </div>
            )}

            {!error && !isLoading && !result && !rawJson && (
              <div className="flex-1 flex flex-col items-center justify-center text-center text-gray-400 py-12">
                <Code size={40} className="text-gray-200 mb-3" />
                <p className="text-xs font-semibold">等候推理运行...</p>
                <p className="text-[10px] text-gray-400 mt-1">点击上方“运行推理”按钮向 API 发送请求</p>
              </div>
            )}

            {isLoading && (
              <div className="flex-1 flex flex-col items-center justify-center text-center text-gray-400 py-12">
                <RefreshCw size={36} className="text-blue-500 animate-spin mb-3" />
                <p className="text-xs font-bold text-blue-600">正在与云端服务器进行通信...</p>
                <p className="text-[10px] text-gray-400 mt-1">加载时序与响应数据生成中</p>
              </div>
            )}

            {!error && !isLoading && activeTab === 'preview' && result && (
              <div className="flex-1 bg-white border border-gray-100 rounded-xl p-6 min-h-[200px] shadow-inner flex items-center justify-center">
                {selectedModel.type === 'text' ? (
                  <p className="text-sm text-gray-800 leading-relaxed font-medium self-start w-full whitespace-pre-wrap">
                    {result}
                  </p>
                ) : (
                  <div className="relative group max-w-sm w-full aspect-square rounded-2xl overflow-hidden border border-gray-100 shadow-lg">
                    <img
                      src={result}
                      alt="Agnes-Generated"
                      className="w-full h-full object-cover transition-transform group-hover:scale-105 duration-500"
                    />
                  </div>
                )}
              </div>
            )}

            {!error && !isLoading && activeTab === 'json' && rawJson && (
              <pre className="flex-1 bg-[#1e1e1e] text-green-400 rounded-xl p-4 overflow-auto text-[11px] font-mono shadow-inner max-h-[400px]">
                {JSON.stringify(rawJson, null, 2)}
              </pre>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
