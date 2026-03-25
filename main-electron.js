const { app, BrowserWindow, systemPreferences } = require('electron')
const path = require('path')

function createWindow () {
  const mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    titleBarStyle: 'hiddenInset',
    trafficLightPosition: { x: 20, y: 20 },
    backgroundColor: '#050510',
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    }
  })

  // 加载现有的 index.html
  mainWindow.loadFile('index.html')

  // 如果需要调试，可以取消下面这行的注释
  // mainWindow.webContents.openDevTools()
}

app.whenReady().then(async () => {
  // 主动向 macOS 请求麦克风硬件权限（这是 Electron 在 Mac 上录音的硬性要求）
  if (process.platform === 'darwin') {
    try {
      const micAccess = await systemPreferences.askForMediaAccess('microphone');
      console.log('Microphone access:', micAccess);
    } catch (e) {
      console.error('Failed to request microphone access', e);
    }
  }

  createWindow()

  app.on('activate', function () {
    // macOS 环境下，当点击 dock 图标并且没有其他窗口打开时，
    // 通常在应用程序中重新创建一个窗口。
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

// 除了 macOS 外，当所有窗口都被关闭的时候退出程序
app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit()
})
