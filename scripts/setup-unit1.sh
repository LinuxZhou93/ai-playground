#!/bin/bash
# =============================================================================
# 🚀 Unit1 同步开发部署脚本
# TitanTech 科技特长生培养系统 - 多机协作开发环境
# =============================================================================

set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m'

echo -e "${CYAN}"
echo "╔══════════════════════════════════════════════════════════════╗"
echo "║       🛸 TitanTech AI-Playground 同步开发部署              ║"
echo "║       Target: Unit1                                         ║"
echo "╚══════════════════════════════════════════════════════════════╝"
echo -e "${NC}"

# ============================================================================
# Step 1: 环境检查
# ============================================================================
echo -e "\n${BLUE}━━━ Step 1/5: 环境检查 ━━━${NC}"

# 检查 Git
if ! command -v git &> /dev/null; then
    echo -e "${RED}❌ Git 未安装。请先安装 Git:${NC}"
    echo "   brew install git   (macOS)"
    echo "   sudo apt install git   (Ubuntu)"
    exit 1
fi
echo -e "${GREEN}✔ Git $(git --version | cut -d' ' -f3)${NC}"

# 检查 Node.js
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js 未安装。请先安装 Node.js 20.x:${NC}"
    echo "   推荐使用 nvm: https://github.com/nvm-sh/nvm"
    echo "   nvm install 20"
    exit 1
fi

NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 20 ]; then
    echo -e "${RED}❌ Node.js 版本过低 ($(node -v))，需要 v20.x${NC}"
    echo "   nvm install 20 && nvm use 20"
    exit 1
fi
echo -e "${GREEN}✔ Node.js $(node -v)${NC}"

# 检查 npm
echo -e "${GREEN}✔ npm $(npm -v)${NC}"

# 检查 pnpm (openmaic-core 需要)
if ! command -v pnpm &> /dev/null; then
    echo -e "${YELLOW}⚠ pnpm 未安装，正在安装...${NC}"
    npm install -g pnpm
fi
echo -e "${GREEN}✔ pnpm $(pnpm -v)${NC}"

# ============================================================================
# Step 2: 克隆仓库
# ============================================================================
echo -e "\n${BLUE}━━━ Step 2/5: 克隆仓库 ━━━${NC}"

WORKSPACE_DIR="$HOME/Desktop/github"
REPO_DIR="$WORKSPACE_DIR/ai-playground"

mkdir -p "$WORKSPACE_DIR"

if [ -d "$REPO_DIR/.git" ]; then
    echo -e "${YELLOW}⚠ 仓库已存在，正在拉取最新代码...${NC}"
    cd "$REPO_DIR"
    git pull origin main
else
    echo -e "${CYAN}📥 正在克隆仓库...${NC}"
    cd "$WORKSPACE_DIR"
    git clone https://github.com/LinuxZhou93/ai-playground.git
    cd "$REPO_DIR"
fi

echo -e "${GREEN}✔ 仓库就绪: $REPO_DIR${NC}"

# ============================================================================
# Step 3: 配置 Git 用户（如果未配置）
# ============================================================================
echo -e "\n${BLUE}━━━ Step 3/5: Git 配置 ━━━${NC}"

GIT_USER=$(git config user.name 2>/dev/null || echo "")
if [ -z "$GIT_USER" ]; then
    echo -e "${YELLOW}⚠ Git 用户未配置${NC}"
    read -p "请输入你的 Git 用户名 (如: LinuxZhou93-Unit1): " git_name
    read -p "请输入你的 Git 邮箱: " git_email
    git config user.name "$git_name"
    git config user.email "$git_email"
fi
echo -e "${GREEN}✔ Git 用户: $(git config user.name) <$(git config user.email)>${NC}"

# ============================================================================
# Step 4: 安装依赖
# ============================================================================
echo -e "\n${BLUE}━━━ Step 4/5: 安装依赖 ━━━${NC}"

# 主项目依赖
echo -e "${CYAN}📦 安装主项目依赖...${NC}"
npm install

# OpenMAIC Core 依赖
echo -e "${CYAN}📦 安装 OpenMAIC Core 依赖...${NC}"
cd openmaic-core
pnpm install
cd ..

echo -e "${GREEN}✔ 所有依赖安装完成${NC}"

# ============================================================================
# Step 5: 环境变量配置
# ============================================================================
echo -e "\n${BLUE}━━━ Step 5/5: 环境变量配置 ━━━${NC}"

ENV_FILE="openmaic-core/.env.local"

if [ ! -f "$ENV_FILE" ]; then
    echo -e "${YELLOW}⚠ 缺少环境配置文件 .env.local${NC}"
    echo -e "${CYAN}正在创建模板...${NC}"
    
    cat > "$ENV_FILE" << 'ENVEOF'
# =============================================================================
# Unit1 环境变量 - 请从主开发机复制对应的 API Key
# =============================================================================

# Google Gemini (主力模型)
GOOGLE_API_KEY=
GOOGLE_BASE_URL=

# 默认模型
DEFAULT_MODEL=google:gemini-3-flash-preview

# TTS 语音合成 (如需要)
# TTS_OPENAI_API_KEY=
# TTS_OPENAI_BASE_URL=

# Supabase (如需要)
# NEXT_PUBLIC_SUPABASE_URL=
# NEXT_PUBLIC_SUPABASE_ANON_KEY=
ENVEOF

    echo -e "${RED}⚡ 重要：请编辑 $ENV_FILE 填入 API Key${NC}"
    echo -e "${YELLOW}   你可以从主开发机复制：${NC}"
    echo -e "   scp 主机用户名@主机IP:~/Desktop/github/ai-playground/openmaic-core/.env.local $ENV_FILE"
else
    echo -e "${GREEN}✔ 环境变量文件已存在${NC}"
fi

# ============================================================================
# 完成
# ============================================================================
echo -e "\n${CYAN}"
echo "╔══════════════════════════════════════════════════════════════╗"
echo "║                   ✅ 部署完成!                              ║"
echo "╠══════════════════════════════════════════════════════════════╣"
echo "║                                                              ║"
echo "║  📂 项目目录: ~/Desktop/github/ai-playground                ║"
echo "║                                                              ║"
echo "║  🚀 启动开发服务器:                                         ║"
echo "║     cd openmaic-core && pnpm dev                             ║"
echo "║                                                              ║"
echo "║  📋 协作开发流程:                                            ║"
echo "║     1. git pull origin main    # 拉取最新                   ║"
echo "║     2. 开发你负责的页面                                      ║"
echo "║     3. git add . && git commit -m '描述'                    ║"
echo "║     4. git pull origin main    # 合并远端                   ║"
echo "║     5. git push origin main    # 推送                       ║"
echo "║                                                              ║"
echo "╚══════════════════════════════════════════════════════════════╝"
echo -e "${NC}"
