import { describe, it, expect, vi, beforeEach } from 'vitest';

// mock course locales for testing
const mockZhLocale = {
  "ui": {
    "nav_brand": "Tech Odyssey",
    "nav_epoch_path": "纪元路径",
    "loading": "正在加载课程大纲..."
  },
  "courses": {
    "101": {
      "title": "恐龙复活：古生物学与3D重建",
      "description": "详细的恐龙解剖学、生态复原以及使用 Blender 进行 3D 建模的全流程课程。",
      "lessons": [
        { "id": 1, "title": "古生物学基础：化石与骨骼", "type": "video", "duration_seconds": 600 }
      ]
    },
    "102": {
      "title": "天文学第一模块：宇宙的起源与演化",
      "description": "从宇宙大爆炸到黑洞的奥秘...",
      "lessons": []
    }
  }
};

const mockEnLocale = {
  "ui": {
    "nav_brand": "Tech Odyssey",
    "nav_epoch_path": "Epoch Path",
    "loading": "Loading course outline..."
  },
  "courses": {
    "101": {
      "title": "Dinosaur Resurrection: Paleontology and 3D Reconstruction",
      "description": "A comprehensive course on dinosaur anatomy...",
      "lessons": [
        { "id": 1, "title": "Foundations of Paleontology: Fossils and Skeletons", "type": "video", "duration_seconds": 600 }
      ]
    },
    "102": {
      "title": "Astronomy Module 1: Origin and Evolution of the Universe",
      "description": "From the Big Bang to the mysteries...",
      "lessons": []
    }
  }
};

// Mock environment helpers
const setupBrowserEnv = (search: string, pathname: string, navigatorLang: string) => {
  vi.stubGlobal('window', {
    location: {
      search,
      pathname,
    },
  });

  vi.stubGlobal('navigator', {
    language: navigatorLang,
  });
};

const mockFetchResponse = (ok: boolean, data: any) => {
  const fetchMock = vi.fn().mockResolvedValue({
    ok,
    json: () => Promise.resolve(data),
  });
  vi.stubGlobal('fetch', fetchMock);
  return fetchMock;
};

// Code under test
const detectLanguage = () => {
  const search = window.location.search;
  const urlParams = new URLSearchParams(search);
  const langParam = urlParams.get('lang');
  if (langParam === 'zh' || langParam === 'en') return langParam;

  const path = window.location.pathname;
  if (path.includes('/zh/') || path.endsWith('/zh')) return 'zh';
  if (path.includes('/en/') || path.endsWith('/en')) return 'en';

  const browserLang = navigator.language || '';
  return browserLang.toLowerCase().startsWith('zh') ? 'zh' : 'en';
};

const loadLocales = async () => {
  try {
    const lang = detectLanguage();
    const resp = await fetch(`../locales/course_${lang}.json`);
    if (resp.ok) {
      return await resp.json();
    }
  } catch (e) {
    console.warn('Failed to load locales', e);
  }
  return mockZhLocale; // default fallback
};

describe('course.html 课程详情页动态路由与多语言测试', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  describe('语言检测检测 detectLanguage()', () => {
    it('应该优先通过 URL 参数 ?lang=en 检测为 en', () => {
      setupBrowserEnv('?lang=en', '/resources/course.html', 'zh-CN');
      expect(detectLanguage()).toBe('en');
    });

    it('应该优先通过 URL 参数 ?lang=zh 检测为 zh', () => {
      setupBrowserEnv('?lang=zh', '/resources/course.html', 'en-US');
      expect(detectLanguage()).toBe('zh');
    });

    it('无参数时，应该通过 URL 路径 /en/course 检测为 en', () => {
      setupBrowserEnv('', '/en/course', 'zh-CN');
      expect(detectLanguage()).toBe('en');
    });

    it('无参数时，应该通过 URL 路径 /zh/course 检测为 zh', () => {
      setupBrowserEnv('', '/zh/course', 'en-US');
      expect(detectLanguage()).toBe('zh');
    });

    it('无参数与路径匹配时，应该根据浏览器 navigator.language 为 en-US 检测为 en', () => {
      setupBrowserEnv('', '/resources/course.html', 'en-US');
      expect(detectLanguage()).toBe('en');
    });

    it('无参数与路径匹配时，应该根据浏览器 navigator.language 为 zh-CN 检测为 zh', () => {
      setupBrowserEnv('', '/resources/course.html', 'zh-CN');
      expect(detectLanguage()).toBe('zh');
    });
  });

  describe('语言包与课程数据加载 loadLocales()', () => {
    it('应该根据 detectLanguage() 动态获取 locales 并返回', async () => {
      setupBrowserEnv('?lang=en', '/resources/course.html', 'zh-CN');
      const fetchMock = mockFetchResponse(true, mockEnLocale);

      const localeData = await loadLocales();

      expect(fetchMock).toHaveBeenCalledWith('../locales/course_en.json');
      expect(localeData.ui.nav_epoch_path).toBe('Epoch Path');
      expect(localeData.courses['101'].title).toBe('Dinosaur Resurrection: Paleontology and 3D Reconstruction');
    });

    it('若请求失败，应该返回中文默认语言包进行优雅降级', async () => {
      setupBrowserEnv('?lang=en', '/resources/course.html', 'zh-CN');
      mockFetchResponse(false, null);

      const localeData = await loadLocales();

      expect(localeData.ui.nav_epoch_path).toBe('纪元路径');
      expect(localeData.courses['101'].title).toBe('恐龙复活：古生物学与3D重建');
    });
  });
});
