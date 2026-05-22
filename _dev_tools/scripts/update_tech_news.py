import os
import json
import urllib.request
from datetime import datetime

API_KEY = os.getenv("AI_API_KEY") or os.getenv("GOOGLE_API_KEY")
BASE_URL = "https://backgrace.com/v1/chat/completions"

def fetch_latest_news():
    print(f"[{datetime.now()}] Fetching fresh tech news via Gemini...")
    
    prompt = """你是全球科技前沿雷达监控系统。
请基于当下的时间线和已知客观环境，提供过去24~48小时内（或者近期最具爆炸性）的 10 条真实且极具影响力的硬核科技新闻头条。
请确保新闻完全真实，不要捏造科幻电影内容。新闻的标题应当类似于新华社或顶级权威媒介的严肃简短标题。

必需只返回合法的纯 JSON 数组（不要包装在markdown代码块中），格式如下：
[
    { "title": "...", "category": "人工智能" }
]

"category" 仅限于：科学发现, 人工智能, 智能硬件, 空天科技, 深空探索, 大国重器, 具身智能, 理论物理, 算力进化。完全只输出以 [ 开头的 JSON 纯文本。"""

    req = urllib.request.Request(
        BASE_URL,
        headers={
            "Content-Type": "application/json",
            "Authorization": f"Bearer {API_KEY}"
        },
        data=json.dumps({
            "model": "gemini-3-flash",
            "messages": [
                {"role": "system", "content": "You are a specialized Tech News agent strictly outputting pure JSON."},
                {"role": "user", "content": prompt}
            ],
            "temperature": 0.5,
            "max_tokens": 1000
        }).encode("utf-8")
    )

    try:
        with urllib.request.urlopen(req) as response:
            res_data = response.read().decode("utf-8")
            data = json.loads(res_data)
            content = data["choices"][0]["message"]["content"].strip()
            
            # Remove any markdown backticks if the model ignored instructions
            if content.startswith("```"):
                content = content.replace("```json", "").replace("```", "").strip()
                
            news_array = json.loads(content)
            
            # Format as JS constant for frontend load
            js_content = "const TITAN_NEWS = " + json.dumps(news_array, ensure_ascii=False, indent=4) + ";\n"
            
            # Write to assets/js/news-data.js
            out_path = os.path.join(os.path.dirname(__file__), "assets", "js", "news-data.js")
            with open(out_path, "w", encoding="utf-8") as f:
                f.write(js_content)
                
            print(f"[{datetime.now()}] Successfully updated {len(news_array)} news items into assets/js/news-data.js")
            
    except Exception as e:
        print(f"[{datetime.now()}] Error updating news: {e}")

if __name__ == "__main__":
    fetch_latest_news()
