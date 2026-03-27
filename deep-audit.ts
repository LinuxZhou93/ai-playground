import { resolveApiKey, resolveBaseUrl, resolveTTSApiKey, resolveTTSBaseUrl } from './openmaic-core/lib/server/provider-config';
import { extractUrlContent } from './openmaic-core/lib/server/url-extractor';

async function deepAudit() {
  console.log('--- [Titan Tech] 全链路底层物理探测开始 ---');

  // 1. LLM 凭证审计
  const llmKey = resolveApiKey('google');
  const llmUrl = resolveBaseUrl('google');
  const expectedKey = 'sk-yRWWj3wDJfuUXhddTtdTb59ax9ExqC7DAgbpBt5Oe50yDFjK';
  
  console.log('\n[1. LLM 凭证审计]');
  console.log(`- 目标供应商: google (Gemini Flash)`);
  console.log(`- 解析 Key: ${llmKey.slice(0, 8)}... (长度: ${llmKey.length})`);
  console.log(`- 解析 URL: ${llmUrl}`);
  console.log(`- 审计结论: ${llmKey === expectedKey ? '✅ 拦截成功，已锁定 Backgrace 通道' : '❌ 拦截失败，检测到无效环境变量干扰'}`);

  // 2. TTS 凭证审计
  const ttsKey = resolveTTSApiKey('volcengine-tts');
  const ttsUrl = resolveTTSBaseUrl('volcengine-tts');
  console.log('\n[2. TTS 凭证审计]');
  console.log(`- 目标供应商: volcengine-tts (少年梓梓)`);
  console.log(`- 解析 Token: ${ttsKey.slice(0, 8)}...`);
  console.log(`- 解析 URL: ${ttsUrl}`);
  console.log(`- 审计结论: ${ttsKey ? '✅ 凭证就绪' : '❌ 凭证缺失'}`);

  // 3. URL 解析组件审计
  console.log('\n[3. URL 解析审计]');
  const testYouTube = 'https://youtu.be/O9b8tLXCTYU?si=9m3nxO9CvU3mXLRU';
  console.log(`- 测试目标: ${testYouTube}`);
  try {
    const ytResult = await extractUrlContent(testYouTube, false); // 仅测试原生
    console.log(`- 原生解析状态: ${ytResult ? '✅ 已命中' : '⚠️ 已回退'}`);
    if (ytResult) console.log(`- 识别标题: ${ytResult.title}`);
  } catch (e) {
    console.log(`- 解析组件错误: ${e.message}`);
  }

  console.log('\n--- 审计结束 ---');
}

deepAudit();
