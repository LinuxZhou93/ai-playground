import requests
import json

APP_ID = "cli_a92f175836389bd3"
APP_SECRET = "Wj2fqrKcJJz6yZ5semStEhr7XIxUG6We"
APP_TOKEN = "ODG7b8P5MalSSJswYZqc8NWSndb"

def get_tenant_access_token():
    url = "https://open.feishu.cn/open-apis/auth/v3/tenant_access_token/internal"
    payload = json.dumps({"app_id": APP_ID, "app_secret": APP_SECRET})
    headers = {'Content-Type': 'application/json'}
    response = requests.post(url, headers=headers, data=payload)
    return response.json().get("tenant_access_token")

def update_records(token, records_to_add):
    # Get table id
    url_tables = f"https://open.feishu.cn/open-apis/bitable/v1/apps/{APP_TOKEN}/tables"
    headers = {'Authorization': f'Bearer {token}'}
    res = requests.get(url_tables, headers=headers)
    table_id = res.json()['data']['items'][0]['table_id']

    # Batch create
    url_batch = f"https://open.feishu.cn/open-apis/bitable/v1/apps/{APP_TOKEN}/tables/{table_id}/records/batch_create"
    payload = json.dumps({"records": [{"fields": r} for r in records_to_add]})
    headers['Content-Type'] = 'application/json'
    res_batch = requests.post(url_batch, headers=headers, data=payload)
    return res_batch.json()

if __name__ == "__main__":
    token = get_tenant_access_token()
    
    # 解析后的数据
    new_data = [
        {
            "日期": "4月18日全天",
            "市州": "资阳",
            "网点": "雁江区支行",
            "内容": "奇幻声音国DIY录音机",
            "详细内容安排": "联系人：王好 (15520661888)"
        },
        {
            "日期": "4月25日全天",
            "市州": "资阳",
            "网点": "安岳县支行",
            "内容": "奇幻声音国DIY录音机",
            "详细内容安排": "联系人：伍莉 (13678240405)"
        },
        {
            "日期": "4月19日上午",
            "市州": "资阳",
            "网点": "乐至县支行",
            "内容": "奇幻声音国DIY录音机",
            "详细内容安排": "联系人：黄玉红 (19983585198)"
        },
        {
            "日期": "4月19日下午",
            "市州": "资阳",
            "网点": "市分行",
            "内容": "奇幻声音国DIY录音机",
            "详细内容安排": "联系人：陈洁 (18782179019)"
        }
    ]
    
    print("🚀 正在将图片中的排期写入飞书表格...")
    result = update_records(token, new_data)
    if result.get("code") == 0:
        print(f"✅ 成功写入 {len(new_data)} 条资阳网点排期记录！")
    else:
        print(f"❌ 写入失败: {result.get('msg')}")
