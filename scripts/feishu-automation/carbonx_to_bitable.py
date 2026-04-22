import os
import requests
import json

# 飞书凭证
FEISHU_APP_ID = "cli_a92f175836389bd3"
FEISHU_APP_SECRET = "Wj2fqrKcJJz6yZ5semStEhr7XIxUG6We"
APP_TOKEN = "AoNhblCfkaf5tFsOXWGcZH4Cnje"
TABLE_NAME = "Carbon-X 教学开发看板"

# 课程数据定义与分类
COURSES = [
    {"num": "L01", "name": "碳膜起源：电阻云图测试", "category": "硬件", "status": "已完成"},
    {"num": "L02", "name": "热力风暴：PID 控温实验", "category": "硬件", "status": "已完成"},
    {"num": "L03", "name": "柔性之巅：曲率传感测试", "category": "硬件", "status": "已完成"},
    {"num": "L04", "name": "形态构想：极客美学 CAD", "category": "硬件", "status": "开发中"},
    {"num": "L05", "name": "精密封装：嵌入式结构设计", "category": "硬件", "status": "开发中"},
    {"num": "L06", "name": "3D 打印：原型外壳输出", "category": "硬件", "status": "待开发"},
    {"num": "L07", "name": "逻辑中枢：ESP32 联调", "category": "硬件", "status": "待开发"},
    {"num": "L08", "name": "感知算法：压感触发逻辑", "category": "硬件", "status": "待开发"},
    {"num": "L09", "name": "能量管理：PWM 调压技术", "category": "硬件", "status": "待开发"},
    {"num": "L10", "name": "远端交互：BLE 蓝牙仪表盘", "category": "前端", "status": "待开发"},
    {"num": "L11", "name": "总装 Alpha：第一次全闭环", "category": "硬件", "status": "待开发"},
    {"num": "L12", "name": "热失效分析：材料疲劳预测", "category": "硬件", "status": "待开发"},
    {"num": "L13", "name": "视觉交互：NeoPixel 视觉同步", "category": "前端", "status": "待开发"},
    {"num": "L14", "name": "极致减重：拓扑优化探索", "category": "硬件", "status": "待开发"},
    {"num": "L15", "name": "极客路演：产品说明书与路演 PPT 制作", "category": "应用", "status": "待开发"},
    {"num": "L16", "name": "发布日：墨子实验室 x 天府七中产品发布会", "category": "应用", "status": "待开发"},
]

def get_feishu_token():
    url = "https://open.feishu.cn/open-apis/auth/v3/tenant_access_token/internal"
    res = requests.post(url, json={"app_id": FEISHU_APP_ID, "app_secret": FEISHU_APP_SECRET})
    return res.json()["tenant_access_token"]

def main():
    token = get_feishu_token()
    headers = {"Authorization": f"Bearer {token}", "Content-Type": "application/json"}
    
    # 1. 尝试在用户根目录下新建全新的多维表格文件（Bitable App）
    print("Creating new Bitable Base File (App)...")
    res = requests.post(
        "https://open.feishu.cn/open-apis/bitable/v1/apps",
        headers=headers,
        json={"name": "Carbon-X 教学开发看板", "folder_token": ""}
    )
    
    app_token = res.json().get("data", {}).get("app", {}).get("app_token")
    if not app_token:
        # Fallback to existing table if new App creation fails due to API scopes
        print("Fallback: Using the existing Mozi Lab App Token.")
        app_token = "AoNhblCfkaf5tFsOXWGcZH4Cnje"
        table_id = "tbljiktfytC7jIWG"
    else:
        print(f"✅ App created: {app_token}")
        # A new App automatically has a blank default table. Let's fetch it.
        tables_res = requests.get(
            f"https://open.feishu.cn/open-apis/bitable/v1/apps/{app_token}/tables",
            headers=headers
        )
        table_id = tables_res.json().get("data", {}).get("items", [])[0].get("table_id")

    print("Adding Fields to Table...")
    fields = [
        {"field_name": "课程编号", "type": 1},
        {
            "field_name": "模块分类", 
            "type": 3,
            "property": {
                "options": [
                    {"name": "前端", "color": 39},
                    {"name": "硬件", "color": 14},
                    {"name": "应用", "color": 54}
                ]
            }
        },
        {
            "field_name": "开发状态", 
            "type": 3,
            "property": {
                "options": [
                    {"name": "待开发", "color": 3},
                    {"name": "开发中", "color": 2},
                    {"name": "已完成", "color": 10}
                ]
            }
        }
    ]

    for f in fields:
        requests.post(
            f"https://open.feishu.cn/open-apis/bitable/v1/apps/{app_token}/tables/{table_id}/fields",
            headers=headers,
            json=f
        )
    print("✅ Fields configured!")

    # 3. 准备数据插入
    records = []
    for c in COURSES:
        records.append({
            "fields": {
                "文本": c["name"],      # Primary Column
                "课程编号": c["num"],
                "模块分类": c["category"],
                "开发状态": c["status"]
            }
        })
    
    print("Batch inserting data...")
    res = requests.post(
        f"https://open.feishu.cn/open-apis/bitable/v1/apps/{app_token}/tables/{table_id}/records/batch_create",
        headers=headers,
        json={"records": records}
    )
    if res.json()["code"] == 0:
        print(f"✅ 👏 Data inserted successfully! Feishu Bitable ready. Token: {app_token}")
    else:
        print("Failed to insert data:", res.json())

if __name__ == "__main__":
    main()
