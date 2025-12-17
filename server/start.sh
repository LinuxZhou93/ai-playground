#!/bin/bash

# 智慧教材系统 - 快速启动脚本
# 使用方法: ./start.sh

echo "📚 智慧教材系统 - 启动向导"
echo "================================"
echo ""

# 检查Node.js
if ! command -v node &> /dev/null; then
    echo "❌ 未安装 Node.js，请先安装: https://nodejs.org/"
    exit 1
fi

echo "✅ Node.js 版本: $(node -v)"
echo ""

# 检查是否在server目录
if [ ! -f "package.json" ]; then
    echo "⚠️  请在 server 目录下运行此脚本"
    echo "执行: cd server && ./start.sh"
    exit 1
fi

# 检查依赖
if [ ! -d "node_modules" ]; then
    echo "📦 首次运行，正在安装依赖..."
    echo "提示：Puppeteer会下载Chrome（约150MB），请耐心等待"
    echo ""
    npm install
    echo ""
fi

# 获取账号密码
echo "🔐 配置智慧教育平台账号"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

if [ -z "$SMARTEDU_USERNAME" ]; then
    echo -n "请输入用户名（手机号）: "
    read SMARTEDU_USERNAME
    export SMARTEDU_USERNAME
fi

if [ -z "$SMARTEDU_PASSWORD" ]; then
    echo -n "请输入密码: "
    read -s SMARTEDU_PASSWORD
    export SMARTEDU_PASSWORD
    echo ""
fi

echo ""
echo "✅ 账号配置完成"
echo ""

# 选择启动模式
echo "🚀 选择启动模式"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "1) 可视化模式（可以看到浏览器操作，推荐首次使用）"
echo "2) 后台模式（无头模式，适合正常使用）"
echo "3) 仅检查状态"
echo ""
echo -n "请选择 [1-3]: "
read mode

echo ""

case $mode in
    1)
        echo "🌐 启动可视化模式..."
        echo "提示：你将看到Chrome浏览器自动登录过程"
        echo ""
        npm run start:headful
        ;;
    2)
        echo "🚀 启动后台模式..."
        echo "提示：浏览器在后台运行，不可见"
        echo ""
        npm run start:puppeteer
        ;;
    3)
        echo "🔍 检查服务状态..."
        echo ""
        curl -s http://localhost:3001/health | json_pp 2>/dev/null || curl -s http://localhost:3001/health
        echo ""
        echo "如果显示错误，说明服务未运行"
        ;;
    *)
        echo "❌ 无效选择"
        exit 1
        ;;
esac
