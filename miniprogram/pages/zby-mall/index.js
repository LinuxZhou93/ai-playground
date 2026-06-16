const zby = require("../../data/zhenboyuan");

Page({
  data: {
    categories: ["全部", "核心产品", "睡眠康养", "茶饮文创", "基地体验"],
    activeCat: "全部",
    products: zby.products,
    shownProducts: zby.products,
    cartCount: 0,
    cartAmount: 0
  },

  switchCat(e) {
    const cat = e.currentTarget.dataset.cat;
    const shownProducts = cat === "全部" ? zby.products : zby.products.filter((item) => item.cat === cat);
    this.setData({ activeCat: cat, shownProducts });
  },

  addCart(e) {
    const product = zby.products.find((item) => item.id === e.currentTarget.dataset.id);
    if (!product) return;
    const app = getApp();
    app.globalData.cart.push(product);
    const cartAmount = app.globalData.cart.reduce((sum, item) => sum + item.price, 0);
    this.setData({ cartCount: app.globalData.cart.length, cartAmount });
    wx.showToast({ title: "已加入购物车", icon: "success" });
  },

  buyNow(e) {
    const product = zby.products.find((item) => item.id === e.currentTarget.dataset.id);
    wx.showModal({
      title: "订单确认",
      content: `${product.name}\n已提交订单确认，可在会员中心查看购买记录。`,
      showCancel: false
    });
  },

  showTrace(e) {
    wx.switchTab({ url: "/pages/zby-trace/index" });
  },

  checkout() {
    wx.showModal({
      title: "订单确认",
      content: `购物车共 ${this.data.cartCount} 件，合计 ¥${this.data.cartAmount}。订单已进入确认流程，库存与服务人员会继续跟进。`,
      showCancel: false
    });
  }
});
