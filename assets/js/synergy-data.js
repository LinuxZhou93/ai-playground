// synergy-data.js - V7.0 (The Big Bang: 10,000+ Node Procedural Universe)

// === 1. The 10-Stage Lifespan Seeds (Subject/Theme Roots) ===
console.time("BigBang");
const lifeStages = {
    // 1. Birth (0-2y) - Sensory Awakening
    '阶段1: 诞生': {
        '感官': ['光线', '声音', '触觉', '味觉', '嗅觉', '温暖', '痛觉', '饥饿'],
        '运动': ['抓握', '爬行', '吸吮', '踢腿', '翻身', '抬头'],
        '情绪': ['哭泣', '微笑', '恐惧', '安抚', '依恋']
    },
    // 2. Kindergarten (3-5y) - Imagination & Play
    '阶段2: 幼儿园': {
        '游戏': ['积木', '绘画', '奔跑', '分享', '扮演', '沙坑'],
        '语言': ['词汇', '儿歌', '故事', '名字', '提问', '为什么?'],
        '自然': ['昆虫', '树叶', '泥土', '雨水', '太阳', '月亮']
    },
    // 3. Elementary Low (6-8y) - Symbols & Rules
    '阶段3: 小学低段': {
        '数学': ['数字', '加法', '减法', '形状', '时钟', '货币'],
        '语文': ['拼音', '阅读', '写字', '拼写', '标点'],
        '社交': ['朋友', '学校', '老师', '规则', '公平'],
        '人文社科': ['节日', '家庭', '礼仪', '名胜', '寓言']
    },
    // 4. Elementary Mid (9-10y) - Logic & Causality
    '阶段4: 小学中段': {
        '科学': ['植物', '动物', '水循环', '磁铁', '重力'],
        '数学': ['乘法', '除法', '分数', '面积'],
        '历史': ['古代', '国王', '发明', '地图'],
        '人文社科': ['地理', '民俗', '文化标识', '法治启蒙']
    },
    // 5. Elementary High (11-12y) - Abstraction
    '阶段5: 小学高段': {
        '数学': ['小数', '百分比', '变量', '几何'],
        '科学': ['细胞', '原子', '能量', '生态系统'],
        '科技': ['编程', 'Scratch', '机器人', '互联网']
    },
    // 6. Middle School (13-15y) - Discipline
    '阶段6: 初中': {
        '物理': ['力', '运动', '电学', '光', '声'],
        '化学': ['元素', '反应', '酸', '碱'],
        '生物': ['遗传', '进化', '器官', '疾病'],
        '数学': ['代数', '函数', '勾股定理', '统计'],
        '人文社科': ['世界历史', '人文地理', '思想品德', '文学批评']
    },
    // 7. High School (16-18y) - Systems
    '阶段7: 高中': {
        '物理': ['力学', '电磁学', '热力学', '波'],
        '化学': ['有机', '键合', '化学计量', '动力学'],
        '生物': ['DNA', '代谢', '神经科学', '生态'],
        '数学': ['微积分', '向量', '概率', '矩阵'],
        '计算机': ['算法', '数据结构', 'AI基础', '网络'],
        '人文社科': ['哲学思辨', '政治经济', '艺术史论', '地缘格局']
    },
    // 8. University (19-22y) - Specialization
    '阶段8: 大学': {
        '专业': ['量子物理', '机器学习', '分子生物', '宏观经济'],
        '研究': ['论文', '实验室', '数据分析', '同行评审'],
        '职业': ['实习', '生涯', '伦理', '创新'],
        '人文社科': ['社会学', '心理学', '人类学', '法学理论']
    },
    // 9. Adulthood (23-60y) - Synthesis & Wisdom (Multi-dimensional)
    '阶段9: 成年': {
        '工作': ['战略', '领导力', '谈判', '效率'],
        '生活': ['家庭', '理财', '健康', '旅行', '爱好'],
        '智慧': ['哲学', '共情', '韧性', '导师', '传承']
    },
    // 10. Cognitive Decline (60y+) - The Fading (Simplification)
    '阶段10: 衰退': {
        '记忆': ['回溯', '名字', '地点', '事件...?', '面孔...?'],
        '处理': ['缓慢', '困惑', '简单', '休息'],
        '本质': ['爱', '和平', '光', '黑暗', '沉寂']
    },
};

// === 2. Procedural Generators ===

// Terminology Mixers for procedural names
const prefixes = {
    'Science': ['高阶', '理论', '应用', '实验', '量子', '生物-', '赛博-'],
    'Art': ['抽象', '新-', '后-', '数字', '古典', '现代'],
    'General': ['核心', '基础', '元-', '超-', '超级-', '深度']
};

const suffixes = [
    "理论", "分析", "系统", "动力学", "结构", "函数", "逻辑",
    "方法", "过程", "模式", "循环", "模型", "流", "网络"
];

const asteroidTypes = [
    "事实", "日期", "代码", "引用", "笔记", "图像", "数据", "公式", "定律"
];

// === 3. The "Big Bang" Engine ===
const synergyData = [];

function createNode(title, category, stage, level, parentId = null) {
    // Level 1: Star (Stage/Era)
    // Level 2: Planet (Subject/Domain)
    // Level 3: Satellite (Topic)
    // Level 4: Asteroid (Concept)
    // Level 5: Comet (Detail/Dust)

    let val = 1;
    if (level === 1) val = 40;     // Era Sun
    if (level === 2) val = 15;     // Subject Planet
    if (level === 3) val = 4;      // Topic Satellite
    if (level === 4) val = 1.2;    // Concept Asteroid
    if (level === 5) val = 0.5;    // Detail Dust

    const tags = [category, stage.split(':')[0].trim()];

    return {
        id: title + "_" + Math.random().toString(36).substr(2, 5), // Unique ID
        title: title,
        label: title.length > 20 ? title.substring(0, 18) + '..' : title, // Visual label
        group: category, // Color by category (Subject)
        category: category, // Essential for filtering & color mapping
        stage: stage,
        level: level,
        parentId: parentId,
        val: val,
        tags: tags,
        content: `节点: ${title}<br>阶段: ${stage}<br>层级: ${level}`
    };
}

// Execution
console.time("BigBang");

Object.keys(lifeStages).forEach(stage => {
    // Level 1: The Era (Center of this Stage)
    const eraName = stage;
    const eraNode = createNode(eraName, 'Time', stage, 1);
    synergyData.push(eraNode);

    const domains = lifeStages[stage];
    Object.keys(domains).forEach(domain => {
        // Level 2: The Domain (Planet)
        const domainName = domain;
        const planetNode = createNode(domainName, domain, stage, 2, eraNode.id);
        synergyData.push(planetNode);

        const topics = domains[domain];
        topics.forEach(topic => {
            // Level 3: The Topic (Satellite)
            const satNode = createNode(topic, domain, stage, 3, planetNode.id);
            synergyData.push(satNode);

            // === MASSIVE EXPANSION ===
            // Target: ~8,000 Nodes (User Request)
            // Level 4: Concepts (Asteroids) - Spawn 8-12 per topic
            const asteroidCount = Math.floor(Math.random() * 5) + 8;
            for (let i = 0; i < asteroidCount; i++) {
                const astName = `${topic} ${suffixes[Math.floor(Math.random() * suffixes.length)]}`;
                const astNode = createNode(astName, domain, stage, 4, satNode.id);
                synergyData.push(astNode);

                // Level 5: Details (Dust) - Spawn 3-5 per Asteroid
                const dustCount = Math.floor(Math.random() * 3) + 3;
                for (let j = 0; j < dustCount; j++) {
                    const dustName = `${astName} [${asteroidTypes[Math.floor(Math.random() * asteroidTypes.length)]}]`;
                    const dustNode = createNode(dustName, domain, stage, 5, astNode.id);
                    synergyData.push(dustNode);
                }
            }
        });
    });
});

console.timeEnd("BigBang");
console.log(`Universe Created. Total Nodes: ${synergyData.length}`);

// Export
window.synergyData = synergyData;
