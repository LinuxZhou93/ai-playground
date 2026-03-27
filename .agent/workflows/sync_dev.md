---
description: 多机同步开发工作流 - 在多台电脑上同时开发不同页面并通过 Git 协作
---

# 🔄 多机同步开发工作流

## 前提条件
- 所有开发机已通过 `scripts/setup-unit1.sh` 完成环境配置
- GitHub 仓库: `LinuxZhou93/ai-playground`
- 每台开发机能 `git push/pull` 到远端

## 开始工作前（每次开发前必做）

// turbo
1. 拉取远程最新代码
```bash
cd ~/Desktop/github/ai-playground
git pull origin main
```

## 开发中的标准流程

2. 确认你负责的模块/页面（避免与其他机器冲突）
   - **机器A**: 负责页面 X, Y
   - **Unit1**: 负责页面 A, B
   - 公共文件（如 hub.html, index.html）约定由一台机器修改

3. 正常开发你负责的部分

4. 频繁提交（小步提交，减少冲突）
```bash
git add .
git commit -m "feat: 简短描述改动"
```

## 推送代码

5. 推送前先拉取合并
```bash
git pull origin main
```

6. 如果有冲突，解决冲突后：
```bash
# 编辑冲突文件，解决 <<<< ==== >>>> 标记
git add .
git commit -m "merge: 解决冲突"
```

7. 推送到远端
```bash
git push origin main
```

## 分支开发模式（可选，适合大功能）

8. 创建功能分支
```bash
git checkout -b feature/描述性名称
# 开发...
git add . && git commit -m "feat: xxx"
git push origin feature/描述性名称
```

9. 完成后合并回 main
```bash
git checkout main
git pull origin main
git merge feature/描述性名称
git push origin main
```

## ⚠️ 冲突避免策略

| 级别 | 策略 |
|------|------|
| **最佳** | 按文件/目录分工，完全不碰对方的文件 |
| **良好** | 按功能模块分工，偶尔可能碰到公共文件 |
| **可接受** | 同一文件不同区域，Git 通常能自动合并 |
| **危险** | 同一文件同一区域，需要手动解决冲突 |

## 推荐模块分工

### 可并行开发的独立模块:
- `psyche_x_system/frontend/tasks/` - 各个课程任务页面（互相独立）
- `assets/themes/` - 各主题课程 HTML（互相独立）  
- `openmaic-core/components/` - 各独立组件（需注意共享导入）
- `supabase/` - 数据库相关脚本

### 需要协调的共享文件:
- `psyche_x_system/frontend/hub.html` - 主导航页
- `openmaic-core/app/` - Next.js 路由
- `assets/js/titan-ai-assistant.js` - 全局 AI 助手
- `assets/css/` - 全局样式
