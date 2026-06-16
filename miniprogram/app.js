App({
  onLaunch() {
    const systemInfo = wx.getSystemInfoSync();
    this.globalData.systemInfo = systemInfo;
    this.globalData.cart = [];

    const updateManager = wx.getUpdateManager();
    updateManager.onCheckForUpdate((res) => {
      if (!res.hasUpdate) return;
      updateManager.onUpdateReady(() => {
        wx.showModal({
          title: "更新提示",
          content: "新版本已准备好，是否重启应用？",
          success: (result) => {
            if (result.confirm) updateManager.applyUpdate();
          }
        });
      });
    });
  },
  globalData: {
    systemInfo: null,
    userInfo: null,
    cart: []
  }
});
