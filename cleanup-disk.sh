#!/bin/bash

# 磁盘空间清理脚本
# 用于清理常见的缓存和临时文件,释放磁盘空间

echo "🧹 开始清理磁盘空间..."
echo ""

# 记录初始磁盘使用情况
INITIAL_USAGE=$(df -h / | awk 'NR==2 {print $5}')
echo "📊 当前磁盘使用率: $INITIAL_USAGE"
echo ""

# 清理计数器
CLEANED_SIZE=0

# 1. 清理 Playwright 缓存 (511MB)
echo "1️⃣ 清理 Playwright 缓存..."
if [ -d ~/Library/Caches/ms-playwright ]; then
    SIZE=$(du -sh ~/Library/Caches/ms-playwright 2>/dev/null | awk '{print $1}')
    echo "   发现 Playwright 缓存: $SIZE"
    rm -rf ~/Library/Caches/ms-playwright/*
    echo "   ✅ 已清理"
else
    echo "   ⏭️  未找到"
fi
echo ""

# 2. 清理 Google 缓存 (1.2GB)
echo "2️⃣ 清理 Google Chrome 缓存..."
if [ -d ~/Library/Caches/Google ]; then
    SIZE=$(du -sh ~/Library/Caches/Google 2>/dev/null | awk '{print $1}')
    echo "   发现 Google 缓存: $SIZE"
    rm -rf ~/Library/Caches/Google/Chrome/*
    echo "   ✅ 已清理"
else
    echo "   ⏭️  未找到"
fi
echo ""

# 3. 清理 Python pip 缓存 (220MB)
echo "3️⃣ 清理 Python pip 缓存..."
if [ -d ~/Library/Caches/pip ]; then
    SIZE=$(du -sh ~/Library/Caches/pip 2>/dev/null | awk '{print $1}')
    echo "   发现 pip 缓存: $SIZE"
    rm -rf ~/Library/Caches/pip/*
    echo "   ✅ 已清理"
else
    echo "   ⏭️  未找到"
fi
echo ""

# 4. 清理 npm 缓存
echo "4️⃣ 清理 npm 缓存..."
if command -v npm &> /dev/null; then
    npm cache clean --force 2>/dev/null
    echo "   ✅ 已清理"
else
    echo "   ⏭️  npm 未安装"
fi
echo ""

# 5. 清理 Homebrew 缓存
echo "5️⃣ 清理 Homebrew 缓存..."
if command -v brew &> /dev/null; then
    brew cleanup -s 2>/dev/null
    rm -rf $(brew --cache) 2>/dev/null
    echo "   ✅ 已清理"
else
    echo "   ⏭️  Homebrew 未安装"
fi
echo ""

# 6. 清理系统日志
echo "6️⃣ 清理系统日志..."
if [ -d ~/Library/Logs ]; then
    SIZE=$(du -sh ~/Library/Logs 2>/dev/null | awk '{print $1}')
    echo "   发现日志文件: $SIZE"
    find ~/Library/Logs -type f -name "*.log" -mtime +7 -delete 2>/dev/null
    echo "   ✅ 已清理 7 天前的日志"
else
    echo "   ⏭️  未找到"
fi
echo ""

# 7. 清理 Xcode 缓存 (如果存在)
echo "7️⃣ 清理 Xcode 缓存..."
if [ -d ~/Library/Developer/Xcode/DerivedData ]; then
    SIZE=$(du -sh ~/Library/Developer/Xcode/DerivedData 2>/dev/null | awk '{print $1}')
    echo "   发现 Xcode DerivedData: $SIZE"
    rm -rf ~/Library/Developer/Xcode/DerivedData/*
    echo "   ✅ 已清理"
else
    echo "   ⏭️  未找到"
fi
echo ""

# 8. 清理 Docker 缓存 (如果存在)
echo "8️⃣ 清理 Docker 缓存..."
if command -v docker &> /dev/null; then
    docker system prune -af --volumes 2>/dev/null
    echo "   ✅ 已清理"
else
    echo "   ⏭️  Docker 未安装"
fi
echo ""

# 9. 清空废纸篓
echo "9️⃣ 清空废纸篓..."
if [ -d ~/.Trash ]; then
    SIZE=$(du -sh ~/.Trash 2>/dev/null | awk '{print $1}')
    echo "   废纸篓大小: $SIZE"
    rm -rf ~/.Trash/*
    echo "   ✅ 已清空"
else
    echo "   ⏭️  废纸篓为空"
fi
echo ""

# 10. 清理临时文件
echo "🔟 清理临时文件..."
sudo rm -rf /tmp/* 2>/dev/null
echo "   ✅ 已清理 /tmp"
echo ""

# 显示最终结果
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
FINAL_USAGE=$(df -h / | awk 'NR==2 {print $5}')
echo "📊 清理前磁盘使用率: $INITIAL_USAGE"
echo "📊 清理后磁盘使用率: $FINAL_USAGE"
echo ""
df -h / | awk 'NR==2 {print "💾 可用空间: " $4}'
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "✅ 清理完成!"
echo ""
echo "💡 提示: 如需更多空间,可以:"
echo "   - 删除 ~/Downloads 中的大文件"
echo "   - 卸载不常用的应用程序"
echo "   - 使用 'du -sh ~/* | sort -hr | head -20' 查找大文件"
