const { app, BrowserWindow, systemPreferences, Menu, shell, ipcMain } = require('electron')
const path = require('path')
const { MsEdgeTTS, OUTPUT_FORMAT } = require('msedge-tts');

// ==========================================
// 🎙️ 微软超清神经语音引擎 (Edge TTS 白嫖专线)
// 只有在 Electron 主进程裸跑，才能无视源限制完美伪装
// ==========================================
const msTTS = new MsEdgeTTS();
ipcMain.handle('generate-edge-tts', async (event, text, voiceName) => {
    try {
        console.log(`[主进程 TTS] 正在呼叫微软后台生成语音: ${voiceName || 'zh-CN-XiaoxiaoNeural'}`);
        await msTTS.setMetadata(voiceName || 'zh-CN-XiaoxiaoNeural', OUTPUT_FORMAT.AUDIO_24KHZ_48KBITRATE_MONO_MP3);
        const audioStream = await msTTS.toStream(text);
        
        return new Promise((resolve, reject) => {
            let chunks = [];
            audioStream.on('data', chunk => chunks.push(chunk));
            audioStream.on('end', () => {
                const buffer = Buffer.concat(chunks);
                console.log(`[主进程 TTS] 音频生成成功，下发二进制包裹: ${buffer.length} bytes`);
                resolve(buffer); // 将 Buffer 传送给前端
            });
            audioStream.on('error', reject);
            
            // 解决 Stream 可能未提供 close 事件引发的问题
            audioStream.on('close', () => {
                if (chunks.length > 0) resolve(Buffer.concat(chunks));
            });
        });
    } catch (err) {
        console.error("[主进程 TTS] 崩溃:", err);
        throw err;
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
