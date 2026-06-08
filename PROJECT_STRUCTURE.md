# FutureClass 科技特长生系统项目结构与路由指南

> 本指南用于规范 `ai-playground` (OpenMAIC) 项目的目录结构、路由机制及未来开发规范，以维护代码库的系统性、清爽性与高可读性。

---

## 1. 核心架构与域名路由分流机制

项目采用了 **Next.js 服务端应用** 与 **客户端静态单页 (SPA)** 深度混合的架构。所有路由分流均在 [middleware.ts](file:///Users/zhoulin/Desktop/github/ai-playground/middleware.ts) 中进行拦截并智能重写 (Rewrite)。

### 1.1 主域名：`zhouxiaomai.com`
* **渲染机制**：中间件拦截 `/` 与 `/index.html` 请求，并重写至 `public/index.html`。
* **技术栈**：纯原生 HTML + CSS + JS，不走 Next.js 服务端渲染。
* **核心控制逻辑**：位于 `public/resources/assets/js/` 目录下。直接在客户端向云端 Supabase 数据库请求数据，渲染脑力图谱与“科技少将”特长生段位等级。
* **参数联动**：主页的“算力舱”和“AI 排课”入口点击后，会重定向至 `ai.zhouxiaomai.com`，并携带 `courseTopic` 和 `autoStart=true` 等参数进行“自动发车”。

### 1.2 AI 专用子域名：`ai.zhouxiaomai.com`
* **渲染机制**：映射至 Next.js App Router 根页面，由 [@/components/home-page.tsx](file:///Users/zhoulin/Desktop/github/ai-playground/components/home-page.tsx) 渲染核心页面。
* **功能板块**：AI 互动课堂的生成、回放和多智能体讨论微调。
* **自动发车协议 (Auto-Pilot)**：检测到 Query 中包含 `autoStart=true`，会自动抓取大纲，直接触发 AI 课件生成管线，并由超时兜底机制强制跳转到 `/generation-preview` 进行生成展示。
* **火山引擎 TTS 直连**：通过客户端 fetch 直连火山大模型 TTS，在发车和交互节点自动播放“呆萌川妹”的高质量语音。

### 1.3 科创教研专属子域名：`edu.zhouxiaomai.com`
* **渲染机制**：由中间件拦截并重写到 Next.js 的 `/edu` (即 `app/edu/page.tsx`)。
* **功能板块**：科创教研中心控制台。调用 ERP 后台 API 动作获取实时课程数、物理库存及教研课题，并利用 D3/vis-network 动态生成教研知识图谱。

### 1.4 静态资源重映射 (Asset Remapping)
* 针对公共资源（如 `/course` 等简洁路由），中间件自动将其映射重写至 `public/resources/` 目录下的物理 `.html` 文件中。
* 任何对 `assets/`, `libs/`, `css/`, `js/` 等文件夹的请求，中间件都会自动定向补全至 `public/resources/` 下的对应资产，保证静态 HTML 页面能正常引用样式与脚本。

---

## 2. 目录结构与职责划分

```
ai-playground/
├── app/                        # Next.js App Router 目录
│   ├── api/                    #   服务端 API 路由 (大模型讨论SSE、TTS中转、异步轮询等)
│   ├── classroom/[id]/         #   AI 课件播放大盘 (包含状态机回放逻辑)
│   ├── edu/                    #   科创教研中心
│   ├── erp/                    #   教务 ERP 控制中台 (包含基于 Cookie 的 Role 权限守卫)
│   └── page.tsx                #   AI 专用子站的兜底入口 (渲染 HomePage)
│
├── components/                 # React UI 组件库
│   ├── slide-renderer/         #   基于 HTML5 Canvas 的幻灯片渲染与编辑引擎
│   ├── whiteboard/             #   基于 SVG 的白板书写与绘图组件
│   └── home-page.tsx           #   AI 生成站的核心逻辑与页面渲染
│
├── lib/                        # 核心业务逻辑与状态库
│   ├── generation/             #   大纲生成与场景内容填充管线
│   ├── orchestration/          #   基于 LangGraph 的多智能体协作状态机 (导演图)
│   ├── playback/               #   回放状态控制
│   └── store/                  #   Zustand 全局状态管理 (设置、用户画像等)
│
├── public/                     # 静态资产与独立页面
│   ├── index.html              #   主站静态全息主页
│   └── resources/              #   庞大的静态页面池与公共库
│       ├── archive/            #     AI 历史自动生成文件的垃圾回收归档夹
│       ├── legacy_mozi/        #     墨子实验室时期的历史遗留静态文件
│       └── assets/js/          #     主域名静态控制逻辑 (launchpad.js, subscription.js 等)
│
├── scripts/                    # 维护与工程化辅助脚本
│   ├── tests/                  #   开发调试与连接性测试脚本 (21 个 test 脚本)
│   ├── archive/                #   历史辅助数据生成与转换脚本 (25 个辅助脚本)
│   └── cleanup.js              #   高性能垃圾清理与自动生成页面回收工具
│
├── package.json                # 依赖管理与快捷指令
├── middleware.ts               # 统一路由重写与权限拦截网关
└── tsconfig.json               # TypeScript 规则配置
```

---

## 3. 本地开发与调试规范

### 3.1 本地联调不同域名
由于本地调试通常在 `localhost:3000` 进行，无法通过 Host header 直接匹配 `ai.` 或 `edu.`。你可以通过以下方式在本地模拟不同域名环境：
1. **修改 hosts 文件**：
   在系统 `/etc/hosts` 中添加映射：
   ```hosts
   127.0.0.1 zhouxiaomai.local
   127.0.0.1 ai.zhouxiaomai.local
   127.0.0.1 edu.zhouxiaomai.local
   ```
2. **在浏览器中访问**：
   使用 `http://ai.zhouxiaomai.local:3000` 或 `http://zhouxiaomai.local:3000` 即可完全还原线上的中间件分流环境。

### 3.2 净化与垃圾清理
在开发过程中，你的工作目录可能会产生大量的 macOS 临时文件或 AI 生成页面。请不要直接提交它们。
* **一键清理**：
  在项目根目录下运行：
  ```bash
  pnpm clean
  ```
  该命令将自动运行 `scripts/cleanup.js`，深度清理工作区所有的 `._*` 垃圾文件，并将 `public/resources/` 下积压的 untracked 生成页面自动转移至归档目录。
