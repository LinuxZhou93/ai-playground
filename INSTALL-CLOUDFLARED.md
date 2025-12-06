# Cloudflared手动安装指南

## 问题说明
自动安装cloudflared遇到下载问题,需要手动安装。

## 解决方案

### 方法1: 使用Homebrew (推荐)

```bash
# 1. 安装Homebrew (如果未安装)
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# 2. 安装cloudflared
brew install cloudflare/cloudflare/cloudflared

# 3. 启动隧道
cloudflared tunnel --url http://localhost:80
```

### 方法2: 直接下载pkg安装包

1. 访问: https://github.com/cloudflare/cloudflared/releases/latest
2. 下载 `cloudflared-darwin-amd64.pkg`
3. 双击安装
4. 打开终端运行: `cloudflared tunnel --url http://localhost:80`

## 启动隧道后

1. 复制显示的URL (例如: `https://abc-123.trycloudflare.com`)
2. 运行更新脚本:
   ```bash
   cd /Users/zhoulin/Desktop/github/ai-playground
   ./update-cloudflare-url.sh "复制的URL"
   ```
3. 测试: http://localhost:8089/index.html
