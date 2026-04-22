/* 
 * TITAN OS - Google Gemini 极速反向代理服务 
 * 部署于 Cloudflare 边缘计算节点，彻底穿透 GFW
 * Route: ai.zhouxiaomai.com
 */
export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    // 【新增核心功能】：微软 Edge TTS 顶级语音包 WebSocket 中转
    // 专门抹除浏览器强加的 Origin 头，绕过微软防盗链校验 (403 Forbidden)
    if (url.pathname.startsWith('/edge-tts')) {
        url.hostname = 'speech.platform.bing.com';
        url.pathname = '/consumer/speech/synthesize/readaloud/edge/v1';
        let newHeaders = new Headers(request.headers);
        newHeaders.delete('Origin'); // 极其关键的脱壳操作
        newHeaders.delete('Referer');
        
        return await fetch(url.toString(), {
            method: request.method,
            headers: newHeaders
        });
    }

    // 原有的 Gemini 极速反向代理服务
    url.hostname = "generativelanguage.googleapis.com";
    let newRequest = new Request(url, request);

    if (request.method === "OPTIONS") {
      return new Response(null, {
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type, Authorization, x-goog-api-client",
          "Access-Control-Max-Age": "86400",
        },
      });
    }

    try {
      const response = await fetch(newRequest);
      const newResponse = new Response(response.body, response);
      newResponse.headers.set("Access-Control-Allow-Origin", "*");
      return newResponse;
    } catch (e) {
      return new Response(JSON.stringify({ error: e.stack }), { status: 500 });
    }
  },
};
