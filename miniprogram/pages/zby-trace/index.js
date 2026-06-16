const zby = require("../../data/zhenboyuan");

Page({
  data: {
    code: zby.trace.defaultCode,
    queried: true,
    result: zby.trace.result,
    timeline: zby.trace.timeline
  },

  onInput(e) {
    this.setData({ code: e.detail.value });
  },

  queryTrace() {
    this.setData({ queried: true, result: zby.trace.result });
    wx.showToast({ title: "已匹配批次", icon: "success" });
  },

  scanCode() {
    wx.showToast({ title: "现场可接微信扫码", icon: "none" });
  },

  goMall() {
    wx.switchTab({ url: "/pages/zby-mall/index" });
  }
});
