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

res = requests.get(
    "https://open.feishu.cn/open-apis/contact/v3/users?department_id=0",
    headers={"Authorization": f"Bearer {token}"}
)
data = res.json()
for user in data.get("data", {}).get("items", []):
    print(user.get("name"), user.get("open_id"), user.get("user_id"))
