// pages/index/index.js
Page({
  data: {
    // 增加一个超级随机数，强制微信不使用缓存
    url: 'https://zhouxiaomai.com?ui_mode=miniprogram&cache_bust=' + Math.random().toString(36).substring(7)
  },
  onLoad(options) {
    console.log("🔗 [FutureClass] Force Reloading with Cache Buster:", this.data.url);
  }
})
