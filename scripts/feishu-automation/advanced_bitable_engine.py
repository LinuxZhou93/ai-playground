import os
import json
import glob
import requests

# 系统架构配置
FEISHU_APP_ID = "cli_a92f175836389bd3"
FEISHU_APP_SECRET = "Wj2fqrKcJJz6yZ5semStEhr7XIxUG6We"
BRAIN_DIR = "/Users/zhoulin/.gemini/antigravity/brain"
MAX_SESSIONS = 100

def get_feishu_token():
    res = requests.post(
        "https://open.feishu.cn/open-apis/auth/v3/tenant_access_token/internal",
        json={"app_id": FEISHU_APP_ID, "app_secret": FEISHU_APP_SECRET}
    )
    return res.json()["tenant_access_token"]

def bitable_api(method, url_path, token, payload=None):
    base_url = "https://open.feishu.cn/open-apis/bitable/v1"
    headers = {"Authorization": f"Bearer {token}", "Content-Type": "application/json"}
    if method == "POST":
        res = requests.post(base_url + url_path, headers=headers, json=payload)
    elif method == "GET":
        res = requests.get(base_url + url_path, headers=headers)
    elif method == "PATCH":
        res = requests.patch(base_url + url_path, headers=headers, json=payload)
    
    if res.status_code != 200 or res.json().get("code") != 0:
        print(f"Bitable API Error: {url_path} => {res.text}")
    return res.json()

def upload_media(token, app_token, file_path):
    url = "https://open.feishu.cn/open-apis/drive/v1/medias/upload_all"
    headers = {"Authorization": f"Bearer {token}"}
    
    file_size = os.path.getsize(file_path)
    file_name = os.path.basename(file_path)
    
    # 防阻塞硬卡停
    if file_size > 10 * 1024 * 1024:
        return None
        
    data = {
        "file_name": file_name,
        "parent_type": "bitable_image",
        "parent_node": app_token,
        "size": str(file_size)
    }
    
    with open(file_path, 'rb') as f:
        res = requests.post(url, headers=headers, data=data, files={"file": (file_name, f)})
    
    res_data = res.json()
    if res_data.get("code") == 0:
        return res_data["data"]["file_token"]
    return None

def extract_local_brain():
    sessions = []
    for entry in os.listdir(BRAIN_DIR):
        path = os.path.join(BRAIN_DIR, entry)
        if os.path.isdir(path) and not entry.startswith('.'):
            stat = os.stat(path)
            ts = int(stat.st_mtime * 1000)
            
            summary = "（无高保真摘要的散落历史记录）"
            meta_files = glob.glob(os.path.join(path, "*.metadata.json"))
            if meta_files:
                try:
                    with open(meta_files[0], 'r', encoding='utf-8') as f:
                        meta = json.load(f)
                        if meta.get("summary"):
                            text = meta["summary"].strip()
                            summary = text[:28] + ".." if len(text) > 30 else text
                except:
                    pass
            
            medias = glob.glob(os.path.join(path, "*.png")) + glob.glob(os.path.join(path, "*.webp")) + glob.glob(os.path.join(path, "*.jpg"))
            
            sessions.append({
                "id": entry,
                "title": f"会话引擎 {entry[:8]}",
                "summary": summary,
                "ts": ts,
                "media": medias[0] if medias else None
            })
    
    sessions.sort(key=lambda x: x["ts"], reverse=True)
    return sessions[:MAX_SESSIONS]

def main():
    print("🚀 Initializing Sovereign BI Engine...")
    token = get_feishu_token()
    
    # 1. 建立顶级生态舱
    print("1. Creating Ultimate Bitable App Workspace...")
    app_res = bitable_api("POST", "/apps", token, {"name": "Mozi 智能母体终端 (V5 全体系)", "folder_token": "YITmffGE8laxnPd1rpBcfXFxn7b"})
    app_token = app_res["data"]["app"]["app_token"]
    print(f"App Created -> https://feishu.cn/base/{app_token}")
    
    # 2. 改造默认表为 "会话集群大盘" (Session Hub)
    tables = bitable_api("GET", f"/apps/{app_token}/tables", token)
    sess_table_id = tables["data"]["items"][0]["table_id"]
    bitable_api("PATCH", f"/apps/{app_token}/tables/{sess_table_id}", token, {"name": "🧠 会话集群大盘"})

    # 3. 新增第二个关系数据分块 "核心业务生命树" (Project Hub)
    print("2. Constructing Relational Dual-Table Architecture...")
    proj_res = bitable_api("POST", f"/apps/{app_token}/tables", token, {"table": {"name": "🪐 核心业务生命树"}})
    proj_table_id = proj_res["data"]["table_id"]
    
    fields_res = bitable_api("GET", f"/apps/{app_token}/tables/{proj_table_id}/fields", token)
    proj_primary_col = fields_res["data"]["items"][0]["field_name"]
    
    sess_fields_res = bitable_api("GET", f"/apps/{app_token}/tables/{sess_table_id}/fields", token)
    sess_primary_col = sess_fields_res["data"]["items"][0]["field_name"]
    
    # 为项目表补充基础项目记录以便后续供查询
    bitable_api("POST", f"/apps/{app_token}/tables/{proj_table_id}/records/batch_create", token, {
        "records": [
            {"fields": {proj_primary_col: "Carbon-X 教研硬件宇宙"}},
            {"fields": {proj_primary_col: "Titan AI 语音系统"}},
            {"fields": {proj_primary_col: "Feishu 全自动办公底座"}},
            {"fields": {proj_primary_col: "Mozi Lab 基础设施栈"}},
            {"fields": {proj_primary_col: "未知前沿探索"}}
        ]
    })
    # 取回刚才生成的项目表的记录ID，用于关联挂载
    proj_records = bitable_api("GET", f"/apps/{app_token}/tables/{proj_table_id}/records", token)["data"]["items"]
    proj_map = {r["fields"][proj_primary_col]: r["record_id"] for r in proj_records}

    # 4. 会话表精调：添加超级组件列
    print("3. Injecting Native Bitable Action Components...")
    fields = [
        {"field_name": "系统镜像流摘要", "type": 1},
        {"field_name": "原生多模态视觉阵列", "type": 17}, # Attachment
        {"field_name": "时间戳记", "type": 5}, # Date
        {
            "field_name": "挂载业务树关联", 
            "type": 18, 
            "property": {"table_id": proj_table_id, "multiple": False} # 关联数据表
        }, 
        {
            "field_name": "模型活跃状态", 
            "type": 3,
            "property": {
                "options": [
                    {"name": "附带视觉工件 (高优)", "color": 10},
                    {"name": "纯文本思控 (普通)", "color": 3}
                ]
            }
        },
        {"field_name": "⚡ 本地唤醒指令集", "type": 15} # Action URL Button Equivalent
    ]
    for f in fields:
        bitable_api("POST", f"/apps/{app_token}/tables/{sess_table_id}/fields", token, f)

    # 5. 生成极其震撼的原生试图视图 (画廊即时呈现视图)
    print("4. Creating Advanced Layout Views via API (Gallery + Kanban)...")
    bitable_api("POST", f"/apps/{app_token}/tables/{sess_table_id}/views", token, {
        "view_name": "📸 多模态视觉沉浸画廊", "view_type": "gallery"
    })
    bitable_api("POST", f"/apps/{app_token}/tables/{sess_table_id}/views", token, {
        "view_name": "📋 模型算力负荷看板", "view_type": "kanban"
    })
    
    # 6. 推送并智能双向关联百量级数据集
    print("5. Firing ETL & Media Synapse routines...")
    sessions = extract_local_brain()
    records = []
    
    for s in sessions:
        # Attachment Engine
        attachments = []
        if s["media"]:
            print(f"Uploading Vision Token for: {s['id']}")
            f_token = upload_media(token, app_token, s["media"])
            if f_token:
                attachments.append({"file_token": f_token})
                
        # Linkage Brain Engine - Autodetect project relationship from summary text
        sum_lower = s["summary"].lower()
        linked_proj_id = proj_map["未知前沿探索"]
        if "carbon" in sum_lower or "碳" in sum_lower or "esp" in sum_lower or "3d" in sum_lower:
            linked_proj_id = proj_map["Carbon-X 教研硬件宇宙"]
        elif "titan" in sum_lower or "模型" in sum_lower or "ai" in sum_lower or "语音" in sum_lower:
            linked_proj_id = proj_map["Titan AI 语音系统"]
        elif "飞书" in sum_lower or "feishu" in sum_lower or "多维" in sum_lower or "bitable" in sum_lower:
            linked_proj_id = proj_map["Feishu 全自动办公底座"]
        elif "架构" in sum_lower or "生态" in sum_lower or "mozi" in sum_lower:
            linked_proj_id = proj_map["Mozi Lab 基础设施栈"]
            
        records.append({
            "fields": {
                sess_primary_col: s["title"],  # Defaut ID Field Placeholder
                "系统镜像流摘要": s["summary"],
                "时间戳记": s["ts"],
                "原生多模态视觉阵列": attachments if attachments else None,
                "挂载业务树关联": [linked_proj_id], # 必须是列表
                "模型活跃状态": "附带视觉工件 (高优)" if s["media"] else "纯文本思控 (普通)",
                "⚡ 本地唤醒指令集": {
                    "text": "▶ 唤醒本地控制台接管本节点",
                    "link": f"http://127.0.0.1:8787/trigger-awake?uuid={s['id']}"
                }
            }
        })
        
    print(f"Batch pushing {len(records)} rel-connected records to Feishu Matrix...")
    # Bitable Batch max limit 500, we have 100 so 1 flight is plenty
    push_res = bitable_api("POST", f"/apps/{app_token}/tables/{sess_table_id}/records/batch_create", token, {
        "records": records
    })

    if push_res.get("code") == 0:
        print("✅ ===========================================================================")
        print("✅ Bitable Relational & Multimodal & UI Database creation incredibly complete.")
        print(f"✅ FINAL HUB ACCESS TOKEN: {app_token}")
        print("✅ ===========================================================================")
    else:
        print("❌ Error inserting data matrix:", push_res)

if __name__ == "__main__":
    main()
