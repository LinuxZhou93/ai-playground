const { app, BrowserWindow, systemPreferences, Menu, shell } = require('electron')
const path = require('path')

// 配置基础系统菜单以恢复 Mac 原生的复制(Cmd+C)/粘贴(Cmd+V)/全选(Cmd+A) 等快捷键
const template = [
  {
    label: app.name,
    submenu: [
      { role: 'about' },
      { type: 'separator' },
      { role: 'quit' }
    ]
  },
  {
    label: '编辑',
    submenu: [
      { role: 'undo' },
      { role: 'redo' },
      { type: 'separator' },
      { role: 'cut' },
      { role: 'copy' },
      { role: 'paste' },
      { role: 'selectAll' }
    ]
  }
]
Menu.setApplicationMenu(Menu.buildFromTemplate(template))

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

  // 致命体验漏洞修复：拦截所有 target="_blank" 的外链，强制调用外部系统默认浏览器（如 Chrome/Safari）打开，防止 Electron 内部白屏死循环
  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  // 另一层防御：如果代码里用的不是 _blank 而是直接 a 标签跳转外网
  mainWindow.webContents.on('will-navigate', (e, url) => {
    // 只要不是本地 file:// 协议开头的网页，一律扔给外部原生浏览器处理
    if (!url.startsWith('file://')) {
      e.preventDefault()
      shell.openExternal(url)
    }
  })

  // 如果需要调试，可以取消下面这行的注释
  // mainWindow.webContents.openDevTools()
}

app.whenReady().then(async () => {
  // 主动向 macOS 请求麦克风硬件权限（这是 Electron 在 Mac 上录音的硬性要求）
  if (process.platform === 'darwin') {
    try {
      await systemPreferences.askForMediaAccess('microphone');
      // 如果未来 AI 模块加入了摄像头视觉功能（也一并提前索要权限）
      await systemPreferences.askForMediaAccess('camera');
    } catch (e) {
      console.error('Failed to request media access', e);
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
