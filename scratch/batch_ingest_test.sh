#!/bin/bash
API_URL="http://localhost:3000/api/tony/ingest"

echo "🎯 任务 1: Bilibili (国产 AI 教程)"
curl -s -X POST $API_URL -H "Content-Type: application/json" -d '{"url":"https://www.bilibili.com/video/BV1hH4y1R7vA"}' > scratch/res_bili.json &

echo "🎯 任务 2: GitHub (LangGraph 架构)"
curl -s -X POST $API_URL -H "Content-Type: application/json" -d '{"url":"https://github.com/langchain-ai/langgraph"}' > scratch/res_github.json &

echo "🎯 任务 3: YouTube (全球 Agent 趋势)"
curl -s -X POST $API_URL -H "Content-Type: application/json" -d '{"url":"https://www.youtube.com/watch?v=5sMCvY60WdM"}' > scratch/res_yt.json &

echo "🎯 任务 4: 微信公众号 (大模型工程化)"
curl -s -X POST $API_URL -H "Content-Type: application/json" -d '{"url":"https://mp.weixin.qq.com/s/z9BwT9gX9eN9m2K"}' > scratch/res_wechat.json &

echo "🎯 任务 5: 小红书 (Cursor 提效黑科技)"
curl -s -X POST $API_URL -H "Content-Type: application/json" -d '{"url":"https://www.xiaohongshu.com/explore/65f1a2b30000000001000001"}' > scratch/res_xhs.json &

echo "🎯 任务 6: 官方文档 (React 渲染原理)"
curl -s -X POST $API_URL -H "Content-Type: application/json" -d '{"url":"https://react.dev/learn/render-and-commit"}' > scratch/res_react.json &

wait
echo "✅ 所有吞噬任务已完成。正在生成汇总报告..."
