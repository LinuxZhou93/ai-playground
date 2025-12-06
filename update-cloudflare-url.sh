#!/bin/bash
# Cloudflare隧道URL快速更新脚本
# 使用方法: ./update-cloudflare-url.sh "新的隧道URL"

if [ -z "$1" ]; then
    echo "❌ 错误: 请提供新的Cloudflare隧道URL"
    echo "使用方法: ./update-cloudflare-url.sh 'https://your-new-tunnel.trycloudflare.com'"
    exit 1
fi

NEW_URL="$1"

# 确保URL格式正确
if [[ ! $NEW_URL =~ ^https:// ]]; then
    echo "❌ 错误: URL必须以 https:// 开头"
    exit 1
fi

echo "🔄 正在更新Cloudflare隧道URL..."
echo "新URL: $NEW_URL"

# 使用sed更新index.html中的API_URL
if [[ "$OSTYPE" == "darwin"* ]]; then
    # macOS
    sed -i '' "s|const API_URL = 'https://[^']*';|const API_URL = '${NEW_URL}/v1/chat-messages';|g" index.html
else
    # Linux
    sed -i "s|const API_URL = 'https://[^']*';|const API_URL = '${NEW_URL}/v1/chat-messages';|g" index.html
fi

echo "✅ URL更新成功!"
echo ""
echo "📝 下一步操作:"
echo "1. 测试AI聊天功能: http://localhost:8089/index.html"
echo "2. 如果测试通过,提交更改:"
echo "   git add index.html"
echo "   git commit -m 'chore: 更新Cloudflare隧道URL'"
echo "   git push origin main"
