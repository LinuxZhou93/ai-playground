import requests

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

res = requests.post(
    f"https://open.feishu.cn/open-apis/drive/v1/permissions/{FOLDER_TOKEN}/members?type=folder",
    headers={"Authorization": f"Bearer {token}", "Content-Type": "application/json"},
    json={
        "member_type": "openid",
        "member_id": "ou_76d2873167f5eb078484f323f6cd883e",
        "perm": "edit"
    }
)
print("Set Member:", res.text)
