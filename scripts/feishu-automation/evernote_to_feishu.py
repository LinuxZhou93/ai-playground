import os
import requests
from evernote.api.client import EvernoteClient
from evernote.edam.notestore.ttypes import NoteFilter, NotesMetadataResultSpec
from dotenv import load_dotenv

# 1. 记载 Evernote Token
load_dotenv('/Users/zhoulin/Desktop/001-📥Inbox-中转站/000_Kernel/00_Protocols/evernote_mcp/.env')
EN_TOKEN = os.getenv("EVERNOTE_TOKEN")
EN_HOST = os.getenv("EVERNOTE_SERVICE_HOST", "app.yinxiang.com")

# 2. 飞书凭证
FEISHU_APP_ID = "cli_a92f175836389bd3"
FEISHU_APP_SECRET = "Wj2fqrKcJJz6yZ5semStEhr7XIxUG6We"
APP_TOKEN = "AoNhblCfkaf5tFsOXWGcZH4Cnje"
TABLE_ID = "tbljiktfytC7jIWG"

# === 飞书 API 模块 ===
def get_feishu_token():
    url = "https://open.feishu.cn/open-apis/auth/v3/tenant_access_token/internal"
    res = requests.post(url, json={"app_id": FEISHU_APP_ID, "app_secret": FEISHU_APP_SECRET})
    data = res.json()
    if data["code"] != 0:
        raise Exception(f"Feishu token failed: {data}")
    return data["tenant_access_token"]

def ensure_bitable_fields(token):
    # 检查现有字段
    headers = {"Authorization": f"Bearer {token}"}
    res = requests.get(
        f"https://open.feishu.cn/open-apis/bitable/v1/apps/{APP_TOKEN}/tables/{TABLE_ID}/fields",
        headers=headers
    )
    existing_fields = [f["field_name"] for f in res.json().get("data", {}).get("items", [])]
    
    # 定义需要新增的字段
    required_fields = [
        {"field_name": "笔记标题", "type": 1},  # Text
        {"field_name": "GUID", "type": 1},      # Text
        {"field_name": "笔记本信息", "type": 1},      # Text
        {"field_name": "Evernote链接", "type": 15}    # Link
    ]
    
    for field in required_fields:
        if field["field_name"] not in existing_fields:
            if field["field_name"] == "笔记标题" and "文本" in existing_fields: # Bitable 默认首列叫文本，这需要处理，但安全起见我们新加
                pass
            print(f"Creating field: {field['field_name']}...")
            res = requests.post(
                f"https://open.feishu.cn/open-apis/bitable/v1/apps/{APP_TOKEN}/tables/{TABLE_ID}/fields",
                headers=headers,
                json=field
            )
            data = res.json()
            if data["code"] not in [0, 1254415]: # 1254415 通常是 field exist
                print(f"Error creating field {field['field_name']}: {data}")

def write_to_bitable(token, records):
    headers = {"Authorization": f"Bearer {token}"}
    
    # 飞书最多一次插入 500 条
    batch_size = 300
    for i in range(0, len(records), batch_size):
        batch = records[i:i+batch_size]
        res = requests.post(
            f"https://open.feishu.cn/open-apis/bitable/v1/apps/{APP_TOKEN}/tables/{TABLE_ID}/records/batch_create",
            headers=headers,
            json={"records": [{"fields": r} for r in batch]}
        )
        data = res.json()
        if data["code"] == 0:
            print(f"✅ Successfully inserted {len(batch)} records into Feishu!")
        else:
            print(f"❌ Failed to insert records: {data}")

# === Evernote 模块 ===
def fetch_all_evernote():
    print("Connecting to Evernote...")
    client = EvernoteClient(token=EN_TOKEN, sandbox=False, service_host=EN_HOST)
    note_store = client.get_note_store()

    # 获取笔记本映射字典
    notebooks = note_store.listNotebooks()
    nb_dict = {nb.guid: nb.name for nb in notebooks}

    # 循环获取笔记元数据
    offset = 0
    max_notes = 100
    all_notes = []
    nf = NoteFilter()
    spec = NotesMetadataResultSpec(includeTitle=True, includeCreated=True, includeNotebookGuid=True)

    print("Fetching notes metadata...")
    while True:
        results = note_store.findNotesMetadata(EN_TOKEN, nf, offset, max_notes, spec)
        if not results.notes:
            break
        
        for n in results.notes:
            nb_name = nb_dict.get(n.notebookGuid, "Unknown Notebook")
            all_notes.append({
                "笔记标题": n.title,
                "文本": n.title, # Fallback 给多维表格的原始"文本"列，防止无主键报错
                "GUID": n.guid,
                "笔记本信息": nb_name,
                "Evernote链接": {
                    "text": "在 Evernote 中打开",
                    "link": f"evernote:///view/{EN_TOKEN.split(':')[0]}/s1/{n.guid}/{n.guid}/"
                }
            })
        
        offset += len(results.notes)
        print(f"Fetched {offset} / {results.totalNotes} notes...")
        if offset >= results.totalNotes:
            break
            
    return all_notes

if __name__ == "__main__":
    import ssl
    ssl._create_default_https_context = ssl._create_unverified_context
    try:
        notes = fetch_all_evernote()
        print(f"Total Notes Extracted: {len(notes)}")
        
        feishu_token = get_feishu_token()
        print("Connected to Feishu, ensuring table fields exist...")
        ensure_bitable_fields(feishu_token)
        
        print("Writing to Feishu Bitable...")
        write_to_bitable(feishu_token, notes)
        
    except Exception as e:
        print(f"Error occurred: {e}")
