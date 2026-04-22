---
description: 一键同步代码到远程仓库 (Add, Commit, Pull, Push)
---

# 🔄 一键同步工作流

此工作流用于在多机协作时快速同步本地更改。

// turbo
1. 暂存所有更改并生成简短描述进行提交
```bash
git add .
# 自动生成基于 diff 的简短描述
git commit -m "sync: $(git status -s | head -n 5 | xargs | cut -c1-50)"
```

// turbo
2. 拉取远程更改并尝试自动合并
```bash
# 使用 --no-edit 自动接受合并信息，使用 -X theirs 优先接受远程更改减小冲突阻力（可根据实际情况调整）
git pull origin main --no-edit
```

// turbo
3. 推送到远程仓库
```bash
git push origin main
```
