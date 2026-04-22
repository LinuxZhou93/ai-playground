---
description: 在本地项目中构建并集成 Scratch Jr Web 编辑器
---

本 Workflow 将指导你通过编译官方源码，将完整的 Scratch Jr 编辑器集成到项目中。

1. **准备构建目录**
   确保我们有一个干净的目录来存放源码。
   ```bash
   mkdir -p assets/scratchjr-src
   ```

2. **克隆 Scratch Jr 官方源码**
   我们将代码克隆到 `assets/scratchjr-src`。
   ```bash
   git clone https://github.com/LLK/scratchjr.git assets/scratchjr-src
   ```

3. **安装依赖**
   进入目录并安装 NPM 依赖。
   ```bash
   cd assets/scratchjr-src
   npm install
   ```
   *注意：如果遇到 Node 版本问题，请尝试使用 Node 16 (推荐) 或 14。*

4. **构建项目**
   运行构建命令生成 Web 版文件。
   ```bash
   cd assets/scratchjr-src
   npm run build
   ```
   构建完成后，产物通常位于 `src/build/browser` 或 `build` 目录中（取决于版本，官方库需确认具体输出位置，通常是 `src` 下的 web 构建配置）。
   *修正：ScratchJr 官方库主要是针对 iOS/Android 的。Web 版可能需要特定的构建目标。如果官方库直接构建 Web 版有困难，我们将切换到社区移植版 `scratchjr-web`*

   **替代方案 (推荐)：使用社区维护的 Web 版**
   由于官方仓库主要针对移动端，构建 Web 版可能复杂。我们推荐直接克隆社区验证过的 Web 移植版：
   ```bash
   rm -rf assets/scratchjr-src
   git clone https://github.com/scratchjr/scratchjr-community-edition.git assets/scratchjr-src
   # 或者
   # git clone https://github.com/rschamp/scratchjr-web.git assets/scratchjr-src
   ```
   
   让我们先尝试构建官方仓库，如果失败，则切换到社区版。

5. **部署产物**
   将构建好的静态文件复制到项目的 `assets/scratchjr` 目录，以便通过 iframe 访问。
   ```bash
   mkdir -p assets/scratchjr
   cp -R assets/scratchjr-src/build/* assets/scratchjr/
   ```

6. **清理**
   (可选) 删除源码目录以节省空间。
   ```bash
   # rm -rf assets/scratchjr-src
   ```

// turbo
7. **更新 ide-jr.html**
   此步骤需要手动或通过 Agent 修改 HTML 文件以指向 `assets/scratchjr/index.html`。
