Page({
  data: {
    // 默认回源地址，一旦穿透成功，这里将配置为 ngrok/vercel 公网地址
    webViewUrl: 'https://curly-pants-poke.loca.lt/erp/dashboard'
  },
  onLoad: function (options) {
    let baseUrl = 'https://curly-pants-poke.loca.lt'; // 自动装载的穿透网关
    
    // 如果是通过扫码或者模板消息卡片进来，解析 path 并透传
    let targetPath = options.path ? decodeURIComponent(options.path) : '/erp/dashboard';
    
    // 支持携带额外的查询参数 (如 campus_id, role bypass 等)
    let queryParams = [];
    for (let key in options) {
      if (key !== 'path') {
        queryParams.push(`${key}=${encodeURIComponent(options[key])}`);
      }
    }
    
    let finalUrl = `${baseUrl}${targetPath}`;
    if (queryParams.length > 0) {
      finalUrl += (finalUrl.indexOf('?') > -1 ? '&' : '?') + queryParams.join('&');
    }

    this.setData({
      webViewUrl: finalUrl
    });
    
    console.log('[FutureClass Hybrid] Core Engine Initialized. Target:', this.data.webViewUrl);
  }
})
