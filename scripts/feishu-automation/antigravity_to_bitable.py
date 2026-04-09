import os
import json
import glob
import requests
from datetime import datetime

# 配置
FEISHU_APP_ID = "cli_a92f175836389bd3"
FEISHU_APP_SECRET = "Wj2fqrKcJJz6yZ5semStEhr7XIxUG6We"
BRAIN_DIR = "/Users/zhoulin/.gemini/antigravity/brain"
MAX_SESSIONS = 100

def get_feishu_token():
    url = "https://open.feishu.cn/open-apis/auth/v3/tenant_access_token/internal"
    res = requests.post(url, json={"app_id": FEISHU_APP_ID, "app_secret": FEISHU_APP_SECRET})
    return res.json()["tenant_access_token"]

def create_bitable_and_fields(token):
    headers = {"Authorization": f"Bearer {token}", "Content-Type": "application/json"}
    
    print("Creating Multi-modal Bitable App...")
    res = requests.post(
        "https://open.feishu.cn/open-apis/bitable/v1/apps",
        headers=headers,
        json={"name": "Antigravity 智能会话分析舱", "folder_token": ""}
    )
    
    app_token = res.json().get("data", {}).get("app", {}).get("app_token")
    if not app_token:
        raise Exception(f"App creation failed: {res.text}")
        
    # 获取默认表格 ID
    tables_res = requests.get(
        f"https://open.feishu.cn/open-apis/bitable/v1/apps/{app_token}/tables",
        headers=headers
    )
    table_id = tables_res.json().get("data", {}).get("items", [])[0].get("table_id")

    print("Configuring Fields...")
    fields = [
        {"field_name": "会话标识(ID)", "type": 1},
        {"field_name": "内容摘要", "type": 1},  # Added Summary Field
        {"field_name": "多模态资产", "type": 1005},
        {"field_name": "更新时间", "type": 5},
        {"field_name": "视觉工件", "type": 17},
        {
            "field_name": "语言模型状态", 
            "type": 3,
            "property": {
                "options": [
                    {"name": "附带视觉工件", "color": 10},
                    {"name": "纯文本对话", "color": 3}
                ]
            }
        }
    ]

    for f in fields:
        requests.post(
            f"https://open.feishu.cn/open-apis/bitable/v1/apps/{app_token}/tables/{table_id}/fields",
            headers=headers,
            json=f
        )
    return app_token, table_id

def upload_media_to_bitable(token, app_token, file_path):
    url = "https://open.feishu.cn/open-apis/drive/v1/medias/upload_all"
    headers = {"Authorization": f"Bearer {token}"}
    
    file_size = os.path.getsize(file_path)
    file_name = os.path.basename(file_path)
    
    if file_size > 10 * 1024 * 1024:
        print(f"Skipping {file_name} as it exceeds 10MB safe size limit.")
        return None
        
    data = {
        "file_name": file_name,
        "parent_type": "bitable_image",
        "parent_node": app_token,
        "size": str(file_size)
    }
    
    with open(file_path, 'rb') as f:
        files = {"file": (file_name, f)}
        res = requests.post(url, headers=headers, data=data, files=files)
        
    res_data = res.json()
    if res_data.get("code") == 0:
        return res_data["data"]["file_token"]
    else:
        print(f"Failed to upload media {file_name}: {res.text}")
        return None

def scan_sessions():
    sessions = []
    
    for entry in os.listdir(BRAIN_DIR):
        brain_path = os.path.join(BRAIN_DIR, entry)
        
        if os.path.isdir(brain_path) and not entry.startswith('.'):
            try:
                stat = os.stat(brain_path)
                ts = int(stat.st_mtime * 1000)
                
                # 读取 metadata.json 提取精准摘要
                summary = "系统归档快照，需手动溯源"
                meta_files = glob.glob(os.path.join(brain_path, "*.metadata.json"))
                if meta_files:
                    try:
                        with open(meta_files[0], 'r', encoding='utf-8') as f:
                            meta_data = json.load(f)
                            if "summary" in meta_data and meta_data["summary"]:
                                text = meta_data["summary"].strip()
                                summary = text[:28] + ".." if len(text) > 30 else text
                    except Exception as e:
                        print(f"Meta parse error for {entry}: {e}")
                
                medias = glob.glob(os.path.join(brain_path, "*.png")) + \
                         glob.glob(os.path.join(brain_path, "*.webp")) + \
                         glob.glob(os.path.join(brain_path, "*.jpg"))
                         
                first_media = medias[0] if medias else None
                
                sessions.append({
                    "id": entry,
                    "title": f"会话引擎录像 {entry[:8]}", 
                    "summary": summary,
                    "ts": ts,
                    "media_path": first_media,
                    "has_media": bool(first_media)
                })
            except Exception as e:
                print(f"Error parsing session {entry}: {e}")
                
    # 按更新时间倒序
    sessions.sort(key=lambda x: x["ts"], reverse=True)
    return sessions[:MAX_SESSIONS]

def main():
    print("Initiating full multi-modal extraction...")
    feishu_token = get_feishu_token()
    
    app_token, table_id = create_bitable_and_fields(feishu_token)
    print(f"Created Multi-Modal Base. Link: https://feishu.cn/base/{app_token}")
    
    sessions = scan_sessions()
    print(f"Extracted {len(sessions)} recent sessions.")
    
    records = []
    for s in sessions:
        attachments = []
        if s["media_path"]:
            print(f"Uploading media for {s['id']}...")
            file_token = upload_media_to_bitable(feishu_token, app_token, s["media_path"])
            if file_token:
                attachments.append({"file_token": file_token})
                
        records.append({
            "fields": {
                "文本": s["title"],
                "会话标识(ID)": str(s["id"]),
                "内容摘要": s["summary"],
                "更新时间": s["ts"],
                "多模态资产": s["has_media"],
                "视觉工件": attachments if attachments else None,
                "语言模型状态": "附带视觉工件" if s["has_media"] else "纯文本对话"
            }
        })
        
    print(f"Batch pushing {len(records)} multi-modal records to Feishu...")
    headers = {"Authorization": f"Bearer {feishu_token}", "Content-Type": "application/json"}
    
    # 同样分批 300 条 (即使全量也才 100)
    res = requests.post(
        f"https://open.feishu.cn/open-apis/bitable/v1/apps/{app_token}/tables/{table_id}/records/batch_create",
        headers=headers,
        json={"records": records}
    )
    if res.json()["code"] == 0:
        print("✅ 👏 Multi-Modal Synchronization Complete!")
    else:
        print("❌ Sync Failed:", res.json())

if __name__ == "__main__":
    main()
