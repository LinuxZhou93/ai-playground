# 科技特长生培养系统小程序 (Dock 导航版)

## 核心架构 - 1:1 复刻网站
本项目严格遵循网站的 **Home + Dock** 逻辑：
- **首页 (Native)**: 原生实现，视觉上与网站首页一致 (数据仪表盘 + 底部功能 Dock)。
- **导航 (Dock)**: 底部 Dock 包含了网站所有的功能入口 (如教育日志、课程地图、编程、无人机等)。
- **内容层 (WebView)**: 点击 Dock 图标，跳转到对应的 `webview` 页面加载原始 HTML，确保业务逻辑和互动体验与网站完全一致。

## 快速启动
1. **开发者工具导入**: 选择项目根目录 `/Users/zhoulin/Desktop/github/ai-playground`。
2. **AppID 设置**: 使用 **测试号**。
3. **域名配置 (重要)**:
   - 在开发者工具中，勾选 **"详情" -> "本地设置" -> "不校验合法域名..."**。
   - 这样才能加载本地或任意 URL 的 HTML 文件。

## 数据源配置
在 `miniprogram/pages/index/index.js` 中的 `dockItems` 数组定义了所有的菜单项和跳转链接。
目前默认链接为 `blog.html`, `coding.html` 等相对路径，实际运行时请将 `url` 参数修改为您的 **网站部署地址** (例如 `https://your-site.com/blog.html`)。

示例:
```javascript
{ id: 'blog', name: '教育日志', icon: '📝', page: '/pages/webview/webview?url=https://your-site.com/blog.html' }
```
