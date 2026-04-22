---
description: 多机同步开发工作流 - 在多台电脑上同时开发不同页面并通过 Git 协作
---

# 🔄 多机同步开发工作流

## 集群拓扑

| 单位 | 主机名 | IP | 用户 | SSH 命令 |
|------|--------|-----|------|---------|
| **本机** (当前) | zhoulin's Mac | - | zhoulin | - |
| **Unit1** (中央) | linuxzhoudeMacBook-Pro | 192.168.0.116 | linuxzhou | `ssh unit1` |
| **Unit2** (左) | zhoulindeMacBook-Pro | - | zhoulin | `ssh unit2` |
| **Unit3** (右) | zhoulindeMacBook-Air | - | zhoulin | `ssh unit3` |

## Unit1 开发环境信息

- **项目路径**: `/Users/linuxzhou/Desktop/github/ai-playground`
- **Node.js**: v20.20.2 (通过 nvm)
- **pnpm**: v10.33.0
- **开发服务器**: `http://192.168.0.116:3000`
- **Git 用户**: LinuxZhou93-Unit1

## 启动 Unit1 开发服务器

// turbo
1. 通过 SSH 启动 Unit1 的开发服务器
```bash
ssh unit1 'export NVM_DIR="$HOME/.nvm"; [ -s "$NVM_DIR/nvm.sh" ] && . "$NVM_DIR/nvm.sh"; cd ~/Desktop/github/ai-playground/openmaic-core && pnpm dev'
```

## 开始工作前（每次开发前必做）

// turbo
2. 本机拉取最新代码
```bash
cd ~/Desktop/github/ai-playground
git pull origin main
```

// turbo
3. Unit1 拉取最新代码
```bash
ssh unit1 'cd ~/Desktop/github/ai-playground && git pull origin main'
```

## 开发中的标准流程

4. 确认你负责的模块/页面（避免与其他机器冲突）
   - **本机**: 负责 openmaic-core 核心开发、AI 功能
   - **Unit1**: 负责静态页面、课程页面、样式优化

5. 正常开发你负责的部分

6. 频繁提交（小步提交，减少冲突）
```bash
git add .
git commit -m "feat: 简短描述改动"
```

## 推送代码

7. 推送前先拉取合并
```bash
git pull origin main
```

8. 如果有冲突，解决冲突后：
```bash
git add .
git commit -m "merge: 解决冲突"
```

9. 推送到远端
```bash
git push origin main
```

## 在 Unit1 上提交代码

10. SSH 到 Unit1 提交并推送
```bash
ssh unit1 'cd ~/Desktop/github/ai-playground && git add . && git commit -m "feat: xxx" && git push origin main'
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
