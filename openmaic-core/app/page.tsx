'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'motion/react';
import {
  ArrowUp,
  Check,
  ChevronDown,
  Clock,
  Copy,
  ImagePlus,
  Paperclip,
  FileText,
  X,
  Pencil,
  Trash2,
  Settings,
  Sun,
  Moon,
  Monitor,
  BotOff,
  ChevronUp,
} from 'lucide-react';
import { useI18n } from '@/lib/hooks/use-i18n';
import { createLogger } from '@/lib/logger';
import { Button } from '@/components/ui/button';
import { Textarea as UITextarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import { SettingsDialog } from '@/components/settings';
import { UserSettingsDialog } from '@/components/settings/user-settings';
import { OnboardingGuide } from '@/components/onboarding/onboarding-guide';
import { GenerationToolbar } from '@/components/generation/generation-toolbar';
import { AgentBar } from '@/components/agent/agent-bar';
import { useTheme } from '@/lib/hooks/use-theme';
import { nanoid } from 'nanoid';
import { storePdfBlob } from '@/lib/utils/image-storage';
import type { UserRequirements } from '@/lib/types/generation';
import { useSettingsStore } from '@/lib/store/settings';
import { useUserProfileStore, AVATAR_OPTIONS } from '@/lib/store/user-profile';
import {
  StageListItem,
  listStages,
  deleteStageData,
  getFirstSlideByStages,
} from '@/lib/utils/stage-storage';
import { ThumbnailSlide } from '@/components/slide-renderer/components/ThumbnailSlide';
import type { Slide } from '@/lib/types/slides';
import { useMediaGenerationStore } from '@/lib/store/media-generation';
import { toast } from 'sonner';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { useDraftCache } from '@/lib/hooks/use-draft-cache';
import { SpeechButton } from '@/components/audio/speech-button';
import { useTTSPreview } from '@/lib/audio/use-tts-preview';

const log = createLogger('Home');

const WEB_SEARCH_STORAGE_KEY = 'webSearchEnabled';
const LANGUAGE_STORAGE_KEY = 'generationLanguage';
const RECENT_OPEN_STORAGE_KEY = 'recentClassroomsOpen';

interface FormState {
  pdfFile: File | null;
  requirement: string;
  language: 'zh-CN' | 'en-US';
  webSearch: boolean;
}

const initialFormState: FormState = {
  pdfFile: null,
  requirement: '',
  language: 'zh-CN',
  webSearch: false,
};

function HomePage() {
  const { t, locale, setLocale } = useI18n();
  const { theme, setTheme } = useTheme();
  const router = useRouter();
  const [form, setForm] = useState<FormState>(initialFormState);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [settingsSection, setSettingsSection] = useState<
    import('@/lib/types/settings').SettingsSection | undefined
  >(undefined);

  // #14: 学龄标签记忆
  const [selectedGrade, setSelectedGrade] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('fc-selected-grade') || '';
    }
    return '';
  });

  // #34: Placeholder 轮播
  const placeholderExamples = [
    '输入你想学的任何内容，例如：\n「从零学 Python，30 分钟写出第一个程序」',
    '试试这些有趣的课题：\n「用白板给我讲解傅里叶变换的数学之美」',
    '今天想挑战什么？\n「帮我做一个网页版贪吃蛇游戏」',
    '随便学点什么：\n「太阳系的八大行星有什么有趣的故事？」',
    '来点硬核的？\n「用 Arduino 控制 LED 灯带做呼吸灯效果」',
  ];
  const [placeholderIndex, setPlaceholderIndex] = useState(0);
  useEffect(() => {
    const timer = setInterval(() => {
      setPlaceholderIndex((prev) => (prev + 1) % placeholderExamples.length);
    }, 4000);
    return () => clearInterval(timer);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const [userSettingsOpen, setUserSettingsOpen] = useState(false);
  const [adminTapCount, setAdminTapCount] = useState(0);
  const adminTapTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // 🚀 [Titan OS] 自动发车模式状态
  const [isAutoStarting, setIsAutoStarting] = useState(false);
  const [autoStartStatus, setAutoStartStatus] = useState('正在初始化系统...');

  // 🔐 [Titan Admin] 管理员快捷键 Ctrl+Shift+S 打开设置面板
  useEffect(() => {
    const handleAdminShortcut = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === 's') {
        e.preventDefault();
        setSettingsOpen(true);
      }
    };
    window.addEventListener('keydown', handleAdminShortcut);
    return () => window.removeEventListener('keydown', handleAdminShortcut);
  }, []);

  // Draft cache for requirement text
  const { cachedValue: cachedRequirement, updateCache: updateRequirementCache } =
    useDraftCache<string>({ key: 'requirementDraft' });

  const { startPreview } = useTTSPreview();

  // Model setup state
  const currentModelId = useSettingsStore((s) => s.modelId);
  const [recentOpen, setRecentOpen] = useState(true);

  // Hydrate client-only state after mount (avoids SSR mismatch)
  /* eslint-disable react-hooks/set-state-in-effect -- Hydration from localStorage must happen in effect */
  useEffect(() => {
    try {
      // 🛡️ [Titan Tech] 官方生产环境硬核身份穿透：解决跨域 Session 丢失导致的“协议拦截”
      // 生产环境默认授予专业版通行证，确保小学生与老师在任何节点均可无缝进入科研室。
      if (!localStorage.getItem('current_user_email')) {
        localStorage.setItem('current_user_email', 'titan_authorized_pilot@futureclass.ai');
        localStorage.setItem('fc_subscription_status', JSON.stringify({ 
           status: 'active', 
           level: 'professional',
           expires_at: 2000000000000 
        }));
        console.log("🚀 [Titan Auth] 生产环境身份自动驻扎完成。级别：终身专业版");
      }
      
      const saved = localStorage.getItem(RECENT_OPEN_STORAGE_KEY);
      if (saved !== null) setRecentOpen(saved !== 'false');
    } catch {
      /* localStorage unavailable */
    }
    try {
      const savedWebSearch = localStorage.getItem(WEB_SEARCH_STORAGE_KEY);
      const savedLanguage = localStorage.getItem(LANGUAGE_STORAGE_KEY);
      const updates: Partial<FormState> = {};
      if (savedWebSearch === 'true') updates.webSearch = true;
      if (savedLanguage === 'zh-CN' || savedLanguage === 'en-US') {
        updates.language = savedLanguage;
      } else {
        const detected = navigator.language?.startsWith('zh') ? 'zh-CN' : 'en-US';
        updates.language = detected;
      }
      if (Object.keys(updates).length > 0) {
        setForm((prev) => ({ ...prev, ...updates }));
      }

      // [Titan AI / FutureClass 特长生生态联动钩子]
      // 拦截来自课程页面的传参，生成动态的授课剧本预设
      const params = new URLSearchParams(window.location.search);
      const courseTopic = params.get('courseTopic') || params.get('topic');
      const outline = params.get('outline');
      const autoStart = params.get('autoStart') === 'true';

      if (courseTopic) {
        const payload = `【FutureClass 自动排课系统：${courseTopic}】\n\n请为我规划生成这节硬核科技课的互动分镜。\n课程核心切片内容如下 (供参考):\n${outline || '无详细大纲，请你自由发挥讲解'}\n\n要求：\n1. 由小创老师主讲，辅以学生互动。\n2. 直接切入硬核技术点，生成板书结构。\n3. 在开场和关键节点安排 spotlight 或者 3D 动画指示 (如可能)。`;
        
        // 如果开启了自动发车，进入静默加载态
        if (autoStart) {
            console.log("🚀 [Titan OS] 自动发车模式 (Auto-Pilot) 已激活！正在极速部署舱室...");
            setIsAutoStarting(true);
            setAutoStartStatus('正在挂载 Titan 教学引擎...');
        }

        setTimeout(() => {
            updateForm('requirement', payload);
            
            // [Titan Tech 特长生专属] 炫酷入场语音播报
            const currentNickname = useUserProfileStore.getState().nickname || '科技少将';
            const welcomeText = autoStart ? 
                `检测到来自 TITAN 枢纽的直连请求。小创客${currentNickname}，系统正在为您极速部署《${courseTopic}》实战舱，请稍候。` :
                `小创客${currentNickname}，你好！系统已成功挂载 Future Class 引擎。我们准备好一起展开关于《${courseTopic}》的硬核推演了吗？`;

            // 🚀 【火山引擎大模型 TTS 直连】 强制统一使用指定的“呆萌川妹”高质量讲课音色
            const appId = "4780476544";
            const token = "e_t1R3UXzl-qvSTrFdEgh0-NFhjN5p7z";
            const reqid = 'req-fc-' + Date.now() + Math.random().toString().slice(2,8);

            fetch('https://openspeech.bytedance.com/api/v1/tts', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer; ${token}`
              },
              body: JSON.stringify({
                app: { appid: appId, token: token, cluster: "volcano_tts" },
                user: { uid: "titan_student" },
                audio: {
                  voice_type: "zh_female_daimengchuanmei_moon_bigtts",
                  encoding: "mp3",
                  speed_ratio: 1.0,
                  volume_ratio: 1.0,
                  pitch_ratio: 1.0
                },
                request: { reqid: reqid, text: welcomeText, text_type: "plain", operation: "query" }
              })
            }).then(async (res) => {
              const result = await res.json();
              if (result.code === 3000) {
                const binary = atob(result.data);
                const array = new Uint8Array(binary.length);
                for (let i = 0; i < binary.length; i++) array[i] = binary.charCodeAt(i);
                const audioBlob = new Blob([array], { type: 'audio/mp3' });
                const audioUrl = URL.createObjectURL(audioBlob);
                const audio = new window.Audio(audioUrl);
                audio.onended = () => URL.revokeObjectURL(audioUrl);
                await audio.play();
              }
            }).catch(e => console.log('Auto TTS Play failed:', e));

            // 如果是自动发车，且表单已填充，自动点击生成
            if (autoStart) {
                setTimeout(() => {
                   setAutoStartStatus('正在生成互动分镜...');
                   handleGenerate('true'); // 传入标记表示自动重定向
                }, 1500);
            }
        }, 500); // 稍微延迟以体现极客装配感
      }

    } catch {
      /* localStorage unavailable */
    }
  }, []);
  /* eslint-enable react-hooks/set-state-in-effect */

  // Restore requirement draft from cache (derived state pattern — no effect needed)
  const [prevCachedRequirement, setPrevCachedRequirement] = useState(cachedRequirement);
  if (cachedRequirement !== prevCachedRequirement) {
    setPrevCachedRequirement(cachedRequirement);
    if (cachedRequirement) {
      setForm((prev) => ({ ...prev, requirement: cachedRequirement }));
    }
  }

  const [languageOpen, setLanguageOpen] = useState(false);
  // #22: 灵动视差背景偏移量
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  // #38: 卡片追踪辉光坐标 (0-100)
  const [cardGlow, setCardGlow] = useState({ x: 50, y: 50 });
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      // 记录鼠标相对于中心点的百分比位移（-0.5 到 0.5）
      const x = (e.clientX / window.innerWidth) - 0.5;
      const y = (e.clientY / window.innerHeight) - 0.5;
      setMousePos({ x, y });

      // 局部偏移 (用于卡片辉光)
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        const cardX = ((e.clientX - rect.left) / rect.width) * 100;
        const cardY = ((e.clientY - rect.top) / rect.height) * 100;
        setCardGlow({ x: cardX, y: cardY });
      }
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [classrooms, setClassrooms] = useState<StageListItem[]>([]);
  const [thumbnails, setThumbnails] = useState<Record<string, Slide>>({});
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);
  const toolbarRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Close dropdowns when clicking outside
  useEffect(() => {
    if (!languageOpen) return; // Removed themeOpen
    const handleClickOutside = (e: MouseEvent) => {
      if (toolbarRef.current && !toolbarRef.current.contains(e.target as Node)) {
        setLanguageOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [languageOpen]); // Removed themeOpen

  const loadClassrooms = async () => {
    try {
      const list = await listStages();
      setClassrooms(list);
      // Load first slide thumbnails
      if (list.length > 0) {
        const slides = await getFirstSlideByStages(list.map((c) => c.id));
        setThumbnails(slides);
      }
    } catch (err) {
      log.error('Failed to load classrooms:', err);
    }
  };

  useEffect(() => {
    // Clear stale media store to prevent cross-course thumbnail contamination.
    // The store may hold tasks from a previously visited classroom whose elementIds
    // (gen_img_1, etc.) collide with other courses' placeholders.
    useMediaGenerationStore.getState().revokeObjectUrls();
    useMediaGenerationStore.setState({ tasks: {} });

    // eslint-disable-next-line react-hooks/set-state-in-effect -- Store hydration on mount
    loadClassrooms();
  }, []);

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setPendingDeleteId(id);
  };

  const confirmDelete = async (id: string) => {
    setPendingDeleteId(null);
    try {
      await deleteStageData(id);
      await loadClassrooms();
    } catch (err) {
      log.error('Failed to delete classroom:', err);
      toast.error('Failed to delete classroom');
    }
  };

  const updateForm = <K extends keyof FormState>(field: K, value: FormState[K]) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    try {
      if (field === 'webSearch') localStorage.setItem(WEB_SEARCH_STORAGE_KEY, String(value));
      if (field === 'language') localStorage.setItem(LANGUAGE_STORAGE_KEY, String(value));
      if (field === 'requirement') updateRequirementCache(value as string);
    } catch {
      /* ignore */
    }
  };

  const showSetupToast = (icon: React.ReactNode, title: string, desc: string) => {
    toast.custom(
      (id) => (
        <div
          className="w-[356px] rounded-xl border border-amber-200/60 dark:border-amber-800/40 bg-gradient-to-r from-amber-50 via-white to-amber-50 dark:from-amber-950/60 dark:via-slate-900 dark:to-amber-950/60 shadow-lg shadow-amber-500/8 dark:shadow-amber-900/20 p-4 flex items-start gap-3 cursor-pointer"
          onClick={() => {
            toast.dismiss(id);
            setSettingsOpen(true);
          }}
        >
          <div className="shrink-0 mt-0.5 size-9 rounded-lg bg-amber-100 dark:bg-amber-900/40 flex items-center justify-center ring-1 ring-amber-200/50 dark:ring-amber-800/30">
            {icon}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-amber-900 dark:text-amber-200 leading-tight">
              {title}
            </p>
            <p className="text-xs text-amber-700/80 dark:text-amber-400/70 mt-0.5 leading-relaxed">
              {desc}
            </p>
          </div>
          <div className="shrink-0 mt-1 text-[10px] font-medium text-amber-500 dark:text-amber-500/70 tracking-wide">
            <Settings className="size-3.5 animate-[spin_3s_linear_infinite]" />
          </div>
        </div>
      ),
      { duration: 4000 },
    );
  };

  const handleGenerate = async (autoStartFlag?: string) => {
    // ⚔️ 【Titan Tech】主站全域身份鉴定防火墙
    try {
      const userEmail = localStorage.getItem('current_user_email');
      const authStatusStr = localStorage.getItem('fc_subscription_status');
      
      // 🚫 [Titan Bypass] 移除冷酷驱动拦截，改用智能引导逻辑（由 useEffect 兜底其身份）
      if (!userEmail) {
         console.warn("⚠️ 检测到访客身份缺失，尝试使用备用离线协议运行...");
      }
      
      // 2. 付费 / 免费 分流与额度控制
      let isPro = false;
      if (authStatusStr) {
         const authData = JSON.parse(authStatusStr);
         if (authData && authData.status === 'active') isPro = true;
      }
      
      if (!isPro) {
         let usage = parseInt(localStorage.getItem('titan_free_usage') || '0', 10);
         if (usage >= 5) {
            if (window.confirm('🔒 系统过载保护：您的【启蒙版】5次大模型演算配额已完全燃尽！\n指挥官，若需继续构建更深的科技视界，请升级您的算力舱段。是否立即跳转增配平台？')) {
               window.location.href = 'https://ai.zhouxiaomai.com/pricing-demo.html';
            }
            return;
         }
         // 增加磨损度
         localStorage.setItem('titan_free_usage', (usage + 1).toString());
         console.log(`[FC Auth] 免费算力储备燃烧警告... 剩余次数: ${4 - usage}`);
      }
    } catch(e) { console.warn('Auth checks skipped', e); }

    // Validate setup before proceeding
    if (!currentModelId) {
      // 🚀 [Titan Tech Override] Zero-Config Auto Fallback!
      const settings = useSettingsStore.getState();
      settings.setModel('google', 'gemini-3-flash-preview');
    }

    if (!form.requirement.trim()) {
      setError(t('upload.requirementRequired'));
      return;
    }

    setError(null);

    try {
      const userProfile = useUserProfileStore.getState();
      const requirements: UserRequirements = {
        requirement: form.requirement,
        language: form.language,
        userNickname: userProfile.nickname || undefined,
        userBio: userProfile.bio || undefined,
        webSearch: form.webSearch || undefined,
      };

      let pdfStorageKey: string | undefined;
      let pdfFileName: string | undefined;
      let pdfProviderId: string | undefined;
      let pdfProviderConfig: { apiKey?: string; baseUrl?: string } | undefined;

      if (form.pdfFile) {
        pdfStorageKey = await storePdfBlob(form.pdfFile);
        pdfFileName = form.pdfFile.name;

        const settings = useSettingsStore.getState();
        pdfProviderId = settings.pdfProviderId;
        const providerCfg = settings.pdfProvidersConfig?.[settings.pdfProviderId];
        if (providerCfg) {
          pdfProviderConfig = {
            apiKey: providerCfg.apiKey,
            baseUrl: providerCfg.baseUrl,
          };
        }
      }

      const sessionState = {
        sessionId: nanoid(),
        requirements,
        pdfText: '',
        pdfImages: [],
        imageStorageIds: [],
        pdfStorageKey,
        pdfFileName,
        pdfProviderId,
        pdfProviderConfig,
        sceneOutlines: null,
        currentStep: 'generating' as const,
      };
      sessionStorage.setItem('generationSession', JSON.stringify(sessionState));
      if (autoStartFlag === 'true') {
          sessionStorage.setItem('autoStart', 'true');
      }

      router.push('/generation-preview');
    } catch (err) {
      log.error('Error preparing generation:', err);
      setError(err instanceof Error ? err.message : t('upload.generateFailed'));
    }
  };

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return t('classroom.today');
    if (diffDays === 1) return t('classroom.yesterday');
    if (diffDays < 7) return `${diffDays} ${t('classroom.daysAgo')}`;
    return date.toLocaleDateString();
  };

  const canGenerate = !!form.requirement.trim();

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
      e.preventDefault();
      if (canGenerate) handleGenerate();
    }
  };

  return (
    <div className="min-h-[100dvh] w-full bg-[#f8fafc] text-slate-800 relative flex flex-col items-center justify-center p-4 pt-16 md:p-8 overflow-x-hidden font-sans">
      {/* ═══ 活泼的极光与马卡龙波点网格 (C4D 软光风格) ═══ */}
      <div className="absolute inset-0 pointer-events-none z-0">
        <div className="absolute inset-0 bg-[radial-gradient(#e2e8f0_1px,transparent_1px)] bg-[size:24px_24px] opacity-60" />
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes c4d-float {
          0% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-25px) rotate(6deg); }
          100% { transform: translateY(0px) rotate(0deg); }
        }
        @keyframes c4d-pulse {
          0%, 100% { transform: scale(1); opacity: 0.8; }
          50% { transform: scale(1.05); opacity: 1; }
        }
        .c4d-element { animation: c4d-float 6s ease-in-out infinite, c4d-pulse 8s ease-in-out infinite; }
        .c4d-element.delay-1 { animation-delay: 1s, 2s; }
        .c4d-element.delay-2 { animation-delay: 2s, 1s; }
        .c4d-element.delay-3 { animation-delay: 3s, 0s; }
        .c4d-element.delay-4 { animation-delay: 4s, 3s; }
        .preserve-3d { transform-style: preserve-3d; }
      `}} />

      {/* ═══ Top-right — 简化版设置入口（普通用户可见） ═══ */}
      <div className="fixed top-4 right-4 z-40">
        <button
          onClick={() => setUserSettingsOpen(true)}
          className="p-2.5 rounded-full bg-white/60 dark:bg-gray-800/60 backdrop-blur-xl border border-gray-200/50 dark:border-gray-700/50 shadow-sm hover:shadow-md hover:bg-white/80 dark:hover:bg-gray-800/80 transition-all text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300"
          title="偏好设置"
        >
          <Settings className="w-4 h-4" />
        </button>
      </div>

      <SettingsDialog
        open={settingsOpen}
        onOpenChange={(open) => {
          setSettingsOpen(open);
          if (!open) setSettingsSection(undefined);
        }}
        initialSection={settingsSection}
      />

      {/* 简化版用户设置对话框 */}
      <UserSettingsDialog open={userSettingsOpen} onOpenChange={setUserSettingsOpen} />

      {/* #10: 首次访问引导流程 */}
      <OnboardingGuide />

      {/* ═══ Background Decor (C4D 糖果色弥散光球 + 立体几何) ═══ */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0 perspective-[1000px]">
        {/* Glow Effects */}
        <motion.div 
          animate={{ x: mousePos.x * -20, y: mousePos.y * -20 }}
          className="absolute -top-20 -left-10 w-[500px] h-[500px] bg-indigo-300/40 rounded-full blur-[100px] animate-pulse" 
          style={{ animationDuration: '8s' }} 
        />
        <motion.div 
          animate={{ x: mousePos.x * 30, y: mousePos.y * 30 }}
          className="absolute top-40 right-10 w-[400px] h-[400px] bg-rose-300/40 rounded-full blur-[90px] animate-pulse delay-1000" 
          style={{ animationDuration: '7s' }} 
        />
        <motion.div 
          animate={{ x: mousePos.x * -15, y: mousePos.y * 15 }}
          className="absolute bottom-10 left-1/3 w-[600px] h-[600px] bg-amber-200/50 rounded-full blur-[120px] animate-pulse delay-750" 
          style={{ animationDuration: '10s' }} 
        />

        {/* ── C4D Floating Elements ── */}
        
        {/* 1. Purple Sphere */}
        <motion.div 
          animate={{ x: mousePos.x * -50, y: mousePos.y * -50, rotate: mousePos.x * 10 }}
          className="c4d-element absolute top-[15%] left-[10%] xl:left-[18%] w-16 h-16 md:w-24 md:h-24 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 shadow-[inset_-6px_-6px_15px_rgba(0,0,0,0.2),_10px_20px_30px_rgba(129,140,248,0.4)] backdrop-blur-3xl z-10" 
        />

        {/* 2. Frosted Glass Ring */}
        <motion.div 
          animate={{ x: mousePos.x * 70, y: mousePos.y * 40, rotateX: 50 + mousePos.y * 20, rotateY: 25 + mousePos.x * 20 }}
          className="c4d-element delay-1 preserve-3d absolute top-[20%] right-[8%] xl:right-[15%] w-20 h-20 md:w-32 md:h-32 rounded-full border-[10px] md:border-[16px] border-rose-400/80 shadow-[0_15px_40px_rgba(251,113,133,0.3),_inset_0_4px_10px_rgba(255,255,255,0.5)] z-0" 
        />

        {/* 3. Orange Rounded Cube */}
        <motion.div 
          animate={{ x: mousePos.x * -40, y: mousePos.y * 80, rotate: 12 + mousePos.x * 15 }}
          className="c4d-element delay-2 absolute bottom-[25%] left-[8%] xl:left-[15%] w-16 h-16 md:w-28 md:h-28 rounded-[20px] md:rounded-[32px] bg-gradient-to-tr from-amber-300 to-orange-400 shadow-[inset_-5px_-5px_20px_rgba(0,0,0,0.15),_10px_20px_40px_rgba(251,191,36,0.35)] z-10" 
        />

        {/* 4. Turquoise Prism/Triangle */}
        <motion.div 
          animate={{ x: mousePos.x * 90, y: mousePos.y * -20, rotate: -15 + mousePos.x * 10 }}
          className="c4d-element delay-3 absolute bottom-[18%] right-[10%] xl:right-[20%] w-0 h-0 border-l-[30px] md:border-l-[45px] border-l-transparent border-r-[30px] md:border-r-[45px] border-r-transparent border-b-[52px] md:border-b-[78px] border-b-cyan-400/90 drop-shadow-[0_20px_35px_rgba(34,211,238,0.4)] z-0" 
        />

        {/* 5. Mini Crystal Bubbles */}
        <motion.div 
          animate={{ x: mousePos.x * -20, y: mousePos.y * -60 }}
          className="c4d-element delay-4 absolute top-[40%] right-[25%] w-8 h-8 rounded-full bg-white/80 shadow-[inset_-2px_-2px_8px_rgba(0,0,0,0.1),_0_10px_20px_rgba(0,0,0,0.08)] backdrop-blur-xl" 
        />
        <motion.div 
          animate={{ x: mousePos.x * 40, y: mousePos.y * 100 }}
          className="c4d-element delay-1 absolute bottom-[40%] left-[20%] w-5 h-5 rounded-full bg-white/80 shadow-[inset_-1px_-1px_5px_rgba(0,0,0,0.1),_0_6px_15px_rgba(0,0,0,0.08)] backdrop-blur-xl" 
        />
      </div>

      {/* ═══ Hero section: title + input (centered, wider) ═══ */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className={cn(
          'relative z-20 w-full max-w-[800px] flex flex-col items-center',
          classrooms.length === 0 ? 'justify-center min-h-[calc(100dvh-12rem)]' : ''
        )}
      >
        {/* ── Titan UI Logo: FutureClass ── */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1, type: 'spring', stiffness: 200, damping: 20 }}
          className="flex flex-col items-center justify-center mb-6 select-none"
        >
          <div className="flex items-center gap-4">
             <div className="w-14 h-14 md:w-16 md:h-16 bg-gradient-to-br from-amber-400 to-orange-600 rounded-2xl flex items-center justify-center text-white text-3xl md:text-4xl font-black shadow-xl shadow-orange-500/20 ring-4 ring-orange-500/10">
               FC
             </div>
             <h1 className="text-5xl md:text-7xl font-black tracking-tighter text-slate-800 dark:text-white flex items-baseline">
                FutureClass
                <span className="text-orange-500 align-baseline -ml-1 animate-pulse">.</span>
             </h1>
          </div>
        </motion.div>

        {/* ── Slogan ── */}
        <motion.div
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="flex flex-col items-center mb-10"
        >
          <p className="text-sm md:text-base font-bold tracking-[0.2em] font-mono uppercase bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-orange-500 to-purple-500 mb-2">
            AI 驱动 · 个性化互动课堂
          </p>
          <div className="flex items-center gap-2 text-xs text-muted-foreground/60">
             <span className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)] animate-pulse"></span>
             让每个孩子都有专属 AI 导师
          </div>
        </motion.div>

        {/* ── Unified input area ── */}
        <motion.div
          ref={containerRef}
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.35 }}
          className="w-full relative group"
        >
          <div className="w-full rounded-[2rem] border-2 border-white/60 bg-white/60 dark:bg-slate-900/60 backdrop-blur-3xl shadow-[0_20px_60px_-15px_rgba(0,0,0,0.05)] relative overflow-hidden group transition-all duration-500 hover:bg-white/70 hover:shadow-[0_20px_60px_-15px_rgba(0,0,0,0.08)] focus-within:border-violet-300/70 focus-within:shadow-[0_0_40px_-5px_rgba(139,92,246,0.1),0_20px_60px_-15px_rgba(0,0,0,0.1)] focus-within:bg-white/80 dark:focus-within:bg-slate-900/80">
            {/* #38: 会动的追踪辉光层 */}
            <div 
              className="pointer-events-none absolute -inset-px opacity-0 group-hover:opacity-100 transition-opacity duration-300"
              style={{
                background: `radial-gradient(400px circle at ${cardGlow.x}% ${cardGlow.y}%, rgba(139, 92, 246, 0.08), transparent 80%)`,
              }}
            />
            {/* #3: 顶部彩虹反射高光 — 聚焦时增亮 */}
            <div className="absolute top-0 left-0 w-full h-[3px] bg-gradient-to-r from-indigo-300 via-rose-300 to-amber-300 opacity-60 transition-opacity duration-500 group-focus-within:opacity-100 group-focus-within:h-[4px]"></div>
            {/* ── Greeting + Profile + Agents ── */}
            <div className="relative z-20 flex items-start justify-between">
              <div data-onboarding="greeting-bar">
                <GreetingBar />
              </div>
              <div className="pr-3 pt-3.5 shrink-0">
                <AgentBar />
              </div>
            </div>

            {/* ── C4D 糖果学龄速配雷达 ── */}
            {/* ── #14: 学龄匹配（带选中记忆） ── */}
            <div data-onboarding="grade-selector" className="px-5 pt-1 pb-3 flex flex-wrap items-center gap-2 border-b border-border/40 mb-2">
              <span className="text-[11px] font-bold text-slate-400 mr-1 uppercase tracking-wider">学龄匹配</span>
              {[
                { id: 'primary', label: '🚀 趣味小学', color: 'bg-amber-100 text-amber-700 hover:bg-amber-200 border-amber-200', activeColor: 'bg-amber-200 text-amber-800 border-amber-400 ring-2 ring-amber-300/50 shadow-amber-200/50', prompt: '\n\n【教学锚点】：当前受众为小学生。请使用生动活泼的语言、大量生活类比来进行互动。遇到公式请化繁为简。' },
                { id: 'middle', label: '🔬 实战初中', color: 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200 border-emerald-200', activeColor: 'bg-emerald-200 text-emerald-800 border-emerald-400 ring-2 ring-emerald-300/50 shadow-emerald-200/50', prompt: '\n\n【教学锚点】：当前受众为中学生。请保证理论严谨性，同时切入真实工程场景进行原理解剖。' },
                { id: 'high', label: '🌌 极客高中', color: 'bg-indigo-100 text-indigo-700 hover:bg-indigo-200 border-indigo-200', activeColor: 'bg-indigo-200 text-indigo-800 border-indigo-400 ring-2 ring-indigo-300/50 shadow-indigo-200/50', prompt: '\n\n【教学锚点】：当前受众为高级极客高中生。不需要做幼龄化铺垫，请直接切入底层逻辑与微积分等深度专业知识。' },
              ].map((badge) => (
                <button
                  key={badge.id}
                  onClick={() => {
                    const cleanReq = form.requirement.replace(/\n\n【教学锚点】：.*/g, '');
                    updateForm('requirement', cleanReq + badge.prompt);
                    setSelectedGrade(badge.id);
                    localStorage.setItem('fc-selected-grade', badge.id);
                  }}
                  className={`px-3 py-1.5 rounded-full text-[11px] font-extrabold border shadow-sm transition-all hover:-translate-y-0.5 active:scale-95 ${selectedGrade === badge.id ? badge.activeColor : badge.color}`}
                >
                  {badge.label}
                </button>
              ))}
            </div>

            {/* ── #1: Prompt Chips 快捷指令卡片 ── */}
            <div className="px-4 pt-2 pb-1 flex flex-wrap gap-1.5">
              {[
                { emoji: '🧪', text: '做一个彩虹实验' },
                { emoji: '🤖', text: 'Python 入门教程' },
                { emoji: '🌍', text: '太阳系探秘之旅' },
                { emoji: '📐', text: '勾股定理可视化' },
                { emoji: '🎮', text: '用代码做贪吃蛇' },
              ].map((chip) => (
                <button
                  key={chip.text}
                  onClick={() => {
                    const cleanReq = form.requirement.replace(/\n\n【教学锚点】：.*/g, '');
                    const gradePrompt = form.requirement.match(/\n\n【教学锚点】：.*/)?.[0] || '';
                    updateForm('requirement', chip.text + gradePrompt);
                  }}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-medium border border-border/50 text-muted-foreground/70 hover:text-foreground hover:bg-violet-50 hover:border-violet-200 hover:-translate-y-0.5 active:scale-95 transition-all cursor-pointer select-none"
                >
                  <span>{chip.emoji}</span>
                  <span>{chip.text}</span>
                </button>
              ))}
            </div>

            {/* #34: Textarea with rotating placeholder */}
            <textarea
              ref={textareaRef}
              data-onboarding="topic-input"
              placeholder={placeholderExamples[placeholderIndex]}
              className="w-full resize-none border-0 bg-transparent px-4 pt-1 pb-2 text-[13px] leading-relaxed placeholder:text-muted-foreground/40 placeholder:transition-opacity focus:outline-none min-h-[120px] max-h-[300px]"
              value={form.requirement}
              onChange={(e) => updateForm('requirement', e.target.value)}
              onKeyDown={handleKeyDown}
              rows={4}
            />

            {/* #24: 字数统计 */}
            {form.requirement.replace(/\n\n【教学锚点】：.*/g, '').length > 0 && (
              <div className="px-4 pb-1 flex justify-end">
                <span className={cn(
                  'text-[10px] font-mono transition-colors',
                  form.requirement.replace(/\n\n【教学锚点】：.*/g, '').length > 500
                    ? 'text-amber-500' : 'text-muted-foreground/30',
                )}>
                  {form.requirement.replace(/\n\n【教学锚点】：.*/g, '').length} 字
                </span>
              </div>
            )}

            {/* Toolbar — 文件上传 + 快捷键提示 */}
            <div className="px-3 pb-3 flex items-end gap-2">
              <div className="flex-1 min-w-0 flex items-center gap-1.5">
                {/* ── 文件上传按钮（支持多格式） ── */}
                <input
                  type="file"
                  id="doc-upload-input"
                  className="hidden"
                  accept=".pdf,.ppt,.pptx,.doc,.docx,.xls,.xlsx"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) {
                      const MAX_SIZE = 50 * 1024 * 1024; // 50MB
                      if (f.size > MAX_SIZE) {
                        setError('文件过大，请选择小于 50MB 的文件');
                        return;
                      }
                      setError(null);
                      updateForm('pdfFile', f);
                    }
                    e.target.value = '';
                  }}
                />
                {form.pdfFile ? (
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium border border-violet-200/60 bg-violet-100 text-violet-700 max-w-[200px]">
                    <FileText className="size-3.5 shrink-0" />
                    <span className="truncate">{form.pdfFile.name}</span>
                    <span className="text-violet-400 shrink-0">({(form.pdfFile.size / 1024 / 1024).toFixed(1)}MB)</span>
                    <button
                      onClick={() => updateForm('pdfFile', null)}
                      className="size-4 rounded-full inline-flex items-center justify-center hover:bg-violet-200 transition-colors shrink-0"
                    >
                      <X className="size-2.5" />
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => document.getElementById('doc-upload-input')?.click()}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium border border-border/50 text-muted-foreground/70 hover:text-foreground hover:bg-muted/60 transition-all cursor-pointer select-none"
                  >
                    <Paperclip className="size-3.5" />
                    <span>上传文档</span>
                  </button>
                )}
                {/* 快捷键提示 */}
                <span className="text-[10px] text-muted-foreground/30 ml-auto hidden sm:block">⌘+Enter 快速进入课堂</span>
              </div>

              {/* Voice input */}
              <SpeechButton
                size="md"
                onTranscription={(text) => {
                  setForm((prev) => {
                    const next = prev.requirement + (prev.requirement ? ' ' : '') + text;
                    updateRequirementCache(next);
                    return { ...prev, requirement: next };
                  });
                }}
              />

              {/* #5: Send button with enhanced activation state */}
              <button
                onClick={handleGenerate}
                disabled={!canGenerate}
                className={cn(
                  'shrink-0 h-10 rounded-2xl flex items-center justify-center gap-2 transition-all px-5 font-extrabold tracking-wide shadow-xl duration-300 transform',
                  canGenerate
                    ? 'bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white shadow-fuchsia-500/30 hover:shadow-fuchsia-500/50 hover:-translate-y-1 cursor-pointer animate-[pulse_2s_ease-in-out_infinite]'
                    : 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none',
                )}
              >
                <span className="text-xs font-medium">{t('toolbar.enterClassroom')}</span>
                <ArrowUp className="size-3.5" />
              </button>
            </div>
          </div>
        </motion.div>

        {/* ── Error ── */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-3 w-full p-3 bg-destructive/10 border border-destructive/20 rounded-lg"
            >
              <p className="text-sm text-destructive">{error}</p>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* ═══ #27(扩展): 学习统计面板 ═══ */}
      {classrooms.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45 }}
          className="relative z-10 mt-8 w-full max-w-3xl"
        >
          <div className="grid grid-cols-3 gap-3">
            {/* 课程数量 */}
            <div className="rounded-2xl bg-white/50 dark:bg-slate-800/40 backdrop-blur-lg border border-white/60 dark:border-slate-700/40 p-4 flex flex-col items-center gap-1 shadow-sm hover:shadow-md transition-shadow">
              <span className="text-2xl">📚</span>
              <span className="text-xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-violet-600 to-fuchsia-500">
                {classrooms.length}
              </span>
              <span className="text-[10px] text-muted-foreground/60 font-medium">已学课程</span>
            </div>
            {/* 总页数 */}
            <div className="rounded-2xl bg-white/50 dark:bg-slate-800/40 backdrop-blur-lg border border-white/60 dark:border-slate-700/40 p-4 flex flex-col items-center gap-1 shadow-sm hover:shadow-md transition-shadow">
              <span className="text-2xl">📝</span>
              <span className="text-xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-cyan-400">
                {classrooms.reduce((acc, c) => acc + c.sceneCount, 0)}
              </span>
              <span className="text-[10px] text-muted-foreground/60 font-medium">学习页面</span>
            </div>
            {/* 最近活跃 */}
            <div className="rounded-2xl bg-white/50 dark:bg-slate-800/40 backdrop-blur-lg border border-white/60 dark:border-slate-700/40 p-4 flex flex-col items-center gap-1 shadow-sm hover:shadow-md transition-shadow">
              <span className="text-2xl">🔥</span>
              <span className="text-sm font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-orange-500 to-amber-400 truncate max-w-full px-1 text-center leading-7">
                {(() => {
                  const sorted = [...classrooms].sort((a, b) => b.updatedAt - a.updatedAt);
                  const latest = sorted[0]?.name || '—';
                  return latest.length > 8 ? latest.slice(0, 8) + '…' : latest;
                })()}
              </span>
              <span className="text-[10px] text-muted-foreground/60 font-medium">最近学习</span>
            </div>
          </div>
        </motion.div>
      )}

      {/* ═══ Recent classrooms — collapsible ═══ */}
      {classrooms.length > 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="relative z-10 mt-10 w-full max-w-6xl flex flex-col items-center"
        >
          {/* Trigger — divider-line with centered text */}
          <button
            onClick={() => {
              const next = !recentOpen;
              setRecentOpen(next);
              try {
                localStorage.setItem(RECENT_OPEN_STORAGE_KEY, String(next));
              } catch {
                /* ignore */
              }
            }}
            className="group w-full flex items-center gap-4 py-2 cursor-pointer"
          >
            <div className="flex-1 h-px bg-border/40 group-hover:bg-border/70 transition-colors" />
            <span className="shrink-0 flex items-center gap-2 text-[13px] text-muted-foreground/60 group-hover:text-foreground/70 transition-colors select-none">
              <Clock className="size-3.5" />
              {t('classroom.recentClassrooms')}
              <span className="text-[11px] tabular-nums opacity-60">{classrooms.length}</span>
              <motion.div
                animate={{ rotate: recentOpen ? 180 : 0 }}
                transition={{ duration: 0.3, ease: 'easeInOut' }}
              >
                <ChevronDown className="size-3.5" />
              </motion.div>
            </span>
            <div className="flex-1 h-px bg-border/40 group-hover:bg-border/70 transition-colors" />
          </button>

          {/* Expandable content */}
          <AnimatePresence>
            {recentOpen && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
                className="w-full overflow-hidden"
              >
                <div className="pt-8 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-5 gap-y-8">
                  {classrooms.map((classroom, i) => (
                    <motion.div
                      key={classroom.id}
                      initial={{ opacity: 0, y: 16 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{
                        delay: i * 0.04,
                        duration: 0.35,
                        ease: 'easeOut',
                      }}
                    >
                      <ClassroomCard
                        classroom={classroom}
                        slide={thumbnails[classroom.id]}
                        formatDate={formatDate}
                        onDelete={handleDelete}
                        confirmingDelete={pendingDeleteId === classroom.id}
                        onConfirmDelete={() => confirmDelete(classroom.id)}
                        onCancelDelete={() => setPendingDeleteId(null)}
                        onClick={() => router.push(`/classroom/${classroom.id}`)}
                      />
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      ) : (
        /* #20: 空状态插画 — 无历史课程时显示温馨引导 */
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="relative z-10 mt-10 w-full max-w-md flex flex-col items-center text-center py-8"
        >
          <div className="text-6xl mb-4 animate-bounce" style={{ animationDuration: '3s' }}>🚀</div>
          <h3 className="text-base font-bold text-foreground/70 mb-2">开始你的第一堂课</h3>
          <p className="text-xs text-muted-foreground/50 leading-relaxed max-w-xs">
            在上方输入任何你感兴趣的课题，<br />AI 会为你生成一堂完整的互动课堂 ✨
          </p>
        </motion.div>
      )}

      {/* Footer — flows with content, at the very end */}
      {/* 底部版本号 — 连点 5 次触发管理员模式 */}
      <div
        className="mt-auto pt-12 pb-4 text-center text-xs text-muted-foreground/40 font-mono tracking-widest text-[#0ea5e9] cursor-default select-none"
        onClick={() => {
          const newCount = adminTapCount + 1;
          setAdminTapCount(newCount);
          if (adminTapTimer.current) clearTimeout(adminTapTimer.current);
          adminTapTimer.current = setTimeout(() => setAdminTapCount(0), 2000);
          if (newCount >= 5) {
            setAdminTapCount(0);
            setSettingsOpen(true);
          }
        }}
      >
        FutureClass © {new Date().getFullYear()}
        {adminTapCount >= 3 && adminTapCount < 5 && (
          <span className="ml-2 text-[10px] text-amber-400 animate-pulse">
            再点 {5 - adminTapCount} 次进入管理模式
          </span>
        )}
      </div>
    </div>
  );
}

// ─── Greeting Bar — avatar + "Hi, Name", click to edit in-place ────
const MAX_AVATAR_SIZE = 5 * 1024 * 1024;

function isCustomAvatar(src: string) {
  return src.startsWith('data:');
}

function GreetingBar() {
  const { t } = useI18n();
  const avatar = useUserProfileStore((s) => s.avatar);
  const nickname = useUserProfileStore((s) => s.nickname);
  const bio = useUserProfileStore((s) => s.bio);
  const setAvatar = useUserProfileStore((s) => s.setAvatar);
  const setNickname = useUserProfileStore((s) => s.setNickname);
  const setBio = useUserProfileStore((s) => s.setBio);

  const [open, setOpen] = useState(false);
  const [editingName, setEditingName] = useState(false);
  const [nameDraft, setNameDraft] = useState('');
  const [avatarPickerOpen, setAvatarPickerOpen] = useState(false);
  const nameInputRef = useRef<HTMLInputElement>(null);
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const displayName = nickname || '科技少将';

  // Click-outside to collapse
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
        setEditingName(false);
        setAvatarPickerOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  const startEditName = () => {
    setNameDraft(nickname);
    setEditingName(true);
    setTimeout(() => nameInputRef.current?.focus(), 50);
  };

  const commitName = () => {
    setNickname(nameDraft.trim());
    setEditingName(false);
  };

  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > MAX_AVATAR_SIZE) {
      toast.error(t('profile.fileTooLarge'));
      return;
    }
    if (!file.type.startsWith('image/')) {
      toast.error(t('profile.invalidFileType'));
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const img = new window.Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = 128;
        canvas.height = 128;
        const ctx = canvas.getContext('2d')!;
        const scale = Math.max(128 / img.width, 128 / img.height);
        const w = img.width * scale;
        const h = img.height * scale;
        ctx.drawImage(img, (128 - w) / 2, (128 - h) / 2, w, h);
        setAvatar(canvas.toDataURL('image/jpeg', 0.85));
      };
      img.src = reader.result as string;
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  return (
    <div ref={containerRef} className="relative pl-4 pr-2 pt-3.5 pb-1 w-auto">
      <input
        ref={avatarInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleAvatarUpload}
      />

      {/* ── Collapsed pill (always in flow) ── */}
      {!open && (
        <div
          className="flex items-center gap-2.5 cursor-pointer transition-all duration-200 group rounded-full px-2.5 py-1.5 border border-border/50 text-muted-foreground/70 hover:text-foreground hover:bg-muted/60 active:scale-[0.97]"
          onClick={() => setOpen(true)}
        >
          <div className="shrink-0 relative">
            <div className="size-10 rounded-full overflow-hidden ring-[3px] ring-white shadow-sm group-hover:scale-105 transition-all duration-300">
              <img src={avatar} alt="" className="size-full object-cover" />
            </div>
            <div className="absolute -bottom-0.5 -right-0.5 size-4 rounded-full bg-white border border-slate-200 shadow-sm flex items-center justify-center group-hover:bg-violet-50 transition-colors">
              <Pencil className="size-[8px] text-violet-500" />
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <Tooltip>
              <TooltipTrigger asChild>
                <span className="leading-none select-none flex items-center gap-1">
                  <span>
                    <span className="text-xs text-muted-foreground/60 group-hover:text-muted-foreground transition-colors">
                      小创客：
                    </span>
                    <span className="text-[13px] font-semibold text-foreground/85 group-hover:text-foreground transition-colors">
                      {displayName}
                    </span>
                  </span>
                  <ChevronDown className="size-3 text-muted-foreground/30 group-hover:text-muted-foreground/60 transition-colors shrink-0" />
                </span>
              </TooltipTrigger>
              <TooltipContent side="bottom" sideOffset={4}>
                {t('profile.editTooltip')}
              </TooltipContent>
            </Tooltip>
          </div>
        </div>
      )}

      {/* ── Expanded panel (absolute, floating) ── */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -4, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.97 }}
            transition={{ duration: 0.2, ease: [0.25, 0.1, 0.25, 1] }}
            className="absolute left-4 top-3.5 z-50 w-64"
          >
            <div className="rounded-2xl bg-white/95 dark:bg-slate-800/95 backdrop-blur-sm ring-1 ring-black/[0.04] dark:ring-white/[0.06] shadow-[0_1px_8px_-2px_rgba(0,0,0,0.06)] dark:shadow-[0_1px_8px_-2px_rgba(0,0,0,0.3)] px-2.5 py-2">
              {/* ── Row: avatar + name ── */}
              <div
                className="flex items-center gap-2.5 cursor-pointer transition-all duration-200"
                onClick={() => {
                  setOpen(false);
                  setEditingName(false);
                  setAvatarPickerOpen(false);
                }}
              >
                {/* Avatar */}
                <div
                  className="shrink-0 relative cursor-pointer"
                  onClick={(e) => {
                    e.stopPropagation();
                    setAvatarPickerOpen(!avatarPickerOpen);
                  }}
                >
                  <div className="size-8 rounded-full overflow-hidden ring-[1.5px] ring-violet-300/70 dark:ring-violet-500/40 transition-all duration-300">
                    <img src={avatar} alt="" className="size-full object-cover" />
                  </div>
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -bottom-0.5 -right-0.5 size-3.5 rounded-full bg-white dark:bg-slate-800 border border-border/60 flex items-center justify-center"
                  >
                    <ChevronDown
                      className={cn(
                        'size-2 text-muted-foreground/70 transition-transform duration-200',
                        avatarPickerOpen && 'rotate-180',
                      )}
                    />
                  </motion.div>
                </div>

                {/* Text */}
                <div className="flex-1 min-w-0">
                  {editingName ? (
                    <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                      <input
                        ref={nameInputRef}
                        value={nameDraft}
                        onChange={(e) => setNameDraft(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') commitName();
                          if (e.key === 'Escape') {
                            setEditingName(false);
                          }
                        }}
                        onBlur={commitName}
                        maxLength={20}
                        placeholder={t('profile.defaultNickname')}
                        className="flex-1 min-w-0 h-6 bg-transparent border-b border-border/80 text-[13px] font-semibold text-foreground outline-none placeholder:text-muted-foreground/40"
                      />
                      <button
                        onClick={commitName}
                        className="shrink-0 size-5 rounded flex items-center justify-center text-violet-500 hover:bg-violet-100 dark:hover:bg-violet-900/30"
                      >
                        <Check className="size-3" />
                      </button>
                    </div>
                  ) : (
                    <span
                      onClick={(e) => {
                        e.stopPropagation();
                        startEditName();
                      }}
                      className="group/name inline-flex items-center gap-1 cursor-pointer"
                    >
                      <span className="text-[13px] font-semibold text-foreground/85 group-hover/name:text-foreground transition-colors">
                        {displayName}
                      </span>
                      <Pencil className="size-2.5 text-muted-foreground/30 opacity-0 group-hover/name:opacity-100 transition-opacity" />
                    </span>
                  )}
                </div>

                {/* Collapse arrow */}
                <motion.div
                  initial={{ opacity: 0, y: -2 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="shrink-0 size-6 rounded-full flex items-center justify-center hover:bg-black/[0.04] dark:hover:bg-white/[0.06] transition-colors"
                >
                  <ChevronUp className="size-3.5 text-muted-foreground/50" />
                </motion.div>
              </div>

              {/* ── Expandable content ── */}
              <div className="pt-2" onClick={(e) => e.stopPropagation()}>
                {/* Avatar picker */}
                <AnimatePresence>
                  {avatarPickerOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.15, ease: 'easeInOut' }}
                      className="overflow-hidden"
                    >
                      <div className="p-1 pb-2.5 flex items-center gap-1.5 flex-wrap">
                        {AVATAR_OPTIONS.map((url) => (
                          <button
                            key={url}
                            onClick={() => setAvatar(url)}
                            className={cn(
                              'size-7 rounded-full overflow-hidden bg-gray-50 dark:bg-gray-800 cursor-pointer transition-all duration-150',
                              'hover:scale-110 active:scale-95',
                              avatar === url
                                ? 'ring-2 ring-violet-400 dark:ring-violet-500 ring-offset-0'
                                : 'hover:ring-1 hover:ring-muted-foreground/30',
                            )}
                          >
                            <img src={url} alt="" className="size-full" />
                          </button>
                        ))}
                        <label
                          className={cn(
                            'size-7 rounded-full flex items-center justify-center cursor-pointer transition-all duration-150 border border-dashed',
                            'hover:scale-110 active:scale-95',
                            isCustomAvatar(avatar)
                              ? 'ring-2 ring-violet-400 dark:ring-violet-500 ring-offset-0 border-violet-300 dark:border-violet-600 bg-violet-50 dark:bg-violet-900/30'
                              : 'border-muted-foreground/30 text-muted-foreground/50 hover:border-muted-foreground/50',
                          )}
                          onClick={() => avatarInputRef.current?.click()}
                          title={t('profile.uploadAvatar')}
                        >
                          <ImagePlus className="size-3" />
                        </label>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Bio */}
                <UITextarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder={t('profile.bioPlaceholder')}
                  maxLength={200}
                  rows={2}
                  className="resize-none border-border/40 bg-transparent min-h-[72px] !text-[13px] !leading-relaxed placeholder:!text-[11px] placeholder:!leading-relaxed focus-visible:ring-1 focus-visible:ring-border/60"
                />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 🚀 [Titan OS] 自动发车全屏 Loading 遮罩 */}
      <AnimatePresence>
        {isAutoStarting && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-slate-900 flex flex-col items-center justify-center text-white overflow-hidden"
          >
             {/* 极客背景网格 */}
            <div className="absolute inset-0 bg-[radial-gradient(#ffffff08_1px,transparent_1px)] bg-[size:40px_40px] opacity-40" />
            
            {/* 动态光束 */}
            <motion.div 
               animate={{ rotate: 360 }}
               transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
               className="absolute w-[800px] h-[800px] bg-gradient-to-r from-orange-500/10 via-amber-500/5 to-transparent rounded-full blur-[120px]"
            />

            <div className="relative z-10 flex flex-col items-center">
               <motion.div
                 animate={{ scale: [1, 1.1, 1] }}
                 transition={{ duration: 2, repeat: Infinity }}
                 className="w-24 h-24 bg-gradient-to-br from-amber-400 to-orange-600 rounded-3xl flex items-center justify-center text-4xl font-black shadow-2xl shadow-orange-500/40 mb-12"
               >
                 FC
               </motion.div>
               
               <h2 className="text-3xl font-black tracking-widest mb-4 font-orbitron">TITAN CORE DEPLOYING</h2>
               <div className="flex items-center gap-4 mb-20">
                  <span className="w-48 h-1 bg-white/10 rounded-full overflow-hidden relative">
                     <motion.div 
                        animate={{ x: [-200, 200] }}
                        transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                        className="absolute inset-0 w-24 bg-gradient-to-r from-transparent via-orange-500 to-transparent"
                     />
                  </span>
               </div>

               <motion.p 
                 key={autoStartStatus}
                 initial={{ opacity: 0, y: 10 }}
                 animate={{ opacity: 1, y: 0 }}
                 className="text-orange-400 font-mono text-sm tracking-[0.3em] uppercase"
               >
                 {'>'} {autoStartStatus}
               </motion.p>
            </div>

            {/* 底部系统信息 */}
            <div className="absolute bottom-12 left-12 font-mono text-[10px] text-white/20 space-y-1">
               <div>SUB_SYSTEM: FUTURE_CLASS_V2</div>
               <div>LINK_STATUS: TITAN_SYNC_ACTIVE</div>
               <div>AUTH: PILOT_AUTHORIZED</div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Classroom Card — clean, minimal style ──────────────────────
function ClassroomCard({
  classroom,
  slide,
  formatDate,
  onDelete,
  confirmingDelete,
  onConfirmDelete,
  onCancelDelete,
  onClick,
}: {
  classroom: StageListItem;
  slide?: Slide;
  formatDate: (ts: number) => string;
  onDelete: (id: string, e: React.MouseEvent) => void;
  confirmingDelete: boolean;
  onConfirmDelete: () => void;
  onCancelDelete: () => void;
  onClick: () => void;
}) {
  const { t } = useI18n();
  const thumbRef = useRef<HTMLDivElement>(null);
  const [thumbWidth, setThumbWidth] = useState(0);

  useEffect(() => {
    const el = thumbRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => {
      setThumbWidth(Math.round(entry.contentRect.width));
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  return (
    <div className="group cursor-pointer" onClick={confirmingDelete ? undefined : onClick}>
      {/* Thumbnail — large radius, no border, subtle bg */}
      <div
        ref={thumbRef}
        className="relative w-full aspect-[16/9] rounded-2xl bg-slate-100 dark:bg-slate-800/80 overflow-hidden transition-transform duration-200 group-hover:scale-[1.02]"
      >
        {slide && thumbWidth > 0 ? (
          <ThumbnailSlide
            slide={slide}
            size={thumbWidth}
            viewportSize={slide.viewportSize ?? 1000}
            viewportRatio={slide.viewportRatio ?? 0.5625}
          />
        ) : !slide ? (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="size-12 rounded-2xl bg-gradient-to-br from-violet-100 to-blue-100 dark:from-violet-900/30 dark:to-blue-900/30 flex items-center justify-center">
              <span className="text-xl opacity-50">📄</span>
            </div>
          </div>
        ) : null}

        {/* Delete — top-right, only on hover */}
        <AnimatePresence>
          {!confirmingDelete && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
            >
              <Button
                size="icon"
                variant="ghost"
                className="absolute top-2 right-2 size-7 opacity-0 group-hover:opacity-100 transition-opacity bg-black/30 hover:bg-destructive/80 text-white hover:text-white backdrop-blur-sm rounded-full"
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(classroom.id, e);
                }}
              >
                <Trash2 className="size-3.5" />
              </Button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Inline delete confirmation overlay */}
        <AnimatePresence>
          {confirmingDelete && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-3 bg-black/50 backdrop-blur-[6px]"
              onClick={(e) => e.stopPropagation()}
            >
              <span className="text-[13px] font-medium text-white/90">
                {t('classroom.deleteConfirmTitle')}?
              </span>
              <div className="flex gap-2">
                <button
                  className="px-3.5 py-1 rounded-lg text-[12px] font-medium bg-white/15 text-white/80 hover:bg-white/25 backdrop-blur-sm transition-colors"
                  onClick={onCancelDelete}
                >
                  {t('common.cancel')}
                </button>
                <button
                  className="px-3.5 py-1 rounded-lg text-[12px] font-medium bg-red-500/90 text-white hover:bg-red-500 transition-colors"
                  onClick={onConfirmDelete}
                >
                  {t('classroom.delete')}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Info — outside the thumbnail */}
      <div className="mt-2.5 px-1 flex items-center gap-2">
        <span className="shrink-0 inline-flex items-center rounded-full bg-violet-100 dark:bg-violet-900/30 px-2 py-0.5 text-[11px] font-medium text-violet-600 dark:text-violet-400">
          {classroom.sceneCount} {t('classroom.slides')} · {formatDate(classroom.updatedAt)}
        </span>
        <Tooltip>
          <TooltipTrigger asChild>
            <p className="font-medium text-[15px] truncate text-foreground/90 min-w-0">
              {classroom.name}
            </p>
          </TooltipTrigger>
          <TooltipContent
            side="bottom"
            sideOffset={4}
            className="!max-w-[min(90vw,32rem)] break-words whitespace-normal"
          >
            <div className="flex items-center gap-1.5">
              <span className="break-all">{classroom.name}</span>
              <button
                className="shrink-0 p-0.5 rounded hover:bg-foreground/10 transition-colors"
                onClick={(e) => {
                  e.stopPropagation();
                  navigator.clipboard.writeText(classroom.name);
                  toast.success(t('classroom.nameCopied'));
                }}
              >
                <Copy className="size-3 opacity-60" />
              </button>
            </div>
          </TooltipContent>
        </Tooltip>
      </div>
    </div>
  );
}

export default function Page() {
  return <HomePage />;
}
