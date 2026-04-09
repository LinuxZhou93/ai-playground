import requests
import json
import time
import random

FEISHU_APP_ID = "cli_a92f175836389bd3"
FEISHU_APP_SECRET = "Wj2fqrKcJJz6yZ5semStEhr7XIxUG6We"
FOLDER_TOKEN = "YITmffGE8laxnPd1rpBcfXFxn7b"

def get_feishu_token():
    res = requests.post(
        "https://open.feishu.cn/open-apis/auth/v3/tenant_access_token/internal",
        json={"app_id": FEISHU_APP_ID, "app_secret": FEISHU_APP_SECRET}
    ).json()
    return res["tenant_access_token"]

def bitable_api(method, endpoint, app_token=None, token=None, payload=None):
    base_url = "https://open.feishu.cn/open-apis/bitable/v1"
    url = base_url + endpoint.format(app_token=app_token)
    headers = {"Authorization": f"Bearer {token}", "Content-Type": "application/json"}
    
    for _ in range(3):
        if method == "POST":
            res = requests.post(url, headers=headers, json=payload)
        elif method == "GET":
            res = requests.get(url, headers=headers)
        elif method == "PUT":
            res = requests.put(url, headers=headers, json=payload)
        else:
            return None
        
        data = res.json()
        if data.get("code") == 0:
            return data
        print("API Error:", data)
        time.sleep(1)
    
    return res.json()

token = get_feishu_token()

print("1. Launching Ultimate Bitable App Workspace...")
app_res = bitable_api("POST", "/apps", token=token, payload={
    "name": "Mozi Lab 极致架构大盘 (Antigravity Extreme)", 
    "folder_token": FOLDER_TOKEN
})
app_token = app_res["data"]["app"]["app_token"]
print(f"App Created -> https://feishu.cn/base/{app_token}")

print("2. Deleting default table...")
initial_tables = bitable_api("GET", "/apps/{app_token}/tables", app_token=app_token, token=token)
if initial_tables and "items" in initial_tables["data"]:
    for tb in initial_tables["data"]["items"]:
        bitable_api("POST", f"/apps/{{app_token}}/tables/{tb['table_id']}/records/batch_delete", app_token=app_token, token=token, payload={"records": []})

print("3. Generating 10 Conceptual Tables...")
table_names = [
    "🪐 核心业务生命树 (Projects)",
    "🧠 会话集群大盘 (Sessions)",
    "👤 人类智囊节点 (Personnel)",
    "📝 动态资产仓库 (Assets)",
    "🤖 智能代理状态 (Agents)",
    "📅 研发冲刺里程碑 (Milestones)",
    "🐞 故障与修复追踪 (Bugs)",
    "💡 启发式教学剧本 (Curriculum)",
    "🎙️ 多模态音频元流 (TTS Audio)",
    "📊 财务与算力雷达 (Costs)"
]

table_ids = {}

# We create the tables one by one
for t_name in table_names:
    t_res = bitable_api("POST", "/apps/{app_token}/tables", app_token=app_token, token=token, payload={
        "table": {
            "name": t_name,
            "default_view_name": "Grid 视图",
            "fields": [
                {"field_name": "系统标识 (ID)", "type": 1}
            ]
        }
    })
    table_ids[t_name.split(" ")[0]] = t_res["data"]["table_id"]

print("4. Injecting Bi-Directional Sub-Space Links (Type 18)...")
# Helper
def add_link(source_idx, target_idx, field_name):
    src_node = table_names[source_idx].split(" ")[0]
    tgt_node = table_names[target_idx].split(" ")[0]
    
    t_res = bitable_api("POST", f"/apps/{{app_token}}/tables/{table_ids[src_node]}/fields", app_token=app_token, token=token, payload={
        "field_name": field_name,
        "type": 18,
        "property": {
            "multiple": True,
            "table_id": table_ids[tgt_node]
        }
    })

# Setting up complex graph relations
add_link(1, 0, "关联生命树") # Session to Project
add_link(2, 0, "隶属项目") # Personnel to Project
add_link(3, 1, "源于会话") # Assets to Session
add_link(3, 0, "隶属项目") # Assets to Project
add_link(4, 2, "对接责任人") # Agents to Personnel
add_link(4, 0, "赋能项目") # Agents to Project
add_link(5, 0, "攻坚项目") # Milestones to Project
add_link(6, 4, "涉事代理") # Bugs to Agents
add_link(6, 0, "波及项目") # Bugs to Project
add_link(7, 0, "隶属专栏项目") # Curriculum to Project
add_link(8, 7, "音频对应课件") # Audio to Curriculum
add_link(8, 4, "发声引擎") # Audio to Agents
add_link(9, 0, "消耗源项目") # Costs to Projects
add_link(9, 1, "消耗源会话") # Costs to Sessions

# Also add some basic status fields 
bitable_api("POST", f"/apps/{{app_token}}/tables/{table_ids['🪐']}/fields", app_token=app_token, token=token, payload={
    "field_name": "研发状态", "type": 3, "property": {"options": [{"name": "推进中", "color": 1}, {"name": "待定", "color": 2}]}
})

print("5. Seeding Deep Mock Data Ecosystem...")

# Add records to T1 (Projects)
t1_res = bitable_api("POST", f"/apps/{{app_token}}/tables/{table_ids['🪐']}/records/batch_create", app_token=app_token, token=token, payload={
    "records": [
        {"fields": {"系统标识 (ID)": "Titan AI 虚拟导师系统"}},
        {"fields": {"系统标识 (ID)": "Carbon-X 石墨烯矩阵"}},
        {"fields": {"系统标识 (ID)": "Iron-Wind 铁风行政大脑"}},
        {"fields": {"系统标识 (ID)": "Mozi 终端枢纽"}}
    ]
})
t1_records = [r["record_id"] for r in t1_res["data"]["records"]]

# Wait briefly for reverse fields to stabilize in Feishu logic
time.sleep(1)

# Add records to T3 (Personnel)
t3_res = bitable_api("POST", f"/apps/{{app_token}}/tables/{table_ids['👤']}/records/batch_create", app_token=app_token, token=token, payload={
    "records": [
        {"fields": {"系统标识 (ID)": "周林 (Architect)", "隶属项目": [t1_records[0], t1_records[1]]}},
        {"fields": {"系统标识 (ID)": "教学部负责人", "隶属项目": [t1_records[2]]}},
    ]
})
t3_records = [r["record_id"] for r in t3_res["data"]["records"]]

# Add records to T4 (Agents), T5 (Agents)
t5_res = bitable_api("POST", f"/apps/{{app_token}}/tables/{table_ids['🤖']}/records/batch_create", app_token=app_token, token=token, payload={
    "records": [
        {"fields": {"系统标识 (ID)": "Volcengine TTS Proxy (Doubao)", "赋能项目": [t1_records[0]], "对接责任人": [t3_records[0]]}},
        {"fields": {"系统标识 (ID)": "Clawbot Webhook Engine", "赋能项目": [t1_records[3]], "对接责任人": [t3_records[0]]}},
    ]
})
t5_records = [r["record_id"] for r in t5_res["data"]["records"]]

print("Data Seeding Complete.")

print("6. Auto-creating Kanban and Gallery Views for Dashboards...")
for t_id in table_ids.values():
    bitable_api("POST", f"/apps/{{app_token}}/tables/{t_id}/views", app_token=app_token, token=token, payload={
        "view_name": "📊 高级看板视角",
        "view_type": "kanban"
    })
    bitable_api("POST", f"/apps/{{app_token}}/tables/{t_id}/views", app_token=app_token, token=token, payload={
        "view_name": "🖼️ 数字画廊视角",
        "view_type": "gallery"
    })

print(f"ULTIMATE BITABLE READY -> https://feishu.cn/base/{app_token}")
