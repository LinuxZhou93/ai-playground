"use client";

import React, { useState } from "react";
import { 
  FileBox, 
  Search, 
  UploadCloud, 
  Filter, 
  Download, 
  MoreHorizontal, 
  Code,
  Cpu,
  MonitorPlay,
  Wrench,
  Image as ImageIcon
} from "lucide-react";

import { uploadAsset, deleteAsset } from "./actions";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

const categories = ["全部", "机械零件", "电子元件", "代码片段", "文档图解", "实验微组件"];

export default function VaultClient({ initialAssets }: { initialAssets: any[] }) {
  const [activeTab, setActiveTab] = useState("全部");
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  // 计算总容量
  const totalSize = React.useMemo(() => {
    const bytes = initialAssets.reduce((acc, curr) => acc + Number(curr.size_bytes || 0), 0);
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  }, [initialAssets]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 50 * 1024 * 1024) {
      toast.error("文件大小不可超过 50MB");
      return;
    }

    setIsUploading(true);
    toast.info("正在上传并提取特征...");
    
    // 自动通过分类匹配（仅作Demo示意）
    let autoCategory = "未分类";
    if (file.type.startsWith("image/")) autoCategory = "文档图解";
    if (file.name.endsWith(".stl")) autoCategory = "机械零件";
    if (file.name.endsWith(".ino") || file.name.endsWith(".py")) autoCategory = "代码片段";

    const formData = new FormData();
    formData.append("file", file);
    formData.append("category", autoCategory);

    try {
      const res = await uploadAsset(formData);
      if (res.success) {
        toast.success("✅ 素材组件入库成功");
      } else {
        toast.error("存储失败: " + res.error);
      }
    } catch(err) {
       toast.error("不可预知的上传错误");
    } finally {
       setIsUploading(false);
       if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-6 duration-700">
      
      {/* 头部展示与数据 */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-white tracking-tight flex items-center gap-3">
            <FileBox className="h-8 w-8 text-indigo-400" />
            组件素材宝库 (Asset Vault)
          </h1>
          <p className="text-slate-400 mt-2 text-sm font-medium tracking-wide">
            为您的 FutureClass 智能互动课堂投喂科创核心零件库与组件数据。
          </p>
        </div>
        
        <div className="flex items-center gap-4">
           <div className="px-4 py-2 rounded-xl bg-slate-800/80 border border-slate-700 flex items-center gap-3">
             <span className="text-sm font-bold text-slate-400">总容量</span>
             <span className="text-sm font-black text-white">{totalSize}</span>
             <div className="h-4 w-px bg-slate-700" />
             <span className="text-sm font-bold text-slate-400">组件数</span>
             <span className="text-sm font-black text-white">{initialAssets.length}</span>
           </div>
           <button 
             onClick={() => fileInputRef.current?.click()}
             className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 rounded-xl text-white font-bold tracking-wide shadow-[0_0_15px_rgba(37,99,235,0.4)] transition-all flex items-center gap-2"
           >
             {isUploading ? <Loader2 className="h-4 w-4 animate-spin"/> : <UploadCloud className="h-4 w-4"/>}
             {isUploading ? "传送中..." : "载入新元件"}
           </button>
        </div>
      </div>

      {/* 高保真控制栏 */}
      <div className="flex flex-col xl:flex-row justify-between gap-4 bg-slate-900/50 p-2 rounded-2xl border border-slate-800/50 backdrop-blur-sm">
         {/* 分类 Tabs */}
         <div className="flex overflow-x-auto custom-scrollbar gap-1 p-1">
           {categories.map(cat => (
             <button 
               key={cat}
               onClick={() => setActiveTab(cat)}
               className={`px-5 py-2 rounded-xl text-sm font-bold whitespace-nowrap transition-all ${
                 activeTab === cat 
                 ? "bg-slate-800 text-white shadow-md border border-slate-700" 
                 : "text-slate-400 hover:text-white hover:bg-slate-800/50"
               }`}
             >
               {cat}
             </button>
           ))}
         </div>
         
         <div className="flex items-center gap-3 p-1">
            <div className="relative group flex-1 xl:w-64">
              <Search className="absolute left-3 top-2.5 text-slate-400 h-4 w-4" />
              <input 
                type="text" 
                placeholder="搜索模型、零件号或标签..." 
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2 text-sm text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
              />
            </div>
            <button className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-400 hover:text-white transition-colors">
              <Filter className="h-4 w-4" />
            </button>
         </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        
        {/* 左侧：拖拽上传大区 */}
        <label className="lg:col-span-1 h-[400px] rounded-3xl border-2 border-dashed border-slate-700 bg-slate-900/30 hover:bg-blue-900/10 hover:border-blue-500/50 transition-all flex flex-col items-center justify-center p-8 text-center cursor-pointer group relative overflow-hidden">
           <input type="file" className="hidden" ref={fileInputRef} onChange={handleFileUpload} disabled={isUploading} />
           <div className="absolute inset-0 bg-blue-500/5 translate-y-full group-hover:translate-y-0 transition-transform duration-500" />
           <div className="h-20 w-20 rounded-full bg-slate-800 group-hover:bg-blue-900/50 flex items-center justify-center mb-6 transition-colors shadow-lg shadow-black/20 group-hover:shadow-blue-500/20">
              {isUploading ? <Loader2 className="h-10 w-10 text-blue-400 animate-spin" /> : <UploadCloud className="h-10 w-10 text-slate-400 group-hover:text-blue-400" />}
           </div>
           <h3 className="text-lg font-bold text-white mb-2 relative z-10">{isUploading ? "正在解析并上云..." : "拖拽上传新元件"}</h3>
           <p className="text-sm text-slate-400 mb-6 relative z-10">支持 JSON, STL, INO, TLDraw, PNG, PDF，单文件最高 50MB。</p>
           <div className="px-6 py-2.5 bg-slate-800 group-hover:bg-blue-600 text-white font-bold rounded-full relative z-10 transition-colors">
             选择文件库
           </div>
        </label>

        {/* 右侧：高度美化的瀑布流材质卡片 (简化为 Masonry-like Grid) */}
        <div className="lg:col-span-3">
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {initialAssets.length === 0 ? (
               <div className="col-span-1 md:col-span-2 xl:col-span-3 text-center py-20 text-slate-500 font-bold">
                 暂无真实数据，空空如也，请在左侧上传。
               </div>
            ) : initialAssets.filter(ma => activeTab === '全部' || ma.category === activeTab).map((item) => (
              <div 
                key={item.id} 
                className="group relative rounded-3xl overflow-hidden bg-slate-900 border border-slate-800 hover:border-indigo-500/50 transition-all shadow-lg shadow-black/20"
              >
                {/* 发光边框动画层 */}
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/0 via-indigo-500/0 to-indigo-500/20 opacity-0 group-hover:opacity-100 transition-opacity" />
                
                {/* 卡片图片/缩略图 */}
                <div className="h-48 w-full bg-slate-950 relative overflow-hidden flex items-center justify-center">
                  {item.thumbnail_url ? (
                    <img 
                      src={item.thumbnail_url} 
                      alt={item.name} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 opacity-80 group-hover:opacity-100"
                    />
                  ) : (
                    <div className="flex flex-col items-center justify-center opacity-50">
                       <FileBox className="h-12 w-12 text-slate-600 mb-2" />
                       <span className="text-xs font-bold text-slate-500 uppercase">{item.format} File</span>
                    </div>
                  )}
                  {/* 类型微标 */}
                  <div className="absolute top-3 right-3 px-2 py-1 bg-black/60 backdrop-blur-md rounded-lg border border-white/10 flex items-center gap-1.5">
                    {item.type === 'CODE' ? <Code className="h-3 w-3 text-emerald-400" /> : 
                     item.type === '3D' ? <Wrench className="h-3 w-3 text-orange-400" /> :
                     item.type === 'INTERACTIVE' ? <MonitorPlay className="h-3 w-3 text-indigo-400" /> :
                     <ImageIcon className="h-3 w-3 text-blue-400" />
                    }
                    <span className="text-[10px] font-black tracking-widest text-white uppercase">{item.format}</span>
                  </div>
                </div>

                {/* 卡片信息区 */}
                <div className="p-5 relative z-10">
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <h4 className="text-white font-bold leading-tight line-clamp-2 pr-4">{item.name}</h4>
                    <button className="text-slate-500 hover:text-white transition-colors shrink-0">
                      <MoreHorizontal className="h-5 w-5" />
                    </button>
                  </div>
                  
                  <div className="flex items-center gap-2 mb-4">
                    <span className="px-2 py-0.5 rounded-md bg-slate-800 text-[11px] font-bold text-slate-300">{item.category}</span>
                    <span className="text-[11px] font-medium text-slate-500">
                      {item.size_bytes < 1024 * 1024 ? (item.size_bytes/1024).toFixed(1) + " KB" : (item.size_bytes/(1024*1024)).toFixed(1) + " MB"}
                    </span>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-slate-800/80">
                    <div className="flex items-center gap-2">
                       <div className="h-6 w-6 rounded-full bg-slate-800 flex items-center justify-center text-[10px] font-bold text-slate-300 border border-slate-700">
                         {item.author.charAt(0)}
                       </div>
                       <span className="text-xs text-slate-400 font-medium">{item.author}</span>
                    </div>
                    {/* Hover 后显现的交互按钮 */}
                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity translate-x-2 group-hover:translate-x-0 transform duration-300">
                       <button className="p-1.5 bg-slate-800 hover:bg-slate-700 rounded-lg text-white transition-colors" title="在此下载">
                         <Download className="h-4 w-4" />
                       </button>
                       <button className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 rounded-lg text-white text-xs font-bold transition-colors">
                         注入课件
                       </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
