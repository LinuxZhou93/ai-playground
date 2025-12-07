import Foundation

struct NavigationItem: Identifiable {
    let id = UUID()
    let title: String
    let icon: String
    let page: String
    let color: String
}

let navigationItems = [
    NavigationItem(title: "教育日志", icon: "📝", page: "blog.html", color: "#FFFFFF"),
    NavigationItem(title: "培养图谱", icon: "🗺️", page: "post-4.html", color: "#FFFFFF"),
    NavigationItem(title: "课程地图", icon: "🧭", page: "post-6.html", color: "#FFFFFF"),
    NavigationItem(title: "竞赛地图", icon: "🏆", page: "competition-atlas.html", color: "#fbbf24"),
    NavigationItem(title: "认知系统", icon: "🧠", page: "post-5.html", color: "#FFFFFF"),
    NavigationItem(title: "学科协同", icon: "🧬", page: "subject-synergy.html", color: "#FFFFFF"),
    NavigationItem(title: "玩中学习", icon: "🎮", page: "games.html", color: "#00ff00"),
    NavigationItem(title: "知识库", icon: "📖", page: "wiki.html", color: "#FFFFFF"),
    NavigationItem(title: "读书观影", icon: "📚", page: "library.html", color: "#ec4899"),
    NavigationItem(title: "论坛", icon: "💬", page: "forum.html", color: "#06b6d4"),
    NavigationItem(title: "编程", icon: "🎨", page: "coding.html", color: "#FFAB19"),
    NavigationItem(title: "无人机", icon: "🚁", page: "drone.html", color: "#0ea5e9"),
    NavigationItem(title: "实验", icon: "⚗️", page: "labs.html", color: "#00f3ff"),
    NavigationItem(title: "3D打印", icon: "🖨️", page: "3d-print.html", color: "#FF2D55"),
    NavigationItem(title: "学习", icon: "🚀", page: "learn.html", color: "#8B5CF6"),
    NavigationItem(title: "电子电路", icon: "🔌", page: "circuits.html", color: "#00FF9D"),
    NavigationItem(title: "人工智能", icon: "🧠", page: "ai.html", color: "#d946ef")
]
