'use client';

import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, Image as ImageIcon, Mic, Send, RefreshCw, Volume2, Square, Play, Sparkles } from 'lucide-react';

const SPACES = [
  { id: 'chat', name: 'AI Chat Space', icon: <MessageSquare size={20} />, desc: '基于大模型的交互式聊天机器人，可设定角色特征与回答风格。' },
  { id: 'image', name: 'Agnes Creative Paint', icon: <ImageIcon size={20} />, desc: '创意生图空间，输入英文 Prompt，利用 Agnes 引擎瞬间出图。' },
  { id: 'voice', name: 'ASR & TTS Voice Agent', icon: <Mic size={20} />, desc: '端到端语音实验空间。通过录制语音，实现“语音识别 -> LLM 回答 -> 语音合成朗读”。' }
];

export default function LabSpaces() {
  const [activeSpace, setActiveSpace] = useState('chat');

  return (
    <div className="flex flex-col md:flex-row gap-8 min-h-[500px]">
      {/* Sidebar: Spaces List */}
      <div className="w-full md:w-64 shrink-0 flex flex-col gap-3">
        <h2 className="text-xs font-black text-gray-400 uppercase tracking-widest px-2">
          Spaces 体验空间 (Gradio 应用)
        </h2>
        {SPACES.map((space) => (
          <button
            key={space.id}
            onClick={() => setActiveSpace(space.id)}
            className={`p-4 rounded-2xl text-left border transition-all flex items-start gap-4 hover:border-blue-200 active:scale-98 ${
              activeSpace === space.id
                ? 'bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-500/20'
                : 'bg-white border-gray-100 text-gray-700'
            }`}
          >
            <div className={`p-2 rounded-xl shrink-0 ${activeSpace === space.id ? 'bg-white/10 text-white' : 'bg-blue-50 text-blue-600'}`}>
              {space.icon}
            </div>
            <div>
              <p className="font-bold text-sm leading-tight mb-1">{space.name}</p>
              <p className={`text-[10px] leading-relaxed ${activeSpace === space.id ? 'text-white/80' : 'text-gray-400'}`}>
                {space.desc}
              </p>
            </div>
          </button>
        ))}
      </div>

      {/* Main Sandbox Area */}
      <div className="flex-1 bg-white border border-gray-100 rounded-3xl p-8 shadow-sm flex flex-col">
        {activeSpace === 'chat' && <ChatSpace />}
        {activeSpace === 'image' && <ImageSpace />}
        {activeSpace === 'voice' && <VoiceSpace />}
      </div>
    </div>
  );
}

/* ==========================================
   1. AI Chat Space Component
   ========================================== */
function ChatSpace() {
  const [messages, setMessages] = useState<Array<{ role: string; content: string }>>([
    { role: 'assistant', content: '哈啰！我是小创老师。今天你想和我探讨关于 AI 还是机器人的什么知识呢？' }
  ]);
  const [input, setInput] = useState('');
  const [character, setCharacter] = useState('小创');
  const [isLoading, setIsLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMsg = input.trim();
    setInput('');
    const newMessages = [...messages, { role: 'user', content: userMsg }];
    setMessages(newMessages);
    setIsLoading(true);

    const charPrompt = character === '小创'
      ? '你是一个知识渊博、开朗的青少年科创导师，名叫小创老师，经常鼓励学生亲自动手做创客项目。回复请尽量生动简短。'
      : '你是一个叫周小麦的14岁极客少年，热爱机器人、编程、航天与卡丁车。说话风格活泼，带有一些科技宅的口吻。';

    try {
      const response = await fetch('/api/chatbear/lab', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'llm',
          model: 'gemini-3.5-flash',
          messages: [
            { role: 'system', content: charPrompt },
            ...newMessages
          ],
          temperature: 0.8
        })
      });

      if (!response.ok) throw new Error('对话 API 响应异常');

      const data = await response.json();
      const reply = data.choices?.[0]?.message?.content || '（大脑一片空白，请稍后重试）';

      setMessages(prev => [...prev, { role: 'assistant', content: reply }]);
    } catch (err: any) {
      setMessages(prev => [...prev, { role: 'assistant', content: `[发生系统故障]: ${err.message}` }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col h-[500px]">
      {/* Character Selector */}
      <div className="flex items-center justify-between pb-4 border-b border-gray-100 mb-6 shrink-0">
        <div>
          <h3 className="font-black text-gray-900 text-base">Bear.Chat 聊天空间</h3>
          <p className="text-xs text-gray-400">大模型对话系统与多轮状态机制实验</p>
        </div>
        <div className="flex gap-2">
          {['小创', '周小麦'].map((char) => (
            <button
              key={char}
              onClick={() => {
                setCharacter(char);
                setMessages([{ role: 'assistant', content: `你好，我是${char}。我们来聊天吧！` }]);
              }}
              className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all ${
                character === char
                  ? 'bg-blue-50 text-blue-600 border-2 border-blue-500/20'
                  : 'bg-gray-50 text-gray-500 border border-gray-100 hover:bg-gray-100'
              }`}
            >
              {char}
            </button>
          ))}
        </div>
      </div>

      {/* Chat Window */}
      <div className="flex-1 overflow-y-auto space-y-4 mb-6 pr-2 bg-gray-50/30 rounded-2xl p-4 border border-gray-50 shadow-inner">
        {messages.map((msg, i) => (
          <div key={i} className={`flex gap-3 max-w-[85%] ${msg.role === 'user' ? 'ml-auto flex-row-reverse' : ''}`}>
            <div className={`w-8 h-8 rounded-full overflow-hidden shrink-0 shadow-sm border ${
              msg.role === 'user' ? 'border-blue-100 bg-blue-50' : 'border-yellow-100 bg-yellow-50'
            }`}>
              <img
                src={msg.role === 'user' ? '/assets/chatbear/白色机器人IP标准设定图.png' : '/assets/chatbear/周小麦IP标准设定图.png'}
                alt={msg.role}
                className="w-full h-full object-cover scale-150 translate-y-1"
              />
            </div>
            <div className={`p-4 rounded-2xl text-xs font-medium leading-relaxed ${
              msg.role === 'user'
                ? 'bg-blue-600 text-white rounded-tr-none'
                : 'bg-white border border-gray-100 text-gray-800 rounded-tl-none shadow-sm'
            }`}>
              {msg.content}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex gap-3 max-w-[80%]">
            <div className="w-8 h-8 rounded-full bg-gray-100 animate-pulse"></div>
            <div className="p-4 rounded-2xl bg-white border border-gray-100 text-gray-400 text-xs font-medium rounded-tl-none shadow-sm flex items-center gap-2">
              <RefreshCw size={12} className="animate-spin text-blue-500" />
              正在组织语言...
            </div>
          </div>
        )}
        <div ref={chatEndRef} />
      </div>

      {/* Input */}
      <div className="flex gap-3 shrink-0">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          placeholder={`向${character}提问一些有趣的问题吧...`}
          className="flex-1 px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-xs"
        />
        <button
          onClick={handleSend}
          disabled={isLoading || !input.trim()}
          className="px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-lg shadow-blue-500/20 active:scale-95 transition-all disabled:bg-gray-300 shrink-0"
        >
          <Send size={16} />
        </button>
      </div>
    </div>
  );
}

/* ==========================================
   2. Agnes Creative Paint Component
   ========================================== */
function ImageSpace() {
  const [prompt, setPrompt] = useState('An oil painting of a cybernetic giant panda playing a synthesizer in a neon-lit futuristic street, cyberpunk aesthetic, high detail');
  const [isLoading, setIsLoading] = useState(false);
  const [imgUrl, setImgUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    if (!prompt.trim() || isLoading) return;

    setIsLoading(true);
    setError(null);
    setImgUrl(null);

    try {
      const response = await fetch('/api/chatbear/lab', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'image',
          prompt,
          size: '1024x1024'
        })
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error?.message || '生图接口报错，请检查密钥。');

      const url = data.data?.[0]?.url;
      if (url) {
        setImgUrl(url);
      } else {
        throw new Error('未返回图片 URL。');
      }
    } catch (err: any) {
      setError(err.message || '网络请求错误');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col h-[500px]">
      <div className="pb-4 border-b border-gray-100 mb-6 shrink-0">
        <h3 className="font-black text-gray-900 text-base">Agnes AI 创意生图空间</h3>
        <p className="text-xs text-gray-400">调用 Agnes 密钥实现极速多模态文生图实验</p>
      </div>

      <div className="flex-1 flex flex-col lg:flex-row gap-6 min-h-0">
        {/* Left: input */}
        <div className="flex-1 flex flex-col justify-between py-2 gap-4">
          <div className="space-y-4">
            <label className="block text-xs font-black text-gray-400 uppercase tracking-widest">
              Prompt (描述您的创意，建议使用英文描述以获取最佳细节)
            </label>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              rows={4}
              className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-xs font-medium leading-relaxed"
            />
          </div>

          <button
            onClick={handleGenerate}
            disabled={isLoading || !prompt.trim()}
            className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-blue-500/20 active:scale-98 transition-all disabled:bg-gray-300"
          >
            {isLoading ? <RefreshCw size={14} className="animate-spin" /> : <Sparkles size={14} />}
            {isLoading ? '正在调用 Agnes 极速渲染中...' : '生成艺术图像 (Generate)'}
          </button>
        </div>

        {/* Right: output preview */}
        <div className="w-full lg:w-[350px] aspect-square lg:aspect-auto border border-gray-100 bg-gray-50 rounded-2xl overflow-hidden relative shadow-inner flex items-center justify-center">
          {isLoading && (
            <div className="text-center p-6">
              <RefreshCw size={32} className="text-blue-500 animate-spin mx-auto mb-3" />
              <p className="text-xs font-bold text-gray-700">正在生成高分辨率图像...</p>
              <p className="text-[10px] text-gray-400 mt-1">使用双密钥负载均衡分流</p>
            </div>
          )}

          {!isLoading && error && (
            <div className="text-center p-6 text-red-500">
              <p className="font-bold text-xs">生成失败</p>
              <p className="text-[10px] text-gray-400 mt-2 leading-relaxed max-w-[250px] mx-auto">{error}</p>
            </div>
          )}

          {!isLoading && !imgUrl && !error && (
            <div className="text-center p-6 text-gray-400">
              <ImageIcon size={32} className="mx-auto mb-3 text-gray-200" />
              <p className="text-xs font-semibold">等候生图...</p>
              <p className="text-[10px] text-gray-400 mt-1">在左侧输入 Prompt 并点击生成</p>
            </div>
          )}

          {!isLoading && imgUrl && (
            <a href={imgUrl} target="_blank" rel="noreferrer" className="w-full h-full block group relative">
              <img
                src={imgUrl}
                alt="Agnes Rendered"
                className="w-full h-full object-cover transition-transform group-hover:scale-102 duration-500"
              />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <span className="bg-white text-black px-4 py-2 rounded-xl text-xs font-bold shadow-lg">在新标签页中查看大图</span>
              </div>
            </a>
          )}
        </div>
      </div>
    </div>
  );
}

/* ==========================================
   3. ASR & TTS Voice Agent Component
   ========================================== */
function VoiceSpace() {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [asrText, setAsrText] = useState<string | null>(null);
  const [llmReply, setLlmReply] = useState<string | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  // 释放资源
  useEffect(() => {
    return () => {
      if (audioUrl) URL.revokeObjectURL(audioUrl);
    };
  }, [audioUrl]);

  // 开始录音
  const startRecording = async () => {
    setAsrText(null);
    setLlmReply(null);
    setAudioUrl(null);
    setIsPlaying(false);
    audioChunksRef.current = [];

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      // 捕获为音频
      const recorder = new MediaRecorder(stream, { mimeType: 'audio/webm' });
      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) {
          audioChunksRef.current.push(e.data);
        }
      };

      recorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        // 停止流中的所有轨道以释放麦克风权限
        stream.getTracks().forEach(track => track.stop());
        await processVoice(audioBlob);
      };

      recorder.start();
      setIsRecording(true);
    } catch (err: any) {
      alert(`无法获取麦克风权限或浏览器不支持麦克风。错误: ${err.message}`);
    }
  };

  // 停止录音
  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  // 处理语音流逻辑
  const processVoice = async (audioBlob: Blob) => {
    setIsProcessing(true);
    try {
      // Step 1: 语音转文字 (ASR)
      const asrFormData = new FormData();
      asrFormData.append('type', 'asr');
      asrFormData.append('audio', audioBlob, 'voice.webm');

      const asrResponse = await fetch('/api/chatbear/lab', {
        method: 'POST',
        body: asrFormData
      });

      if (!asrResponse.ok) throw new Error('语音识别 (ASR) 失败');

      const asrData = await asrResponse.json();
      const transcribedText = asrData.text;
      setAsrText(transcribedText);

      if (!transcribedText || transcribedText.trim() === '') {
        throw new Error('未识别到您的语音内容，请靠近麦克风重新录制。');
      }

      // Step 2: 调用 LLM 获取回答 (Backgrace)
      const llmResponse = await fetch('/api/chatbear/lab', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'llm',
          model: 'gemini-3.5-flash',
          messages: [
            { role: 'system', content: '你是一个叫小创老师的AI声学助教。请以极其简短且非常温暖的口吻回复，不要超过 30 字。' },
            { role: 'user', content: transcribedText }
          ]
        })
      });

      if (!llmResponse.ok) throw new Error('AI 大脑理解失败');
      const llmData = await llmResponse.json();
      const reply = llmData.choices?.[0]?.message?.content || '收到啦，你真棒！';
      setLlmReply(reply);

      // Step 3: 文字转语音并播放 (TTS)
      const ttsResponse = await fetch('/api/chatbear/lab', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'tts',
          input: reply,
          voice: 'nova'
        })
      });

      if (!ttsResponse.ok) throw new Error('TTS 语音合成失败');
      
      const audioBuffer = await ttsResponse.arrayBuffer();
      const playBlob = new Blob([audioBuffer], { type: 'audio/mpeg' });
      const playUrl = URL.createObjectURL(playBlob);
      setAudioUrl(playUrl);

      // 自动播放
      playSpeech(playUrl);

    } catch (err: any) {
      setLlmReply(`[实验异常]: ${err.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const playSpeech = (url: string) => {
    setIsPlaying(true);
    const audio = new Audio(url);
    audio.onended = () => setIsPlaying(false);
    audio.onerror = () => setIsPlaying(false);
    audio.play();
  };

  return (
    <div className="flex-1 flex flex-col h-[500px]">
      <div className="pb-4 border-b border-gray-100 mb-6 shrink-0">
        <h3 className="font-black text-gray-900 text-base">ASR & TTS 双向语音交互空间</h3>
        <p className="text-xs text-gray-400">综合性声音智能体。使用浏览器麦克风录制 ➜ 语音翻译 ➜ LLM 决策 ➜ 语音流发声</p>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center py-6">
        {/* Record Button Container */}
        <div className="relative mb-8">
          {isRecording && (
            <div className="absolute -inset-4 bg-red-500/20 rounded-full blur-xl animate-pulse"></div>
          )}
          <button
            onClick={isRecording ? stopRecording : startRecording}
            disabled={isProcessing}
            className={`w-24 h-24 rounded-full flex items-center justify-center text-white transition-all transform active:scale-95 shadow-xl relative z-10 ${
              isRecording 
                ? 'bg-red-500 hover:bg-red-600 shadow-red-500/20' 
                : 'bg-blue-600 hover:bg-blue-700 shadow-blue-500/20 disabled:bg-gray-400'
            }`}
          >
            {isRecording ? <Square size={28} fill="currentColor" /> : <Mic size={32} />}
          </button>
        </div>

        <p className="text-sm font-bold text-gray-800 mb-8 text-center min-h-[20px]">
          {isRecording ? (
            <span className="text-red-500 animate-pulse flex items-center gap-1.5 justify-center">
              ● 正在录制您的语音... 点击按钮停止录音
            </span>
          ) : isProcessing ? (
            <span className="text-blue-600 flex items-center gap-2 justify-center">
              <RefreshCw size={14} className="animate-spin" />
              正在流水线处理 (ASR ➜ LLM ➜ TTS)...
            </span>
          ) : isPlaying ? (
            <span className="text-green-600 flex items-center gap-1.5 justify-center">
              <Volume2 size={16} className="animate-bounce" />
              小创老师正在发声回复中...
            </span>
          ) : (
            '点击蓝色话筒，允许使用麦克风权限以开始语音实验'
          )}
        </p>

        {/* Process Box */}
        {(asrText || llmReply) && (
          <div className="w-full max-w-lg bg-gray-50 border border-gray-100 rounded-2xl p-6 space-y-4 shadow-inner">
            {asrText && (
              <div>
                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-1">
                  语音识别结果 (ASR Output):
                </span>
                <p className="text-xs font-semibold text-gray-800">“ {asrText} ”</p>
              </div>
            )}
            {llmReply && (
              <div className="pt-4 border-t border-gray-100 flex items-start justify-between gap-4">
                <div>
                  <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-1">
                    AI 响应与语音合成 (LLM & TTS):
                  </span>
                  <p className="text-xs font-bold text-blue-600">“ {llmReply} ”</p>
                </div>
                {audioUrl && !isProcessing && (
                  <button
                    onClick={() => playSpeech(audioUrl)}
                    disabled={isPlaying}
                    className="p-3 bg-white hover:bg-gray-100 rounded-xl border border-gray-200 text-blue-600 active:scale-95 transition-all shrink-0"
                  >
                    <Volume2 size={16} className={isPlaying ? 'animate-bounce' : ''} />
                  </button>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
