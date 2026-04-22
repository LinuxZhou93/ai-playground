import os
import re

updates = {
    21: {"old": "异星生物化学工程", "new": "碳储科学与工程", "icon": "🌿", "desc": "聚焦碳捕集、利用与封存（CCUS）技术，培养国家双碳战略急需的拔尖创新人才，解决极端环境下的碳封存热力学与地质力学难题。"},
    22: {"old": "星际地球化拓扑学", "new": "储能科学与工程", "icon": "🔋", "desc": "面向国家能源战略，攻克高比能固态电池、大规模长时储能系统集成以及电网级电力交直流能量转换的核心技术难关。"},
    23: {"old": "类脑神经形态动力学", "new": "智能电网信息工程", "icon": "⚡", "desc": "融合电气工程与计算机科学，研究特高压交直流混联电网的智能感知、边缘计算与广域协同保护控制方案。"},
    41: {"old": "原子级精准制造工程", "new": "智能制造工程", "icon": "🦾", "desc": "集合机械工程、控制科学与人工智能，探索工业4.0背景下的柔性产线、数字孪生工厂与人机共融智能制造系统。"},
    42: {"old": "分子信息与生物计算工程", "new": "机器人工程", "icon": "🤖", "desc": "专注仿生机器人、多智能体协同与强人工智能的物理具身，突破复杂非结构化环境下的多模态感知与高动态运动控制。"},
    43: {"old": "可编程物质与智能超结构工程", "new": "新能源材料与器件", "icon": "☀️", "desc": "专注于新型钙钛矿太阳能电池、宽禁带半导体以及高效电催化剂的设计与制备，解决绿能转化过程中的材料瓶颈挑战。"},
    44: {"old": "星际原位资源利用与地外建造工程", "new": "智能建造", "icon": "🏗️", "desc": "融合土木工程、物联网与大数据，实现未来建筑的3D打印、自愈合材料应用以及全生命周期的智能运维与碳足迹追踪。"},
    45: {"old": "光电算力网络工程", "new": "微电子科学与工程", "icon": "🖥️", "desc": "直击“极紫外光刻”与“先进制程”痛点，涵盖芯片架构设计、半导体物理及新型集成电路制造工艺的全链条科研。"},
    46: {"old": "认知计算与大模型芯片工程", "new": "智能科学与技术", "icon": "🧠", "desc": "跨越脑科学与计算机科学，致力于研发通用人工智能（AGI）底层算法框架以及具身智能体的高效推断与学习机制。"},
    47: {"old": "合成生物电子工程", "new": "智能感知工程", "icon": "📡", "desc": "突破极端条件下的精密测量极限。基于量子效应、光纤传感及MEMS微纳加工技术，构建万物互联时代的“神经末梢”。"},
    48: {"old": "跨介质空海一体化智能工程", "new": "智能测控工程", "icon": "🎛️", "desc": "面向重大技术装备的自主运行，融合控制理论与多源传感器数据融合，实现微米级精度的工业闭环反馈控制。"},
    49: {"old": "分子仿生信息工程", "new": "密码科学与技术", "icon": "🔐", "desc": "捍卫国家网络主权与数据安全。深入研究抗量子密码算法、同态加密及多方安全计算，构筑数字经济的信任底座。"},
    50: {"old": "类脑-化学共生智能系统", "new": "智慧交通", "icon": "🚦", "desc": "依托车路协同技术与5G大带宽通信，实现城市级交通流的全局动态优化及无人驾驶车辆的群体智能调度。"}
}

# Read launchpad.js
lp_path = "assets/js/launchpad.js"
with open(lp_path, "r", encoding="utf-8") as f:
    lp_content = f.read()

for m_id, data in updates.items():
    old = data["old"]
    new = data["new"]
    icon = data["icon"]
    
    # Update launchpad.js
    escaped_old = re.escape(old)
    lp_content = re.sub(rf"{{ *name: *['\"]{escaped_old}['\"], *icon: *['\"].*?['\"], *link: *['\"]hub-auto-{m_id}\.html['\"]", 
                        f"{{ name: '{new}', icon: '{icon}', link: 'hub-auto-{m_id}.html'", lp_content)
    
    # Update HTML files
    hub_file = f"hub-auto-{m_id}.html"
    if os.path.exists(hub_file):
        with open(hub_file, "r", encoding="utf-8") as f:
            hub_content = f.read()
            
        hub_content = hub_content.replace(old, new)
        
        # We need to replace the paragraph that describes the major.
        # It's usually `<p class="max-w-2xl text-center text-gray-400 text-sm md:text-base px-6 font-light leading-relaxed">...</p>`
        # Or something similar after the `h1`
        hub_content = re.sub(r"(<h1[^>]*>[\s\S]*?</h1>\s*)<p class=\"max-w-2xl[^>]*>([\s\S]*?)</p>", 
                             rf"\1<p class=\"max-w-2xl text-center text-gray-400 text-sm md:text-base px-6 font-light leading-relaxed\">\n            {data['desc']}\n        </p>", hub_content, count=1)
        
        with open(hub_file, "w", encoding="utf-8") as f:
            f.write(hub_content)
            
    for sub in range(1, 4):
        sub_file = f"auto-{m_id}-sub{sub}.html"
        if os.path.exists(sub_file):
            with open(sub_file, "r", encoding="utf-8") as f:
                sub_content = f.read()
            sub_content = sub_content.replace(old, new)
            with open(sub_file, "w", encoding="utf-8") as f:
                f.write(sub_content)

with open(lp_path, "w", encoding="utf-8") as f:
    f.write(lp_content)

print("Rewrites completed successfully.")
