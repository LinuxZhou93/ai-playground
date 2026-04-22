#!/bin/bash
# =============================================================================
# 🚀 Chronos Swarm - 万能节点部署脚本 (Scout/Forge/Prime)
# =============================================================================

set -e

# --- 🛰️ 配置参数 (由 Unit-1 自动填充) ---
NODE_ID=${1:-unit2}
REPO_URL="https://github.com/LinuxZhou93/ai-playground.git"
TARGET_DIR="$HOME/Desktop/github/ai-playground"

# --- 🔑 注入核心密钥 ---
SUPABASE_URL="https://znmbkxmnwuurzhevfxtq.supabase.co"
SUPABASE_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpubWJreG1ud3V1cnpoZXZmeHRxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ1Nzk1MDQsImV4cCI6MjA4MDE1NTUwNH0.y0m9rnug3WduVyuKZLL25PBA4C2Ys0_WSgMrzokSh5g"

echo "╔══════════════════════════════════════════════════════════════╗"
echo "║       🛸 Chronos Swarm 节点入驻: $NODE_ID                   ║"
echo "╚══════════════════════════════════════════════════════════════╝"

# --- 🌐 初始化环境 (解决 SSH 非交互模式路径问题) ---
export PATH="/opt/homebrew/bin:/usr/local/bin:$PATH"
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"

# 1. 环境检查
echo "━━━ Step 1: 环境检查 ━━━"
if ! command -v node &> /dev/null; then 
    echo "❌ 缺少 Node.js。请确认为 Unit-2 安装了 Node.js 或 nvm。"
    exit 1
fi
if ! command -v git &> /dev/null; then echo "❌ 缺少 Git"; exit 1; fi
echo "✅ 环境就绪: $(node -v)"

# 2. 仓库同步
echo "━━━ Step 2: 仓库同步 ━━━"
mkdir -p "$HOME/Desktop/github"
if [ -d "$TARGET_DIR" ]; then
    echo "📡 检测到现有仓库，正在更新..."
    cd "$TARGET_DIR"
    git pull origin main
else
    echo "📥 正在克隆仓库..."
    git clone "$REPO_URL" "$TARGET_DIR"
    cd "$TARGET_DIR"
fi

# 3. 环境变量注入
echo "━━━ Step 3: 注入密钥 ━━━"
cat > .env.local << EOF
NEXT_PUBLIC_SUPABASE_URL=$SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY=$SUPABASE_KEY
NODE_ID=$NODE_ID
EOF
echo "✅ .env.local 已更新"

# 4. 依赖安装 (快速模式)
echo "━━━ Step 4: 安装核心依赖 ━━━"
npm install --no-audit --no-fund

# 5. 脉冲启动
echo "━━━ Step 5: 启动脉冲引擎 ━━━"
echo "🚀 节点 $NODE_ID 正在尝试上线..."
NODE_ID=$NODE_ID npx tsx scripts/swarm_pulse.ts
