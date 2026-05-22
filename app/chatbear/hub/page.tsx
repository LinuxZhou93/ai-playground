'use client';

import React from 'react';
import Header from '@/components/chatbear/Header';
import AiAssistant from '@/components/chatbear/AiAssistant';
import { Search, Database, Box, Filter, Download, ExternalLink } from 'lucide-react';
import './../chatbear.css';

const resources = [
  {
    name: "MobileNet-V3-Bear",
    type: "Model",
    desc: "针对青少年机器人套件优化的轻量级视觉模型，支持 100+ 种常见物体识别。",
    tags: ["Computer Vision", "PyTorch", "Robotics"],
    downloads: "2.4k",
    author: "ChatBear Core Team"
  },
  {
    name: "Youth-Hand-Gestures",
    type: "Dataset",
    desc: "专门收集的青少年手势数据集，包含 5000+ 张各种光照环境下的手控指令图片。",
    tags: ["Dataset", "Human-Computer Interaction"],
    downloads: "1.8k",
    author: "Zhou Xiaomai & Friends"
  },
  {
    name: "Mini-Llama-Instruct",
    type: "Model",
    desc: "适合在本地端侧运行的小型语言模型，专为教育场景微调。",
    tags: ["NLP", "Education", "GGUF"],
    downloads: "5.1k",
    author: "Xiao Chuang AI Lab"
  },
  {
    name: "EAI-Gym-Simulation",
    type: "Environment",
    desc: "基于物理引擎的具身智能仿真环境，包含查特熊标准机器人模型。",
    tags: ["Simulation", "EAI", "Isaac Gym"],
    downloads: "3.2k",
    author: "ChatBear Research"
  }
];

export default function HubPage() {
  return (
    <div className="min-h-screen bg-white">
      <Header />
      
      <main className="cb-container py-12">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row items-end justify-between gap-6 mb-12">
          <div>
            <h1 className="text-4xl font-black text-gray-900 mb-4">Bear.Hub</h1>
            <p className="text-gray-500 max-w-2xl">
              查特熊资源中心。这里汇集了专为青少年优化的轻量级 AI 模型、趣味数据集以及机器人仿真环境。
              由周小麦和小创团队共同维护。
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button className="px-5 py-2.5 bg-black text-white rounded-xl font-bold text-sm flex items-center gap-2 hover:bg-gray-800 transition-all">
              贡献资源 <ExternalLink size={16} />
            </button>
          </div>
        </div>

        {/* Search & Filter */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input 
              type="text" 
              placeholder="搜索模型、数据集或项目文件..." 
              className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
            />
          </div>
          <button className="px-6 py-4 bg-white border border-gray-100 rounded-2xl font-bold text-gray-600 flex items-center gap-2 hover:bg-gray-50 transition-all">
            <Filter size={18} /> 筛选
          </button>
        </div>

        {/* Resource Grid */}
        <div className="grid md:grid-cols-2 gap-6">
          {resources.map((res, i) => (
            <div key={i} className="cb-card bg-white p-8 group cursor-pointer border border-gray-100 hover:border-blue-200">
              <div className="flex items-start justify-between mb-6">
                <div className={`p-3 rounded-xl ${res.type === 'Model' ? 'bg-blue-50 text-blue-600' : res.type === 'Dataset' ? 'bg-green-50 text-green-600' : 'bg-purple-50 text-purple-600'}`}>
                  {res.type === 'Model' ? <Box size={24} /> : <Database size={24} />}
                </div>
                <div className="flex items-center gap-1.5 text-xs font-bold text-gray-400 bg-gray-50 px-3 py-1.5 rounded-full">
                  <Download size={14} /> {res.downloads}
                </div>
              </div>
              
              <h3 className="text-xl font-black text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">{res.name}</h3>
              <p className="text-sm text-gray-500 leading-relaxed mb-6">
                {res.desc}
              </p>

              <div className="flex flex-wrap gap-2 mb-6">
                {res.tags.map((tag, j) => (
                  <span key={j} className="text-[10px] font-black uppercase tracking-widest px-2.5 py-1 bg-gray-50 text-gray-400 rounded-md border border-gray-100">
                    {tag}
                  </span>
                ))}
              </div>

              <div className="flex items-center gap-2 pt-6 border-t border-gray-50">
                <div className="w-6 h-6 rounded-full bg-gray-200 overflow-hidden">
                  <img src="/assets/chatbear/白色机器人IP标准设定图.png" alt="author" className="w-full h-full object-contain scale-125" />
                </div>
                <span className="text-xs font-medium text-gray-400">{res.author}</span>
              </div>
            </div>
          ))}
        </div>
      </main>

      <AiAssistant />
    </div>
  );
}
