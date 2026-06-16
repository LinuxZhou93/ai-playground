const zby = require("../../data/zhenboyuan");

Page({
  data: {
    tours: zby.tours,
    syncMap: zby.syncMap,
    records: [
      { label: "预约记录", value: "3" },
      { label: "订单记录", value: "2" },
      { label: "溯源查询", value: "8" }
    ]
  },

  book(e) {
    const name = e.currentTarget.dataset.name;
    wx.showModal({
      title: "预约已生成",
      content: `${name}\n预约已提交，可在会员中心查看服务记录。`,
      showCancel: false
    });
  },

  goMall() {
    wx.switchTab({ url: "/pages/zby-mall/index" });
  },

  goTrace() {
    wx.switchTab({ url: "/pages/zby-trace/index" });
  }
});
