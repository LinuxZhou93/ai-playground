#!/bin/bash

# Psyche-X Automaton Setup Script
# Commander: Iron-Wind
# Function: Initialize the entire Neuro-Cognitive Engine environment

set -e # Exit immediately if a command exits with a non-zero status

GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}[IRON-WIND] Initializing Psyche-X Automaton...${NC}"

# 1. 检查 Docker 环境 (跳过强制检查，使用 SQLite 模式)
echo -e "${GREEN}[Step 1] Infrastructure Check (Emergency Mode: SQLite Active)...${NC}"
# docker-compose up -d db redis # Skip for now

# 2. 后端环境配置
echo -e "${GREEN}[Step 2] Configuring Neural Backend...${NC}"
cd backend
if [ ! -d "venv" ]; then
    echo "Creating Python Virtual Environment..."
    python3 -m venv venv
fi
source venv/bin/activate
echo "Installing dependencies (this may take a minute)..."
pip install -r requirements.txt
# 启动后端 (后台运行)
echo "Starting Backend on Port 8000..."
nohup uvicorn main:app --reload --host 0.0.0.0 --port 8000 > ../backend_run.log 2>&1 &
BACKEND_PID=$!
echo "Backend running with PID: $BACKEND_PID"

# 3. 前端环境配置
cd ../frontend
echo -e "${GREEN}[Step 3] Configuring Frontend Interface...${NC}"
    # 尝试安装依赖，如果 npm 存在
    if command -v npm &> /dev/null; then
        echo "Installing Frontend Dependencies..."
        npm install
    else
        echo "Warning: npm not found via script. Please run 'npm install' manually inside /frontend."
    fi
else
    echo "Warning: /frontend directory not found. Please run init command manually."
fi

echo -e "${BLUE}[IRON-WIND] Automaton Sequence Complete. System Ready.${NC}"
echo -e "To start backend: cd backend && source venv/bin/activate && uvicorn main:app --reload"
echo -e "To start frontend: cd frontend && npm run dev"
