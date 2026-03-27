import { createLogger } from '@/lib/logger';
import { searchWithTavily, formatSearchResultsAsContext } from '@/lib/web-search/tavily';
import { resolveWebSearchApiKey } from '@/lib/server/provider-config';

const log = createLogger('UrlExtractor');

export interface ExtractedContent {
  title?: string;
  description?: string;
  content?: string;
  source: string;
}

/**
 * YouTube 字幕抓取逻辑
 */
async function extractYouTubeContent(url: string): Promise<ExtractedContent | null> {
  try {
    let videoId = '';
    const vMatch = url.match(/[?&]v=([^&]+)/);
    if (vMatch) {
      videoId = vMatch[1];
    } else {
      const beMatch = url.match(/youtu\.be\/([^?&]+)/) || url.match(/youtube\.com\/(?:live|shorts)\/([^?&]+)/);
      if (beMatch) videoId = beMatch[1];
    }

    if (!videoId) return null;

    let title = 'YouTube 视频';
    try {
      const oRes = await fetch(`https://www.youtube.com/oembed?url=${encodeURIComponent(`https://www.youtube.com/watch?v=${videoId}`)}&format=json`);
      if (oRes.ok) title = (await oRes.json()).title;
    } catch (e) {}

    const pageRes = await fetch(`https://www.youtube.com/watch?v=${videoId}`, {
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36' }
    });
    const html = await pageRes.text();
    
    let transcriptText = '';
    const captionsMatch = html.match(/"captions":\s*({.*?}),\s*"videoDetails"/);
    
    if (captionsMatch) {
      try {
        const captionsJson = JSON.parse(captionsMatch[1]);
        const tracks = captionsJson.playerCaptionsTracklistRenderer?.captionTracks;
        if (tracks && tracks.length > 0) {
          const track = tracks.find((t: any) => t.languageCode === 'zh') || tracks.find((t: any) => t.languageCode === 'en') || tracks[0];
          const trackRes = await fetch(track.baseUrl + '&fmt=json3');
          const trackJson = await trackRes.json();
          transcriptText = trackJson.events.filter((e: any) => e.segs).map((e: any) => e.segs.map((s: any) => s.utf8).join('')).join(' ');
        }
      } catch (e) {}
    }

    const content = transcriptText 
      ? `[全量视频转录内容]:\n${transcriptText.slice(0, 8000)}` 
      : `[提示]: 未能自动提取字幕轨道。视频标题为 "${title}"。`;

    return { title, source: 'YouTube', content: `视频链接: https://www.youtube.com/watch?v=${videoId}\n${content}` };
  } catch (e) {
    log.error('YouTube extraction error:', e);
    return null;
  }
}

/**
 * Bilibili 深层提取逻辑
 */
async function extractBilibiliContent(url: string): Promise<ExtractedContent | null> {
  try {
    const bvid = url.match(/BV[\w]*/i)?.[0];
    if (!bvid) return null;

    const viewRes = await fetch(`https://api.bilibili.com/x/web-interface/view?bvid=${bvid}`, {
      headers: { 'User-Agent': 'Mozilla/5.0', 'Referer': 'https://www.bilibili.com' }
    });
    const viewJson = await viewRes.json();
    if (viewJson.code !== 0) return null;
    
    const { title, desc, cid, aid } = viewJson.data;

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

    const content = transcriptText ? `[Bilibili 全量转录文本]:\n${transcriptText.slice(0, 8000)}` : `[Bilibili 摘要]: ${title}\n${desc}`;
    return { title, source: 'Bilibili', content: `视频链接: ${url}\n${content}` };
  } catch (e) {
    return null;
  }
}

/**
 * Titan AI 专属视频技能：全量内容提取器
 */
export async function extractUrlContent(url: string, enableSearchFallback = true): Promise<ExtractedContent | null> {
  const trimmedUrl = url.trim();
  
  let result: ExtractedContent | null = null;

  if (trimmedUrl.match(/youtube\.com\/watch\?|youtu\.be\/|youtube\.com\/live\/|youtube\.com\/shorts\//i)) {
    result = await extractYouTubeContent(trimmedUrl);
  } else if (trimmedUrl.match(/bilibili\.com\/video\/BV/i)) {
    result = await extractBilibiliContent(trimmedUrl);
  }

  // 如果原生提取失败且开启了搜索补全
  if ((!result || !result.content || result.content.includes('未能自动提取字幕')) && enableSearchFallback) {
    log.info('Native extraction limited, attempting Tavily web search fallback...');
    const apiKey = resolveWebSearchApiKey();
    if (apiKey) {
      try {
        const searchResult = await searchWithTavily({ 
          query: `site:youtube.com OR site:bilibili.com 详细内容解析 ${trimmedUrl}`, 
          apiKey,
          maxResults: 5
        });
        const fallbackContent = formatSearchResultsAsContext(searchResult);
        if (fallbackContent) {
          if (result) {
            result.content = `${result.content}\n\n[联网补充辅助资料]:\n${fallbackContent}`;
          } else {
            result = {
              title: '视频网页内容 (联网解析)',
              source: 'WebSearch-Fallback',
              content: fallbackContent
            };
          }
        }
      } catch (e) {
        log.warn('Web search fallback failed:', e);
      }
    }
  }

  return result;
}
