#!/bin/bash
# Cloudflared一键安装和启动脚本

echo "🚀 开始安装Cloudflared..."

# 方法1: 尝试使用Homebrew
if command -v brew &> /dev/null; then
    echo "✅ 检测到Homebrew,使用brew安装..."
    brew install cloudflare/cloudflare/cloudflared
    CLOUDFLARED_PATH=$(which cloudflared)
else
    echo "⚠️  未检测到Homebrew"
    echo "📥 请手动执行以下命令之一:"
    echo ""
    echo "方法1 - 安装Homebrew后使用brew:"
    echo "/bin/bash -c \"\$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)\""
    echo "brew install cloudflare/cloudflare/cloudflared"
    echo ""
    echo "方法2 - 直接下载pkg安装包:"
    echo "访问: https://github.com/cloudflare/cloudflared/releases/latest"
    echo "下载: cloudflared-darwin-amd64.pkg"
    echo "双击安装即可"
    echo ""
    exit 1
fi

# 启动隧道
if [ -n "$CLOUDFLARED_PATH" ]; then
    echo ""
    echo "✅ Cloudflared安装成功!"
    echo "🌐 正在启动隧道..."
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo ""
    cloudflared tunnel --url http://localhost:80
fi
