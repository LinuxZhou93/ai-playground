import os
from bs4 import BeautifulSoup
import re

mappings = [
    {"file": "hub-metaverse.html", "old": "空间计算与混合现实", "new": "数字媒体技术", "en": "DIGITAL MEDIA", "desc": "综合计算机科学与艺术设计，面向虚拟现实、游戏开发与数字艺术生成的核心工程学科。"},
    {"file": "hub-cosmology.html", "old": "理论天体物理与宇宙学", "new": "天文学", "en": "ASTRONOMY", "desc": "研究天体运行规律、宇宙演化机制及深空探测数据分析的理学基础专业。"},
    {"file": "hub-ai.html", "old": "人工智能与计算科学", "new": "人工智能", "en": "ARTIFICIAL INTELLIGENCE", "desc": "聚焦机器学习、神经网络与计算机视觉，培养智能系统与算法设计工程师的前沿核心专业。"},
    {"file": "hub-environment.html", "old": "环境工程与可持续发展", "new": "环境科学与工程", "en": "ENVIRONMENTAL SCIENCE", "desc": "致力于解决污染治理、生态修复及碳中和技术落地的综合性工科专业。"},
    {"file": "hub-aerospace.html", "old": "航空航天与天体动力学", "new": "航空航天工程", "en": "AEROSPACE ENGINEERING", "desc": "研制飞行器与航天器，涉及空气动力学、推进系统与轨道设计的顶尖工程学科。"},
    {"file": "hub-earth.html", "old": "地球科学与气候学", "new": "地球物理学", "en": "GEOPHYSICS", "desc": "运用物理学原理探测地球内部结构、资源预测及防震减灾的基础理学专业。"},
    {"file": "hub-materials.html", "old": "材料科学与纳米技术", "new": "材料科学与工程", "en": "MATERIALS SCIENCE", "desc": "探索先进材料合成、纳米结构表征及其在新能源与微电子领域应用的基石学科。"},
    {"file": "hub-math.html", "old": "应用数学与混沌理论", "new": "数学与应用数学", "en": "APPLIED MATHEMATICS", "desc": "构建理论数理逻辑，并能将前沿数学模型广泛应用于密码学、金融与大数据分析的基础专业。"},
    {"file": "hub-quantum-info.html", "old": "量子信息与密码学", "new": "量子信息科学", "en": "QUANTUM INFORMATION", "desc": "融合量子力学与计算机科学，突破经典计算极限，构筑未来量子通信与加密计算的国家战略专业。"},
    {"file": "hub-physics.html", "old": "理论物理与大统一理论", "new": "物理学", "en": "PHYSICS", "desc": "探索物质基本结构和宇宙基本相互作用规律的自然科学核心专业。"},
    {"file": "hub-agronomy.html", "old": "农学与智慧农业网络", "new": "智慧农业", "en": "SMART AGRICULTURE", "desc": "将物联网、大数据与无人机应用于现代农业生产与遗传育种的新农科专业。"},
    {"file": "hub-ecology.html", "old": "生态学与气候工程", "new": "生态学", "en": "ECOLOGY", "desc": "研究生物与环境互作机制，服务于国家生态文明建设与生物多样性保护的理学专业。"},
    {"file": "hub-geology.html", "old": "地质学与行星勘探", "new": "地质学", "en": "GEOLOGY", "desc": "探究地球物质组成、地壳演化规律及矿产资源分布规律的传统与前沿结合的新理科专业。"},
    {"file": "hub-marine.html", "old": "海洋科学与深海工程", "new": "海洋工程与技术", "en": "MARINE ENGINEERING", "desc": "聚焦深海资源开发、水下机器人与海洋结构物设计的高技术交叉学科。"},
    {"file": "hub-nuclear.html", "old": "核工程与高能物理", "new": "核工程与核技术", "en": "NUCLEAR ENGINEERING", "desc": "研究核能和平利用、核反应堆设计及辐射防护与医学应用的核心战略专业。"},
    {"file": "hub-pharmacology.html", "old": "药学与合成药物化学", "new": "药学", "en": "PHARMACEUTICAL SCIENCES", "desc": "研究药物合成、靶向机制及制剂工程，保障人类健康并驱动创新药研发的医学核心专业。"},
    {"file": "hub-bioinformatics.html", "old": "生物信息与计算生物学", "new": "生物信息学", "en": "BIOINFORMATICS", "desc": "结合计算机科学与生命科学，用于基因组学数据分析与生命过程模拟的交叉理学专业。"},
    {"file": "hub-forensics.html", "old": "法医学与鉴识科学", "new": "法医学", "en": "FORENSIC MEDICINE", "desc": "应用医学与生物学技术解决司法勘查和法庭取证问题的特色医学专业。"},
    {"file": "hub-psychology.html", "old": "认知心理学与脑科学", "new": "应用心理学", "en": "APPLIED PSYCHOLOGY", "desc": "研究人类心理机制与行为模式，聚焦人机交互、临床咨询及神经认知的前沿学科。"},
    {"file": "hub-medicine.html", "old": "临床与前沿医疗", "new": "临床医学", "en": "CLINICAL MEDICINE", "desc": "直面人类疾病诊断与治疗体系开发，连接基础医学与临床前沿技术的巅峰医学专业。"},
]

def update_launchpad():
    lp_path = "assets/js/launchpad.js"
    with open(lp_path, "r", encoding="utf-8") as f:
        content = f.read()
    
    for item in mappings:
        # Also handle "天体物理与宇宙学" which might have been "理论天体物理与宇宙学" in some places.
        # But we replaced it manually if exact match.
        content = content.replace(f"name: '{item['old']}'", f"name: '{item['new']}'")
        # Just in case "天文学" was already replaced, we might not find it, but the old name is the target.
        # Let's also do a hard replace of "天体物理与宇宙学" without "理论"
        content = content.replace(f"name: '天体物理与宇宙学'", f"name: '天文学'")
        
    with open(lp_path, "w", encoding="utf-8") as f:
        f.write(content)
    print("Launchpad updated.")

def update_htmls():
    for item in mappings:
        filepath = item["file"]
        if not os.path.exists(filepath):
            print(f"File not found: {filepath}")
            continue
        
        with open(filepath, "r", encoding="utf-8") as f:
            html = f.read()
            
        soup = BeautifulSoup(html, "html.parser")
        
        # 1. Update <title>
        title_tag = soup.find("title")
        if title_tag and title_tag.string:
            title_text = title_tag.string
            title_tag.string = title_text.replace(item["old"], item["new"])
            title_tag.string = title_tag.string.replace("天体物理与宇宙学", "天文学")
            
        # 2. Update H1 and its spans
        h1 = soup.find("h1")
        if h1:
            for el in h1.descendants:
                if isinstance(el, str) and el.parent and el.parent.name not in ["style", "script"]:
                    # Using regex to replace to avoid losing surrounding characters
                    if item["old"] in el:
                        el.replace_with(el.replace(item["old"], item["new"]))
                    elif "天体物理与宇宙学" in el:
                        el.replace_with(el.replace("天体物理与宇宙学", "天文学"))

        # 3. Quick hard string replace for everything else
        html = str(soup)
        html = html.replace(item["old"], item["new"])
        html = html.replace("天体物理与宇宙学", "天文学")
        
        # 4. Replace paragraph desc
        # The early hub template usually has: <p class="text-gray-400 font-light text-lg ...">...</p>
        # Let's find exactly the paragraph following the H1 or within the hero section.
        # A robust way is to find the <p> that is long and contains text-gray-400
        soup2 = BeautifulSoup(html, "html.parser")
        h1_new = soup2.find("h1")
        if h1_new:
            # Look at its next siblings
            for sibling in h1_new.find_next_siblings("p"):
                if "text-gray-400" in sibling.get("class", []):
                    sibling.clear()
                    sibling.append(item["desc"])
                    break
            else:
                # If not found by sibling, search all paragraphs
                for p in soup2.find_all("p"):
                    classes = p.get("class", [])
                    if "text-gray-400" in classes and "text-lg" in classes:
                        p.clear()
                        p.append(item["desc"])
                        break

        with open(filepath, "w", encoding="utf-8") as f:
            f.write(str(soup2))
        print(f"Updated {filepath}")

if __name__ == "__main__":
    update_launchpad()
    update_htmls()
