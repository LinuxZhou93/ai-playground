const { app, BrowserWindow, systemPreferences, Menu, shell, ipcMain } = require('electron')
const path = require('path')
// const { MsEdgeTTS, OUTPUT_FORMAT } = require('msedge-tts');

// ==========================================
// 🎙️ 微软超清神经语音引擎 (Edge TTS 白嫖专线)
// 只有在 Electron 主进程裸跑，才能无视源限制完美伪装
// ==========================================
// const msTTS = new MsEdgeTTS();
// ==========================================
// 🎙️ 火山引擎 (豆包) TTS 引擎 - 生产级直连
// 确保 Electron 桌面端与 OpenMAIC 课件音色高度统一
// ==========================================
ipcMain.handle('generate-edge-tts', async (event, text, voiceName) => {
    try {
        // 🚀 [Titan AI 主进程锁死]：忽略传入的 voiceName，底层强制使用“少年梓梓”
        const voice = "zh_male_shaonianzixin_moon_bigtts";
        const reqid = 'req-ipc-' + Date.now();

        console.log(`[主进程 TTS] 正在呼叫火山引擎生成语音: ${voice}`);

        const response = await fetch('https://openspeech.bytedance.com/api/v1/tts', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer; ${token}`
            },
            body: JSON.stringify({
                app: { appid: appId, token: token, cluster: "volcano_tts" },
                user: { uid: "titan_electron" },
                audio: { voice_type: voice, encoding: "mp3" },
                request: { reqid: reqid, text: text, operation: "query" }
            })
        });

        if (!response.ok) throw new Error(`Volcengine API Error: ${response.statusText}`);
        
        const result = await response.json();
        if (result.code !== 3000) throw new Error(`Volcengine Error: ${result.message}`);

        const buffer = Buffer.from(result.data, 'base64');
        console.log(`[主进程 TTS] 豆包语音合成成功: ${buffer.length} bytes`);
        return buffer;

    } catch (err) {
        console.error("[主进程 TTS] 崩溃:", err);
        return null; // 返回 null 触发前端 fallback
    }
});

// ==========================================
// 🏠 返回首屏 - 万能 IPC 桥梁
// 允许 Vercel 云端网页突破沙盒限制，直接返回本地 Desktop UI
// ==========================================
ipcMain.on('return-home', (event) => {
    const webContents = event.sender;
    const currentWindow = BrowserWindow.fromWebContents(webContents);
    if (currentWindow) {
        currentWindow.loadFile('index.html');
    }
});

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
      contextIsolation: false,
      autoplayPolicy: 'no-user-gesture-required'
    }
  })

  // 加载现有的 index.html
  mainWindow.loadFile('index.html')

  // 致命体验漏洞修复：拦截所有 target="_blank" 的外链，强制调用外部系统默认浏览器（如 Chrome/Safari）打开，防止 Electron 内部白屏死循环
  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  // 另一层防御：拦截非本地跳转，但彻底放行我们的专属 Vercel 云端引擎和本地调试端口
  mainWindow.webContents.on('will-navigate', (e, url) => {
    const isLocalFile = url.startsWith('file://');
    const isVercelEngine = (url.includes('vercel.app') || url.includes('zhouxiaomai.com'));
    const isLocalhostEngine = url.includes('localhost:3005');
    
    if (!isLocalFile && !isVercelEngine && !isLocalhostEngine) {
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
