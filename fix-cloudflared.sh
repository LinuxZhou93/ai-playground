#!/bin/bash
# 自动修复并启动Cloudflare隧道脚本 (Agent Version)

echo "🔧 正在检查环境..."

# 1. 检查并安装 cloudflared (优先使用当前目录)
if [ -f "./cloudflared" ]; then
    echo "✅ 发现本地 cloudflared"
    chmod +x ./cloudflared
    CLOUDFLARED_CMD="./cloudflared"
elif command -v cloudflared &> /dev/null; then
    echo "✅ 发现系统 cloudflared"
    CLOUDFLARED_CMD="cloudflared"
else
    echo "❌ 未找到 cloudflared, 正在下载..."
    # 尝试下载二进制文件 (Mac amd64)
    curl -L https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-darwin-amd64.tgz -o cloudflared.tgz
    if [ $? -eq 0 ]; then
        tar -xzf cloudflared.tgz
        chmod +x cloudflared
        CLOUDFLARED_CMD="./cloudflared"
        echo "✅ 下载并解压成功"
    else
        echo "❌ 下载失败"
        exit 1
    fi
fi

# 2. 验证版本
$CLOUDFLARED_CMD --version
if [ $? -ne 0 ]; then
    echo "❌ cloudflared 无法运行"
    exit 1
fi

# 3. 启动隧道
echo "🚀 正在启动隧道 (后台运行)..."
pkill -f cloudflared # 杀死旧进程
nohup $CLOUDFLARED_CMD tunnel --url http://localhost:80 > tunnel_output.log 2>&1 &

echo "⏳ 等待隧道启动 (10秒)..."
sleep 10

# 4. 获取 URL
echo "🔍 正在获取 URL..."
TUNNEL_URL=$(grep -o 'https://.*\.trycloudflare.com' tunnel_output.log | head -n 1)

if [ -n "$TUNNEL_URL" ]; then
    echo "URL_FOUND:$TUNNEL_URL"
    # 保存到文件以便Agent读取
    echo "$TUNNEL_URL" > latest_url.txt
else
    echo "❌ 未能获取 URL. 请查看 tunnel_output.log 了解详情。"
    cat tunnel_output.log
fi
