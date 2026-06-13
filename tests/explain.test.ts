import { describe, it, expect, vi, beforeEach } from 'vitest';

// 模拟浏览器环境的全局变量
const setupBrowserEnv = (lang: string | null, navigatorLang: string) => {
  // 模拟 window.location
  const search = lang ? `?lang=${lang}` : '';
  vi.stubGlobal('window', {
    location: {
      search,
    },
  });

  // 模拟 navigator
  vi.stubGlobal('navigator', {
    language: navigatorLang,
    userLanguage: navigatorLang,
  });
};

// 模拟 fetch 响应
const mockFetchResponse = (ok: boolean, data: any) => {
  const fetchMock = vi.fn().mockResolvedValue({
    ok,
    json: () => Promise.resolve(data),
  });
  vi.stubGlobal('fetch', fetchMock);
  return fetchMock;
};

// 默认的中文降级字典
const defaultZhLocale = {
  "title": "✨ 秒懂万物 ｜ FutureClass 全息漫画科普故事机",
  "logoSubtitle": "秒懂万物全息故事机 V1.0",
  "grades": {
    "junior": "🧪 实战初中 / 初中组",
    "primary": "🦄 趣味小学 / 小学组",
    "senior": "🚀 极客高中 / 高中组"
  },
  "inputPlaceholder": "输入你想推演和学习的任何概念，例如：「汽车扭矩和马力」...",
  "presets": [
    {"label": "🚗 汽车扭矩", "val": "汽车扭矩与马力的工作原理"}
  ],
  "submitBtn": "🛸 启动全息科普推演",
  "loadingTitle": "正在链接 Titan 算力中枢",
  "loadingMsg": "正在建立物理切片信道...",
  "escapeHint": "ESC 退出影院",
  "visualPromptPlaceholder": "正在同步全息信道画面分镜描述...",
  "aiStatusDrawing": "AI 正在绘制画面...",
  "aiStatusDrawingPage": "AI 正在绘制本页分镜画面...",
  "aiStatusFailed": "⚠️ 画面绘制受阻，已启用全息投影占位",
  "charXiaomai": "周小麦",
  "charRobot": "小创老师",
  "storyLoading": "正在加载故事剧本...",
  "exitBtn": "🚪 退出课堂",
  "prevBtn": "◀ 上一页",
  "nextBtn": "下一页 <span>▶</span>",
  "finishBtn": "完成推演 <span>✔</span>",
  "inputPlaceholders": [
    "输入你想学习的科学概念，例如：「量子纠缠的原理」"
  ],
  "ageTexts": {
    "primary": "小学段（侧重趣味化、大白话和生活比喻）",
    "junior": "初中段（侧重简单公式、硬核力学/物理切片科普）",
    "senior": "高中段（侧重专业物理/化学/数学推导、核心公式讲解）"
  },
  "systemPrompt": "你是一个顶尖的科普漫画编剧与少儿科学教育专家...",
  "userPrompt": "请为我推演解释概念：“{concept}”。学龄段匹配要求为：{ageText}。请务必返回8个步骤 of 纯 JSON 数组！",
  "fallbackStep": {
    "title": "系统智能演算中",
    "desc": "小创老师：'小麦，由于算力抖动，这部分的时空碎片还在拼装，我们先看看前后文！' 周小麦：'没问题，小创老师！'",
    "visual_prompt": "全息量子屏幕在轻微振荡"
  },
  "connectingTitle": "同步科普大纲数据中...",
  "connectingDesc": "Titan大模型正在实时将您输入的概念重构为交互漫画科普大纲...",
  "alertEmpty": "请先输入想学的科学/技术概念！",
  "alertFailed": "全息演算失败，原因: {error}",
  "xiaomaiNames": ["小麦：", "小麦说", "小麦:", "小麦 :"],
  "robotNames": ["机器人：", "小创老师：", "小创：", "小创老师:", "机器人:", "小创老师 :", "小创 :"]
};

const defaultEnLocale = {
  "title": "✨ Understand Everything",
  "logoSubtitle": "Holographic Science Story Machine V1.0",
  "grades": {
    "junior": "🧪 Junior High / Intermediate",
    "primary": "🦄 Primary School / Beginner",
    "senior": "🚀 Senior High / Advanced"
  },
  "inputPlaceholder": "Enter any concept...",
  "presets": [
    {"label": "🚗 Car Torque", "val": "How car torque and horsepower work"}
  ],
  "submitBtn": "🛸 Launch Holographic Science Deduction",
  "loadingTitle": "Connecting to Titan Computing Hub",
  "loadingMsg": "Establishing physical slice channel...",
  "escapeHint": "ESC to Exit Cinema",
  "visualPromptPlaceholder": "Synchronizing holographic channel scene description...",
  "aiStatusDrawing": "AI is drawing the scene...",
  "aiStatusDrawingPage": "AI is drawing the scene for this page...",
  "aiStatusFailed": "⚠️ Image generation blocked",
  "charXiaomai": "Xiaomai",
  "charRobot": "Mr. Chuang",
  "storyLoading": "Loading story script...",
  "exitBtn": "🚪 Exit Class",
  "prevBtn": "◀ Prev Page",
  "nextBtn": "Next Page <span>▶</span>",
  "finishBtn": "Finish Deduction <span>✔</span>",
  "inputPlaceholders": [
    "Enter the science concept you want to learn"
  ],
  "ageTexts": {
    "primary": "Primary school level",
    "junior": "Junior high level",
    "senior": "Senior high level"
  },
  "systemPrompt": "You are a top science comic screenwriter...",
  "userPrompt": "Please deduce and explain the concept: \"{concept}\"...",
  "fallbackStep": {
    "title": "System Intelligent Deduction in Progress",
    "desc": "Mr. Chuang: 'Xiaomai...'",
    "visual_prompt": "The holographic quantum screen is oscillating slightly"
  },
  "connectingTitle": "Synchronizing Science Outline Data...",
  "connectingDesc": "The Titan large model is reconstructing...",
  "alertEmpty": "Please enter the science/tech concept you want to learn first!",
  "alertFailed": "Holographic deduction failed, reason: {error}",
  "xiaomaiNames": ["Xiaomai:", "Xiaomai says", "Xiaomai :"],
  "robotNames": ["Robot:", "Mr. Chuang:", "Chuang:", "Mr. Chuang :", "Robot :"]
};

// 提取 explain.html 中的核心检测与加载逻辑进行测试
function detectLanguage(search: string, navigatorLanguage: string) {
  const urlParams = new URLSearchParams(search);
  const langParam = urlParams.get('lang');
  if (langParam) {
    return langParam.startsWith('en') ? 'en' : 'zh';
  }
  const navLang = navigatorLanguage || 'zh';
  return navLang.startsWith('en') ? 'en' : 'zh';
}

async function loadLocale(search: string, navigatorLanguage: string) {
  const locale = detectLanguage(search, navigatorLanguage);
  try {
    const response = await fetch(`/locales/${locale}.json`);
    if (!response.ok) throw new Error('Failed to load locale file');
    return await response.json();
  } catch (err) {
    // 降级策略
    return defaultZhLocale;
  }
}

describe('explain.html 语言包加载与降级策略测试', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('应该通过 URL 参数 ?lang=en 动态检测并加载英文语言包', async () => {
    setupBrowserEnv('en', 'zh-CN');
    const fetchMock = mockFetchResponse(true, defaultEnLocale);

    const t = await loadLocale('?lang=en', 'zh-CN');

    expect(fetchMock).toHaveBeenCalledWith('/locales/en.json');
    expect(t.title).toBe('✨ Understand Everything');
    expect(t.charXiaomai).toBe('Xiaomai');
  });

  it('应该通过 URL 参数 ?lang=zh 动态检测并加载中文语言包', async () => {
    setupBrowserEnv('zh', 'en-US');
    const fetchMock = mockFetchResponse(true, defaultZhLocale);

    const t = await loadLocale('?lang=zh', 'en-US');

    expect(fetchMock).toHaveBeenCalledWith('/locales/zh.json');
    expect(t.title).toBe('✨ 秒懂万物 ｜ FutureClass 全息漫画科普故事机');
    expect(t.charXiaomai).toBe('周小麦');
  });

  it('当无 URL 参数时，应该根据 navigator.language = en-US 动态检测并加载英文语言包', async () => {
    setupBrowserEnv(null, 'en-US');
    const fetchMock = mockFetchResponse(true, defaultEnLocale);

    const t = await loadLocale('', 'en-US');

    expect(fetchMock).toHaveBeenCalledWith('/locales/en.json');
    expect(t.title).toBe('✨ Understand Everything');
  });

  it('当无 URL 参数时，应该根据 navigator.language = zh-CN 动态检测并加载中文语言包', async () => {
    setupBrowserEnv(null, 'zh-CN');
    const fetchMock = mockFetchResponse(true, defaultZhLocale);

    const t = await loadLocale('', 'zh-CN');

    expect(fetchMock).toHaveBeenCalledWith('/locales/zh.json');
    expect(t.title).toBe('✨ 秒懂万物 ｜ FutureClass 全息漫画科普故事机');
  });

  it('当网络请求失败时，应该触发降级策略，默认加载中文语言包', async () => {
    setupBrowserEnv('en', 'en-US');
    const fetchMock = mockFetchResponse(false, null); // 模拟请求失败

    const t = await loadLocale('?lang=en', 'en-US');

    expect(fetchMock).toHaveBeenCalledWith('/locales/en.json');
    // 降级为中文
    expect(t.title).toBe('✨ 秒懂万物 ｜ FutureClass 全息漫画科普故事机');
    expect(t.charXiaomai).toBe('周小麦');
  });
});