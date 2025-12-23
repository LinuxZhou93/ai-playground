#!/bin/bash

# 获取当前脚本所在目录的绝对路径
BASE_DIR="$(cd "$(dirname "$0")" && pwd)"

echo "Initializing Psyche-X System from: $BASE_DIR"

# 1. 启动后端 (Backend) - 在新终端窗口中
osascript -e "tell application \"Terminal\" to do script \"cd '$BASE_DIR/backend' && echo '--- [BACKEND] Installing Dependencies... ---' && python3 -m venv venv && source venv/bin/activate && pip install -r requirements.txt && echo '--- [BACKEND] Starting Server... ---' && uvicorn main:app --reload\""

# 2. 启动前端 (Frontend) - 在新终端窗口中
osascript -e "tell application \"Terminal\" to do script \"cd '$BASE_DIR/frontend' && echo '--- [FRONTEND] Installing Dependencies... ---' && npm install && echo '--- [FRONTEND] Starting Interface... ---' && npm run dev\""

# 3. 等待并打开浏览器
echo "Services are starting... Browser will open in 10 seconds."
sleep 10
open "http://localhost:8000/docs"
open "http://localhost:3000"
