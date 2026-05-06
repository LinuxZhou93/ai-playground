// app.js
App({
  onLaunch() {
    console.log("🚀 [FutureClass] System Initializing...");
    
    // 极简初始化，避免触发底层权限报错
    const systemInfo = wx.getSystemInfoSync();
    this.globalData.systemInfo = systemInfo;
    
    // 检查更新
    const updateManager = wx.getUpdateManager();
    updateManager.onCheckForUpdate((res) => {
      if (res.hasUpdate) {
        updateManager.onUpdateReady(() => {
          wx.showModal({
            title: '更新提示',
            content: '新版本已准备好，是否重启应用？',
            success: (res) => {
              if (res.confirm) updateManager.applyUpdate();
            }
          });
        });
      }
    });
  },
  globalData: {
    systemInfo: null,
    userInfo: null
  }
})
