#!/bin/bash
# 全量 404 链路审计 - 检查 titan-ai-assistant.js 中所有 HTML 链接
RESOURCES="/Users/zhoulin/Desktop/github/ai-playground/public/resources"

echo "=== titan-ai-assistant.js 引用的所有 .html 目标 ==="
echo ""

# 提取所有 .html 文件引用
LINKS=$(grep -oE "[a-zA-Z0-9_-]+\.html" /Users/zhoulin/Desktop/github/ai-playground/public/assets/js/titan-ai-assistant.js | sort -u)

GOOD=0
BAD=0
BAD_LIST=""

for link in $LINKS; do
  if [ -f "$RESOURCES/$link" ]; then
    echo "  ✅ $link"
    GOOD=$((GOOD+1))
  else
    echo "  ❌ $link  <- 404!"
    BAD=$((BAD+1))
    BAD_LIST="$BAD_LIST $link"
  fi
done

echo ""
echo "=== 结果 ==="
echo "  ✅ 正常: $GOOD"
echo "  ❌ 404:  $BAD"
if [ $BAD -gt 0 ]; then
  echo "  缺失文件:$BAD_LIST"
fi

echo ""
echo "=== learn.html 引用的课程跳转目标 ==="
LEARN_LINKS=$(grep -oE "[a-zA-Z0-9_-]+\.html" "$RESOURCES/learn.html" | sort -u)
for link in $LEARN_LINKS; do
  if [ -f "$RESOURCES/$link" ]; then
    echo "  ✅ $link"
  else
    echo "  ❌ $link  <- 404!"
  fi
done

echo ""
echo "=== course-factory.html 引用的资源 ==="
FACTORY_LINKS=$(grep -oE 'src="[^"]+"|href="[^"]+"' "$RESOURCES/course-factory.html" | grep -v "http" | grep -v "javascript" | sed 's/[^"]*"//' | sed 's/"//')
for link in $FACTORY_LINKS; do
  FULL_PATH=""
  if [[ "$link" == /* ]]; then
    FULL_PATH="/Users/zhoulin/Desktop/github/ai-playground/public$link"
  else
    FULL_PATH="$RESOURCES/$link"
  fi
  if [ -f "$FULL_PATH" ]; then
    echo "  ✅ $link"
  else
    echo "  ❌ $link  <- 404!"
  fi
done
