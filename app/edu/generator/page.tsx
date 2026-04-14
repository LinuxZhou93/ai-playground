"use client";

import React, { useState, useEffect } from "react";
import { toast } from "sonner";
import { 
  Network, Sparkles, Download, FileText, Plus,
  Wand2, Image as ImageIcon, LayoutTemplate, PenTool,
  RefreshCcw, Send, FileCode2, Rocket, CheckCircle2, AlertCircle,
  Users, GraduationCap, BookOpen, Layers, Palette, SlidersHorizontal,
  MonitorDown, Zap 
} from "lucide-react";

type Block = {
  type: "text" | "image_prompt" | "mermaid" | "code";
  content: string;
};

type Slide = {
  id: string;
  type: string;
  layoutVariant?: "default" | "split-comparison" | "grid-3" | "timeline" | "focus";
  title: string;
  content?: string; // Fallback for old simple rendering
  blocks?: Block[]; // New multimodality block engine
  notes: string;
};

type CourseMeta = {
  name: string;
  category: string;
  total_lessons: number;
  duration_min: number;
};

// 配置选项定义
const AGE_OPTIONS = [
  { label: "4-6岁 幼儿", value: "4-6岁幼儿" },
  { label: "7-9岁 低龄", value: "7-9岁低龄儿童" },
  { label: "10-12岁 少年", value: "10-12岁少年" },
  { label: "13-15岁 初中", value: "13-15岁初中生" },
  { label: "16-18岁 高中", value: "16-18岁高中生" },
];

const LEVEL_OPTIONS = [
  { label: "零基础入门", value: "零基础入门", color: "text-emerald-400 border-emerald-500/30 bg-emerald-500/10" },
  { label: "有一定基础", value: "有一定基础", color: "text-blue-400 border-blue-500/30 bg-blue-500/10" },
  { label: "进阶提升", value: "进阶提升", color: "text-orange-400 border-orange-500/30 bg-orange-500/10" },
  { label: "竞赛/专业级", value: "竞赛专业级", color: "text-red-400 border-red-500/30 bg-red-500/10" },
];

const COURSE_TYPE_OPTIONS = [
  { label: "社区体验课", value: "社区体验课", icon: "🏘️" },
  { label: "学校社团课", value: "学校社团课", icon: "🏫" },
  { label: "营地活动课", value: "营地活动课", icon: "🏕️" },
  { label: "深度系统课", value: "深度系统课", icon: "📚" },
  { label: "赛事集训课", value: "赛事集训课", icon: "🏆" },
  { label: "教师培训课", value: "教师培训课", icon: "👨‍🏫" },
];

const SLIDE_COUNT_OPTIONS = [
  { label: "5页 精简版", value: 5 },
  { label: "8页 标准版", value: 8 },
  { label: "12页 详细版", value: 12 },
  { label: "15页 深度版", value: 15 },
];

const RICHNESS_OPTIONS = [
  { label: "纯文字提纲", value: "纯文字提纲式，不需要配图描述", icon: "📝" },
  { label: "图文均衡", value: "图文并茂，每页建议配图位置和描述", icon: "🖼️" },
  { label: "视觉优先", value: "以视觉为主导，大量配图建议和互动元素描述", icon: "🎨" },
];

const PEDAGOGY_OPTIONS = [
  { label: "标准陈述与讲授", value: "标准陈述讲授法（基础定义解释-举例说明-总结）" },
  { label: "PBL 项目式学习", value: "PBL 项目式（以终为始的任务驱动、情境导入、知识探索、成果复盘）" },
  { label: "5E 探究教学法", value: "5E 探究式（Engagement参与、Exploration探究、Explanation解释、Elaboration精制、Evaluation评价）" },
  { label: "布鲁姆认知分层法", value: "基于 Bloom 认知层级（从记忆、理解底层认知，层层递进到分析、评价和创造）" }
];

export default function GeneratorPage() {
  const [topic, setTopic] = useState("");
  const [referenceText, setReferenceText] = useState("");
  const [isGeneratingAll, setIsGeneratingAll] = useState(false);
  const [slides, setSlides] = useState<Slide[]>([]);
  const [slideOutlines, setSlideOutlines] = useState<any[] | null>(null);
  const [isGeneratingOutline, setIsGeneratingOutline] = useState(false);
  const [lessonPlan, setLessonPlan] = useState("");
  const [courseMeta, setCourseMeta] = useState<CourseMeta | null>(null);
  const [activeSlideIndex, setActiveSlideIndex] = useState(0);

  // 中控台配置状态
  const [ageGroup, setAgeGroup] = useState("10-12岁少年");
  const [level, setLevel] = useState("零基础入门");
  const [courseType, setCourseType] = useState("社区体验课");
  const [slideCount, setSlideCount] = useState(8);
  const [richness, setRichness] = useState("图文并茂，每页建议配图位置和描述");
  const [pedagogy, setPedagogy] = useState("标准陈述讲授法（基础定义解释-举例说明-总结）");
  
  // 意图增强器
  const [isEnhancing, setIsEnhancing] = useState(false);

  // 微调器 State
  const [aiPrompt, setAiPrompt] = useState("");
  const [isTweaking, setIsTweaking] = useState(false);

  // Content Editable State
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [editTitleVal, setEditTitleVal] = useState("");

  // 发布到 ERP 的状态
  const [isPublishing, setIsPublishing] = useState(false);
  const [publishResult, setPublishResult] = useState<{ success: boolean; message: string } | null>(null);
  
  // --- 草稿保护系统 ---
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const saved = localStorage.getItem("fc_draft_slides");
    if (saved) {
      // 延时一点弹出让主界面先呈现
      setTimeout(() => {
        if (window.confirm("📡 侦测到您上次编辑的课件草稿，是否恢复？")) {
          try {
            const payload = JSON.parse(saved);
            if (payload.slides?.length > 0) {
              setSlides(payload.slides);
              setTopic(payload.topic || "");
              setReferenceText(payload.referenceText || "");
              setLessonPlan(payload.lessonPlan || "");
              setCourseMeta(payload.courseMeta || null);
              toast.success("草稿已成功恢复！");
            }
          } catch (e) {}
        } else {
          localStorage.removeItem("fc_draft_slides");
        }
      }, 500);
    }
  }, []);

  useEffect(() => {
    if (mounted && slides.length > 0) {
      const payload = { slides, topic, lessonPlan, courseMeta, referenceText };
      localStorage.setItem("fc_draft_slides", JSON.stringify(payload));
    }
  }, [slides, topic, lessonPlan, courseMeta, referenceText, mounted]);
  // --- 结束草稿保护系统 ---

  const activeSlide = slides[activeSlideIndex] || null;

  // 构建完整的 prompt（将所有中控台参数注入）
  const buildFullPrompt = () => {
    return "课程主题: " + topic + 
      "\n面向学生: " + ageGroup + 
      "\n学习水平: " + level + 
      "\n课程类型: " + courseType + 
      "\n生成页数要求: " + slideCount + " 页" +
      "\n图文风格: " + richness +
      "\n教学法核心框架: " + pedagogy +
      (referenceText ? "\n\n【核心教案/参考文档】:\n" + referenceText : "");
  };

  // 魔法意图大模型扩写器
  const handleEnhanceTopic = async () => {
    if (!topic.trim() || isEnhancing) return;
    setIsEnhancing(true);
    try {
      const res = await fetch('/api/edu/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mode: 'enhance_topic', topic })
      });
      const result = await res.json();
      if (result.success && result.data?.enhanced_topic) {
        setTopic(result.data.enhanced_topic);
        toast.success("✨ 成功萃取深层教育意图！");
      } else {
        toast.error("意图探测失败: " + (result.error || "大模型未响应正确格式"));
      }
    } catch (e) {
      console.error(e);
      toast.error("网络异常，扩写失败");
    } finally {
      setIsEnhancing(false);
    }
  };

  // 阶段一：极速推演课程大纲框架
  const handleGenerateOutline = async () => {
    if (!topic || isGeneratingOutline) return;
    setIsGeneratingOutline(true);
    setSlides([]);
    setSlideOutlines(null);
    setCourseMeta(null);
    setPublishResult(null);
    localStorage.removeItem("fc_draft_slides"); 
    try {
      const res = await fetch('/api/edu/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          mode: 'generate_outline', 
          topic,
          content: buildFullPrompt(),
          slideCount
        })
      });
      const result = await res.json();
      if (result.success && result.data.slide_outlines) {
        setSlideOutlines(result.data.slide_outlines);
        setLessonPlan(result.data.lesson_plan || "");
        setCourseMeta(result.data.course_meta || null);
        toast.success("🎯 课程大纲结构推导完毕！");
      } else {
        toast.error("生成异常：" + (result.error || "未知原因"));
      }
    } catch (error) {
      console.error(error);
      toast.error("网络连接或响应解析异常，生成失败");
    } finally {
      setIsGeneratingOutline(false);
    }
  };

  // 阶段二：根据预审完毕的大纲正式展开为详细图文的幻灯片
  const handleGenerateSlidesFromOutline = async () => {
    if (!slideOutlines || isGeneratingAll) return;
    setIsGeneratingAll(true);
    try {
      const res = await fetch('/api/edu/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          mode: 'generate_slides', 
          slideOutlines
        })
      });
      const result = await res.json();
      if (result.success && result.data.slides) {
        setSlides(result.data.slides);
        setActiveSlideIndex(0);
        toast.success("✅ 全景课程神经重构完成！");
      } else {
        toast.error("幻灯图文填充异常：" + (result.error || "大模型未响应正确格式"));
      }
    } catch (error) {
      console.error(error);
      toast.error("网络连接或响应解析异常，生成失败");
    } finally {
      setIsGeneratingAll(false);
    }
  };

  // 单页微调重生成
  const handleRegenerateSlide = async () => {
    if (!activeSlide || !aiPrompt || isTweaking) return;
    setIsTweaking(true);
    try {
      const res = await fetch('/api/edu/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          mode: 'regenerate_slide', 
          prompt: aiPrompt, 
          currentSlide: activeSlide 
        })
      });
      const result = await res.json();
      if (result.success && result.data) {
        setSlides(prev => {
          const newSlides = [...prev];
          newSlides[activeSlideIndex] = { ...newSlides[activeSlideIndex], ...result.data, id: activeSlide.id };
          return newSlides;
        });
        setAiPrompt("");
      } else {
        toast.error("微调生成失败: " + (result.error || "大模型未按预期返回数据格式"));
      }
    } catch (error) {
      console.error(error);
      toast.error("网络连接或响应解析异常，请重试");
    } finally {
      setIsTweaking(false);
    }
  };

  // 发布到 FutureClass ERP 教务中台
  const handlePublishToERP = async () => {
    if (!courseMeta) return;
    setIsPublishing(true);
    setPublishResult(null);
    try {
      const res = await fetch('/api/edu/publish', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ course_meta: courseMeta, slides, lesson_plan: lessonPlan })
      });
      const result = await res.json();
      if (result.success) {
        setPublishResult({ success: true, message: "课程《" + courseMeta.name + "》已成功发布到 FutureClass 教务中台！" });
      } else {
        setPublishResult({ success: false, message: result.error || "发布失败" });
      }
    } catch (error: any) {
      setPublishResult({ success: false, message: error.message });
    } finally {
      setIsPublishing(false);
    }
  };

  // 下载生成的幻灯片导出为 PPTX 文件格式
  const handleExportPPTX = async () => {
    if (slides.length === 0) return;
    try {
      // 动态引入并兼容多种模块挂载方式 (CommonJS/ESM)
      const PptxGenModule = await import("pptxgenjs");
      const PptxGen = PptxGenModule.default || PptxGenModule;
      const pres = new PptxGen();
      
      // XML 控制字符净化 (防 PowerPoint 损坏报错)
      const sanitizeXml = (str: any) => {
          if (typeof str !== 'string') return "";
          return str.replace(/[^\x09\x0A\x0D\x20-\uD7FF\uE000-\uFFFD\u10000-\u10FFFF]/g, '');
      };

      pres.author = "FutureClass AI";
      pres.company = "FutureClass 研发中心";
      pres.subject = sanitizeXml(topic) || "未命名课程";
      pres.title = sanitizeXml(courseMeta?.name) || "AI自动生成幻灯片";
      pres.layout = "LAYOUT_16x9";

      slides.forEach((s, idx) => {
        const slide = pres.addSlide();
        slide.background = { color: "0B0E14" };

        if (s.type === 'cover') {
          // 封面高级感点缀
          slide.addShape(pres.ShapeType.rect, { x: "40%", y: "30%", w: "20%", h: "1%", fill: { color: "3B82F6" } });
          slide.addText(sanitizeXml(s.title), { 
            x: "10%", y: "35%", w: "80%", h: "20%",
            fontSize: 48, bold: true, color: "FFFFFF", align: "center", charSpacing: 2
          });
          
          let textContent = s.content || "";
          if (!textContent && s.blocks) {
            textContent = s.blocks.map(b => b.content).join("\n");
          }
          if (textContent) {
            slide.addText(sanitizeXml(textContent), { 
              x: "10%", y: "55%", w: "80%", h: "15%",
              fontSize: 24, color: "A0AEC0", align: "center", breakLine: true
            });
          }
          // 封面科技感印章水印
          slide.addText("FutureClass 科创基地", { x: "5%", y: "85%", w: "90%", h: "10%", fontSize: 14, color: "334155", align: "center", bold: true, charSpacing: 8 });
        } else {
          // 内页高级感光带与层次
          slide.addShape(pres.ShapeType.rect, { x: 0, y: "8%", w: "4%", h: "10%", fill: { color: "3B82F6" } });
          slide.addShape(pres.ShapeType.rect, { x: "4%", y: "8%", w: "1%", h: "10%", fill: { color: "4F46E5" } });
          
          slide.addText(sanitizeXml(s.title), { 
            x: "7%", y: "8%", w: "85%", h: "10%",
            fontSize: 32, bold: true, color: "FFFFFF"
          });
          
          slide.addShape(pres.ShapeType.rect, { x: "5%", y: "20%", w: "90%", h: "0.2%", fill: { color: "1E293B" } });
          
          let textContent = s.content || "";
          if (!textContent && s.blocks) {
            textContent = s.blocks.map(b => {
               if (b.type === 'text') return b.content;
               else if (b.type === 'image_prompt') return `[AI影像合成栏位: ${b.content}]`;
               else if (b.type === 'mermaid') return `[算法拓展区]\n${b.content}`;
               return b.content;
            }).join("\n\n");
          }

          slide.addText(sanitizeXml(textContent), { 
            x: "5%", y: "25%", w: "90%", h: "62%",
            fontSize: 22, color: "E2E8F0", breakLine: true, bullet: false, lineSpacing: 36
          });

          // 全局页码与版权印记
          slide.addText(`© FutureClass 教研中心`, { 
            x: "5%", y: "92%", w: "50%", h: "5%",
            fontSize: 12, color: "475569", italic: true
          });
          slide.addText(`SLIDE ${(idx + 1).toString().padStart(2, '0')}`, { 
            x: "85%", y: "92%", w: "10%", h: "5%",
            fontSize: 16, color: "3B82F6", bold: true, align: "right", charSpacing: 2
          });
        }
        
        if (s.notes && s.notes.trim()) {
          slide.addNotes(sanitizeXml(s.notes));
        }
      });

      const safeFileName = `[FutureClass] ${sanitizeXml(courseMeta?.name) || sanitizeXml(topic) || '课件'}`.replace(/[/\\?%*:|"<>]/g, '-');
      await pres.writeFile({ fileName: `${safeFileName}.pptx` });
      toast.success("课件导出成功！");
    } catch (error: any) {
      console.error("PPTX 导出失败", error);
      toast.error("导出失败，PPT 模块未就绪或出现异常: " + (error?.message || String(error)));
    }
  };

  // 手动更新幻灯片
  const updateActiveSlide = (updates: Partial<Slide>) => {
    setSlides(prev => {
      const newSlides = [...prev];
      newSlides[activeSlideIndex] = { ...newSlides[activeSlideIndex], ...updates };
      return newSlides;
    });
  };

  // Chip 选择器组件
  const ChipSelector = ({ options, value, onChange, className }: {
    options: { label: string; value: string | number; icon?: string; color?: string }[];
    value: string | number;
    onChange: (v: any) => void;
    className?: string;
  }) => (
    <div className={"flex flex-wrap gap-2 " + (className || "")}>
      {options.map(opt => {
        const isActive = value === opt.value;
        return (
          <button
            key={String(opt.value)}
            onClick={() => onChange(opt.value)}
            className={"px-3.5 py-2 rounded-xl text-xs font-bold transition-all border " + (
              isActive
                ? (opt.color || "text-indigo-400 border-indigo-500/40 bg-indigo-500/15 shadow-md shadow-indigo-500/10")
                : "text-slate-400 border-slate-700 bg-slate-800/50 hover:bg-slate-800 hover:text-white hover:border-slate-600"
            )}
          >
            {opt.icon && <span className="mr-1.5">{opt.icon}</span>}
            {opt.label}
          </button>
        );
      })}
    </div>
  );

  return (
    <div className="flex flex-col h-[calc(100vh-80px)] bg-[#0d121c] animate-in fade-in duration-700">
      
      {/* 顶部工具栏 */}
      <div className="h-16 shrink-0 border-b border-slate-800 bg-[#080b12] flex items-center justify-between px-6 z-10">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-lg bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-600/20">
            <LayoutTemplate className="h-4 w-4 text-white" />
          </div>
          <div>
            <h1 className="text-white font-black tracking-tight">FutureClass AI 课件引擎</h1>
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest leading-none">Generative Slide Canvas</p>
          </div>
        </div>
        
        {slides.length > 0 && (
          <div className="flex items-center gap-3">
             {courseMeta && (
               <div className="hidden lg:flex items-center gap-3 px-4 py-1.5 bg-slate-800 rounded-lg border border-slate-700 text-xs text-slate-400">
                 <span className="font-mono">{courseMeta.category}</span>
                 <span className="text-slate-600">|</span>
                 <span>{courseMeta.total_lessons} 课时</span>
                 <span className="text-slate-600">|</span>
                 <span>{courseMeta.duration_min} 分钟/节</span>
               </div>
             )}
             <button 
               onClick={handleExportPPTX}
               className="px-4 py-2 bg-[#1A1A24] hover:bg-[#2A2A38] rounded-lg text-xs font-bold text-blue-400 flex items-center gap-2 transition-colors border border-blue-500/30 shadow-[0_0_15px_rgba(59,130,246,0.15)]"
             >
               <MonitorDown className="h-4 w-4" /> 导出交互式 PPTX
             </button>
             <button 
               onClick={handlePublishToERP}
               disabled={isPublishing || !courseMeta}
               className="px-6 py-2 bg-emerald-600 hover:bg-emerald-500 rounded-lg text-xs font-bold text-white flex items-center gap-2 transition-all shadow-lg shadow-emerald-500/20 disabled:opacity-50"
             >
               {isPublishing ? <RefreshCcw className="h-4 w-4 animate-spin" /> : <Rocket className="h-4 w-4" />}
               {isPublishing ? '正在接入...' : '发布到教务中台'}
             </button>
          </div>
        )}
      </div>

      {/* 发布结果提示 */}
      {publishResult && (
        <div className={"px-6 py-3 flex items-center gap-3 text-sm font-bold shrink-0 " + (publishResult.success ? "bg-emerald-500/10 text-emerald-400 border-b border-emerald-500/20" : "bg-red-500/10 text-red-400 border-b border-red-500/20")}>
          {publishResult.success ? <CheckCircle2 className="h-5 w-5" /> : <AlertCircle className="h-5 w-5" />}
          {publishResult.message}
          <button onClick={() => setPublishResult(null)} className="ml-auto text-xs opacity-60 hover:opacity-100">关闭</button>
        </div>
      )}

      {slides.length === 0 ? (
        /* ═══════════════════════════════════════════════════════════
           首屏：全能中控台 (Command Center)
           ═══════════════════════════════════════════════════════════ */
        <div className="flex-1 overflow-y-auto custom-scrollbar">
          <div className="max-w-4xl mx-auto px-6 py-10 space-y-8">
            
            {/* 标题区 */}
            <div className="text-center space-y-3">
              <h2 className="text-4xl font-black text-white tracking-tight">AI 课件生成中控台</h2>
              <p className="text-slate-400 text-sm max-w-lg mx-auto">配置目标学员特征与课程参数，AI 将量身定制最合适的 PPT 教案课件</p>
            </div>

            {/* 主题输入 */}
            <div className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-2xl blur opacity-20 group-hover:opacity-40 transition duration-500"></div>
              <div className="relative bg-slate-900 border border-slate-700 rounded-2xl flex p-2 shadow-2xl items-center">
                <input 
                  type="text" 
                  value={topic}
                  onChange={e => setTopic(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleGenerateAll()}
                  disabled={isGeneratingAll || isEnhancing}
                  placeholder="在此输入干瘪的课程概念，或直接点击右侧智能扩写..."
                  className="flex-1 bg-transparent border-none text-white px-5 py-3 focus:outline-none placeholder:text-slate-500 font-medium text-lg"
                />
                <button 
                  onClick={handleEnhanceTopic}
                  disabled={isEnhancing || !topic.trim()}
                  className="px-4 py-2 bg-gradient-to-r from-blue-600/20 to-purple-600/20 hover:from-blue-500/40 hover:to-purple-500/40 border border-blue-500/30 rounded-xl text-blue-300 font-bold transition-all text-sm flex items-center gap-2 mr-1 disabled:opacity-50"
                >
                  {isEnhancing ? <RefreshCcw className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4 text-purple-400" />}
                  {isEnhancing ? '意图捕获中...' : 'AI 智能扩写'}
                </button>
              </div>
            </div>

            {/* 参数面板网格 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              
              {/* 面向年龄段 */}
              <div className="bg-slate-900/60 backdrop-blur-md border border-slate-800 rounded-2xl p-5">
                <div className="flex items-center gap-2 mb-4">
                  <Users className="h-4 w-4 text-blue-400" />
                  <span className="text-xs font-black text-slate-400 uppercase tracking-widest">面向学生年龄</span>
                </div>
                <ChipSelector 
                  options={AGE_OPTIONS.map(o => ({ ...o, value: o.value }))} 
                  value={ageGroup} 
                  onChange={setAgeGroup} 
                />
              </div>

              {/* 学习水平 */}
              <div className="bg-slate-900/60 backdrop-blur-md border border-slate-800 rounded-2xl p-5">
                <div className="flex items-center gap-2 mb-4">
                  <GraduationCap className="h-4 w-4 text-emerald-400" />
                  <span className="text-xs font-black text-slate-400 uppercase tracking-widest">学习水平</span>
                </div>
                <ChipSelector 
                  options={LEVEL_OPTIONS} 
                  value={level} 
                  onChange={setLevel} 
                />
              </div>

              {/* 课程类型 */}
              <div className="bg-slate-900/60 backdrop-blur-md border border-slate-800 rounded-2xl p-5 md:col-span-2">
                <div className="flex items-center gap-2 mb-4">
                  <BookOpen className="h-4 w-4 text-orange-400" />
                  <span className="text-xs font-black text-slate-400 uppercase tracking-widest">课程类型</span>
                </div>
                <ChipSelector 
                  options={COURSE_TYPE_OPTIONS} 
                  value={courseType} 
                  onChange={setCourseType} 
                />
              </div>

              {/* PPT 页数 */}
              <div className="bg-slate-900/60 backdrop-blur-md border border-slate-800 rounded-2xl p-5">
                <div className="flex items-center gap-2 mb-4">
                  <Layers className="h-4 w-4 text-purple-400" />
                  <span className="text-xs font-black text-slate-400 uppercase tracking-widest">PPT 生成页数</span>
                </div>
                <ChipSelector 
                  options={SLIDE_COUNT_OPTIONS} 
                  value={slideCount} 
                  onChange={setSlideCount} 
                />
              </div>

              {/* 图文丰富度 */}
              <div className="bg-slate-900/60 backdrop-blur-md border border-slate-800 rounded-2xl p-5">
                <div className="flex items-center gap-2 mb-4">
                  <Palette className="h-4 w-4 text-pink-400" />
                  <span className="text-xs font-black text-slate-400 uppercase tracking-widest">图文丰富度</span>
                </div>
                <ChipSelector 
                  options={RICHNESS_OPTIONS} 
                  value={richness} 
                  onChange={setRichness} 
                />
              </div>

              {/* 教学法框架 */}
              <div className="bg-slate-900/60 backdrop-blur-md border border-slate-800 rounded-2xl p-5 md:col-span-2">
                <div className="flex items-center gap-2 mb-4">
                  <BookOpen className="h-4 w-4 text-teal-400" />
                  <span className="text-xs font-black text-slate-400 uppercase tracking-widest">教育流派与教学法映射</span>
                </div>
                <div className="flex flex-wrap gap-3">
                  {PEDAGOGY_OPTIONS.map(opt => (
                    <button
                      key={opt.value}
                      onClick={() => setPedagogy(opt.value)}
                      className={`px-4 py-2 rounded-lg text-sm border font-medium transition-all ${
                        pedagogy === opt.value
                          ? 'border-teal-500 bg-teal-500/20 text-teal-300 shadow-[0_0_15px_rgba(20,184,166,0.15)]'
                          : 'border-slate-700 bg-slate-800/50 text-slate-400 hover:bg-slate-700/50'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* 补充教材/教案输入区 */}
            <div className="bg-slate-900/60 backdrop-blur-md border border-slate-800 rounded-2xl p-5">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-sky-400" />
                  <span className="text-xs font-black text-slate-400 uppercase tracking-widest">提供教案草稿或大纲 (可选)</span>
                </div>
                <span className="text-[10px] bg-slate-800 text-slate-500 px-2 py-0.5 rounded">支持直接粘贴纯文本</span>
              </div>
              <textarea 
                value={referenceText}
                onChange={e => setReferenceText(e.target.value)}
                disabled={isGeneratingAll}
                placeholder="在此处粘贴已有的教学大纲、素材文本或讲义草稿，AI 将自动将其融合提炼..."
                className="w-full bg-slate-950 border border-slate-700/50 rounded-xl p-4 text-sm text-slate-300 focus:outline-none focus:border-indigo-500/50 transition-colors resize-y custom-scrollbar min-h-[140px]"
              />
            </div>

            {/* 当前配置预览条 */}
            <div className="bg-slate-800/40 border border-slate-700/50 rounded-xl px-5 py-3 flex items-center gap-4 text-xs font-medium text-slate-400 flex-wrap">
              <SlidersHorizontal className="h-4 w-4 text-indigo-400 shrink-0" />
              <span className="text-slate-500">当前配置:</span>
              <span className="px-2 py-0.5 bg-blue-500/10 text-blue-400 rounded border border-blue-500/20">{ageGroup}</span>
              <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-400 rounded border border-emerald-500/20">{level}</span>
              <span className="px-2 py-0.5 bg-orange-500/10 text-orange-400 rounded border border-orange-500/20">{courseType}</span>
              <span className="px-2 py-0.5 bg-purple-500/10 text-purple-400 rounded border border-purple-500/20">{slideCount}页</span>
            </div>

            {/* 两阶段生成：大纲预审视图 */}
            {slideOutlines && slides.length === 0 && (
              <div className="bg-slate-900/80 border border-indigo-500/30 rounded-2xl p-6 shadow-[0_0_30px_rgba(99,102,241,0.15)] mt-4">
                <div className="flex items-center gap-3 mb-6">
                  <div className="h-8 w-8 rounded-full bg-indigo-500/20 text-indigo-400 flex items-center justify-center font-black">1</div>
                  <h3 className="text-xl font-bold text-white">大纲预审与意图固化</h3>
                  <span className="text-xs text-indigo-400/80 ml-auto border border-indigo-500/30 px-2 py-1 rounded">可直接修改文本意图，满意后生成</span>
                </div>
                
                <div className="space-y-4 mb-8">
                  {slideOutlines.map((so, idx) => (
                    <div key={idx} className="bg-slate-950 border border-slate-800 rounded-xl p-4 flex gap-4">
                      <div className="w-8 h-8 rounded-lg bg-indigo-600/20 text-indigo-400 font-black flex items-center justify-center shrink-0">
                        {idx + 1}
                      </div>
                      <div className="flex-1 space-y-3">
                        <input 
                          type="text" 
                          value={so.title}
                          onChange={e => {
                            const newOutlines = [...slideOutlines];
                            newOutlines[idx].title = e.target.value;
                            setSlideOutlines(newOutlines);
                          }}
                          className="w-full bg-transparent text-white font-bold text-lg focus:outline-none border-b border-dashed border-slate-700/50 pb-1" 
                        />
                        <textarea 
                          value={so.core_intent}
                          onChange={e => {
                            const newOutlines = [...slideOutlines];
                            newOutlines[idx].core_intent = e.target.value;
                            setSlideOutlines(newOutlines);
                          }}
                          className="w-full bg-slate-900 border border-slate-800 rounded p-3 text-sm text-slate-400 focus:outline-none resize-y min-h-[60px]" 
                        />
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="flex justify-center">
                  <button 
                    onClick={handleGenerateSlidesFromOutline}
                    disabled={isGeneratingAll}
                    className="px-12 py-4 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-lg flex items-center gap-3 transition-all shadow-2xl shadow-emerald-500/30 hover:scale-[1.02] active:scale-[0.98]"
                  >
                    {isGeneratingAll ? <RefreshCcw className="h-5 w-5 animate-spin" /> : <Rocket className="h-5 w-5" />}
                    {isGeneratingAll ? '高保真图文重构中...' : '2. 确认大纲，生成课件'}
                  </button>
                </div>
              </div>
            )}

            {/* 生成按钮（阶段一） */}
            {!slideOutlines && (
              <div className="flex justify-center pt-2 pb-8">
                <button 
                  onClick={handleGenerateOutline}
                  disabled={isGeneratingOutline || !topic.trim()}
                  className="px-12 py-4 rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-black text-lg flex items-center gap-3 disabled:opacity-50 transition-all shadow-2xl shadow-indigo-500/30 hover:shadow-indigo-500/50 hover:scale-[1.02] active:scale-[0.98]"
                >
                  {isGeneratingOutline ? <RefreshCcw className="h-5 w-5 animate-spin" /> : <Sparkles className="h-5 w-5" />}
                  {isGeneratingOutline ? '大纲逻辑推演中...' : '1. 启动教研引擎 (优先预审大纲)'}
                </button>
              </div>
            )}
          </div>
        </div>
      ) : (
        /* ═══════════════════════════════════════════════════════════
           工作台状态（保持不变）
           ═══════════════════════════════════════════════════════════ */
        <div className="flex-1 flex overflow-hidden">
           
           {/* 左侧侧边栏 */}
           <div className="w-[280px] shrink-0 bg-[#080b12] border-r border-slate-800 flex flex-col shadow-[10px_0_30px_rgba(0,0,0,0.5)] z-10 relative">
              <div className="p-5 border-b border-slate-800">
                <h3 className="text-[10px] font-black text-indigo-500 uppercase tracking-widest mb-1">Slide Deck</h3>
                <p className="text-sm font-bold text-slate-200 truncate" title={courseMeta?.name || topic || '未命名课程'}>{courseMeta?.name || topic || '未命名课程'}</p>
              </div>
              <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar bg-slate-900/10">
                {slides.map((s, idx) => (
                  <div 
                    key={s.id}
                    onClick={() => setActiveSlideIndex(idx)}
                    className={"group relative flex flex-col gap-2 cursor-pointer p-3 rounded-2xl transition-all border " + (activeSlideIndex === idx ? "bg-indigo-600/10 border-indigo-500/50 shadow-lg shadow-indigo-500/10" : "bg-slate-900/40 border-slate-800 hover:bg-slate-800 hover:border-slate-700")}
                  >
                    <div className="flex items-center justify-between">
                      <span className={"text-[10px] font-black " + (activeSlideIndex === idx ? "text-indigo-400" : "text-slate-500 group-hover:text-slate-400")}>
                        {(idx + 1).toString().padStart(2, '0')} · {s.type.toUpperCase()}
                      </span>
                    </div>
                    <div className={"w-full aspect-[16/9] rounded-xl border flex flex-col p-3 overflow-hidden transition-colors " + (activeSlideIndex === idx ? "border-indigo-500/30 bg-[#0d121c]" : "border-slate-800 bg-[#0d121c]/50")}>
                      <div className={"text-xs font-bold truncate mb-1 " + (activeSlideIndex === idx ? "text-white" : "text-slate-300")}>{s.title}</div>
                      <div className="text-[9px] text-slate-500 leading-relaxed flex-1 overflow-hidden">
                        {(s.content || "").substring(0, 80)}...
                      </div>
                    </div>
                  </div>
                ))}
                
                <button className="w-full py-4 mt-2 rounded-xl border-2 border-dashed border-slate-700/50 text-slate-500 hover:text-indigo-400 hover:bg-indigo-500/5 hover:border-indigo-500/30 transition-all flex flex-col items-center justify-center gap-1.5 focus:outline-none">
                   <Plus className="h-5 w-5" />
                   <span className="text-[10px] font-black uppercase tracking-wider">插入一页</span>
                </button>
              </div>
           </div>

           {/* 中间主编辑区 */}
           <div className="flex-1 flex flex-col overflow-hidden relative bg-[#0a0d14] bg-[url('/bg-dots.svg')] bg-center">
              
              {/* 上方：画布互动区 */}
              <div className="flex-1 overflow-y-auto px-6 py-8 flex flex-col items-center custom-scrollbar">
                 
                 {/* 大屏画布 (深色质感 强科技感模板) */}
                 <div className="w-full max-w-[960px] aspect-[16/9] bg-[#090C12] rounded-2xl border border-slate-800 shadow-[0_0_60px_rgba(99,102,241,0.15)] overflow-hidden relative flex flex-col shrink-0 group transition-all">
                    
                    {/* 赛博网格与流光极客背景 */}
                    <div className="absolute inset-0 bg-[url('/bg-dots.svg')] opacity-40 pointer-events-none mix-blend-screen" />
                    <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-cyan-500/80 to-transparent shadow-[0_0_15px_rgba(6,182,212,0.8)]" />
                    <div className="absolute bottom-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-indigo-600/50 to-transparent" />
                    <div className="absolute top-0 left-0 w-px h-full bg-gradient-to-b from-cyan-500/30 to-transparent" />
                    
                    {/* 角部高光 */}
                    <div className="absolute top-0 left-0 w-16 h-16 bg-cyan-500/10 blur-[30px]" />
                    <div className="absolute bottom-0 right-0 w-32 h-32 bg-indigo-500/10 blur-[50px]" />
                    
                    {/* 微调加载蒙版 */}
                    {isTweaking && (
                      <div className="absolute inset-0 bg-[#0f141f]/80 backdrop-blur-md z-50 flex flex-col items-center justify-center">
                        <RefreshCcw className="h-10 w-10 text-indigo-500 animate-spin mb-4" />
                        <span className="text-sm font-black text-indigo-400 tracking-widest">神经重构进行中...</span>
                      </div>
                    )}

                    <div className="absolute top-4 left-6 right-6 flex justify-between items-center opacity-0 group-hover:opacity-100 transition-opacity z-20">
                       <span className="px-3 py-1.5 bg-slate-800/80 backdrop-blur-sm border border-slate-700 text-slate-400 rounded-lg text-xs font-black tracking-widest uppercase select-none">
                         SLIDE {(activeSlideIndex + 1).toString().padStart(2, '0')}
                       </span>
                    </div>

                    <div className={"flex-1 p-12 lg:p-16 flex flex-col " + (activeSlide?.type === 'cover' ? "justify-center items-center text-center" : "justify-start")}>
                       {isEditingTitle ? (
                         <div className="w-full mb-8 relative z-10">
                           <input 
                             autoFocus
                             className={"w-full font-black text-white border-b-2 border-cyan-500 focus:outline-none bg-transparent pb-2 " + (activeSlide?.type === 'cover' ? "text-5xl text-center" : "text-4xl")}
                             value={editTitleVal}
                             onChange={(e) => setEditTitleVal(e.target.value)}
                             onBlur={() => { setIsEditingTitle(false); updateActiveSlide({ title: editTitleVal }); }}
                             onKeyDown={(e) => { if(e.key === 'Enter') e.currentTarget.blur(); }}
                           />
                         </div>
                       ) : (
                         <h2 
                           onClick={() => { setEditTitleVal(activeSlide?.title || ""); setIsEditingTitle(true); }}
                           className={"relative z-10 font-black hover:bg-slate-800 cursor-text p-2 rounded-xl -ml-2 transition-colors border border-transparent hover:border-slate-700 " + 
                             (activeSlide?.type === 'cover' 
                               ? "text-5xl mb-8 text-transparent bg-clip-text bg-gradient-to-r from-white to-slate-400" 
                               : "text-4xl mb-8 text-white flex items-center gap-4"
                             )}
                         >
                           {activeSlide?.type !== 'cover' && <Zap className="h-8 w-8 text-cyan-400 shrink-0" />}
                           {activeSlide?.title}
                         </h2>
                       )}

                       <div className={`flex-1 w-full relative z-10 p-5 -ml-5 ${
                         activeSlide?.layoutVariant === 'grid-3' ? 'grid grid-cols-1 md:grid-cols-3 gap-6' : 
                         activeSlide?.layoutVariant === 'split-comparison' ? 'grid grid-cols-1 md:grid-cols-2 gap-8 divide-x divide-slate-700/50' : 
                         'flex flex-col gap-6'
                       }`}>
                         {activeSlide?.blocks?.length ? (
                           activeSlide.blocks.map((block, bIdx) => (
                             <div key={bIdx} className={`p-4 rounded-xl border border-transparent hover:border-slate-700/50 bg-[#0c101a]/30 hover:bg-[#0c101a] transition-all group/block ${activeSlide?.layoutVariant === 'split-comparison' && bIdx > 0 ? 'pl-8' : ''}`}>
                               {/* 区块类型角标 */}
                               <div className="flex items-center gap-2 mb-3 opacity-50 group-hover/block:opacity-100 transition-opacity">
                                 {block.type === 'text' && <FileText className="h-4 w-4 text-slate-400" />}
                                 {block.type === 'image_prompt' && <ImageIcon className="h-4 w-4 text-pink-400" />}
                                 {block.type === 'mermaid' && <Network className="h-4 w-4 text-cyan-400" />}
                                 <span className="text-[10px] uppercase font-bold tracking-widest text-slate-500">{block.type} BLOCK</span>
                               </div>
                               
                               {/* 特化渲染组件 */}
                               {block.type === 'image_prompt' ? (
                                 <div className="w-full h-auto bg-slate-900 border border-slate-700/50 rounded-xl flex flex-col items-center justify-center overflow-hidden shadow-black/50 shadow-lg group/img relative">
                                   <div className="absolute top-0 left-0 w-full bg-gradient-to-b from-black/80 to-transparent px-4 py-2 flex items-center justify-between opacity-0 group-hover/img:opacity-100 transition-opacity z-10">
                                     <span className="text-[10px] text-white/70 truncate mr-2">{block.content}</span>
                                     <ImageIcon className="h-4 w-4 text-pink-400" />
                                   </div>
                                   <img 
                                     src={`https://image.pollinations.ai/prompt/${encodeURIComponent(block.content)}?width=800&height=400&nologo=true&seed=42`} 
                                     alt={block.content}
                                     className="w-full object-cover max-h-[250px] transition-transform duration-700 hover:scale-105"
                                     loading="lazy"
                                   />
                                 </div>
                               ) : block.type === 'mermaid' ? (
                                 <div className="w-full bg-[#080b0f] border border-cyan-900/50 rounded-xl overflow-hidden flex flex-col shadow-cyan-900/20 shadow-lg">
                                   <div className="w-full bg-cyan-950/20 px-4 py-2 flex items-center justify-between border-b border-cyan-900/50">
                                     <span className="text-[10px] text-cyan-500/50 font-mono tracking-widest uppercase">Mermaid Engine Rendered</span>
                                     <Network className="h-4 w-4 text-cyan-500/50" />
                                   </div>
                                   <div className="p-4 bg-slate-100 flex justify-center items-center min-h-[150px]">
                                     <img 
                                       src={`https://mermaid.ink/svg/${btoa(unescape(encodeURIComponent(block.content)))}`}
                                       onError={(e) => { e.currentTarget.style.display = 'none'; e.currentTarget.parentElement!.innerHTML = '<span class="text-xs text-red-500">图谱语法复杂暂不受理，请生成轻量级语法</span>' }}
                                       alt="Mermaid Diagram" 
                                       className="max-h-[250px] w-full object-contain mix-blend-multiply"
                                     />
                                   </div>
                                 </div>
                               ) : (
                                 <textarea 
                                   className="w-full h-full min-h-[100px] resize-none border-none outline-none focus:ring-0 bg-transparent custom-scrollbar text-lg text-slate-300 font-medium leading-relaxed"
                                   value={block.content}
                                   onChange={(e) => {
                                     const newBlocks = [...(activeSlide.blocks || [])];
                                     newBlocks[bIdx].content = e.target.value;
                                     updateActiveSlide({ blocks: newBlocks });
                                   }}
                                 />
                               )}
                             </div>
                           ))
                         ) : (
                           /* 向下兼容旧的单文本框模式 */
                           <textarea 
                             className="w-full h-full min-h-[200px] resize-none border-none outline-none focus:ring-0 bg-transparent custom-scrollbar text-xl lg:text-2xl text-slate-300 font-medium leading-relaxed hover:bg-slate-800/30 focus:bg-[#0c101a] p-5 rounded-2xl transition-colors border border-transparent focus:border-indigo-500/30"
                             value={activeSlide?.content || ""}
                             onChange={(e) => updateActiveSlide({ content: e.target.value })}
                             placeholder="输入正文内容（AI 会自动通过文本段落生成纯净排版）..."
                           />
                         )}
                       </div>
                    </div>
                 </div>

                 {/* AI 局部操作舱 */}
                 <div className="w-full max-w-[700px] mt-8 shrink-0 relative group">
                    <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500/20 to-purple-500/20 rounded-2xl blur-lg transition duration-500 opacity-50 group-hover:opacity-100"></div>
                    <div className="relative bg-[#0d121c] border border-slate-700 p-1.5 rounded-2xl shadow-xl flex items-center">
                       <div className="pl-4 pr-3 flex items-center justify-center">
                         <Sparkles className="h-5 w-5 text-indigo-400" />
                       </div>
                       <input 
                         type="text"
                         value={aiPrompt}
                         onChange={e => setAiPrompt(e.target.value)}
                         onKeyDown={e => e.key === 'Enter' && handleRegenerateSlide()}
                         disabled={isTweaking}
                         placeholder="向 AI 下发指令来改写这页，例如「将这段改为三点提纲形式」..."
                         className="flex-1 bg-transparent border-none text-white lg:px-2 py-3 focus:outline-none text-sm font-medium placeholder:text-slate-500"
                       />
                       <button 
                         disabled={isTweaking || !aiPrompt.trim()}
                         onClick={handleRegenerateSlide}
                         className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 rounded-xl text-white font-bold disabled:opacity-50 transition-colors flex items-center gap-2"
                       >
                         <Send className="h-4 w-4" /> 执行
                       </button>
                    </div>
                 </div>

                 {/* 底部教案与讲义区（已经移动到滚动视图中间） */}
                 <div className="w-full max-w-[960px] mt-8 shrink-0 bg-[#0d121c] border border-slate-800 rounded-2xl flex relative z-10 shadow-xl overflow-hidden mb-12">
                   <div className="flex-1 border-r border-slate-800 p-6 flex flex-col relative group">
                     <div className="absolute top-6 right-6 text-[10px] text-slate-600 font-bold px-2 py-0.5 rounded border border-slate-700 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">当前选中页独占</div>
                     <h4 className="text-xs font-black text-emerald-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                       <FileText className="h-4 w-4 text-emerald-400" /> 本页讲演逐字稿 (SPEAKER NOTES)
                     </h4>
                     <textarea 
                       className="flex-1 w-full bg-[#0a0d14] border border-slate-800/50 rounded-xl p-5 text-sm text-slate-300 focus:outline-none focus:border-emerald-500/50 transition-colors resize-none custom-scrollbar font-medium leading-relaxed"
                       value={activeSlide?.notes || ""}
                       onChange={(e) => updateActiveSlide({ notes: e.target.value })}
                       rows={6}
                       placeholder="在这里补充给讲师看的详细讲课指引..."
                     />
                   </div>
                   <div className="flex-1 p-6 flex flex-col relative group">
                     <div className="absolute top-6 right-6 text-[10px] text-slate-600 font-bold px-2 py-0.5 rounded border border-slate-700 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">全局大纲</div>
                     <h4 className="text-xs font-black text-purple-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                       <Network className="h-4 w-4 text-purple-400" /> 课程总教案大纲 (LESSON PLAN)
                     </h4>
                     <textarea 
                       className="flex-1 w-full bg-[#0a0d14] border border-slate-800/50 rounded-xl p-5 text-sm text-slate-400 focus:outline-none focus:border-purple-500/50 transition-colors resize-none custom-scrollbar font-medium leading-relaxed"
                       value={lessonPlan}
                       onChange={(e) => setLessonPlan(e.target.value)}
                       rows={6}
                       placeholder="AI 会对总课程的教学目标形成一个概览说明..."
                     />
                   </div>
                 </div>

              </div>

           </div>
        </div>
      )}
    </div>
  );
}
