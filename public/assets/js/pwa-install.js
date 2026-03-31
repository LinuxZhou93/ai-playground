document.addEventListener('DOMContentLoaded', () => {
    // 检查是否已经在独立 PWA 模式下运行 (Safari 或 Chrome 安装后的状态)
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true;
    if (isStandalone) return;

    // 检查是否是移动端
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    if (!isMobile) return;

    // 判断系统类型
    const isIOS = /iPhone|iPad|iPod/i.test(navigator.userAgent);

    // 检查今天是否已经关闭过提示，避免过度打扰
    if (localStorage.getItem('pwa_prompt_dismissed') === new Date().toDateString()) return;

    // 构建行业通用的提示文案
    const title = "添加到主屏幕以获得最佳体验";
    const desc = isIOS 
        ? "全新 Future AI 移动客户端现已就绪。为获得与原生系统无缝融合、流畅无广框的交互体验，请轻触下方「分享」图标，滑动并选择「添加到主屏幕」。" 
        : "全新 Future AI 移动客户端现已就绪。为获得与原生系统无缝融合的交互体验，请轻触浏览器「菜单」并选择「添加到主屏幕」或点击下方安装按钮。";

    // 创建提示 UI
    const promptEl = document.createElement('div');
    promptEl.innerHTML = `
        <div id="pwa-install-prompt" style="
            position: fixed;
            bottom: 30px;
            left: 50%;
            transform: translateX(-50%);
            width: 90%;
            max-width: 400px;
            background: rgba(15, 20, 35, 0.95);
            backdrop-filter: blur(20px);
            border: 1px solid rgba(0, 240, 255, 0.3);
            border-radius: 20px;
            padding: 24px;
            box-shadow: 0 20px 50px rgba(0, 0, 0, 0.5), 0 0 20px rgba(0, 240, 255, 0.1);
            z-index: 10000;
            display: flex;
            flex-direction: column;
            gap: 16px;
            color: #fff;
            font-family: 'Inter', 'Noto Sans SC', sans-serif;
            animation: slideUp 0.6s cubic-bezier(0.16, 1, 0.3, 1);
        ">
            <style>
                @keyframes slideUp {
                    from { opacity: 0; transform: translate(-50%, 150%); }
                    to { opacity: 1; transform: translate(-50%, 0); }
                }
            </style>
            
            <div style="display: flex; justify-content: space-between; align-items: flex-start;">
                <div style="display: flex; gap: 16px; align-items: center;">
                    <img src="build/icon.png" style="width: 54px; height: 54px; border-radius: 14px; border: 1px solid rgba(255,255,255,0.1); box-shadow: 0 4px 10px rgba(0,0,0,0.5);">
                    <div>
                        <h4 style="margin: 0 0 6px 0; font-size: 16px; font-weight: 600; letter-spacing: 0.5px;">${title}</h4>
                        <span style="font-size: 11px; color: #00f0ff; background: rgba(0, 240, 255, 0.1); padding: 3px 10px; border-radius: 12px; font-style: italic; font-weight: bold;">Future AI Engine</span>
                    </div>
                </div>
                <button id="pwa-close-btn" style="background: none; border: none; color: #888; font-size: 26px; line-height: 1; cursor: pointer; padding: 0; transition: 0.3s;">&times;</button>
            </div>
            
            <p style="margin: 0; font-size: 13px; line-height: 1.6; color: rgba(255, 255, 255, 0.75);">
                ${desc}
            </p>
            
            ${isIOS ? `
            <div style="display: flex; justify-content: space-around; background: rgba(0,0,0,0.3); padding: 12px; border-radius: 12px; margin-top: 5px;">
                <div style="font-size: 12px; display: flex; flex-direction: column; align-items: center; gap: 6px; color: #eee;">
                    <div style="background: rgba(255,255,255,0.1); width: 36px; height: 36px; border-radius: 10px; display: flex; align-items: center; justify-content: center; font-size: 20px;"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"></path><polyline points="16 6 12 2 8 6"></polyline><line x1="12" y1="2" x2="12" y2="15"></line></svg></div>
                    1. 点按分享
                </div>
                <div style="font-size: 12px; display: flex; flex-direction: column; align-items: center; gap: 6px; color: #eee;">
                    <div style="background: rgba(255,255,255,0.1); width: 36px; height: 36px; border-radius: 10px; display: flex; align-items: center; justify-content: center; font-size: 24px; font-weight: 300;">+</div>
                    2. 添加到主屏幕
                </div>
            </div>
            ` : ''}
        </div>
    `;
    
    document.body.appendChild(promptEl);

    document.getElementById('pwa-close-btn').addEventListener('click', () => {
        promptEl.style.display = 'none';
        localStorage.setItem('pwa_prompt_dismissed', new Date().toDateString());
    });

    // 针对 Android/Chrome 的一键原生安装弹窗拦截
    let deferredPrompt;
    window.addEventListener('beforeinstallprompt', (e) => {
        // 防止浏览器直接弹出自带的条状安装横幅
        e.preventDefault();
        deferredPrompt = e;
        
        // 我们在刚生成的弹窗里动态插入一个原生触发按钮
        const installBtn = document.createElement('button');
        installBtn.innerText = "⚡️ 立即一键安装";
        installBtn.style.cssText = "background: linear-gradient(90deg, #00f0ff, #7000ff); border: none; padding: 14px; border-radius: 12px; color: white; font-weight: 800; font-size: 15px; cursor: pointer; margin-top: 8px; width: 100%; box-shadow: 0 8px 20px rgba(0,240,255,0.3); transition: transform 0.2s;";
        
        installBtn.addEventListener('click', async () => {
            promptEl.style.display = 'none';
            // 唤起浏览器底层的原生安装确认弹窗
            deferredPrompt.prompt();
            const { outcome } = await deferredPrompt.userChoice;
            if (outcome === 'accepted') {
                console.log('用户接受了 PWA 安装提示');
            }
            deferredPrompt = null;
        });

        // 将一键安装按钮加到非 iOS 平台的弹窗中去
        const promptBox = document.getElementById('pwa-install-prompt');
        if (promptBox && !isIOS) {
            promptBox.appendChild(installBtn);
        }
    });

    // 监听安装完成事件以清理弹窗
    window.addEventListener('appinstalled', () => {
        promptEl.style.display = 'none';
        deferredPrompt = null;
        console.log('PWA 已成功安装为本地应用');
    });
});
