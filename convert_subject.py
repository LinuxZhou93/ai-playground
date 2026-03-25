import sys
import re

if len(sys.argv) < 4:
    print("Usage: python convert_subject.py <input> <output> <subject> [subject_en]")
    sys.exit(1)

input_file = sys.argv[1]
output_file = sys.argv[2]
subject = sys.argv[3]
subject_en = sys.argv[4] if len(sys.argv) > 4 else "MUSIC"

with open(input_file, 'r', encoding='utf-8') as f:
    content = f.read()

# Common tech terms used in the system
replacements = {
    "科技": subject,
    "TECH": subject_en.upper(),
    "Tech": subject_en.capitalize(),
    "创客": "乐手" if subject == "音乐" else "学子",
    "编程": "作曲" if subject == "音乐" else "基础",
    "AI Intro": "乐理入门" if subject == "音乐" else f"{subject}入门",
    "AI Agent": "数字音乐" if subject == "音乐" else f"{subject}前沿",
    "AI": "声乐" if subject == "音乐" else f"{subject}专项",
    "代码": "乐谱" if subject == "音乐" else "笔记",
    "Python": "钢琴" if subject == "音乐" else "进阶" ,
    "机器人": "合唱" if subject == "音乐" else "协作",
    "火箭": "交响乐" if subject == "音乐" else "高级项目",
    "太空": "舞台" if subject == "音乐" else "前沿探索",
    "物理": "和声" if subject == "音乐" else "专业理论",
    "工程": "编曲" if subject == "音乐" else "实践",
    "科学家": "音乐家" if subject == "音乐" else "专家",
    "竞赛": "考级/比赛", # competition
    "黑客马拉松": "音乐节" if subject == "音乐" else "技能大赛",
    "算法": "视唱" if subject == "音乐" else "解析",
    "硬件": "乐器" if subject == "音乐" else "实体设备",
    "模型": "曲目" if subject == "音乐" else "范式",
    "全景图": "图谱",
    "💻": "🎹" if subject == "音乐" else "📚",
    "🚀": "🎻" if subject == "音乐" else "🏆",
    "🤖": "🎵" if subject == "音乐" else "💡",
    "🧞": "🎶" if subject == "音乐" else "🔍",
    "🕵️": "🎷" if subject == "音乐" else "🔬",
    "fa-microchip": "fa-music" if subject == "音乐" else "fa-book",
    "fa-rocket": "fa-guitar" if subject == "音乐" else "fa-star",
    "fa-robot": "fa-drum" if subject == "音乐" else "fa-lightbulb",
    "fa-code": "fa-headphones" if subject == "音乐" else "fa-pen"
}

# Apply replacements
for old_term, new_term in replacements.items():
    content = content.replace(old_term, new_term)

# Special overrides to fix AI replacement artifacts
if subject == "音乐":
    content = content.replace("FUTURE 声乐", "FUTURE MUSIC")
    content = content.replace("声乐辅助", "AI智能助教")
    content = content.replace("ai.html", "course-music.html")
    content = content.replace("course-火箭.html", "course-music.html")

with open(output_file, 'w', encoding='utf-8') as f:
    f.write(content)

print(f"Successfully generated {output_file} for {subject}")
