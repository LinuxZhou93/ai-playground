# Titan AI / 科技特长生系统 - 版本迭代日志 (Changelog)

所有的系统重构、跨端升级以及核心 API 调度机制在此记录，以满足商业化分发和热更追溯的需求。

---

## [1.1.0] - "The Cyberpunk Awakening" 
**发布日期：2026-03-25**
本次为一个里程碑级的客户端升级，核心补全了 Windows 矩阵，重构了底层 API 架构与视觉降维引擎。

### 🚀 核心飞跃 (Major Features)
- **跨平台矩阵 (Cross-Platform)**：正式发布基于 NSIS 的 Windows 桌面端原生安装程序 (.exe)。
- **原生节点调度 (Native Proxy Engine)**：主干请求全面迁移至私有化高可用代理 (`ai.zhouxiaomai.com`)。
- **高可用灾备 (Fallback & Redundancy)**：引入双通道网络冗余。当主节点遇 429 额度耗尽或 50x 网络拥堵时，零延迟静默切换至备用代理 `backgrace.com`。
- **GPU 级纯净化配图引擎**：彻底封杀大模型乱用 SVG 敷衍绘画行为的逻辑漏洞；强制唤醒原生云端渲染链路 (形如 `ai-render://placeholder`) 执行高逼格位图生成。

### 🔧 性能体验与稳定性优化 (Improvements)
- **客户端权限降维**：对普通由于算力限制的 Web 浏览器发起“权限拦截”，引导下载独立的 Mac/Win 极客客户端重构实景计算。
- **音频流格式锁 (Audio Integrity)**：修正 `input_audio` 音频强制伪装封包机制，从不稳定编码统一强转至 `wav`，解决网关过滤白名单报错的 bug。
- **沉浸式下载中心 (`download.html`)**：搭建苹果原生级质感独立商业化下载落地页，配以百度网盘保底防失联功能。

---

## [1.0.0] - 初代点火测试
**发布日期：历史版本**
- 支持浏览器端 WebRTC 音频分析验证。
- Notion 级聊天卡片渲染与局域网鉴权框架成型。
- 基于 Electron 的壳与沉浸式 UI 原型构筑。
