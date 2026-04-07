// pages/index/index.js
Page({
  data: {
    // 【核心配置】在此处填入您已经部署好的 Vercel 网页地址
    // 如果您有不同的学员 ID，可以在后面拼接参数，例如 ?student_id=S001
    reportUrl: 'https://ai-playground.vercel.app/psyche_x_system/frontend/camp_report.html'
  },

  onLoad(options) {
    console.log('正在加载云端评估报告...');
    
    // 如果从小程序码进入带了参数，可以在这里处理动态 URL
    if (options.url) {
      this.setData({
        reportUrl: decodeURIComponent(options.url)
      });
    }
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage() {
    return {
      title: '查看我的 STEM 营地评估报告',
      path: '/pages/index/index?url=' + encodeURIComponent(this.data.reportUrl)
    }
  }
})
