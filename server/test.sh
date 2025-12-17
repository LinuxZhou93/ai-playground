#!/bin/bash

# 智慧教材系统 - 完整测试脚本
# 自动检测、安装、启动

set -e  # 遇到错误立即退出

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📚 智慧教材系统 - 自动部署测试"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 步骤1：检查环境
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🔍 步骤1/5：检查运行环境"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ 未安装 Node.js${NC}"
    echo "   请访问: https://nodejs.org/ 下载安装"
    exit 1
fi

echo -e "${GREEN}✅ Node.js 已安装: $(node -v)${NC}"
echo -e "${GREEN}✅ npm 版本: $(npm -v)${NC}"
echo ""

# 步骤2：检查依赖
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📦 步骤2/5：检查/安装依赖"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

if [ ! -d "node_modules" ]; then
    echo -e "${YELLOW}⚠️  首次运行，需要安装依赖...${NC}"
    echo -e "${BLUE}💡 提示：Puppeteer会下载Chrome（约150MB），请耐心等待${NC}"
    echo ""
    
    # 使用国内镜像加速
    export PUPPETEER_DOWNLOAD_HOST=https://npmmirror.com/mirrors
    
    npm install
    
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ 依赖安装成功！${NC}"
    else
        echo -e "${RED}❌ 依赖安装失败${NC}"
        exit 1
    fi
else
    echo -e "${GREEN}✅ 依赖已安装${NC}"
fi
echo ""

# 步骤3：配置账号
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🔐 步骤3/5：配置智慧教育平台账号"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

if [ -z "$SMARTEDU_USERNAME" ]; then
    echo -e "${YELLOW}请输入智慧教育平台账号（手机号）:${NC}"
    read -p "用户名: " SMARTEDU_USERNAME
    export SMARTEDU_USERNAME
fi

if [ -z "$SMARTEDU_PASSWORD" ]; then
    echo -e "${YELLOW}请输入密码:${NC}"
    read -sp "密码: " SMARTEDU_PASSWORD
    export SMARTEDU_PASSWORD
    echo ""
fi

echo ""
echo -e "${GREEN}✅ 账号配置完成${NC}"
echo -e "   用户名: ${BLUE}${SMARTEDU_USERNAME}${NC}"
echo ""

# 步骤4：检查端口
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🔌 步骤4/5：检查端口占用"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

if lsof -Pi :3001 -sTCP:LISTEN -t >/dev/null ; then
    echo -e "${YELLOW}⚠️  端口3001已被占用${NC}"
    echo -e "${BLUE}正在尝试关闭...${NC}"
    lsof -ti:3001 | xargs kill -9 2>/dev/null || true
    sleep 1
fi

echo -e "${GREEN}✅ 端口3001可用${NC}"
echo ""

# 步骤5：启动服务
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🚀 步骤5/5：启动Puppeteer服务"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo -e "${BLUE}选择启动模式:${NC}"
echo "  1) 可视化模式 (推荐) - 可以看到浏览器操作"
echo "  2) 后台模式 - 浏览器隐藏运行"
echo ""
read -p "请选择 [1-2]: " mode
echo ""

case $mode in
    1)
        echo -e "${GREEN}🌐 启动可视化模式...${NC}"
        echo -e "${BLUE}💡 提示：Chrome浏览器窗口会自动打开${NC}"
        echo -e "${BLUE}💡 您将看到自动登录的完整过程${NC}"
        echo ""
        echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
        echo "📺 观看自动化运行..."
        echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
        echo ""
        
        npm run start:headful
        ;;
    2)
        echo -e "${GREEN}🚀 启动后台模式...${NC}"
        echo ""
        
        npm run start:puppeteer
        ;;
    *)
        echo -e "${RED}❌ 无效选择${NC}"
        exit 1
        ;;
esac
