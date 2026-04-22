import os
import re

# 目标文件（找到上一个因为卡死没加载出来的会话，根据大小和时间来看，最有可能是这个）
pb_path = "/Users/zhoulin/.gemini/antigravity/conversations/3b8c3ccd-db83-4487-8e20-2b1460315049.pb"
out_path = "/Users/zhoulin/Desktop/叮当核心文件包_单机版/010-🖥️Working Space-工作台/⚠️强制提取的上一场对话历史.md"

try:
    with open(pb_path, 'rb') as f:
        data = f.read()
    
    # 强制进行 utf-8 忽略错误解码
    text = data.decode('utf-8', errors='ignore')
    
    # 用正则过滤出较长的文本片段（去掉 pb 里的乱七八糟的控制符和短码）
    blocks = re.findall(r'[\u4e00-\u9fa5a-zA-Z0-9\s，。！、？：；\.\,\!\?\:\;\-\(\)\[\]\{\}\_\*#]{30,}', text)
    
    with open(out_path, 'w', encoding='utf-8') as f:
        f.write("# ⚠️ 暴力提取的最近一次被隐没（未加载）的对话记录\n\n")
        f.write("> **系统报告：** 您的左边对话区可能因本地插件进程卡死、缓存未同或者网络状态锁死导致未能拉取成功。\n")
        f.write("> **补救措施：** 我直接绕过UI界面限制，从底层数据库 (Protobuf 通讯协议包) 中把数据强行拽出来了！\n\n")
        
        seen = set()
        for idx, b in enumerate(blocks):
            c = b.strip()
            # 过滤掉过多纯英文或看起来像乱码的片段
            if len(c) > 30 and c not in seen and not c.startswith('user_global') and 'implementation_plan' not in c.lower():
                seen.add(c)
                f.write(f"---\n### 片段 {len(seen)}\n\n```\n{c}\n```\n\n")
                
    print(f"SUCCESS: Extracted to {out_path}")
except Exception as e:
    print(f"FAILED: {e}")
