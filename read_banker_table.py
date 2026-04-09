import requests
import json
import os

APP_ID = "cli_a92f175836389bd3"
APP_SECRET = "Wj2fqrKcJJz6yZ5semStEhr7XIxUG6We"

def get_tenant_access_token():
    url = "https://open.feishu.cn/open-apis/auth/v3/tenant_access_token/internal"
    payload = json.dumps({
        "app_id": APP_ID,
        "app_secret": APP_SECRET
    })
    headers = {'Content-Type': 'application/json'}
    response = requests.request("POST", url, headers=headers, data=payload)
    return response.json().get("tenant_access_token")

def search_file(token, file_name):
    url = "https://open.feishu.cn/open-apis/drive/v1/metas/batch_query"
    # Note:drive.v1.metas.batch_query is for existing tokens. 
    # Let's use search API instead.
    search_url = f"https://open.feishu.cn/open-apis/suite/docs-api/search/object"
    # Actually, drive.v1.files is better for finding by name
    search_url = f"https://open.feishu.cn/open-apis/drive/v1/files/search"
    payload = json.dumps({
        "search_key": file_name
    })
    headers = {
        'Authorization': f'Bearer {token}',
        'Content-Type': 'application/json'
    }
    response = requests.request("POST", search_url, headers=headers, data=payload)
    files = response.json().get("data", {}).get("items", [])
    return files

def get_bitable_records(token, app_token):
    # Get tables in bitable
    url = f"https://open.feishu.cn/open-apis/bitable/v1/apps/{app_token}/tables"
    headers = {'Authorization': f'Bearer {token}'}
    res = requests.get(url, headers=headers)
    tables = res.json().get("data", {}).get("items", [])
    
    if not tables: return "No tables found"
    
    # Read first table
    table_id = tables[0].get("table_id")
    records_url = f"https://open.feishu.cn/open-apis/bitable/v1/apps/{app_token}/tables/{table_id}/records"
    res_records = requests.get(records_url, headers=headers)
    return res_records.json().get("data", {}).get("items", [])

if __name__ == "__main__":
    print("🚀 正在获取飞书 Token...")
    token = get_tenant_access_token()
    if not token:
        print("❌ 获取 Token 失败")
    else:
        # 直接使用浏览器助手拿到的 Token
        app_token = "ODG7b8P5MalSSJswYZqc8NWSndb"
        print(f"📊 正在直连多维表格: {app_token}")
        
        records = get_bitable_records(token, app_token)
        if isinstance(records, list):
            print(f"🎉 成功读取 {len(records)} 条安排记录:")
            # 简单排版输出前 10 条
            for i, r in enumerate(records[:15]):
                f = r.get("fields", {})
                print(f"{i+1}. [{f.get('日期', '无日期')}] {f.get('市州', '')}{f.get('网点', '未知网点')} -> {f.get('内容', '暂无内容')}")
        else:
            print(f"❌ 读取失败: {records}")

