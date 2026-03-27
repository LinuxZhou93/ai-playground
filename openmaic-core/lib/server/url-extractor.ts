import { createLogger } from '@/lib/logger';

const log = createLogger('UrlExtractor');

export interface ExtractedContent {
  title?: string;
  description?: string;
  content?: string;
  source: string;
}

export async function extractUrlContent(url: string): Promise<ExtractedContent | null> {
  const trimmedUrl = url.trim();
  
  // 识别 YouTube
  if (trimmedUrl.match(/youtube\.com\/watch\?v=|youtu\.be\//i)) {
    log.info(`Recognized YouTube URL: ${trimmedUrl}`);
    return await extractYouTubeContent(trimmedUrl);
  }
  
  // 识别 Bilibili
  if (trimmedUrl.match(/bilibili\.com\/video\/BV/i)) {
    log.info(`Recognized Bilibili URL: ${trimmedUrl}`);
    return await extractBilibiliContent(trimmedUrl);
  }

  return null;
}

async function extractYouTubeContent(url: string): Promise<ExtractedContent | null> {
  try {
    // 尝试获取视频元数据。在服务器端我们通常使用 oEmbed 或 直接 Fetch (虽然可能被拦截)
    // 为了极致稳定性，我们首选获取 oEmbed JSON
    const oembedUrl = `https://www.youtube.com/oembed?url=${encodeURIComponent(url)}&format=json`;
    const res = await fetch(oembedUrl);
    if (!res.ok) return null;
    
    const data = await res.json();
    return {
      title: data.title,
      description: `来自 YouTube 的视频: ${data.author_name}`,
      source: 'YouTube',
      content: `[视频标题]: ${data.title}\n[作者]: ${data.author_name}\n[URL]: ${url}`
    };
  } catch (e) {
    log.warn('YouTube extraction failed:', e);
    return null;
  }
}

async function extractBilibiliContent(url: string): Promise<ExtractedContent | null> {
  try {
    // B站可以通过直接 fetch 页面标题辅助
    const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' } });
    if (!res.ok) return null;
    
    const text = await res.text();
    const titleMatch = text.match(/<title>(.*?)<\/title>/i);
    const title = titleMatch ? titleMatch[1].replace('_下架', '').replace('_哔哩哔哩_bilibili', '') : '未知视频';
    
    return {
      title,
      source: 'Bilibili',
      content: `[视频标题]: ${title}\n[URL]: ${url}\n（这是一个来自 Bilibili 的视频链接，请根据标题和 URL 相关信息进行教学设计。）`
    };
  } catch (e) {
    log.warn('Bilibili extraction failed:', e);
    return null;
  }
}
