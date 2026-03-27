import { createLogger } from '@/lib/logger';

const log = createLogger('UrlExtractor');

export interface ExtractedContent {
  title?: string;
  description?: string;
  content?: string;
  source: string;
}

/**
 * Titan AI 专属视频技能：全量内容提取器
 * 支持 YouTube 字幕抓取与 Bilibili 官方字幕解析
 */
export async function extractUrlContent(url: string): Promise<ExtractedContent | null> {
  const trimmedUrl = url.trim();
  
  if (trimmedUrl.match(/youtube\.com\/watch\?v=|youtu\.be\//i)) {
    return await extractYouTubeContent(trimmedUrl);
  }
  
  if (trimmedUrl.match(/bilibili\.com\/video\/BV/i)) {
    return await extractBilibiliContent(trimmedUrl);
  }

  return null;
}

/**
 * YouTube 字幕抓取 (借鉴 youtube-transcript 核心算法)
 */
async function extractYouTubeContent(url: string): Promise<ExtractedContent | null> {
  try {
    const videoId = url.match(/(?:v=|\/be\/)([\w-]{11})/)?.[1];
    if (!videoId) return null;

    // 1. 获取基本元数据
    const metaRes = await fetch(`https://www.youtube.com/oembed?url=${encodeURIComponent(url)}&format=json`);
    const meta = metaRes.ok ? await metaRes.json() : { title: 'YouTube 视频' };

    // 2. 尝试抓取字幕列表 (通过获取页面并搜索 timedtext 指标)
    log.info(`Attempting full transcript fetch for YouTube: ${videoId}`);
    const pageRes = await fetch(`https://www.youtube.com/watch?v=${videoId}`, {
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36' }
    });
    const html = await pageRes.text();
    
    // 搜索 captions 配置
    const captionsMatch = html.match(/"captions":\s*({.*?}),\s*"videoDetails"/);
    let transcriptText = '';
    
    if (captionsMatch) {
      try {
        const captionsJson = JSON.parse(captionsMatch[1]);
        const tracks = captionsJson.playerCaptionsTracklistRenderer?.captionTracks;
        if (tracks && tracks.length > 0) {
          // 优先取中文字幕，否则取第一条
          const track = tracks.find((t: any) => t.languageCode === 'zh') || tracks[0];
          const trackRes = await fetch(track.baseUrl + '&fmt=json3');
          const trackJson = await trackRes.json();
          transcriptText = trackJson.events
            .filter((e: any) => e.segs)
            .map((e: any) => e.segs.map((s: any) => s.utf8).join(''))
            .join(' ');
        }
      } catch (parseErr) {
        log.warn('YouTube captions parsing failed:', parseErr);
      }
    }

    const content = transcriptText 
      ? `[全量视频转录内容]:\n${transcriptText.slice(0, 8000)}` 
      : `[视频元数据]:\n标题: ${meta.title}\n作者: ${meta.author_name}\n(注: 未能提取到字幕，请根据标题进行课程设计)`;

    return {
      title: meta.title,
      source: 'YouTube',
      content
    };
  } catch (e) {
    log.warn('YouTube deep extraction failed:', e);
    return null;
  }
}

/**
 * Bilibili 全量字幕抓取 (基于 cid 解析)
 */
async function extractBilibiliContent(url: string): Promise<ExtractedContent | null> {
  try {
    const bvid = url.match(/BV[\w]*/i)?.[0];
    if (!bvid) return null;

    // 1. 获取 cid
    const viewRes = await fetch(`https://api.bilibili.com/x/web-interface/view?bvid=${bvid}`, {
      headers: { 'User-Agent': 'Mozilla/5.0', 'Referer': 'https://www.bilibili.com' }
    });
    const viewJson = await viewRes.json();
    if (viewJson.code !== 0) return null;
    
    const { title, desc, cid, aid } = viewJson.data;

    // 2. 获取字幕链接
    log.info(`Fetching Bilibili transcript for: ${title}`);
    const playerRes = await fetch(`https://api.bilibili.com/x/player/v2?aid=${aid}&cid=${cid}`, {
      headers: { 'User-Agent': 'Mozilla/5.0', 'Referer': 'https://www.bilibili.com' }
    });
    const playerJson = await playerRes.json();
    const subtitles = playerJson.data?.subtitle?.subtitles;
    
    let transcriptText = '';
    if (subtitles && subtitles.length > 0) {
      const subUrl = 'https:' + subtitles[0].subtitle_url;
      const subContentRes = await fetch(subUrl);
      const subData = await subContentRes.json();
      transcriptText = subData.body.map((item: any) => item.content).join(' ');
    }

    const content = transcriptText
      ? `[Bilibili 全量转录文本]:\n${transcriptText.slice(0, 8000)}`
      : `[Bilibili 视频摘要]:\n标题: ${title}\n简介: ${desc}`;

    return {
      title,
      source: 'Bilibili',
      content
    };
  } catch (e) {
    log.warn('Bilibili deep extraction failed:', e);
    return null;
  }
}
