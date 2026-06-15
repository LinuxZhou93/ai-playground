/**
 * 微信小程序适配脚本 - 注入到您的网站中
 * 将此脚本放入您网站的公共 JS (如 assets/js/main.js)
 */

document.addEventListener('DOMContentLoaded', function() {
    // 检测是否在微信小程序环境中
    const isMiniprogram = window.__wxjs_environment === 'miniprogram' || /miniProgram/i.test(navigator.userAgent);

    if (isMiniprogram) {
        console.log("🚀 [FutureClass Adapter] 检测到小程序环境，正在进行 UI 深度适配...");
        
        // 1. 隐藏网页版底栏 (如果是 .dock-bar 或 .footer)
        const dockBar = document.querySelector('.dock-wrapper');
        if (dockBar) dockBar.style.display = 'none';

        // 2. 隐藏网页版导航 (如果有的话)
        const header = document.querySelector('.header');
        if (header) {
            header.style.paddingTop = 'env(safe-area-inset-top)'; // 适配刘海屏
        }

        // 3. 注入小程序专属样式
        const style = document.createElement('style');
        style.innerHTML = `
            body { padding-bottom: env(safe-area-inset-bottom) !important; }
            .cyber-scanline { z-index: 50 !important; }
        `;
        document.head.appendChild(style);
    }
});
