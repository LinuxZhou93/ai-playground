import { resolveApiKey, resolveBaseUrl } from './lib/server/provider-config';

async function testConnectivity() {
  console.log('--- Titan Tech API 连通性深度审计 ---');
  
  const providerId = 'google';
  const resolvedKey = resolveApiKey(providerId);
  const resolvedUrl = resolveBaseUrl(providerId);

  console.log(`Provider: ${providerId}`);
  console.log(`Resolved Key: ${resolvedKey.slice(0, 8)}...${resolvedKey.slice(-4)}`);
  console.log(`Resolved URL: ${resolvedUrl}`);
  
  // 移除硬编码校验，仅检查 key 是否存在且非空
  if (resolvedKey && resolvedKey.length > 10) {
    console.log('✅ Key 校验成功：已加载有效的 API 密钥。');
  } else {
    console.log('❌ Key 校验失败：未能解析到有效的 API 密钥！');
  }


  // 测试实际调用 (Mock 一个简单的 API 请求)
  try {
    console.log('正在测试 Backgrace 代理响应...');
    const res = await fetch(`${resolvedUrl}/chat/completions`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${resolvedKey}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            model: 'gemini-3-flash',
            messages: [{ role: 'user', content: 'hi' }],
            max_tokens: 5
        })
    });
    
    if (res.ok) {
        console.log('🚀 连通性测试：成功！代理通道畅通。');
    } else {
        const err = await res.text();
        console.log(`❌ 连通性测试：失败 (HTTP ${res.status})`);
        console.log(`错误详情: ${err}`);
    }
  } catch (e) {
    console.error('💥 物理链路错误:', e);
  }
}

testConnectivity();
