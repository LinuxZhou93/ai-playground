const zby = require("../../data/zhenboyuan");

Page({
  data: {
    brand: zby.brand,
    cards: zby.homeCards,
    stats: zby.stats,
    syncMap: zby.syncMap,
    products: zby.products.slice(0, 2),
    tours: zby.tours
  },

  goMall() {
    wx.switchTab({ url: "/pages/zby-mall/index" });
  },

  goTrace() {
    wx.switchTab({ url: "/pages/zby-trace/index" });
  },

  goProfile() {
    wx.switchTab({ url: "/pages/zby-profile/index" });
  },

  showCard(e) {
    const title = e.currentTarget.dataset.title;
    wx.showToast({ title, icon: "none" });
  }
});
