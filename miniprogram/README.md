# 科技特长生培养系统小程序 (Dock 导航版)

## 核心架构 - 1:1 复刻网站
本项目严格遵循网站的 **Home + Dock** 逻辑：
- **首页 (Native)**: 原生实现，视觉上与网站首页一致 (数据仪表盘 + 底部功能 Dock)。
- **导航 (Dock)**: 底部 Dock 包含了网站所有的功能入口 (如教育日志、课程地图、编程、无人机等)。
- **内容层 (WebView)**: 点击 Dock 图标，跳转到对应的 `webview` 页面加载原始 HTML，确保业务逻辑和互动体验与网站完全一致。

## 快速启动

### 1. 开发者工具导入
选择项目根目录 `/Users/zhoulin/Desktop/github/ai-playground`。

### 2. AppID 设置
使用 **测试号** 或您的正式 AppID: `wxf769ee4c5921cdbc`

### 3. ⚠️ 域名校验配置（非常重要）

**开发调试阶段**：
1. 打开微信开发者工具
2. 点击右上角 **"详情"**
3. 进入 **"本地设置"** 标签
4. **务必勾选**：
   - ✅ 不校验合法域名、web-view（业务域名）、TLS 版本以及 HTTPS 证书
   - ✅ 不校验 Secure 域名（TLS、HTTPS）

**生产发布阶段**：
1. 登录[微信公众平台](https://mp.weixin.qq.com/)
2. 进入 **"开发" -> "开发管理" -> "开发设置"**
3. 在 **"业务域名"** 中添加：`zhoulin.com`
4. 下载校验文件并上传到您网站根目录
5. 点击保存

## 数据源配置
在 `miniprogram/pages/index/index.js` 第2行的 `BASE_URL` 定义了所有WebView页面的域名：
```javascript
const BASE_URL = 'https://zhoulin.com';
```

如需本地调试，可临时修改为：
```javascript
const BASE_URL = 'http://192.168.x.x:8080'; // 您的局域网IP
```

## 常见问题

### Q: WebView 显示黑屏？
**A**: 请按以下步骤排查：
1. 确认已在开发者工具中关闭域名校验（见上方"域名校验配置"）
2. 打开 Console 查看是否有 URL 解码错误
3. 确认 `zhoulin.com` 网站可以正常访问
4. 检查网站是否支持 HTTPS（微信小程序强制要求）

### Q: 点击 Dock 图标无反应？
**A**: 打开 Console 查看日志：
- 应看到 "Dock item tapped: ..." 
- 应看到 "Navigating to: ..."
- 如果看到 "Navigation failed"，请查看错误详情

### Q: 如何测试特定页面？
**A**: 可以直接修改某个 Dock 项的 URL 为测试页面，例如：
```javascript
{ id: 'blog', name: '教育日志', icon: '📝', page: '/pages/coding/coding' } // 测试原生页面
```

## 文件结构
```
miniprogram/
├── app.js              # 小程序入口
├── app.json            # 全局配置（已禁用TabBar，使用自定义Dock）
├── app.wxss            # 全局样式
├── pages/
│   ├── index/          # 首页（含Dock）
│   ├── webview/        # WebView通用容器
│   ├── galaxy/         # 学科协同星系（WebView）
│   ├── coding/         # 编程实验室（原生）
│   └── mine/           # 个人中心（原生）
└── images/             # 图片资源
    ├── bg.jpg          # 背景图
    └── logo.png        # Logo/头像
```

## 技术栈
- 微信小程序原生框架
- WebView 混合架构（保留网站完整功能）
- 基础库版本：3.4.0+

## 下一步
1. ✅ 点击"编译"验证首页显示
2. ✅ 配置域名校验（开发阶段关闭）
3. ✅ 点击 Dock 测试跳转和内容加载
4. 🔄 根据实际需求调整 `BASE_URL`
5. 🚀 上传审核发布
