#!/bin/bash
# Psyche-X System Launcher
# Auto-start Backend + Frontend

set -e

PROJECT_ROOT="$(cd "$(dirname "$0")" && pwd)"
BACKEND_DIR="$PROJECT_ROOT/backend"
FRONTEND_DIR="$PROJECT_ROOT/frontend"

echo "🧠 PSYCHE-X SYSTEM INITIALIZING..."

# Kill existing processes
echo "🔪 Cleaning up ports..."
lsof -ti:8000 | xargs kill -9 2>/dev/null || true
lsof -ti:3000 | xargs kill -9 2>/dev/null || true

# Start Backend
echo "🚀 Starting Backend (Port 8000)..."
osascript -e "tell application \"Terminal\" to do script \"cd $BACKEND_DIR && source venv/bin/activate && python3 run.py\"" &
sleep 2

# Start Frontend
echo "🎨 Starting Frontend (Port 3000)..."
osascript -e "tell application \"Terminal\" to do script \"cd $FRONTEND_DIR && python3 -m http.server 3000\"" &
sleep 1

# Open Browser
echo "🌐 Opening Browser..."
open http://localhost:3000

echo "✅ PSYCHE-X ONLINE"
echo "   Frontend: http://localhost:3000"
echo "   Backend:  http://127.0.0.1:8000"
echo "   API Docs: http://127.0.0.1:8000/docs"
