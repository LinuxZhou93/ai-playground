// pages/index/index.js
Page({
  data: {
    // 使用更高版本的部署标签，强制微信重新拉取
    url: 'https://www.zhouxiaomai.com/index.html?ui_mode=miniprogram&deploy_v=20260507_v5.6_FINAL'
  },
  onLoad(options) {
    console.log("🚀 [FutureClass] Force Reloading HUD: V5.6_FINAL");
  }
})
