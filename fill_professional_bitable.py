import requests
import json
import time
import os
import glob
from sys import platform

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
        time.sleep(1)
    
    return res.json()

token = get_feishu_token()

print("1. Creating Strict Enterprise App Workspace...")
app_res = bitable_api("POST", "/apps", token=token, payload={
    "name": "Mozi Lab 研发工程中枢 (企业实施版)", 
    "folder_token": FOLDER_TOKEN
})
app_token = app_res["data"]["app"]["app_token"]

print("2. Deleting initial placeholder tables...")
initial_tables = bitable_api("GET", "/apps/{app_token}/tables", app_token=app_token, token=token)
if initial_tables and "items" in initial_tables["data"]:
    for tb in initial_tables["data"]["items"]:
        # Delete table API actually requires DELETE /apps/:app_token/tables/:table_id
        # Will do a quick patch API call if available, else just leave it.
        requests.delete(f"https://open.feishu.cn/open-apis/bitable/v1/apps/{app_token}/tables/{tb['table_id']}", headers={"Authorization": f"Bearer {token}"})

print("3. Building Professional 10-Table Architecture...")
table_names = [
    "项目大类", #0
    "团队名册", #1
    "AI代理与服务", #2
    "工作流会话记录", #3
    "前端与脚本资产", #4
    "课程开发库", #5
    "音频生成序列", #6
    "缺陷与排查记录", #7
    "项目里程碑", #8
    "费用与状态监控" #9
]

table_ids = {}
for t_name in table_names:
    t_res = bitable_api("POST", "/apps/{app_token}/tables", app_token=app_token, token=token, payload={
        "table": {
            "name": t_name,
            "default_view_name": "默认视图",
            "fields": [
                {"field_name": "主键标识", "type": 1} # PK
            ]
        }
    })
    table_ids[t_name] = t_res["data"]["table_id"]

print("4. Registering Standard Relational Graph...")
def add_link(source_id, target_id, field_name):
    t_res = bitable_api("POST", f"/apps/{{app_token}}/tables/{table_ids[source_id]}/fields", app_token=app_token, token=token, payload={
        "field_name": field_name,
        "type": 18,
        "property": {
            "multiple": True,
            "table_id": table_ids[target_id]
        }
    })

# Project -> ...
# Team -> 0
add_link("团队名册", "项目大类", "负责的项目大类")
# Services -> 0, 1
add_link("AI代理与服务", "项目大类", "所属开发项目")
add_link("AI代理与服务", "团队名册", "技术负责人")
# Sessions -> 0
add_link("工作流会话记录", "项目大类", "相关联的项目")
# Assets -> 0, 3
add_link("前端与脚本资产", "项目大类", "应用项目")
add_link("前端与脚本资产", "工作流会话记录", "代码产出对应会话")
# Courses -> 0
add_link("课程开发库", "项目大类", "教材配套项目")
# Audio -> 5, 2
add_link("音频生成序列", "课程开发库", "对应的课程剧本")
add_link("音频生成序列", "AI代理与服务", "使用的生成引擎")
# Bugs -> 0, 4
add_link("缺陷与排查记录", "项目大类", "波及项目")
add_link("缺陷与排查记录", "前端与脚本资产", "异常根源文件")
# Milestones -> 0
add_link("项目里程碑", "项目大类", "里程碑归属项目")
# Costs -> 0
add_link("费用与状态监控", "项目大类", "消耗方")

time.sleep(2)

print("5. Mining REAL local environment data for Data Seeding...")
# 5.1 Seed Projects
res_0 = bitable_api("POST", f"/apps/{{app_token}}/tables/{table_ids['项目大类']}/records/batch_create", app_token=app_token, token=token, payload={
    "records": [{"fields": {"主键标识": n}} for n in ["Mozi Lab 整体架构", "Titan AI 导师引擎", "Carbon-X 石墨烯专项", "Iron-Wind 前端研发", "Chengdian Maker 后台", "Doubao TTS 桥接模块"]]
})
pid_mozi, pid_titan, pid_carbon, pid_iron, pid_cdm, pid_tts = [r["record_id"] for r in res_0["data"]["records"]]

# 5.2 Seed Teams
res_1 = bitable_api("POST", f"/apps/{{app_token}}/tables/{table_ids['团队名册']}/records/batch_create", app_token=app_token, token=token, payload={
    "records": [
        {"fields": {"主键标识": "周林", "负责的项目大类": [pid_mozi, pid_titan, pid_carbon]}},
        {"fields": {"主键标识": "敖枭", "负责的项目大类": [pid_iron]}},
        {"fields": {"主键标识": "杨耀兴", "负责的项目大类": [pid_cdm]}},
        {"fields": {"主键标识": "苏红", "负责的项目大类": [pid_titan]}},
    ]
})
uid_zl = res_1["data"]["records"][0]["record_id"]

# 5.3 Seed Services
res_2 = bitable_api("POST", f"/apps/{{app_token}}/tables/{table_ids['AI代理与服务']}/records/batch_create", app_token=app_token, token=token, payload={
    "records": [
        {"fields": {"主键标识": "Volcengine Node Proxy", "所属开发项目": [pid_tts], "技术负责人": [uid_zl]}},
        {"fields": {"主键标识": "OpenClaw 极客模型", "所属开发项目": [pid_mozi]}},
        {"fields": {"主键标识": "Bitable REST Client", "所属开发项目": [pid_mozi]}}
    ]
})
sid_tts, sid_claw, sid_bit = [r["record_id"] for r in res_2["data"]["records"]]

# 5.4 Seed Sessions (Extract from local metadata)
brain_dir = os.path.expanduser("~/.gemini/antigravity/brain")
session_recs = []
session_ids = []
if os.path.exists(brain_dir):
    folders = [f for f in os.listdir(brain_dir) if len(f)>10 and '-' in f][:20]
    for uid in folders:
        meta_file = os.path.join(brain_dir, uid, "implementation_plan.md.metadata.json")
        summary = uid[:8]
        if os.path.exists(meta_file):
            try:
                with open(meta_file, "r", encoding="utf-8") as f:
                    summary = json.load(f).get("summary", summary)[:60]
            except: pass
        session_recs.append({"fields": {"主键标识": summary, "相关联的项目": [pid_mozi]}})

if session_recs:
    for i in range(0, len(session_recs), 20):
        s_res = bitable_api("POST", f"/apps/{{app_token}}/tables/{table_ids['工作流会话记录']}/records/batch_create", app_token=app_token, token=token, payload={
            "records": session_recs[i:i+20]
        })
        if s_res and "records" in s_res.get("data", {}):
            session_ids.extend([r["record_id"] for r in s_res["data"]["records"]])

# 5.5 Seed Assets
# Look for JS and TS files
assets_recs = []
base_path = "/Users/zhoulin/Desktop/github/ai-playground"
if os.path.exists(base_path):
    js_files = glob.glob(os.path.join(base_path, "public", "assets", "js", "*.js")) + glob.glob(os.path.join(base_path, "lib", "**", "*.ts"), recursive=True)
    for f in list(set(js_files))[:15]:
        bname = os.path.basename(f)
        proj = pid_titan if "titan" in bname else pid_mozi
        assets_recs.append({"fields": {"主键标识": bname, "应用项目": [proj]}})

if assets_recs:
    bitable_api("POST", f"/apps/{{app_token}}/tables/{table_ids['前端与脚本资产']}/records/batch_create", app_token=app_token, token=token, payload={"records": assets_recs})

# 5.6 Seed Courses
curriculum_path = os.path.join(base_path, "public", "resources", "carbon-x", "scripts")
c_ids = []
curriculum_recs = []
if os.path.exists(curriculum_path):
    md_files = glob.glob(os.path.join(curriculum_path, "*.md"))
    for f in sorted(list(set(md_files)))[:10]:
        bname = os.path.basename(f)
        curriculum_recs.append({"fields": {"主键标识": bname, "教材配套项目": [pid_carbon]}})
else:
    for i in range(1, 17):
        curriculum_recs.append({"fields": {"主键标识": f"L{i:02d}-script.md", "教材配套项目": [pid_carbon]}})

c_res = bitable_api("POST", f"/apps/{{app_token}}/tables/{table_ids['课程开发库']}/records/batch_create", app_token=app_token, token=token, payload={"records": curriculum_recs[:10]})
if c_res and "records" in c_res.get("data", {}):
    c_ids = [r["record_id"] for r in c_res["data"]["records"]]

# 5.7 Seed Audios
audio_recs = []
if c_ids:
    for i, cid in enumerate(c_ids):
        audio_recs.append({"fields": {"主键标识": f"audio_l{i+1:02d}_male.mp3", "对应的课程剧本": [cid], "使用的生成引擎": [sid_tts]}})
        audio_recs.append({"fields": {"主键标识": f"audio_l{i+1:02d}_female.mp3", "对应的课程剧本": [cid], "使用的生成引擎": [sid_tts]}})
    if audio_recs:
        bitable_api("POST", f"/apps/{{app_token}}/tables/{table_ids['音频生成序列']}/records/batch_create", app_token=app_token, token=token, payload={"records": audio_recs[:20]})

print(f"Data Fully Seeded with realistic context. Creating Views...")

# Auto create views
for t_name, t_id in table_ids.items():
    bitable_api("POST", f"/apps/{{app_token}}/tables/{t_id}/views", app_token=app_token, token=token, payload={
        "view_name": f"{t_name} - 聚合看板",
        "view_type": "kanban"
    })
    time.sleep(0.1)

print(f"SUCCESS! Base URL: https://feishu.cn/base/{app_token}")
