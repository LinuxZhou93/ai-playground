# Titan AI / 科技特长生系统 - 版本迭代日志 (Changelog)

所有的系统重构、跨端升级以及核心 API 调度机制在此记录，以满足商业化分发和热更追溯的需求。

---

## [2.0.0] - "The Multimodal Renaissance"
**发布日期：2026-03-28**
本次升级标志着 Titan AI 进入 2.0 时代。全新的视觉语言、更深度的跨端交互以及针对“科技特长生”实境教学的全面优化。

### 🎨 视觉革命 (Visual Overhaul)
- **Cyberpunk 2.0 界面**：引入深色沉浸式设计，基于玻璃拟态 (Glassmorphism) 与动态光影渲染，打造极客级学习环境。
- **全动态下载中心**：重构 `download.html`，采用原生 CSS 渲染与 4K 级实境配图，提升下载转化体验。

### 🧠 核心能力增强 (Core Capabilities)
- **多模态对讲 2.0**：优化桌面端摄像头帧率同步与音频降噪算法，实境识别更加丝滑。
- **本地性能释放**：针对 Apple Silicon 与 Windows High-End 硬件深度优化，减少 30% CPU 占用。
- **统一身份系统**：集成 Supabase V2 鉴权与订阅机制，全平台同步学习进度。

### 🛡️ 稳定性与补丁
- **GitHub 全局分发节点**：保持 GitHub 官方直链的高可用性。
- **修复了一些已知的 UI 适配问题**。

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
