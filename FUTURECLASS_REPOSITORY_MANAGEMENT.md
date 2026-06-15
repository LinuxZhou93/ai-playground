# FutureClass 仓库数据化管理文档

生成日期：2026-05-24  
仓库路径：`/Users/zhoulin/Desktop/github/ai-playground`  
系统定位：FutureClass / TitanTech 科技特长生 AI 实境课室、教务 ERP、教研中台、小程序 Hybrid、Psyche X 测评与报告系统。

## 1. 仓库总体画像

| 指标 | 数值 / 说明 |
| --- | --- |
| 主技术栈 | Next.js 15.5.14, React 19.2.4, TypeScript 5, Tailwind CSS 4, Supabase, Zustand, Vercel AI SDK, LangGraph |
| 包名 | `openmaic` |
| Node 版本 | `20.x` |
| 包管理器 | `pnpm@9.15.4` |
| License | AGPL-3.0 |
| 管理范围文件数 | 4600 个，统计范围：`app`, `components`, `lib`, `public`, `miniprogram`, `database`, `supabase`, `tests`, `e2e`，排除依赖目录 |
| 应用/源码近似行数 | 122798 行，统计 TS/TSX/JS/JSON/SQL/WXML/WXSS/MD，不含 `public/resources` 大型静态课件 |
| `public/resources` 静态课件近似行数 | 213324 行 |
| Psyche X 近似行数 | 31436 行 |
| ERP 近似行数 | 10041 行 |
| AI/API/生成链路近似行数 | 15378 行 |
| 小程序近似行数 | 1131 行 |

## 2. 一级目录数据

| 目录 | 文件数 | 职责 |
| --- | ---: | --- |
| `public` | 3911 | 静态 H5、课件、Psyche X、图片、字体、资源库、Scratch Jr、历史归档 |
| `components` | 215 | React 组件，课堂、ERP、设置、白板、聊天、AI Elements、UI 基础组件 |
| `lib` | 208 | AI 调用、生成管线、播放引擎、Supabase、存储、音频、媒体、导出、状态管理 |
| `app` | 175 | Next.js App Router 页面和 API |
| `miniprogram` | 52 | 微信小程序 Hybrid 壳 |
| `database` | 13 | Supabase/ERP/测评/教研 SQL 脚本与集成状态文档 |
| `e2e` | 12 | Playwright 端到端测试 |
| `tests` | 8 | Vitest/Node 测试 |
| `supabase` | 6 | Supabase seed 和 Edge Functions |

## 3. 文件类型分布

| 类型 | 数量 | 说明 |
| --- | ---: | --- |
| `.mdx` | 1044 | Hugging Face Course 多语言课程内容 |
| `.html` | 823 | 静态页面、课件、测评任务、报告页 |
| `.png` | 687 | 图片资源 |
| `.svg` | 457 | 图标、背景、视觉资源 |
| `.tsx` | 273 | Next.js/React 页面与组件 |
| `.ts` | 267 | 业务逻辑、API、类型、工具 |
| `.srt` | 248 | 字幕资源 |
| `.js` | 184 | 静态页脚本、小程序脚本、Node 工具 |
| `.md` | 140 | 文档 |
| `.json` | 74 | 配置与数据 |
| `.css` | 73 | 静态样式 |
| `.sql` | 16 | 数据库 schema/迁移 |
| `.db` | 16 | Psyche X SQLite 数据文件 |

## 4. 系统模块地图

| 模块 | 主要路径 | 文件数 | 说明 |
| --- | --- | ---: | --- |
| Next.js 应用壳 | `app`, `middleware.ts`, `next.config.ts` | 175+ | App Router、API、布局、域名重写 |
| AI 互动课堂 | `app/classroom`, `components/stage.tsx`, `components/stage`, `components/scene-renderers`, `lib/playback`, `lib/action` | 约 40+ | 课堂播放、场景渲染、Roundtable、白板、动作引擎 |
| 课堂生成管线 | `app/api/generate*`, `app/api/generate-classroom`, `lib/generation`, `lib/server/classroom-*`, `lib/ai` | 约 50+ | 大纲、场景内容、动作、媒体、TTS、异步任务 |
| 教务 ERP | `app/erp`, `components/erp`, `database/supabase_erp_schema.sql` | 49 | 学员、班级、课程、排课、出勤、财务、库存、线索、报表、设置 |
| 科创教研 | `app/edu`, `components/edu`, `database/edu_system_v2.sql`, `database/edu_vault.sql` | 16+ | 教研 Dashboard、AI 生成器、调优台、Vault、知识图谱 |
| Psyche X 测评 | `public/psyche_x_system`, `app/api/camp_report`, `app/api/lab_report`, `database/supabase_camp_evaluations.sql` | 136+ | 测评任务、管理后台、营地/实验室报告、Python 后端 |
| 微信小程序 | `miniprogram` | 52 | web-view Hybrid 壳，首页、AI Lab、课程、档案 |
| 家长端 | `app/parent` | 4 | 家长登录、家长 Dashboard、服务端动作 |
| ChatBear | `app/chatbear`, `components/chatbear`, `lib/chatbear` | 约 10 | 聊天伴读机器人、学习页、实验室、Pyodide |
| Swarm | `app/swarm`, `components/swarm`, `lib/swarm`, `supabase_schema_v3.sql` | 约 5+ | CHRONOS 蜂群状态与知识图谱 |
| 静态课件资源 | `public/resources` | 大量 | 航天、AI、IDE、课程页、实验页、archive、legacy_mozi |
| Scratch Jr / IDE | `public/assets/scratchjr`, `public/resources/ide-*`, `scratch` | 大量 | Web 版 Scratch Jr 与编程 IDE 页面 |
| 测试 | `tests`, `e2e` | 20 | Store、服务端配置、课堂生成流 E2E |

## 5. 关键入口文件

| 文件 | 职责 |
| --- | --- |
| `package.json` | 脚本、依赖、Node 版本、包管理器 |
| `next.config.ts` | Next.js 构建配置、rewrites、客户端 Node fallback |
| `middleware.ts` | 域名分流、Clean URL、静态资源映射、ERP RBAC |
| `app/layout.tsx` | 全局布局、FutureClass metadata、Titan AI 伴读中枢脚本 |
| `app/page.tsx` | Next.js 根页面兜底，渲染 `HomePage` |
| `public/index.html` | 主域名静态首页，Cyberpunk Dock / Launchpad |
| `components/home-page.tsx` | AI 课堂生成入口、历史课堂、自动发车、设置入口 |
| `components/stage.tsx` | 课堂主容器，播放引擎、聊天、白板、Roundtable 集成 |
| `app/classroom/[id]/page.tsx` | 单课堂加载、恢复、生成续跑、媒体续跑 |
| `lib/server/provider-config.ts` | 服务端模型/TTS/ASR/PDF/图片/视频配置解析 |
| `lib/server/resolve-model.ts` | API 模型解析、SSRF 校验、provider 初始化 |
| `lib/server/classroom-generation.ts` | 服务端一键生成课堂完整流程 |
| `lib/server/classroom-storage.ts` | `stages` / `scenes` 读写 |
| `lib/server/classroom-job-store.ts` | `classroom_jobs` 异步任务状态 |

## 6. 域名与路由网关

文件：`middleware.ts`

| 条件 | 行为 |
| --- | --- |
| `host.includes('edu.')` 或路径 `/edu` | 根路径重写到 `/edu` |
| `host.includes('ai.zhouxiaomai.com')` | `/index.html` 重写到 `/`，其他请求放行 |
| 主域名根路径 `/` 或 `/index.html` | 重写到静态 `/index.html` |
| `/course` | `/resources/course.html` |
| `/pricing` | `/resources/pricing-demo.html` |
| `/pengzhou-mall-demo` | `/resources/pengzhou-mall-demo.html` |
| `/download` | `/resources/download.html` |
| `/labs` | `/resources/labs.html` |
| `/ide` | `/resources/ide-scratch.html` |
| 根路径普通 `.html` | 自动映射到 `/resources/*.html`，排除白名单 |
| `assets`, `libs`, `css`, `js`, `images`, `avatars` | 自动补齐 `/resources` |
| `/hub-auto-*.html` | 自动映射到 `/resources/hub-auto-*.html` |
| `/erp/*` | 根据 Cookie `X-FC-Role` 执行 RBAC 重定向 |

## 7. 教务 ERP 管理清单

### 7.1 页面与功能

| 模块 | 路径 | 主要文件 | 说明 |
| --- | --- | --- | --- |
| ERP 总布局 | `app/erp/layout.tsx` | `layout.tsx` | 侧边栏、顶部栏、角色显示、主题切换、指令面板 |
| 首页入口 | `app/erp/page.tsx` | `page.tsx` | ERP 入口 |
| Dashboard | `app/erp/dashboard` | `page.tsx`, `dashboard-client.tsx`, `DiagnosisBoard.tsx` | KPI、趋势图、健康雷达、AI 运营诊断 |
| 学员 | `app/erp/students` | `students-client.tsx`, `[id]/page.tsx`, `[id]/enrollment-actions.tsx` | 学员列表、详情、报读课时账户 |
| 班级 | `app/erp/classes` | `classes-client.tsx` | 班级管理 |
| 课程 | `app/erp/courses` | `courses-client.tsx` | 课程管理 |
| 排课 | `app/erp/schedules` | `schedules-client.tsx` | 课程安排 |
| 出勤课消 | `app/erp/attendance` | `attendance-client.tsx` | 出勤、请假、课时消耗 |
| 财务 | `app/erp/finance` | `finance-client.tsx`, `commission/page.tsx` | 收入、课消、佣金 |
| 库存 | `app/erp/inventory` | `inventory-client.tsx` | 物料库存 |
| 线索 | `app/erp/leads` | `leads-client.tsx` | 销售线索 |
| 报表 | `app/erp/reports/page.tsx` | `page.tsx` | 报表入口 |
| 设置 | `app/erp/settings` | `page.tsx`, `staff-panel.tsx` | 员工与系统设置 |

### 7.2 ERP 公共组件

| 文件 | 说明 |
| --- | --- |
| `components/erp/sidebar.tsx` | ERP 侧边栏，按角色裁剪菜单 |
| `components/erp/command-palette.tsx` | Cmd+K 指令面板 |
| `components/erp/auth-switcher.tsx` | 开发/角色切换 |
| `components/erp/top-loading-bar.tsx` | 顶部加载条 |
| `components/erp/page-transition.tsx` | 页面动效容器 |
| `components/erp/animated-number.tsx` | KPI 数字动画 |
| `components/erp/growth-timeline.tsx` | 成长时间线 |
| `components/erp/skeleton-card.tsx` | 加载骨架屏 |

### 7.3 ERP 数据库

核心脚本：`database/supabase_erp_schema.sql`

| 表 | 说明 |
| --- | --- |
| `erp_courses` | 课程字典，含分类、时长、课时单价、总课时、状态 |
| `erp_students` | 学员档案，含姓名、家长、年级、学校、来源、标签 |
| `erp_classes` | 班级，关联课程、老师、助教、容量、教室、起止日期 |
| `erp_enrollments` | 报读/订单/课时账户，含购买课时、剩余课时、报读状态 |
| `erp_attendance` | 出勤与课消流水，含消耗课时、AI 点评、课堂媒体 |

相关脚本：

| 文件 | 说明 |
| --- | --- |
| `database/erp_rls_fix.sql` | ERP RLS 修复 |
| `database/edu_system_v2.sql` | 教研课件、逐课教学设计 |
| `database/student_learning_logs.sql` | 学习日志 |
| `database/schema_v2_logs.sql` | 日志 schema |

注意：`database/supabase_erp_schema.sql` 中 `erp_students.phone text15` 疑似类型笔误，迁移前需核实线上表结构。

## 8. 科创教研系统

| 模块 | 文件 | 说明 |
| --- | --- | --- |
| 教研布局 | `app/edu/layout.tsx` | 深色教研系统壳 |
| 教研首页 | `app/edu/page.tsx` | 从 ERP 拉取课程、班级、库存，展示研发模块 |
| 知识图谱 | `app/edu/knowledge-graph-client.tsx` | 教研课程图谱 |
| 生成器 | `app/edu/generator/page.tsx` | AI 课件/课程生成入口 |
| Labs | `app/edu/labs/page.tsx` | 实验模块 |
| Settings | `app/edu/settings/page.tsx` | 教研设置 |
| Vault | `app/edu/vault/page.tsx`, `vault-client.tsx`, `actions.ts` | 教研资料库 |
| 调优台 | `app/edu/tuning-desk/*` | 协作调优、代码块扩展、机器人部件扩展 |

数据库：

| 表 / 文件 | 说明 |
| --- | --- |
| `edu_lesson_plans` | 课件正文，保存 slides JSON、教案、版本、发布状态 |
| `edu_lessons` | 逐课教学设计，含目标、物料、课时、评估标准 |
| `database/edu_vault.sql` | 教研资料库 |

## 9. AI 互动课堂与生成系统

### 9.1 生成 API

| API | 文件 | 说明 |
| --- | --- | --- |
| 创建异步课堂任务 | `app/api/generate-classroom/route.ts` | 创建 job，返回 pollUrl |
| 查询任务状态 | `app/api/generate-classroom/[jobId]/route.ts` | 读取 `classroom_jobs` |
| 读取课堂 | `app/api/classroom/route.ts` | 读取 `stages` / `scenes` |
| 大纲流式生成 | `app/api/generate/scene-outlines-stream/route.ts` | Stage 1 大纲 |
| 场景内容生成 | `app/api/generate/scene-content/route.ts` | Stage 2 内容 |
| 场景动作生成 | `app/api/generate/scene-actions/route.ts` | Stage 3 动作 |
| Agent 画像生成 | `app/api/generate/agent-profiles/route.ts` | 多智能体角色 |
| TTS | `app/api/generate/tts/route.ts`, `app/api/edge-tts/route.ts`, `app/api/azure-voices/route.ts` | 语音 |
| 图片生成 | `app/api/generate/image/route.ts` | 图像模型 |
| 视频生成 | `app/api/generate/video/route.ts` | 视频模型 |
| PDF 解析 | `app/api/parse-pdf/route.ts` | 文档解析 |
| Web Search | `app/api/web-search/route.ts` | Tavily |
| Quiz Grade | `app/api/quiz-grade/route.ts` | 测验评分 |

### 9.2 核心库

| 路径 | 说明 |
| --- | --- |
| `lib/ai` | Provider 注册、模型初始化、LLM 调用、thinking 适配 |
| `lib/generation` | 大纲、场景内容、动作、JSON 修复、Prompt 加载、Pipeline Runner |
| `lib/server/classroom-generation.ts` | 服务端完整课堂生成 |
| `lib/server/classroom-media-generation.ts` | 服务端媒体和 TTS 生成 |
| `lib/server/classroom-storage.ts` | 课堂持久化 |
| `lib/server/classroom-job-store.ts` | 异步 job 持久化 |
| `lib/media` | 图片/视频 provider 与适配器 |
| `lib/audio` | TTS/ASR provider、浏览器语音、预览 |
| `lib/playback` | 播放引擎 |
| `lib/action` | 课堂动作引擎 |
| `lib/orchestration` | 多智能体 director、prompt、registry、工具 schema |

### 9.3 数据表

| 表 | 说明 |
| --- | --- |
| `stages` | 课堂总概，含名称、描述、语言、风格、agent_ids、白板、社交统计 |
| `scenes` | 场景内容，含 type、content、actions、whiteboards、multi_agent |
| `classroom_jobs` | 异步生成任务，含 status、step、progress、result、error |

## 10. Psyche X 测评系统

### 10.1 Next.js API

| API | 文件 | 说明 |
| --- | --- | --- |
| 营地评估数据 | `app/api/camp_report/route.ts` | 营地评估读写 |
| 营地报告生成 | `app/api/camp_report/generate/route.ts` | 生成报告数据 |
| 实验室评估数据 | `app/api/lab_report/route.ts` | 实验室评估读写 |
| 实验室报告生成 | `app/api/lab_report/generate/route.ts` | 生成报告数据 |

### 10.2 静态前端

主路径：`public/psyche_x_system/frontend`

| 分类 | 文件 |
| --- | --- |
| 入口 | `index.html`, `hub.html`, `portal.html`, `launcher_v2.html`, `login.html` |
| 管理后台 | `admin-dashboard.html`, `admin-settings.html`, `admin-users.html`, `admin_matrix.html` |
| 用户与订阅 | `profile.html`, `premium.html`, `subscription.html` |
| 营地系统 | `camp_dashboard.html`, `camp_input.html`, `camp_report.html` |
| 实验室系统 | `lab_dashboard.html`, `lab_input.html`, `lab_report.html` |
| 总报告 | `report_global.html`, `final.html`, `mit-final.html`, `pdf_test.html` |
| 测评任务 | `reaction.html`, `stroop.html`, `schulte.html`, `digit_span.html`, `verbal_memory.html`, `verbal_reasoning.html`, `mental_rotation.html`, `spatial.html`, `matrices.html`, `logic_deduction.html`, `visual_search.html`, `token_search.html`, `feature_match.html`, `sequence.html`, `planning.html`, `gonogo.html`, `chimp.html`, `typing.html`, `working.html`, `double_trouble.html`, `aim.html`, `breathing.html`, `assessment_junior.html` |
| JS 引擎 | `engine_core_v2.js`, `kernel.js`, `game.js`, `i18n.js`, `lang.js`, `stroop.js`, `spatial.js`, `matrices.js` |
| 数据/认证/教练 | `js/data_client.js`, `js/data_manager.js`, `js/auth_manager.js`, `js/assistant_core.js`, `js/coach.js`, `js/gamification.js`, `js/self_check.js` |
| 新任务引擎 | `tasks/engine_omni.js`, `tasks/engine_ques_v3.js`, `tasks/omni_assessment.html`, `tasks/report_global_v3.html`, `tasks/wcst.js` |

### 10.3 Python 后端

路径：`public/psyche_x_system/backend`

| 文件 | 说明 |
| --- | --- |
| `main.py` | 后端主服务 |
| `run.py` | 启动脚本 |
| `database.py` | 数据库连接 |
| `models.py` | ORM / 数据模型 |
| `schemas.py` | API Schema |
| `crud.py` | 数据读写 |
| `algorithms.py` | 测评算法 |
| `report_generator.py` | 报告生成 |
| `data_exporter.py` | 数据导出 |
| `seed_data.py`, `seed_data_stdlib.py` | 初始化数据 |
| `supabase_schema.sql`, `fix_db_v2.sql` | 数据库脚本 |
| `psyche_x_core.db`, `psyche_x_monolith.db` | SQLite 数据库 |
| `requirements.txt`, `package.json`, `Dockerfile` | 依赖与部署 |

### 10.4 测评数据库

| 文件 | 说明 |
| --- | --- |
| `database/supabase_camp_evaluations.sql` | 营地评估主 schema |
| `database/alter_camp_evaluations_v2.sql` | 营地评估 schema 升级 |
| `public/psyche_x_system/backend/supabase_schema.sql` | Psyche X 后端 schema |

### 10.5 报告打印约束

重点文件：`public/psyche_x_system/frontend/camp_report.html`

已经包含：

| 能力 | 说明 |
| --- | --- |
| A4 页面尺寸 | `.pdf-page` 使用 794px x 1123px，打印时转为 `210mm` 宽 |
| 打印媒体查询 | `@media print` 设置 `@page { size: A4 portrait; margin: 0; }` |
| 背景显色 | `print-color-adjust: exact` 与 inset shadow 补丁 |
| 分页控制 | `.pdf-page-break` 与 `page-break-after` |
| 可编辑审阅 | 多处 `contenteditable` 支持导师改稿 |

## 11. 微信小程序 Hybrid

路径：`miniprogram`

| 页面 | 文件 | 说明 |
| --- | --- | --- |
| 座舱 | `pages/index/index.*` | web-view 加载 `https://www.zhouxiaomai.com/index.html?ui_mode=miniprogram...` |
| AI Lab | `pages/ai-lab/index.*` | web-view 加载 `https://ai.zhouxiaomai.com/?ui_mode=miniprogram` |
| 课程 | `pages/course/index.*` | 课程体系页 |
| 档案 | `pages/profile/index.*` | 用户档案 |
| 通用 WebView | `pages/webview/webview.*` | 接收 URL 参数并加载 |
| 旧/扩展页面 | `pages/coding`, `pages/detail`, `pages/galaxy`, `pages/mine` | 仍在目录中，但未全部注册到 `app.json` |

小程序兼容铁律：

| 规则 | 当前状态 |
| --- | --- |
| H5 跳转使用生产域名绝对路径 | 小程序入口已使用线上域名 |
| 移除 `target="_blank"` | 仓库仍存在多处残留，集中在 `public/resources/*.html` 和 `components/ai-elements/open-in-chat.tsx` |
| web-view 页面避免依赖新窗口 | 后续改 H5 时必须检查 |

## 12. 静态 H5 与课程资源

| 路径 | 说明 |
| --- | --- |
| `public/index.html` | 主域名首页，Dock、Launchpad、新闻条、订阅、Supabase、TTS |
| `public/resources` | 主题课程页、IDE、课程工厂、招生页、定价页、实验页 |
| `public/resources/hf-course` | Hugging Face Course 多语言 MDX，约 1044 个 `.mdx` |
| `public/resources/archive` | 旧自动生成子页归档 |
| `public/resources/legacy_mozi` | 旧 Mozi 归档 |
| `public/assets` | CSS、JS、图片、字体、TCM、Scratch Jr、vendor |
| `public/assessment` | 轻量测评旧版本 |
| `public/Psyche_X_Evolution_Archive` | Psyche X 演进归档 |

常见 Clean URL：

| URL | 静态文件 |
| --- | --- |
| `/course` | `/resources/course.html` |
| `/pricing` | `/resources/pricing-demo.html` |
| `/download` | `/resources/download.html` |
| `/labs` | `/resources/labs.html` |
| `/ide` | `/resources/ide-scratch.html` |

## 13. 测试与质量

| 类型 | 路径 / 命令 | 说明 |
| --- | --- | --- |
| 单元测试 | `pnpm test` | Vitest |
| E2E | `pnpm test:e2e` | Playwright |
| 格式检查 | `pnpm check` | Prettier check |
| 格式化 | `pnpm format` | Prettier write |
| 构建 | `pnpm build` | 先清理 `.next`，运行 `scripts/pre-build-check.js`，再 `next build` |
| Lint | `pnpm lint` | 当前脚本为 `echo skipping lint` |

测试文件：

| 文件 | 说明 |
| --- | --- |
| `tests/store/settings-validation.test.ts` | 设置校验 |
| `tests/store/settings-server-sync.test.ts` | 服务端设置同步 |
| `tests/server/provider-config.test.ts` | provider config |
| `e2e/tests/generation-flow.spec.ts` | 生成流程 |
| `e2e/tests/home-to-generation.spec.ts` | 首页到生成 |
| `e2e/tests/classroom-interaction.spec.ts` | 课堂交互 |

## 14. 当前 Git 工作区状态

最近一次扫描结果：

| 状态 | 数量 | 说明 |
| --- | ---: | --- |
| `D` | 3114 | 大量已删除文件，主要是 `._*` AppleDouble 元数据和部分旧静态页 |
| `M` | 5 | 已修改文件 |
| `??` | 6 | 未跟踪文件/目录 |

管理原则：

1. 不主动恢复已删除的 `._*` 元数据文件。
2. 不主动清理、提交或重置这些状态，除非明确收到指令。
3. 后续改动必须基于当前脏工作区，避免覆盖用户已有变更。

## 15. 已识别风险与治理清单

| 优先级 | 风险 | 位置 | 建议 |
| --- | --- | --- | --- |
| P0 | 服务端与客户端存在硬编码 API Key / TTS Token 风格逻辑 | `lib/server/provider-config.ts`, `lib/store/settings.ts`, `components/home-page.tsx` | 迁移到环境变量或受控 server config，前端不得暴露真实 key |
| P0 | `target="_blank"` 与小程序 Hybrid 兼容冲突 | `public/resources/*.html`, `components/ai-elements/open-in-chat.tsx` | 批量改为当前页跳转或小程序兼容路由 |
| P0 | Mozi/墨子文案残留 | `middleware.ts`, `public/mozi_index.js`, `public/resources/*`, `public/infographic/*` | 建立品牌净化清单，分批替换为 FutureClass/TitanTech |
| P1 | `next.config.ts` 忽略 TS/ESLint 构建错误 | `next.config.ts` | 短期可保留，长期应逐步恢复质量门禁 |
| P1 | ERP schema 中存在疑似 SQL 类型错误 `text15` | `database/supabase_erp_schema.sql` | 迁移前核验线上 schema 并修复脚本 |
| P1 | `public` 静态资源体量极大 | `public/resources`, `public/assets` | 建立资源索引、归档策略、线上可达性检查 |
| P1 | Psyche X 同时存在静态前端、Python 后端、SQLite、Supabase schema | `public/psyche_x_system` | 明确生产运行模式：静态+Next API 还是 Python 后端 |
| P2 | `public/resources/hf-course` 多语言 MDX 文件占比高 | `public/resources/hf-course` | 若非主业务，考虑子模块或归档 |
| P2 | README 仍是 OpenMAIC 上游说明 | `README.md`, `README-zh.md` | 补充 FutureClass 本项目 README |

## 16. 后续维护建议

### 16.1 建议建立 5 份长期文档

| 文档 | 建议路径 | 用途 |
| --- | --- | --- |
| 仓库总览 | `FUTURECLASS_REPOSITORY_MANAGEMENT.md` | 当前文档，作为导航总表 |
| 路由地图 | `docs/ROUTES.md` | Next.js 路由、静态 H5、middleware 映射 |
| 数据库地图 | `docs/DATABASE.md` | Supabase 表、RLS、迁移脚本、线上差异 |
| API 网关地图 | `docs/API_GATEWAY.md` | AI provider、backgrace、TTS、ASR、PDF、媒体 |
| 品牌净化清单 | `docs/BRAND_PURIFICATION.md` | Mozi 残留、target blank、小程序兼容 |

### 16.2 建议建立 4 个自动化检查

| 检查 | 内容 |
| --- | --- |
| 品牌检查 | 搜索 `Mozi`, `mozi`, `墨子` |
| 小程序兼容检查 | 搜索 `target="_blank"`, `window.open` |
| Key 泄露检查 | 搜索 `sk-`, `Bearer`, `API_KEY`, token |
| 路由可达检查 | 检查 Clean URL 与 `public/resources` 文件存在性 |

### 16.3 建议的迭代顺序

1. 先锁定 Git 工作区状态，确认哪些删除是预期清理。
2. 修复 ERP schema 明显问题，补充数据库地图。
3. 批量治理小程序不兼容跳转。
4. 抽离硬编码 provider / TTS / backgrace 配置。
5. 清理 Mozi 品牌残留，保留到 `legacy_mozi` 的只做归档。
6. 为 ERP、Psyche X、AI 课堂分别补最小 E2E smoke test。

