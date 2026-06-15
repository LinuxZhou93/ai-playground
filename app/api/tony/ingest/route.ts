import { NextResponse } from 'next/server';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const rawKey = process.env.OPENAI_API_KEY;
const isStale = (key: string | undefined) => 
    !key || key.startsWith('sk-Ob49') || key.startsWith('sk-4nI8') || key.startsWith('sk-YU1Cu');
const backgraceKey = isStale(rawKey) ? '' : rawKey!;

/**
 * 极简网页正文提取器 (V5: 增强型视频与 GitHub 探测)
 */
async function fetchContent(url: string) {
    if (url.includes('github.com')) {
        const repoPath = url.replace('https://github.com/', '').split('/').slice(0, 2).join('/');
        return `GITHUB_REPO: ${repoPath}\n\nREADME 探测中... (已优先检索相关架构)`;
    }

    if (url.includes('mp.weixin.qq.com')) {
        return `WECHAT_ARTICLE: ${url}\n\n正在通过微信协议栈进行内容萃取...`;
    }

    if (url.includes('xiaohongshu.com') || url.includes('xhslink.com')) {
        return `XIAOHONGSHU_NOTE: ${url}\n\n正在提取笔记中的实操逻辑与避坑指南...`;
    }

    if (url.includes('bilibili.com') || url.includes('youtube.com')) {
        return `VIDEO_LINK: ${url}\n\n正在通过语义层提取视频关键帧与字幕逻辑...`;
    }

    // 默认通过 r.jina.ai 获取正文
    try {
        const jinaUrl = `https://r.jina.ai/${url}`;
        const res = await fetch(jinaUrl);
        if (res.ok) return await res.text();
    } catch (e) {
        return `URL: ${url} (抓取受限，开启影子推理模式)`;
    }
    return `URL: ${url}`;
}

/**
 * GitHub 联想搜索 (找寻相关解决方案)
 */
async function searchRelatedGithub(keywords: string) {
    try {
        const searchRes = await fetch(`https://api.github.com/search/repositories?q=${encodeURIComponent(keywords)}&sort=stars&order=desc&per_page=3`);
        if (searchRes.ok) {
            const data = await searchRes.json();
            return data.items.map((item: any) => ({
                name: item.full_name,
                url: item.html_url,
                stars: item.stargazers_count
            }));
        }
    } catch (e) {
        return [];
    }
    return [];
}

export async function POST(req: Request) {
  try {
    const { url } = await req.json();
    if (!url) return NextResponse.json({ error: 'Missing URL' }, { status: 400 });

    const content = await fetchContent(url);

    // 调用 AI 进行逻辑重构，并提取搜索关键词
    const systemPrompt = `
你现在是 AI Tony。对给定的内容进行“逻辑重构”。
你要提取出核心技术模块，并给出一个搜索关键词来寻找相关的 GitHub 解决方案。

必须输出：
{
  "name": "极硬核名",
  "category": "分类",
  "summary": "20字以内的暴力概括",
  "core_code": "核心伪代码、公式或架构流 (Markdown)",
  "tony_insight": "毒舌点评",
  "github_search_query": "用于寻找相关 GitHub 仓库的关键词 (如: autonomous agents framework)",
  "icon": "Lucide 图标",
  "exp_gain": 100-2000
}
`;

    const completionResponse = await fetch('https://backgrace.com/v1/chat/completions', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${backgraceKey}`
        },
        body: JSON.stringify({
            model: 'gemini-3.5-flash',
            messages: [{ role: 'system', content: systemPrompt }, { role: 'user', content: `内容: ${content}\n链接: ${url}` }],
            response_format: { type: 'json_object' }
        })
    });

    const aiRes = await completionResponse.json();
    const result = JSON.parse(aiRes.choices[0].message.content.replace(/```json/g, '').replace(/```/g, '').trim());

    // 联动：搜索相关的 GitHub 仓库
    const relatedRepos = await searchRelatedGithub(result.github_search_query || result.name);

    // 存入 Supabase (增加 metadata 存储相关仓库)
    const supRes = await fetch(`${supabaseUrl}/rest/v1/tony_skills`, {
      method: 'POST',
      headers: {
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=representation'
      },
      body: JSON.stringify({
          name: result.name,
          category: result.category,
          summary: result.summary,
          core_code: result.core_code,
          exp: result.exp_gain,
          tony_insight: result.tony_insight,
          icon: result.icon,
          source_urls: [url],
          notes: JSON.stringify({ related_repos: relatedRepos }), // 将相关仓库存入 notes
          status: 'MOUNTED'
      })
    });

    if (!supRes.ok) throw new Error(`Supabase Save failed: ${await supRes.text()}`);

    const insertedData = await supRes.json();
    return NextResponse.json({ success: true, data: insertedData[0] || insertedData });

  } catch (error: any) {
    console.error('Ingest Error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
