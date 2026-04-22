import requests

FEISHU_APP_ID = "cli_a92f175836389bd3"
FEISHU_APP_SECRET = "Wj2fqrKcJJz6yZ5semStEhr7XIxUG6We"

def get_feishu_token():
    res = requests.post(
        "https://open.feishu.cn/open-apis/auth/v3/tenant_access_token/internal",
        json={"app_id": FEISHU_APP_ID, "app_secret": FEISHU_APP_SECRET}
    ).json()
    return res["tenant_access_token"]

token = get_feishu_token()
print("Token:", token[:10])

# 1. Create a folder
res = requests.post(
    "https://open.feishu.cn/open-apis/drive/v1/files/create_folder",
    headers={"Authorization": f"Bearer {token}", "Content-Type": "application/json"},
    json={"name": "🤖 AI 自动化衍生母舱 (Antigravity)", "folder_token": ""}
)
print("Create Folder:", res.text)
folder_token = res.json().get("data", {}).get("token", "")

# 2. Try to get its URL
if folder_token:
    print(f"Folder URL: https://feishu.cn/drive/folder/{folder_token}")

