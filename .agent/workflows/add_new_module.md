```
---
description: 如何在系统中添加一个新的高保真主题模块 (High-Fidelity Theme Module)
---

# 标准化主题模块开发工作流 (Standardized Theme Module Workflow)

本工作流基于 `astronomy.html` 和 `dino.html` 的成功实践总结，旨在快速构建具有**沉浸式体验**、**动态数据驱动**和**双语支持**的高质量学习模块。

## Phase 1: 策划与数据准备 (Planning & Data)

1.  **定义主题视觉**
    *   确定主色调（例如：天文学用 Cyan/Blue，恐龙用 Green/Amber）。
    *   生成/寻找一张高清 Hero 背景图。
    *   确定 3-5 个核心分类（例如：时期、天体类型）。

2.  **构建数据层 (`assets/js/[theme]-data.js`)**
    *   **不要硬编码 HTML**，必须使用 JS 数据对象。
    *   创建 `window.[theme]Labs` 数组，每个项目包含：
        *   `title` / `title_zh`: 中英文标题
        *   `description` / `description_zh`: 中英文简介
        *   `category`: 分类 Key
        *   `url`: 目标链接（3D Embed 或 外部网页）
        *   `thumbnail`: 本地或远程图片路径
        *   `embeddable`: `true` (可内嵌 iframe) / `false` (需跳转)
        *   `type`: 资源类型 (e.g., "3D Model", "Simulation")
    *   *(可选)* 创建 `window.[theme]Encyclopedia` 用于展示 Gamification 数值（攻击力、防御力等）。

## Phase 2: 视图层构建 ([theme].html)

1.  **基础框架**
    *   复制标准模板（如 `dino.html`）。
    *   引入 `assets/css/index.css` 和 **TailwindCSS CDN** (必须验证)。
    *   配置 Tailwind `theme.extend.colors` 以匹配主题色。

2.  **关键 UI 组件**
    *   **Hero Section**: 全屏呼吸背景 + 玻璃拟态标题。
    *   **Control Center**: 搜索栏 (Search) + 分类筛选器 (Filters) + 翻页器 (Pagination)。
    *   **Dynamic Grid**: 一个空的 `<div id="[theme]-grid">`，用于 JS 注入卡片。
    *   **Immersive Modal**: 全屏模态框，用于加载 iframe。
        *   **关键特性**: 必须包含 "Fossil Encased" / "Signal Lost" 等 **Fallback 界面**，用于处理 `embeddable: false` 的情况（防止 404）。

3.  **百科档案 (可选增强)**
    *   添加 "Classified Intel" 或 "Data Archive" 区域。
    *   使用横向滚动卡片展示详细数值。

## Phase 3: 逻辑实现 (Scripting)

1.  **初始化与配置**
    *   定义 `i18n` 字典，覆盖所有静态文本（导航、按钮、提示）。
    *   定义 `categoryLabels` 映射分类的中英文名称。

2.  **核心渲染函数**
    *   `renderFilters()`: 根据当前语言渲染分类按钮。
    *   `renderGrid()`: 
        *   过滤数据（Search + Category）。
        *   计算分页。
        *   生成卡片 HTML（支持悬停特效、3D 全息效果）。
    *   `openModal(url, embeddable)`: 
        *   如果 `embeddable: true`: 显示 loader -> 加载 iframe。
        *   如果 `embeddable: false`: 显示 Fallback 界面（带背景图的“加密/锁定”效果） -> 提供跳转按钮。

3.  **双语切换**
    *   实现 `toggleLanguage()`，切换 `currentLang` ('en'/'zh')。
    *   更新 DOM 中所有 `data-i18n` 元素。
    *   重新调用 `renderGrid()` 刷新内容。

## Phase 4: 集成与入口挂载 (Integration)

1.  **底部 Dock 栏 (Bottom Dock)**
    *   在 `index.html` 的 `.dock-container` 中添加新模块的图标。
    *   **风格统一**: 使用 Carbon Fibre 纹理叠加 + 渐变背景 + 悬停发光效果 (Glow Effect)。
    *   **交互**: 必须支持 `onclick="window.location.href='...'"` 跳转。

2.  **科技宝箱 (Tech Treasure Box / Launchpad)**
    *   在 `index.html` 的 `#launchpad` 模态框网格中添加对应的 App 图标。
    *   **重要**: 必须保持与 Dock 图标一致的视觉风格（颜色、Logo），因为用户习惯通过颜色快速定位。
    *   **标签**: 确保下方文字标签准确描述模块功能（支持中文）。

## Phase 5: 质量验证 (QA Checklist)

- [ ] **样式**: 确保 TailwindCSS 已加载，无样式崩坏。
- [ ] **数据**: 确保所有 Embed 链接有效（使用 Browser Agent 验证），无效链接设为 `embeddable: false`。
- [ ] **双语**: 切换语言时，标题、描述、分类、搜索占位符是否同步切换？
- [ ] **防 404**: 点击非 Embed 卡片，是否显示优雅的 Fallback 界面而不是 404 错误？
- [ ] **入口检查**: 
    - [ ] 底部 Dock 是否有点亮特效？
    - [ ] 科技宝箱 (Launchpad) 是否有对应图标？
    - [ ] 两个入口是否都能正确跳转？

