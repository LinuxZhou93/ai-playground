#!/bin/bash
# AI服务一键启动脚本

echo "🚀 启动AI聊天服务..."
echo ""

# 检查Docker
echo "1️⃣ 检查Docker服务..."
if ! docker ps &> /dev/null; then
    echo "❌ Docker未运行,请先启动Docker Desktop"
    exit 1
fi

# 检查Dify容器
if docker ps | grep -q "docker-nginx-1"; then
    echo "✅ Dify服务正在运行"
else
    echo "❌ Dify服务未运行"
    echo "请运行: cd ~/dify && docker-compose up -d"
    exit 1
fi

# 检查cloudflared
echo ""
echo "2️⃣ 检查Cloudflared..."
if ! command -v cloudflared &> /dev/null; then
    echo "❌ Cloudflared未安装"
    echo "正在安装..."
    brew install cloudflare/cloudflare/cloudflared
    if [ $? -ne 0 ]; then
        echo "❌ 安装失败,请手动运行: brew install cloudflare/cloudflare/cloudflared"
        exit 1
    fi
fi
echo "✅ Cloudflared已安装"

# 启动隧道
echo ""
echo "3️⃣ 启动Cloudflare隧道..."
echo "⚠️  请保持此窗口打开!"
echo "⚠️  隧道URL将显示在下方,请复制它"
echo ""
echo "按 Ctrl+C 停止隧道"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# 启动隧道(连接到nginx)
cloudflared tunnel --url http://localhost:80
