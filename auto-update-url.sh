#!/bin/bash
# 自动获取Cloudflare隧道URL并更新配置

echo "🚀 正在创建Cloudflare隧道..."
echo "⏳ 请稍候,这可能需要几分钟..."
echo ""

# 启动cloudflared并捕获输出
TUNNEL_OUTPUT=$(/tmp/cloudflared tunnel --url http://localhost:80 2>&1 &)
TUNNEL_PID=$!

# 等待隧道URL出现
echo "等待隧道URL生成..."
sleep 10

# 获取隧道URL
NEW_URL=""
for i in {1..30}; do
    # 检查进程日志
    if ps -p $TUNNEL_PID > /dev/null; then
        # 尝试从日志中提取URL
        URL_LINE=$(tail -20 /tmp/cloudflared.log 2>/dev/null | grep -o 'https://[a-z0-9-]*\.trycloudflare\.com' | head -1)
        
        if [ ! -z "$URL_LINE" ]; then
            NEW_URL=$URL_LINE
            break
        fi
    fi
    sleep 2
done

if [ -z "$NEW_URL" ]; then
    echo "❌ 无法获取隧道URL,请手动运行:"
    echo "/tmp/cloudflared tunnel --url http://localhost:80"
    exit 1
fi

echo "✅ 获得新的隧道URL: $NEW_URL"
echo ""

# 使用更新脚本
./update-cloudflare-url.sh "$NEW_URL"

echo ""
echo "🎉 完成!隧道正在后台运行 (PID: $TUNNEL_PID)"
echo "💡 要停止隧道,运行: kill $TUNNEL_PID"
