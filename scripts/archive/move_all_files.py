import requests
import json
import time

FEISHU_APP_ID = "cli_a92f175836389bd3"
FEISHU_APP_SECRET = "Wj2fqrKcJJz6yZ5semStEhr7XIxUG6We"
FOLDER_TOKEN = "YITmffGE8laxnPd1rpBcfXFxn7b"

def get_feishu_token():
    res = requests.post(
        "https://open.feishu.cn/open-apis/auth/v3/tenant_access_token/internal",
        json={"app_id": FEISHU_APP_ID, "app_secret": FEISHU_APP_SECRET}
    ).json()
    return res["tenant_access_token"]

token = get_feishu_token()

res = requests.get(
    "https://open.feishu.cn/open-apis/drive/v1/files",
    headers={"Authorization": f"Bearer {token}"}
)
items = res.json().get("data", {}).get("files", [])
print(f"Found {len(items)} files to process.")

moved_count = 0
for item in items:
    if item.get("parent_token") == FOLDER_TOKEN:
        print(f"Skipping {item['name']}, already in target.")
        continue

    # Try moving
    file_token = item['token']
    file_type = item['type']
    
    move_res = requests.post(
        f"https://open.feishu.cn/open-apis/drive/v1/files/{file_token}/move",
        headers={"Authorization": f"Bearer {token}", "Content-Type": "application/json"},
        json={"type": file_type, "folder_token": FOLDER_TOKEN}
    )
    
    body = move_res.json()
    if body.get("code") == 99992402:
        # If schema is target_parent_token instead
        move_res = requests.post(
            f"https://open.feishu.cn/open-apis/drive/v1/files/{file_token}/move",
            headers={"Authorization": f"Bearer {token}", "Content-Type": "application/json"},
            json={"type": file_type, "folder_token": FOLDER_TOKEN, "target_parent_token": FOLDER_TOKEN}
        )
        body = move_res.json()

    print(f"Moved {file_token} ({item.get('name')[:10]}): {body}")
    moved_count += 1
    
    # Don't hit rate limit
    time.sleep(0.3)

print("Done. Total moved:", moved_count)
